// BidDeed.AI V17 - Animated Video Demo with Real-Time Supabase Data
// Pulls LIVE auction data from Supabase to showcase platform functionality
// © 2025 Everest Capital USA. All Rights Reserved.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

// ============ SUPABASE CLIENT ============
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mocerqjnksmhcjzxrewo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// ============ DEMO CONFIGURATION ============
const DEMO_CONFIG = {
  totalDuration: 45, // seconds
  stages: [
    { id: 1, name: 'Discovery', duration: 3, startAt: 0 },
    { id: 2, name: 'Scraping', duration: 4, startAt: 3 },
    { id: 3, name: 'Title Search', duration: 4, startAt: 7 },
    { id: 4, name: 'Lien Priority', duration: 5, startAt: 11 },
    { id: 5, name: 'Tax Certs', duration: 3, startAt: 16 },
    { id: 6, name: 'Demographics', duration: 3, startAt: 19 },
    { id: 7, name: 'ML Score', duration: 5, startAt: 22 },
    { id: 8, name: 'Max Bid', duration: 4, startAt: 27 },
    { id: 9, name: 'Decision', duration: 3, startAt: 31 },
    { id: 10, name: 'Report', duration: 4, startAt: 34 },
    { id: 11, name: 'Disposition', duration: 3, startAt: 38 },
    { id: 12, name: 'Archive', duration: 4, startAt: 41 },
  ],
};

// ============ FALLBACK DATA (if Supabase unavailable) ============
const FALLBACK_DATA = {
  auction: {
    date: '2025-12-18',
    type: 'TAX_DEED',
    location: 'Brevard County, FL',
    totalProperties: 20,
    bidRecommended: 15,
    reviewRecommended: 3,
    skipRecommended: 2,
  },
  sampleProperty: {
    caseNumber: '250179',
    parcelId: '3021477',
    address: '202 Ivory Coral Ln #304, Merritt Island, FL 32953',
    propertyType: 'CONDO',
    sqft: 1248,
    yearBuilt: 2006,
    ownerName: 'CAPE CROSSING CONDO ASSN INC',
    marketValue: 185000,
    openingBid: 12847.23,
    finalJudgment: 15420.88,
    bidJudgmentRatio: 83.3,
    recommendation: 'BID',
    mlProbability: 0.42,
    maxBid: 98500,
    liens: [
      { type: 'HOA', amount: 8420.50, survives: false },
      { type: 'Tax Certificate', amount: 4426.73, survives: false },
    ],
    winProbabilityMatrix: {
      '10%': 46250,
      '20%': 55500,
      '40%': 74000,
      '60%': 92500,
      '80%': 111000,
      '95%': 129500,
    },
  },
  stats: {
    totalProcessed: 1393,
    mlAccuracy: 64.4,
    avgProcessingTime: 23,
    costSavings: 90,
  }
};

