"""
BidDeed.AI V13.4.0 — Layer 8 Lien Priority Analyzer
=========================================================
LAYER 8 IP PROTECTION

This module contains proprietary lien priority analysis logic.
In production deployment:
- This file is encrypted with AES-256
- Decryption key stored in secure vault (AWS Secrets Manager)
- Runtime decryption only, never stored in plaintext on disk

FLORIDA FORECLOSURE LIEN PRIORITY RULES:
1. Real property taxes (always senior - survive all foreclosures)
2. Special assessments (municipal)
3. First mortgage (typically the foreclosing party)
4. Second mortgage
5. HOA/COA liens (SPECIAL RULES - see below)
6. Mechanics liens (within 90 days of recording)
7. Judgment liens
8. IRS liens (subordinate to prior recorded liens)

CRITICAL HOA RULES (Florida Statute 720.3085):
- HOA can foreclose independently for assessments
- In HOA foreclosure: Senior mortgages SURVIVE
- In bank foreclosure: HOA lien typically wiped
- HOA has "super lien" for 12 months of assessments
- This is the #1 mistake investors make

STRATEGY:
When HOA is foreclosing:
- Senior mortgage survives → Add to acquisition cost
- Junior liens wiped
- Could result in massive hidden debt if missed
"""

from typing import TypedDict, List, Optional, Literal
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
import logging

logger = logging.getLogger("BidDeed.AI.Layer8.LienAnalyzer")


# =============================================================================
# LIEN TYPES AND PRIORITY ORDER
# =============================================================================

class LienType(str, Enum):
    """Lien types in Florida foreclosure priority order"""
    REAL_PROPERTY_TAX = "real_property_tax"        # Priority 1 - Always senior
    SPECIAL_ASSESSMENT = "special_assessment"       # Priority 2
    MORTGAGE_FIRST = "mortgage_first"              # Priority 3
    MORTGAGE_SECOND = "mortgage_second"            # Priority 4
    MORTGAGE_THIRD = "mortgage_third"              # Priority 5
    HOA = "hoa"                                    # Special rules
    COA = "coa"                                    # Condo association - same as HOA
    MECHANICS = "mechanics"                        # Within 90 days
    CODE_ENFORCEMENT = "code_enforcement"          # Municipal
    JUDGMENT = "judgment"                          # Court judgments
    IRS = "irs"                                    # Federal tax lien
    STATE_TAX = "state_tax"                        # State tax lien
    CHILD_SUPPORT = "child_support"                # Support liens
    OTHER = "other"


class ForeclosureType(str, Enum):
    """Type of foreclosure proceeding"""
    MORTGAGE = "mortgage"           # Bank/lender foreclosure
    HOA = "hoa"                     # HOA assessment foreclosure
    TAX_DEED = "tax_deed"           # Tax certificate foreclosure
    CODE_ENFORCEMENT = "code"       # Municipal code enforcement


# =============================================================================
# DATA STRUCTURES
# =============================================================================

@dataclass
class LienRecord:
    """Individual lien record"""
    lien_type: LienType
    recorded_date: datetime
    amount: float
    holder: str
    instrument_number: str
    book_page: Optional[str]
    position: int                   # Recorded position
    is_foreclosing: bool = False    # Is this the foreclosing lien?
    notes: Optional[str] = None


class LienPriorityResult(TypedDict):
    """Result of lien priority analysis"""
    # Classification
    surviving_liens: List[dict]
    wiped_liens: List[dict]
    foreclosing_lien: Optional[dict]
    
    # Amounts
    total_surviving_amount: float
    total_wiped_amount: float
    senior_mortgage_survives: bool
    
    # Risk assessment
    has_hidden_debt: bool
    hidden_debt_amount: float
    risk_level: Literal["low", "medium", "high", "critical"]
    risk_factors: List[str]
    
    # HOA specifics
    is_hoa_foreclosure: bool
    hoa_super_lien_amount: float
    
    # Recommendations
    adjusted_max_bid: Optional[float]
    warnings: List[str]


# =============================================================================
# PRIORITY DETERMINATION
# =============================================================================

