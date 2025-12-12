"""
BidDeed.AI Census API Integration
=======================================
Demographics data from US Census Bureau API

Data includes:
- Median household income
- Population density
- Owner-occupied housing rates
- Median home values
- Education levels

© 2025 Ariel Shapira, Solo Founder - Everest Capital USA
"""

import os
import httpx
import asyncio
import logging
from typing import Optional, Dict, Any
from dataclasses import dataclass, asdict
from datetime import datetime

logger = logging.getLogger(__name__)

# Census API configuration
CENSUS_API_KEY = os.getenv("CENSUS_API_KEY", "")
CENSUS_BASE_URL = "https://api.census.gov/data"

# Brevard County FIPS
FLORIDA_FIPS = "12"
BREVARD_FIPS = "009"

# Variables to fetch (ACS 5-year estimates)
CENSUS_VARIABLES = {
    "B19013_001E": "median_household_income",
    "B25077_001E": "median_home_value", 
    "B01003_001E": "total_population",
    "B25003_002E": "owner_occupied_units",
    "B25003_001E": "total_housing_units",
    "B15003_022E": "bachelors_degree",
    "B15003_023E": "masters_degree",
    "B15003_025E": "doctorate_degree",
    "B25064_001E": "median_gross_rent",
    "B25002_002E": "occupied_units",
    "B25002_003E": "vacant_units"
}


@dataclass
class DemographicData:
    """Census demographic data for a location."""
    zip_code: str
    median_household_income: Optional[float] = None
    median_home_value: Optional[float] = None
    total_population: Optional[int] = None
    owner_occupied_rate: Optional[float] = None
    vacancy_rate: Optional[float] = None
    median_gross_rent: Optional[float] = None
    college_educated_rate: Optional[float] = None
    data_year: str = "2023"
    source: str = "US Census ACS 5-Year"


