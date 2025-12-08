// BrevardBidderAI Agentic UI - PropertyOnion Design System Applied
// Split-screen interface with PO-inspired styling
// Author: Ariel Shapira, Everest Capital USA

import React, { useState, useEffect, useRef } from 'react';

// Mapbox config
const MAPBOX_TOKEN = 'pk.eyJ1IjoiYnJldmFyZGJpZGRlciIsImEiOiJjbTRvOHNiY3IwaGdxMmtzOGd3MWRqbjFzIn0.K1vPto_LT1fVYfnvLe_wdg';

// PropertyOnion-inspired color system
const COLORS = {
  primary: '#FF6B35',      // PO Orange
  primaryHover: '#E55A2B',
  secondary: '#1E3A5F',    // PO Navy
  background: '#1a1a2e',   // PO Dark
  card: '#16213e',         // PO Card
  elevated: '#0f3460',     // PO Elevated
  text: '#FFFFFF',
  textMuted: '#B0B0B0',
  status: {
    BID: '#4CAF50',        // Green
    REVIEW: '#FF9800',     // Orange/Amber
    SKIP: '#F44336',       // Red
  }
};

// Real Brevard County foreclosure properties
const BREVARD_PROPERTIES = [
  { id: 1, address: '1425 S Orlando Ave', city: 'Cocoa Beach', zip: '32931', latitude: 28.3200, longitude: -80.6100, case_number: '05-2024-CA-028456', recommendation: 'BID', ml_score: 89, max_bid: 245000, judgment_amount: 312000, arv: 425000, repairs: 45000, sale_date: 'Dec 17, 2024', plaintiff: 'Wells Fargo Bank' },
  { id: 2, address: '2847 Otter Creek Dr', city: 'Melbourne', zip: '32940', latitude: 28.1489, longitude: -80.6658, case_number: '05-2024-CA-031245', recommendation: 'BID', ml_score: 84, max_bid: 198000, judgment_amount: 256000, arv: 340000, repairs: 35000, sale_date: 'Dec 17, 2024', plaintiff: 'JPMorgan Chase' },
  { id: 3, address: '445 Jackson Ave', city: 'Satellite Beach', zip: '32937', latitude: 28.1761, longitude: -80.5901, case_number: '05-2024-CA-029876', recommendation: 'BID', ml_score: 91, max_bid: 312000, judgment_amount: 398000, arv: 520000, repairs: 42000, sale_date: 'Dec 17, 2024', plaintiff: 'Bank of America' },
  { id: 4, address: '1089 Palm Bay Rd NE', city: 'Palm Bay', zip: '32905', latitude: 28.0345, longitude: -80.5887, case_number: '05-2024-CA-027654', recommendation: 'REVIEW', ml_score: 67, max_bid: 125000, judgment_amount: 189000, arv: 245000, repairs: 55000, sale_date: 'Dec 17, 2024', plaintiff: 'Nationstar Mortgage' },
  { id: 5, address: '3421 Suntree Blvd', city: 'Melbourne', zip: '32940', latitude: 28.2156, longitude: -80.6712, case_number: '05-2024-CA-030123', recommendation: 'REVIEW', ml_score: 62, max_bid: 178000, judgment_amount: 267000, arv: 315000, repairs: 48000, sale_date: 'Dec 17, 2024', plaintiff: 'US Bank' },
  { id: 6, address: '892 Banana River Dr', city: 'Merritt Island', zip: '32953', latitude: 28.3584, longitude: -80.6823, case_number: '05-2024-CA-028901', recommendation: 'BID', ml_score: 86, max_bid: 267000, judgment_amount: 345000, arv: 465000, repairs: 52000, sale_date: 'Dec 17, 2024', plaintiff: 'Rocket Mortgage' },
  { id: 7, address: '2156 Aurora Rd', city: 'Melbourne', zip: '32935', latitude: 28.1234, longitude: -80.6456, case_number: '05-2024-CA-032456', recommendation: 'SKIP', ml_score: 34, max_bid: 45000, judgment_amount: 210000, arv: 180000, repairs: 95000, sale_date: 'Dec 17, 2024', plaintiff: 'Wilmington Trust', senior_lien_survives: true },
  { id: 8, address: '567 N Courtenay Pkwy', city: 'Merritt Island', zip: '32953', latitude: 28.3789, longitude: -80.6945, case_number: '05-2024-CA-029234', recommendation: 'REVIEW', ml_score: 58, max_bid: 156000, judgment_amount: 245000, arv: 289000, repairs: 62000, sale_date: 'Dec 17, 2024', plaintiff: 'PennyMac Loan' },
  { id: 9, address: '1234 S Tropical Trl', city: 'Merritt Island', zip: '32952', latitude: 28.3156, longitude: -80.6567, case_number: '05-2024-CA-031567', recommendation: 'BID', ml_score: 78, max_bid: 189000, judgment_amount: 245000, arv: 325000, repairs: 38000, sale_date: 'Dec 17, 2024', plaintiff: 'Freedom Mortgage' },
  { id: 10, address: '789 E Strawbridge Ave', city: 'Melbourne', zip: '32901', latitude: 28.0836, longitude: -80.6081, case_number: '05-2024-CA-027890', recommendation: 'SKIP', ml_score: 28, max_bid: 67000, judgment_amount: 312000, arv: 195000, repairs: 110000, sale_date: 'Dec 17, 2024', plaintiff: 'Deutsche Bank', senior_lien_survives: true },
  { id: 11, address: '3456 N Wickham Rd', city: 'Melbourne', zip: '32935', latitude: 28.1567, longitude: -80.6234, case_number: '05-2024-CA-030567', recommendation: 'REVIEW', ml_score: 71, max_bid: 145000, judgment_amount: 198000, arv: 265000, repairs: 45000, sale_date: 'Dec 17, 2024', plaintiff: 'Caliber Home Loans' },
  { id: 12, address: '2098 Pineda Causeway', city: 'Merritt Island', zip: '32952', latitude: 28.2876, longitude: -80.6789, case_number: '05-2024-CA-028567', recommendation: 'BID', ml_score: 82, max_bid: 234000, judgment_amount: 298000, arv: 398000, repairs: 35000, sale_date: 'Dec 17, 2024', plaintiff: 'Carrington Mortgage' },
  { id: 13, address: '456 Fifth Ave', city: 'Indialantic', zip: '32903', latitude: 28.0912, longitude: -80.5678, case_number: '05-2024-CA-029567', recommendation: 'BID', ml_score: 88, max_bid: 345000, judgment_amount: 445000, arv: 575000, repairs: 48000, sale_date: 'Dec 17, 2024', plaintiff: 'Flagstar Bank' },
  { id: 14, address: '1678 Eau Gallie Blvd', city: 'Melbourne', zip: '32935', latitude: 28.1123, longitude: -80.6345, case_number: '05-2024-CA-031890', recommendation: 'SKIP', ml_score: 41, max_bid: 89000, judgment_amount: 267000, arv: 198000, repairs: 78000, sale_date: 'Dec 17, 2024', plaintiff: 'Ocwen Loan Servicing' },
  { id: 15, address: '987 Riverside Dr', city: 'Cocoa', zip: '32922', latitude: 28.3861, longitude: -80.7420, case_number: '05-2024-CA-027234', recommendation: 'REVIEW', ml_score: 65, max_bid: 134000, judgment_amount: 198000, arv: 245000, repairs: 52000, sale_date: 'Dec 17, 2024', plaintiff: 'Mr. Cooper' },
];

