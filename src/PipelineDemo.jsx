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
    thirdPartyProb: 0.34,
    coords: [-80.5901, 28.1697],
    comps: [
      { address: '1923 Sea Oats Dr', price: 395000, sqft: 1850, coords: [-80.5885, 28.1712] },
      { address: '2104 Atlantic Ave', price: 378000, sqft: 1720, coords: [-80.5920, 28.1680] },
      { address: '1756 Ocean Blvd', price: 402000, sqft: 1920, coords: [-80.5875, 28.1665] },
      { address: '1890 Surf Way', price: 368000, sqft: 1680, coords: [-80.5910, 28.1725] },
    ],
    demographics: { income: 82400, vacancy: 5.2, growth: 3.8 }
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
    thirdPartyProb: 0.81,
    coords: [-80.6234, 28.0836],
    comps: [
      { address: '4612 Palm Bay Rd', price: 425000, sqft: 2100, coords: [-80.6250, 28.0850] },
      { address: '4380 Riverside Dr', price: 458000, sqft: 2250, coords: [-80.6210, 28.0820] },
      { address: '4755 Oak Haven', price: 412000, sqft: 1980, coords: [-80.6270, 28.0860] },
      { address: '4290 Harbor View', price: 478000, sqft: 2400, coords: [-80.6195, 28.0810] },
    ],
    demographics: { income: 68200, vacancy: 8.1, growth: 1.2 }
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
    thirdPartyProb: 0.52,
    coords: [-80.5665, 28.0897],
    comps: [
      { address: '945 Wavecrest Ave', price: 285000, sqft: 1450, coords: [-80.5650, 28.0910] },
      { address: '812 Ocean Dr', price: 312000, sqft: 1580, coords: [-80.5680, 28.0880] },
      { address: '1025 Beach Way', price: 278000, sqft: 1380, coords: [-80.5640, 28.0920] },
      { address: '756 Surf Side Ln', price: 305000, sqft: 1520, coords: [-80.5690, 28.0870] },
    ],
    demographics: { income: 79800, vacancy: 4.8, growth: 4.2 }
  }
];

const PIPELINE_STAGES = [
  { id: 1, name: 'Discovery', icon: '🔍', desc: 'Scanning RealForeclose calendar' },
  { id: 2, name: 'BECA Scraping', icon: '📄', desc: 'Extracting Clerk records' },
  { id: 3, name: 'Title Search', icon: '📋', desc: 'Querying AcclaimWeb' },
  { id: 4, name: 'Lien Priority', icon: '⚖️', desc: 'Analyzing mortgage position' },
  { id: 5, name: 'Tax Certs', icon: '🏛️', desc: 'Checking RealTDM' },
  { id: 6, name: 'CMA Analysis', icon: '🗺️', desc: 'Mapping comparable sales' },
  { id: 7, name: 'ML Score', icon: '🤖', desc: 'XGBoost prediction' },
  { id: 8, name: 'Max Bid', icon: '💰', desc: 'Formula calculation' },
  { id: 9, name: 'Decision', icon: '✅', desc: 'BID/REVIEW/SKIP' },
  { id: 10, name: 'Report', icon: '📑', desc: 'DOCX generation' },
  { id: 11, name: 'Disposition', icon: '🎯', desc: 'Exit strategy' },
  { id: 12, name: 'Archive', icon: '💾', desc: 'Supabase storage' }
];

const fmt = (n) => '$' + n.toLocaleString();
const pct = (n) => (n * 100).toFixed(0) + '%';

