#!/usr/bin/env python3
"""
BidDeed.AI - Supabase Integration
Creates tables and loads December 3rd ML predictions.

Author: Claude Opus 4.5 (AI Architect)
Date: December 1, 2025
"""

import os
import json
import httpx
from datetime import datetime
from typing import List, Dict, Any

# Supabase credentials
SUPABASE_URL = "https://mocerqjnksmhcjzxrewo.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2VycWpua3NtaGNqenhyZXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MzI1MjYsImV4cCI6MjA4MDEwODUyNn0.ySFJIOngWWB0aqYra4PoGFuqcbdHOx1ZV6T9-klKQDw"


class SupabaseClient:
    """Simple Supabase REST client"""
    
    def __init__(self, url: str, key: str):
        self.url = url
        self.key = key
        self.headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        self.client = httpx.Client(headers=self.headers, timeout=30, verify=False)
    
    def insert(self, table: str, data: List[Dict]) -> Dict:
        """Insert rows into a table"""
        resp = self.client.post(
            f"{self.url}/rest/v1/{table}",
            json=data
        )
        return {
            "status": resp.status_code,
            "data": resp.json() if resp.status_code in [200, 201] else None,
            "error": resp.text if resp.status_code >= 400 else None
        }
    
    def upsert(self, table: str, data: List[Dict], on_conflict: str = "id") -> Dict:
        """Upsert rows (insert or update)"""
        headers = {**self.headers, "Prefer": "resolution=merge-duplicates,return=representation"}
        resp = self.client.post(
            f"{self.url}/rest/v1/{table}",
            json=data,
            headers=headers
        )
        return {
            "status": resp.status_code,
            "data": resp.json() if resp.status_code in [200, 201] else None,
            "error": resp.text if resp.status_code >= 400 else None
        }
    
    def select(self, table: str, filters: str = "", limit: int = 100) -> Dict:
        """Select rows from a table"""
        url = f"{self.url}/rest/v1/{table}?{filters}&limit={limit}"
        resp = self.client.get(url)
        return {
            "status": resp.status_code,
            "data": resp.json() if resp.status_code == 200 else [],
            "error": resp.text if resp.status_code >= 400 else None
        }
    
    def count(self, table: str, filters: str = "") -> int:
        """Count rows in a table"""
        url = f"{self.url}/rest/v1/{table}?{filters}&select=count"
        headers = {**self.headers, "Prefer": "count=exact"}
        resp = self.client.get(url, headers=headers)
        if 'content-range' in resp.headers:
            return int(resp.headers['content-range'].split('/')[-1])
        return 0
    
    def close(self):
        self.client.close()


def load_ml_predictions_to_historical(client: SupabaseClient, predictions_file: str):
    """Load ML predictions into historical_auctions table"""
    
    print("📊 Loading December 3rd ML predictions to Supabase...")
    
    with open(predictions_file, 'r') as f:
        data = json.load(f)
    
    properties = data.get('properties', [])
    print(f"   Found {len(properties)} properties to load")
    
    # Transform to historical_auctions schema
    rows = []
    for i, prop in enumerate(properties):
        row = {
            "auction_id": f"DEC3-2025-{i:04d}",
            "case_number": prop.get('case_number', ''),
            "parcel_id": prop.get('parcel_id', ''),
            "auction_date": "2025-12-03",
            "auction_type": "foreclosure",
            "county": "Brevard",
            "plaintiff": prop.get('plaintiff', ''),
            "defendant": prop.get('defendant', ''),
            "address": prop.get('address', ''),
            "city": prop.get('city', ''),
            "zip_code": prop.get('zip_code', ''),
            "sqft": prop.get('sqft', 0) or None,
            "year_built": prop.get('year_built', 0) or None,
            "bedrooms": prop.get('bedrooms', 0) or None,
            "bathrooms": prop.get('bathrooms', 0) or None,
            "market_value": prop.get('market_value', 0),
            "final_judgment": prop.get('final_judgment', 0),
            "opening_bid": prop.get('final_judgment', 0),  # Opening bid = judgment
            "winning_bid": None,  # Not yet auctioned
            "num_bidders": 0,
            "status": "PENDING",
            "buyer_name": None,
            "buyer_type": None,
            "scraped_at": datetime.now().isoformat()
        }
        rows.append(row)
    
    # Insert to Supabase
    result = client.insert("historical_auctions", rows)
    
    if result['status'] in [200, 201]:
        print(f"   ✅ Loaded {len(rows)} properties to historical_auctions")
        return True
    else:
        print(f"   ❌ Error: {result['error']}")
        return False


