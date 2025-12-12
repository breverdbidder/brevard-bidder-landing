// BidDeed.AI - AI Live Demo Component
// REAL Dec 10, 2025 Auction Properties
// Author: Ariel Shapira, Solo Founder - Everest Capital USA

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Fara V8 Endpoints
const FARA_HEALTH = "https://biddeed.ai--biddeed.ai-fara-v8-health.modal.run";
const FARA_ANALYZE = "https://biddeed.ai--biddeed.ai-fara-v8-analyze.modal.run";

// REAL Dec 10, 2025 Auction Properties - 12 Total
const DEC10_PROPERTIES = [
  // 🟢 BID Properties (6)
  { id: 1, address: "3680 BIG PINE RD, MELBOURNE FL 32934", case_number: "05-2023-CA-034443-XXXX-XX", market_value: 481390, max_bid: 271973, judgment_est: 336973, bid_ratio: 80.7, decision: "BID", plaintiff: "SPECIALIZED", sqft: 2264, beds: 4, baths: 3, year: 1994 },
  { id: 2, address: "5373 YAUPON HOLLY DR, COCOA FL 32927", case_number: "05-2023-CA-049021-XXXX-XX", market_value: 310750, max_bid: 167525, judgment_est: 217525, bid_ratio: 77.0, decision: "BID", plaintiff: "PHH MORTGAGE", sqft: 1832, beds: 4, baths: 2.5, year: 2005 },
  { id: 3, address: "150 DELIA AVE, PALM BAY FL 32907", case_number: "05-2024-CA-040608-XXCA-BC", market_value: 258100, max_bid: 135670, judgment_est: 167765, bid_ratio: 80.9, decision: "BID", plaintiff: "NATIONSTAR", sqft: 1495, beds: 3, baths: 2, year: 2022 },
  { id: 4, address: "3635 PENNSYLVANIA AVE, MIMS FL 32754", case_number: "05-2024-CA-047254-XXCA-BC", market_value: 476930, max_bid: 278851, judgment_est: 310004, bid_ratio: 90.0, decision: "BID", plaintiff: "SWBC MORTGAGE", sqft: 2183, beds: 4, baths: 2.5, year: 0 },
  { id: 5, address: "3685 GRAND MEADOWS BLVD, MELBOURNE FL 32934", case_number: "05-2025-CA-021591-XXCA-BC", market_value: 340400, max_bid: 183280, judgment_est: 204240, bid_ratio: 89.7, decision: "BID", plaintiff: "FREEDOM MORT", sqft: 1902, beds: 4, baths: 2.5, year: 1998 },
  { id: 6, address: "5113 COCOPLUM AVE, MELBOURNE FL 32940", case_number: "05-2025-CA-024863-XXCA-BC", market_value: 381030, max_bid: 211721, judgment_est: 228618, bid_ratio: 92.6, decision: "BID", plaintiff: "FREEDOM MORT", sqft: 1636, beds: 3, baths: 2, year: 1995 },
  
  // 🔴 SKIP Properties (6)
  { id: 7, address: "6585 ORCHID AVE, COCOA FL 32927", case_number: "05-2023-CA-028050-XXXX-XX", market_value: 188650, max_bid: 72055, judgment_est: 132055, bid_ratio: 54.6, decision: "SKIP", plaintiff: "DEUTSCHE", sqft: 1076, beds: 2, baths: 1.5, year: 1979, skip_reason: "Bid/Judgment ratio below 60%" },
  { id: 8, address: "729 HAWKINS AVE, PALM BAY FL 32908", case_number: "05-2024-CA-050336-XXCA-BC", market_value: 137740, max_bid: 40757, judgment_est: 89531, bid_ratio: 45.5, decision: "SKIP", plaintiff: "BANK NEW YORK", sqft: 1032, beds: 2, baths: 1.5, year: 1988, skip_reason: "Low profit potential" },
  { id: 9, address: "3645 BARNA AVE, TITUSVILLE FL 32780", case_number: "05-2024-CA-058031-XXCA-BC", market_value: 118570, max_bid: 30214, judgment_est: 77070, bid_ratio: 39.2, decision: "SKIP", plaintiff: "ROYAL OAK CONDO", sqft: 990, beds: 2, baths: 1.5, year: 1968, skip_reason: "HOA foreclosure - senior mortgage survives" },
  { id: 10, address: "1384 HILL AVE, MELBOURNE FL 32940", case_number: "05-2024-CC-039589-XXCC-BC", market_value: 324150, max_bid: 171905, judgment_est: 210697, bid_ratio: 81.6, decision: "SKIP", plaintiff: "SPRINGS SUNSET", sqft: 1788, beds: 3, baths: 2, year: 1997, skip_reason: "HOA foreclosure - senior mortgage survives" },
  { id: 11, address: "NO ADDRESS (NEEDS RESEARCH)", case_number: "05-2016-CA-042099-XXXX-XX", market_value: 0, max_bid: 0, judgment_est: 0, bid_ratio: 0, decision: "SKIP", plaintiff: "FIRST", sqft: 0, beds: 0, baths: 0, year: 0, skip_reason: "No property data available" },
  { id: 12, address: "NO ADDRESS (NEEDS RESEARCH)", case_number: "05-2022-CA-021054-XXXX-XX", market_value: 0, max_bid: 0, judgment_est: 0, bid_ratio: 0, decision: "SKIP", plaintiff: "ROCKET MORTGAGE", sqft: 0, beds: 0, baths: 0, year: 0, skip_reason: "No property data available" }
];

