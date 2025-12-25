#!/usr/bin/env python3
'''
BidDeed.AI LangGraph Orchestration - BECA Integration
======================================================

Integrates PropertyOnion BECA scraping method into the 12-stage pipeline.

Stage 3: BECA Lien Discovery
- Uses cookie persistence method
- Extracts plaintiff, final judgment, liens
- Feeds into Stage 4: Lien Priority Analysis
'''

import asyncio
from typing import TypedDict, List, Annotated
from langgraph.graph import StateGraph, END
from datetime import datetime
import json

# Import PropertyOnion BECA scraper
import sys
sys.path.append('scripts')
from propertyonion_beca_scraper import PropertyOnionBECAMethod


class BidDeedState(TypedDict):
    '''BidDeed.AI LangGraph State'''
    case_number: str
    property_data: dict
    beca_data: dict
    lien_priority: dict
    max_bid: float
    decision: str
    errors: List[str]


async def stage_1_discovery(state: BidDeedState) -> BidDeedState:
    '''Stage 1: Discovery - Get case from RealForeclose'''
    print(f"📍 Stage 1: Discovery - {state['case_number']}")
    
    # This would call RealForeclose scraper
    # For now, just pass through
    state['property_data'] = {
        'case_number': state['case_number'],
        'discovered_at': datetime.now().isoformat()
    }
    
    return state


async def stage_2_scraping(state: BidDeedState) -> BidDeedState:
    '''Stage 2: Scraping - Get property details from BCPAO'''
    print(f"📍 Stage 2: Scraping - Property details")
    
    # BCPAO API call would go here
    state['property_data']['bcpao'] = {
        'scraped': True
    }
    
    return state


async def stage_3_beca_lien_discovery(state: BidDeedState) -> BidDeedState:
    '''
    Stage 3: BECA Lien Discovery
    
    Uses PropertyOnion cookie persistence method to scrape BECA
    for lien information, plaintiff, and final judgment amount.
    '''
    print(f"📍 Stage 3: BECA Lien Discovery")
    
    try:
        scraper = PropertyOnionBECAMethod()
        
        # Load saved cookies (from manual session)
        cookies_loaded = await scraper.load_saved_cookies()
        
        if not cookies_loaded:
            print("⚠️  No BECA cookies found!")
            print("   Run manual session first: python scripts/propertyonion_beca_scraper.py")
            state['errors'].append("BECA cookies not initialized")
            state['beca_data'] = {'error': 'No cookies'}
            return state
        
        print(f"   Using saved BECA cookies")
        
        # Scrape BECA with valid session
        beca_data = await scraper.scrape_with_valid_session(state['case_number'])
        
        state['beca_data'] = beca_data
        
        print(f"   ✅ BECA data extracted:")
        print(f"      Plaintiff: {beca_data.get('plaintiff', 'N/A')}")
        print(f"      Final Judgment: ${beca_data.get('final_judgment', 0):,.2f}")
        print(f"      Documents: {len(beca_data.get('documents', []))}")
        
    except Exception as e:
        print(f"   ❌ BECA scraping failed: {e}")
        state['errors'].append(f"BECA error: {str(e)}")
        state['beca_data'] = {'error': str(e)}
    
    return state


async def stage_4_lien_priority(state: BidDeedState) -> BidDeedState:
    '''Stage 4: Lien Priority Analysis - Uses BECA data'''
    print(f"📍 Stage 4: Lien Priority Analysis")
    
    beca = state.get('beca_data', {})
    
    # Analyze plaintiff to detect HOA vs mortgage
    plaintiff = beca.get('plaintiff', '').upper()
    
    if any(term in plaintiff for term in ['HOA', 'HOMEOWNERS', 'ASSOCIATION']):
        lien_type = 'HOA'
        warning = 'DO_NOT_BID - Senior mortgages may survive HOA foreclosure'
    else:
        lien_type = 'MORTGAGE'
        warning = None
    
    state['lien_priority'] = {
        'lien_type': lien_type,
        'plaintiff': plaintiff,
        'warning': warning,
        'final_judgment': beca.get('final_judgment', 0)
    }
    
    print(f"   Lien Type: {lien_type}")
    if warning:
        print(f"   ⚠️  {warning}")
    
    return state


