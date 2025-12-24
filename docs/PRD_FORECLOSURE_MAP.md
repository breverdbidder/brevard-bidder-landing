# BidDeed.AI Foreclosure Map - Product Requirements Document

**Version:** 1.0.0  
**Date:** December 24, 2024  
**Author:** Ariel Shapira (Product Owner) + Claude Opus 4.5 (AI Architect)  
**Status:** ✅ DEPLOYED

---

## Executive Summary

The BidDeed.AI Foreclosure Map provides an interactive visualization of upcoming Brevard County foreclosure auctions, displaying property locations with ML-powered bid recommendations (BID/REVIEW/SKIP) on a dark-themed Leaflet map.

**Live URL:** https://brevard-bidder-landing.pages.dev/map

---

## Problem Statement

Foreclosure investors currently review auction lists in spreadsheet format, making it difficult to:
1. Visualize property distribution across Brevard County
2. Quickly identify BID-worthy properties by location
3. Assess neighborhood context (beach proximity, zip codes)
4. Navigate between multiple properties efficiently

---

## Solution

A single-page interactive map that:
1. Displays all upcoming auction properties as colored pins
2. Color-codes by recommendation: 🟢 BID | 🟡 REVIEW | 🔴 SKIP
3. Shows property details in popups (judgment, max bid, ML score, photo)
4. Filters by recommendation type
5. Links to property cards in sidebar for quick navigation

---

## Technical Specifications

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 Cloudflare Pages                        │
│          brevard-bidder-landing.pages.dev/map           │
├─────────────────────────────────────────────────────────┤
│  public/map.html (Static HTML/JS)                       │
│  ├── Leaflet.js (Map rendering)                         │
│  ├── CartoDB Dark Tiles (Base layer)                    │
│  └── Supabase REST API (Data source)                    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│               Supabase Database                         │
│          mocerqjnksmhcjzxrewo.supabase.co              │
├─────────────────────────────────────────────────────────┤
│  auction_results table                                  │
│  ├── case_number, property_address                      │
│  ├── latitude, longitude (geocoded)                     │
│  ├── judgment_amount, max_bid                           │
│  ├── recommendation (BID/REVIEW/SKIP)                   │
│  ├── ml_score (XGBoost probability)                     │
│  ├── bcpao_photo_url                                    │
│  └── auction_date                                       │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

```
Pipeline Stage 8 (Max Bid)
         │
         ▼
Pipeline Stage 10 (insert_results.py)
         │
         ├── Geocode via BCPAO or ZIP fallback
         │
         ▼
Supabase auction_results
         │
         ▼
map.html fetches via REST API
         │
         ▼
Leaflet renders colored markers
```

### Technology Stack

| Component | Technology | Cost |
|-----------|------------|------|
| Map Library | Leaflet.js 1.9.4 | FREE |
| Tile Layer | CartoDB Dark | FREE |
| Database | Supabase Pro | $25/mo |
| Hosting | Cloudflare Pages | FREE |
| Geocoding | BCPAO GIS + ZIP fallback | FREE |

---

## Features

### MVP (v1.0) - DEPLOYED ✅

- [x] Interactive Leaflet map centered on Brevard County
- [x] Colored circle markers (BID=green, REVIEW=yellow, SKIP=red)
- [x] Popup with property details on click
- [x] Sidebar with scrollable property cards
- [x] Click card to zoom to property
- [x] Filter buttons (All/BID/REVIEW/SKIP)
- [x] Stats bar (total, BID count, total judgment)
- [x] BCPAO photos in popups
- [x] Dark theme matching BidDeed.AI brand
- [x] Responsive design
- [x] Hardcoded sample data fallback
- [x] Supabase REST API integration

### Future (v1.1)

- [ ] Property search by address
- [ ] Draw polygon to filter area
- [ ] Heatmap layer for property density
- [ ] Click to generate DOCX report
- [ ] Compare mode (select 2-3 properties)
- [ ] Historical sale overlay
- [ ] Realtime updates via Supabase subscriptions

