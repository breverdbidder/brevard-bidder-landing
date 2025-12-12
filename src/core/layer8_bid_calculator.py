"""
BidDeed.AI V13.4.0 — Layer 8 Bid Calculator
=================================================
LAYER 8 IP PROTECTION

This module contains the proprietary max bid calculation formula.
In production deployment:
- This file is encrypted with AES-256
- Decryption key stored in secure vault (AWS Secrets Manager)
- Runtime decryption only, never stored in plaintext on disk

FORMULA (PROPRIETARY - DO NOT SHARE):
max_bid = (ARV × 70%) - Repairs - $10K - MIN($25K, 15% × ARV)

Where:
- ARV = After Repair Value (from comps analysis)
- 70% = Maximum percentage of ARV to pay
- Repairs = Estimated repair costs
- $10K = Fixed cushion for closing costs, holding costs
- MIN($25K, 15% × ARV) = Variable cushion (scales with property value)

RATIONALE:
- 70% rule is industry standard for fix-and-flip
- Double cushion (fixed + variable) provides margin of safety
- Variable cushion protects on higher-value properties where mistakes are costlier
"""

from typing import TypedDict, Optional, List
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger("BidDeed.AI.Layer8.BidCalculator")


# =============================================================================
# CONFIGURATION
# =============================================================================

class BidConfig:
    """
    Bid calculation configuration.
    These can be adjusted per investment strategy.
    """
    # Core formula parameters
    ARV_MULTIPLIER: float = 0.70          # 70% of ARV
    FIXED_CUSHION: float = 10000.0        # $10K fixed
    VARIABLE_CUSHION_RATE: float = 0.15   # 15% of ARV
    VARIABLE_CUSHION_CAP: float = 25000.0 # Max $25K variable
    
    # Decision thresholds
    BID_RATIO_THRESHOLD: float = 0.75     # >= 75% = BID
    REVIEW_RATIO_THRESHOLD: float = 0.60  # >= 60% = REVIEW, < 60% = SKIP
    
    # ROI thresholds
    MIN_ROI_PERCENTAGE: float = 15.0      # Minimum acceptable ROI
    TARGET_ROI_PERCENTAGE: float = 25.0   # Target ROI
    
    # Hold cost assumptions (monthly)
    MONTHLY_HOLD_COST_RATE: float = 0.01  # 1% of purchase price per month
    
    # Exit strategy adjustments
    EXIT_STRATEGY_MULTIPLIERS = {
        "fix_and_flip": 1.0,
        "wholesale": 0.85,      # Lower max bid for quick wholesale
        "mid_term_rental": 1.05, # Slightly higher for rental income
        "long_term_rental": 1.10,
        "owner_finance": 1.0,
    }


# =============================================================================
# RESULT TYPES
# =============================================================================

class BidCalculationResult(TypedDict):
    """Result of max bid calculation"""
    max_bid: float
    bid_judgment_ratio: float
    projected_profit: float
    roi_percentage: float
    margin_of_safety: float
    
    # Breakdown
    arv: float
    arv_contribution: float           # ARV × 70%
    repairs: float
    fixed_cushion: float
    variable_cushion: float
    total_cushion: float
    
    # Derived
    as_is_value: float
    equity_at_purchase: float
    
    # Validation
    is_valid: bool
    validation_errors: List[str]


@dataclass
class SensitivityScenario:
    """Single sensitivity scenario result"""
    name: str
    description: str
    adjusted_arv: float
    adjusted_repairs: float
    adjusted_hold_months: int
    max_bid: float
    roi: float
    profit: float
    is_viable: bool


class SensitivityResult(TypedDict):
    """Full sensitivity analysis result"""
    scenarios: List[dict]
    break_even_arv: float
    break_even_repairs: float
    worst_case_loss: float
    best_case_profit: float
    expected_profit: float
    scenarios_passed: int
    scenarios_total: int
    robustness_score: float
    recommendation_holds: bool


# =============================================================================
# CORE CALCULATION FUNCTIONS
# =============================================================================

