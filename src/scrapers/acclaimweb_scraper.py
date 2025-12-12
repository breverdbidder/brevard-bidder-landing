"""
BidDeed.AI V14.6.1 - AcclaimWeb Lien Search Scraper
========================================================
Enhanced with Browserless retry logic and fallback strategies.

Primary: Browserless.io (cloud browser automation)
Fallback: Modal.com + Playwright (if Browserless fails)

Features:
- Exponential backoff retry (3 attempts)
- Browserless.io integration (BROWSERLESS_API_KEY)
- Session/cookie handling
- Anti-bot detection avoidance
- Structured data extraction

Author: Ariel Shapira, Solo Founder - Everest Capital USA
"""

import os
import json
import re
import time
import asyncio
import httpx
from datetime import datetime
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, asdict
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AcclaimWebScraper")

# ============================================================================
# DATA CLASSES
# ============================================================================

@dataclass
class LienRecord:
    """Structured lien record from AcclaimWeb"""
    document_number: str
    document_type: str  # MTG, SMTG, AMTG, LIEN, etc.
    recording_date: str
    book_page: str
    grantor: str        # Property owner (borrower)
    grantee: str        # Lender/lienholder
    amount: Optional[float] = None
    legal_description: Optional[str] = None
    consideration: Optional[float] = None
    
    def is_mortgage(self) -> bool:
        return self.document_type in ["MTG", "AMTG"]
    
    def is_satisfaction(self) -> bool:
        return self.document_type == "SMTG"


@dataclass
class LienSearchResult:
    """Complete search result with analysis"""
    search_party: str
    search_role: str  # GRANTOR or GRANTEE
    search_timestamp: str
    records_found: int
    mortgages: List[LienRecord]
    satisfactions: List[LienRecord]
    other_liens: List[LienRecord]
    active_mortgages: List[LienRecord]  # MTG without matching SMTG
    total_active_mortgage_amount: float
    success: bool
    error: Optional[str] = None
    execution_method: str = "browserless"  # browserless or modal
    retry_count: int = 0


# ============================================================================
# BROWSERLESS INTEGRATION
# ============================================================================

class BrowserlessClient:
    """
    Browserless.io client for cloud browser automation.
    
    Requires BROWSERLESS_API_KEY environment variable or GitHub secret.
    Endpoint: wss://chrome.browserless.io or https://chrome.browserless.io
    """
    
    BASE_URL = "https://chrome.browserless.io"
    CONNECT_URL = "wss://chrome.browserless.io"
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("BROWSERLESS_API_KEY")
        if not self.api_key:
            raise ValueError("BROWSERLESS_API_KEY not found in environment")
    
    async def execute_script(self, script: str, timeout: int = 60000) -> Dict:
        """
        Execute a Puppeteer/Playwright script via Browserless function API.
        
        Args:
            script: JavaScript code to execute
            timeout: Timeout in milliseconds
            
        Returns:
            Script execution result
        """
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{self.BASE_URL}/function?token={self.api_key}",
                json={
                    "code": script,
                    "context": {},
                },
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            return response.json()
    
    async def scrape_content(self, url: str, wait_selector: str = None) -> str:
        """
        Scrape page content using Browserless content API.
        
        Args:
            url: URL to scrape
            wait_selector: CSS selector to wait for before scraping
            
        Returns:
            Page HTML content
        """
        payload = {
            "url": url,
            "waitForSelector": {"selector": wait_selector} if wait_selector else None,
            "gotoOptions": {"waitUntil": "networkidle2"},
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.BASE_URL}/content?token={self.api_key}",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            return response.text


# ============================================================================
# RETRY LOGIC WITH EXPONENTIAL BACKOFF
# ============================================================================

