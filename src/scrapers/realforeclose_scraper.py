"""
BidDeed.AI - RealForeclose Historical Plaintiff Scraper
============================================================
Scrapes historical auction results from RealForeclose to build
plaintiff-specific third-party sale rates.

IMPORTANT: RealForeclose requires authentication. You must:
1. Have a registered account at brevard.realforeclose.com
2. Set environment variables: RF_EMAIL and RF_PASSWORD
   OR pass credentials to the scraper

This scraper uses Selenium for browser automation since
RealForeclose uses session-based authentication.

Author: BidDeed.AI
Version: 13.1.2
"""

import os
import json
import re
import time
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict, field
import logging
import requests
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Try to import Selenium (optional - for full scraping)
try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.chrome.service import Service
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
BASE_URL = "https://brevard.realforeclose.com"
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://mocerqjnksmhcjzxrewo.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "sb_publishable_btGVcWgKtRRVFof1FNmrOw_fBcZR1iZ")


@dataclass
class AuctionResult:
    """Single auction result from RealForeclose"""
    auction_id: str
    auction_date: str
    case_number: str
    plaintiff: str
    plaintiff_normalized: str
    defendant: str
    address: str
    city: str
    zip_code: str
    parcel_id: str = ""
    final_judgment: float = 0.0
    opening_bid: float = 0.0
    winning_bid: float = 0.0
    num_bidders: int = 0
    buyer_name: str = ""
    buyer_type: str = ""  # 'third_party' or 'plaintiff'
    status: str = "SOLD"  # 'SOLD', 'CANCELLED', 'NO_BID'
    property_type: str = "SFR"
    market_value: float = 0.0
    sqft: int = 0
    year_built: int = 0
    bedrooms: int = 0
    bathrooms: float = 0.0
    scraped_at: str = field(default_factory=lambda: datetime.now().isoformat())


class PlaintiffNormalizer:
    """Normalize plaintiff names for consistent aggregation"""
    
    MAPPINGS = {
        # Major Banks
        'BANK OF AMERICA': ['BANK OF AMERICA', 'BOA', 'BOFA'],
        'WELLS FARGO': ['WELLS FARGO', 'WELLS-FARGO'],
        'JPMORGAN CHASE': ['JPMORGAN', 'JP MORGAN', 'CHASE', 'JPMORGAN CHASE'],
        'CITIBANK': ['CITIBANK', 'CITIMORTGAGE', 'CITI'],
        
        # Servicers
        'NATIONSTAR/MR COOPER': ['NATIONSTAR', 'MR. COOPER', 'MR COOPER'],
        'PHH/NEWREZ': ['PHH', 'NEWREZ', 'PHH MORTGAGE'],
        'CARRINGTON MORTGAGE': ['CARRINGTON'],
        'FREEDOM MORTGAGE': ['FREEDOM MORTGAGE', 'FREEDOM MTG'],
        'LAKEVIEW LOAN': ['LAKEVIEW', 'LAKEVIEW LOAN'],
        'PENNYMAC': ['PENNYMAC', 'PENNY MAC'],
        'OCWEN': ['OCWEN'],
        'SPECIALIZED LOAN': ['SPECIALIZED', 'SPECIALIZED LOAN'],
        'ROCKET MORTGAGE': ['ROCKET', 'QUICKEN'],
        'SHELLPOINT': ['SHELLPOINT', 'SHELL POINT'],
        'SELECT PORTFOLIO': ['SELECT PORTFOLIO', 'SPS'],
        
        # Trustees
        'BANK OF NY MELLON': ['BANK OF NY', 'BONY', 'MELLON', 'BNY MELLON'],
        'US BANK': ['US BANK', 'U.S. BANK', 'USB'],
        'DEUTSCHE BANK': ['DEUTSCHE', 'DEUTSCHE BANK'],
        'WILMINGTON TRUST': ['WILMINGTON', 'WILMINGTON TRUST', 'WILMINGTON SAVINGS'],
        'HSBC': ['HSBC'],
        
        # GSEs
        'FANNIE MAE': ['FANNIE', 'FANNIE MAE', 'FEDERAL NATIONAL'],
        'FREDDIE MAC': ['FREDDIE', 'FREDDIE MAC', 'FEDERAL HOME LOAN'],
        
        # Special
        'REVERSE MORTGAGE': ['REVERSE MORTGAGE', 'REVERSE MTG', 'HECM'],
    }
    
    @classmethod
    def normalize(cls, name: str) -> str:
        """Normalize plaintiff name"""
        if not name:
            return "UNKNOWN"
        
        name_upper = str(name).upper().strip()
        
        for normalized, patterns in cls.MAPPINGS.items():
            for pattern in patterns:
                if pattern in name_upper:
                    return normalized
        
        return name_upper[:40]