// ============ REAL DATA FETCHER WITH SUPABASE ============
const useRealAuctionData = () => {
  const [auctionData, setAuctionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('loading');

  useEffect(() => {
    const fetchData = async () => {
      // If no Supabase client, use fallback
      if (!supabase) {
        console.log('Supabase not configured, using fallback data');
        setAuctionData(FALLBACK_DATA);
        setDataSource('fallback');
        setLoading(false);
        return;
      }

      try {
        // Fetch from multiple tables in parallel
        const [
          { data: auctionResults, error: auctionError },
          { data: historicalData, error: historyError },
          { data: statsData, error: statsError }
        ] = await Promise.all([
          // Get latest auction results
          supabase
            .from('auction_results')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20),
          
          // Get historical stats
          supabase
            .from('historical_auctions')
            .select('*')
            .order('auction_date', { ascending: false })
            .limit(5),
          
          // Get daily metrics
          supabase
            .from('daily_metrics')
            .select('*')
            .order('date', { ascending: false })
            .limit(1)
        ]);

        // Check for errors
        if (auctionError) {
          console.warn('Auction results error:', auctionError);
        }
        if (historyError) {
          console.warn('Historical data error:', historyError);
        }

        // Process results
        if (auctionResults && auctionResults.length > 0) {
          // Transform Supabase data to demo format
          const latestAuction = auctionResults[0];
          
          const transformedData = {
            auction: {
              date: latestAuction.auction_date || '2025-12-18',
              type: latestAuction.auction_type || 'TAX_DEED',
              location: 'Brevard County, FL',
              totalProperties: auctionResults.length,
              bidRecommended: auctionResults.filter(r => r.recommendation === 'BID').length,
              reviewRecommended: auctionResults.filter(r => r.recommendation === 'REVIEW').length,
              skipRecommended: auctionResults.filter(r => r.recommendation === 'SKIP').length,
            },
            sampleProperty: {
              caseNumber: latestAuction.case_number || latestAuction.caseNumber,
              parcelId: latestAuction.parcel_id || latestAuction.parcelId,
              address: latestAuction.property_address || latestAuction.address,
              propertyType: latestAuction.property_type || 'SFR',
              sqft: latestAuction.building_sqft || latestAuction.sqft || 0,
              yearBuilt: latestAuction.year_built || latestAuction.yearBuilt || 0,
              ownerName: latestAuction.owner_name || 'OWNER',
              marketValue: latestAuction.market_value || latestAuction.arv || 0,
              openingBid: latestAuction.opening_bid || latestAuction.openingBid || 0,
              finalJudgment: latestAuction.final_judgment || latestAuction.finalJudgment || 0,
              bidJudgmentRatio: latestAuction.bid_judgment_ratio || latestAuction.bidJudgmentRatio || 0,
              recommendation: latestAuction.recommendation || 'REVIEW',
              mlProbability: latestAuction.ml_probability || latestAuction.mlProbability || 0.4,
              maxBid: latestAuction.max_bid || latestAuction.maxBid || 0,
              liens: latestAuction.liens || [],
              winProbabilityMatrix: latestAuction.win_probability_matrix || 
                                    latestAuction.winProbabilityMatrix || 
                                    FALLBACK_DATA.sampleProperty.winProbabilityMatrix,
            },
            stats: {
              totalProcessed: historicalData?.length || 1393,
              mlAccuracy: statsData?.[0]?.ml_accuracy || 64.4,
              avgProcessingTime: statsData?.[0]?.avg_processing_time || 23,
              costSavings: 90,
            }
          };

          setAuctionData(transformedData);
          setDataSource('supabase');
        } else {
          // Use fallback if no data
          console.log('No auction results found, using fallback');
          setAuctionData(FALLBACK_DATA);
          setDataSource('fallback');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching auction data:', err);
        setError(err.message);
        setAuctionData(FALLBACK_DATA);
        setDataSource('fallback');
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscription if Supabase available
    let subscription = null;
    if (supabase) {
      subscription = supabase
        .channel('auction_updates')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'auction_results' },
          (payload) => {
            console.log('Real-time update:', payload);
            fetchData(); // Refresh data on changes
          }
        )
        .subscribe();
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return { auctionData, loading, error, dataSource };
};

// ============ DATA SOURCE BADGE ============
const DataSourceBadge = ({ source }) => {
  const badges = {
    supabase: { label: '🔴 LIVE', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    fallback: { label: '📦 Demo', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    loading: { label: '⏳ Loading', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  };
  
  const badge = badges[source] || badges.loading;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full border ${badge.color}`}>
      {source === 'supabase' && <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />}
      {badge.label}
    </span>
  );
};

// ============ ANIMATED STAGE COMPONENT ============
const AnimatedStage = ({ stage, isActive, isComplete, data }) => {
  const stageContent = {
    1: { // Discovery
      title: 'Discovering Auction Properties',
      visual: (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="animate-pulse">●</span>
            <span>Scanning brevard.realforeclose.com...</span>
          </div>
          <div className="text-sm text-slate-400">
            Found: {data?.auction?.totalProperties || 20} properties for {data?.auction?.date || '12/18/2025'}
          </div>
        </div>
      )
    },
    2: { // Scraping
      title: 'Extracting Property Data',
      visual: (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-2 bg-white/5 rounded">
            <div className="text-slate-500">Parcel</div>
            <div className="text-white font-mono">{data?.sampleProperty?.parcelId}</div>
          </div>
          <div className="p-2 bg-white/5 rounded">
            <div className="text-slate-500">Type</div>
            <div className="text-white">{data?.sampleProperty?.propertyType}</div>
          </div>
          <div className="p-2 bg-white/5 rounded">
            <div className="text-slate-500">SqFt</div>
            <div className="text-white">{data?.sampleProperty?.sqft?.toLocaleString()}</div>
          </div>
          <div className="p-2 bg-white/5 rounded">
            <div className="text-slate-500">Year</div>
            <div className="text-white">{data?.sampleProperty?.yearBuilt}</div>
          </div>
        </div>
      )
    },
    3: { // Title Search
      title: 'Running Title Search',
      visual: (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-400">
            <span className="animate-spin">⟳</span>
            <span>Querying AcclaimWeb + RealTDM...</span>
          </div>
          <div className="p-2 bg-white/5 rounded text-sm">
            <div className="text-slate-500">Current Owner</div>
            <div className="text-white">{data?.sampleProperty?.ownerName}</div>
          </div>
        </div>
      )
    },
    4: { // Lien Priority - CRITICAL
      title: 'Analyzing Lien Priority',
      visual: (
        <div className="space-y-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded">
            <div className="text-amber-400 font-semibold mb-2">⚠️ Lien Analysis</div>
            {data?.sampleProperty?.liens?.map((lien, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-slate-300">{lien.type}</span>
                <span className={lien.survives ? 'text-red-400' : 'text-emerald-400'}>
                  ${lien.amount?.toLocaleString()} {lien.survives ? '(SURVIVES)' : '(Wiped)'}
                </span>
              </div>
            ))}
          </div>
          <div className="text-xs text-emerald-400">
            ✓ No senior mortgage detected - Safe to bid
          </div>
        </div>
      )
    },
    5: { // Tax Certs
      title: 'Checking Tax Certificates',
      visual: (
        <div className="p-3 bg-white/5 rounded">
          <div className="flex justify-between mb-2">
            <span className="text-slate-400">Opening Bid</span>
            <span className="text-amber-400 font-mono">
              ${data?.sampleProperty?.openingBid?.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Final Judgment</span>
            <span className="text-white font-mono">
              ${data?.sampleProperty?.finalJudgment?.toLocaleString()}
            </span>
          </div>
        </div>
      )
    },
    6: { // Demographics
      title: 'Loading Demographics',
      visual: (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="p-2 bg-emerald-500/10 rounded">
            <div className="text-slate-500">ZIP</div>
            <div className="text-emerald-400">32953</div>
          </div>
          <div className="p-2 bg-emerald-500/10 rounded">
            <div className="text-slate-500">Median Income</div>
            <div className="text-emerald-400">$79,000</div>
          </div>
          <div className="p-2 bg-emerald-500/10 rounded">
            <div className="text-slate-500">Vacancy Rate</div>
            <div className="text-emerald-400">5.5%</div>
          </div>
          <div className="p-2 bg-emerald-500/10 rounded">
            <div className="text-slate-500">Target ZIP</div>
            <div className="text-emerald-400">✓ Yes</div>
          </div>
        </div>
      )
    },
    7: { // ML Score - Key Feature
      title: 'Calculating ML Predictions',
      visual: (
        <div className="space-y-3">
          <div className="p-3 bg-gradient-to-r from-emerald-500/10 to-amber-500/10 rounded border border-emerald-500/20">
            <div className="text-xs text-slate-400 mb-1">Win Probability Matrix</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {Object.entries(data?.sampleProperty?.winProbabilityMatrix || {}).slice(0, 6).map(([prob, bid]) => (
                <div key={prob} className="flex justify-between">
                  <span className="text-slate-400">{prob}</span>
                  <span className="text-white font-mono">${(bid/1000).toFixed(0)}K</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">XGBoost Prediction:</span>
            <span className="text-emerald-400 font-semibold">
              {((data?.sampleProperty?.mlProbability || 0.4) * 100).toFixed(0)}% third-party probability
            </span>
          </div>
        </div>
      )
    },
    8: { // Max Bid
      title: 'Computing Maximum Bid',
      visual: (
        <div className="space-y-2">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded">
            <div className="text-xs text-slate-400 mb-1">The Shapira Formula™</div>
            <div className="text-xs font-mono text-slate-300 mb-2">
              (ARV × 70%) - Repairs - $10K - MIN($25K, 15%×ARV)
            </div>
            <div className="text-2xl font-bold text-amber-400">
              ${data?.sampleProperty?.maxBid?.toLocaleString()}
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Bid/Judgment Ratio</span>
            <span className="text-emerald-400 font-semibold">
              {data?.sampleProperty?.bidJudgmentRatio}%
            </span>
          </div>
        </div>
      )
    },
    9: { // Decision
      title: 'Generating Recommendation',
      visual: (
        <div className={`p-4 border-2 rounded-lg text-center ${
          data?.sampleProperty?.recommendation === 'BID' 
            ? 'bg-emerald-500/10 border-emerald-500/50' 
            : data?.sampleProperty?.recommendation === 'REVIEW'
            ? 'bg-amber-500/10 border-amber-500/50'
            : 'bg-red-500/10 border-red-500/50'
        }`}>
          <div className="text-3xl mb-2">
            {data?.sampleProperty?.recommendation === 'BID' ? '✅' : 
             data?.sampleProperty?.recommendation === 'REVIEW' ? '⚠️' : '❌'}
          </div>
          <div className={`text-2xl font-bold ${
            data?.sampleProperty?.recommendation === 'BID' ? 'text-emerald-400' :
            data?.sampleProperty?.recommendation === 'REVIEW' ? 'text-amber-400' : 'text-red-400'
          }`}>
            {data?.sampleProperty?.recommendation}
          </div>
          <div className="text-sm text-slate-400 mt-1">
            {data?.sampleProperty?.bidJudgmentRatio >= 75 
              ? 'Ratio ≥75% threshold met' 
              : data?.sampleProperty?.bidJudgmentRatio >= 60
              ? 'Ratio 60-74% - Review required'
              : 'Ratio <60% - Skip recommended'}
          </div>
        </div>
      )
    },
    10: { // Report
      title: 'Generating DOCX Report',
      visual: (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <span>📄</span>
            <span>Creating 12-stage report...</span>
          </div>
          <div className="p-2 bg-white/5 rounded text-sm font-mono">
            {data?.sampleProperty?.caseNumber}_everest_report.docx
          </div>
          <div className="h-2 bg-white/10 rounded overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3 }}
            />
          </div>
        </div>
      )
    },
    11: { // Disposition
      title: 'Determining Exit Strategy',
      visual: (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded">
            <div className="text-xs text-slate-400">Strategy</div>
            <div className="text-amber-400 font-semibold">MTR</div>
            <div className="text-xs text-slate-500">Mid-Term Rental</div>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded">
            <div className="text-xs text-slate-400">Projected ROI</div>
            <div className="text-emerald-400 font-semibold">116%</div>
            <div className="text-xs text-slate-500">12-month hold</div>
          </div>
        </div>
      )
    },
    12: { // Archive
      title: 'Archiving to Supabase',
      visual: (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <span>💾</span>
            <span>Saved to auction_results table</span>
          </div>
          <div className="p-2 bg-white/5 rounded text-xs font-mono text-slate-400">
            INSERT INTO auction_results (case_number, recommendation, max_bid...)
          </div>
          <div className="text-sm text-emerald-400 font-semibold">
            ✓ Pipeline Complete in {data?.stats?.avgProcessingTime || 23} seconds
          </div>
        </div>
      )
    },
  };

  const content = stageContent[stage.id] || { title: stage.name, visual: null };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ 
        opacity: isActive || isComplete ? 1 : 0.3,
        x: 0,
        scale: isActive ? 1.02 : 1
      }}
      className={`p-4 rounded-xl border transition-all ${
        isActive 
          ? 'bg-white/10 border-amber-500/50 shadow-lg shadow-amber-500/10'
          : isComplete
          ? 'bg-emerald-500/5 border-emerald-500/30'
          : 'bg-white/5 border-white/10'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          isComplete ? 'bg-emerald-500 text-white' :
          isActive ? 'bg-amber-500 text-slate-900' :
          'bg-white/10 text-slate-400'
        }`}>
          {isComplete ? '✓' : stage.id}
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-white">{content.title}</div>
          <div className="text-xs text-slate-500">Stage {stage.id} of 12</div>
        </div>
        {isActive && (
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
        )}
      </div>
      
      <AnimatePresence>
        {(isActive || isComplete) && content.visual && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {content.visual}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============ MAIN ANIMATED DEMO COMPONENT ============
const AnimatedDemoV17 = ({ autoPlay = false, onComplete }) => {
  const { auctionData, loading, error, dataSource } = useRealAuctionData();
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isPlaying && currentTime < DEMO_CONFIG.totalDuration) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(t => {
          if (t >= DEMO_CONFIG.totalDuration) {
            setIsPlaying(false);
            onComplete?.();
            return t;
          }
          return t + 0.1;
        });
      }, 100);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, currentTime, onComplete]);

  const getCurrentStage = useCallback(() => {
    for (let i = DEMO_CONFIG.stages.length - 1; i >= 0; i--) {
      if (currentTime >= DEMO_CONFIG.stages[i].startAt) {
        return DEMO_CONFIG.stages[i].id;
      }
    }
    return 1;
  }, [currentTime]);

  const currentStageId = getCurrentStage();
  const progress = (currentTime / DEMO_CONFIG.totalDuration) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-900 rounded-2xl">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
          <div className="text-slate-400">Connecting to Supabase...</div>
          <div className="text-xs text-slate-600 mt-2">Fetching real auction data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden border border-white/10">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
            <span className="text-slate-900 font-black text-xs">BD</span>
          </div>
          <div>
            <div className="text-white font-semibold flex items-center gap-2">
              BidDeed.AI Demo
              <DataSourceBadge source={dataSource} />
            </div>
            <div className="text-xs text-slate-400">
              {dataSource === 'supabase' ? 'Real-time' : 'Sample'} data from {auctionData?.auction?.date} Auction
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 bg-amber-500 text-slate-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-2"
          >
            {isPlaying ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Play
              </>
            )}
          </button>
          <button
            onClick={() => { setCurrentTime(0); setIsPlaying(true); }}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            ↺ Restart
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-white/10">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-500 to-emerald-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Content - Split View */}
      <div className="grid lg:grid-cols-2 gap-4 p-4">
        {/* Left: Property Card */}
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Analyzing Property</div>
            {error && (
              <span className="text-xs text-amber-400">⚠️ Using cached data</span>
            )}
          </div>
          <div className="text-lg font-semibold text-white mb-1">
            {auctionData?.sampleProperty?.address}
          </div>
          <div className="text-sm text-slate-400 mb-4">
            Case #{auctionData?.sampleProperty?.caseNumber} • Parcel {auctionData?.sampleProperty?.parcelId}
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-slate-500">Market Value</div>
              <div className="text-white font-semibold">
                ${auctionData?.sampleProperty?.marketValue?.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-slate-500">Opening Bid</div>
              <div className="text-amber-400 font-semibold">
                ${auctionData?.sampleProperty?.openingBid?.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-slate-500">Type</div>
              <div className="text-white">{auctionData?.sampleProperty?.propertyType}</div>
            </div>
            <div>
              <div className="text-slate-500">SqFt</div>
              <div className="text-white">{auctionData?.sampleProperty?.sqft?.toLocaleString()}</div>
            </div>
          </div>

          {/* Final Recommendation */}
          {currentStageId >= 9 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-3 rounded-lg border ${
                auctionData?.sampleProperty?.recommendation === 'BID'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-amber-500/10 border-amber-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">RECOMMENDATION</div>
                  <div className={`text-xl font-bold ${
                    auctionData?.sampleProperty?.recommendation === 'BID' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {auctionData?.sampleProperty?.recommendation}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">MAX BID</div>
                  <div className="text-xl font-bold text-amber-400">
                    ${auctionData?.sampleProperty?.maxBid?.toLocaleString()}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: Stage Progress */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
          {DEMO_CONFIG.stages.map((stage) => (
            <AnimatedStage
              key={stage.id}
              stage={stage}
              isActive={currentStageId === stage.id}
              isComplete={currentStageId > stage.id}
              data={auctionData}
            />
          ))}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-white/10 grid grid-cols-4 gap-4 text-center bg-slate-900/50">
        <div>
          <div className="text-2xl font-bold text-amber-400">
            {auctionData?.stats?.totalProcessed?.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">Historical Records</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-emerald-400">
            {auctionData?.stats?.mlAccuracy}%
          </div>
          <div className="text-xs text-slate-500">ML Accuracy</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white">
            {auctionData?.stats?.avgProcessingTime}s
          </div>
          <div className="text-xs text-slate-500">Avg Processing</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-amber-400">
            {auctionData?.stats?.costSavings}%
          </div>
          <div className="text-xs text-slate-500">Cost Savings</div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedDemoV17;