async def retry_with_backoff(
    func,
    max_retries: int = 3,
    base_delay: float = 2.0,
    max_delay: float = 30.0,
    exceptions: Tuple = (Exception,),
):
    """
    Execute async function with exponential backoff retry.
    
    Args:
        func: Async function to execute
        max_retries: Maximum number of retry attempts
        base_delay: Initial delay in seconds
        max_delay: Maximum delay cap in seconds
        exceptions: Tuple of exceptions to catch and retry
        
    Returns:
        Function result
        
    Raises:
        Last exception if all retries fail
    """
    last_exception = None
    
    for attempt in range(max_retries):
        try:
            return await func()
        except exceptions as e:
            last_exception = e
            if attempt < max_retries - 1:
                delay = min(base_delay * (2 ** attempt), max_delay)
                logger.warning(
                    f"Attempt {attempt + 1}/{max_retries} failed: {e}. "
                    f"Retrying in {delay:.1f}s..."
                )
                await asyncio.sleep(delay)
            else:
                logger.error(f"All {max_retries} attempts failed. Last error: {e}")
    
    raise last_exception


# ============================================================================
# ACCLAIMWEB SCRAPER WITH BROWSERLESS
# ============================================================================

ACCLAIMWEB_SEARCH_SCRIPT = '''
module.exports = async ({ page, context }) => {
  const { partyName, role, docTypes, dateFrom, dateTo } = context;
  
  try {
    // Navigate to AcclaimWeb
    await page.goto('https://vaclmweb1.brevardclerk.us/AcclaimWeb/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Accept terms if present
    try {
      const acceptBtn = await page.$("input[value='I Accept']");
      if (acceptBtn) {
        await acceptBtn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
      }
    } catch (e) {
      // Terms already accepted or not present
    }
    
    // Select Party Name search
    await page.select('select#SearchType', 'Party Name');
    await page.waitForTimeout(1000);
    
    // Enter search criteria
    if (role === 'GRANTEE') {
      await page.type('input#GteeName', partyName);
    } else {
      await page.type('input#GtorName', partyName);
    }
    
    // Set date range if provided
    if (dateFrom) {
      await page.type('input#FromDate', dateFrom);
    }
    if (dateTo) {
      await page.type('input#ToDate', dateTo);
    }
    
    // Execute search
    await page.click("input[value='Search']");
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    // Check for no results
    const noResults = await page.$('text=No records found');
    if (noResults) {
      return { success: true, records: [], message: 'No records found' };
    }
    
    // Extract results
    const records = await page.$$eval('table#SearchResults tr', (rows, docTypes) => {
      const results = [];
      for (let i = 1; i < rows.length; i++) {  // Skip header
        const cols = rows[i].querySelectorAll('td');
        if (cols.length < 6) continue;
        
        const docType = cols[1].innerText.trim();
        if (!docTypes.includes(docType)) continue;
        
        results.push({
          document_number: cols[0].innerText.trim(),
          document_type: docType,
          recording_date: cols[2].innerText.trim(),
          book_page: cols[3].innerText.trim(),
          grantor: cols[4].innerText.trim(),
          grantee: cols[5].innerText.trim(),
          amount: cols.length > 6 ? cols[6].innerText.trim() : null,
        });
      }
      return results;
    }, docTypes);
    
    return { success: true, records };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
};
'''


