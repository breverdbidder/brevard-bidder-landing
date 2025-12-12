-- ============================================================
-- EVEREST BRAND ARCHITECTURE & IP REGISTRY
-- Supabase Schema for tracking brands, IP, and methodology
-- Version: 1.0.0 | Date: 2025-12-11
-- ============================================================

-- ============================================================
-- 1. BRAND ARCHITECTURE TABLES
-- ============================================================

-- Brand hierarchy table
CREATE TABLE IF NOT EXISTS brand_hierarchy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_name VARCHAR(100) NOT NULL,
    brand_type VARCHAR(50) NOT NULL CHECK (brand_type IN (
        'parent', 'methodology', 'product', 'stage', 'service', 'credential', 'content'
    )),
    parent_brand_id UUID REFERENCES brand_hierarchy(id),
    tagline VARCHAR(255),
    description TEXT,
    domain_primary VARCHAR(100),
    domain_alternatives TEXT[], -- Array of alternative domains
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'planned', 'deprecated')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brand voice and messaging
CREATE TABLE IF NOT EXISTS brand_messaging (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brand_hierarchy(id) ON DELETE CASCADE,
    message_type VARCHAR(50) NOT NULL CHECK (message_type IN (
        'tagline', 'value_prop', 'key_message', 'elevator_pitch', 'long_description'
    )),
    message_text TEXT NOT NULL,
    audience VARCHAR(50), -- 'investors', 'institutions', 'general', etc.
    language VARCHAR(10) DEFAULT 'en',
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. IP REGISTRY TABLES
-- ============================================================

-- Trademarks
CREATE TABLE IF NOT EXISTS ip_trademarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mark_name VARCHAR(100) NOT NULL,
    mark_type VARCHAR(20) CHECK (mark_type IN ('word', 'design', 'combined')),
    brand_id UUID REFERENCES brand_hierarchy(id),
    classes INTEGER[], -- USPTO classes (36, 42, etc.)
    goods_services TEXT,
    status VARCHAR(30) DEFAULT 'planned' CHECK (status IN (
        'planned', 'search_completed', 'filed', 'published', 'registered', 'abandoned', 'cancelled'
    )),
    priority_tier INTEGER CHECK (priority_tier BETWEEN 1 AND 3),
    filing_date DATE,
    registration_date DATE,
    serial_number VARCHAR(50),
    registration_number VARCHAR(50),
    expiry_date DATE,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    attorney VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patents
CREATE TABLE IF NOT EXISTS ip_patents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    patent_type VARCHAR(20) CHECK (patent_type IN ('utility', 'design', 'plant', 'provisional')),
    brand_id UUID REFERENCES brand_hierarchy(id),
    status VARCHAR(30) DEFAULT 'planned' CHECK (status IN (
        'planned', 'drafting', 'filed', 'published', 'allowed', 'granted', 'abandoned', 'expired'
    )),
    priority VARCHAR(20) CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    filing_date DATE,
    publication_date DATE,
    grant_date DATE,
    application_number VARCHAR(50),
    patent_number VARCHAR(50),
    expiry_date DATE,
    claims_summary TEXT,
    abstract TEXT,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    attorney VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trade Secrets
CREATE TABLE IF NOT EXISTS ip_trade_secrets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    secret_id VARCHAR(20) NOT NULL UNIQUE, -- e.g., TS-001
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) CHECK (category IN (
        'algorithm', 'formula', 'process', 'data', 'model', 'configuration'
    )),
    brand_id UUID REFERENCES brand_hierarchy(id),
    protection_measures TEXT[],
    storage_location VARCHAR(255), -- Where it's stored (encrypted reference)
    access_level VARCHAR(20) CHECK (access_level IN ('founder_only', 'core_team', 'employees', 'contractors')),
    last_audit_date DATE,
    next_audit_date DATE,
    risk_level VARCHAR(20) CHECK (risk_level IN ('critical', 'high', 'medium', 'low')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Copyrights
CREATE TABLE IF NOT EXISTS ip_copyrights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_title VARCHAR(500) NOT NULL,
    work_type VARCHAR(50) CHECK (work_type IN (
        'literary', 'software', 'audiovisual', 'sound', 'visual'
    )),
    brand_id UUID REFERENCES brand_hierarchy(id),
    status VARCHAR(30) DEFAULT 'planned' CHECK (status IN (
        'planned', 'created', 'filed', 'registered'
    )),
    creation_date DATE,
    registration_date DATE,
    registration_number VARCHAR(50),
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Domains
CREATE TABLE IF NOT EXISTS ip_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_name VARCHAR(100) NOT NULL UNIQUE,
    brand_id UUID REFERENCES brand_hierarchy(id),
    status VARCHAR(20) DEFAULT 'target' CHECK (status IN (
        'target', 'acquired', 'active', 'parked', 'expired'
    )),
    registrar VARCHAR(100),
    registration_date DATE,
    expiry_date DATE,
    auto_renew BOOLEAN DEFAULT true,
    annual_cost DECIMAL(10,2),
    purpose VARCHAR(255),
    dns_provider VARCHAR(100),
    ssl_status VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. THE EVEREST ASCENT METHODOLOGY TABLES
-- ============================================================

-- Methodology versions (for tracking evolution)
CREATE TABLE IF NOT EXISTS methodology_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version VARCHAR(20) NOT NULL,
    methodology_name VARCHAR(100) NOT NULL DEFAULT 'The Everest Ascent',
    description TEXT,
    total_stages INTEGER DEFAULT 12,
    release_date DATE,
    is_current BOOLEAN DEFAULT false,
    changelog TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- The 12 stages
CREATE TABLE IF NOT EXISTS everest_ascent_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    methodology_version_id UUID REFERENCES methodology_versions(id),
    stage_number INTEGER NOT NULL CHECK (stage_number BETWEEN 1 AND 12),
    stage_name VARCHAR(100) NOT NULL,
    phase_name VARCHAR(50) NOT NULL, -- 'Base Camp', 'The Approach', etc.
    brand_name VARCHAR(100), -- Associated brand (LienLogic, BidScore, etc.)
    function_description TEXT NOT NULL,
    data_sources TEXT[],
    output_description TEXT,
    ip_type VARCHAR(50)[], -- ['trademark', 'trade_secret', 'patent']
    is_flagship BOOLEAN DEFAULT false,
    langgraph_node_name VARCHAR(100),
    estimated_duration_seconds INTEGER,
    dependencies INTEGER[], -- Array of stage numbers this depends on
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(methodology_version_id, stage_number)
);

