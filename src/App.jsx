// BidDeed.AI Landing Page V16.2.0 - "Demo Integrated" Edition
// Clean navy background + AnimatedDemo integration
// © 2025 Everest Capital USA. All Rights Reserved.

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedDemo from './AnimatedDemo';

// ============ ANIMATION VARIANTS ============
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

// ============ NAVIGATION ============
const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#methodology', label: 'Methodology' },
    { href: '#stages', label: '12 Stages' },
    { href: '#founder', label: 'Founder' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
      scrolled ? 'bg-slate-900/98 shadow-xl shadow-black/20' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20 transform group-hover:scale-105 transition-transform">
              <span className="text-slate-900 font-black text-sm tracking-tight">BD</span>
            </div>
            <span className="text-xl lg:text-2xl font-bold text-white tracking-tight">
              BidDeed<span className="text-amber-400">.AI</span>
            </span>
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
              className="ml-4 px-6 py-2.5 bg-amber-500 text-slate-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors text-sm shadow-lg shadow-amber-500/20"
            >
              Join Waitlist
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
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

        {/* Mobile Menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-slate-800 py-4"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#waitlist"
              onClick={() => setMobileOpen(false)}
              className="block mx-4 mt-4 px-6 py-3 bg-amber-500 text-slate-900 font-semibold rounded-lg text-center"
            >
              Join Waitlist
            </a>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

// ============ HERO SECTION ============
const Hero = ({ onOpenDemo }) => (
  <section className="relative min-h-screen flex items-center pt-20 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
    {/* Clean Navy Background - No Patterns */}
    <div className="absolute inset-0 bg-slate-900" />
    <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800" />
    
    {/* Subtle Glow Effect */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/5 rounded-full blur-3xl" />

    <div className="relative max-w-6xl mx-auto w-full">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="text-center"
      >
        {/* Badge */}
        <motion.div variants={slideUp} className="mb-8">
          <span className="inline-flex items-center gap-2.5 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-emerald-400 text-sm font-medium tracking-wide">
              Agentic AI Ecosystem • Now in Beta
            </span>
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1 
          variants={slideUp}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 tracking-tight"
        >
          Distressed Assets
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500">
            Decoded
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p 
          variants={slideUp}
          className="text-lg sm:text-xl lg:text-2xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-light"
        >
          The Everest Ascent™ — 12 AI agents transform 4-hour courthouse research into 23-second intelligence.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          variants={slideUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <a 
            href="#waitlist"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 font-bold rounded-xl text-lg hover:from-amber-400 hover:to-amber-300 transition-all shadow-xl shadow-amber-500/25 transform hover:scale-[1.02]"
          >
            Join the Waitlist
          </a>
          
          {/* PLAY DEMO - Primary CTA Button */}
          <button 
            onClick={onOpenDemo}
            className="w-full sm:w-auto group relative px-10 py-5 bg-gradient-to-r from-red-600 to-red-500 text-white font-black rounded-2xl text-xl hover:from-red-500 hover:to-red-400 transition-all shadow-2xl shadow-red-500/40 hover:shadow-red-500/60 transform hover:scale-105 flex items-center justify-center gap-4 border-2 border-red-400/30"
          >
            {/* Play Icon Circle */}
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <div className="text-left">
              <div className="text-2xl tracking-wide">▶ PLAY DEMO</div>
              <div className="text-xs font-normal text-red-200 opacity-90">47-sec AI Pipeline Walkthrough</div>
            </div>
          </button>
          
          <a 
            href="#stages"
            className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white font-semibold rounded-xl text-lg border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm"
          >
            Explore 12 Stages
          </a>
        </motion.div>

        {/* Stats Bar */}
        <motion.div 
          variants={slideUp}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {[
            { value: '23s', label: 'Per Property' },
            { value: '64.4%', label: 'ML Accuracy' },
            { value: '12', label: 'AI Agents' },
            { value: '100x', label: 'ROI' },
          ].map((stat, i) => (
            <div 
              key={i}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/5"
            >
              <div className="text-2xl sm:text-3xl font-bold text-amber-400 mb-1">{stat.value}</div>
              <div className="text-xs sm:text-sm text-slate-400 font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  </section>
);

// ============ METHODOLOGY SECTION ============
const Methodology = () => (
  <section id="methodology" className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-slate-800">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        {/* Section Header */}
        <motion.div variants={slideUp} className="text-center mb-16">
          <span className="text-amber-400 font-semibold text-sm uppercase tracking-widest">
            Proprietary Framework
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-4 mb-6 tracking-tight">
            The Everest Ascent™
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            35 years of courthouse expertise encoded into a 12-stage AI pipeline. 
            From auction discovery to investment decision — in under a minute.
          </p>
        </motion.div>

        {/* Three Phases */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {[
            { 
              phase: 'Base Camp', 
              stages: '1-2',
              title: 'Discovery', 
              desc: 'AI agents scan courthouse calendars daily and extract complete case details from BECA records.',
              color: 'emerald',
              icon: '🔍'
            },
            { 
              phase: 'The Climb', 
              stages: '3-8',
              title: 'Deep Analysis', 
              desc: 'Title search, lien priority analysis, tax certificates, market demographics, ML scoring, and max bid calculation.',
              color: 'amber',
              icon: '📊'
            },
            { 
              phase: 'Summit', 
              stages: '9-12',
              title: 'Decision', 
              desc: 'Clear recommendation delivered: BID with confidence, REVIEW further, or SKIP entirely.',
              color: 'purple',
              icon: '🎯'
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={slideUp}
              className="group relative bg-slate-900 rounded-2xl p-8 border border-slate-700 hover:border-slate-600 transition-all"
            >
              {/* Phase Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide mb-6 ${
                item.color === 'emerald' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                item.color === 'amber' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                'bg-purple-500/15 text-purple-400 border border-purple-500/30'
              }`}>
                {item.phase} • Stages {item.stages}
              </div>

              {/* Icon */}
              <div className="text-4xl mb-4">{item.icon}</div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>

              {/* Description */}
              <p className="text-slate-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

// ============ 12 STAGES SECTION ============
const Stages = () => {
  const stages = [
    { num: 1, name: 'Discovery', brand: 'AuctionRadar™', icon: '🔍', phase: 'base' },
    { num: 2, name: 'BECA Scraping', brand: 'Data Summit', icon: '📥', phase: 'base' },
    { num: 3, name: 'Title Search', brand: 'TitleTrack™', icon: '📋', phase: 'climb' },
    { num: 4, name: 'Lien Priority', brand: 'LienLogic™', icon: '⚖️', phase: 'climb' },
    { num: 5, name: 'Tax Certificates', brand: 'Tax Summit', icon: '📑', phase: 'climb' },
    { num: 6, name: 'Demographics', brand: 'MarketPulse™', icon: '📊', phase: 'climb' },
    { num: 7, name: 'ML Scoring', brand: 'BidScore™', icon: '🧠', phase: 'climb' },
    { num: 8, name: 'Max Bid', brand: 'Shapira Formula™', icon: '💰', phase: 'climb' },
    { num: 9, name: 'Decision Log', brand: 'Summit Log', icon: '📝', phase: 'summit' },
    { num: 10, name: 'Report Generation', brand: 'Summit Report', icon: '📄', phase: 'summit' },
    { num: 11, name: 'Disposition', brand: 'ExitPath™', icon: '🚀', phase: 'summit' },
    { num: 12, name: 'Archive', brand: 'Summit Archive', icon: '🗄️', phase: 'summit' },
  ];

  return (
    <section id="stages" className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {/* Section Header */}
          <motion.div variants={slideUp} className="text-center mb-16">
            <span className="text-amber-400 font-semibold text-sm uppercase tracking-widest">
              Complete Pipeline
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-4 mb-6 tracking-tight">
              12 Autonomous Stages
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">
              Each stage powered by a specialized AI agent. Zero human intervention required.
            </p>
          </motion.div>

          {/* Stages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {stages.map((stage, i) => (
              <motion.div
                key={i}
                variants={slideUp}
                className={`group relative bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border transition-all hover:scale-[1.02] ${
                  stage.phase === 'base' ? 'border-emerald-500/20 hover:border-emerald-500/40' :
                  stage.phase === 'climb' ? 'border-amber-500/20 hover:border-amber-500/40' :
                  'border-purple-500/20 hover:border-purple-500/40'
                }`}
              >
                {/* Stage Number */}
                <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  stage.phase === 'base' ? 'bg-emerald-500 text-slate-900' :
                  stage.phase === 'climb' ? 'bg-amber-500 text-slate-900' :
                  'bg-purple-500 text-white'
                }`}>
                  {stage.num}
                </div>

                <div className="flex items-start gap-4">
                  <span className="text-3xl">{stage.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white mb-1">{stage.name}</h3>
                    {stage.brand && (
                      <p className={`text-sm ${
                        stage.phase === 'base' ? 'text-emerald-400' :
                        stage.phase === 'climb' ? 'text-amber-400' :
                        'text-purple-400'
                      }`}>{stage.brand}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ============ FOUNDER SECTION ============
const Founder = () => (
  <section id="founder" className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-slate-800">
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeIn}
        className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 border border-slate-700 overflow-hidden"
      >
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
        
        <div className="relative text-center">
          {/* Avatar */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-amber-500/20">
            <span className="text-4xl sm:text-5xl">💻</span>
          </div>

          {/* Quote */}
          <blockquote className="text-xl sm:text-2xl lg:text-3xl font-medium text-white mb-8 leading-relaxed">
            "I built this because I was tired of guessing at auctions. After 20 years of investing and hundreds of deals, 
            I knew exactly what data I needed — I just needed AI to get it faster."
          </blockquote>

          {/* Author */}
          <div className="space-y-1">
            <div className="text-amber-400 font-bold text-xl sm:text-2xl">Ariel Shapira</div>
            <div className="text-slate-300 font-medium">Developer & Builder • Solo Founder, BidDeed.AI</div>
            <div className="text-slate-500 text-sm sm:text-base">
              Everest Capital USA
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

// ============ WAITLIST SECTION ============
const Waitlist = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');
    
    try {
      const waitlist = JSON.parse(localStorage.getItem('biddeed_waitlist') || '[]');
      if (!waitlist.includes(email)) {
        waitlist.push(email);
        localStorage.setItem('biddeed_waitlist', JSON.stringify(waitlist));
      }
      await new Promise(resolve => setTimeout(resolve, 600));
      setStatus('success');
      setMessage("You're on the list! We'll be in touch soon.");
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <section id="waitlist" className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-slate-900">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {/* Badge */}
          <motion.div variants={slideUp} className="mb-8">
            <span className="inline-flex items-center gap-2.5 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-emerald-400 text-sm font-medium">Limited Beta Access</span>
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h2 
            variants={slideUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight"
          >
            Ready to Stop Guessing?
          </motion.h2>

          {/* Description */}
          <motion.p 
            variants={slideUp}
            className="text-slate-400 mb-10 text-lg max-w-lg mx-auto"
          >
            Join 50+ Florida investors on the waitlist. Be first to access the Agentic AI ecosystem.
          </motion.p>

          {/* Form */}
          <motion.form 
            variants={slideUp}
            onSubmit={handleSubmit} 
            className="max-w-md mx-auto"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
                placeholder="Enter your email"
                className={`flex-1 px-5 py-4 bg-slate-800 border-2 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-colors text-base ${
                  status === 'error' ? 'border-red-500 focus:border-red-400' : 
                  status === 'success' ? 'border-emerald-500' :
                  'border-slate-700 focus:border-amber-500'
                }`}
                disabled={status === 'loading' || status === 'success'}
              />
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className={`px-8 py-4 font-bold rounded-xl transition-all text-base whitespace-nowrap ${
                  status === 'success' 
                    ? 'bg-emerald-500 text-white' 
                    : status === 'loading'
                    ? 'bg-amber-500/50 text-slate-900/50 cursor-wait'
                    : 'bg-amber-500 text-slate-900 hover:bg-amber-400 shadow-lg shadow-amber-500/20'
                }`}
              >
                {status === 'loading' ? 'Joining...' : status === 'success' ? '✓ Joined!' : 'Join Waitlist'}
              </button>
            </div>
            
            {message && (
              <p className={`mt-4 text-sm font-medium ${status === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
                {message}
              </p>
            )}
          </motion.form>
        </motion.div>
      </div>
    </section>
  );
};

// ============ FOOTER ============
const Footer = () => (
  <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800 bg-slate-900">
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
            <span className="text-slate-900 font-bold text-xs">BD</span>
          </div>
          <span className="text-xl font-bold text-white">
            BidDeed<span className="text-amber-400">.AI</span>
          </span>
        </div>
        
        {/* Copyright */}
        <div className="text-slate-500 text-sm text-center">
          © 2025 Everest Capital USA. All rights reserved.
        </div>
        
        {/* Tagline */}
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <span>An Everest Company</span>
          <span className="hidden sm:inline text-slate-700">•</span>
          <span className="hidden sm:inline">Made in Florida 🌴</span>
        </div>
      </div>
    </div>
  </footer>
);

// ============ MAIN APP ============
export default function App() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-white antialiased">
      <Nav />
      <Hero onOpenDemo={() => setShowDemo(true)} />
      <Methodology />
      <Stages />
      <Founder />
      <Waitlist />
      <Footer />
      
      {/* Animated Demo Modal */}
      <AnimatePresence>
        {showDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
          >
            <AnimatedDemo onClose={() => setShowDemo(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
