#!/usr/bin/env python3
"""
BCPAO Property Scraper for BidDeed.AI V13.2.0
Fetches property data from Brevard County Property Appraiser

API: https://gis.brevardfl.gov/gissrv/rest/services/Base_Map/Parcel_New_WKID2881/MapServer/5

Author: BidDeed.AI
Version: 13.2.0
"""

import requests
import logging
from typing import Dict, Any, Optional, List
from dataclasses import dataclass

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('BCPAOScraper')

BCPAO_API_URL = "https://gis.brevardfl.gov/gissrv/rest/services/Base_Map/Parcel_New_WKID2881/MapServer/5/query"


@dataclass
class PropertyData:
    """BCPAO property data structure"""
    parcel_id: str
    address: str
    city: str
    zip_code: str
    owner_name: str
    just_value: float
    assessed_value: float
    land_value: float
    building_value: float
    year_built: int
    living_area: int
    bedrooms: int
    bathrooms: float
    lot_size: float
    property_use: str
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "parcel_id": self.parcel_id,
            "address": self.address,
            "city": self.city,
            "zip_code": self.zip_code,
            "owner_name": self.owner_name,
            "just_value": self.just_value,
            "assessed_value": self.assessed_value,
            "land_value": self.land_value,
            "building_value": self.building_value,
            "year_built": self.year_built,
            "living_area": self.living_area,
            "bedrooms": self.bedrooms,
            "bathrooms": self.bathrooms,
            "lot_size": self.lot_size,
            "property_use": self.property_use
        }


class BCPAOScraper:
    """Scraper for Brevard County Property Appraiser data"""
    
    def __init__(self, timeout: int = 30):
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'BidDeed.AI/13.2.0'
        })
    
    def search_by_address(self, address: str) -> Optional[PropertyData]:
        """Search for property by address"""
        try:
            # Clean address for search
            clean_addr = address.upper().strip()
            clean_addr = clean_addr.split(',')[0]  # Remove city/state
            
            params = {
                'where': f"UPPER(SITUS_ADDR) LIKE '%{clean_addr}%'",
                'outFields': '*',
                'returnGeometry': 'false',
                'f': 'json'
            }
            
            response = self.session.get(BCPAO_API_URL, params=params, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()
            
            if data.get('features') and len(data['features']) > 0:
                attrs = data['features'][0]['attributes']
                return self._parse_attributes(attrs)
            
            logger.warning(f"No results for: {address}")
            return None
            
        except Exception as e:
            logger.error(f"Search failed for {address}: {e}")
            return None
    
    def search_by_parcel(self, parcel_id: str) -> Optional[PropertyData]:
        """Search for property by parcel ID"""
        try:
            params = {
                'where': f"PARCEL = '{parcel_id}'",
                'outFields': '*',
                'returnGeometry': 'false',
                'f': 'json'
            }
            
            response = self.session.get(BCPAO_API_URL, params=params, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()
            
            if data.get('features') and len(data['features']) > 0:
                attrs = data['features'][0]['attributes']
                return self._parse_attributes(attrs)
            
            return None
            
        except Exception as e:
            logger.error(f"Search failed for parcel {parcel_id}: {e}")
            return None
    
    def _parse_attributes(self, attrs: Dict) -> PropertyData:
        """Parse BCPAO API attributes into PropertyData"""
        return PropertyData(
            parcel_id=attrs.get('PARCEL', ''),
            address=attrs.get('SITUS_ADDR', ''),
            city=attrs.get('SITUS_CITY', ''),
            zip_code=str(attrs.get('SITUS_ZIP', '')),
            owner_name=attrs.get('OWNER_NAME', ''),
            just_value=float(attrs.get('JUST_VAL', 0) or 0),
            assessed_value=float(attrs.get('ASSESSED_VAL', 0) or 0),
            land_value=float(attrs.get('LAND_VAL', 0) or 0),
            building_value=float(attrs.get('BLDG_VAL', 0) or 0),
            year_built=int(attrs.get('YEAR_BUILT', 0) or 0),
            living_area=int(attrs.get('LIVING_AREA', 0) or 0),
            bedrooms=int(attrs.get('BEDROOMS', 0) or 0),
            bathrooms=float(attrs.get('BATHROOMS', 0) or 0),
            lot_size=float(attrs.get('LOT_SIZE', 0) or 0),
            property_use=attrs.get('USE_CODE', '')
        )
    
    def enrich_foreclosure(self, case_data: Dict[str, Any]) -> Dict[str, Any]:
        """Enrich foreclosure case with BCPAO property data"""
        address = case_data.get('address', '')
        if not address:
            return case_data
        
        prop = self.search_by_address(address)
        if prop:
            case_data['bcpao_value'] = prop.just_value
            case_data['year_built'] = prop.year_built
            case_data['living_area'] = prop.living_area
            case_data['parcel_id'] = prop.parcel_id
            logger.info(f"✅ Enriched: {address} - ${prop.just_value:,.0f}")
        
        return case_data
    
    def enrich_batch(self, cases: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Enrich multiple foreclosure cases"""
        return [self.enrich_foreclosure(c) for c in cases]


if __name__ == '__main__':
    print("BCPAO Scraper - BidDeed.AI V13.2.0")
    
    scraper = BCPAOScraper()
    
    # Test addresses
    addresses = [
        "3711 BRANTLEY CIR",
        "1639 DITTMER CIR",
        "1060 ARON ST"
    ]
    
    for addr in addresses:
        result = scraper.search_by_address(addr)
        if result:
            print(f"✅ {addr}: ${result.just_value:,.0f} ({result.year_built})")
        else:
            print(f"❌ {addr}: Not found")
