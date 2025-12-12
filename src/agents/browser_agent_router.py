#!/usr/bin/env python3
"""
BidDeed.AI - Browser Agent Router V13.9.0
==============================================
Intelligent routing between Firecrawl and Fara-7B based on:
- Site requirements (auth, complexity)
- Firecrawl success/failure status
- Cost optimization

Author: Ariel Shapira, Solo Founder - Everest Capital USA
Version: 13.9.0
Date: December 7, 2025

© 2025 All Rights Reserved - Proprietary IP
"""

import os
import asyncio
import httpx
import json
from typing import Dict, Any, Optional, Literal
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum

# ============================================================================
# CONFIGURATION
# ============================================================================

FIRECRAWL_API_KEY = os.environ.get("FIRECRAWL_API_KEY")
FIRECRAWL_ENDPOINT = "https://api.firecrawl.dev/v1/scrape"

# Modal endpoint for Fara-7B (set after deployment)
MODAL_FARA_ENDPOINT = os.environ.get("MODAL_FARA_ENDPOINT", "https://brevardbidderai--fara-agent-api-scrape.modal.run")

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://mocerqjnksmhcjzxrewo.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")


class ScrapingMethod(Enum):
    """Available scraping methods."""
    DIRECT_API = "direct_api"      # httpx REST calls
    FIRECRAWL = "firecrawl"        # Firecrawl stealth proxy
    FIRECRAWL_JS = "firecrawl_js"  # Firecrawl with JS actions
    BROWSERLESS = "browserless"    # Browserless.io
    FARA_AGENT = "fara_agent"      # Modal Fara-7B


@dataclass
class SiteConfig:
    """Configuration for each scraping target."""
    name: str
    base_url: str
    requires_auth: bool = False
    requires_js: bool = False
    has_direct_api: bool = False
    api_endpoint: Optional[str] = None
    firecrawl_reliable: bool = True
    complexity: Literal["simple", "medium", "complex"] = "simple"
    fara_capable: bool = True
    notes: str = ""


# Site configurations
SITE_CONFIGS: Dict[str, SiteConfig] = {
    "beca": SiteConfig(
        name="BECA Clerk",
        base_url="https://vmatrix1.brevardclerk.us/beca",
        requires_js=True,
        complexity="complex",
        firecrawl_reliable=True,
        notes="Multi-step form navigation"
    ),
    "clerk_foreclosures": SiteConfig(
        name="Brevard Clerk Foreclosures",
        base_url="http://vweb2.brevardclerk.us/Foreclosures/foreclosure_sales.html",
        complexity="simple",
        firecrawl_reliable=True,
        fara_capable=False,  # Overkill
        notes="Simple HTML table"
    ),
    "bcpao": SiteConfig(
        name="BCPAO Property Appraiser",
        base_url="https://www.bcpao.us",
        has_direct_api=True,
        api_endpoint="https://www.bcpao.us/api/v1",
        fara_capable=False,  # API is better
        notes="Clean REST API available"
    ),
    "bcpao_gis": SiteConfig(
        name="BCPAO GIS",
        base_url="https://gis.brevardfl.gov",
        has_direct_api=True,
        api_endpoint="https://gis.brevardfl.gov/gissrv/rest/services/Base_Map/Parcel_New_WKID2881/MapServer/5/query",
        fara_capable=False,
        notes="ArcGIS REST API"
    ),
    "realforeclose": SiteConfig(
        name="RealForeclose",
        base_url="https://brevard.realforeclose.com",
        requires_auth=True,
        requires_js=True,
        complexity="complex",
        firecrawl_reliable=False,  # Auth wall
        notes="Requires login - PRIMARY FARA USE CASE"
    ),
    "acclaimweb": SiteConfig(
        name="AcclaimWeb Official Records",
        base_url="https://officialrecords.brevardclerk.us/AcclaimWeb",
        requires_js=True,
        complexity="medium",
        firecrawl_reliable=False,  # Often blocked
        notes="Frequent IP blocking"
    ),
    "census": SiteConfig(
        name="Census API",
        base_url="https://api.census.gov",
        has_direct_api=True,
        api_endpoint="https://api.census.gov/data/2022/acs/acs5",
        fara_capable=False,
        notes="Official government API"
    ),
    "tax_collector": SiteConfig(
        name="Brevard Tax Collector",
        base_url="https://brevardtaxcollector.com",
        requires_js=True,
        complexity="medium",
        firecrawl_reliable=True,
        notes="Tax certificate lookups"
    ),
}


