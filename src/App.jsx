// BidDeed.AI Landing Page V15.0.0 - "Clean & Sharp" Edition
// Built by Ariel Shapira - Solo Founder, Everest Capital USA
// Design: Minimal, Sharp, Mobile-First Responsive
// © 2025 All Rights Reserved

import React, { useState } from 'react';
import { motion } from 'framer-motion';

// ============ DESIGN TOKENS ============
const colors = {
  gold: '#F59E0B',
  emerald: '#10B981',
  slate: {
    900: '#0F172A',
    800: '#1E293B',
    700: '#334155',
    600: '#475569',
    400: '#94A3B8',
    300: '#CBD5E1',
  }
};

// ============ ANIMATION VARIANTS ============
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

// ============ COMPONENTS ============

// Navigation
const Nav = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 border-b border-slate-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm">BD</span>
          </div>
          <span className="text-xl font-bold text-white">
            BidDeed<span className="text-amber-500">.AI</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#methodology" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
            Methodology
          </a>
          <a href="#stages" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
            12 Stages
          </a>
          <a href="#founder" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
            Founder
          </a>
          <a href="#waitlist" className="px-4 py-2 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 transition-colors text-sm">
            Join Waitlist
          </a>
        </div>
        <a href="#waitlist" className="md:hidden px-4 py-2 bg-amber-500 text-black font-semibold rounded-lg text-sm">
          Join
        </a>
      </div>
    </div>
  </nav>
);

// Hero Section
const Hero = () => (
  <section className="pt-24 pb-16 sm:pt-32 sm:pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
    <div className="max-w-5xl mx-auto text-center">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Badge */}
        <motion.div variants={fadeUp} className="mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs sm:text-sm font-medium">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Agentic AI Ecosystem • Now in Beta
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1 
          variants={fadeUp}
          className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
        >
          Distressed Assets
          <br />
          <span className="text-amber-500">Decoded</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
          variants={fadeUp}
          className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          The Everest Ascent™ — 12 AI agents transform 4-hour courthouse research into 23-second intelligence for foreclosure auctions.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <a 
            href="#waitlist"
            className="w-full sm:w-auto px-8 py-4 bg-amber-500 text-black font-bold rounded-xl text-base sm:text-lg hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/25"
          >
            Join the Waitlist
          </a>
          <a 
            href="#stages"
            className="w-full sm:w-auto px-8 py-4 bg-slate-800 text-white font-semibold rounded-xl text-base sm:text-lg border border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-colors"
          >
            See 12 Stages
          </a>
        </motion.div>

        {/* Trust Badges */}
        <motion.div 
          variants={fadeUp}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-slate-500"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span>20+ Year Florida Investor</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-full" />
            <span>64.4% ML Accuracy</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full" />
            <span>Zero Human-in-Loop</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

