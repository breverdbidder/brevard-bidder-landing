---
name: lien-discovery-skill
description: Search AcclaimWeb and RealTDM for liens, mortgages, and determine what survives foreclosure
---

# Lien Discovery Skill

Automated lien research using AcclaimWeb (recorded documents) and RealTDM (tax certificates).

## When to Use This Skill

- Analyzing foreclosure properties for hidden liens
- Determining lien priority and survival
- Detecting HOA foreclosures (critical!)
- Researching title chain before bidding

## Data Sources

### AcclaimWeb
**URL:** clerk.brevardclerk.us/oncoreweb  
**Access:** Public records search  
**Documents:**
- Mortgages (MTG)
- Assignments (ASGN)
- Satisfactions (SAT)
- Liens (LN)
- Lis Pendens (LP)

### RealTDM
**URL:** brevard.realtdm.com  
**Access:** Tax deed search  
**Data:**
- Outstanding tax certificates
- Certificate amounts
- Holder information
- Redemption dates

## Search Process

### Step 1: Get Property Info
**Required:**
- Property address (e.g., "123 Main St, Melbourne, FL")
- Parcel ID (from BCPAO)
- Owner name(s)

### Step 2: AcclaimWeb Search
**Search by:**
1. Owner name (defendant in foreclosure)
2. Property address
3. Parcel ID

**Document Types to Retrieve:**
```
MTG - Mortgages (PRIORITY: Record all)
ASGN - Assignments (track who owns mortgage)
SAT - Satisfactions (which loans paid off)
LN - Liens (mechanic's, judgment, tax)
LP - Lis Pendens (active foreclosures)
```

**Key Fields:**
- Recording date (determines priority!)
- Recording number (unique ID)
- Amount (original loan/lien amount)
- Parties (lender, borrower)

### Step 3: Determine Priority
**First in Time = First in Right**

Priority order by recording date:
```
1. First mortgage (earliest recorded MTG)
2. Second mortgage (next MTG)
3. Other liens (mechanic's, judgment, etc.)
4. Third mortgage / HELOCs
```

**Special Rules:**
- Property tax liens: ALWAYS superior (even if recorded later)
- IRS liens: Can be superior depending on type
- Mechanic's liens: Priority from work start date (not recording)

### Step 4: Survival Analysis

**Who's Foreclosing Matters:**

**First Mortgage Foreclosure:**
- First mortgage → Gets property
- Junior liens (2nd mortgage, HELOCs) → WIPED OUT ✓
- Buyer gets clean title (except property taxes)

**HOA Foreclosure (DANGER!):**
- HOA → Gets limited super lien (unpaid dues only)
- Senior mortgages → SURVIVE ✗✗✗
- Buyer inherits mortgage debt!
- **Decision: DO NOT BID**

**Tax Deed Sale:**
- County → Gets property
- ALL liens → WIPED OUT ✓
- Cleanest title possible

## HOA Detection Algorithm

**Step 1: Check Plaintiff Name**
```python
hoa_keywords = [
    "homeowners association",
    "homeowner's association", 
    "HOA",
    "condominium association",
    "condo association",
    "property owners association",
    "POA",
    "community association"
]

is_hoa = any(keyword.lower() in plaintiff_name.lower() 
             for keyword in hoa_keywords)
```

**Step 2: If HOA Detected → Search for Senior Mortgages**
```
Search AcclaimWeb for MTG documents
Filter: Recording date BEFORE HOA filing date
If found → Flag as DO_NOT_BID
```

**Step 3: Document in Report**
```
⚠️ WARNING: HOA Foreclosure
Senior Mortgage: $XXX,XXX (Bank of America, recorded MM/DD/YYYY)
Recommendation: DO NOT BID - Buyer will inherit mortgage
```

## Output Format

### Lien Priority Report
```
PROPERTY: 123 Main St, Melbourne FL 32935
PARCEL: 1234567

RECORDED LIENS (Priority Order):
1. First Mortgage - $250,000
   Lender: Wells Fargo
   Recorded: 01/15/2018
   Recording #: 2018-012345
   Status: Active (foreclosing party)

2. Second Mortgage - $50,000
   Lender: Quicken Loans
   Recorded: 03/22/2019
   Recording #: 2019-045678
   Status: Will be WIPED OUT

3. Mechanic's Lien - $15,000
   Contractor: ABC Roofing
   Recorded: 06/10/2020
   Recording #: 2020-098765
   Status: Will be WIPED OUT

SURVIVAL ANALYSIS:
Foreclosing Party: Wells Fargo (First Mortgage)
Junior Liens Wiped Out: $65,000 (2nd mortgage + lien)
Buyer Title Status: CLEAN (except property taxes)

RECOMMENDATION: Safe to bid (no surviving liens)
```

### HOA Warning Report
```
⚠️⚠️⚠️ CRITICAL WARNING ⚠️⚠️⚠️

PROPERTY: 456 Oak Ave, Satellite Beach FL 32937
PLAINTIFF: Satellite Shores HOA

SENIOR MORTGAGE FOUND:
Amount: $350,000
Lender: Bank of America
Recorded: 02/10/2015
Recording #: 2015-023456
Status: WILL SURVIVE FORECLOSURE

DANGER: If you bid and win:
- You pay $XXX at auction
- You inherit $350,000 mortgage
- Total cost: $XXX + $350,000

RECOMMENDATION: DO NOT BID
```

## Best Practices

1. **Search Multiple Names:** Owner name variations, maiden names, aliases
2. **Check Assignments:** Mortgage may have been sold/transferred
3. **Verify Satisfactions:** Ensure satisfied liens actually recorded
4. **Document Sources:** Save recording numbers for verification
5. **Conservative Approach:** When in doubt, assume lien survives

## Example Usage

```
"Use lien-discovery-skill to analyze 123 Main St, case #2024-CA-001234"

"Search AcclaimWeb for liens on parcel 1234567 using lien-discovery-skill"

"Plaintiff is 'Beachside HOA' - use lien-discovery-skill to check for senior mortgages"
```

## Integration with Other Skills

**Triggered After:** BCPAO data extraction (need parcel ID)  
**Triggers:** Max bid calculator (deduct surviving liens)  
**Logs To:** Supabase (lien_analysis table)  
**Used By:** Foreclosure analysis (Stage 4)

## Error Handling

**If AcclaimWeb Down:**
- Log error to Supabase
- Mark property as "REVIEW - Manual title search needed"
- Proceed with other properties

**If No Documents Found:**
- Possible new construction (no prior mortgages)
- Possible data entry error (wrong parcel ID)
- Flag for manual verification

**If Unclear Priority:**
- Mark as "REVIEW - Complex title"
- Note: Attorney title search recommended
- Do not auto-bid

## Critical Reminders

- Recording date = Priority (not amount)
- HOA foreclosures are DANGEROUS
- Always search AcclaimWeb, never guess
- Document everything with recording numbers
- When in doubt, mark as REVIEW
