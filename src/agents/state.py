"""
BidDeed.AI V13.4.0 — LangGraph State Schema V2
====================================================
11 Agents | 3 Tiers | 12-Stage Pipeline

UPDATES IN V2:
- StructuredError: Enhanced error tracking with severity, tracebacks, recoverability
- DataFreshness: Track data age to prevent stale auction decisions
- SensitivityAnalysis: Separate "what-if" scenarios from bid calculation
- StateCheckpoint: Crash recovery for long-running pipelines

LAYER 8 IP PROTECTION NOTE:
- Max bid formula logic is NOT in this file
- Lien priority algorithms are NOT in this file
- Those remain in protected modules with AES-256 encryption
"""

from typing import TypedDict, Literal, Optional, Annotated
from datetime import datetime
from enum import Enum
import operator
import hashlib
import json


# =============================================================================
# ENUMS & LITERALS
# =============================================================================

class AgentTier(str, Enum):
    DISCOVERY = "discovery"
    ANALYSIS = "analysis"
    EXECUTION = "execution"


class AgentStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


class Recommendation(str, Enum):
    BID = "BID"           # Bid/Judgment ratio >= 75%
    REVIEW = "REVIEW"     # Bid/Judgment ratio 60-74%
    SKIP = "SKIP"         # Bid/Judgment ratio < 60%


class LienType(str, Enum):
    MORTGAGE_FIRST = "mortgage_first"
    MORTGAGE_SECOND = "mortgage_second"
    HOA = "hoa"
    TAX_CERTIFICATE = "tax_certificate"
    MECHANICS = "mechanics"
    CODE_ENFORCEMENT = "code_enforcement"
    JUDGMENT = "judgment"
    IRS = "irs"
    OTHER = "other"


class ExitStrategy(str, Enum):
    FIX_AND_FLIP = "fix_and_flip"
    WHOLESALE = "wholesale"
    MID_TERM_RENTAL = "mid_term_rental"
    LONG_TERM_RENTAL = "long_term_rental"
    OWNER_FINANCE = "owner_finance"


# =============================================================================
# NEW IN V2: ERROR SEVERITY ENUM
# =============================================================================

class ErrorSeverity(str, Enum):
    """Error severity levels for structured error tracking"""
    INFO = "info"           # Informational, no action needed
    WARNING = "warning"     # Potential issue, continue processing
    ERROR = "error"         # Agent failed, may need retry
    CRITICAL = "critical"   # Pipeline should halt, requires intervention


# =============================================================================
# NEW IN V2: STRUCTURED ERROR
# =============================================================================

class StructuredError(TypedDict):
    """
    Enhanced error tracking for debugging 7-hour Claude Code sessions.
    Replaces simple string errors with full context.
    """
    timestamp: datetime
    severity: ErrorSeverity
    agent_name: str                       # Which agent raised the error
    stage: str                            # Pipeline stage when error occurred
    message: str                          # Human-readable error message
    exception_type: Optional[str]         # e.g., "TimeoutError", "ValidationError"
    traceback: Optional[str]              # Full traceback for debugging
    retry_count: int                      # How many times we've retried
    max_retries: int                      # Maximum retries allowed
    recoverable: bool                     # Can pipeline continue?
    context: Optional[dict]               # Additional context (property ID, etc.)


def create_structured_error(
    agent_name: str,
    stage: str,
    message: str,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    exception: Optional[Exception] = None,
    retry_count: int = 0,
    max_retries: int = 3,
    context: Optional[dict] = None
) -> StructuredError:
    """Factory function to create a structured error"""
    import traceback as tb
    
    return StructuredError(
        timestamp=datetime.now(),
        severity=severity,
        agent_name=agent_name,
        stage=stage,
        message=message,
        exception_type=type(exception).__name__ if exception else None,
        traceback=tb.format_exc() if exception else None,
        retry_count=retry_count,
        max_retries=max_retries,
        recoverable=retry_count < max_retries,
        context=context or {}
    )


# =============================================================================
# NEW IN V2: DATA FRESHNESS TRACKING
# =============================================================================