class BuyerTypeClassifier:
    """Classify buyer as third-party or back-to-plaintiff"""
    
    BANK_INDICATORS = [
        'BANK', 'MORTGAGE', 'LOAN', 'SERVICING', 'SAVINGS',
        'FEDERAL', 'NATIONAL', 'TRUST', 'FINANCIAL'
    ]
    
    INVESTOR_INDICATORS = [
        'LLC', 'INC', 'CORP', 'PROPERTIES', 'INVESTMENTS',
        'HOLDINGS', 'CAPITAL', 'VENTURES', 'REAL ESTATE',
        'REALTY', 'HOMES', 'GROUP', 'PARTNERS', 'FUND'
    ]
    
    @classmethod
    def classify(
        cls,
        plaintiff: str,
        buyer_name: str,
        winning_bid: float,
        final_judgment: float
    ) -> str:
        """
        Determine if buyer is third-party or back-to-plaintiff.
        
        Rules:
        1. If buyer name matches plaintiff -> plaintiff
        2. If winning bid at/near judgment and buyer has bank indicators -> plaintiff
        3. If winning bid significantly above judgment -> third_party
        4. If buyer has investor indicators -> third_party
        5. Default based on bid amount
        """
        if not buyer_name:
            return 'plaintiff'
        
        buyer_upper = buyer_name.upper()
        plaintiff_upper = (plaintiff or '').upper()
        
        # Check for plaintiff name match
        plaintiff_words = [w for w in plaintiff_upper.split() if len(w) > 3]
        if any(word in buyer_upper for word in plaintiff_words[:2]):
            return 'plaintiff'
        
        # Check bid relative to judgment
        if final_judgment > 0:
            overpay_ratio = winning_bid / final_judgment
        else:
            overpay_ratio = 1.0
        
        # Near judgment with bank indicators -> plaintiff
        if overpay_ratio <= 1.02:
            if any(ind in buyer_upper for ind in cls.BANK_INDICATORS):
                return 'plaintiff'
        
        # Significant overpay -> third_party
        if overpay_ratio > 1.10:
            return 'third_party'
        
        # Investor indicators -> third_party
        if any(ind in buyer_upper for ind in cls.INVESTOR_INDICATORS):
            return 'third_party'
        
        # Default based on overpay
        return 'third_party' if overpay_ratio > 1.02 else 'plaintiff'


