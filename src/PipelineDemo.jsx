import React, { useState, useEffect, useRef } from 'react';

// Mapbox token
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXZlcmVzdDE4IiwiYSI6ImNtYnAydnExdjAwNnAyb3EwaTJjcTZiNnIifQ.55IMlqQsnOCLflDblrQGKw';

// Demo properties with real Brevard County coordinates
const DEMO_PROPERTIES = [
  {
    id: '05-2024-CA-012847',
    address: '1847 Coral Bay Dr, Satellite Beach',
    plaintiff: 'FREEDOM MORTGAGE CORP',
    finalJudgment: 287650,
    arv: 385000,
    repairs: 28500,
    maxBid: 202000,
    ratio: 0.78,
    decision: 'BID',
    mlScore: 72,
    lat: 28.1697,
    lng: -80.6008,
    comps: [
      { address: '1923 Ocean Ave', price: 395000, sqft: 1850, dist: 0.3, lat: 28.1712, lng: -80.5985 },
      { address: '1756 Atlantic Blvd', price: 372000, sqft: 1780, dist: 0.5, lat: 28.1678, lng: -80.6032 },
      { address: '2041 Sea Oats Dr', price: 389000, sqft: 1920, dist: 0.4, lat: 28.1725, lng: -80.5998 },
    ]
  },
  {
    id: '05-2024-CA-018923',
    address: '4521 Hammock Oak Dr, Melbourne',
    plaintiff: 'SHELLPOINT MORTGAGE',
    finalJudgment: 412890,
    arv: 445000,
    repairs: 52000,
    maxBid: 197500,
    ratio: 0.48,
    decision: 'SKIP',
    mlScore: 23,
    lat: 28.0836,
    lng: -80.6081,
    comps: [
      { address: '4380 Palm Bay Rd', price: 425000, sqft: 2100, dist: 0.6, lat: 28.0815, lng: -80.6055 },
      { address: '4612 Riviera Dr', price: 465000, sqft: 2250, dist: 0.4, lat: 28.0858, lng: -80.6102 },
      { address: '4289 Heritage Oaks', price: 448000, sqft: 2180, dist: 0.5, lat: 28.0822, lng: -80.6118 },
    ]
  },
  {
    id: '05-2024-CA-021456',
    address: '892 Atlantic Ave, Indialantic',
    plaintiff: 'BANK OF AMERICA NA',
    finalJudgment: 156780,
    arv: 295000,
    repairs: 18000,
    maxBid: 150250,
    ratio: 0.68,
    decision: 'REVIEW',
    mlScore: 58,
    lat: 28.0897,
    lng: -80.5672,
    comps: [
      { address: '745 Wavecrest Ave', price: 285000, sqft: 1450, dist: 0.2, lat: 28.0912, lng: -80.5658 },
      { address: '1021 S Miramar', price: 298000, sqft: 1520, dist: 0.3, lat: 28.0875, lng: -80.5695 },
      { address: '856 5th Ave', price: 305000, sqft: 1480, dist: 0.4, lat: 28.0885, lng: -80.5648 },
    ]
  }
];

// 13-Stage Pipeline with CMA
const PIPELINE_STAGES = [
  { id: 1, name: 'Discovery', icon: '🔍', desc: 'Scanning RealForeclose calendar' },
  { id: 2, name: 'BECA Scraping', icon: '📄', desc: 'Extracting Clerk records' },
  { id: 3, name: 'Title Search', icon: '📋', desc: 'Querying AcclaimWeb' },
  { id: 4, name: 'Lien Priority', icon: '⚖️', desc: 'Analyzing mortgage position' },
  { id: 5, name: 'Tax Certs', icon: '🏛️', desc: 'Checking RealTDM' },
  { id: 6, name: 'Demographics', icon: '📊', desc: 'Census API analysis' },
  { id: 7, name: 'CMA Analysis', icon: '🗺️', desc: 'Comparable sales heatmap' },
  { id: 8, name: 'ML Score', icon: '🤖', desc: 'XGBoost prediction' },
  { id: 9, name: 'Max Bid', icon: '💰', desc: 'Formula calculation' },
  { id: 10, name: 'Decision', icon: '✅', desc: 'BID/REVIEW/SKIP' },
  { id: 11, name: 'Report', icon: '📑', desc: 'DOCX generation' },
  { id: 12, name: 'Disposition', icon: '🎯', desc: 'Exit strategy' },
  { id: 13, name: 'Archive', icon: '💾', desc: 'Supabase storage' }
];

