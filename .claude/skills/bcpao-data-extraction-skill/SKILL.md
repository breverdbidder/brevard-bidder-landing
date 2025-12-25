---
name: bcpao-data-extraction-skill
description: Extract property data from Brevard County Property Appraiser (BCPAO) GIS API and databases
---

# BCPAO Data Extraction Skill

Automated property data extraction from Brevard County Property Appraiser Office.

## When to Use This Skill

- Getting property details for foreclosure analysis
- Extracting ARV (After Repair Value) estimates
- Retrieving property photos
- Gathering tax assessment data
- Looking up parcel information

## Data Sources

### BCPAO GIS API
**Endpoint:** `https://gis.brevardfl.gov/gissrv/rest/services/Base_Map/Parcel_New_WKID2881/MapServer/5/query`

**Query Parameters:**
```python
{
    "where": "PARCELNO = '1234567'",  # or "ADDRESS LIKE '%123 Main St%'"
    "outFields": "*",
    "returnGeometry": "false",
    "f": "json"
}
```

**Key Fields Returned:**
- `PARCELNO`: Parcel ID
- `OWNER_NAME`: Current owner
- `ADDRESS`: Property address  
- `CITY`: City
- `ZIP`: Zip code
- `LIV_AREA`: Living area (sq ft)
- `YEAR_BUILT`: Year built
- `JUST_VALUE`: Assessed value (use as ARV baseline)
- `TAXABLE_VALUE`: Taxable value

### BCPAO Photos
**URL Pattern:**
```
https://www.bcpao.us/photos/{prefix}/{account}011.jpg
```

**How to Generate:**
1. Get account number from GIS API (PARCELNO)
2. Take first 2 digits as prefix
3. Construct URL: `https://www.bcpao.us/photos/12/1234567011.jpg`

**Photo Types:**
- `011.jpg`: Main front photo
- `012.jpg`: Second photo (if available)
- `013.jpg`: Third photo (if available)

**Validation:**
- Check if URL returns 200 (photo exists)
- Most properties have at least 011 photo
- ~85-90% of properties have photos

### BCPAO Property Search
**URL:** `https://www.bcpao.us/api/v1/search`

**Search Methods:**
- By parcel: `?parcel=1234567`
- By address: `?address=123+Main+St`
- By owner: `?owner=Smith`

**Returns:**
- Property characteristics
- Sales history
- Building details
- Tax information

## Extraction Process

### Step 1: Get Parcel ID
**Input:** Property address  
**Process:**
```python
# Search GIS API by address
params = {
    "where": f"ADDRESS LIKE '%{street_number} {street_name}%'",
    "outFields": "PARCELNO,ADDRESS,OWNER_NAME",
    "f": "json"
}
response = requests.get(GIS_ENDPOINT, params=params)
parcel_id = response.json()['features'][0]['attributes']['PARCELNO']
```

### Step 2: Get Full Property Data
**Input:** Parcel ID  
**Process:**
```python
# Query GIS API by parcel
params = {
    "where": f"PARCELNO = '{parcel_id}'",
    "outFields": "*",
    "f": "json"
}
data = requests.get(GIS_ENDPOINT, params=params).json()
```

**Extract Key Fields:**
```python
property_data = {
    "parcel_id": data['PARCELNO'],
    "address": data['ADDRESS'],
    "owner": data['OWNER_NAME'],
    "living_area": data['LIV_AREA'],
    "year_built": data['YEAR_BUILT'],
    "just_value": data['JUST_VALUE'],  # ARV baseline
    "taxable_value": data['TAXABLE_VALUE'],
    "city": data['CITY'],
    "zip": data['ZIP']
}
```

### Step 3: Generate Photo URLs
**Process:**
```python
# Extract prefix (first 2 digits of parcel)
prefix = parcel_id[:2]

# Generate photo URLs
photos = [
    f"https://www.bcpao.us/photos/{prefix}/{parcel_id}011.jpg",
    f"https://www.bcpao.us/photos/{prefix}/{parcel_id}012.jpg",
    f"https://www.bcpao.us/photos/{prefix}/{parcel_id}013.jpg"
]

# Validate each URL
valid_photos = []
for url in photos:
    response = requests.head(url)
    if response.status_code == 200:
        valid_photos.append(url)
```

