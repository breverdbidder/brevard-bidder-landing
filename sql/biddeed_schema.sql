-- ============================================================================
-- BIDDEED.AI - COMPLETE SUPABASE SCHEMA
-- ============================================================================
-- Version: 1.0.0
-- Author: Ariel Shapira, Solo Founder - Everest Capital USA
-- Database: mocerqjnksmhcjzxrewo.supabase.co
-- Methodology: The Everest Ascent™ (12-Stage Pipeline)
-- ============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search

-- ============================================================================
-- 1. AUCTION_RESULTS - Core foreclosure auction data
-- ============================================================================
CREATE TABLE IF NOT EXISTS auction_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number VARCHAR(50) NOT NULL,
    auction_date DATE NOT NULL,
    
    -- Property Details
    property_address TEXT,
    property_city VARCHAR(100),
    property_zip VARCHAR(10),
    parcel_id VARCHAR(50),
    property_type VARCHAR(50),
    bedrooms INTEGER,
    bathrooms DECIMAL(3,1),
    square_feet INTEGER,
    lot_size DECIMAL(10,4),
    year_built INTEGER,
    
    -- Financial Data (BECA V22 extracted)
    final_judgment DECIMAL(15,2),
    opening_bid DECIMAL(15,2),
    winning_bid DECIMAL(15,2),
    plaintiff_max_bid DECIMAL(15,2),
    
    -- Plaintiff/Defendant
    plaintiff_name VARCHAR(200),
    defendant_name VARCHAR(200),
    plaintiff_attorney VARCHAR(200),
    
    -- Lien Analysis (HOA Discovery V14.4)
    is_hoa_foreclosure BOOLEAN DEFAULT false,
    senior_mortgage_survives BOOLEAN DEFAULT false,
    senior_mortgage_balance DECIMAL(15,2),
    total_junior_liens DECIMAL(15,2),
    tax_cert_balance DECIMAL(15,2),
    municipal_liens DECIMAL(15,2),
    
    -- ML Predictions (XGBoost 64.4%)
    ml_third_party_probability DECIMAL(5,4),
    ml_predicted_sale_price DECIMAL(15,2),
    ml_confidence_score DECIMAL(5,4),
    ml_plaintiff_score DECIMAL(5,4),
    
    -- BidDeed.AI Decision
    decision VARCHAR(20) CHECK (decision IN ('BID', 'REVIEW', 'SKIP', 'DO_NOT_BID')),
    decision_confidence DECIMAL(5,4),
    decision_reasoning JSONB DEFAULT '{}',
    
    -- Max Bid Calculation (Everest Capital Formula)
    arv_estimate DECIMAL(15,2),  -- After Repair Value
    repair_estimate DECIMAL(15,2),
    max_bid_calculated DECIMAL(15,2),
    bid_judgment_ratio DECIMAL(5,4),
    expected_roi DECIMAL(5,2),
    
    -- Auction Outcome
    auction_status VARCHAR(50) DEFAULT 'UPCOMING',
    sold_to VARCHAR(200),  -- 'PLAINTIFF', 'THIRD_PARTY', 'CANCELLED'
    actual_sale_price DECIMAL(15,2),
    certificate_number VARCHAR(50),
    
    -- Data Sources
    beca_verified BOOLEAN DEFAULT false,
    bcpao_enriched BOOLEAN DEFAULT false,
    acclaimweb_searched BOOLEAN DEFAULT false,
    census_demographics JSONB DEFAULT '{}',
    
    -- Photo URLs
    bcpao_photo_url TEXT,
    streetview_url TEXT,
    
    -- Tracking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    pipeline_completed_at TIMESTAMPTZ,
    report_generated_at TIMESTAMPTZ,
    
    -- Unique constraint
    UNIQUE(case_number, auction_date)
);

-- ============================================================================
-- 2. HISTORICAL_AUCTIONS - Past auction data for ML training
-- ============================================================================
CREATE TABLE IF NOT EXISTS historical_auctions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number VARCHAR(50) NOT NULL,
    auction_date DATE NOT NULL,
    
    -- Core data
    plaintiff_name VARCHAR(200),
    defendant_name VARCHAR(200),
    final_judgment DECIMAL(15,2),
    opening_bid DECIMAL(15,2),
    winning_bid DECIMAL(15,2),
    
    -- Property
    property_address TEXT,
    parcel_id VARCHAR(50),
    property_type VARCHAR(50),
    
    -- Outcome
    sold_to VARCHAR(50),  -- 'PLAINTIFF', 'THIRD_PARTY', 'CANCELLED'
    third_party_buyer VARCHAR(200),
    
    -- ML Features
    bid_judgment_ratio DECIMAL(5,4),
    days_on_market INTEGER,
    plaintiff_category VARCHAR(50),
    
    -- Import tracking
    imported_at TIMESTAMPTZ DEFAULT NOW(),
    source VARCHAR(50) DEFAULT 'BECA',
    
    UNIQUE(case_number, auction_date)
);