const fmt = n => '$' + n.toLocaleString();
const pct = n => (n * 100).toFixed(0) + '%';

// Mapbox Map Component
function MapboxCMA({ property, isActive }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!isActive || !property || !window.mapboxgl) return;

    // Initialize map
    if (!mapInstance.current) {
      mapInstance.current = new window.mapboxgl.Map({
        container: mapRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [property.lng, property.lat],
        zoom: 14,
        pitch: 45,
        bearing: -17.6,
        antialias: true
      });

      mapInstance.current.addControl(new window.mapboxgl.NavigationControl(), 'top-right');
    } else {
      mapInstance.current.flyTo({
        center: [property.lng, property.lat],
        zoom: 14,
        duration: 1500
      });
    }

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add subject property marker (red)
    const subjectEl = document.createElement('div');
    subjectEl.className = 'subject-marker';
    subjectEl.innerHTML = `
      <div style="
        width: 40px; height: 40px; background: #ef4444; border-radius: 50%;
        border: 4px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        display: flex; align-items: center; justify-content: center;
        font-size: 18px; animation: pulse 2s infinite;
      ">🏠</div>
    `;
    
    const subjectMarker = new window.mapboxgl.Marker(subjectEl)
      .setLngLat([property.lng, property.lat])
      .setPopup(new window.mapboxgl.Popup({ offset: 25 })
        .setHTML(`<div style="color:#000;font-weight:bold;">SUBJECT PROPERTY</div>
                  <div style="color:#333;">${property.address}</div>
                  <div style="color:#10b981;font-weight:bold;">ARV: ${fmt(property.arv)}</div>`))
      .addTo(mapInstance.current);
    markersRef.current.push(subjectMarker);

    // Add comparable markers (green)
    property.comps.forEach((comp, i) => {
      const compEl = document.createElement('div');
      compEl.innerHTML = `
        <div style="
          width: 32px; height: 32px; background: #10b981; border-radius: 50%;
          border: 3px solid #fff; box-shadow: 0 3px 8px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: bold; color: #fff;
        ">${i + 1}</div>
      `;

      const compMarker = new window.mapboxgl.Marker(compEl)
        .setLngLat([comp.lng, comp.lat])
        .setPopup(new window.mapboxgl.Popup({ offset: 25 })
          .setHTML(`<div style="color:#000;font-weight:bold;">COMP #${i + 1}</div>
                    <div style="color:#333;">${comp.address}</div>
                    <div style="color:#10b981;font-weight:bold;">${fmt(comp.price)}</div>
                    <div style="color:#666;">${comp.sqft} sqft • ${comp.dist} mi</div>`))
        .addTo(mapInstance.current);
      markersRef.current.push(compMarker);
    });

    // Add heatmap layer after map loads
    mapInstance.current.on('load', () => {
      if (mapInstance.current.getSource('comps-heat')) return;
      
      mapInstance.current.addSource('comps-heat', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            { type: 'Feature', geometry: { type: 'Point', coordinates: [property.lng, property.lat] }, properties: { weight: 1 } },
            ...property.comps.map(c => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [c.lng, c.lat] }, properties: { weight: 0.6 } }))
          ]
        }
      });

      mapInstance.current.addLayer({
        id: 'comps-heat',
        type: 'heatmap',
        source: 'comps-heat',
        paint: {
          'heatmap-weight': ['get', 'weight'],
          'heatmap-intensity': 1,
          'heatmap-radius': 50,
          'heatmap-opacity': 0.6,
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.2, 'rgba(16,185,129,0.3)',
            0.4, 'rgba(16,185,129,0.5)',
            0.6, 'rgba(251,191,36,0.6)',
            0.8, 'rgba(239,68,68,0.7)',
            1, 'rgba(239,68,68,0.9)'
          ]
        }
      }, 'waterway-label');
    });

  }, [property, isActive]);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
  );
}

