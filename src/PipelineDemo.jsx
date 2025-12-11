import React, { useState, useEffect } from 'react';

// BrevardBidderAI Pipeline Demo - Auto-playing animated walkthrough
// Embeddable on brevard-bidder-landing.pages.dev

const STAGES = [
  { id: 1, name: 'Discovery', icon: '🔍', duration: 2000, description: 'Scanning RealForeclose auction calendar...' },
  { id: 2, name: 'BECA Scraping', icon: '📄', duration: 2500, description: 'Extracting Final Judgment & Opening Bid...' },
  { id: 3, name: 'Title Search', icon: '📋', duration: 2000, description: 'Querying BCPAO property records...' },
  { id: 4, name: 'Lien Priority', icon: '⚖️', duration: 3000, description: 'Analyzing AcclaimWeb recorded documents...' },
  { id: 5, name: 'Tax Certificates', icon: '💰', duration: 1500, description: 'Checking RealTDM for outstanding taxes...' },
  { id: 6, name: 'Demographics', icon: '📊', duration: 1500, description: 'Pulling Census API neighborhood data...' },
  { id: 7, name: 'ML Score', icon: '🤖', duration: 2500, description: 'Running XGBoost prediction model...' },
  { id: 8, name: 'Max Bid Calc', icon: '🧮', duration: 2000, description: 'Computing (ARV×70%)-Repairs-$10K-Buffer...' },
  { id: 9, name: 'Decision Log', icon: '✅', duration: 1500, description: 'Recording audit trail to Supabase...' },
  { id: 10, name: 'Report Gen', icon: '📝', duration: 2000, description: 'Generating one-page DOCX analysis...' },
  { id: 11, name: 'Disposition', icon: '🎯', duration: 1000, description: 'Assigning exit strategy...' },
  { id: 12, name: 'Archive', icon: '💾', duration: 1000, description: 'Storing to historical_auctions table...' },
];

const SAMPLE_PROPERTY = {
  caseNumber: '05-2024-CA-012847',
  address: '1847 Rockledge Dr, Rockledge, FL 32955',
  parcelId: '24-36-03-76-00001.0-0012.00',
  plaintiff: 'Nationstar Mortgage LLC',
  finalJudgment: 287450,
  openingBid: 100,
  propertyType: 'Single Family',
  bedBath: '3/2',
  sqft: 1847,
  yearBuilt: 1992,
  arvEstimate: 385000,
  repairEstimate: 45000,
  taxesDue: 3247,
  hoaLiens: 0,
  seniorMortgage: null,
  zipCode: '32955',
  medianIncome: 72450,
  vacancyRate: 5.2,
  mlProbability: 0.73,
  thirdPartyProb: 0.64,
};

const formatCurrency = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);

