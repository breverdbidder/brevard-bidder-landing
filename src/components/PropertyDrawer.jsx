// BrevardBidderAI Property Drawer Component
// Author: Ariel Shapira, Everest Capital USA

import React from 'react';

const STATUS_STYLES = {
  BID: 'bg-emerald-500',
  REVIEW: 'bg-amber-500',
  SKIP: 'bg-red-500',
};

function MetricCard({ label, value, highlight }) {
  return (
    <div className="bg-slate-800 rounded-lg p-3">
      <div className="text-xs text-gray-400">{label}</div>
      <div className={`text-lg font-semibold font-mono ${highlight ? 'text-emerald-400' : 'text-white'}`}>
        {value}
      </div>
    </div>
  );
}

export function PropertyDrawer({ property, onClose }) {
  if (!property) return null;

  // Demo data expansion
  const fullProperty = {
    ...property,
    city: 'Brevard County',
    zip: '32937',
    photo_url: 'https://via.placeholder.com/400x200/1e293b/64748b?text=Property+Photo',
    judgment_amount: property.max_bid ? Math.round(property.max_bid * 1.3) : 200000,
    arv: property.max_bid ? Math.round(property.max_bid * 1.8) : 350000,
    repairs: 25000,
    bid_judgment_ratio: 72,
    lien_count: 2,
    senior_lien_survives: false,
    sale_date: 'Dec 17, 2025',
    plaintiff: 'Deutsche Bank National Trust',
  };

  return (
    <div className="h-full bg-slate-900 border-l border-slate-700 overflow-y-auto animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4 z-10">
        <div className="flex justify-between items-start">
          <div>
            <span className={`${STATUS_STYLES[fullProperty.recommendation]} text-white text-xs px-2 py-1 rounded font-semibold`}>
              {fullProperty.recommendation}
            </span>
            <h2 className="text-lg font-semibold text-white mt-2">{fullProperty.address}</h2>
            <p className="text-sm text-gray-400">{fullProperty.city}, FL {fullProperty.zip}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>
      </div>

      {/* Photo */}
      <div className="p-4">
        <div className="w-full h-48 bg-slate-800 rounded-lg flex items-center justify-center">
          <span className="text-gray-500 text-sm">📷 BCPAO Photo</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <MetricCard label="ML Score" value={fullProperty.ml_score} highlight />
        <MetricCard label="Max Bid" value={`$${fullProperty.max_bid?.toLocaleString()}`} />
        <MetricCard label="Judgment" value={`$${fullProperty.judgment_amount?.toLocaleString()}`} />
        <MetricCard label="ARV" value={`$${fullProperty.arv?.toLocaleString()}`} />
        <MetricCard label="Repairs" value={`$${fullProperty.repairs?.toLocaleString()}`} />
        <MetricCard label="Bid/Judgment" value={`${fullProperty.bid_judgment_ratio}%`} />
      </div>

      {/* Lien Summary */}
      <div className="p-4 border-t border-slate-700">
        <h3 className="text-sm font-semibold text-white mb-2">Lien Analysis</h3>
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Liens Found</span>
            <span className="text-white">{fullProperty.lien_count}</span>
          </div>
          {fullProperty.senior_lien_survives ? (
            <div className="mt-2 bg-red-500/20 text-red-400 text-xs p-2 rounded">
              ⚠️ Senior lien survives foreclosure
            </div>
          ) : (
            <div className="mt-2 bg-emerald-500/20 text-emerald-400 text-xs p-2 rounded">
              ✅ All junior liens wiped
            </div>
          )}
        </div>
      </div>

      {/* Case Info */}
      <div className="p-4 border-t border-slate-700">
        <h3 className="text-sm font-semibold text-white mb-2">Case Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Case #</span>
            <span className="text-white font-mono">{fullProperty.case_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Auction Date</span>
            <span className="text-white">{fullProperty.sale_date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Plaintiff</span>
            <span className="text-white text-right max-w-[180px] truncate">{fullProperty.plaintiff}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-slate-700 space-y-2">
        <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
          📄 Generate Report
        </button>
        <button className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
          💬 Analyze in Chat
        </button>
        <button className="w-full bg-slate-800 hover:bg-slate-700 text-gray-300 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
          ➕ Add to Watchlist
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 text-center">
        <p className="text-xs text-gray-500">
          Powered by 12-Stage Agentic Pipeline
        </p>
      </div>
    </div>
  );
}

export default PropertyDrawer;