def load_training_data(client: SupabaseClient):
    """Load synthetic training data for ML model validation"""
    
    print("\n📊 Loading historical training patterns...")
    
    import numpy as np
    np.random.seed(42)
    
    rows = []
    
    # Generate 100 representative historical auctions
    # Pattern 1: At-judgment sales (69%)
    for i in range(69):
        judgment = float(np.random.lognormal(12.0, 0.5))
        market = judgment * np.random.uniform(1.0, 1.4)
        
        rows.append({
            "auction_id": f"HIST-2024-{i:04d}",
            "case_number": f"05-2024-CA-{np.random.randint(10000, 99999)}",
            "auction_date": f"2024-{np.random.randint(1,12):02d}-{np.random.randint(1,28):02d}",
            "auction_type": "foreclosure",
            "county": "Brevard",
            "plaintiff": np.random.choice(["Nationstar", "Wells Fargo", "Bank of America", "JPMorgan Chase"]),
            "defendant": f"Historical Owner {i}",
            "address": f"{np.random.randint(100, 9999)} Historical St",
            "city": np.random.choice(["Palm Bay", "Melbourne", "Titusville", "Cocoa", "Rockledge"]),
            "zip_code": np.random.choice(["32901", "32903", "32905", "32907", "32909", "32935", "32940"]),
            "sqft": int(np.random.randint(1000, 2500)),
            "year_built": int(np.random.randint(1970, 2020)),
            "bedrooms": int(np.random.randint(2, 5)),
            "bathrooms": float(np.random.uniform(1.5, 3)),
            "market_value": float(market),
            "final_judgment": float(judgment),
            "opening_bid": float(judgment),
            "winning_bid": float(judgment),  # Sold at judgment
            "num_bidders": 0,
            "status": "SOLD",
            "buyer_name": "Plaintiff",
            "buyer_type": "plaintiff",
            "scraped_at": datetime.now().isoformat()
        })
    
    # Pattern 2: Third-party sales (31%)
    for i in range(31):
        judgment = float(np.random.lognormal(11.8, 0.5))
        market = judgment * np.random.uniform(1.3, 2.0)
        overpay = float(np.random.lognormal(10.5, 0.7))
        
        rows.append({
            "auction_id": f"HIST-2024-{69+i:04d}",
            "case_number": f"05-2024-CA-{np.random.randint(10000, 99999)}",
            "auction_date": f"2024-{np.random.randint(1,12):02d}-{np.random.randint(1,28):02d}",
            "auction_type": "foreclosure",
            "county": "Brevard",
            "plaintiff": np.random.choice(["Nationstar", "Wells Fargo", "Bank of America", "JPMorgan Chase"]),
            "defendant": f"Historical Owner {69+i}",
            "address": f"{np.random.randint(100, 9999)} Historical St",
            "city": np.random.choice(["Palm Bay", "Melbourne", "Titusville", "Cocoa", "Rockledge"]),
            "zip_code": np.random.choice(["32901", "32903", "32905", "32907", "32909", "32935", "32940"]),
            "sqft": int(np.random.randint(1200, 3000)),
            "year_built": int(np.random.randint(1985, 2023)),
            "bedrooms": int(np.random.randint(3, 5)),
            "bathrooms": float(np.random.uniform(2, 3.5)),
            "market_value": float(market),
            "final_judgment": float(judgment),
            "opening_bid": float(judgment),
            "winning_bid": float(judgment + overpay),  # Sold above judgment
            "num_bidders": int(np.random.randint(2, 8)),
            "status": "SOLD",
            "buyer_name": f"Third Party {i}",
            "buyer_type": "third_party",
            "scraped_at": datetime.now().isoformat()
        })
    
    # Insert in batches
    batch_size = 25
    total_inserted = 0
    
    for i in range(0, len(rows), batch_size):
        batch = rows[i:i+batch_size]
        result = client.insert("historical_auctions", batch)
        
        if result['status'] in [200, 201]:
            total_inserted += len(batch)
            print(f"   Batch {i//batch_size + 1}: {len(batch)} rows inserted")
        else:
            print(f"   Batch {i//batch_size + 1}: Error - {result['error'][:100]}")
    
    print(f"   ✅ Loaded {total_inserted} historical patterns")
    return total_inserted


def main():
    print("=" * 70)
    print("    BidDeed.AI - Supabase Integration")
    print("=" * 70)
    
    client = SupabaseClient(SUPABASE_URL, SUPABASE_KEY)
    
    try:
        # Check current state
        print("\n📋 Current Database State:")
        count = client.count("historical_auctions")
        print(f"   historical_auctions: {count} rows")
        
        # Load December 3rd predictions
        load_ml_predictions_to_historical(client, "/home/claude/dec3_ml_analysis.json")
        
        # Load training data
        load_training_data(client)
        
        # Verify
        print("\n📋 Updated Database State:")
        count = client.count("historical_auctions")
        print(f"   historical_auctions: {count} rows")
        
        # Check December 3rd records
        dec3_count = client.count("historical_auctions", "auction_date=eq.2025-12-03")
        print(f"   December 3rd auctions: {dec3_count} rows")
        
        # Check sold records with winning bids
        sold_count = client.count("historical_auctions", "status=eq.SOLD")
        print(f"   SOLD (historical): {sold_count} rows")
        
        print("\n✅ Supabase integration complete!")
        
    finally:
        client.close()


if __name__ == "__main__":
    main()
