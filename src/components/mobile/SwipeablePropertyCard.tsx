// components/mobile/SwipeablePropertyCard.tsx
// BidDeed.AI Tinder-Style Swipeable Property Cards
// Swipe right = BID, Swipe left = SKIP, Tap = View details

'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { 
  MapPin, 
  DollarSign, 
  Home, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  ChevronUp
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface PropertyData {
  case_number: string;
  address: string;
  city: string;
  zip: string;
  property_type: 'SFR' | 'Condo' | 'Townhouse' | 'Multi-Family' | 'Land';
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  year_built?: number;
  photo_url?: string;
  
  // Financial
  final_judgment: number;
  opening_bid: number;
  max_bid: number;
  arv_estimate: number;
  repair_estimate: number;
  roi_estimate: number;
  
  // ML Predictions
  ml_decision: 'BID' | 'REVIEW' | 'SKIP';
  ml_confidence: number;
  bid_judgment_ratio: number;
  
  // Risk indicators
  has_senior_liens: boolean;
  has_tax_certs: boolean;
  has_hoa_issues: boolean;
}

interface SwipeablePropertyCardProps {
  property: PropertyData;
  onDecision: (caseNumber: string, decision: 'BID' | 'SKIP' | 'REVIEW') => void;
  onViewDetails: (caseNumber: string) => void;
}

interface PropertyCardStackProps {
  properties: PropertyData[];
  onDecision: (caseNumber: string, decision: 'BID' | 'SKIP' | 'REVIEW') => void;
  onViewDetails: (caseNumber: string) => void;
  onEmpty?: () => void;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getDecisionColor(decision: 'BID' | 'REVIEW' | 'SKIP'): string {
  switch (decision) {
    case 'BID': return 'from-green-500 to-emerald-600';
    case 'REVIEW': return 'from-yellow-500 to-amber-600';
    case 'SKIP': return 'from-red-500 to-rose-600';
  }
}

function getPropertyTypeIcon(type: PropertyData['property_type']): string {
  switch (type) {
    case 'SFR': return '🏠';
    case 'Condo': return '🏢';
    case 'Townhouse': return '🏘️';
    case 'Multi-Family': return '🏛️';
    case 'Land': return '🌳';
    default: return '🏠';
  }
}

// ============================================================================
// SWIPEABLE PROPERTY CARD
// ============================================================================

export function SwipeablePropertyCard({ 
  property, 
  onDecision, 
  onViewDetails 
}: SwipeablePropertyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Motion values for drag
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  
  // Swipe indicators opacity
  const bidOpacity = useTransform(x, [0, 100], [0, 1]);
  const skipOpacity = useTransform(x, [-100, 0], [1, 0]);
  
  // Background color based on swipe direction
  const backgroundColor = useTransform(
    x,
    [-200, -50, 0, 50, 200],
    [
      'rgba(239, 68, 68, 0.2)',  // Red (SKIP)
      'rgba(239, 68, 68, 0.1)',
      'rgba(0, 0, 0, 0)',        // Neutral
      'rgba(34, 197, 94, 0.1)',
      'rgba(34, 197, 94, 0.2)',  // Green (BID)
    ]
  );

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      // Swiped right = BID
      onDecision(property.case_number, 'BID');
    } else if (info.offset.x < -threshold) {
      // Swiped left = SKIP
      onDecision(property.case_number, 'SKIP');
    }
    // If not past threshold, card returns to center
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      style={{ x, rotate, opacity, backgroundColor }}
      className="absolute inset-4 rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing"
    >
      {/* Card Background */}
      <div className="absolute inset-0 bg-slate-900 border border-slate-700" />

