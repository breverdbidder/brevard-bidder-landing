// BrevardBidderAI Agentic UI - PropertyOnion Style Applied
// Design system extracted from PropertyOnion.com
// Author: Ariel Shapira, Everest Capital USA

import React, { useState, useEffect, useRef } from 'react';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYnJldmFyZGJpZGRlciIsImEiOiJjbTRvOHNiY3IwaGdxMmtzOGd3MWRqbjFzIn0.K1vPto_LT1fVYfnvLe_wdg';

// PropertyOnion Color Scheme
const COLORS = {
  primary: '#FF6B35',      // PO Orange
  primaryDark: '#E85D2A',
  secondary: '#1A2B4C',    // PO Dark Blue
  success: '#10B981',      // 3rd Party Win / BID
  warning: '#F59E0B',      // Plaintiff / REVIEW
  danger: '#EF4444',       // Cancelled / SKIP
  background: '#0F172A',   // Dark mode base
  surface: '#1E293B',      // Elevated surface
  border: '#334155',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
};

const STATUS_COLORS = {
  BID: COLORS.success,
  REVIEW: COLORS.warning,
  SKIP: COLORS.danger,
};

// Brevard County Properties - Dec 17, 2024
const PROPERTIES = [
  { id: 1, address: '1425 S Orlando Ave', city: 'Cocoa Beach', zip: '32931', latitude: 28.3200, longitude: -80.6100, case_number: '05-2024-CA-028456', recommendation: 'BID', ml_score: 89, max_bid: 245000, judgment_amount: 312000, arv: 425000, repairs: 45000, beds: 3, baths: 2, sqft: 1850, sale_date: 'Dec 17, 2024', plaintiff: 'Wells Fargo Bank', photo: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400' },
  { id: 2, address: '2847 Otter Creek Dr', city: 'Melbourne', zip: '32940', latitude: 28.1489, longitude: -80.6658, case_number: '05-2024-CA-031245', recommendation: 'BID', ml_score: 84, max_bid: 198000, judgment_amount: 256000, arv: 340000, repairs: 35000, beds: 4, baths: 2, sqft: 2100, sale_date: 'Dec 17, 2024', plaintiff: 'JPMorgan Chase', photo: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400' },
  { id: 3, address: '445 Jackson Ave', city: 'Satellite Beach', zip: '32937', latitude: 28.1761, longitude: -80.5901, case_number: '05-2024-CA-029876', recommendation: 'BID', ml_score: 91, max_bid: 312000, judgment_amount: 398000, arv: 520000, repairs: 42000, beds: 4, baths: 3, sqft: 2400, sale_date: 'Dec 17, 2024', plaintiff: 'Bank of America', photo: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400' },
  { id: 4, address: '1089 Palm Bay Rd NE', city: 'Palm Bay', zip: '32905', latitude: 28.0345, longitude: -80.5887, case_number: '05-2024-CA-027654', recommendation: 'REVIEW', ml_score: 67, max_bid: 125000, judgment_amount: 189000, arv: 245000, repairs: 55000, beds: 3, baths: 2, sqft: 1600, sale_date: 'Dec 17, 2024', plaintiff: 'Nationstar', photo: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400' },
  { id: 5, address: '3421 Suntree Blvd', city: 'Melbourne', zip: '32940', latitude: 28.2156, longitude: -80.6712, case_number: '05-2024-CA-030123', recommendation: 'REVIEW', ml_score: 62, max_bid: 178000, judgment_amount: 267000, arv: 315000, repairs: 48000, beds: 3, baths: 2, sqft: 1750, sale_date: 'Dec 17, 2024', plaintiff: 'US Bank', photo: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=400' },
  { id: 6, address: '892 Banana River Dr', city: 'Merritt Island', zip: '32953', latitude: 28.3584, longitude: -80.6823, case_number: '05-2024-CA-028901', recommendation: 'BID', ml_score: 86, max_bid: 267000, judgment_amount: 345000, arv: 465000, repairs: 52000, beds: 4, baths: 3, sqft: 2350, sale_date: 'Dec 17, 2024', plaintiff: 'Rocket Mortgage', photo: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400' },
  { id: 7, address: '2156 Aurora Rd', city: 'Melbourne', zip: '32935', latitude: 28.1234, longitude: -80.6456, case_number: '05-2024-CA-032456', recommendation: 'SKIP', ml_score: 34, max_bid: 45000, judgment_amount: 210000, arv: 180000, repairs: 95000, beds: 2, baths: 1, sqft: 1100, sale_date: 'Dec 17, 2024', plaintiff: 'Wilmington Trust', senior_lien_survives: true, photo: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400' },
  { id: 8, address: '567 N Courtenay Pkwy', city: 'Merritt Island', zip: '32953', latitude: 28.3789, longitude: -80.6945, case_number: '05-2024-CA-029234', recommendation: 'REVIEW', ml_score: 58, max_bid: 156000, judgment_amount: 245000, arv: 289000, repairs: 62000, beds: 3, baths: 2, sqft: 1550, sale_date: 'Dec 17, 2024', plaintiff: 'PennyMac', photo: 'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=400' },
  { id: 9, address: '1234 S Tropical Trl', city: 'Merritt Island', zip: '32952', latitude: 28.3156, longitude: -80.6567, case_number: '05-2024-CA-031567', recommendation: 'BID', ml_score: 78, max_bid: 189000, judgment_amount: 245000, arv: 325000, repairs: 38000, beds: 3, baths: 2, sqft: 1800, sale_date: 'Dec 17, 2024', plaintiff: 'Freedom Mortgage', photo: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400' },
  { id: 10, address: '789 E Strawbridge Ave', city: 'Melbourne', zip: '32901', latitude: 28.0836, longitude: -80.6081, case_number: '05-2024-CA-027890', recommendation: 'SKIP', ml_score: 28, max_bid: 67000, judgment_amount: 312000, arv: 195000, repairs: 110000, beds: 3, baths: 1, sqft: 1200, sale_date: 'Dec 17, 2024', plaintiff: 'Deutsche Bank', senior_lien_survives: true, photo: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=400' },
  { id: 11, address: '3456 N Wickham Rd', city: 'Melbourne', zip: '32935', latitude: 28.1567, longitude: -80.6234, case_number: '05-2024-CA-030567', recommendation: 'REVIEW', ml_score: 71, max_bid: 145000, judgment_amount: 198000, arv: 265000, repairs: 45000, beds: 3, baths: 2, sqft: 1650, sale_date: 'Dec 17, 2024', plaintiff: 'Caliber Home', photo: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=400' },
  { id: 12, address: '2098 Pineda Cswy', city: 'Merritt Island', zip: '32952', latitude: 28.2876, longitude: -80.6789, case_number: '05-2024-CA-028567', recommendation: 'BID', ml_score: 82, max_bid: 234000, judgment_amount: 298000, arv: 398000, repairs: 35000, beds: 4, baths: 2, sqft: 2050, sale_date: 'Dec 17, 2024', plaintiff: 'Carrington', photo: 'https://images.unsplash.com/photo-1592595896616-c37162298647?w=400' },
];

const PROMPTS = ["Show BID", "ML > 80", "Heatmap", "High ARV", "Reset"];

export default function AgenticDemo() {
  const [properties] = useState(PROPERTIES);
  const [filtered, setFiltered] = useState(PROPERTIES);
  const [selected, setSelected] = useState(null);
  const [heatmap, setHeatmap] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `🏠 **BrevardBidderAI** | Dec 17 Auction\n\n${PROPERTIES.length} properties loaded\n• ${PROPERTIES.filter(p=>p.recommendation==='BID').length} BID\n• ${PROPERTIES.filter(p=>p.recommendation==='REVIEW').length} REVIEW\n• ${PROPERTIES.filter(p=>p.recommendation==='SKIP').length} SKIP` }
  ]);
  const [input, setInput] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  // Load Mapbox
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js';
    script.onload = () => {
      const link = document.createElement('link');
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      setTimeout(() => {
        window.mapboxgl.accessToken = MAPBOX_TOKEN;
        mapInstance.current = new window.mapboxgl.Map({
          container: mapRef.current,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [-80.67, 28.25],
          zoom: 9.5,
        });
        mapInstance.current.addControl(new window.mapboxgl.NavigationControl(), 'top-right');
        mapInstance.current.on('load', () => {
          setMapReady(true);
          // Heatmap source
          mapInstance.current.addSource('heat', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: properties.map(p => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [p.longitude, p.latitude] }, properties: { score: p.ml_score } })) }
          });
          mapInstance.current.addLayer({
            id: 'heatmap-layer',
            type: 'heatmap',
            source: 'heat',
            layout: { visibility: 'none' },
            paint: {
              'heatmap-weight': ['interpolate', ['linear'], ['get', 'score'], 0, 0, 100, 1],
              'heatmap-intensity': 1.5,
              'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'], 0, 'transparent', 0.2, '#1A2B4C', 0.4, '#FF6B35', 0.6, '#F59E0B', 0.8, '#10B981', 1, '#FEF3C7'],
              'heatmap-radius': 30,
              'heatmap-opacity': 0.8
            }
          });
          updateMarkers(filtered);
        });
      }, 100);
    };
    document.head.appendChild(script);
  }, []);

  useEffect(() => { if (mapReady) updateMarkers(filtered); }, [filtered, mapReady]);
  useEffect(() => {
    if (mapInstance.current && mapReady) {
      mapInstance.current.setLayoutProperty('heatmap-layer', 'visibility', heatmap ? 'visible' : 'none');
      markersRef.current.forEach(m => m.getElement().style.opacity = heatmap ? '0.4' : '1');
    }
  }, [heatmap, mapReady]);

  function updateMarkers(props) {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    props.forEach(p => {
      const el = document.createElement('div');
      const color = STATUS_COLORS[p.recommendation];
      el.style.cssText = `width:36px;height:36px;background:${color};border:3px solid white;border-radius:50%;cursor:pointer;box-shadow:0 3px 12px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:white;transition:transform 0.2s;`;
      el.innerHTML = p.ml_score;
      el.onmouseenter = () => el.style.transform = 'scale(1.25)';
      el.onmouseleave = () => el.style.transform = 'scale(1)';
      
      // PropertyOnion style popup
      const popup = new window.mapboxgl.Popup({ offset: 25, closeButton: false, maxWidth: '300px' }).setHTML(`
        <div style="font-family:system-ui;padding:0;">
          <img src="${p.photo}" style="width:100%;height:120px;object-fit:cover;border-radius:8px 8px 0 0;"/>
          <div style="padding:12px;">
            <div style="display:flex;justify-content:space-between;align-items:start;">
              <div>
                <div style="font-weight:700;font-size:15px;">${p.address}</div>
                <div style="color:#666;font-size:13px;">${p.city}, FL ${p.zip}</div>
              </div>
              <div style="background:linear-gradient(135deg,${color},${color}dd);color:white;padding:4px 10px;border-radius:4px;font-size:11px;font-weight:600;">${p.recommendation}</div>
            </div>
            <div style="display:flex;gap:16px;margin-top:12px;font-size:13px;color:#444;">
              <span><strong>${p.beds}</strong> bd</span>
              <span><strong>${p.baths}</strong> ba</span>
              <span><strong>${p.sqft?.toLocaleString()}</strong> sqft</span>
            </div>
            <div style="margin-top:12px;padding-top:12px;border-top:1px solid #eee;display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;">
              <div><span style="color:#888;">Max Bid:</span> <strong>$${p.max_bid.toLocaleString()}</strong></div>
              <div><span style="color:#888;">ML Score:</span> <strong style="color:${color};">${p.ml_score}</strong></div>
            </div>
          </div>
        </div>
      `);
      
      const marker = new window.mapboxgl.Marker(el).setLngLat([p.longitude, p.latitude]).setPopup(popup).addTo(mapInstance.current);
      el.onclick = () => setSelected(p);
      markersRef.current.push(marker);
    });
  }

  function addMsg(role, content) { setMessages(prev => [...prev, { role, content }]); }

  function handleCmd(cmd) {
    addMsg('user', cmd);
    const c = cmd.toLowerCase();
    setTimeout(() => {
      if (c.includes('bid') && !c.includes('max')) {
        const b = properties.filter(p => p.recommendation === 'BID');
        setFiltered(b);
        addMsg('assistant', `✅ ${b.length} BID properties\nTotal equity: $${b.reduce((s,p)=>s+(p.arv-p.max_bid-p.repairs),0).toLocaleString()}`);
        fitBounds(b);
      } else if (c.includes('review')) {
        const r = properties.filter(p => p.recommendation === 'REVIEW');
        setFiltered(r);
        addMsg('assistant', `🔍 ${r.length} REVIEW - need due diligence`);
        fitBounds(r);
      } else if (c.includes('skip')) {
        const s = properties.filter(p => p.recommendation === 'SKIP');
        setFiltered(s);
        addMsg('assistant', `⛔ ${s.length} SKIP - ${s.filter(p=>p.senior_lien_survives).length} have surviving liens`);
        fitBounds(s);
      } else if (c.includes('ml') || c.includes('score') || c.includes('80')) {
        const t = parseInt(cmd.match(/\d+/)?.[0]) || 80;
        const h = properties.filter(p => p.ml_score >= t);
        setFiltered(h);
        addMsg('assistant', `📊 ${h.length} properties with ML ≥ ${t}`);
        fitBounds(h);
      } else if (c.includes('heat')) {
        setHeatmap(!heatmap);
        addMsg('assistant', heatmap ? '🗺️ Heatmap off' : '🔥 Heatmap on - yellow = high ML density');
      } else if (c.includes('arv') || c.includes('value') || c.includes('high')) {
        const v = properties.filter(p => p.arv >= 350000);
        setFiltered(v);
        addMsg('assistant', `💰 ${v.length} high-value (ARV ≥ $350K)`);
        fitBounds(v);
      } else if (c.includes('reset') || c.includes('all')) {
        setFiltered(properties);
        setHeatmap(false);
        addMsg('assistant', `🔄 Reset - ${properties.length} properties`);
        mapInstance.current?.flyTo({ center: [-80.67, 28.25], zoom: 9.5 });
      } else {
        addMsg('assistant', `Commands:\n• "Show BID/REVIEW/SKIP"\n• "ML > 80"\n• "Toggle heatmap"\n• "High ARV"\n• "Reset"`);
      }
    }, 200);
  }

  function fitBounds(props) {
    if (!mapInstance.current || !props.length) return;
    if (props.length === 1) {
      mapInstance.current.flyTo({ center: [props[0].longitude, props[0].latitude], zoom: 14 });
    } else {
      const bounds = new window.mapboxgl.LngLatBounds();
      props.forEach(p => bounds.extend([p.longitude, p.latitude]));
      mapInstance.current.fitBounds(bounds, { padding: 60 });
    }
  }

  return (
    <div className="flex h-screen text-white overflow-hidden" style={{ background: COLORS.background }}>
      {/* Chat - PropertyOnion inspired sidebar */}
      <div className="w-[340px] flex flex-col border-r" style={{ borderColor: COLORS.border, background: COLORS.surface }}>
        {/* Header with gradient */}
        <div className="p-4 border-b" style={{ borderColor: COLORS.border, background: `linear-gradient(135deg, ${COLORS.primary}15, ${COLORS.secondary}30)` }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl" style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})` }}>BB</div>
            <div>
              <h1 className="font-bold text-lg">BrevardBidderAI</h1>
              <p className="text-xs" style={{ color: COLORS.primary }}>12-Stage Pipeline • Mapbox</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[90%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap" style={{ background: m.role === 'user' ? COLORS.primary : COLORS.background }}>
                {m.content}
              </div>
            </div>
          ))}
        </div>

        {/* Quick prompts */}
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {PROMPTS.map((p, i) => (
            <button key={i} onClick={() => setInput(p)} className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105" style={{ background: COLORS.background, border: `1px solid ${COLORS.border}` }}>{p}</button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t" style={{ borderColor: COLORS.border }}>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && input.trim() && (handleCmd(input), setInput(''))}
              placeholder="Ask about auctions..."
              className="flex-1 rounded-xl px-4 py-3 text-sm focus:outline-none"
              style={{ background: COLORS.background, border: `1px solid ${COLORS.border}` }}
            />
            <button onClick={() => input.trim() && (handleCmd(input), setInput(''))} className="px-5 py-3 rounded-xl font-semibold transition-all hover:scale-105" style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})` }}>→</button>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="absolute inset-0" />
        
        {/* Controls - PropertyOnion style */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <button onClick={() => { setHeatmap(!heatmap); }} className="px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg transition-all" style={{ background: heatmap ? COLORS.primary : COLORS.surface, border: `1px solid ${heatmap ? COLORS.primary : COLORS.border}` }}>
            {heatmap ? '🔥 Heatmap ON' : '🗺️ Heatmap'}
          </button>
          <button onClick={() => { setFiltered(properties); setHeatmap(false); mapInstance.current?.flyTo({ center: [-80.67, 28.25], zoom: 9.5 }); }} className="px-4 py-2.5 rounded-lg text-sm shadow-lg" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>🔄 Reset</button>
        </div>

        {/* Legend - PropertyOnion table style */}
        <div className="absolute bottom-6 left-4 p-4 rounded-xl shadow-xl z-10" style={{ background: `${COLORS.surface}f0`, backdropFilter: 'blur(8px)', border: `1px solid ${COLORS.border}` }}>
          <div className="text-xs font-medium mb-2" style={{ color: COLORS.textMuted }}>RECOMMENDATION</div>
          <div className="flex gap-4">
            {Object.entries(STATUS_COLORS).map(([s, c]) => (
              <div key={s} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full shadow" style={{ background: c }} />
                <span className="text-sm font-medium">{s}</span>
              </div>
            ))}
          </div>
          <div className="text-xs mt-3 font-medium" style={{ color: COLORS.primary }}>{filtered.length} of {properties.length} properties</div>
        </div>

        {/* Property Drawer - PropertyOnion card style */}
        {selected && (
          <div className="absolute right-0 top-0 h-full w-[400px] overflow-y-auto z-20 shadow-2xl animate-in slide-in-from-right" style={{ background: COLORS.surface, borderLeft: `1px solid ${COLORS.border}` }}>
            {/* Hero Image */}
            <div className="relative">
              <img src={selected.photo} alt="" className="w-full h-48 object-cover" />
              <div className="absolute top-3 left-3 px-3 py-1.5 rounded-md text-xs font-bold uppercase" style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})` }}>
                Foreclosure Auction
              </div>
              <button onClick={() => setSelected(null)} className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: 'rgba(0,0,0,0.5)' }}>✕</button>
              <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-md text-sm font-bold" style={{ background: STATUS_COLORS[selected.recommendation] }}>
                {selected.recommendation}
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h2 className="text-xl font-bold">{selected.address}</h2>
              <p style={{ color: COLORS.textSecondary }}>{selected.city}, FL {selected.zip}</p>
              
              {/* Specs row - PropertyOnion style */}
              <div className="flex gap-6 mt-4 py-3 border-y" style={{ borderColor: COLORS.border }}>
                <div className="text-center">
                  <div className="text-2xl font-bold">{selected.beds}</div>
                  <div className="text-xs" style={{ color: COLORS.textMuted }}>Beds</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{selected.baths}</div>
                  <div className="text-xs" style={{ color: COLORS.textMuted }}>Baths</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{selected.sqft?.toLocaleString()}</div>
                  <div className="text-xs" style={{ color: COLORS.textMuted }}>Sqft</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: STATUS_COLORS[selected.recommendation] }}>{selected.ml_score}</div>
                  <div className="text-xs" style={{ color: COLORS.textMuted }}>ML Score</div>
                </div>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-4 rounded-xl" style={{ background: COLORS.background }}>
                  <div className="text-xs" style={{ color: COLORS.textMuted }}>Max Bid</div>
                  <div className="text-xl font-bold">${selected.max_bid.toLocaleString()}</div>
                </div>
                <div className="p-4 rounded-xl" style={{ background: COLORS.background }}>
                  <div className="text-xs" style={{ color: COLORS.textMuted }}>Judgment</div>
                  <div className="text-xl font-bold">${selected.judgment_amount.toLocaleString()}</div>
                </div>
                <div className="p-4 rounded-xl" style={{ background: COLORS.background }}>
                  <div className="text-xs" style={{ color: COLORS.textMuted }}>ARV</div>
                  <div className="text-xl font-bold" style={{ color: '#3B82F6' }}>${selected.arv.toLocaleString()}</div>
                </div>
                <div className="p-4 rounded-xl" style={{ background: COLORS.background }}>
                  <div className="text-xs" style={{ color: COLORS.textMuted }}>Est. Profit</div>
                  <div className="text-xl font-bold" style={{ color: COLORS.success }}>${(selected.arv - selected.max_bid - selected.repairs).toLocaleString()}</div>
                </div>
              </div>

              {/* Warning if applicable */}
              {selected.senior_lien_survives && (
                <div className="mt-4 p-4 rounded-xl" style={{ background: `${COLORS.danger}20`, border: `1px solid ${COLORS.danger}40` }}>
                  <div className="font-bold" style={{ color: COLORS.danger }}>⚠️ Senior Lien Warning</div>
                  <div className="text-sm mt-1" style={{ color: COLORS.danger }}>Liens survive this foreclosure. You inherit the debt.</div>
                </div>
              )}

              {/* Auction info */}
              <div className="mt-4 p-4 rounded-xl" style={{ background: COLORS.background }}>
                <div className="text-xs" style={{ color: COLORS.textMuted }}>AUCTION DETAILS</div>
                <div className="mt-2 space-y-1 text-sm">
                  <div><span style={{ color: COLORS.textMuted }}>Date:</span> {selected.sale_date}</div>
                  <div><span style={{ color: COLORS.textMuted }}>Plaintiff:</span> {selected.plaintiff}</div>
                  <div><span style={{ color: COLORS.textMuted }}>Case:</span> {selected.case_number}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 space-y-2">
                <button className="w-full py-3 rounded-xl font-semibold transition-all hover:scale-[1.02]" style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})` }}>
                  📄 Generate Report
                </button>
                <button onClick={() => addMsg('assistant', `**${selected.address}**\nML: ${selected.ml_score} | Max Bid: $${selected.max_bid.toLocaleString()}\nProfit: $${(selected.arv-selected.max_bid-selected.repairs).toLocaleString()}`)} className="w-full py-3 rounded-xl font-medium transition-all" style={{ background: COLORS.background, border: `1px solid ${COLORS.border}` }}>
                  💬 Analyze in Chat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-2 flex justify-between items-center text-xs z-10" style={{ background: `${COLORS.surface}e0`, backdropFilter: 'blur(8px)', borderTop: `1px solid ${COLORS.border}` }}>
        <span style={{ color: COLORS.textMuted }}>© 2025 Ariel Shapira, Everest Capital USA</span>
        <span style={{ color: COLORS.primary }}>BrevardBidderAI V14.4.0 • PropertyOnion Design</span>
      </div>
    </div>
  );
}