class DataFreshness(TypedDict):
    """
    Track when data was last scraped/fetched.
    Critical for auction day when data can go stale within hours.
    
    Max age rules:
    - Auction day: 2 hours max for BCPAO, RealForeclose
    - Pre-auction: 24 hours acceptable
    - Census data: 30 days (stable)
    """
    # Scrape timestamps
    bcpao_scraped_at: Optional[datetime]
    realforeclose_scraped_at: Optional[datetime]
    beca_scraped_at: Optional[datetime]
    acclaimweb_scraped_at: Optional[datetime]
    realtdm_scraped_at: Optional[datetime]
    census_fetched_at: Optional[datetime]
    comps_analyzed_at: Optional[datetime]
    
    # Cache hits (did we use cached vs fresh data?)
    bcpao_cache_hit: bool
    realforeclose_cache_hit: bool
    beca_cache_hit: bool
    
    # Freshness configuration
    is_auction_day: bool                  # Triggers stricter freshness rules
    max_age_hours: dict                   # Service -> max acceptable age
    
    # Warnings generated
    stale_data_warnings: list[str]
    has_stale_critical_data: bool         # True = should refresh before bidding


def create_data_freshness(is_auction_day: bool = False) -> DataFreshness:
    """Factory function with sensible defaults"""
    
    # Stricter limits on auction day
    if is_auction_day:
        max_ages = {
            "bcpao": 2,
            "realforeclose": 2,
            "beca": 4,
            "acclaimweb": 4,
            "realtdm": 24,
            "census": 720,  # 30 days
            "comps": 24
        }
    else:
        max_ages = {
            "bcpao": 24,
            "realforeclose": 24,
            "beca": 48,
            "acclaimweb": 48,
            "realtdm": 168,  # 7 days
            "census": 720,
            "comps": 72
        }
    
    return DataFreshness(
        bcpao_scraped_at=None,
        realforeclose_scraped_at=None,
        beca_scraped_at=None,
        acclaimweb_scraped_at=None,
        realtdm_scraped_at=None,
        census_fetched_at=None,
        comps_analyzed_at=None,
        bcpao_cache_hit=False,
        realforeclose_cache_hit=False,
        beca_cache_hit=False,
        is_auction_day=is_auction_day,
        max_age_hours=max_ages,
        stale_data_warnings=[],
        has_stale_critical_data=False
    )


def check_data_freshness(freshness: DataFreshness) -> tuple[bool, list[str]]:
    """
    Check if any data sources are stale.
    Returns (is_fresh, list of warnings)
    """
    now = datetime.now()
    warnings = []
    has_critical_stale = False
    
    checks = [
        ("bcpao", freshness["bcpao_scraped_at"], True),
        ("realforeclose", freshness["realforeclose_scraped_at"], True),
        ("beca", freshness["beca_scraped_at"], True),
        ("acclaimweb", freshness["acclaimweb_scraped_at"], False),
        ("census", freshness["census_fetched_at"], False),
    ]
    
    for service, scraped_at, is_critical in checks:
        if scraped_at is None:
            continue
            
        max_age = freshness["max_age_hours"].get(service, 24)
        age_hours = (now - scraped_at).total_seconds() / 3600
        
        if age_hours > max_age:
            warning = f"{service.upper()} data is {age_hours:.1f}h old (max: {max_age}h)"
            warnings.append(warning)
            if is_critical:
                has_critical_stale = True
    
    return (not has_critical_stale, warnings)


# =============================================================================
# NEW IN V2: SENSITIVITY ANALYSIS
# =============================================================================

class ScenarioResult(TypedDict):
    """Result of a single what-if scenario"""
    scenario_name: str
    description: str
    adjusted_arv: float
    adjusted_repairs: float
    adjusted_hold_months: int
    resulting_max_bid: float
    resulting_roi: float
    resulting_profit: float
    is_still_viable: bool                 # ROI > minimum threshold


class SensitivityAnalysis(TypedDict):
    """
    What-if scenarios to stress-test bid decisions.
    Separated from BidCalculation to keep concerns clean.
    
    Standard scenarios:
    - ARV drops 10%, 20%
    - Repairs increase 20%, 50%
    - Hold period extends 3mo, 6mo
    - Combined worst case
    """
    # Core scenarios
    scenarios: list[ScenarioResult]
    
    # Key thresholds
    break_even_arv: float                 # Minimum ARV to avoid loss
    break_even_repairs: float             # Maximum repairs before loss
    max_hold_months_viable: int           # How long before ROI goes negative
    
    # Risk summary
    worst_case_loss: float                # Maximum potential loss
    best_case_profit: float               # Maximum potential profit
    expected_profit: float                # Probability-weighted expected value
    
    # Decision support
    scenarios_passed: int                 # How many scenarios remain profitable
    scenarios_total: int
    robustness_score: float               # scenarios_passed / scenarios_total
    recommendation_holds: bool            # Does BID recommendation survive stress test?


