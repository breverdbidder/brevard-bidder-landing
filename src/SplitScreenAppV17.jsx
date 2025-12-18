// BidDeed.AI V17 - Split-Screen UI/UX Interface
// Modern Shadcn UI components with real-time auction data
// © 2025 Everest Capital USA. All Rights Reserved.

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============ SHADCN-STYLE COMPONENTS ============

const Card = ({ className = '', children, ...props }) => (
  <div className={`rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader = ({ className = '', children }) => (
  <div className={`p-4 border-b border-white/10 ${className}`}>{children}</div>
);

const CardContent = ({ className = '', children }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

const CardTitle = ({ className = '', children }) => (
  <h3 className={`text-lg font-semibold text-white ${className}`}>{children}</h3>
);

const CardDescription = ({ className = '', children }) => (
  <p className={`text-sm text-slate-400 ${className}`}>{children}</p>
);

const Badge = ({ variant = 'default', className = '', children }) => {
  const variants = {
    default: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    destructive: 'bg-red-500/20 text-red-400 border-red-500/30',
    outline: 'bg-transparent text-slate-300 border-white/20',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Button = ({ variant = 'default', size = 'default', className = '', children, ...props }) => {
  const variants = {
    default: 'bg-amber-500 text-slate-900 hover:bg-amber-400',
    secondary: 'bg-white/10 text-white hover:bg-white/20',
    ghost: 'bg-transparent text-slate-300 hover:bg-white/10 hover:text-white',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    default: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  return (
    <button className={`font-semibold rounded-lg transition-all ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Progress = ({ value = 0, className = '' }) => (
  <div className={`h-2 bg-white/10 rounded-full overflow-hidden ${className}`}>
    <motion.div
      className="h-full bg-gradient-to-r from-amber-500 to-emerald-500"
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ duration: 0.5 }}
    />
  </div>
);

const Tooltip = ({ content, children }) => {
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
            className="absolute z-50 px-2 py-1 text-xs bg-slate-800 text-white rounded shadow-lg whitespace-nowrap bottom-full left-1/2 -translate-x-1/2 mb-1"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============ RESIZABLE SPLIT LAYOUT ============

const ResizableSplitLayout = ({ leftPanel, rightPanel, defaultWidth = 40, minWidth = 25, maxWidth = 75 }) => {
  const [leftWidth, setLeftWidth] = useState(defaultWidth);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const container = document.getElementById('split-container');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
    setLeftWidth(Math.min(Math.max(newWidth, minWidth), maxWidth));
  }, [isDragging, minWidth, maxWidth]);

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
    <div id="split-container" className="flex h-full w-full relative select-none">
      <div className="h-full overflow-hidden" style={{ width: `${leftWidth}%` }}>
        {leftPanel}
      </div>
      <div
        onMouseDown={handleMouseDown}
        className={`w-1.5 cursor-col-resize transition-colors flex-shrink-0 ${
          isDragging ? 'bg-amber-500' : 'bg-white/10 hover:bg-amber-500/50'
        }`}
      >
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1.5 h-12 flex items-center justify-center">
          <div className="w-0.5 h-8 bg-white/20 rounded-full" />
        </div>
      </div>
      <div className="h-full overflow-hidden flex-1">
        {rightPanel}
      </div>
    </div>
  );
};

// ============ PROPERTY LIST PANEL ============