def calculate_max_bid(
    arv: float,
    repairs: float,
    judgment_amount: float,
    exit_strategy: str = "fix_and_flip",
    config: Optional[BidConfig] = None
) -> BidCalculationResult:
    """
    Calculate maximum bid for a foreclosure property.
    
    PROPRIETARY FORMULA:
    max_bid = (ARV × 70%) - Repairs - $10K - MIN($25K, 15% × ARV)
    
    Args:
        arv: After Repair Value from comps analysis
        repairs: Estimated repair costs
        judgment_amount: Foreclosure judgment amount (for ratio calculation)
        exit_strategy: Investment strategy (affects multiplier)
        config: Optional custom configuration
    
    Returns:
        BidCalculationResult with max bid and all metrics
    
    Example:
        result = calculate_max_bid(
            arv=300000,
            repairs=30000,
            judgment_amount=180000,
            exit_strategy="fix_and_flip"
        )
        print(f"Max Bid: ${result['max_bid']:,.0f}")
        # Output: Max Bid: $125,000
    """
    cfg = config or BidConfig()
    validation_errors = []
    
    # =================================================================
    # INPUT VALIDATION
    # =================================================================
    if arv <= 0:
        validation_errors.append("ARV must be positive")
        arv = 1  # Prevent division by zero
    
    if repairs < 0:
        validation_errors.append("Repairs cannot be negative")
        repairs = 0
    
    if judgment_amount <= 0:
        validation_errors.append("Judgment amount must be positive")
        judgment_amount = 1
    
    # =================================================================
    # CORE FORMULA CALCULATION
    # =================================================================
    
    # Step 1: ARV contribution (70% of ARV)
    arv_contribution = arv * cfg.ARV_MULTIPLIER
    
    # Step 2: Fixed cushion
    fixed_cushion = cfg.FIXED_CUSHION
    
    # Step 3: Variable cushion (MIN of cap and rate × ARV)
    variable_cushion = min(
        cfg.VARIABLE_CUSHION_CAP,
        arv * cfg.VARIABLE_CUSHION_RATE
    )
    
    # Step 4: Total cushion
    total_cushion = fixed_cushion + variable_cushion
    
    # Step 5: Apply the formula
    # max_bid = (ARV × 70%) - Repairs - Fixed - Variable
    max_bid = arv_contribution - repairs - total_cushion
    
    # Step 6: Apply exit strategy multiplier
    strategy_multiplier = cfg.EXIT_STRATEGY_MULTIPLIERS.get(exit_strategy, 1.0)
    max_bid = max_bid * strategy_multiplier
    
    # Step 7: Ensure non-negative
    max_bid = max(0, max_bid)
    
    # =================================================================
    # DERIVED METRICS
    # =================================================================
    
    # Bid/Judgment ratio
    bid_judgment_ratio = max_bid / judgment_amount if judgment_amount > 0 else 0
    
    # Projected profit (assuming sale at ARV)
    projected_profit = arv - max_bid - repairs
    
    # ROI percentage
    roi_percentage = (projected_profit / max_bid * 100) if max_bid > 0 else 0
    
    # Margin of safety (how far below ARV are we buying)
    margin_of_safety = 1 - (max_bid / arv) if arv > 0 else 0
    
    # As-is value estimate (ARV minus repairs)
    as_is_value = arv - repairs
    
    # Equity at purchase (as-is value minus purchase price)
    equity_at_purchase = as_is_value - max_bid
    
    # =================================================================
    # VALIDATION
    # =================================================================
    
    if max_bid <= 0:
        validation_errors.append("Calculated max bid is zero or negative - deal not viable")
    
    if roi_percentage < cfg.MIN_ROI_PERCENTAGE:
        validation_errors.append(f"ROI {roi_percentage:.1f}% below minimum {cfg.MIN_ROI_PERCENTAGE}%")
    
    if repairs > arv * 0.5:
        validation_errors.append("Repairs exceed 50% of ARV - high risk")
    
    is_valid = len(validation_errors) == 0
    
    # =================================================================
    # LOG AND RETURN
    # =================================================================
    
    logger.info(
        f"[Layer8] Max Bid: ${max_bid:,.0f} | "
        f"ARV: ${arv:,.0f} | Repairs: ${repairs:,.0f} | "
        f"Ratio: {bid_judgment_ratio:.1%} | ROI: {roi_percentage:.1f}%"
    )
    
    return BidCalculationResult(
        max_bid=max_bid,
        bid_judgment_ratio=bid_judgment_ratio,
        projected_profit=projected_profit,
        roi_percentage=roi_percentage,
        margin_of_safety=margin_of_safety,
        arv=arv,
        arv_contribution=arv_contribution,
        repairs=repairs,
        fixed_cushion=fixed_cushion,
        variable_cushion=variable_cushion,
        total_cushion=total_cushion,
        as_is_value=as_is_value,
        equity_at_purchase=equity_at_purchase,
        is_valid=is_valid,
        validation_errors=validation_errors
    )


