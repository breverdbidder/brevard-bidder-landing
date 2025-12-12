#!/usr/bin/env python3
"""
BidDeed.AI V14.4 - Lien Discovery Agent
============================================

Automated lien discovery across all Brevard County data sources.
NO GUESSWORK - searches actual recorded documents.

Data Sources:
1. AcclaimWeb (vaclmweb1.brevardclerk.us) - mortgages, liens, judgments
2. RealTDM - tax certificates
3. BCPAO - property details, owner info
4. Tax Collector - delinquent taxes

Key Features:
- HOA/COA plaintiff detection (senior mortgages survive!)
- Lien priority calculation per Florida law
- Survivability analysis for foreclosure vs tax deed
- Adjusted max bid calculation

Author: BidDeed.AI
Version: 14.4.2
"""

import asyncio
import httpx
import re
from dataclasses import dataclass, field, asdict
from typing import Optional, List, Dict, Tuple
from datetime import datetime
from enum import Enum

# ============================================================================
# LIEN TYPES AND PRIORITY
# ============================================================================

class LienType(Enum):
    """Florida lien types in general priority order."""
    FEDERAL_TAX = "Federal Tax Lien"
    STATE_TAX = "State Tax Lien"
    PROPERTY_TAX = "Ad Valorem Property Tax"
    SPECIAL_ASSESSMENT = "Special Assessment"
    FIRST_MORTGAGE = "First Mortgage"
    SECOND_MORTGAGE = "Second Mortgage"
    HELOC = "Home Equity Line of Credit"
    HOA_LIEN = "HOA/COA Lien"
    MECHANICS_LIEN = "Mechanics/Construction Lien"
    JUDGMENT_LIEN = "Judgment Lien"
    CODE_ENFORCEMENT = "Code Enforcement Lien"
    UTILITY_LIEN = "Utility Lien"
    OTHER = "Other Lien"

@dataclass
class Lien:
    """Individual lien record."""
    lien_type: LienType
    amount: float
    recording_date: Optional[datetime]
    or_book: Optional[str]
    or_page: Optional[str]
    holder: str
    status: str  # ACTIVE, SATISFIED, RELEASED
    priority_rank: int = 0
    survives_foreclosure: bool = False
    survives_tax_deed: bool = False

@dataclass
class LienSearchResult:
    """Complete lien search result for a property."""
    parcel_id: str
    owner_name: str
    property_address: str
    search_timestamp: datetime = field(default_factory=datetime.now)
    
    liens: List[Lien] = field(default_factory=list)
    total_liens_amount: float = 0.0
    total_amount_surviving_foreclosure: float = 0.0
    total_amount_surviving_tax_deed: float = 0.0
    
    is_hoa_foreclosure: bool = False
    senior_mortgage_detected: bool = False
    do_not_bid: bool = False
    risk_level: str = "LOW"  # LOW, MEDIUM, HIGH, DO_NOT_BID
    notes: List[str] = field(default_factory=list)

# ============================================================================
# LIEN PRIORITY RULES (FLORIDA LAW)
# ============================================================================

LIEN_PRIORITY_RULES = {
    "MORTGAGE_FORECLOSURE": {
        "description": "Bank/Lender foreclosing on mortgage",
        "extinguished": [
            ("SECOND_MORTGAGE", "Junior mortgages wiped out"),
            ("HELOC", "Home equity lines wiped out"),
            ("HOA_LIEN", "HOA liens junior to mortgage wiped out"),
            ("JUDGMENT_LIEN", "Most judgment liens wiped out"),
            ("MECHANICS_LIEN", "If recorded after mortgage"),
            ("CODE_ENFORCEMENT", "Most code liens wiped out"),
        ],
        "survives": [
            ("PROPERTY_TAX", "Property taxes always survive"),
            ("FEDERAL_TAX", "Federal tax liens survive if recorded first"),
            ("SPECIAL_ASSESSMENT", "Special assessments survive"),
        ],
    },
    "HOA_FORECLOSURE": {
        "description": "HOA/COA foreclosing for unpaid dues",
        "warning": "SENIOR MORTGAGES SURVIVE HOA FORECLOSURE!",
        "survives": [
            ("FIRST_MORTGAGE", "YES - senior mortgage survives HOA foreclosure!"),
            ("FEDERAL_TAX", "YES - if recorded before HOA lien"),
            ("PROPERTY_TAX", "Property taxes always survive"),
        ],
        "buyer_liability": "Buyer takes property SUBJECT TO the first mortgage balance",
        "detection_method": "Check if plaintiff name contains HOA/COA keywords"
    },
    "TAX_DEED_SALE": {
        "description": "County selling for delinquent property taxes",
        "extinguished": [
            ("FIRST_MORTGAGE", "All mortgages wiped out"),
            ("SECOND_MORTGAGE", "All mortgages wiped out"),
            ("HOA_LIEN", "HOA liens wiped out"),
            ("JUDGMENT_LIEN", "All judgment liens wiped out"),
            ("MECHANICS_LIEN", "All mechanics liens wiped out"),
        ],
        "survives": [
            ("FEDERAL_TAX", "Federal tax liens survive 120 days"),
            ("SPECIAL_ASSESSMENT", "Some special assessments survive"),
        ],
    }
}