-- Stage execution logs (for learning and improvement)
CREATE TABLE IF NOT EXISTS stage_execution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL,
    case_id VARCHAR(50),
    stage_number INTEGER NOT NULL,
    stage_name VARCHAR(100),
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    status VARCHAR(20) CHECK (status IN ('running', 'completed', 'failed', 'skipped')),
    input_summary JSONB,
    output_summary JSONB,
    errors JSONB,
    model_used VARCHAR(50), -- Which LLM model was used
    tokens_used INTEGER,
    cost_usd DECIMAL(10,6),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. LANGGRAPH STATE TRACKING
-- ============================================================

-- Pipeline runs
CREATE TABLE IF NOT EXISTS pipeline_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL UNIQUE,
    case_id VARCHAR(50),
    property_address TEXT,
    auction_date DATE,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    current_stage INTEGER,
    status VARCHAR(20) CHECK (status IN ('running', 'completed', 'failed', 'paused')),
    final_recommendation VARCHAR(20),
    total_duration_ms INTEGER,
    total_cost_usd DECIMAL(10,4),
    state_snapshot JSONB, -- Full LangGraph state
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. FOUNDER AUTHORITY TRACKING
-- ============================================================

-- Thought leadership content
CREATE TABLE IF NOT EXISTS thought_leadership (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    content_type VARCHAR(50) CHECK (content_type IN (
        'article', 'newsletter', 'podcast', 'video', 'webinar', 'speaking', 'interview', 'report'
    )),
    platform VARCHAR(100), -- 'LinkedIn', 'YouTube', 'Forbes', etc.
    url TEXT,
    published_date DATE,
    stage_featured INTEGER, -- Which Everest Ascent stage is featured
    brand_featured UUID REFERENCES brand_hierarchy(id),
    views INTEGER,
    engagement_score DECIMAL(5,2),
    leads_generated INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media mentions and press
CREATE TABLE IF NOT EXISTS media_mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publication VARCHAR(200) NOT NULL,
    title VARCHAR(500),
    url TEXT,
    mention_date DATE,
    mention_type VARCHAR(50) CHECK (mention_type IN (
        'feature', 'quote', 'interview', 'byline', 'mention'
    )),
    sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    reach_estimate INTEGER, -- Estimated audience
    brands_mentioned UUID[], -- Array of brand_hierarchy IDs
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Speaking engagements
CREATE TABLE IF NOT EXISTS speaking_engagements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name VARCHAR(200) NOT NULL,
    organizer VARCHAR(200),
    event_date DATE,
    location VARCHAR(200),
    event_type VARCHAR(50) CHECK (event_type IN (
        'conference', 'webinar', 'podcast', 'workshop', 'meetup', 'internal'
    )),
    topic VARCHAR(500),
    stage_featured INTEGER,
    audience_size INTEGER,
    fee_usd DECIMAL(10,2),
    leads_generated INTEGER,
    recording_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_brand_hierarchy_type ON brand_hierarchy(brand_type);
CREATE INDEX IF NOT EXISTS idx_brand_hierarchy_parent ON brand_hierarchy(parent_brand_id);
CREATE INDEX IF NOT EXISTS idx_trademarks_status ON ip_trademarks(status);
CREATE INDEX IF NOT EXISTS idx_trademarks_priority ON ip_trademarks(priority_tier);
CREATE INDEX IF NOT EXISTS idx_patents_status ON ip_patents(status);
CREATE INDEX IF NOT EXISTS idx_trade_secrets_category ON ip_trade_secrets(category);
CREATE INDEX IF NOT EXISTS idx_stages_version ON everest_ascent_stages(methodology_version_id);
CREATE INDEX IF NOT EXISTS idx_execution_logs_run ON stage_execution_logs(run_id);
CREATE INDEX IF NOT EXISTS idx_execution_logs_case ON stage_execution_logs(case_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_status ON pipeline_runs(status);
CREATE INDEX IF NOT EXISTS idx_thought_leadership_type ON thought_leadership(content_type);

-- ============================================================
-- 7. VIEWS FOR REPORTING
-- ============================================================

-- IP Portfolio Summary View
CREATE OR REPLACE VIEW ip_portfolio_summary AS
SELECT 
    'Trademarks' as ip_type,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'registered') as registered,
    COUNT(*) FILTER (WHERE status = 'filed') as pending,
    COUNT(*) FILTER (WHERE status = 'planned') as planned,
    COALESCE(SUM(estimated_cost), 0) as estimated_total_cost,
    COALESCE(SUM(actual_cost), 0) as actual_total_cost
FROM ip_trademarks
UNION ALL
SELECT 
    'Patents' as ip_type,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'granted') as registered,
    COUNT(*) FILTER (WHERE status = 'filed') as pending,
    COUNT(*) FILTER (WHERE status = 'planned') as planned,
    COALESCE(SUM(estimated_cost), 0) as estimated_total_cost,
    COALESCE(SUM(actual_cost), 0) as actual_total_cost