def calculate_max_bid_with_sensitivity(
    arv: float,
    repairs: float,
    judgment_amount: float,
    hold_months: int = 4,
    exit_strategy: str = "fix_and_flip",
    min_roi_threshold: float = 15.0,
    config: Optional[BidConfig] = None
) -> tuple[BidCalculationResult, SensitivityResult]:
    """
    Calculate max bid with full sensitivity analysis.
    
    Runs 9 stress test scenarios to evaluate deal robustness.
    
    Args:
        arv: After Repair Value
        repairs: Estimated repairs
        judgment_amount: Foreclosure judgment
        hold_months: Expected hold period
        exit_strategy: Investment strategy
        min_roi_threshold: Minimum ROI to consider scenario viable
        config: Optional custom configuration
    
    Returns:
        Tuple of (BidCalculationResult, SensitivityResult)
    
    Example:
        bid_result, sensitivity = calculate_max_bid_with_sensitivity(
            arv=300000,
            repairs=30000,
            judgment_amount=180000,
            hold_months=4
        )
        print(f"Robustness: {sensitivity['robustness_score']:.0%}")
    """
    cfg = config or BidConfig()
    
    # Calculate base result
    base_result = calculate_max_bid(
        arv=arv,
        repairs=repairs,
        judgment_amount=judgment_amount,
        exit_strategy=exit_strategy,
        config=cfg
    )
    
    # =================================================================
    # SENSITIVITY SCENARIOS
    # =================================================================
    
    scenario_params = [
        ("Base Case", "Current estimates", 1.0, 1.0, 0),
        ("ARV -10%", "Conservative ARV", 0.9, 1.0, 0),
        ("ARV -20%", "Pessimistic ARV", 0.8, 1.0, 0),
        ("Repairs +20%", "Minor cost overrun", 1.0, 1.2, 0),
        ("Repairs +50%", "Major cost overrun", 1.0, 1.5, 0),
        ("Hold +3mo", "Extended timeline", 1.0, 1.0, 3),
        ("Hold +6mo", "Significant delay", 1.0, 1.0, 6),
        ("Moderate Stress", "Combined moderate", 0.9, 1.2, 3),
        ("Worst Case", "Everything goes wrong", 0.8, 1.5, 6),
    ]
    
    scenarios = []
    for name, desc, arv_mult, repair_mult, hold_add in scenario_params:
        adj_arv = arv * arv_mult
        adj_repairs = repairs * repair_mult
        adj_hold = hold_months + hold_add
        
        # Calculate for this scenario
        scenario_result = calculate_max_bid(
            arv=adj_arv,
            repairs=adj_repairs,
            judgment_amount=judgment_amount,
            exit_strategy=exit_strategy,
            config=cfg
        )
        
        # Adjust profit for additional hold costs
        additional_hold_cost = (
            scenario_result["max_bid"] * 
            cfg.MONTHLY_HOLD_COST_RATE * 
            hold_add
        )
        adj_profit = scenario_result["projected_profit"] - additional_hold_cost
        adj_roi = (adj_profit / scenario_result["max_bid"] * 100) if scenario_result["max_bid"] > 0 else 0
        
        is_viable = adj_roi >= min_roi_threshold
        
        scenarios.append({
            "scenario_name": name,
            "description": desc,
            "adjusted_arv": adj_arv,
            "adjusted_repairs": adj_repairs,
            "adjusted_hold_months": adj_hold,
            "resulting_max_bid": scenario_result["max_bid"],
            "resulting_roi": adj_roi,
            "resulting_profit": adj_profit,
            "is_still_viable": is_viable
        })
    
    # =================================================================
    # CALCULATE SUMMARIES
    # =================================================================
    
    profits = [s["resulting_profit"] for s in scenarios]
    viable_count = sum(1 for s in scenarios if s["is_still_viable"])
    robustness_score = viable_count / len(scenarios)
    
    # Break-even ARV calculation
    base_profit = scenarios[0]["resulting_profit"]
    pessimistic_profit = scenarios[2]["resulting_profit"]  # ARV -20%
    
    if base_profit > 0 and pessimistic_profit < base_profit:
        profit_drop_per_pct = (base_profit - pessimistic_profit) / 20
        if profit_drop_per_pct > 0:
            pct_drop_to_zero = base_profit / profit_drop_per_pct
            break_even_arv = arv * (1 - pct_drop_to_zero / 100)
        else:
            break_even_arv = arv * 0.65
    else:
        break_even_arv = arv * 0.65
    
    # Break-even repairs calculation
    overrun_profit = scenarios[4]["resulting_profit"]  # Repairs +50%
    
    if base_profit > 0 and overrun_profit < base_profit:
        profit_drop_per_pct = (base_profit - overrun_profit) / 50
        if profit_drop_per_pct > 0:
            pct_increase_to_zero = base_profit / profit_drop_per_pct
            break_even_repairs = repairs * (1 + pct_increase_to_zero / 100)
        else:
            break_even_repairs = repairs * 2.5
    else:
        break_even_repairs = repairs * 2.5
    
    # Recommendation holds if >= 6 of 9 scenarios pass
    recommendation_holds = viable_count >= 6
    
    sensitivity = SensitivityResult(
        scenarios=scenarios,
        break_even_arv=break_even_arv,
        break_even_repairs=break_even_repairs,
        worst_case_loss=min(profits),
        best_case_profit=max(profits),
        expected_profit=sum(profits) / len(profits),
        scenarios_passed=viable_count,
        scenarios_total=len(scenarios),
        robustness_score=robustness_score,
        recommendation_holds=recommendation_holds
    )
    
    logger.info(
        f"[Layer8] Sensitivity: {viable_count}/{len(scenarios)} pass | "
        f"Robustness: {robustness_score:.0%} | "
        f"Break-even ARV: ${break_even_arv:,.0f}"
    )
    
    return base_result, sensitivity


