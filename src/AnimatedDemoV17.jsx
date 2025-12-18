// BidDeed.AI V17 - Animated Video Demo with API-based Real-Time Data
// Uses /api/auction-data endpoint which securely proxies to Supabase
// © 2025 Everest Capital USA. All Rights Reserved.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============ DEMO CONFIGURATION ============
const DEMO_CONFIG = {
  totalDuration: 45,
  apiEndpoint: '/api/auction-data',
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

// ============ FALLBACK DATA ============
const FALLBACK_DATA = {
  source: 'fallback',
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
      '10%': 46250, '20%': 55500, '40%': 74000,
      '60%': 92500, '80%': 111000, '95%': 129500,
    },
  },
  stats: {
    totalProcessed: 1393,
    mlAccuracy: 64.4,
    avgProcessingTime: 23,
    costSavings: 90,
  }
};

// ============ DATA FETCHER HOOK ============
const useAuctionData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('loading');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(DEMO_CONFIG.apiEndpoint);
        const result = await response.json();
        
        // Check data source from response or header
        const source = result.source || 
                      response.headers.get('X-Data-Source') || 
                      'api';
        
        setData(result);
        setDataSource(source === 'supabase-live' ? 'live' : 
                     source === 'supabase' ? 'live' : 'demo');
        setLoading(false);
      } catch (error) {
        console.warn('API fetch failed, using fallback:', error);
        setData(FALLBACK_DATA);
        setDataSource('demo');
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh every 30 seconds if live
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return { data, loading, dataSource };
};