async def stage_5_max_bid_calculation(state: BidDeedState) -> BidDeedState:
    '''Stage 5: Max Bid Calculation'''
    print(f"📍 Stage 5: Max Bid Calculation")
    
    # Simple max bid formula
    # Real implementation would use ARV, repairs, etc.
    fj = state['lien_priority'].get('final_judgment', 0)
    max_bid = fj * 0.75  # 75% of final judgment as simple rule
    
    state['max_bid'] = max_bid
    print(f"   Max Bid: ${max_bid:,.2f}")
    
    return state


async def stage_6_decision(state: BidDeedState) -> BidDeedState:
    '''Stage 6: Decision - BID, REVIEW, or SKIP'''
    print(f"📍 Stage 6: Decision Logic")
    
    # Check for HOA warning
    if state['lien_priority'].get('warning'):
        state['decision'] = 'SKIP'
        print(f"   Decision: SKIP (HOA foreclosure)")
        return state
    
    # Check max bid vs final judgment
    max_bid = state.get('max_bid', 0)
    fj = state['lien_priority'].get('final_judgment', 0)
    
    if max_bid >= fj * 0.75:
        state['decision'] = 'BID'
    elif max_bid >= fj * 0.60:
        state['decision'] = 'REVIEW'
    else:
        state['decision'] = 'SKIP'
    
    print(f"   Decision: {state['decision']}")
    
    return state


# Build LangGraph workflow
def create_biddeed_workflow():
    '''Create BidDeed.AI LangGraph workflow with BECA integration'''
    
    workflow = StateGraph(BidDeedState)
    
    # Add nodes
    workflow.add_node("discovery", stage_1_discovery)
    workflow.add_node("scraping", stage_2_scraping)
    workflow.add_node("beca_lien_discovery", stage_3_beca_lien_discovery)
    workflow.add_node("lien_priority", stage_4_lien_priority)
    workflow.add_node("max_bid", stage_5_max_bid_calculation)
    workflow.add_node("decision", stage_6_decision)
    
    # Add edges
    workflow.add_edge("discovery", "scraping")
    workflow.add_edge("scraping", "beca_lien_discovery")
    workflow.add_edge("beca_lien_discovery", "lien_priority")
    workflow.add_edge("lien_priority", "max_bid")
    workflow.add_edge("max_bid", "decision")
    workflow.add_edge("decision", END)
    
    # Set entry point
    workflow.set_entry_point("discovery")
    
    return workflow.compile()


async def run_biddeed_pipeline(case_number: str):
    '''Run full BidDeed.AI pipeline with BECA integration'''
    
    print("=" * 70)
    print(f"BIDDEED.AI PIPELINE - {case_number}")
    print("=" * 70)
    print()
    
    # Initialize state
    initial_state = {
        'case_number': case_number,
        'property_data': {},
        'beca_data': {},
        'lien_priority': {},
        'max_bid': 0.0,
        'decision': '',
        'errors': []
    }
    
    # Create workflow
    app = create_biddeed_workflow()
    
    # Execute
    result = await app.ainvoke(initial_state)
    
    print()
    print("=" * 70)
    print("PIPELINE COMPLETE")
    print("=" * 70)
    print()
    print(json.dumps({
        'case_number': result['case_number'],
        'decision': result['decision'],
        'max_bid': result['max_bid'],
        'lien_type': result['lien_priority'].get('lien_type'),
        'errors': result['errors']
    }, indent=2))
    
    return result


# CLI
if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python langgraph_beca_integration.py <case_number>")
        print("Example: python langgraph_beca_integration.py 05-2024-CA-012345-XXXX-XX")
        sys.exit(1)
    
    case_number = sys.argv[1]
    asyncio.run(run_biddeed_pipeline(case_number))