# Base priority order (lower = more senior)
LIEN_PRIORITY_ORDER = {
    LienType.REAL_PROPERTY_TAX: 1,
    LienType.SPECIAL_ASSESSMENT: 2,
    LienType.MORTGAGE_FIRST: 3,
    LienType.MORTGAGE_SECOND: 4,
    LienType.MORTGAGE_THIRD: 5,
    LienType.HOA: 6,
    LienType.COA: 6,
    LienType.MECHANICS: 7,
    LienType.CODE_ENFORCEMENT: 8,
    LienType.JUDGMENT: 9,
    LienType.IRS: 10,
    LienType.STATE_TAX: 11,
    LienType.CHILD_SUPPORT: 12,
    LienType.OTHER: 99,
}


def get_lien_priority(lien: LienRecord) -> int:
    """Get base priority for a lien type"""
    return LIEN_PRIORITY_ORDER.get(lien.lien_type, 99)


# =============================================================================
# CORE ANALYSIS FUNCTIONS
# =============================================================================

def analyze_lien_priority(
    liens: List[LienRecord],
    foreclosure_type: ForeclosureType,
    foreclosing_lien_instrument: Optional[str] = None,
    judgment_amount: float = 0
) -> LienPriorityResult:
    """
    Analyze lien priority and determine surviving vs wiped liens.
    
    CRITICAL LOGIC:
    1. In MORTGAGE foreclosure: All junior liens wiped
    2. In HOA foreclosure: Senior mortgages SURVIVE
    3. In TAX DEED: All liens except real property tax wiped
    
    Args:
        liens: List of lien records from title search
        foreclosure_type: Type of foreclosure (mortgage, hoa, tax_deed)
        foreclosing_lien_instrument: Instrument number of foreclosing lien
        judgment_amount: Foreclosure judgment amount
    
    Returns:
        LienPriorityResult with surviving/wiped liens and risk assessment
    
    Example:
        liens = [
            LienRecord(LienType.MORTGAGE_FIRST, ..., amount=200000),
            LienRecord(LienType.HOA, ..., amount=15000, is_foreclosing=True),
        ]
        result = analyze_lien_priority(liens, ForeclosureType.HOA)
        # result['senior_mortgage_survives'] = True
        # result['total_surviving_amount'] = 200000
    """
    
    surviving_liens = []
    wiped_liens = []
    foreclosing_lien = None
    risk_factors = []
    warnings = []
    
    # Sort liens by recorded date (first recorded = more senior within same type)
    sorted_liens = sorted(liens, key=lambda l: (get_lien_priority(l), l.recorded_date))
    
    # Find foreclosing lien
    for lien in sorted_liens:
        if lien.is_foreclosing or lien.instrument_number == foreclosing_lien_instrument:
            foreclosing_lien = lien
            break
    
    if not foreclosing_lien and liens:
        # Assume first mortgage is foreclosing if not specified
        for lien in sorted_liens:
            if lien.lien_type in [LienType.MORTGAGE_FIRST, LienType.HOA]:
                foreclosing_lien = lien
                break
    
    # =================================================================
    # APPLY FORECLOSURE TYPE RULES
    # =================================================================
    
    if foreclosure_type == ForeclosureType.TAX_DEED:
        # Tax deed wipes EVERYTHING except real property taxes
        for lien in sorted_liens:
            if lien.lien_type == LienType.REAL_PROPERTY_TAX:
                surviving_liens.append(lien)
            else:
                wiped_liens.append(lien)
        warnings.append("Tax deed sale - verify all liens wiped except property taxes")
    
    elif foreclosure_type == ForeclosureType.HOA:
        # =============================================================
        # CRITICAL: HOA FORECLOSURE SPECIAL RULES
        # Senior mortgages SURVIVE in HOA foreclosure!
        # =============================================================
        
        for lien in sorted_liens:
            if lien.lien_type == LienType.REAL_PROPERTY_TAX:
                # Always survives
                surviving_liens.append(lien)
            elif lien.lien_type == LienType.SPECIAL_ASSESSMENT:
                # Usually survives
                surviving_liens.append(lien)
            elif lien.lien_type in [LienType.MORTGAGE_FIRST, LienType.MORTGAGE_SECOND, LienType.MORTGAGE_THIRD]:
                # MORTGAGES SURVIVE IN HOA FORECLOSURE
                surviving_liens.append(lien)
                risk_factors.append(f"Senior mortgage survives: ${lien.amount:,.0f}")
            elif lien == foreclosing_lien:
                # The HOA lien itself - being foreclosed
                wiped_liens.append(lien)
            elif lien.lien_type in [LienType.HOA, LienType.COA]:
                # Other HOA liens typically subordinate
                wiped_liens.append(lien)
            else:
                # Junior liens wiped
                wiped_liens.append(lien)
        
        warnings.append("⚠️ HOA FORECLOSURE: Senior mortgages survive! Factor into bid.")
        risk_factors.append("HOA foreclosure - hidden debt risk HIGH")
    
    elif foreclosure_type == ForeclosureType.MORTGAGE:
        # Standard mortgage foreclosure - wipe junior liens
        
        foreclosing_priority = get_lien_priority(foreclosing_lien) if foreclosing_lien else 3
        
        for lien in sorted_liens:
            if lien.lien_type == LienType.REAL_PROPERTY_TAX:
                # Always survives
                surviving_liens.append(lien)
            elif lien.lien_type == LienType.SPECIAL_ASSESSMENT:
                # Usually survives
                surviving_liens.append(lien)
            elif get_lien_priority(lien) < foreclosing_priority:
                # Senior to foreclosing lien - survives
                surviving_liens.append(lien)
                if lien.lien_type in [LienType.MORTGAGE_FIRST]:
                    risk_factors.append(f"Senior lien survives: ${lien.amount:,.0f}")
            elif lien == foreclosing_lien:
                # The foreclosing lien itself
                wiped_liens.append(lien)
            else:
                # Junior liens wiped
                wiped_liens.append(lien)
    
    elif foreclosure_type == ForeclosureType.CODE_ENFORCEMENT:
        # Code enforcement - similar to HOA, senior liens survive
        for lien in sorted_liens:
            if lien.lien_type in [LienType.REAL_PROPERTY_TAX, LienType.SPECIAL_ASSESSMENT,
                                   LienType.MORTGAGE_FIRST, LienType.MORTGAGE_SECOND]:
                surviving_liens.append(lien)
            else:
                wiped_liens.append(lien)
        warnings.append("Code enforcement foreclosure - verify lien priority with attorney")
    
    # =================================================================
    # CALCULATE TOTALS
    # =================================================================
    
    total_surviving = sum(l.amount for l in surviving_liens)
    total_wiped = sum(l.amount for l in wiped_liens)
    
    # Check for surviving senior mortgage
    senior_mortgage_survives = any(
        l.lien_type in [LienType.MORTGAGE_FIRST, LienType.MORTGAGE_SECOND]
        for l in surviving_liens
    )
    
    # Calculate HOA super lien (12 months of assessments)
    hoa_liens = [l for l in liens if l.lien_type in [LienType.HOA, LienType.COA]]
    hoa_super_lien = sum(l.amount for l in hoa_liens[:1])  # First 12 months
    
    # =================================================================
    # RISK ASSESSMENT
    # =================================================================
    
    # Hidden debt = surviving liens not obvious from judgment
    hidden_debt = total_surviving
    has_hidden_debt = hidden_debt > 5000
    
    if has_hidden_debt:
        risk_factors.append(f"Hidden debt: ${hidden_debt:,.0f} in surviving liens")
    
    # Determine risk level
    if foreclosure_type == ForeclosureType.HOA and senior_mortgage_survives:
        risk_level = "critical"
    elif hidden_debt > 50000:
        risk_level = "high"
    elif hidden_debt > 20000:
        risk_level = "medium"
    else:
        risk_level = "low"
    
    # Adjusted max bid recommendation
    adjusted_max_bid = None
    if judgment_amount > 0 and total_surviving > 0:
        # Reduce max bid by surviving lien amount
        adjusted_max_bid = max(0, judgment_amount - total_surviving)
        warnings.append(f"Reduce bid by ${total_surviving:,.0f} for surviving liens")
    
    # =================================================================
    # BUILD RESULT
    # =================================================================
    
    result = LienPriorityResult(
        surviving_liens=[_lien_to_dict(l) for l in surviving_liens],
        wiped_liens=[_lien_to_dict(l) for l in wiped_liens],
        foreclosing_lien=_lien_to_dict(foreclosing_lien) if foreclosing_lien else None,
        total_surviving_amount=total_surviving,
        total_wiped_amount=total_wiped,
        senior_mortgage_survives=senior_mortgage_survives,
        has_hidden_debt=has_hidden_debt,
        hidden_debt_amount=hidden_debt,
        risk_level=risk_level,
        risk_factors=risk_factors,
        is_hoa_foreclosure=(foreclosure_type == ForeclosureType.HOA),
        hoa_super_lien_amount=hoa_super_lien,
        adjusted_max_bid=adjusted_max_bid,
        warnings=warnings
    )
    
    logger.info(
        f"[Layer8] Lien Analysis: "
        f"Surviving=${total_surviving:,.0f} | Wiped=${total_wiped:,.0f} | "
        f"Risk={risk_level} | HOA={foreclosure_type == ForeclosureType.HOA}"
    )
    
    return result


