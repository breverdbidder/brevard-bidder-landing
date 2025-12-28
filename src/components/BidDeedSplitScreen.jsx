// BidDeedSplitScreen.jsx - Complete Split Screen Layout for Lovable
// LEFT: Property List (scrollable) + Chatbot (bottom)
// RIGHT: Map (consistent)
// Author: Ariel Shapira, Everest Capital USA
// For Lovable Project: 65905a7c-fd8c-4266-a8dc-b98c9e5f4d43

import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// WORKING Mapbox token (verified Dec 2025)
mapboxgl.accessToken = 'pk.eyJ1IjoiZXZlcmVzdDE4IiwiYSI6ImNtanB5cDQ5ZzF1eWgzaHB2cGVhZXdqbjMifQ.4RPrkTf84GL1-clmhmCnTw';

// Supabase connection
const SUPABASE_URL = 'https://mocerqjnksmhcjzxrewo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2VycWpua3NtaGNqenhyZXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MzI1MjYsImV4cCI6MjA4MDEwODUyNn0.ySFJIOngWWB0aqYra4PoGFuqcbdHOx1ZV6T9-klKQDw';

// Recommendation colors
const COLORS = { 
  BID: '#10B981',     // Green
  REVIEW: '#F59E0B',  // Amber  
  SKIP: '#EF4444'     // Red
};

// Auction Calendar (PropertyOnion Style)
const AUCTION_CALENDAR = {
  foreclosure: [
    { date: '2025-12-03', status: 'completed', label: 'Dec 3' },
    { date: '2025-12-10', status: 'completed', label: 'Dec 10' },
    { date: '2025-12-17', status: 'completed', label: 'Dec 17' },
    { date: '2026-01-07', status: 'upcoming', label: 'Jan 7' },
    { date: '2026-01-21', status: 'scheduled', label: 'Jan 21' }
  ],
  taxDeed: [
    { date: '2025-12-18', status: 'completed', label: 'Dec 18' },
    { date: '2026-01-15', status: 'scheduled', label: 'Jan 15' }
  ]
};

// Fetch properties from Supabase
async function fetchProperties(auctionDate, auctionType = 'foreclosure') {
  const table = auctionType === 'taxDeed' ? 'tax_deed_auctions' : 'auction_results';
  
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?auction_date=eq.${auctionDate}&select=*&order=recommendation.asc`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Supabase fetch error:', error);
    return [];
  }
}

// Property Card Component
function PropertyCard({ property, selected, onClick }) {
  const colors = {
    BID: { bg: 'bg-emerald-900/30', border: 'border-emerald-500', text: 'text-emerald-400', badge: '🟢' },
    REVIEW: { bg: 'bg-amber-900/30', border: 'border-amber-500', text: 'text-amber-400', badge: '🟡' },
    SKIP: { bg: 'bg-red-900/30', border: 'border-red-500', text: 'text-red-400', badge: '🔴' }
  };
  const style = colors[property.recommendation] || colors.REVIEW;
  
  return (
    <div 
      onClick={onClick}
      className={`p-3 border-b border-slate-700 cursor-pointer transition-all ${
        selected ? `${style.bg} ${style.border} border-l-4` : 'hover:bg-slate-800'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white flex items-center gap-2 truncate">
            {style.badge} {property.address}
          </h3>
          <p className="text-sm text-gray-400 truncate">
            {property.city || 'Brevard County'}, FL {property.zip || ''}
          </p>
        </div>
        <span className={`text-xs font-bold ${style.text} ml-2`}>
          {property.recommendation}
        </span>
      </div>
      <div className="flex justify-between mt-2 text-sm">
        <span className="text-gray-400">
          {property.beds || '?'}bd/{property.baths || '?'}ba | {(property.sqft || 0).toLocaleString()} sqft
        </span>
        <span className="text-emerald-400 font-mono">
          ${(property.max_bid || 0).toLocaleString()}
        </span>
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>Grade: {property.investment_grade || 'B'}</span>
        <span>Case: {(property.case_number || '').slice(-8)}</span>
      </div>
    </div>
  );
}

