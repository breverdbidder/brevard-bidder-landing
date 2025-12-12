# 🏔️ BidDeed.AI

**Enterprise Foreclosure Auction Intelligence Platform**

[![Powered by The Everest Ascent™](https://img.shields.io/badge/Methodology-The%20Everest%20Ascent™-emerald)](https://biddeed.ai)
[![AI Architecture](https://img.shields.io/badge/AI-Agentic%20Ecosystem-blue)](https://github.com/breverdbidder/brevard-bidder-landing)
[![ML Accuracy](https://img.shields.io/badge/XGBoost-64.4%25%20Accuracy-green)](https://github.com/breverdbidder/brevard-bidder-landing)

## Overview

BidDeed.AI is an **Agentic AI ecosystem** (not traditional SaaS) for foreclosure auction intelligence. Built for Everest Capital USA, it processes Brevard County foreclosure auctions through a 12-stage pipeline called **The Everest Ascent™**.

### Key Value Proposition
- **1 extra deal/quarter**: $50K value
- **1 avoided loss/quarter**: $100K value  
- **Time savings**: 40+ hours/month
- **Annual value**: $300-400K
- **System cost**: $3.3K/year
- **ROI**: **100x**

## 🚀 The Everest Ascent™ Pipeline

| Stage | Name | Description | Duration |
|-------|------|-------------|----------|
| 1 | Discovery | Find case on RealForeclose | 5s |
| 2 | Scraping | Extract case details (BECA V22) | 10s |
| 3 | Title Search | Query AcclaimWeb records | 15s |
| 4 | Lien Priority | Analyze surviving liens (HOA V14.4) | 8s |
| 5 | Tax Certs | Check RealTDM balance | 5s |
| 6 | Demographics | Census API analysis | 3s |
| 7 | ML Score | XGBoost prediction (64.4% accuracy) | 2s |
| 8 | Max Bid | Everest Capital formula | 1s |
| 9 | Decision | BID/REVIEW/SKIP output | 1s |
| 10 | Report | Generate DOCX | 5s |
| 11 | Disposition | Track action taken | 1s |
| 12 | Archive | Save to Supabase | 2s |

## 📁 Project Structure

```
biddeed-ai/
├── src/
│   ├── scrapers/          # Data extraction (5 sources)
│   │   ├── realforeclose_scraper.py
│   │   ├── bcpao_scraper.py
│   │   ├── acclaimweb_scraper.py
│   │   ├── realtdm_scraper.py
│   │   └── census_api.py
│   ├── ml/                # XGBoost predictions
│   │   ├── plaintiff_xgboost_model.py
│   │   └── ml_pipeline.py
│   ├── langgraph/         # Agent orchestration
│   │   ├── auction_graph.py
│   │   ├── everest_ascent_state.py
│   │   └── checkpointing.py
│   ├── routers/           # Smart Router V5
│   │   └── smart_router_v5.py
│   ├── core/              # Layer 8 IP protection
│   │   ├── layer8_bid_calculator.py
│   │   └── layer8_lien_analyzer.py
│   └── agents/            # Specialized agents
│       ├── lien_discovery_agent.py
│       └── browser_agent_router.py
├── .github/workflows/     # GitHub Actions automation
│   ├── beca_manus_v22.yml
│   ├── hoa_lien_discovery.yml
│   ├── smart_router_v5.yml
│   └── langgraph_orchestrator.yml
├── sql/                   # Supabase schema
│   └── biddeed_schema.sql
└── frontend/              # Enterprise UI/UX
    ├── components/
    └── app/
```

## 🛠️ Tech Stack

### Backend
- **Python 3.11+** - Core processing
- **LangGraph** - Agent orchestration
- **XGBoost** - ML predictions
- **Supabase** - PostgreSQL database

### Smart Router V5
Intelligent LLM routing for cost optimization:
| Tier | Model | Cost | Use Case |
|------|-------|------|----------|
| FREE | Gemini 2.5 Flash | $0 | 40-55% of calls |
| ULTRA_CHEAP | DeepSeek V3.2 | $0.28/1M | Simple analysis |
| CHEAP | Claude Haiku | $0.25/1M | Standard tasks |
| QUALITY | Claude Sonnet | $3/1M | Complex analysis |

### Frontend
- **Next.js 15** - React framework
- **assistant-ui** - AI chat primitives
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling

### Infrastructure
- **GitHub Actions** - Workflow automation
- **Cloudflare Pages** - Deployment
- **Supabase** - Database & Auth

## 📊 Data Sources

| Source | Data | Update Frequency |
|--------|------|------------------|
| RealForeclose (BECA) | Auction listings, judgments | Daily 6AM EST |
| BCPAO | Property details, photos | On-demand |
| AcclaimWeb | Title search, liens | On-demand |
| RealTDM | Tax certificates | On-demand |
| Census API | Demographics | Cached weekly |

## 🔐 Layer 8 IP Protection

Critical business logic is protected with AES-256 encryption:
- Max bid formula externalized
- ML model weights encrypted
- Pipeline configuration vault
- Router tier thresholds secured

## 📈 ML Model Performance

**XGBoost Third-Party Probability Model**
- Accuracy: 64.4%
- Features: Plaintiff history, property type, location, judgment amount
- Training data: 1,393+ historical auctions

**Key Plaintiffs Tracked**: 28 major lenders with historical performance data.

## 🚦 Decision Output

| Decision | Criteria | Action |
|----------|----------|--------|
| **BID** | Bid/Judgment ≥ 75%, positive ROI | Attend auction |
| **REVIEW** | Bid/Judgment 60-74%, needs manual review | Investigate further |
| **SKIP** | Bid/Judgment < 60%, negative factors | Do not bid |
| **DO_NOT_BID** | HOA with senior mortgage survives | Automatic skip |

## 🏃 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- Supabase account

### Installation

```bash
# Clone repository
git clone https://github.com/breverdbidder/brevard-bidder-landing.git
cd brevard-bidder-landing

# Install Python dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd frontend
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Run Supabase migration
psql $DATABASE_URL < sql/biddeed_schema.sql

# Start development server
npm run dev
```

### Environment Variables

```env
# Required
ANTHROPIC_API_KEY=sk-ant-xxx
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx
GOOGLE_API_KEY=xxx  # For Smart Router FREE tier

# Optional
OPENAI_API_KEY=xxx
MAPBOX_TOKEN=xxx
```

## 📋 GitHub Actions Workflows

| Workflow | Schedule | Purpose |
|----------|----------|---------|
| `beca_manus_v22.yml` | Daily 6AM EST | Scrape auction data |
| `hoa_lien_discovery.yml` | On-demand | HOA lien analysis |
| `smart_router_v5.yml` | Per-request | LLM routing |
| `langgraph_orchestrator.yml` | Pipeline runs | Agent orchestration |
| `insert_insight.yml` | On-demand | Logging to Supabase |

## 🌐 Live Endpoints

- **Landing Page**: https://brevard-bidder-landing.pages.dev
- **Chat Interface**: https://brevard-bidder-landing.pages.dev/chat
- **Life OS**: https://life-os-aiy.pages.dev

## 👤 Author

**Ariel Shapira**  
Solo Founder, Everest Capital USA  
Developer & Builder, BidDeed.AI

## 📄 License

Proprietary - Everest Capital USA © 2025

---

*Built with ❤️ for foreclosure investors who demand the highest ascent.*
