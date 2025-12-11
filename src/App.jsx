// BrevardBidderAI Landing Page V3.5.0 - "$1M Homepage" Edition
// Built by Ariel Shapira - Real Estate Developer & Founder, Everest Capital USA
// Design System: Luxury Data Terminal - Industrial Fintech Aesthetic

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import AnimatedDemo from './AnimatedDemo';
import PremiumHero from './PremiumHero';
import AILiveDemo from './AILiveDemo';
import NextAuction from './NextAuction';
import DemoButton from './DemoButton';
import EmbeddedPipelineDemo from './EmbeddedPipelineDemo';

// ============ ANIMATION VARIANTS ============
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
};

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
};

// ============ FLOATING PARTICLE COMPONENT ============
const FloatingParticle = ({ delay = 0, size = 4, x = 0, y = 0 }) => (
  <motion.div
    className="absolute rounded-full bg-amber-400/30"
    style={{ width: size, height: size, left: `${x}%`, top: `${y}%` }}
    animate={{
      y: [0, -30, 0],
      opacity: [0.3, 0.8, 0.3],
      scale: [1, 1.2, 1],
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
);

// ============ WAITLIST FORM COMPONENT ============
const WaitlistForm = ({ variant = 'default' }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
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
      const waitlist = JSON.parse(localStorage.getItem('brevard_waitlist') || '[]');
      if (!waitlist.includes(email)) {
        waitlist.push(email);
        localStorage.setItem('brevard_waitlist', JSON.stringify(waitlist));
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

  const isHero = variant === 'hero';
  
  return (
    <form onSubmit={handleSubmit} className={`w-full ${isHero ? 'max-w-2xl' : 'max-w-md'}`}>
      <div className={`flex ${isHero ? 'flex-col sm:flex-row' : 'flex-col'} gap-4`}>
        <div className="flex-1 relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/50 to-amber-600/50 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-all duration-500" />
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
            placeholder="Enter your email"
            className={`relative w-full px-6 py-5 bg-blue-950 border-2 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-all font-medium tracking-wide ${
              status === 'error' ? 'border-red-500' : 'border-blue-800'
            } ${isHero ? 'text-lg' : ''}`}
            disabled={status === 'loading' || status === 'success'}
          />
          {status === 'success' && (
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="absolute right-5 top-1/2 -translate-y-1/2"
            >
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </motion.div>
          )}
        </div>
        <motion.button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          whileHover={{ scale: status === 'idle' ? 1.02 : 1, y: status === 'idle' ? -2 : 0 }}
          whileTap={{ scale: status === 'idle' ? 0.98 : 1 }}
          className={`relative px-10 py-5 font-bold rounded-2xl transition-all overflow-hidden ${
            status === 'success' 
              ? 'bg-emerald-500 text-black cursor-default' 
              : status === 'loading'
              ? 'bg-amber-500/50 text-black/50 cursor-wait'
              : 'bg-amber-500 text-black hover:shadow-2xl hover:shadow-amber-500/40'
          } ${isHero ? 'text-lg whitespace-nowrap tracking-wide' : ''}`}
        >
          {/* Shine effect */}
          {status === 'idle' && (
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-200%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />
          )}
          <span className="relative">
            {status === 'loading' ? (
              <span className="flex items-center gap-3">
                <motion.div 
                  className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
                Joining...
              </span>
            ) : status === 'success' ? (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                You're In!
              </span>
            ) : (
              'Join Waitlist'
            )}
          </span>
        </motion.button>
      </div>
      
      <AnimatePresence>
        {message && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-4 text-sm font-medium ${status === 'error' ? 'text-red-400' : 'text-emerald-400'}`}
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>
      
      {status === 'idle' && (
        <p className="mt-4 text-sm text-blue-400/50 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Join 50+ Florida investors on the waitlist
        </p>
      )}
    </form>
  );
};

// ============ SECTION COMPONENT ============
const Section = ({ children, className = '', id }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.section>
  );
};

// ============ STAT CARD COMPONENT ============
const StatCard = ({ value, label, detail, delay = 0, accent = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    className={`relative group ${accent ? 'col-span-2 md:col-span-1' : ''}`}
  >
    {/* Glow effect */}
    <div className={`absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm ${
      accent ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-gradient-to-br from-amber-500 to-amber-600'
    }`} />
    
    <div className="relative p-6 rounded-2xl bg-blue-950 border border-blue-800 group-hover:border-transparent transition-all h-full">
      <div className={`text-5xl md:text-6xl font-black tracking-tighter mb-2 ${
        accent ? 'text-emerald-400' : 'text-amber-400'
      }`}>
        {value}
      </div>
      <div className="text-white font-semibold text-lg mb-1">{label}</div>
      <div className="text-sm text-blue-300/60">{detail}</div>
    </div>
  </motion.div>
);

// ============ MAIN APP ============
const App = () => {
  const [activeStage, setActiveStage] = useState(0);
  const [showAnimatedDemo, setShowAnimatedDemo] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.9]);
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 100]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % 12);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const pipeline = [
    { id: 1, name: 'Discovery', icon: '🔍', desc: 'Auction calendar sync' },
    { id: 2, name: 'Scraping', icon: '⚡', desc: 'BECA V2.0 extraction' },
    { id: 3, name: 'Title Search', icon: '📋', desc: 'Chain of title analysis' },
    { id: 4, name: 'Lien Priority', icon: '⚖️', desc: 'Senior/junior classification' },
    { id: 5, name: 'Tax Certs', icon: '🏛️', desc: 'Certificate detection' },
    { id: 6, name: 'Demographics', icon: '📊', desc: 'Census API integration' },
    { id: 7, name: 'ML Score', icon: '🧠', desc: 'XGBoost prediction' },
    { id: 8, name: 'Max Bid', icon: '💰', desc: 'Formula calculation' },
    { id: 9, name: 'Decision', icon: '✅', desc: 'BID / REVIEW / SKIP' },
    { id: 10, name: 'Report', icon: '📄', desc: 'One-page DOCX' },
    { id: 11, name: 'Disposition', icon: '🏠', desc: 'Exit strategy tracking' },
    { id: 12, name: 'Archive', icon: '📦', desc: 'Historical database' },
  ];

  const features = [
    { 
      icon: '🎯', 
      title: 'BECA Scraper V2.0', 
      desc: 'Proprietary document extraction with 12 regex patterns, anti-detection tech, and pdfplumber integration. Pulls what others miss.',
      highlight: 'EXCLUSIVE'
    },
    { 
      icon: '🧠', 
      title: 'XGBoost ML Engine', 
      desc: '64.4% accuracy predicting third-party purchases. Trained on 1,393+ historical Brevard auctions. Real data, real edge.',
      highlight: '64.4% ACC'
    },
    { 
      icon: '⚡', 
      title: 'Smart Router', 
      desc: 'Multi-tier LLM routing achieves 40-55% FREE processing. DeepSeek V3.2 for ultra-cheap operations. Maximum intelligence, minimum cost.',
      highlight: '55% FREE'
    },
    { 
      icon: '🔐', 
      title: 'Layer 8 Protection', 
      desc: 'AES-256 encryption on ML models, externalized business logic, endpoint obfuscation. Your competitive advantage stays yours.',
      highlight: 'VAULT'
    },
  ];

  const stats = [
    { value: '23s', label: 'Per Property', detail: 'vs 4+ hours manual' },
    { value: '100x', label: 'ROI', detail: '$300-400K annual value' },
    { value: '12', label: 'Stage Pipeline', detail: 'Fully autonomous' },
    { value: '64.4%', label: 'ML Accuracy', detail: 'XGBoost prediction', accent: true },
  ];

  return (
    <div className="min-h-screen bg-blue-950 text-white overflow-x-hidden selection:bg-amber-500 selection:text-black">
      {/* ============ CUSTOM CURSOR GLOW ============ */}
      <div 
        className="fixed w-96 h-96 rounded-full pointer-events-none z-0 opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)',
          left: mousePos.x - 192,
          top: mousePos.y - 192,
          transition: 'left 0.1s, top 0.1s',
        }}
      />

      {/* ============ NOISE TEXTURE OVERLAY ============ */}
      <div 
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ============ BACKGROUND EFFECTS ============ */}
      <div className="fixed inset-0 z-0">
        {/* Mesh gradient */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-600/8 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/50 rounded-full blur-[100px]" />
        </div>
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(245,158,11,0.3) 1px, transparent 1px), 
                             linear-gradient(90deg, rgba(245,158,11,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <FloatingParticle 
            key={i} 
            delay={i * 0.5} 
            size={3 + Math.random() * 4}
            x={10 + Math.random() * 80}
            y={10 + Math.random() * 80}
          />
        ))}
      </div>

      {/* ============ NAVIGATION ============ */}
      <motion.nav 
        className={`fixed top-0 left-0 right-0 z-40 px-6 py-4 transition-all duration-500 ${
          scrolled ? 'bg-blue-950/90 backdrop-blur-xl border-b border-blue-800/50' : ''
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl blur-sm opacity-70" />
              <div className="relative w-11 h-11 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center font-black text-blue-950 text-lg tracking-tighter">
                BB
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold tracking-tight">
                BrevardBidder<span className="text-amber-400">AI</span>
              </span>
              <span className="ml-3 px-2 py-0.5 bg-blue-800 rounded text-xs font-mono text-blue-200/70">V14.4.0</span>
            </div>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <a 
              href="#demo" 
              className="hidden md:block text-blue-200/70 hover:text-amber-400 transition-colors font-medium"
            >
              Demo
            </a>
            <a 
              href="#pipeline" 
              className="hidden md:block text-blue-200/70 hover:text-amber-400 transition-colors font-medium"
            >
              Pipeline
            </a>
            <motion.a 
              href="#waitlist"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 bg-amber-500 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all"
            >
              Join Waitlist
            </motion.a>
          </div>
        </div>
      </motion.nav>

      {/* ============ HERO SECTION - PREMIUM OBSIDIAN VAULT ============ */}
      <PremiumHero
        heroOpacity={heroOpacity}
        heroScale={heroScale}
        heroY={heroY}
        stats={stats}
        WaitlistForm={WaitlistForm}
      />

      {/* ============ SOCIAL PROOF BAR ============ */}
      <Section className="relative z-10 px-6 py-16 border-y border-blue-800/50 bg-blue-900/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            variants={fadeIn}
            className="flex flex-wrap items-center justify-center gap-8 md:gap-16"
          >
            <div className="text-center">
              <div className="text-4xl font-black text-white mb-1">1,393+</div>
              <div className="text-sm text-blue-300/60">Historical Auctions Analyzed</div>
            </div>
            <div className="hidden md:block w-px h-12 bg-blue-800" />
            <div className="text-center">
              <div className="text-4xl font-black text-white mb-1">20+</div>
              <div className="text-sm text-blue-300/60">Years FL Experience</div>
            </div>
            <div className="hidden md:block w-px h-12 bg-blue-800" />
            <div className="text-center">
              <div className="text-4xl font-black text-white mb-1">200+</div>
              <div className="text-sm text-blue-300/60">Auctions Attended</div>
            </div>
            <div className="hidden md:block w-px h-12 bg-blue-800" />
            <div className="text-center">
              <div className="text-4xl font-black text-amber-400 mb-1">$0</div>
              <div className="text-sm text-blue-300">Guesswork Required</div>
            </div>
            <div className="hidden md:block w-px h-12 bg-blue-800" />
            <div className="text-center col-span-2 md:col-span-1">
              <div className="text-emerald-400 font-bold text-lg">For Everyone. Everywhere.</div>
              <div className="text-xs text-blue-400">Democratizing Distressed Asset Auctions</div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ============ DEMO SECTION ============ */}
      <Section id="demo" className="relative z-10 px-6 py-32">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-semibold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Demo Available
            </span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              <span className="text-white">See the Pipeline</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500">In Action</span>
            </h2>
            <p className="text-xl text-blue-200/70 max-w-2xl mx-auto">
              Watch autonomous agents analyze a real foreclosure property from Brevard County in real-time.
            </p>
          </motion.div>

          <motion.div variants={scaleIn} className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 via-amber-600/30 to-amber-500/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div 
              className="relative rounded-2xl overflow-hidden border-2 border-blue-800 group-hover:border-amber-500/50 cursor-pointer transition-all duration-500"
              onClick={() => setShowAnimatedDemo(true)}
              style={{ 
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(2, 6, 23, 0.95) 100%)',
              }}
            >
              {/* Terminal header */}
              <div className="flex items-center justify-between px-6 py-4 bg-blue-900/80 border-b border-blue-800">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors" />
                    <div className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-400 transition-colors" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-400 transition-colors" />
                  </div>
                  <span className="text-sm text-blue-200/70 font-mono tracking-wider">brevard-bidder-pipeline.exe</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-mono rounded">● READY</span>
                </div>
              </div>
              
              {/* Preview content */}
              <div className="p-12 min-h-[350px] flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-2 border-amber-500/40 flex items-center justify-center group-hover:shadow-2xl group-hover:shadow-amber-500/20 transition-all duration-500"
                  >
                    <svg className="w-10 h-10 text-amber-400 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </motion.div>
                  <div className="text-white font-bold text-2xl mb-3 tracking-tight">Launch Demo</div>
                  <div className="text-blue-300/60">Experience real property analysis in 60 seconds</div>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="px-6 py-3 bg-blue-900/50 border-t border-blue-800 flex items-center justify-between">
                <span className="text-xs text-blue-400/50 font-mono">12 stages • 23 seconds • Real data</span>
                <span className="text-xs text-amber-500 font-mono">Click to start →</span>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>
      {/* ============ AI LIVE DEMO SECTION ============ */}
      <AILiveDemo />
      <NextAuction />

      {/* ============ PIPELINE SECTION ============ */}
      <Section id="pipeline" className="relative z-10 px-6 py-32 bg-blue-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <motion.span 
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-semibold mb-6"
            >
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              Live Demo
            </motion.span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              <span className="text-white">12-Stage</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500">Agentic Pipeline</span>
            </h2>
            <p className="text-xl text-blue-200/70 max-w-2xl mx-auto">
              Watch AI analyze foreclosure properties in real-time—from discovery to decision.
            </p>
          </motion.div>

          <motion.div variants={scaleIn}>
            <EmbeddedPipelineDemo />
          </motion.div>
          
          {/* CTA under demo */}
          <motion.div variants={fadeInUp} className="mt-12 text-center">
            <a 
              href="#pipeline" 
              onClick={(e) => { e.preventDefault(); window.location.hash = 'pipeline'; window.location.reload(); }}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl text-blue-950 font-bold text-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105"
            >
              <span>🚀</span>
              View Full-Screen Demo
              <span>→</span>
            </a>
          </motion.div>
        </div>
      </Section>

      {/* ============ FEATURES SECTION ============ */}
      <Section id="features" className="relative z-10 px-6 py-32">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              <span className="text-white">Engineered for</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500">Edge</span>
            </h2>
            <p className="text-xl text-blue-200/70">
              Proprietary systems that create unfair advantages.
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={i % 2 === 0 ? slideInLeft : slideInRight}
                className="group relative"
              >
                {/* Hover glow */}
                <div className="absolute -inset-px bg-gradient-to-br from-amber-500/50 to-amber-600/50 rounded-3xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500" />
                
                <div className="relative p-8 rounded-3xl bg-blue-900/80 border border-blue-800 group-hover:border-transparent transition-all duration-500 h-full backdrop-blur-sm">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-blue-800 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                        {feature.title}
                      </h3>
                    </div>
                    <span className="px-3 py-1.5 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-full border border-amber-500/30">
                      {feature.highlight}
                    </span>
                  </div>
                  <p className="text-blue-200/70 leading-relaxed text-lg">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ============ FOUNDER SECTION ============ */}
      <Section id="founder" className="relative z-10 px-6 py-32 bg-blue-900/50">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={staggerContainer} className="text-center">
            <motion.span 
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-semibold mb-10"
            >
              <span className="w-2 h-2 bg-amber-400 rounded-full" />
              Built by an Investor, for Investors
            </motion.span>
            
            <motion.div variants={scaleIn} className="relative inline-block mb-8">
              <div className="absolute -inset-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full blur-lg opacity-50" />
              <div className="relative w-32 h-32 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-5xl font-black text-blue-950 ring-4 ring-amber-500/30">
                AS
              </div>
            </motion.div>
            
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
              Ariel Shapira
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-amber-400 font-semibold mb-2">
              Real Estate Developer & Founder, Everest Capital USA
            </motion.p>
            <motion.p variants={fadeInUp} className="text-blue-300 mb-2">
              Solo Founder of BrevardBidderAI & BidDeedAI
            </motion.p>
            <motion.p variants={fadeInUp} className="text-emerald-400/80 text-sm font-medium mb-10">
              Mission: Distressed Asset Auctions — For Everyone. Everywhere.
            </motion.p>
            
            {/* Quote */}
            <motion.div variants={scaleIn} className="relative max-w-2xl mx-auto mb-12">
              <div className="absolute -top-6 -left-4 text-8xl text-amber-500/10 font-serif leading-none">"</div>
              <p className="text-2xl text-slate-300 leading-relaxed italic px-8">
                I've been to 200+ foreclosure auctions in Florida. I built BrevardBidderAI because 
                I was tired of losing deals to incomplete data—and winning deals I shouldn't have.
              </p>
              <div className="absolute -bottom-6 -right-4 text-8xl text-amber-500/10 font-serif leading-none rotate-180">"</div>
            </motion.div>

            {/* Credibility badges */}
            <motion.div variants={staggerContainer} className="flex flex-wrap items-center justify-center gap-4 mb-12">
              {[
                { value: '20+', label: 'Years FL Experience', sub: 'Investing • Developing' },
                { value: '200+', label: 'Auctions Attended', sub: 'Brevard Courthouse' },
                { value: '2', label: 'AI Ecosystems', sub: 'BrevardBidder • BidDeed' },
              ].map((badge, i) => (
                <motion.div 
                  key={i}
                  variants={scaleIn}
                  className="px-6 py-4 bg-blue-800/50 rounded-2xl border border-blue-700 hover:border-amber-500/30 transition-all"
                >
                  <div className="text-3xl font-black text-amber-400 mb-1">{badge.value}</div>
                  <div className="text-sm text-white font-medium">{badge.label}</div>
                  <div className="text-xs text-blue-300/60">{badge.sub}</div>
                </motion.div>
              ))}
            </motion.div>

            <motion.a 
              variants={fadeInUp}
              href="https://linkedin.com/in/ariel-shapira-533a776" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-cyan-500/10 border-2 border-cyan-500/30 rounded-2xl text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 transition-all font-semibold"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Connect with Ariel on LinkedIn
            </motion.a>
          </motion.div>
        </div>
      </Section>

      {/* ============ FINAL CTA SECTION ============ */}
      <Section id="waitlist" className="relative z-10 px-6 py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Background accent */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[100px]" />
          </div>
          
          <motion.div variants={staggerContainer} className="relative">
            <motion.h2 variants={fadeInUp} className="text-5xl md:text-7xl font-black tracking-tight mb-6">
              <span className="block text-white">Your Edge.</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400">
                Everywhere.
              </span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-2xl text-emerald-400 font-bold mb-4">
              Democratizing USA Distressed Asset Auctions
            </motion.p>
            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-blue-200/70 mb-12 max-w-2xl mx-auto">
              Join the waitlist for America's most sophisticated foreclosure intelligence platform. For everyone. Everywhere.
            </motion.p>
            
            <motion.div variants={scaleIn} className="flex justify-center mb-10">
              <WaitlistForm />
            </motion.div>
            
            <motion.p variants={fadeIn} className="text-blue-400/50 text-sm flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full" />
              Currently onboarding select investors in Brevard County, FL
            </motion.p>
          </motion.div>
        </div>
      </Section>

      {/* ============ FOOTER ============ */}
      <footer className="relative z-10 px-6 py-16 border-t border-blue-800/50 bg-blue-950">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl blur-sm opacity-50" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center font-black text-blue-950">
                  BB
                </div>
              </div>
              <div>
                <span className="text-white font-bold">
                  BrevardBidder<span className="text-amber-400">AI</span>
                </span>
                <span className="ml-2 text-blue-400/50 text-sm font-mono">V14.4.0</span>
              </div>
            </div>
            
            <div className="text-blue-300/60 text-sm text-center md:text-right">
              <div>© 2025 Ariel Shapira | Real Estate Developer & Founder</div>
              <div className="text-blue-700">Everest Capital USA</div>
            </div>
          </div>
          
          <div className="mt-10 pt-8 border-t border-blue-800/50 text-center">
            <p className="text-blue-700 text-sm">
              Built by a developer & investor. For investors everywhere. — Democratizing USA distressed asset auctions.
            </p>
          </div>
        </div>
      </footer>

      {/* Demo CTA Button */}
      <DemoButton />

      {/* Animated Demo Modal */}
      <AnimatePresence>
        {showAnimatedDemo && (
          <AnimatedDemo onClose={() => setShowAnimatedDemo(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;

