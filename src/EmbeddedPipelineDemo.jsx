// EmbeddedPipelineDemo.jsx - Compact version for landing page integration
import React, { useState, useEffect } from 'react';

const DEMO_PROPERTIES = [
  {
    id: '05-2024-CA-012847',
    address: '1847 Coral Bay Dr, Satellite Beach',
    plaintiff: 'FREEDOM MORTGAGE CORP',
    finalJudgment: 287650,
    arv: 385000,
    repairs: 28500,
    maxBid: 202000,
    bidJudgmentRatio: 0.78,
    decision: 'BID',
    mlScore: 72,
    comps: [
      { price: 395000, sqft: 1850 },
      { price: 378000, sqft: 1720 },
      { price: 402000, sqft: 1920 },
      { price: 368000, sqft: 1680 },
    ],
  },
  {
    id: '05-2024-CA-018923',
    address: '4521 Hammock Oak Dr, Melbourne',
    plaintiff: 'SHELLPOINT MORTGAGE',
    finalJudgment: 412890,
    arv: 445000,
    repairs: 52000,
    maxBid: 197500,
    bidJudgmentRatio: 0.48,
    decision: 'SKIP',
    mlScore: 23,
    comps: [
      { price: 425000, sqft: 2100 },
      { price: 458000, sqft: 2250 },
      { price: 412000, sqft: 1980 },
      { price: 478000, sqft: 2400 },
    ],
  },
  {
    id: '05-2024-CA-021456',
    address: '892 Atlantic Ave, Indialantic',
    plaintiff: 'BANK OF AMERICA NA',
    finalJudgment: 156780,
    arv: 295000,
    repairs: 18000,
    maxBid: 150250,
    bidJudgmentRatio: 0.68,
    decision: 'REVIEW',
    mlScore: 58,
    comps: [
      { price: 285000, sqft: 1450 },
      { price: 312000, sqft: 1580 },
      { price: 278000, sqft: 1380 },
      { price: 305000, sqft: 1520 },
    ],
  }
];

const PIPELINE_STAGES = [
  { id: 1, name: 'Discovery', icon: '🔍' },
  { id: 2, name: 'BECA', icon: '📄' },
  { id: 3, name: 'Title', icon: '📋' },
  { id: 4, name: 'Liens', icon: '⚖️' },
  { id: 5, name: 'Tax', icon: '🏛️' },
  { id: 6, name: 'CMA', icon: '🗺️' },
  { id: 7, name: 'ML', icon: '🤖' },
  { id: 8, name: 'Max Bid', icon: '💰' },
  { id: 9, name: 'Decision', icon: '✅' },
  { id: 10, name: 'Report', icon: '📑' },
  { id: 11, name: 'Exit', icon: '🎯' },
  { id: 12, name: 'Archive', icon: '💾' }
];

const fmt = (n) => '$' + n.toLocaleString();
const pct = (n) => (n * 100).toFixed(0) + '%';

