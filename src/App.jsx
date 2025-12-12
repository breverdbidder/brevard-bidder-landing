// BidDeed.AI Landing Page V14.0.0 - "LangGraph Agentic AI Ecosystem" Edition
// Built by Ariel Shapira - Solo Founder, Everest Capital USA
// Design System: Luxury Data Terminal - Industrial Fintech Aesthetic
// © 2025 All Rights Reserved - Proprietary IP

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import LangGraphDemo from './LangGraphDemo';

// ============ ANIMATION VARIANTS ============
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
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

// ============ LANGGRAPH PIPELINE ANIMATION ============
const LangGraphPipelineAnimation = () => {
  const [activeNode, setActiveNode] = useState(0);
  
  const nodes = [
    { icon: '🔍', label: 'Discovery' },
    { icon: '📥', label: 'Scraper' },
    { icon: '📋', label: 'Title' },
    { icon: '⚖️', label: 'Lien' },
    { icon: '🧠', label: 'ML' },
    { icon: '💰', label: 'Valuation' },
    { icon: '✅', label: 'Decision' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNode(prev => (prev + 1) % nodes.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-20 flex items-center justify-center gap-2">
      {nodes.map((node, i) => (
        <React.Fragment key={i}>
          <motion.div
            className={`relative flex flex-col items-center p-2 rounded-lg transition-all duration-300 ${
              i === activeNode 
                ? 'bg-amber-500/20 scale-110' 
                : i < activeNode 
                  ? 'bg-emerald-500/10' 
                  : 'bg-slate-800/50'
            }`}
            animate={i === activeNode ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xl">{node.icon}</span>
            <span className={`text-xs mt-1 ${
              i === activeNode ? 'text-amber-400' : i < activeNode ? 'text-emerald-400' : 'text-slate-500'
            }`}>
              {node.label}
            </span>
            {i === activeNode && (
              <motion.div
                className="absolute -inset-1 rounded-lg border-2 border-amber-500"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </motion.div>
          {i < nodes.length - 1 && (
            <motion.div 
              className={`w-6 h-0.5 ${
                i < activeNode ? 'bg-emerald-500' : i === activeNode ? 'bg-amber-500' : 'bg-slate-700'
              }`}
              animate={i === activeNode ? { scaleX: [0, 1] } : {}}
              transition={{ duration: 0.5 }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

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
            className={`relative w-full px-6 py-5 bg-slate-900 border-2 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-all font-medium tracking-wide ${
              status === 'error' ? 'border-red-500' : 'border-slate-700'
            } ${isHero ? 'text-lg' : ''}`}
            disabled={status === 'loading' || status === 'success'}
          />
        </div>
        <motion.button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          whileHover={{ scale: status === 'idle' ? 1.02 : 1 }}
          whileTap={{ scale: status === 'idle' ? 0.98 : 1 }}
          className={`relative px-10 py-5 font-bold rounded-2xl transition-all overflow-hidden ${
            status === 'success' 
              ? 'bg-emerald-500 text-black' 
              : status === 'loading'
              ? 'bg-amber-500/50 text-black/50'
              : 'bg-amber-500 text-black hover:shadow-2xl hover:shadow-amber-500/40'
          } ${isHero ? 'text-lg whitespace-nowrap tracking-wide' : ''}`}
        >
          <span className="relative">
            {status === 'loading' ? 'Joining...' : status === 'success' ? "✓ You're In!" : 'Join Waitlist'}
          </span>
        </motion.button>
      </div>
      
      {message && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`mt-4 text-sm font-medium ${status === 'error' ? 'text-red-400' : 'text-emerald-400'}`}
        >
          {message}
        </motion.p>
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

// ============ AGENT CARD COMPONENT ============
const AgentCard = ({ icon, name, description, tools, delay = 0 }) => (
  <motion.div
    variants={fadeInUp}
    className="relative group"
  >
    <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative bg-slate-900/80 border border-slate-700 rounded-2xl p-6 hover:border-amber-500/50 transition-all duration-300">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
      <p className="text-slate-400 text-sm mb-4">{description}</p>
      <div className="flex flex-wrap gap-2">
        {tools.map((tool, i) => (
          <span key={i} className="px-2 py-1 bg-slate-800 rounded text-xs text-amber-400">
            {tool}
          </span>
        ))}
      </div>
    </div>
  </motion.div>
);

// ============ STAT CARD COMPONENT ============
const StatCard = ({ value, label, detail, accent = 'amber' }) => {
  const colors = {
    amber: 'from-amber-500 to-amber-600 shadow-amber-500/20',
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-500/20',
    purple: 'from-purple-500 to-purple-600 shadow-purple-500/20',
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/20'
  };

  return (
    <motion.div variants={scaleIn} className="relative group">
      <div className={`absolute -inset-1 bg-gradient-to-r ${colors[accent]} rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity`} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-8 text-center hover:border-slate-600 transition-colors">
        <div className={`text-5xl font-bold bg-gradient-to-r ${colors[accent]} bg-clip-text text-transparent mb-2`}>
          {value}
        </div>
        <div className="text-xl text-white font-medium mb-2">{label}</div>
        <div className="text-sm text-slate-400">{detail}</div>
      </div>
    </motion.div>
  );
};

// ============ MAIN APP COMPONENT ============
export default function App() {
  const [showDemo, setShowDemo] = useState(false);
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [0, 1]);

  const agents = [
    { icon: '🔍', name: 'Discovery Agent', description: 'Scans RealForeclose auction calendars daily, identifies new foreclosure listings', tools: ['RealForeclose API', 'BECA Scraper'] },
    { icon: '📥', name: 'Data Scraper Agent', description: 'Extracts property data from multiple county sources in parallel', tools: ['BCPAO', 'AcclaimWeb', 'Selenium'] },
    { icon: '📋', name: 'Title Search Agent', description: 'Analyzes chain of title, identifies ownership history', tools: ['Official Records', 'Doc Parser'] },
    { icon: '⚖️', name: 'Lien Priority Agent', description: 'Critical! Detects senior liens that survive foreclosure', tools: ['Mortgage DB', 'HOA Detection'] },
    { icon: '📜', name: 'Tax Certificate Agent', description: 'Checks for outstanding tax certificates that affect title', tools: ['RealTDM', 'Tax Cert API'] },
    { icon: '👥', name: 'Demographics Agent', description: 'Analyzes neighborhood income, trends, school districts', tools: ['Census API', 'Zillow Data'] },
    { icon: '🧠', name: 'ML Predictor Agent', description: 'XGBoost model predicts third-party buyer probability', tools: ['64.4% Accuracy', 'XGBoost'] },
    { icon: '💰', name: 'Valuation Agent', description: 'Calculates ARV, repair estimates, and optimal max bid', tools: ['Comp Analysis', 'Repair Est'] },
    { icon: '✅', name: 'Decision Agent', description: 'Applies business rules: BID, REVIEW, or SKIP', tools: ['Rule Engine', 'Risk Matrix'] },
    { icon: '📊', name: 'Report Generator', description: 'Creates one-page DOCX analysis with photos', tools: ['docx-templater', 'BCPAO Photos'] },
    { icon: '🎯', name: 'Disposition Agent', description: 'Maps exit strategies: Flip, Hold, or Wholesale', tools: ['ROI Calculator', 'Market Fit'] },
    { icon: '🗄️', name: 'Archive Agent', description: 'Persists all data for historical analysis', tools: ['Supabase', 'Vector Store'] },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Demo Modal */}
      <AnimatePresence>
        {showDemo && <LangGraphDemo onClose={() => setShowDemo(false)} />}
      </AnimatePresence>

      {/* Fixed Header */}
      <motion.header 
        style={{ opacity: headerOpacity }}
        className="fixed top-0 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold">
              BidDeed.AI<span className="text-amber-400">AI</span>
            </span>
            <span className="px-2 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-medium">
              LangGraph
            </span>
          </div>
          <button
            onClick={() => setShowDemo(true)}
            className="px-6 py-2 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors"
          >
            Watch Demo
          </button>
        </div>
      </motion.header>

      {/* Hero Section */}
      <Section className="relative min-h-screen flex items-center justify-center px-6 py-24 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent" />
          {/* Floating Particles */}
          {[...Array(20)].map((_, i) => (
            <FloatingParticle key={i} delay={i * 0.2} size={3 + Math.random() * 4} x={Math.random() * 100} y={Math.random() * 100} />
          ))}
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500/10 to-amber-500/10 border border-purple-500/30 mb-8"
          >
            <motion.span 
              className="w-2 h-2 bg-emerald-500 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-purple-400 font-medium">Agentic AI Ecosystem</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400 font-medium">Powered by LangGraph</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="text-white">Stop </span>
            <span className="bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">Guessing</span>
            <span className="text-white"> at</span>
            <br />
            <span className="text-white">Foreclosure Auctions</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-8"
          >
            12 autonomous AI agents analyze every property in{' '}
            <span className="text-amber-400 font-semibold">23 seconds</span>.
            <br />
            Know exactly when to <span className="text-emerald-400 font-semibold">BID</span>,{' '}
            <span className="text-amber-400 font-semibold">REVIEW</span>, or{' '}
            <span className="text-red-400 font-semibold">SKIP</span>.
          </motion.p>

          {/* LangGraph Pipeline Animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="max-w-3xl mx-auto mb-10 p-4 bg-slate-900/50 rounded-2xl border border-slate-700"
          >
            <div className="text-xs text-slate-500 mb-3 font-mono">LANGGRAPH PIPELINE • LIVE PREVIEW</div>
            <LangGraphPipelineAnimation />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <motion.button
              onClick={() => setShowDemo(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-2xl text-lg shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all flex items-center gap-3"
            >
              <span>▶</span>
              <span>Watch LangGraph Demo</span>
            </motion.button>
            <a
              href="#agents"
              className="px-10 py-5 bg-slate-800 text-white font-bold rounded-2xl text-lg border border-slate-600 hover:bg-slate-700 hover:border-slate-500 transition-all"
            >
              See All 12 Agents
            </a>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span>Built by a 20+ year Florida investor</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full" />
              <span>64.4% ML prediction accuracy</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full" />
              <span>Zero human-in-the-loop</span>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Stats Section */}
      <Section className="py-24 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <div className="text-amber-400 font-medium mb-4">THE NUMBERS</div>
            <h2 className="text-4xl md:text-5xl font-bold">Why Investors Choose Us</h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            <StatCard value="23s" label="Per Property" detail="vs 4 hours manual research" accent="amber" />
            <StatCard value="64.4%" label="ML Accuracy" detail="Third-party buyer prediction" accent="emerald" />
            <StatCard value="12" label="AI Agents" detail="LangGraph orchestrated" accent="purple" />
            <StatCard value="100x" label="ROI" detail="$300K value vs $3K cost" accent="blue" />
          </div>
        </div>
      </Section>

      {/* Agents Section */}
      <Section id="agents" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-6">
              <span className="text-purple-400 font-medium">LangGraph Architecture</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">12 Autonomous Agents</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Each agent specializes in one task. They communicate, share data, and make decisions together.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {agents.map((agent, i) => (
              <AgentCard key={i} {...agent} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </Section>

      {/* How It Works Section */}
      <Section className="py-24 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <div className="text-amber-400 font-medium mb-4">HOW IT WORKS</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">From Chaos to Clarity</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Traditional research takes 4 hours per property. We do it in 23 seconds.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Auction Discovery', desc: 'Our agents scan courthouse calendars daily and identify every upcoming foreclosure' },
              { step: '02', title: 'Deep Analysis', desc: '12 specialized agents extract data, search liens, run ML models, and calculate max bids' },
              { step: '03', title: 'Clear Recommendation', desc: 'Get a one-page report: BID with confidence, REVIEW further, or SKIP entirely' }
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp} className="relative">
                <div className="text-7xl font-bold text-slate-800 absolute -top-6 -left-2">{item.step}</div>
                <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-8 pt-12">
                  <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-slate-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Founder Section */}
      <Section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeInUp} className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-10 border border-slate-700">
            <div className="text-center">
              <div className="text-5xl mb-6">🏠</div>
              <blockquote className="text-2xl md:text-3xl font-medium text-white mb-6 italic">
                "I built this because I was tired of guessing at auctions. After 20 years and hundreds of deals, 
                I knew exactly what data I needed — I just needed AI to get it faster."
              </blockquote>
              <div className="text-amber-400 font-bold text-xl">Ariel Shapira</div>
              <div className="text-slate-400">Solo Founder • Everest Capital USA</div>
              <div className="text-slate-500 text-sm mt-2">20+ years Florida real estate • Licensed Broker & GC</div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section className="py-24 px-6 bg-gradient-to-br from-amber-500/10 via-slate-900 to-purple-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={fadeInUp}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-6">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-emerald-400 font-medium">Limited Beta Access</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Stop Guessing?</h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Join 50+ Florida investors on the waitlist. Be first to access the 
              Agentic AI ecosystem that's changing foreclosure investing.
            </p>
            <WaitlistForm variant="hero" />
          </motion.div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold">BidDeed.AI<span className="text-amber-400">AI</span></span>
              <span className="text-slate-600">|</span>
              <span className="text-sm text-slate-500">Agentic AI Ecosystem</span>
            </div>
            <div className="text-sm text-slate-500">
              © 2025 Everest Capital of Brevard LLC. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>LangGraph Powered</span>
              <span>•</span>
              <span>Made in Florida 🌴</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