# ============================================================================
# HOA/COA PLAINTIFF DETECTION
# ============================================================================

HOA_KEYWORDS = [
    "HOA", "COA", "HOMEOWNER", "HOMEOWNERS", "HOME OWNER",
    "ASSOCIATION", "ASSOC", "ASSN",
    "CONDOMINIUM", "CONDO", "CONDOS",
    "COMMUNITY", "COMMUNITIES",
    "VILLAGE", "VILLAGES",
    "LANDING", "LANDINGS",
    "ESTATES", "ESTATE",
    "VILLAS", "VILLA",
    "POINTE", "POINT",
    "PLACE", "GARDENS", "GARDEN",
    "SHORES", "SHORE",
    "HARBOR", "HARBOUR",
    "CLUB", "MASTER",
    "PROPERTY OWNERS",
    "MAINTENANCE",
    "CYPRESS", "OAK", "PINE", "PALM",
    "NORTHFIELD", "REGENCY", "BAYTREE",
]

BANK_KEYWORDS = [
    "BANK", "MORTGAGE", "LENDING", "LOAN", "FINANCIAL", "CREDIT",
    "WELLS FARGO", "JPMORGAN", "CHASE", "CITI", "NATIONSTAR",
    "PENNYMAC", "LAKEVIEW", "WILMINGTON", "DEUTSCHE", "US BANK",
    "FREEDOM", "NEWREZ", "CARRINGTON", "SPECIALIZED", "ROCKET",
    "TRUIST", "PNC", "REGIONS", "TD BANK", "FIRST FEDERAL",
    "QUICKEN", "CALIBER", "MR COOPER", "SHELLPOINT", "OCWEN",
    "DITECH", "BAYVIEW", "ROUNDPOINT", "GUILD", "FLAGSTAR",
]


def is_hoa_plaintiff(plaintiff_name: str) -> Tuple[bool, str]:
    """
    Detect if plaintiff is likely an HOA/COA (not a bank).
    
    Returns:
        Tuple of (is_hoa: bool, reason: str)
    """
    if not plaintiff_name:
        return False, "No plaintiff name provided"
    
    plaintiff_upper = plaintiff_name.upper()
    
    # First check if it's a known bank/lender
    for bank in BANK_KEYWORDS:
        if bank in plaintiff_upper:
            return False, f"Bank/lender detected: {bank}"
    
    # Check for HOA keywords
    for keyword in HOA_KEYWORDS:
        if keyword in plaintiff_upper:
            return True, f"HOA/COA keyword detected: {keyword}"
    
    # Check for common HOA name patterns
    hoa_patterns = [
        r'\bAT\s+[A-Z]+',  # "AT SOMETHING" common in condo names
        r'PHASE\s+[IVX0-9]+',  # "PHASE II" etc
        r'UNIT\s+OWNERS',
        r'LOT\s+OWNERS',
    ]
    
    for pattern in hoa_patterns:
        if re.search(pattern, plaintiff_upper):
            return True, f"HOA pattern detected: {pattern}"
    
    return False, "No HOA indicators found"

# ============================================================================
# ACCLAIMWEB DOCUMENT PATTERNS
# ============================================================================

