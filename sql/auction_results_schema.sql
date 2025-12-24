-- BidDeed.AI Auction Results Table
-- For foreclosure map visualization

CREATE TABLE IF NOT EXISTS auction_results (
  id SERIAL PRIMARY KEY,
  case_number VARCHAR(50) NOT NULL,
  property_address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(2) DEFAULT 'FL',
  zipcode VARCHAR(10),
  county VARCHAR(50) DEFAULT 'Brevard',
  
  -- Geocoding
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  
  -- Auction Details
  auction_date DATE NOT NULL,
  auction_type VARCHAR(20) DEFAULT 'foreclosure',
  plaintiff VARCHAR(200),
  defendant VARCHAR(200),
  
  -- Financial
  judgment_amount DECIMAL(12, 2),
  opening_bid DECIMAL(12, 2),
  estimated_value DECIMAL(12, 2),
  max_bid DECIMAL(12, 2),
  
  -- ML Predictions
  ml_score DECIMAL(5, 4),
  third_party_probability DECIMAL(5, 4),
  recommendation VARCHAR(10) CHECK (recommendation IN ('BID', 'REVIEW', 'SKIP')),
  
  -- Property Details
  property_type VARCHAR(50),
  bedrooms INTEGER,
  bathrooms DECIMAL(3, 1),
  sqft INTEGER,
  lot_size DECIMAL(10, 2),
  year_built INTEGER,
  
  -- BCPAO Data
  bcpao_account VARCHAR(20),
  bcpao_photo_url TEXT,
  assessed_value DECIMAL(12, 2),
  
  -- Lien Analysis
  senior_liens JSONB,
  has_senior_mortgage BOOLEAN DEFAULT FALSE,
  lien_priority_notes TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending',
  sold_amount DECIMAL(12, 2),
  sold_to VARCHAR(100),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for map queries
CREATE INDEX IF NOT EXISTS idx_auction_results_date ON auction_results(auction_date);
CREATE INDEX IF NOT EXISTS idx_auction_results_recommendation ON auction_results(recommendation);
CREATE INDEX IF NOT EXISTS idx_auction_results_location ON auction_results(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_auction_results_zipcode ON auction_results(zipcode);

-- Enable RLS
ALTER TABLE auction_results ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for map)
CREATE POLICY "Public read access" ON auction_results
  FOR SELECT USING (true);

-- Service role can do everything
CREATE POLICY "Service role full access" ON auction_results
  FOR ALL USING (auth.role() = 'service_role');
