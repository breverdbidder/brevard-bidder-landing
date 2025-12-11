import React, { useState, useEffect, useCallback } from 'react';

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
    liens: ['Senior Mortgage: NONE', 'HOA: Current', 'Tax Cert: NONE'],
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
    liens: ['Senior Mortgage: NONE', 'HOA: $4,200 delinquent', 'Tax Cert: 2023'],
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
    liens: ['Senior Mortgage: NONE', 'HOA: Current', 'Tax Cert: NONE'],
    demographics: { income: 79800, vacancy: 4.8, growth: 4.2 }
  }
];

const PIPELINE_STAGES = [
  { id: 1, name: 'Discovery', icon: '🔍', desc: 'Scanning RealForeclose calendar' },
  { id: 2, name: 'BECA Scraping', icon: '📄', desc: 'Extracting Clerk records' },
  { id: 3, name: 'Title Search', icon: '📋', desc: 'Querying AcclaimWeb' },
  { id: 4, name: 'Lien Priority', icon: '⚖️', desc: 'Analyzing mortgage position' },
  { id: 5, name: 'Tax Certs', icon: '🏛️', desc: 'Checking RealTDM' },
  { id: 6, name: 'Demographics', icon: '📊', desc: 'Census API analysis' },
  { id: 7, name: 'ML Score', icon: '🤖', desc: 'XGBoost prediction' },
  { id: 8, name: 'Max Bid', icon: '💰', desc: 'Formula calculation' },
  { id: 9, name: 'Decision', icon: '✅', desc: 'BID/REVIEW/SKIP' },
  { id: 10, name: 'Report', icon: '📑', desc: 'DOCX generation' },
  { id: 11, name: 'Disposition', icon: '🎯', desc: 'Exit strategy' },
  { id: 12, name: 'Archive', icon: '💾', desc: 'Supabase storage' }
];

const fmt = (n) => '$' + n.toLocaleString();
const pct = (n) => (n * 100).toFixed(0) + '%';

export default function BrevardBidderDemo() {
  const [stage, setStage] = useState(0);
  const [propIdx, setPropIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [completed, setCompleted] = useState([]);
  const [logs, setLogs] = useState([]);

  const prop = DEMO_PROPERTIES[propIdx];
  const currentStage = PIPELINE_STAGES[stage];

  useEffect(() => {
    if (!playing) return;
    
    const timer = setInterval(() => {
      setStage(s => {
        const next = s + 1;
        
        // Add log entry
        const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLogs(l => [...l.slice(-6), { time: now, stage: PIPELINE_STAGES[s]?.name || 'Init', done: true }]);
        
        if (next >= 12) {
          setShowResult(true);
          setCompleted(c => [...c, prop]);
          
          setTimeout(() => {
            setShowResult(false);
            setPropIdx(p => (p + 1) % DEMO_PROPERTIES.length);
            setLogs([]);
          }, 2000);
          
          return 0;
        }
        return next;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [playing, prop]);

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
              background: i === stage ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              border: i === stage ? '1px solid #10b981' : '1px solid transparent',
              opacity: i > stage ? 0.4 : 1,
              transition: 'all 0.3s'
            }}>
              <span style={{ fontSize: '14px' }}>{i < stage ? '✓' : s.icon}</span>
              <span style={{ fontSize: '12px', color: i === stage ? '#fff' : i < stage ? '#10b981' : '#64748b' }}>{s.name}</span>
              {i === stage && <span style={{ marginLeft: 'auto', width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', animation: 'pulse 1s infinite' }} />}
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
                { label: 'ARV', value: fmt(prop.arv), show: stage >= 5, color: '#10b981' },
                { label: 'Repairs', value: fmt(prop.repairs), show: stage >= 5, color: '#f59e0b' },
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

          {/* Terminal */}
          <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ background: '#1e293b', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #334155' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
              <span style={{ marginLeft: '12px', fontSize: '12px', color: '#64748b' }}>brevard-bidder-ai</span>
            </div>
            <div style={{ padding: '16px', minHeight: '200px', fontSize: '13px' }}>
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
                      ✓ Lien Status: {prop.liens[0]}
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
                  background: 'rgba(30, 41, 59, 0.3)',
                  borderRadius: '4px'
                }}>
                  <span style={{ color: '#475569', fontFamily: 'monospace' }}>{log.time}</span>
                  <span style={{ color: '#10b981' }}>✓</span>
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
              {['BECA', 'BCPAO', 'AcclaimWeb', 'RealTDM', 'Census'].map(src => (
                <span key={src} style={{
                  padding: '4px 8px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '4px',
                  fontSize: '10px',
                  color: '#10b981'
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
      `}</style>
    </div>
  );
}
