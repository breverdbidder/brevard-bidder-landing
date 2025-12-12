"""
BidDeed.AI - PropertyOnion Selenium Scraper
=================================================
Automated scraper for PropertyOnion.com (Angular SPA).
Uses Selenium for JavaScript rendering.
Runs on GitHub Actions at configurable intervals.

Author: Ariel Shapira, Solo Founder
        Real Estate Developer & Founder, Everest Capital USA
Version: 1.1.0
"""

import os
import re
import json
import time
import logging
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict, field

# Supabase integration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://mocerqjnksmhcjzxrewo.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("PropertyOnionScraper")

# Target ZIP codes from Third Sword strategy
TARGET_ZIPS = {"32937", "32940", "32953", "32903"}

# Try importing Selenium
try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.chrome.service import Service
    from selenium.common.exceptions import TimeoutException, NoSuchElementException
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False
    logger.warning("Selenium not available - install with: pip install selenium")

# Also try httpx for API fallback
try:
    import httpx
    HTTPX_AVAILABLE = True
except ImportError:
    HTTPX_AVAILABLE = False


@dataclass
class PropertyOnionListing:
    """Single property listing from PropertyOnion"""
    listing_id: str
    source: str = "propertyonion"
    
    # Address
    address: str = ""
    city: str = ""
    state: str = "FL"
    zip_code: str = ""
    county: str = "Brevard"
    
    # Auction Info
    auction_date: str = ""
    auction_type: str = ""  # 'Foreclosure Auction' or 'Tax Deed Auction'
    status: str = ""  # 'Pending', 'Canceled', 'Sold'
    sold_price: Optional[float] = None
    
    # Property Details
    beds: Optional[int] = None
    baths: Optional[float] = None
    sqft: Optional[int] = None
    lot_size: Optional[int] = None
    property_type: str = ""
    
    # Flags
    is_target_zip: bool = False
    
    # Metadata
    scraped_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    
    def to_dict(self) -> Dict:
        return asdict(self)


