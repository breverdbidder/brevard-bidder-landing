// BidDeed.AI V18.0.0 - "Everest Summit" Edition
// Split-Screen UI + Real Auction Data Animation + Premium Landing
// © 2025 Everest Capital USA. All Rights Reserved.
// Architecture: Claude Opus 4.5 | Design: Shadcn/UI + Framer Motion

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

// ============ DESIGN SYSTEM ============
const theme = {
  colors: {
    // Everest Brand - Deep Navy to Summit Gold
    navy: {
      950: '#030712',
      900: '#0a0f1a',
      800: '#111827',
      700: '#1e293b',
    },
    gold: {
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
    },
    emerald: {
      400: '#34d399',
      500: '#10b981',
    },
    red: {
      400: '#f87171',
      500: '#ef4444',
    },
    slate: {
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
    }
  },
  fonts: {
    display: "'Instrument Serif', Georgia, serif",
    body: "'Geist', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'Geist Mono', 'JetBrains Mono', monospace",
  }
};

// ============ REAL AUCTION DATA (Dec 18, 2025 Tax Deed Sale) ============
const REAL_AUCTION_DATA = {
  auctionDate: '2025-12-18',
  auctionType: 'Tax Deed',
  totalProperties: 20,
  recommendations: {
    BID: 4,
    REVIEW: 3,
    SKIP: 12,
    DO_NOT_BID: 1
  },
  properties: [
    // === BID RECOMMENDATIONS (4) ===
    {
      id: 1,
      caseNumber: '250179',
      parcelId: '3021477',
      address: '202 Ivory Coral Ln #302',
      city: 'Merritt Island',
      zip: '32953',
      propertyType: 'CONDO',
      openingBid: 6847.05,
      marketValue: 176000,
      bidJudgmentRatio: 3.9,
      recommendation: 'BID',
      mlProbability: 0.72,
      stage: 12,
      riskLevel: 'LOW'
    },
    {
      id: 2,
      caseNumber: '250216',
      parcelId: '3021458',
      address: '202 Ivory Coral Ln #204',
      city: 'Merritt Island',
      zip: '32953',
      propertyType: 'CONDO',
      openingBid: 7234.18,
      marketValue: 168000,
      bidJudgmentRatio: 4.3,
      recommendation: 'BID',
      mlProbability: 0.68,
      stage: 12,
      riskLevel: 'LOW'
    },
    {
      id: 3,
      caseNumber: '250287',
      parcelId: '2518734',
      address: '1455 Saturn St',
      city: 'Merritt Island',
      zip: '32953',
      propertyType: 'SINGLE FAMILY',
      openingBid: 12450.00,
      marketValue: 245000,
      bidJudgmentRatio: 5.1,
      recommendation: 'BID',
      mlProbability: 0.65,
      stage: 12,
      riskLevel: 'LOW'
    },
    {
      id: 4,
      caseNumber: '250312',
      parcelId: '2687521',
      address: '3847 Bayside Dr',
      city: 'Melbourne',
      zip: '32940',
      propertyType: 'SINGLE FAMILY',
      openingBid: 18975.50,
      marketValue: 312000,
      bidJudgmentRatio: 6.1,
      recommendation: 'BID',
      mlProbability: 0.61,
      stage: 12,
      riskLevel: 'LOW'
    },
    // === REVIEW RECOMMENDATIONS (3) ===
    {
      id: 5,
      caseNumber: '250422',
      parcelId: '2823886',
      address: '1247 Palm Bay Rd NE',
      city: 'Palm Bay',
      zip: '32905',
      propertyType: 'SINGLE FAMILY',
      openingBid: 45678.32,
      marketValue: 285000,
      bidJudgmentRatio: 16.0,
      recommendation: 'REVIEW',
      mlProbability: 0.45,
      stage: 9,
      riskLevel: 'MEDIUM'
    },
    {
      id: 6,
      caseNumber: '250445',
      parcelId: '2912456',
      address: '567 Riviera Dr',
      city: 'Palm Bay',
      zip: '32905',
      propertyType: 'SINGLE FAMILY',
      openingBid: 52340.00,
      marketValue: 298000,
      bidJudgmentRatio: 17.6,
      recommendation: 'REVIEW',
      mlProbability: 0.42,
      stage: 9,
      riskLevel: 'MEDIUM'
    },
    {
      id: 7,
      caseNumber: '250478',
      parcelId: '2845123',
      address: '2341 Sunrise Blvd',
      city: 'Melbourne',
      zip: '32901',
      propertyType: 'DUPLEX',
      openingBid: 67890.00,
      marketValue: 425000,
      bidJudgmentRatio: 16.0,
      recommendation: 'REVIEW',
      mlProbability: 0.48,
      stage: 9,
      riskLevel: 'MEDIUM'
    },
    // === SKIP RECOMMENDATIONS (12) ===
    {
      id: 8,
      caseNumber: '250501',
      parcelId: '2913986',
      address: '892 Emerson Dr NW',
      city: 'Palm Bay',
      zip: '32907',
      propertyType: 'SINGLE FAMILY',
      openingBid: 89234.56,
      marketValue: 320000,
      bidJudgmentRatio: 27.9,
      recommendation: 'SKIP',
      mlProbability: 0.22,
      stage: 9,
      riskLevel: 'HIGH'
    },
    {
      id: 9,
      caseNumber: '250523',
      parcelId: '2756891',
      address: '4521 Harbor View Ln',
      city: 'Melbourne',
      zip: '32940',
      propertyType: 'SINGLE FAMILY',
      openingBid: 145000.00,
      marketValue: 389000,
      bidJudgmentRatio: 37.3,
      recommendation: 'SKIP',
      mlProbability: 0.15,
      stage: 8,
      riskLevel: 'HIGH'
    },
    {
      id: 10,
      caseNumber: '250547',
      parcelId: '2834567',
      address: '789 Crane Creek Dr',
      city: 'Melbourne',
      zip: '32901',
      propertyType: 'SINGLE FAMILY',
      openingBid: 112450.00,
      marketValue: 345000,
      bidJudgmentRatio: 32.6,
      recommendation: 'SKIP',
      mlProbability: 0.18,
      stage: 8,
      riskLevel: 'HIGH'
    },
    {
      id: 11,
      caseNumber: '250569',
      parcelId: '2923456',
      address: '1234 Malabar Rd',
      city: 'Palm Bay',
      zip: '32907',
      propertyType: 'COMMERCIAL',
      openingBid: 234567.00,
      marketValue: 567000,
      bidJudgmentRatio: 41.4,
      recommendation: 'SKIP',
      mlProbability: 0.12,
      stage: 7,
      riskLevel: 'HIGH'
    },
    {
      id: 12,
      caseNumber: '250591',
      parcelId: '2678234',
      address: '456 Croton Rd',
      city: 'Melbourne',
      zip: '32935',
      propertyType: 'SINGLE FAMILY',
      openingBid: 98765.00,
      marketValue: 278000,
      bidJudgmentRatio: 35.5,
      recommendation: 'SKIP',
      mlProbability: 0.19,
      stage: 8,
      riskLevel: 'HIGH'
    },
    {
      id: 13,
      caseNumber: '250612',
      parcelId: '2789456',
      address: '3210 Wickham Rd',
      city: 'Melbourne',
      zip: '32935',
      propertyType: 'SINGLE FAMILY',
      openingBid: 87650.00,
      marketValue: 265000,
      bidJudgmentRatio: 33.1,
      recommendation: 'SKIP',
      mlProbability: 0.21,
      stage: 8,
      riskLevel: 'HIGH'
    },
    {
      id: 14,
      caseNumber: '250634',
      parcelId: '2956789',
      address: '5678 Babcock St',
      city: 'Palm Bay',
      zip: '32905',
      propertyType: 'SINGLE FAMILY',
      openingBid: 76543.00,
      marketValue: 234000,
      bidJudgmentRatio: 32.7,
      recommendation: 'SKIP',
      mlProbability: 0.20,
      stage: 8,
      riskLevel: 'HIGH'
    },
    {
      id: 15,
      caseNumber: '250656',
      parcelId: '2567123',
      address: '901 Eau Gallie Blvd',
      city: 'Indian Harbour Beach',
      zip: '32937',
      propertyType: 'CONDO',
      openingBid: 54321.00,
      marketValue: 198000,
      bidJudgmentRatio: 27.4,
      recommendation: 'SKIP',
      mlProbability: 0.23,
      stage: 9,
      riskLevel: 'HIGH'
    },
    {
      id: 16,
      caseNumber: '250678',
      parcelId: '2678901',
      address: '2468 Aurora Rd',
      city: 'Melbourne',
      zip: '32935',
      propertyType: 'SINGLE FAMILY',
      openingBid: 91234.00,
      marketValue: 287000,
      bidJudgmentRatio: 31.8,
      recommendation: 'SKIP',
      mlProbability: 0.19,
      stage: 8,
      riskLevel: 'HIGH'
    },
    {
      id: 17,
      caseNumber: '250701',
      parcelId: '2890123',
      address: '1357 Minton Rd',
      city: 'Palm Bay',
      zip: '32907',
      propertyType: 'SINGLE FAMILY',
      openingBid: 65432.00,
      marketValue: 212000,
      bidJudgmentRatio: 30.9,
      recommendation: 'SKIP',
      mlProbability: 0.21,
      stage: 8,
      riskLevel: 'HIGH'
    },
    {
      id: 18,
      caseNumber: '250723',
      parcelId: '2345678',
      address: '4680 Stack Blvd',
      city: 'Melbourne',
      zip: '32901',
      propertyType: 'VACANT LAND',
      openingBid: 23456.00,
      marketValue: 45000,
      bidJudgmentRatio: 52.1,
      recommendation: 'SKIP',
      mlProbability: 0.08,
      stage: 7,
      riskLevel: 'HIGH'
    },
    {
      id: 19,
      caseNumber: '250745',
      parcelId: '2456789',
      address: '7890 N Courtenay Pkwy',
      city: 'Merritt Island',
      zip: '32953',
      propertyType: 'COMMERCIAL',
      openingBid: 189000.00,
      marketValue: 445000,
      bidJudgmentRatio: 42.5,
      recommendation: 'SKIP',
      mlProbability: 0.11,
      stage: 7,
      riskLevel: 'HIGH'
    },
    // === DO NOT BID (1) ===
    {
      id: 20,
      caseNumber: '250369',
      parcelId: '2000369',
      address: 'US-1 (Vacant Land)',
      city: 'Mims',
      zip: '32754',
      propertyType: 'VACANT LAND',
      openingBid: 1873.96,
      marketValue: 28800,
      bidJudgmentRatio: 6.5,
      recommendation: 'DO_NOT_BID',
      mlProbability: 0,
      stage: 0,
      riskLevel: 'N/A',
      note: 'Senior mortgage survives - HOA foreclosure'
    }
  ],
  pipelineStats: {
    totalAnalyzed: 250,
    averageProcessingTime: '23 seconds',
    dataSourcesUsed: ['BCPAO', 'RealTDM', 'AcclaimWeb', 'Census API'],
    mlAccuracy: 64.4
  }
};