export default function EmbeddedPipelineDemo() {
  const [stage, setStage] = useState(0);
  const [propIdx, setPropIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [showResult, setShowResult] = useState(false);

  const prop = DEMO_PROPERTIES[propIdx];
  const isCMAStage = stage === 5;

  useEffect(() => {
    if (!playing) return;
    const duration = isCMAStage ? 3000 : 1200;
    const timer = setInterval(() => {
      setStage(s => {
        if (s + 1 >= 12) {
          setShowResult(true);
          setTimeout(() => {
            setShowResult(false);
            setPropIdx(p => (p + 1) % DEMO_PROPERTIES.length);
          }, 2000);
          return 0;
        }
        return s + 1;
      });
    }, duration);
    return () => clearInterval(timer);
  }, [playing, isCMAStage]);

  const colors = {
    BID: { bg: 'bg-emerald-500/20', border: 'border-emerald-500', text: 'text-emerald-400' },
    REVIEW: { bg: 'bg-amber-500/20', border: 'border-amber-500', text: 'text-amber-400' },
    SKIP: { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-400' }
  };
  const c = colors[prop.decision];

  return (
    <div className="relative">
      {/* Decision Overlay */}
      {showResult && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-blue-950/95 backdrop-blur-sm rounded-3xl">
          <div className={`p-8 md:p-12 rounded-2xl ${c.bg} border-2 ${c.border} text-center animate-pulse`}>
            <div className={`text-5xl md:text-7xl font-black ${c.text} tracking-wider`}>{prop.decision}</div>
            <div className="text-lg md:text-xl text-white/90 mt-4">{prop.address}</div>
            <div className="text-sm text-white/60 mt-2">
              Max Bid: {fmt(prop.maxBid)} • Ratio: {pct(prop.bidJudgmentRatio)}
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Pipeline Stages - Left */}
        <div className="lg:col-span-3 bg-blue-900/50 rounded-2xl border border-blue-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-blue-300/60 uppercase tracking-wider">12-Stage Pipeline</h3>
            <button
              onClick={() => setPlaying(!playing)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                playing 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-blue-800 text-blue-300 border border-blue-700'
              }`}
            >
              {playing ? '● LIVE' : '○ PAUSED'}
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
            {PIPELINE_STAGES.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                  i === stage
                    ? 'bg-amber-500/20 border border-amber-500/50 scale-[1.02]'
                    : i < stage
                    ? 'bg-emerald-500/10 border border-transparent'
                    : 'bg-blue-950/50 border border-transparent opacity-50'
                }`}
              >
                <span className="text-base">{i < stage ? '✓' : s.icon}</span>
                <span className={`text-xs font-medium ${
                  i === stage ? 'text-amber-400' : i < stage ? 'text-emerald-400' : 'text-blue-300/60'
                }`}>
                  {s.name}
                </span>
                {i === stage && (
                  <span className="ml-auto w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content - Center */}
        <div className="lg:col-span-6 space-y-4">
          {/* Property Card */}
          <div className="bg-blue-900/50 rounded-2xl border border-blue-800 p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-[10px] text-blue-300/40 uppercase tracking-wider">Case #{prop.id}</div>
                <div className="text-lg font-bold text-white mt-1">{prop.address}</div>
                <div className="text-sm text-blue-300/60">{prop.plaintiff}</div>
              </div>
              <div className={`px-3 py-1 rounded-full ${c.bg} border ${c.border} ${c.text} text-xs font-bold`}>
                {stage >= 8 ? prop.decision : '...'}
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Judgment', value: fmt(prop.finalJudgment), show: true },
                { label: 'ARV', value: fmt(prop.arv), show: stage >= 5, color: 'text-emerald-400' },
                { label: 'Repairs', value: fmt(prop.repairs), show: stage >= 5, color: 'text-amber-400' },
                { label: 'Max Bid', value: fmt(prop.maxBid), show: stage >= 7, color: 'text-cyan-400' }
              ].map((item, i) => (
                <div key={i} className="bg-blue-950/50 rounded-xl p-3">
                  <div className="text-[10px] text-blue-300/40 uppercase">{item.label}</div>
                  <div className={`text-sm font-bold mt-1 ${item.show ? (item.color || 'text-white') : 'text-blue-800'}`}>
                    {item.show ? item.value : '---'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CMA Heat Map or Terminal */}
          {isCMAStage ? (
            <div className="bg-blue-900/50 rounded-2xl border-2 border-cyan-500/30 overflow-hidden">
              <div className="bg-blue-950 px-4 py-2 border-b border-blue-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🗺️</span>
                  <span className="text-xs font-bold text-cyan-400">CMA HEAT MAP</span>
                </div>
                <div className="flex gap-3 text-[10px]">
                  <span className="text-emerald-400">🏠 Subject</span>
                  <span className="text-cyan-400">📍 4 Comps</span>
                </div>
              </div>
              
              {/* CSS Heat Map */}
              <div className="relative h-48 bg-gradient-to-b from-blue-950 to-blue-900 overflow-hidden">
                {/* Animated grid */}
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(96,165,250,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.3) 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                  }}
                />
                
                {/* Heat zones */}
                <div className="absolute w-32 h-32 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-radial from-red-500/40 via-amber-500/30 to-transparent rounded-full animate-pulse" />
                <div className="absolute w-20 h-20 left-1/3 top-1/3 bg-gradient-radial from-amber-500/30 via-emerald-500/20 to-transparent rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                <div className="absolute w-16 h-16 left-2/3 top-2/3 bg-gradient-radial from-cyan-500/30 via-emerald-500/20 to-transparent rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                
                {/* Subject property */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center">
                  <div className="text-2xl animate-bounce" style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.8))' }}>🏠</div>
                  <div className="mt-1 px-2 py-0.5 bg-emerald-500 rounded text-[8px] font-bold text-white">SUBJECT</div>
                </div>
                
                {/* Comp markers */}
                {[
                  { left: '25%', top: '30%' },
                  { left: '70%', top: '35%' },
                  { left: '30%', top: '65%' },
                  { left: '65%', top: '70%' }
                ].map((pos, i) => (
                  <div 
                    key={i} 
                    className="absolute z-5 text-center animate-fadeIn"
                    style={{ left: pos.left, top: pos.top, transform: 'translate(-50%, -50%)', animationDelay: `${i * 0.2}s` }}
                  >
                    <div className="text-lg" style={{ filter: 'drop-shadow(0 0 4px rgba(96,165,250,0.6))' }}>📍</div>
                    <div className="mt-0.5 px-1.5 py-0.5 bg-cyan-500 rounded text-[7px] font-bold text-white">
                      {fmt(prop.comps[i].price)}
                    </div>
                  </div>
                ))}
                
                {/* ARV badge */}
                <div className="absolute bottom-2 left-2 bg-blue-950/90 border border-blue-700 rounded-lg px-3 py-2">
                  <div className="text-[8px] text-blue-300/60">CALCULATED ARV</div>
                  <div className="text-sm font-bold text-emerald-400">{fmt(prop.arv)}</div>
                </div>
              </div>
              
              {/* Comp cards */}
              <div className="p-3 bg-blue-950/50 border-t border-blue-800 grid grid-cols-4 gap-2">
                {prop.comps.map((comp, i) => (
                  <div key={i} className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2 text-center">
                    <div className="text-[9px] text-cyan-400 font-semibold">COMP #{i + 1}</div>
                    <div className="text-xs font-bold text-emerald-400">{fmt(comp.price)}</div>
                    <div className="text-[9px] text-blue-300/50">{comp.sqft} sqft</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-blue-900/50 rounded-2xl border border-blue-800 overflow-hidden">
              <div className="bg-blue-950 px-4 py-2 border-b border-blue-800 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="ml-3 text-xs text-blue-300/60 font-mono">brevard-bidder-ai</span>
              </div>
              <div className="p-4 font-mono text-xs space-y-1.5 min-h-[180px]">
                <div className="text-emerald-400">$ analyze "{prop.id}"</div>
                <div className="text-blue-700">─────────────────────────</div>
                <div className="text-blue-300/80">
                  <span className="text-amber-400">→</span> Stage {stage + 1}: {PIPELINE_STAGES[stage]?.name}
                </div>
                {stage >= 3 && <div className="text-emerald-400/80">✓ Lien Status: No Senior Mortgage</div>}
                {stage >= 6 && <div className="text-cyan-400/80">✓ ML Score: {prop.mlScore}%</div>}
                {stage >= 8 && <div className={c.text}>✓ Decision: {prop.decision} ({pct(prop.bidJudgmentRatio)})</div>}
                <div className="mt-4 text-blue-700"><span className="animate-pulse">█</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Stats - Right */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-blue-900/50 rounded-2xl border border-blue-800 p-4">
            <h3 className="text-xs font-bold text-blue-300/60 uppercase tracking-wider mb-3">ML Model</h3>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Algorithm', value: 'XGBoost v3.2', color: 'text-emerald-400' },
                { label: 'Accuracy', value: '64.4%', color: 'text-white' },
                { label: 'Plaintiffs', value: '28 tracked', color: 'text-white' },
                { label: 'Features', value: '47', color: 'text-white' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-blue-300/50">{item.label}</span>
                  <span className={`font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-blue-900/50 rounded-2xl border border-blue-800 p-4">
            <h3 className="text-xs font-bold text-blue-300/60 uppercase tracking-wider mb-3">Data Sources</h3>
            <div className="flex flex-wrap gap-1.5">
              {['BECA', 'BCPAO', 'AcclaimWeb', 'RealTDM', 'Census'].map(src => (
                <span key={src} className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] text-emerald-400 font-medium">
                  {src}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-amber-500/10 rounded-2xl border border-amber-500/20 p-4 text-center">
            <div className="text-2xl font-black text-amber-400">100x</div>
            <div className="text-xs text-amber-300/70">ROI</div>
            <div className="text-[10px] text-blue-300/50 mt-1">10 hrs → 10 min</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-from) 0%, var(--tw-gradient-via) 50%, var(--tw-gradient-to) 100%);
        }
      `}</style>
    </div>
  );
}