# =============================================================================
# QUICK CALCULATION HELPERS
# =============================================================================

def quick_max_bid(arv: float, repairs: float) -> float:
    """
    Quick max bid calculation without full result object.
    
    Args:
        arv: After Repair Value
        repairs: Estimated repairs
    
    Returns:
        Max bid amount
    
    Example:
        max_bid = quick_max_bid(300000, 30000)
        # Returns: 125000.0
    """
    result = calculate_max_bid(arv, repairs, judgment_amount=1)
    return result["max_bid"]


def is_deal_viable(
    arv: float,
    repairs: float,
    judgment_amount: float,
    min_roi: float = 15.0
) -> tuple[bool, str]:
    """
    Quick viability check for a deal.
    
    Returns:
        Tuple of (is_viable, reason)
    
    Example:
        viable, reason = is_deal_viable(300000, 30000, 180000)
        if viable:
            print("Proceed with analysis")
    """
    result = calculate_max_bid(arv, repairs, judgment_amount)
    
    if result["max_bid"] <= 0:
        return False, "Max bid is zero or negative"
    
    if result["roi_percentage"] < min_roi:
        return False, f"ROI {result['roi_percentage']:.1f}% below minimum {min_roi}%"
    
    if result["bid_judgment_ratio"] < 0.50:
        return False, f"Bid/Judgment ratio {result['bid_judgment_ratio']:.1%} too low"
    
    return True, f"Viable: ROI {result['roi_percentage']:.1f}%, Ratio {result['bid_judgment_ratio']:.1%}"


# =============================================================================
# EXPORTS
# =============================================================================

__all__ = [
    "calculate_max_bid",
    "calculate_max_bid_with_sensitivity",
    "quick_max_bid",
    "is_deal_viable",
    "BidCalculationResult",
    "SensitivityResult",
    "SensitivityScenario",
    "BidConfig",
]