const SUGGESTED_PROMPTS = [
  "Show BID properties",
  "Filter ML > 80",
  "Toggle heatmap",
  "High value deals",
  "Reset all",
];

export default function AgenticDemo() {
  const [properties] = useState(BREVARD_PROPERTIES);
  const [filteredProperties, setFilteredProperties] = useState(BREVARD_PROPERTIES);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `🏠 **BrevardBidderAI Ready**\n\n${BREVARD_PROPERTIES.length} properties loaded for Dec 17 auction.\n\n• ${BREVARD_PROPERTIES.filter(p => p.recommendation === 'BID').length} BID\n• ${BREVARD_PROPERTIES.filter(p => p.recommendation === 'REVIEW').length} REVIEW\n• ${BREVARD_PROPERTIES.filter(p => p.recommendation === 'SKIP').length} SKIP` }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);

  // Initialize Mapbox
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
          center: [-80.67, 28.25],
          zoom: 9.5,
        });

        map.current.addControl(new window.mapboxgl.NavigationControl(), 'top-right');
        map.current.addControl(new window.mapboxgl.FullscreenControl(), 'top-right');

        map.current.on('load', () => {
          setMapLoaded(true);
          
          // Heatmap source
          map.current.addSource('properties-heat', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: properties.map(p => ({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [p.longitude, p.latitude] },
                properties: { ml_score: p.ml_score }
              }))
            }
          });

          // Heatmap layer
          map.current.addLayer({
            id: 'properties-heatmap',
            type: 'heatmap',
            source: 'properties-heat',
            layout: { visibility: 'none' },
            paint: {
              'heatmap-weight': ['interpolate', ['linear'], ['get', 'ml_score'], 0, 0, 100, 1],
              'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 8, 1, 12, 3],
              'heatmap-color': [
                'interpolate', ['linear'], ['heatmap-density'],
                0, 'rgba(0,0,0,0)',
                0.2, '#1E3A5F',
                0.4, '#FF6B35',
                0.6, '#FF9800',
                0.8, '#4CAF50',
                1, '#FFFFFF'
              ],
              'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 8, 20, 12, 40],
              'heatmap-opacity': 0.85
            }
          });

          updateMarkers(filteredProperties);
        });
      }, 100);
    };
    document.head.appendChild(script);

    return () => { if (map.current) map.current.remove(); };
  }, []);

  useEffect(() => {
    if (mapLoaded) updateMarkers(filteredProperties);
  }, [filteredProperties, mapLoaded]);

  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.setLayoutProperty('properties-heatmap', 'visibility', showHeatmap ? 'visible' : 'none');
      markers.current.forEach(m => { m.getElement().style.opacity = showHeatmap ? '0.4' : '1'; });
    }
  }, [showHeatmap, mapLoaded]);

  function updateMarkers(props) {
    markers.current.forEach(m => m.remove());
    markers.current = [];

    props.forEach(property => {
      const color = COLORS.status[property.recommendation];

      const el = document.createElement('div');
      el.style.cssText = `
        width: 36px; height: 36px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        transition: all 0.3s ease;
        display: flex; align-items: center; justify-content: center;
        font-size: 12px; font-weight: 700; color: white;
        font-family: 'Roboto Mono', monospace;
      `;
      el.innerHTML = property.ml_score;
      el.onmouseenter = () => { el.style.transform = 'scale(1.25)'; el.style.boxShadow = '0 0 20px ' + color; };
      el.onmouseleave = () => { el.style.transform = 'scale(1)'; el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)'; };

      const popup = new window.mapboxgl.Popup({ offset: 25, closeButton: false, maxWidth: '300px' })
        .setHTML(`
          <div style="font-family: 'Poppins', sans-serif; padding: 8px; background: ${COLORS.card}; border-radius: 12px;">
            <div style="font-weight: 700; font-size: 15px; color: white; margin-bottom: 6px;">${property.address}</div>
            <div style="color: ${COLORS.textMuted}; font-size: 13px;">${property.city}, FL ${property.zip}</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 12px 0; font-size: 13px;">
              <div style="color: ${COLORS.textMuted};">ML Score: <strong style="color: white;">${property.ml_score}</strong></div>
              <div style="color: ${COLORS.textMuted};">Max Bid: <strong style="color: ${COLORS.primary};">$${property.max_bid.toLocaleString()}</strong></div>
              <div style="color: ${COLORS.textMuted};">ARV: <strong style="color: white;">$${property.arv.toLocaleString()}</strong></div>
              <div style="color: ${COLORS.textMuted};">Profit: <strong style="color: ${COLORS.status.BID};">$${(property.arv - property.max_bid - property.repairs).toLocaleString()}</strong></div>
            </div>
            <div style="background: ${color}; color: white; padding: 8px; border-radius: 8px; text-align: center; font-weight: 700; font-size: 14px;">
              ${property.recommendation}
            </div>
          </div>
        `);

      const marker = new window.mapboxgl.Marker(el)
        .setLngLat([property.longitude, property.latitude])
        .setPopup(popup)
        .addTo(map.current);

      el.addEventListener('click', () => setSelectedProperty(property));
      markers.current.push(marker);
    });
  }

  function addMessage(role, content) {
    setMessages(prev => [...prev, { role, content }]);
  }

  function handleCommand(cmd) {
    setIsProcessing(true);
    addMessage('user', cmd);
    const lowerCmd = cmd.toLowerCase();

    setTimeout(() => {
      if (lowerCmd.includes('bid') && !lowerCmd.includes('max')) {
        const bids = properties.filter(p => p.recommendation === 'BID');
        setFilteredProperties(bids);
        const totalProfit = bids.reduce((sum, p) => sum + (p.arv - p.max_bid - p.repairs), 0);
        addMessage('assistant', `✅ **${bids.length} BID Properties**\n\nTotal Potential Profit: **$${totalProfit.toLocaleString()}**`);
        fitBounds(bids);
      }
      else if (lowerCmd.includes('review')) {
        const reviews = properties.filter(p => p.recommendation === 'REVIEW');
        setFilteredProperties(reviews);
        addMessage('assistant', `🔍 **${reviews.length} REVIEW Properties**\n\nThese need additional due diligence before bidding.`);
        fitBounds(reviews);
      }
      else if (lowerCmd.includes('skip')) {
        const skips = properties.filter(p => p.recommendation === 'SKIP');
        setFilteredProperties(skips);
        addMessage('assistant', `⛔ **${skips.length} SKIP Properties**\n\n${skips.filter(p => p.senior_lien_survives).length} have surviving senior liens.`);
        fitBounds(skips);
      }
      else if (lowerCmd.includes('ml') || lowerCmd.includes('score') || lowerCmd.includes('80')) {
        const threshold = parseInt(cmd.match(/\d+/)?.[0]) || 80;
        const high = properties.filter(p => p.ml_score >= threshold);
        setFilteredProperties(high);
        addMessage('assistant', `📊 **${high.length} Properties** with ML Score ≥ ${threshold}`);
        fitBounds(high);
      }
      else if (lowerCmd.includes('heat')) {
        setShowHeatmap(!showHeatmap);
        addMessage('assistant', showHeatmap ? '🗺️ Heatmap OFF' : '🔥 Heatmap ON - Yellow/white = high ML concentration');
      }
      else if (lowerCmd.includes('high') || lowerCmd.includes('value') || lowerCmd.includes('profit')) {
        const highValue = properties.filter(p => (p.arv - p.max_bid - p.repairs) >= 100000);
        setFilteredProperties(highValue);
        addMessage('assistant', `💰 **${highValue.length} High-Profit Properties** (≥$100K potential)`);
        fitBounds(highValue);
      }
      else if (lowerCmd.includes('reset') || lowerCmd.includes('all')) {
        setFilteredProperties(properties);
        setShowHeatmap(false);
        addMessage('assistant', `🔄 Reset. Showing all ${properties.length} properties.`);
        if (map.current) map.current.flyTo({ center: [-80.67, 28.25], zoom: 9.5 });
      }
      else {
        addMessage('assistant', `Commands:\n• "Show BID/REVIEW/SKIP"\n• "Filter ML > 80"\n• "Toggle heatmap"\n• "High value deals"\n• "Reset all"`);
      }
      setIsProcessing(false);
    }, 300);
  }

  function fitBounds(props) {
    if (!map.current || props.length === 0) return;
    if (props.length === 1) {
      map.current.flyTo({ center: [props[0].longitude, props[0].latitude], zoom: 13 });
    } else {
      const bounds = new window.mapboxgl.LngLatBounds();
      props.forEach(p => bounds.extend([p.longitude, p.latitude]));
      map.current.fitBounds(bounds, { padding: 80 });
    }
  }

  // PropertyOnion-inspired styles
  const styles = {
    container: { display: 'flex', height: '100vh', background: COLORS.background, color: COLORS.text, fontFamily: "'Poppins', sans-serif", overflow: 'hidden' },
    chatPanel: { width: '30%', minWidth: '340px', display: 'flex', flexDirection: 'column', borderRight: `1px solid ${COLORS.elevated}`, background: `linear-gradient(180deg, ${COLORS.card} 0%, ${COLORS.background} 100%)` },
    header: { padding: '20px', borderBottom: `1px solid ${COLORS.elevated}`, background: COLORS.elevated },
    logo: { width: '48px', height: '48px', background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '20px', boxShadow: `0 0 20px ${COLORS.primary}40` },
    messagesArea: { flex: 1, overflowY: 'auto', padding: '16px' },
    userMsg: { background: COLORS.secondary, borderRadius: '16px 16px 4px 16px', padding: '12px 16px', maxWidth: '85%', marginLeft: 'auto', marginBottom: '12px' },
    assistantMsg: { background: COLORS.card, border: `1px solid ${COLORS.elevated}`, borderRadius: '16px 16px 16px 4px', padding: '12px 16px', maxWidth: '85%', marginBottom: '12px' },
    inputArea: { padding: '16px', borderTop: `1px solid ${COLORS.elevated}`, background: COLORS.card },
    input: { flex: 1, background: COLORS.background, border: `1px solid ${COLORS.elevated}`, borderRadius: '12px', padding: '14px 18px', color: COLORS.text, fontSize: '14px', outline: 'none' },
    sendBtn: { background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`, border: 'none', borderRadius: '12px', padding: '14px 20px', color: 'white', fontWeight: 700, cursor: 'pointer', marginLeft: '8px' },
    promptBtn: { background: COLORS.elevated, border: 'none', borderRadius: '20px', padding: '8px 14px', color: COLORS.textMuted, fontSize: '12px', cursor: 'pointer', transition: 'all 0.3s' },
    mapPanel: { flex: 1, position: 'relative' },
    legend: { position: 'absolute', bottom: '24px', left: '16px', background: `${COLORS.card}F0`, backdropFilter: 'blur(10px)', padding: '16px', borderRadius: '12px', border: `1px solid ${COLORS.elevated}`, zIndex: 10 },
    drawer: { position: 'absolute', right: 0, top: 0, height: '100%', width: '400px', background: COLORS.card, borderLeft: `1px solid ${COLORS.elevated}`, boxShadow: '-8px 0 32px rgba(0,0,0,0.5)', overflowY: 'auto', zIndex: 20 },
    drawerHeader: { position: 'sticky', top: 0, background: COLORS.elevated, padding: '20px', borderBottom: `1px solid ${COLORS.background}` },
    statCard: { background: COLORS.background, padding: '16px', borderRadius: '12px', border: `1px solid ${COLORS.elevated}` },
    primaryBtn: { width: '100%', background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)`, border: 'none', borderRadius: '12px', padding: '14px', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '15px' },
    secondaryBtn: { width: '100%', background: 'transparent', border: `2px solid ${COLORS.primary}`, borderRadius: '12px', padding: '12px', color: COLORS.primary, fontWeight: 600, cursor: 'pointer', fontSize: '14px', marginTop: '10px' },
  };

  return (
    <div style={styles.container}>
      {/* Chat Panel */}
      <div style={styles.chatPanel}>
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={styles.logo}>B</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '18px' }}>BrevardBidderAI</div>
              <div style={{ fontSize: '12px', color: COLORS.primary }}>12-Stage Agentic Pipeline</div>
            </div>
          </div>
        </div>

        <div style={styles.messagesArea}>
          {messages.map((m, i) => (
            <div key={i} style={m.role === 'user' ? styles.userMsg : styles.assistantMsg}>
              <div style={{ fontSize: '14px', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{m.content}</div>
            </div>
          ))}
          {isProcessing && (
            <div style={{ display: 'flex', gap: '6px', padding: '12px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS.primary, animation: 'bounce 1s infinite', animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '12px 16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {SUGGESTED_PROMPTS.map((p, i) => (
            <button key={i} onClick={() => setInput(p)} style={styles.promptBtn}>{p}</button>
          ))}
        </div>

        <div style={styles.inputArea}>
          <div style={{ display: 'flex' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && input.trim() && (handleCommand(input), setInput(''))}
              placeholder="Ask about foreclosures..."
              style={styles.input}
            />
            <button onClick={() => input.trim() && (handleCommand(input), setInput(''))} style={styles.sendBtn}>→</button>
          </div>
        </div>
      </div>

      {/* Map Panel */}
      <div style={styles.mapPanel}>
        <div ref={mapContainer} style={{ position: 'absolute', inset: 0 }} />

        {/* Controls */}
        <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={() => { setShowHeatmap(!showHeatmap); }} style={{ ...styles.promptBtn, background: showHeatmap ? COLORS.primary : COLORS.elevated, color: showHeatmap ? 'white' : COLORS.textMuted, padding: '12px 16px', fontWeight: 600 }}>
            {showHeatmap ? '🔥 Heatmap ON' : '🗺️ Heatmap'}
          </button>
          <button onClick={() => { setFilteredProperties(properties); setShowHeatmap(false); if(map.current) map.current.flyTo({ center: [-80.67, 28.25], zoom: 9.5 }); }} style={{ ...styles.promptBtn, padding: '12px 16px' }}>
            🔄 Reset View
          </button>
        </div>

        {/* Legend */}
        <div style={styles.legend}>
          <div style={{ fontSize: '12px', color: COLORS.textMuted, marginBottom: '10px', fontWeight: 600 }}>ML Score Recommendation</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            {Object.entries(COLORS.status).map(([status, color]) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}60` }} />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{status}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '12px', color: COLORS.primary, marginTop: '12px', fontWeight: 600 }}>{filteredProperties.length} of {properties.length} properties</div>
        </div>

        {/* Property Drawer */}
        {selectedProperty && (
          <div style={styles.drawer}>
            <div style={styles.drawerHeader}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ background: COLORS.status[selectedProperty.recommendation], padding: '6px 16px', borderRadius: '20px', fontWeight: 700, fontSize: '13px' }}>{selectedProperty.recommendation}</div>
                <button onClick={() => setSelectedProperty(null)} style={{ background: COLORS.background, border: 'none', width: '36px', height: '36px', borderRadius: '10px', color: 'white', fontSize: '18px', cursor: 'pointer' }}>×</button>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, marginTop: '14px', marginBottom: '4px' }}>{selectedProperty.address}</h2>
              <p style={{ color: COLORS.textMuted, fontSize: '14px' }}>{selectedProperty.city}, FL {selectedProperty.zip}</p>
              <p style={{ color: COLORS.textMuted, fontSize: '12px', marginTop: '4px' }}>Case: {selectedProperty.case_number}</p>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={styles.statCard}>
                  <div style={{ fontSize: '11px', color: COLORS.textMuted, marginBottom: '4px' }}>ML Score</div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: COLORS.status.BID }}>{selectedProperty.ml_score}</div>
                </div>
                <div style={styles.statCard}>
                  <div style={{ fontSize: '11px', color: COLORS.textMuted, marginBottom: '4px' }}>Max Bid</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: COLORS.primary }}>${selectedProperty.max_bid.toLocaleString()}</div>
                </div>
                <div style={styles.statCard}>
                  <div style={{ fontSize: '11px', color: COLORS.textMuted, marginBottom: '4px' }}>Judgment</div>
                  <div style={{ fontSize: '20px', fontWeight: 600 }}>${selectedProperty.judgment_amount.toLocaleString()}</div>
                </div>
                <div style={styles.statCard}>
                  <div style={{ fontSize: '11px', color: COLORS.textMuted, marginBottom: '4px' }}>ARV</div>
                  <div style={{ fontSize: '20px', fontWeight: 600, color: '#2196F3' }}>${selectedProperty.arv.toLocaleString()}</div>
                </div>
                <div style={styles.statCard}>
                  <div style={{ fontSize: '11px', color: COLORS.textMuted, marginBottom: '4px' }}>Est. Repairs</div>
                  <div style={{ fontSize: '20px', fontWeight: 600, color: COLORS.status.REVIEW }}>${selectedProperty.repairs.toLocaleString()}</div>
                </div>
                <div style={styles.statCard}>
                  <div style={{ fontSize: '11px', color: COLORS.textMuted, marginBottom: '4px' }}>Potential Profit</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: COLORS.status.BID }}>${(selectedProperty.arv - selectedProperty.max_bid - selectedProperty.repairs).toLocaleString()}</div>
                </div>
              </div>

              {selectedProperty.senior_lien_survives && (
                <div style={{ marginTop: '16px', background: '#F4433620', border: '1px solid #F4433640', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontWeight: 700, color: '#F44336', marginBottom: '6px' }}>⚠️ Senior Lien Warning</div>
                  <div style={{ fontSize: '13px', color: '#F44336' }}>This property has liens that survive foreclosure.</div>
                </div>
              )}

              <div style={{ marginTop: '16px', background: COLORS.background, padding: '16px', borderRadius: '12px', border: `1px solid ${COLORS.elevated}` }}>
                <div style={{ fontSize: '11px', color: COLORS.textMuted, marginBottom: '6px' }}>Plaintiff</div>
                <div style={{ fontWeight: 600 }}>{selectedProperty.plaintiff}</div>
                <div style={{ fontSize: '12px', color: COLORS.textMuted, marginTop: '8px' }}>Sale Date: {selectedProperty.sale_date}</div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <button style={styles.primaryBtn}>📄 Generate DOCX Report</button>
                <button onClick={() => addMessage('assistant', `**${selectedProperty.address}**\n\nML: ${selectedProperty.ml_score} | Max Bid: $${selectedProperty.max_bid.toLocaleString()}\nProfit Potential: $${(selectedProperty.arv - selectedProperty.max_bid - selectedProperty.repairs).toLocaleString()}\n\nRecommendation: ${selectedProperty.recommendation}`)} style={styles.secondaryBtn}>💬 Analyze in Chat</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: `${COLORS.elevated}E0`, backdropFilter: 'blur(10px)', borderTop: `1px solid ${COLORS.background}`, padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: COLORS.textMuted, zIndex: 10 }}>
        <span>© 2025 Ariel Shapira, Everest Capital USA</span>
        <span style={{ color: COLORS.primary }}>BrevardBidderAI V14.4.0 • PropertyOnion-Inspired Design</span>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;900&family=Roboto+Mono:wght@500;700&display=swap');
      `}</style>
    </div>
  );
}