def run_sensitivity_analysis(
    arv: float,
    repairs: float,
    hold_months: int,
    judgment_amount: float,
    calculate_max_bid_fn  # Layer 8 protected function passed in
) -> SensitivityAnalysis:
    """
    Run standard sensitivity scenarios.
    
    NOTE: calculate_max_bid_fn is the Layer 8 protected formula.
    It's passed in as a parameter to avoid exposing the formula here.
    """
    
    scenarios = []
    min_roi_threshold = 0.15  # 15% minimum acceptable ROI
    
    # Define scenario parameters: (name, arv_mult, repair_mult, hold_add)
    scenario_params = [
        ("Base Case", 1.0, 1.0, 0),
        ("ARV -10%", 0.9, 1.0, 0),
        ("ARV -20%", 0.8, 1.0, 0),
        ("Repairs +20%", 1.0, 1.2, 0),
        ("Repairs +50%", 1.0, 1.5, 0),
        ("Hold +3mo", 1.0, 1.0, 3),
        ("Hold +6mo", 1.0, 1.0, 6),
        ("Moderate Stress", 0.9, 1.2, 3),
        ("Worst Case", 0.8, 1.5, 6),
    ]
    
    for name, arv_mult, repair_mult, hold_add in scenario_params:
        adj_arv = arv * arv_mult
        adj_repairs = repairs * repair_mult
        adj_hold = hold_months + hold_add
        
        # Call protected Layer 8 function
        result = calculate_max_bid_fn(adj_arv, adj_repairs, judgment_amount)
        max_bid = result["max_bid"]
        profit = result["projected_profit"]
        roi = result["roi_percentage"]
        
        scenarios.append(ScenarioResult(
            scenario_name=name,
            description=f"ARV×{arv_mult}, Repairs×{repair_mult}, Hold+{hold_add}mo",
            adjusted_arv=adj_arv,
            adjusted_repairs=adj_repairs,
            adjusted_hold_months=adj_hold,
            resulting_max_bid=max_bid,
            resulting_roi=roi,
            resulting_profit=profit,
            is_still_viable=roi >= min_roi_threshold
        ))
    
    # Calculate summaries
    profits = [s["resulting_profit"] for s in scenarios]
    viable_count = sum(1 for s in scenarios if s["is_still_viable"])
    
    # Binary search for break-even ARV (simplified)
    # In production, use scipy.optimize
    break_even_arv = arv * 0.7  # Placeholder
    break_even_repairs = repairs * 2.0  # Placeholder
    
    return SensitivityAnalysis(
        scenarios=scenarios,
        break_even_arv=break_even_arv,
        break_even_repairs=break_even_repairs,
        max_hold_months_viable=hold_months + 9,  # Placeholder
        worst_case_loss=min(profits),
        best_case_profit=max(profits),
        expected_profit=sum(profits) / len(profits),  # Simple average
        scenarios_passed=viable_count,
        scenarios_total=len(scenarios),
        robustness_score=viable_count / len(scenarios),
        recommendation_holds=viable_count >= 6  # At least 6/9 scenarios pass
    )


# =============================================================================
# NEW IN V2: STATE CHECKPOINTING
# =============================================================================

class StateCheckpoint(TypedDict):
    """
    Snapshot for crash recovery during long-running pipelines.
    Allows resuming from last stable point instead of reprocessing.
    """
    checkpoint_id: str                    # Unique ID
    stage: str                            # Pipeline stage at checkpoint
    timestamp: datetime
    state_hash: str                       # SHA256 of critical state fields
    run_id: str                           # Parent run ID
    
    # Recovery info
    can_resume_from: bool                 # Is this a valid resume point?
    resume_stage: str                     # Stage to resume at
    resume_instructions: Optional[str]    # Any special handling needed
    
    # State snapshot (serialized critical fields only)
    identifiers_snapshot: dict
    auction_snapshot: Optional[dict]
    cost_snapshot: dict                   # tokens, cost at this point
    
    # Metadata
    agents_completed: list[str]
    agents_pending: list[str]
    errors_at_checkpoint: int


