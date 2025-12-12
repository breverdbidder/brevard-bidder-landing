-- ============================================================
-- EVEREST BRAND ARCHITECTURE - SEED DATA
-- Initial data population for brands, IP, and methodology
-- Version: 1.0.0 | Date: 2025-12-11
-- ============================================================

-- ============================================================
-- 1. BRAND HIERARCHY SEED DATA
-- ============================================================

-- First, get/create the parent brand ID
DO $$
DECLARE
    v_everest_id UUID;
    v_methodology_id UUID;
    v_biddeed_id UUID;
    v_development_id UUID;
    v_institute_id UUID;
    v_insights_id UUID;
    v_ventures_id UUID;
    v_method_version_id UUID;
BEGIN
    -- Parent Brand: EVEREST
    INSERT INTO brand_hierarchy (brand_name, brand_type, tagline, description, domain_primary, domain_alternatives, status)
    VALUES ('EVEREST', 'parent', 'The Summit of Distressed Real Estate', 
            '35 years of distressed real estate expertise encoded into an Agentic AI ecosystem. Founded by Ariel Shapira.',
            'everest.capital', ARRAY['everesthq.com', 'everestcap.ai'], 'active')
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_everest_id;
    
    IF v_everest_id IS NULL THEN
        SELECT id INTO v_everest_id FROM brand_hierarchy WHERE brand_name = 'EVEREST' AND brand_type = 'parent';
    END IF;

    -- Methodology Brand: THE EVEREST ASCENT
    INSERT INTO brand_hierarchy (brand_name, brand_type, parent_brand_id, tagline, description, status)
    VALUES ('THE EVEREST ASCENT', 'methodology', v_everest_id, '12 Stages to the Summit',
            'The 12-stage methodology for distressed real estate intelligence. Also known as The Shapira Method.',
            'active')
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_methodology_id;

    -- Product Brand: BidDeed.AI
    INSERT INTO brand_hierarchy (brand_name, brand_type, parent_brand_id, tagline, description, domain_primary, domain_alternatives, status)
    VALUES ('BidDeed.AI', 'product', v_everest_id, 'Distressed Assets Decoded. For Everyone. Everywhere.',
            'AI-powered platform for foreclosure and tax deed auction intelligence. Implements The Everest Ascent methodology.',
            'biddeed.ai', ARRAY['biddeed.com', 'getbiddeed.com'], 'active')
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_biddeed_id;

    IF v_biddeed_id IS NULL THEN
        SELECT id INTO v_biddeed_id FROM brand_hierarchy WHERE brand_name = 'BidDeed.AI';
    END IF;

    -- Product Brand: Everest Development
    INSERT INTO brand_hierarchy (brand_name, brand_type, parent_brand_id, tagline, description, domain_primary, status)
    VALUES ('Everest Development', 'product', v_everest_id, 'From Dirt to Done',
            'AI-powered site plan development intelligence platform.',
            'everestdev.ai', 'planned')
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_development_id;

    -- Service Brand: Everest Institute
    INSERT INTO brand_hierarchy (brand_name, brand_type, parent_brand_id, tagline, description, domain_primary, status)
    VALUES ('Everest Institute', 'service', v_everest_id, 'Master the 12 Stages',
            'Training and certification programs for The Everest Ascent methodology.',
            'everestinstitute.ai', 'planned')
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_institute_id;

    -- Content Brand: Everest Insights
    INSERT INTO brand_hierarchy (brand_name, brand_type, parent_brand_id, tagline, description, domain_primary, status)
    VALUES ('Everest Insights', 'content', v_everest_id, 'Intelligence from the Summit',
            'Newsletter, podcast, and thought leadership content on distressed real estate.',
            'everestinsights.com', 'planned')
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_insights_id;

    -- Investment Brand: Everest Ventures
    INSERT INTO brand_hierarchy (brand_name, brand_type, parent_brand_id, tagline, description, status)
    VALUES ('Everest Ventures', 'service', v_everest_id, 'Summit-Level Deal Flow',
            'Direct investment and joint venture opportunities sourced through the BidDeed.AI pipeline.',
            'active')
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_ventures_id;

    -- Stage Brands (under BidDeed.AI)
    INSERT INTO brand_hierarchy (brand_name, brand_type, parent_brand_id, tagline, description, status) VALUES
    ('AuctionRadar', 'stage', v_biddeed_id, 'Find What Others Miss', 'Stage 1: Opportunity discovery and auction identification', 'active'),
    ('TitleTrack', 'stage', v_biddeed_id, 'Follow the Chain', 'Stage 3: Title search and ownership chain analysis', 'active'),
    ('LienLogic', 'stage', v_biddeed_id, 'Know What Survives', 'Stage 4: Lien priority analysis and surviving interest detection', 'active'),
    ('MarketPulse', 'stage', v_biddeed_id, 'Read the Neighborhood', 'Stage 6: Demographic analysis and market intelligence', 'active'),
    ('BidScore', 'stage', v_biddeed_id, 'Predict with Confidence', 'Stage 7: ML-powered probability prediction', 'active'),
    ('The Shapira Formula', 'stage', v_biddeed_id, 'Calculate Your Maximum', 'Stage 8: Optimal bid calculation methodology', 'active'),
    ('ExitPath', 'stage', v_biddeed_id, 'Know Your Exit Before You Bid', 'Stage 11: Exit strategy analysis and ROI projection', 'active')
    ON CONFLICT DO NOTHING;

    -- Credential Brand
    INSERT INTO brand_hierarchy (brand_name, brand_type, parent_brand_id, tagline, description, status)
    VALUES ('Certified Everest Analyst', 'credential', v_institute_id, 'CEA - Summit-Certified',
            'Professional certification for mastery of The Everest Ascent methodology.',
            'planned')
    ON CONFLICT DO NOTHING;

    -- Get methodology version ID
    SELECT id INTO v_method_version_id FROM methodology_versions WHERE version = '1.0.0' AND is_current = true LIMIT 1;
    
    IF v_method_version_id IS NULL THEN
        INSERT INTO methodology_versions (version, methodology_name, description, total_stages, release_date, is_current)
        VALUES ('1.0.0', 'The Everest Ascent', 'The 12-Stage Methodology for Distressed Real Estate Intelligence', 12, '2025-12-11', true)
        RETURNING id INTO v_method_version_id;
    END IF;

    -- ============================================================
    -- 2. THE 12 STAGES
    -- ============================================================
    
    INSERT INTO everest_ascent_stages (
        methodology_version_id, stage_number, stage_name, phase_name, brand_name,
        function_description, data_sources, output_description, ip_type, is_flagship,
        langgraph_node_name, estimated_duration_seconds, dependencies
    ) VALUES
    -- Phase 1: Base Camp
    (v_method_version_id, 1, 'Discovery', 'Base Camp', 'AuctionRadar',
     'Identify foreclosure and tax deed auction opportunities from multiple sources',
     ARRAY['RealForeclose', 'BECA', 'County Clerks', 'Public Records'],
     'List of upcoming auctions with case numbers and dates',
     ARRAY['trademark', 'trade_secret'], false,
     'discovery_node', 30, ARRAY[]::INTEGER[]),
    
    (v_method_version_id, 2, 'Scraping', 'Base Camp', NULL,
     'Extract detailed case data from Brevard Electronic Court Access (BECA)',
     ARRAY['BECA Portal'],
     'Case details, judgment amounts, plaintiff info, property address',
     ARRAY['trade_secret'], false,
     'beca_scraper_node', 45, ARRAY[1]),
    
    -- Phase 2: The Approach
    (v_method_version_id, 3, 'Title Search', 'The Approach', 'TitleTrack',
     'Analyze ownership chain and recorded documents for the property',
     ARRAY['AcclaimWeb', 'BCPAO', 'County Records'],
     'Ownership history, recorded liens, title defects',
     ARRAY['trademark', 'trade_secret'], false,
     'title_search_node', 60, ARRAY[2]),
    
    (v_method_version_id, 4, 'Lien Priority', 'The Approach', 'LienLogic',
     'Determine lien priority hierarchy and identify surviving interests after foreclosure',
     ARRAY['AcclaimWeb', 'BECA', 'Recording Records'],
     'Lien hierarchy, surviving liens, DO_NOT_BID flags for dangerous scenarios',
     ARRAY['trademark', 'patent', 'trade_secret'], true,
     'lien_priority_node', 90, ARRAY[2, 3]),
    
    (v_method_version_id, 5, 'Tax Certificates', 'The Approach', NULL,
     'Identify outstanding tax certificates and calculate redemption amounts',
     ARRAY['RealTDM', 'County Tax Collector'],
     'Tax certificate list, amounts, redemption costs',
     ARRAY['trade_secret'], false,
     'tax_cert_node', 30, ARRAY[2]),
    
    -- Phase 3: The Climb
    (v_method_version_id, 6, 'Demographics', 'The Climb', 'MarketPulse',
     'Analyze neighborhood intelligence and market context for property valuation',
     ARRAY['Census API', 'BCPAO', 'Market Data'],
     'Median income, vacancy rates, appreciation trends, neighborhood score',
     ARRAY['trademark', 'trade_secret'], false,
     'demographics_node', 45, ARRAY[2]),
    
    (v_method_version_id, 7, 'ML Score', 'The Climb', 'BidScore',
     'Generate probability predictions for auction outcomes using XGBoost model',
     ARRAY['Historical Auctions (1,393+ records)', 'Property Features'],
     'Third-party purchase probability, confidence intervals, comparable outcomes',
     ARRAY['trademark', 'patent', 'trade_secret'], true,
     'ml_score_node', 15, ARRAY[2, 4, 6]),
    
    (v_method_version_id, 8, 'Max Bid', 'The Climb', 'The Shapira Formula',
     'Calculate optimal maximum bid using proprietary formula with margin of safety',
     ARRAY['ARV Estimates', 'Repair Costs', 'Market Data'],
     'Max bid amount, bid/judgment ratio, BID/REVIEW/SKIP recommendation',
     ARRAY['trademark', 'trade_secret'], true,
     'max_bid_node', 30, ARRAY[2, 4, 5, 6, 7]),
    
    -- Phase 4: Summit Push
    (v_method_version_id, 9, 'Decision Log', 'Summit Push', NULL,
     'Create comprehensive audit trail for all analysis decisions',
     ARRAY['All Prior Stages'],
     'Timestamped decision record with reasoning, warnings, and confidence scores',
     ARRAY['trade_secret'], false,
     'decision_log_node', 10, ARRAY[8]),
    
    (v_method_version_id, 10, 'Report', 'Summit Push', NULL,
     'Generate client-facing analysis reports with recommendations',
     ARRAY['All Prior Stages', 'BCPAO Photos'],
     'DOCX/PDF reports with property analysis, recommendations, and supporting data',
     ARRAY['copyright', 'trade_secret'], false,
     'report_node', 60, ARRAY[9]),
    
    -- Phase 5: The Descent
    (v_method_version_id, 11, 'Disposition', 'The Descent', 'ExitPath',
     'Analyze exit strategies and calculate projected ROI for each option',
     ARRAY['Market Data', 'Rental Comps', 'Buyer Pool Analysis'],
     'Exit strategy recommendations, hold period analysis, ROI projections',
     ARRAY['trademark', 'trade_secret'], false,
     'disposition_node', 45, ARRAY[8]),
    
    (v_method_version_id, 12, 'Archive', 'The Descent', NULL,
     'Store results for historical analysis and model improvement',
     ARRAY['Auction Results', 'Final Sale Prices'],
     'Historical database entry, model retraining data, outcome tracking',
     ARRAY['trade_secret'], false,
     'archive_node', 15, ARRAY[10, 11])
    
    ON CONFLICT (methodology_version_id, stage_number) DO UPDATE SET
        stage_name = EXCLUDED.stage_name,
        phase_name = EXCLUDED.phase_name,
        brand_name = EXCLUDED.brand_name,
        function_description = EXCLUDED.function_description,
        data_sources = EXCLUDED.data_sources,
        output_description = EXCLUDED.output_description,
        ip_type = EXCLUDED.ip_type,
        is_flagship = EXCLUDED.is_flagship,
        langgraph_node_name = EXCLUDED.langgraph_node_name,
        estimated_duration_seconds = EXCLUDED.estimated_duration_seconds,
        dependencies = EXCLUDED.dependencies,
        updated_at = NOW();

