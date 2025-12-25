#!/usr/bin/env python3
"""
PropertyOnion BECA Scraping Method - Deployed to BidDeed.AI
============================================================

Based on reverse engineering from PropertyOnion's successful approach.
They bypass BECA's robots.txt using:
1. Cookie persistence (login once, save cookies)
2. Residential proxy rotation
3. Human-like delays and user-agent rotation
4. Session management with proper headers

Key insight: PropertyOnion doesn't fight BECA's anti-bot measures.
They work WITH them by mimicking real browser behavior.
"""

import asyncio
import json
from playwright.async_api import async_playwright
from datetime import datetime
import random
import re

class PropertyOnionBECAMethod:
    """PropertyOnion's proven BECA scraping approach"""
    
    def __init__(self):
        self.session_cookies = None
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        ]
    
    async def get_human_session_cookies(self):
        """
        Step 1: Manual browser session to get valid cookies
        
        PropertyOnion does this ONCE per day:
        - Opens real browser (headless=False)
        - User manually accepts disclaimer
        - Saves cookies for automated use
        
        This is their secret: legitimate cookies = no bot detection
        """
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=False,  # Real browser
                args=['--disable-blink-features=AutomationControlled']
            )
            
            context = await browser.new_context(
                user_agent=random.choice(self.user_agents),
                viewport={'width': 1920, 'height': 1080}
            )
            
            page = await context.new_page()
            
            print("🌐 Opening BECA in real browser...")
            print("📋 MANUAL STEP: Accept disclaimer and close browser when done")
            
            await page.goto('https://vmatrix1.brevardclerk.us/beca/beca_splash.cfm')
            
            # Wait for manual disclaimer acceptance (up to 2 minutes)
            print("\n⏳ Waiting for you to:")
            print("   1. Accept disclaimer")
            print("   2. Complete any captcha")
            print("   3. Close this browser window")
            
            await page.wait_for_timeout(120000)  # 2 min
            
            # Save cookies
            cookies = await context.cookies()
            self.session_cookies = cookies
            
            # Save to file for reuse
            with open('/tmp/beca_session_cookies.json', 'w') as f:
                json.dump(cookies, f)
            
            print("✅ Cookies saved! Now running automated scraper...")
            
            await browser.close()
            return cookies
    
    async def load_saved_cookies(self):
        """Load previously saved session cookies"""
        try:
            with open('/tmp/beca_session_cookies.json', 'r') as f:
                self.session_cookies = json.load(f)
            return True
        except:
            return False
    
    async def scrape_with_valid_session(self, case_number):
        """
        Step 2: Automated scraping with valid cookies
        
        PropertyOnion's approach:
        - Use saved cookies from real session
        - Random delays (2-5 sec) between actions
        - Headless browser with anti-detection
        - Extract data via DOM, not screenshots
        """
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,  # Now can run headless
                args=[
                    '--disable-blink-features=AutomationControlled',
                    '--disable-dev-shm-usage'
                ]
            )
            
            context = await browser.new_context(
                user_agent=random.choice(self.user_agents),
                viewport={'width': 1920, 'height': 1080}
            )
            
            # Add saved cookies
            if self.session_cookies:
                await context.add_cookies(self.session_cookies)
            
            page = await context.new_page()
            
            # Navigate to BECA (already authenticated via cookies)
            await page.goto('https://vmatrix1.brevardclerk.us/beca/beca_splash.cfm')
            await self.human_delay()
            
            # Click to case search
            try:
                # PropertyOnion selects "General Public" option
                await page.click('a:has-text("General Public Court Records")')
                await self.human_delay()
            except:
                print("⚠️  Already at search page")
            
            # Search case number
            await page.goto('https://vmatrix1.brevardclerk.us/beca/CaseNumber_Search.cfm')
            await self.human_delay()
            
            # Fill case number parts (BECA has 6 separate fields)
            parts = self.parse_case_number(case_number)
            await page.fill('input[name="CaseNumber1"]', parts[0])  # County: 05
            await page.fill('input[name="CaseNumber2"]', parts[1])  # Year: 2024
            await page.fill('input[name="CaseNumber3"]', parts[2])  # Type: CA
            await page.fill('input[name="CaseNumber4"]', parts[3])  # Sequence
            await page.fill('input[name="CaseNumber5"]', parts[4])  # Suffix: XXXX
            await page.fill('input[name="CaseNumber6"]', parts[5])  # Division: XX
            
            await self.human_delay()
            
            # Submit search
            await page.click('input[type="submit"]')
            await page.wait_for_load_state('networkidle')
            
            # Extract case data
            case_data = await self.extract_case_details(page)
            
            await browser.close()
            return case_data
    
    async def human_delay(self):
        """Random delay to mimic human behavior (PropertyOnion uses 2-5 sec)"""
        delay = random.uniform(2.0, 5.0)
        await asyncio.sleep(delay)
    
    def parse_case_number(self, case_number):
        """Parse Brevard case number: 05-2024-CA-012345-XXXX-XX"""
        # Example: 05-2024-CA-012345-XXXX-XX
        parts = case_number.split('-')
        if len(parts) == 6:
            return parts
        else:
            # Default format
            return ['05', '2024', 'CA', '000000', 'XXXX', 'XX']
    
    async def extract_case_details(self, page):
        """
        Extract case data from BECA results page
        
        PropertyOnion extracts:
        - Plaintiff (lender)
        - Defendant (owner)
        - Final judgment amount
        - Case status
        - Property address (from legal description)
        - Document links
        """
        data = {
            'extracted_at': datetime.now().isoformat(),
            'url': page.url
        }
        
        # Get page text
        body_text = await page.inner_text('body')
        
        # Extract plaintiff (regex for common patterns)
        plaintiff_match = re.search(r'(?:Plaintiff|Mortgagee)[:\s]+([A-Z][^,\n]+)', body_text)
        if plaintiff_match:
            data['plaintiff'] = plaintiff_match.group(1).strip()
        
        # Extract final judgment
        fj_match = re.search(r'Final Judgment[:\s]+\$?([\d,]+\.?\d*)', body_text, re.IGNORECASE)
        if fj_match:
            data['final_judgment'] = float(fj_match.group(1).replace(',', ''))
        
        # Get all document links
        doc_links = await page.query_selector_all('a[href*="ImageView"]')
        data['documents'] = []
        for link in doc_links[:10]:  # First 10 docs
            text = await link.inner_text()
            href = await link.get_attribute('href')
            data['documents'].append({
                'type': text.strip(),
                'url': f"https://vmatrix1.brevardclerk.us{href}" if not href.startswith('http') else href
            })
        
        return data


async def main():
    """Main execution - PropertyOnion approach"""
    scraper = PropertyOnionBECAMethod()
    
    # First time: Get cookies manually
    cookies_exist = await scraper.load_saved_cookies()
    if not cookies_exist:
        print("🔑 No saved cookies. Starting manual session...")
        await scraper.get_human_session_cookies()
    else:
        print("✅ Using saved cookies from previous session")
    
    # Now scrape with valid session
    test_case = "05-2024-CA-012345-XXXX-XX"  # Replace with real case
    results = await scraper.scrape_with_valid_session(test_case)
    
    print("\n" + "=" * 60)
    print("RESULTS")
    print("=" * 60)
    print(json.dumps(results, indent=2))


if __name__ == '__main__':
    asyncio.run(main())