def create_checkpoint(
    state: "BrevardBidderState",
    checkpoint_id: Optional[str] = None
) -> StateCheckpoint:
    """
    Create a checkpoint from current state.
    Only captures essential fields to minimize storage.
    """
    from uuid import uuid4
    
    # Create hash of critical fields for integrity check
    critical_data = {
        "run_id": state["run_id"],
        "case_number": state["identifiers"]["case_number"],
        "stage": state["current_stage"],
        "total_cost": state["total_cost_usd"]
    }
    state_hash = hashlib.sha256(
        json.dumps(critical_data, default=str).encode()
    ).hexdigest()[:16]
    
    # Determine completed agents
    completed = []
    pending = []
    
    if state["tier1_outputs"]:
        for agent, output in state["tier1_outputs"].items():
            if output and output.get("status") == AgentStatus.COMPLETED:
                completed.append(agent)
            else:
                pending.append(agent)
    
    if state["tier2_outputs"]:
        for agent, output in state["tier2_outputs"].items():
            if output and output.get("status") == AgentStatus.COMPLETED:
                completed.append(agent)
            else:
                pending.append(agent)
    
    return StateCheckpoint(
        checkpoint_id=checkpoint_id or str(uuid4())[:8],
        stage=state["current_stage"],
        timestamp=datetime.now(),
        state_hash=state_hash,
        run_id=state["run_id"],
        can_resume_from=True,
        resume_stage=state["current_stage"],
        resume_instructions=None,
        identifiers_snapshot=dict(state["identifiers"]),
        auction_snapshot=dict(state["auction"]) if state["auction"] else None,
        cost_snapshot={
            "total_tokens": state["total_tokens"],
            "total_cost_usd": state["total_cost_usd"],
            "free_tier_percentage": state["free_tier_percentage"]
        },
        agents_completed=completed,
        agents_pending=pending,
        errors_at_checkpoint=len(state["errors"])
    )


def can_resume_from_checkpoint(
    checkpoint: StateCheckpoint,
    max_age_hours: float = 24.0
) -> tuple[bool, str]:
    """
    Determine if a checkpoint is valid for resumption.
    Returns (can_resume, reason)
    """
    now = datetime.now()
    age_hours = (now - checkpoint["timestamp"]).total_seconds() / 3600
    
    if age_hours > max_age_hours:
        return (False, f"Checkpoint too old: {age_hours:.1f}h (max: {max_age_hours}h)")
    
    if not checkpoint["can_resume_from"]:
        return (False, "Checkpoint marked as non-resumable")
    
    return (True, f"Valid checkpoint from {checkpoint['stage']} stage")


# =============================================================================
# NESTED STATE COMPONENTS (unchanged from V1)
# =============================================================================

class PropertyIdentifiers(TypedDict):
    """Core property identifiers from multiple sources"""
    case_number: str
    parcel_id: Optional[str]
    realforeclose_id: Optional[str]
    address: str
    city: str
    zip_code: str
    county: Literal["Brevard"]


class AuctionInfo(TypedDict):
    """Auction-specific data from RealForeclose"""
    auction_date: datetime
    auction_type: Literal["foreclosure", "tax_deed"]
    opening_bid: float
    judgment_amount: Optional[float]
    plaintiff: str
    defendant: str
    attorney: Optional[str]
    sale_status: Literal["scheduled", "cancelled", "sold", "postponed"]


class PropertyDetails(TypedDict):
    """Physical property characteristics from BCPAO"""
    property_type: Literal["SFR", "condo", "townhouse", "multi_family", "land", "commercial"]
    bedrooms: Optional[int]
    bathrooms: Optional[float]
    sqft_living: Optional[int]
    sqft_lot: Optional[int]
    year_built: Optional[int]
    pool: bool
    garage: bool
    assessed_value: Optional[float]
    market_value: Optional[float]
    photo_urls: list[str]


class LienRecord(TypedDict):
    """Individual lien from AcclaimWeb/BECA scraper"""
    lien_type: LienType
    recorded_date: datetime
    amount: float
    holder: str
    instrument_number: str
    book_page: Optional[str]
    position: int
    survives_foreclosure: bool


class TitleSearchResult(TypedDict):
    """Aggregated title search from BECA + AcclaimWeb"""
    liens: list[LienRecord]
    total_lien_amount: float
    senior_lien_amount: float
    junior_lien_amount: float
    title_issues: list[str]
    beca_verified: bool
    search_timestamp: datetime


class TaxCertificateInfo(TypedDict):
    """Tax certificate data from RealTDM"""
    has_certificates: bool
    certificates: list[dict]
    total_amount_due: float
    oldest_cert_year: Optional[int]
    redemption_deadline: Optional[datetime]


class DemographicsData(TypedDict):
    """Census API neighborhood data"""
    zip_code: str
    median_income: float
    vacancy_rate: float
    owner_occupied_rate: float
    population_density: float
    crime_index: Optional[float]
    school_rating: Optional[float]
    target_zip: bool


