"""
BidDeed.AI V13.4.0 — Core Package
======================================
Layer 8 IP Protected Modules

SECURITY NOTE:
This package contains proprietary business logic protected under Layer 8 IP Protection.
In production, these modules are encrypted with AES-256.

Modules:
- layer8_bid_calculator: Max bid formula
- layer8_lien_analyzer: Lien priority analysis
"""

from .layer8_bid_calculator import (
    calculate_max_bid,
    calculate_max_bid_with_sensitivity,
    BidCalculationResult,
)

from .layer8_lien_analyzer import (
    analyze_lien_priority,
    determine_surviving_liens,
    LienPriorityResult,
)

__all__ = [
    "calculate_max_bid",
    "calculate_max_bid_with_sensitivity",
    "BidCalculationResult",
    "analyze_lien_priority",
    "determine_surviving_liens",
    "LienPriorityResult",
]