      {/* Property Image or Placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-900">
        {property.photo_url ? (
          <img
            src={property.photo_url}
            alt={property.address}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {getPropertyTypeIcon(property.property_type)}
          </div>
        )}

        {/* ML Decision Badge */}
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-white text-sm font-bold
                        bg-gradient-to-r ${getDecisionColor(property.ml_decision)}`}>
          {property.ml_decision} • {Math.round(property.ml_confidence * 100)}%
        </div>

        {/* Risk Indicators */}
        <div className="absolute top-4 left-4 flex gap-2">
          {property.has_senior_liens && (
            <div className="p-1.5 bg-red-500/90 rounded-full" title="Senior Liens">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
          )}
          {property.has_tax_certs && (
            <div className="p-1.5 bg-yellow-500/90 rounded-full" title="Tax Certificates">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
          )}
          {property.has_hoa_issues && (
            <div className="p-1.5 bg-orange-500/90 rounded-full" title="HOA Issues">
              <Home className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="relative p-4 space-y-3">
        {/* Address */}
        <div>
          <h3 className="text-lg font-bold text-white truncate">{property.address}</h3>
          <div className="flex items-center gap-1 text-gray-400 text-sm">
            <MapPin className="w-3 h-3" />
            <span>{property.city}, FL {property.zip}</span>
          </div>
        </div>

        {/* Property Details */}
        <div className="flex items-center gap-4 text-sm text-gray-300">
          <span>{property.property_type}</span>
          {property.bedrooms && <span>{property.bedrooms} bd</span>}
          {property.bathrooms && <span>{property.bathrooms} ba</span>}
          {property.sqft && <span>{property.sqft.toLocaleString()} sqft</span>}
        </div>

        {/* Financial Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/50 rounded-xl p-3">
            <div className="text-xs text-gray-400">Max Bid</div>
            <div className="text-lg font-bold text-green-400">
              {formatCurrency(property.max_bid)}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3">
            <div className="text-xs text-gray-400">Est. ROI</div>
            <div className="text-lg font-bold text-indigo-400">
              {property.roi_estimate}%
            </div>
          </div>
        </div>

        {/* Bid/Judgment Ratio Bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Bid/Judgment Ratio</span>
            <span className={property.bid_judgment_ratio >= 0.75 ? 'text-green-400' : 
                            property.bid_judgment_ratio >= 0.6 ? 'text-yellow-400' : 'text-red-400'}>
              {Math.round(property.bid_judgment_ratio * 100)}%
            </span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${property.bid_judgment_ratio * 100}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`h-full rounded-full ${
                property.bid_judgment_ratio >= 0.75 ? 'bg-green-500' :
                property.bid_judgment_ratio >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
            />
          </div>
        </div>

        {/* Expand Button */}
        <button
          onClick={() => onViewDetails(property.case_number)}
          className="w-full py-2 flex items-center justify-center gap-2 
                     text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <Info className="w-4 h-4" />
          <span className="text-sm font-medium">View Full Analysis</span>
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      {/* Swipe Indicators */}
      <motion.div
        className="absolute top-1/2 left-8 -translate-y-1/2 flex items-center gap-2 
                   text-red-500 text-2xl font-bold"
        style={{ opacity: skipOpacity }}
      >
        <XCircle className="w-12 h-12" />
        <span>SKIP</span>
      </motion.div>

      <motion.div
        className="absolute top-1/2 right-8 -translate-y-1/2 flex items-center gap-2 
                   text-green-500 text-2xl font-bold"
        style={{ opacity: bidOpacity }}
      >
        <span>BID</span>
        <CheckCircle className="w-12 h-12" />
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// PROPERTY CARD STACK (Manages multiple cards)
// ============================================================================

export function PropertyCardStack({
  properties,
  onDecision,
  onViewDetails,
  onEmpty,
}: PropertyCardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [decidedProperties, setDecidedProperties] = useState<Set<string>>(new Set());

  const handleDecision = (caseNumber: string, decision: 'BID' | 'SKIP' | 'REVIEW') => {
    setDecidedProperties((prev) => new Set(prev).add(caseNumber));
    onDecision(caseNumber, decision);
    
    // Move to next card
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      if (currentIndex >= properties.length - 1) {
        onEmpty?.();
      }
    }, 200);
  };

  const remainingProperties = properties.filter(
    (p) => !decidedProperties.has(p.case_number)
  );

