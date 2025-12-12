"""
BidDeed.AI V13.4.0 — Agents Package
=========================================
11 Agents | 3 Tiers | LangGraph Orchestration

Usage:
    from agents import run_property_analysis, create_initial_state
    
    result = await run_property_analysis(
        case_number="05-2024-CA-012345",
        address="123 Ocean Ave",
        city="Melbourne",
        zip_code="32940"
    )
"""

from .state import (
    # Main state
    BrevardBidderState,
    create_initial_state,
    
    # V2 additions
    StructuredError,
    ErrorSeverity,
    create_structured_error,
    DataFreshness,
    create_data_freshness,
    check_data_freshness,
    SensitivityAnalysis,
    ScenarioResult,
    StateCheckpoint,
    create_checkpoint,
    can_resume_from_checkpoint,
    
    # Enums
    AgentTier,
    AgentStatus,
    Recommendation,
    LienType,
    ExitStrategy,
    
    # Nested types
    PropertyIdentifiers,
    AuctionInfo,
    PropertyDetails,
    LienRecord,
    TitleSearchResult,
    TaxCertificateInfo,
    DemographicsData,
    ComparableProperty,
    ValuationResult,
    MLPrediction,
    RiskAssessment,
    AgentOutput,
    Tier1Outputs,
    Tier2Outputs,
    Tier3Outputs,
    HITLCheckpoint,
    BidCalculation,
    FinalRecommendation,
)

from .orchestrator import (
    run_property_analysis,
    build_biddeed_graph,
    compile_graph,
    SmartRouter,
)

__version__ = "13.4.0"

__all__ = [
    # Main entry points
    "run_property_analysis",
    "build_biddeed_graph",
    "compile_graph",
    "create_initial_state",
    "SmartRouter",
    
    # State types
    "BrevardBidderState",
    "StructuredError",
    "ErrorSeverity",
    "DataFreshness",
    "SensitivityAnalysis",
    "ScenarioResult",
    "StateCheckpoint",
    
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
    "HITLCheckpoint",
    "BidCalculation",
    "FinalRecommendation",
]
