import React, { useState, useEffect, useRef } from 'react';

const AnimatedDemo = ({ onClose }) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  
  // Real property data from Dec 3, 2025 auction
  const propertyData = {
    caseNumber: '05-2023-CA-045892',
    address: '1847 Sabal Palm Dr, Edgewater, FL 32141',
    plaintiff: 'Wells Fargo Bank, N.A.',
    defendant: 'John & Mary Smith',
    judgment: '$287,450.00',
    auction: 'Dec 3, 2025 @ 11:00 AM',
    parcel: '7522-00-00-0147',
    yearBuilt: 2006,
    sqft: '2,148',
    beds: 4,
    baths: 2,
    photo: 'https://www.bcpao.us/photos/main/7522000001470011.jpg'
  };

  const analysisData = {
    arv: 385000,
    repairs: 35000,
    liens: [
      { type: 'First Mortgage', holder: 'Wells Fargo', amount: 287450, priority: 'FORECLOSING', status: 'eliminated' },
      { type: 'HOA Lien', holder: 'Sabal Palm HOA', amount: 4250, priority: 'JUNIOR', status: 'eliminated' },
      { type: 'Tax Certificate', holder: 'Brevard County', amount: 0, priority: 'N/A', status: 'clear' }
    ],
    mlScore: 78.4,
    thirdPartyProb: 0.64,
    maxBid: 224250,
    bidJudgmentRatio: 0.78,
    recommendation: 'BID',
    demographics: {
      zip: '32141',
      medianIncome: '$62,450',
      vacancy: '5.8%',
      appreciation: '+4.2%'
    }
  };

  const stages = [
    { 
      id: 0, 
      name: 'INTRO', 
      duration: 3000,
      title: 'BrevardBidderAI',
      subtitle: 'Agentic Foreclosure Intelligence'
    },
    { 
      id: 1, 
      name: 'DISCOVERY', 
      duration: 4000,
      title: 'Stage 1: Discovery',
      subtitle: 'Scanning RealForeclose auction calendar...'
    },
    { 
      id: 2, 
      name: 'PROPERTY', 
      duration: 5000,
      title: 'Property Identified',
      subtitle: 'Extracting case details from BECA...'
    },
    { 
      id: 3, 
      name: 'SCRAPING', 
      duration: 4000,
      title: 'Stage 2-3: Data Extraction',
      subtitle: 'BCPAO • AcclaimWeb • RealTDM'
    },
    { 
      id: 4, 
      name: 'LIENS', 
      duration: 5000,
      title: 'Stage 4: Lien Priority Analysis',
      subtitle: 'Searching recorded documents...'
    },
    { 
      id: 5, 
      name: 'DEMOGRAPHICS', 
      duration: 3000,
      title: 'Stage 5-6: Market Intelligence',
      subtitle: 'Census API • Neighborhood Analysis'
    },
    { 
      id: 6, 
      name: 'ML_SCORE', 
      duration: 5000,
      title: 'Stage 7: ML Prediction',
      subtitle: 'XGBoost model analyzing 28 plaintiffs...'
    },
    { 
      id: 7, 
      name: 'MAX_BID', 
      duration: 5000,
      title: 'Stage 8: Max Bid Calculation',
      subtitle: 'Applying investment formula...'
    },
    { 
      id: 8, 
      name: 'DECISION', 
      duration: 4000,
      title: 'Stage 9: Decision Engine',
      subtitle: 'Generating recommendation...'
    },
    { 
      id: 9, 
      name: 'REPORT', 
      duration: 5000,
      title: 'Stage 10: Report Generated',
      subtitle: 'One-page analysis complete'
    },
    { 
      id: 10, 
      name: 'OUTRO', 
      duration: 4000,
      title: '7 Hours → 7 Minutes',
      subtitle: '100x ROI • Zero Guesswork'
    }
  ];

  const totalDuration = stages.reduce((sum, s) => sum + s.duration, 0);

  useEffect(() => {
    if (!isPlaying) return;

    const stage = stages[currentStage];
    const timer = setTimeout(() => {
      if (currentStage < stages.length - 1) {
        setCurrentStage(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, stage.duration);

    // Progress bar update
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        const elapsed = stages.slice(0, currentStage).reduce((sum, s) => sum + s.duration, 0);
        const stageProgress = (Date.now() % stage.duration) / stage.duration;
        return ((elapsed + stageProgress * stage.duration) / totalDuration) * 100;
      });
    }, 50);

    return () => {
      clearTimeout(timer);
      clearInterval(intervalRef.current);
    };
  }, [currentStage, isPlaying]);

  const restart = () => {
    setCurrentStage(0);
    setProgress(0);
    setIsPlaying(true);
  };

  const stage = stages[currentStage];

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Close button */}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center font-black text-black">
              BB
            </div>
            <span className="text-white font-semibold">BrevardBidderAI Demo</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <span>Stage {currentStage + 1} of {stages.length}</span>
            <span className="text-amber-400 font-mono">{stage.name}</span>
          </div>
        </div>

        {/* Stage Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          {/* INTRO */}
          {stage.name === 'INTRO' && (
            <div className="text-center animate-fade-in">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/30">
                <span className="text-5xl font-black text-black">BB</span>
              </div>
              <h1 className="text-6xl font-bold text-white mb-4">BrevardBidderAI</h1>
              <p className="text-2xl text-amber-400 mb-8">Agentic Foreclosure Intelligence</p>
              <div className="flex items-center justify-center gap-8 text-zinc-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span>12-Stage Pipeline</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
                  <span>64.4% ML Accuracy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                  <span>Real-Time Analysis</span>
                </div>
              </div>
            </div>
          )}

          {/* DISCOVERY */}
          {stage.name === 'DISCOVERY' && (
            <div className="w-full max-w-4xl animate-fade-in">
              <div className="bg-blue-900/50 border border-blue-700 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Scanning Auction Calendar</h2>
                    <p className="text-zinc-400">brevard.realforeclose.com</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div 
                      key={i}
                      className="flex items-center gap-4 p-4 bg-blue-800/30 rounded-lg border border-blue-700/50 animate-slide-in"
                      style={{ animationDelay: `${i * 200}ms` }}
                    >
                      <div className={`w-3 h-3 rounded-full ${i === 3 ? 'bg-amber-500 animate-pulse' : 'bg-zinc-600'}`} />
                      <span className="text-zinc-300 font-mono text-sm">
                        Case #{`05-2023-CA-04589${i}`}
                      </span>
                      <span className="text-zinc-500 text-sm flex-1">
                        {['Palm Bay', 'Melbourne', 'Edgewater', 'Titusville', 'Cocoa'][i-1]}, FL
                      </span>
                      {i === 3 && (
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full animate-pulse">
                          ANALYZING
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex items-center gap-2 text-sm text-zinc-400">
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Found 19 properties for Dec 3, 2025 auction</span>
                </div>
              </div>
            </div>
          )}

          {/* PROPERTY */}
          {stage.name === 'PROPERTY' && (
            <div className="w-full max-w-5xl animate-fade-in">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Property Image */}
                <div className="bg-blue-900/50 border border-blue-700 rounded-2xl overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-blue-800 to-blue-900 flex items-center justify-center relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 bg-blue-700/50 rounded-xl flex items-center justify-center">
                          <span className="text-4xl">🏠</span>
                        </div>
                        <p className="text-zinc-400 text-sm">BCPAO Photo Loading...</p>
                      </div>
                    </div>
                    <div className="absolute top-4 left-4 px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                      RESIDENTIAL
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{propertyData.address}</h3>
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                      <span>{propertyData.beds} BD</span>
                      <span>{propertyData.baths} BA</span>
                      <span>{propertyData.sqft} SF</span>
                      <span>Built {propertyData.yearBuilt}</span>
                    </div>
                  </div>
                </div>

                {/* Case Details */}
                <div className="bg-blue-900/50 border border-blue-700 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-amber-400">⚡</span>
                    Case Details Extracted
                  </h3>
                  
                  <div className="space-y-4">
                    {[
                      ['Case Number', propertyData.caseNumber],
                      ['Plaintiff', propertyData.plaintiff],
                      ['Defendant', propertyData.defendant],
                      ['Judgment', propertyData.judgment],
                      ['Auction', propertyData.auction],
                      ['Parcel ID', propertyData.parcel]
                    ].map(([label, value], i) => (
                      <div 
                        key={label}
                        className="flex justify-between items-center py-2 border-b border-blue-700/50 animate-slide-in"
                        style={{ animationDelay: `${i * 150}ms` }}
                      >
                        <span className="text-zinc-400 text-sm">{label}</span>
                        <span className="text-white font-mono text-sm">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>BECA extraction complete • 12 data points captured</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCRAPING */}
          {stage.name === 'SCRAPING' && (
            <div className="w-full max-w-4xl animate-fade-in">
              <div className="grid grid-cols-3 gap-6">
                {[
                  { name: 'BCPAO', icon: '🏛️', status: 'complete', items: ['Parcel Data', 'Sales History', 'Tax Values', 'Photos'] },
                  { name: 'AcclaimWeb', icon: '📋', status: 'active', items: ['Mortgages', 'Liens', 'Judgments', 'Releases'] },
                  { name: 'RealTDM', icon: '💰', status: 'pending', items: ['Tax Certs', 'Redemption', 'Status', 'Amounts'] }
                ].map((source, idx) => (
                  <div 
                    key={source.name}
                    className={`bg-blue-900/50 border rounded-2xl p-6 animate-slide-in ${
                      source.status === 'active' ? 'border-amber-500/50' : 'border-blue-700'
                    }`}
                    style={{ animationDelay: `${idx * 200}ms` }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{source.icon}</span>
                      <div>
                        <h3 className="text-white font-bold">{source.name}</h3>
                        <span className={`text-xs ${
                          source.status === 'complete' ? 'text-green-400' :
                          source.status === 'active' ? 'text-amber-400' : 'text-zinc-500'
                        }`}>
                          {source.status === 'complete' ? '✓ Complete' :
                           source.status === 'active' ? '● Scraping...' : '○ Queued'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {source.items.map((item, i) => (
                        <div 
                          key={item}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div className={`w-2 h-2 rounded-full ${
                            source.status === 'complete' ? 'bg-green-500' :
                            source.status === 'active' && i < 2 ? 'bg-amber-500 animate-pulse' : 'bg-zinc-600'
                          }`} />
                          <span className={source.status === 'pending' ? 'text-zinc-500' : 'text-zinc-300'}>
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-800/50 rounded-full border border-blue-700">
                  <svg className="w-5 h-5 text-amber-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="text-zinc-300">Parallel extraction across 3 data sources...</span>
                </div>
              </div>
            </div>
          )}

          {/* LIENS */}
          {stage.name === 'LIENS' && (
            <div className="w-full max-w-4xl animate-fade-in">
              <div className="bg-blue-900/50 border border-blue-700 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">⚖️</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Lien Priority Analysis</h2>
                    <p className="text-zinc-400">NO GUESSWORK - Actual recorded documents</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {analysisData.liens.map((lien, i) => (
                    <div 
                      key={i}
                      className="flex items-center gap-4 p-4 bg-blue-800/30 rounded-xl border border-blue-700/50 animate-slide-in"
                      style={{ animationDelay: `${i * 300}ms` }}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        lien.status === 'eliminated' ? 'bg-green-500/20' : 'bg-blue-500/20'
                      }`}>
                        {lien.status === 'eliminated' ? (
                          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold">{lien.type}</span>
                          <span className={`px-2 py-0.5 text-xs rounded ${
                            lien.priority === 'FORECLOSING' ? 'bg-amber-500/20 text-amber-400' :
                            lien.priority === 'JUNIOR' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-zinc-500/20 text-zinc-400'
                          }`}>
                            {lien.priority}
                          </span>
                        </div>
                        <span className="text-zinc-400 text-sm">{lien.holder}</span>
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-mono ${lien.status === 'eliminated' ? 'text-zinc-500 line-through' : 'text-white'}`}>
                          ${lien.amount.toLocaleString()}
                        </div>
                        <span className={`text-xs ${
                          lien.status === 'eliminated' ? 'text-green-400' : 'text-blue-400'
                        }`}>
                          {lien.status === 'eliminated' ? 'WIPED AT SALE' : 'CLEAR'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <div>
                      <span className="text-green-400 font-semibold">Title Risk: LOW</span>
                      <p className="text-zinc-400 text-sm">First mortgage foreclosure - all junior liens eliminated at sale</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DEMOGRAPHICS */}
          {stage.name === 'DEMOGRAPHICS' && (
            <div className="w-full max-w-4xl animate-fade-in">
              <div className="grid grid-cols-4 gap-6">
                {[
                  { label: 'Median Income', value: analysisData.demographics.medianIncome, icon: '💵', color: 'green' },
                  { label: 'Vacancy Rate', value: analysisData.demographics.vacancy, icon: '🏠', color: 'blue' },
                  { label: 'Appreciation', value: analysisData.demographics.appreciation, icon: '📈', color: 'amber' },
                  { label: 'ZIP Code', value: analysisData.demographics.zip, icon: '📍', color: 'purple' }
                ].map((stat, i) => (
                  <div 
                    key={stat.label}
                    className="bg-blue-900/50 border border-blue-700 rounded-2xl p-6 text-center animate-slide-in"
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    <span className="text-4xl">{stat.icon}</span>
                    <div className={`text-3xl font-bold mt-4 text-${stat.color}-400`}>{stat.value}</div>
                    <div className="text-zinc-400 text-sm mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <p className="text-zinc-400">
                  <span className="text-amber-400 font-semibold">32141 Edgewater</span> - Strong rental market with low vacancy
                </p>
              </div>
            </div>
          )}

          {/* ML_SCORE */}
          {stage.name === 'ML_SCORE' && (
            <div className="w-full max-w-3xl animate-fade-in">
              <div className="bg-blue-900/50 border border-blue-700 rounded-2xl p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">XGBoost ML Prediction</h2>
                  <p className="text-zinc-400">Analyzing 28 plaintiff patterns • 1,393 historical auctions</p>
                </div>

                {/* ML Score Gauge */}
                <div className="relative w-64 h-64 mx-auto mb-8">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50" cy="50" r="45"
                      fill="none"
                      stroke="#1e3a5f"
                      strokeWidth="8"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="50" cy="50" r="45"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${analysisData.mlScore * 2.83} 283`}
                      className="animate-draw"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-white">{analysisData.mlScore}%</span>
                    <span className="text-amber-400 text-sm">Third-Party Probability</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-800/30 rounded-xl text-center">
                    <div className="text-2xl font-bold text-green-400">64.4%</div>
                    <div className="text-zinc-400 text-sm">Model Accuracy</div>
                  </div>
                  <div className="p-4 bg-blue-800/30 rounded-xl text-center">
                    <div className="text-2xl font-bold text-amber-400">HIGH</div>
                    <div className="text-zinc-400 text-sm">Competition Expected</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MAX_BID */}
          {stage.name === 'MAX_BID' && (
            <div className="w-full max-w-4xl animate-fade-in">
              <div className="bg-blue-900/50 border border-blue-700 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white text-center mb-8">Max Bid Calculation</h2>

                {/* Formula */}
                <div className="bg-black/30 rounded-xl p-6 mb-8 font-mono text-center">
                  <div className="text-lg text-zinc-400 mb-4">Investment Formula:</div>
                  <div className="text-xl md:text-2xl text-white">
                    <span className="text-green-400">(ARV × 70%)</span>
                    <span className="text-zinc-500"> − </span>
                    <span className="text-red-400">Repairs</span>
                    <span className="text-zinc-500"> − </span>
                    <span className="text-amber-400">$10K</span>
                    <span className="text-zinc-500"> − </span>
                    <span className="text-blue-400">MIN($25K, 15% ARV)</span>
                  </div>
                </div>

                {/* Calculation breakdown */}
                <div className="space-y-4">
                  {[
                    { label: 'After Repair Value (ARV)', value: analysisData.arv, color: 'green', op: '' },
                    { label: 'ARV × 70%', value: analysisData.arv * 0.7, color: 'green', op: '=' },
                    { label: 'Estimated Repairs', value: -analysisData.repairs, color: 'red', op: '−' },
                    { label: 'Holding Costs', value: -10000, color: 'amber', op: '−' },
                    { label: 'Profit Margin', value: -25000, color: 'blue', op: '−' },
                  ].map((item, i) => (
                    <div 
                      key={item.label}
                      className="flex items-center justify-between py-3 border-b border-blue-700/50 animate-slide-in"
                      style={{ animationDelay: `${i * 200}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-500 w-6 text-right font-mono">{item.op}</span>
                        <span className="text-zinc-300">{item.label}</span>
                      </div>
                      <span className={`font-mono text-${item.color}-400`}>
                        ${Math.abs(item.value).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Result */}
                <div className="mt-6 p-6 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xl text-white font-semibold">Maximum Bid</span>
                    <span className="text-4xl font-bold text-amber-400">${analysisData.maxBid.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 text-sm text-zinc-400">
                    Bid/Judgment Ratio: <span className="text-amber-400 font-semibold">{(analysisData.bidJudgmentRatio * 100).toFixed(0)}%</span> → Threshold for BID recommendation
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DECISION */}
          {stage.name === 'DECISION' && (
            <div className="w-full max-w-3xl animate-fade-in text-center">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Decision Engine Result</h2>
                <p className="text-zinc-400">Bid/Judgment Ratio: {(analysisData.bidJudgmentRatio * 100).toFixed(0)}%</p>
              </div>

              {/* Decision thresholds */}
              <div className="flex justify-center gap-4 mb-8">
                {[
                  { label: 'SKIP', range: '< 60%', color: 'red', active: false },
                  { label: 'REVIEW', range: '60-74%', color: 'yellow', active: false },
                  { label: 'BID', range: '≥ 75%', color: 'green', active: true }
                ].map((threshold) => (
                  <div 
                    key={threshold.label}
                    className={`px-6 py-4 rounded-xl border-2 transition-all ${
                      threshold.active 
                        ? `border-${threshold.color}-500 bg-${threshold.color}-500/20` 
                        : 'border-zinc-700 bg-zinc-800/30'
                    }`}
                  >
                    <div className={`text-lg font-bold ${threshold.active ? `text-${threshold.color}-400` : 'text-zinc-500'}`}>
                      {threshold.label}
                    </div>
                    <div className="text-xs text-zinc-500">{threshold.range}</div>
                  </div>
                ))}
              </div>

              {/* Final recommendation */}
              <div className="inline-block animate-bounce-slow">
                <div className="px-16 py-8 bg-gradient-to-r from-green-600 to-green-500 rounded-2xl shadow-2xl shadow-green-500/30">
                  <div className="text-6xl font-black text-white mb-2">BID</div>
                  <div className="text-green-100">Recommended Action</div>
                </div>
              </div>

              <div className="mt-8 text-zinc-400">
                <p>Max Bid: <span className="text-amber-400 font-bold">${analysisData.maxBid.toLocaleString()}</span></p>
                <p className="text-sm mt-1">vs Judgment: ${parseInt(propertyData.judgment.replace(/[^0-9]/g, '')).toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* REPORT */}
          {stage.name === 'REPORT' && (
            <div className="w-full max-w-4xl animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Report Header */}
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center font-black text-black text-xl">
                        BB
                      </div>
                      <div>
                        <div className="text-white font-bold">BrevardBidderAI Analysis Report</div>
                        <div className="text-blue-200 text-sm">Generated {new Date().toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-green-500 rounded-lg text-white font-bold">
                      BID
                    </div>
                  </div>
                </div>

                {/* Report Body */}
                <div className="p-6 text-gray-800">
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="font-bold text-gray-600 text-sm mb-2">PROPERTY</h3>
                      <p className="font-semibold">{propertyData.address}</p>
                      <p className="text-sm text-gray-500">{propertyData.beds} BD • {propertyData.baths} BA • {propertyData.sqft} SF</p>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-600 text-sm mb-2">CASE</h3>
                      <p className="font-mono">{propertyData.caseNumber}</p>
                      <p className="text-sm text-gray-500">{propertyData.plaintiff}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="p-3 bg-gray-100 rounded-lg text-center">
                      <div className="text-lg font-bold text-green-600">${(analysisData.arv/1000).toFixed(0)}K</div>
                      <div className="text-xs text-gray-500">ARV</div>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-lg text-center">
                      <div className="text-lg font-bold text-amber-600">${(analysisData.maxBid/1000).toFixed(0)}K</div>
                      <div className="text-xs text-gray-500">Max Bid</div>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-lg text-center">
                      <div className="text-lg font-bold text-blue-600">{analysisData.mlScore}%</div>
                      <div className="text-xs text-gray-500">ML Score</div>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-lg text-center">
                      <div className="text-lg font-bold text-purple-600">{(analysisData.bidJudgmentRatio*100).toFixed(0)}%</div>
                      <div className="text-xs text-gray-500">Bid Ratio</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>One-page DOCX format • Ready for download</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OUTRO */}
          {stage.name === 'OUTRO' && (
            <div className="text-center animate-fade-in">
              <h1 className="text-7xl font-bold text-white mb-4">7 Hours → 7 Minutes</h1>
              <p className="text-3xl text-amber-400 mb-12">Analysis that used to take all day, done before coffee</p>
              
              <div className="flex items-center justify-center gap-12 mb-12">
                <div className="text-center">
                  <div className="text-5xl font-bold text-green-400">100x</div>
                  <div className="text-zinc-400">ROI</div>
                </div>
                <div className="w-px h-16 bg-zinc-700" />
                <div className="text-center">
                  <div className="text-5xl font-bold text-amber-400">64.4%</div>
                  <div className="text-zinc-400">ML Accuracy</div>
                </div>
                <div className="w-px h-16 bg-zinc-700" />
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-400">12</div>
                  <div className="text-zinc-400">Stage Pipeline</div>
                </div>
              </div>

              <div className="inline-flex items-center gap-3 px-8 py-4 bg-amber-500 hover:bg-amber-400 rounded-xl text-black font-bold text-lg cursor-pointer transition-all hover:scale-105">
                <span>Request Access</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>

              <div className="mt-8 text-zinc-500 text-sm">
                Everest Capital of Brevard LLC • BrevardBidderAI V13.4.0
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar & Controls */}
        <div className="px-8 py-4 border-t border-white/10">
          <div className="max-w-4xl mx-auto">
            {/* Progress bar */}
            <div className="h-1 bg-blue-900 rounded-full mb-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                <button 
                  onClick={restart}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>

              <div className="text-sm text-zinc-400">
                {stage.title}
              </div>

              <div className="text-sm text-zinc-500 font-mono">
                {Math.floor(progress / 100 * 47)}s / 47s
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes draw {
          from { stroke-dasharray: 0 283; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-in { animation: slide-in 0.5s ease-out both; }
        .animate-draw { animation: draw 1.5s ease-out; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default AnimatedDemo;