  if (remainingProperties.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <span className="text-6xl mb-4">🎉</span>
        <h3 className="text-xl font-bold text-white mb-2">All Done!</h3>
        <p className="text-gray-400">You've reviewed all properties for this auction.</p>
      </div>
    );
  }

  // Show current card + next 2 stacked behind
  const visibleCards = remainingProperties.slice(0, 3);

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Stack of cards (render in reverse so first card is on top) */}
      {visibleCards.map((property, index) => {
        const isTop = index === 0;
        const scale = 1 - index * 0.05;
        const y = index * 10;

        return (
          <motion.div
            key={property.case_number}
            initial={{ scale, y, opacity: 1 - index * 0.2 }}
            animate={{ scale, y, opacity: 1 - index * 0.2 }}
            style={{ zIndex: visibleCards.length - index }}
            className="absolute inset-0"
          >
            {isTop ? (
              <SwipeablePropertyCard
                property={property}
                onDecision={handleDecision}
                onViewDetails={onViewDetails}
              />
            ) : (
              // Background cards (not interactive)
              <div 
                className="absolute inset-4 rounded-3xl bg-slate-900 border border-slate-700 
                           overflow-hidden pointer-events-none"
              />
            )}
          </motion.div>
        );
      })}

      {/* Bottom Action Buttons (alternative to swiping) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-center gap-6 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleDecision(remainingProperties[0].case_number, 'SKIP')}
          className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 
                     flex items-center justify-center text-red-500"
        >
          <XCircle className="w-8 h-8" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleDecision(remainingProperties[0].case_number, 'REVIEW')}
          className="w-12 h-12 rounded-full bg-yellow-500/20 border-2 border-yellow-500 
                     flex items-center justify-center text-yellow-500"
        >
          <Info className="w-6 h-6" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleDecision(remainingProperties[0].case_number, 'BID')}
          className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 
                     flex items-center justify-center text-green-500"
        >
          <CheckCircle className="w-8 h-8" />
        </motion.button>
      </div>

      {/* Progress Indicator */}
      <div className="absolute top-4 left-4 right-4 z-50">
        <div className="flex gap-1">
          {properties.map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-1 rounded-full transition-colors ${
                index < properties.length - remainingProperties.length
                  ? 'bg-indigo-500'
                  : index === properties.length - remainingProperties.length
                  ? 'bg-indigo-400'
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
        <div className="text-center text-xs text-gray-400 mt-2">
          {properties.length - remainingProperties.length + 1} of {properties.length}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MOCK DATA
// ============================================================================

export const mockPropertyData: PropertyData[] = [
  {
    case_number: '2024-CA-012345',
    address: '1234 Palm Beach Blvd',
    city: 'Melbourne',
    zip: '32940',
    property_type: 'SFR',
    bedrooms: 4,
    bathrooms: 2.5,
    sqft: 2400,
    year_built: 2005,
    photo_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    final_judgment: 315000,
    opening_bid: 100,
    max_bid: 245000,
    arv_estimate: 425000,
    repair_estimate: 35000,
    roi_estimate: 23,
    ml_decision: 'BID',
    ml_confidence: 0.87,
    bid_judgment_ratio: 0.78,
    has_senior_liens: false,
    has_tax_certs: false,
    has_hoa_issues: false,
  },
  {
    case_number: '2024-CA-012346',
    address: '567 Ocean View Dr',
    city: 'Satellite Beach',
    zip: '32937',
    property_type: 'Condo',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200,
    year_built: 2010,
    photo_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
    final_judgment: 185000,
    opening_bid: 100,
    max_bid: 0,
    arv_estimate: 265000,
    repair_estimate: 15000,
    roi_estimate: -5,
    ml_decision: 'SKIP',
    ml_confidence: 0.92,
    bid_judgment_ratio: 0.52,
    has_senior_liens: true,
    has_tax_certs: false,
    has_hoa_issues: true,
  },
  {
    case_number: '2024-CA-012347',
    address: '890 Riverside Ct',
    city: 'Merritt Island',
    zip: '32953',
    property_type: 'Townhouse',
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1800,
    year_built: 2015,
    photo_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    final_judgment: 245000,
    opening_bid: 100,
    max_bid: 185000,
    arv_estimate: 340000,
    repair_estimate: 25000,
    roi_estimate: 18,
    ml_decision: 'REVIEW',
    ml_confidence: 0.65,
    bid_judgment_ratio: 0.67,
    has_senior_liens: false,
    has_tax_certs: true,
    has_hoa_issues: false,
  },
];

export default SwipeablePropertyCard;