class ComparableProperty(TypedDict):
    """Individual comp from BCPAO/MLS"""
    address: str
    sale_date: datetime
    sale_price: float
    sqft: int
    price_per_sqft: float
    distance_miles: float
    days_on_market: Optional[int]
    condition: Literal["distressed", "average", "updated", "renovated"]



# =============================================================================
# NEW IN V14.5.0: CMA ENRICHMENT DATA
# =============================================================================

class CMASourceData(TypedDict):
    """Data from a single CMA source (Zillow/Redfin/BCPAO)."""
    estimated_value: Optional[float]
    zestimate: Optional[float]           # Zillow-specific
    redfin_estimate: Optional[float]     # Redfin-specific
    rent_estimate: Optional[float]
    price_per_sqft: Optional[float]
    last_sold_price: Optional[float]
    last_sold_date: Optional[str]


class CMAComparable(TypedDict):
    """Comparable sale from Zillow or Redfin."""
    address: str
    city: str
    zip_code: str
    sold_price: float
    sold_date: str
    beds: int
    baths: float
    sqft: int
    price_per_sqft: Optional[float]
    source: str  # "zillow" or "redfin"
    url: Optional[str]


class CMAEnrichmentResult(TypedDict):
    """Aggregated CMA result from multiple sources."""
    arv_estimated: float
    arv_confidence: float  # 0-100 percentage
    arv_low: float
    arv_high: float
    sources_used: list[str]  # ["zillow", "redfin", "bcpao"]
    comp_avg_price: Optional[float]
    comp_avg_price_per_sqft: Optional[float]
    bcpao_assessment: Optional[float]
    warning: Optional[str]


class CMAEnrichmentData(TypedDict):
    """
    V14.5.0: CMA Enrichment from Zillow + Redfin + BCPAO.
    
    Provides multi-source valuation data for more accurate ARV.
    """
    result: Optional[CMAEnrichmentResult]
    zillow: Optional[CMASourceData]
    redfin: Optional[CMASourceData]
    comparables: list[CMAComparable]
    fetched_at: str



class ValuationResult(TypedDict):
    """Valuation analysis output"""
    arv: float
    as_is_value: float
    estimated_repairs: float
    repair_confidence: Literal["low", "medium", "high"]
    comps_used: list[ComparableProperty]
    comps_count: int
    price_per_sqft_avg: float
    valuation_method: Literal["comp_analysis", "ml_model", "hybrid"]
    confidence_score: float




# =============================================================================
# NEW IN V14.5.0: CMA ENRICHMENT DATA (Zillow + Redfin)
# =============================================================================

class CMAValuationSource(TypedDict):
    """Valuation data from a single source (Zillow, Redfin, BCPAO)."""
    source: Literal["zillow", "redfin", "bcpao", "estimate"]
    estimated_value: Optional[float]
    zestimate: Optional[float]           # Zillow-specific
    redfin_estimate: Optional[float]     # Redfin-specific
    price_per_sqft: Optional[float]
    last_sold_price: Optional[float]
    last_sold_date: Optional[str]
    rent_estimate: Optional[float]
    tax_assessment: Optional[float]
    fetched_at: str


class CMAComparable(TypedDict):
    """Comparable sale from Zillow or Redfin."""
    address: str
    city: str
    zip_code: str
    sold_price: float
    sold_date: str
    beds: int
    baths: float
    sqft: int
    price_per_sqft: Optional[float]
    distance_miles: Optional[float]
    source: Literal["zillow", "redfin", "bcpao", "placeholder"]
    url: Optional[str]


class CMAEnrichmentResult(TypedDict):
    """Aggregated CMA result with multi-source valuations."""
    arv_estimated: Optional[float]
    arv_confidence: Optional[float]      # 0-100 percentage
    arv_low: Optional[float]
    arv_high: Optional[float]
    sources_used: list[str]
    comp_avg_price: Optional[float]
    comp_avg_price_per_sqft: Optional[float]
    bcpao_assessment: Optional[float]
    warning: Optional[str]


class CMAEnrichmentData(TypedDict):
    """Complete CMA enrichment data from Zillow + Redfin agents."""
    result: Optional[CMAEnrichmentResult]
    zillow: Optional[CMAValuationSource]
    redfin: Optional[CMAValuationSource]
    comparables: list[CMAComparable]
    fetched_at: str


class MLPrediction(TypedDict):
    """XGBoost model predictions"""
    third_party_purchase_prob: float
    predicted_sale_price: Optional[float]
    risk_score: float
    feature_importance: dict[str, float]
    model_version: str