-- ============================================================================
-- 3. PIPELINE_RUNS - Track 12-stage Everest Ascent™ executions
-- ============================================================================
CREATE TABLE IF NOT EXISTS pipeline_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_id VARCHAR(100) UNIQUE NOT NULL,
    case_number VARCHAR(50),
    auction_date DATE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'RUNNING' CHECK (status IN ('RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED')),
    current_stage INTEGER DEFAULT 1,
    progress_percent INTEGER DEFAULT 0,
    
    -- Stage Results (The Everest Ascent™ 12 stages)
    stage_results JSONB DEFAULT '{
        "discovery": null,
        "scraping": null,
        "title_search": null,
        "lien_priority": null,
        "tax_certs": null,
        "demographics": null,
        "ml_score": null,
        "max_bid": null,
        "decision": null,
        "report": null,
        "disposition": null,
        "archive": null
    }',
    
    -- Timing
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    
    -- Error handling
    error_stage VARCHAR(50),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Smart Router stats
    llm_calls_made INTEGER DEFAULT 0,
    tokens_used INTEGER DEFAULT 0,
    cost_estimate DECIMAL(10,4) DEFAULT 0,
    
    -- Checkpointing
    checkpoint_id VARCHAR(100),
    can_resume BOOLEAN DEFAULT true
);

-- ============================================================================
-- 4. INSIGHTS - General purpose logging table
-- ============================================================================
CREATE TABLE IF NOT EXISTS insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    
    -- Metadata
    source VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'normal',
    tags TEXT[],
    
    -- Tracking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    
    -- For full-text search
    search_vector TSVECTOR
);

-- ============================================================================
-- 5. DAILY_METRICS - Performance tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS daily_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Pipeline metrics
    pipelines_run INTEGER DEFAULT 0,
    pipelines_completed INTEGER DEFAULT 0,
    pipelines_failed INTEGER DEFAULT 0,
    avg_pipeline_duration_seconds INTEGER,
    
    -- Decision metrics
    total_properties_analyzed INTEGER DEFAULT 0,
    bid_recommendations INTEGER DEFAULT 0,
    review_recommendations INTEGER DEFAULT 0,
    skip_recommendations INTEGER DEFAULT 0,
    
    -- Financial metrics
    total_judgment_value DECIMAL(15,2) DEFAULT 0,
    total_max_bids_calculated DECIMAL(15,2) DEFAULT 0,
    
    -- Smart Router metrics
    total_llm_calls INTEGER DEFAULT 0,
    free_tier_calls INTEGER DEFAULT 0,
    cheap_tier_calls INTEGER DEFAULT 0,
    quality_tier_calls INTEGER DEFAULT 0,
    total_cost DECIMAL(10,4) DEFAULT 0,
    
    -- ML metrics
    avg_ml_confidence DECIMAL(5,4),
    ml_predictions_made INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(metric_date)
);

-- ============================================================================
-- 6. PLAINTIFF_STATS - ML feature for plaintiff scoring
-- ============================================================================
CREATE TABLE IF NOT EXISTS plaintiff_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plaintiff_name VARCHAR(200) UNIQUE NOT NULL,
    
    -- Historical stats
    total_cases INTEGER DEFAULT 0,
    cases_sold_third_party INTEGER DEFAULT 0,
    cases_sold_plaintiff INTEGER DEFAULT 0,
    cases_cancelled INTEGER DEFAULT 0,
    
    -- Calculated metrics
    third_party_rate DECIMAL(5,4) DEFAULT 0,
    avg_bid_judgment_ratio DECIMAL(5,4),
    avg_winning_bid DECIMAL(15,2),
    
    -- Category
    category VARCHAR(50),  -- 'MAJOR_BANK', 'SERVICER', 'PRIVATE_LENDER', 'HOA', 'GOVERNMENT'
    
    -- ML score
    plaintiff_score DECIMAL(5,4) DEFAULT 0.5,
    
    -- Tracking
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    case_count_window INTEGER DEFAULT 50  -- Last N cases used for stats
);

