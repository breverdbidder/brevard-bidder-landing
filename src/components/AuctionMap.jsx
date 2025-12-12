// BidDeed.AI Auction Map Component
// Author: Ariel Shapira, Everest Capital USA

import React, { useState, useEffect, useRef } from 'react';

const STATUS_COLORS = {
  BID: '#10B981',
  REVIEW: '#F59E0B',
  SKIP: '#EF4444',
};

// Mock data for demo - will be replaced with Supabase data
const MOCK_PROPERTIES = [
  { id: 1, address: "123 Ocean Blvd, Satellite Beach", lat: 28.1761, lng: -80.5901, recommendation: "BID", ml_score: 87, max_bid: 185000, case_number: "05-2024-CA-012345" },
  { id: 2, address: "456 Riverside Dr, Melbourne", lat: 28.0836, lng: -80.6081, recommendation: "REVIEW", ml_score: 65, max_bid: 142000, case_number: "05-2024-CA-023456" },
  { id: 3, address: "789 Palm Ave, Cocoa Beach", lat: 28.3200, lng: -80.6076, recommendation: "SKIP", ml_score: 32, max_bid: 95000, case_number: "05-2024-CA-034567" },
  { id: 4, address: "321 Harbor View, Merritt Island", lat: 28.3591, lng: -80.6720, recommendation: "BID", ml_score: 91, max_bid: 225000, case_number: "05-2024-CA-045678" },
  { id: 5, address: "555 Brevard Way, Titusville", lat: 28.6122, lng: -80.8076, recommendation: "BID", ml_score: 78, max_bid: 165000, case_number: "05-2024-CA-056789" },
];

export function AuctionMap({ onPropertySelect, selectedProperty }) {
  const [properties] = useState(MOCK_PROPERTIES);
  const [heatmapMode, setHeatmapMode] = useState(false);

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-lg overflow-hidden">
      {/* Map Placeholder - Replace with Mapbox */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234B5563' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        {/* Brevard County Outline */}
        <div className="absolute inset-4 border border-slate-600 rounded-lg opacity-50" />
        
        {/* Property Markers */}
        {properties.map((property, idx) => (
          <div
            key={property.id}
            onClick={() => onPropertySelect(property)}
            className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-125 ${
              selectedProperty?.id === property.id ? 'scale-125 z-20' : 'z-10'
            }`}
            style={{
              left: `${20 + (idx * 15)}%`,
              top: `${25 + (idx * 12)}%`,
            }}
          >
            <div 
              className="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: STATUS_COLORS[property.recommendation] }}
            >
              {idx + 1}
            </div>
            {selectedProperty?.id === property.id && (
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 border border-slate-600 rounded-lg p-2 min-w-[180px] shadow-xl z-30">
                <p className="text-xs text-white font-semibold truncate">{property.address}</p>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">ML: {property.ml_score}</span>
                  <span className="text-xs text-emerald-400 font-mono">${property.max_bid.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <button 
          onClick={() => setHeatmapMode(!heatmapMode)}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            heatmapMode ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
          }`}
        >
          🗺️ {heatmapMode ? 'Heatmap ON' : 'Heatmap'}
        </button>
        <button className="bg-slate-800 hover:bg-slate-700 text-gray-300 px-3 py-2 rounded-lg text-xs">
          📍 Markers
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur p-3 rounded-lg">
        <div className="text-xs text-gray-400 mb-2">Recommendation</div>
        <div className="flex gap-3">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs text-white">{status}</span>
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          {properties.length} properties
        </div>
      </div>

      {/* Mapbox Attribution Placeholder */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-500">
        Map: Mapbox GL JS (demo mode)
      </div>
    </div>
  );
}

export default AuctionMap;