// ============ DATA SOURCE BADGE ============
const DataSourceBadge = ({ source }) => {
  const config = {
    live: { label: '🔴 LIVE', color: 'bg-red-500/20 text-red-400 border-red-500/30', pulse: true },
    demo: { label: '📦 Demo', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', pulse: false },
    loading: { label: '⏳ Loading', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', pulse: false },
  };
  
  const { label, color, pulse } = config[source] || config.loading;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full border ${color}`}>
      {pulse && <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />}
      {label}
    </span>
  );
};

// ============ STAGE CONTENT GENERATOR ============
const getStageContent = (stageId, data) => {
  const contents = {
    1: {
      title: 'Discovering Auction Properties',
      visual: (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="animate-pulse">●</span>
            <span>Scanning brevard.realforeclose.com...</span>
          </div>
          <div className="text-sm text-slate-400">
            Found: {data?.auction?.totalProperties || 20} properties for {data?.auction?.date}
          </div>
        </div>
      )
    },
    2: {
      title: 'Extracting Property Data',
      visual: (
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: 'Parcel', value: data?.sampleProperty?.parcelId, mono: true },
            { label: 'Type', value: data?.sampleProperty?.propertyType },
            { label: 'SqFt', value: data?.sampleProperty?.sqft?.toLocaleString() },
            { label: 'Year', value: data?.sampleProperty?.yearBuilt },
          ].map((item, i) => (
            <div key={i} className="p-2 bg-white/5 rounded">
              <div className="text-slate-500">{item.label}</div>
              <div className={`text-white ${item.mono ? 'font-mono' : ''}`}>{item.value}</div>
            </div>
          ))}
        </div>
      )
    },
    3: {
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
    4: {
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
          <div className="text-xs text-emerald-400">✓ No senior mortgage detected - Safe to bid</div>
        </div>
      )
    },
    5: {
      title: 'Checking Tax Certificates',
      visual: (
        <div className="p-3 bg-white/5 rounded space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Opening Bid</span>
            <span className="text-amber-400 font-mono">${data?.sampleProperty?.openingBid?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Final Judgment</span>
            <span className="text-white font-mono">${data?.sampleProperty?.finalJudgment?.toLocaleString()}</span>
          </div>
        </div>
      )
    },
    6: {
      title: 'Loading Demographics',
      visual: (
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            { label: 'ZIP', value: '32953' },
            { label: 'Median Income', value: '$79,000' },
            { label: 'Vacancy Rate', value: '5.5%' },
            { label: 'Target ZIP', value: '✓ Yes' },
          ].map((item, i) => (
            <div key={i} className="p-2 bg-emerald-500/10 rounded">
              <div className="text-slate-500">{item.label}</div>
              <div className="text-emerald-400">{item.value}</div>
            </div>
          ))}
        </div>
      )
    },
    7: {
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
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">XGBoost:</span>
            <span className="text-emerald-400 font-semibold">
              {((data?.sampleProperty?.mlProbability || 0.4) * 100).toFixed(0)}% third-party probability
            </span>
          </div>
        </div>
      )
    },
    8: {
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
            <span className="text-emerald-400 font-semibold">{data?.sampleProperty?.bidJudgmentRatio}%</span>
          </div>
        </div>
      )
    },
    9: {
      title: 'Generating Recommendation',
      visual: (() => {
        const rec = data?.sampleProperty?.recommendation || 'BID';
        const colors = {
          BID: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/50', text: 'text-emerald-400', icon: '✅' },
          REVIEW: { bg: 'bg-amber-500/10', border: 'border-amber-500/50', text: 'text-amber-400', icon: '⚠️' },
          SKIP: { bg: 'bg-red-500/10', border: 'border-red-500/50', text: 'text-red-400', icon: '❌' },
        };
        const c = colors[rec] || colors.BID;
        return (
          <div className={`p-4 ${c.bg} border-2 ${c.border} rounded-lg text-center`}>
            <div className="text-3xl mb-2">{c.icon}</div>
            <div className={`text-2xl font-bold ${c.text}`}>{rec}</div>
            <div className="text-sm text-slate-400 mt-1">
              {data?.sampleProperty?.bidJudgmentRatio >= 75 ? 'Ratio ≥75% threshold met' : 'Review recommended'}
            </div>
          </div>
        );
      })()
    },
    10: {
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
    11: {
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
    12: {
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
  
  return contents[stageId] || { title: `Stage ${stageId}`, visual: null };
};

// ============ ANIMATED STAGE COMPONENT ============
const AnimatedStage = ({ stage, isActive, isComplete, data }) => {
  const content = getStageContent(stage.id, data);

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
        {isActive && <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />}
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

// ============ MAIN COMPONENT ============
const AnimatedDemoV17 = ({ autoPlay = false, onComplete }) => {
  const { data, loading, dataSource } = useAuctionData();
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
    return () => clearInterval(intervalRef.current);
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
          <div className="text-slate-400">Loading auction data...</div>
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
              {dataSource === 'live' ? 'Real-time' : 'Sample'} data • {data?.auction?.date}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 bg-amber-500 text-slate-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-2"
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          <button
            onClick={() => { setCurrentTime(0); setIsPlaying(true); }}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            ↺
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1 bg-white/10">
        <motion.div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-2 gap-4 p-4">
        {/* Property Card */}
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Analyzing Property</div>
          <div className="text-lg font-semibold text-white mb-1">{data?.sampleProperty?.address}</div>
          <div className="text-sm text-slate-400 mb-4">
            Case #{data?.sampleProperty?.caseNumber} • Parcel {data?.sampleProperty?.parcelId}
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><div className="text-slate-500">Market Value</div><div className="text-white font-semibold">${data?.sampleProperty?.marketValue?.toLocaleString()}</div></div>
            <div><div className="text-slate-500">Opening Bid</div><div className="text-amber-400 font-semibold">${data?.sampleProperty?.openingBid?.toLocaleString()}</div></div>
            <div><div className="text-slate-500">Type</div><div className="text-white">{data?.sampleProperty?.propertyType}</div></div>
            <div><div className="text-slate-500">SqFt</div><div className="text-white">{data?.sampleProperty?.sqft?.toLocaleString()}</div></div>
          </div>

          {currentStageId >= 9 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-3 rounded-lg border ${
                data?.sampleProperty?.recommendation === 'BID'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-amber-500/10 border-amber-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">RECOMMENDATION</div>
                  <div className={`text-xl font-bold ${data?.sampleProperty?.recommendation === 'BID' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {data?.sampleProperty?.recommendation}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">MAX BID</div>
                  <div className="text-xl font-bold text-amber-400">${data?.sampleProperty?.maxBid?.toLocaleString()}</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Stages */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
          {DEMO_CONFIG.stages.map((stage) => (
            <AnimatedStage
              key={stage.id}
              stage={stage}
              isActive={currentStageId === stage.id}
              isComplete={currentStageId > stage.id}
              data={data}
            />
          ))}
        </div>
      </div>

      {/* Stats Footer */}
      <div className="p-4 border-t border-white/10 grid grid-cols-4 gap-4 text-center bg-slate-900/50">
        <div><div className="text-2xl font-bold text-amber-400">{data?.stats?.totalProcessed?.toLocaleString()}</div><div className="text-xs text-slate-500">Records</div></div>
        <div><div className="text-2xl font-bold text-emerald-400">{data?.stats?.mlAccuracy}%</div><div className="text-xs text-slate-500">ML Accuracy</div></div>
        <div><div className="text-2xl font-bold text-white">{data?.stats?.avgProcessingTime}s</div><div className="text-xs text-slate-500">Processing</div></div>
        <div><div className="text-2xl font-bold text-amber-400">{data?.stats?.costSavings}%</div><div className="text-xs text-slate-500">Cost Savings</div></div>
      </div>
    </div>
  );
};

export default AnimatedDemoV17;