-- ============================================================================
-- 7. ACTIVITIES - Life OS integration
-- ============================================================================
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_type VARCHAR(50) NOT NULL,
    domain VARCHAR(50) NOT NULL,  -- BUSINESS, MICHAEL, FAMILY, PERSONAL
    
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    
    -- Complexity tracking
    complexity_score INTEGER CHECK (complexity_score BETWEEN 1 AND 10),
    estimated_minutes INTEGER,
    actual_minutes INTEGER,
    
    -- Assignment
    assigned_to VARCHAR(100),
    due_date TIMESTAMPTZ,
    
    -- Metadata
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    
    -- Tracking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Parent-child for subtasks
    parent_id UUID REFERENCES activities(id)
);

-- ============================================================================
-- 8. MICHAEL_SWIM_TIMES - Swimming performance tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS michael_swim_times (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Event details
    event_name VARCHAR(100) NOT NULL,  -- '50 Free', '100 Fly', etc.
    course VARCHAR(10) NOT NULL,  -- 'SCY', 'LCM', 'SCM'
    
    -- Time
    time_seconds DECIMAL(10,3) NOT NULL,
    time_display VARCHAR(20) NOT NULL,  -- '22.45'
    
    -- Meet info
    meet_name VARCHAR(200),
    meet_date DATE NOT NULL,
    meet_location VARCHAR(200),
    
    -- Performance
    is_personal_best BOOLEAN DEFAULT false,
    improvement_from_previous DECIMAL(10,3),  -- Seconds improved
    
    -- Splits (for 100+)
    splits JSONB DEFAULT '[]',
    
    -- Metadata
    notes TEXT,
    video_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 9. SMART_ROUTER_LOGS - LLM routing decisions
-- ============================================================================
CREATE TABLE IF NOT EXISTS smart_router_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Request details
    task_type VARCHAR(50) NOT NULL,
    complexity_score INTEGER,
    
    -- Routing decision
    tier_selected VARCHAR(20) NOT NULL,  -- 'FREE', 'ULTRA_CHEAP', 'CHEAP', 'QUALITY', 'PREMIUM'
    model_used VARCHAR(100) NOT NULL,
    
    -- Performance
    latency_ms INTEGER,
    tokens_input INTEGER,
    tokens_output INTEGER,
    
    -- Cost
    cost_usd DECIMAL(10,6),
    
    -- Success
    success BOOLEAN DEFAULT true,
    fallback_used BOOLEAN DEFAULT false,
    error_message TEXT,
    
    -- Context
    pipeline_run_id UUID REFERENCES pipeline_runs(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Auction results indexes
CREATE INDEX IF NOT EXISTS idx_auction_results_case ON auction_results(case_number);
CREATE INDEX IF NOT EXISTS idx_auction_results_date ON auction_results(auction_date);
CREATE INDEX IF NOT EXISTS idx_auction_results_decision ON auction_results(decision);
CREATE INDEX IF NOT EXISTS idx_auction_results_plaintiff ON auction_results(plaintiff_name);
CREATE INDEX IF NOT EXISTS idx_auction_results_status ON auction_results(auction_status);

-- Historical auctions indexes
CREATE INDEX IF NOT EXISTS idx_historical_date ON historical_auctions(auction_date);
CREATE INDEX IF NOT EXISTS idx_historical_plaintiff ON historical_auctions(plaintiff_name);
CREATE INDEX IF NOT EXISTS idx_historical_sold_to ON historical_auctions(sold_to);

-- Pipeline runs indexes
CREATE INDEX IF NOT EXISTS idx_pipeline_status ON pipeline_runs(status);
CREATE INDEX IF NOT EXISTS idx_pipeline_case ON pipeline_runs(case_number);
CREATE INDEX IF NOT EXISTS idx_pipeline_date ON pipeline_runs(started_at DESC);

-- Insights indexes
CREATE INDEX IF NOT EXISTS idx_insights_category ON insights(category);
CREATE INDEX IF NOT EXISTS idx_insights_created ON insights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_insights_search ON insights USING GIN(search_vector);

-- Full text search trigger for insights
CREATE OR REPLACE FUNCTION insights_search_trigger() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.content::text, ''));
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER insights_search_update BEFORE INSERT OR UPDATE ON insights
FOR EACH ROW EXECUTE FUNCTION insights_search_trigger();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Upcoming auctions view
CREATE OR REPLACE VIEW v_upcoming_auctions AS
SELECT 
    ar.case_number,
    ar.auction_date,
    ar.property_address,
    ar.plaintiff_name,
    ar.final_judgment,
    ar.max_bid_calculated,
    ar.decision,
    ar.decision_confidence,
    ar.ml_third_party_probability,
    ar.bid_judgment_ratio,
    ar.expected_roi,
    ar.bcpao_photo_url
