import React, { useState, useEffect, useRef } from 'react';

// Mapbox GL JS will be loaded via CDN in index.html
// Add to index.html: <script src='https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js'></script>
// Add to index.html: <link href='https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css' rel='stylesheet' />

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYnJldmFyZGJpZGRlciIsImEiOiJjbTRuOXB2NHYwMWtvMmtzOGN5eXRveHd2In0.Yk3HVxgXwGJhVxgXwGJhVx';

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

// Heat map data generator for Brevard County
const generateHeatMapData = (centerCoords, comps) => {
  const points = [];
  // Add comps as heat points
  comps.forEach(comp => {
    points.push({
      type: 'Feature',
      properties: { intensity: comp.price / 500000 },
      geometry: { type: 'Point', coordinates: comp.coords }
    });
  });
  // Add some random market activity points
  for (let i = 0; i < 20; i++) {
    points.push({
      type: 'Feature',
      properties: { intensity: Math.random() * 0.8 + 0.2 },
      geometry: {
        type: 'Point',
        coordinates: [
          centerCoords[0] + (Math.random() - 0.5) * 0.05,
          centerCoords[1] + (Math.random() - 0.5) * 0.05
        ]
      }
    });
  }
  return { type: 'FeatureCollection', features: points };
};

export default function PipelineDemo() {
  const [stage, setStage] = useState(0);
  const [propIdx, setPropIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [completed, setCompleted] = useState([]);
  const [logs, setLogs] = useState([]);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const prop = DEMO_PROPERTIES[propIdx];
  const currentStage = PIPELINE_STAGES[stage];
  const isCMAStage = stage === 5; // CMA Analysis stage

  // Initialize and update map
  useEffect(() => {
    if (!isCMAStage || !mapContainerRef.current) return;
    
    // Check if mapboxgl is available
    if (typeof window !== 'undefined' && window.mapboxgl) {
      window.mapboxgl.accessToken = MAPBOX_TOKEN;
      
      if (!mapRef.current) {
        mapRef.current = new window.mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: prop.coords,
          zoom: 13,
          pitch: 45,
          bearing: -17.6
        });

        mapRef.current.on('load', () => {
          // Add heat map layer
          mapRef.current.addSource('heat', {
            type: 'geojson',
            data: generateHeatMapData(prop.coords, prop.comps)
          });

          mapRef.current.addLayer({
            id: 'heat-layer',
            type: 'heatmap',
            source: 'heat',
            paint: {
              'heatmap-weight': ['get', 'intensity'],
              'heatmap-intensity': 1.5,
              'heatmap-color': [
                'interpolate', ['linear'], ['heatmap-density'],
                0, 'rgba(0, 0, 0, 0)',
                0.2, 'rgba(16, 185, 129, 0.3)',
                0.4, 'rgba(34, 197, 94, 0.5)',
                0.6, 'rgba(250, 204, 21, 0.7)',
                0.8, 'rgba(249, 115, 22, 0.8)',
                1, 'rgba(239, 68, 68, 0.9)'
              ],
              'heatmap-radius': 40,
              'heatmap-opacity': 0.8
            }
          });
        });
      } else {
        // Update existing map
        mapRef.current.flyTo({ center: prop.coords, zoom: 13 });
        if (mapRef.current.getSource('heat')) {
          mapRef.current.getSource('heat').setData(generateHeatMapData(prop.coords, prop.comps));
        }
      }

      // Clear existing markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      // Add subject property marker
      const subjectEl = document.createElement('div');
      subjectEl.innerHTML = '🏠';
      subjectEl.style.fontSize = '32px';
      subjectEl.style.filter = 'drop-shadow(0 0 8px #10b981)';
      const subjectMarker = new window.mapboxgl.Marker({ element: subjectEl })
        .setLngLat(prop.coords)
        .setPopup(new window.mapboxgl.Popup().setHTML(`
          <div style="font-family: monospace; padding: 8px;">
            <div style="font-weight: bold; color: #10b981;">SUBJECT PROPERTY</div>
            <div style="margin-top: 4px;">${prop.address}</div>
            <div style="color: #64748b; margin-top: 4px;">ARV: ${fmt(prop.arv)}</div>
          </div>
        `))
        .addTo(mapRef.current);
      markersRef.current.push(subjectMarker);

      // Add comp markers with animation delay
      prop.comps.forEach((comp, i) => {
        setTimeout(() => {
          const compEl = document.createElement('div');
          compEl.innerHTML = '📍';
          compEl.style.fontSize = '24px';
          compEl.style.opacity = '0';
          compEl.style.transition = 'opacity 0.5s';
          
          const compMarker = new window.mapboxgl.Marker({ element: compEl })
            .setLngLat(comp.coords)
            .setPopup(new window.mapboxgl.Popup().setHTML(`
              <div style="font-family: monospace; padding: 8px;">
                <div style="font-weight: bold; color: #60a5fa;">COMP #${i + 1}</div>
                <div style="margin-top: 4px;">${comp.address}</div>
                <div style="color: #10b981; margin-top: 4px;">${fmt(comp.price)}</div>
                <div style="color: #64748b;">${comp.sqft.toLocaleString()} sqft</div>
              </div>
            `))
            .addTo(mapRef.current);
          
          setTimeout(() => compEl.style.opacity = '1', 50);
          markersRef.current.push(compMarker);
        }, i * 300);
      });
    }

    return () => {
      // Cleanup markers when leaving CMA stage
      if (!isCMAStage) {
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];
      }
    };
  }, [isCMAStage, prop, propIdx]);

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
              <div 
                ref={mapContainerRef} 
                style={{ height: '320px', width: '100%' }}
              />
              {/* Fallback if Mapbox not loaded */}
              {typeof window !== 'undefined' && !window.mapboxgl && (
                <div style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: 'rgba(15, 23, 42, 0.95)',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ fontSize: '48px' }}>🗺️</div>
                  <div style={{ color: '#64748b', fontSize: '14px' }}>CMA Heat Map</div>
                  <div style={{ color: '#60a5fa', fontSize: '12px' }}>
                    {prop.comps.length} Comparable Sales Found
                  </div>
                  <div style={{ color: '#10b981', fontSize: '14px', fontWeight: 600 }}>
                    ARV: {fmt(prop.arv)}
                  </div>
                </div>
              )}
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
                    fontSize: '10px'
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
      `}</style>
    </div>
  );
}