@dataclass
class ScrapeResult:
    """Result from a scraping operation."""
    success: bool
    method: ScrapingMethod
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    credits_used: int = 0
    cost_estimate: float = 0.0
    duration_ms: int = 0
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())


class BrowserAgentRouter:
    """
    Intelligent router for BidDeed.AI scraping operations.
    Chooses optimal method based on site characteristics and previous failures.
    """
    
    def __init__(self):
        self.failure_counts: Dict[str, Dict[ScrapingMethod, int]] = {}
        self.stats = {
            "direct_api_calls": 0,
            "firecrawl_calls": 0,
            "fara_calls": 0,
            "total_credits": 0,
            "total_cost": 0.0,
        }
    
    def _choose_method(self, site_key: str, force_method: Optional[ScrapingMethod] = None) -> ScrapingMethod:
        """
        Choose optimal scraping method for a site.
        
        Priority:
        1. Direct API (if available) - fastest, cheapest
        2. Firecrawl (if reliable for site) - good for simple/medium
        3. Fara-7B (for auth sites or when Firecrawl fails)
        """
        if force_method:
            return force_method
        
        config = SITE_CONFIGS.get(site_key)
        if not config:
            return ScrapingMethod.FIRECRAWL  # Default
        
        # Check for direct API
        if config.has_direct_api:
            return ScrapingMethod.DIRECT_API
        
        # Check for auth requirement - must use Fara
        if config.requires_auth:
            return ScrapingMethod.FARA_AGENT
        
        # Check failure history
        failures = self.failure_counts.get(site_key, {})
        firecrawl_failures = failures.get(ScrapingMethod.FIRECRAWL, 0) + failures.get(ScrapingMethod.FIRECRAWL_JS, 0)
        
        # If Firecrawl has failed 3+ times recently, try Fara
        if firecrawl_failures >= 3 and config.fara_capable:
            return ScrapingMethod.FARA_AGENT
        
        # Use Firecrawl with JS if required
        if config.requires_js:
            return ScrapingMethod.FIRECRAWL_JS if config.firecrawl_reliable else ScrapingMethod.FARA_AGENT
        
        # Simple sites - basic Firecrawl
        return ScrapingMethod.FIRECRAWL
    
    async def scrape(
        self,
        site_key: str,
        params: Dict[str, Any],
        force_method: Optional[ScrapingMethod] = None,
        fallback_enabled: bool = True,
    ) -> ScrapeResult:
        """
        Execute scraping operation with intelligent routing.
        
        Args:
            site_key: Key from SITE_CONFIGS
            params: Site-specific parameters (case_number, address, etc.)
            force_method: Override automatic method selection
            fallback_enabled: Whether to try Fara if primary method fails
        """
        method = self._choose_method(site_key, force_method)
        config = SITE_CONFIGS.get(site_key)
        
        print(f"[Router] Scraping {site_key} via {method.value}")
        
        start_time = datetime.utcnow()
        
        try:
            if method == ScrapingMethod.DIRECT_API:
                result = await self._scrape_direct_api(config, params)
            elif method in (ScrapingMethod.FIRECRAWL, ScrapingMethod.FIRECRAWL_JS):
                result = await self._scrape_firecrawl(config, params, use_js=(method == ScrapingMethod.FIRECRAWL_JS))
            elif method == ScrapingMethod.FARA_AGENT:
                result = await self._scrape_fara(site_key, config, params)
            else:
                raise ValueError(f"Unknown method: {method}")
            
            # Record success
            self._record_attempt(site_key, method, success=True)
            
            duration = (datetime.utcnow() - start_time).total_seconds() * 1000
            result.duration_ms = int(duration)
            
            return result
            
        except Exception as e:
            # Record failure
            self._record_attempt(site_key, method, success=False)
            
            # Try fallback if enabled
            if fallback_enabled and config and config.fara_capable and method != ScrapingMethod.FARA_AGENT:
                print(f"[Router] Primary method failed, falling back to Fara-7B")
                return await self.scrape(site_key, params, force_method=ScrapingMethod.FARA_AGENT, fallback_enabled=False)
            
            return ScrapeResult(
                success=False,
                method=method,
                error=str(e)
            )
    
    async def _scrape_direct_api(self, config: SiteConfig, params: Dict) -> ScrapeResult:
        """Execute direct API call."""
        self.stats["direct_api_calls"] += 1
        
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(config.api_endpoint, params=params)
            response.raise_for_status()
            
            return ScrapeResult(
                success=True,
                method=ScrapingMethod.DIRECT_API,
                data=response.json(),
                cost_estimate=0.0
            )
    
    async def _scrape_firecrawl(self, config: SiteConfig, params: Dict, use_js: bool = False) -> ScrapeResult:
        """Execute Firecrawl scraping."""
        self.stats["firecrawl_calls"] += 1
        
        url = params.get("url", config.base_url)
        
        payload = {
            "url": url,
            "formats": ["markdown", "html"],
            "proxy": "stealth"
        }
        
        if use_js and "actions" in params:
            payload["actions"] = params["actions"]
        
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                FIRECRAWL_ENDPOINT,
                headers={"Authorization": f"Bearer {FIRECRAWL_API_KEY}", "Content-Type": "application/json"},
                json=payload
            )
            
            data = response.json()
            
            if not data.get("success"):
                raise Exception(f"Firecrawl error: {data.get('error')}")
            
            credits = data.get("data", {}).get("metadata", {}).get("creditsUsed", 1)
            self.stats["total_credits"] += credits
            cost = credits * 0.01  # ~$0.01 per credit
            self.stats["total_cost"] += cost
            
            return ScrapeResult(
                success=True,
                method=ScrapingMethod.FIRECRAWL_JS if use_js else ScrapingMethod.FIRECRAWL,
                data=data.get("data"),
                credits_used=credits,
                cost_estimate=cost
            )
    
    async def _scrape_fara(self, site_key: str, config: SiteConfig, params: Dict) -> ScrapeResult:
        """Execute Fara-7B agent scraping via Modal."""
        self.stats["fara_calls"] += 1
        
        # Map site_key to Fara target
        target_map = {
            "realforeclose": "realforeclose",
            "acclaimweb": "acclaimweb",
            "beca": "beca",
        }
        
        target = target_map.get(site_key, "generic")
        
        request_body = {
            "target": target,
            **params
        }
        
        async with httpx.AsyncClient(timeout=300) as client:  # 5 min timeout for agent tasks
            response = await client.post(
                MODAL_FARA_ENDPOINT,
                json=request_body
            )
            
            data = response.json()
            
            if data.get("status") in ("completed", "max_steps_reached"):
                cost = 0.025  # ~$0.025 per task
                self.stats["total_cost"] += cost
                
                return ScrapeResult(
                    success=True,
                    method=ScrapingMethod.FARA_AGENT,
                    data=data,
                    cost_estimate=cost
                )
            else:
                raise Exception(f"Fara agent error: {data.get('message', 'Unknown error')}")
    
    def _record_attempt(self, site_key: str, method: ScrapingMethod, success: bool):
        """Record scraping attempt for routing decisions."""
        if site_key not in self.failure_counts:
            self.failure_counts[site_key] = {}
        
        if not success:
            self.failure_counts[site_key][method] = self.failure_counts[site_key].get(method, 0) + 1
        else:
            # Reset failure count on success
            self.failure_counts[site_key][method] = 0
    
    def get_stats(self) -> Dict[str, Any]:
        """Get router statistics."""
        return {
            **self.stats,
            "failure_counts": self.failure_counts
        }


