// BidDeed.AI Landing Page V17.0.0 - "Everest Ascent" Edition
// Triple Deliverable: Landing + Video Demo + Split-Screen UI
// © 2025 Everest Capital USA. All Rights Reserved.

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

// ============ BRAND CONSTANTS ============
const BRAND = {
  colors: {
    amber: { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' },
    emerald: { 400: '#34d399', 500: '#10b981' },
    slate: { 800: '#1e293b', 900: '#0f172a', 950: '#020617' },
    red: { 500: '#ef4444' },
  },
  stats: {
    accuracy: '64.4%',
    stages: 12,
    timeReduction: '4 hours → 23 seconds',
    roi: '100x',
    fieldsMatched: 73,
    costSavings: '90%',
  }
};

// ============ ANIMATION VARIANTS ============
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
};

const slideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } }
};

// ============ ICONS ============
const Icons = {
  Mountain: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M8 21l4-10 4 10M12 11V3M4 21h16" />
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Brain: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M12 2a4 4 0 0 1 4 4v1a3 3 0 0 1 3 3v1a3 3 0 0 1-1 5.5V18a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4v-1.5A3 3 0 0 1 5 11v-1a3 3 0 0 1 3-3V6a4 4 0 0 1 4-4z" />
    </svg>
  ),
  Chart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M3 3v18h18M7 16l4-4 4 4 5-6" />
    </svg>
  ),
  Play: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
      <path d="M5 12l5 5L20 7" />
    </svg>
  ),
  ArrowRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
};

// ============ NAVIGATION ============
const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#methodology', label: 'The Everest Ascent™' },
    { href: '#demo', label: 'Live Demo' },
    { href: '#features', label: 'V17 Features' },
    { href: '#founder', label: 'Founder' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-black/30' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25 transform group-hover:scale-105 transition-transform">
              <span className="text-slate-900 font-black text-sm tracking-tight">BD</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white tracking-tight leading-none">
                BidDeed<span className="text-amber-400">.AI</span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider uppercase">V17 • Everest Ascent</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-slate-300 hover:text-white transition-colors text-sm font-medium rounded-lg hover:bg-white/5"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#waitlist"
              className="ml-4 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all text-sm shadow-lg shadow-amber-500/25"
            >
              Request Access
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-white rounded-lg hover:bg-white/10"
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
    </nav>
  );
};