FROM auction_results ar
WHERE ar.auction_date >= CURRENT_DATE
  AND ar.auction_status = 'UPCOMING'
ORDER BY ar.auction_date, ar.decision DESC;

-- Daily summary view
CREATE OR REPLACE VIEW v_daily_summary AS
SELECT 
    auction_date,
    COUNT(*) as total_properties,
    COUNT(*) FILTER (WHERE decision = 'BID') as bid_count,
    COUNT(*) FILTER (WHERE decision = 'REVIEW') as review_count,
    COUNT(*) FILTER (WHERE decision = 'SKIP') as skip_count,
    SUM(final_judgment) as total_judgment,
    SUM(max_bid_calculated) as total_max_bids,
    AVG(ml_third_party_probability) as avg_third_party_prob
FROM auction_results
WHERE auction_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY auction_date
ORDER BY auction_date DESC;

-- Plaintiff leaderboard view
CREATE OR REPLACE VIEW v_plaintiff_leaderboard AS
SELECT 
    plaintiff_name,
    total_cases,
    third_party_rate,
    avg_bid_judgment_ratio,
    plaintiff_score,
    category
FROM plaintiff_stats
WHERE total_cases >= 5
ORDER BY third_party_rate DESC, total_cases DESC;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Update auction results timestamp
CREATE OR REPLACE FUNCTION update_auction_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auction_updated
BEFORE UPDATE ON auction_results
FOR EACH ROW EXECUTE FUNCTION update_auction_timestamp();

-- Calculate plaintiff stats from historical data
CREATE OR REPLACE FUNCTION refresh_plaintiff_stats()
RETURNS void AS $$
BEGIN
    INSERT INTO plaintiff_stats (plaintiff_name, total_cases, cases_sold_third_party, cases_sold_plaintiff, cases_cancelled, third_party_rate, category)
    SELECT 
        plaintiff_name,
        COUNT(*) as total_cases,
        COUNT(*) FILTER (WHERE sold_to = 'THIRD_PARTY') as third_party,
        COUNT(*) FILTER (WHERE sold_to = 'PLAINTIFF') as plaintiff,
        COUNT(*) FILTER (WHERE sold_to = 'CANCELLED') as cancelled,
        COUNT(*) FILTER (WHERE sold_to = 'THIRD_PARTY')::DECIMAL / NULLIF(COUNT(*), 0) as rate,
        CASE 
            WHEN plaintiff_name ILIKE '%WELLS FARGO%' OR plaintiff_name ILIKE '%BANK OF AMERICA%' 
                 OR plaintiff_name ILIKE '%CHASE%' OR plaintiff_name ILIKE '%CITIBANK%' THEN 'MAJOR_BANK'
            WHEN plaintiff_name ILIKE '%NATIONSTAR%' OR plaintiff_name ILIKE '%MR. COOPER%' 
                 OR plaintiff_name ILIKE '%NEWREZ%' THEN 'SERVICER'
            WHEN plaintiff_name ILIKE '%HOA%' OR plaintiff_name ILIKE '%HOMEOWNERS%' 
                 OR plaintiff_name ILIKE '%ASSOCIATION%' THEN 'HOA'
            ELSE 'OTHER'
        END as category
    FROM historical_auctions
    WHERE plaintiff_name IS NOT NULL
    GROUP BY plaintiff_name
    ON CONFLICT (plaintiff_name) DO UPDATE SET
        total_cases = EXCLUDED.total_cases,
        cases_sold_third_party = EXCLUDED.cases_sold_third_party,
        cases_sold_plaintiff = EXCLUDED.cases_sold_plaintiff,
        cases_cancelled = EXCLUDED.cases_cancelled,
        third_party_rate = EXCLUDED.third_party_rate,
        category = EXCLUDED.category,
        last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INITIAL METRICS ROW
-- ============================================================================
INSERT INTO daily_metrics (metric_date) VALUES (CURRENT_DATE)
ON CONFLICT (metric_date) DO NOTHING;

-- ============================================================================
-- GRANT PERMISSIONS (for service role)
-- ============================================================================
-- These would be run by Supabase admin
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

COMMIT;
