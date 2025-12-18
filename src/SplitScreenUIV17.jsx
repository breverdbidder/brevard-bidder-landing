// BidDeed.AI V17 - Split-Screen UI/UX Interface
// Modern Shadcn UI components with real-time auction data
// © 2025 Everest Capital USA. All Rights Reserved.

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============ SHADCN-STYLE UI PRIMITIVES ============

const cn = (...classes) => classes.filter(Boolean).join(' ');

// Card
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm", className)}
    {...props}
  />
));

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 border-b border-white/10", className)} {...props} />
));

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4", className)} {...props} />
));

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-lg font-semibold text-white", className)} {...props} />
));

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-slate-400", className)} {...props} />
));

// Badge
const badgeVariants = {
  default: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  destructive: 'bg-red-500/20 text-red-400 border-red-500/30',
  outline: 'bg-transparent text-slate-300 border-white/20',
  secondary: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

const Badge = ({ variant = 'default', className, children }) => (
  <span className={cn(
    "inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border",
    badgeVariants[variant],
    className
  )}>
    {children}
  </span>
);

// Button
const buttonVariants = {
  default: 'bg-amber-500 text-slate-900 hover:bg-amber-400 shadow-lg shadow-amber-500/25',
  secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/10',
  ghost: 'bg-transparent text-slate-300 hover:bg-white/10 hover:text-white',
  destructive: 'bg-red-500 text-white hover:bg-red-600',
  outline: 'border border-amber-500/50 text-amber-400 hover:bg-amber-500/10',
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  default: 'px-4 py-2.5',
  lg: 'px-6 py-3 text-lg',
  icon: 'w-10 h-10 p-0',
};

const Button = React.forwardRef(({ variant = 'default', size = 'default', className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "font-semibold rounded-lg transition-all inline-flex items-center justify-center",
      buttonVariants[variant],
      buttonSizes[size],
      className
    )}
    {...props}
  >
    {children}
  </button>
));

// Progress
const Progress = ({ value = 0, className }) => (
  <div className={cn("h-2 bg-white/10 rounded-full overflow-hidden", className)}>
    <motion.div
      className="h-full bg-gradient-to-r from-amber-500 to-emerald-500"
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    />
  </div>
);

// Input
const Input = React.forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg",
      "text-white placeholder-slate-500",
      "focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25",
      "transition-colors",
      className
    )}
    {...props}
  />
));

// Skeleton
const Skeleton = ({ className }) => (
  <div className={cn("animate-pulse bg-white/10 rounded", className)} />
);

// Separator
const Separator = ({ className, orientation = 'horizontal' }) => (
  <div className={cn(
    "bg-white/10",
    orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
    className
  )} />
);

// ScrollArea (simplified)
const ScrollArea = ({ className, children }) => (
  <div className={cn("overflow-auto scrollbar-thin scrollbar-thumb-white/10", className)}>
    {children}
  </div>
);