export default function BrevardBidderDemo() {
  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showDecision, setShowDecision] = useState(false);
  const [dataPoints, setDataPoints] = useState({});
  const [logs, setLogs] = useState([]);

  // Calculate max bid using the formula
  const arvBuffer = Math.min(25000, SAMPLE_PROPERTY.arvEstimate * 0.15);
  const maxBid = (SAMPLE_PROPERTY.arvEstimate * 0.70) - SAMPLE_PROPERTY.repairEstimate - 10000 - arvBuffer;
  const bidJudgmentRatio = (maxBid / SAMPLE_PROPERTY.finalJudgment) * 100;
  const decision = bidJudgmentRatio >= 75 ? 'BID' : bidJudgmentRatio >= 60 ? 'REVIEW' : 'SKIP';

  useEffect(() => {
    if (!isPlaying || currentStage >= STAGES.length) return;

    const stage = STAGES[currentStage];
    
    // Add log entry
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev.slice(-8), { time: timestamp, stage: stage.name, status: 'processing' }]);

    // Reveal data points based on stage
    const timer = setTimeout(() => {
      setDataPoints(prev => {
        const newData = { ...prev };
        switch(currentStage) {
          case 0: newData.caseFound = true; break;
          case 1: newData.becaData = true; break;
          case 2: newData.titleData = true; break;
          case 3: newData.lienData = true; break;
          case 4: newData.taxData = true; break;
          case 5: newData.demoData = true; break;
          case 6: newData.mlData = true; break;
          case 7: newData.maxBidData = true; break;
          case 8: newData.logged = true; break;
          case 9: newData.reportGen = true; break;
          case 10: newData.disposition = true; break;
          case 11: newData.archived = true; break;
        }
        return newData;
      });

      // Update log to complete
      setLogs(prev => prev.map((log, i) => 
        i === prev.length - 1 ? { ...log, status: 'complete' } : log
      ));

      if (currentStage < STAGES.length - 1) {
        setCurrentStage(prev => prev + 1);
      } else {
        setTimeout(() => setShowDecision(true), 500);
      }
    }, stage.duration);

    return () => clearTimeout(timer);
  }, [currentStage, isPlaying]);

  const restart = () => {
    setCurrentStage(0);
    setIsPlaying(true);
    setShowDecision(false);
    setDataPoints({});
    setLogs([]);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0f1a 0%, #111827 50%, #0d1321 100%)',
      fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
      color: '#e2e8f0',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background grid effect */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px',
        position: 'relative',
        zIndex: 10,
      }}>
        <div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 700, 
            margin: 0,
            background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
          }}>
            BrevardBidderAI
          </h1>
          <p style={{ 
            fontSize: '12px', 
            color: '#64748b', 
            margin: '4px 0 0 0',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}>
            Agentic AI Foreclosure Intelligence
          </p>
        </div>
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          alignItems: 'center',
        }}>
          <div style={{
            background: isPlaying ? 'rgba(34, 197, 94, 0.15)' : 'rgba(251, 191, 36, 0.15)',
            border: `1px solid ${isPlaying ? '#22c55e' : '#fbbf24'}`,
            borderRadius: '20px',
            padding: '6px 14px',
            fontSize: '11px',
            fontWeight: 600,
            color: isPlaying ? '#4ade80' : '#fcd34d',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isPlaying ? '#22c55e' : '#fbbf24',
              animation: isPlaying ? 'pulse 1.5s infinite' : 'none',
            }} />
            {isPlaying ? 'PROCESSING' : 'COMPLETE'}
          </div>
          <button
            onClick={restart}
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              padding: '8px 16px',
              color: '#60a5fa',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            ↻ RESTART
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr 320px',
        gap: '20px',
        position: 'relative',
        zIndex: 10,
      }}>
        
        {/* Left Panel - Pipeline Stages */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(51, 65, 85, 0.5)',
          borderRadius: '12px',
          padding: '16px',
          backdropFilter: 'blur(10px)',
        }}>
          <h3 style={{ 
            fontSize: '11px', 
            color: '#94a3b8', 
            margin: '0 0 16px 0',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
          }}>
            12-Stage Pipeline
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {STAGES.map((stage, idx) => {
              const isActive = idx === currentStage && isPlaying;
              const isComplete = idx < currentStage || (idx === currentStage && !isPlaying && currentStage === STAGES.length - 1);
              const isPending = idx > currentStage;
              
              return (
                <div
                  key={stage.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    border: isActive ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
                    transition: 'all 0.3s ease',
                    opacity: isPending ? 0.4 : 1,
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    background: isComplete ? 'rgba(34, 197, 94, 0.2)' : isActive ? 'rgba(59, 130, 246, 0.2)' : 'rgba(51, 65, 85, 0.3)',
                    border: `1px solid ${isComplete ? '#22c55e' : isActive ? '#3b82f6' : '#334155'}`,
                  }}>
                    {isComplete ? '✓' : stage.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '12px', 
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#f1f5f9' : '#94a3b8',
                    }}>
                      {stage.name}
                    </div>
                  </div>
                  {isActive && (
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #3b82f6',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Panel - Property Data */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {/* Property Header Card */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '12px',
            padding: '20px',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ 
                  fontSize: '10px', 
                  color: '#64748b', 
                  letterSpacing: '1px',
                  marginBottom: '4px',
                }}>
                  CASE #{SAMPLE_PROPERTY.caseNumber}
                </div>
                <h2 style={{ 
                  fontSize: '18px', 
                  fontWeight: 600, 
                  margin: '0 0 8px 0',
                  color: '#f1f5f9',
                }}>
                  {SAMPLE_PROPERTY.address}
                </h2>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#94a3b8',
                  display: 'flex',
                  gap: '16px',
                }}>
                  <span>{SAMPLE_PROPERTY.propertyType}</span>
                  <span>•</span>
                  <span>{SAMPLE_PROPERTY.bedBath}</span>
                  <span>•</span>
                  <span>{SAMPLE_PROPERTY.sqft.toLocaleString()} sqft</span>
                  <span>•</span>
                  <span>Built {SAMPLE_PROPERTY.yearBuilt}</span>
                </div>
              </div>
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                padding: '8px 12px',
                textAlign: 'right',
              }}>
                <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>PARCEL</div>
                <div style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 500 }}>{SAMPLE_PROPERTY.parcelId}</div>
              </div>
            </div>
          </div>

          {/* Data Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
          }}>
            {/* BECA Data */}
            <DataCard
              title="BECA Extraction"
              visible={dataPoints.becaData}
              items={[
                { label: 'Final Judgment', value: formatCurrency(SAMPLE_PROPERTY.finalJudgment), highlight: true },
                { label: 'Opening Bid', value: formatCurrency(SAMPLE_PROPERTY.openingBid) },
                { label: 'Plaintiff', value: SAMPLE_PROPERTY.plaintiff.split(' ')[0] + '...' },
              ]}
            />

            {/* Title Data */}
            <DataCard
              title="Property Records"
              visible={dataPoints.titleData}
              items={[
                { label: 'ARV Estimate', value: formatCurrency(SAMPLE_PROPERTY.arvEstimate), highlight: true },
                { label: 'Repair Est.', value: formatCurrency(SAMPLE_PROPERTY.repairEstimate) },
                { label: 'Year Built', value: SAMPLE_PROPERTY.yearBuilt },
              ]}
            />

            {/* Lien Data */}
            <DataCard
              title="Lien Analysis"
              visible={dataPoints.lienData}
              items={[
                { label: 'Senior Mortgage', value: SAMPLE_PROPERTY.seniorMortgage || 'NONE', highlight: !SAMPLE_PROPERTY.seniorMortgage, highlightColor: '#22c55e' },
                { label: 'HOA Liens', value: formatCurrency(SAMPLE_PROPERTY.hoaLiens) },
                { label: 'Status', value: '✓ Clear to Bid', highlightColor: '#22c55e' },
              ]}
            />

            {/* Tax Data */}
            <DataCard
              title="Tax Certificates"
              visible={dataPoints.taxData}
              items={[
                { label: 'Taxes Due', value: formatCurrency(SAMPLE_PROPERTY.taxesDue) },
                { label: 'Status', value: 'Redeemable' },
                { label: 'Interest', value: '18% max' },
              ]}
            />

            {/* Demographics */}
            <DataCard
              title="Demographics"
              visible={dataPoints.demoData}
              items={[
                { label: 'Zip Code', value: SAMPLE_PROPERTY.zipCode },
                { label: 'Median Income', value: formatCurrency(SAMPLE_PROPERTY.medianIncome) },
                { label: 'Vacancy Rate', value: SAMPLE_PROPERTY.vacancyRate + '%' },
              ]}
            />

            {/* ML Prediction */}
            <DataCard
              title="ML Prediction"
              visible={dataPoints.mlData}
              items={[
                { label: '3rd Party Prob', value: (SAMPLE_PROPERTY.thirdPartyProb * 100).toFixed(0) + '%', highlight: true },
                { label: 'Model', value: 'XGBoost v2.1' },
                { label: 'Confidence', value: (SAMPLE_PROPERTY.mlProbability * 100).toFixed(0) + '%' },
              ]}
            />
          </div>

          {/* Max Bid Calculation */}
          {dataPoints.maxBidData && (
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              borderRadius: '12px',
              padding: '20px',
              backdropFilter: 'blur(10px)',
              animation: 'fadeIn 0.5s ease',
            }}>
              <h3 style={{ 
                fontSize: '11px', 
                color: '#94a3b8', 
                margin: '0 0 16px 0',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
              }}>
                Max Bid Formula
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                fontSize: '14px',
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                <span style={{ color: '#60a5fa' }}>({formatCurrency(SAMPLE_PROPERTY.arvEstimate)} × 70%)</span>
                <span style={{ color: '#64748b' }}>−</span>
                <span style={{ color: '#f87171' }}>{formatCurrency(SAMPLE_PROPERTY.repairEstimate)}</span>
                <span style={{ color: '#64748b' }}>−</span>
                <span style={{ color: '#f87171' }}>$10K</span>
                <span style={{ color: '#64748b' }}>−</span>
                <span style={{ color: '#f87171' }}>{formatCurrency(arvBuffer)}</span>
                <span style={{ color: '#64748b' }}>=</span>
                <span style={{ 
                  color: '#4ade80', 
                  fontWeight: 700,
                  fontSize: '18px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}>
                  {formatCurrency(maxBid)}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '32px',
                marginTop: '16px',
                fontSize: '12px',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#64748b' }}>Bid/Judgment Ratio</div>
                  <div style={{ 
                    color: bidJudgmentRatio >= 75 ? '#4ade80' : bidJudgmentRatio >= 60 ? '#fbbf24' : '#f87171',
                    fontWeight: 600,
                    fontSize: '16px',
                  }}>
                    {bidJudgmentRatio.toFixed(1)}%
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#64748b' }}>Threshold</div>
                  <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: '16px' }}>
                    ≥75% BID | 60-74% REVIEW | &lt;60% SKIP
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Decision Display */}
          {showDecision && (
            <div style={{
              background: decision === 'BID' 
                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)'
                : decision === 'REVIEW'
                ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.05) 100%)'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)',
              border: `2px solid ${decision === 'BID' ? '#22c55e' : decision === 'REVIEW' ? '#fbbf24' : '#ef4444'}`,
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center',
              animation: 'scaleIn 0.4s ease',
            }}>
              <div style={{ 
                fontSize: '14px', 
                color: '#94a3b8', 
                marginBottom: '8px',
                letterSpacing: '2px',
              }}>
                AI RECOMMENDATION
              </div>
              <div style={{
                fontSize: '48px',
                fontWeight: 800,
                color: decision === 'BID' ? '#4ade80' : decision === 'REVIEW' ? '#fcd34d' : '#f87171',
                letterSpacing: '4px',
                textShadow: `0 0 40px ${decision === 'BID' ? 'rgba(34, 197, 94, 0.5)' : decision === 'REVIEW' ? 'rgba(251, 191, 36, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
              }}>
                {decision}
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: '#94a3b8', 
                marginTop: '12px',
              }}>
                Max Bid: <strong style={{ color: '#f1f5f9' }}>{formatCurrency(maxBid)}</strong> • 
                Ratio: <strong style={{ color: '#f1f5f9' }}>{bidJudgmentRatio.toFixed(1)}%</strong> • 
                Exit: <strong style={{ color: '#f1f5f9' }}>Fix & Flip</strong>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Activity Log */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(51, 65, 85, 0.5)',
          borderRadius: '12px',
          padding: '16px',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <h3 style={{ 
            fontSize: '11px', 
            color: '#94a3b8', 
            margin: '0 0 16px 0',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
          }}>
            Activity Log
          </h3>
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '6px',
            overflow: 'hidden',
          }}>
            {logs.map((log, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  padding: '8px 10px',
                  background: 'rgba(30, 41, 59, 0.5)',
                  borderRadius: '6px',
                  animation: 'slideIn 0.3s ease',
                }}
              >
                <span style={{ color: '#64748b', fontFamily: 'monospace' }}>{log.time}</span>
                <span style={{ 
                  color: log.status === 'complete' ? '#4ade80' : '#fbbf24',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: log.status === 'complete' ? '#4ade80' : '#fbbf24',
                }} />
                <span style={{ color: '#e2e8f0' }}>{log.stage}</span>
              </div>
            ))}
          </div>
          
          {/* Stats */}
          <div style={{
            borderTop: '1px solid rgba(51, 65, 85, 0.5)',
            marginTop: '16px',
            paddingTop: '16px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
          }}>
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>PROCESSING</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#60a5fa' }}>
                {((currentStage + 1) / STAGES.length * 100).toFixed(0)}%
              </div>
            </div>
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>FREE TIER</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#4ade80' }}>47%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '24px',
        textAlign: 'center',
        color: '#64748b',
        fontSize: '11px',
        position: 'relative',
        zIndex: 10,
      }}>
        <span style={{ opacity: 0.7 }}>Everest Capital of Brevard LLC</span>
        <span style={{ margin: '0 12px' }}>•</span>
        <span style={{ opacity: 0.7 }}>BrevardBidderAI V13.4.0</span>
        <span style={{ margin: '0 12px' }}>•</span>
        <span style={{ opacity: 0.7 }}>Agentic AI Ecosystem</span>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

// Data Card Component
function DataCard({ title, visible, items }) {
  if (!visible) {
    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.3)',
        border: '1px dashed rgba(51, 65, 85, 0.3)',
        borderRadius: '12px',
        padding: '16px',
        opacity: 0.5,
      }}>
        <h4 style={{ 
          fontSize: '10px', 
          color: '#475569', 
          margin: '0 0 12px 0',
          letterSpacing: '1px',
          textTransform: 'uppercase',
        }}>
          {title}
        </h4>
        <div style={{ color: '#334155', fontSize: '12px' }}>Awaiting data...</div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.6)',
      border: '1px solid rgba(51, 65, 85, 0.5)',
      borderRadius: '12px',
      padding: '16px',
      backdropFilter: 'blur(10px)',
      animation: 'fadeIn 0.5s ease',
    }}>
      <h4 style={{ 
        fontSize: '10px', 
        color: '#94a3b8', 
        margin: '0 0 12px 0',
        letterSpacing: '1px',
        textTransform: 'uppercase',
      }}>
        {title}
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>{item.label}</span>
            <span style={{ 
              fontSize: '12px', 
              fontWeight: item.highlight ? 600 : 400,
              color: item.highlightColor || (item.highlight ? '#f1f5f9' : '#94a3b8'),
            }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
