#!/usr/bin/env python3
"""
BidDeed.AI - Fara V8 Pipeline Integration
==============================================
Connects Modal Fara V8 endpoint to the foreclosure pipeline.
Analyzes properties from Supabase and stores AI insights.

Author: Ariel Shapira, Solo Founder - Everest Capital USA
Version: 14.3.0
"""

import os
import json
import asyncio
import httpx
from datetime import datetime
from typing import List, Dict, Any, Optional

# Configuration
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://mocerqjnksmhcjzxrewo.supabase.co')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

# Modal Fara V8 endpoints
FARA_V8_BASE = "https://brevardbidderai--brevardbidderai-fara-v8"
FARA_HEALTH_URL = f"{FARA_V8_BASE}-health.modal.run"
FARA_ANALYZE_URL = f"{FARA_V8_BASE}-analyze.modal.run"
FARA_GENERATE_URL = f"{FARA_V8_BASE}-generate.modal.run"


class FaraIntegration:
    """Integration layer between BidDeed.AI pipeline and Modal Fara V8."""
    
    def __init__(self):
        self.supabase_url = SUPABASE_URL
        self.supabase_key = SUPABASE_KEY
        self.stats = {
            "analyzed": 0,
            "errors": 0,
            "saved": 0
        }
    
    async def check_health(self) -> Dict[str, Any]:
        """Check if Fara V8 is healthy."""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(FARA_HEALTH_URL, timeout=30.0)
                return response.json()
            except Exception as e:
                return {"status": "error", "error": str(e)}
    
    async def analyze_property(
        self, 
        address: str, 
        case_number: str, 
        judgment_amount: float,
        context: str = ""
    ) -> Dict[str, Any]:
        """Send property to Fara V8 for AI analysis."""
        payload = {
            "property_address": address,
            "case_number": case_number,
            "judgment_amount": judgment_amount,
            "context": context
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    FARA_ANALYZE_URL,
                    json=payload,
                    timeout=180.0  # 3 min for cold start + inference
                )
                result = response.json()
                
                if "error" not in result:
                    self.stats["analyzed"] += 1
                else:
                    self.stats["errors"] += 1
                
                return result
                
            except Exception as e:
                self.stats["errors"] += 1
                return {"error": str(e), "property": address}
    
    async def fetch_pending_auctions(
        self, 
        auction_date: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Fetch auctions from Supabase that need analysis."""
        headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json"
        }
        
        # Build query - get properties without AI analysis
        url = f"{self.supabase_url}/rest/v1/historical_auctions"
        params = {
            "select": "id,case_number,address,city,zip_code,final_judgment,market_value,auction_date,plaintiff,defendant",
            "limit": str(limit),
            "order": "auction_date.desc"
        }
        
        if auction_date:
            params["auction_date"] = f"eq.{auction_date}"
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, headers=headers, params=params, timeout=30.0)
                return response.json()
            except Exception as e:
                print(f"Error fetching auctions: {e}")
                return []
    
    async def save_analysis(
        self, 
        auction_id: int, 
        analysis: Dict[str, Any]
    ) -> bool:
        """Save AI analysis to Supabase insights table."""
        headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        
        insight_data = {
            "user_id": 1,
            "insight_type": "AI_PROPERTY_ANALYSIS",
            "title": f"Fara V8 Analysis - Auction #{auction_id}",
            "description": analysis.get("analysis", "No analysis generated"),
            "priority": "Medium",
            "status": "Active",
            "source": "fara_v8",
            "action_taken": json.dumps({
                "property": analysis.get("property"),
                "case": analysis.get("case"),
                "amount": analysis.get("amount"),
                "model": analysis.get("model"),
                "version": analysis.get("version"),
                "auction_id": auction_id,
                "analyzed_at": datetime.utcnow().isoformat()
            })
        }
        
        url = f"{self.supabase_url}/rest/v1/insights"
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, headers=headers, json=insight_data, timeout=30.0)
                if response.status_code in [200, 201]:
                    self.stats["saved"] += 1
                    return True
                else:
                    print(f"Error saving analysis: {response.text}")
                    return False
            except Exception as e:
                print(f"Error saving analysis: {e}")
                return False
    
    async def run_batch_analysis(
        self, 
        auction_date: Optional[str] = None,
        limit: int = 10
    ) -> Dict[str, Any]:
        """Run AI analysis on a batch of auctions."""
        print(f"🚀 Starting Fara V8 batch analysis...")
        
        # Check health first
        health = await self.check_health()
        if health.get("status") != "healthy":
            return {"error": "Fara V8 not healthy", "health": health}
        
        print(f"✅ Fara V8 healthy: {health.get('version')}")
        
        # Fetch auctions
        auctions = await self.fetch_pending_auctions(auction_date, limit)
        print(f"📋 Found {len(auctions)} auctions to analyze")
        
        results = []
        
        for i, auction in enumerate(auctions):
            address = f"{auction.get('address', 'Unknown')}, {auction.get('city', '')} FL {auction.get('zip_code', '')}"
            case_number = auction.get('case_number', 'Unknown')
            judgment = float(auction.get('final_judgment') or auction.get('market_value') or 0)
            
            # Build context from available data
            context_parts = []
            if auction.get('plaintiff'):
                context_parts.append(f"Plaintiff: {auction['plaintiff']}")
            if auction.get('market_value'):
                context_parts.append(f"Market Value: ${auction['market_value']:,.0f}")
            context = ". ".join(context_parts)
            
            print(f"  [{i+1}/{len(auctions)}] Analyzing: {case_number} - {address[:40]}...")
            
            # Call Fara V8
            analysis = await self.analyze_property(
                address=address,
                case_number=case_number,
                judgment_amount=judgment,
                context=context
            )
            
            # Save to Supabase
            if "error" not in analysis:
                await self.save_analysis(auction['id'], analysis)
                print(f"      ✅ Saved analysis")
            else:
                print(f"      ❌ Error: {analysis.get('error', 'Unknown')[:50]}")
            
            results.append({
                "auction_id": auction['id'],
                "case_number": case_number,
                "analysis": analysis
            })
            
            # Small delay to avoid overwhelming the endpoint
            await asyncio.sleep(1)
        
        print(f"\n📊 Batch complete: {self.stats}")
        
        return {
            "status": "complete",
            "stats": self.stats,
            "results": results
        }


async def main():
    """Main entry point for GitHub Actions."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Fara V8 Integration')
    parser.add_argument('--date', type=str, help='Auction date (YYYY-MM-DD)')
    parser.add_argument('--limit', type=int, default=10, help='Max auctions to analyze')
    parser.add_argument('--health', action='store_true', help='Just check health')
    args = parser.parse_args()
    
    integration = FaraIntegration()
    
    if args.health:
        health = await integration.check_health()
        print(json.dumps(health, indent=2))
        return
    
    result = await integration.run_batch_analysis(
        auction_date=args.date,
        limit=args.limit
    )
    
    print(json.dumps(result, indent=2, default=str))


if __name__ == "__main__":
    asyncio.run(main())
