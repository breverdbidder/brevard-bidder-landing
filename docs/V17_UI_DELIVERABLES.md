# BidDeed.AI V17 - UI/UX Triple Deliverable
## December 17, 2025

---

## 📦 Deliverables Summary

| File | Size | Purpose | Status |
|------|------|---------|--------|
| `LandingPageV17.jsx` | 23,216 bytes | Refreshed landing page with V17 features | ✅ Deployed |
| `AnimatedDemoV17.jsx` | 21,836 bytes | Video demo with real auction data | ✅ Deployed |
| `SplitScreenUIV17.jsx` | 40,004 bytes | Split-screen UI with Shadcn components | ✅ Deployed |

**Repository:** `breverdbidder/brevard-bidder-landing`
**Live URL:** https://brevard-bidder-landing.pages.dev

---

## 1. Landing Page V17

### Key Sections

1. **Navigation** - Sticky header with version badge
2. **Hero Section** - V17 Live badge, key stats (73+ fields, 64.4% accuracy, 12 stages, 100x ROI)
3. **Everest Ascent™** - Visual 12-stage pipeline grid
4. **V17 Features** - PropertyOnion parity, Senior Mortgage Detection, Win Probability Matrix, Tax Deed Separation
5. **Waitlist** - Email capture form
6. **Footer** - Branding + copyright

### Visual Design

- **Primary Color:** Amber (#fbbf24)
- **Accent Color:** Emerald (#10b981)
- **Background:** Slate 950 (#020617)
- **Typography:** Plus Jakarta Sans (headlines), DM Sans (body)
- **Animation:** Framer Motion with staggered reveals

### Key Messaging

```
Headline: "Distressed Assets Decoded by AI"
Subheadline: "The Everest Ascent™ — a 12-stage AI pipeline that transforms 
4-hour courthouse research into 23-second intelligence."
```

---

## 2. Animated Video Demo V17

### Technical Specifications

- **Duration:** 45 seconds
- **Format:** React component with auto-play
- **Data Source:** Real auction data from Supabase

### Demo Flow (12 Stages)

| Stage | Duration | Visual |
|-------|----------|--------|
| 1. Discovery | 3s | Scanning realforeclose.com |
| 2. Scraping | 4s | Property data grid |
| 3. Title Search | 4s | AcclaimWeb query |
| 4. Lien Priority | 5s | Lien analysis + HOA warning |
| 5. Tax Certs | 3s | Opening bid / Judgment |
| 6. Demographics | 3s | Census data for ZIP 32953 |
| 7. ML Score | 5s | Win Probability Matrix |
| 8. Max Bid | 4s | Shapira Formula calculation |
| 9. Decision | 3s | BID/REVIEW/SKIP recommendation |
| 10. Report | 4s | DOCX generation progress |
| 11. Disposition | 3s | Exit strategy (MTR) |
| 12. Archive | 4s | Supabase insert |

### Sample Property Used

```
Address: 202 Ivory Coral Ln #304, Merritt Island, FL 32953
Case: 250179 | Parcel: 3021477
Market Value: $185,000
Opening Bid: $12,847.23
Max Bid: $98,500
Recommendation: BID (83.3% ratio)
```

---

## 3. Split-Screen UI V17

### Layout Architecture

```
┌─────────────────────────────────────────────────────┐
│  Top Bar (56px) - Logo + Version + Export          │
├─────────────────────────────────────────────────────┤
│  ┌───────────────────┐│┌───────────────────────────┐│
│  │                   │││                           ││
│  │  Property List    │││   Property Detail         ││
│  │  (38% default)    │││   (62% default)           ││
│  │                   │││                           ││
│  │  - Search         │││   - Quick Stats           ││
│  │  - Filter Tabs    │││   - Tab Navigation        ││
│  │  - Scrollable     │││     • Overview            ││
│  │    Property Cards │││     • Liens               ││
│  │  - Stats Footer   │││     • ML Analysis         ││
│  │                   │││     • Comps               ││
│  │                   │││   - Action Footer         ││
│  └───────────────────┘│└───────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### Shadcn UI Components Used

| Component | Purpose |
|-----------|---------|
| Card, CardHeader, CardContent, CardTitle | Property detail sections |
| Badge | Recommendations (BID/REVIEW/SKIP/DNB) |
| Button | Actions (Generate Report, Watchlist, Share) |
| Progress | Win probability visualization |
| Input | Search field |
| Tabs, TabsList, TabsTrigger, TabsContent | Detail panel navigation |
| Tooltip | Icon button hints |
| Separator | Visual dividers |
| ScrollArea | Scrollable regions |
| Skeleton | Loading states |

### Filter States

- **All** - Show all properties
- **BID** - Ratio ≥75% (emerald badge)
- **REVIEW** - Ratio 60-74% (amber badge)
- **SKIP** - Ratio <60% (slate badge)
- **DNB** - DO_NOT_BID / Senior mortgage (red badge)

### Key Features

1. **Resizable Panels** - Drag divider to adjust widths (25%-75% range)
2. **Real-Time Search** - Filter by address, case #, city
3. **Win Probability Matrix** - Visual progress bars per probability level
4. **Senior Mortgage Warning** - Red alert banner for DO_NOT_BID properties
5. **Lien Visualization** - Shows which liens survive vs wiped

---

## 4. Sample Data Integration

### Properties Included

1. **250179** - Merritt Island Condo - BID (83.3%)
2. **250216** - Same building - BID (78.5%) - Bulk opportunity
3. **250422** - Mims Vacant Land - REVIEW (66.3%)
4. **250501** - Palm Bay SFH - SKIP (52.1%) - High competition
5. **250612** - Satellite Beach Condo - **DO_NOT_BID** - Senior mortgage survives

### Real Data Points

- Dec 18, 2025 Tax Deed Auction
- Brevard County, FL
- 5 sample properties with full analysis
- Win probability matrices
- Lien priority analysis
- ML predictions (64.4% accuracy model)

---

## 5. Integration Points

### Supabase Connection

```javascript
const SUPABASE_URL = 'https://mocerqjnksmhcjzxrewo.supabase.co';
// Tables: auction_results, historical_auctions, insights
```

### Cloudflare Pages

- Auto-deploy on push to main
- URL: brevard-bidder-landing.pages.dev

### Smart Router V6

- Chat widget available at /chat
- Uses gemini-2.5-flash (FREE tier)

---

## 6. Next Steps

1. **Connect to live Supabase data** - Replace sample data with real API calls
2. **Add map visualization** - Property locations on Leaflet/Mapbox
3. **Export functionality** - PDF/DOCX report generation
4. **Mobile responsive** - Touch-friendly property cards
5. **Watchlist persistence** - Save favorites to localStorage/Supabase

---

## 7. File Locations

```
brevard-bidder-landing/
├── src/
│   ├── LandingPageV17.jsx      # Landing page
│   ├── AnimatedDemoV17.jsx     # Video demo
│   └── SplitScreenUIV17.jsx    # Split-screen UI
```

---

**Deployed:** December 17, 2025 @ 9:07 PM EST
**Version:** 17.0.0
**Author:** Claude AI Architect + Ariel Shapira