FROM ip_patents
UNION ALL
SELECT 
    'Copyrights' as ip_type,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'registered') as registered,
    COUNT(*) FILTER (WHERE status = 'filed') as pending,
    COUNT(*) FILTER (WHERE status = 'planned') as planned,
    COALESCE(SUM(estimated_cost), 0) as estimated_total_cost,
    COALESCE(SUM(actual_cost), 0) as actual_total_cost
FROM ip_copyrights;

-- Brand Hierarchy Tree View
CREATE OR REPLACE VIEW brand_tree AS
WITH RECURSIVE brand_tree AS (
    SELECT 
        id,
        brand_name,
        brand_type,
        parent_brand_id,
        0 as level,
        brand_name::text as path
    FROM brand_hierarchy
    WHERE parent_brand_id IS NULL
    
    UNION ALL
    
    SELECT 
        b.id,
        b.brand_name,
        b.brand_type,
        b.parent_brand_id,
        bt.level + 1,
        bt.path || ' > ' || b.brand_name
    FROM brand_hierarchy b
    INNER JOIN brand_tree bt ON b.parent_brand_id = bt.id
)
SELECT * FROM brand_tree ORDER BY path;

-- ============================================================
-- 8. INITIAL DATA SEED
-- ============================================================

-- Insert methodology version
INSERT INTO methodology_versions (version, methodology_name, description, total_stages, release_date, is_current)
VALUES ('1.0.0', 'The Everest Ascent', 'The 12-Stage Methodology for Distressed Real Estate Intelligence', 12, '2025-12-11', true)
ON CONFLICT DO NOTHING;

-- Insert parent brand
INSERT INTO brand_hierarchy (brand_name, brand_type, tagline, description, domain_primary, status)
VALUES ('EVEREST', 'parent', 'The Summit of Distressed Real Estate', '35 years of distressed real estate expertise encoded into an Agentic AI ecosystem', 'everest.capital', 'active')
ON CONFLICT DO NOTHING;