class RiskAssessment(TypedDict):
    """Risk analysis output"""
    overall_risk: Literal["low", "medium", "high", "critical"]
    risk_factors: list[str]
    red_flags: list[str]
    green_flags: list[str]
    fraud_indicators: list[str]
    legal_concerns: list[str]


# =============================================================================
# AGENT OUTPUT STATES
# =============================================================================

class AgentOutput(TypedDict):
    """Standard output wrapper for all agents"""
    agent_name: str
    tier: AgentTier
    status: AgentStatus
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    duration_seconds: Optional[float]
    llm_tier_used: Literal["FREE", "ULTRA_CHEAP", "BUDGET", "PRODUCTION", "CRITICAL"]
    tokens_used: int
    cost_usd: float
    error_message: Optional[str]


class Tier1Outputs(TypedDict):
    """Discovery Tier agent outputs"""
    property_scout: AgentOutput
    document_parser: AgentOutput
    change_detector: AgentOutput


class Tier2Outputs(TypedDict):
    """Analysis Tier agent outputs"""
    valuation_agent: AgentOutput
    title_agent: AgentOutput
    market_agent: AgentOutput
    risk_agent: AgentOutput
    comp_agent: AgentOutput


class Tier3Outputs(TypedDict):
    """Execution Tier agent outputs"""
    strategy_agent: AgentOutput
    bid_agent: AgentOutput
    report_agent: AgentOutput


# =============================================================================
# HUMAN-IN-THE-LOOP
# =============================================================================

class HITLCheckpoint(TypedDict):
    """Human-in-the-loop approval checkpoint"""
    checkpoint_id: str
    checkpoint_type: Literal["bid_approval", "strategy_override", "risk_override", "manual_review"]
    requires_approval: bool
    approved: Optional[bool]
    approved_by: Optional[str]
    approved_at: Optional[datetime]
    notes: Optional[str]
    timeout_minutes: int
    auto_action_on_timeout: Literal["approve", "reject", "skip"]


# =============================================================================
# DECISION & RECOMMENDATION
# =============================================================================

class BidCalculation(TypedDict):
    """
    Bid calculation result.
    NOTE: Actual formula computed in protected Layer 8 module.
    This only stores the RESULT.
    """
    max_bid: float
    bid_judgment_ratio: float
    margin_of_safety: float
    exit_strategy: ExitStrategy
    projected_profit: float
    roi_percentage: float
    hold_period_months: int


class FinalRecommendation(TypedDict):
    """Final agent recommendation"""
    recommendation: Recommendation
    confidence: float
    primary_reasons: list[str]
    concerns: list[str]
    suggested_max_bid: Optional[float]
    requires_hitl: bool
    hitl_reason: Optional[str]
    # NEW IN V2: Link to sensitivity analysis
    sensitivity_passed: bool              # Did recommendation survive stress test?
    robustness_score: float               # From SensitivityAnalysis


# =============================================================================
# MAIN GRAPH STATE (V2)
# =============================================================================

class BrevardBidderState(TypedDict):
    """
    Master state object for LangGraph orchestration.
    
    V2 ADDITIONS:
    - errors: Now list[StructuredError] instead of list[str]
    - data_freshness: Track scrape timestamps and staleness
    - sensitivity: Separate what-if analysis results
    - checkpoints: Recovery snapshots
    """
    
    # --- RUN METADATA ---
    run_id: str
    pipeline_version: Literal["V13.4.0"]
    started_at: datetime
    completed_at: Optional[datetime]
    current_stage: Literal[
        "discovery", "scraping", "title_search", "lien_priority",
        "tax_certificates", "demographics", "ml_score", "max_bid",
        "decision_log", "report", "disposition", "archive"
    ]
    
    # --- PROPERTY DATA ---
    identifiers: PropertyIdentifiers
    auction: Optional[AuctionInfo]
    details: Optional[PropertyDetails]
    title: Optional[TitleSearchResult]
    tax_certs: Optional[TaxCertificateInfo]
    demographics: Optional[DemographicsData]
    
    # --- ANALYSIS RESULTS ---
    cma_enrichment: Optional[CMAEnrichmentData]  # NEW V14.5.0
    valuation: Optional[ValuationResult]
    cma_enrichment: Optional[CMAEnrichmentData]  # NEW V14.5.0: Zillow + Redfin data
    comps: Annotated[list[ComparableProperty], operator.add]
    ml_prediction: Optional[MLPrediction]
    risk: Optional[RiskAssessment]
    
    # --- DECISION ---
    bid_calc: Optional[BidCalculation]
    sensitivity: Optional[SensitivityAnalysis]    # NEW IN V2
    recommendation: Optional[FinalRecommendation]
    
    # --- AGENT TRACKING ---
    tier1_outputs: Optional[Tier1Outputs]
    tier2_outputs: Optional[Tier2Outputs]
    tier3_outputs: Optional[Tier3Outputs]
    
    # --- HUMAN-IN-THE-LOOP ---
    hitl_checkpoints: Annotated[list[HITLCheckpoint], operator.add]
    pending_approval: bool
    
    # --- V2: ENHANCED ERROR TRACKING ---
    errors: Annotated[list[StructuredError], operator.add]  # CHANGED IN V2
    warnings: Annotated[list[str], operator.add]
    decision_log: Annotated[list[str], operator.add]
    
    # --- V2: DATA FRESHNESS ---
    data_freshness: DataFreshness                 # NEW IN V2
    
    # --- V2: STATE CHECKPOINTS ---
    checkpoints: Annotated[list[StateCheckpoint], operator.add]  # NEW IN V2
    last_valid_checkpoint_id: Optional[str]       # NEW IN V2
    
    # --- COST TRACKING ---
    total_tokens: int
    total_cost_usd: float
    free_tier_percentage: float
    
    # --- OUTPUT ---
    report_path: Optional[str]
    supabase_synced: bool


