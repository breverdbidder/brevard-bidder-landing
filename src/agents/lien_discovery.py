#!/usr/bin/env python3
"""
BidDeed.AI Lien Discovery Agent

Analyzes properties for potential liens and encumbrances:
1. Tax assessment data from BCPAO
2. Homestead exemption status (missing = possible investor/distress)
3. Sales history patterns
4. Estimated annual taxes

Note: Full lien search requires AcclaimWeb access (official records)
This agent provides preliminary risk indicators.
"""

import asyncio
import httpx
from dataclasses import dataclass
from typing import Optional, List, Dict
from datetime import datetime
import json

BROWSER_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json",
    "Referer": "https://www.bcpao.us/PropertySearch/"
}

# Brevard County millage rates (approximate 2024)
# Source: Brevard County Property Appraiser
MILLAGE_RATES = {
    "PALM BAY": 18.5,
    "MELBOURNE": 19.2,
    "TITUSVILLE": 19.8,
    "COCOA": 20.1,
    "ROCKLEDGE": 18.9,
    "DEFAULT": 19.0
}

@dataclass
class TaxAssessment:
    """Tax assessment details from BCPAO."""
    roll_year: int
    market_value: float
    assessed_value: float
    taxable_value: float
    homestead_exemption: float
    estimated_annual_tax: float

@dataclass
class LienRiskIndicators:
    """Risk indicators for potential liens."""
    property_address: str
    parcel_id: str
    owner: str
    
    # Tax assessment
    current_assessment: Optional[TaxAssessment]
    estimated_annual_tax: float
    
    # Risk flags
    no_homestead: bool  # No homestead = investor or non-primary residence
    years_since_sale: int
    sale_price_vs_market: float  # Ratio of last sale to current market
    
    # Risk score (0-100, higher = more risk)
    risk_score: int
    risk_notes: List[str]

async def fetch_account_details(client: httpx.AsyncClient, account: str) -> Optional[Dict]:
    """Fetch full account details from BCPAO."""
    try:
        resp = await client.get(
            f"https://www.bcpao.us/api/v1/account/{account}",
            headers=BROWSER_HEADERS,
            timeout=15
        )
        if resp.status_code == 200:
            return resp.json()
    except Exception as e:
        print(f"Error fetching account {account}: {e}")
    return None

def calculate_estimated_tax(taxable_value: float, city: str) -> float:
    """Calculate estimated annual property tax."""
    # Get millage rate for city
    city_upper = city.upper().strip() if city else "DEFAULT"
    millage = MILLAGE_RATES.get(city_upper, MILLAGE_RATES["DEFAULT"])
    
    # Tax = (Taxable Value / 1000) * Millage Rate
    return (taxable_value / 1000) * millage

