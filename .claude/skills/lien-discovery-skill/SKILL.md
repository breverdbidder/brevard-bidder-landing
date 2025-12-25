---
name: lien-discovery-skill
description: Automated lien discovery with HOA foreclosure detection to prevent catastrophic losses
---

# Lien Discovery Skill

Searches actual recorded documents to discover liens and detect senior mortgage survival.

## When to Use
- Analyzing foreclosure title
- HOA foreclosure risk assessment
- Lien priority verification
- Title search automation

## Core Principle: NO GUESSWORK

Never assume lien priority. Always search:
- AcclaimWeb for mortgages/liens
- Clerk's Office case files  
- RealTDM for tax certificates

One missed senior lien = $100K+ loss.

## HOA Foreclosure Detection (CRITICAL)

### The Danger
When HOA forecloses:
- Senior mortgages SURVIVE (FL Statute 720.3085)
- Buyer takes property subject to senior lien
- Could owe $200K+ on mortgage
- CATASTROPHIC FINANCIAL LOSS

### Detection Process

**Step 1: Identify HOA Plaintiff**
Search for: "HOA", "Homeowners Association", "Condo Association", "POA"

**Step 2: Search AcclaimWeb for Senior Mortgages**
Find all MTG documents with recording date BEFORE HOA lien date

**Step 3: Decision**
If senior mortgage exists:
```
RECOMMENDATION: DO_NOT_BID
REASON: HOA foreclosure - senior mortgage survives  
RISK: Buyer takes subject to $XXX,XXX mortgage
```

## Lien Priority Rules (Florida)

1. First in time = first in right
2. Recording date determines priority
3. Property taxes always superior
4. HOA assessments junior to mortgages recorded before HOA lien

## AcclaimWeb Search

**By Address:** Enter address, filter MTG/LIEN/LIS, sort by date

**By Case Number:** Search Clerk, cross-reference in AcclaimWeb

**Critical Fields:**
- Recording date (determines priority)
- Book/page or document number
- Lienholder name
- Amount
- Legal description

## RealTDM Tax Certificates

Search parcel ID, note certificate numbers, calculate redemption:
```
Redemption = Face Value + (Interest × Years) + Fees
```

## Error Prevention Checklist

Before BID recommendation:
- [ ] AcclaimWeb search complete
- [ ] All MTG documents reviewed
- [ ] Recording dates verified
- [ ] HOA plaintiff checked
- [ ] Senior mortgage status confirmed
- [ ] Tax certificates searched

## Example Usage

```
"Use lien-discovery-skill to check case 2024-CA-001234"
"Search AcclaimWeb for HOA foreclosure risk on 123 Main St"
```

## Real Example Loss Prevention

HOA foreclosure: $5K judgment
Won auction: $50K bid
Discovered after: $185K senior mortgage
**Total loss: $235K**

This skill prevents that.