### Step 4: Calculate ARV Estimate
**Baseline:** Use JUST_VALUE (assessed value)  
**Adjustments:**
```python
# BCPAO typically assesses at 85-90% of market value
arv_estimate = just_value / 0.85

# Adjust for property age
if year_built < 1980:
    arv_estimate *= 0.95  # Older properties
elif year_built > 2015:
    arv_estimate *= 1.05  # Newer properties

# Adjust for condition (if notes available)
# This requires manual review or ML model
```

**Output:** Conservative ARV estimate

### Step 5: Estimate Repairs
**Heuristics (improve with ML over time):**
```python
if year_built < 1970:
    base_repairs = 25000
elif year_built < 1990:
    base_repairs = 15000
elif year_built < 2010:
    base_repairs = 8000
else:
    base_repairs = 5000

# Adjust by sq ft
repairs_per_sqft = base_repairs / living_area
```

**Better Approach:**
- Photo analysis (ML model for condition)
- Comparable sales with known repair costs
- Drive-by visual inspection

## Data Quality Checks

**Required Fields:**
- ✓ Parcel ID exists
- ✓ Living area > 0
- ✓ Just value > 0
- ✓ Address is complete

**Warning Flags:**
- ⚠️ Living area = 0 (land only)
- ⚠️ Year built missing (old property)
- ⚠️ Just value < $50K (mobile home or error)
- ⚠️ No photos available

**Error Handling:**
- Missing data → Flag as "REVIEW - Incomplete BCPAO data"
- API timeout → Retry up to 3 times
- Invalid parcel → Search by address as fallback

## Output Format

```json
{
  "parcel_id": "1234567",
  "address": "123 Main St, Melbourne FL 32935",
  "owner_name": "John Smith",
  "living_area": 1850,
  "year_built": 1995,
  "bedrooms": null,  // Not in GIS API
  "bathrooms": null,  // Not in GIS API
  "just_value": 285000,
  "arv_estimate": 335000,
  "estimated_repairs": 12000,
  "photos": [
    "https://www.bcpao.us/photos/12/1234567011.jpg",
    "https://www.bcpao.us/photos/12/1234567012.jpg"
  ],
  "data_quality": "GOOD",
  "warnings": []
}
```

## Integration Points

**Used By:**
- Foreclosure analysis skill (Stage 2)
- Lien discovery skill (needs parcel ID)
- Max bid calculator (needs ARV, repairs)

**Triggers:**
- Photo download for reports
- ARV validation against Zillow/Redfin

**Logs To:**
- Supabase (property_data table)
- Include timestamp, data quality score

## Best Practices

1. **Cache BCPAO Data:** Don't re-query same parcel multiple times
2. **Validate Photos:** Check HTTP 200 before using in reports
3. **Conservative ARV:** Better to underestimate than overpay
4. **Document Assumptions:** Note ARV calculation method
5. **Flag Missing Data:** Always highlight incomplete records

## Example Usage

```
"Use bcpao-data-extraction-skill to get property details for parcel 1234567"

"Extract BCPAO data and photos for 123 Main St, Melbourne using bcpao-data-extraction-skill"

"Get ARV estimate for all properties in December 17 auction list"
```

## Known Limitations

**GIS API Does NOT Include:**
- Bed/bath count (need Zillow/Redfin)
- Interior photos (only exterior from BCPAO)
- Recent sales comps
- MLS listing data
- Detailed building materials

**Workaround:**
- Cross-reference with Zillow API
- Use Redfin for comps
- Drive-by for condition assessment

## Critical Fields for BidDeed.AI

**Must Have:**
1. Living area (for $/sqft analysis)
2. Just value (ARV baseline)
3. Photo URL (for reports)
4. Year built (condition proxy)

**Nice to Have:**
5. Owner name (verify foreclosure defendant)
6. Last sale date (holding period)
7. Tax amount (carrying costs)
