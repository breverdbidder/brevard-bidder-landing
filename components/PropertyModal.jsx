// BrevardBidderAI - Property Detail Modal
// Vibe Coding: Detailed views with smooth transitions
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

import React, { useEffect } from 'react';

export function PropertyModal({ property, isOpen, onClose }) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !property) return null;

  const recColors = {
    BID: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
    REVIEW: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
    SKIP: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  };

  const rec = recColors[property.recommendation] || recColors.REVIEW;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto glass rounded-2xl animate-scaleIn">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur rounded-t-2xl">
          <h2 id="modal-title" className="text-xl font-bold text-white">Property Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Photo */}
        {property.photo_url && (
          <div className="h-48 overflow-hidden">
            <img 
              src={property.photo_url} 
              alt={property.property_address}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Address & Recommendation */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                {property.property_address || 'Address TBD'}
              </h3>
              <p className="text-neutral-400 text-sm">{property.case_number}</p>
            </div>
            <span className={`px-4 py-2 rounded-xl text-sm font-bold border ${rec.bg} ${rec.text} ${rec.border}`}>
              {property.recommendation || 'REVIEW'}
            </span>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricBox label="Judgment" value={`$${(property.judgment_amount || 0).toLocaleString()}`} />
            <MetricBox label="Opening Bid" value={`$${(property.opening_bid || 0).toLocaleString()}`} />
            <MetricBox label="Bid/Judgment" value={`${property.bid_judgment_ratio || 0}%`} />
            <MetricBox label="ML Probability" value={`${property.ml_probability || 0}%`} highlight />
          </div>

          {/* ML Prediction Bar */}
          {property.ml_probability && (
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-400">Third-Party Purchase Probability</span>
                <span className="text-sm font-semibold text-blue-400">{property.ml_probability}%</span>
              </div>
              <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                  style={{ width: `${property.ml_probability}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                Based on XGBoost model with 64.4% historical accuracy
              </p>
            </div>
          )}

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailRow label="Plaintiff" value={property.plaintiff || 'Unknown'} />
            <DetailRow label="Defendant" value={property.defendant || 'Unknown'} />
            <DetailRow label="Property Type" value={property.property_type || 'SFR'} />
            <DetailRow label="Auction Date" value={property.auction_date || 'TBD'} />
          </div>

          {/* Max Bid Calculation */}
          {property.max_bid && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <h4 className="text-blue-400 font-semibold mb-2">Max Bid Recommendation</h4>
              <p className="text-2xl font-bold text-white">
                ${property.max_bid.toLocaleString()}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Formula: (ARV × 70%) - Repairs - $10K - MIN($25K, 15% × ARV)
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-neutral-800 bg-neutral-900/90 backdrop-blur rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
          >
            Close
          </button>
          <button
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

function MetricBox({ label, value, highlight = false }) {
  return (
    <div className={`rounded-xl p-3 ${highlight ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-neutral-800/50'}`}>
      <p className="text-xs text-neutral-400 mb-1">{label}</p>
      <p className={`text-lg font-bold ${highlight ? 'text-blue-400' : 'text-white'}`}>{value}</p>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-neutral-800">
      <span className="text-sm text-neutral-400">{label}</span>
      <span className="text-sm text-white font-medium">{value}</span>
    </div>
  );
}

export default PropertyModal;
