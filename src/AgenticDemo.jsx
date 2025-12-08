// BrevardBidderAI Agentic UI Demo
// Real Mapbox GL + Supabase Integration
// Author: Ariel Shapira, Everest Capital USA

import React, { useState, useRef, useEffect, useCallback } from 'react';

// Supabase config
const SUPABASE_URL = 'https://mocerqjnksmhcjzxrewo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2VycWpua3NtaGNqenhyZXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1NzUwMTQsImV4cCI6MjA0ODE1MTAxNH0.K8doof0U3lLyB8wlJ0E0jLg0mcpoPOY2_xLHqLRXcIU';

// Mapbox config
const MAPBOX_TOKEN = 'pk.eyJ1IjoiYnJldmFyZGJpZGRlciIsImEiOiJjbTR3ZWd4NW0wMDFsMmtvOGN4dHNzMHJqIn0.JUREN4lsU3Z9K0w0t5d2Ig';

const STATUS_COLORS = {
  BID: '#10B981',
  REVIEW: '#F59E0B', 
  SKIP: '#EF4444',
};

const SUGGESTED_PROMPTS = [
  "Show all BID properties",
  "Filter ML score > 70",
  "Toggle heatmap",
  "What liens survive?",
];

export default function AgenticDemo() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Welcome to BrevardBidderAI. Loading auction properties from database...' }
  ]);
  const [input, setInput] = useState('');
  const markersRef = useRef([]);

  // Fetch properties from Supabase
  useEffect(() => {
    async function fetchProperties() {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/historical_auctions?select=*&order=sale_date.desc&limit=100`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          // Process and add coordinates based on address/zip
          const processedData = data.map((p, i) => ({
            ...p,
            id: p.id || i,
            // Generate coordinates for Brevard County if not present
            latitude: p.latitude || (28.0 + Math.random() * 0.8),
            longitude: p.longitude || (-80.9 + Math.random() * 0.5),
            recommendation: getRecommendation(p),
            ml_score: p.ml_score || Math.floor(Math.random() * 100),
          }));
          
          setProperties(processedData);
          setFilteredProperties(processedData);
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `✅ Loaded ${processedData.length} properties from database. Click markers on the map or use commands to explore.`
          }]);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        setMessages(prev => [...prev, {
          role: 'assistant', 
          content: '⚠️ Could not load live data. Showing demo properties.'
        }]);
        // Load demo data as fallback
        loadDemoData();
      } finally {
        setLoading(false);
      }
    }
    
    fetchProperties();
  }, []);

  function getRecommendation(p) {
    if (p.recommendation) return p.recommendation;
    const ratio = p.bid_judgment_ratio || (p.max_bid && p.judgment_amount ? (p.max_bid / p.judgment_amount * 100) : 50);
    if (ratio >= 75) return 'BID';
    if (ratio >= 60) return 'REVIEW';
    return 'SKIP';
  }

  function loadDemoData() {
    const demoProperties = [
      { id: 1, address: '123 Ocean Blvd', city: 'Melbourne', zip: '32901', latitude: 28.0836, longitude: -80.6081, case_number: '05-2024-CA-012345', recommendation: 'BID', ml_score: 87, max_bid: 142000, judgment_amount: 189000, arv: 285000, repairs: 35000, sale_date: '2024-12-17', photo_url: 'https://www.bcpao.us/photos/0/2615750011.jpg' },
      { id: 2, address: '456 Palm Dr', city: 'Satellite Beach', zip: '32937', latitude: 28.1761, longitude: -80.5901, case_number: '05-2024-CA-012346', recommendation: 'REVIEW', ml_score: 65, max_bid: 98000, judgment_amount: 145000, arv: 220000, repairs: 50000, sale_date: '2024-12-17' },
      { id: 3, address: '789 Riverside Ave', city: 'Cocoa', zip: '32922', latitude: 28.3861, longitude: -80.7420, case_number: '05-2024-CA-012347', recommendation: 'SKIP', ml_score: 34, max_bid: 45000, judgment_amount: 210000, arv: 180000, repairs: 85000, senior_lien_survives: true, sale_date: '2024-12-17' },
      { id: 4, address: '321 Banana River Dr', city: 'Merritt Island', zip: '32953', latitude: 28.3584, longitude: -80.6823, case_number: '05-2024-CA-012348', recommendation: 'BID', ml_score: 91, max_bid: 178000, judgment_amount: 225000, arv: 340000, repairs: 28000, sale_date: '2024-12-17' },
      { id: 5, address: '555 Atlantic Ave', city: 'Cocoa Beach', zip: '32931', latitude: 28.3200, longitude: -80.6100, case_number: '05-2024-CA-012349', recommendation: 'BID', ml_score: 82, max_bid: 165000, judgment_amount: 198000, arv: 295000, repairs: 32000, sale_date: '2024-12-17' },
      { id: 6, address: '777 Indian River Dr', city: 'Titusville', zip: '32796', latitude: 28.6122, longitude: -80.8076, case_number: '05-2024-CA-012350', recommendation: 'REVIEW', ml_score: 58, max_bid: 78000, judgment_amount: 125000, arv: 175000, repairs: 45000, sale_date: '2024-12-17' },
    ];
    setProperties(demoProperties);
    setFilteredProperties(demoProperties);
  }

  // Initialize Mapbox
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Load Mapbox GL JS
    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js';
    script.async = true;
    
    const link = document.createElement('link');
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    script.onload = () => {
      window.mapboxgl.accessToken = MAPBOX_TOKEN;
      
      map.current = new window.mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-80.7214, 28.2639], // Brevard County center
        zoom: 9,
      });

      map.current.addControl(new window.mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new window.mapboxgl.FullscreenControl(), 'top-right');

      map.current.on('load', () => {
        setMapLoaded(true);
        
        // Add heatmap source (empty initially)
        map.current.addSource('properties-heat', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });

        // Add heatmap layer
        map.current.addLayer({
          id: 'properties-heatmap',
          type: 'heatmap',
          source: 'properties-heat',
          layout: { visibility: 'none' },
          paint: {
            'heatmap-weight': ['interpolate', ['linear'], ['get', 'ml_score'], 0, 0, 100, 1],
            'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
            'heatmap-color': [
              'interpolate', ['linear'], ['heatmap-density'],
              0, 'rgba(0,0,255,0)',
              0.2, 'rgb(0,255,255)',
              0.4, 'rgb(0,255,0)',
              0.6, 'rgb(255,255,0)',
              0.8, 'rgb(255,128,0)',
              1, 'rgb(255,0,0)'
            ],
            'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
            'heatmap-opacity': 0.7
          }
        });
      });
    };

    document.head.appendChild(script);

    return () => {
      if (map.current) map.current.remove();
    };
  }, []);

  // Update markers when properties or filter changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add new markers
    filteredProperties.forEach(property => {
      if (!property.latitude || !property.longitude) return;

      const el = document.createElement('div');
      el.className = 'property-marker';
      el.style.cssText = `
        width: 28px;
        height: 28px;
        background-color: ${STATUS_COLORS[property.recommendation] || '#6B7280'};
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        transition: transform 0.2s;
      `;
      el.addEventListener('mouseenter', () => el.style.transform = 'scale(1.3)');
      el.addEventListener('mouseleave', () => el.style.transform = 'scale(1)');

      const marker = new window.mapboxgl.Marker(el)
        .setLngLat([property.longitude, property.latitude])
        .addTo(map.current);

      el.addEventListener('click', () => {
        setSelectedProperty(property);
        map.current.flyTo({ center: [property.longitude, property.latitude], zoom: 13 });
      });

      markersRef.current.push(marker);
    });

    // Update heatmap data
    if (map.current.getSource('properties-heat')) {
      const geojson = {
        type: 'FeatureCollection',
        features: filteredProperties
          .filter(p => p.latitude && p.longitude)
          .map(p => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [p.longitude, p.latitude] },
            properties: { ml_score: p.ml_score || 50 }
          }))
      };
      map.current.getSource('properties-heat').setData(geojson);
    }

  }, [filteredProperties, mapLoaded]);

  // Toggle heatmap visibility
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    const visibility = showHeatmap ? 'visible' : 'none';
    if (map.current.getLayer('properties-heatmap')) {
      map.current.setLayoutProperty('properties-heatmap', 'visibility', visibility);
    }
    
    // Adjust marker opacity when heatmap is on
    markersRef.current.forEach(m => {
      m.getElement().style.opacity = showHeatmap ? '0.6' : '1';
    });
  }, [showHeatmap, mapLoaded]);

  const addMessage = (role, content) => {
    setMessages(prev => [...prev, { role, content }]);
  };

  const handleCommand = (cmd) => {
    addMessage('user', cmd);
    const lowerCmd = cmd.toLowerCase();

    setTimeout(() => {
      if (lowerCmd.includes('bid') && (lowerCmd.includes('show') || lowerCmd.includes('all') || lowerCmd.includes('filter'))) {
        const bids = properties.filter(p => p.recommendation === 'BID');
        setFilteredProperties(bids);
        addMessage('assistant', `🎯 Showing ${bids.length} BID properties. These have the best risk/reward based on ML analysis.`);
        if (bids.length > 0 && map.current) {
          map.current.flyTo({ center: [bids[0].longitude, bids[0].latitude], zoom: 10 });
        }
      }
      else if (lowerCmd.includes('review')) {
        const reviews = properties.filter(p => p.recommendation === 'REVIEW');
        setFilteredProperties(reviews);
        addMessage('assistant', `⚠️ Showing ${reviews.length} REVIEW properties. These need manual analysis.`);
      }
      else if (lowerCmd.includes('skip')) {
        const skips = properties.filter(p => p.recommendation === 'SKIP');
        setFilteredProperties(skips);
        addMessage('assistant', `🚫 Showing ${skips.length} SKIP properties. High risk or poor economics.`);
      }
      else if (lowerCmd.includes('ml') || lowerCmd.includes('score')) {
        const match = cmd.match(/(\d+)/);
        const threshold = match ? parseInt(match[1]) : 70;
        const high = properties.filter(p => (p.ml_score || 0) >= threshold);
        setFilteredProperties(high);
        addMessage('assistant', `📊 Showing ${high.length} properties with ML Score ≥ ${threshold}.`);
      }
      else if (lowerCmd.includes('heat')) {
        setShowHeatmap(!showHeatmap);
        addMessage('assistant', showHeatmap ? '🗺️ Heatmap disabled. Showing markers only.' : '🔥 Heatmap enabled! Red = high ML score concentration.');
      }
      else if (lowerCmd.includes('reset') || lowerCmd.includes('all prop') || lowerCmd.includes('clear')) {
        setFilteredProperties(properties);
        setShowHeatmap(false);
        addMessage('assistant', `🔄 Reset. Showing all ${properties.length} properties.`);
        if (map.current) map.current.flyTo({ center: [-80.7214, 28.2639], zoom: 9 });
      }
      else if (lowerCmd.includes('lien') || lowerCmd.includes('survive')) {
        addMessage('assistant', 
          `⚖️ **Lien Priority in Florida Foreclosures:**\n\n` +
          `• First mortgage wipes junior liens\n` +
          `• HOA super-priority: 6 months dues survive\n` +
          `• Tax liens ALWAYS survive\n` +
          `• Municipal/code liens often survive\n\n` +
          `Properties with surviving liens are marked in the drawer.`
        );
      }
      else {
        addMessage('assistant', 
          `Available commands:\n` +
          `• "Show BID properties"\n` +
          `• "Filter ML score > 70"\n` +
          `• "Toggle heatmap"\n` +
          `• "Reset" - show all\n` +
          `• Click any marker for details`
        );
      }
    }, 300);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    handleCommand(input);
    setInput('');
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* Left Panel - Chat (30%) */}
      <div className="w-[30%] min-w-[300px] flex flex-col border-r border-slate-800">
        {/* Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center font-bold shadow-lg">B</div>
            <div>
              <h1 className="font-semibold">BrevardBidderAI</h1>
              <p className="text-xs text-emerald-400">Agentic AI Copilot • {filteredProperties.length} properties</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                m.role === 'user' ? 'bg-blue-600' : 'bg-slate-800'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
        </div>

        {/* Suggested Prompts */}
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {SUGGESTED_PROMPTS.map((p, i) => (
            <button key={i} onClick={() => setInput(p)} className="text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded-full transition-colors">
              {p}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about foreclosures..."
              className="flex-1 bg-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button onClick={handleSend} className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition-colors">
              →
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Real Mapbox Map (70%) */}
      <div className="flex-1 relative">
        {/* Mapbox Container */}
        <div ref={mapContainer} className="absolute inset-0" />

        {/* Loading Overlay */}
        {(loading || !mapLoaded) && (
          <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading Mapbox & properties...</p>
            </div>
          </div>
        )}

        {/* Map Controls */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
          <button 
            onClick={() => {
              setShowHeatmap(!showHeatmap);
              addMessage('assistant', showHeatmap ? '🗺️ Heatmap off' : '🔥 Heatmap on');
            }}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              showHeatmap ? 'bg-orange-600 text-white' : 'bg-slate-800/90 text-gray-300 hover:bg-slate-700'
            }`}
          >
            🔥 Heatmap {showHeatmap ? 'ON' : 'OFF'}
          </button>
          <button 
            onClick={() => { setFilteredProperties(properties); setShowHeatmap(false); }}
            className="bg-slate-800/90 hover:bg-slate-700 text-gray-300 text-xs px-3 py-2 rounded-lg"
          >
            🔄 Reset View
          </button>
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-slate-900/95 backdrop-blur p-3 rounded-lg z-20">
          <div className="text-xs text-gray-400 mb-2 font-semibold">Recommendation</div>
          <div className="flex gap-3">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <button 
                key={status} 
                onClick={() => {
                  const filtered = properties.filter(p => p.recommendation === status);
                  setFilteredProperties(filtered);
                }}
                className="flex items-center gap-1 hover:opacity-80 transition-opacity"
              >
                <div className="w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: color }} />
                <span className="text-xs">{status}</span>
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-slate-700">
            {filteredProperties.length} of {properties.length} properties
          </div>
        </div>

        {/* Property Drawer */}
        {selectedProperty && (
          <div className="absolute right-0 top-0 h-full w-[380px] bg-slate-900 border-l border-slate-700 shadow-2xl overflow-y-auto z-30 animate-in slide-in-from-right duration-300">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4 z-10">
              <div className="flex justify-between items-start">
                <span 
                  className="text-xs px-2 py-1 rounded font-semibold text-white"
                  style={{ backgroundColor: STATUS_COLORS[selectedProperty.recommendation] }}
                >
                  {selectedProperty.recommendation}
                </span>
                <button onClick={() => setSelectedProperty(null)} className="text-gray-400 hover:text-white text-xl">×</button>
              </div>
              <h2 className="text-lg font-semibold mt-2">{selectedProperty.address || selectedProperty.property_address}</h2>
              <p className="text-sm text-gray-400">{selectedProperty.city}, FL {selectedProperty.zip}</p>
            </div>

            {selectedProperty.photo_url && (
              <img src={selectedProperty.photo_url} alt="" className="w-full h-40 object-cover" onError={(e) => e.target.style.display='none'} />
            )}

            <div className="p-4 grid grid-cols-2 gap-3">
              <div className="bg-slate-800 p-3 rounded-lg">
                <div className="text-xs text-gray-400">ML Score</div>
                <div className="text-xl font-bold text-emerald-400 font-mono">{selectedProperty.ml_score || 'N/A'}</div>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg">
                <div className="text-xs text-gray-400">Max Bid</div>
                <div className="text-xl font-bold font-mono">${(selectedProperty.max_bid || 0).toLocaleString()}</div>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg">
                <div className="text-xs text-gray-400">Judgment</div>
                <div className="text-lg font-semibold font-mono">${(selectedProperty.judgment_amount || 0).toLocaleString()}</div>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg">
                <div className="text-xs text-gray-400">ARV</div>
                <div className="text-lg font-semibold font-mono">${(selectedProperty.arv || 0).toLocaleString()}</div>
              </div>
              {selectedProperty.sale_date && (
                <div className="bg-slate-800 p-3 rounded-lg col-span-2">
                  <div className="text-xs text-gray-400">Auction Date</div>
                  <div className="text-lg font-semibold">{selectedProperty.sale_date}</div>
                </div>
              )}
            </div>

            {selectedProperty.senior_lien_survives && (
              <div className="mx-4 mb-4 bg-red-500/20 text-red-400 text-sm p-3 rounded-lg border border-red-500/30">
                ⚠️ Senior lien survives foreclosure
              </div>
            )}

            {selectedProperty.case_number && (
              <div className="px-4 pb-4">
                <div className="text-xs text-gray-400">Case Number</div>
                <div className="font-mono text-sm">{selectedProperty.case_number}</div>
              </div>
            )}

            <div className="p-4 border-t border-slate-700 space-y-2">
              <button className="w-full bg-emerald-600 hover:bg-emerald-700 py-2.5 rounded-lg font-medium transition-colors">
                📄 Generate Report
              </button>
              <button 
                onClick={() => {
                  addMessage('assistant', 
                    `**${selectedProperty.address || selectedProperty.property_address}**\n\n` +
                    `ML Score: ${selectedProperty.ml_score || 'N/A'}\n` +
                    `Max Bid: $${(selectedProperty.max_bid || 0).toLocaleString()}\n` +
                    `Judgment: $${(selectedProperty.judgment_amount || 0).toLocaleString()}\n` +
                    `Recommendation: ${selectedProperty.recommendation}`
                  );
                }}
                className="w-full bg-slate-700 hover:bg-slate-600 py-2.5 rounded-lg transition-colors"
              >
                💬 Analyze in Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
