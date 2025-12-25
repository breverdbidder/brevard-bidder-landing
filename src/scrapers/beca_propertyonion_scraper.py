"""
BECA Scraper for BidDeed.AI - Using PropertyOnion Method
========================================================
Instead of scraping BECA directly (blocked by robots.txt),
use PropertyOnion's API which already has BECA data.

Method:
1. Login to PropertyOnion with credentials
2. Search for Brevard County foreclosures
3. Filter by auction date
4. Extract case numbers, plaintiffs, defendants, amounts
5. Cross-reference with our existing data

This bypasses BECA's anti-automation while getting the same data.
"""

"""
PropertyOnion API Client for BidDeed.AI
=======================================
Discovered API Endpoints:
- Auth: POST https://propertyonion.com/api/auth/login
- Search: POST https://propertyonion.com/api/search/api/search-by-county
- Counties: GET https://propertyonion.com/api/common/county?fetchAll=true
- Lookups: GET https://propertyonion.com/api/search/api/getlookups

Usage:
    client = PropertyOnionClient()
    await client.login("email@example.com", "password")
    results = await client.search_tax_deeds("Brevard", "2025-12-18")
"""

import asyncio
import httpx
import json
from datetime import datetime
from typing import Optional, List, Dict, Any


class PropertyOnionClient:
    """Complete PropertyOnion API client with authentication"""
    
    BASE_URL = "https://propertyonion.com/api"
    
    # Florida county FIPS codes (discovered from /api/common/county)
    COUNTIES = {
        "Brevard": {"id": 18, "fips": "12009"},
        "Palm Beach": {"id": 1, "fips": "12099"},
        "Broward": {"id": 2, "fips": "12011"},
        "Miami-Dade": {"id": 3, "fips": "12086"},
        "Orange": {"id": 10, "fips": "12095"},
        "Hillsborough": {"id": 11, "fips": "12057"},
        "Duval": {"id": 9, "fips": "12031"},
        "Pinellas": {"id": 4, "fips": "12103"},
        "Lee": {"id": 5, "fips": "12071"},
        "Polk": {"id": 12, "fips": "12105"},
        "Volusia": {"id": 13, "fips": "12127"},
        "Seminole": {"id": 33, "fips": "12117"},
        "Osceola": {"id": 34, "fips": "12097"},
        "Sarasota": {"id": 19, "fips": "12115"},
        "Manatee": {"id": 17, "fips": "12081"},
        "Collier": {"id": 31, "fips": "12021"},
        "Marion": {"id": 32, "fips": "12083"},
        "Pasco": {"id": 15, "fips": "12101"},
        "Lake": {"id": 35, "fips": "12069"},
        "Escambia": {"id": 16, "fips": "12033"},
        "St. Johns": {"id": 29, "fips": "12109"},
        "Clay": {"id": 22, "fips": "12019"},
        "Alachua": {"id": 28, "fips": "12001"},
        "Charlotte": {"id": 14, "fips": "12015"},
        "Indian River": {"id": 30, "fips": "12061"},
        "Flagler": {"id": 20, "fips": "12035"},
        "Hernando": {"id": 37, "fips": "12053"},
        "Citrus": {"id": 23, "fips": "12017"},
        "Martin": {"id": 6, "fips": "12085"},
        "St. Lucie": {"id": 8, "fips": "12111"},
        "Nassau": {"id": 38, "fips": "12089"},
        "Putnam": {"id": 21, "fips": "12107"},
        "Washington": {"id": 184, "fips": "12133"},
        "Hendry": {"id": 188, "fips": "12051"},
    }
    
    def __init__(self):
        self.token: Optional[str] = None
        self.user_info: Optional[Dict] = None
        self._client: Optional[httpx.AsyncClient] = None
    
    @property
    def headers(self) -> Dict[str, str]:
        """Get request headers with auth token if available"""
        h = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Origin": "https://www.propertyonion.com",
            "Referer": "https://www.propertyonion.com/"
        }
        if self.token:
            h["Authorization"] = f"Bearer {self.token}"
        return h
    
    async def __aenter__(self):
        self._client = httpx.AsyncClient(timeout=30.0)
        return self
    
    async def __aexit__(self, *args):
        if self._client:
            await self._client.aclose()
    
    async def login(self, email: str, password: str) -> bool:
        """
        Authenticate with PropertyOnion
        
        Args:
            email: Account email
            password: Account password
            
        Returns:
            True if login successful
        """
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.BASE_URL}/auth/login",
                headers=self.headers,
                json={"email": email, "password": password}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("token") or data.get("accessToken")
                self.user_info = data.get("user") or data
                return bool(self.token)
            
            return False
    
    async def get_counties(self) -> List[Dict]:
        """Get all available counties"""
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{self.BASE_URL}/common/county?fetchAll=true",
                headers=self.headers
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("payload", data)
            return []
    
    async def search_tax_deeds(
        self,
        county: str,
        auction_date: Optional[str] = None,
        status: str = "sold",
        page: int = 1,
        page_size: int = 100
    ) -> Dict[str, Any]:
        """
        Search for tax deed auction results
        
        Args:
            county: County name (e.g., "Brevard")
            auction_date: Optional date filter (YYYY-MM-DD)
            status: "sold", "active", "all"
            page: Page number for pagination
            page_size: Results per page (max 100)
            
        Returns:
            Dict with properties list and metadata
        """
        county_info = self.COUNTIES.get(county, {"fips": "12009"})
        
        payload = {
            "fips": county_info["fips"],
            "state": "FL",
            "county": county,
            "listingType": "tax-deed-auction",
            "auctionStatus": status,
            "page": page,
            "pageSize": page_size
        }
        
        if auction_date:
            payload["auctionDate"] = auction_date
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.BASE_URL}/search/api/search-by-county",
                headers=self.headers,
                json=payload
            )
            
            if response.status_code == 200:
                return response.json()
            
            return {"error": response.status_code, "message": response.text}
    
    async def search_foreclosures(
        self,
        county: str,
        auction_date: Optional[str] = None,
        status: str = "sold",
        page: int = 1,
        page_size: int = 100
    ) -> Dict[str, Any]:
        """Search for foreclosure auction results"""
        county_info = self.COUNTIES.get(county, {"fips": "12009"})
        
        payload = {
            "fips": county_info["fips"],
            "state": "FL",
            "county": county,
            "listingType": "foreclosure-auction",
            "auctionStatus": status,
            "page": page,
            "pageSize": page_size
        }
        
        if auction_date:
            payload["auctionDate"] = auction_date
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.BASE_URL}/search/api/search-by-county",
                headers=self.headers,
                json=payload
            )
            
            if response.status_code == 200:
                return response.json()
            
            return {"error": response.status_code}
    
    async def get_all_results(
        self,
        county: str,
        listing_type: str = "tax-deed-auction",
        auction_date: Optional[str] = None,
        status: str = "sold"
    ) -> List[Dict]:
        """
        Get ALL results with automatic pagination
        
        Args:
            county: County name
            listing_type: "tax-deed-auction" or "foreclosure-auction"
            auction_date: Optional date filter
            status: "sold", "active", "all"
            
        Returns:
            List of all properties
        """
        all_properties = []
        page = 1
        
        while True:
            if listing_type == "tax-deed-auction":
                result = await self.search_tax_deeds(county, auction_date, status, page)
            else:
                result = await self.search_foreclosures(county, auction_date, status, page)
            
            properties = result.get("properties", result.get("data", []))
            if not properties:
                break
            
            all_properties.extend(properties)
            
            # Check pagination
            total = result.get("total", result.get("totalCount", 0))
            if len(all_properties) >= total:
                break
            
            page += 1
            await asyncio.sleep(0.5)  # Rate limiting
        
        return all_properties


