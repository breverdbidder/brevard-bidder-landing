"""
BidDeed.AI V14 - AI-Powered BECA Document Automation
=========================================================
Solves: Manual BECA scraping that breaks frequently

Integrates:
- Apify AI Web Agent (natural language web automation)
- Firecrawl (existing - stealth proxy scraping)
- pdfplumber (PDF text extraction)

Strategy:
1. AI Web Agent navigates BECA site with natural language
2. Downloads case documents automatically
3. Extracts lien data using regex patterns from V13.4.0 BECA Scraper

Credit: Ariel Shapira, Solo Founder - Everest Capital USA
"""

import asyncio
import httpx
import re
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field
from datetime import datetime
import os
import base64

APIFY_TOKEN = os.getenv("APIFY_TOKEN", "")
APIFY_WEB_AGENT = "apify/ai-web-agent"
FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY", "")

# BECA regex patterns from V13.4.0
BECA_PATTERNS = {
    "case_number": r"(?:Case\s*(?:No\.|Number|#)?:?\s*)(\d{2}-\d{4,6}-CA-\d{2}|\d{4}-CA-\d{6})",
    "plaintiff": r"(?:Plaintiff|Petitioner)[:\s]+([A-Z][A-Za-z\s,\.&]+?)(?:vs?\.|v\.|versus)",
    "defendant": r"(?:vs?\.|v\.|versus)\s+([A-Z][A-Za-z\s,\.&]+?)(?:Defendant|$|\n)",
    "judgment_amount": r"(?:Final\s+)?Judgment\s*(?:Amount)?[:\s]*\$?([\d,]+\.?\d*)",
    "sale_date": r"(?:Sale\s+Date|Auction\s+Date)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})",
    "property_address": r"(?:Property\s+)?Address[:\s]+(.+?)(?:,\s*(?:FL|Florida)|$|\n)",
    "lien_holder": r"(?:Lien\s*Holder|Lienholder|Mortgagee)[:\s]+([A-Z][A-Za-z\s,\.&]+)",
    "recording_info": r"(?:OR\s*Book|Official\s*Records)[:\s]*(\d+)[,\s]+(?:Page|Pg\.?)[:\s]*(\d+)",
    "mortgage_amount": r"(?:Original\s+)?(?:Mortgage|Loan)\s+Amount[:\s]*\$?([\d,]+\.?\d*)",
    "hoa_assessment": r"(?:HOA|Association)\s+(?:Assessment|Lien)[:\s]*\$?([\d,]+\.?\d*)",
    "tax_certificate": r"(?:Tax\s+Certificate|Tax\s+Deed)[:\s]*(?:No\.?\s*)?(\d+)",
    "parcel_id": r"(?:Parcel\s*(?:ID|Number)|Account)[:\s]*(\d{2}-\d{2}-\d{2}-\d{2}-\d{5}(?:\.\d+)?)"
}


@dataclass
class BECADocument:
    """Extracted BECA case document data"""
    case_number: str
    plaintiff: Optional[str] = None
    defendant: Optional[str] = None
    judgment_amount: Optional[float] = None
    sale_date: Optional[str] = None
    property_address: Optional[str] = None
    lien_holder: Optional[str] = None
    mortgage_amount: Optional[float] = None
    hoa_assessment: Optional[float] = None
    parcel_id: Optional[str] = None
    raw_text: str = ""
    source_url: Optional[str] = None
    extracted_at: str = field(default_factory=lambda: datetime.now().isoformat())


