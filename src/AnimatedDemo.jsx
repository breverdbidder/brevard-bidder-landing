// AnimatedDemo.jsx - V3.1.0 SIMPLIFIED
// BrevardBidderAI 12-Stage Pipeline Visualization
// Built by Ariel Shapira - Solo Founder
// Real Estate Developer & Founder, Everest Capital USA
// © 2025 All Rights Reserved - Proprietary IP

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 12-Stage Pipeline Definition
const PIPELINE_STAGES = [
  { id: 1, name: 'Discovery', emoji: '🔍', description: 'Scan auction calendars', detail: 'RealForeclose API integration', duration: 800 },
  { id: 2, name: 'Scraping', emoji: '📥', description: 'Extract property data', detail: 'BCPAO, AcclaimWeb, RealTDM', duration: 1200 },
  { id: 3, name: 'Title Search', emoji: '📋', description: 'Chain of title analysis', detail: 'Official Records search', duration: 1500 },
  { id: 4, name: 'Lien Priority', emoji: '⚖️', description: 'Senior lien detection', detail: 'HOA vs Mortgage analysis', duration: 1200 },
  { id: 5, name: 'Tax Certs', emoji: '📜', description: 'Tax certificate check', detail: 'RealTDM integration', duration: 800 },
  { id: 6, name: 'Demographics', emoji: '👥', description: 'Neighborhood analysis', detail: 'Census API data', duration: 900 },
  { id: 7, name: 'ML Score', emoji: '🧠', description: 'AI prediction model', detail: '64.4% accuracy XGBoost', duration: 600 },
  { id: 8, name: 'Max Bid', emoji: '💰', description: 'Calculate optimal bid', detail: '(ARV×70%)-Repairs-$10K', duration: 500 },
  { id: 9, name: 'Decision', emoji: '✅', description: 'BID/REVIEW/SKIP', detail: 'Automated recommendation', duration: 400 },
  { id: 10, name: 'Report', emoji: '📊', description: 'Generate DOCX report', detail: 'One-page analysis', duration: 700 },
  { id: 11, name: 'Disposition', emoji: '🎯', description: 'Exit strategy mapping', detail: 'Flip, Hold, Wholesale', duration: 500 },
  { id: 12, name: 'Archive', emoji: '🗄️', description: 'Store to database', detail: 'Supabase persistence', duration: 400 }
];

// Sample property data
const PROPERTY_DATA = {
  address: '1234 Palm Bay Rd, Melbourne, FL 32935',
  caseNumber: '2024-CA-012345',
  judgment: '$187,500',
  arv: '$285,000',
  repairs: '$35,000',
  maxBid: '$129,500',
  recommendation: 'BID',
  mlScore: '73%'
};

// Terminal Line Component
const TerminalLine = ({ text, type, isNew }) => {
  const colors = {
    info: 'text-blue-300',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    error: 'text-red-400'
  };
  
  return (
    <motion.div
      initial={isNew ? { opacity: 0, x: -10 } : false}
      animate={{ opacity: 1, x: 0 }}
      className={`font-mono text-sm ${colors[type] || colors.info}`}
    >
      {text}
    </motion.div>
  );
};

// Stage Card Component
const StageCard = ({ stage, isActive, isComplete }) => {
  return (
    <div className={`p-3 rounded-lg border transition-all duration-300 ${
      isActive 
        ? 'bg-amber-500/20 border-amber-500 scale-105 shadow-lg shadow-amber-500/20' 
        : isComplete 
          ? 'bg-emerald-500/10 border-emerald-500/30' 
          : 'bg-blue-900/30 border-blue-700/30'
    }`}>
      <div className="text-2xl mb-1">{stage.emoji}</div>
      <div className={`text-xs font-semibold ${isActive ? 'text-amber-400' : isComplete ? 'text-emerald-400' : 'text-blue-300'}`}>
        {stage.id}. {stage.name}
      </div>
      {(isActive || isComplete) && (
        <div className="text-xs text-blue-400/60 mt-1">{stage.detail}</div>
      )}
      {isActive && (
        <div className="mt-2 h-1 bg-blue-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-amber-500"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: stage.duration / 1000, ease: 'linear' }}
          />
        </div>
      )}
    </div>
  );
};