END $$;

-- ============================================================
-- 3. IP REGISTRY SEED DATA
-- ============================================================

-- Tier 1 Trademarks (File Immediately)
INSERT INTO ip_trademarks (mark_name, mark_type, classes, goods_services, status, priority_tier, estimated_cost) VALUES
('EVEREST', 'word', ARRAY[36], 'Real estate investment services', 'planned', 1, 350.00),
('THE EVEREST ASCENT', 'word', ARRAY[36, 42], 'Real estate methodology and software services', 'planned', 1, 600.00),
('THE SHAPIRA FORMULA', 'word', ARRAY[36], 'Real estate valuation methodology', 'planned', 1, 350.00),
('BIDDEED', 'word', ARRAY[42], 'AI software for real estate analysis', 'planned', 1, 350.00),
('BIDDEED.AI', 'word', ARRAY[42], 'AI software for real estate analysis', 'planned', 1, 350.00),
('LIENLOGIC', 'word', ARRAY[36, 42], 'Lien analysis services and software', 'planned', 1, 600.00),
('BIDSCORE', 'word', ARRAY[36, 42], 'Real estate prediction services and software', 'planned', 1, 600.00)
ON CONFLICT DO NOTHING;

-- Tier 2 Trademarks (File Within 60 Days)
INSERT INTO ip_trademarks (mark_name, mark_type, classes, goods_services, status, priority_tier, estimated_cost) VALUES
('AUCTIONRADAR', 'word', ARRAY[42], 'Auction tracking and notification software', 'planned', 2, 350.00),
('TITLETRACK', 'word', ARRAY[36], 'Title search and analysis services', 'planned', 2, 350.00),
('MARKETPULSE', 'word', ARRAY[36], 'Real estate market analysis services', 'planned', 2, 350.00),
('EXITPATH', 'word', ARRAY[36], 'Real estate exit strategy consulting', 'planned', 2, 350.00)
ON CONFLICT DO NOTHING;