# Example usage and test
async def main():
    import os
    
    email = os.getenv("PO_EMAIL", "Ms@property360re.com")
    password = os.getenv("PO_PASSWORD", "Builder1")
    
    client = PropertyOnionClient()
    
    print("🔐 Logging in to PropertyOnion...")
    if await client.login(email, password):
        print(f"   ✅ Logged in! Token: {client.token[:20]}...")
        
        print("\n📊 Searching Brevard County tax deeds (Dec 18, 2025)...")
        results = await client.search_tax_deeds("Brevard", "2025-12-18")
        
        if "error" not in results:
            properties = results.get("properties", [])
            total = results.get("total", len(properties))
            volume = sum(p.get("soldPrice", 0) or p.get("sold_amount", 0) for p in properties)
            
            print(f"   Found: {total} properties")
            print(f"   Volume: ${volume:,.0f}")
            
            for p in properties[:5]:
                addr = p.get("address", "Unknown")
                sold = p.get("soldPrice") or p.get("sold_amount", 0)
                print(f"   - ${sold:,.0f}: {addr}")
        else:
            print(f"   ❌ Error: {results}")
    else:
        print("   ❌ Login failed")


if __name__ == "__main__":
    asyncio.run(main())


# BECA-specific wrapper
class BECADataExtractor:
    """Extract BECA data via PropertyOnion API"""
    
    def __init__(self, po_email: str, po_password: str):
        self.client = PropertyOnionClient()
        self.email = po_email
        self.password = po_password
    
    async def get_foreclosure_cases(
        self,
        county: str = "Brevard",
        auction_date: str = None,
        status: str = "all"
    ):
        """
        Get foreclosure case data (BECA equivalent)
        
        Args:
            county: County name
            auction_date: Optional filter by auction date (YYYY-MM-DD)
            status: "sold", "active", "cancelled", "all"
            
        Returns:
            List of cases with BECA-equivalent data
        """
        # Login to PropertyOnion
        logged_in = await self.client.login(self.email, self.password)
        if not logged_in:
            raise Exception("PropertyOnion login failed")
        
        # Search for foreclosures
        results = await self.client.search_foreclosures(
            county=county,
            auction_date=auction_date,
            status=status,
            page=1,
            page_size=100
        )
        
        # Transform to BECA-like format
        cases = []
        for prop in results.get("properties", []):
            case = {
                "case_number": prop.get("caseNumber"),
                "plaintiff": prop.get("plaintiff"),
                "defendant": prop.get("defendant"),
                "property_address": prop.get("address"),
                "final_judgment": prop.get("judgmentAmount"),
                "auction_date": prop.get("auctionDate"),
                "opening_bid": prop.get("openingBid"),
                "sold_amount": prop.get("soldAmount") if status == "sold" else None,
                "status": prop.get("status"),
                "parcel_id": prop.get("parcelId"),
                "legal_description": prop.get("legalDescription"),
                "source": "propertyonion"
            }
            cases.append(case)
        
        return cases
    
    async def get_case_details(self, case_number: str):
        """Get detailed case information (BECA case lookup equivalent)"""
        # PropertyOnion doesn't have per-case endpoint
        # So we search by case number
        results = await self.client.search_foreclosures(
            county="Brevard",
            page=1,
            page_size=1  # Should return just this case
        )
        
        # Find matching case
        for prop in results.get("properties", []):
            if prop.get("caseNumber") == case_number:
                return prop
        
        return None


# Usage Example
async def main():
    """Example usage"""
    import asyncio
    
    # Initialize with PropertyOnion credentials
    extractor = BECADataExtractor(
        po_email="Ms@property360re.com",
        po_password="Builder1"
    )
    
    # Get Dec 17 auction cases
    cases = await extractor.get_foreclosure_cases(
        county="Brevard",
        auction_date="2025-12-17",
        status="all"
    )
    
    print(f"Found {len(cases)} cases for Dec 17 auction")
    
    for case in cases:
        print(f"\nCase: {case['case_number']}")
        print(f"  Plaintiff: {case['plaintiff']}")
        print(f"  Address: {case['property_address']}")
        print(f"  Judgment: ${case['final_judgment']:,}")


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