class CensusAPI:
    """US Census Bureau API client for demographic data."""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or CENSUS_API_KEY
        self.client = None
        
    async def _ensure_client(self):
        if not self.client:
            self.client = httpx.AsyncClient(timeout=30.0)
    
    async def get_demographics_by_zip(
        self, 
        zip_code: str
    ) -> Dict[str, Any]:
        """
        Get demographic data for a ZIP code.
        
        Args:
            zip_code: 5-digit ZIP code
            
        Returns:
            Dictionary with demographic data
        """
        await self._ensure_client()
        
        # Format ZIP code
        zip_code = str(zip_code).strip()[:5]
        
        try:
            # Build variable list
            var_list = ",".join(CENSUS_VARIABLES.keys())
            
            # ACS 5-year endpoint
            url = f"{CENSUS_BASE_URL}/2023/acs/acs5"
            
            params = {
                "get": f"NAME,{var_list}",
                "for": f"zip code tabulation area:{zip_code}",
                "key": self.api_key
            }
            
            response = await self.client.get(url, params=params)
            
            if response.status_code != 200:
                logger.warning(f"Census API returned {response.status_code}")
                return self._estimate_demographics(zip_code)
            
            data = response.json()
            
            if len(data) < 2:
                logger.warning(f"No Census data for ZIP {zip_code}")
                return self._estimate_demographics(zip_code)
            
            # Parse response (header row + data row)
            headers = data[0]
            values = data[1]
            raw_data = dict(zip(headers, values))
            
            # Calculate derived metrics
            demographics = self._parse_demographics(zip_code, raw_data)
            
            return {
                "zip_code": zip_code,
                "demographics": asdict(demographics),
                "raw_data": raw_data,
                "source": "census_api",
                "scraped_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Census API error: {e}")
            return self._estimate_demographics(zip_code)
    
    def _parse_demographics(
        self, 
        zip_code: str, 
        raw: Dict[str, str]
    ) -> DemographicData:
        """Parse raw Census data into DemographicData."""
        
        def safe_float(key: str) -> Optional[float]:
            val = raw.get(key)
            if val and val not in ["-", "null", ""]:
                try:
                    return float(val)
                except:
                    pass
            return None
        
        def safe_int(key: str) -> Optional[int]:
            val = safe_float(key)
            return int(val) if val else None
        
        # Calculate rates
        owner_rate = None
        total_units = safe_int("B25003_001E")
        owner_units = safe_int("B25003_002E")
        if total_units and owner_units:
            owner_rate = round(owner_units / total_units * 100, 1)
        
        vacancy_rate = None
        occupied = safe_int("B25002_002E")
        vacant = safe_int("B25002_003E")
        if occupied and vacant:
            total = occupied + vacant
            vacancy_rate = round(vacant / total * 100, 1)
        
        college_rate = None
        population = safe_int("B01003_001E")
        bachelors = safe_int("B15003_022E") or 0
        masters = safe_int("B15003_023E") or 0
        doctorate = safe_int("B15003_025E") or 0
        if population and population > 0:
            college_total = bachelors + masters + doctorate
            college_rate = round(college_total / population * 100, 1)
        
        return DemographicData(
            zip_code=zip_code,
            median_household_income=safe_float("B19013_001E"),
            median_home_value=safe_float("B25077_001E"),
            total_population=safe_int("B01003_001E"),
            owner_occupied_rate=owner_rate,
            vacancy_rate=vacancy_rate,
            median_gross_rent=safe_float("B25064_001E"),
            college_educated_rate=college_rate
        )
    
    def _estimate_demographics(self, zip_code: str) -> Dict[str, Any]:
        """Estimate demographics for Brevard County ZIP codes."""
        # Brevard County average estimates
        estimates = {
            "32937": {"income": 78000, "home_value": 380000, "vacancy": 5.2},  # Satellite Beach
            "32940": {"income": 82000, "home_value": 420000, "vacancy": 4.8},  # Melbourne/Viera
            "32953": {"income": 75000, "home_value": 340000, "vacancy": 5.6},  # Merritt Island
            "32903": {"income": 80000, "home_value": 450000, "vacancy": 5.1},  # Indialantic
            "32901": {"income": 52000, "home_value": 220000, "vacancy": 8.5},  # Melbourne (downtown)
            "32904": {"income": 58000, "home_value": 280000, "vacancy": 7.2},  # Melbourne (west)
            "32905": {"income": 55000, "home_value": 250000, "vacancy": 7.8},  # Palm Bay (north)
            "32907": {"income": 62000, "home_value": 290000, "vacancy": 6.5},  # Palm Bay (south)
            "32935": {"income": 60000, "home_value": 270000, "vacancy": 6.8},  # Eau Gallie
            "32922": {"income": 48000, "home_value": 180000, "vacancy": 9.2},  # Cocoa
            "32926": {"income": 55000, "home_value": 240000, "vacancy": 7.5},  # Cocoa (west)
            "32927": {"income": 58000, "home_value": 260000, "vacancy": 7.0},  # Sharpes
            "32931": {"income": 72000, "home_value": 350000, "vacancy": 5.8},  # Cocoa Beach
            "32949": {"income": 68000, "home_value": 320000, "vacancy": 6.2},  # Grant-Valkaria
            "32950": {"income": 65000, "home_value": 310000, "vacancy": 6.5},  # Malabar
            "32951": {"income": 85000, "home_value": 480000, "vacancy": 4.5},  # Melbourne Beach
            "32952": {"income": 68000, "home_value": 330000, "vacancy": 6.0},  # Merritt Island (south)
            "32955": {"income": 72000, "home_value": 360000, "vacancy": 5.5},  # Rockledge
        }
        
        est = estimates.get(zip_code, {"income": 65000, "home_value": 300000, "vacancy": 6.5})
        
        demographics = DemographicData(
            zip_code=zip_code,
            median_household_income=est["income"],
            median_home_value=est["home_value"],
            total_population=25000,  # Average
            owner_occupied_rate=68.0,  # Brevard average
            vacancy_rate=est["vacancy"],
            median_gross_rent=1600,  # Brevard average
            college_educated_rate=32.0  # Brevard average
        )
        
        return {
            "zip_code": zip_code,
            "demographics": asdict(demographics),
            "source": "brevard_estimates",
            "note": "Estimated from Brevard County averages",
            "scraped_at": datetime.now().isoformat()
        }
    
    async def close(self):
        """Close HTTP client."""
        if self.client:
            await self.client.aclose()


# Convenience function
async def get_demographics(zip_code: str) -> Dict[str, Any]:
    """Get demographics for a ZIP code."""
    api = CensusAPI()
    try:
        return await api.get_demographics_by_zip(zip_code)
    finally:
        await api.close()