# =============================================================================
# INITIAL STATE FACTORY (V2)
# =============================================================================

def create_initial_state(
    case_number: str,
    address: str,
    city: str = "Unknown",
    zip_code: str = "00000",
    is_auction_day: bool = False
) -> BrevardBidderState:
    """
    Factory function to create initial state for a new property analysis.
    
    V2: Added is_auction_day parameter for stricter freshness rules.
    
    Usage:
        state = create_initial_state(
            case_number="05-2024-CA-012345",
            address="123 Main St",
            city="Melbourne",
            zip_code="32940",
            is_auction_day=True
        )
    """
    from uuid import uuid4
    
    return BrevardBidderState(
        # Run metadata
        run_id=str(uuid4()),
        pipeline_version="V13.4.0",
        started_at=datetime.now(),
        completed_at=None,
        current_stage="discovery",
        
        # Property data
        identifiers=PropertyIdentifiers(
            case_number=case_number,
            parcel_id=None,
            realforeclose_id=None,
            address=address,
            city=city,
            zip_code=zip_code,
            county="Brevard"
        ),
        auction=None,
        details=None,
        title=None,
        tax_certs=None,
        demographics=None,
        
        # Analysis results
        valuation=None,
        comps=[],
        ml_prediction=None,
        risk=None,
        
        # Decision
        bid_calc=None,
        sensitivity=None,  # NEW IN V2
        recommendation=None,
        
        # Agent tracking
        tier1_outputs=None,
        tier2_outputs=None,
        tier3_outputs=None,
        
        # HITL
        hitl_checkpoints=[],
        pending_approval=False,
        
        # V2: Enhanced errors
        errors=[],
        warnings=[],
        decision_log=[],
        
        # V2: Data freshness
        data_freshness=create_data_freshness(is_auction_day=is_auction_day),
        
        # V2: Checkpoints
        checkpoints=[],
        last_valid_checkpoint_id=None,
        
        # Cost
        total_tokens=0,
        total_cost_usd=0.0,
        free_tier_percentage=0.0,
        
        # Output
        report_path=None,
        supabase_synced=False
    )


# =============================================================================
# STATE REDUCERS (V2 Enhanced)
# =============================================================================

def add_decision_log(state: BrevardBidderState, message: str) -> dict:
    """Append to decision log with timestamp"""
    timestamp = datetime.now().isoformat()
    return {"decision_log": [f"[{timestamp}] {message}"]}


def add_error_v2(
    state: BrevardBidderState,
    agent_name: str,
    message: str,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    exception: Optional[Exception] = None,
    context: Optional[dict] = None
) -> dict:
    """
    V2: Add structured error instead of simple string.
    """
    error = create_structured_error(
        agent_name=agent_name,
        stage=state["current_stage"],
        message=message,
        severity=severity,
        exception=exception,
        context=context
    )
    return {"errors": [error]}


def add_checkpoint(state: BrevardBidderState) -> dict:
    """Create and add a checkpoint at current state"""
    checkpoint = create_checkpoint(state)
    return {
        "checkpoints": [checkpoint],
        "last_valid_checkpoint_id": checkpoint["checkpoint_id"]
    }


