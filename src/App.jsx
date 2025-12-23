// BidDeed.AI V19.0 - "Consolidated Summit" Edition
// Mobile-Responsive Landing Page + 12-Stage Everest Ascent™ Pipeline
// © 2025 Everest Capital USA. All Rights Reserved.
// Architecture: Claude Opus 4.5 | Design: Premium Responsive UI

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

// ============ DESIGN SYSTEM ============
const theme = {
  colors: {
    navy: { 950: '#030712', 900: '#0a0f1a', 800: '#111827', 700: '#1e293b', 600: '#334155' },
    gold: { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' },
    emerald: { 400: '#34d399', 500: '#10b981', 600: '#059669' },
    red: { 400: '#f87171', 500: '#ef4444', 600: '#dc2626' },
    slate: { 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569' }
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
};

// ============ THE EVEREST ASCENT™ - 12 STAGES ============
const EVEREST_ASCENT_STAGES = [
  // Phase 1: Base Camp (Discovery & Data Gathering)
  {
    number: 1,
    name: 'Discovery',
    brand: 'AuctionRadar™',
    phase: 'Base Camp',
    icon: '🔍',
    color: theme.colors.emerald[500],
    description: 'Identify upcoming auctions from RealForeclose, BECA, and county clerks',
    outputs: 'List of auction opportunities with case numbers and dates',
    duration: '30 sec',
    flagship: false
  },
  {
    number: 2,
    name: 'BECA Scraping',
    brand: null,
    phase: 'Base Camp',
    icon: '📄',
    color: theme.colors.emerald[500],
    description: 'Extract detailed case data from Brevard Electronic Court Access',
    outputs: 'Case details, judgment amounts, plaintiff info, property address',
    duration: '45 sec',
    flagship: false
  },
  
  // Phase 2: The Approach (Title & Lien Analysis)
  {
    number: 3,
    name: 'Title Search',
    brand: 'TitleTrack™',
    phase: 'The Approach',
    icon: '📋',
    color: theme.colors.gold[500],
    description: 'Analyze ownership chain and recorded documents',
    outputs: 'Ownership history, recorded liens, title defects',
    duration: '60 sec',
    flagship: false
  },
  {
    number: 4,
    name: 'Lien Priority',
    brand: 'LienLogic™',
    phase: 'The Approach',
    icon: '⚖️',
    color: theme.colors.gold[500],
    description: 'Determine lien hierarchy and identify surviving interests',
    outputs: 'Lien hierarchy, DO_NOT_BID flags for HOA scenarios',
    duration: '45 sec',
    flagship: true // FLAGSHIP STAGE
  },
  {
    number: 5,
    name: 'Tax Certificates',
    brand: null,
    phase: 'The Approach',
    icon: '🏛️',
    color: theme.colors.gold[500],
    description: 'Analyze outstanding tax certificates from RealTDM',
    outputs: 'Tax liens, certificate holders, redemption status',
    duration: '40 sec',
    flagship: false
  },
  {
    number: 6,
    name: 'Demographics',
    brand: 'MarketPulse™',
    phase: 'The Approach',
    icon: '🗺️',
    color: theme.colors.gold[500],
    description: 'Census data integration for market context',
    outputs: 'Income levels, vacancy rates, population trends',
    duration: '35 sec',
    flagship: false
  },
  
  // Phase 3: The Climb (Valuation & Decision)
  {
    number: 7,
    name: 'ML Score',
    brand: 'BidScore™',
    phase: 'The Climb',
    icon: '🤖',
    color: theme.colors.slate[400],
    description: 'XGBoost prediction of third-party purchase probability',
    outputs: 'ML confidence score (0-100%), risk classification',
    duration: '20 sec',
    flagship: false
  },
  {
    number: 8,
    name: 'Max Bid Calculation',
    brand: 'Shapira Formula™',
    phase: 'The Climb',
    icon: '💰',
    color: theme.colors.slate[400],
    description: 'Proprietary formula: (ARV×70%) - Repairs - $10K - MIN($25K, 15%ARV)',
    outputs: 'Max bid amount, bid/judgment ratio',
    duration: '15 sec',
    flagship: true // FLAGSHIP STAGE
  },
  
  // Phase 4: Summit (Execution & Delivery)
  {
    number: 9,
    name: 'Decision Log',
    brand: null,
    phase: 'Summit',
    icon: '✅',
    color: theme.colors.red[500],
    description: 'Final recommendation: BID, REVIEW, SKIP, or DO_NOT_BID',
    outputs: 'Decision + reasoning, stored in Supabase',
    duration: '10 sec',
    flagship: false
  },
  {
    number: 10,
    name: 'Report Generation',
    brand: null,
    phase: 'Summit',
    icon: '📑',
    color: theme.colors.red[500],
    description: 'One-page DOCX report with BidDeed.AI branding',
    outputs: 'Professional PDF with photos, metrics, recommendation',
    duration: '30 sec',
    flagship: false
  },
  {
    number: 11,
    name: 'Disposition Tracking',
    brand: 'ExitPath™',
    phase: 'Summit',
    icon: '🎯',
    color: theme.colors.red[500],
    description: 'Exit strategy determination (Flip, Rent, Wholesale)',
    outputs: 'Recommended exit path with profit projections',
    duration: '25 sec',
    flagship: false
  },
  {
    number: 12,
    name: 'Archive',
    brand: null,
    phase: 'Summit',
    icon: '💾',
    color: theme.colors.red[500],
    description: 'Store complete analysis in Supabase for historical tracking',
    outputs: 'Persistent record in auction_results table',
    duration: '15 sec',
    flagship: false
  }
];

// ============ REAL AUCTION DATA ============
const FEATURED_PROPERTIES = [
  {
    id: 1,
    caseNumber: '250179',
    address: '202 Ivory Coral Ln #302, Merritt Island, FL 32953',
    openingBid: 6847,
    marketValue: 176000,
    recommendation: 'BID',
    bidJudgmentRatio: 96,
    mlScore: 72,
    phase: 'Summit'
  },
  {
    id: 2,
    caseNumber: '250216',
    address: '202 Ivory Coral Ln #204, Merritt Island, FL 32953',
    openingBid: 7234,
    marketValue: 168000,
    recommendation: 'BID',
    bidJudgmentRatio: 95,
    mlScore: 68,
    phase: 'Summit'
  },
  {
    id: 3,
    caseNumber: '250287',
    address: '1455 Saturn St, Merritt Island, FL 32953',
    openingBid: 12450,
    marketValue: 245000,
    recommendation: 'REVIEW',
    bidJudgmentRatio: 72,
    mlScore: 58,
    phase: 'The Climb'
  }
];

export default function BidDeedAILanding() {
  const [activePipelineStage, setActivePipelineStage] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);
  const headerBlur = useTransform(scrollY, [0, 100], [0, 10]);

  // Auto-cycle through pipeline stages
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePipelineStage(prev => (prev + 1) % 12);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentStage = EVEREST_ASCENT_STAGES[activePipelineStage];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #030712 0%, #0a0f1a 50%, #111827 100%)',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <style>{`
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-stack { flex-direction: column !important; }
          .mobile-full { width: 100% !important; }
          .mobile-text-center { text-align: center !important; }
          .mobile-px-4 { padding-left: 1rem !important; padding-right: 1rem !important; }
        }
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
        }
        
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
      `}</style>

      {/* HEADER - Mobile Responsive */}
      <motion.header 
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          padding: '1rem 0',
          background: 'rgba(3, 7, 18, 0.95)',
          backdropFilter: `blur(${headerBlur}px)`,
          opacity: headerOpacity,
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '18px'
            }}>
              BD
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px', margin: 0 }}>
                BidDeed<span className="gradient-text">.AI</span>
              </h1>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }} className="desktop-only">
                Powered by The Everest Ascent™
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="desktop-only" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <a href="#pipeline" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
              Pipeline
            </a>
            <a href="#features" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
              Features
            </a>
            <a href="#pricing" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
              Pricing
            </a>
            <button style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              color: '#030712',
              border: 'none',
              padding: '0.625rem 1.5rem',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer'
            }}>
              Get Started
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-only"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '0.5rem',
              cursor: 'pointer',
              color: '#fff'
            }}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                background: '#0a0f1a',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                padding: '1rem'
              }}
            >
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <a href="#pipeline" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '16px', fontWeight: '600', padding: '0.5rem' }}>
                  Pipeline
                </a>
                <a href="#features" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '16px', fontWeight: '600', padding: '0.5rem' }}>
                  Features
                </a>
                <a href="#pricing" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '16px', fontWeight: '600', padding: '0.5rem' }}>
                  Pricing
                </a>
                <button style={{
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  color: '#030712',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}>
                  Get Started
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* HERO SECTION - Mobile Responsive */}
      <section style={{
        padding: '4rem 1.5rem',
        maxWidth: '1400px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={{
            display: 'inline-block',
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '100px',
            padding: '0.5rem 1.25rem',
            marginBottom: '1.5rem',
            fontSize: '13px',
            fontWeight: '600',
            color: '#fbbf24'
          }}>
            🚀 The Everest Ascent™ Methodology
          </div>

          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: '900',
            lineHeight: '1.1',
            marginBottom: '1.5rem',
            letterSpacing: '-0.02em'
          }}>
            AI-Powered Foreclosure<br/>
            <span className="gradient-text">Intelligence Platform</span>
          </h2>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: '#94a3b8',
            maxWidth: '700px',
            margin: '0 auto 2.5rem',
            lineHeight: '1.6'
          }}>
            12-stage agentic AI pipeline that analyzes Florida foreclosure auctions in 6 minutes,
            saving you $100K-$300K in avoided losses and capturing $50K+ opportunities.
          </p>

          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              color: '#030712',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(251, 191, 36, 0.3)'
            }}>
              Start Free Trial
            </button>
            <button style={{
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '1rem 2rem',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '16px',
              cursor: 'pointer'
            }}>
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '2rem',
            marginTop: '4rem',
            maxWidth: '900px',
            margin: '4rem auto 0'
          }}>
            <div>
              <div style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '900', color: '#10b981' }}>
                $300K
              </div>
              <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '0.5rem' }}>
                Annual Value per User
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '900', color: '#fbbf24' }}>
                6 min
              </div>
              <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '0.5rem' }}>
                Full Property Analysis
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '900', color: '#ef4444' }}>
                75%+
              </div>
              <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '0.5rem' }}>
                Prediction Accuracy
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 12-STAGE PIPELINE VISUALIZATION - Mobile Responsive */}
      <section id="pipeline" style={{
        padding: '4rem 1.5rem',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h3 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: '900',
            marginBottom: '1rem'
          }}>
            The Everest Ascent<span className="gradient-text">™</span>
          </h3>
          <p style={{ fontSize: '1.125rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
            Our proprietary 12-stage methodology climbs from discovery to decision
          </p>
        </div>

        {/* Active Stage Display - Mobile Responsive */}
        <div className="glass-card" style={{
          padding: 'clamp(1.5rem, 3vw, 2.5rem)',
          marginBottom: '2rem',
          background: `linear-gradient(135deg, ${currentStage.color}15 0%, transparent 100%)`
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{
                fontSize: '48px',
                width: '64px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `${currentStage.color}20`,
                borderRadius: '12px'
              }}>
                {currentStage.icon}
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: currentStage.color,
                    background: `${currentStage.color}20`,
                    padding: '0.25rem 0.75rem',
                    borderRadius: '6px'
                  }}>
                    STAGE {currentStage.number}
                  </span>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#94a3b8',
                    textTransform: 'uppercase'
                  }}>
                    {currentStage.phase}
                  </span>
                  {currentStage.flagship && (
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                      color: '#030712',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px'
                    }}>
                      ⭐ FLAGSHIP
                    </span>
                  )}
                </div>
                <h4 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: '800', marginBottom: '0.5rem' }}>
                  {currentStage.name}
                  {currentStage.brand && <span className="gradient-text"> · {currentStage.brand}</span>}
                </h4>
                <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '0.25rem' }}>
                  {currentStage.description}
                </p>
                <p style={{ fontSize: '12px', color: '#64748b' }}>
                  ⏱️ {currentStage.duration}
                </p>
              </div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              padding: '1rem',
              borderLeft: `3px solid ${currentStage.color}`
            }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Key Outputs
              </div>
              <div style={{ fontSize: '14px', color: '#cbd5e1' }}>
                {currentStage.outputs}
              </div>
            </div>
          </div>
        </div>

        {/* Stage Progress Bar - Mobile Responsive */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
          gap: '0.5rem',
          marginBottom: '2rem'
        }}>
          {EVEREST_ASCENT_STAGES.map((stage, idx) => (
            <motion.div
              key={stage.number}
              animate={{
                scale: idx === activePipelineStage ? 1.1 : 1,
                opacity: idx === activePipelineStage ? 1 : 0.4
              }}
              style={{
                height: '4px',
                background: idx <= activePipelineStage ? stage.color : 'rgba(255, 255, 255, 0.1)',
                borderRadius: '2px',
                cursor: 'pointer'
              }}
              onClick={() => setActivePipelineStage(idx)}
            />
          ))}
        </div>

        {/* All Stages Grid - Mobile Responsive */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {EVEREST_ASCENT_STAGES.map((stage) => (
            <motion.div
              key={stage.number}
              className="glass-card hover-lift"
              whileHover={{ scale: 1.02 }}
              onClick={() => setActivePipelineStage(stage.number - 1)}
              style={{
                padding: '1.5rem',
                cursor: 'pointer',
                borderColor: stage.number === activePipelineStage + 1 ? stage.color : 'rgba(255, 255, 255, 0.1)',
                background: stage.number === activePipelineStage + 1 ? `${stage.color}10` : 'rgba(255, 255, 255, 0.03)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{
                  fontSize: '32px',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${stage.color}20`,
                  borderRadius: '8px'
                }}>
                  {stage.icon}
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: stage.color,
                  background: `${stage.color}20`,
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px'
                }}>
                  {stage.number}
                </div>
              </div>

              <h5 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '0.5rem' }}>
                {stage.name}
              </h5>
              {stage.brand && (
                <div className="gradient-text" style={{ fontSize: '13px', fontWeight: '700', marginBottom: '0.5rem' }}>
                  {stage.brand}
                </div>
              )}
              <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '0.75rem' }}>
                {stage.description}
              </p>
              <div style={{
                fontSize: '11px',
                color: '#64748b',
                padding: '0.5rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '6px',
                borderLeft: `2px solid ${stage.color}`
              }}>
                {stage.outputs}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED PROPERTIES - Mobile Responsive */}
      <section style={{
        padding: '4rem 1.5rem',
        maxWidth: '1400px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '24px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h3 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: '900',
            marginBottom: '1rem'
          }}>
            Live Auction Analysis
          </h3>
          <p style={{ fontSize: '1.125rem', color: '#94a3b8' }}>
            Dec 18, 2025 Tax Deed Sale · Brevard County, FL
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {FEATURED_PROPERTIES.map((prop) => {
            const recColor = {
              BID: theme.colors.emerald[500],
              REVIEW: theme.colors.gold[500],
              SKIP: theme.colors.red[500]
            }[prop.recommendation];

            return (
              <div key={prop.id} className="glass-card hover-lift" style={{
                padding: '1.5rem',
                borderColor: `${recColor}40`
              }}>
                <div style={{
                  display: 'inline-block',
                  background: `${recColor}20`,
                  color: recColor,
                  padding: '0.375rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '800',
                  marginBottom: '1rem'
                }}>
                  {prop.recommendation}
                </div>

                <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '0.5rem' }}>
                  {prop.address}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '1.5rem', fontFamily: 'monospace' }}>
                  Case #{prop.caseNumber}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '0.25rem' }}>
                      Opening Bid
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: recColor }}>
                      ${prop.openingBid.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '0.25rem' }}>
                      Market Value
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '800' }}>
                      ${prop.marketValue.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '0.25rem' }}>
                      ML Score
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '700' }}>
                      {prop.mlScore}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '0.25rem' }}>
                      Discount
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: theme.colors.emerald[500] }}>
                      {prop.bidJudgmentRatio}%
                    </div>
                  </div>
                </div>

                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  background: `${recColor}10`,
                  borderLeft: `3px solid ${recColor}`,
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#cbd5e1'
                }}>
                  Pipeline Stage: <strong>{prop.phase}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA SECTION - Mobile Responsive */}
      <section style={{
        padding: '4rem 1.5rem',
        maxWidth: '900px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div className="glass-card" style={{
          padding: 'clamp(2rem, 5vw, 3rem)',
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
          borderColor: 'rgba(251, 191, 36, 0.3)'
        }}>
          <h3 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: '900',
            marginBottom: '1rem'
          }}>
            Ready to Ascend?
          </h3>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: '#94a3b8',
            marginBottom: '2rem'
          }}>
            Join foreclosure investors who save $300K+ annually with BidDeed.AI
          </p>
          <button style={{
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            color: '#030712',
            border: 'none',
            padding: '1.25rem 2.5rem',
            borderRadius: '12px',
            fontWeight: '900',
            fontSize: '18px',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(251, 191, 36, 0.4)',
            width: '100%',
            maxWidth: '400px'
          }}>
            Start Your Free Trial →
          </button>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '1rem' }}>
            No credit card required · 14-day trial · Cancel anytime
          </p>
        </div>
      </section>

      {/* FOOTER - Mobile Responsive */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '3rem 1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div className="gradient-text" style={{ fontSize: '24px', fontWeight: '900', marginBottom: '1rem' }}>
            BidDeed.AI
          </div>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '1.5rem' }}>
            Powered by The Everest Ascent™ Methodology
          </p>
          <p style={{ fontSize: '12px', color: '#475569' }}>
            © 2025 Everest Capital USA. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