class PropertyOnionScraper:
    """
    Scrapes PropertyOnion.com using Selenium for JavaScript rendering.
    
    PropertyOnion is an Angular SPA that loads data via API calls.
    Selenium renders the page and extracts the DOM content.
    """
    
    BASE_URL = "https://propertyonion.com"
    SEARCH_URL = "https://propertyonion.com/property_search/Brevard-County"
    
    def __init__(self, headless: bool = True, wait_time: int = 15):
        """
        Initialize scraper.
        
        Args:
            headless: Run browser in headless mode
            wait_time: Seconds to wait for page load
        """
        self.headless = headless
        self.wait_time = wait_time
        self.driver = None
        self.listings: List[PropertyOnionListing] = []
        self.stats = {
            "total_scraped": 0,
            "pending": 0,
            "canceled": 0,
            "sold": 0,
            "foreclosure": 0,
            "tax_deed": 0,
            "target_zip_hits": 0,
            "errors": 0
        }
    
    def _init_driver(self):
        """Initialize Selenium WebDriver"""
        if not SELENIUM_AVAILABLE:
            raise RuntimeError("Selenium not installed")
        
        options = Options()
        if self.headless:
            options.add_argument("--headless=new")
        
        # Required for GitHub Actions / containerized environments
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--window-size=1920,1080")
        
        # User agent to look like regular browser
        options.add_argument(
            "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        
        self.driver = webdriver.Chrome(options=options)
        self.driver.set_page_load_timeout(60)
        logger.info("WebDriver initialized")
    
    def _close_driver(self):
        """Close WebDriver"""
        if self.driver:
            try:
                self.driver.quit()
            except:
                pass
            self.driver = None
    
    def _generate_listing_id(self, address: str, auction_date: str) -> str:
        """Generate unique ID from address and date"""
        raw = f"{address.lower().strip()}_{auction_date}"
        return hashlib.md5(raw.encode()).hexdigest()[:12]
    
    def _parse_price(self, price_str: str) -> Optional[float]:
        """Extract numeric price from string"""
        if not price_str:
            return None
        cleaned = re.sub(r'[^\d.]', '', price_str)
        try:
            return float(cleaned) if cleaned else None
        except ValueError:
            return None
    
    def _wait_for_listings(self):
        """Wait for property listings to load"""
        try:
            # Wait for loading indicator to disappear or property cards to appear
            WebDriverWait(self.driver, self.wait_time).until(
                lambda d: len(d.find_elements(By.CSS_SELECTOR, 
                    "div[class*='property'], div[class*='listing'], div[class*='card']")) > 0
                or "No properties" in d.page_source
            )
            # Extra wait for Angular to finish rendering
            time.sleep(2)
        except TimeoutException:
            logger.warning("Timeout waiting for listings to load")
    
    def _extract_listings_from_page(self) -> List[PropertyOnionListing]:
        """Extract listings from the current page source"""
        listings = []
        page_source = self.driver.page_source
        
        # Parse the rendered HTML
        # PropertyOnion shows listings in card format with:
        # - Status badge
        # - Auction type
        # - Date
        # - Address
        # - Property details
        
        # Pattern 1: Extract from rendered text (simpler approach)
        # Look for listing blocks - typically between status indicators
        
        # Find all text blocks that look like listings
        # Pattern: Status (Pending/Canceled/Sold) followed by Auction Type followed by Date followed by Address
        listing_pattern = re.compile(
            r'(Pending|Canceled|Sold\s+for\s*\$?\s*[\d,]+)\s*'
            r'(Foreclosure Auction|Tax Deed Auction)\s*'
            r'(\d{2}/\d{2}/\d{4})\s*'
            r'([^,]+),\s*([^,]+),?\s*FL\s*(\d{5})?'
            r'(?:\s*(\d+)\s*Beds?)?'
            r'(?:\s*([\d.]+)\s*Baths?)?'
            r'(?:\s*([\d,]+)\s*sqft)?',
            re.IGNORECASE | re.DOTALL
        )
        
        matches = listing_pattern.findall(page_source)
        logger.info(f"Found {len(matches)} listings via regex pattern")
        
        for match in matches:
            status_raw, auction_type, date, address, city, zip_code, beds, baths, sqft = match
            
            listing = PropertyOnionListing(
                listing_id=self._generate_listing_id(address, date)
            )
            
            # Parse status
            if 'Sold' in status_raw:
                listing.status = 'Sold'
                listing.sold_price = self._parse_price(status_raw)
            elif 'Canceled' in status_raw:
                listing.status = 'Canceled'
            else:
                listing.status = 'Pending'
            
            listing.auction_type = auction_type
            listing.auction_date = date
            listing.address = address.strip()
            listing.city = city.strip()
            listing.zip_code = zip_code.strip() if zip_code else ""
            
            # Property details
            if beds:
                try:
                    listing.beds = int(beds)
                except:
                    pass
            if baths:
                try:
                    listing.baths = float(baths)
                except:
                    pass
            if sqft:
                try:
                    listing.sqft = int(sqft.replace(',', ''))
                except:
                    pass
            
            # Check target ZIP
            listing.is_target_zip = listing.zip_code in TARGET_ZIPS
            
            listings.append(listing)
        
        # Alternative: Try parsing structured elements if regex fails
        if not listings:
            logger.info("Attempting DOM element parsing...")
            try:
                # Common property card selectors
                selectors = [
                    "div.property-card",
                    "div.listing-card", 
                    "div[class*='property-item']",
                    "div[class*='listing-item']",
                    "article.property"
                ]
                
                cards = []
                for selector in selectors:
                    cards = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    if cards:
                        logger.info(f"Found {len(cards)} cards with selector: {selector}")
                        break
                
                for card in cards:
                    try:
                        text = card.text
                        # Apply same regex to card text
                        match = listing_pattern.search(text)
                        if match:
                            # Same parsing logic as above
                            pass
                    except Exception as e:
                        logger.debug(f"Error parsing card: {e}")
                        
            except Exception as e:
                logger.warning(f"DOM parsing failed: {e}")
        
        return listings
    
    def scrape_page(self, url: str = None) -> List[PropertyOnionListing]:
        """Scrape a single page"""
        if not self.driver:
            self._init_driver()
        
        url = url or self.SEARCH_URL
        logger.info(f"Scraping: {url}")
        
        try:
            self.driver.get(url)
            self._wait_for_listings()
            
            listings = self._extract_listings_from_page()
            logger.info(f"Extracted {len(listings)} listings")
            
            return listings
            
        except Exception as e:
            logger.error(f"Error scraping page: {e}")
            self.stats["errors"] += 1
            return []
    
    def scrape_all(self, max_pages: int = 3, target_date: Optional[str] = None) -> List[PropertyOnionListing]:
        """
        Scrape multiple pages.
        
        Args:
            max_pages: Maximum pages to scrape
            target_date: Filter to specific date (MM/DD/YYYY)
        """
        all_listings = []
        
        try:
            self._init_driver()
            
            for page in range(1, max_pages + 1):
                url = self.SEARCH_URL
                if page > 1:
                    url = f"{url}?page={page}"
                
                page_listings = self.scrape_page(url)
                
                if not page_listings:
                    logger.info(f"No listings on page {page}, stopping")
                    break
                
                all_listings.extend(page_listings)
                
                # Wait between pages
                if page < max_pages:
                    time.sleep(3)
                    
        finally:
            self._close_driver()
        
        # Filter by date if specified
        if target_date:
            all_listings = [l for l in all_listings if l.auction_date == target_date]
            logger.info(f"Filtered to {len(all_listings)} for date {target_date}")
        
        # Deduplicate
        seen = set()
        unique = []
        for listing in all_listings:
            if listing.listing_id not in seen:
                seen.add(listing.listing_id)
                unique.append(listing)
        
        self.listings = unique
        self._update_stats()
        
        return unique
    
    def _update_stats(self):
        """Update statistics"""
        self.stats = {
            "total_scraped": len(self.listings),
            "pending": sum(1 for l in self.listings if l.status == 'Pending'),
            "canceled": sum(1 for l in self.listings if l.status == 'Canceled'),
            "sold": sum(1 for l in self.listings if l.status == 'Sold'),
            "foreclosure": sum(1 for l in self.listings if 'Foreclosure' in (l.auction_type or '')),
            "tax_deed": sum(1 for l in self.listings if 'Tax Deed' in (l.auction_type or '')),
            "target_zip_hits": sum(1 for l in self.listings if l.is_target_zip),
            "errors": self.stats.get("errors", 0)
        }
    
    def export_json(self, filepath: str = "propertyonion_data.json"):
        """Export to JSON"""
        data = {
            "scraped_at": datetime.now(timezone.utc).isoformat(),
            "stats": self.stats,
            "target_zips": list(TARGET_ZIPS),
            "listings": [l.to_dict() for l in self.listings]
        }
        
        os.makedirs(os.path.dirname(filepath) or ".", exist_ok=True)
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2, default=str)
        
        logger.info(f"Exported {len(self.listings)} listings to {filepath}")
        return filepath
    
    def save_to_supabase(self) -> int:
        """Save to Supabase"""
        if not SUPABASE_KEY or not HTTPX_AVAILABLE:
            logger.warning("Cannot save to Supabase (missing key or httpx)")
            return 0
        
        records = []
        for listing in self.listings:
            record = listing.to_dict()
            record["created_at"] = record.pop("scraped_at")
            records.append(record)
        
        if not records:
            return 0
        
        try:
            url = f"{SUPABASE_URL}/rest/v1/propertyonion_listings"
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "resolution=merge-duplicates"
            }
            
            with httpx.Client() as client:
                response = client.post(url, json=records, headers=headers, timeout=30.0)
            
            if response.status_code in (200, 201):
                logger.info(f"✅ Saved {len(records)} listings to Supabase")
                return len(records)
            else:
                logger.error(f"Supabase error: {response.status_code}")
                return 0
                
        except Exception as e:
            logger.error(f"Error saving to Supabase: {e}")
            return 0
    
    def print_summary(self):
        """Print summary"""
        print("\n" + "="*60)
        print("PropertyOnion Scrape Summary")
        print("="*60)
        print(f"Total listings: {self.stats['total_scraped']}")
        print(f"  - Pending: {self.stats['pending']}")
        print(f"  - Canceled: {self.stats['canceled']}")
        print(f"  - Sold: {self.stats['sold']}")
        print(f"\nBy Type:")
        print(f"  - Foreclosure: {self.stats['foreclosure']}")
        print(f"  - Tax Deed: {self.stats['tax_deed']}")
        print(f"\n🎯 Target ZIP Hits: {self.stats['target_zip_hits']}")
        
        target = [l for l in self.listings if l.is_target_zip]
        if target:
            print("\n🏠 Target ZIP Properties:")
            for l in target:
                icon = "⏳" if l.status == "Pending" else "❌" if l.status == "Canceled" else "✅"
                print(f"  {icon} {l.address}, {l.city} {l.zip_code}")
        
        print("="*60 + "\n")


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="PropertyOnion Selenium Scraper")
    parser.add_argument("--pages", type=int, default=3, help="Max pages")
    parser.add_argument("--date", type=str, help="Filter date (MM/DD/YYYY)")
    parser.add_argument("--output", type=str, default="data/propertyonion_latest.json")
    parser.add_argument("--save-db", action="store_true", help="Save to Supabase")
    parser.add_argument("--no-headless", action="store_true", help="Show browser")
    
    args = parser.parse_args()
    
    if not SELENIUM_AVAILABLE:
        print("❌ Selenium not installed. Install with: pip install selenium")
        return 1
    
    scraper = PropertyOnionScraper(headless=not args.no_headless)
    
    print(f"🔍 Scraping PropertyOnion (max {args.pages} pages)...")
    listings = scraper.scrape_all(max_pages=args.pages, target_date=args.date)
    
    scraper.print_summary()
    scraper.export_json(args.output)
    
    if args.save_db:
        saved = scraper.save_to_supabase()
        print(f"💾 Saved {saved} records to Supabase")
    
    return 0 if scraper.stats['errors'] == 0 else 1


if __name__ == "__main__":
    exit(main())
