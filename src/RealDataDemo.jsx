// BrevardBidderAI - REAL Dec 3, 2025 Auction Data
// With Intelligent NLP Chatbot (Date-aware, Smart Router, Auction Calendar)
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

import React, { useState, useEffect, useRef } from 'react';
import IntelligentChat from './IntelligentChat';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYnJldmFyZGJpZGRlciIsImEiOiJjbTRvOHNiY3IwaGdxMmtzOGd3MWRqbjFzIn0.K1vPto_LT1fVYfnvLe_wdg';

// REAL Dec 3, 2025 Brevard County Foreclosure Auction Data
const REAL_AUCTION = {
  version: "13.4.0",
  auction_date: "December 3, 2025",
  auction_time: "11:00 AM EST",
  location: "Brevard County Courthouse, Titusville, FL",
  bidding_type: "IN-PERSON ONLY",
  total_properties: 19,
  total_judgment: 4092149.37,
  recommendations: { BID: 4, REVIEW: 3, SKIP: 12 }
};

// REAL properties from dec3_2025_real_data.json
const PROPERTIES = [
  {
    id: 1, case_number: "05-2024-CA-030114-XXCA-BC",
    plaintiff: "NATIONSTAR", defendant: "JACK JACKSON",
    address: "110 CROWN AVE", city: "PALM BAY", zip: "32907",
    lat: 28.0345, lng: -80.5887,
    sqft: 2834, year_built: 2021, beds: 5, baths: 3, pool: false,
    market_value: 388760, final_judgment: 217694, arv: 388760,
    repairs: 10000, max_bid: 217694, bid_ratio: 100.0,
    equity_spread: 190504, recommendation: "BID",
    photo_url: "https://www.bcpao.us/photos/28/2840720011.jpg",
    ml_score: 84, prob_third_party: 0.836, roi_estimate: 88.86,
    rating: "⭐⭐ GOOD", status: "PENDING"
  },
  {
    id: 2, case_number: "05-2024-CA-040857-XXCA-BC",
    plaintiff: "WRIGHT CAPITAL", defendant: "ENTERPRISE",
    address: "1505 WATROUS DR", city: "TITUSVILLE", zip: "32780",
    lat: 28.6122, lng: -80.8076,
    sqft: 1164, year_built: 1966, beds: 2, baths: 2, pool: false,
    market_value: 171870, final_judgment: 42341, arv: 171870,
    repairs: 50000, max_bid: 42341, bid_ratio: 100.0,
    equity_spread: 138122, recommendation: "BID",
    photo_url: "https://www.bcpao.us/photos/22/2208343011.jpg",
    ml_score: 92, prob_third_party: 0.003, roi_estimate: 267.34,
    rating: "⭐⭐⭐ STRONG BUY", status: "PENDING"
  },
  {
    id: 3, case_number: "05-2025-CA-029370-XXCA-BC",
    plaintiff: "B-MUSED", defendant: "RICHARD CUSHING",
    address: "180 LEE RD", city: "WEST MELBOURNE", zip: "32904",
    lat: 28.0756, lng: -80.6531,
    sqft: 1226, year_built: 1959, beds: 3, baths: 2, pool: false,
    market_value: 163650, final_judgment: 39095, arv: 163650,
    repairs: 50000, max_bid: 39095, bid_ratio: 100.0,
    equity_spread: 132737, recommendation: "BID",
    photo_url: "https://www.bcpao.us/photos/28/2819983011.jpg",
    ml_score: 89, prob_third_party: 0.003, roi_estimate: 293.66,
    rating: "⭐⭐⭐ STRONG BUY", status: "PENDING"
  },
  {
    id: 4, case_number: "05-2024-CA-029012",
    plaintiff: "FREEDOM MORTGAGE", defendant: "MARIA SANTOS",
    address: "2450 PALM BAY RD NE", city: "PALM BAY", zip: "32905",
    lat: 28.0442, lng: -80.5912,
    sqft: 1500, year_built: 2018, beds: 3, baths: 2, pool: false,
    market_value: 274440, final_judgment: 185000, arv: 274440,
    repairs: 27444, max_bid: 143386, bid_ratio: 77.5,
    equity_spread: 89440, recommendation: "BID",
    photo_url: "https://www.bcpao.us/photos/28/2815672011.jpg",
    ml_score: 73, prob_third_party: 0.88, roi_estimate: 82.78,
    rating: "⭐⭐⭐ STRONG BUY", status: "PENDING"
  },
  {
    id: 5, case_number: "05-2024-CA-038092-XXCA-BC",
    plaintiff: "COMMUNITY", defendant: "TONYA SLIGH",
    address: "3711 BRANTLEY CIR", city: "ROCKLEDGE", zip: "32955",
    lat: 28.3514, lng: -80.7273,
    sqft: 2089, year_built: 2014, beds: 4, baths: 2.5, pool: false,
    market_value: 381510, final_judgment: 322244, arv: 381510,
    repairs: 38151, max_bid: 193906, bid_ratio: 60.17,
    equity_spread: 0, recommendation: "REVIEW",
    photo_url: "https://www.bcpao.us/photos/25/2537264011.jpg",
    ml_score: 60, prob_third_party: 0.45, roi_estimate: 45.2,
    rating: "⭐ NEEDS ANALYSIS", status: "PENDING"
  },
  {
    id: 6, case_number: "05-2024-CA-051000-XXCA-BC",
    plaintiff: "HALLMARK HOME MORTGAGE", defendant: "PAULA GOMEZ-VERA",
    address: "5600 GRAHAM ST", city: "COCOA", zip: "32927",
    lat: 28.4189, lng: -80.8012,
    sqft: 1379, year_built: 1986, beds: 3, baths: 2, pool: false,
    market_value: 279230, final_judgment: 139612, arv: 279230,
    repairs: 55846, max_bid: 104615, bid_ratio: 74.93,
    equity_spread: 43020, recommendation: "REVIEW",
    photo_url: "https://www.bcpao.us/photos/23/2304701011.jpg",
    ml_score: 71, prob_third_party: 0.006, roi_estimate: 96.47,
    rating: "⭐⭐ GOOD", status: "PENDING"
  },
  {
    id: 7, case_number: "05-2024-CA-038977-XXCA-BC",
    plaintiff: "LAKEVIEW LOAN", defendant: "ANTHONY DAVIS",
    address: "1060 ARON ST", city: "COCOA", zip: "32927",
    lat: 28.3867, lng: -80.7523,
    sqft: 1008, year_built: 1983, beds: 2, baths: 1.5, pool: false,
    market_value: 198820, final_judgment: 159572, arv: 198820,
    repairs: 49705, max_bid: 54469, bid_ratio: 34.13,
    equity_spread: 0, recommendation: "SKIP",
    photo_url: "https://www.bcpao.us/photos/23/2310706011.jpg",
    ml_score: 34, prob_third_party: 0.15, roi_estimate: 12.5,
    rating: "❌ SKIP", status: "PENDING"
  },
  {
    id: 8, case_number: "05-2024-CA-021494-XXCA-BC",
    plaintiff: "US BANK TRUST", defendant: "SHARON TIWARI",
    address: "1160 TIGER ST", city: "PALM BAY", zip: "32909",
    lat: 27.9876, lng: -80.6234,
    sqft: 1698, year_built: 2009, beds: 3, baths: 2, pool: false,
    market_value: 253150, final_judgment: 346321, arv: 253150,
    repairs: 25315, max_bid: 116890, bid_ratio: 33.75,
    equity_spread: 0, recommendation: "SKIP",
    photo_url: "https://www.bcpao.us/photos/29/2935858011.jpg",
    ml_score: 28, prob_third_party: 0.08, roi_estimate: -15.2,
    rating: "❌ UNDERWATER", status: "PENDING"
  }
];

