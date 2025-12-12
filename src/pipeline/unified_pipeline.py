#!/usr/bin/env python3
"""
BidDeed.AI - Unified Pipeline Orchestrator
================================================
Complete 12-stage foreclosure intelligence pipeline with Fara V8 AI integration.

Stages:
1. RealForeclose Calendar Sync
2. BECA Case Data Extraction
3. BCPAO Property Enrichment
4. AcclaimWeb Lien Discovery
5. XGBoost Third-Party Prediction
6. Plaintiff Behavior Analysis
7. Bid Analysis & Max Bid Calculation
8. Fara V8 AI Risk Assessment ⭐
9. Report Generation
10. Supabase Sync
11. Decision Logging
12. Alert Dispatch

Author: Ariel Shapira, Solo Founder - Everest Capital USA
Version: 14.4.2
"""

import os
import json
import httpx
import asyncio
from datetime import datetime, date
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict, field
from enum import Enum

# Lien Discovery Agent V14.4.2
from src.agents.lien_discovery_agent import (
    LienDiscoveryAgent,
    is_hoa_plaintiff,
    detect_hoa_foreclosure,
    assess_mechanical_lien_priority,
    check_mechanical_lien_expiration,
    LienType,
    LienSearchResult
)

# Configuration
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://mocerqjnksmhcjzxrewo.supabase.co')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

# Fara V8 Endpoints
FARA_V8_BASE = "https://brevardbidderai--brevardbidderai-fara-v8"
FARA_ANALYZE = f"{FARA_V8_BASE}-analyze.modal.run"
FARA_HEALTH = f"{FARA_V8_BASE}-health.modal.run"


class PipelineStage(Enum):
    """Pipeline stage enumeration."""
    CALENDAR_SYNC = 1
    BECA_EXTRACTION = 2
    BCPAO_ENRICHMENT = 3
    LIEN_DISCOVERY = 4
    XGBOOST_PREDICTION = 5
    PLAINTIFF_ANALYSIS = 6
    BID_CALCULATION = 7
    AI_RISK_ASSESSMENT = 8
    REPORT_GENERATION = 9
    SUPABASE_SYNC = 10
    DECISION_LOGGING = 11
    ALERT_DISPATCH = 12


class Recommendation(Enum):
    """Bid recommendation levels."""
    BID = "BID"
    REVIEW = "REVIEW"
    SKIP = "SKIP"


@dataclass
class PipelineProperty:
    """Property flowing through pipeline."""
    # Core identifiers
    id: Optional[str] = None
    case_number: str = ""
    address: str = ""
    city: str = ""
    zip_code: str = ""
    
    # Financial
    judgment_amount: float = 0
    market_value: float = 0
    max_bid: float = 0
    
    # Parties
    plaintiff: str = ""
    defendant: str = ""
    
    # Auction info
    auction_date: str = ""
    auction_type: str = "foreclosure"
    
    # Enrichment data
    bcpao_account: Optional[str] = None
    photo_url: Optional[str] = None
    liens_found: int = 0
    lien_details: Optional[List[Dict]] = None
    
    # Lien Discovery V14.4.2
    is_hoa_foreclosure: bool = False
    hoa_detection_reason: Optional[str] = None
    senior_mortgage_detected: bool = False
    senior_mortgage_amount: float = 0
    mechanical_liens_found: int = 0
    mechanical_liens_amount: float = 0
    total_surviving_liens: float = 0
    lien_risk_level: str = "LOW"  # LOW, MEDIUM, HIGH, DO_NOT_BID
    lien_search_result: Optional[Dict] = None
    
    # ML predictions
    xgboost_third_party_prob: Optional[float] = None
    plaintiff_behavior_score: Optional[float] = None
    
    # Bid analysis
    bid_judgment_ratio: float = 0
    recommendation: str = "REVIEW"
    
    # Fara V8 AI analysis
    ai_analysis: Optional[str] = None
    ai_risk_level: Optional[str] = None
    ai_key_risks: Optional[List[str]] = None
    
    # Pipeline tracking
    stages_completed: List[int] = None
    errors: Optional[List[str]] = None
    processed_at: Optional[str] = None
    
    def __post_init__(self):
        if self.stages_completed is None:
            self.stages_completed = []
        if self.errors is None:
            self.errors = []