export default function PipelineDemo() {
  const [stage, setStage] = useState(0);
  const [propIdx, setPropIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [completed, setCompleted] = useState([]);
  const [logs, setLogs] = useState([]);

  const prop = DEMO_PROPERTIES[propIdx];
  const currentStage = PIPELINE_STAGES[stage];
  const isCMAStage = stage === 5; // CMA Analysis stage

  // Auto-advance through stages
  useEffect(() => {
    if (!playing) return;
    
    const stageDuration = isCMAStage ? 4000 : 1500; // Longer duration for CMA stage
    
    const timer = setInterval(() => {
      setStage(s => {
        const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLogs(l => [...l.slice(-5), { time: now, stage: PIPELINE_STAGES[s]?.name || 'Init', done: true }]);
        
        if (s + 1 >= 12) {
          setShowResult(true);
          setCompleted(c => [...c, prop]);
          
          setTimeout(() => {
            setShowResult(false);
            setPropIdx(p => (p + 1) % DEMO_PROPERTIES.length);
            setLogs([]);
          }, 2500);
          
          return 0;
        }
        return s + 1;
      });
    }, stageDuration);

    return () => clearInterval(timer);
  }, [playing, prop, isCMAStage]);

  const decisionColor = {
    BID: { bg: '#065f46', border: '#10b981', text: '#34d399' },
    REVIEW: { bg: '#78350f', border: '#f59e0b', text: '#fbbf24' },
    SKIP: { bg: '#7f1d1d', border: '#ef4444', text: '#f87171' }
  };

  const dc = decisionColor[prop.decision];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
      fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
      color: '#e2e8f0',
      padding: '20px',
      position: 'relative'
    }}>
      {/* Grid background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.05) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none'
      }} />

      {/* Decision Overlay */}
      {showResult && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(2, 6, 23, 0.95)',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            padding: '48px 64px',
            borderRadius: '24px',
            background: `linear-gradient(135deg, ${dc.bg} 0%, ${dc.bg}88 100%)`,
            border: `3px solid ${dc.border}`,
            textAlign: 'center',
            animation: 'pulse 1s infinite'
          }}>
            <div style={{ fontSize: '72px', fontWeight: 900, color: dc.text, letterSpacing: '8px' }}>
              {prop.decision}
            </div>
            <div style={{ fontSize: '20px', color: '#e2e8f0', marginTop: '16px' }}>
              {prop.address}
            </div>
            <div style={{ fontSize: '16px', color: '#94a3b8', marginTop: '8px' }}>
              Max Bid: {fmt(prop.maxBid)} • Ratio: {pct(prop.bidJudgmentRatio)}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', position: 'relative', zIndex: 10 }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, margin: 0 }}>
            <span style={{ color: '#10b981' }}>Brevard</span>
            <span style={{ color: '#fff' }}>Bidder</span>
            <span style={{ color: '#10b981' }}>AI</span>
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '13px' }}>Agentic AI Foreclosure Intelligence • V13.4.0</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: playing ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
            border: `1px solid ${playing ? '#10b981' : '#64748b'}`,
            borderRadius: '8px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: playing ? '#10b981' : '#64748b',
              animation: playing ? 'pulse 1.5s infinite' : 'none'
            }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: playing ? '#10b981' : '#64748b' }}>
              {playing ? 'PROCESSING' : 'PAUSED'}
            </span>
          </div>
          <button
            onClick={() => setPlaying(!playing)}
            style={{
              padding: '8px 20px',
              background: '#10b981',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            {playing ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 280px', gap: '20px', position: 'relative', zIndex: 10 }}>
        
        {/* Pipeline */}
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #334155', borderRadius: '12px', padding: '16px' }}>
          <h3 style={{ fontSize: '11px', color: '#64748b', margin: '0 0 12px', letterSpacing: '1.5px' }}>12-STAGE PIPELINE</h3>
          {PIPELINE_STAGES.map((s, i) => (
            <div key={s.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              marginBottom: '4px',
              borderRadius: '6px',
              background: i === stage ? (i === 5 ? 'rgba(96, 165, 250, 0.2)' : 'rgba(16, 185, 129, 0.2)') : 'transparent',
              border: i === stage ? `1px solid ${i === 5 ? '#60a5fa' : '#10b981'}` : '1px solid transparent',
              opacity: i > stage ? 0.4 : 1,
              transition: 'all 0.3s'
            }}>
              <span style={{ fontSize: '14px' }}>{i < stage ? '✓' : s.icon}</span>
              <span style={{ fontSize: '12px', color: i === stage ? '#fff' : i < stage ? '#10b981' : '#64748b' }}>{s.name}</span>
              {i === stage && <span style={{ marginLeft: 'auto', width: '6px', height: '6px', background: i === 5 ? '#60a5fa' : '#10b981', borderRadius: '50%', animation: 'pulse 1s infinite' }} />}
            </div>
          ))}
        </div>

        {/* Center */}
        <div>
          {/* Property Card */}
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #334155', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#64748b', letterSpacing: '1px' }}>CASE #{prop.id}</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginTop: '4px' }}>{prop.address}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{prop.plaintiff}</div>
              </div>
              <div style={{
                padding: '6px 14px',
                borderRadius: '20px',
                background: dc.bg,
                border: `1px solid ${dc.border}`,
                color: dc.text,
                fontSize: '12px',
                fontWeight: 700
              }}>
                {stage >= 8 ? prop.decision : '...'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '20px' }}>
              {[
                { label: 'Judgment', value: fmt(prop.finalJudgment), show: true },
                { label: 'ARV', value: fmt(prop.arv), show: stage >= 6, color: '#10b981' },
                { label: 'Repairs', value: fmt(prop.repairs), show: stage >= 6, color: '#f59e0b' },
                { label: 'Max Bid', value: fmt(prop.maxBid), show: stage >= 7, color: '#60a5fa' }
              ].map((item, i) => (
                <div key={i} style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>{item.label}</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: item.show ? (item.color || '#fff') : '#334155', marginTop: '4px' }}>
                    {item.show ? item.value : '---'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CMA Map or Terminal */}
          {isCMAStage ? (
            <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid #60a5fa', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ background: '#1e293b', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #334155' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>🗺️</span>
                  <span style={{ fontSize: '12px', color: '#60a5fa', fontWeight: 600 }}>CMA HEAT MAP</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
                  <span style={{ color: '#10b981' }}>🏠 Subject</span>
                  <span style={{ color: '#60a5fa' }}>📍 Comps ({prop.comps.length})</span>
                </div>
              </div>
              
              {/* CSS-based Heat Map Visualization */}
              <div style={{ 
                height: '280px', 
                width: '100%', 
                position: 'relative',
                background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
                overflow: 'hidden'
              }}>
                {/* Animated grid background */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: 'linear-gradient(rgba(96, 165, 250, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(96, 165, 250, 0.1) 1px, transparent 1px)',
                  backgroundSize: '30px 30px',
                  animation: 'gridPulse 2s ease-in-out infinite'
                }} />
                
                {/* Heat zones */}
                <div style={{
                  position: 'absolute',
                  width: '200px',
                  height: '200px',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, rgba(249, 115, 22, 0.3) 30%, rgba(34, 197, 94, 0.2) 60%, transparent 100%)',
                  borderRadius: '50%',
                  animation: 'heatPulse 3s ease-in-out infinite'
                }} />
                <div style={{
                  position: 'absolute',
                  width: '120px',
                  height: '120px',
                  left: '30%',
                  top: '40%',
                  background: 'radial-gradient(circle, rgba(250, 204, 21, 0.3) 0%, rgba(34, 197, 94, 0.2) 50%, transparent 100%)',
                  borderRadius: '50%',
                  animation: 'heatPulse 2.5s ease-in-out infinite 0.5s'
                }} />
                <div style={{
                  position: 'absolute',
                  width: '100px',
                  height: '100px',
                  left: '65%',
                  top: '60%',
                  background: 'radial-gradient(circle, rgba(96, 165, 250, 0.3) 0%, rgba(34, 197, 94, 0.2) 50%, transparent 100%)',
                  borderRadius: '50%',
                  animation: 'heatPulse 2s ease-in-out infinite 1s'
                }} />
                
                {/* Subject property marker */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10
                }}>
                  <div style={{
                    fontSize: '32px',
                    filter: 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.8))',
                    animation: 'bounce 1s ease-in-out infinite'
                  }}>🏠</div>
                  <div style={{
                    position: 'absolute',
                    top: '40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(16, 185, 129, 0.9)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#fff',
                    whiteSpace: 'nowrap'
                  }}>SUBJECT</div>
                </div>
                
                {/* Comp markers with staggered animation */}
                {prop.comps.map((comp, i) => {
                  const positions = [
                    { left: '30%', top: '35%' },
                    { left: '70%', top: '40%' },
                    { left: '35%', top: '65%' },
                    { left: '65%', top: '70%' }
                  ];
                  return (
                    <div key={i} style={{
                      position: 'absolute',
                      ...positions[i],
                      transform: 'translate(-50%, -50%)',
                      zIndex: 5,
                      animation: `fadeInScale 0.5s ease-out ${i * 0.3}s both`
                    }}>
                      <div style={{
                        fontSize: '24px',
                        filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.6))'
                      }}>📍</div>
                      <div style={{
                        position: 'absolute',
                        top: '28px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(96, 165, 250, 0.9)',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '9px',
                        fontWeight: 600,
                        color: '#fff',
                        whiteSpace: 'nowrap'
                      }}>{fmt(comp.price)}</div>
                    </div>
                  );
                })}
                
                {/* ARV Calculation overlay */}
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '10px 14px'
                }}>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>CALCULATED ARV</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>{fmt(prop.arv)}</div>
                </div>
                
                {/* Legend */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '10px'
                }}>
                  <div style={{ color: '#64748b', marginBottom: '6px' }}>HEAT INTENSITY</div>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '8px', background: 'linear-gradient(90deg, #22c55e, #facc15, #f97316, #ef4444)', borderRadius: '4px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px', color: '#475569', fontSize: '8px' }}>
                    <span>LOW</span>
                    <span>HIGH</span>
                  </div>
                </div>
              </div>
              
              {/* Comp Stats Overlay */}
              <div style={{
                padding: '12px 16px',
                background: 'rgba(30, 41, 59, 0.9)',
                borderTop: '1px solid #334155',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px'
              }}>
                {prop.comps.map((comp, i) => (
                  <div key={i} style={{
                    background: 'rgba(96, 165, 250, 0.1)',
                    border: '1px solid rgba(96, 165, 250, 0.3)',
                    borderRadius: '6px',
                    padding: '8px',
                    fontSize: '10px',
                    animation: `fadeInScale 0.3s ease-out ${i * 0.15}s both`
                  }}>
                    <div style={{ color: '#60a5fa', fontWeight: 600 }}>COMP #{i + 1}</div>
                    <div style={{ color: '#10b981', marginTop: '2px' }}>{fmt(comp.price)}</div>
                    <div style={{ color: '#64748b' }}>{comp.sqft} sqft</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ background: '#1e293b', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #334155' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
                <span style={{ marginLeft: '12px', fontSize: '12px', color: '#64748b' }}>brevard-bidder-ai</span>
              </div>
              <div style={{ padding: '16px', minHeight: '300px', fontSize: '13px' }}>
                <div style={{ color: '#10b981' }}>$ brevard-bidder --analyze "{prop.id}"</div>
                <div style={{ color: '#334155', margin: '8px 0' }}>────────────────────────────────────</div>
                {currentStage && (
                  <>
                    <div style={{ color: '#94a3b8' }}>
                      <span style={{ color: '#f59e0b' }}>→</span> Stage {stage + 1}: {currentStage.name}
                    </div>
                    <div style={{ color: '#64748b', marginTop: '4px' }}>{currentStage.desc}</div>
                    
                    {stage >= 3 && (
                      <div style={{ marginTop: '12px', color: '#10b981' }}>
                        ✓ Lien Status: Senior Mortgage NONE
                      </div>
                    )}
                    {stage >= 6 && (
                      <div style={{ color: '#60a5fa' }}>
                        ✓ ML Score: {prop.mlScore}% | 3rd Party: {pct(prop.thirdPartyProb)}
                      </div>
                    )}
                    {stage >= 8 && (
                      <div style={{ color: dc.text, fontWeight: 700 }}>
                        ✓ Decision: {prop.decision} (Ratio: {pct(prop.bidJudgmentRatio)})
                      </div>
                    )}
                  </>
                )}
                <div style={{ marginTop: '16px', color: '#334155' }}>
                  <span style={{ animation: 'blink 1s infinite' }}>█</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Stats */}
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #334155', borderRadius: '12px', padding: '16px' }}>
            <h3 style={{ fontSize: '11px', color: '#64748b', margin: '0 0 12px', letterSpacing: '1.5px' }}>SESSION STATS</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>{completed.filter(p => p.decision === 'BID').length}</div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>BID</div>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>{completed.filter(p => p.decision === 'REVIEW').length}</div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>REVIEW</div>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444' }}>{completed.filter(p => p.decision === 'SKIP').length}</div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>SKIP</div>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#60a5fa' }}>{completed.length}</div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>TOTAL</div>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #334155', borderRadius: '12px', padding: '16px', flex: 1 }}>
            <h3 style={{ fontSize: '11px', color: '#64748b', margin: '0 0 12px', letterSpacing: '1.5px' }}>ACTIVITY LOG</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {logs.map((log, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  padding: '6px 8px',
                  background: log.stage === 'CMA Analysis' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(30, 41, 59, 0.3)',
                  borderRadius: '4px',
                  border: log.stage === 'CMA Analysis' ? '1px solid rgba(96, 165, 250, 0.3)' : 'none'
                }}>
                  <span style={{ color: '#475569', fontFamily: 'monospace' }}>{log.time}</span>
                  <span style={{ color: log.stage === 'CMA Analysis' ? '#60a5fa' : '#10b981' }}>✓</span>
                  <span style={{ color: '#94a3b8' }}>{log.stage}</span>
                </div>
              ))}
              {logs.length === 0 && <div style={{ color: '#475569', fontSize: '12px' }}>Starting pipeline...</div>}
            </div>
          </div>

          {/* Data Sources */}
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #334155', borderRadius: '12px', padding: '16px' }}>
            <h3 style={{ fontSize: '11px', color: '#64748b', margin: '0 0 12px', letterSpacing: '1.5px' }}>DATA SOURCES</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['BECA', 'BCPAO', 'AcclaimWeb', 'RealTDM', 'Census', 'Mapbox'].map(src => (
                <span key={src} style={{
                  padding: '4px 8px',
                  background: src === 'Mapbox' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  border: `1px solid ${src === 'Mapbox' ? 'rgba(96, 165, 250, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                  borderRadius: '4px',
                  fontSize: '10px',
                  color: src === 'Mapbox' ? '#60a5fa' : '#10b981'
                }}>{src}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '24px', color: '#475569', fontSize: '12px', position: 'relative', zIndex: 10 }}>
        Everest Capital of Brevard LLC • 10 hours → 10 minutes • 100x ROI
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes heatPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
        }
        @keyframes gridPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes bounce {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-8px); }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
}