// Main Component
export default function AnimatedDemo({ onClose }) {
  const [phase, setPhase] = useState('intro'); // 'intro' | 'pipeline' | 'complete'
  const [currentStage, setCurrentStage] = useState(0);
  const [terminalLines, setTerminalLines] = useState([]);
  const [totalTime, setTotalTime] = useState(0);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Pipeline progression
  useEffect(() => {
    if (phase !== 'pipeline') return;
    
    // Start timer on first stage
    if (currentStage === 0 && !startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    if (currentStage >= PIPELINE_STAGES.length) {
      // Calculate total time
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      setTotalTime(elapsed);
      
      // Add completion lines
      setTerminalLines(prev => [...prev, 
        { text: '═══════════════════════════════════════', type: 'info' },
        { text: '✅ PIPELINE COMPLETE - 12/12 stages', type: 'success' },
        { text: `⏱️ Total time: ${elapsed} seconds`, type: 'success' },
        { text: `📊 Recommendation: ${PROPERTY_DATA.recommendation}`, type: 'success' }
      ]);
      
      // Go to completion screen
      timerRef.current = setTimeout(() => setPhase('complete'), 2000);
      return;
    }

    const stage = PIPELINE_STAGES[currentStage];
    
    // Add stage start line
    setTerminalLines(prev => [...prev, {
      text: `[${stage.id}/12] ${stage.emoji} ${stage.name}: ${stage.description}...`,
      type: 'info'
    }]);

    // After duration, mark complete and go to next
    timerRef.current = setTimeout(() => {
      setTerminalLines(prev => [...prev, {
        text: `  ✓ ${stage.detail}`,
        type: 'success'
      }]);
      
      // Small delay then next stage
      setTimeout(() => {
        setCurrentStage(prev => prev + 1);
      }, 200);
    }, stage.duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, currentStage]);

  // Start the pipeline
  const handleStart = () => {
    setCurrentStage(0);
    startTimeRef.current = null;
    setTerminalLines([
      { text: '╔═══════════════════════════════════════╗', type: 'info' },
      { text: '║  BrevardBidderAI V13.4.0              ║', type: 'info' },
      { text: '║  12-Stage Foreclosure Pipeline        ║', type: 'info' },
      { text: '╚═══════════════════════════════════════╝', type: 'info' },
      { text: '', type: 'info' },
      { text: `📍 Property: ${PROPERTY_DATA.address}`, type: 'info' },
      { text: `📋 Case: ${PROPERTY_DATA.caseNumber}`, type: 'info' },
      { text: `💵 Judgment: ${PROPERTY_DATA.judgment}`, type: 'info' },
      { text: '', type: 'info' },
      { text: '▶ Starting pipeline...', type: 'warning' },
      { text: '', type: 'info' }
    ]);
    setPhase('pipeline');
  };

  // Restart demo
  const handleRestart = () => {
    setPhase('intro');
    setCurrentStage(0);
    setTerminalLines([]);
    setTotalTime(0);
    startTimeRef.current = null;
  };

  // ============ INTRO SCREEN ============
  if (phase === 'intro') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.95)' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-blue-800 hover:bg-blue-700 transition-colors z-50"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-2xl rounded-2xl overflow-hidden p-10 text-center"
          style={{
            background: 'linear-gradient(145deg, rgba(15, 35, 60, 0.98) 0%, rgba(5, 15, 35, 0.98) 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 100px rgba(245, 158, 11, 0.1)'
          }}
        >
          {/* Top accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500" />
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-emerald-400 text-sm font-medium">Agentic AI Ecosystem • V13.4.0</span>
          </div>

          {/* Title */}
          <h2 className="text-4xl font-bold text-white mb-2">
            BrevardBidder<span className="text-amber-400">AI</span>
          </h2>
          <p className="text-lg text-blue-300 mb-8">
            12-Stage Foreclosure Analysis Pipeline
          </p>

          {/* Animated icon */}
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-amber-500/20 to-emerald-500/20 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="text-5xl"
            >
              🏠
            </motion.div>
          </div>

          {/* Quote */}
          <p className="text-xl text-blue-200 italic mb-4">
            "I built this because I was tired of guessing at auctions."
          </p>
          
          {/* Tagline */}
          <p className="text-blue-300/80 mb-8">
            Agentic AI for USA distressed asset auctions.{' '}
            <span className="text-emerald-400 font-semibold">For everyone. Everywhere.</span>
          </p>

          {/* CTA Button */}
          <motion.button
            onClick={handleStart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 mx-auto"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#000'
            }}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch 12-Stage Pipeline
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </motion.button>

          {/* Footer */}
          <p className="mt-8 text-sm text-blue-500">
            Built by <span className="text-blue-300">Ariel Shapira</span> • Solo Founder • For investors everywhere
          </p>
        </motion.div>
      </motion.div>
    );
  }

  // ============ COMPLETION SCREEN ============
  if (phase === 'complete') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.95)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-blue-800 hover:bg-blue-700 transition-colors z-50"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="relative w-full max-w-2xl rounded-2xl overflow-hidden p-10 text-center"
          style={{
            background: 'linear-gradient(145deg, rgba(15, 35, 60, 0.98) 0%, rgba(5, 15, 35, 0.98) 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500" />

          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center"
          >
            <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-2">Pipeline Complete!</h2>
          <p className="text-blue-300 mb-6">12 stages processed in {totalTime} seconds</p>

          {/* Property Results */}
          <div className="bg-blue-900/30 rounded-xl p-6 mb-6 text-left">
            <h3 className="text-amber-400 font-semibold mb-4">📍 {PROPERTY_DATA.address}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-400">ARV:</span>
                <span className="text-white ml-2">{PROPERTY_DATA.arv}</span>
              </div>
              <div>
                <span className="text-blue-400">Repairs:</span>
                <span className="text-white ml-2">{PROPERTY_DATA.repairs}</span>
              </div>
              <div>
                <span className="text-blue-400">Max Bid:</span>
                <span className="text-emerald-400 ml-2 font-semibold">{PROPERTY_DATA.maxBid}</span>
              </div>
              <div>
                <span className="text-blue-400">ML Score:</span>
                <span className="text-white ml-2">{PROPERTY_DATA.mlScore}</span>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-block px-8 py-4 rounded-xl mb-6"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            }}
          >
            <span className="text-2xl font-black text-black">✅ {PROPERTY_DATA.recommendation}</span>
          </motion.div>

          <p className="text-blue-300/80 mb-8">
            Professional-grade intelligence.{' '}
            <span className="text-emerald-400 font-semibold">For everyone. Everywhere.</span>
          </p>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <motion.button
              onClick={handleRestart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-xl font-semibold bg-blue-800 text-white hover:bg-blue-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Run Again
            </motion.button>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-xl font-semibold"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#000'
              }}
            >
              Join Waitlist
            </motion.button>
          </div>

          <p className="mt-8 text-sm text-blue-500">
            © 2025 Ariel Shapira • BrevardBidderAI V13.4.0
          </p>
        </motion.div>
      </motion.div>
    );
  }

  // ============ PIPELINE SCREEN ============
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.95)' }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-blue-800 hover:bg-blue-700 transition-colors z-50"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div
        className="relative w-full max-w-6xl rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(15, 35, 60, 0.98) 0%, rgba(5, 15, 35, 0.98) 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-800/50">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-blue-300 text-sm font-mono">brevard-bidder-ai.sh</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-blue-400 text-sm">
              Stage {Math.min(currentStage + 1, 12)} of 12
            </span>
            <div className="w-40 h-2 rounded-full bg-blue-900 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #22c55e 0%, #f59e0b 100%)' }}
                animate={{ width: `${((currentStage) / 12) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Left: Pipeline Stages */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              ⚡ 12-Stage Pipeline
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {PIPELINE_STAGES.map((stage, index) => (
                <StageCard
                  key={stage.id}
                  stage={stage}
                  isActive={index === currentStage}
                  isComplete={index < currentStage}
                />
              ))}
            </div>
          </div>

          {/* Right: Terminal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Pipeline Output</h3>
            <div className="bg-blue-950 rounded-lg p-4 h-80 overflow-y-auto font-mono text-sm">
              {terminalLines.map((line, i) => (
                <TerminalLine
                  key={i}
                  text={line.text}
                  type={line.type}
                  isNew={i === terminalLines.length - 1}
                />
              ))}
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="inline-block w-2 h-4 bg-amber-500 ml-1"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-blue-800/50">
          <p className="text-xs text-blue-500">© 2025 Ariel Shapira • BrevardBidderAI V13.4.0</p>
          <p className="text-xs text-blue-400">Processing: {PROPERTY_DATA.address}</p>
        </div>
      </div>
    </motion.div>
  );
}
