"""
BidDeed.AI V14.5.0 — LangGraph Orchestrator
=================================================
12 Agents | 3 Tiers | 12-Stage Pipeline
WITH ZILLOW + REDFIN CMA ENRICHMENT

ARCHITECTURE:
┌─────────────────────────────────────────────────────────────────┐
│  TIER 1: DISCOVERY                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Property     │→ │ Document     │→ │ Change       │           │
│  │ Scout        │  │ Parser       │  │ Detector     │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                           ↓                                      │
├─────────────────────────────────────────────────────────────────┤
│  TIER 2: ANALYSIS (parallel where possible)                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │CMA      │ │ Title   │ │ Market  │ │  Risk   │ │  Comp   │   │
│  │Enricher │ │ Agent   │ │ Agent   │ │ Agent   │ │ Agent   │   │
│  │(Z+R)    │ │         │ │         │ │         │ │(Z+R)    │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│                           ↓                                      │
│                    [HITL Checkpoint]                             │
│                           ↓                                      │
├─────────────────────────────────────────────────────────────────┤
│  TIER 3: EXECUTION                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Strategy     │→ │ Bid          │→ │ Report       │           │
│  │ Agent        │  │ Agent        │  │ Agent        │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘

NEW IN V14.5.0:
- CMA Enrichment Agent with Zillow + Redfin integration
- Multi-source ARV calculation (Zestimate, Redfin estimate, BCPAO, comps)
- Comparable sales from both Zillow and Redfin
- Confidence scoring based on source agreement
- Apify API integration for real-time property data

LAYER 8 IP PROTECTION:
- Max bid formula is in src/core/layer8_bid_calculator.py (encrypted)
- This file ONLY calls the protected function, never exposes logic
"""

from typing import Literal, Optional, Callable, Any, Dict, List
from datetime import datetime
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.checkpoint.sqlite import SqliteSaver
import logging
import asyncio
import os