-- Tier 3 Trademarks (File Within 90 Days)
INSERT INTO ip_trademarks (mark_name, mark_type, classes, goods_services, status, priority_tier, estimated_cost) VALUES
('CERTIFIED EVEREST ANALYST', 'word', ARRAY[41], 'Educational certification services', 'planned', 3, 350.00),
('EVEREST INSTITUTE', 'word', ARRAY[41], 'Educational services for real estate', 'planned', 3, 350.00),
('EVEREST INSIGHTS', 'word', ARRAY[41], 'Newsletter and publication services', 'planned', 3, 350.00)
ON CONFLICT DO NOTHING;

-- Patents (Planned)
INSERT INTO ip_patents (title, patent_type, status, priority, claims_summary, estimated_cost) VALUES
('System and Method for Automated Lien Priority Analysis in Real Estate Foreclosure Auctions', 'provisional', 'planned', 'critical',
 'Method for automatically analyzing lien hierarchy, identifying plaintiff types, determining senior/junior relationships, and flagging scenarios where debts survive foreclosure',
 3000.00),
('Machine Learning System for Predicting Third-Party Purchase Probability in Distressed Asset Auctions', 'provisional', 'planned', 'critical',
 'System using gradient boosting models trained on historical auction data to predict probability of third-party purchase, incorporating features like judgment amount, property value, and plaintiff patterns',
 3000.00)