class RealForecloseScraper:
    """
    Scraper for RealForeclose auction results.
    Supports both Selenium (full) and API-based (limited) scraping.
    """
    
    def __init__(self, email: str = None, password: str = None):
        self.email = email or os.getenv('RF_EMAIL')
        self.password = password or os.getenv('RF_PASSWORD')
        self.driver = None
        self.session = None
        self.results: List[AuctionResult] = []
        self.plaintiff_stats = {}
        
    def _init_selenium(self):
        """Initialize Selenium WebDriver"""
        if not SELENIUM_AVAILABLE:
            raise ImportError("Selenium not installed. Run: pip install selenium")
        
        options = Options()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920,1080')
        
        self.driver = webdriver.Chrome(options=options)
        logger.info("Selenium WebDriver initialized")
    
    def _login(self) -> bool:
        """Login to RealForeclose"""
        if not self.email or not self.password:
            logger.error("Credentials not provided. Set RF_EMAIL and RF_PASSWORD env vars.")
            return False
        
        try:
            self.driver.get(BASE_URL)
            time.sleep(2)
            
            # Find and fill login form
            email_input = self.driver.find_element(By.NAME, "email")
            password_input = self.driver.find_element(By.NAME, "password")
            
            email_input.send_keys(self.email)
            password_input.send_keys(self.password)
            
            # Submit
            submit_btn = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            submit_btn.click()
            
            time.sleep(3)
            
            # Check if login successful
            if "dashboard" in self.driver.current_url.lower() or "calendar" in self.driver.current_url.lower():
                logger.info("Login successful")
                return True
            else:
                logger.warning("Login may have failed")
                return False
                
        except Exception as e:
            logger.error(f"Login failed: {e}")
            return False
    
    def scrape_results_page(self, auction_date: str) -> List[AuctionResult]:
        """Scrape results for a specific auction date using Selenium"""
        results = []
        
        try:
            url = f"{BASE_URL}/index.cfm?zession=results&date={auction_date}"
            self.driver.get(url)
            time.sleep(2)
            
            # Wait for results table
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "table"))
            )
            
            # Find all auction result rows
            rows = self.driver.find_elements(By.CSS_SELECTOR, "tr.auction-row, tr[data-auction-id]")
            
            for row in rows:
                try:
                    result = self._parse_row(row, auction_date)
                    if result:
                        results.append(result)
                except Exception as e:
                    logger.debug(f"Failed to parse row: {e}")
            
            logger.info(f"Scraped {len(results)} results for {auction_date}")
            
        except Exception as e:
            logger.error(f"Error scraping {auction_date}: {e}")
        
        return results
    
    def _parse_row(self, row, auction_date: str) -> Optional[AuctionResult]:
        """Parse a result row from Selenium element"""
        try:
            cells = row.find_elements(By.TAG_NAME, "td")
            if len(cells) < 4:
                return None
            
            # Extract data from cells
            text_content = [cell.text.strip() for cell in cells]
            
            # Find case number
            case_number = ""
            for text in text_content:
                match = re.search(r'(\d{2}-\d{4,6}-CA-\d+)', text)
                if match:
                    case_number = match.group(1)
                    break
            
            if not case_number:
                return None
            
            # Find amounts
            amounts = []
            for text in text_content:
                money_matches = re.findall(r'\$[\d,]+(?:\.\d{2})?', text)
                for m in money_matches:
                    amounts.append(float(re.sub(r'[^\d.]', '', m)))
            
            final_judgment = amounts[0] if amounts else 0
            winning_bid = amounts[-1] if len(amounts) > 1 else final_judgment
            
            # Find address
            address = ""
            for text in text_content:
                if re.match(r'\d+\s+\w+.*(?:ST|AVE|BLVD|RD|DR|LN|CT|WAY|CIR)', text, re.I):
                    address = text
                    break
            
            # Find plaintiff
            plaintiff = ""
            for text in text_content:
                if any(ind in text.upper() for ind in ['BANK', 'MORTGAGE', 'LOAN', 'TRUST']):
                    plaintiff = text
                    break
            
            # Find buyer
            buyer_name = ""
            for i, text in enumerate(text_content):
                if 'sold to' in text.lower() or 'buyer' in text.lower():
                    buyer_name = text_content[i+1] if i+1 < len(text_content) else ""
                    break
            
            # Determine status and buyer type
            row_text = row.text.upper()
            if 'CANCELLED' in row_text:
                status = 'CANCELLED'
            elif 'NO BID' in row_text:
                status = 'NO_BID'
            else:
                status = 'SOLD'
            
            buyer_type = BuyerTypeClassifier.classify(
                plaintiff, buyer_name, winning_bid, final_judgment
            )
            
            return AuctionResult(
                auction_id=f"{auction_date}-{case_number}",
                auction_date=auction_date,
                case_number=case_number,
                plaintiff=plaintiff,
                plaintiff_normalized=PlaintiffNormalizer.normalize(plaintiff),
                defendant="",
                address=address,
                city="",
                zip_code="",
                final_judgment=final_judgment,
                opening_bid=final_judgment,
                winning_bid=winning_bid,
                num_bidders=1 if buyer_type == 'third_party' else 0,
                buyer_name=buyer_name,
                buyer_type=buyer_type,
                status=status
            )
            
        except Exception as e:
            logger.debug(f"Parse error: {e}")
            return None
    
    def scrape_from_supabase(self) -> List[AuctionResult]:
        """
        Load historical data from Supabase and analyze plaintiff behavior.
        This is a fallback when direct scraping isn't possible.
        """
        logger.info("Loading historical data from Supabase...")
        
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
        }
        
        try:
            resp = requests.get(
                f"{SUPABASE_URL}/rest/v1/historical_auctions",
                params={"status": "eq.SOLD", "limit": "1000"},
                headers=headers,
                verify=False,
                timeout=30
            )
            
            if resp.status_code != 200:
                logger.error(f"Supabase error: {resp.status_code}")
                return []
            
            data = resp.json()
            logger.info(f"Loaded {len(data)} records from Supabase")
            
            results = []
            for row in data:
                plaintiff = row.get('plaintiff', '')
                buyer_type = row.get('buyer_type', '')
                
                # Reclassify buyer type if needed
                if not buyer_type or buyer_type == 'unknown':
                    winning_bid = float(row.get('winning_bid', 0) or 0)
                    final_judgment = float(row.get('final_judgment', 0) or 0)
                    buyer_name = row.get('buyer_name', '')
                    buyer_type = BuyerTypeClassifier.classify(
                        plaintiff, buyer_name, winning_bid, final_judgment
                    )
                
                result = AuctionResult(
                    auction_id=row.get('auction_id', ''),
                    auction_date=row.get('auction_date', ''),
                    case_number=row.get('case_number', ''),
                    plaintiff=plaintiff,
                    plaintiff_normalized=PlaintiffNormalizer.normalize(plaintiff),
                    defendant=row.get('defendant', ''),
                    address=row.get('address', ''),
                    city=row.get('city', ''),
                    zip_code=row.get('zip_code', ''),
                    parcel_id=row.get('parcel_id', ''),
                    final_judgment=float(row.get('final_judgment', 0) or 0),
                    opening_bid=float(row.get('opening_bid', 0) or 0),
                    winning_bid=float(row.get('winning_bid', 0) or 0),
                    num_bidders=int(row.get('num_bidders', 0) or 0),
                    buyer_name=row.get('buyer_name', ''),
                    buyer_type=buyer_type,
                    status=row.get('status', 'SOLD'),
                    market_value=float(row.get('market_value', 0) or 0),
                    sqft=int(row.get('sqft', 0) or 0),
                    year_built=int(row.get('year_built', 0) or 0),
                    scraped_at=row.get('scraped_at', datetime.now().isoformat())
                )
                results.append(result)
            
            self.results = results
            return results
            
        except Exception as e:
            logger.error(f"Supabase error: {e}")
            return []
    
    def calculate_plaintiff_stats(self) -> Dict:
        """Calculate third-party rates by plaintiff from scraped data"""
        if not self.results:
            logger.warning("No results to analyze")
            return {}
        
        df = pd.DataFrame([asdict(r) for r in self.results])
        
        # Filter to SOLD only
        df = df[df['status'] == 'SOLD']
        
        if len(df) == 0:
            return {}
        
        # Create third-party flag
        df['is_third_party'] = df['buyer_type'] == 'third_party'
        
        # Calculate overpay
        df['overpay_pct'] = np.where(
            df['final_judgment'] > 0,
            ((df['winning_bid'] - df['final_judgment']) / df['final_judgment']) * 100,
            0
        )
        
        # Group by normalized plaintiff
        stats = df.groupby('plaintiff_normalized').agg({
            'auction_id': 'count',
            'is_third_party': ['sum', 'mean'],
            'final_judgment': 'mean',
            'winning_bid': 'mean',
            'overpay_pct': 'mean'
        })
        
        stats.columns = ['total_auctions', 'third_party_count', 'third_party_rate',
                        'avg_judgment', 'avg_winning_bid', 'avg_overpay_pct']
        
        # Filter to plaintiffs with at least 3 auctions for statistical significance
        stats = stats[stats['total_auctions'] >= 3]
        stats = stats.sort_values('total_auctions', ascending=False)
        
        self.plaintiff_stats = stats.to_dict('index')
        
        logger.info(f"Calculated stats for {len(self.plaintiff_stats)} plaintiffs")
        return self.plaintiff_stats
    
    def generate_plaintiff_behavior_update(self) -> Dict:
        """
        Generate updated PLAINTIFF_BEHAVIOR dictionary based on scraped data.
        This can be used to update the ML model.
        """
        if not self.plaintiff_stats:
            self.calculate_plaintiff_stats()
        
        behavior = {}
        
        for plaintiff, stats in self.plaintiff_stats.items():
            # Determine aggressiveness based on third-party rate
            tp_rate = stats['third_party_rate']
            if tp_rate < 0.20:
                aggressiveness = 0.8
                category = 'major_bank'
            elif tp_rate < 0.35:
                aggressiveness = 0.5
                category = 'servicer'
            elif tp_rate < 0.50:
                aggressiveness = 0.3
                category = 'trustee'
            else:
                aggressiveness = 0.1
                category = 'passive'
            
            behavior[plaintiff] = {
                'base_third_party_rate': round(tp_rate, 3),
                'bid_aggressiveness': aggressiveness,
                'avg_overpay_when_third_party': round(stats['avg_overpay_pct'] / 100, 3),
                'category': category,
                'sample_size': int(stats['total_auctions'])
            }
        
        return behavior
    
    def export_results(self, filepath: str):
        """Export results to JSON"""
        output = {
            'scraped_at': datetime.now().isoformat(),
            'source': 'RealForeclose/Supabase',
            'total_results': len(self.results),
            'plaintiff_stats': self.plaintiff_stats,
            'plaintiff_behavior_update': self.generate_plaintiff_behavior_update(),
            'results': [asdict(r) for r in self.results]
        }
        
        with open(filepath, 'w') as f:
            json.dump(output, f, indent=2, default=str)
        
        logger.info(f"Exported to {filepath}")
    
    def close(self):
        """Clean up resources"""
        if self.driver:
            self.driver.quit()