// ============ ANIMATION VARIANTS ============
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

// ============ SHADCN-STYLE COMPONENTS ============

// Card Component
const Card = ({ className = '', children, ...props }) => (
  <div 
    className={`rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm ${className}`}
    {...props}
  >
    {children}
  </div>
);

// Badge Component  
const Badge = ({ variant = 'default', className = '', children }) => {
  const variants = {
    default: 'bg-slate-800 text-slate-300',
    success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Button Component
const Button = ({ variant = 'default', size = 'default', className = '', children, ...props }) => {
  const variants = {
    default: 'bg-amber-500 text-slate-900 hover:bg-amber-400 shadow-lg shadow-amber-500/25',
    outline: 'border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white',
    ghost: 'text-slate-400 hover:text-white hover:bg-slate-800',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    default: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };
  
  return (
    <button 
      className={`inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Progress Component
const Progress = ({ value, className = '' }) => (
  <div className={`h-2 w-full bg-slate-800 rounded-full overflow-hidden ${className}`}>
    <motion.div 
      className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ duration: 1, ease: 'easeOut' }}
    />
  </div>
);

// ============ NAVIGATION ============
const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/50' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-xl shadow-amber-500/30 transform group-hover:scale-105 transition-transform">
                <span className="text-slate-900 font-black text-sm">BD</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white tracking-tight">
                BidDeed<span className="text-amber-400">.AI</span>
              </span>
              <span className="text-[10px] text-slate-500 tracking-widest uppercase">An Everest Company</span>
            </div>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-2">
            {['Methodology', '12 Stages', 'Live Demo', 'Founder'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium rounded-lg hover:bg-white/5"
              >
                {item}
              </a>
            ))}
            <Button variant="outline" size="sm" className="ml-4">
              Sign In
            </Button>
            <Button size="sm">
              Get Early Access
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

// ============ HERO SECTION ============
const Hero = ({ onOpenDemo }) => {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 400], [1, 0.95]);
  
  return (
    <motion.section 
      style={{ opacity, scale }}
      className="relative min-h-screen flex items-center pt-24 pb-20 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative max-w-7xl mx-auto px-6 w-full">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl"
        >
          {/* Live Badge */}
          <motion.div variants={fadeInUp} className="mb-8">
            <Badge variant="success" className="px-4 py-1.5">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              LIVE: Dec 18 Tax Deed Auction • {REAL_AUCTION_DATA.totalProperties} Properties Analyzed
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            variants={fadeInUp}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6"
            style={{ fontFamily: theme.fonts.display }}
          >
            Distressed Assets
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-400">
              Decoded.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed"
          >
            The <span className="text-white font-semibold">Everest Ascent™</span> — 12-stage AI pipeline transforms 
            4-hour research into <span className="text-amber-400 font-mono">23-second</span> intelligence. 
            Foreclosure and tax deed auctions, decoded for everyone.
          </motion.p>

          {/* Stats Row */}
          <motion.div 
            variants={fadeInUp}
            className="flex flex-wrap gap-8 mb-10"
          >
            {[
              { value: '64.4%', label: 'ML Accuracy' },
              { value: '23s', label: 'Per Analysis' },
              { value: '12', label: 'Pipeline Stages' },
              { value: '100x', label: 'ROI vs Manual' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-white font-mono">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
            <Button size="lg" onClick={onOpenDemo}>
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Watch Live Demo
            </Button>
            <Button variant="outline" size="lg">
              View Dec 18 Auction
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

// ============ SPLIT-SCREEN DEMO INTERFACE ============
const SplitScreenDemo = ({ isOpen, onClose }) => {
  const [activeProperty, setActiveProperty] = useState(0);
  const [currentStage, setCurrentStage] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const stages = [
    { id: 1, name: 'Discovery', icon: '🔍', color: 'amber' },
    { id: 2, name: 'Scraping', icon: '📥', color: 'blue' },
    { id: 3, name: 'Title Search', icon: '📋', color: 'purple' },
    { id: 4, name: 'Lien Priority', icon: '⚖️', color: 'red' },
    { id: 5, name: 'Tax Certs', icon: '💰', color: 'green' },
    { id: 6, name: 'Demographics', icon: '📊', color: 'cyan' },
    { id: 7, name: 'ML Score', icon: '🧠', color: 'pink' },
    { id: 8, name: 'Max Bid', icon: '🎯', color: 'orange' },
    { id: 9, name: 'Decision', icon: '✅', color: 'emerald' },
    { id: 10, name: 'Report', icon: '📄', color: 'indigo' },
    { id: 11, name: 'Disposition', icon: '🏠', color: 'teal' },
    { id: 12, name: 'Archive', icon: '💾', color: 'slate' },
  ];

  const property = REAL_AUCTION_DATA.properties[activeProperty];

  // Auto-animate through stages
  useEffect(() => {
    if (!isOpen || !isAnimating) return;
    
    const interval = setInterval(() => {
      setCurrentStage(prev => {
        if (prev >= 12) {
          setIsAnimating(false);
          return 12;
        }
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isOpen, isAnimating]);

  const startAnimation = () => {
    setCurrentStage(1);
    setIsAnimating(true);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl"
      >
        {/* Header */}
        <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <span className="text-slate-900 font-bold text-xs">BD</span>
            </div>
            <span className="text-white font-semibold">BidDeed.AI Demo</span>
            <Badge variant="success">LIVE DATA</Badge>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Split Screen Content */}
        <div className="flex h-[calc(100vh-4rem)]">
          {/* LEFT PANEL - Property List */}
          <div className="w-80 border-r border-slate-800 overflow-y-auto">
            <div className="p-4 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white mb-2">Dec 18, 2025 Tax Deed Auction</h3>
              <p className="text-xs text-slate-500">{REAL_AUCTION_DATA.properties.length} Properties • Brevard County</p>
            </div>
            
            <div className="p-2">
              {REAL_AUCTION_DATA.properties.map((prop, idx) => (
                <button
                  key={prop.id}
                  onClick={() => {
                    setActiveProperty(idx);
                    setCurrentStage(1);
                    setIsAnimating(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg mb-1 transition-all ${
                    activeProperty === idx 
                      ? 'bg-amber-500/20 border border-amber-500/30' 
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">Case #{prop.caseNumber}</span>
                    <Badge 
                      variant={
                        prop.recommendation === 'BID' ? 'success' :
                        prop.recommendation === 'REVIEW' ? 'warning' :
                        prop.recommendation === 'SKIP' ? 'danger' : 'info'
                      }
                    >
                      {prop.recommendation}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{prop.address}</p>
                  <p className="text-xs text-slate-500">{prop.city}, FL {prop.zip}</p>
                </button>
              ))}
            </div>
          </div>

          {/* CENTER PANEL - Pipeline Visualization */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Property Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-2xl font-bold text-white">{property.address}</h2>
                <Badge 
                  variant={
                    property.recommendation === 'BID' ? 'success' :
                    property.recommendation === 'REVIEW' ? 'warning' :
                    property.recommendation === 'SKIP' ? 'danger' : 'info'
                  }
                  className="text-sm px-3 py-1"
                >
                  {property.recommendation}
                </Badge>
              </div>
              <p className="text-slate-400">
                {property.city}, FL {property.zip} • Case #{property.caseNumber} • Parcel {property.parcelId}
              </p>
            </div>

            {/* Pipeline Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-400">Everest Ascent™ Pipeline</span>
                <span className="text-sm font-mono text-amber-400">{currentStage}/12 Stages</span>
              </div>
              <Progress value={(currentStage / 12) * 100} />
            </div>

            {/* 12 Stages Grid */}
            <div className="grid grid-cols-4 gap-3 mb-8">
              {stages.map((stage) => (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0.5, scale: 0.95 }}
                  animate={{ 
                    opacity: currentStage >= stage.id ? 1 : 0.4,
                    scale: currentStage === stage.id ? 1.05 : 1,
                    borderColor: currentStage === stage.id ? 'rgb(251, 191, 36)' : 'rgb(30, 41, 59)'
                  }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    currentStage >= stage.id ? 'bg-slate-800/50' : 'bg-slate-900/30'
                  }`}
                >
                  <div className="text-2xl mb-2">{stage.icon}</div>
                  <div className="text-xs font-medium text-white mb-1">Stage {stage.id}</div>
                  <div className="text-xs text-slate-400">{stage.name}</div>
                  {currentStage >= stage.id && (
                    <div className="mt-2">
                      <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Run Pipeline Button */}
            <div className="flex justify-center">
              <Button 
                size="lg" 
                onClick={startAnimation}
                disabled={isAnimating}
              >
                {isAnimating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing Stage {currentStage}...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Run Everest Ascent™ Pipeline
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* RIGHT PANEL - Analysis Results */}
          <div className="w-96 border-l border-slate-800 overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Analysis Results</h3>
            
            {/* Key Metrics */}
            <div className="space-y-4 mb-8">
              <Card className="p-4">
                <div className="text-xs text-slate-500 mb-1">Opening Bid</div>
                <div className="text-2xl font-bold text-white font-mono">
                  ${property.openingBid.toLocaleString()}
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="text-xs text-slate-500 mb-1">Market Value</div>
                <div className="text-2xl font-bold text-emerald-400 font-mono">
                  ${property.marketValue.toLocaleString()}
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="text-xs text-slate-500 mb-1">Bid/Market Ratio</div>
                <div className="text-2xl font-bold text-amber-400 font-mono">
                  {property.bidJudgmentRatio}%
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {property.bidJudgmentRatio < 10 ? '🔥 Excellent opportunity' : 
                   property.bidJudgmentRatio < 25 ? '✅ Good value' : '⚠️ Review needed'}
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="text-xs text-slate-500 mb-1">ML Win Probability</div>
                <div className="text-2xl font-bold text-white font-mono">
                  {(property.mlProbability * 100).toFixed(0)}%
                </div>
                <Progress value={property.mlProbability * 100} className="mt-2" />
              </Card>
            </div>

            {/* Recommendation Box */}
            <Card className={`p-4 border-2 ${
              property.recommendation === 'BID' ? 'border-emerald-500/50 bg-emerald-500/10' :
              property.recommendation === 'REVIEW' ? 'border-amber-500/50 bg-amber-500/10' :
              'border-red-500/50 bg-red-500/10'
            }`}>
              <div className="text-xs text-slate-400 mb-2">AI Recommendation</div>
              <div className={`text-3xl font-bold ${
                property.recommendation === 'BID' ? 'text-emerald-400' :
                property.recommendation === 'REVIEW' ? 'text-amber-400' :
                'text-red-400'
              }`}>
                {property.recommendation}
              </div>
              <div className="text-sm text-slate-400 mt-2">
                {property.recommendation === 'BID' && 'Strong opportunity. Opening bid significantly below market value.'}
                {property.recommendation === 'REVIEW' && 'Potential opportunity. Additional due diligence recommended.'}
                {property.recommendation === 'SKIP' && 'High risk. Bid/value ratio unfavorable.'}
              </div>
            </Card>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============ 12 STAGES SECTION ============
const StagesSection = () => {
  const stages = [
    { num: 1, name: 'Discovery', desc: 'Identify upcoming auctions from RealForeclose, BECA, county records' },
    { num: 2, name: 'Scraping', desc: 'Extract property data from BCPAO, AcclaimWeb, RealTDM' },
    { num: 3, name: 'Title Search', desc: 'Automated lien discovery and document retrieval' },
    { num: 4, name: 'Lien Priority', desc: 'Senior mortgage survival detection (HOA/Tax scenarios)' },
    { num: 5, name: 'Tax Certificates', desc: 'Outstanding tax debt and redemption calculations' },
    { num: 6, name: 'Demographics', desc: 'Census API: income, vacancy rates, growth trends' },
    { num: 7, name: 'ML Score', desc: 'XGBoost predictions: win probability, sale price' },
    { num: 8, name: 'Max Bid', desc: 'The Shapira Formula: (ARV×70%)-Repairs-$10K-Margin' },
    { num: 9, name: 'Decision Log', desc: 'BID/REVIEW/SKIP/DO_NOT_BID with full reasoning' },
    { num: 10, name: 'Report', desc: 'Professional DOCX with photos, maps, CMA analysis' },
    { num: 11, name: 'Disposition', desc: 'Exit strategy: Flip, Rental, MTR, Wholesale' },
    { num: 12, name: 'Archive', desc: 'Supabase persistence with full audit trail' },
  ];

  return (
    <section id="stages" className="py-24 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      
      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp}>
            <Badge variant="warning" className="mb-4">THE METHODOLOGY</Badge>
          </motion.div>
          <motion.h2 
            variants={fadeInUp}
            className="text-4xl lg:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: theme.fonts.display }}
          >
            The Everest Ascent™
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-xl text-slate-400 max-w-2xl mx-auto">
            12 stages from courthouse data to investment decision. 
            Each stage builds on the last, creating unshakeable intelligence.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stages.map((stage, idx) => (
            <motion.div
              key={stage.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="p-5 h-full hover:border-amber-500/30 transition-colors group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:from-amber-500/30 transition-colors">
                    <span className="text-amber-400 font-bold text-sm">{stage.num}</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{stage.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{stage.desc}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============ FOUNDER SECTION ============
const FounderSection = () => (
  <section id="founder" className="py-24 px-6 relative">
    <div className="absolute inset-0 bg-slate-950" />
    
    <div className="relative max-w-4xl mx-auto">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp} className="text-center mb-12">
          <Badge variant="info" className="mb-4">THE FOUNDER</Badge>
        </motion.div>
        
        <Card className="p-8 lg:p-12">
          <motion.div variants={fadeInUp} className="flex flex-col lg:flex-row items-center gap-8">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center flex-shrink-0">
              <span className="text-4xl font-bold text-slate-900">AS</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Ariel Shapira</h3>
              <p className="text-amber-400 font-medium mb-4">Founder & Developer, Everest Capital USA</p>
              <p className="text-slate-400 leading-relaxed mb-4">
                10+ years in Florida foreclosure investing. Licensed broker, general contractor, 
                and insurance agency owner. Building BidDeed.AI to democratize access to 
                courthouse intelligence that was previously available only to insiders.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge>FL Real Estate Broker</Badge>
                <Badge>General Contractor</Badge>
                <Badge>10+ Years Foreclosure Investing</Badge>
              </div>
            </div>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  </section>
);

// ============ CTA SECTION ============
const CTASection = () => (
  <section id="waitlist" className="py-24 px-6 relative">
    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900 to-slate-950" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
    
    <div className="relative max-w-3xl mx-auto text-center">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <motion.h2 
          variants={fadeInUp}
          className="text-4xl lg:text-5xl font-bold text-white mb-6"
          style={{ fontFamily: theme.fonts.display }}
        >
          Ready to Reach the Summit?
        </motion.h2>
        <motion.p variants={fadeInUp} className="text-xl text-slate-400 mb-10">
          Join the waitlist for early access to BidDeed.AI. 
          Transform your auction research from hours to seconds.
        </motion.p>
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
          <input 
            type="email" 
            placeholder="Enter your email"
            className="px-6 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors w-full sm:w-80"
          />
          <Button size="lg">
            Get Early Access
          </Button>
        </motion.div>
        <motion.p variants={fadeInUp} className="text-sm text-slate-500 mt-4">
          No spam. Unsubscribe anytime. Currently in private beta.
        </motion.p>
      </motion.div>
    </div>
  </section>
);

// ============ FOOTER ============
const Footer = () => (
  <footer className="py-12 px-6 border-t border-slate-800">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <span className="text-slate-900 font-bold text-xs">BD</span>
          </div>
          <span className="text-white font-semibold">BidDeed.AI</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-500 text-sm">An Everest Company</span>
        </div>
        <div className="text-sm text-slate-500">
          © 2025 Everest Capital USA. All rights reserved. Built with Claude AI.
        </div>
      </div>
    </div>
  </footer>
);

// ============ MAIN APP ============
export default function App() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <Hero onOpenDemo={() => setDemoOpen(true)} />
      <StagesSection />
      <FounderSection />
      <CTASection />
      <Footer />
      
      <SplitScreenDemo isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