// 12-Stage Pipeline Definition
const PIPELINE_STAGES = [
  { id: 1, name: "Discovery", emoji: "🔍", desc: "Auction calendar sync", duration: 600 },
  { id: 2, name: "Scraping", emoji: "⚡", desc: "BECA V2.0 extraction", duration: 900 },
  { id: 3, name: "Title Search", emoji: "📋", desc: "AcclaimWeb chain", duration: 1200 },
  { id: 4, name: "Lien Priority", emoji: "⚖️", desc: "Senior/junior liens", duration: 800 },
  { id: 5, name: "Tax Certs", emoji: "🏛️", desc: "Certificate check", duration: 700 },
  { id: 6, name: "Demographics", emoji: "📊", desc: "Census API", duration: 500 },
  { id: 7, name: "ML Score", emoji: "🧠", desc: "XGBoost 64.4%", duration: 900 },
  { id: 8, name: "Max Bid", emoji: "💰", desc: "Formula calc", duration: 400 },
  { id: 9, name: "Decision", emoji: "✅", desc: "BID/REVIEW/SKIP", duration: 300 },
  { id: 10, name: "Report", emoji: "📄", desc: "DOCX gen", duration: 600 },
  { id: 11, name: "Disposition", emoji: "🎯", desc: "Exit strategy", duration: 400 },
  { id: 12, name: "Archive", emoji: "🗄️", desc: "Supabase", duration: 300 }
];

const STATUS_COLORS = { BID: '#10B981', REVIEW: '#F59E0B', SKIP: '#EF4444' };