# ============================================================================
# CONVENIENCE FUNCTIONS
# ============================================================================

router = BrowserAgentRouter()


async def scrape_beca_case(case_number: str) -> ScrapeResult:
    """Scrape BECA case data."""
    parts = case_number.split('-')
    year, case_type, seq = parts[1], parts[2], parts[3]
    
    js_script = f'''var f=document.forms[0];f.CaseNumber2.value="{year}";f.CaseNumber3.value="{case_type}";f.CaseNumber4.value="{seq}";f.querySelector("input[type=submit]").click();'''
    
    return await router.scrape("beca", {
        "case_number": case_number,
        "actions": [
            {"type": "click", "selector": 'input[name="RadioChk"][value="Yes"]'},
            {"type": "click", "selector": 'input[type="submit"]'},
            {"type": "wait", "milliseconds": 1500},
            {"type": "click", "selector": "button:first-of-type"},
            {"type": "wait", "milliseconds": 1500},
            {"type": "click", "selector": 'a[href*="CaseNumber_Search"]'},
            {"type": "wait", "milliseconds": 1500},
            {"type": "executeJavascript", "script": js_script},
            {"type": "wait", "milliseconds": 4000}
        ]
    })


async def scrape_realforeclose_history(days_back: int = 30) -> ScrapeResult:
    """Scrape RealForeclose historical data (requires Fara)."""
    return await router.scrape("realforeclose", {"days_back": days_back})


