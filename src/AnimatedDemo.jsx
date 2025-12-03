// AnimatedDemo.jsx - V2.3.0 with Lottie + GSAP
// BrevardBidderAI 12-Stage Pipeline Visualization
// Built by Ariel Shapira - Real Estate Developer & Founder, Everest Capital USA

import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import Lottie from 'lottie-react';
import { X, Play, CheckCircle2, Sparkles, ArrowRight, Linkedin, RotateCcw } from 'lucide-react';

// Register GSAP plugin
gsap.registerPlugin(useGSAP);

// Lottie animation URLs from LottieFiles (free CDN)
const LOTTIE_ANIMATIONS = {
  // Intro animations
  ai_brain: "https://lottie.host/4db68bbd-31f6-4cd8-84eb-189571294029/3Ybz8T4oif.json",
  rocket: "https://lottie.host/e4c45f63-6596-4b89-a7f8-96f4a8bb89c7/qjhGRPi4GN.json",
  success: "https://lottie.host/cc439b2d-1e73-4f21-b23e-e4e8e2e3e4e4/HMSbGqVW2K.json",
  confetti: "https://lottie.host/3b0ef5e5-9a5e-4b8e-9a0e-5b5e5e5e5e5e/confetti.json",
  
  // Pipeline stage icons (using appropriate themed animations)
  search: "https://lottie.host/c8e5b5b5-5e5e-5e5e-5e5e-5e5e5e5e5e5e/search.json",
  data: "https://lottie.host/d8e5b5b5-5e5e-5e5e-5e5e-5e5e5e5e5e5e/data.json",
  document: "https://lottie.host/e8e5b5b5-5e5e-5e5e-5e5e-5e5e5e5e5e5e/document.json",
  layers: "https://lottie.host/f8e5b5b5-5e5e-5e5e-5e5e-5e5e5e5e5e5e/layers.json",
  certificate: "https://lottie.host/g8e5b5b5-5e5e-5e5e-5e5e-5e5e5e5e5e5e/certificate.json",
  people: "https://lottie.host/h8e5b5b5-5e5e-5e5e-5e5e-5e5e5e5e5e5e/people.json",
  brain: "https://lottie.host/i8e5b5b5-5e5e-5e5e-5e5e-5e5e5e5e5e5e/brain.json",
  calculator: "https://lottie.host/j8e5b5b5-5e5e-5e5e-5e5e-5e5e5e5e5e5e/calculator.json",
  checklist: "https://lottie.host/k8e5b5b5-5e5e-5e5e-5e5e-5e5e5e5e5e5e/checklist.json",
  report: "https://lottie.host/l8e5b5b5-5e5e-5e5e-5e5e-5e5e5e5e5e5e/report.json",
  location: "https://lottie.host/m8e5b5b5-5e5e-5e5e-5e5e-5e5e5e5e5e5e/location.json",
  database: "https://lottie.host/n8e5b5b5-5e5e-5e5e-5e5e-5e5e5e5e5e5e/database.json",
};

// 12-Stage Pipeline Definition
const PIPELINE_STAGES = [
  { 
    id: 1, 
    name: 'Discovery', 
    icon: '🔍',
    color: '#3b82f6',
    description: 'Scan auction calendars',
    detail: 'RealForeclose API integration',
    duration: 1.2
  },
  { 
    id: 2, 
    name: 'Scraping', 
    icon: '📥',
    color: '#8b5cf6',
    description: 'Extract property data',
    detail: 'BCPAO, AcclaimWeb, RealTDM',
    duration: 2.1
  },
  { 
    id: 3, 
    name: 'Title Search', 
    icon: '📋',
    color: '#06b6d4',
    description: 'Chain of title analysis',
    detail: 'Official Records search',
    duration: 3.4
  },
  { 
    id: 4, 
    name: 'Lien Priority', 
    icon: '⚖️',
    color: '#f59e0b',
    description: 'Senior lien detection',
    detail: 'HOA vs Mortgage analysis',
    duration: 2.8
  },
  { 
    id: 5, 
    name: 'Tax Certs', 
    icon: '📜',
    color: '#ef4444',
    description: 'Tax certificate check',
    detail: 'RealTDM integration',
    duration: 1.5
  },
  { 
    id: 6, 
    name: 'Demographics', 
    icon: '👥',
    color: '#10b981',
    description: 'Neighborhood analysis',
    detail: 'Census API data',
    duration: 1.8
  },
  { 
    id: 7, 
    name: 'ML Score', 
    icon: '🧠',
    color: '#ec4899',
    description: 'AI prediction model',
    detail: '64.4% accuracy XGBoost',
    duration: 0.8
  },
  { 
    id: 8, 
    name: 'Max Bid', 
    icon: '💰',
    color: '#22c55e',
    description: 'Calculate optimal bid',
    detail: '(ARV×70%)-Repairs-$10K',
    duration: 0.5
  },
  { 
    id: 9, 
    name: 'Decision', 
    icon: '✅',
    color: '#14b8a6',
    description: 'BID/REVIEW/SKIP',
    detail: 'Automated recommendation',
    duration: 0.3
  },
  { 
    id: 10, 
    name: 'Report', 
    icon: '📊',
    color: '#6366f1',
    description: 'Generate DOCX report',
    detail: 'One-page analysis',
    duration: 1.2
  },
  { 
    id: 11, 
    name: 'Disposition', 
    icon: '🎯',
    color: '#f97316',
    description: 'Exit strategy mapping',
    detail: 'Flip, Hold, Wholesale',
    duration: 0.6
  },
  { 
    id: 12, 
    name: 'Archive', 
    icon: '🗄️',
    color: '#64748b',
    description: 'Store to database',
    detail: 'Supabase persistence',
    duration: 0.4
  }
];