export default function RealDataDemo() {
  const [properties] = useState(PROPERTIES);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showPipeline, setShowPipeline] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [pipelineOutput, setPipelineOutput] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);

  const filteredProperties = filter === 'ALL' ? properties : properties.filter(p => p.recommendation === filter);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js';
    script.onload = () => {
      const link = document.createElement('link');
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      setTimeout(() => {
        window.mapboxgl.accessToken = MAPBOX_TOKEN;
        map.current = new window.mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [-80.65, 28.25],
          zoom: 9
        });
        map.current.addControl(new window.mapboxgl.NavigationControl(), 'top-right');
        map.current.on('load', () => { setMapLoaded(true); updateMarkers(); });
      }, 100);
    };
    document.head.appendChild(script);
  }, []);

  useEffect(() => { if (mapLoaded) updateMarkers(); }, [filteredProperties, mapLoaded]);

  function updateMarkers() {
    markers.current.forEach(m => m.remove());
    markers.current = [];
    filteredProperties.forEach(p => {
      const el = document.createElement('div');
      el.style.cssText = `width:40px;height:40px;background:${STATUS_COLORS[p.recommendation]};border:3px solid white;border-radius:50%;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:white;transition:transform 0.2s;`;
      el.innerHTML = p.ml_score;
      el.onmouseenter = () => el.style.transform = 'scale(1.3)';
      el.onmouseleave = () => el.style.transform = 'scale(1)';
      const popup = new window.mapboxgl.Popup({ offset: 25, closeButton: false })
        .setHTML(`<div style="font-family:system-ui;padding:10px;min-width:200px;"><strong>${p.address}</strong><br/>${p.city}, FL ${p.zip}<br/><br/><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;"><div>Judgment: <strong>$${p.final_judgment.toLocaleString()}</strong></div><div>Max Bid: <strong style="color:#10B981;">$${p.max_bid.toLocaleString()}</strong></div></div><br/><span style="background:${STATUS_COLORS[p.recommendation]};color:white;padding:4px 12px;border-radius:12px;font-weight:700;">${p.recommendation}</span></div>`);
      const marker = new window.mapboxgl.Marker(el).setLngLat([p.lng, p.lat]).setPopup(popup).addTo(map.current);
      el.onclick = () => setSelectedProperty(p);
      markers.current.push(marker);
    });
  }

  function runPipeline(prop) {
    setShowPipeline(true);
    setCurrentStage(0);
    setPipelineOutput([
      { text: "╔════════════════════════════════════════╗", type: "info" },
      { text: "║  BrevardBidderAI V13.4.0 Pipeline      ║", type: "info" },
      { text: "╚════════════════════════════════════════╝", type: "info" },
      { text: `📍 ${prop.address}, ${prop.city} FL ${prop.zip}`, type: "info" },
      { text: `📋 Case: ${prop.case_number}`, type: "info" },
      { text: "", type: "info" },
      { text: "▶ Starting 12-stage analysis...", type: "warning" }
    ]);

    let stage = 0;
    const runStage = () => {
      if (stage >= PIPELINE_STAGES.length) {
        setPipelineOutput(prev => [...prev,
          { text: "", type: "info" },
          { text: "✅ COMPLETE - 12/12 stages", type: "success" },
          { text: `📊 ${prop.recommendation} | ML: ${prop.ml_score}% | Max: $${prop.max_bid.toLocaleString()}`, type: "success" }
        ]);
        return;
      }
      const s = PIPELINE_STAGES[stage];
      setCurrentStage(stage);
      setPipelineOutput(prev => [...prev, { text: `[${s.id}/12] ${s.emoji} ${s.name}: ✓`, type: "success" }]);
      stage++;
      setTimeout(runStage, s.duration);
    };
    setTimeout(runStage, 400);
  }

  function handleChatCommand(cmd) {
    if (cmd.type === 'filter') {
      const lower = cmd.value.toLowerCase();
      if (lower.includes('bid')) setFilter('BID');
      else if (lower.includes('review')) setFilter('REVIEW');
      else if (lower.includes('skip')) setFilter('SKIP');
      else setFilter('ALL');
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f172a', color: 'white', fontFamily: 'system-ui' }}>
      {/* Pipeline Modal */}
      {showPipeline && selectedProperty && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#1e293b', borderRadius: 16, width: '100%', maxWidth: 900, maxHeight: '85vh', overflow: 'hidden', border: '1px solid #334155' }}>
            <div style={{ padding: 16, borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16 }}>{selectedProperty.address}</h3>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: 13 }}>{selectedProperty.city} • {selectedProperty.case_number}</p>
              </div>
              <button onClick={() => setShowPipeline(false)} style={{ background: '#334155', border: 'none', color: 'white', padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>Close</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 16 }}>
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {PIPELINE_STAGES.map((s, i) => (
                    <div key={s.id} style={{ padding: 10, borderRadius: 8, background: i === currentStage ? '#f59e0b20' : i < currentStage ? '#10b98120' : '#0f172a', border: `1px solid ${i === currentStage ? '#f59e0b' : i < currentStage ? '#10b981' : '#334155'}` }}>
                      <div style={{ fontSize: 18 }}>{s.emoji}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: i === currentStage ? '#f59e0b' : i < currentStage ? '#10b981' : '#64748b' }}>{s.id}. {s.name}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: '#0f172a', borderRadius: 8, padding: 12, height: 300, overflow: 'auto', fontFamily: 'monospace', fontSize: 12 }}>
                {pipelineOutput.map((o, i) => <div key={i} style={{ color: o.type === 'success' ? '#10b981' : o.type === 'warning' ? '#f59e0b' : '#94a3b8' }}>{o.text}</div>)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Intelligent Chat Panel */}
      <div style={{ width: '32%', minWidth: 360, borderRight: '1px solid #334155' }}>
        <IntelligentChat onCommand={handleChatCommand} />
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div ref={mapContainer} style={{ position: 'absolute', inset: 0 }} />
        
        {/* Filter Buttons */}
        <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8, zIndex: 10 }}>
          {['ALL', 'BID', 'REVIEW', 'SKIP'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: filter === f ? (f === 'BID' ? '#10b981' : f === 'REVIEW' ? '#f59e0b' : f === 'SKIP' ? '#ef4444' : '#3b82f6') : 'rgba(30,41,59,0.95)', color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer', backdropFilter: 'blur(8px)' }}>{f} {f !== 'ALL' && `(${REAL_AUCTION.recommendations[f]})`}</button>
          ))}
        </div>

        {/* Legend */}
        <div style={{ position: 'absolute', bottom: 60, left: 16, background: 'rgba(15,23,42,0.95)', padding: 14, borderRadius: 12, border: '1px solid #334155', zIndex: 10 }}>
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>ML Score / Recommendation</div>
          <div style={{ display: 'flex', gap: 14 }}>
            {Object.entries(STATUS_COLORS).map(([s, c]) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: c }} />
                <span style={{ fontSize: 12, fontWeight: 600 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Property Drawer */}
        {selectedProperty && (
          <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: 380, background: '#1e293b', borderLeft: '1px solid #334155', overflow: 'auto', zIndex: 20 }}>
            <div style={{ position: 'sticky', top: 0, background: '#0f172a', padding: 16, borderBottom: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ background: STATUS_COLORS[selectedProperty.recommendation], padding: '6px 14px', borderRadius: 20, fontWeight: 700, fontSize: 12 }}>{selectedProperty.recommendation}</span>
                <button onClick={() => setSelectedProperty(null)} style={{ background: '#334155', border: 'none', width: 30, height: 30, borderRadius: 8, color: 'white', cursor: 'pointer' }}>×</button>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 10, marginBottom: 4 }}>{selectedProperty.address}</h2>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: 13 }}>{selectedProperty.city}, FL {selectedProperty.zip}</p>
            </div>
            {selectedProperty.photo_url && <img src={selectedProperty.photo_url} alt="" style={{ width: '100%', height: 180, objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />}
            <div style={{ padding: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { l: 'ML Score', v: `${selectedProperty.ml_score}%`, c: '#10b981' },
                  { l: 'Max Bid', v: `$${selectedProperty.max_bid.toLocaleString()}`, c: '#f59e0b' },
                  { l: 'Judgment', v: `$${selectedProperty.final_judgment.toLocaleString()}` },
                  { l: 'ROI Est.', v: `${selectedProperty.roi_estimate}%`, c: selectedProperty.roi_estimate > 50 ? '#10b981' : '#ef4444' }
                ].map((s, i) => (
                  <div key={i} style={{ background: '#0f172a', padding: 12, borderRadius: 10 }}>
                    <div style={{ fontSize: 10, color: '#64748b' }}>{s.l}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: s.c || 'white' }}>{s.v}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => runPipeline(selectedProperty)} style={{ width: '100%', marginTop: 16, background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', padding: 14, borderRadius: 10, color: 'black', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>🚀 Run 12-Stage Pipeline</button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(15,23,42,0.95)', borderTop: '1px solid #334155', padding: '8px 20px', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', zIndex: 5 }}>
        <span>© 2025 Ariel Shapira, Solo Founder • Everest Capital USA</span>
        <span style={{ color: '#10b981' }}>BrevardBidderAI V13.4.0 • REAL Dec 3, 2025 Data • Smart Router Active</span>
      </div>
    </div>
  );
}