def analyze_lien_risk(details: Dict) -> LienRiskIndicators:
    """Analyze property for lien risk indicators."""
    risk_notes = []
    risk_score = 0
    
    # Extract basic info
    address = details.get('siteAddress', 'Unknown')
    parcel = details.get('parcelID', 'Unknown')
    owner = details.get('owner', 'Unknown')
    
    # Extract value summary
    value_summary = details.get('valueSummary', [{}])[0] if details.get('valueSummary') else {}
    market_value = value_summary.get('marketVal', 0) or 0
    taxable_value = value_summary.get('taxableVal', 0) or 0
    homestead_ex = value_summary.get('homesteadEx', 0) or 0
    roll_year = value_summary.get('rollYear', 2025)
    
    # Get city from millage description
    millage = details.get('millage', {})
    city = millage.get('description', 'DEFAULT')
    
    # Calculate estimated tax
    estimated_tax = calculate_estimated_tax(taxable_value, city)
    
    # Check homestead exemption
    no_homestead = homestead_ex == 0
    if no_homestead:
        risk_notes.append("⚠️ No homestead exemption (investor property or non-primary)")
        risk_score += 15
    
    # Sales history analysis
    sales_history = details.get('salesHistory', [])
    years_since_sale = 99
    last_sale_price = 0
    
    if sales_history:
        last_sale = sales_history[0]
        sale_date_str = last_sale.get('saleDate', '')
        last_sale_price = last_sale.get('salePrice', 0) or 0
        
        if sale_date_str:
            try:
                sale_date = datetime.fromisoformat(sale_date_str.replace('Z', '+00:00'))
                years_since_sale = (datetime.now() - sale_date.replace(tzinfo=None)).days // 365
            except:
                pass
    
    # Sale price vs market value ratio
    sale_price_vs_market = last_sale_price / market_value if market_value > 0 else 0
    
    if sale_price_vs_market > 1.3:
        risk_notes.append(f"📉 Bought at {sale_price_vs_market:.0%} of current value (underwater)")
        risk_score += 25
    
    if years_since_sale > 10 and no_homestead:
        risk_notes.append("🕐 Long-term non-homestead owner (possible rental investment)")
        risk_score += 10
    
    # Foreclosure = already in distress
    risk_notes.append("⚠️ Property in foreclosure (confirmed distress)")
    risk_score += 30
    
    # Create assessment
    current_assessment = TaxAssessment(
        roll_year=roll_year,
        market_value=market_value,
        assessed_value=value_summary.get('assessedVal', market_value),
        taxable_value=taxable_value,
        homestead_exemption=homestead_ex,
        estimated_annual_tax=estimated_tax
    )
    
    return LienRiskIndicators(
        property_address=address,
        parcel_id=parcel,
        owner=owner,
        current_assessment=current_assessment,
        estimated_annual_tax=estimated_tax,
        no_homestead=no_homestead,
        years_since_sale=years_since_sale,
        sale_price_vs_market=sale_price_vs_market,
        risk_score=min(100, risk_score),
        risk_notes=risk_notes
    )

def format_lien_report(indicators: LienRiskIndicators) -> str:
    """Format lien risk report."""
    a = indicators.current_assessment
    
    output = f"""
{'='*65}
LIEN RISK ANALYSIS
{'='*65}
📍 {indicators.property_address}
   Parcel: {indicators.parcel_id}
   Owner: {indicators.owner}

💰 TAX ASSESSMENT ({a.roll_year}):
   Market Value:      ${a.market_value:>12,.0f}
   Taxable Value:     ${a.taxable_value:>12,.0f}
   Homestead Exempt:  ${a.homestead_exemption:>12,.0f}
   Est. Annual Tax:   ${a.estimated_annual_tax:>12,.0f}

📊 RISK INDICATORS:
   Risk Score: {indicators.risk_score}/100 {'🔴 HIGH' if indicators.risk_score > 50 else '🟡 MEDIUM' if indicators.risk_score > 25 else '🟢 LOW'}
   Years Since Sale: {indicators.years_since_sale}
   Sale/Market Ratio: {indicators.sale_price_vs_market:.0%}
   
{'─'*65}
NOTES:
"""
    for note in indicators.risk_notes:
        output += f"  • {note}\n"
    
    output += f"""
{'─'*65}
⚠️ IMPORTANT: This is preliminary analysis only.
   Full lien search requires AcclaimWeb official records.
   Check for: HOA liens, municipal liens, IRS liens, judgment liens
{'='*65}
"""
    return output

async def analyze_properties(accounts: List[str]) -> List[LienRiskIndicators]:
    """Analyze multiple properties for lien risk."""
    results = []
    
    async with httpx.AsyncClient() as client:
        for account in accounts:
            details = await fetch_account_details(client, account)
            if details:
                indicators = analyze_lien_risk(details)
                results.append(indicators)
                print(f"✅ Analyzed {indicators.property_address}")
            await asyncio.sleep(0.5)  # Rate limiting
    
    return results

if __name__ == "__main__":
    # Test with sample properties
    test_accounts = ["2935858"]  # 1160 Tiger St
    
    async def main():
        results = await analyze_properties(test_accounts)
        for r in results:
            print(format_lien_report(r))
    
    asyncio.run(main())