async def scrape_acclaimweb_cot(case_number: str) -> ScrapeResult:
    """Scrape Certificate of Title from AcclaimWeb."""
    return await router.scrape("acclaimweb", {"case_number": case_number})


async def scrape_bcpao_property(address: str) -> ScrapeResult:
    """Fetch property data from BCPAO API."""
    clean_addr = address.upper().strip().split(',')[0]
    return await router.scrape("bcpao_gis", {
        "where": f"UPPER(SITUS_ADDR) LIKE '%{clean_addr}%'",
        "outFields": "*",
        "returnGeometry": "false",
        "f": "json"
    })


async def scrape_clerk_foreclosures() -> ScrapeResult:
    """Scrape Brevard Clerk foreclosure list."""
    return await router.scrape("clerk_foreclosures", {
        "url": "http://vweb2.brevardclerk.us/Foreclosures/foreclosure_sales.html"
    })


# ============================================================================
# CLI / TESTING
# ============================================================================

async def main():
    """Test the router with various sites."""
    print("=" * 60)
    print("BidDeed.AI Browser Agent Router V13.9.0")
    print("=" * 60)
    
    # Test BCPAO API (should use direct API)
    print("\n[TEST 1] BCPAO Property Lookup")
    result = await scrape_bcpao_property("1505 WATROUS DR")
    print(f"  Method: {result.method.value}")
    print(f"  Success: {result.success}")
    print(f"  Cost: ${result.cost_estimate:.4f}")
    
    # Test Clerk Foreclosures (should use Firecrawl)
    print("\n[TEST 2] Clerk Foreclosure List")
    result = await scrape_clerk_foreclosures()
    print(f"  Method: {result.method.value}")
    print(f"  Success: {result.success}")
    print(f"  Credits: {result.credits_used}")
    
    # Print stats
    print("\n[STATS]")
    stats = router.get_stats()
    print(f"  Direct API calls: {stats['direct_api_calls']}")
    print(f"  Firecrawl calls: {stats['firecrawl_calls']}")
    print(f"  Fara calls: {stats['fara_calls']}")
    print(f"  Total cost: ${stats['total_cost']:.4f}")


if __name__ == "__main__":
    asyncio.run(main())
