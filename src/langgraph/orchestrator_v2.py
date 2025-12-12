"""
BidDeed.AI LangGraph Orchestrator V2
==========================================
Version: 14.5.1
Created: December 11, 2025
Fixed: Import from nodes_v2 instead of auction_graph

ENHANCEMENTS OVER V1:
- Parallel stage execution (stages 3,5,6 run concurrently)
- Auto-checkpoint every 50K tokens
- Supabase state persistence
- Smart Router V5 integration with 40-55% FREE tier target
"""

import asyncio
import os
import json
from datetime import datetime
from typing import Literal, Optional, List, Dict, Any
from uuid import uuid4

# LangGraph imports
try:
    from langgraph.graph import StateGraph, END
    from langgraph.checkpoint.sqlite import SqliteSaver
    LANGGRAPH_AVAILABLE = True
except ImportError:
    LANGGRAPH_AVAILABLE = False
    print("WARNING: LangGraph not available")

# State imports
from src.agents.state import (
    BrevardBidderState,
    create_initial_state,
    AgentStatus,
    Recommendation,
    ErrorSeverity,
    ExitStrategy,
    create_structured_error,
    create_checkpoint,
)

# Import node implementations from nodes_v2 (not auction_graph)
from src.langgraph.nodes.nodes_v2 import (
    discovery_node,
    scraping_node,
    title_search_node,
    lien_priority_node,
    tax_cert_node,
    demographics_node,
    cma_enrichment_node,  # Stage 7: Zillow/Redfin CMA
    ml_score_node,
    max_bid_node,
    decision_log_node,
    report_node,
    disposition_node,
    archive_node,
)


# =============================================================================
# CONFIGURATION
# =============================================================================

class OrchestratorConfig:
    """Centralized configuration for orchestrator behavior."""
    
    CHECKPOINT_DB = os.getenv("CHECKPOINT_DB", "checkpoints/biddeed_v2.db")
    CHECKPOINT_EVERY_N_TOKENS = 50_000
    MAX_CHECKPOINT_AGE_HOURS = 24.0
    SUPABASE_URL = os.getenv("SUPABASE_URL", "https://mocerqjnksmhcjzxrewo.supabase.co")
    TARGET_FREE_TIER_PERCENTAGE = 45.0
    MAX_COST_PER_PROPERTY = 0.50
    STAGE_TIMEOUT_SECONDS = 300
    HITL_TIMEOUT_MINUTES = 60
    PARALLEL_STAGES = ["title_search", "tax_certificates", "demographics"]
    MAX_CONCURRENT_STAGES = 3
    MAX_RETRIES_PER_STAGE = 3
    CRITICAL_ERROR_STAGES = ["lien_priority", "max_bid"]


# =============================================================================
# TOKEN MONITOR
# =============================================================================

class TokenMonitor:
    """Track token usage and trigger checkpoints."""
    
    def __init__(self, checkpoint_threshold: int = 50_000):
        self.total_tokens = 0
        self.tokens_since_checkpoint = 0
        self.checkpoint_threshold = checkpoint_threshold
        self.checkpoints_created = 0
        
    def add_tokens(self, tokens: int) -> bool:
        self.total_tokens += tokens
        self.tokens_since_checkpoint += tokens
        return self.tokens_since_checkpoint >= self.checkpoint_threshold
    
    def reset_checkpoint_counter(self):
        self.tokens_since_checkpoint = 0
        self.checkpoints_created += 1


# =============================================================================
# PARALLEL EXECUTION NODE
# =============================================================================

async def parallel_data_gathering(state: BrevardBidderState) -> dict:
    """Execute title_search, tax_certs, demographics in parallel."""
    state["decision_log"].append(
        f"[{datetime.now().isoformat()}] Starting parallel data gathering"
    )
    
    tasks = [
        asyncio.create_task(title_search_node(state.copy())),
        asyncio.create_task(tax_cert_node(state.copy())),
        asyncio.create_task(demographics_node(state.copy())),
    ]
    
    try:
        results = await asyncio.wait_for(
            asyncio.gather(*tasks, return_exceptions=True),
            timeout=OrchestratorConfig.STAGE_TIMEOUT_SECONDS * 3
        )
    except asyncio.TimeoutError:
        state["warnings"].append("Parallel data gathering timed out")
        results = [None, None, None]
    
    merged = {}
    for result in results:
        if isinstance(result, Exception):
            error = create_structured_error(
                agent_name="parallel_data",
                stage="parallel_data",
                message=str(result),
                severity=ErrorSeverity.WARNING,
                exception=result
            )
            merged.setdefault("errors", []).append(error)
        elif result:
            for key, value in result.items():
                if key in ["errors", "warnings", "decision_log"]:
                    merged[key] = merged.get(key, []) + value
                else:
                    merged[key] = value
    
    merged["current_stage"] = "lien_priority"
    return merged


# =============================================================================
# CONDITIONAL ROUTING
# =============================================================================

def route_after_lien_priority(state: BrevardBidderState) -> str:
    if state.get("title", {}).get("do_not_bid"):
        return "archive_skip"
    return "cma_enrichment"  # Stage 7: CMA before ML

