---
name: max-bid-calculator-skill
description: Calculate maximum auction bid using BidDeed.AI formula with bid/judgment ratio decisioning
---

# Max Bid Calculator Skill

Conservative maximum bid calculation using proven formula and ratio analysis.

## When to Use
- Determining max bid for auction
- Evaluating deal quality
- Making BID/REVIEW/SKIP decisions
- Validating investment returns

## The BidDeed.AI Formula

```
MAX BID = (ARV × 70%) - Repairs - $10,000 - MIN($25,000, 15% × ARV)
```

### Components

**ARV:** After Repair Value (market value after repairs)

**70% Rule:** Industry standard, leaves room for costs and profit

**Repairs:** Estimated rehab ($15-100/sqft depending on condition)

**$10K Closing:** Title, recording, taxes, attorney fees

**Margin:** MIN($25K or 15% ARV) for profit buffer

## Calculation Example

```
ARV: $200,000
Repairs: $30,000
Closing: $10,000  
Margin: MIN($25K, $30K) = $25,000

MAX BID = ($200K × 70%) - $30K - $10K - $25K
        = $140K - $30K - $10K - $25K
        = $75,000
```

## Bid/Judgment Ratio

```
RATIO = MAX BID ÷ JUDGMENT AMOUNT
```

### Decision Matrix

**BID (≥75%):** Strong deal, good margin, bid aggressively

**REVIEW (60-74%):** Marginal, needs deeper diligence, bid cautiously

**SKIP (<60%):** Weak deal, insufficient margin, do not bid

### Examples

- Max $75K, Judgment $90K = 83% → BID
- Max $60K, Judgment $90K = 67% → REVIEW
- Max $50K, Judgment $90K = 56% → SKIP

## Repair Estimates

**Cosmetic ($15-30/sqft):**
Paint, flooring, fixtures, landscaping

**Moderate ($30-50/sqft):**
Kitchen/bath updates, HVAC, electrical, plumbing

**Heavy ($50-100+/sqft):**
Structural, roof, foundation, full gut

## Output Format

```json
{
  "property": "123 Main St",
  "calculation": {
    "arv": 200000,
    "repairs": 30000,
    "closing": 10000,
    "margin": 25000,
    "max_bid": 75000
  },
  "judgment_analysis": {
    "judgment": 90000,
    "ratio": 0.833,
    "ratio_pct": "83%"
  },
  "recommendation": "BID",
  "confidence": "HIGH"
}
```

## Quality Checks

- [ ] ARV validated against comps
- [ ] Repair estimate reasonable
- [ ] Closing costs included
- [ ] Margin adequate
- [ ] Bid/judgment ratio calculated
- [ ] Decision logic applied

## Example Usage

```
"Calculate max bid for ARV $200K, repairs $30K"
"Use max-bid-calculator-skill on December auction properties"
```

## Common Mistakes

1. Over-optimistic ARV → use conservative comps
2. Under-estimating repairs → add contingency
3. Forgetting margin → always include MIN($25K, 15% ARV)
4. Ignoring judgment → always calculate ratio
5. Bidding on SKIP deals → stick to ≥60% minimum

## Integration

All calculations logged to Supabase auction_results table for tracking and ML model improvement.

**This skill ensures consistent, profitable bidding.**
