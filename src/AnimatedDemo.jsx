import React, { useState, useEffect, useRef } from 'react';

const AnimatedDemo = ({ onClose }) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  const intervalRef = useRef(null);
  const stageIntervalRef = useRef(null);
  
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
    { id: 0, name: 'Discovery', duration: 2500, output: '19 auctions found in Brevard County' },
    { id: 1, name: 'Scraping', duration: 2000, output: 'BECA V2.0 extracted case data' },
    { id: 2, name: 'Title Search', duration: 2500, output: '47 recorded documents analyzed' },
    { id: 3, name: 'Lien Priority', duration: 2000, output: '2 liens classified (1 senior, 1 junior)' },
    { id: 4, name: 'Tax Certs', duration: 1500, output: 'No outstanding tax certificates' },
    { id: 5, name: 'Demographics', duration: 2000, output: 'ZIP 32141: A-tier market (vacancy 5.8%)' },
    { id: 6, name: 'ML Score', duration: 3000, output: 'XGBoost prediction: 78.4% confidence' },
    { id: 7, name: 'Max Bid', duration: 2500, output: `Calculated: $${analysisData.maxBid.toLocaleString()}` },
    { id: 8, name: 'Decision', duration: 2000, output: 'Ratio 78% → BID recommendation' },
    { id: 9, name: 'Report', duration: 1500, output: 'DOCX generated with BCPAO photo' },
    { id: 10, name: 'Disposition', duration: 1000, output: 'Tracking initialized' },
    { id: 11, name: 'Archive', duration: 1000, output: 'Stored to Supabase' },
  ];

  useEffect(() => {
    if (isPlaying && currentStage < stages.length) {
      setStageProgress(0);
      const stageDuration = stages[currentStage].duration;
      const progressIncrement = 100 / (stageDuration / 50);
      
      stageIntervalRef.current = setInterval(() => {
        setStageProgress(prev => Math.min(prev + progressIncrement, 100));
      }, 50);

      intervalRef.current = setTimeout(() => {
        setCurrentStage(prev => prev + 1);
        setProgress(((currentStage + 1) / stages.length) * 100);
      }, stageDuration);
    }

    return () => {
      clearTimeout(intervalRef.current);
      clearInterval(stageIntervalRef.current);
    };
  }, [currentStage, isPlaying]);

  const handleRestart = () => {
    setCurrentStage(0);
    setProgress(0);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const isComplete = currentStage >= stages.length;

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
            <span className="text-xs font-semibold text-emerald-400">
              {isComplete ? '✓ COMPLETE' : isPlaying ? '● LIVE' : '❚❚ PAUSED'}
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
              Pipeline Stages
            </div>
            <div className="space-y-1">
              {stages.map((stage, idx) => {
                const isActive = idx === currentStage;
                const isCompleted = idx < currentStage;
                const isPending = idx > currentStage;
                
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
                    <div className="text-gray-500 pl-4">Model: XGBoost v3.2 | Accuracy: 64.4%</div>
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
                {isComplete && (
                  <div className="mt-4 text-emerald-400">
                    ✓ Pipeline complete. Report generated. Archived to Supabase.
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
                  onClick={isComplete ? handleRestart : togglePlayPause}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: '#000',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                  }}
                >
                  {isComplete ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Run Again
                    </>
                  ) : isPlaying ? (
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
      </div>
    </div>
  );
};

export default AnimatedDemo;