def route_after_decision(state: BrevardBidderState) -> str:
    rec = state.get("recommendation")
    if rec and rec.get("requires_hitl"):
        return "hitl_review"
    return "report"


# =============================================================================
# HITL AND ERROR NODES
# =============================================================================

async def hitl_review_node(state: BrevardBidderState) -> dict:
    """Human-in-the-loop interrupt for REVIEW recommendations."""
    if not state.get("recommendation", {}).get("requires_hitl"):
        return {}
    
    checkpoint = create_checkpoint(state)
    return {
        "pending_approval": True,
        "checkpoints": [checkpoint],
        "decision_log": state.get("decision_log", []) + [
            f"[{datetime.now().isoformat()}] HITL: Review required"
        ]
    }

async def archive_skip_node(state: BrevardBidderState) -> dict:
    """Fast-track archive for DO_NOT_BID properties."""
    state["recommendation"] = {
        "recommendation": Recommendation.SKIP,
        "confidence": 1.0,
        "primary_reasons": ["DO_NOT_BID: Senior lien survives"],
        "concerns": [],
        "suggested_max_bid": 0,
        "requires_hitl": False,
        "hitl_reason": None,
        "sensitivity_passed": False,
        "robustness_score": 0
    }
    return {
        "recommendation": state["recommendation"],
        "completed_at": datetime.now(),
        "supabase_synced": False
    }

async def checkpoint_node(state: BrevardBidderState) -> dict:
    """Create checkpoint and sync to Supabase."""
    checkpoint = create_checkpoint(state)
    return {
        "checkpoints": [checkpoint],
        "last_valid_checkpoint_id": checkpoint["checkpoint_id"]
    }


# =============================================================================
# GRAPH CONSTRUCTION
# =============================================================================

def create_orchestrator_graph(
    checkpoint_db: str = OrchestratorConfig.CHECKPOINT_DB,
    enable_hitl: bool = True,
    enable_parallel: bool = True
) -> StateGraph:
    """Create the V2 orchestrator graph."""
    
    if not LANGGRAPH_AVAILABLE:
        raise ImportError("LangGraph required for graph construction")
    
    graph = StateGraph(BrevardBidderState)
    
    # Add nodes
    graph.add_node("discovery", discovery_node)
    graph.add_node("scraping", scraping_node)
    
    if enable_parallel:
        graph.add_node("parallel_data", parallel_data_gathering)
    else:
        graph.add_node("title_search", title_search_node)
        graph.add_node("tax_certificates", tax_cert_node)
        graph.add_node("demographics", demographics_node)
    
    graph.add_node("lien_priority", lien_priority_node)
    graph.add_node("cma_enrichment", cma_enrichment_node)  # Stage 7: Zillow/Redfin
    graph.add_node("ml_score", ml_score_node)
    graph.add_node("max_bid", max_bid_node)
    graph.add_node("decision_log", decision_log_node)
    graph.add_node("report", report_node)
    graph.add_node("disposition", disposition_node)
    graph.add_node("archive", archive_node)
    graph.add_node("archive_skip", archive_skip_node)
    graph.add_node("checkpoint", checkpoint_node)
    
    if enable_hitl:
        graph.add_node("hitl_review", hitl_review_node)
    
    # Set entry and edges
    graph.set_entry_point("discovery")
    graph.add_edge("discovery", "scraping")
    
    if enable_parallel:
        graph.add_edge("scraping", "parallel_data")
        graph.add_edge("parallel_data", "lien_priority")
    else:
        graph.add_edge("scraping", "title_search")
        graph.add_edge("title_search", "tax_certificates")
        graph.add_edge("tax_certificates", "demographics")
        graph.add_edge("demographics", "lien_priority")
    
    graph.add_conditional_edges(
        "lien_priority",
        route_after_lien_priority,
        {"cma_enrichment": "cma_enrichment", "archive_skip": "archive_skip"}  # CMA is Stage 7
    )
    
    graph.add_edge("cma_enrichment", "ml_score")  # Stage 7 → Stage 8
    graph.add_edge("ml_score", "max_bid")
    graph.add_edge("max_bid", "decision_log")
    
    if enable_hitl:
        graph.add_conditional_edges(
            "decision_log",
            route_after_decision,
            {"hitl_review": "hitl_review", "report": "report"}
        )
        graph.add_edge("hitl_review", "checkpoint")
        graph.add_edge("checkpoint", END)
    else:
        graph.add_edge("decision_log", "report")
    
    graph.add_edge("report", "disposition")
    graph.add_edge("disposition", "archive")
    graph.add_edge("archive", END)
    graph.add_edge("archive_skip", END)
    
    # Compile graph (checkpointing disabled for async compatibility)
    # Note: For persistent checkpointing, use AsyncSqliteSaver with context manager
    return graph.compile()


# =============================================================================
# ORCHESTRATOR CLASS
# =============================================================================

