#!/usr/bin/env python3
"""
BECA V20 Address Fix - Adds property address extraction
To be merged into src/scrapers/beca_scraper_manus_v20.py
"""

import re

# Address extraction patterns for Florida foreclosure documents
ADDRESS_PATTERNS = [
    (r'(?:Property|Subject|Real)\s*(?:Address|Property)[:\s]*(\d+[^,\n]+,\s*[^,\n]+,?\s*FL\s*\d{5})', 0.95),
    (r'(?:commonly known as|known as|located at)[:\s]*(\d+[^,\n]+,\s*[^,\n]+,?\s*FL\s*\d{5})', 0.95),
    (r'(\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Drive|Dr|Road|Rd|Lane|Ln|Way|Court|Ct|Circle|Cir|Boulevard|Blvd|Place|Pl)[.,]?\s*(?:Melbourne|Palm Bay|Titusville|Cocoa|Rockledge|Merritt Island|Satellite Beach|Indialantic|Viera|Cape Canaveral),?\s*FL\s*\d{5})', 0.9),
    (r'(\d{2,5}\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Drive|Dr|Road|Rd|Lane|Ln|Way|Court|Ct)[^,\n]*,\s*FL\s*\d{5})', 0.85),
]

BREVARD_ZIPS = {'32754','32780','32796','32901','32903','32904','32905','32907','32908','32909',
                '32920','32922','32926','32927','32931','32935','32937','32940','32949','32950',
                '32951','32952','32953','32955'}

def extract_address(text: str):
    """Extract property address from document text."""
    if not text:
        return None
    
    for pattern, confidence in ADDRESS_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            address = match.strip()
            zip_match = re.search(r'(\d{5})', address)
            if zip_match and zip_match.group(1) in BREVARD_ZIPS:
                return address
            if zip_match and re.match(r'^\d+', address) and len(address) > 15:
                return address
    
    return None

if __name__ == "__main__":
    # Test
    test_text = """
    FINAL JUDGMENT OF FORECLOSURE
    The property commonly known as 1234 Palm Bay Road NE, Palm Bay, FL 32905
    shall be sold at public auction...
    Total indebtedness: $250,000.00
    """
    print(f"Extracted: {extract_address(test_text)}")