// Main Split Screen Component
export default function BidDeedSplitScreen() {
  // State
  const [auctionType, setAuctionType] = useState('foreclosure');
  const [selectedDate, setSelectedDate] = useState('2026-01-07');
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [mapStyle, setMapStyle] = useState('streets');
  const [loading, setLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Welcome to BidDeed.AI! Ask me about any property or auction date.' }
  ]);
  
  // Refs
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  // Load properties when date/type changes
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchProperties(selectedDate, auctionType);
      setProperties(data);
      setLoading(false);
    }
    loadData();
  }, [selectedDate, auctionType]);

  // Initialize Mapbox
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-80.65, 28.35],
      zoom: 9.5
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    mapInstance.current = map;

    return () => map.remove();
  }, []);

  // Update map style
  useEffect(() => {
    if (!mapInstance.current) return;
    const styleUrl = mapStyle === 'satellite' 
      ? 'mapbox://styles/mapbox/satellite-streets-v12'
      : 'mapbox://styles/mapbox/streets-v12';
    mapInstance.current.setStyle(styleUrl);
  }, [mapStyle]);

  // Add markers when properties change
  useEffect(() => {
    if (!mapInstance.current) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add new markers with REAL coordinates
    properties.forEach(property => {
      const lng = property.longitude;
      const lat = property.latitude;
      
      if (!lat || !lng) return;
      
      // Diamond marker
      const el = document.createElement('div');
      el.style.cssText = `
        width: 16px;
        height: 16px;
        background: ${COLORS[property.recommendation] || '#6B7280'};
        transform: rotate(45deg);
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      `;
      
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px; min-width: 200px;">
          <h3 style="font-weight: bold; margin: 0 0 4px 0;">${property.address}</h3>
          <p style="color: #666; font-size: 12px; margin: 0 0 8px 0;">
            ${property.city || ''}, FL ${property.zip || ''}
          </p>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: ${COLORS[property.recommendation]}; font-weight: bold;">
              ${property.recommendation}
            </span>
            <span style="font-family: monospace;">
              $${(property.max_bid || 0).toLocaleString()}
            </span>
          </div>
        </div>
      `);
      
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(mapInstance.current);
      
      el.addEventListener('click', () => {
        setSelectedProperty(property);
        flyToProperty(property);
      });
      
      markersRef.current.push(marker);
    });

    // Fit bounds
    if (properties.length > 0 && properties.some(p => p.latitude && p.longitude)) {
      const bounds = new mapboxgl.LngLatBounds();
      properties.forEach(p => {
        if (p.latitude && p.longitude) {
          bounds.extend([p.longitude, p.latitude]);
        }
      });
      mapInstance.current.fitBounds(bounds, { padding: 50 });
    }
  }, [properties]);

  // Fly to property
  const flyToProperty = (property) => {
    if (mapInstance.current && property.latitude && property.longitude) {
      mapInstance.current.flyTo({
        center: [property.longitude, property.latitude],
        zoom: 14,
        duration: 1000
      });
    }
  };

  // Handle chat
  const handleChat = () => {
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    
    // Simple response logic
    setTimeout(() => {
      let response = `Found ${properties.length} properties for ${selectedDate}.`;
      if (userMsg.toLowerCase().includes('bid')) {
        const bidProps = properties.filter(p => p.recommendation === 'BID');
        response = `There are ${bidProps.length} BID properties for ${selectedDate}.`;
      }
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 500);
  };

  // Zoom controls
  const zoomIn = () => mapInstance.current?.zoomIn();
  const zoomOut = () => mapInstance.current?.zoomOut();
  const resetView = () => mapInstance.current?.flyTo({ center: [-80.65, 28.35], zoom: 9.5 });

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Header */}
      <header className="h-14 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white">BidDeed.AI™</h1>
          <span className="text-amber-400 text-sm hidden sm:inline">The ForecastEngine™</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setAuctionType('foreclosure')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              auctionType === 'foreclosure' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            🏠 Foreclosure
          </button>
          <button 
            onClick={() => setAuctionType('taxDeed')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              auctionType === 'taxDeed' 
                ? 'bg-purple-600 text-white' 
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            📋 Tax Deed
          </button>
        </div>
      </header>
      
      {/* Main Content - Split Panel */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ==================== */}
        {/* LEFT PANEL (40%)     */}
        {/* ==================== */}
        <div className="w-2/5 min-w-[300px] border-r border-slate-700 flex flex-col">
          
          {/* Calendar Pills */}
          <div className="p-2 border-b border-slate-700 flex gap-2 overflow-x-auto shrink-0">
            {AUCTION_CALENDAR[auctionType].map(auction => (
              <button
                key={auction.date}
                onClick={() => setSelectedDate(auction.date)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedDate === auction.date
                    ? 'bg-amber-500 text-white'
                    : auction.status === 'completed'
                      ? 'bg-green-900/50 text-green-300 border border-green-700'
                      : 'bg-slate-800 text-gray-400 border border-slate-600'
                }`}
              >
                {auction.label} {auction.status === 'completed' && '✓'}
              </button>
            ))}
          </div>
          
          {/* Property Count */}
          <div className="px-3 py-2 border-b border-slate-700 text-xs text-gray-400 shrink-0">
            {loading ? 'Loading...' : `📍 ${properties.length} Properties`}
          </div>
          
          {/* Property List - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {properties.map(property => (
              <PropertyCard 
                key={property.id || property.case_number} 
                property={property}
                selected={selectedProperty?.id === property.id}
                onClick={() => {
                  setSelectedProperty(property);
                  flyToProperty(property);
                }}
              />
            ))}
            {properties.length === 0 && !loading && (
              <div className="p-4 text-center text-gray-500">
                No properties found for this date.
              </div>
            )}
          </div>
          
          {/* ==================== */}
          {/* CHATBOT (Left Bottom) */}
          {/* ==================== */}
          <div className="border-t border-slate-700 bg-slate-800 shrink-0">
            {/* Chat Messages */}
            <div className="h-24 overflow-y-auto p-2 space-y-1">
              {messages.slice(-5).map((msg, i) => (
                <div key={i} className={`text-xs ${msg.role === 'assistant' ? 'text-gray-300' : 'text-blue-300'}`}>
                  {msg.role === 'assistant' ? '🤖 ' : '👤 '}{msg.content}
                </div>
              ))}
            </div>
            
            {/* Chat Input */}
            <div className="p-2 border-t border-slate-700 flex gap-2">
              <input
                type="text"
                placeholder="Ask about properties..."
                className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChat()}
              />
              <button 
                onClick={handleChat} 
                className="px-3 py-1.5 bg-amber-500 text-slate-900 rounded font-medium hover:bg-amber-400 text-sm"
              >
                Send
              </button>
            </div>
          </div>
        </div>
        
        {/* ==================== */}
        {/* RIGHT PANEL (60%)    */}
        {/* MAP - Consistent     */}
        {/* ==================== */}
        <div className="w-3/5 flex flex-col">
          
          {/* Map Controls */}
          <div className="p-2 bg-slate-800 border-b border-slate-700 flex justify-between items-center shrink-0">
            <span className="text-xs text-gray-400">
              {selectedProperty ? `📍 ${selectedProperty.address}` : `Brevard County`}
            </span>
            
            {/* Street/Aerial Toggle */}
            <div className="flex bg-slate-700 rounded-lg p-0.5">
              <button
                onClick={() => setMapStyle('streets')}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  mapStyle === 'streets' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🗺️ Street
              </button>
              <button
                onClick={() => setMapStyle('satellite')}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  mapStyle === 'satellite' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🛰️ Aerial
              </button>
            </div>
            
            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <button onClick={zoomIn} className="w-7 h-7 bg-slate-700 rounded text-white font-bold hover:bg-slate-600">+</button>
              <button onClick={zoomOut} className="w-7 h-7 bg-slate-700 rounded text-white font-bold hover:bg-slate-600">−</button>
              <button onClick={resetView} className="px-2 h-7 bg-slate-700 rounded text-xs text-white hover:bg-slate-600">🎯</button>
            </div>
          </div>
          
          {/* Map Container */}
          <div ref={mapRef} className="flex-1" />
          
          {/* Legend */}
          <div className="p-2 bg-slate-800 border-t border-slate-700 flex gap-4 text-xs text-gray-400 shrink-0">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-emerald-500 rotate-45 inline-block"></span> BID
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-amber-500 rotate-45 inline-block"></span> REVIEW
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-500 rotate-45 inline-block"></span> SKIP
            </span>
            <span className="ml-auto text-gray-500">
              © 2025 BidDeed.AI™
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
