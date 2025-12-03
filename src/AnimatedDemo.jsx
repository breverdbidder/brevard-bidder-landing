import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const AnimatedDemo = ({ onClose }) => {
  const [phase, setPhase] = useState('intro');
  const [currentStage, setCurrentStage] = useState(-1);
  const [terminalLines, setTerminalLines] = useState([]);
  const containerRef = useRef(null);
  const introRef = useRef(null);
  const pipelineRef = useRef(null);
  const completionRef = useRef(null);
  const timelineRef = useRef(null);
  
  const propertyData = {
    caseNumber: '05-2025-CA-025192',
    address: '1639 Dittmer Cir SE, Palm Bay, FL 32909',
    plaintiff: 'Freedom Mortgage Corporation',
    defendant: 'Jutarat May',
    judgment: '$277,934.57',
    auction: 'Dec 3, 2025 @ 11:00 AM',
  };

  const analysisData = {
    arv: 881280,
    repairs: 25000,
    maxBid: 537832,
    bidJudgmentRatio: 1.935,
    recommendation: 'BID',
    mlScore: 46.6,
  };

  const stages = [
    { name: 'Discovery', output: '15 auctions found in Brevard County', icon: '🔍' },
    { name: 'Scraping', output: 'BECA V2.0 extracted case data', icon: '⚡' },
    { name: 'Title Search', output: '38 recorded documents analyzed', icon: '📋' },
    { name: 'Lien Priority', output: '3 liens classified (1 foreclosing, 2 junior)', icon: '⚖️' },
    { name: 'Tax Certs', output: 'No outstanding tax certificates', icon: '🏛️' },
    { name: 'Demographics', output: 'ZIP 32909: B+ tier market', icon: '📊' },
    { name: 'ML Score', output: '46.6% third-party probability', icon: '🧠' },
    { name: 'Max Bid', output: `$${analysisData.maxBid.toLocaleString()} calculated`, icon: '💰' },
    { name: 'Decision', output: 'Ratio 193.5% → BID', icon: '✓' },
    { name: 'Report', output: 'DOCX generated', icon: '📄' },
    { name: 'Disposition', output: 'Tracking initialized', icon: '🔄' },
    { name: 'Archive', output: 'Stored to Supabase', icon: '🗄️' },
  ];

  // GSAP Intro Animation
  useGSAP(() => {
    if (phase === 'intro' && introRef.current) {
      const tl = gsap.timeline();
      
      tl.from('.intro-logo', {
        scale: 0,
        opacity: 0,
        duration: 0.6,
        ease: 'back.out(1.7)'
      })
      .from('.intro-badge', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
      }, '-=0.3')
      .from('.intro-name', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out'
      }, '-=0.2')
      .from('.intro-title', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
      }, '-=0.3')
      .from('.intro-years', {
        scale: 0.8,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
      }, '-=0.2')
      .from('.intro-quote', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
      }, '-=0.2')
      .from('.intro-tagline', {
        y: 15,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
      }, '-=0.2')
      .from('.intro-cta', {
        scale: 0.9,
        opacity: 0,
        duration: 0.5,
        ease: 'back.out(1.5)'
      }, '-=0.1')
      .from('.intro-footer', {
        opacity: 0,
        duration: 0.5
      }, '-=0.2');

      // Pulse animation on CTA
      gsap.to('.intro-cta', {
        boxShadow: '0 0 30px rgba(34, 197, 94, 0.6)',
        repeat: -1,
        yoyo: true,
        duration: 1.5,
        ease: 'power1.inOut'
      });

      // Auto advance after 5 seconds
      const timer = setTimeout(() => startPipeline(), 5000);
      return () => clearTimeout(timer);
    }
  }, { scope: introRef, dependencies: [phase] });

  // Pipeline Animation
  useEffect(() => {
    if (phase === 'pipeline' && currentStage < stages.length) {
      const timer = setTimeout(() => {
        setCurrentStage(prev => {
          const next = prev + 1;
          if (next < stages.length) {
            setTerminalLines(lines => [...lines, {
              type: 'success',
              text: `✓ ${stages[next].name}: ${stages[next].output}`
            }]);
          }
          if (next >= stages.length - 1) {
            setTimeout(() => setPhase('complete'), 1500);
          }
          return next;
        });
      }, currentStage === -1 ? 500 : 800 + Math.random() * 400);
      
      return () => clearTimeout(timer);
    }
  }, [phase, currentStage]);

  // GSAP for stage animations
  useGSAP(() => {
    if (phase === 'pipeline' && pipelineRef.current) {
      gsap.from('.pipeline-header', {
        y: -20,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
      });
      
      gsap.from('.pipeline-property', {
        x: 30,
        opacity: 0,
        duration: 0.6,
        delay: 0.2,
        ease: 'power2.out'
      });
    }
  }, { scope: pipelineRef, dependencies: [phase] });

  // Completion Animation
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
        y: 30,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
      }, '-=0.3')
      .from('.complete-result', {
        scale: 0.8,
        opacity: 0,
        duration: 0.6,
        ease: 'back.out(1.5)'
      }, '-=0.2')
      .from('.complete-stat', {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.4,
        ease: 'power2.out'
      }, '-=0.2')
      .from('.complete-quote', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
      }, '-=0.1')
      .from('.complete-cta', {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.4,
        ease: 'power2.out'
      }, '-=0.1');

      // Glow pulse on result
      gsap.to('.complete-result', {
        boxShadow: '0 0 40px rgba(34, 197, 94, 0.4)',
        repeat: -1,
        yoyo: true,
        duration: 2,
        ease: 'power1.inOut'
      });
    }
  }, { scope: completionRef, dependencies: [phase] });

  const startPipeline = () => {
    setPhase('pipeline');
    setCurrentStage(-1);
    setTerminalLines([{ type: 'info', text: '> Initializing BrevardBidderAI pipeline...' }]);
  };

  const handleRestart = () => {
    setPhase('intro');
    setCurrentStage(-1);
    setTerminalLines([]);
  };

  // ============ INTRO SCREEN ============
  if (phase === 'intro') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.95)' }}>
        <div className="absolute inset-0 backdrop-blur-md" onClick={onClose} />
        
        <div 
          ref={introRef}
          className="relative w-full max-w-2xl rounded-2xl overflow-hidden p-10 text-center"
          style={{ 
            background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.98) 0%, rgba(2, 6, 23, 0.98) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            boxShadow: '0 0 60px rgba(59, 130, 246, 0.1), 0 25px 50px -12px rgba(0,0,0,0.8)'
          }}
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Logo */}
          <div className="intro-logo mb-6">
            <div 
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl text-3xl font-bold"
              style={{ 
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#0f172a',
                boxShadow: '0 10px 40px rgba(245, 158, 11, 0.3)'
              }}
            >
              BB
            </div>
          </div>

          {/* Badge */}
          <div className="intro-badge mb-6">
            <span 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{ 
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#4ade80'
              }}
            >
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              BrevardBidderAI v13.4.0
            </span>
          </div>

          {/* Founder */}
          <h2 className="intro-name text-3xl font-bold text-white mb-2">Ariel Shapira</h2>
          <p className="intro-title text-amber-400 text-lg mb-4">
            Real Estate Developer & Founder, Everest Capital USA
          </p>
          
          {/* Years Badge */}
          <div className="intro-years mb-6">
            <span 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
              style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)' }}
            >
              <span className="text-amber-400">⚡</span>
              <span className="text-amber-300 font-medium">20+ Years Investing, Developing & Building in Florida</span>
            </span>
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
            className="intro-cta px-8 py-4 rounded-xl font-bold text-lg transition-transform hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: '#000',
              boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)'
            }}
          >
            Watch the 12-Stage Pipeline →
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
        <div className="absolute inset-0 backdrop-blur-md" onClick={onClose} />
        
        <div 
          ref={completionRef}
          className="relative w-full max-w-2xl rounded-2xl overflow-hidden p-10 text-center"
          style={{ 
            background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.98) 0%, rgba(2, 6, 23, 0.98) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            boxShadow: '0 0 60px rgba(34, 197, 94, 0.15), 0 25px 50px -12px rgba(0,0,0,0.8)'
          }}
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Success Icon */}
          <div className="complete-icon mb-6">
            <div 
              className="inline-flex items-center justify-center w-20 h-20 rounded-full"
              style={{ 
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)',
                border: '2px solid rgba(34, 197, 94, 0.5)'
              }}
            >
              <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h2 className="complete-title text-3xl font-bold text-white mb-6">Analysis Complete</h2>
          
          {/* Result */}
          <div 
            className="complete-result inline-block px-8 py-4 rounded-xl mb-8"
            style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)' }}
          >
            <div className="text-sm text-slate-400 uppercase tracking-wider">Recommendation</div>
            <div className="text-5xl font-bold text-emerald-400 my-2">{analysisData.recommendation}</div>
            <div className="text-slate-300">
              Max Bid: <span className="text-amber-400 font-mono font-bold">${analysisData.maxBid.toLocaleString()}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="complete-stat p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-2xl font-bold text-cyan-400">12</div>
              <div className="text-xs text-slate-500">Stages Run</div>
            </div>
            <div className="complete-stat p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-2xl font-bold text-amber-400">38</div>
              <div className="text-xs text-slate-500">Docs Analyzed</div>
            </div>
            <div className="complete-stat p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-2xl font-bold text-emerald-400">23s</div>
              <div className="text-xs text-slate-500">Total Time</div>
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
              className="complete-cta px-6 py-3 rounded-xl font-semibold transition-transform hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: '#000'
              }}
            >
              Watch Again
            </button>
            
            <a
              href="https://linkedin.com/in/ariel-shapira-533a776"
              target="_blank"
              rel="noopener noreferrer"
              className="complete-cta px-6 py-3 rounded-xl font-semibold text-cyan-400 transition-colors hover:text-cyan-300"
              style={{ border: '1px solid rgba(34, 211, 238, 0.3)' }}
            >
              Connect with Ariel →
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
      <div className="absolute inset-0 backdrop-blur-md" onClick={onClose} />
      
      <div 
        ref={pipelineRef}
        className="relative w-full max-w-5xl rounded-2xl overflow-hidden"
        style={{ 
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.98) 0%, rgba(2, 6, 23, 0.98) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          boxShadow: '0 0 60px rgba(59, 130, 246, 0.1), 0 25px 50px -12px rgba(0,0,0,0.8)'
        }}
      >
        {/* Header */}
        <div 
          className="pipeline-header flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <button onClick={handleRestart} className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400" />
            </div>
            <span className="text-xs text-slate-500 font-mono ml-2">brevard-bidder-ai / pipeline</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs" style={{ background: 'rgba(251, 191, 36, 0.1)' }}>
              <span className="text-amber-400">Ariel Shapira</span>
            </div>
            <span className="text-xs text-emerald-400 font-semibold">● LIVE</span>
            <span className="text-xs text-slate-600">v13.4.0</span>
            <button onClick={onClose} className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div 
            className="h-full transition-all duration-500"
            style={{ 
              width: `${((currentStage + 1) / stages.length) * 100}%`,
              background: 'linear-gradient(90deg, #22c55e 0%, #38bdf8 50%, #a855f7 100%)',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.5)'
            }}
          />
        </div>

        {/* Content */}
        <div className="grid grid-cols-12 gap-0" style={{ minHeight: '450px' }}>
          {/* Stages */}
          <div 
            className="col-span-4 p-4 overflow-y-auto"
            style={{ borderRight: '1px solid rgba(255,255,255,0.05)', maxHeight: '450px' }}
          >
            <div className="text-xs text-slate-600 uppercase tracking-wider mb-3">12-Stage Pipeline</div>
            <div className="space-y-1">
              {stages.map((stage, idx) => {
                const isActive = idx === currentStage;
                const isComplete = idx < currentStage;
                
                return (
                  <div 
                    key={idx}
                    className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                      isActive ? 'bg-cyan-500/10 border border-cyan-500/30' : 
                      isComplete ? 'bg-emerald-500/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        isComplete ? 'bg-emerald-500/20 text-emerald-400' :
                        isActive ? 'bg-cyan-500/20 text-cyan-400' :
                        'bg-slate-800 text-slate-600'
                      }`}>
                        {isComplete ? '✓' : stage.icon}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${
                          isActive ? 'text-cyan-400' :
                          isComplete ? 'text-slate-300' :
                          'text-slate-600'
                        }`}>
                          {stage.name}
                        </div>
                        {(isActive || isComplete) && (
                          <div className={`text-xs ${isActive ? 'text-cyan-400/60' : 'text-emerald-400/60'}`}>
                            {stage.output}
                          </div>
                        )}
                      </div>
                      {isActive && <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Output */}
          <div className="col-span-8 flex flex-col">
            {/* Property */}
            <div className="pipeline-property p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs text-slate-600 font-mono">CASE {propertyData.caseNumber}</div>
                  <div className="text-lg font-semibold text-white">{propertyData.address}</div>
                  <div className="text-sm text-slate-400">{propertyData.plaintiff} vs. {propertyData.defendant}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-600">JUDGMENT</div>
                  <div className="text-xl font-bold text-amber-400 font-mono">{propertyData.judgment}</div>
                </div>
              </div>
            </div>

            {/* Terminal */}
            <div className="flex-1 p-4 font-mono text-sm overflow-y-auto" style={{ background: 'rgba(0,0,0,0.2)' }}>
              {terminalLines.map((line, idx) => (
                <div 
                  key={idx}
                  className={`mb-1 ${
                    line.type === 'success' ? 'text-emerald-400' :
                    line.type === 'info' ? 'text-slate-500' :
                    'text-white'
                  }`}
                >
                  {line.text}
                </div>
              ))}
              
              {currentStage >= 6 && (
                <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-slate-500">RECOMMENDATION</div>
                      <div className="text-2xl font-bold text-emerald-400">{analysisData.recommendation}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">MAX BID</div>
                      <div className="text-lg font-mono text-amber-400">${analysisData.maxBid.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div 
              className="flex items-center justify-between p-3"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="text-xs text-slate-600">
                Stage {Math.max(0, currentStage + 1)} of 12
              </div>
              <div className="text-xs text-slate-600">
                BrevardBidderAI • Built by Ariel Shapira
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedDemo;