# Import state schema
from .state import (
    CMAEnrichmentData,
    BrevardBidderState,
    create_initial_state,
    AgentTier,
    AgentStatus,
    Recommendation,
    ErrorSeverity,
    AgentOutput,
    Tier1Outputs,
    Tier2Outputs,
    Tier3Outputs,
    HITLCheckpoint,
    StructuredError,
    create_structured_error,
    add_decision_log,
    add_error_v2,
    add_checkpoint,
    update_data_freshness,
    update_cost_tracking,
    should_create_checkpoint,
    check_data_freshness,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("BidDeed.AI.Orchestrator")


# =============================================================================
# SMART ROUTER INTEGRATION
# =============================================================================

def get_smart_router():
    """Get the existing SmartRouter instance."""
    try:
        from smart_router.router import SmartRouter as ExistingRouter
        return ExistingRouter()
    except ImportError:
        logger.warning("Existing SmartRouter not found, using built-in fallback")
        return _FallbackRouter()


class _FallbackRouter:
    """Fallback router if main SmartRouter unavailable."""
    
    def __init__(self):
        self.tier_costs = {
            "FREE": 0.0,
            "ULTRA_CHEAP": 0.00028,
            "BUDGET": 0.00025,
            "PRODUCTION": 0.003,
            "CRITICAL": 0.015,
        }
    
    def route(
        self,
        task_type: str = "default",
        complexity: str = "medium",
        require_accuracy: bool = False,
        require_thinking: bool = False,
        require_tool_use: bool = False
    ):
        if require_accuracy or task_type in ["legal_analysis", "bid_decision", "lien_priority"]:
            tier = "CRITICAL"
            model = "claude-3-opus"
        elif complexity == "high":
            tier = "PRODUCTION"
            model = "claude-3.5-sonnet"
        elif complexity == "medium":
            tier = "ULTRA_CHEAP"
            model = "deepseek-v3.2"
        else:
            tier = "FREE"
            model = "gemini-1.5-flash"
        
        return _ModelResult(model, tier, self.tier_costs[tier])
    
    def route_for_stage(self, stage_name: str):
        stage_config = {
            'discovery': {'complexity': 'low'},
            'scraping': {'complexity': 'low'},
            'title': {'complexity': 'medium', 'require_thinking': True},
            'lien_priority': {'complexity': 'high', 'require_accuracy': True},
            'demographics': {'complexity': 'low'},
            'ml_score': {'complexity': 'low'},
            'max_bid': {'complexity': 'high', 'require_accuracy': True},
            'decision_log': {'complexity': 'medium'},
            'report': {'complexity': 'medium'},
            'cma_enrichment': {'complexity': 'medium'},  # NEW
        }
        config = stage_config.get(stage_name.lower(), {'complexity': 'medium'})
        return self.route(**config)


class _ModelResult:
    def __init__(self, name: str, tier: str, cost: float):
        self.name = name
        self.tier = tier
        self.cost_per_1k_tokens = cost


class SmartRouter:
    """Async wrapper for SmartRouter."""
    
    def __init__(self):
        self._router = get_smart_router()
        self.tier_costs = {
            "FREE": 0.0,
            "ULTRA_CHEAP": 0.00028,
            "BUDGET": 0.00025,
            "PRODUCTION": 0.003,
            "CRITICAL": 0.015,
        }
    
    async def route(
        self,
        task_type: str,
        complexity: Literal["low", "medium", "high", "critical"],
        require_reasoning: bool = False
    ) -> dict:
        result = self._router.route(
            task_type=task_type,
            complexity=complexity,
            require_accuracy=(complexity == "critical"),
            require_thinking=require_reasoning
        )
        
        return {
            "tier": (result.tier.value.upper() if hasattr(result.tier, 'value') else str(result.tier)) if hasattr(result, 'tier') else "FREE",
            "model": result.name if hasattr(result, 'name') else "gemini-1.5-flash",
            "cost_per_1k": result.cost_per_1k_tokens if hasattr(result, 'cost_per_1k_tokens') else 0.0
        }


# Global router instance
smart_router = SmartRouter()


# =============================================================================
# CMA ENRICHMENT AGENT (NEW IN V14.5.0)
# =============================================================================

async def cma_enrichment_agent(state: BrevardBidderState) -> dict:
    """
    CMA Enrichment Agent - Zillow + Redfin Integration
    
    NEW IN V14.5.0:
    - Fetches Zestimates from Zillow
    - Fetches Redfin estimates
    - Gets comparable sales from both platforms
    - Calculates weighted ARV with confidence scoring
    
    Data Sources: Zillow API (via Apify), Redfin API (via Apify), BCPAO
    LLM Tier: PRODUCTION (requires accuracy)
    Apify Cost: ~$2-3/1000 results
    """
    address = state['identifiers']['address']
    city = state['identifiers'].get('city', 'Melbourne')
    zip_code = state['identifiers'].get('zip_code', '')
    
    logger.info(f"[CMAEnrichmentAgent] Starting for {address}, {city} {zip_code}")
    
    try:
        route = await smart_router.route("cma_enrichment", "high", require_reasoning=True)
        
        # Import CMA Enrichment Agent
        try:
            from .cma_enrichment_agent import CMAEnrichmentAgent
            agent = CMAEnrichmentAgent()
        except ImportError:
            logger.warning("[CMAEnrichmentAgent] CMA module not available, using fallback")
            agent = None
        
        cma_result = None
        zillow_data = None
        redfin_data = None
        comparables = []
        
        if agent and os.getenv("APIFY_API_TOKEN"):
            # Get property details for better comp matching
            beds = state['details']['beds'] if state['details'] else None
            baths = state['details']['baths'] if state['details'] else None
            sqft = state['details']['sqft_living'] if state['details'] else None
            bcpao_value = state['details']['just_value'] if state['details'] else None
            
            # Call CMA Enrichment Agent
            report = await agent.enrich_property(
                address=address,
                city=city,
                zip_code=zip_code,
                beds=beds,
                baths=baths,
                sqft=sqft,
                bcpao_value=bcpao_value,
                include_comps=True
            )
            
            # Extract results
            if report:
                cma_result = {
                    "arv_estimated": report.estimated_arv,
                    "arv_confidence": report.arv_confidence,
                    "arv_low": report.arv_low,
                    "arv_high": report.arv_high,
                    "sources_used": []
                }
                
                if report.zillow_valuation:
                    zillow_data = {
                        "zestimate": report.zillow_valuation.zestimate,
                        "estimated_value": report.zillow_valuation.estimated_value,
                        "rent_estimate": report.zillow_valuation.rent_estimate,
                        "price_per_sqft": report.zillow_valuation.price_per_sqft,
                        "last_sold_price": report.zillow_valuation.last_sold_price,
                        "last_sold_date": report.zillow_valuation.last_sold_date
                    }
                    cma_result["sources_used"].append("zillow")
                
                if report.redfin_valuation:
                    redfin_data = {
                        "redfin_estimate": report.redfin_valuation.redfin_estimate,
                        "estimated_value": report.redfin_valuation.estimated_value,
                        "price_per_sqft": report.redfin_valuation.price_per_sqft,
                        "last_sold_price": report.redfin_valuation.last_sold_price,
                        "last_sold_date": report.redfin_valuation.last_sold_date
                    }
                    cma_result["sources_used"].append("redfin")
                
                if report.bcpao_valuation:
                    cma_result["bcpao_assessment"] = report.bcpao_valuation.tax_assessment
                    cma_result["sources_used"].append("bcpao")
                
                # Convert comparables
                if report.comparables:
                    comparables = [
                        {
                            "address": c.address,
                            "city": c.city,
                            "zip_code": c.zip_code,
                            "sold_price": c.sold_price,
                            "sold_date": c.sold_date,
                            "beds": c.beds,
                            "baths": c.baths,
                            "sqft": c.sqft,
                            "price_per_sqft": c.price_per_sqft,
                            "source": c.source.value,
                            "url": c.url
                        }
                        for c in report.comparables
                    ]
                    cma_result["comp_avg_price"] = report.comp_avg_price
                    cma_result["comp_avg_price_per_sqft"] = report.comp_avg_price_per_sqft
                
                logger.info(f"[CMAEnrichmentAgent] Success - ARV: ${report.estimated_arv:,.0f} "
                          f"({report.arv_confidence:.1f}% confidence) from {len(cma_result['sources_used'])} sources")
        else:
            # Fallback when Apify not available
            logger.warning("[CMAEnrichmentAgent] APIFY_API_TOKEN not set, using BCPAO-only valuation")
            sqft = state['details']['sqft_living'] if state['details'] else 1500
            just_value = state['details']['just_value'] if state['details'] else None
            
            cma_result = {
                "arv_estimated": just_value or (sqft * 180),
                "arv_confidence": 50.0 if just_value else 30.0,
                "arv_low": (just_value or sqft * 180) * 0.85,
                "arv_high": (just_value or sqft * 180) * 1.15,
                "sources_used": ["bcpao"] if just_value else ["estimate"],
                "bcpao_assessment": just_value,
                "warning": "Zillow/Redfin unavailable - BCPAO-only valuation"
            }
        
        # Create agent output
        agent_output = create_agent_output(
            agent_name="cma_enrichment_agent",
            tier=AgentTier.ANALYSIS,
            status=AgentStatus.COMPLETED,
            llm_tier=route["tier"],
            tokens=500,  # Minimal LLM usage, mostly API calls
            cost=route["cost_per_1k"] * 0.5 + (3.0 if agent else 0)  # Add Apify cost estimate
        )
        
        tier2 = state["tier2_outputs"] or {}
        tier2 = dict(tier2)
        tier2["cma_enrichment_agent"] = agent_output
        
        # Store CMA data in state for other agents
        return {
            "cma_enrichment": {
                "result": cma_result,
                "zillow": zillow_data,
                "redfin": redfin_data,
                "comparables": comparables,
                "fetched_at": datetime.utcnow().isoformat()
            },
            "tier2_outputs": tier2,
            **update_cost_tracking(state, 500, route["cost_per_1k"] * 0.5 + (3.0 if agent else 0), False),
            **add_decision_log(state, f"CMA Enrichment: ARV=${cma_result['arv_estimated']:,.0f} "
                                     f"({cma_result['arv_confidence']:.0f}% conf) "
                                     f"from {', '.join(cma_result['sources_used'])}")
        }
        
    except Exception as e:
        logger.error(f"[CMAEnrichmentAgent] Failed: {str(e)}")
        error = create_structured_error(
            agent_name="cma_enrichment_agent",
            stage="ml_score",
            message=str(e),
            severity=ErrorSeverity.WARNING,  # Non-fatal - can proceed with BCPAO only
            exception=e
        )
        return {
            "errors": [error],
            "cma_enrichment": None,
            **add_decision_log(state, f"CMA Enrichment failed: {str(e)} - using BCPAO fallback")
        }


# =============================================================================
# VALUATION AGENT (UPDATED V14.5.0)
# =============================================================================


# =============================================================================
# CMA ENRICHMENT AGENT (NEW IN V14.5.0) - Zillow + Redfin
# =============================================================================

async def cma_enrichment_agent(state: BrevardBidderState) -> dict:
    """
    CMA Enrichment Agent - Zillow + Redfin Integration
    
    NEW IN V14.5.0:
    - Fetches Zestimates from Zillow
    - Fetches Redfin estimates  
    - Gets comparable sales from both platforms
    - Calculates weighted ARV with confidence scoring
    
    Data Sources: Zillow API (via Apify), Redfin API (via Apify), BCPAO
    LLM Tier: PRODUCTION (requires accuracy)
    Apify Cost: ~$2-3/1000 results
    """
    import os
    
    address = state['identifiers']['address']
    city = state['identifiers'].get('city', 'Melbourne')
    zip_code = state['identifiers'].get('zip_code', '')
    
    logger.info(f"[CMAEnrichmentAgent] Starting for {address}, {city} {zip_code}")
    
    try:
        route = await smart_router.route("cma_enrichment", "high", require_reasoning=True)
        
        # Import CMA Enrichment Agent
        cma_result = None
        zillow_data = None
        redfin_data = None
        comparables = []
        agent = None
        
        try:
            from .cma_enrichment_agent import CMAEnrichmentAgent
            agent = CMAEnrichmentAgent()
        except ImportError:
            logger.warning("[CMAEnrichmentAgent] CMA module not available, using fallback")
        
        if agent and os.getenv("APIFY_API_TOKEN"):
            # Get property details for better comp matching
            beds = state['details']['beds'] if state['details'] else None
            baths = state['details']['baths'] if state['details'] else None
            sqft = state['details']['sqft_living'] if state['details'] else None
            bcpao_value = state['details']['just_value'] if state['details'] else None
            
            # Call CMA Enrichment Agent
            report = await agent.enrich_property(
                address=address,
                city=city,
                zip_code=zip_code,
                beds=beds,
                baths=baths,
                sqft=sqft,
                bcpao_value=bcpao_value,
                include_comps=True
            )
            
            if report:
                cma_result = {
                    "arv_estimated": report.estimated_arv,
                    "arv_confidence": report.arv_confidence,
                    "arv_low": report.arv_low,
                    "arv_high": report.arv_high,
                    "sources_used": []
                }
                
                if report.zillow_valuation:
                    zillow_data = {
                        "source": "zillow",
                        "zestimate": report.zillow_valuation.zestimate,
                        "estimated_value": report.zillow_valuation.estimated_value,
                        "rent_estimate": report.zillow_valuation.rent_estimate,
                        "price_per_sqft": report.zillow_valuation.price_per_sqft,
                        "last_sold_price": report.zillow_valuation.last_sold_price,
                        "last_sold_date": report.zillow_valuation.last_sold_date,
                        "fetched_at": report.zillow_valuation.fetched_at
                    }
                    cma_result["sources_used"].append("zillow")
                
                if report.redfin_valuation:
                    redfin_data = {
                        "source": "redfin",
                        "redfin_estimate": report.redfin_valuation.redfin_estimate,
                        "estimated_value": report.redfin_valuation.estimated_value,
                        "price_per_sqft": report.redfin_valuation.price_per_sqft,
                        "last_sold_price": report.redfin_valuation.last_sold_price,
                        "last_sold_date": report.redfin_valuation.last_sold_date,
                        "fetched_at": report.redfin_valuation.fetched_at
                    }
                    cma_result["sources_used"].append("redfin")
                
                if report.bcpao_valuation:
                    cma_result["bcpao_assessment"] = report.bcpao_valuation.tax_assessment
                    cma_result["sources_used"].append("bcpao")
                
                if report.comparables:
                    comparables = [
                        {
                            "address": c.address,
                            "city": c.city,
                            "zip_code": c.zip_code,
                            "sold_price": c.sold_price,
                            "sold_date": c.sold_date,
                            "beds": c.beds,
                            "baths": c.baths,
                            "sqft": c.sqft,
                            "price_per_sqft": c.price_per_sqft,
                            "source": c.source.value,
                            "url": c.url
                        }
                        for c in report.comparables
                    ]
                    cma_result["comp_avg_price"] = report.comp_avg_price
                    cma_result["comp_avg_price_per_sqft"] = report.comp_avg_price_per_sqft
                
                logger.info(f"[CMAEnrichmentAgent] ARV: ${report.estimated_arv:,.0f} "
                          f"({report.arv_confidence:.1f}% conf) from {len(cma_result['sources_used'])} sources")
        else:
            # Fallback when Apify not available
            logger.warning("[CMAEnrichmentAgent] APIFY_API_TOKEN not set, using BCPAO-only")
            sqft = state['details']['sqft_living'] if state['details'] else 1500
            just_value = state['details']['just_value'] if state['details'] else None
            
            cma_result = {
                "arv_estimated": just_value or (sqft * 180),
                "arv_confidence": 50.0 if just_value else 30.0,
                "arv_low": (just_value or sqft * 180) * 0.85,
                "arv_high": (just_value or sqft * 180) * 1.15,
                "sources_used": ["bcpao"] if just_value else ["estimate"],
                "bcpao_assessment": just_value,
                "warning": "Zillow/Redfin unavailable - BCPAO-only valuation"
            }
        
        agent_output = create_agent_output(
            agent_name="cma_enrichment_agent",
            tier=AgentTier.ANALYSIS,
            status=AgentStatus.COMPLETED,
            llm_tier=route["tier"],
            tokens=500,
            cost=route["cost_per_1k"] * 0.5 + (3.0 if agent else 0)
        )
        
        tier2 = state["tier2_outputs"] or {}
        tier2 = dict(tier2)
        tier2["cma_enrichment_agent"] = agent_output
        
        return {
            "cma_enrichment": {
                "result": cma_result,
                "zillow": zillow_data,
                "redfin": redfin_data,
                "comparables": comparables,
                "fetched_at": datetime.now().isoformat()
            },
            "tier2_outputs": tier2,
            **update_cost_tracking(state, 500, route["cost_per_1k"] * 0.5 + (3.0 if agent else 0), False),
            **add_decision_log(state, f"CMA: ARV=${cma_result['arv_estimated']:,.0f} "
                                     f"({cma_result['arv_confidence']:.0f}% conf) "
                                     f"from {', '.join(cma_result['sources_used'])}")
        }
        
    except Exception as e:
        logger.error(f"[CMAEnrichmentAgent] Failed: {str(e)}")
        error = create_structured_error(
            agent_name="cma_enrichment_agent",
            stage="cma_enrichment",
            message=str(e),
            severity=ErrorSeverity.WARNING,
            exception=e
        )
        return {
            "errors": [error],
            "cma_enrichment": None,
            **add_decision_log(state, f"CMA failed: {str(e)} - using BCPAO fallback")
        }


async def valuation_agent(state: BrevardBidderState) -> dict:
    """
    Valuation Agent (V14.5.0)
    
    UPDATED: Now uses CMA Enrichment data when available
    
    Responsibilities:
    - Calculate ARV using multi-source data (Zillow, Redfin, BCPAO, Comps)
    - Estimate repair costs
    - Determine as-is value
    - Confidence scoring based on source agreement
    
    Data Sources: CMA Enrichment Agent, BCPAO, ML models
    LLM Tier: PRODUCTION (complex reasoning)
    """
    logger.info(f"[ValuationAgent] Starting for {state['identifiers']['address']}")
    
    try:
        route = await smart_router.route("valuation_analysis", "high", require_reasoning=True)
        
        # Get CMA enrichment data if available
        cma_data = state.get("cma_enrichment")
        
        sqft = state["details"]["sqft_living"] if state["details"] else 1500
        year_built = state["details"]["year_built"] if state["details"] else 1990
        condition = state["details"].get("condition", "average") if state["details"] else "average"
        
        # Calculate ARV from multiple sources
        if cma_data and cma_data.get("result"):
            cma_result = cma_data["result"]
            
            # Use CMA enrichment ARV as primary
            arv = cma_result["arv_estimated"]
            confidence = cma_result["arv_confidence"] / 100.0  # Convert to 0-1
            
            # Get price per sqft from comps or calculate
            if cma_result.get("comp_avg_price_per_sqft"):
                price_per_sqft = cma_result["comp_avg_price_per_sqft"]
            elif cma_data.get("zillow", {}).get("price_per_sqft"):
                price_per_sqft = cma_data["zillow"]["price_per_sqft"]
            elif cma_data.get("redfin", {}).get("price_per_sqft"):
                price_per_sqft = cma_data["redfin"]["price_per_sqft"]
            else:
                price_per_sqft = arv / sqft if sqft else 180.0
            
            # Determine valuation method
            sources_count = len(cma_result.get("sources_used", []))
            if sources_count >= 3:
                valuation_method = "multi_source_hybrid"
            elif sources_count == 2:
                valuation_method = "dual_source"
            else:
                valuation_method = "single_source"
            
            # Get comps from CMA
            comps_used = cma_data.get("comparables", [])[:5]  # Top 5 comps
            
            logger.info(f"[ValuationAgent] Using CMA data: ARV=${arv:,.0f} from {sources_count} sources")
            
        else:
            # Fallback to BCPAO + estimate
            logger.warning("[ValuationAgent] No CMA data available, using fallback")
            
            just_value = state["details"]["just_value"] if state["details"] else None
            
            if just_value:
                arv = just_value * 1.1  # 10% premium over tax assessment
                confidence = 0.60
            else:
                price_per_sqft = 180.0  # Brevard County average
                arv = sqft * price_per_sqft
                confidence = 0.40
            
            price_per_sqft = arv / sqft if sqft else 180.0
            valuation_method = "bcpao_fallback"
            comps_used = []
        
        # Estimate repairs based on condition and age
        base_repair = 15000
        age_factor = max(0, (datetime.now().year - year_built) - 20) * 500
        condition_factors = {
            "excellent": 0.3,
            "good": 0.6,
            "average": 1.0,
            "fair": 1.5,
            "poor": 2.0
        }
        condition_multiplier = condition_factors.get(condition, 1.0)
        
        estimated_repairs = (base_repair + age_factor) * condition_multiplier
        estimated_repairs = min(estimated_repairs, arv * 0.3)  # Cap at 30% of ARV
        
        # Calculate as-is value
        as_is_value = arv - estimated_repairs
        
        # Determine repair confidence
        if year_built and condition:
            repair_confidence = "high" if confidence > 0.7 else "medium"
        else:
            repair_confidence = "low"
        
        valuation = {
            "arv": arv,
            "as_is_value": as_is_value,
            "estimated_repairs": estimated_repairs,
            "repair_confidence": repair_confidence,
            "comps_used": comps_used,
            "comps_count": len(comps_used),
            "price_per_sqft_avg": price_per_sqft,
            "valuation_method": valuation_method,
            "confidence_score": confidence,
            # NEW V14.5.0 fields
            "cma_sources": cma_data["result"]["sources_used"] if cma_data and cma_data.get("result") else [],
            "zillow_zestimate": cma_data.get("zillow", {}).get("zestimate") if cma_data else None,
            "redfin_estimate": cma_data.get("redfin", {}).get("redfin_estimate") if cma_data else None,
            "rent_estimate": cma_data.get("zillow", {}).get("rent_estimate") if cma_data else None
        }
        
        agent_output = create_agent_output(
            agent_name="valuation_agent",
            tier=AgentTier.ANALYSIS,
            status=AgentStatus.COMPLETED,
            llm_tier=route["tier"],
            tokens=2000,
            cost=route["cost_per_1k"] * 2.0
        )
        
        tier2 = state["tier2_outputs"] or {}
        tier2 = dict(tier2)
        tier2["valuation_agent"] = agent_output
        
        logger.info(f"[ValuationAgent] Completed - ARV: ${valuation['arv']:,.0f} "
                   f"({valuation['confidence_score']*100:.0f}% conf), "
                   f"Repairs: ${valuation['estimated_repairs']:,.0f}")
        
        return {
            "valuation": valuation,
            "tier2_outputs": tier2,
            **update_cost_tracking(state, 2000, route["cost_per_1k"] * 2.0, route["tier"] == "FREE"),
            **add_decision_log(state, f"Valuation: ARV=${valuation['arv']:,.0f}, "
                                     f"Repairs=${valuation['estimated_repairs']:,.0f}, "
                                     f"Method={valuation['valuation_method']}")
        }
        
    except Exception as e:
        logger.error(f"[ValuationAgent] Failed: {str(e)}")
        error = create_structured_error(
            agent_name="valuation_agent",
            stage="ml_score",
            message=str(e),
            severity=ErrorSeverity.ERROR,
            exception=e
        )
        return {"errors": [error]}


# =============================================================================
# COMP AGENT (UPDATED V14.5.0)
# =============================================================================

async def comp_agent(state: BrevardBidderState) -> dict:
    """
    Comp Agent (V14.5.0)
    
    UPDATED: Now uses Zillow + Redfin comps from CMA Enrichment
    
    Responsibilities:
    - Find comparable sales from multiple sources
    - Calculate price per sqft trends
    - Adjust for property differences
    - Validate comps against subject property
    
    Data Sources: CMA Enrichment Agent (Zillow, Redfin), BCPAO
    LLM Tier: ULTRA_CHEAP (structured analysis)
    """
    logger.info(f"[CompAgent] Starting comp analysis")
    
    try:
        route = await smart_router.route("comp_analysis", "medium")
        
        # Get CMA enrichment comps if available
        cma_data = state.get("cma_enrichment")
        
        comps = []
        comp_source = "none"
        
        if cma_data and cma_data.get("comparables"):
            # Use Zillow + Redfin comps from CMA
            raw_comps = cma_data["comparables"]
            
            for c in raw_comps:
                comp = {
                    "address": c.get("address", "Unknown"),
                    "city": c.get("city", ""),
                    "zip_code": c.get("zip_code", ""),
                    "sale_date": c.get("sold_date", ""),
                    "sale_price": c.get("sold_price", 0),
                    "sqft": c.get("sqft", 0),
                    "price_per_sqft": c.get("price_per_sqft", 0),
                    "beds": c.get("beds", 0),
                    "baths": c.get("baths", 0),
                    "distance_miles": c.get("distance_miles"),
                    "days_on_market": None,
                    "condition": "average",
                    "source": c.get("source", "unknown"),
                    "url": c.get("url")
                }
                comps.append(comp)
            
            # Count sources
            zillow_count = sum(1 for c in comps if c["source"] == "zillow")
            redfin_count = sum(1 for c in comps if c["source"] == "redfin")
            comp_source = f"zillow({zillow_count})+redfin({redfin_count})"
            
            logger.info(f"[CompAgent] Found {len(comps)} comps from CMA enrichment "
                       f"({zillow_count} Zillow, {redfin_count} Redfin)")
        else:
            # Fallback: Generate placeholder comps
            logger.warning("[CompAgent] No CMA comps available, using placeholder")
            comps = [
                {
                    "address": "Placeholder Comp 1",
                    "city": state['identifiers'].get('city', 'Melbourne'),
                    "zip_code": state['identifiers'].get('zip_code', '32901'),
                    "sale_date": datetime.now().strftime("%Y-%m-%d"),
                    "sale_price": 275000.0,
                    "sqft": 1650,
                    "price_per_sqft": 166.67,
                    "beds": 3,
                    "baths": 2,
                    "distance_miles": 0.5,
                    "days_on_market": 30,
                    "condition": "average",
                    "source": "placeholder"
                }
            ]
            comp_source = "placeholder"
        
        # Calculate comp statistics
        if comps:
            avg_price = sum(c["sale_price"] for c in comps if c["sale_price"]) / len(comps)
            price_per_sqft_values = [c["price_per_sqft"] for c in comps if c["price_per_sqft"]]
            avg_price_per_sqft = sum(price_per_sqft_values) / len(price_per_sqft_values) if price_per_sqft_values else 0
        else:
            avg_price = 0
            avg_price_per_sqft = 0
        
        agent_output = create_agent_output(
            agent_name="comp_agent",
            tier=AgentTier.ANALYSIS,
            status=AgentStatus.COMPLETED,
            llm_tier=route["tier"],
            tokens=900,
            cost=route["cost_per_1k"] * 0.9
        )
        
        tier2 = state["tier2_outputs"] or {}
        tier2 = dict(tier2)
        tier2["comp_agent"] = agent_output
        
        logger.info(f"[CompAgent] Completed - {len(comps)} comps, "
                   f"avg price ${avg_price:,.0f}, "
                   f"avg $/sqft ${avg_price_per_sqft:.2f}")
        
        return {
            "comps": comps,
            "comp_statistics": {
                "count": len(comps),
                "avg_price": avg_price,
                "avg_price_per_sqft": avg_price_per_sqft,
                "source": comp_source
            },
            "current_stage": "ml_score",
            "tier2_outputs": tier2,
            **update_cost_tracking(state, 900, route["cost_per_1k"] * 0.9, route["tier"] == "FREE"),
            **add_decision_log(state, f"CompAgent: {len(comps)} comps from {comp_source}, "
                                     f"avg ${avg_price:,.0f}")
        }
        
    except Exception as e:
        logger.error(f"[CompAgent] Failed: {str(e)}")
        error = create_structured_error(
            agent_name="comp_agent",
            stage="ml_score",
            message=str(e),
            severity=ErrorSeverity.WARNING,
            exception=e
        )
        return {"errors": [error]}


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def create_agent_output(
    agent_name: str,
    tier: AgentTier,
    status: AgentStatus,
    llm_tier: str = "FREE",
    tokens: int = 0,
    cost: float = 0.0
) -> AgentOutput:
    """Create standardized agent output."""
    return {
        "agent_name": agent_name,
        "tier": tier,
        "status": status,
        "started_at": datetime.utcnow(),
        "completed_at": datetime.utcnow(),
        "llm_tier_used": llm_tier,
        "tokens_used": tokens,
        "cost_usd": cost
    }


# =============================================================================
# UPDATED WORKFLOW BUILDER (V14.5.0)
# =============================================================================

def build_biddeed_workflow(
    checkpointer: Optional[Any] = None,
    enable_hitl: bool = True
) -> StateGraph:
    """
    Build the LangGraph workflow with CMA enrichment integration.
    
    V14.5.0: Added cma_enrichment_agent node before valuation
    
    Pipeline Flow:
    1. discovery → 2. scraping → 3. title_search → 4. lien_priority
    → 5. cma_enrichment (NEW) → 6. valuation → 7. comp_analysis
    → 8. risk_assessment → 9. max_bid → 10. decision → 11. report → 12. archive
    """
    
    workflow = StateGraph(BrevardBidderState)
    
    # TIER 1: DISCOVERY
    workflow.add_node("property_scout", property_scout_agent)
    workflow.add_node("document_parser", document_parser_agent)
    workflow.add_node("change_detector", change_detector_agent)
    
    # TIER 2: ANALYSIS (with CMA Enrichment)
    workflow.add_node("cma_enrichment", cma_enrichment_agent)  # NEW V14.5.0
    workflow.add_node("cma_enrichment", cma_enrichment_agent)  # NEW V14.5.0
    workflow.add_node("valuation_agent", valuation_agent)
    workflow.add_node("title_agent", title_agent)
    workflow.add_node("market_agent", market_agent)
    workflow.add_node("risk_agent", risk_agent)
    workflow.add_node("comp_agent", comp_agent)
    workflow.add_node("tier2_aggregator", tier2_aggregator)
    
    # HITL Checkpoint
    if enable_hitl:
        workflow.add_node("hitl_checkpoint", hitl_checkpoint_node)
    
    # TIER 3: EXECUTION
    workflow.add_node("strategy_agent", strategy_agent)
    workflow.add_node("bid_agent", bid_agent)
    workflow.add_node("report_agent", report_agent)
    
    # --- EDGES ---
    
    # Entry point
    workflow.set_entry_point("property_scout")
    
    # Tier 1 flow
    workflow.add_edge("property_scout", "document_parser")
    workflow.add_edge("document_parser", "change_detector")
    
    # Tier 1 → Tier 2 (CMA first, then parallel analysis)
    workflow.add_edge("change_detector", "cma_enrichment")  # NEW: CMA before valuation
    
    # CMA → Valuation (sequential - valuation needs CMA data)
    workflow.add_edge("cma_enrichment", "valuation_agent")
    
    # Valuation → Other Tier 2 agents (can run in parallel)
    workflow.add_edge("valuation_agent", "title_agent")
    workflow.add_edge("valuation_agent", "market_agent")
    workflow.add_edge("valuation_agent", "comp_agent")  # Comp also uses CMA data
    
    # Parallel agents → Risk → Aggregator
    workflow.add_edge("title_agent", "risk_agent")
    workflow.add_edge("market_agent", "risk_agent")
    workflow.add_edge("comp_agent", "risk_agent")
    workflow.add_edge("risk_agent", "tier2_aggregator")
    
    # HITL checkpoint
    if enable_hitl:
        workflow.add_edge("tier2_aggregator", "hitl_checkpoint")
        workflow.add_conditional_edges(
            "hitl_checkpoint",
            _hitl_routing,
            {
                "proceed": "strategy_agent",
                "wait": END,
                "skip": END
            }
        )
    else:
        workflow.add_edge("tier2_aggregator", "strategy_agent")
    
    # Tier 3 flow
    workflow.add_edge("strategy_agent", "bid_agent")
    workflow.add_edge("bid_agent", "report_agent")
    workflow.add_edge("report_agent", END)
    
    # Compile with checkpointer
    if checkpointer:
        return workflow.compile(checkpointer=checkpointer)
    else:
        return workflow.compile(checkpointer=MemorySaver())


def _hitl_routing(state: BrevardBidderState) -> str:
    """Route based on HITL checkpoint status."""
    if not state.get("pending_approval"):
        return "proceed"
    
    # Check if approved
    checkpoints = state.get("hitl_checkpoints", [])
    if checkpoints:
        latest = checkpoints[-1]
        if latest.get("approved"):
            return "proceed"
        elif latest.get("approved") is False:
            return "skip"
    
    return "wait"


# =============================================================================
# PLACEHOLDER AGENTS (to be imported from original orchestrator)
# =============================================================================

# These would be imported from the original orchestrator.py
# For now, providing stubs

async def property_scout_agent(state: BrevardBidderState) -> dict:
    """Property Scout Agent - See original orchestrator.py"""
    logger.info("[PropertyScout] Starting discovery")
    return {"current_stage": "scraping"}

async def document_parser_agent(state: BrevardBidderState) -> dict:
    """Document Parser Agent - See original orchestrator.py"""
    logger.info("[DocumentParser] Parsing documents")
    return {"current_stage": "title_search"}

async def change_detector_agent(state: BrevardBidderState) -> dict:
    """Change Detector Agent - See original orchestrator.py"""
    logger.info("[ChangeDetector] Checking for changes")
    return {"current_stage": "lien_priority"}

async def title_agent(state: BrevardBidderState) -> dict:
    """Title Agent - See original orchestrator.py"""
    logger.info("[TitleAgent] Analyzing title")
    return {}

async def market_agent(state: BrevardBidderState) -> dict:
    """Market Agent - See original orchestrator.py"""
    logger.info("[MarketAgent] Analyzing market")
    return {}

async def risk_agent(state: BrevardBidderState) -> dict:
    """Risk Agent - See original orchestrator.py"""
    logger.info("[RiskAgent] Assessing risk")
    return {}

async def tier2_aggregator(state: BrevardBidderState) -> dict:
    """Tier 2 Aggregator - See original orchestrator.py"""
    logger.info("[Tier2Aggregator] Aggregating results")
    return {"current_stage": "max_bid"}

async def hitl_checkpoint_node(state: BrevardBidderState) -> dict:
    """HITL Checkpoint - See original orchestrator.py"""
    logger.info("[HITL] Checking approval")
    return {"pending_approval": False}

async def strategy_agent(state: BrevardBidderState) -> dict:
    """Strategy Agent - See original orchestrator.py"""
    logger.info("[StrategyAgent] Determining strategy")
    return {}

async def bid_agent(state: BrevardBidderState) -> dict:
    """Bid Agent - See original orchestrator.py"""
    logger.info("[BidAgent] Calculating bid")
    return {}

async def report_agent(state: BrevardBidderState) -> dict:
    """Report Agent - See original orchestrator.py"""
    logger.info("[ReportAgent] Generating report")
    return {}


# =============================================================================
# MAIN ENTRY POINT
# =============================================================================



# =============================================================================
# MISSING EXPORTS FOR __init__.py COMPATIBILITY
# =============================================================================

# Alias for backwards compatibility
build_biddeed_graph = build_biddeed_workflow

def compile_graph(enable_hitl: bool = False):
    """Compile the BrevardBidder workflow graph."""
    return build_biddeed_workflow(enable_hitl=enable_hitl)


class SmartRouter:
    """Smart Router wrapper for external access."""
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = get_smart_router()
        return cls._instance


async def run_property_analysis(
    case_number: str,
    address: str = "TBD",
    city: str = "Brevard County",
    zip_code: str = "32937",
    auction_date: str = None,
    is_auction_day: bool = False,
    enable_hitl: bool = False
) -> dict:
    """
    Main entry point for BidDeed.AI property analysis.
    
    Args:
        case_number: Brevard County court case number
        address: Property street address
        city: City name
        zip_code: ZIP code
        auction_date: Optional auction date (ISO format)
        is_auction_day: Whether analysis is for auction day
        enable_hitl: Enable human-in-the-loop checkpoints
        
    Returns:
        dict: Complete analysis result with recommendation
    """
    logger.info(f"[RunAnalysis] Starting analysis for {case_number}")
    
    workflow = build_biddeed_workflow(enable_hitl=enable_hitl)
    
    initial_state = create_initial_state(
        case_number=case_number,
        address=address,
        city=city,
        zip_code=zip_code
    )
    
    if auction_date:
        initial_state["auction_info"] = {
            "auction_date": auction_date,
            "is_auction_day": is_auction_day
        }
    
    result = await workflow.ainvoke(initial_state)
    
    logger.info(f"[RunAnalysis] Completed analysis for {case_number}")
    
    return result


if __name__ == "__main__":
    import asyncio
    
    async def test_workflow():
        """Test the updated workflow."""
        workflow = build_biddeed_workflow(enable_hitl=False)
        
        initial_state = create_initial_state(
            case_number="05-2024-CA-012345",
            address="123 Test St",
            city="Satellite Beach",
            zip_code="32937"
        )
        
        result = await workflow.ainvoke(initial_state)
        print(f"Pipeline completed: {result.get('current_stage')}")
        
        if result.get("cma_enrichment"):
            print(f"CMA ARV: ${result['cma_enrichment']['result']['arv_estimated']:,.0f}")
        
        if result.get("valuation"):
            print(f"Final ARV: ${result['valuation']['arv']:,.0f}")
    
    asyncio.run(test_workflow())