const AILiveDemo = () => {
  const [isHealthy, setIsHealthy] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'bid', 'skip'

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const response = await fetch(FARA_HEALTH);
      const data = await response.json();
      setIsHealthy(data.status === "healthy");
    } catch (e) {
      setIsHealthy(false);
    }
  };

  const filteredProperties = DEC10_PROPERTIES.filter(p => {
    if (filter === 'bid') return p.decision === 'BID';
    if (filter === 'skip') return p.decision === 'SKIP';
    return true;
  });

  const runAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    const prop = filteredProperties[selectedProperty];

    try {
      const response = await fetch(FARA_ANALYZE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_address: prop.address,
          case_number: prop.case_number,
          judgment_amount: prop.judgment_est,
          context: `Market Value: $${prop.market_value.toLocaleString()} | Plaintiff: ${prop.plaintiff} | ${prop.sqft} sqft | ${prop.beds}bd/${prop.baths}ba | Built ${prop.year}`
        })
      });

      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        // Merge AI analysis with our pre-computed data
        setAnalysis({
          ...data,
          our_max_bid: prop.max_bid,
          our_decision: prop.decision,
          our_bid_ratio: prop.bid_ratio,
          skip_reason: prop.skip_reason
        });
      }
    } catch (e) {
      setError("Analysis failed: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const prop = filteredProperties[selectedProperty] || DEC10_PROPERTIES[0];

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-amber-400">🏠</span> Dec 10, 2025 Auction
            <span className="text-sm font-normal text-slate-400">Titusville 11AM</span>
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            12 Properties | 6 BID | 6 SKIP | $2.9M Total Value
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm ${isHealthy ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {isHealthy === null ? '⏳ Checking...' : isHealthy ? '🟢 AI Online' : '🔴 AI Offline'}
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => { setFilter('all'); setSelectedProperty(0); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'all' ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
          All (12)
        </button>
        <button onClick={() => { setFilter('bid'); setSelectedProperty(0); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'bid' ? 'bg-green-500 text-black' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
          🟢 BID (6)
        </button>
        <button onClick={() => { setFilter('skip'); setSelectedProperty(0); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'skip' ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
          🔴 SKIP (6)
        </button>
      </div>

      {/* Property Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Select Property:</label>
          <select 
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(Number(e.target.value))}
            className="w-full bg-slate-800 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-amber-500 focus:outline-none"
          >
            {filteredProperties.map((p, i) => (
              <option key={p.id} value={i}>
                {p.decision === 'BID' ? '🟢' : '🔴'} {p.address.split(',')[0]}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-end">
          <button
            onClick={runAnalysis}
            disabled={isLoading || !isHealthy}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold py-3 px-6 rounded-lg hover:from-amber-400 hover:to-orange-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '⏳ Analyzing...' : '🔍 Run AI Analysis'}
          </button>
        </div>
      </div>

      {/* Property Card */}
      <div className={`rounded-xl p-4 mb-4 border ${prop.decision === 'BID' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-bold text-white">{prop.address}</h4>
            <p className="text-sm text-slate-400">{prop.case_number}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${prop.decision === 'BID' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
            {prop.decision}
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div><span className="text-slate-400">Market:</span> <span className="text-white font-medium">${prop.market_value.toLocaleString()}</span></div>
          <div><span className="text-slate-400">Max Bid:</span> <span className="text-green-400 font-bold">${prop.max_bid.toLocaleString()}</span></div>
          <div><span className="text-slate-400">Bid/Jdg:</span> <span className={`font-bold ${prop.bid_ratio >= 75 ? 'text-green-400' : prop.bid_ratio >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{prop.bid_ratio.toFixed(1)}%</span></div>
          <div><span className="text-slate-400">Plaintiff:</span> <span className="text-white">{prop.plaintiff}</span></div>
        </div>
        
        {prop.sqft > 0 && (
          <div className="mt-2 text-sm text-slate-400">
            {prop.sqft} sqft | {prop.beds}bd/{prop.baths}ba | Built {prop.year > 0 ? prop.year : 'Unknown'}
          </div>
        )}
        
        {prop.skip_reason && (
          <div className="mt-2 text-sm text-red-400 flex items-center gap-1">
            ⚠️ {prop.skip_reason}
          </div>
        )}
      </div>

      {/* Analysis Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-slate-800 rounded-xl p-4 border border-slate-600"
          >
            <h4 className="font-bold text-amber-400 mb-3">🤖 AI Analysis</h4>
            <p className="text-slate-300 text-sm whitespace-pre-wrap">{analysis.analysis || analysis.recommendation}</p>
            
            {analysis.our_decision && (
              <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between items-center">
                <span className="text-slate-400 text-sm">BidDeed.AI Recommendation:</span>
                <span className={`px-3 py-1 rounded-full font-bold ${analysis.our_decision === 'BID' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                  {analysis.our_decision} @ ${analysis.our_max_bid.toLocaleString()}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
          ❌ {error}
        </div>
      )}
      
      {/* Footer */}
      <div className="mt-4 text-center text-xs text-slate-500">
        © 2025 Ariel Shapira, Everest Capital USA | BidDeed.AI V13.4.0
      </div>
    </div>
  );
};

export default AILiveDemo;