export default function PipelineDemo() {
  const [stage, setStage] = useState(0);
  const [propIdx, setPropIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [completed, setCompleted] = useState([]);
  const [logs, setLogs] = useState([]);
  const [mapboxLoaded, setMapboxLoaded] = useState(false);

  const prop = DEMO_PROPERTIES[propIdx];
  const currentStage = PIPELINE_STAGES[stage];
  const isCMAStage = stage === 6;

  // Load Mapbox GL JS
  useEffect(() => {
    if (window.mapboxgl) {
      window.mapboxgl.accessToken = MAPBOX_TOKEN;
      setMapboxLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js';
    script.onload = () => {
      window.mapboxgl.accessToken = MAPBOX_TOKEN;
      setMapboxLoaded(true);
    };
    document.head.appendChild(script);

    const link = document.createElement('link');
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  // Auto-advance pipeline
  useEffect(() => {
    if (!playing) return;
    
    const duration = isCMAStage ? 4000 : 1500; // Longer pause on CMA stage
    
    const timer = setInterval(() => {
      setStage(s => {
        const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLogs(l => [...l.slice(-5), { time: now, stage: PIPELINE_STAGES[s]?.name || 'Init' }]);
        
        if (s + 1 >= PIPELINE_STAGES.length) {
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
    }, duration);

    return () => clearInterval(timer);
  }, [playing, prop, isCMAStage]);

  const colors = { 
    BID: { bg: '#065f46', border: '#10b981', text: '#34d399' }, 
    REVIEW: { bg: '#78350f', border: '#f59e0b', text: '#fbbf24' }, 
    SKIP: { bg: '#7f1d1d', border: '#ef4444', text: '#f87171' } 
  };
  const c = colors[prop.decision];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)', fontFamily: 'monospace', color: '#e2e8f0', padding: 16, position: 'relative' }}>
      {/* Grid background */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(16,185,129,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* Decision Overlay */}
      {showResult && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,6,23,0.95)' }}>
          <div style={{ padding: '40px 56px', borderRadius: 20, background: c.bg, border: `3px solid ${c.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: 64, fontWeight: 900, color: c.text }}>{prop.decision}</div>
            <div style={{ fontSize: 18, color: '#e2e8f0', marginTop: 12 }}>{prop.address}</div>
            <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 8 }}>Max Bid: {fmt(prop.maxBid)} • Ratio: {pct(prop.ratio)}</div>
          </div>
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>
              <span style={{ color: '#10b981' }}>Brevard</span>
              <span style={{ color: '#fff' }}>Bidder</span>
              <span style={{ color: '#10b981' }}>AI</span>
            </h1>
            <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 12 }}>Agentic AI Foreclosure Intelligence • V13.4.0</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: playing ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)', border: `1px solid ${playing ? '#10b981' : '#64748b'}`, borderRadius: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: playing ? '#10b981' : '#64748b', animation: playing ? 'pulse 1.5s infinite' : 'none' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: playing ? '#10b981' : '#64748b' }}>{playing ? 'PROCESSING' : 'PAUSED'}</span>
            </div>
            <button onClick={() => setPlaying(!playing)} style={{ padding: '8px 20px', background: '#10b981', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
              {playing ? '⏸ Pause' : '▶ Play'}
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 240px', gap: 16 }}>
          
          {/* Pipeline Stages */}
          <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid #334155', borderRadius: 12, padding: 12 }}>
            <h3 style={{ fontSize: 10, color: '#64748b', margin: '0 0 10px', letterSpacing: 1 }}>13-STAGE PIPELINE</h3>
            {PIPELINE_STAGES.map((s, i) => (
              <div key={s.id} style={{ 
                display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', marginBottom: 2, borderRadius: 4, 
                background: i === stage ? (i === 6 ? 'rgba(59,130,246,0.3)' : 'rgba(16,185,129,0.2)') : 'transparent', 
                border: i === stage ? `1px solid ${i === 6 ? '#3b82f6' : '#10b981'}` : '1px solid transparent', 
                opacity: i > stage ? 0.4 : 1 
              }}>
                <span style={{ fontSize: 11 }}>{i < stage ? '✓' : s.icon}</span>
                <span style={{ fontSize: 10, color: i === stage ? '#fff' : i < stage ? '#10b981' : '#64748b' }}>{s.name}</span>
                {i === stage && <span style={{ marginLeft: 'auto', width: 5, height: 5, background: i === 6 ? '#3b82f6' : '#10b981', borderRadius: '50%', animation: 'pulse 1s infinite' }} />}
              </div>
            ))}
          </div>

          {/* Center Content */}
          <div>
            {/* Property Card */}
            <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid #334155', borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>CASE #{prop.id}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 4 }}>{prop.address}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{prop.plaintiff}</div>
                </div>
                <div style={{ padding: '4px 12px', borderRadius: 16, background: c.bg, border: `1px solid ${c.border}`, color: c.text, fontSize: 11, fontWeight: 700, height: 'fit-content' }}>
                  {stage >= 9 ? prop.decision : '...'}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 16 }}>
                {[
                  { l: 'Judgment', v: fmt(prop.finalJudgment), s: true },
                  { l: 'ARV', v: fmt(prop.arv), s: stage >= 6, c: '#10b981' },
                  { l: 'Repairs', v: fmt(prop.repairs), s: stage >= 6, c: '#f59e0b' },
                  { l: 'Max Bid', v: fmt(prop.maxBid), s: stage >= 8, c: '#60a5fa' }
                ].map((x, i) => (
                  <div key={i} style={{ background: 'rgba(30,41,59,0.5)', borderRadius: 6, padding: 10 }}>
                    <div style={{ fontSize: 9, color: '#64748b' }}>{x.l}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: x.s ? (x.c || '#fff') : '#334155', marginTop: 2 }}>{x.s ? x.v : '---'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CMA Map or Terminal */}
            {isCMAStage && mapboxLoaded ? (
              <div style={{ background: 'rgba(15,23,42,0.9)', border: '2px solid #3b82f6', borderRadius: 12, overflow: 'hidden', height: 320 }}>
                <div style={{ background: '#1e3a8a', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>🗺️</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>CMA Heatmap - Comparable Sales Analysis</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 10 }}>
                    <span style={{ color: '#ef4444' }}>● Subject</span>
                    <span style={{ color: '#10b981' }}>● Comps</span>
                  </div>
                </div>
                <div style={{ height: 'calc(100% - 40px)' }}>
                  <MapboxCMA property={prop} isActive={isCMAStage} />
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid #334155', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ background: '#1e293b', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid #334155' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ marginLeft: 10, fontSize: 11, color: '#64748b' }}>brevard-bidder-ai</span>
                </div>
                <div style={{ padding: 14, minHeight: 200, fontSize: 12 }}>
                  <div style={{ color: '#10b981' }}>$ analyze "{prop.id}"</div>
                  <div style={{ color: '#334155', margin: '6px 0' }}>─────────────────────────</div>
                  <div style={{ color: '#94a3b8' }}><span style={{ color: '#f59e0b' }}>→</span> Stage {stage + 1}: {currentStage?.name}</div>
                  <div style={{ color: '#64748b', marginTop: 4 }}>{currentStage?.desc}</div>
                  {stage >= 6 && <div style={{ color: '#3b82f6', marginTop: 8 }}>✓ CMA: {prop.comps.length} comps found • Avg: {fmt(Math.round(prop.comps.reduce((a, c) => a + c.price, 0) / prop.comps.length))}</div>}
                  {stage >= 7 && <div style={{ color: '#60a5fa', marginTop: 4 }}>✓ ML Score: {prop.mlScore}%</div>}
                  {stage >= 9 && <div style={{ color: c.text, fontWeight: 700, marginTop: 4 }}>✓ {prop.decision} (Ratio: {pct(prop.ratio)})</div>}
                  <div style={{ marginTop: 12, color: '#334155' }}><span className="blink">█</span></div>
                </div>
              </div>
            )}

            {/* Comps Table (visible during/after CMA) */}
            {stage >= 6 && (
              <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid #334155', borderRadius: 12, padding: 12, marginTop: 12 }}>
                <h3 style={{ fontSize: 10, color: '#64748b', margin: '0 0 8px', letterSpacing: 1 }}>COMPARABLE SALES</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {prop.comps.map((comp, i) => (
                    <div key={i} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <span style={{ width: 20, height: 20, background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>{i + 1}</span>
                        <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>{fmt(comp.price)}</span>
                      </div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>{comp.address}</div>
                      <div style={{ fontSize: 9, color: '#64748b', marginTop: 4 }}>{comp.sqft} sqft • {comp.dist} mi</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Stats */}
            <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid #334155', borderRadius: 12, padding: 12 }}>
              <h3 style={{ fontSize: 10, color: '#64748b', margin: '0 0 10px', letterSpacing: 1 }}>SESSION STATS</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  { l: 'BID', v: completed.filter(p => p.decision === 'BID').length, c: '#10b981' },
                  { l: 'REVIEW', v: completed.filter(p => p.decision === 'REVIEW').length, c: '#f59e0b' },
                  { l: 'SKIP', v: completed.filter(p => p.decision === 'SKIP').length, c: '#ef4444' },
                  { l: 'TOTAL', v: completed.length, c: '#60a5fa' }
                ].map((x, i) => (
                  <div key={i} style={{ background: 'rgba(30,41,59,0.5)', borderRadius: 6, padding: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: x.c }}>{x.v}</div>
                    <div style={{ fontSize: 9, color: '#64748b' }}>{x.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Log */}
            <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid #334155', borderRadius: 12, padding: 12, flex: 1 }}>
              <h3 style={{ fontSize: 10, color: '#64748b', margin: '0 0 10px', letterSpacing: 1 }}>ACTIVITY LOG</h3>
              {logs.map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, padding: '4px 6px', background: 'rgba(30,41,59,0.3)', borderRadius: 3, marginBottom: 3 }}>
                  <span style={{ color: '#475569' }}>{l.time}</span>
                  <span style={{ color: '#10b981' }}>✓</span>
                  <span style={{ color: '#94a3b8' }}>{l.stage}</span>
                </div>
              ))}
            </div>

            {/* Data Sources */}
            <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid #334155', borderRadius: 12, padding: 12 }}>
              <h3 style={{ fontSize: 10, color: '#64748b', margin: '0 0 8px', letterSpacing: 1 }}>DATA SOURCES</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {['BECA', 'BCPAO', 'AcclaimWeb', 'RealTDM', 'Census', 'Mapbox'].map(src => (
                  <span key={src} style={{ padding: '3px 6px', background: src === 'Mapbox' ? 'rgba(59,130,246,0.2)' : 'rgba(16,185,129,0.1)', border: `1px solid ${src === 'Mapbox' ? 'rgba(59,130,246,0.4)' : 'rgba(16,185,129,0.3)'}`, borderRadius: 4, fontSize: 9, color: src === 'Mapbox' ? '#60a5fa' : '#10b981' }}>{src}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 16, color: '#475569', fontSize: 11 }}>
          Everest Capital of Brevard LLC • 10 hours → 10 minutes • 100x ROI
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .blink { animation: blink 1s infinite; }
        @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
      `}</style>
    </div>
  );
}
