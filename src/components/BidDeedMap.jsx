// BidDeedMap.jsx - Fixed Map Component for Lovable
// Fixes: Accurate coordinates from Supabase, Calendar, Foreclosure/Tax Deed tabs
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

// Fetch properties from Supabase with REAL coordinates
async function fetchProperties(auctionDate, auctionType = 'foreclosure') {
  const table = auctionType === 'taxDeed' ? 'tax_deed_auctions' : 'auction_results';
  
  const params = new URLSearchParams();
  params.append('select', '*');
  params.append('auction_date', `eq.${auctionDate}`);
  params.append('order', 'recommendation.asc');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Supabase fetch error:', error);
    return [];
  }
}

export default function BidDeedMap({ onPropertySelect, selectedProperty }) {
  const [auctionType, setAuctionType] = useState('foreclosure');
  const [selectedDate, setSelectedDate] = useState('2026-01-07');
  const [properties, setProperties] = useState([]);
  const [mapStyle, setMapStyle] = useState('streets');
  const [loading, setLoading] = useState(false);
  
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
      style: mapStyle === 'satellite' 
        ? 'mapbox://styles/mapbox/satellite-streets-v12'
        : 'mapbox://styles/mapbox/streets-v12',
      center: [-80.65, 28.35],  // Brevard County center
      zoom: 9.5
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

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

    // Add new markers
    properties.forEach(property => {
      // Use REAL coordinates from Supabase
      const lng = property.longitude;
      const lat = property.latitude;
      
      if (!lat || !lng) return;
      
      // Create diamond marker
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
      
      // Create popup
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
      
      el.addEventListener('click', () => onPropertySelect?.(property));
      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (properties.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      properties.forEach(p => {
        if (p.latitude && p.longitude) {
          bounds.extend([p.longitude, p.latitude]);
        }
      });
      mapInstance.current.fitBounds(bounds, { padding: 50 });
    }
  }, [properties, onPropertySelect]);

  // Zoom controls
  const zoomIn = () => mapInstance.current?.zoomIn();
  const zoomOut = () => mapInstance.current?.zoomOut();
  const resetView = () => mapInstance.current?.flyTo({ center: [-80.65, 28.35], zoom: 9.5 });

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Auction Type Tabs */}
      <div className="flex gap-2 p-2 border-b border-slate-700">
        <button 
          onClick={() => setAuctionType('foreclosure')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            auctionType === 'foreclosure' 
              ? 'bg-blue-600 text-white shadow' 
              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
          }`}
        >
          🏠 Foreclosure
        </button>
        <button 
          onClick={() => setAuctionType('taxDeed')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            auctionType === 'taxDeed' 
              ? 'bg-purple-600 text-white shadow' 
              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
          }`}
        >
          📋 Tax Deed
        </button>
      </div>

      {/* Calendar Pills */}
      <div className="flex gap-2 p-2 border-b border-slate-700 overflow-x-auto">
        {AUCTION_CALENDAR[auctionType].map(auction => (
          <button
            key={auction.date}
            onClick={() => setSelectedDate(auction.date)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedDate === auction.date
                ? 'bg-amber-500 text-white shadow'
                : auction.status === 'completed'
                  ? 'bg-green-900/50 text-green-300 border border-green-700'
                  : 'bg-slate-800 text-gray-400 border border-slate-600 hover:bg-slate-700'
            }`}
          >
            {auction.label}
            {auction.status === 'completed' && ' ✓'}
          </button>
        ))}
      </div>

      {/* Map Controls */}
      <div className="flex justify-between items-center p-2 bg-slate-800 border-b border-slate-700">
        <span className="text-xs text-gray-400">
          📍 {loading ? 'Loading...' : `${properties.length} Properties`}
        </span>
        
        {/* Street/Aerial Toggle */}
        <div className="flex bg-slate-700 rounded-lg p-0.5">
          <button
            onClick={() => setMapStyle('streets')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
              mapStyle === 'streets' 
                ? 'bg-blue-600 text-white shadow' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🗺️ Street
          </button>
          <button
            onClick={() => setMapStyle('satellite')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
              mapStyle === 'satellite' 
                ? 'bg-blue-600 text-white shadow' 
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
      <div className="p-2 bg-slate-800 border-t border-slate-700 flex gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-emerald-500 rotate-45 inline-block"></span> BID
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-amber-500 rotate-45 inline-block"></span> REVIEW
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-red-500 rotate-45 inline-block"></span> SKIP
        </span>
      </div>
    </div>
  );
}