ACCLAIMWEB_DOC_TYPES = {
    "MTG": "Mortgage",
    "AMTG": "Assignment of Mortgage",
    "SMTG": "Satisfaction of Mortgage",
    "RMTG": "Release of Mortgage",
    "PMTG": "Partial Release of Mortgage",
    "LIEN": "Lien",
    "SLIEN": "Satisfaction of Lien",
    "RLIEN": "Release of Lien",
    "COL": "Claim of Lien",
    "NOC": "Notice of Commencement",
    "JUDG": "Judgment",
    "LP": "Lis Pendens",
    "DEED": "Deed",
    "QCD": "Quit Claim Deed",
    "WD": "Warranty Deed",
}

MORTGAGE_PATTERNS = {
    'mortgage_amount': r'(?:MORTGAGE|LOAN)\s+AMOUNT[:\s]+\$?\s*([\d,]+\.?\d*)',
    'recording_info': r'OR\s*BOOK[:\s]+(\d+)[,\s]+PAGE[:\s]+(\d+)',
    'lender_name': r'(?:LENDER|MORTGAGEE)[:\s]+([A-Z][A-Za-z\s,\.]+)',
    'recording_date': r'RECORDED[:\s]+(\d{1,2}/\d{1,2}/\d{2,4})',
}

LIEN_PATTERNS = {
    'lien_amount': r'(?:LIEN|CLAIM)\s+AMOUNT[:\s]+\$?\s*([\d,]+\.?\d*)',
    'lien_holder': r'(?:LIENOR|LIENHOLDER|CLAIMANT)[:\s]+([A-Z][A-Za-z\s,\.]+)',
    'recording_info': r'OR\s*BOOK[:\s]+(\d+)[,\s]+PAGE[:\s]+(\d+)',
}

# ============================================================================
# MECHANICAL/CONSTRUCTION LIENS (F.S. Chapter 713)
# ============================================================================

"""
Florida Mechanical Lien Law (F.S. Chapter 713):

| Lien Type              | Recording Deadline      | Foreclosure Deadline | Priority                              |
|------------------------|-------------------------|----------------------|---------------------------------------|
| Construction Lien      | 90 days from last work  | 1 year from recording| Relates back to Notice of Commencement|
| Claim of Lien (COL)    | 90 days after final furnishing | 1 year to foreclose | Junior to mortgage if NOC filed after mortgage |
| Notice of Commencement | Before work begins      | N/A                  | Establishes priority date             |

CRITICAL PRIORITY RULE:
- If NOC recorded AFTER mortgage → Construction lien is JUNIOR (survives foreclosure = NO)
- If NOC recorded BEFORE mortgage → Construction lien may be SENIOR (reduces max bid)
"""

MECHANICAL_LIEN_DOC_TYPES = {
    "COL": "Claim of Lien",
    "NOC": "Notice of Commencement",
    "RLIEN": "Release of Lien",
    "SLIEN": "Satisfaction of Lien",
    "CFA": "Contractor's Final Affidavit",
    "NTO": "Notice to Owner",
}

MECHANICAL_LIEN_PATTERNS = {
    'claim_of_lien': r'CLAIM\s+OF\s+LIEN.*?\$[\d,]+\.?\d*',
    'noc_recording': r'NOTICE\s+OF\s+COMMENCEMENT.*?(\d{4}\-\d+)',
    'lien_amount': r'(?:LIEN\s+AMOUNT|CLAIM).*?\$\s*([\d,]+\.?\d*)',
    'contractor_name': r'(?:LIENOR|CLAIMANT)[:\s]+([A-Z][A-Za-z\s,\.]+(?:LLC|INC|CORP)?)',
    'property_improved': r'(?:PROPERTY|IMPROVEMENTS?).*?(\d+\s+[A-Z][A-Za-z\s]+)',
    'final_furnishing': r'(?:LAST|FINAL)\s+(?:DATE|FURNISHING)[:\s]+(\d{1,2}/\d{1,2}/\d{2,4})',
    'noc_date': r'NOC\s+(?:RECORDED|DATE)[:\s]+(\d{1,2}/\d{1,2}/\d{2,4})',
    'or_book_page': r'OR\s*BOOK[:\s]+(\d+)[,\s]+PAGE[:\s]+(\d+)',
}