def _lien_to_dict(lien: LienRecord) -> dict:
    """Convert LienRecord to dict for JSON serialization"""
    if lien is None:
        return None
    return {
        "lien_type": lien.lien_type.value,
        "recorded_date": lien.recorded_date.isoformat() if lien.recorded_date else None,
        "amount": lien.amount,
        "holder": lien.holder,
        "instrument_number": lien.instrument_number,
        "book_page": lien.book_page,
        "position": lien.position,
        "is_foreclosing": lien.is_foreclosing,
    }


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def determine_surviving_liens(
    liens: List[LienRecord],
    foreclosure_type: ForeclosureType
) -> List[LienRecord]:
    """
    Quick helper to get only surviving liens.
    
    Example:
        surviving = determine_surviving_liens(liens, ForeclosureType.HOA)
        total = sum(l.amount for l in surviving)
    """
    result = analyze_lien_priority(liens, foreclosure_type)
    return [l for l in liens if _lien_to_dict(l) in result["surviving_liens"]]


def is_hoa_foreclosure(plaintiff: str) -> bool:
    """
    Detect if foreclosure is likely HOA-initiated based on plaintiff name.
    
    Common HOA indicators:
    - "Homeowners Association"
    - "HOA"
    - "Property Owners Association"
    - "Condominium Association"
    - "Master Association"
    """
    plaintiff_lower = plaintiff.lower()
    hoa_indicators = [
        "homeowners association",
        "home owners association",
        "hoa",
        "property owners",
        "condominium association",
        "condo association",
        "master association",
        "community association",
        "poa",
        "coa",
    ]
    return any(indicator in plaintiff_lower for indicator in hoa_indicators)


def calculate_true_acquisition_cost(
    winning_bid: float,
    surviving_liens: List[LienRecord],
    estimated_closing_costs: float = 3000
) -> float:
    """
    Calculate true acquisition cost including surviving liens.
    
    CRITICAL: This is what you're actually paying, not just the bid!
    
    Example:
        true_cost = calculate_true_acquisition_cost(
            winning_bid=50000,
            surviving_liens=[LienRecord(amount=180000, ...)],
            estimated_closing_costs=3500
        )
        # Returns: 233500 (50K + 180K mortgage + 3.5K closing)
    """
    surviving_total = sum(l.amount for l in surviving_liens)
    return winning_bid + surviving_total + estimated_closing_costs


# =============================================================================
# EXPORTS
# =============================================================================

__all__ = [
    "analyze_lien_priority",
    "determine_surviving_liens",
    "is_hoa_foreclosure",
    "calculate_true_acquisition_cost",
    "LienPriorityResult",
    "LienRecord",
    "LienType",
    "ForeclosureType",
]
