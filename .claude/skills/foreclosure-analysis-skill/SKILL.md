---
name: foreclosure-analysis-skill
description: Execute 12-stage Everest Ascent methodology for foreclosure auction analysis
---

# Foreclosure Analysis Skill

Implements BidDeed.AI's 12-stage Everest Ascent pipeline for foreclosure intelligence.

## When to Use
- Analyzing foreclosure properties
- Running complete auction analysis pipeline
- Quality assurance on recommendations

## The Everest Ascent Pipeline

### Stage 1: Discovery
Scrape RealForeclose for new listings, parse case data, store in Supabase

### Stage 2: Scraping  
BCPAO property data, AcclaimWeb title, RealTDM taxes, Census demographics

### Stage 3: Title Search
Search Clerk case file, identify all parties, document chain of title

### Stage 4: Lien Priority Analysis
**CRITICAL:** Detect HOA foreclosures where senior mortgage survives

### Stage 5: Tax Certificates
Check RealTDM for outstanding certs, calculate redemption

### Stage 6: Demographics
Census API for income, vacancy, MTR demand

### Stage 7: ML Score
XGBoost third-party probability (64.4% accuracy, 28 plaintiff patterns)

### Stage 8: Max Bid Calculation
Formula: (ARV × 70%) - Repairs - $10K - MIN($25K, 15%ARV)

Ratios:
- ≥75% = BID
- 60-74% = REVIEW
- <60% = SKIP

### Stage 9: Decision Log
Log to Supabase with reasoning

### Stage 10: Report Generation
One-page DOCX with BidDeed.AI branding, BCPAO photo, recommendation

### Stage 11: Disposition Tracking
Monitor auction results, update ML training data

### Stage 12: Archive
Move to historical archive, preserve artifacts

## Critical Rules

**NO GUESSWORK:** Always search actual documents (AcclaimWeb, Clerk, RealTDM)

**HOA Detection:**
If HOA plaintiff + senior mortgage exists = DO NOT BID

**Quality Checks:**
- Lien priority verified
- No HOA risk
- Max bid validated
- Bid/judgment ≥75%

## Example Usage

```
"Analyze December 3rd auction using foreclosure-analysis-skill"
"Run Everest Ascent on case 2024-CA-001234"
```

This skill codifies BidDeed.AI's core competitive advantage.