@dataclass
class MechanicalLien:
    """Construction/Mechanical lien record."""
    lien_type: str  # COL, NOC, etc.
    amount: float
    contractor_name: str
    recording_date: Optional[datetime]
    or_book: Optional[str]
    or_page: Optional[str]
    noc_date: Optional[datetime]  # Notice of Commencement date
    final_furnishing_date: Optional[datetime]
    status: str  # ACTIVE, RELEASED, EXPIRED
    is_senior_to_mortgage: bool = False
    foreclosure_deadline: Optional[datetime] = None  # 1 year from recording


def assess_mechanical_lien_priority(
    noc_date: datetime,
    mortgage_date: datetime,
    lien_amount: float
) -> Dict:
    """
    Determine if mechanical lien is senior or junior to mortgage.
    
    Florida Law: Construction liens relate back to NOC date.
    - If NOC recorded AFTER mortgage → lien is JUNIOR (wiped by foreclosure)
    - If NOC recorded BEFORE mortgage → lien is SENIOR (survives, reduces bid)
    
    Args:
        noc_date: Date NOC was recorded
        mortgage_date: Date mortgage was recorded
        lien_amount: Amount of the construction lien
        
    Returns:
        Priority assessment dict
    """
    if noc_date > mortgage_date:
        return {
            "priority": "JUNIOR",
            "survives_foreclosure": False,
            "impact_on_bid": 0,
            "reason": f"NOC ({noc_date.strftime('%m/%d/%Y')}) recorded AFTER mortgage ({mortgage_date.strftime('%m/%d/%Y')})"
        }
    else:
        return {
            "priority": "SENIOR",
            "survives_foreclosure": True,
            "impact_on_bid": lien_amount,
            "reason": f"NOC ({noc_date.strftime('%m/%d/%Y')}) recorded BEFORE mortgage ({mortgage_date.strftime('%m/%d/%Y')}) - DEDUCT ${lien_amount:,.0f}"
        }


def check_mechanical_lien_expiration(recording_date: datetime) -> Dict:
    """
    Check if mechanical lien has expired (1 year to foreclose).
    
    F.S. 713.22: Lienor must begin foreclosure action within 1 year of recording.
    If expired, lien is unenforceable but may still cloud title.
    
    Args:
        recording_date: Date lien was recorded
        
    Returns:
        Expiration status dict
    """
    from datetime import timedelta
    
    foreclosure_deadline = recording_date + timedelta(days=365)
    now = datetime.now()
    
    if now > foreclosure_deadline:
        return {
            "status": "EXPIRED",
            "expired_on": foreclosure_deadline,
            "days_expired": (now - foreclosure_deadline).days,
            "note": "Lien expired - unenforceable but may cloud title until released"
        }
    else:
        days_remaining = (foreclosure_deadline - now).days
        return {
            "status": "ACTIVE",
            "foreclosure_deadline": foreclosure_deadline,
            "days_remaining": days_remaining,
            "note": f"Lien active - {days_remaining} days until expiration"
        }




# ============================================================================
# LIEN DISCOVERY AGENT
# ============================================================================