// Tooltip (simplified)
const Tooltip = ({ children, content }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap z-50"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============ ICONS ============
const Icons = {
  Search: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Filter: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>,
  Download: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  Share: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>,
  Star: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  ChevronRight: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  AlertTriangle: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  CheckCircle: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  XCircle: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Home: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Map: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>,
};

// ============ SAMPLE DATA ============
const SAMPLE_PROPERTIES = [
  {
    id: '1',
    caseNumber: '250179',
    parcelId: '3021477',
    address: '202 Ivory Coral Ln #304',
    city: 'Merritt Island',
    zip: '32953',
    propertyType: 'CONDO',
    sqft: 1248,
    yearBuilt: 2006,
    bedrooms: 2,
    bathrooms: 2,
    marketValue: 185000,
    openingBid: 12847.23,
    finalJudgment: 15420.88,
    maxBid: 98500,
    bidJudgmentRatio: 83.3,
    recommendation: 'BID',
    mlProbability: 0.42,
    mlExpectedPrice: 138750,
    seniorMortgageSurvives: false,
    liens: [
      { type: 'HOA Lien', holder: 'Cape Crossing HOA', amount: 8420.50, survives: false },
      { type: 'Tax Certificate', holder: 'Brevard County', amount: 4426.73, survives: false },
    ],
    winProbabilityMatrix: {
      '10%': 46250, '20%': 55500, '30%': 64750, '40%': 74000,
      '50%': 83250, '60%': 92500, '70%': 101750, '80%': 111000, '95%': 129500,
    },
    recommendationReasons: [
      'Bid/Judgment ratio 83.3% exceeds 75% threshold',
      'No senior mortgage detected',
      'Target ZIP code 32953 (Merritt Island)',
      'Strong rental demand in area',
    ],
    riskFactors: ['Condo: Verify HOA estoppel letter'],
  },
  {
    id: '2',
    caseNumber: '250216',
    parcelId: '3021458',
    address: '202 Ivory Coral Ln #201',
    city: 'Merritt Island',
    zip: '32953',
    propertyType: 'CONDO',
    sqft: 1100,
    yearBuilt: 2006,
    bedrooms: 2,
    bathrooms: 2,
    marketValue: 175000,
    openingBid: 11234.56,
    finalJudgment: 14305.00,
    maxBid: 92000,
    bidJudgmentRatio: 78.5,
    recommendation: 'BID',
    mlProbability: 0.38,
    mlExpectedPrice: 131250,
    seniorMortgageSurvives: false,
    liens: [
      { type: 'HOA Lien', holder: 'Cape Crossing HOA', amount: 6890.00, survives: false },
      { type: 'Tax Certificate', holder: 'Brevard County', amount: 4344.56, survives: false },
    ],
    winProbabilityMatrix: {
      '10%': 43750, '20%': 52500, '40%': 70000, '60%': 87500, '80%': 105000, '95%': 122500,
    },
    recommendationReasons: [
      'Bid/Judgment ratio 78.5% exceeds 75% threshold',
      'Same building as Case 250179 - bulk opportunity',
    ],
    riskFactors: [],
  },
  {
    id: '3',
    caseNumber: '250422',
    parcelId: '2000369',
    address: '1234 US Highway 1',
    city: 'Mims',
    zip: '32754',
    propertyType: 'VACANT LAND',
    sqft: 0,
    yearBuilt: 0,
    bedrooms: 0,
    bathrooms: 0,
    marketValue: 28800,
    openingBid: 8234.12,
    finalJudgment: 12420.00,
    maxBid: 15000,
    bidJudgmentRatio: 66.3,
    recommendation: 'REVIEW',
    mlProbability: 0.28,
    mlExpectedPrice: 21600,
    seniorMortgageSurvives: false,
    liens: [
      { type: 'Tax Certificate', holder: 'Brevard County', amount: 8234.12, survives: false },
    ],
    winProbabilityMatrix: {
      '10%': 7200, '20%': 8640, '40%': 11520, '60%': 14400, '80%': 17280, '95%': 20160,
    },
    recommendationReasons: [
      'Bid/Judgment ratio 66.3% in REVIEW range (60-75%)',
      'Vacant land - limited financing options',
    ],
    riskFactors: ['Non-target ZIP', 'Vacant land limited exit strategies'],
  },
  {
    id: '4',
    caseNumber: '250501',
    parcelId: '2512890',
    address: '567 Palm Bay Rd',
    city: 'Palm Bay',
    zip: '32905',
    propertyType: 'SINGLE FAMILY',
    sqft: 1850,
    yearBuilt: 1998,
    bedrooms: 3,
    bathrooms: 2,
    marketValue: 285000,
    openingBid: 145000.00,
    finalJudgment: 198500.00,
    maxBid: 125000,
    bidJudgmentRatio: 52.1,
    recommendation: 'SKIP',
    mlProbability: 0.65,
    mlExpectedPrice: 213750,
    seniorMortgageSurvives: false,
    liens: [
      { type: 'First Mortgage', holder: 'Wells Fargo', amount: 145000.00, survives: false },
      { type: 'Tax Certificate', holder: 'Brevard County', amount: 3500.00, survives: false },
    ],
    winProbabilityMatrix: {
      '10%': 71250, '20%': 85500, '40%': 114000, '60%': 142500, '80%': 171000, '95%': 199500,
    },
    recommendationReasons: [
      'Bid/Judgment ratio 52.1% below 60% threshold',
      'High competition probability (65%)',
    ],
    riskFactors: ['Overbid likely', 'Thin margin'],
  },
  {
    id: '5',
    caseNumber: '250612',
    parcelId: '2845123',
    address: '890 Satellite Blvd #102',
    city: 'Satellite Beach',
    zip: '32937',
    propertyType: 'CONDO',
    sqft: 950,
    yearBuilt: 2010,
    bedrooms: 2,
    bathrooms: 1,
    marketValue: 225000,
    openingBid: 18500.00,
    finalJudgment: 22400.00,
    maxBid: 0,
    bidJudgmentRatio: 0,
    recommendation: 'DO_NOT_BID',
    mlProbability: 0.15,
    mlExpectedPrice: 168750,
    seniorMortgageSurvives: true,
    seniorMortgageAmount: 165000,
    liens: [
      { type: 'HOA Lien', holder: 'Satellite Shores HOA', amount: 18500.00, survives: false },
      { type: 'First Mortgage', holder: 'Chase Bank', amount: 165000.00, survives: true },
    ],
    winProbabilityMatrix: {},
    recommendationReasons: [
      'HOA foreclosure - senior mortgage survives',
      'Buyer inherits $165,000 mortgage debt',
    ],
    riskFactors: ['CRITICAL: Senior mortgage survives sale', 'Buyer assumes $165K debt'],
  },
];

// ============ RESIZABLE SPLIT PANEL ============
const ResizablePanels = ({ leftPanel, rightPanel, defaultLeftWidth = 40 }) => {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = React.useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
    setLeftWidth(Math.min(Math.max(newWidth, 25), 75));
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div ref={containerRef} className="flex h-full w-full select-none">
      <div style={{ width: `${leftWidth}%` }} className="h-full overflow-hidden">
        {leftPanel}
      </div>
      
      <div
        className={cn(
          "w-1 cursor-col-resize transition-colors relative group",
          isDragging ? "bg-amber-500" : "bg-white/10 hover:bg-amber-500/50"
        )}
        onMouseDown={() => setIsDragging(true)}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-1 h-8 bg-white/30 rounded-full" />
        </div>
      </div>
      
      <div style={{ width: `${100 - leftWidth}%` }} className="h-full overflow-hidden">
        {rightPanel}
      </div>
    </div>
  );
};