async def search_acclaimweb_browserless(
    party_name: str,
    role: str = "GRANTEE",
    doc_types: List[str] = None,
    date_from: str = None,
    date_to: str = None,
    api_key: str = None,
) -> LienSearchResult:
    """
    Search AcclaimWeb using Browserless.io with retry logic.
    
    Args:
        party_name: Last name of party to search
        role: GRANTOR or GRANTEE
        doc_types: Document types to filter
        date_from: Start date MM/DD/YYYY
        date_to: End date MM/DD/YYYY
        api_key: Browserless API key (optional, uses env var)
        
    Returns:
        LienSearchResult with search results
    """
    if doc_types is None:
        doc_types = ["MTG", "SMTG", "AMTG"]
    
    result = LienSearchResult(
        search_party=party_name,
        search_role=role,
        search_timestamp=datetime.utcnow().isoformat(),
        records_found=0,
        mortgages=[],
        satisfactions=[],
        other_liens=[],
        active_mortgages=[],
        total_active_mortgage_amount=0.0,
        success=False,
        execution_method="browserless",
    )
    
    try:
        client = BrowserlessClient(api_key)
    except ValueError as e:
        result.error = str(e)
        return result
    
    retry_count = 0
    
    async def execute_search():
        nonlocal retry_count
        retry_count += 1
        
        # Use Browserless function API
        async with httpx.AsyncClient(timeout=120.0) as http_client:
            response = await http_client.post(
                f"{client.BASE_URL}/function?token={client.api_key}",
                json={
                    "code": ACCLAIMWEB_SEARCH_SCRIPT,
                    "context": {
                        "partyName": party_name,
                        "role": role,
                        "docTypes": doc_types,
                        "dateFrom": date_from,
                        "dateTo": date_to,
                    },
                },
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            return response.json()
    
    try:
        search_result = await retry_with_backoff(
            execute_search,
            max_retries=3,
            base_delay=2.0,
            exceptions=(httpx.HTTPError, httpx.TimeoutException, Exception)
        )
        
        result.retry_count = retry_count
        
        if not search_result.get("success"):
            result.error = search_result.get("error", "Unknown error")
            return result
        
        # Parse records
        records = search_result.get("records", [])
        
        for rec in records:
            lien = LienRecord(
                document_number=rec["document_number"],
                document_type=rec["document_type"],
                recording_date=rec["recording_date"],
                book_page=rec["book_page"],
                grantor=rec["grantor"],
                grantee=rec["grantee"],
                amount=_parse_amount(rec.get("amount")),
            )
            
            if lien.is_mortgage():
                result.mortgages.append(lien)
            elif lien.is_satisfaction():
                result.satisfactions.append(lien)
            else:
                result.other_liens.append(lien)
        
        # Determine active mortgages
        satisfied_refs = {s.book_page for s in result.satisfactions if s.book_page}
        
        for mtg in result.mortgages:
            is_satisfied = mtg.book_page in satisfied_refs
            
            # Also check grantor/grantee swap
            if not is_satisfied:
                for sat in result.satisfactions:
                    if (mtg.grantee.upper() in sat.grantor.upper() or
                        sat.grantor.upper() in mtg.grantee.upper()):
                        is_satisfied = True
                        break
            
            if not is_satisfied:
                result.active_mortgages.append(mtg)
                if mtg.amount:
                    result.total_active_mortgage_amount += mtg.amount
        
        result.records_found = len(records)
        result.success = True
        
        logger.info(
            f"[AcclaimWeb] Found {result.records_found} records, "
            f"{len(result.active_mortgages)} active mortgages "
            f"totaling ${result.total_active_mortgage_amount:,.0f}"
        )
        
    except Exception as e:
        result.error = f"All retries failed: {str(e)}"
        result.retry_count = retry_count
        logger.error(f"[AcclaimWeb] Error: {e}")
    
    return result


# ============================================================================
# FALLBACK TO MODAL (ORIGINAL IMPLEMENTATION)
# ============================================================================

async def search_acclaimweb_with_fallback(
    party_name: str,
    role: str = "GRANTEE",
    doc_types: List[str] = None,
    date_from: str = None,
    date_to: str = None,
) -> LienSearchResult:
    """
    Search AcclaimWeb with Browserless primary and Modal fallback.
    
    Tries Browserless first (3 retries), falls back to Modal if:
    - BROWSERLESS_API_KEY not set
    - All Browserless retries fail
    """
    # Check for Browserless API key
    browserless_key = os.getenv("BROWSERLESS_API_KEY")
    
    if browserless_key:
        logger.info("[AcclaimWeb] Attempting Browserless search...")
        result = await search_acclaimweb_browserless(
            party_name=party_name,
            role=role,
            doc_types=doc_types,
            date_from=date_from,
            date_to=date_to,
            api_key=browserless_key,
        )
        
        if result.success:
            return result
        
        logger.warning(f"[AcclaimWeb] Browserless failed: {result.error}. Trying Modal...")
    else:
        logger.info("[AcclaimWeb] No BROWSERLESS_API_KEY, using Modal directly")
    
    # Fallback to Modal
    try:
        # Import Modal functions (lazy import to avoid dependency if not needed)
        from acclaimweb_scraper import search_acclaimweb_by_party
        
        modal_result = search_acclaimweb_by_party.remote(
            party_name=party_name,
            role=role,
            doc_types=doc_types or ["MTG", "SMTG", "AMTG"],
            date_from=date_from,
            date_to=date_to,
        )
        
        # Convert Modal result to our dataclass
        return LienSearchResult(
            search_party=modal_result["search_party"],
            search_role=modal_result["search_role"],
            search_timestamp=modal_result["search_timestamp"],
            records_found=modal_result["records_found"],
            mortgages=[LienRecord(**m) for m in modal_result.get("mortgages", [])],
            satisfactions=[LienRecord(**s) for s in modal_result.get("satisfactions", [])],
            other_liens=[LienRecord(**o) for o in modal_result.get("other_liens", [])],
            active_mortgages=[LienRecord(**a) for a in modal_result.get("active_mortgages", [])],
            total_active_mortgage_amount=modal_result.get("total_active_mortgage_amount", 0),
            success=modal_result.get("success", False),
            error=modal_result.get("error"),
            execution_method="modal",
        )
        
    except Exception as e:
        logger.error(f"[AcclaimWeb] Modal fallback also failed: {e}")
        return LienSearchResult(
            search_party=party_name,
            search_role=role,
            search_timestamp=datetime.utcnow().isoformat(),
            records_found=0,
            mortgages=[],
            satisfactions=[],
            other_liens=[],
            active_mortgages=[],
            total_active_mortgage_amount=0.0,
            success=False,
            error=f"Both Browserless and Modal failed: {str(e)}",
            execution_method="none",
        )


# ============================================================================
# BATCH SEARCH WITH RETRY
# ============================================================================

async def batch_search_defendants(
    defendants: List[Dict],
    include_mortgages: bool = True,
    parallel: bool = True,
    max_concurrent: int = 3,
) -> List[Dict]:
    """
    Batch search multiple defendants for lien analysis with retry logic.
    
    Args:
        defendants: List of dicts with 'case_number', 'defendant_name', 'plaintiff'
        include_mortgages: Whether to search for mortgages
        parallel: Whether to run searches in parallel
        max_concurrent: Max concurrent searches if parallel
        
    Returns:
        List of search results with lien analysis
    """
    results = []
    
    async def search_single(defendant: Dict) -> Dict:
        # Extract last name
        name = defendant.get("defendant_name", "")
        last_name = name.split()[-1] if " " in name else name
        
        # Search with fallback
        search_result = await search_acclaimweb_with_fallback(
            party_name=last_name,
            role="GRANTEE",
            doc_types=["MTG", "SMTG", "AMTG"] if include_mortgages else None,
        )
        
        # Analyze for HOA foreclosure
        plaintiff = defendant.get("plaintiff", "").upper()
        is_hoa = _detect_hoa(plaintiff)
        
        # Build analysis
        analysis = {
            "case_number": defendant.get("case_number"),
            "defendant": name,
            "plaintiff": defendant.get("plaintiff"),
            "is_hoa_foreclosure": is_hoa,
            "search_result": asdict(search_result),
            "active_mortgages": [asdict(m) for m in search_result.active_mortgages],
            "total_senior_liens": search_result.total_active_mortgage_amount if is_hoa else 0,
            "execution_method": search_result.execution_method,
            "retry_count": search_result.retry_count,
            "recommendation": "NEEDS_ANALYSIS",
        }
        
        # Generate recommendation
        if is_hoa and search_result.total_active_mortgage_amount > 0:
            analysis["recommendation"] = "DO_NOT_BID"
            analysis["reason"] = f"HOA foreclosure - ${search_result.total_active_mortgage_amount:,.0f} mortgage survives"
        elif not search_result.success:
            analysis["recommendation"] = "MANUAL_REVIEW"
            analysis["reason"] = f"Search error: {search_result.error}"
        else:
            analysis["recommendation"] = "CONTINUE"
            analysis["reason"] = "No surviving senior liens detected"
        
        return analysis
    
    if parallel:
        # Run in parallel with semaphore
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def bounded_search(defendant):
            async with semaphore:
                return await search_single(defendant)
        
        tasks = [bounded_search(d) for d in defendants]
        results = await asyncio.gather(*tasks)
    else:
        # Sequential with delay
        for idx, defendant in enumerate(defendants):
            logger.info(f"[Batch] Processing {idx+1}/{len(defendants)}: {defendant.get('defendant_name')}")
            result = await search_single(defendant)
            results.append(result)
            if idx < len(defendants) - 1:
                await asyncio.sleep(3)
    
    return results


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def _parse_amount(amount_str: str) -> Optional[float]:
    """Parse dollar amount from string"""
    if not amount_str:
        return None
    cleaned = re.sub(r'[^\d.]', '', amount_str)
    try:
        return float(cleaned) if cleaned else None
    except ValueError:
        return None


def _detect_hoa(plaintiff: str) -> bool:
    """Detect if foreclosure is by HOA/COA"""
    HOA_KEYWORDS = [
        "HOA", "HOMEOWNERS", "HOME OWNERS",
        "ASSOCIATION", "ASSOC", "ASSN",
        "CONDOMINIUM", "CONDO", "COA",
        "PROPERTY OWNERS", "POA",
        "COMMUNITY", "COMMUNITIES",
        "ESTATES", "VILLAS", "LANDINGS",
        "PRESERVE", "RESERVE", "CLUB"
    ]
    
    BANK_KEYWORDS = [
        "BANK", "MORTGAGE", "LENDING", "CREDIT UNION",
        "LOAN", "FANNIE", "FREDDIE", "WELLS FARGO",
        "JPMORGAN", "CHASE", "NATIONSTAR", "SERVICING"
    ]
    
    plaintiff_upper = plaintiff.upper()
    
    for keyword in BANK_KEYWORDS:
        if keyword in plaintiff_upper:
            return False
    
    for keyword in HOA_KEYWORDS:
        if keyword in plaintiff_upper:
            return True
    
    return False


# ============================================================================
# CLI / TESTING
# ============================================================================

async def main():
    """Test the enhanced AcclaimWeb scraper"""
    import sys
    
    party_name = sys.argv[1] if len(sys.argv) > 1 else "SMITH"
    role = sys.argv[2] if len(sys.argv) > 2 else "GRANTEE"
    
    print(f"\n{'='*60}")
    print(f"AcclaimWeb Lien Search - BidDeed.AI V14.6.1")
    print(f"{'='*60}")
    print(f"Searching for: {party_name} as {role}")
    print(f"Browserless API: {'✅ Set' if os.getenv('BROWSERLESS_API_KEY') else '❌ Not set'}")
    
    result = await search_acclaimweb_with_fallback(
        party_name=party_name,
        role=role,
    )
    
    print(f"\n{'='*60}")
    print("RESULTS:")
    print(f"{'='*60}")
    print(f"Success: {result.success}")
    print(f"Execution Method: {result.execution_method}")
    print(f"Retry Count: {result.retry_count}")
    print(f"Records Found: {result.records_found}")
    print(f"Active Mortgages: {len(result.active_mortgages)}")
    print(f"Total Active Amount: ${result.total_active_mortgage_amount:,.2f}")
    if result.error:
        print(f"Error: {result.error}")


if __name__ == "__main__":
    asyncio.run(main())