// ============ HERO SECTION ============
const HeroSection = ({ onOpenDemo }) => {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-20 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-slate-950" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto w-full">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="text-center"
        >
          {/* V17 Badge */}
          <motion.div variants={slideUp} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-amber-500/20 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-sm font-medium text-amber-300">V17 Live</span>
              <span className="text-slate-400">•</span>
              <span className="text-sm text-slate-300">Dec 18 Tax Deed Auction Ready</span>
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1 
            variants={slideUp}
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight"
          >
            <span className="block">Distressed Assets</span>
            <span className="block bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 bg-clip-text text-transparent">
              Decoded by AI
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            variants={slideUp}
            className="text-lg sm:text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            The <span className="text-amber-400 font-semibold">Everest Ascent™</span> — a 12-stage AI pipeline 
            that transforms 4-hour courthouse research into{' '}
            <span className="text-emerald-400 font-semibold">23-second intelligence</span>.
            {' '}Now with <span className="text-white font-semibold">73+ data fields</span> and{' '}
            <span className="text-white font-semibold">64.4% ML accuracy</span>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={slideUp} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={onOpenDemo}
              className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-bold rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-xl shadow-amber-500/30 flex items-center justify-center gap-3"
            >
              <div className="w-8 h-8 bg-slate-900/20 rounded-full flex items-center justify-center">
                <Icons.Play />
              </div>
              <span>Watch Live Demo</span>
            </button>
            <a
              href="#waitlist"
              className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <span>Request Access</span>
              <Icons.ArrowRight />
            </a>
          </motion.div>

          {/* Key Stats */}
          <motion.div 
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {[
              { value: '73+', label: 'Data Fields', sublabel: 'PropertyOnion Parity' },
              { value: '64.4%', label: 'ML Accuracy', sublabel: 'XGBoost Predictions' },
              { value: '12', label: 'Pipeline Stages', sublabel: 'Everest Ascent™' },
              { value: '100x', label: 'ROI', sublabel: '$300K Value / $3K Cost' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl"
              >
                <div className="text-2xl sm:text-3xl font-bold text-amber-400">{stat.value}</div>
                <div className="text-sm font-medium text-white">{stat.label}</div>
                <div className="text-xs text-slate-400">{stat.sublabel}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// ============ EVEREST ASCENT 12 STAGES ============
const EverestAscentSection = () => {
  const stages = [
    { num: 1, name: 'Discovery', desc: 'Auction identification', icon: '🔍', color: 'amber' },
    { num: 2, name: 'Scraping', desc: 'BCPAO + RealTDM data', icon: '📡', color: 'amber' },
    { num: 3, name: 'Title Search', desc: 'AcclaimWeb integration', icon: '📋', color: 'amber' },
    { num: 4, name: 'Lien Priority', desc: 'Senior mortgage detection', icon: '⚠️', color: 'red' },
    { num: 5, name: 'Tax Certs', desc: 'Redemption amounts', icon: '💰', color: 'amber' },
    { num: 6, name: 'Demographics', desc: 'Census API data', icon: '📊', color: 'emerald' },
    { num: 7, name: 'ML Score', desc: 'Win probability matrix', icon: '🧠', color: 'emerald' },
    { num: 8, name: 'Max Bid', desc: 'Shapira Formula™', icon: '🎯', color: 'amber' },
    { num: 9, name: 'Decision Log', desc: 'BID/REVIEW/SKIP', icon: '✅', color: 'emerald' },
    { num: 10, name: 'Report', desc: 'DOCX generation', icon: '📄', color: 'amber' },
    { num: 11, name: 'Disposition', desc: 'Exit strategy', icon: '🏠', color: 'emerald' },
    { num: 12, name: 'Archive', desc: 'Supabase storage', icon: '💾', color: 'slate' },
  ];

  return (
    <section id="methodology" className="py-24 px-4 bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={slideUp} className="mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-medium">
              <Icons.Mountain />
              The Methodology
            </span>
          </motion.div>
          <motion.h2 variants={slideUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            The Everest Ascent™
          </motion.h2>
          <motion.p variants={slideUp} className="text-lg text-slate-400 max-w-2xl mx-auto">
            12 stages to the summit of distressed real estate intelligence.
            Each stage automated by LangGraph orchestration.
          </motion.p>
        </motion.div>

        {/* Stages Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {stages.map((stage, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              className={`relative p-5 rounded-xl border transition-all hover:scale-105 cursor-default ${
                stage.color === 'red' 
                  ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/50'
                  : stage.color === 'emerald'
                  ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50'
                  : 'bg-white/5 border-white/10 hover:border-amber-500/50'
              }`}
            >
              <div className="absolute top-3 right-3 text-xs font-mono text-slate-500">
                {String(stage.num).padStart(2, '0')}
              </div>
              <div className="text-2xl mb-2">{stage.icon}</div>
              <div className="text-sm font-semibold text-white mb-1">{stage.name}</div>
              <div className="text-xs text-slate-400">{stage.desc}</div>
              {stage.color === 'red' && (
                <div className="mt-2 text-[10px] text-red-400 font-medium uppercase tracking-wider">
                  DO_NOT_BID Detection
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ============ V17 FEATURES SECTION ============
const V17FeaturesSection = () => {
  const features = [
    {
      title: 'PropertyOnion Parity',
      description: '73+ data fields matching and exceeding competitor coverage',
      icon: '📊',
      badge: 'NEW',
      details: ['POV High/Low ranges', 'Lien aggregation', 'Vacancy detection', 'Confidence ratings']
    },
    {
      title: 'Senior Mortgage Detection',
      description: 'Automatic DO_NOT_BID flagging for HOA foreclosures',
      icon: '🛡️',
      badge: 'CRITICAL',
      details: ['HOA plaintiff detection', 'Senior lien survival', '$100K+ loss prevention', 'Auto-recommendation']
    },
    {
      title: 'Win Probability Matrix',
      description: 'XGBoost predictions showing bid amount for each win probability',
      icon: '🎯',
      badge: 'ML',
      details: ['10% to 95% probability', 'Bid-to-win mapping', '64.4% accuracy', 'ROI optimization']
    },
    {
      title: 'Tax Deed Separation',
      description: 'Dedicated pipeline for tax deed vs foreclosure auctions',
      icon: '📑',
      badge: 'V17',
      details: ['RealTDM integration', 'FL Statute 197.522', 'Online auction support', 'Title search automation']
    },
  ];

  return (
    <section id="features" className="py-24 px-4 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={slideUp} className="mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium">
              <Icons.Brain />
              Dec 17, 2025 Release
            </span>
          </motion.div>
          <motion.h2 variants={slideUp} className="text-3xl sm:text-4xl font-bold text-white mb-4">
            V17 Improvements
          </motion.h2>
          <motion.p variants={slideUp} className="text-lg text-slate-400 max-w-2xl mx-auto">
            8 key learnings deployed. Claude AI architecture improvements.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-6"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-amber-500/30 transition-all"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="text-3xl">{feature.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      feature.badge === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                      feature.badge === 'ML' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {feature.badge}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{feature.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {feature.details.map((detail, j) => (
                  <div key={j} className="flex items-center gap-2 text-xs text-slate-300">
                    <div className="w-1 h-1 bg-amber-400 rounded-full" />
                    {detail}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ============ WAITLIST SECTION ============
const WaitlistSection = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Would integrate with Supabase
    setSubmitted(true);
  };

  return (
    <section id="waitlist" className="py-24 px-4 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2 variants={slideUp} className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Join the Waitlist
          </motion.h2>
          <motion.p variants={slideUp} className="text-lg text-slate-400 mb-8">
            Be first to access BidDeed.AI V17. Global investors welcome.
          </motion.p>

          {submitted ? (
            <motion.div
              variants={scaleIn}
              className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
            >
              <div className="text-emerald-400 text-lg font-semibold mb-2">You're on the list! 🎉</div>
              <div className="text-slate-300 text-sm">We'll notify you when access is available.</div>
            </motion.div>
          ) : (
            <motion.form
              variants={slideUp}
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
              <button
                type="submit"
                className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/25"
              >
                Request Access
              </button>
            </motion.form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

// ============ FOOTER ============
const Footer = () => (
  <footer className="py-12 px-4 bg-slate-950 border-t border-white/5">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
            <span className="text-slate-900 font-black text-xs">BD</span>
          </div>
          <div>
            <div className="text-white font-semibold">BidDeed.AI</div>
            <div className="text-xs text-slate-500">An Everest Capital USA Company</div>
          </div>
        </div>
        <div className="text-sm text-slate-500">
          © 2025 Everest Capital USA. All Rights Reserved.
        </div>
      </div>
    </div>
  </footer>
);

// ============ MAIN APP COMPONENT ============
const LandingPageV17 = () => {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <HeroSection onOpenDemo={() => setDemoOpen(true)} />
      <EverestAscentSection />
      <V17FeaturesSection />
      <WaitlistSection />
      <Footer />
      
      {/* Demo Modal would go here */}
      {demoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="max-w-4xl w-full mx-4">
            <button
              onClick={() => setDemoOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              Close
            </button>
            {/* AnimatedDemoV17 component would render here */}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPageV17;