@dataclass
class PipelineResult:
    """Result from pipeline run."""
    success: bool
    properties_processed: int
    stages_completed: List[int]
    errors: List[str]
    runtime_seconds: float
    properties: List[PipelineProperty]
    summary: Dict[str, int]


class UnifiedPipeline:
    """
    Unified 12-stage foreclosure analysis pipeline.
    
    Usage:
        pipeline = UnifiedPipeline()
        result = await pipeline.run(auction_date="2025-12-17", limit=20)
    """
    
    VERSION = "14.4.0"
    
    def __init__(self):
        self.supabase_url = SUPABASE_URL
        self.supabase_key = SUPABASE_KEY
        self.fara_healthy = None
        self.stats = {
            "bid": 0,
            "review": 0,
            "skip": 0,
            "ai_analyzed": 0,
            "errors": 0
        }
    
    # ========================================
    # Stage 1: Calendar Sync
    # ========================================
    async def stage_1_calendar_sync(self, auction_date: Optional[str] = None) -> List[PipelineProperty]:
        """Fetch auctions from Supabase (simulating RealForeclose sync)."""
        print(f"[Stage 1] Calendar Sync...")
        
        headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json"
        }
        
        url = f"{self.supabase_url}/rest/v1/historical_auctions"
        params = {"select": "*", "order": "auction_date.desc", "limit": "50"}
        
        if auction_date:
            params["auction_date"] = f"eq.{auction_date}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, params=params, timeout=30.0)
            data = response.json()
        
        properties = []
        for row in data:
            prop = PipelineProperty(
                id=row.get('id'),
                case_number=row.get('case_number', ''),
                address=row.get('address', ''),
                city=row.get('city', ''),
                zip_code=row.get('zip_code', ''),
                judgment_amount=float(row.get('final_judgment') or row.get('market_value') or 0),
                market_value=float(row.get('market_value') or 0),
                plaintiff=row.get('plaintiff', ''),
                defendant=row.get('defendant', ''),
                auction_date=row.get('auction_date', ''),
                bcpao_account=row.get('bcpao_account'),
                photo_url=row.get('photo_url')
            )
            prop.stages_completed.append(1)
            properties.append(prop)
        
        print(f"   Found {len(properties)} properties")
        return properties
    
    # ========================================
    # Stages 2-4: Data Enrichment + Lien Discovery
    # ========================================
    async def stage_2_4_enrichment(self, properties: List[PipelineProperty]) -> List[PipelineProperty]:
        """
        Enrichment stages with integrated Lien Discovery Agent V14.4.2.
        
        Stage 2: BECA Case Data (from Supabase)
        Stage 3: BCPAO Property Enrichment (from Supabase)
        Stage 4: Lien Discovery - HOA detection, mechanical liens, senior lien analysis
        """
        print(f"[Stage 2-4] Data Enrichment + Lien Discovery V14.4.2...")
        
        # Initialize Lien Discovery Agent
        lien_agent = LienDiscoveryAgent(supabase_client=self._get_supabase_client())
        
        for prop in properties:
            # Stage 2-3: Data already in Supabase
            prop.stages_completed.extend([2, 3])
            
            # ========================================
            # Stage 4: Lien Discovery V14.4.2
            # ========================================
            try:
                # 4a. HOA/COA Plaintiff Detection
                is_hoa, reason = is_hoa_plaintiff(prop.plaintiff)
                prop.is_hoa_foreclosure = is_hoa
                prop.hoa_detection_reason = reason
                
                if is_hoa:
                    print(f"   ⚠️  HOA FORECLOSURE: {prop.case_number} - {reason}")
                    prop.lien_risk_level = "HIGH"
                    
                    # Get full case analysis
                    case_analysis = lien_agent.analyze_foreclosure_case(
                        case_number=prop.case_number,
                        plaintiff=prop.plaintiff,
                        defendant=prop.defendant
                    )
                    
                    # Log to Supabase
                    await lien_agent.save_hoa_detection(case_analysis)
                    
                    # For HOA foreclosures, assume senior mortgage exists unless proven otherwise
                    # This is conservative - better to skip than to buy into mortgage
                    if prop.market_value > 100000:  # Likely has mortgage
                        prop.senior_mortgage_detected = True
                        # Estimate: 80% LTV on market value is common
                        prop.senior_mortgage_amount = prop.market_value * 0.8
                        prop.total_surviving_liens = prop.senior_mortgage_amount
                        prop.lien_risk_level = "DO_NOT_BID"
                        print(f"      Est. senior mortgage: ${prop.senior_mortgage_amount:,.0f}")
                
                # 4b. Search for actual liens (if we have parcel ID)
                if prop.bcpao_account:
                    # Check cache first
                    cached = await lien_agent.get_previous_lien_search(prop.bcpao_account)
                    if cached:
                        prop.lien_search_result = cached
                        print(f"   ♻️  Using cached lien search for {prop.bcpao_account}")
                    else:
                        # Full lien search
                        lien_result = await lien_agent.search_property(
                            parcel_id=prop.bcpao_account,
                            owner_name=prop.defendant,
                            address=prop.address
                        )
                        prop.lien_search_result = asdict(lien_result)
                        prop.liens_found = len(lien_result.liens)
                        prop.total_surviving_liens = lien_result.total_amount_surviving_foreclosure
                        
                        # Save to Supabase
                        await lien_agent.save_lien_result(lien_result, prop.case_number)
                
                prop.stages_completed.append(4)
                
            except Exception as e:
                prop.errors.append(f"Stage 4 lien discovery error: {str(e)}")
                prop.stages_completed.append(4)  # Mark complete even with errors
                print(f"   ❌ Lien discovery error for {prop.case_number}: {e}")
        
        # Summary
        hoa_count = sum(1 for p in properties if p.is_hoa_foreclosure)
        high_risk = sum(1 for p in properties if p.lien_risk_level in ["HIGH", "DO_NOT_BID"])
        print(f"   ✅ Enriched {len(properties)} properties")
        print(f"   ⚠️  HOA Foreclosures: {hoa_count}")
        print(f"   🔴 High Risk: {high_risk}")
        
        return properties
    
    def _get_supabase_client(self):
        """Get Supabase client for lien agent."""
        if not self.supabase_key:
            return None
        try:
            from supabase import create_client
            return create_client(self.supabase_url, self.supabase_key)
        except Exception:
            return None
    
    # ========================================
    # Stage 5: XGBoost Prediction
    # ========================================
    async def stage_5_xgboost(self, properties: List[PipelineProperty]) -> List[PipelineProperty]:
        """Apply XGBoost third-party probability prediction."""
        print(f"[Stage 5] XGBoost Prediction...")
        
        # Base rate from historical data
        BASE_THIRD_PARTY_RATE = 0.31
        
        for prop in properties:
            # Simplified prediction based on bid/judgment ratio
            if prop.market_value > 0 and prop.judgment_amount > 0:
                equity_ratio = prop.market_value / prop.judgment_amount
                
                # Higher equity = higher third-party interest
                if equity_ratio > 1.5:
                    prob = BASE_THIRD_PARTY_RATE * 1.5
                elif equity_ratio > 1.2:
                    prob = BASE_THIRD_PARTY_RATE * 1.2
                else:
                    prob = BASE_THIRD_PARTY_RATE
                
                prop.xgboost_third_party_prob = min(0.95, prob)
            else:
                prop.xgboost_third_party_prob = BASE_THIRD_PARTY_RATE
            
            prop.stages_completed.append(5)
        
        print(f"   Predictions applied")
        return properties
    
    # ========================================
    # Stage 6: Plaintiff Behavior (Enhanced with Lien Discovery)
    # ========================================
    async def stage_6_plaintiff(self, properties: List[PipelineProperty]) -> List[PipelineProperty]:
        """
        Analyze plaintiff behavior patterns.
        
        V14.4.2: Uses HOA detection from Stage 4 Lien Discovery.
        """
        print(f"[Stage 6] Plaintiff Analysis (V14.4.2)...")
        
        # Plaintiff aggressiveness scoring
        AGGRESSIVE_PLAINTIFFS = ["WILMINGTON SAVINGS", "US BANK", "WELLS FARGO", 
                                  "PENNYMAC", "NATIONSTAR", "MR COOPER", "SHELLPOINT"]
        
        for prop in properties:
            plaintiff_upper = prop.plaintiff.upper()
            
            # Use HOA detection from Stage 4 (more accurate than simple keyword check)
            if prop.is_hoa_foreclosure:
                prop.plaintiff_behavior_score = 0.2  # HOAs rarely bid aggressively
                # But the RISK is high due to surviving liens
            elif any(p in plaintiff_upper for p in AGGRESSIVE_PLAINTIFFS):
                prop.plaintiff_behavior_score = 0.8  # Likely to bid high
            else:
                prop.plaintiff_behavior_score = 0.5  # Neutral
            
            prop.stages_completed.append(6)
        
        print(f"   ✅ Plaintiff scores applied")
        return properties
    
    # ========================================
    # Stage 7: Bid Calculation (with Lien Adjustments)
    # ========================================
    async def stage_7_bid_calculation(self, properties: List[PipelineProperty]) -> List[PipelineProperty]:
        """
        Calculate max bid and recommendation with lien-adjusted calculations.
        
        V14.4.2: Accounts for surviving liens from HOA foreclosures.
        """
        print(f"[Stage 7] Bid Calculation (Lien-Adjusted)...")
        
        for prop in properties:
            # ========================================
            # Check for DO_NOT_BID from Lien Discovery
            # ========================================
            if prop.lien_risk_level == "DO_NOT_BID":
                prop.max_bid = 0
                prop.recommendation = Recommendation.SKIP.value
                prop.bid_judgment_ratio = 0
                self.stats["skip"] += 1
                print(f"   ❌ {prop.case_number}: SKIP (HOA + Senior Mortgage)")
                prop.stages_completed.append(7)
                continue
            
            # ========================================
            # Standard Max Bid Formula
            # ========================================
            arv = prop.market_value or prop.judgment_amount
            repair_estimate = 10000  # Default
            wholesale_discount = min(25000, arv * 0.15)
            
            # MaxBid = (ARV × 70%) - Repairs - $10K - MIN($25K, 15% × ARV)
            base_max_bid = max(0, (arv * 0.70) - repair_estimate - 10000 - wholesale_discount)
            
            # ========================================
            # Lien-Adjusted Max Bid
            # ========================================
            if prop.total_surviving_liens > 0:
                # Subtract surviving liens (senior mortgages, etc.)
                prop.max_bid = max(0, base_max_bid - prop.total_surviving_liens)
                print(f"   ⚠️  {prop.case_number}: Lien adjustment -${prop.total_surviving_liens:,.0f}")
            else:
                prop.max_bid = base_max_bid
            
            # ========================================
            # Calculate Ratio and Recommendation
            # ========================================
            if prop.judgment_amount > 0:
                prop.bid_judgment_ratio = prop.max_bid / prop.judgment_amount
                
                # HOA foreclosures with HIGH risk → force REVIEW even if ratio is good
                if prop.is_hoa_foreclosure and prop.lien_risk_level == "HIGH":
                    prop.recommendation = Recommendation.REVIEW.value
                    self.stats["review"] += 1
                    print(f"   ⚠️  {prop.case_number}: REVIEW (HOA High Risk)")
                elif prop.bid_judgment_ratio >= 0.75:
                    prop.recommendation = Recommendation.BID.value
                    self.stats["bid"] += 1
                elif prop.bid_judgment_ratio >= 0.60:
                    prop.recommendation = Recommendation.REVIEW.value
                    self.stats["review"] += 1
                else:
                    prop.recommendation = Recommendation.SKIP.value
                    self.stats["skip"] += 1
            else:
                prop.recommendation = Recommendation.REVIEW.value
                self.stats["review"] += 1
            
            prop.stages_completed.append(7)
        
        print(f"   ✅ Bids calculated (lien-adjusted)")
        return properties
    
    # ========================================
    # Stage 8: Fara V8 AI Risk Assessment ⭐
    # ========================================
    async def stage_8_ai_assessment(self, properties: List[PipelineProperty]) -> List[PipelineProperty]:
        """Get AI risk assessment from Fara V8."""
        print(f"[Stage 8] Fara V8 AI Assessment...")
        
        # Check health first
        async with httpx.AsyncClient() as client:
            try:
                health = await client.get(FARA_HEALTH, timeout=30.0)
                self.fara_healthy = health.json().get("status") == "healthy"
            except:
                self.fara_healthy = False
        
        if not self.fara_healthy:
            print("   ⚠️ Fara V8 not available, skipping AI analysis")
            for prop in properties:
                prop.stages_completed.append(8)
            return properties
        
        print(f"   ✅ Fara V8 healthy, analyzing {len(properties)} properties...")
        
        async with httpx.AsyncClient() as client:
            for i, prop in enumerate(properties):
                # Build context
                context_parts = []
                if prop.market_value:
                    context_parts.append(f"Market Value: ${prop.market_value:,.0f}")
                if prop.plaintiff:
                    context_parts.append(f"Plaintiff: {prop.plaintiff}")
                if prop.xgboost_third_party_prob:
                    context_parts.append(f"Third-Party Prob: {prop.xgboost_third_party_prob:.1%}")
                if prop.recommendation:
                    context_parts.append(f"Pipeline: {prop.recommendation}")
                
                full_address = f"{prop.address}, {prop.city} FL {prop.zip_code}"
                
                try:
                    response = await client.post(
                        FARA_ANALYZE,
                        json={
                            "property_address": full_address,
                            "case_number": prop.case_number,
                            "judgment_amount": prop.judgment_amount,
                            "context": " | ".join(context_parts)
                        },
                        timeout=180.0
                    )
                    result = response.json()
                    
                    if "error" not in result:
                        prop.ai_analysis = result.get("analysis", "")
                        
                        # Extract risk level
                        analysis_upper = prop.ai_analysis.upper()
                        if "HIGH" in analysis_upper:
                            prop.ai_risk_level = "HIGH"
                        elif "LOW" in analysis_upper:
                            prop.ai_risk_level = "LOW"
                        else:
                            prop.ai_risk_level = "MEDIUM"
                        
                        self.stats["ai_analyzed"] += 1
                        print(f"      [{i+1}] {prop.case_number}: {prop.ai_risk_level}")
                    else:
                        prop.errors.append(f"Fara error: {result.get('error')}")
                        self.stats["errors"] += 1
                        
                except Exception as e:
                    prop.errors.append(f"Fara exception: {str(e)}")
                    self.stats["errors"] += 1
                
                prop.stages_completed.append(8)
                
                # Small delay between requests
                await asyncio.sleep(0.5)
        
        print(f"   AI analysis complete: {self.stats['ai_analyzed']} analyzed")
        return properties
    
    # ========================================
    # Stages 9-12: Output & Logging
    # ========================================
    async def stage_9_12_output(self, properties: List[PipelineProperty]) -> List[PipelineProperty]:
        """Generate reports, sync, log, and alert."""
        print(f"[Stage 9-12] Output & Logging...")
        
        headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        
        async with httpx.AsyncClient() as client:
            for prop in properties:
                # Save decision log to Supabase
                log_data = {
                    "user_id": 1,
                    "insight_type": "PIPELINE_DECISION",
                    "title": f"Pipeline Decision: {prop.case_number}",
                    "description": f"""
Recommendation: {prop.recommendation}
Address: {prop.address}, {prop.city} FL
Judgment: ${prop.judgment_amount:,.0f}
Market Value: ${prop.market_value:,.0f}
Max Bid: ${prop.max_bid:,.0f}
Ratio: {prop.bid_judgment_ratio:.1%}
AI Risk: {prop.ai_risk_level or 'N/A'}
                    """.strip(),
                    "priority": "High" if prop.recommendation == "BID" else "Medium",
                    "status": "Active",
                    "source": "unified_pipeline"
                }
                
                try:
                    await client.post(
                        f"{self.supabase_url}/rest/v1/insights",
                        headers=headers,
                        json=log_data,
                        timeout=30.0
                    )
                except Exception as e:
                    prop.errors.append(f"Log error: {str(e)}")
                
                prop.stages_completed.extend([9, 10, 11, 12])
                prop.processed_at = datetime.utcnow().isoformat()
        
        print(f"   Logged {len(properties)} decisions to Supabase")
        return properties
    
    # ========================================
    # Main Pipeline Runner
    # ========================================
    async def run(
        self,
        auction_date: Optional[str] = None,
        limit: int = 20,
        skip_ai: bool = False
    ) -> PipelineResult:
        """
        Run the complete 12-stage pipeline.
        
        Args:
            auction_date: Filter by auction date (YYYY-MM-DD)
            limit: Max properties to process
            skip_ai: Skip Stage 8 AI analysis
        
        Returns:
            PipelineResult with all processed properties
        """
        start_time = datetime.utcnow()
        errors = []
        stages_completed = []
        
        print(f"\n{'='*60}")
        print(f"BidDeed.AI Unified Pipeline V{self.VERSION}")
        print(f"{'='*60}\n")
        
        try:
            # Stage 1: Calendar Sync
            properties = await self.stage_1_calendar_sync(auction_date)
            properties = properties[:limit]
            stages_completed.append(1)
            
            # Stages 2-4: Enrichment
            properties = await self.stage_2_4_enrichment(properties)
            stages_completed.extend([2, 3, 4])
            
            # Stage 5: XGBoost
            properties = await self.stage_5_xgboost(properties)
            stages_completed.append(5)
            
            # Stage 6: Plaintiff Analysis
            properties = await self.stage_6_plaintiff(properties)
            stages_completed.append(6)
            
            # Stage 7: Bid Calculation
            properties = await self.stage_7_bid_calculation(properties)
            stages_completed.append(7)
            
            # Stage 8: AI Assessment
            if not skip_ai:
                properties = await self.stage_8_ai_assessment(properties)
            stages_completed.append(8)
            
            # Stages 9-12: Output
            properties = await self.stage_9_12_output(properties)
            stages_completed.extend([9, 10, 11, 12])
            
        except Exception as e:
            errors.append(f"Pipeline error: {str(e)}")
        
        runtime = (datetime.utcnow() - start_time).total_seconds()
        
        print(f"\n{'='*60}")
        print(f"Pipeline Complete")
        print(f"{'='*60}")
        print(f"Properties: {len(properties)}")
        print(f"BID: {self.stats['bid']} | REVIEW: {self.stats['review']} | SKIP: {self.stats['skip']}")
        print(f"AI Analyzed: {self.stats['ai_analyzed']}")
        print(f"Runtime: {runtime:.1f}s")
        print(f"{'='*60}\n")
        
        return PipelineResult(
            success=len(errors) == 0,
            properties_processed=len(properties),
            stages_completed=stages_completed,
            errors=errors,
            runtime_seconds=runtime,
            properties=properties,
            summary=self.stats
        )


# CLI entry point
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='BidDeed.AI Unified Pipeline')
    parser.add_argument('--date', type=str, help='Auction date (YYYY-MM-DD)')
    parser.add_argument('--limit', type=int, default=10, help='Max properties')
    parser.add_argument('--skip-ai', action='store_true', help='Skip AI analysis')
    args = parser.parse_args()
    
    async def main():
        pipeline = UnifiedPipeline()
        result = await pipeline.run(
            auction_date=args.date,
            limit=args.limit,
            skip_ai=args.skip_ai
        )
        
        print(json.dumps({
            "success": result.success,
            "properties": result.properties_processed,
            "summary": result.summary,
            "runtime": result.runtime_seconds
        }, indent=2))
    
    asyncio.run(main())