def update_data_freshness(
    state: BrevardBidderState,
    source: str,
    cache_hit: bool = False
) -> dict:
    """Update freshness timestamp for a data source"""
    freshness = dict(state["data_freshness"])
    
    timestamp_key = f"{source}_scraped_at"
    if timestamp_key in freshness:
        freshness[timestamp_key] = datetime.now()
    
    cache_key = f"{source}_cache_hit"
    if cache_key in freshness:
        freshness[cache_key] = cache_hit
    
    # Check freshness and update warnings
    is_fresh, warnings = check_data_freshness(freshness)
    freshness["stale_data_warnings"] = warnings
    freshness["has_stale_critical_data"] = not is_fresh
    
    return {"data_freshness": freshness}


def update_cost_tracking(
    state: BrevardBidderState,
    tokens: int,
    cost: float,
    was_free: bool
) -> dict:
    """Update cumulative cost tracking"""
    new_total_tokens = state["total_tokens"] + tokens
    new_total_cost = state["total_cost_usd"] + cost
    
    free_pct = state["free_tier_percentage"]
    if was_free and new_total_tokens > 0:
        free_pct = (free_pct * state["total_tokens"] + 100 * tokens) / new_total_tokens
    elif new_total_tokens > 0:
        free_pct = (free_pct * state["total_tokens"]) / new_total_tokens
    
    return {
        "total_tokens": new_total_tokens,
        "total_cost_usd": new_total_cost,
        "free_tier_percentage": free_pct
    }


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def calculate_pipeline_progress(state: BrevardBidderState) -> float:
    """Calculate completion percentage"""
    stages = [
        "discovery", "scraping", "title_search", "lien_priority",
        "tax_certificates", "demographics", "ml_score", "max_bid",
        "decision_log", "report", "disposition", "archive"
    ]
    current_idx = stages.index(state["current_stage"])
    return (current_idx + 1) / len(stages) * 100


def get_critical_errors(state: BrevardBidderState) -> list[StructuredError]:
    """Extract only critical and error-level issues"""
    return [
        e for e in state["errors"]
        if e["severity"] in [ErrorSeverity.ERROR, ErrorSeverity.CRITICAL]
    ]


def is_state_valid_for_bidding(state: BrevardBidderState) -> tuple[bool, list[str]]:
    """Validate state has minimum required data for bid calculation"""
    missing = []
    
    if not state["valuation"]:
        missing.append("Valuation analysis")
    if not state["title"]:
        missing.append("Title search")
    if not state["details"] or not state["details"].get("sqft_living"):
        missing.append("Property square footage")
    if not state["auction"] or not state["auction"].get("judgment_amount"):
        missing.append("Judgment amount")
    
    # V2: Check data freshness
    if state["data_freshness"]["has_stale_critical_data"]:
        missing.append("Fresh data (critical sources are stale)")
    
    return (len(missing) == 0, missing)


def should_create_checkpoint(state: BrevardBidderState) -> bool:
    """Determine if current state warrants a checkpoint"""
    checkpoint_stages = [
        "title_search",    # After expensive BECA scraping
        "ml_score",        # After ML prediction
        "max_bid",         # Before final decision
    ]
    return state["current_stage"] in checkpoint_stages


# =============================================================================
# TYPE EXPORTS
# =============================================================================

__all__ = [
    # Main state
    "BrevardBidderState",
    "create_initial_state",
    
    # V2 additions
    "StructuredError",
    "ErrorSeverity",
    "create_structured_error",
    "DataFreshness",
    "create_data_freshness",
    "check_data_freshness",
    "SensitivityAnalysis",
    "ScenarioResult",
    "run_sensitivity_analysis",
    "StateCheckpoint",
    "create_checkpoint",
    "can_resume_from_checkpoint",
    
    # Enums
    "AgentTier",
    "AgentStatus",
    "Recommendation",
    "LienType",
    "ExitStrategy",
    
    # Nested types
    "PropertyIdentifiers",
    "AuctionInfo",
    "PropertyDetails",
    "LienRecord",
    "TitleSearchResult",
    "TaxCertificateInfo",
    "DemographicsData",
    "ComparableProperty",
    "ValuationResult",
    "MLPrediction",
    "RiskAssessment",
    "AgentOutput",
    "Tier1Outputs",
    "Tier2Outputs",
    "Tier3Outputs",
    "HITLCheckpoint",
    "BidCalculation",
    "FinalRecommendation",
    
    # Reducers
    "add_decision_log",
    "add_error_v2",
    "add_checkpoint",
    "update_data_freshness",
    "update_cost_tracking",
    
    # Utilities
    "calculate_pipeline_progress",
    "get_critical_errors",
    "is_state_valid_for_bidding",
    "should_create_checkpoint",
]