ON CONFLICT DO NOTHING;

-- Trade Secrets
INSERT INTO ip_trade_secrets (secret_id, name, description, category, protection_measures, access_level, risk_level) VALUES
('TS-001', 'BECA Scraping Logic', 'Anti-detection patterns, regex for address extraction, session management for BECA portal', 'algorithm',
 ARRAY['Code access restricted', 'Not in public repository', 'Encrypted storage'], 'founder_only', 'critical'),
('TS-002', 'Discovery Weighting Algorithm', 'Scoring logic for prioritizing auction opportunities based on judgment amount, property type, location', 'algorithm',
 ARRAY['Externalized from main codebase', 'Encrypted configuration'], 'core_team', 'high'),
('TS-003', 'Lien Priority Decision Tree', 'Rule-based logic for detecting surviving liens in HOA foreclosures and other scenarios', 'process',
 ARRAY['Documented separately', 'Encrypted storage', 'Access logged'], 'founder_only', 'critical'),
('TS-004', 'The Shapira Formula', 'Complete max bid calculation formula: (ARV×70%)-Repairs-$10K-MIN($25K,15%×ARV)', 'formula',
 ARRAY['Trademarked name', 'Formula encrypted', 'Not in public documentation'], 'founder_only', 'critical'),
('TS-005', 'XGBoost Model Weights', 'Trained model parameters for third-party purchase probability prediction (64.4% accuracy)', 'model',
 ARRAY['Encrypted storage', 'Separate repository', 'Access requires approval'], 'core_team', 'critical'),
('TS-006', 'Plaintiff Category Mapping', '28 plaintiff patterns and their historical behaviors/outcomes', 'data',
 ARRAY['Internal documentation only', 'Not exposed via API'], 'core_team', 'high'),
('TS-007', 'Demographic Weighting', 'Zip code scoring algorithm for neighborhood quality assessment', 'algorithm',
 ARRAY['Externalized configuration', 'Encrypted weights'], 'core_team', 'medium'),
