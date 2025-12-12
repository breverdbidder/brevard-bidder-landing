"""
BidDeed.AI RealTDM Scraper
================================
Tax Deed Management - Tax Certificate lookup for Brevard County

Source: https://brevard.realtdm.com/
Data: Tax certificates, amounts, interest rates, redemption dates

© 2025 Ariel Shapira, Solo Founder - Everest Capital USA
"""

import os
import re
import httpx
import asyncio
import logging
from typing import Optional, Dict, List, Any
from dataclasses import dataclass, asdict
from datetime import datetime

logger = logging.getLogger(__name__)

# RealTDM URLs
REALTDM_BASE = "https://brevard.realtdm.com"
REALTDM_SEARCH = f"{REALTDM_BASE}/index.cfm"


@dataclass
class TaxCertificate:
    """Tax certificate data."""
    certificate_number: str
    year: int
    face_amount: float
    interest_rate: float
    status: str  # OUTSTANDING, REDEEMED, CANCELLED
    holder: str
    parcel_id: str
    redemption_date: Optional[str] = None


class RealTDMScraper:
    """Scraper for Brevard County tax certificates via RealTDM."""
    
    def __init__(self):
        self.client = None
        
    async def _ensure_client(self):
        if not self.client:
            self.client = httpx.AsyncClient(
                timeout=30.0,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
            )
    
    async def get_tax_certificates(
        self, 
        parcel_id: str
    ) -> Dict[str, Any]:
        """
        Get tax certificates for a parcel.
        
        Args:
            parcel_id: BCPAO parcel ID (e.g., "2512345")
            
        Returns:
            Dictionary with certificates and summary
        """
        await self._ensure_client()
        
        try:
            # Search by parcel ID
            params = {
                "zaction": "search",
                "parcelid": parcel_id.replace("-", "")
            }
            
            response = await self.client.get(REALTDM_SEARCH, params=params)
            
            if response.status_code != 200:
                logger.warning(f"RealTDM returned {response.status_code}")
                return self._empty_response(parcel_id)
            
            html = response.text
            
            # Parse certificates from HTML
            certificates = self._parse_certificates(html)
            
            # Calculate totals
            total_outstanding = sum(
                c.face_amount for c in certificates 
                if c.status == "OUTSTANDING"
            )
            
            return {
                "parcel_id": parcel_id,
                "certificates": [asdict(c) for c in certificates],
                "total_certificates": len(certificates),
                "outstanding_certificates": len([c for c in certificates if c.status == "OUTSTANDING"]),
                "total_outstanding_amount": total_outstanding,
                "has_tax_certificates": len(certificates) > 0,
                "scraped_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"RealTDM scrape error: {e}")
            return self._empty_response(parcel_id, str(e))
    
    def _parse_certificates(self, html: str) -> List[TaxCertificate]:
        """Parse tax certificates from HTML response."""
        certificates = []
        
        # Pattern for certificate rows
        cert_pattern = re.compile(
            r'Certificate.*?(\d{4}-\d+).*?'
            r'Year:\s*(\d{4}).*?'
            r'Face:\s*\$?([\d,]+\.?\d*).*?'
            r'Interest:\s*([\d.]+)%.*?'
            r'Status:\s*(\w+)',
            re.DOTALL | re.IGNORECASE
        )
        
        for match in cert_pattern.finditer(html):
            try:
                cert = TaxCertificate(
                    certificate_number=match.group(1),
                    year=int(match.group(2)),
                    face_amount=float(match.group(3).replace(",", "")),
                    interest_rate=float(match.group(4)),
                    status=match.group(5).upper(),
                    holder="Unknown",
                    parcel_id=""
                )
                certificates.append(cert)
            except (ValueError, IndexError) as e:
                logger.debug(f"Failed to parse certificate: {e}")
                continue
        
        return certificates
    
    def _empty_response(self, parcel_id: str, error: str = None) -> Dict[str, Any]:
        """Return empty response structure."""
        return {
            "parcel_id": parcel_id,
            "certificates": [],
            "total_certificates": 0,
            "outstanding_certificates": 0,
            "total_outstanding_amount": 0.0,
            "has_tax_certificates": False,
            "error": error,
            "scraped_at": datetime.now().isoformat()
        }
    
    async def close(self):
        """Close HTTP client."""
        if self.client:
            await self.client.aclose()


# Convenience function
async def get_tax_certificates(parcel_id: str) -> Dict[str, Any]:
    """Get tax certificates for a parcel."""
    scraper = RealTDMScraper()
    try:
        return await scraper.get_tax_certificates(parcel_id)
    finally:
        await scraper.close()
