// BrevardBidderAI Agentic UI V2 - Mapbox + Heatmap + Real Data Structure
// Split-screen interface with foreclosure auction intelligence
// Author: Ariel Shapira, Everest Capital USA

import React, { useState, useEffect, useRef } from 'react';

// Mapbox config
const MAPBOX_TOKEN = 'pk.eyJ1IjoiYnJldmFyZGJpZGRlciIsImEiOiJjbTRvOHNiY3IwaGdxMmtzOGd3MWRqbjFzIn0.K1vPto_LT1fVYfnvLe_wdg';

const STATUS_COLORS = {
  BID: '#10B981',
  REVIEW: '#F59E0B',
  SKIP: '#EF4444',
};

// Real Brevard County foreclosure properties (Dec 2024 auction data)
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
  "High value (ARV > 400K)",
  "Reset all",
];

export default function AgenticDemo() {
  const [properties] = useState(BREVARD_PROPERTIES);
  const [filteredProperties, setFilteredProperties] = useState(BREVARD_PROPERTIES);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `🏠 **BrevardBidderAI Ready**\n\nLoaded ${BREVARD_PROPERTIES.length} properties from Dec 17, 2024 auction.\n\n• ${BREVARD_PROPERTIES.filter(p => p.recommendation === 'BID').length} BID recommendations\n• ${BREVARD_PROPERTIES.filter(p => p.recommendation === 'REVIEW').length} REVIEW\n• ${BREVARD_PROPERTIES.filter(p => p.recommendation === 'SKIP').length} SKIP\n\nClick markers or use chat commands!` }
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
          pitch: 0,
        });

        map.current.addControl(new window.mapboxgl.NavigationControl(), 'top-right');
        map.current.addControl(new window.mapboxgl.FullscreenControl(), 'top-right');
        map.current.addControl(new window.mapboxgl.ScaleControl(), 'bottom-right');

        map.current.on('load', () => {
          setMapLoaded(true);
          
          // Add heatmap source
          map.current.addSource('properties-heat', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: properties.map(p => ({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [p.longitude, p.latitude] },
                properties: { ml_score: p.ml_score, recommendation: p.recommendation }
              }))
            }
          });

          // Add heatmap layer (hidden by default)
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
                0.2, 'rgb(103,0,31)',
                0.4, 'rgb(178,24,43)',
                0.6, 'rgb(253,141,60)',
                0.8, 'rgb(254,224,139)',
                1, 'rgb(255,255,178)'
              ],
              'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 8, 15, 12, 30],
              'heatmap-opacity': 0.8
            }
          });

          updateMarkers(filteredProperties);
        });
      }, 100);
    };
    document.head.appendChild(script);

    return () => {
      if (map.current) map.current.remove();
    };
  }, []);

  // Update markers when filtered properties change
  useEffect(() => {
    if (mapLoaded) {
      updateMarkers(filteredProperties);
    }
  }, [filteredProperties, mapLoaded]);

  // Toggle heatmap visibility
  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.setLayoutProperty(
        'properties-heatmap',
        'visibility',
        showHeatmap ? 'visible' : 'none'
      );
      // Dim markers when heatmap is on
      markers.current.forEach(m => {
        m.getElement().style.opacity = showHeatmap ? '0.5' : '1';
      });
    }
  }, [showHeatmap, mapLoaded]);

  function updateMarkers(props) {
    markers.current.forEach(m => m.remove());
    markers.current = [];

    props.forEach(property => {
      const color = STATUS_COLORS[property.recommendation];

      const el = document.createElement('div');
      el.style.cssText = `
        width: 32px; height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 3px 12px rgba(0,0,0,0.4);
        transition: all 0.2s ease;
        display: flex; align-items: center; justify-content: center;
        font-size: 11px; font-weight: bold; color: white;
      `;
      el.innerHTML = property.ml_score;
      el.onmouseenter = () => { el.style.transform = 'scale(1.3)'; el.style.zIndex = '100'; };
      el.onmouseleave = () => { el.style.transform = 'scale(1)'; el.style.zIndex = '1'; };

      const popup = new window.mapboxgl.Popup({ offset: 25, closeButton: false, maxWidth: '280px' })
        .setHTML(`
          <div style="font-family: system-ui; padding: 4px;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">${property.address}</div>
            <div style="color: #666; font-size: 12px;">${property.city}, FL ${property.zip}</div>
            <div style="margin: 10px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
              <div><span style="color:#888;">ML Score:</span> <strong>${property.ml_score}</strong></div>
              <div><span style="color:#888;">Max Bid:</span> <strong>$${property.max_bid.toLocaleString()}</strong></div>
              <div><span style="color:#888;">ARV:</span> $${property.arv.toLocaleString()}</div>
              <div><span style="color:#888;">Judgment:</span> $${property.judgment_amount.toLocaleString()}</div>
            </div>
            <div style="background: ${color}; color: white; padding: 6px; border-radius: 6px; text-align: center; font-weight: 600; font-size: 13px;">
              ${property.recommendation}
            </div>
            ${property.senior_lien_survives ? '<div style="background: #FEE2E2; color: #DC2626; padding: 6px; border-radius: 6px; margin-top: 6px; font-size: 11px; text-align: center;">⚠️ Senior lien survives</div>' : ''}
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
        addMessage('assistant', `✅ Showing ${bids.length} BID properties.\n\nTotal potential profit: $${bids.reduce((sum, p) => sum + (p.arv - p.max_bid - p.repairs), 0).toLocaleString()}`);
        fitBounds(bids);
      }
      else if (lowerCmd.includes('review')) {
        const reviews = properties.filter(p => p.recommendation === 'REVIEW');
        setFilteredProperties(reviews);
        addMessage('assistant', `🔍 Showing ${reviews.length} REVIEW properties. These need additional due diligence.`);
        fitBounds(reviews);
      }
      else if (lowerCmd.includes('skip')) {
        const skips = properties.filter(p => p.recommendation === 'SKIP');
        setFilteredProperties(skips);
        addMessage('assistant', `⛔ Showing ${skips.length} SKIP properties.\n\n${skips.filter(p => p.senior_lien_survives).length} have surviving senior liens.`);
        fitBounds(skips);
      }
      else if (lowerCmd.includes('ml') || lowerCmd.includes('score')) {
        const threshold = parseInt(cmd.match(/\d+/)?.[0]) || 80;
        const high = properties.filter(p => p.ml_score >= threshold);
        setFilteredProperties(high);
        addMessage('assistant', `📊 ${high.length} properties with ML Score ≥ ${threshold}`);
        fitBounds(high);
      }
      else if (lowerCmd.includes('heat')) {
        setShowHeatmap(!showHeatmap);
        addMessage('assistant', showHeatmap ? '🗺️ Heatmap disabled. Showing markers.' : '🔥 Heatmap enabled. Yellow = high ML score concentration.');
      }
      else if (lowerCmd.includes('arv') || lowerCmd.includes('value') || lowerCmd.includes('400')) {
        const highValue = properties.filter(p => p.arv >= 400000);
        setFilteredProperties(highValue);
        addMessage('assistant', `💰 ${highValue.length} high-value properties (ARV ≥ $400K)`);
        fitBounds(highValue);
      }
      else if (lowerCmd.includes('lien') || lowerCmd.includes('survive')) {
        const risky = properties.filter(p => p.senior_lien_survives);
        setFilteredProperties(risky);
        addMessage('assistant', `⚠️ **${risky.length} properties with surviving senior liens**\n\nThese are marked SKIP because:\n• HOA super-priority liens\n• Tax liens\n• Municipal liens\n\nBuying these means inheriting debt!`);
        fitBounds(risky);
      }
      else if (lowerCmd.includes('reset') || lowerCmd.includes('all')) {
        setFilteredProperties(properties);
        setShowHeatmap(false);
        addMessage('assistant', `🔄 Reset. Showing all ${properties.length} properties.`);
        if (map.current) map.current.flyTo({ center: [-80.67, 28.25], zoom: 9.5 });
      }
      else {
        addMessage('assistant', `Try these commands:\n• "Show BID properties"\n• "Filter ML > 80"\n• "Toggle heatmap"\n• "High value (ARV > 400K)"\n• "Show surviving liens"\n• "Reset all"`);
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

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* Chat Panel */}
      <div className="w-[30%] min-w-[320px] flex flex-col border-r border-slate-800">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-emerald-500/20">B</div>
            <div>
              <h1 className="font-bold text-lg">BrevardBidderAI</h1>
              <p className="text-xs text-emerald-400">12-Stage Agentic Pipeline • Live</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] rounded-xl px-4 py-2.5 text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-blue-600' : 'bg-slate-800/80'}`}>
                {m.content}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex gap-1.5 px-4 py-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          )}
        </div>

        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {SUGGESTED_PROMPTS.map((p, i) => (
            <button key={i} onClick={() => setInput(p)} className="text-xs bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg transition-colors">{p}</button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/30">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && input.trim() && (handleCommand(input), setInput(''))}
              placeholder="Ask about foreclosures..."
              className="flex-1 bg-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <button onClick={() => input.trim() && (handleCommand(input), setInput(''))} className="bg-emerald-600 hover:bg-emerald-500 px-5 py-3 rounded-xl font-medium transition-colors">→</button>
          </div>
        </div>
      </div>

      {/* Map Panel */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0" />

        {/* Heatmap Toggle */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <button
            onClick={() => { setShowHeatmap(!showHeatmap); addMessage('assistant', showHeatmap ? '🗺️ Heatmap off' : '🔥 Heatmap on'); }}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg transition-all ${showHeatmap ? 'bg-amber-500 text-black' : 'bg-slate-800/90 backdrop-blur hover:bg-slate-700'}`}
          >
            {showHeatmap ? '🔥 Heatmap ON' : '🗺️ Heatmap'}
          </button>
          <button onClick={() => { setFilteredProperties(properties); setShowHeatmap(false); if(map.current) map.current.flyTo({ center: [-80.67, 28.25], zoom: 9.5 }); }} className="bg-slate-800/90 backdrop-blur hover:bg-slate-700 text-sm px-4 py-2.5 rounded-xl shadow-lg">🔄 Reset</button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 left-4 bg-slate-900/95 backdrop-blur-sm p-4 rounded-xl shadow-xl z-10 border border-slate-700/50">
          <div className="text-xs text-gray-400 mb-2 font-medium">ML Score Recommendation</div>
          <div className="flex gap-4">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full shadow-md" style={{ backgroundColor: color }} />
                <span className="text-sm font-medium">{status}</span>
              </div>
            ))}
          </div>
          <div className="text-xs text-emerald-400 mt-3 font-medium">{filteredProperties.length} of {properties.length} properties</div>
        </div>

        {/* Property Drawer */}
        {selectedProperty && (
          <div className="absolute right-0 top-0 h-full w-[380px] bg-slate-900/98 backdrop-blur-sm border-l border-slate-700 shadow-2xl overflow-y-auto z-20 animate-in slide-in-from-right">
            <div className="sticky top-0 bg-slate-900 p-4 border-b border-slate-700">
              <div className="flex justify-between items-start">
                <div className="px-3 py-1.5 rounded-lg font-bold text-sm" style={{ backgroundColor: STATUS_COLORS[selectedProperty.recommendation] }}>{selectedProperty.recommendation}</div>
                <button onClick={() => setSelectedProperty(null)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">✕</button>
              </div>
              <h2 className="text-xl font-bold mt-3">{selectedProperty.address}</h2>
              <p className="text-gray-400">{selectedProperty.city}, FL {selectedProperty.zip}</p>
              <p className="text-xs text-gray-500 mt-1">Case: {selectedProperty.case_number}</p>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/80 p-4 rounded-xl">
                  <div className="text-xs text-gray-400 mb-1">ML Score</div>
                  <div className="text-3xl font-bold text-emerald-400">{selectedProperty.ml_score}</div>
                </div>
                <div className="bg-slate-800/80 p-4 rounded-xl">
                  <div className="text-xs text-gray-400 mb-1">Max Bid</div>
                  <div className="text-2xl font-bold">${selectedProperty.max_bid.toLocaleString()}</div>
                </div>
                <div className="bg-slate-800/80 p-4 rounded-xl">
                  <div className="text-xs text-gray-400 mb-1">Judgment</div>
                  <div className="text-xl font-semibold">${selectedProperty.judgment_amount.toLocaleString()}</div>
                </div>
                <div className="bg-slate-800/80 p-4 rounded-xl">
                  <div className="text-xs text-gray-400 mb-1">ARV</div>
                  <div className="text-xl font-semibold text-blue-400">${selectedProperty.arv.toLocaleString()}</div>
                </div>
                <div className="bg-slate-800/80 p-4 rounded-xl">
                  <div className="text-xs text-gray-400 mb-1">Est. Repairs</div>
                  <div className="text-xl font-semibold text-amber-400">${selectedProperty.repairs.toLocaleString()}</div>
                </div>
                <div className="bg-slate-800/80 p-4 rounded-xl">
                  <div className="text-xs text-gray-400 mb-1">Potential Profit</div>
                  <div className="text-xl font-semibold text-emerald-400">${(selectedProperty.arv - selectedProperty.max_bid - selectedProperty.repairs).toLocaleString()}</div>
                </div>
              </div>

              {selectedProperty.senior_lien_survives && (
                <div className="mt-4 bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-xl">
                  <div className="font-bold mb-1">⚠️ Senior Lien Warning</div>
                  <div className="text-sm">This property has liens that survive foreclosure. Buying means inheriting this debt.</div>
                </div>
              )}

              <div className="mt-4 bg-slate-800/50 p-4 rounded-xl">
                <div className="text-xs text-gray-400 mb-2">Plaintiff</div>
                <div className="font-medium">{selectedProperty.plaintiff}</div>
                <div className="text-xs text-gray-500 mt-2">Sale Date: {selectedProperty.sale_date}</div>
              </div>

              <div className="mt-4 space-y-2">
                <button className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl font-semibold transition-colors">📄 Generate DOCX Report</button>
                <button onClick={() => addMessage('assistant', `**Analysis: ${selectedProperty.address}**\n\nML Score: ${selectedProperty.ml_score}/100\nMax Bid: $${selectedProperty.max_bid.toLocaleString()}\nARV: $${selectedProperty.arv.toLocaleString()}\nPotential Profit: $${(selectedProperty.arv - selectedProperty.max_bid - selectedProperty.repairs).toLocaleString()}\n\nRecommendation: ${selectedProperty.recommendation}`)} className="w-full bg-slate-700 hover:bg-slate-600 py-3 rounded-xl font-medium transition-colors">💬 Analyze in Chat</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur border-t border-slate-800 px-4 py-2 flex justify-between items-center text-xs text-gray-500 z-10">
        <span>© 2025 Ariel Shapira, Everest Capital USA</span>
        <span className="text-emerald-500">BrevardBidderAI V14.4.0 • 12-Stage Pipeline • Mapbox GL</span>
      </div>
    </div>
  );
}
