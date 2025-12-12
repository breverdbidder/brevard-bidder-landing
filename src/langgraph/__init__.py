"""
The Everest Ascent™ LangGraph Implementation
============================================

This module contains the LangGraph state definitions and pipeline
implementation for The Everest Ascent™ 12-stage methodology.

© 2025 Everest Capital USA. All rights reserved.
"""

from .everest_ascent_state import (
    # Main state
    EverestAscentState,
    
    # Enums
    Recommendation,
    PipelinePhase,
    StageStatus,
    
    # Data classes
    DiscoveryResult,
    BECAData,
    TitleRecord,
    TitleSearchResult,
    Lien,
    LienPriorityResult,
    TaxCertificate,
    TaxCertResult,
    DemographicsResult,
    MLPrediction,
    MaxBidCalculation,
    DecisionFactor,
    DecisionLogEntry,
    ReportOutput,
    ExitStrategy,
    DispositionResult,
    ArchiveEntry,
    
    # Helper functions
    create_initial_state,
    get_phase_for_stage,
    get_stage_brand,
    is_flagship_stage
)

__version__ = "1.0.0"
__all__ = [
    "EverestAscentState",
    "Recommendation",
    "PipelinePhase",
    "StageStatus",
    "create_initial_state",
    "get_phase_for_stage",
    "get_stage_brand",
    "is_flagship_stage"
]
