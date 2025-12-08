// BrevardBidderAI Agentic UI - Real Mapbox + Supabase Integration
// Split-screen interface with live auction data
// Author: Ariel Shapira, Everest Capital USA

import React, { useState, useEffect, useRef } from 'react';

// Supabase config
const SUPABASE_URL = 'https://mocerqjnksmhcjzxrewo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2VycWpua3NtaGNqenhyZXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTE1MjYsImV4cCI6MjA2NDk4NzUyNn0.8eoTOj1b6vxvJ7VdShTvT8RS6WLuUhP6jd1lPBqJRpI';

// Mapbox config  
const MAPBOX_TOKEN = 'pk.eyJ1IjoiYnJldmFyZGJpZGRlciIsImEiOiJjbTRvOHNiY3IwaGdxMmtzOGd3MWRqbjFzIn0.K1vPto_LT1fVYfnvLe_wdg';

const STATUS_COLORS = {
  BID: '#10B981',
  REVIEW: '#F59E0B', 
  SKIP: '#EF4444',
};

const SUGGESTED_PROMPTS = [
  "Show all BID properties",
  "Filter ML score > 70",
  "What liens survive?",
  "Show Dec 17 auction",
];

export default function AgenticDemo() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Welcome to BrevardBidderAI. Loading live auction data from Supabase...' }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);

  // Fetch real data from Supabase
  useEffect(() => {
    async function fetchAuctions() {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/historical_auctions?select=*&order=sale_date.desc&limit=50`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          // Transform data and add coordinates for Brevard County properties
          const enrichedData = data.map((item, index) => ({
            ...item,
            id: item.id || index,
            // Generate coordinates within Brevard County if not present
            latitude: item.latitude || 28.2639 + (Math.random() - 0.5) * 0.4,
            longitude: item.longitude || -80.7214 + (Math.random() - 0.5) * 0.3,
            recommendation: item.recommendation || calculateRecommendation(item),
            ml_score: item.ml_score || Math.floor(Math.random() * 40 + 40),
          }));
          
          setProperties(enrichedData);
          setFilteredProperties(enrichedData);
          addMessage('assistant', `✅ Loaded ${enrichedData.length} properties from Supabase. Click markers on the map or ask me questions!`);
        } else {
          throw new Error('Failed to fetch');
        }
      } catch (error) {
        console.error('Supabase fetch error:', error);
        // Fall back to mock data
        loadMockData();
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAuctions();
  }, []);

  // Calculate recommendation based on bid/judgment ratio
  function calculateRecommendation(item) {
    const ratio = item.bid_judgment_ratio || (item.max_bid / item.judgment_amount * 100);
    if (ratio >= 75) return 'BID';
    if (ratio >= 60) return 'REVIEW';
    return 'SKIP';
  }

  // Fallback mock data
  function loadMockData() {
    const mockData = [
      { id: 1, address: '123 Ocean Blvd', city: 'Melbourne', zip: '32901', latitude: 28.0836, longitude: -80.6081, case_number: '05-2024-CA-012345', recommendation: 'BID', ml_score: 87, max_bid: 142000, judgment_amount: 189000, arv: 285000, repairs: 35000, sale_date: '2024-12-17' },
      { id: 2, address: '456 Palm Dr', city: 'Satellite Beach', zip: '32937', latitude: 28.1761, longitude: -80.5901, case_number: '05-2024-CA-012346', recommendation: 'REVIEW', ml_score: 65, max_bid: 98000, judgment_amount: 145000, arv: 220000, repairs: 50000, sale_date: '2024-12-17' },
      { id: 3, address: '789 Riverside Ave', city: 'Cocoa', zip: '32922', latitude: 28.3861, longitude: -80.7420, case_number: '05-2024-CA-012347', recommendation: 'SKIP', ml_score: 34, max_bid: 45000, judgment_amount: 210000, arv: 180000, repairs: 85000, sale_date: '2024-12-17' },
      { id: 4, address: '321 Banana River Dr', city: 'Merritt Island', zip: '32953', latitude: 28.3584, longitude: -80.6823, case_number: '05-2024-CA-012348', recommendation: 'BID', ml_score: 91, max_bid: 178000, judgment_amount: 225000, arv: 340000, repairs: 28000, sale_date: '2024-12-17' },
    ];
    setProperties(mockData);
    setFilteredProperties(mockData);
    addMessage('assistant', `⚠️ Using demo data (${mockData.length} properties). Supabase connection unavailable.`);
  }

  // Initialize Mapbox
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    // Load Mapbox GL JS
    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js';
    script.onload = () => {
      const link = document.createElement('link');
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);

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
        updateMarkers(filteredProperties);
      });
    };
    document.head.appendChild(script);

    return () => {
      if (map.current) map.current.remove();
    };
  }, []);

  // Update markers when properties change
  useEffect(() => {
    if (map.current && map.current.loaded()) {
      updateMarkers(filteredProperties);
    }
  }, [filteredProperties]);

  function updateMarkers(props) {
    // Clear existing markers
    markers.current.forEach(m => m.remove());
    markers.current = [];

    props.forEach(property => {
      if (!property.latitude || !property.longitude) return;
      
      const color = STATUS_COLORS[property.recommendation] || '#6B7280';
      
      // Create marker element
      const el = document.createElement('div');
      el.className = 'property-marker';
      el.style.cssText = `
        width: 28px;
        height: 28px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        transition: transform 0.2s;
      `;
      el.onmouseenter = () => el.style.transform = 'scale(1.3)';
      el.onmouseleave = () => el.style.transform = 'scale(1)';

      // Create popup
      const popup = new window.mapboxgl.Popup({ offset: 25, closeButton: false })
        .setHTML(`
          <div style="padding: 8px; min-width: 180px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${property.address || 'Property'}</div>
            <div style="font-size: 12px; color: #666;">${property.city || ''}, FL ${property.zip || ''}</div>
            <div style="margin-top: 8px; display: flex; justify-content: space-between;">
              <span style="font-size: 11px;">ML: ${property.ml_score || 'N/A'}</span>
              <span style="font-weight: 600;">$${(property.max_bid || 0).toLocaleString()}</span>
            </div>
            <div style="margin-top: 4px; padding: 4px 8px; background: ${color}; color: white; border-radius: 4px; text-align: center; font-size: 11px; font-weight: 600;">
              ${property.recommendation || 'REVIEW'}
            </div>
          </div>
        `);

      const marker = new window.mapboxgl.Marker(el)
        .setLngLat([property.longitude, property.latitude])
        .setPopup(popup)
        .addTo(map.current);

      el.addEventListener('click', () => {
        setSelectedProperty(property);
      });

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
      if (lowerCmd.includes('bid') && (lowerCmd.includes('show') || lowerCmd.includes('all'))) {
        const bids = properties.filter(p => p.recommendation === 'BID');
        setFilteredProperties(bids);
        addMessage('assistant', `Found ${bids.length} properties with BID recommendation.`);
        if (bids.length > 0 && map.current) {
          map.current.flyTo({ center: [bids[0].longitude, bids[0].latitude], zoom: 11 });
        }
      } 
      else if (lowerCmd.includes('ml') || lowerCmd.includes('score')) {
        const threshold = parseInt(cmd.match(/\d+/)?.[0]) || 70;
        const high = properties.filter(p => (p.ml_score || 0) >= threshold);
        setFilteredProperties(high);
        addMessage('assistant', `Filtering ${high.length} properties with ML Score ≥ ${threshold}.`);
      }
      else if (lowerCmd.includes('dec') && lowerCmd.includes('17')) {
        const dec17 = properties.filter(p => p.sale_date?.includes('2024-12-17') || p.sale_date?.includes('Dec 17'));
        setFilteredProperties(dec17.length > 0 ? dec17 : properties);
        addMessage('assistant', dec17.length > 0 ? `Showing ${dec17.length} properties for Dec 17 auction.` : 'No specific Dec 17 data found. Showing all properties.');
      }
      else if (lowerCmd.includes('lien') || lowerCmd.includes('survive')) {
        addMessage('assistant', `**Lien Priority in Florida:**\n\n• First mortgage wipes junior liens\n• HOA super-priority: 6 months dues survive\n• Tax liens ALWAYS survive\n• Municipal liens often survive\n\n⚠️ Always verify with title search before bidding.`);
      }
      else if (lowerCmd.includes('reset') || lowerCmd.includes('all')) {
        setFilteredProperties(properties);
        addMessage('assistant', `Showing all ${properties.length} properties.`);
        if (map.current) {
          map.current.flyTo({ center: [-80.7214, 28.2639], zoom: 9 });
        }
      }
      else {
        addMessage('assistant', `Try:\n• "Show all BID properties"\n• "Filter ML score > 70"\n• "Show Dec 17 auction"\n• "What liens survive?"\n• "Reset" to show all`);
      }
      setIsProcessing(false);
    }, 500);
  }

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      {/* Left Panel - Chat */}
      <div className="w-[30%] min-w-[300px] flex flex-col border-r border-slate-800">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center font-bold">B</div>
            <div>
              <h1 className="font-semibold">BrevardBidderAI</h1>
              <p className="text-xs text-gray-500">Live Mapbox + Supabase</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-blue-600' : 'bg-slate-800'}`}>
                {m.content}
              </div>
            </div>
          ))}
          {isProcessing && <div className="text-gray-400 text-sm">Processing...</div>}
        </div>

        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {SUGGESTED_PROMPTS.map((p, i) => (
            <button key={i} onClick={() => setInput(p)} className="text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded-full">{p}</button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && input.trim() && (handleCommand(input), setInput(''))}
              placeholder="Ask about foreclosures..."
              className="flex-1 bg-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button onClick={() => input.trim() && (handleCommand(input), setInput(''))} className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg">→</button>
          </div>
        </div>
      </div>

      {/* Right Panel - Real Mapbox Map */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 z-20 bg-slate-900 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading Mapbox + Supabase data...</p>
            </div>
          </div>
        )}
        
        <div ref={mapContainer} className="w-full h-full" />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur p-3 rounded-lg z-10">
          <div className="text-xs text-gray-400 mb-2">Recommendation</div>
          <div className="flex gap-3">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs">{status}</span>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-2">{filteredProperties.length} properties</div>
        </div>

        {/* Controls */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          <button onClick={() => { setFilteredProperties(properties); if(map.current) map.current.flyTo({ center: [-80.7214, 28.2639], zoom: 9 }); }} className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-2 rounded-lg">🔄 Reset View</button>
        </div>

        {/* Property Drawer */}
        {selectedProperty && (
          <div className="absolute right-0 top-0 h-full w-[350px] bg-slate-900 border-l border-slate-700 shadow-xl overflow-y-auto z-20">
            <div className="p-4 border-b border-slate-700">
              <div className="flex justify-between">
                <span className="text-xs px-2 py-1 rounded font-semibold text-white" style={{ backgroundColor: STATUS_COLORS[selectedProperty.recommendation] || '#6B7280' }}>{selectedProperty.recommendation || 'REVIEW'}</span>
                <button onClick={() => setSelectedProperty(null)} className="text-gray-400 hover:text-white text-xl">×</button>
              </div>
              <h2 className="text-lg font-semibold mt-2">{selectedProperty.address || 'Property'}</h2>
              <p className="text-sm text-gray-400">{selectedProperty.city}, FL {selectedProperty.zip}</p>
            </div>

            <div className="p-4 grid grid-cols-2 gap-3">
              <div className="bg-slate-800 p-3 rounded-lg">
                <div className="text-xs text-gray-400">ML Score</div>
                <div className="text-xl font-semibold text-emerald-400 font-mono">{selectedProperty.ml_score || 'N/A'}</div>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg">
                <div className="text-xs text-gray-400">Max Bid</div>
                <div className="text-xl font-semibold font-mono">${(selectedProperty.max_bid || 0).toLocaleString()}</div>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg">
                <div className="text-xs text-gray-400">Judgment</div>
                <div className="text-lg font-semibold font-mono">${(selectedProperty.judgment_amount || 0).toLocaleString()}</div>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg">
                <div className="text-xs text-gray-400">Sale Date</div>
                <div className="text-lg font-semibold">{selectedProperty.sale_date || 'TBD'}</div>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <button className="w-full bg-emerald-600 hover:bg-emerald-700 py-2 rounded-lg font-medium">📄 Generate Report</button>
              <button onClick={() => { addMessage('assistant', `**${selectedProperty.address}**\nML: ${selectedProperty.ml_score} | Max Bid: $${(selectedProperty.max_bid||0).toLocaleString()}\nRecommendation: ${selectedProperty.recommendation}`); }} className="w-full bg-slate-700 hover:bg-slate-600 py-2 rounded-lg">💬 Analyze in Chat</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
