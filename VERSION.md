# BidDeed.AI Version History

## V19.0.0 - December 24, 2025 (CURRENT)

### 🗺️ Foreclosure Map Feature
- **Interactive Leaflet map** at `/map` route
- **Color-coded markers**: 🟢 BID | 🟡 REVIEW | 🔴 SKIP
- **Property popups**: Judgment, Max Bid, ML Score, BCPAO photo
- **Sidebar**: Scrollable property cards with click-to-zoom
- **Filter buttons**: All/BID/REVIEW/SKIP recommendations
- **Stats bar**: Total properties, BID count, total judgment
- **Dark theme**: Matches BidDeed.AI brand
- **Supabase integration** with hardcoded fallback

### 📍 Geocoding System
- **BCPAO GIS**: Primary lat/lng source
- **ZIP fallback**: 40 Brevard ZIP centroids
- **Pipeline integration**: Stage 10 now includes coordinates

### 📊 Data Schema
- `auction_results` table with lat/lng columns
- Indexes for map queries (location, date, recommendation)
- RLS policies for public read access

### 🔗 Live URLs
- Map: https://brevard-bidder-landing.pages.dev/map
- Chat: https://brevard-bidder-landing.pages.dev/chat
- Standalone: https://biddeed-foreclosure-map.pages.dev

---

## V18.2.0 - December 18, 2025

### Mapbox Heatmap Integration
- **Mapbox GL JS** integrated via npm package (proper React pattern)
- **Heatmap layer** showing property density with color gradient
- **Dark-v11 style** for professional appearance
- **Test markers** at Brevard County cities (Melbourne, Cocoa, Titusville, Rockledge)
- **Heatmap controls**: Heat/Hybrid/Pins view modes with intensity slider
- **API Token**: everest18 Mapbox account

### AI Chatbot V18
- **NLP Engine** with 10 intent categories
- **Entity extraction**: addresses, case numbers, dates, parcel IDs
- **Floating chat widget** on all pages
- **AI Showcase section** on landing page
- **Smart Router integration**: Gemini FREE → Claude fallback

### Technical Stack
- React + Vite
- mapbox-gl ^3.0.1 (npm package)
- Supabase PostgreSQL
- Cloudflare Pages deployment
- GitHub Actions CI/CD

## V18.1.0 - December 18, 2025
- AI Chatbot integration with landing page
- FloatingChatWidget component
- AIShowcase section with feature cards
- ChatV18.jsx full-page chat interface

## V18.0.0 - December 17, 2025
- LangGraph V18 unified orchestrator
- Smart Router V5 with Gemini FREE tier
- NLP intent classification (92% accuracy)

## V15.0.0 - December 2025
- V15 PIVOT: Legitimate data sources only
- Auction.com, RealtyTrac, HUD/GSE REO integration
- HOA Lien Discovery V14.4

## V13.4.0 - December 2025
- BECA Scraper V2.0
- 12-stage Everest Ascent pipeline
- XGBoost ML predictions (64.4% accuracy)

---

© 2025 Ariel Shapira, Everest Capital USA
