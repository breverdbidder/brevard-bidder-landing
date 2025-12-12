#!/usr/bin/env python3
"""
BidDeed.AI V13.2.0 Configuration
"""

import os
from pathlib import Path

# Version
VERSION = "13.2.0"

# Paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
OUTPUT_DIR = BASE_DIR / "output"

# Supabase
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://kkvydsemyjlvqzuajpvx.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

# Browserless.io
BROWSERLESS_TOKEN = os.environ.get("BROWSERLESS_TOKEN", "")

# BECA URLs
BECA_HOME = "https://vmatrix1.brevardclerk.us/beca/"
BECA_SPLASH = "https://vmatrix1.brevardclerk.us/beca/beca_splash.cfm"
BECA_SEARCH = "https://vmatrix1.brevardclerk.us/beca/CaseNumber_Search.cfm"

# BCPAO API
BCPAO_API_URL = "https://gis.brevardfl.gov/gissrv/rest/services/Base_Map/Parcel_New_WKID2881/MapServer/5/query"

# Bid Analysis Settings
MAX_BID_FORMULA = {
    "arv_multiplier": 0.70,
    "holding_cost": 10000,
    "profit_cap": 25000,
    "profit_pct": 0.15,
    "default_repair_pct": 0.10
}

BID_THRESHOLDS = {
    "bid": 75,      # ≥75% = BID
    "review": 60,   # 60-74% = REVIEW
    "skip": 0       # <60% = SKIP
}

# Third Sword Strategy - Optimal ZIP codes
THIRD_SWORD_ZIPS = ["32937", "32940", "32953", "32903"]

# Logging
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
