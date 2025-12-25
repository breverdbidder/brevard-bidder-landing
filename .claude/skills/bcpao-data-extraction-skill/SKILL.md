---
name: bcpao-data-extraction-skill
description: Extract property data from Brevard County Property Appraiser GIS API
---

# BCPAO Data Extraction Skill

Standardized property data extraction from BCPAO GIS API with photo URLs.

## When to Use
- Getting property details for auction
- Extracting ARV (After Repair Value)
- Generating property photos
- Validating addresses

## API Endpoint

```
https://gis.brevardfl.gov/gissrv/rest/services/Base_Map/Parcel_New_WKID2881/MapServer/5/query
```

**Search by address:**
```
?where=SITE_ADDR+LIKE+'%123+Main+St%'
&outFields=*
&returnGeometry=false
&f=json
```

## Key Fields

- PCN: Parcel ID (13 digits)
- SITE_ADDR: Property address
- JV: Just Value (assessed value = ARV)
- LIV_AREA: Living area (sqft)
- YR_BLT: Year built
- LUC_DESC: Land use description
- OWN1: Owner name

## Photo URL Generation

Pattern: `https://www.bcpao.us/photos/{prefix}/{account}011.jpg`

**From PCN:**
- PCN: 2909470000000
- Prefix: 29094700 (first 8 digits)
- Account: 00000 (last 5 digits)
- URL: `https://www.bcpao.us/photos/29094700/00000011.jpg`

## ARV Calculation

**Method 1:** Use JV (Just Value) directly

**Method 2:** Comp-based
```python
avg_price_per_sf = sum(comp.price / comp.sf) / len(comps)
arv = liv_area * avg_price_per_sf
```

**Conservative:** Use MIN(JV, comp_based_arv)

## Data Quality Validation

Required:
- [ ] PCN exists
- [ ] SITE_ADDR matches
- [ ] JV > 0
- [ ] LIV_AREA > 0 (for residential)
- [ ] YR_BLT reasonable

## Python Pattern

```python
def extract_bcpao_data(address):
    # URL encode
    addr_encoded = address.replace(' ', '+')
    
    # API call
    url = f"{BASE_URL}/query"
    params = {
        'where': f"SITE_ADDR LIKE '%{addr_encoded}%'",
        'outFields': '*',
        'returnGeometry': 'false',
        'f': 'json'
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if not data.get('features'):
        return None
    
    attrs = data['features'][0]['attributes']
    
    # Generate photo
    pcn = attrs['PCN']
    photo_url = f"https://www.bcpao.us/photos/{pcn[:8]}/{pcn[8:]}011.jpg"
    
    return {
        'pcn': pcn,
        'address': attrs['SITE_ADDR'],
        'jv': attrs['JV'],
        'liv_area': attrs['LIV_AREA'],
        'yr_blt': attrs['YR_BLT'],
        'photo_url': photo_url
    }
```

## Example Usage

```
"Use bcpao-data-extraction-skill for 123 Main St"
"Extract BCPAO data for parcel 2909470000000"
```

## Best Practices

1. Always validate response
2. Handle missing data gracefully
3. Generate photo URLs for every property
4. Cache results to avoid duplicate calls
5. Log data quality issues