// ============ PROPERTY LIST PANEL ============
const PropertyListPanel = ({ properties, selectedId, onSelect, auctionInfo }) => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('ratio');

  const filteredProperties = properties
    .filter(p => {
      if (filter !== 'all' && p.recommendation !== filter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return p.address.toLowerCase().includes(query) ||
               p.caseNumber.includes(query) ||
               p.city.toLowerCase().includes(query);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'ratio') return b.bidJudgmentRatio - a.bidJudgmentRatio;
      if (sortBy === 'value') return b.marketValue - a.marketValue;
      if (sortBy === 'bid') return a.openingBid - b.openingBid;
      return 0;
    });

  const stats = {
    total: properties.length,
    bid: properties.filter(p => p.recommendation === 'BID').length,
    review: properties.filter(p => p.recommendation === 'REVIEW').length,
    skip: properties.filter(p => p.recommendation === 'SKIP').length,
    doNotBid: properties.filter(p => p.recommendation === 'DO_NOT_BID').length,
  };

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Header */}
      <div className="p-4 border-b border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">{auctionInfo?.date || 'Dec 18, 2025'}</h2>
            <p className="text-sm text-slate-400">{auctionInfo?.type || 'Tax Deed Sale'} • Brevard County</p>
          </div>
          <Badge variant="success" className="text-sm">
            {stats.total} Properties
          </Badge>
        </div>

        {/* Search */}
        <div className="relative">
          <Icons.Search />
          <Input
            placeholder="Search address, case #, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <Icons.Search />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'all', label: 'All', count: stats.total },
            { value: 'BID', label: 'BID', count: stats.bid, variant: 'success' },
            { value: 'REVIEW', label: 'REVIEW', count: stats.review, variant: 'default' },
            { value: 'SKIP', label: 'SKIP', count: stats.skip, variant: 'secondary' },
            { value: 'DO_NOT_BID', label: 'DNB', count: stats.doNotBid, variant: 'destructive' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5",
                filter === f.value
                  ? f.variant === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : f.variant === 'destructive' ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : f.variant === 'default' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-white/20 text-white border border-white/30'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-transparent'
              )}
            >
              {f.label}
              <span className="opacity-60">({f.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Property List */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-2">
          {filteredProperties.map((property) => (
            <motion.div
              key={property.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => onSelect(property.id)}
              className={cn(
                "p-3 rounded-xl border cursor-pointer transition-all",
                selectedId === property.id
                  ? "bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {property.address}
                  </div>
                  <div className="text-xs text-slate-500">
                    {property.city}, FL {property.zip} • {property.propertyType}
                  </div>
                </div>
                <Badge variant={
                  property.recommendation === 'BID' ? 'success' :
                  property.recommendation === 'REVIEW' ? 'default' :
                  property.recommendation === 'DO_NOT_BID' ? 'destructive' : 'secondary'
                }>
                  {property.recommendation === 'DO_NOT_BID' ? 'DNB' : property.recommendation}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">
                    <span className="text-slate-500">Open:</span> ${property.openingBid?.toLocaleString()}
                  </span>
                  <span className="text-slate-400">
                    <span className="text-slate-500">Value:</span> ${property.marketValue?.toLocaleString()}
                  </span>
                </div>
                <span className={cn(
                  "font-semibold",
                  property.bidJudgmentRatio >= 75 ? "text-emerald-400" :
                  property.bidJudgmentRatio >= 60 ? "text-amber-400" : "text-slate-400"
                )}>
                  {property.bidJudgmentRatio > 0 ? `${property.bidJudgmentRatio}%` : 'N/A'}
                </span>
              </div>

              {/* Risk indicator for DO_NOT_BID */}
              {property.recommendation === 'DO_NOT_BID' && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
                  <Icons.AlertTriangle />
                  <span>Senior mortgage survives</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer Stats */}
      <div className="p-3 border-t border-white/10">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <div className="text-lg font-bold text-emerald-400">{stats.bid}</div>
            <div className="text-[10px] text-slate-500 uppercase">BID</div>
          </div>
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <div className="text-lg font-bold text-amber-400">{stats.review}</div>
            <div className="text-[10px] text-slate-500 uppercase">Review</div>
          </div>
          <div className="p-2 bg-slate-500/10 rounded-lg">
            <div className="text-lg font-bold text-slate-400">{stats.skip}</div>
            <div className="text-[10px] text-slate-500 uppercase">Skip</div>
          </div>
          <div className="p-2 bg-red-500/10 rounded-lg">
            <div className="text-lg font-bold text-red-400">{stats.doNotBid}</div>
            <div className="text-[10px] text-slate-500 uppercase">DNB</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ PROPERTY DETAIL PANEL ============
const PropertyDetailPanel = ({ property }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!property) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900">
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
            <Icons.Home />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Select a Property</h3>
          <p className="text-sm text-slate-400 max-w-xs">
            Click on a property from the list to view detailed analysis
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'liens', label: 'Liens' },
    { id: 'ml', label: 'ML Analysis' },
    { id: 'comps', label: 'Comps' },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-white">{property.address}</h2>
            <p className="text-sm text-slate-400">
              {property.city}, FL {property.zip} • Case #{property.caseNumber}
            </p>
          </div>
          <Badge 
            variant={
              property.recommendation === 'BID' ? 'success' :
              property.recommendation === 'REVIEW' ? 'default' :
              property.recommendation === 'DO_NOT_BID' ? 'destructive' : 'secondary'
            }
            className="text-base px-4 py-1.5"
          >
            {property.recommendation}
          </Badge>
        </div>
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Market Value', value: `$${property.marketValue?.toLocaleString()}`, color: 'white' },
            { label: 'Opening Bid', value: `$${property.openingBid?.toLocaleString()}`, color: 'amber' },
            { label: 'Max Bid', value: property.maxBid > 0 ? `$${property.maxBid?.toLocaleString()}` : 'N/A', color: 'emerald' },
            { label: 'Bid/Judgment', value: property.bidJudgmentRatio > 0 ? `${property.bidJudgmentRatio}%` : 'N/A', color: property.bidJudgmentRatio >= 75 ? 'emerald' : property.bidJudgmentRatio >= 60 ? 'amber' : 'slate' },
          ].map((stat, i) => (
            <Card key={i} className="p-3">
              <div className="text-xs text-slate-500 mb-1">{stat.label}</div>
              <div className={cn(
                "text-lg font-bold",
                stat.color === 'amber' ? 'text-amber-400' :
                stat.color === 'emerald' ? 'text-emerald-400' :
                stat.color === 'slate' ? 'text-slate-400' : 'text-white'
              )}>
                {stat.value}
              </div>
            </Card>
          ))}
        </div>

        {/* Senior Mortgage Warning */}
        {property.seniorMortgageSurvives && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3"
          >
            <Icons.AlertTriangle />
            <div>
              <div className="text-red-400 font-semibold">⚠️ Senior Mortgage Survives Sale</div>
              <div className="text-sm text-slate-300">
                Buyer inherits ${property.seniorMortgageAmount?.toLocaleString()} mortgage debt. 
                This is an HOA foreclosure - the first mortgage is NOT wiped out.
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Tabs */}
      <div className="px-4 py-2 border-b border-white/10">
        <div className="flex gap-1 p-1 bg-white/5 rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                activeTab === tab.id
                  ? "bg-amber-500 text-slate-900"
                  : "text-slate-400 hover:text-white hover:bg-white/10"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <ScrollArea className="flex-1 p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Property Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Property Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Type', value: property.propertyType },
                      { label: 'SqFt', value: property.sqft > 0 ? property.sqft.toLocaleString() : 'N/A' },
                      { label: 'Year Built', value: property.yearBuilt || 'N/A' },
                      { label: 'Bedrooms', value: property.bedrooms || 'N/A' },
                      { label: 'Bathrooms', value: property.bathrooms || 'N/A' },
                      { label: 'Parcel', value: property.parcelId },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="text-xs text-slate-500">{item.label}</div>
                        <div className="text-white font-medium">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendation Reasons */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icons.CheckCircle />
                    Recommendation Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {property.recommendationReasons?.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-emerald-400 mt-0.5">✓</span>
                        <span className="text-slate-300">{reason}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {property.riskFactors?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="text-sm font-medium text-amber-400 mb-2">Risk Factors:</div>
                      <ul className="space-y-1">
                        {property.riskFactors.map((risk, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-amber-400 mt-0.5">⚠</span>
                            <span className="text-slate-400">{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'liens' && (
            <motion.div
              key="liens"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Lien Priority Analysis</CardTitle>
                  <CardDescription>Stage 4 of The Everest Ascent™</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {property.liens?.map((lien, i) => (
                    <div
                      key={i}
                      className={cn(
                        "p-3 rounded-lg flex items-center justify-between",
                        lien.survives ? "bg-red-500/10 border border-red-500/30" : "bg-white/5"
                      )}
                    >
                      <div>
                        <div className="text-sm font-medium text-white">{lien.type}</div>
                        <div className="text-xs text-slate-500">{lien.holder}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">
                          ${lien.amount?.toLocaleString()}
                        </div>
                        <Badge variant={lien.survives ? 'destructive' : 'success'}>
                          {lien.survives ? 'SURVIVES' : 'Wiped'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  <Separator className="my-4" />
                  
                  {!property.seniorMortgageSurvives ? (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2">
                      <Icons.CheckCircle />
                      <div>
                        <div className="text-emerald-400 font-medium">Clear Title Expected</div>
                        <div className="text-xs text-slate-400">All liens wiped at sale</div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
                      <Icons.XCircle />
                      <div>
                        <div className="text-red-400 font-medium">Senior Lien Survives</div>
                        <div className="text-xs text-slate-400">
                          ${property.seniorMortgageAmount?.toLocaleString()} mortgage NOT wiped
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'ml' && (
            <motion.div
              key="ml"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Win Probability Matrix</CardTitle>
                  <CardDescription>XGBoost ML Model • 64.4% Accuracy</CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(property.winProbabilityMatrix || {}).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(property.winProbabilityMatrix).map(([prob, bid]) => {
                        const probNum = parseInt(prob);
                        return (
                          <div key={prob} className="flex items-center gap-4">
                            <div className="w-12 text-right text-sm text-slate-400">{prob}</div>
                            <div className="flex-1">
                              <Progress value={probNum} />
                            </div>
                            <div className="w-24 text-right">
                              <span className="text-sm font-mono text-white">
                                ${bid.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      ML analysis not available for this property
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-emerald-500/10 border-emerald-500/30">
                  <div className="text-xs text-slate-400 mb-1">Third-Party Probability</div>
                  <div className="text-3xl font-bold text-emerald-400">
                    {(property.mlProbability * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-slate-500">Chance of competition</div>
                </Card>
                <Card className="p-4 bg-amber-500/10 border-amber-500/30">
                  <div className="text-xs text-slate-400 mb-1">Expected Sale Price</div>
                  <div className="text-3xl font-bold text-amber-400">
                    ${property.mlExpectedPrice?.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">ML prediction</div>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'comps' && (
            <motion.div
              key="comps"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Comparable Sales</CardTitle>
                  <CardDescription>Similar properties sold in last 12 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-slate-500">
                    <Icons.Map />
                    <p className="mt-2">Comp data integration coming soon</p>
                    <p className="text-xs">BCPAO + MLS data</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>

      {/* Action Footer */}
      <div className="p-4 border-t border-white/10 flex gap-3">
        <Button variant="default" className="flex-1">
          <Icons.Download />
          <span className="ml-2">Generate Report</span>
        </Button>
        <Tooltip content="Add to watchlist">
          <Button variant="secondary" size="icon">
            <Icons.Star />
          </Button>
        </Tooltip>
        <Tooltip content="Share analysis">
          <Button variant="ghost" size="icon">
            <Icons.Share />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

// ============ MAIN APP COMPONENT ============
const SplitScreenUIV17 = () => {
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [properties] = useState(SAMPLE_PROPERTIES);

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);

  const auctionInfo = {
    date: 'Dec 18, 2025',
    type: 'Tax Deed Sale',
    location: 'Brevard County, FL',
  };

  return (
    <div className="h-screen w-screen bg-slate-950 overflow-hidden">
      {/* Top Bar */}
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
            <span className="text-slate-900 font-black text-xs">BD</span>
          </div>
          <div>
            <span className="text-white font-semibold">BidDeed</span>
            <span className="text-amber-400 font-semibold">.AI</span>
            <span className="text-slate-500 text-sm ml-2">V17</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success">
            <span className="animate-pulse mr-1">●</span>
            Live
          </Badge>
          <Button variant="ghost" size="sm">
            <Icons.Download />
            <span className="ml-2">Export All</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="h-[calc(100vh-3.5rem)]">
        <ResizablePanels
          leftPanel={
            <PropertyListPanel
              properties={properties}
              selectedId={selectedPropertyId}
              onSelect={setSelectedPropertyId}
              auctionInfo={auctionInfo}
            />
          }
          rightPanel={
            <PropertyDetailPanel property={selectedProperty} />
          }
          defaultLeftWidth={38}
        />
      </div>
    </div>
  );
};

export default SplitScreenUIV17;