('TS-008', 'Exit Strategy Scoring', 'ROI projection methodology for each exit strategy type', 'process',
 ARRAY['Internal documentation only'], 'core_team', 'medium')
ON CONFLICT (secret_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    protection_measures = EXCLUDED.protection_measures,
    access_level = EXCLUDED.access_level,
    risk_level = EXCLUDED.risk_level,
    updated_at = NOW();

-- Domains (Target)
INSERT INTO ip_domains (domain_name, status, purpose) VALUES
('biddeed.ai', 'target', 'Primary product domain'),
('biddeed.com', 'target', 'Product redirect'),
('everest.capital', 'target', 'Parent brand domain'),
('everestinsights.com', 'target', 'Content/newsletter domain'),
('everestinstitute.ai', 'target', 'Training/certification domain'),
('everestdev.ai', 'target', 'Site plan development product')
ON CONFLICT (domain_name) DO NOTHING;

-- ============================================================
-- 4. BRAND MESSAGING SEED DATA
-- ============================================================

DO $$
DECLARE
    v_everest_id UUID;
    v_biddeed_id UUID;
    v_ascent_id UUID;
BEGIN
    SELECT id INTO v_everest_id FROM brand_hierarchy WHERE brand_name = 'EVEREST' AND brand_type = 'parent';
    SELECT id INTO v_biddeed_id FROM brand_hierarchy WHERE brand_name = 'BidDeed.AI';
    SELECT id INTO v_ascent_id FROM brand_hierarchy WHERE brand_name = 'THE EVEREST ASCENT';

    -- EVEREST messaging
    INSERT INTO brand_messaging (brand_id, message_type, message_text, audience, is_primary) VALUES
    (v_everest_id, 'tagline', 'The Summit of Distressed Real Estate', 'general', true),
    (v_everest_id, 'value_prop', '35 years of distressed real estate expertise, encoded into AI', 'investors', true),
    (v_everest_id, 'key_message', 'Where experience meets intelligence', 'general', false),
    (v_everest_id, 'elevator_pitch', 'Everest transforms 35 years of courthouse-steps experience into an AI system that analyzes foreclosure auctions in 23 seconds instead of 4 hours.', 'investors', true)
    ON CONFLICT DO NOTHING;

    -- BidDeed.AI messaging
    INSERT INTO brand_messaging (brand_id, message_type, message_text, audience, is_primary) VALUES
    (v_biddeed_id, 'tagline', 'Distressed Assets Decoded. For Everyone. Everywhere.', 'general', true),
    (v_biddeed_id, 'value_prop', 'Global investors access US distressed asset auctions', 'international', true),
    (v_biddeed_id, 'value_prop', 'Your on-ramp to America''s highest-yield real estate market', 'international', false),
    (v_biddeed_id, 'key_message', 'Local courthouse expertise, encoded for global capital', 'institutional', true),
    (v_biddeed_id, 'key_message', 'BID, REVIEW, or SKIP with ML-powered confidence', 'investors', false)
    ON CONFLICT DO NOTHING;

    -- THE EVEREST ASCENT messaging
    INSERT INTO brand_messaging (brand_id, message_type, message_text, audience, is_primary) VALUES
    (v_ascent_id, 'tagline', '12 Stages to the Summit', 'general', true),
    (v_ascent_id, 'key_message', 'Skip one stage, you fall. Master all 12, you summit.', 'general', true),
    (v_ascent_id, 'key_message', '35 years mapping the route. 23 seconds to execute.', 'investors', false)
    ON CONFLICT DO NOTHING;

END $$;

-- ============================================================
-- 5. VERIFY DATA
-- ============================================================

-- Output summary
DO $$
DECLARE
    brand_count INTEGER;
    stage_count INTEGER;
    tm_count INTEGER;
    ts_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO brand_count FROM brand_hierarchy;
    SELECT COUNT(*) INTO stage_count FROM everest_ascent_stages;
    SELECT COUNT(*) INTO tm_count FROM ip_trademarks;
    SELECT COUNT(*) INTO ts_count FROM ip_trade_secrets;
    
    RAISE NOTICE '=== EVEREST BRAND ARCHITECTURE SEED COMPLETE ===';
    RAISE NOTICE 'Brands created: %', brand_count;
    RAISE NOTICE 'Methodology stages: %', stage_count;
    RAISE NOTICE 'Trademarks planned: %', tm_count;
    RAISE NOTICE 'Trade secrets documented: %', ts_count;
END $$;