---

## Data Schema

### auction_results Table

```sql
CREATE TABLE auction_results (
  id SERIAL PRIMARY KEY,
  case_number VARCHAR(50) NOT NULL,
  property_address TEXT NOT NULL,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  zipcode VARCHAR(10),
  auction_date DATE NOT NULL,
  plaintiff VARCHAR(200),
  judgment_amount DECIMAL(12, 2),
  max_bid DECIMAL(12, 2),
  recommendation VARCHAR(10),  -- BID, REVIEW, SKIP
  ml_score DECIMAL(5, 4),
  bcpao_account VARCHAR(20),
  bcpao_photo_url TEXT,
  status VARCHAR(20) DEFAULT 'analyzed',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for map queries
CREATE INDEX idx_auction_results_date ON auction_results(auction_date);
CREATE INDEX idx_auction_results_recommendation ON auction_results(recommendation);
CREATE INDEX idx_auction_results_location ON auction_results(latitude, longitude);
```

---

## Geocoding Strategy

### Primary: BCPAO GIS Data
- Source: `bcpao_data.latitude`, `bcpao_data.longitude`
- Accuracy: Parcel-level (~10m)

### Fallback: ZIP Code Centroids
- 40 Brevard ZIP codes with hardcoded coordinates
- Accuracy: ~1-2 miles

### Default: County Center
- Coordinates: (28.2639, -80.7214)
- Used when no ZIP match

---

## Sample Data (Hardcoded)

12 properties with real Brevard addresses:

| Case | Address | Recommendation | Judgment |
|------|---------|----------------|----------|
| 05-2024-CA-045123 | 1450 Highway A1A, Satellite Beach | BID | $485,000 |
| 05-2024-CA-044892 | 3250 Suntree Blvd, Melbourne | BID | $425,000 |
| 05-2024-CA-043567 | 789 Ocean Ave, Indialantic | BID | $560,000 |
| 05-2024-CA-042981 | 456 N Atlantic Ave, Cocoa Beach | BID | $520,000 |
| 05-2024-CA-044215 | 2890 Courtenay Pkwy, Merritt Island | REVIEW | $445,000 |
| 05-2024-CA-043789 | 1234 S Patrick Dr, Melbourne Beach | REVIEW | $380,000 |
| 05-2024-CA-041654 | 567 Rockledge Dr, Rockledge | REVIEW | $315,000 |
| 05-2024-CA-044567 | 4521 Babcock St NE, Palm Bay | SKIP | $285,000 |
| 05-2024-CA-042345 | 890 Garden St, Titusville | SKIP | $195,000 |
| 05-2024-CA-040987 | 2341 Malabar Rd, Palm Bay | SKIP | $225,000 |
| 05-2024-CA-043210 | 678 Tropical Trl, Merritt Island | SKIP | $245,000 |
| 05-2024-CA-041876 | 1567 Aurora Rd, Melbourne | SKIP | $265,000 |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Page Load | <2s | Lighthouse |
| Map Render | <1s | Performance API |
| Filter Response | <100ms | User experience |
| Data Freshness | <1 day | Pipeline runs |

---

## Integration Points

1. **Pipeline Stage 10:** `insert_results.py` populates `auction_results`
2. **Navigation:** Links from `/chat` and main landing page
3. **Reports:** Future link to generate DOCX from map popup
4. **Mobile:** PWA-ready for field use at courthouse

---

## Deployment

```bash
# Files deployed to brevard-bidder-landing repo
public/map.html      # Main map page
public/_redirects    # /map -> /map.html 200!

# Auto-deploy via Cloudflare Pages
# Triggered by GitHub push to main branch
```

---

## Changelog

### v1.0.0 (December 24, 2024)
- Initial release
- 12 hardcoded sample properties
- Supabase integration with fallback
- Dark theme UI
- Mobile responsive
- Filter by recommendation

---

**Document End**
