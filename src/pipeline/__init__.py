"""
BidDeed.AI Pipeline Module
Version: 13.5.0

12-Stage Pipeline + Title Risk Score (Stage 13)
"""

from .title_risk_score import (
    TitleRiskScorer,
    TitleRiskResult,
    RiskLevel,
    RiskCategory,
    BidRecommendation,
    RiskItem,
    MunicipalLienFlag,
    calculate_adjusted_max_bid,
    RISK_WEIGHTS,
    MUNICIPALITY_MAP,
    MUNICIPAL_CONTACTS,
    CONDITION_CONTINGENCIES
)

from .municipal_lien_search import (
    MunicipalLienSearcher,
    MunicipalContact,
    check_municipal_liens,
    MUNICIPAL_CONTACTS_DB,
    ZIP_MUNICIPALITY_MAP,
    LIEN_TYPES
)

__version__ = "13.5.0"
__all__ = [
    # Title Risk Score
    "TitleRiskScorer",
    "TitleRiskResult",
    "RiskLevel",
    "RiskCategory", 
    "BidRecommendation",
    "RiskItem",
    "MunicipalLienFlag",
    "calculate_adjusted_max_bid",
    "RISK_WEIGHTS",
    "MUNICIPALITY_MAP",
    "MUNICIPAL_CONTACTS",
    "CONDITION_CONTINGENCIES",
    
    # Municipal Lien Search
    "MunicipalLienSearcher",
    "MunicipalContact",
    "check_municipal_liens",
    "MUNICIPAL_CONTACTS_DB",
    "ZIP_MUNICIPALITY_MAP",
    "LIEN_TYPES",
]
