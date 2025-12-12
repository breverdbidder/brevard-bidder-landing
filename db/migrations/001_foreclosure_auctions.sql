-- BidDeed.AI Foreclosure Auctions Table
-- Run this in Supabase SQL Editor to create the table

CREATE TABLE IF NOT EXISTS foreclosure_auctions (
    id BIGSERIAL PRIMARY KEY,
    case_number TEXT UNIQUE NOT NULL,
    plaintiff TEXT,
    defendant TEXT,
    sale_date TEXT,
    status TEXT DEFAULT 'ACTIVE',
    property_address TEXT,
    legal_description TEXT,
    judgment_amount DECIMAL(12,2),
    just_value DECIMAL(12,2),
    assessed_value DECIMAL(12,2),
    max_bid DECIMAL(12,2),
    recommendation TEXT,  -- BID, REVIEW, SKIP
    parcel_id TEXT,
    beds INTEGER,
    baths DECIMAL(3,1),
    sqft INTEGER,
    year_built INTEGER,
    photo_url TEXT,
    plaintiff_attorney TEXT,
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_foreclosure_sale_date ON foreclosure_auctions(sale_date);
CREATE INDEX IF NOT EXISTS idx_foreclosure_recommendation ON foreclosure_auctions(recommendation);
CREATE INDEX IF NOT EXISTS idx_foreclosure_status ON foreclosure_auctions(status);

-- Enable RLS
ALTER TABLE foreclosure_auctions ENABLE ROW LEVEL SECURITY;

-- Policy for service role (full access)
CREATE POLICY "Service role full access" ON foreclosure_auctions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER foreclosure_auctions_updated_at
    BEFORE UPDATE ON foreclosure_auctions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Upsert function for pipeline
CREATE OR REPLACE FUNCTION upsert_foreclosure(
    p_case_number TEXT,
    p_plaintiff TEXT,
    p_defendant TEXT,
    p_sale_date TEXT,
    p_status TEXT,
    p_property_address TEXT,
    p_judgment_amount DECIMAL,
    p_just_value DECIMAL,
    p_recommendation TEXT,
    p_max_bid DECIMAL,
    p_photo_url TEXT,
    p_beds INTEGER,
    p_baths DECIMAL,
    p_sqft INTEGER
)
RETURNS void AS $$
BEGIN
    INSERT INTO foreclosure_auctions (
        case_number, plaintiff, defendant, sale_date, status,
        property_address, judgment_amount, just_value, recommendation,
        max_bid, photo_url, beds, baths, sqft, scraped_at
    ) VALUES (
        p_case_number, p_plaintiff, p_defendant, p_sale_date, p_status,
        p_property_address, p_judgment_amount, p_just_value, p_recommendation,
        p_max_bid, p_photo_url, p_beds, p_baths, p_sqft, NOW()
    )
    ON CONFLICT (case_number) DO UPDATE SET
        plaintiff = EXCLUDED.plaintiff,
        defendant = EXCLUDED.defendant,
        sale_date = EXCLUDED.sale_date,
        status = EXCLUDED.status,
        property_address = COALESCE(EXCLUDED.property_address, foreclosure_auctions.property_address),
        judgment_amount = COALESCE(EXCLUDED.judgment_amount, foreclosure_auctions.judgment_amount),
        just_value = COALESCE(EXCLUDED.just_value, foreclosure_auctions.just_value),
        recommendation = EXCLUDED.recommendation,
        max_bid = EXCLUDED.max_bid,
        photo_url = COALESCE(EXCLUDED.photo_url, foreclosure_auctions.photo_url),
        beds = COALESCE(EXCLUDED.beds, foreclosure_auctions.beds),
        baths = COALESCE(EXCLUDED.baths, foreclosure_auctions.baths),
        sqft = COALESCE(EXCLUDED.sqft, foreclosure_auctions.sqft),
        scraped_at = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Comment
COMMENT ON TABLE foreclosure_auctions IS 'BidDeed.AI foreclosure auction data from automated pipeline';