def main():
    """Main scraping function"""
    print("=" * 70)
    print("    BidDeed.AI - RealForeclose Plaintiff Scraper")
    print("=" * 70)
    
    scraper = RealForecloseScraper()
    
    try:
        # Try to load from Supabase first (always available)
        results = scraper.scrape_from_supabase()
        
        if results:
            # Calculate plaintiff stats
            stats = scraper.calculate_plaintiff_stats()
            
            print("\n" + "=" * 70)
            print("    PLAINTIFF THIRD-PARTY RATES")
            print("=" * 70)
            
            print(f"\n{'Plaintiff':<30} {'Auctions':>8} {'3rd Party':>10} {'Rate':>8} {'Overpay':>10}")
            print("-" * 70)
            
            for plaintiff, data in list(stats.items())[:20]:
                rate = data['third_party_rate'] * 100
                overpay = data['avg_overpay_pct']
                print(f"{plaintiff:<30} {data['total_auctions']:>8} {data['third_party_count']:>10} {rate:>7.1f}% {overpay:>9.1f}%")
            
            # Generate behavior update
            behavior = scraper.generate_plaintiff_behavior_update()
            
            print("\n" + "=" * 70)
            print("    PLAINTIFF_BEHAVIOR UPDATE (for ML model)")
            print("=" * 70)
            
            for plaintiff, data in list(behavior.items())[:10]:
                print(f"\n'{plaintiff}': {{")
                print(f"    'base_third_party_rate': {data['base_third_party_rate']},")
                print(f"    'bid_aggressiveness': {data['bid_aggressiveness']},")
                print(f"    'avg_overpay_when_third_party': {data['avg_overpay_when_third_party']},")
                print(f"    'category': '{data['category']}',")
                print(f"    'sample_size': {data['sample_size']}")
                print("},")
            
            # Export
            scraper.export_results('/home/claude/plaintiff_historical_data.json')
            
            print(f"\n✅ Analyzed {len(results)} auction results")
            print(f"✅ Generated stats for {len(stats)} plaintiffs")
        else:
            print("❌ No data available. Check Supabase connection.")
            
    finally:
        scraper.close()


if __name__ == "__main__":
    main()