class BECAAutomationService:
    """
    AI-powered BECA document retrieval and extraction
    
    Usage:
        service = BECAAutomationService()
        doc = await service.get_case_document("05-2024-CA-012345")
    """
    
    def __init__(self):
        self.apify_token = APIFY_TOKEN
        self.firecrawl_key = FIRECRAWL_API_KEY
        self.client = httpx.AsyncClient(timeout=120.0)
        self.beca_base = "https://vweb1.brevardclerk.us/beca"
    
    async def search_case_ai_agent(self, case_number: str) -> Optional[str]:
        """
        Use AI Web Agent to navigate BECA and find case documents
        
        The agent understands natural language instructions and can:
        - Navigate multi-step forms
        - Handle CAPTCHAs (with human-in-the-loop if needed)
        - Extract content from dynamic pages
        """
        if not self.apify_token:
            return None
        
        url = f"https://api.apify.com/v2/acts/{APIFY_WEB_AGENT}/runs"
        
        # Natural language instructions for the AI agent
        instructions = f"""
        Navigate to the Brevard County Clerk BECA foreclosure system.
        
        1. Go to https://vweb1.brevardclerk.us/beca
        2. Search for case number: {case_number}
        3. Click on the case to view details
        4. Find and download the Final Judgment document or Summary
        5. Extract all text content from the case page
        
        Return the full text content of the case page and any document links found.
        """
        
        payload = {
            "instructions": instructions,
            "startUrls": [self.beca_base],
            "maxPagesPerRun": 5,
            "proxyConfiguration": {
                "useApifyProxy": True,
                "apifyProxyGroups": ["RESIDENTIAL"]
            }
        }
        
        headers = {
            "Authorization": f"Bearer {self.apify_token}",
            "Content-Type": "application/json"
        }
        
        try:
            # Start agent run
            resp = await self.client.post(url, json=payload, headers=headers)
            if resp.status_code != 201:
                print(f"AI Agent start failed: {resp.status_code}")
                return None
            
            run_data = resp.json()
            run_id = run_data.get("data", {}).get("id")
            
            # Wait for completion (max 3 minutes for AI agent)
            for _ in range(36):
                await asyncio.sleep(5)
                status_resp = await self.client.get(
                    f"https://api.apify.com/v2/actor-runs/{run_id}",
                    headers=headers
                )
                status = status_resp.json().get("data", {}).get("status")
                if status == "SUCCEEDED":
                    break
                elif status in ["FAILED", "ABORTED"]:
                    print(f"AI Agent failed: {status}")
                    return None
            
            # Get results
            dataset_id = run_data.get("data", {}).get("defaultDatasetId")
            results_resp = await self.client.get(
                f"https://api.apify.com/v2/datasets/{dataset_id}/items",
                headers=headers
            )
            
            results = results_resp.json()
            
            # Combine all extracted text
            full_text = ""
            for item in results:
                if "text" in item:
                    full_text += item["text"] + "\n"
                elif "content" in item:
                    full_text += item["content"] + "\n"
            
            return full_text if full_text else None
            
        except Exception as e:
            print(f"AI Agent error: {e}")
            return None
    
    async def scrape_with_firecrawl(self, case_number: str) -> Optional[str]:
        """
        Fallback: Use Firecrawl stealth proxy for direct scraping
        """
        if not self.firecrawl_key:
            return None
        
        url = "https://api.firecrawl.dev/v0/scrape"
        
        # Construct BECA search URL
        search_url = f"{self.beca_base}/search.cfm?case={case_number}"
        
        payload = {
            "url": search_url,
            "pageOptions": {
                "onlyMainContent": False,
                "waitFor": 3000
            }
        }
        
        headers = {
            "Authorization": f"Bearer {self.firecrawl_key}",
            "Content-Type": "application/json"
        }
        
        try:
            resp = await self.client.post(url, json=payload, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                return data.get("data", {}).get("markdown", "")
        except Exception as e:
            print(f"Firecrawl error: {e}")
        
        return None
    
    def extract_document_data(self, raw_text: str, case_number: str) -> BECADocument:
        """
        Extract structured data from raw BECA text using regex patterns
        """
        doc = BECADocument(case_number=case_number, raw_text=raw_text)
        
        for field_name, pattern in BECA_PATTERNS.items():
            match = re.search(pattern, raw_text, re.IGNORECASE | re.MULTILINE)
            if match:
                value = match.group(1).strip()
                
                # Convert amounts to float
                if field_name in ["judgment_amount", "mortgage_amount", "hoa_assessment"]:
                    try:
                        value = float(value.replace(",", ""))
                    except ValueError:
                        value = None
                
                # Map to dataclass fields
                field_mapping = {
                    "case_number": "case_number",
                    "plaintiff": "plaintiff",
                    "defendant": "defendant",
                    "judgment_amount": "judgment_amount",
                    "sale_date": "sale_date",
                    "property_address": "property_address",
                    "lien_holder": "lien_holder",
                    "mortgage_amount": "mortgage_amount",
                    "hoa_assessment": "hoa_assessment",
                    "parcel_id": "parcel_id"
                }
                
                if field_name in field_mapping:
                    setattr(doc, field_mapping[field_name], value)
        
        return doc
    
    async def get_case_document(self, case_number: str) -> BECADocument:
        """
        Main method: Get case document using AI agent with Firecrawl fallback
        """
        # Try AI Agent first (more reliable for complex navigation)
        raw_text = await self.search_case_ai_agent(case_number)
        
        # Fallback to Firecrawl
        if not raw_text:
            print(f"AI Agent failed for {case_number}, trying Firecrawl...")
            raw_text = await self.scrape_with_firecrawl(case_number)
        
        if not raw_text:
            return BECADocument(
                case_number=case_number,
                raw_text="EXTRACTION_FAILED"
            )
        
        # Extract structured data
        return self.extract_document_data(raw_text, case_number)
    
    async def batch_process_cases(
        self,
        case_numbers: List[str],
        concurrent_limit: int = 3
    ) -> List[BECADocument]:
        """
        Process multiple cases with rate limiting
        """
        results = []
        semaphore = asyncio.Semaphore(concurrent_limit)
        
        async def process_one(case_num):
            async with semaphore:
                doc = await self.get_case_document(case_num)
                await asyncio.sleep(2)  # Rate limit
                return doc
        
        tasks = [process_one(cn) for cn in case_numbers]
        results = await asyncio.gather(*tasks)
        
        return results
    
    async def close(self):
        await self.client.aclose()


# Integration with BidDeed.AI Pipeline
async def enrich_auction_with_beca(
    properties: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Add BECA document data to auction properties
    
    Input: List with 'case_number' field
    Output: Same list with added 'beca_data' field
    """
    service = BECAAutomationService()
    
    try:
        case_numbers = [p.get("case_number") for p in properties if p.get("case_number")]
        
        if not case_numbers:
            return properties
        
        docs = await service.batch_process_cases(case_numbers)
        
        # Map by case number
        doc_map = {doc.case_number: doc for doc in docs}
        
        for prop in properties:
            case_num = prop.get("case_number")
            if case_num and case_num in doc_map:
                doc = doc_map[case_num]
                prop["beca_data"] = {
                    "plaintiff": doc.plaintiff,
                    "defendant": doc.defendant,
                    "judgment_amount": doc.judgment_amount,
                    "sale_date": doc.sale_date,
                    "lien_holder": doc.lien_holder,
                    "mortgage_amount": doc.mortgage_amount,
                    "hoa_assessment": doc.hoa_assessment,
                    "extraction_success": doc.raw_text != "EXTRACTION_FAILED"
                }
        
        return properties
    
    finally:
        await service.close()


# Lien Priority Analysis Helper
def analyze_lien_priority(beca_doc: BECADocument) -> Dict[str, Any]:
    """
    Determine lien priority and foreclosure type from BECA data
    
    Critical for:
    - HOA foreclosures (senior mortgages survive!)
    - Tax deed vs mortgage foreclosure
    - Municipal liens
    """
    analysis = {
        "foreclosure_type": "UNKNOWN",
        "senior_liens_survive": False,
        "estimated_wipeout": [],
        "risk_level": "MEDIUM"
    }
    
    plaintiff_lower = (beca_doc.plaintiff or "").lower()
    lien_holder_lower = (beca_doc.lien_holder or "").lower()
    
    # Determine foreclosure type
    if any(kw in plaintiff_lower for kw in ["hoa", "association", "homeowners"]):
        analysis["foreclosure_type"] = "HOA"
        analysis["senior_liens_survive"] = True
        analysis["risk_level"] = "HIGH"
        analysis["estimated_wipeout"] = ["HOA liens only"]
        
    elif any(kw in plaintiff_lower for kw in ["bank", "mortgage", "loan", "trust", "wells", "chase", "bof"]):
        analysis["foreclosure_type"] = "MORTGAGE"
        analysis["senior_liens_survive"] = False
        analysis["risk_level"] = "LOW"
        analysis["estimated_wipeout"] = ["Junior mortgages", "HOA liens", "Most judgment liens"]
        
    elif any(kw in plaintiff_lower for kw in ["tax", "county", "brevard"]):
        analysis["foreclosure_type"] = "TAX"
        analysis["senior_liens_survive"] = False
        analysis["risk_level"] = "LOW"
        analysis["estimated_wipeout"] = ["All liens except federal tax"]
    
    # Check for HOA assessment (even in mortgage foreclosure, need to account for)
    if beca_doc.hoa_assessment and beca_doc.hoa_assessment > 0:
        analysis["hoa_outstanding"] = beca_doc.hoa_assessment
    
    return analysis


if __name__ == "__main__":
    async def main():
        service = BECAAutomationService()
        
        # Test case
        test_case = "05-2024-CA-012345"
        print(f"Fetching BECA data for: {test_case}")
        
        doc = await service.get_case_document(test_case)
        
        print(f"\nExtracted Data:")
        print(f"  Case: {doc.case_number}")
        print(f"  Plaintiff: {doc.plaintiff}")
        print(f"  Defendant: {doc.defendant}")
        print(f"  Judgment: ${doc.judgment_amount:,.2f}" if doc.judgment_amount else "  Judgment: N/A")
        print(f"  Sale Date: {doc.sale_date}")
        print(f"  Property: {doc.property_address}")
        
        # Lien analysis
        analysis = analyze_lien_priority(doc)
        print(f"\nLien Analysis:")
        print(f"  Type: {analysis['foreclosure_type']}")
        print(f"  Senior Liens Survive: {analysis['senior_liens_survive']}")
        print(f"  Risk Level: {analysis['risk_level']}")
        
        await service.close()
    
    asyncio.run(main())
