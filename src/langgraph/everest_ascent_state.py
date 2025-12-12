"""
The Everest Ascent™ - LangGraph State Definition
================================================
12-Stage Methodology for Distressed Real Estate Intelligence

© 2025 Everest Capital USA. All rights reserved.
The Everest Ascent™ and The Shapira Method™ are trademarks of Everest Capital USA.

This module defines the state schema for the LangGraph-based pipeline
that implements The Everest Ascent methodology.
"""

from typing import TypedDict, Literal, Optional, List, Dict, Any
from datetime import datetime
from dataclasses import dataclass, field
from enum import Enum


# ============================================================
# ENUMS AND CONSTANTS
# ============================================================

class Recommendation(str, Enum):
    """Final recommendation from the pipeline"""
    BID = "BID"
    REVIEW = "REVIEW"
    SKIP = "SKIP"
    DO_NOT_BID = "DO_NOT_BID"


class PipelinePhase(str, Enum):
    """The 5 phases of The Everest Ascent"""
    BASE_CAMP = "Base Camp"
    THE_APPROACH = "The Approach"
    THE_CLIMB = "The Climb"
    SUMMIT_PUSH = "Summit Push"
    THE_DESCENT = "The Descent"


class StageStatus(str, Enum):
    """Status of individual stage execution"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


# ============================================================
# STAGE OUTPUT TYPES
# ============================================================

@dataclass
class DiscoveryResult:
    """Stage 1: Discovery (AuctionRadar™) output"""
    case_id: str
    auction_date: datetime
    auction_type: str  # 'foreclosure' or 'tax_deed'
    source: str
    discovery_score: float
    discovered_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class BECAData:
    """Stage 2: Scraping output"""
    case_number: str
    final_judgment: float
    opening_bid: Optional[float]
    plaintiff: str
    plaintiff_type: str  # 'bank', 'hoa', 'government', 'private'
    defendant: str
    property_address: str
    parcel_id: Optional[str]
    filing_date: Optional[datetime]
    judgment_date: Optional[datetime]
    sale_date: datetime
    attorney: Optional[str]
    raw_data: Dict[str, Any] = field(default_factory=dict)


@dataclass
class TitleRecord:
    """Single record in title chain"""
    document_type: str
    recording_date: datetime
    grantor: str
    grantee: str
    book_page: str
    consideration: Optional[float]
    notes: Optional[str]


@dataclass
class TitleSearchResult:
    """Stage 3: Title Search (TitleTrack™) output"""
    property_address: str
    parcel_id: str
    current_owner: str
    ownership_chain: List[TitleRecord]
    title_defects: List[str]
    search_date: datetime = field(default_factory=datetime.utcnow)


@dataclass 
class Lien:
    """Individual lien record"""
    lien_type: str  # 'mortgage', 'hoa', 'tax', 'judgment', 'mechanic'
    creditor: str
    original_amount: float
    current_balance: Optional[float]
    recording_date: datetime
    book_page: str
    position: int  # 1 = first, 2 = second, etc.
    survives_foreclosure: bool
    notes: Optional[str]


@dataclass
class LienPriorityResult:
    """Stage 4: Lien Priority (LienLogic™) output - FLAGSHIP"""
    liens: List[Lien]
    total_lien_amount: float
    senior_liens_surviving: List[Lien]
    surviving_debt_total: float
    do_not_bid_flag: bool
    do_not_bid_reason: Optional[str]
    lien_priority_diagram: str  # ASCII or markdown representation
    analysis_confidence: float
    warnings: List[str] = field(default_factory=list)


@dataclass
class TaxCertificate:
    """Individual tax certificate"""
    certificate_number: str
    year: int
    face_amount: float
    interest_rate: float
    current_redemption_amount: float
    holder: str
    sale_date: datetime


@dataclass
class TaxCertResult:
    """Stage 5: Tax Certificates output"""
    certificates: List[TaxCertificate]
    total_redemption_required: float
    years_delinquent: int
    tax_deed_eligible: bool


@dataclass
class DemographicsResult:
    """Stage 6: Demographics (MarketPulse™) output"""
    zip_code: str
    city: str
    county: str
    median_household_income: float
    median_home_value: float
    vacancy_rate: float
    population: int
    population_growth_5yr: float
    unemployment_rate: float
    crime_index: Optional[float]
    school_rating: Optional[float]
    neighborhood_score: float  # 0-100 composite score
    tier: str  # 'A', 'B', 'C', 'D'
    notes: List[str] = field(default_factory=list)


@dataclass
class MLPrediction:
    """Stage 7: ML Score (BidScore™) output - FLAGSHIP"""
    third_party_probability: float  # 0.0 - 1.0
    predicted_sale_price: float
    confidence_interval_low: float
    confidence_interval_high: float
    model_confidence: float
    comparable_cases: List[str]
    feature_importances: Dict[str, float]
    plaintiff_pattern_match: Optional[str]
    model_version: str = "xgb_v1.0_64.4"


@dataclass
class MaxBidCalculation:
    """Stage 8: Max Bid (The Shapira Formula™) output - FLAGSHIP"""
    arv: float  # After Repair Value
    repair_estimate: float
    carrying_costs: float  # Fixed $10,000
    profit_margin: float  # MIN($25K, 15% ARV)
    max_bid: float  # The Shapira Formula result
    bid_judgment_ratio: float
    recommendation: Recommendation
    formula_breakdown: str
    assumptions: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)


@dataclass
class DecisionFactor:
    """Individual factor in decision"""
    factor_name: str
    value: Any
    weight: float
    impact: str  # 'positive', 'negative', 'neutral'
    source_stage: int


@dataclass
class DecisionLogEntry:
    """Stage 9: Decision Log output"""
    case_id: str
    timestamp: datetime
    recommendation: Recommendation
    confidence_score: float
    factors: List[DecisionFactor]
    warnings: List[str]
    blockers: List[str]  # Reasons for DO_NOT_BID
    human_override: Optional[str]
    audit_hash: str


@dataclass
class ReportOutput:
    """Stage 10: Report output"""
    report_path: str
    report_format: str  # 'docx', 'pdf'
    generated_at: datetime
    page_count: int
    includes_photos: bool
    includes_ml_prediction: bool


@dataclass
class ExitStrategy:
    """Individual exit strategy analysis"""
    strategy_name: str  # 'wholesale', 'retail_flip', 'brrrr', 'mid_term_rental', 'long_term_hold'
    projected_profit: float
    projected_roi: float
    hold_period_months: int
    capital_required: float
    risk_level: str  # 'low', 'medium', 'high'
    feasibility_score: float  # 0-100


@dataclass
class DispositionResult:
    """Stage 11: Disposition (ExitPath™) output"""
    strategies: List[ExitStrategy]
    recommended_strategy: str
    recommended_hold_period: int
    projected_roi: float
    market_conditions_summary: str


@dataclass
class ArchiveEntry:
    """Stage 12: Archive output"""
    archived_at: datetime
    archive_id: str
    outcome: Optional[Dict[str, Any]]  # Filled post-auction
    feedback_incorporated: bool


# ============================================================
# MAIN STATE DEFINITION
# ============================================================

class EverestAscentState(TypedDict, total=False):
    """
    The Everest Ascent™ Pipeline State
    ===================================
    
    This TypedDict defines the complete state for the 12-stage
    LangGraph pipeline implementing The Shapira Method™.
    
    State flows through all 12 stages, accumulating results from
    each stage and enabling conditional routing based on findings
    (e.g., DO_NOT_BID triggers from LienLogic™).
    """
    
    # ========== METADATA ==========
    run_id: str
    case_id: str
    started_at: str  # ISO format datetime
    current_stage: int
    current_phase: str
    pipeline_status: str  # 'running', 'completed', 'failed', 'aborted'
    
    # ========== STAGE 1: DISCOVERY (AuctionRadar™) ==========
    discovery_result: Optional[Dict[str, Any]]
    auction_date: Optional[str]
    auction_type: Optional[str]
    
    # ========== STAGE 2: SCRAPING (BECA) ==========
    beca_data: Optional[Dict[str, Any]]
    final_judgment: Optional[float]
    opening_bid: Optional[float]
    plaintiff: Optional[str]
    plaintiff_type: Optional[str]
    property_address: Optional[str]
    parcel_id: Optional[str]
    
    # ========== STAGE 3: TITLE SEARCH (TitleTrack™) ==========
    title_result: Optional[Dict[str, Any]]
    current_owner: Optional[str]
    ownership_chain: Optional[List[Dict[str, Any]]]
    title_defects: Optional[List[str]]
    
    # ========== STAGE 4: LIEN PRIORITY (LienLogic™) ⭐ FLAGSHIP ==========
    lien_result: Optional[Dict[str, Any]]
    liens: Optional[List[Dict[str, Any]]]
    surviving_liens: Optional[List[Dict[str, Any]]]
    surviving_debt_total: Optional[float]
    do_not_bid_flag: bool
    do_not_bid_reason: Optional[str]
    
    # ========== STAGE 5: TAX CERTIFICATES ==========
    tax_cert_result: Optional[Dict[str, Any]]
    tax_certificates: Optional[List[Dict[str, Any]]]
    total_redemption: Optional[float]
    
    # ========== STAGE 6: DEMOGRAPHICS (MarketPulse™) ==========
    demographics_result: Optional[Dict[str, Any]]
    zip_code: Optional[str]
    neighborhood_score: Optional[float]
    neighborhood_tier: Optional[str]
    median_income: Optional[float]
    
    # ========== STAGE 7: ML SCORE (BidScore™) ⭐ FLAGSHIP ==========
    ml_result: Optional[Dict[str, Any]]
    third_party_probability: Optional[float]
    predicted_sale_price: Optional[float]
    ml_confidence: Optional[float]
    model_version: Optional[str]
    
    # ========== STAGE 8: MAX BID (The Shapira Formula™) ⭐ FLAGSHIP ==========
    max_bid_result: Optional[Dict[str, Any]]
    arv: Optional[float]
    repair_estimate: Optional[float]
    max_bid: Optional[float]
    bid_judgment_ratio: Optional[float]
    
    # ========== STAGE 9: DECISION LOG ==========
    decision_log: Optional[Dict[str, Any]]
    recommendation: Optional[str]  # 'BID', 'REVIEW', 'SKIP', 'DO_NOT_BID'
    confidence_score: Optional[float]
    decision_factors: Optional[List[Dict[str, Any]]]
    warnings: Optional[List[str]]
    blockers: Optional[List[str]]
    
    # ========== STAGE 10: REPORT ==========
    report_result: Optional[Dict[str, Any]]
    report_path: Optional[str]
    report_generated_at: Optional[str]
    
    # ========== STAGE 11: DISPOSITION (ExitPath™) ==========
    disposition_result: Optional[Dict[str, Any]]
    exit_strategies: Optional[List[Dict[str, Any]]]
    recommended_strategy: Optional[str]
    projected_roi: Optional[float]
    
    # ========== STAGE 12: ARCHIVE ==========
    archive_result: Optional[Dict[str, Any]]
    archived: bool
    archive_id: Optional[str]
    
    # ========== ERROR HANDLING ==========
    errors: List[Dict[str, Any]]
    stage_statuses: Dict[int, str]
    stage_timings: Dict[int, float]  # Stage number -> duration in seconds
    
    # ========== COST TRACKING ==========
    total_tokens_used: int
    total_cost_usd: float
    model_calls: List[Dict[str, Any]]


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def create_initial_state(case_id: str, run_id: str) -> EverestAscentState:
    """Create initial state for a new pipeline run"""
    return EverestAscentState(
        run_id=run_id,
        case_id=case_id,
        started_at=datetime.utcnow().isoformat(),
        current_stage=0,
        current_phase="Initializing",
        pipeline_status="running",
        do_not_bid_flag=False,
        archived=False,
        errors=[],
        stage_statuses={i: "pending" for i in range(1, 13)},
        stage_timings={},
        total_tokens_used=0,
        total_cost_usd=0.0,
        model_calls=[]
    )


def get_phase_for_stage(stage_number: int) -> str:
    """Get the phase name for a given stage number"""
    phase_map = {
        1: PipelinePhase.BASE_CAMP.value,
        2: PipelinePhase.BASE_CAMP.value,
        3: PipelinePhase.THE_APPROACH.value,
        4: PipelinePhase.THE_APPROACH.value,
        5: PipelinePhase.THE_APPROACH.value,
        6: PipelinePhase.THE_CLIMB.value,
        7: PipelinePhase.THE_CLIMB.value,
        8: PipelinePhase.THE_CLIMB.value,
        9: PipelinePhase.SUMMIT_PUSH.value,
        10: PipelinePhase.SUMMIT_PUSH.value,
        11: PipelinePhase.THE_DESCENT.value,
        12: PipelinePhase.THE_DESCENT.value,
    }
    return phase_map.get(stage_number, "Unknown")


def get_stage_brand(stage_number: int) -> Optional[str]:
    """Get the branded name for a stage (if applicable)"""
    brand_map = {
        1: "AuctionRadar™",
        3: "TitleTrack™",
        4: "LienLogic™",
        6: "MarketPulse™",
        7: "BidScore™",
        8: "The Shapira Formula™",
        11: "ExitPath™"
    }
    return brand_map.get(stage_number)


def is_flagship_stage(stage_number: int) -> bool:
    """Check if a stage is a flagship (critical IP) stage"""
    return stage_number in {4, 7, 8}


# ============================================================
# EXPORTS
# ============================================================

__all__ = [
    # Main state
    "EverestAscentState",
    
    # Enums
    "Recommendation",
    "PipelinePhase", 
    "StageStatus",
    
    # Data classes
    "DiscoveryResult",
    "BECAData",
    "TitleRecord",
    "TitleSearchResult",
    "Lien",
    "LienPriorityResult",
    "TaxCertificate",
    "TaxCertResult",
    "DemographicsResult",
    "MLPrediction",
    "MaxBidCalculation",
    "DecisionFactor",
    "DecisionLogEntry",
    "ReportOutput",
    "ExitStrategy",
    "DispositionResult",
    "ArchiveEntry",
    
    # Helper functions
    "create_initial_state",
    "get_phase_for_stage",
    "get_stage_brand",
    "is_flagship_stage"
]
