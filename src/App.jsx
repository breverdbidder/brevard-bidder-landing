import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import AnimatedDemo from './AnimatedDemo';

// ============ ANIMATION VARIANTS ============
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } }
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
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

// ============ WAITLIST FORM COMPONENT ============
const WaitlistForm = ({ variant = 'default' }) => {
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
    
    // Simulate API call - replace with actual endpoint later
    // For now, we'll store in localStorage as a demo and show success
    try {
      const waitlist = JSON.parse(localStorage.getItem('brevard_waitlist') || '[]');
      if (!waitlist.includes(email)) {
        waitlist.push(email);
        localStorage.setItem('brevard_waitlist', JSON.stringify(waitlist));
      }
      
      // Simulate network delay
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
    <form onSubmit={handleSubmit} className={`w-full ${isHero ? 'max-w-xl' : 'max-w-md'}`}>
      <div className={`flex ${isHero ? 'flex-col sm:flex-row' : 'flex-col'} gap-3`}>
        <div className="flex-1 relative">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
            placeholder="Enter your email"
            className={`w-full px-5 py-4 bg-slate-900/80 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all ${
              status === 'error' ? 'border-red-500' : 'border-slate-700'
            } ${isHero ? 'text-lg' : ''}`}
            disabled={status === 'loading' || status === 'success'}
          />
          {status === 'success' && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          )}
        </div>
        <motion.button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          whileHover={{ scale: status === 'idle' ? 1.02 : 1 }}
          whileTap={{ scale: status === 'idle' ? 0.98 : 1 }}
          className={`px-8 py-4 font-bold rounded-xl transition-all ${
            status === 'success' 
              ? 'bg-emerald-500 text-black cursor-default' 
              : status === 'loading'
              ? 'bg-amber-500/50 text-black/50 cursor-wait'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:shadow-lg hover:shadow-amber-500/30'
          } ${isHero ? 'text-lg whitespace-nowrap' : ''}`}
        >
          {status === 'loading' ? (
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
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
        </motion.button>
      </div>
      
      {message && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-3 text-sm ${status === 'error' ? 'text-red-400' : 'text-emerald-400'}`}
        >
          {message}
        </motion.p>
      )}
      
      {status === 'idle' && (
        <p className="mt-3 text-sm text-slate-500">
          Join 50+ Florida investors on the waitlist. No spam, ever.
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

// ============ MAIN APP ============
const App = () => {
  const [activeStage, setActiveStage] = useState(0);
  const [showAnimatedDemo, setShowAnimatedDemo] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % 12);
    }, 2000);
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
    { id: 9, name: 'Decision', icon: '✓', desc: 'BID/REVIEW/SKIP' },
    { id: 10, name: 'Report', icon: '📄', desc: 'DOCX generation' },
    { id: 11, name: 'Disposition', icon: '🔄', desc: 'Exit tracking' },
    { id: 12, name: 'Archive', icon: '🗄️', desc: 'Historical storage' },
  ];

  const stats = [
    { value: '100x', label: 'ROI', detail: '$3.3K cost → $300K+ value' },
    { value: '64.4%', label: 'ML Accuracy', detail: 'Third-party prediction' },
    { value: '40-55%', label: 'FREE Tier', detail: 'Smart Router savings' },
    { value: '23 sec', label: 'Analysis', detail: 'vs 4+ hours manual' },
  ];

  const features = [
    {
      title: 'Smart Router',
      desc: 'Multi-tier LLM routing with ULTRA_CHEAP DeepSeek V3.2 integration',
      highlight: '25% cost savings',
      icon: '🔀',
    },
    {
      title: 'BECA Scraper V2.0',
      desc: '12 regex patterns with anti-detection for RealForeclose, BCPAO, AcclaimWeb',
      highlight: 'Zero blocks',
      icon: '⚡',
    },
    {
      title: 'Lien Intelligence',
      desc: 'Actual recorded document search—detects HOA foreclosures where mortgages survive',
      highlight: 'No guesswork',
      icon: '🔍',
    },
    {
      title: 'Layer 8 Protection',
      desc: 'AES-256 encryption with business logic externalization',
      highlight: 'IP secured',
      icon: '🔒',
    },
  ];

  const problems = [
    { problem: 'Spending hours on title research', solution: 'AI scans 38+ documents in seconds' },
    { problem: 'Missing hidden liens that survive foreclosure', solution: 'Automated lien priority detection' },
    { problem: 'Overbidding due to emotional decisions', solution: 'Data-driven max bid formula' },
    { problem: 'Analyzing the wrong properties', solution: 'ML-powered BID/REVIEW/SKIP' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Noise texture overlay */}
      <div 
        className="fixed inset-0 opacity-[0.02] pointer-events-none z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Gradient orbs */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px]" />
      <div className="fixed top-1/2 right-0 w-[400px] h-[400px] bg-amber-600/3 rounded-full blur-[80px]" />

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? 'bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/50' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center font-bold text-slate-950 text-lg shadow-lg shadow-amber-500/20">
              BB
            </div>
            <span className="text-xl tracking-tight font-semibold">
              BrevardBidder<span className="text-amber-400">AI</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#problem" className="hover:text-amber-400 transition-colors">Why</a>
            <a href="#demo" className="hover:text-amber-400 transition-colors">Demo</a>
            <a href="#pipeline" className="hover:text-amber-400 transition-colors">Pipeline</a>
            <a href="#founder" className="hover:text-amber-400 transition-colors">Founder</a>
          </div>
          
          <motion.a 
            href="#waitlist"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 bg-amber-500 text-slate-950 font-semibold text-sm rounded-lg hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
          >
            Join Waitlist
          </motion.a>
        </div>
      </motion.nav>

      {/* ============ HERO SECTION ============ */}
      <motion.section 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative z-10 min-h-screen flex items-center px-6 pt-24 pb-16"
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-medium">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  Agentic AI Ecosystem — Not SaaS
                </span>
              </motion.div>
              
              <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
                <span className="text-white">Stop Guessing at</span>
                <br />
                <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                  Foreclosure Auctions
                </span>
              </motion.h1>
              
              <motion.p variants={fadeInUp} className="text-xl text-slate-400 max-w-lg mb-4 leading-relaxed">
                12-stage AI pipeline transforms 4-hour manual research into 23-second actionable intelligence.
              </motion.p>
              
              <motion.p variants={fadeInUp} className="text-lg text-amber-400/80 font-medium mb-8">
                Built by an investor with 20+ years in Florida real estate.
              </motion.p>
              
              <motion.div variants={fadeInUp}>
                <WaitlistForm variant="hero" />
              </motion.div>
              
              {/* Trust badges */}
              <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-6 mt-10 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Brevard County, FL</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>64.4% ML Accuracy</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>100x ROI</span>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Right: Terminal Preview */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="hidden lg:block"
            >
              <div 
                className="relative rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(2, 6, 23, 0.9) 100%)',
                }}
              >
                {/* Terminal header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/80 border-b border-slate-800">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs text-slate-500 ml-2 font-mono">brevard-bidder-ai / analysis</span>
                </div>
                
                {/* Terminal content */}
                <div className="p-6 font-mono text-sm space-y-2">
                  <div className="text-slate-500">$ brevard analyze --auction dec-17-2025</div>
                  <div className="text-emerald-400">✓ Discovery: 23 properties found</div>
                  <div className="text-emerald-400">✓ Scraping: BECA V2.0 complete</div>
                  <div className="text-emerald-400">✓ Title: 847 documents analyzed</div>
                  <div className="text-cyan-400">→ Lien Analysis: Processing...</div>
                  
                  <div className="mt-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Top Opportunity</div>
                    <div className="text-white font-semibold">1639 Dittmer Cir SE, Palm Bay</div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-amber-400">Max Bid: $537,832</span>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded">BID</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                    <span>Pipeline running... 67% complete</span>
                  </div>
                </div>
              </div>
              
              {/* Floating badge */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="absolute -bottom-4 -right-4 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xs font-bold text-slate-950">AS</div>
                  <div className="text-xs">
                    <div className="text-white font-medium">Ariel Shapira</div>
                    <div className="text-slate-500">Solo Founder</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ============ PROBLEM/SOLUTION SECTION ============ */}
      <Section id="problem" className="relative z-10 px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-medium mb-6">
              The Problem
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">Foreclosure Investing is</span>{' '}
              <span className="text-red-400">Broken</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Most investors lose money because they're making decisions with incomplete data.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {problems.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/30 hover:border-amber-500/30 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-slate-400 line-through mb-2">{item.problem}</div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-emerald-400 font-medium">{item.solution}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ============ STATS SECTION ============ */}
      <Section className="relative z-10 px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                variants={scaleIn}
                className="group p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 hover:border-amber-500/30 transition-all"
              >
                <div className="text-4xl md:text-5xl font-bold text-amber-400 mb-1">{stat.value}</div>
                <div className="text-white font-medium mb-1">{stat.label}</div>
                <div className="text-sm text-slate-500">{stat.detail}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ============ DEMO SECTION ============ */}
      <Section id="demo" className="relative z-10 px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Live Demo
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">See the Pipeline</span>{' '}
              <span className="text-amber-400">In Action</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Watch autonomous agents analyze a real foreclosure property from Brevard County.
            </p>
          </motion.div>

          <motion.div variants={scaleIn} className="relative">
            <div 
              className="relative rounded-2xl overflow-hidden border border-slate-800 cursor-pointer group"
              onClick={() => setShowAnimatedDemo(true)}
              style={{ 
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(2, 6, 23, 0.9) 100%)',
              }}
            >
              {/* Preview header */}
              <div className="flex items-center justify-between px-6 py-4 bg-slate-900/80 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-sm text-slate-400 font-mono">12-Stage Pipeline Demo</span>
                </div>
                <span className="text-xs text-emerald-400">● Ready</span>
              </div>
              
              {/* Preview content */}
              <div className="p-8 min-h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center group-hover:bg-amber-500/20 transition-all"
                  >
                    <svg className="w-8 h-8 text-amber-400 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </motion.div>
                  <div className="text-white font-semibold text-lg mb-2">Watch the Demo</div>
                  <div className="text-slate-500">See real property analysis in 60 seconds</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ============ PIPELINE SECTION ============ */}
      <Section id="pipeline" className="relative z-10 px-6 py-24 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">12-Stage</span>{' '}
              <span className="text-amber-400">Agentic Pipeline</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              From discovery to decision—fully autonomous intelligence at every step.
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {pipeline.map((stage, index) => (
              <motion.div
                key={stage.id}
                variants={scaleIn}
                className={`relative p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                  activeStage === index
                    ? 'bg-amber-500/10 border-amber-500/50 scale-105 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
                onMouseEnter={() => setActiveStage(index)}
              >
                <div className="text-2xl mb-2">{stage.icon}</div>
                <div className={`font-semibold text-sm mb-1 ${activeStage === index ? 'text-amber-400' : 'text-white'}`}>
                  {stage.id}. {stage.name}
                </div>
                <div className="text-xs text-slate-500">{stage.desc}</div>
                {activeStage === index && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Pipeline progress */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <span className="text-slate-500 text-sm">Pipeline Progress</span>
            <div className="flex gap-1">
              {pipeline.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i <= activeStage ? 'bg-amber-400' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ============ FEATURES SECTION ============ */}
      <Section id="features" className="relative z-10 px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">Engineered for</span>{' '}
              <span className="text-amber-400">Edge</span>
            </h2>
            <p className="text-xl text-slate-400">
              Proprietary systems that create unfair advantages.
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="group p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 hover:border-amber-500/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{feature.icon}</span>
                    <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                      {feature.title}
                    </h3>
                  </div>
                  <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full">
                    {feature.highlight}
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ============ FOUNDER SECTION ============ */}
      <Section id="founder" className="relative z-10 px-6 py-24 bg-slate-900/30">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-medium mb-8">
              The Builder
            </span>
            
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-3xl font-bold text-slate-950 shadow-xl shadow-amber-500/20">
              AS
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Ariel Shapira</h2>
            <p className="text-lg text-amber-400 mb-4">Real Estate Developer & Founder, Everest Capital USA</p>
            
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              "I've been to 200+ foreclosure auctions in Florida. I built BrevardBidderAI because 
              I was tired of losing deals to incomplete data and winning deals I shouldn't have."
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              <div className="px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="text-amber-400 font-bold">20+ Years</div>
                <div className="text-xs text-slate-500">Florida Real Estate</div>
              </div>
              <div className="px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="text-amber-400 font-bold">Solo Founder</div>
                <div className="text-xs text-slate-500">BrevardBidderAI & BidDeedAI</div>
              </div>
              <div className="px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="text-amber-400 font-bold">Brevard County</div>
                <div className="text-xs text-slate-500">Local Expertise</div>
              </div>
            </div>
            
            <a 
              href="https://linkedin.com/in/ariel-shapira-533a776" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Connect on LinkedIn
            </a>
          </motion.div>
        </div>
      </Section>

      {/* ============ FINAL CTA SECTION ============ */}
      <Section id="waitlist" className="relative z-10 px-6 py-32">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={fadeInUp}>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-white">Stop Guessing.</span>
              <br />
              <span className="text-amber-400">Start Knowing.</span>
            </h2>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              Join the waitlist for Brevard County's most sophisticated foreclosure intelligence platform.
            </p>
            
            <div className="flex justify-center mb-8">
              <WaitlistForm />
            </div>
            
            <p className="text-slate-600 text-sm">
              Currently onboarding select investors in Brevard County, FL
            </p>
          </motion.div>
        </div>
      </Section>

      {/* ============ FOOTER ============ */}
      <footer className="relative z-10 px-6 py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center font-bold text-slate-950 text-sm">
                BB
              </div>
              <span className="text-slate-400">
                BrevardBidder<span className="text-amber-500">AI</span>
                <span className="text-slate-600 ml-2">V13.4.0</span>
              </span>
            </div>
            
            <div className="text-slate-600 text-sm text-center md:text-right">
              <div>© 2025 Ariel Shapira | Real Estate Developer & Founder, Everest Capital USA</div>
              <div className="text-slate-700">Solo Founder of BrevardBidderAI & BidDeedAI</div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-800/50 text-center">
            <p className="text-slate-700 text-xs">
              Not polished. Not perfect. Just real. — Built by an investor, for investors.
            </p>
          </div>
        </div>
      </footer>

      {/* Animated Demo Modal */}
      {showAnimatedDemo && (
        <AnimatedDemo onClose={() => setShowAnimatedDemo(false)} />
      )}
    </div>
  );
};

export default App;