const PropertyListPanel = ({ properties, selectedId, onSelect, auctionDate = '2025-12-18' }) => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('ratio');

  const filteredProperties = properties
    .filter(p => {
      if (filter !== 'all' && p.recommendation !== filter) return false;
      if (searchQuery && !p.address.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'ratio') return b.bidJudgmentRatio - a.bidJudgmentRatio;
      if (sortBy === 'value') return b.marketValue - a.marketValue;
      if (sortBy === 'bid') return a.openingBid - b.openingBid;
      return 0;
    });

  const stats = {
    bid: properties.filter(p => p.recommendation === 'BID').length,
    review: properties.filter(p => p.recommendation === 'REVIEW').length,
    skip: properties.filter(p => p.recommendation === 'SKIP').length,
    doNotBid: properties.filter(p => p.recommendation === 'DO_NOT_BID').length,
  };

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-slate-900/50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              {auctionDate} Auction
            </h2>
            <p className="text-xs text-slate-400">Tax Deed Sale • Brevard County, FL</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-amber-400">{properties.length}</div>
            <div className="text-xs text-slate-500">Properties</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Search address, case #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 text-sm"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 flex-wrap">
          {[
            { key: 'all', label: 'All', count: properties.length },
            { key: 'BID', label: 'BID', count: stats.bid, color: 'emerald' },
            { key: 'REVIEW', label: 'REVIEW', count: stats.review, color: 'amber' },
            { key: 'SKIP', label: 'SKIP', count: stats.skip, color: 'red' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                filter === f.key
                  ? f.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : f.color === 'amber' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : f.color === 'red' ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-white/20 text-white border border-white/20'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-transparent'
              }`}
            >
              {f.label}
              <span className="text-[10px] opacity-70">({f.count})</span>
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 mt-3 text-xs">
          <span className="text-slate-500">Sort:</span>
          {['ratio', 'value', 'bid'].map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-2 py-0.5 rounded ${sortBy === s ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
            >
              {s === 'ratio' ? 'B/J Ratio' : s === 'value' ? 'Value' : 'Opening Bid'}
            </button>
          ))}
        </div>
      </div>

      {/* Property List */}
      <div className="flex-1 overflow-auto">
        <div className="p-2 space-y-1.5">
          {filteredProperties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              onClick={() => onSelect(property.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all group ${
                selectedId === property.id
                  ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/5'
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate group-hover:text-amber-300 transition-colors">
                    {property.address}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>#{property.caseNumber}</span>
                    <span>•</span>
                    <span>{property.propertyType}</span>
                  </div>
                </div>
                <Badge variant={
                  property.recommendation === 'BID' ? 'success' :
                  property.recommendation === 'REVIEW' ? 'default' :
                  property.recommendation === 'DO_NOT_BID' ? 'destructive' : 'destructive'
                }>
                  {property.recommendation}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs">
                  <Tooltip content="Opening Bid">
                    <span className="text-slate-400">
                      <span className="text-amber-400 font-medium">${(property.openingBid / 1000).toFixed(1)}K</span>
                    </span>
                  </Tooltip>
                  <Tooltip content="Max Bid">
                    <span className="text-emerald-400 font-medium">
                      ${(property.maxBid / 1000).toFixed(0)}K max
                    </span>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        property.bidJudgmentRatio >= 75 ? 'bg-emerald-500' :
                        property.bidJudgmentRatio >= 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(property.bidJudgmentRatio, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-white w-10 text-right">
                    {property.bidJudgmentRatio}%
                  </span>
                </div>
              </div>

              {property.seniorMortgageSurvives && (
                <div className="mt-2 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
                  ⚠️ Senior mortgage survives
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer Summary */}
      <div className="p-3 border-t border-white/10 bg-slate-900/50">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <div className="text-lg font-bold text-emerald-400">{stats.bid}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">BID</div>
          </div>
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <div className="text-lg font-bold text-amber-400">{stats.review}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">REVIEW</div>
          </div>
          <div className="p-2 bg-red-500/10 rounded-lg">
            <div className="text-lg font-bold text-red-400">{stats.skip}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">SKIP</div>
          </div>
          <div className="p-2 bg-slate-500/10 rounded-lg">
            <div className="text-lg font-bold text-slate-400">{stats.doNotBid}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">DNB</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ PROPERTY DETAIL PANEL ============

const PropertyDetailPanel = ({ property, onGenerateReport }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!property) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900">
        <div className="text-center max-w-xs">
          <div className="w-20 h-20 mx-auto mb-4 bg-white/5 rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div className="text-lg font-medium text-slate-400 mb-2">Select a Property</div>
          <div className="text-sm text-slate-600">Click on a property from the list to view detailed analysis</div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'liens', label: 'Liens', icon: '⚖️' },
    { id: 'ml', label: 'ML Analysis', icon: '🧠' },
    { id: 'disposition', label: 'Exit Strategy', icon: '🎯' },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={
                property.recommendation === 'BID' ? 'success' :
                property.recommendation === 'REVIEW' ? 'default' : 'destructive'
              } className="text-sm px-3 py-1">
                {property.recommendation}
              </Badge>
              {property.seniorMortgageSurvives && (
                <Badge variant="destructive" className="animate-pulse">⚠️ DNB</Badge>
              )}
            </div>
            <h2 className="text-xl font-bold text-white leading-tight">{property.address}</h2>
            <p className="text-sm text-slate-400 mt-1">
              Case #{property.caseNumber} • Parcel {property.parcelId} • {property.propertyType}
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Market Value', value: `$${(property.marketValue / 1000).toFixed(0)}K`, color: 'white' },
            { label: 'Opening Bid', value: `$${property.openingBid?.toLocaleString()}`, color: 'amber' },
            { label: 'Max Bid', value: `$${(property.maxBid / 1000).toFixed(0)}K`, color: 'emerald' },
            { label: 'B/J Ratio', value: `${property.bidJudgmentRatio}%`, color: property.bidJudgmentRatio >= 75 ? 'emerald' : 'amber' },
          ].map((metric, i) => (
            <Card key={i} className="p-2.5 text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">{metric.label}</div>
              <div className={`text-lg font-bold ${
                metric.color === 'emerald' ? 'text-emerald-400' :
                metric.color === 'amber' ? 'text-amber-400' : 'text-white'
              }`}>
                {metric.value}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-3 pb-0 border-b border-white/10">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white border-b-2 border-amber-500'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-4">
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
                <CardHeader className="py-3">
                  <CardTitle className="text-base">Property Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Type', value: property.propertyType },
                    { label: 'Square Feet', value: property.sqft?.toLocaleString() || 'N/A' },
                    { label: 'Year Built', value: property.yearBuilt || 'N/A' },
                    { label: 'Bedrooms', value: property.bedrooms || 'N/A' },
                    { label: 'Bathrooms', value: property.bathrooms || 'N/A' },
                    { label: 'Lot Size', value: property.lotSize ? `${property.lotSize.toLocaleString()} sqft` : 'N/A' },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="text-xs text-slate-500 mb-0.5">{item.label}</div>
                      <div className="text-sm font-medium text-white">{item.value}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recommendation Reasons */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className={property.recommendation === 'BID' ? 'text-emerald-400' : 'text-amber-400'}>
                      {property.recommendation === 'BID' ? '✓' : '⚠'}
                    </span>
                    Recommendation Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {property.recommendationReasons?.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-emerald-400 mt-0.5 flex-shrink-0">•</span>
                        <span className="text-slate-300">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Risk Factors */}
              {property.riskFactors?.length > 0 && (
                <Card className="border-amber-500/20">
                  <CardHeader className="py-3 bg-amber-500/5">
                    <CardTitle className="text-base text-amber-400">⚠️ Risk Factors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {property.riskFactors.map((risk, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-amber-400 mt-0.5 flex-shrink-0">!</span>
                          <span className="text-slate-300">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {activeTab === 'liens' && (
            <motion.div
              key="liens"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">Lien Priority Analysis</CardTitle>
                  <CardDescription>Stage 4 of Everest Ascent™ • {property.liens?.length || 0} liens detected</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {property.liens?.map((lien, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${
                      lien.survives ? 'bg-red-500/5 border-red-500/20' : 'bg-white/5 border-white/10'
                    }`}>
                      <div>
                        <div className="text-sm font-medium text-white">{lien.type}</div>
                        <div className="text-xs text-slate-500">{lien.holder}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono text-white">${lien.amount?.toLocaleString()}</div>
                        <Badge variant={lien.survives ? 'destructive' : 'success'} className="mt-1">
                          {lien.survives ? '⚠️ SURVIVES' : '✓ Wiped'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Summary */}
              <Card className={property.seniorMortgageSurvives ? 'border-red-500/30' : 'border-emerald-500/30'}>
                <CardContent className="py-4">
                  {!property.seniorMortgageSurvives ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                        <span className="text-emerald-400 text-lg">✓</span>
                      </div>
                      <div>
                        <div className="text-emerald-400 font-semibold">Clear to Bid</div>
                        <div className="text-xs text-slate-400">All liens wiped at sale • No senior encumbrances</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
                        <span className="text-red-400 text-lg">⚠</span>
                      </div>
                      <div>
                        <div className="text-red-400 font-semibold">DO NOT BID</div>
                        <div className="text-xs text-slate-400">
                          Senior mortgage of ${property.seniorMortgageAmount?.toLocaleString()} survives sale
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
              {/* Win Probability Matrix */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">Win Probability Matrix</CardTitle>
                  <CardDescription>XGBoost ML • 64.4% Historical Accuracy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(property.winProbabilityMatrix || {}).map(([prob, bid]) => {
                      const probNum = parseInt(prob);
                      const isOptimal = probNum >= 40 && probNum <= 60;
                      return (
                        <div key={prob} className="flex items-center gap-3">
                          <div className="w-12 text-xs text-right text-slate-400">{prob}</div>
                          <div className="flex-1 relative">
                            <Progress value={probNum} />
                            {isOptimal && (
                              <div className="absolute -top-1 right-0 text-[10px] text-emerald-400">★ Optimal</div>
                            )}
                          </div>
                          <div className={`w-20 text-sm font-mono text-right ${isOptimal ? 'text-emerald-400' : 'text-white'}`}>
                            ${(bid / 1000).toFixed(0)}K
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* ML Predictions */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="py-4 text-center">
                    <div className="text-xs text-slate-500 mb-1">Third-Party Win Probability</div>
                    <div className="text-3xl font-bold text-emerald-400">
                      {((property.mlProbability || 0) * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Chance of competition</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="py-4 text-center">
                    <div className="text-xs text-slate-500 mb-1">Expected Sale Price</div>
                    <div className="text-3xl font-bold text-amber-400">
                      ${((property.mlExpectedPrice || 0) / 1000).toFixed(0)}K
                    </div>
                    <div className="text-xs text-slate-500 mt-1">ML prediction</div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'disposition' && (
            <motion.div
              key="disposition"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">Exit Strategy Analysis</CardTitle>
                  <CardDescription>Stage 11 of Everest Ascent™</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                      <div className="text-xs text-slate-400 mb-1">Recommended Strategy</div>
                      <div className="text-xl font-bold text-amber-400">
                        {property.exitStrategy || 'MTR'}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {property.exitStrategy === 'MTR' ? 'Mid-Term Rental' :
                         property.exitStrategy === 'FLIP' ? 'Fix & Flip' :
                         property.exitStrategy === 'WHOLESALE' ? 'Wholesale Assignment' : 'Hold'}
                      </div>
                    </div>
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                      <div className="text-xs text-slate-400 mb-1">Projected ROI</div>
                      <div className="text-xl font-bold text-emerald-400">
                        {property.projectedROI || 116}%
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {property.holdPeriodMonths || 12}-month hold
                      </div>
                    </div>
                  </div>

                  {/* Target ZIP indicator */}
                  {['32937', '32940', '32953', '32903'].includes(property.zipCode) && (
                    <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3">
                      <span className="text-xl">🎯</span>
                      <div>
                        <div className="text-emerald-400 font-medium">Third Sword Target ZIP</div>
                        <div className="text-xs text-slate-400">
                          High income ($78-82K), low vacancy (5-6%), strong MTR demand
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-white/10 bg-slate-900/80">
        <div className="flex gap-3">
          <Button variant="default" className="flex-1" onClick={() => onGenerateReport?.(property)}>
            📄 Generate Report
          </Button>
          <Button variant="secondary">
            ⭐ Watchlist
          </Button>
          <Button variant="ghost">
            📤 Share
          </Button>
        </div>
      </div>
    </div>
  );
};

// ============ MAIN SPLIT-SCREEN APP ============

const SplitScreenAppV17 = () => {
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);

  // Sample real data from Dec 18 auction
  const properties = [
    {
      id: '1',
      caseNumber: '250179',
      parcelId: '3021477',
      address: '202 Ivory Coral Ln #304, Merritt Island, FL 32953',
      zipCode: '32953',
      propertyType: 'CONDO',
      sqft: 1248,
      yearBuilt: 2006,
      bedrooms: 2,
      bathrooms: 2,
      marketValue: 185000,
      openingBid: 12847.23,
      maxBid: 98500,
      bidJudgmentRatio: 83.3,
      recommendation: 'BID',
      mlProbability: 0.42,
      mlExpectedPrice: 138750,
      seniorMortgageSurvives: false,
      exitStrategy: 'MTR',
      projectedROI: 116,
      holdPeriodMonths: 12,
      liens: [
        { type: 'HOA Lien', holder: 'Cape Crossing HOA', amount: 8420.50, survives: false },
        { type: 'Tax Certificate', holder: 'Brevard County', amount: 4426.73, survives: false },
      ],
      winProbabilityMatrix: { '10%': 46250, '20%': 55500, '40%': 74000, '60%': 92500, '80%': 111000, '95%': 129500 },
      recommendationReasons: [
        'Bid/Judgment ratio 83.3% exceeds 75% threshold',
        'No senior mortgage detected',
        'Target ZIP code 32953 (Merritt Island)',
        'Strong MTR rental demand in area',
      ],
      riskFactors: ['Condo: Verify HOA special assessments'],
    },
    {
      id: '2',
      caseNumber: '250216',
      parcelId: '3021458',
      address: '202 Ivory Coral Ln #201, Merritt Island, FL 32953',
      zipCode: '32953',
      propertyType: 'CONDO',
      sqft: 1100,
      yearBuilt: 2006,
      bedrooms: 2,
      bathrooms: 2,
      marketValue: 175000,
      openingBid: 11234.56,
      maxBid: 92000,
      bidJudgmentRatio: 78.5,
      recommendation: 'BID',
      mlProbability: 0.38,
      mlExpectedPrice: 131250,
      seniorMortgageSurvives: false,
      exitStrategy: 'MTR',
      projectedROI: 108,
      holdPeriodMonths: 12,
      liens: [
        { type: 'HOA Lien', holder: 'Cape Crossing HOA', amount: 6890, survives: false },
        { type: 'Tax Certificate', holder: 'Brevard County', amount: 4344.56, survives: false },
      ],
      winProbabilityMatrix: { '10%': 43750, '20%': 52500, '40%': 70000, '60%': 87500, '80%': 105000, '95%': 122500 },
      recommendationReasons: [
        'Bid/Judgment ratio 78.5% exceeds 75% threshold',
        'Same building as Case 250179 - bulk opportunity',
        'Target ZIP 32953',
      ],
      riskFactors: [],
    },
    {
      id: '3',
      caseNumber: '250422',
      parcelId: '2000369',
      address: '1234 US Highway 1, Mims, FL 32754',
      zipCode: '32754',
      propertyType: 'VACANT LAND',
      sqft: 0,
      yearBuilt: 0,
      bedrooms: 0,
      bathrooms: 0,
      marketValue: 28800,
      openingBid: 8234.12,
      maxBid: 12000,
      bidJudgmentRatio: 52.1,
      recommendation: 'SKIP',
      mlProbability: 0.65,
      mlExpectedPrice: 21600,
      seniorMortgageSurvives: false,
      exitStrategy: 'WHOLESALE',
      projectedROI: 45,
      holdPeriodMonths: 3,
      liens: [
        { type: 'Tax Certificate', holder: 'Brevard County', amount: 8234.12, survives: false },
      ],
      winProbabilityMatrix: { '10%': 7200, '20%': 8640, '40%': 11520, '60%': 14400, '80%': 17280, '95%': 20160 },
      recommendationReasons: [],
      riskFactors: [
        'Bid/Judgment ratio 52.1% below 60% threshold',
        'Vacant land - limited exit options',
        'Non-target ZIP code',
      ],
    },
  ];

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);

  const handleGenerateReport = (property) => {
    console.log('Generating report for:', property.caseNumber);
    // Would trigger report generation
  };

  return (
    <div className="h-screen bg-slate-950">
      {/* Top Bar */}
      <div className="h-14 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
            <span className="text-slate-900 font-black text-xs">BD</span>
          </div>
          <div>
            <div className="text-white font-semibold text-sm">BidDeed.AI</div>
            <div className="text-[10px] text-slate-500">V17 • Everest Ascent™</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" className="animate-pulse">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5" />
            Live
          </Badge>
          <span className="text-xs text-slate-400">Dec 18, 2025 Auction</span>
        </div>
      </div>

      {/* Split Screen Content */}
      <div className="h-[calc(100vh-3.5rem)]">
        <ResizableSplitLayout
          leftPanel={
            <PropertyListPanel
              properties={properties}
              selectedId={selectedPropertyId}
              onSelect={setSelectedPropertyId}
            />
          }
          rightPanel={
            <PropertyDetailPanel
              property={selectedProperty}
              onGenerateReport={handleGenerateReport}
            />
          }
          defaultWidth={38}
        />
      </div>
    </div>
  );
};

export default SplitScreenAppV17;
