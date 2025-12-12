#!/usr/bin/env python3
"""
BidDeed.AI V13.5.0 - Smart Router
Routes requests to optimal AI model based on task, cost, and quality.
12 models across 5 tiers targeting 47% FREE tier usage.

Updated Dec 2, 2025: DeepSeek V3.2 integration
- Replaces deepseek-chat with deepseek-v3.2 (3.5x cheaper, higher quality)
- Added deepseek-v3.2-thinking for tool+reasoning workflows
"""
from dataclasses import dataclass
from typing import Dict, List, Optional
from enum import Enum
import random

class ModelTier(Enum):
    FREE = "free"
    ULTRA_CHEAP = "ultra_cheap"
    BUDGET = "budget"
    PRODUCTION = "production"
    CRITICAL = "critical"

@dataclass
class AIModel:
    name: str
    tier: ModelTier
    cost_per_1k_tokens: float
    quality_score: float  # 0-1
    speed_ms: int
    context_window: int
    supports_tool_use: bool = True
    supports_thinking: bool = False

MODELS = [
    # FREE Tier (47% target)
    AIModel("gemini-1.5-flash", ModelTier.FREE, 0.0, 0.75, 500, 1000000),
    AIModel("llama-3.1-8b", ModelTier.FREE, 0.0, 0.70, 300, 128000),
    AIModel("mistral-7b", ModelTier.FREE, 0.0, 0.68, 250, 32000),
    
    # ULTRA_CHEAP Tier - DeepSeek V3.2 (Dec 2025 update)
    AIModel("gemini-1.5-pro", ModelTier.ULTRA_CHEAP, 0.00125, 0.85, 800, 2000000),
    AIModel("deepseek-v3.2", ModelTier.ULTRA_CHEAP, 0.00028, 0.90, 400, 128000, 
            supports_tool_use=True, supports_thinking=True),  # GPT-5 level, $0.28/1M input
    
    # BUDGET Tier
    AIModel("gpt-4o-mini", ModelTier.BUDGET, 0.003, 0.88, 600, 128000),
    AIModel("claude-3-haiku", ModelTier.BUDGET, 0.0025, 0.86, 500, 200000),
    AIModel("deepseek-v3.2-thinking", ModelTier.BUDGET, 0.00042, 0.92, 600, 128000,
            supports_tool_use=True, supports_thinking=True),  # Thinking+tool mode, $0.42/1M output
    
    # PRODUCTION Tier
    AIModel("gpt-4o", ModelTier.PRODUCTION, 0.01, 0.94, 1000, 128000),
    AIModel("claude-3.5-sonnet", ModelTier.PRODUCTION, 0.015, 0.95, 800, 200000),
    
    # CRITICAL Tier
    AIModel("gpt-4-turbo", ModelTier.CRITICAL, 0.03, 0.96, 1500, 128000),
    AIModel("claude-3-opus", ModelTier.CRITICAL, 0.075, 0.98, 2000, 200000),
    AIModel("o1-preview", ModelTier.CRITICAL, 0.06, 0.99, 3000, 128000),
]

class SmartRouter:
    def __init__(self, daily_budget: float = 10.0, free_tier_target: float = 0.47):
        self.models = MODELS
        self.daily_budget = daily_budget
        self.free_tier_target = free_tier_target
        self.daily_spend = 0.0
        self.tier_usage = {tier: 0 for tier in ModelTier}
        
    def route(self, task_type: str, complexity: str = "medium", 
              require_accuracy: bool = False,
              require_thinking: bool = False,
              require_tool_use: bool = False) -> AIModel:
        """Route to optimal model based on task requirements.
        
        Args:
            task_type: Type of task (e.g., 'lien_analysis', 'report_gen')
            complexity: 'low', 'medium', or 'high'
            require_accuracy: Force PRODUCTION tier or higher
            require_thinking: Prefer models with thinking mode (DeepSeek V3.2)
            require_tool_use: Prefer models with native tool integration
        """
        
        # Determine required tier
        if require_accuracy or complexity == "high":
            min_tier = ModelTier.PRODUCTION
        elif complexity == "medium":
            min_tier = ModelTier.BUDGET
        else:
            min_tier = ModelTier.FREE
        
        # Check budget - force lower tier if needed
        if self.daily_spend > self.daily_budget * 0.8:
            min_tier = ModelTier.FREE
        
        # Select from eligible models
        tier_order = [ModelTier.FREE, ModelTier.ULTRA_CHEAP, ModelTier.BUDGET, 
                      ModelTier.PRODUCTION, ModelTier.CRITICAL]
        start_idx = tier_order.index(min_tier)
        
        for tier in tier_order[start_idx:]:
            eligible = [m for m in self.models if m.tier == tier]
            
            # Filter for thinking/tool requirements if specified
            if require_thinking:
                thinking_models = [m for m in eligible if m.supports_thinking]
                if thinking_models:
                    eligible = thinking_models
            
            if require_tool_use:
                tool_models = [m for m in eligible if m.supports_tool_use]
                if tool_models:
                    eligible = tool_models
            
            if eligible:
                # Pick best quality within tier
                selected = max(eligible, key=lambda m: m.quality_score)
                self.tier_usage[tier] += 1
                return selected
        
        # Fallback to first FREE model
        return self.models[0]
    
    def route_for_stage(self, stage_name: str) -> AIModel:
        """Route based on pipeline stage name.
        
        Optimized routing for BidDeed.AI 12-stage pipeline.
        """
        stage_config = {
            'lien_priority': {'complexity': 'medium', 'require_thinking': True, 'require_tool_use': True},
            'demographics': {'complexity': 'low', 'require_thinking': False},
            'ml_score': {'complexity': 'low'},  # XGBoost handles this, minimal LLM
            'decision_log': {'complexity': 'medium', 'require_thinking': True},
            'report': {'complexity': 'medium'},  # Long output, DeepSeek V3.2 cheap
            'discovery': {'complexity': 'low'},
            'scraping': {'complexity': 'low'},
            'title': {'complexity': 'low'},
            'tax_certs': {'complexity': 'low'},
            'max_bid': {'complexity': 'low'},
            'disposition': {'complexity': 'low'},
            'archive': {'complexity': 'low'},
        }
        
        config = stage_config.get(stage_name.lower(), {'complexity': 'medium'})
        return self.route(**config)
    
    def get_tier_distribution(self) -> Dict[str, float]:
        total = sum(self.tier_usage.values()) or 1
        return {tier.value: count/total for tier, count in self.tier_usage.items()}
    
    def estimate_daily_cost(self, calls_per_stage: Dict[str, int]) -> float:
        """Estimate daily cost based on expected calls per stage."""
        total_cost = 0.0
        avg_tokens_per_call = 2000  # Conservative estimate
        
        for stage, calls in calls_per_stage.items():
            model = self.route_for_stage(stage)
            stage_cost = calls * avg_tokens_per_call * model.cost_per_1k_tokens / 1000
            total_cost += stage_cost
        
        return total_cost