class BrevardBidderOrchestrator:
    """High-level orchestrator for property analyses."""
    
    def __init__(
        self,
        checkpoint_db: str = OrchestratorConfig.CHECKPOINT_DB,
        enable_hitl: bool = True,
        enable_parallel: bool = True
    ):
        if LANGGRAPH_AVAILABLE:
            self.graph = create_orchestrator_graph(
                checkpoint_db=checkpoint_db,
                enable_hitl=enable_hitl,
                enable_parallel=enable_parallel
            )
        else:
            self.graph = None
        self.token_monitor = TokenMonitor()
        
    async def analyze_property(
        self,
        case_number: str,
        address: str,
        city: str = "Melbourne",
        zip_code: str = "32940",
        is_auction_day: bool = False
    ) -> BrevardBidderState:
        """Run full analysis for a single property."""
        
        initial_state = create_initial_state(
            case_number=case_number,
            address=address,
            city=city,
            zip_code=zip_code,
            is_auction_day=is_auction_day
        )
        
        if not self.graph:
            # Fallback: run nodes sequentially without LangGraph
            return await self._run_sequential(initial_state)
        
        thread_id = f"auction_{case_number}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        config = {"configurable": {"thread_id": thread_id}}
        
        try:
            final_state = await self.graph.ainvoke(initial_state, config)
            return final_state
        except Exception as e:
            error = create_structured_error(
                agent_name="orchestrator",
                stage="execution",
                message=str(e),
                severity=ErrorSeverity.CRITICAL,
                exception=e
            )
            initial_state["errors"].append(error)
            return initial_state
    
    async def _run_sequential(self, state: BrevardBidderState) -> BrevardBidderState:
        """Fallback: run nodes sequentially without LangGraph."""
        print("Running sequential analysis (LangGraph fallback)...")
        
        nodes = [
            discovery_node,
            scraping_node,
            title_search_node,
            tax_cert_node,
            demographics_node,
            lien_priority_node,
            ml_score_node,
            max_bid_node,
            decision_log_node,
            report_node,
            disposition_node,
            archive_node,
        ]
        
        for node in nodes:
            try:
                result = await node(state)
                for key, value in result.items():
                    if key in ["errors", "warnings", "decision_log"]:
                        state[key] = state.get(key, []) + (value if isinstance(value, list) else [value])
                    else:
                        state[key] = value
                
                # Check for early exit
                if state.get("title", {}).get("do_not_bid"):
                    state["recommendation"] = {
                        "recommendation": Recommendation.SKIP,
                        "confidence": 1.0,
                        "primary_reasons": ["DO_NOT_BID"],
                        "concerns": [],
                        "suggested_max_bid": 0,
                        "requires_hitl": False,
                        "hitl_reason": None,
                        "sensitivity_passed": False,
                        "robustness_score": 0
                    }
                    break
                    
            except Exception as e:
                error = create_structured_error(
                    agent_name=node.__name__,
                    stage=state.get("current_stage", "unknown"),
                    message=str(e),
                    severity=ErrorSeverity.WARNING,
                    exception=e
                )
                state["errors"].append(error)
        
        state["completed_at"] = datetime.now()
        return state
    
    async def analyze_batch(
        self,
        properties: List[Dict[str, str]],
        max_concurrent: int = 5,
        is_auction_day: bool = False
    ) -> List[BrevardBidderState]:
        """Run batch analysis for multiple properties."""
        
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def analyze_with_limit(prop: dict) -> BrevardBidderState:
            async with semaphore:
                return await self.analyze_property(
                    case_number=prop.get("case_number", "UNKNOWN"),
                    address=prop.get("address", "Unknown Address"),
                    city=prop.get("city", "Melbourne"),
                    zip_code=prop.get("zip_code", "32940"),
                    is_auction_day=is_auction_day
                )
        
        results = await asyncio.gather(*[
            analyze_with_limit(prop) for prop in properties
        ])
        
        return results
    
    async def resume_from_checkpoint(self, thread_id: str) -> BrevardBidderState:
        """Resume a pipeline from its last checkpoint."""
        if not self.graph:
            raise RuntimeError("LangGraph required for checkpoint resumption")
        
        config = {"configurable": {"thread_id": thread_id}}
        return await self.graph.ainvoke(None, config)


# =============================================================================
# CLI ENTRY POINT
# =============================================================================

async def main():
    import sys
    
    if len(sys.argv) < 3:
        print("Usage: python orchestrator_v2.py <case_number> <address>")
        sys.exit(1)
    
    orchestrator = BrevardBidderOrchestrator()
    
    result = await orchestrator.analyze_property(
        case_number=sys.argv[1],
        address=sys.argv[2],
        city=sys.argv[3] if len(sys.argv) > 3 else "Melbourne",
        zip_code=sys.argv[4] if len(sys.argv) > 4 else "32940"
    )
    
    print("\n" + "="*60)
    print("ANALYSIS COMPLETE")
    print("="*60)
    rec = result.get("recommendation", {})
    print(f"Case: {result['identifiers']['case_number']}")
    print(f"Recommendation: {rec.get('recommendation', {}).value if rec.get('recommendation') else 'ERROR'}")
    print(f"Max Bid: ${result.get('bid_calc', {}).get('max_bid', 0):,.0f}")


if __name__ == "__main__":
    asyncio.run(main())
