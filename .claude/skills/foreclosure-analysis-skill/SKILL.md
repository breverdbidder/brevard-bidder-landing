---
name: foreclosure-analysis-skill
description: Execute complete 12-stage Everest Ascent™ foreclosure auction analysis pipeline
---

# Foreclosure Analysis Skill

Comprehensive foreclosure auction analysis following The Everest Ascent™ methodology.

## When to Use This Skill

- Analyzing properties from upcoming foreclosure auctions
- Processing auction lists from RealForeclose
- Generating investment decision reports
- Running complete due diligence pipeline

## The Everest Ascent™ 12-Stage Pipeline

### Stage 1: Discovery
**Input:** Auction date or RealForeclose URL  
**Process:** Scrape auction list, extract property details  
**Output:** List of cases with case numbers, addresses, plaintiff info

### Stage 2: Scraping
**Data Sources:**
- RealForeclose: Auction listings, judgment amounts
- BCPAO: Property records, tax assessments, photos
- AcclaimWeb: Recorded documents, liens, mortgages
- RealTDM: Tax certificates
- Census API: Demographics, neighborhood data

**Key Fields:**
- Case number, plaintiff, defendant
- Property address, parcel ID
- Judgment amount, auction date
- ARV (After Repair Value)
- Living area, bed/bath count

### Stage 3: Title Search
**Process:** Search AcclaimWeb for recorded documents  
**Look For:**
- Original mortgages (position, amount, date)
- Second mortgages, HELOCs
- Liens (mechanic's, judgment, tax)
- Assignments, satisfactions

**Output:** Complete chain of title with recording dates

### Stage 4: Lien Priority Analysis
**Critical Decision Point:** Determine what survives foreclosure

**Rules:**
- First mortgage foreclosure → Junior liens wiped out
- HOA foreclosure → Senior mortgages SURVIVE (DO NOT BID)
- Tax deed → All liens wiped out
- Judgment lien → Check priority vs mortgages

**HOA Detection:**
- Plaintiff name contains: "HOA", "Homeowners", "Condominium", "Association"
- If HOA plaintiff → Search for senior mortgages
- If senior mortgage exists → Flag as DO_NOT_BID

**Output:** Lien priority report, survival analysis

### Stage 5: Tax Certificates
**Source:** RealTDM  
**Check:**
- Outstanding tax certificates
- Redemption amounts
- Certificate holder

**Add to Max Bid Calculation:** Deduct outstanding taxes

### Stage 6: Demographics
**Source:** Census API  
**Data:**
- Median income (zip code level)
- Population density
- Vacancy rates
- Age distribution

**Use:** Validate neighborhood quality, rental demand

### Stage 7: ML Score
**Model:** XGBoost (64.4% accuracy)  
**Predicts:** Probability of third-party purchase  
**Features:**
- Judgment amount
- ARV estimate
- Plaintiff type (28 tracked)
- Property characteristics
- Neighborhood demographics

**Output:** Probability score 0-100%

### Stage 8: Max Bid Calculation
**Formula:**
```
Max Bid = (ARV × 70%) - Repairs - $10,000 - MIN($25,000, 15% × ARV)
```

**Components:**
- **ARV × 70%:** Conservative market value
- **Repairs:** Estimated fix-up costs
- **$10,000:** Holding costs, closing, misc
- **MIN($25K, 15% ARV):** Profit margin

**Adjustment for Liens:**
- Deduct surviving liens
- Deduct outstanding taxes
- Deduct special assessments

**Output:** Maximum bid amount

### Stage 9: Decision Logic
**Calculate Bid/Judgment Ratio:**
```
Ratio = Max Bid / Judgment Amount
```

**Decision Rules:**
- **Ratio ≥ 75%** → BID (strong deal)
- **Ratio 60-74%** → REVIEW (marginal, needs closer look)
- **Ratio < 60%** → SKIP (insufficient margin)
- **HOA w/ senior mortgage** → DO_NOT_BID (dangerous)

**Output:** BID, REVIEW, SKIP, or DO_NOT_BID

### Stage 10: Report Generation
**Format:** One-page DOCX per property  
**Sections:**
1. Property Overview (address, photo, specs)
2. Financial Analysis (judgment, max bid, ratio)
3. Lien Analysis (priority, surviving liens)
4. ML Prediction (third-party probability)
5. Decision Recommendation (BID/REVIEW/SKIP)
6. Next Steps (if BID: attend auction, if REVIEW: drive-by)

**Branding:** BrevardBidderAI only (no Property360/Mariam)

### Stage 11: Disposition Tracking
**Log to Supabase:** auction_results table  
**Fields:**
- Case number
- Decision (BID/REVIEW/SKIP)
- Max bid calculated
- Actual outcome (if attended)
- Purchase price (if won)
- Third-party purchase (if lost)

**Use:** Track ML model accuracy, refine predictions

### Stage 12: Archive
**Storage:** Supabase + GitHub  
**Contents:**
- Raw data (JSON)
- Generated reports (DOCX)
- Decision logs
- Photos

**Purpose:** Historical reference, model retraining

## Best Practices

1. **No Guesswork:** Always search actual recorded documents
2. **HOA Detection:** Critical for avoiding bad deals
3. **Photo Verification:** Use BCPAO photos in reports
4. **Conservative ARV:** Better to underestimate than overpay
5. **Document Everything:** Log all decisions to Supabase

## Example Usage

```
"Use foreclosure-analysis-skill to process the December 17 auction list"

"Analyze property at 123 Main St, case #2024-CA-001234 using foreclosure-analysis-skill"

"Run complete Everest Ascent pipeline on all properties with judgment < $200K"
```

## Output Quality Standards

- Complete data for 80%+ of properties
- HOA detection: 100% accuracy
- Max bid calculations: Documented assumptions
- Reports: Professional, one-page, branded
- Decision logs: Saved to Supabase for every property

## Integration Points

- **Smart Router:** Use ULTRA_CHEAP tier (DeepSeek) for data processing
- **MCP:** Stages 9-12 use MCP for Supabase/Cloudflare
- **GitHub Actions:** Orchestration via workflows
- **Cloudflare Pages:** Report hosting at brevard-bidder-landing.pages.dev

## Critical Flags

**Automatic DO_NOT_BID:**
- HOA plaintiff + senior mortgage found
- Judgment > 150% of ARV (likely fraud/deficiency)
- Property in flood zone (unless specifically targeting)
- Active code violations (search BCPAO notes)

**Automatic REVIEW:**
- Missing critical data (ARV, repairs estimate)
- Unusual lien structure
- Plaintiff not in known list (new bank/servicer)
- Property type: commercial, multi-family >4 units