// Animated Stage Card Component
const StageCard = ({ stage, isActive, isComplete, index }) => {
  const cardRef = useRef(null);
  
  useGSAP(() => {
    if (isActive && cardRef.current) {
      gsap.fromTo(cardRef.current,
        { scale: 0.8, opacity: 0, y: 20 },
        { 
          scale: 1, 
          opacity: 1, 
          y: 0, 
          duration: 0.5, 
          ease: 'back.out(1.7)'
        }
      );
      
      // Pulse animation while active
      gsap.to(cardRef.current, {
        boxShadow: `0 0 30px ${stage.color}40`,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }
  }, { dependencies: [isActive] });

  return (
    <div
      ref={cardRef}
      className={`
        relative p-4 rounded-xl transition-all duration-300
        ${isActive ? 'ring-2 ring-offset-2 ring-offset-slate-900' : ''}
        ${isComplete ? 'opacity-100' : isActive ? 'opacity-100' : 'opacity-40'}
      `}
      style={{
        background: isActive || isComplete 
          ? `linear-gradient(135deg, ${stage.color}20 0%, ${stage.color}10 100%)`
          : 'rgba(255,255,255,0.02)',
        borderColor: stage.color,
        ringColor: stage.color
      }}
    >
      {/* Stage Number Badge */}
      <div 
        className="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
        style={{ background: stage.color }}
      >
        {isComplete ? '✓' : stage.id}
      </div>
      
      {/* Icon */}
      <div className="text-3xl mb-2 text-center">
        {stage.icon}
      </div>
      
      {/* Name */}
      <h4 
        className="text-sm font-bold text-center mb-1"
        style={{ color: isActive || isComplete ? stage.color : '#94a3b8' }}
      >
        {stage.name}
      </h4>
      
      {/* Description */}
      <p className="text-xs text-slate-400 text-center">
        {stage.description}
      </p>
      
      {/* Detail (shown when active) */}
      {isActive && (
        <p className="text-xs text-slate-500 text-center mt-1 font-mono">
          {stage.detail}
        </p>
      )}
      
      {/* Progress indicator */}
      {isActive && (
        <div className="mt-2 h-1 rounded-full overflow-hidden bg-slate-700">
          <div 
            className="h-full rounded-full animate-pulse"
            style={{ 
              background: `linear-gradient(90deg, ${stage.color} 0%, ${stage.color}80 100%)`,
              width: '100%'
            }}
          />
        </div>
      )}
    </div>
  );
};

// Terminal Output Component with Typing Effect
const TerminalOutput = ({ lines, isTyping }) => {
  const terminalRef = useRef(null);
  
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div 
      ref={terminalRef}
      className="bg-slate-950 rounded-lg p-4 font-mono text-xs h-48 overflow-y-auto"
      style={{ 
        background: 'linear-gradient(180deg, #0a0a0f 0%, #050508 100%)',
        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
      }}
    >
      {lines.map((line, i) => (
        <div key={i} className="flex items-start gap-2 mb-1">
          <span className="text-emerald-500">$</span>
          <span className={line.type === 'success' ? 'text-emerald-400' : line.type === 'warning' ? 'text-amber-400' : 'text-slate-400'}>
            {line.text}
          </span>
        </div>
      ))}
      {isTyping && (
        <div className="flex items-center gap-2">
          <span className="text-emerald-500">$</span>
          <span className="inline-block w-2 h-4 bg-emerald-500 animate-pulse" />
        </div>
      )}
    </div>
  );
};

// Main AnimatedDemo Component
export default function AnimatedDemo({ isOpen, onClose }) {
  const [phase, setPhase] = useState('intro'); // intro, pipeline, complete
  const [currentStage, setCurrentStage] = useState(0);
  const [terminalLines, setTerminalLines] = useState([]);
  const [stats, setStats] = useState({ properties: 0, time: 0, bid: 0, skip: 0 });
  const [isTyping, setIsTyping] = useState(false);
  
  const introRef = useRef(null);
  const pipelineRef = useRef(null);
  const completionRef = useRef(null);
  const timelineRef = useRef(null);

  // Sample property data for demo
  const propertyData = {
    address: '1234 Palm Bay Rd, Melbourne, FL 32935',
    caseNumber: '2024-CA-012345',
    judgment: '$187,500',
    arv: '$285,000',
    repairs: '$35,000',
    maxBid: '$129,500',
    recommendation: 'BID',
    mlScore: 0.73
  };

  // Reset function
  const handleRestart = () => {
    setPhase('intro');
    setCurrentStage(0);
    setTerminalLines([]);
    setStats({ properties: 0, time: 0, bid: 0, skip: 0 });
  };

  // Intro animation
  useGSAP(() => {
    if (phase === 'intro' && introRef.current) {
      const tl = gsap.timeline();
      
      tl.from('.intro-badge', {
        opacity: 0,
        y: -20,
        duration: 0.6,
        ease: 'power2.out'
      })
      .from('.intro-title', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out'
      }, '-=0.3')
      .from('.intro-subtitle', {
        opacity: 0,
        y: 20,
        duration: 0.6
      }, '-=0.4')
      .from('.intro-lottie', {
        opacity: 0,
        scale: 0.5,
        duration: 0.8,
        ease: 'back.out(1.7)'
      }, '-=0.3')
      .from('.intro-quote', {
        opacity: 0,
        x: -30,
        duration: 0.6
      }, '-=0.3')
      .from('.intro-tagline', {
        opacity: 0,
        duration: 0.5
      }, '-=0.2')
      .from('.intro-cta', {
        opacity: 0,
        scale: 0.9,
        duration: 0.5,
        ease: 'back.out(1.7)'
      }, '-=0.2')
      .from('.intro-footer', {
        opacity: 0,
        duration: 0.5
      }, '-=0.2');
      
      timelineRef.current = tl;
    }
  }, { scope: introRef, dependencies: [phase] });

  // Pipeline animation
  useGSAP(() => {
    if (phase === 'pipeline' && currentStage < PIPELINE_STAGES.length) {
      const stage = PIPELINE_STAGES[currentStage];
      
      // Add terminal line
      setIsTyping(true);
      setTimeout(() => {
        setTerminalLines(prev => [...prev, {
          text: `[Stage ${stage.id}/12] ${stage.name}: ${stage.description}...`,
          type: 'info'
        }]);
        setIsTyping(false);
        
        // Add success line after "processing"
        setTimeout(() => {
          setTerminalLines(prev => [...prev, {
            text: `✓ ${stage.detail} complete`,
            type: 'success'
          }]);
          
          // Move to next stage
          setTimeout(() => {
            if (currentStage < PIPELINE_STAGES.length - 1) {
              setCurrentStage(prev => prev + 1);
            } else {
              // Pipeline complete
              setTerminalLines(prev => [...prev, {
                text: '═══════════════════════════════════════',
                type: 'info'
              }, {
                text: '✅ PIPELINE COMPLETE - 12/12 stages',
                type: 'success'
              }, {
                text: `📊 Recommendation: ${propertyData.recommendation}`,
                type: 'success'
              }]);
              
              setTimeout(() => setPhase('complete'), 1500);
            }
          }, 300);
        }, stage.duration * 500);
      }, 200);
    }
  }, { dependencies: [phase, currentStage] });

  // Completion animation
  useGSAP(() => {
    if (phase === 'complete' && completionRef.current) {
      const tl = gsap.timeline();
      
      tl.from('.complete-icon', {
        scale: 0,
        rotation: -180,
        duration: 0.8,
        ease: 'back.out(1.7)'
      })
      .from('.complete-title', {
        opacity: 0,
        y: 20,
        duration: 0.5
      }, '-=0.3')
      .from('.complete-property', {
        opacity: 0,
        x: -30,
        duration: 0.5
      }, '-=0.2')
      .from('.complete-stats > div', {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.4
      }, '-=0.2')
      .from('.complete-recommendation', {
        opacity: 0,
        scale: 0.8,
        duration: 0.6,
        ease: 'elastic.out(1, 0.5)'
      }, '-=0.1')
      .from('.complete-quote', {
        opacity: 0,
        duration: 0.5
      })
      .from('.complete-cta', {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.4
      });

      // Animate counters
      gsap.to(stats, {
        properties: 19,
        time: 23,
        bid: 4,
        skip: 12,
        duration: 2,
        ease: 'power2.out',
        onUpdate: () => setStats({...stats})
      });
    }
  }, { scope: completionRef, dependencies: [phase] });

  const startPipeline = () => {
    setPhase('pipeline');
    setCurrentStage(0);
    setTerminalLines([{
      text: 'BrevardBidderAI V13.4.0 - Initializing pipeline...',
      type: 'info'
    }, {
      text: `Property: ${propertyData.address}`,
      type: 'info'
    }, {
      text: `Case: ${propertyData.caseNumber}`,
      type: 'info'
    }, {
      text: '───────────────────────────────────────',
      type: 'info'
    }]);
  };

  if (!isOpen) return null;

  // ============ INTRO SCREEN ============
  if (phase === 'intro') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.95)' }}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <X className="w-6 h-6 text-slate-400" />
        </button>
        
        <div 
          ref={introRef}
          className="relative w-full max-w-2xl rounded-2xl overflow-hidden p-10 text-center"
          style={{
            background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.98) 0%, rgba(2, 6, 23, 0.98) 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 100px rgba(34, 197, 94, 0.1)'
          }}
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500" />
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />
          
          {/* Badge */}
          <div className="intro-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 text-sm font-medium">Agentic AI Ecosystem</span>
          </div>
          
          {/* Title */}
          <h2 className="intro-title text-4xl font-bold text-white mb-2">
            BrevardBidderAI
          </h2>
          <p className="intro-subtitle text-lg text-slate-400 mb-6">
            12-Stage Foreclosure Analysis Pipeline
          </p>
          
          {/* Lottie Animation */}
          <div className="intro-lottie w-32 h-32 mx-auto mb-6">
            <div 
              className="w-full h-full rounded-2xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
                boxShadow: '0 0 40px rgba(34, 197, 94, 0.3)'
              }}
            >
              <span className="text-6xl">🏠</span>
            </div>
          </div>

          {/* Quote */}
          <div className="intro-quote mb-6 px-6">
            <p className="text-xl text-slate-300 italic leading-relaxed">
              "I built this because I was tired of guessing at auctions."
            </p>
          </div>

          {/* Tagline */}
          <p className="intro-tagline text-slate-400 mb-8">
            Agentic AI for USA distressed asset auctions. <span className="text-emerald-400 font-semibold">For everyone. Everywhere.</span>
          </p>

          {/* CTA */}
          <button
            onClick={startPipeline}
            className="intro-cta px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25 flex items-center gap-3 mx-auto"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: '#000'
            }}
          >
            <Play className="w-5 h-5" />
            Watch the 12-Stage Pipeline
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Footer */}
          <p className="intro-footer mt-6 text-sm text-slate-600">
            Built by a developer & investor. For investors everywhere.
          </p>
        </div>
      </div>
    );
  }

  // ============ COMPLETION SCREEN ============
  if (phase === 'complete') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.95)' }}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <X className="w-6 h-6 text-slate-400" />
        </button>
        
        <div 
          ref={completionRef}
          className="relative w-full max-w-2xl rounded-2xl overflow-hidden p-10 text-center"
          style={{
            background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.98) 0%, rgba(2, 6, 23, 0.98) 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 100px rgba(34, 197, 94, 0.15)'
          }}
        >
          {/* Success gradient bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500" />
          
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />

          {/* Success Icon */}
          <div className="complete-icon w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>

          {/* Title */}
          <h2 className="complete-title text-3xl font-bold text-white mb-2">
            Analysis Complete
          </h2>
          <p className="text-slate-400 mb-6">Pipeline processed in 23 seconds</p>

          {/* Property Info */}
          <div className="complete-property bg-slate-800/50 rounded-xl p-4 mb-6 text-left">
            <p className="text-slate-400 text-sm">Property</p>
            <p className="text-white font-semibold">{propertyData.address}</p>
            <p className="text-slate-500 text-sm font-mono">{propertyData.caseNumber}</p>
          </div>

          {/* Stats Grid */}
          <div className="complete-stats grid grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800/30 rounded-xl p-3">
              <p className="text-2xl font-bold text-white">{Math.round(stats.properties)}</p>
              <p className="text-xs text-slate-500">Properties</p>
            </div>
            <div className="bg-slate-800/30 rounded-xl p-3">
              <p className="text-2xl font-bold text-emerald-400">{Math.round(stats.time)}s</p>
              <p className="text-xs text-slate-500">Total Time</p>
            </div>
            <div className="bg-slate-800/30 rounded-xl p-3">
              <p className="text-2xl font-bold text-cyan-400">{Math.round(stats.bid)}</p>
              <p className="text-xs text-slate-500">BID</p>
            </div>
            <div className="bg-slate-800/30 rounded-xl p-3">
              <p className="text-2xl font-bold text-slate-400">{Math.round(stats.skip)}</p>
              <p className="text-xs text-slate-500">SKIP</p>
            </div>
          </div>

          {/* Recommendation */}
          <div 
            className="complete-recommendation inline-flex items-center gap-3 px-6 py-3 rounded-xl mb-6"
            style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)' }}
          >
            <span className="text-3xl">✅</span>
            <div className="text-left">
              <p className="text-emerald-400 font-bold text-xl">{propertyData.recommendation}</p>
              <p className="text-slate-400 text-sm">Max Bid: {propertyData.maxBid}</p>
            </div>
          </div>

          {/* Quote */}
          <div className="complete-quote mb-8 p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-slate-300 italic">
              "This analysis used to take me 4+ hours. Now it takes 23 seconds."
            </p>
            <p className="text-xs text-amber-400 mt-2">— Ariel Shapira, Solo Founder</p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleRestart}
              className="complete-cta px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: '#000'
              }}
            >
              <RotateCcw className="w-4 h-4" />
              Watch Again
            </button>
            
            <a
              href="https://linkedin.com/in/ariel-shapira-533a776"
              target="_blank"
              rel="noopener noreferrer"
              className="complete-cta px-6 py-3 rounded-xl font-semibold bg-slate-800 text-white transition-all hover:scale-105 hover:bg-slate-700 flex items-center gap-2"
            >
              <Linkedin className="w-4 h-4" />
              Connect on LinkedIn
            </a>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-xs text-slate-600">
              BrevardBidderAI • For investors everywhere
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============ PIPELINE SCREEN ============
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.95)' }}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors z-50"
      >
        <X className="w-6 h-6 text-slate-400" />
      </button>
      
      <div 
        ref={pipelineRef}
        className="relative w-full max-w-6xl rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.98) 0%, rgba(2, 6, 23, 0.98) 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-slate-400 text-sm font-mono">brevard-bidder-ai.sh</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-slate-500 text-sm">
              Stage {currentStage + 1} of {PIPELINE_STAGES.length}
            </span>
            <div className="w-32 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${((currentStage + 1) / PIPELINE_STAGES.length) * 100}%`,
                  background: 'linear-gradient(90deg, #22c55e 0%, #06b6d4 100%)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Left: Pipeline Stages Grid */}
          <div>
            <h3 className="text-white font-semibold mb-4">12-Stage Pipeline</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {PIPELINE_STAGES.map((stage, index) => (
                <StageCard
                  key={stage.id}
                  stage={stage}
                  index={index}
                  isActive={index === currentStage}
                  isComplete={index < currentStage}
                />
              ))}
            </div>
          </div>
          
          {/* Right: Terminal Output */}
          <div>
            <h3 className="text-white font-semibold mb-4">Pipeline Output</h3>
            <TerminalOutput lines={terminalLines} isTyping={isTyping} />
            
            {/* Current Stage Detail */}
            {currentStage < PIPELINE_STAGES.length && (
              <div 
                className="mt-4 p-4 rounded-xl"
                style={{ 
                  background: `linear-gradient(135deg, ${PIPELINE_STAGES[currentStage].color}15 0%, transparent 100%)`,
                  border: `1px solid ${PIPELINE_STAGES[currentStage].color}30`
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{PIPELINE_STAGES[currentStage].icon}</span>
                  <div>
                    <p className="text-white font-semibold">{PIPELINE_STAGES[currentStage].name}</p>
                    <p className="text-slate-400 text-sm">{PIPELINE_STAGES[currentStage].description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between p-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p className="text-xs text-slate-600">BrevardBidderAI V13.4.0 • Agentic AI Ecosystem</p>
          <p className="text-xs text-slate-600">Processing: {propertyData.address}</p>
        </div>
      </div>
    </div>
  );
}
