import React, { useState, useEffect, useRef } from 'react';

const AnimatedDemo = ({ onClose }) => {
  const [phase, setPhase] = useState('intro'); // 'intro', 'running', 'complete'
  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  const intervalRef = useRef(null);
  const stageIntervalRef = useRef(null);
  
  // Real property data from Dec 3, 2025 auction - Palm Bay top opportunity
  const propertyData = {
    caseNumber: '05-2025-CA-025192',
    address: '1639 Dittmer Cir SE, Palm Bay, FL 32909',
    plaintiff: 'Freedom Mortgage Corporation',
    defendant: 'Jutarat May',
    judgment: '$277,934.57',
    auction: 'Dec 3, 2025 @ 11:00 AM',
    parcel: '29-37-06-FY-00045.0-0017.00',
    yearBuilt: 2021,
    sqft: '2,847',
    beds: 4,
    baths: 3,
  };

  const analysisData = {
    arv: 881280,
    repairs: 25000,
    liens: [
      { type: 'First Mortgage', holder: 'Freedom Mortgage', amount: 277935, priority: 'FORECLOSING', status: 'eliminated' },
      { type: 'HOA Lien', holder: 'Palm Bay HOA', amount: 1850, priority: 'JUNIOR', status: 'eliminated' },
      { type: 'HOA Lien', holder: 'Dittmer Community', amount: 2100, priority: 'JUNIOR', status: 'eliminated' },
      { type: 'Tax Certificate', holder: 'Brevard County', amount: 0, priority: 'N/A', status: 'clear' }
    ],
    mlScore: 46.6,
    thirdPartyProb: 0.466,
    maxBid: 537832,
    bidJudgmentRatio: 1.935,
    recommendation: 'BID',
    demographics: {
      zip: '32909',
      medianIncome: '$58,200',
      vacancy: '5.2%',
      appreciation: '+6.8%'
    }
  };

  const stages = [
    { id: 0, name: 'Discovery', duration: 2500, output: '15 auctions found in Brevard County' },
    { id: 1, name: 'Scraping', duration: 2000, output: 'BECA V2.0 extracted case data' },
    { id: 2, name: 'Title Search', duration: 2500, output: '38 recorded documents analyzed' },
    { id: 3, name: 'Lien Priority', duration: 2000, output: '3 liens classified (1 foreclosing, 2 junior HOA)' },
    { id: 4, name: 'Tax Certs', duration: 1500, output: 'No outstanding tax certificates' },
    { id: 5, name: 'Demographics', duration: 2000, output: 'ZIP 32909: B+ tier market (vacancy 5.2%)' },
    { id: 6, name: 'ML Score', duration: 3000, output: 'XGBoost prediction: 46.6% third-party prob' },
    { id: 7, name: 'Max Bid', duration: 2500, output: `Calculated: $${analysisData.maxBid.toLocaleString()}` },
    { id: 8, name: 'Decision', duration: 2000, output: 'Ratio 193.5% → BID recommendation' },
    { id: 9, name: 'Report', duration: 1500, output: 'DOCX generated with BCPAO photo' },
    { id: 10, name: 'Disposition', duration: 1000, output: 'Tracking initialized' },
    { id: 11, name: 'Archive', duration: 1000, output: 'Stored to Supabase' },
  ];

  // Auto-transition from intro after 4 seconds
  useEffect(() => {
    if (phase === 'intro') {
      const timer = setTimeout(() => {
        setPhase('running');
        setIsPlaying(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'running' && isPlaying && currentStage < stages.length) {
      setStageProgress(0);
      const stageDuration = stages[currentStage].duration;
      const progressIncrement = 100 / (stageDuration / 50);
      
      stageIntervalRef.current = setInterval(() => {
        setStageProgress(prev => Math.min(prev + progressIncrement, 100));
      }, 50);

      intervalRef.current = setTimeout(() => {
        const nextStage = currentStage + 1;
        setCurrentStage(nextStage);
        setProgress(((nextStage) / stages.length) * 100);
        
        if (nextStage >= stages.length) {
          setPhase('complete');
        }
      }, stageDuration);
    }

    return () => {
      clearTimeout(intervalRef.current);
      clearInterval(stageIntervalRef.current);
    };
  }, [currentStage, isPlaying, phase]);

  const handleRestart = () => {
    setPhase('intro');
    setCurrentStage(0);
    setProgress(0);
    setIsPlaying(false);
  };

  const handleSkipIntro = () => {
    setPhase('running');
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // ============ INTRO SCREEN ============
  if (phase === 'intro') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.95)' }}>
        <div className="absolute inset-0 backdrop-blur-sm" onClick={onClose} />
        
        <div 
          className="relative w-full max-w-3xl rounded-2xl overflow-hidden p-12 text-center"
          style={{ 
            background: 'linear-gradient(135deg, rgba(22, 27, 34, 0.98) 0%, rgba(13, 17, 23, 0.98) 100%)',
            border: '1px solid rgba(48, 54, 61, 0.8)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 25px 50px -12px rgba(0,0,0,0.8)'
          }}
        >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Logo */}
          <div className="mb-6">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
              style={{ 
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(56, 189, 248, 0.2) 100%)',
                border: '1px solid rgba(34, 197, 94, 0.3)'
              }}
            >
              <span className="text-emerald-400">●</span>
              <span className="text-white">BrevardBidderAI</span>
              <span className="text-gray-500">v13.4.0</span>
            </div>
          </div>

          {/* Founder Introduction */}
          <div className="mb-8">
            <div className="text-gray-400 text-sm uppercase tracking-widest mb-3">Created by</div>
            <h2 className="text-3xl font-bold text-white mb-2">Ariel Shapira</h2>
            <div className="text-lg text-gray-300 mb-4">
              Real Estate Developer & Founder, Everest Capital USA
            </div>
            <div 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
              style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)' }}
            >
              <span className="text-amber-400">⚡</span>
              <span className="text-amber-300">20+ Years Investing, Developing & Building in Florida</span>
            </div>
          </div>

          {/* Tagline */}
          <div className="mb-10">
            <p className="text-xl text-gray-300 italic">
              "I built this because I was tired of guessing at auctions."
            </p>
            <p className="text-gray-500 mt-2">
              Not polished. Not perfect. <span className="text-emerald-400 font-semibold">Just real.</span>
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={handleSkipIntro}
            className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: '#000',
              boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)'
            }}
          >
            Watch the 12-Stage Pipeline →
          </button>

          <div className="mt-6 text-sm text-gray-500">
            Built by an investor, for investors
          </div>

          {/* Auto-skip indicator */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-600">
            <div className="w-16 h-1 rounded-full overflow-hidden bg-gray-800">
              <div 
                className="h-full bg-emerald-500 animate-pulse"
                style={{ animation: 'grow 4s linear forwards' }}
              />
            </div>
            <span>Starting automatically...</span>
          </div>
        </div>

        <style>{`
          @keyframes grow {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  // ============ COMPLETION SCREEN ============
  if (phase === 'complete') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.95)' }}>
        <div className="absolute inset-0 backdrop-blur-sm" onClick={onClose} />
        
        <div 
          className="relative w-full max-w-3xl rounded-2xl overflow-hidden p-12 text-center"
          style={{ 
            background: 'linear-gradient(135deg, rgba(22, 27, 34, 0.98) 0%, rgba(13, 17, 23, 0.98) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.5)',
            boxShadow: '0 0 40px rgba(34, 197, 94, 0.2), 0 25px 50px -12px rgba(0,0,0,0.8)'
          }}
        >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Success Icon */}
          <div className="mb-6">
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

          {/* Result Summary */}
          <h2 className="text-3xl font-bold text-white mb-4">Analysis Complete</h2>
          
          <div 
            className="inline-block px-6 py-3 rounded-xl mb-6"
            style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)' }}
          >
            <div className="text-sm text-gray-400 uppercase tracking-wider">Recommendation</div>
            <div className="text-4xl font-bold text-emerald-400">{analysisData.recommendation}</div>
            <div className="text-gray-400 mt-1">Max Bid: <span className="text-amber-400 font-mono">${analysisData.maxBid.toLocaleString()}</span></div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-2xl font-bold text-cyan-400">12</div>
              <div className="text-xs text-gray-500">Stages Run</div>
            </div>
            <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-2xl font-bold text-amber-400">38</div>
              <div className="text-xs text-gray-500">Docs Analyzed</div>
            </div>
            <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-2xl font-bold text-emerald-400">4</div>
              <div className="text-xs text-gray-500">Liens Found</div>
            </div>
          </div>

          {/* Quote */}
          <div className="mb-8 p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-gray-300 italic">
              "This analysis used to take me 4+ hours. Now it takes 23 seconds."
            </p>
            <p className="text-sm text-gray-500 mt-2">— Ariel Shapira, Solo Founder</p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleRestart}
              className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: '#000',
                boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)'
              }}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Watch Again
              </span>
            </button>
            
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-semibold transition-all"
              style={{ border: '1px solid rgba(48, 54, 61, 0.8)', color: '#9ca3af' }}
            >
              Back to Site
            </button>
          </div>

          {/* Final Tagline */}
          <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(48, 54, 61, 0.5)' }}>
            <div className="text-sm text-gray-500 mb-2">Agentic AI Ecosystem for Foreclosure Auctions</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-emerald-400 font-semibold">BrevardBidderAI</span>
              <span className="text-gray-600">|</span>
              <span className="text-gray-400">Built by an investor, for investors</span>
            </div>
            <a 
              href="https://linkedin.com/in/ariel-shapira-533a776" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-3 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Connect with Ariel
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ============ MAIN PIPELINE SCREEN ============
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.9)' }}>
      {/* Backdrop blur */}
      <div className="absolute inset-0 backdrop-blur-sm" onClick={onClose} />
      
      {/* Main container */}
      <div 
        className="relative w-full max-w-5xl rounded-2xl overflow-hidden"
        style={{ 
          background: 'linear-gradient(135deg, rgba(22, 27, 34, 0.98) 0%, rgba(13, 17, 23, 0.98) 100%)',
          border: '1px solid rgba(48, 54, 61, 0.8)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 25px 50px -12px rgba(0,0,0,0.8)'
        }}
      >
        {/* Terminal Header */}
        <div 
          className="flex items-center justify-between px-5 py-4"
          style={{ 
            borderBottom: '1px solid rgba(48, 54, 61, 0.6)',
            background: 'rgba(22, 27, 34, 0.8)'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <button 
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors"
              />
              <button 
                onClick={togglePlayPause}
                className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors"
              />
              <button 
                onClick={handleRestart}
                className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors"
              />
            </div>
            <div 
              className="px-4 py-1.5 rounded-md text-xs font-mono"
              style={{ background: 'rgba(48, 54, 61, 0.5)', color: '#8b949e' }}
            >
              <span className="text-cyan-400">brevard-bidder-ai</span>
              <span className="mx-2">/</span>
              <span>pipeline-execution</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Founder Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs" style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
              <span className="text-amber-400">⚡</span>
              <span className="text-amber-300">Ariel Shapira</span>
            </div>
            <span className="text-xs font-semibold text-emerald-400">
              {isPlaying ? '● LIVE' : '❚❚ PAUSED'}
            </span>
            <span className="text-xs text-gray-500 font-mono">v13.4.0</span>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1" style={{ background: 'rgba(48, 54, 61, 0.6)' }}>
          <div 
            className="h-full transition-all duration-300"
            style={{ 
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #22c55e 0%, #38bdf8 50%, #a855f7 100%)',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.5)'
            }}
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-12 gap-0" style={{ minHeight: '500px' }}>
          {/* Left Panel - Pipeline Stages */}
          <div 
            className="col-span-4 p-5 overflow-y-auto"
            style={{ 
              borderRight: '1px solid rgba(48, 54, 61, 0.6)',
              background: 'rgba(13, 17, 23, 0.5)',
              maxHeight: '500px'
            }}
          >
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              12-Stage Pipeline
            </div>
            <div className="space-y-1">
              {stages.map((stage, idx) => {
                const isActive = idx === currentStage;
                const isCompleted = idx < currentStage;
                
                return (
                  <div 
                    key={stage.id}
                    className={`relative px-3 py-2.5 rounded-lg transition-all duration-300 ${
                      isActive ? 'bg-cyan-500/10' : isCompleted ? 'bg-emerald-500/5' : ''
                    }`}
                    style={{
                      border: isActive ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent'
                    }}
                  >
                    {/* Active stage progress bar */}
                    {isActive && (
                      <div 
                        className="absolute inset-0 rounded-lg overflow-hidden"
                        style={{ opacity: 0.1 }}
                      >
                        <div 
                          className="h-full bg-cyan-400 transition-all duration-100"
                          style={{ width: `${stageProgress}%` }}
                        />
                      </div>
                    )}
                    
                    <div className="relative flex items-center gap-3">
                      {/* Status indicator */}
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono ${
                        isCompleted ? 'bg-emerald-500/20 text-emerald-400' :
                        isActive ? 'bg-cyan-500/20 text-cyan-400' :
                        'bg-gray-700/50 text-gray-500'
                      }`}>
                        {isCompleted ? '✓' : idx + 1}
                      </div>
                      
                      {/* Stage info */}
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${
                          isActive ? 'text-cyan-400' :
                          isCompleted ? 'text-gray-300' :
                          'text-gray-500'
                        }`}>
                          {stage.name}
                        </div>
                        {(isActive || isCompleted) && (
                          <div className={`text-xs mt-0.5 truncate ${
                            isActive ? 'text-cyan-400/70' : 'text-emerald-400/70'
                          }`}>
                            {stage.output}
                          </div>
                        )}
                      </div>

                      {/* Processing indicator */}
                      {isActive && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel - Output */}
          <div className="col-span-8 flex flex-col">
            {/* Property Info Header */}
            <div 
              className="p-5"
              style={{ borderBottom: '1px solid rgba(48, 54, 61, 0.6)' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-gray-500 font-mono mb-1">
                    CASE {propertyData.caseNumber}
                  </div>
                  <div className="text-lg font-semibold text-white">
                    {propertyData.address}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {propertyData.plaintiff} vs. {propertyData.defendant}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">JUDGMENT</div>
                  <div className="text-xl font-bold text-amber-400 font-mono">
                    {propertyData.judgment}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{propertyData.auction}</div>
                </div>
              </div>
            </div>

            {/* Analysis Output */}
            <div className="flex-1 p-5 overflow-y-auto font-mono text-sm" style={{ background: 'rgba(13, 17, 23, 0.3)' }}>
              {/* Terminal output lines */}
              <div className="space-y-2">
                <div className="text-gray-500">{'>'} Initializing BrevardBidderAI pipeline...</div>
                
                {currentStage >= 0 && (
                  <div className="text-emerald-400">✓ Discovery: {stages[0].output}</div>
                )}
                {currentStage >= 1 && (
                  <div className="text-emerald-400">✓ Scraping: {stages[1].output}</div>
                )}
                {currentStage >= 2 && (
                  <div className="text-emerald-400">✓ Title: {stages[2].output}</div>
                )}
                {currentStage >= 3 && (
                  <>
                    <div className="text-emerald-400">✓ Lien Analysis:</div>
                    <div className="pl-4 text-gray-400">
                      {analysisData.liens.map((lien, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className={lien.status === 'eliminated' ? 'text-red-400' : 'text-emerald-400'}>
                            {lien.status === 'eliminated' ? '✗' : '✓'}
                          </span>
                          <span>{lien.type}: ${lien.amount.toLocaleString()}</span>
                          <span className="text-gray-600">({lien.priority})</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {currentStage >= 5 && (
                  <div className="text-emerald-400">✓ Demographics: {stages[5].output}</div>
                )}
                {currentStage >= 6 && (
                  <>
                    <div className="text-cyan-400">→ ML Prediction: {analysisData.mlScore}% third-party probability</div>
                    <div className="text-gray-500 pl-4">Model: BrevardBidderAI ML | Accuracy: 64.4%</div>
                  </>
                )}
                {currentStage >= 7 && (
                  <>
                    <div className="text-amber-400">→ Max Bid Calculation:</div>
                    <div className="pl-4 text-gray-400">
                      <div>ARV: ${analysisData.arv.toLocaleString()}</div>
                      <div>× 70% = ${(analysisData.arv * 0.7).toLocaleString()}</div>
                      <div>- Repairs: ${analysisData.repairs.toLocaleString()}</div>
                      <div>- Buffer: $10,000</div>
                      <div>- Margin: ${Math.min(25000, analysisData.arv * 0.15).toLocaleString()}</div>
                      <div className="text-amber-400 font-semibold mt-1">= Max Bid: ${analysisData.maxBid.toLocaleString()}</div>
                    </div>
                  </>
                )}
                {currentStage >= 8 && (
                  <div className="mt-4 p-4 rounded-lg" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">RECOMMENDATION</div>
                        <div className="text-2xl font-bold text-emerald-400">{analysisData.recommendation}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">BID/JUDGMENT RATIO</div>
                        <div className="text-xl font-mono text-emerald-400">{(analysisData.bidJudgmentRatio * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div 
              className="flex items-center justify-between p-4"
              style={{ 
                borderTop: '1px solid rgba(48, 54, 61, 0.6)',
                background: 'rgba(22, 27, 34, 0.5)'
              }}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlayPause}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: '#000',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                  }}
                >
                  {isPlaying ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                      Pause
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Resume
                    </>
                  )}
                </button>
                
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
                  style={{ border: '1px solid rgba(48, 54, 61, 0.8)' }}
                >
                  Close
                </button>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Stage {Math.min(currentStage + 1, 12)} of 12</span>
                <span>•</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
            </div>
          </div>
        </div>

        {/* Watermark */}
        <div 
          className="absolute bottom-4 right-4 text-xs text-gray-600 font-mono opacity-50"
        >
          BrevardBidderAI • Built by Ariel Shapira
        </div>
      </div>
    </div>
  );
};

export default AnimatedDemo;