// Stats Section
const Stats = () => {
  const stats = [
    { value: '23s', label: 'Per Property', detail: 'vs 4 hours manual' },
    { value: '64.4%', label: 'ML Accuracy', detail: 'Buyer prediction' },
    { value: '12', label: 'AI Agents', detail: 'Autonomous pipeline' },
    { value: '100x', label: 'ROI', detail: '$300K value' },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-800">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-center border border-slate-700"
            >
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-500 mb-2">
                {stat.value}
              </div>
              <div className="text-sm sm:text-base font-semibold text-white mb-1">
                {stat.label}
              </div>
              <div className="text-xs sm:text-sm text-slate-500">
                {stat.detail}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Methodology Section
const Methodology = () => (
  <section id="methodology" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-900">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12 sm:mb-16"
      >
        <span className="text-amber-500 font-semibold text-sm uppercase tracking-wider">
          Proprietary Framework
        </span>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mt-4 mb-4">
          The Everest Ascent™
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-lg">
          35 years of courthouse expertise encoded into a 12-stage AI pipeline. 
          From auction discovery to investment decision in under a minute.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
        {[
          { 
            phase: 'Base Camp', 
            stages: '1-2',
            title: 'Discovery', 
            desc: 'AI agents scan courthouse calendars and extract case details from BECA daily.',
            color: 'emerald'
          },
          { 
            phase: 'The Climb', 
            stages: '3-8',
            title: 'Analysis', 
            desc: 'Title search, lien priority, tax certificates, demographics, ML scoring, max bid calculation.',
            color: 'amber'
          },
          { 
            phase: 'Summit', 
            stages: '9-12',
            title: 'Decision', 
            desc: 'Clear recommendation: BID with confidence, REVIEW further, or SKIP entirely.',
            color: 'purple'
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="bg-slate-800 rounded-2xl p-6 sm:p-8 border border-slate-700"
          >
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
              item.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
              item.color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
              'bg-purple-500/20 text-purple-400'
            }`}>
              {item.phase} • Stages {item.stages}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">{item.title}</h3>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// 12 Stages Section
const Stages = () => {
  const stages = [
    { num: 1, name: 'Discovery', brand: 'AuctionRadar', icon: '🔍' },
    { num: 2, name: 'BECA Scraping', brand: null, icon: '📥' },
    { num: 3, name: 'Title Search', brand: 'TitleTrack', icon: '📋' },
    { num: 4, name: 'Lien Priority', brand: 'LienLogic', icon: '⚖️' },
    { num: 5, name: 'Tax Certificates', brand: null, icon: '📑' },
    { num: 6, name: 'Demographics', brand: 'MarketPulse', icon: '📊' },
    { num: 7, name: 'ML Score', brand: 'BidScore', icon: '🧠' },
    { num: 8, name: 'Max Bid', brand: 'The Shapira Formula', icon: '💰' },
    { num: 9, name: 'Decision Log', brand: null, icon: '📝' },
    { num: 10, name: 'Report', brand: null, icon: '📄' },
    { num: 11, name: 'Disposition', brand: 'ExitPath', icon: '🚀' },
    { num: 12, name: 'Archive', brand: null, icon: '🗄️' },
  ];

  return (
    <section id="stages" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-800">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-amber-500 font-semibold text-sm uppercase tracking-wider">
            Complete Pipeline
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-white mt-4 mb-4">
            12 Autonomous Stages
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Each stage is powered by a specialized AI agent. They work together to deliver actionable intelligence.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {stages.map((stage, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-700 hover:border-amber-500/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{stage.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-500 font-mono">Stage {stage.num}</div>
                  <div className="text-sm sm:text-base font-semibold text-white truncate">{stage.name}</div>
                  {stage.brand && (
                    <div className="text-xs text-amber-500 mt-1 truncate">{stage.brand}</div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Founder Section
const Founder = () => (
  <section id="founder" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-900">
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-700"
      >
        <div className="text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl sm:text-4xl">🏠</span>
          </div>
          <blockquote className="text-lg sm:text-2xl lg:text-3xl font-medium text-white mb-6 leading-relaxed">
            "I built this because I was tired of guessing at auctions. After 20 years and hundreds of deals, 
            I knew exactly what data I needed — I just needed AI to get it faster."
          </blockquote>
          <div className="text-amber-500 font-bold text-lg sm:text-xl">Ariel Shapira</div>
          <div className="text-slate-400 text-sm sm:text-base">Solo Founder • Everest Capital USA</div>
          <div className="text-slate-500 text-xs sm:text-sm mt-2">
            20+ Years Florida Real Estate • Licensed Broker & General Contractor
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

// Waitlist Section
const Waitlist = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email');
      return;
    }

    setStatus('loading');
    
    try {
      // Store in localStorage as backup
      const waitlist = JSON.parse(localStorage.getItem('biddeed_waitlist') || '[]');
      if (!waitlist.includes(email)) {
        waitlist.push(email);
        localStorage.setItem('biddeed_waitlist', JSON.stringify(waitlist));
      }
      await new Promise(resolve => setTimeout(resolve, 800));
      setStatus('success');
      setMessage("You're on the list! We'll be in touch soon.");
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <section id="waitlist" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs sm:text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Limited Beta Access
          </span>
          
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Ready to Stop Guessing?
          </h2>
          
          <p className="text-slate-400 mb-8 text-sm sm:text-lg max-w-lg mx-auto">
            Join 50+ Florida investors on the waitlist. Be first to access the Agentic AI ecosystem.
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
                placeholder="Enter your email"
                className={`flex-1 px-5 py-4 bg-slate-900 border-2 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors text-base ${
                  status === 'error' ? 'border-red-500' : 'border-slate-700'
                }`}
                disabled={status === 'loading' || status === 'success'}
              />
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className={`px-6 py-4 font-bold rounded-xl transition-colors text-base whitespace-nowrap ${
                  status === 'success' 
                    ? 'bg-emerald-500 text-black' 
                    : status === 'loading'
                    ? 'bg-amber-500/50 text-black/50'
                    : 'bg-amber-500 text-black hover:bg-amber-400'
                }`}
              >
                {status === 'loading' ? 'Joining...' : status === 'success' ? "✓ You're In!" : 'Join Waitlist'}
              </button>
            </div>
            
            {message && (
              <p className={`mt-4 text-sm font-medium ${status === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
                {message}
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => (
  <footer className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800 bg-slate-900">
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center">
            <span className="text-black font-bold text-xs">BD</span>
          </div>
          <span className="text-lg font-bold text-white">
            BidDeed<span className="text-amber-500">.AI</span>
          </span>
        </div>
        
        <div className="text-xs sm:text-sm text-slate-500">
          © 2025 Everest Capital of Brevard LLC. All rights reserved.
        </div>
        
        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500">
          <span>An Everest Company</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Made in Florida 🌴</span>
        </div>
      </div>
    </div>
  </footer>
);

// ============ MAIN APP ============
export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white antialiased">
      <Nav />
      <Hero />
      <Stats />
      <Methodology />
      <Stages />
      <Founder />
      <Waitlist />
      <Footer />
    </div>
  );
}