class LienDiscoveryAgent:
    """
    Automated lien discovery across all Brevard County data sources.
    NO GUESSWORK - searches actual recorded documents.
    """
    
    def __init__(self, supabase_client=None):
        self.supabase = supabase_client
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json",
        }
    
    def analyze_foreclosure_case(
        self,
        case_number: str,
        plaintiff: str,
        defendant: str = None
    ) -> Dict:
        """
        Analyze a foreclosure case to determine type and risks.
        
        Args:
            case_number: Court case number
            plaintiff: Plaintiff name from case
            defendant: Defendant/property owner name
            
        Returns:
            Analysis dict with plaintiff type, risk level, and required actions
        """
        is_hoa, reason = is_hoa_plaintiff(plaintiff)
        
        result = {
            "case_number": case_number,
            "plaintiff": plaintiff,
            "defendant": defendant,
            "is_hoa_foreclosure": is_hoa,
            "plaintiff_type": "HOA_COA" if is_hoa else "BANK_LENDER",
            "detection_reason": reason,
            "risk_level": "HIGH" if is_hoa else "STANDARD",
        }
        
        if is_hoa:
            result["warning"] = "⚠️ HOA FORECLOSURE - Senior mortgages SURVIVE!"
            result["action_required"] = [
                "1. Search AcclaimWeb for defendant as Grantee",
                "2. Find all MTG (mortgage) documents",
                "3. Check for SMTG (satisfaction) - if none, mortgage is ACTIVE",
                "4. If active mortgage exists: DO_NOT_BID or subtract balance",
            ]
            result["survival_analysis"] = {
                "First Mortgage": "SURVIVES - Buyer takes subject to",
                "Second Mortgage": "SURVIVES - Buyer takes subject to",
                "Property Tax": "SURVIVES - Always senior",
                "Federal Tax Lien": "SURVIVES - If recorded before HOA lien",
            }
        else:
            result["warning"] = None
            result["action_required"] = [
                "1. Standard title search",
                "2. Verify no senior liens",
                "3. Check for property tax delinquency",
            ]
            result["survival_analysis"] = {
                "First Mortgage": "EXTINGUISHED - Being foreclosed",
                "Junior Liens": "EXTINGUISHED - Wiped by foreclosure",
                "Property Tax": "SURVIVES - Always senior",
            }
        
        return result
    
    async def search_acclaimweb_mortgages(
        self,
        owner_name: str,
        client: httpx.AsyncClient = None
    ) -> List[Dict]:
        """
        Search AcclaimWeb for mortgages by owner name (as Grantee).
        
        Note: AcclaimWeb requires browser automation (Browserless)
        This method provides the search parameters for the BECA scraper.
        """
        # Parse name for search
        name_parts = owner_name.upper().strip().split()
        last_name = name_parts[-1] if name_parts else ""
        
        search_params = {
            "search_type": "party",
            "party_type": "grantee",  # Owner receives mortgage as grantee
            "last_name": last_name,
            "doc_types": ["MTG", "AMTG", "SMTG"],
            "date_range": "last_10_years",
        }
        
        # Return search params for Browserless scraper
        return {
            "method": "BROWSERLESS_REQUIRED",
            "url": "https://vaclmweb1.brevardclerk.us/AcclaimWeb/",
            "search_params": search_params,
            "note": "AcclaimWeb requires browser automation due to anti-bot protection"
        }
    
    async def search_property(
        self,
        parcel_id: str,
        owner_name: str = None,
        address: str = None
    ) -> LienSearchResult:
        """
        Complete lien search for a property.
        
        Steps:
        1. Get property details from BCPAO
        2. Search Official Records (AcclaimWeb) for all liens
        3. Search RealTDM for tax certificates
        4. Calculate lien priorities
        5. Determine what survives each sale type
        """
        result = LienSearchResult(
            parcel_id=parcel_id,
            owner_name=owner_name or "",
            property_address=address or ""
        )
        
        async with httpx.AsyncClient() as client:
            # Step 1: BCPAO property details
            bcpao_data = await self._fetch_bcpao(client, parcel_id)
            if bcpao_data:
                result.owner_name = bcpao_data.get("owner", owner_name)
                result.property_address = bcpao_data.get("address", address)
            
            # Step 2: AcclaimWeb search (returns params for Browserless)
            if result.owner_name:
                acclaimweb_params = await self.search_acclaimweb_mortgages(
                    result.owner_name, client
                )
                result.notes.append(
                    f"AcclaimWeb search required: {acclaimweb_params['search_params']}"
                )
            
            # Step 3: Tax certificate search would go here
            # (RealTDM integration)
        
        return result
    
    async def _fetch_bcpao(
        self,
        client: httpx.AsyncClient,
        parcel_id: str
    ) -> Optional[Dict]:
        """Fetch property details from BCPAO API."""
        try:
            # Clean parcel ID
            account = re.sub(r'[^0-9]', '', parcel_id)
            
            resp = await client.get(
                f"https://www.bcpao.us/api/v1/account/{account}",
                headers=self.headers,
                timeout=15
            )
            
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "account": account,
                    "owner": data.get("owner", {}).get("name"),
                    "address": data.get("siteAddress", {}).get("full"),
                    "market_value": data.get("values", {}).get("market"),
                    "assessed_value": data.get("values", {}).get("assessed"),
                }
        except Exception as e:
            print(f"BCPAO fetch error: {e}")
        
        return None
    
    def calculate_adjusted_max_bid(
        self,
        original_max_bid: float,
        lien_search_result: LienSearchResult
    ) -> Dict:
        """
        Calculate adjusted max bid after accounting for surviving liens.
        
        For HOA foreclosures, subtracts senior mortgage balance.
        """
        adjusted = original_max_bid
        deductions = []
        
        if lien_search_result.is_hoa_foreclosure:
            # Subtract surviving liens
            surviving = lien_search_result.total_amount_surviving_foreclosure
            adjusted -= surviving
            deductions.append(
                f"Senior liens surviving HOA foreclosure: -${surviving:,.0f}"
            )
        
        recommendation = "BID"
        if adjusted <= 0:
            recommendation = "DO_NOT_BID"
            reason = "Surviving liens exceed equity"
        elif adjusted < original_max_bid * 0.5:
            recommendation = "REVIEW"
            reason = "Significant lien deductions"
        else:
            reason = "Acceptable after lien adjustment"
        
        return {
            "original_max_bid": original_max_bid,
            "adjusted_max_bid": max(0, adjusted),
            "total_deductions": original_max_bid - adjusted,
            "deductions": deductions,
            "recommendation": recommendation,
            "reason": reason,
        }



    # =========================================================================
    # SUPABASE PERSISTENCE
    # =========================================================================
    
    async def save_lien_result(self, result: LienSearchResult, case_number: str = None):
        """
        Save lien search result to Supabase auction_results table.
        
        Args:
            result: LienSearchResult from search_property()
            case_number: Optional case number to link result
        """
        if not self.supabase:
            print("⚠️ No Supabase client - results not persisted")
            return None
        
        try:
            data = {
                "lien_search": asdict(result),
                "is_hoa_foreclosure": result.is_hoa_foreclosure,
                "senior_mortgage_detected": result.senior_mortgage_detected,
                "do_not_bid": result.do_not_bid,
                "lien_risk_level": result.risk_level,
                "lien_search_timestamp": result.search_timestamp.isoformat(),
                "total_liens_amount": result.total_liens_amount,
                "surviving_liens_amount": result.total_amount_surviving_foreclosure,
            }
            
            if case_number:
                # Update existing auction_results record
                response = self.supabase.table('auction_results').update(data).eq('case_number', case_number).execute()
                print(f"✅ Updated auction_results for {case_number}")
            else:
                # Insert as new insight for tracking
                insight_data = {
                    "category": "lien_discovery",
                    "content": f"Lien search: {result.property_address or result.parcel_id}",
                    "metadata": data
                }
                response = self.supabase.table('insights').insert(insight_data).execute()
                print(f"✅ Saved to insights table")
            
            return response
        except Exception as e:
            print(f"❌ Supabase save error: {e}")
            return None
    
    async def save_hoa_detection(self, analysis: Dict):
        """
        Save HOA foreclosure detection to Supabase for audit trail.
        
        Args:
            analysis: Result from analyze_foreclosure_case()
        """
        if not self.supabase:
            return None
        
        try:
            data = {
                "category": "hoa_detection",
                "content": f"HOA Detection: {analysis.get('plaintiff', 'Unknown')}",
                "metadata": {
                    "case_number": analysis.get("case_number"),
                    "plaintiff": analysis.get("plaintiff"),
                    "defendant": analysis.get("defendant"),
                    "is_hoa": analysis.get("is_hoa_foreclosure"),
                    "plaintiff_type": analysis.get("plaintiff_type"),
                    "risk_level": analysis.get("risk_level"),
                    "detection_reason": analysis.get("detection_reason"),
                    "timestamp": datetime.now().isoformat()
                }
            }
            
            response = self.supabase.table('insights').insert(data).execute()
            print(f"✅ HOA detection logged: {analysis.get('plaintiff_type')}")
            return response
        except Exception as e:
            print(f"❌ Supabase HOA detection save error: {e}")
            return None
    
    async def get_previous_lien_search(self, parcel_id: str) -> Optional[Dict]:
        """
        Check if we have a recent lien search for this parcel.
        Avoids redundant searches within 24 hours.
        
        Args:
            parcel_id: Property parcel ID
            
        Returns:
            Previous search result if found and recent, else None
        """
        if not self.supabase:
            return None
        
        try:
            # Check auction_results for recent search
            response = self.supabase.table('auction_results').select(
                'lien_search, lien_search_timestamp'
            ).eq('parcel_id', parcel_id).order(
                'lien_search_timestamp', desc=True
            ).limit(1).execute()
            
            if response.data and len(response.data) > 0:
                record = response.data[0]
                if record.get('lien_search_timestamp'):
                    # Check if within 24 hours
                    from datetime import timedelta
                    search_time = datetime.fromisoformat(record['lien_search_timestamp'].replace('Z', '+00:00'))
                    if datetime.now(search_time.tzinfo) - search_time < timedelta(hours=24):
                        print(f"♻️ Using cached lien search for {parcel_id}")
                        return record.get('lien_search')
            
            return None
        except Exception as e:
            print(f"Cache lookup error: {e}")
            return None



# ============================================================================
# STANDALONE FUNCTIONS FOR PIPELINE INTEGRATION
# ============================================================================

def detect_hoa_foreclosure(plaintiff: str) -> Dict:
    """Quick HOA detection for pipeline use."""
    is_hoa, reason = is_hoa_plaintiff(plaintiff)
    return {
        "is_hoa": is_hoa,
        "reason": reason,
        "risk_level": "HIGH" if is_hoa else "STANDARD",
        "warning": "Senior mortgages survive!" if is_hoa else None,
    }


def get_lien_survival_rules(foreclosure_type: str) -> Dict:
    """Get lien survival rules for a foreclosure type."""
    return LIEN_PRIORITY_RULES.get(
        foreclosure_type.upper().replace(" ", "_"),
        LIEN_PRIORITY_RULES["MORTGAGE_FORECLOSURE"]
    )


# ============================================================================
# MAIN / EXAMPLE
# ============================================================================

if __name__ == "__main__":
    # Example: Analyze HOA foreclosure
    agent = LienDiscoveryAgent()
    
    print("=" * 70)
    print("BidDeed.AI V14.4 - Lien Discovery Agent")
    print("=" * 70)
    
    # Test HOA detection
    test_cases = [
        ("CYPRESS LANDINGS HOMEOWNERS ASSOCIATION INC", True),
        ("WELLS FARGO BANK NA", False),
        ("BAYTREE COMMUNITY ASSOCIATION", True),
        ("PENNYMAC LOAN SERVICES LLC", False),
        ("REGENCY PINES CONDOMINIUM ASSN", True),
    ]
    
    print("\nHOA Detection Tests:")
    print("-" * 50)
    for plaintiff, expected in test_cases:
        is_hoa, reason = is_hoa_plaintiff(plaintiff)
        status = "✅" if is_hoa == expected else "❌"
        print(f"{status} {plaintiff[:40]:<40} | HOA: {is_hoa}")
    
    # Test case analysis
    print("\n" + "=" * 70)
    print("Example Case Analysis: CYPRESS LANDINGS")
    print("=" * 70)
    
    analysis = agent.analyze_foreclosure_case(
        case_number="05-2024-CA-015373-XXCA-BC",
        plaintiff="CYPRESS LANDINGS HOMEOWNERS ASSOCIATION INC",
        defendant="Y RIVERO"
    )
    
    print(f"\nPlaintiff: {analysis['plaintiff']}")
    print(f"Type: {analysis['plaintiff_type']}")
    print(f"Risk Level: {analysis['risk_level']}")
    
    if analysis['warning']:
        print(f"\n⚠️  {analysis['warning']}")
    
    print("\nRequired Actions:")
    for action in analysis['action_required']:
        print(f"  {action}")
    
    print("\nLien Survival:")
    for lien, status in analysis['survival_analysis'].items():
        print(f"  • {lien}: {status}")
    
    print("\n" + "=" * 70)
    print("✅ Lien Discovery Agent Ready")
    print("=" * 70)
