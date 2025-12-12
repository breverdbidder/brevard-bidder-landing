// LangGraphDemo.jsx - V14.0.0 "Agentic AI Ecosystem" Edition
// BidDeed.AI 12-Stage LangGraph Pipeline Visualization
// Built by Ariel Shapira - Solo Founder, Everest Capital USA
// © 2025 All Rights Reserved - Proprietary IP

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============ LANGGRAPH AGENT NODES ============
const AGENT_NODES = [
  { 
    id: 'discovery', 
    name: 'Discovery Agent', 
    icon: '🔍', 
    x: 50, y: 8,
    description: 'Scans auction calendars',
    tools: ['RealForeclose API', 'BECA Scraper'],
    output: 'auction_list'
  },
  { 
    id: 'scraper', 
    name: 'Data Scraper', 
    icon: '📥', 
    x: 20, y: 22,
    description: 'Extracts property data',
    tools: ['BCPAO', 'AcclaimWeb', 'Selenium'],
    output: 'property_data'
  },
  { 
    id: 'title', 
    name: 'Title Agent', 
    icon: '📋', 
    x: 80, y: 22,
    description: 'Chain of title analysis',
    tools: ['Official Records', 'Doc Parser'],
    output: 'title_chain'
  },
  { 
    id: 'lien', 
    name: 'Lien Priority Agent', 
    icon: '⚖️', 
    x: 35, y: 38,
    description: 'Senior lien detection',
    tools: ['AcclaimWeb', 'Mortgage DB'],
    output: 'lien_analysis'
  },
  { 
    id: 'tax', 
    name: 'Tax Agent', 
    icon: '📜', 
    x: 65, y: 38,
    description: 'Tax certificate check',
    tools: ['RealTDM', 'Tax Cert API'],
    output: 'tax_status'
  },
  { 
    id: 'demographics', 
    name: 'Demographics Agent', 
    icon: '👥', 
    x: 15, y: 54,
    description: 'Neighborhood analysis',
    tools: ['Census API', 'Zillow Data'],
    output: 'demo_profile'
  },
  { 
    id: 'ml', 
    name: 'ML Predictor', 
    icon: '🧠', 
    x: 50, y: 54,
    description: 'XGBoost prediction',
    tools: ['64.4% Accuracy Model'],
    output: 'ml_score'
  },
  { 
    id: 'valuation', 
    name: 'Valuation Agent', 
    icon: '💰', 
    x: 85, y: 54,
    description: 'ARV & Max Bid calc',
    tools: ['Comp Analysis', 'Repair Est'],
    output: 'max_bid'
  },
  { 
    id: 'decision', 
    name: 'Decision Agent', 
    icon: '✅', 
    x: 35, y: 70,
    description: 'BID/REVIEW/SKIP',
    tools: ['Rule Engine', 'Risk Matrix'],
    output: 'recommendation'
  },
  { 
    id: 'report', 
    name: 'Report Generator', 
    icon: '📊', 
    x: 65, y: 70,
    description: 'DOCX generation',
    tools: ['docx-templater', 'BCPAO Photos'],
    output: 'report_file'
  },
  { 
    id: 'disposition', 
    name: 'Disposition Agent', 
    icon: '🎯', 
    x: 50, y: 84,
    description: 'Exit strategy mapping',
    tools: ['Flip/Hold/Wholesale'],
    output: 'exit_strategy'
  },
  { 
    id: 'archive', 
    name: 'Archive Agent', 
    icon: '🗄️', 
    x: 50, y: 96,
    description: 'Supabase persistence',
    tools: ['PostgreSQL', 'Vector Store'],
    output: 'stored'
  }
];

// ============ LANGGRAPH EDGES (Agent Connections) ============
const AGENT_EDGES = [
  { from: 'discovery', to: 'scraper' },
  { from: 'discovery', to: 'title' },
  { from: 'scraper', to: 'lien' },
  { from: 'title', to: 'lien' },
  { from: 'scraper', to: 'tax' },
  { from: 'title', to: 'tax' },
  { from: 'lien', to: 'demographics' },
  { from: 'lien', to: 'ml' },
  { from: 'tax', to: 'ml' },
  { from: 'tax', to: 'valuation' },
  { from: 'demographics', to: 'ml' },
  { from: 'ml', to: 'decision' },
  { from: 'valuation', to: 'decision' },
  { from: 'ml', to: 'report' },
  { from: 'decision', to: 'report' },
  { from: 'decision', to: 'disposition' },
  { from: 'report', to: 'disposition' },
  { from: 'disposition', to: 'archive' }
];

// ============ EXECUTION ORDER ============
const EXECUTION_ORDER = [
  'discovery', 'scraper', 'title', 'lien', 'tax', 
  'demographics', 'ml', 'valuation', 'decision', 
  'report', 'disposition', 'archive'
];

// Sample property for demo
const DEMO_PROPERTY = {
  address: '2847 Harmony Ln, Palm Bay, FL 32905',
  caseNumber: '2024-CA-018472',
  plaintiff: 'Lakeview Loan Servicing LLC',
  judgment: '$187,500',
  arv: '$285,000',
  repairs: '$35,000',
  maxBid: '$129,500',
  bidJudgmentRatio: '69%',
  recommendation: 'REVIEW',
  mlScore: '67.3%',
  thirdPartyProb: '34%'
};

// ============ AGENT NODE COMPONENT ============
const AgentNode = ({ node, status, isActive, progress }) => {
  const statusColors = {
    idle: 'bg-slate-800 border-slate-600',
    active: 'bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-500/30',
    complete: 'bg-emerald-500/20 border-emerald-500/50',
    error: 'bg-red-500/20 border-red-500'
  };

  return (
    <motion.div
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10`}
      style={{ left: `${node.x}%`, top: `${node.y}%` }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isActive ? 1.15 : 1, 
        opacity: 1,
        transition: { duration: 0.3 }
      }}
    >
      <div className={`
        relative p-3 rounded-xl border-2 transition-all duration-300
        ${statusColors[status]}
        ${isActive ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900' : ''}
      `}>
        {/* Pulse effect for active */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-amber-500/20"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
        
        {/* Icon */}
        <div className="text-2xl text-center mb-1">{node.icon}</div>
        
        {/* Name */}
        <div className={`text-xs font-bold text-center whitespace-nowrap
          ${status === 'active' ? 'text-amber-400' : status === 'complete' ? 'text-emerald-400' : 'text-slate-300'}
        `}>
          {node.name}
        </div>

        {/* Progress bar when active */}
        {isActive && (
          <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden w-20">
            <motion.div
              className="h-full bg-amber-500"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        )}

        {/* Checkmark for complete */}
        {status === 'complete' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"
          >
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}
      </div>

      {/* Tooltip on hover */}
      <div className="absolute left-1/2 -translate-x-1/2 mt-2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs whitespace-nowrap">
          <div className="text-slate-300">{node.description}</div>
          <div className="text-amber-400 mt-1">Tools: {node.tools.join(', ')}</div>
        </div>
      </div>
    </motion.div>
  );
};

// ============ EDGE COMPONENT (Animated Connection) ============
const Edge = ({ from, to, isActive, isComplete }) => {
  const fromNode = AGENT_NODES.find(n => n.id === from);
  const toNode = AGENT_NODES.find(n => n.id === to);
  
  if (!fromNode || !toNode) return null;

  // Calculate SVG path
  const x1 = fromNode.x;
  const y1 = fromNode.y;
  const x2 = toNode.x;
  const y2 = toNode.y;

  return (
    <g>
      {/* Base line */}
      <line
        x1={`${x1}%`}
        y1={`${y1}%`}
        x2={`${x2}%`}
        y2={`${y2}%`}
        stroke={isComplete ? '#10b981' : isActive ? '#f59e0b' : '#334155'}
        strokeWidth={isActive ? 3 : 2}
        strokeDasharray={isActive ? '8,4' : 'none'}
        className="transition-all duration-300"
      />
      
      {/* Animated particle when active */}
      {isActive && (
        <motion.circle
          r="4"
          fill="#f59e0b"
          initial={{ 
            cx: `${x1}%`, 
            cy: `${y1}%` 
          }}
          animate={{ 
            cx: `${x2}%`, 
            cy: `${y2}%` 
          }}
          transition={{ 
            duration: 0.5, 
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}
    </g>
  );
};

// ============ TERMINAL OUTPUT COMPONENT ============
const TerminalOutput = ({ lines }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div 
      ref={scrollRef}
      className="bg-slate-950 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm border border-slate-700"
    >
      {lines.map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`
            ${line.type === 'success' ? 'text-emerald-400' : ''}
            ${line.type === 'warning' ? 'text-amber-400' : ''}
            ${line.type === 'error' ? 'text-red-400' : ''}
            ${line.type === 'info' ? 'text-blue-300' : ''}
            ${line.type === 'system' ? 'text-purple-400' : ''}
            ${!line.type ? 'text-slate-400' : ''}
          `}
        >
          {line.text}
        </motion.div>
      ))}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="text-amber-400"
      >
        █
      </motion.span>
    </div>
  );
};

// ============ STATS PANEL COMPONENT ============
const StatsPanel = ({ currentAgent, completedCount, totalTime, property }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
        <div className="text-xs text-slate-400 mb-1">Current Agent</div>
        <div className="text-amber-400 font-bold truncate">
          {currentAgent ? `${currentAgent.icon} ${currentAgent.name}` : '—'}
        </div>
      </div>
      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
        <div className="text-xs text-slate-400 mb-1">Progress</div>
        <div className="text-emerald-400 font-bold">
          {completedCount}/{AGENT_NODES.length} Agents
        </div>
      </div>
      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
        <div className="text-xs text-slate-400 mb-1">Elapsed Time</div>
        <div className="text-blue-400 font-bold font-mono">
          {totalTime.toFixed(1)}s
        </div>
      </div>
      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
        <div className="text-xs text-slate-400 mb-1">ML Confidence</div>
        <div className="text-purple-400 font-bold">
          {completedCount > 6 ? property.mlScore : '—'}
        </div>
      </div>
    </div>
  );
};

// ============ MAIN LANGGRAPH DEMO COMPONENT ============
export default function LangGraphDemo({ onClose }) {
  const [phase, setPhase] = useState('intro'); // intro | running | complete
  const [currentAgentIndex, setCurrentAgentIndex] = useState(-1);
  const [agentStatuses, setAgentStatuses] = useState({});
  const [activeEdges, setActiveEdges] = useState([]);
  const [terminalLines, setTerminalLines] = useState([]);
  const [progress, setProgress] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const intervalRef = useRef(null);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Timer
  useEffect(() => {
    if (phase === 'running' && startTime) {
      intervalRef.current = setInterval(() => {
        setTotalTime((Date.now() - startTime) / 1000);
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, startTime]);

  // Agent execution simulation
  useEffect(() => {
    if (phase !== 'running') return;
    if (currentAgentIndex >= EXECUTION_ORDER.length) {
      // Complete!
      setPhase('complete');
      addTerminalLine('═══════════════════════════════════════════════', 'system');
      addTerminalLine('✅ LANGGRAPH PIPELINE COMPLETE', 'success');
      addTerminalLine(`⏱️ Total execution: ${totalTime.toFixed(1)}s`, 'success');
      addTerminalLine(`📊 Recommendation: ${DEMO_PROPERTY.recommendation}`, 'success');
      addTerminalLine(`💰 Max Bid: ${DEMO_PROPERTY.maxBid}`, 'success');
      return;
    }

    const agentId = EXECUTION_ORDER[currentAgentIndex];
    const agent = AGENT_NODES.find(n => n.id === agentId);
    
    // Set active
    setAgentStatuses(prev => ({ ...prev, [agentId]: 'active' }));
    
    // Find and activate incoming edges
    const incomingEdges = AGENT_EDGES.filter(e => e.to === agentId);
    setActiveEdges(incomingEdges.map(e => `${e.from}-${e.to}`));

    // Add terminal output
    addTerminalLine(`[${currentAgentIndex + 1}/12] ${agent.icon} ${agent.name} starting...`, 'info');
    addTerminalLine(`  └─ ${agent.description}`, 'system');

    // Progress animation
    let prog = 0;
    const progInterval = setInterval(() => {
      prog += 5;
      setProgress(Math.min(prog, 100));
      if (prog >= 100) clearInterval(progInterval);
    }, 50);

    // Complete after delay
    const delay = 800 + Math.random() * 400;
    const timeout = setTimeout(() => {
      clearInterval(progInterval);
      setProgress(0);
      setAgentStatuses(prev => ({ ...prev, [agentId]: 'complete' }));
      setActiveEdges([]);
      
      // Agent-specific output
      if (agentId === 'ml') {
        addTerminalLine(`  ✓ XGBoost prediction: ${DEMO_PROPERTY.mlScore} confidence`, 'success');
        addTerminalLine(`  ✓ Third-party probability: ${DEMO_PROPERTY.thirdPartyProb}`, 'success');
      } else if (agentId === 'valuation') {
        addTerminalLine(`  ✓ ARV: ${DEMO_PROPERTY.arv} | Repairs: ${DEMO_PROPERTY.repairs}`, 'success');
        addTerminalLine(`  ✓ Max Bid calculated: ${DEMO_PROPERTY.maxBid}`, 'success');
      } else if (agentId === 'decision') {
        addTerminalLine(`  ✓ Bid/Judgment: ${DEMO_PROPERTY.bidJudgmentRatio}`, 'success');
        addTerminalLine(`  ✓ RECOMMENDATION: ${DEMO_PROPERTY.recommendation}`, 'warning');
      } else {
        addTerminalLine(`  ✓ Output: ${agent.output}`, 'success');
      }

      setCurrentAgentIndex(prev => prev + 1);
    }, delay);

    return () => {
      clearTimeout(timeout);
      clearInterval(progInterval);
    };
  }, [phase, currentAgentIndex]);

  const addTerminalLine = (text, type) => {
    setTerminalLines(prev => [...prev, { text, type }]);
  };

  const handleStart = () => {
    setPhase('running');
    setCurrentAgentIndex(0);
    setAgentStatuses({});
    setActiveEdges([]);
    setProgress(0);
    setTotalTime(0);
    setStartTime(Date.now());
    setTerminalLines([
      { text: '╔═══════════════════════════════════════════════╗', type: 'system' },
      { text: '║  BidDeed.AI V14.0 - LangGraph Pipeline   ║', type: 'system' },
      { text: '║  Agentic AI Ecosystem for Foreclosure Intel   ║', type: 'system' },
      { text: '╚═══════════════════════════════════════════════╝', type: 'system' },
      { text: '', type: '' },
      { text: `📍 ${DEMO_PROPERTY.address}`, type: 'info' },
      { text: `📋 Case: ${DEMO_PROPERTY.caseNumber}`, type: 'info' },
      { text: `⚖️ Plaintiff: ${DEMO_PROPERTY.plaintiff}`, type: 'info' },
      { text: '', type: '' },
      { text: '▶ Initializing LangGraph orchestrator...', type: 'warning' },
      { text: '▶ Loading 12 autonomous agents...', type: 'warning' },
      { text: '', type: '' }
    ]);
  };

  const handleRestart = () => {
    setPhase('intro');
    setCurrentAgentIndex(-1);
    setAgentStatuses({});
    setActiveEdges([]);
    setTerminalLines([]);
    setProgress(0);
    setTotalTime(0);
    setStartTime(null);
  };

  const currentAgent = currentAgentIndex >= 0 && currentAgentIndex < EXECUTION_ORDER.length
    ? AGENT_NODES.find(n => n.id === EXECUTION_ORDER[currentAgentIndex])
    : null;

  const completedCount = Object.values(agentStatuses).filter(s => s === 'complete').length;

  // ============ INTRO SCREEN ============
  if (phase === 'intro') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors z-50"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="relative w-full max-w-3xl rounded-2xl overflow-hidden p-10 text-center"
          style={{
            background: 'linear-gradient(145deg, rgba(15, 35, 60, 0.98) 0%, rgba(5, 15, 35, 0.98) 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 100px rgba(245, 158, 11, 0.1)'
          }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-purple-500 to-emerald-500" />
          
          {/* LangGraph Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-6">
            <motion.span 
              className="w-2 h-2 bg-purple-500 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-purple-400 text-sm font-medium">
              Powered by LangGraph • 12 Autonomous Agents
            </span>
          </div>

          <h2 className="text-4xl font-bold text-white mb-2">
            BidDeed.AI<span className="text-amber-400">AI</span>
          </h2>
          <p className="text-xl text-blue-300 mb-6">
            Agentic AI Ecosystem for Foreclosure Intelligence
          </p>

          {/* Animated Graph Preview */}
          <div className="relative h-40 mb-8 overflow-hidden rounded-xl bg-slate-900/50 border border-slate-700">
            <svg className="absolute inset-0 w-full h-full">
              {/* Animated connecting lines */}
              {[0, 1, 2, 3, 4].map(i => (
                <motion.line
                  key={i}
                  x1={`${10 + i * 20}%`}
                  y1="30%"
                  x2={`${20 + i * 20}%`}
                  y2="70%"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: i * 0.2, repeat: Infinity, repeatDelay: 2 }}
                />
              ))}
            </svg>
            {/* Agent nodes preview */}
            {[
              { emoji: '🔍', x: 10, y: 25 },
              { emoji: '📥', x: 30, y: 25 },
              { emoji: '🧠', x: 50, y: 50 },
              { emoji: '💰', x: 70, y: 25 },
              { emoji: '✅', x: 90, y: 25 },
              { emoji: '📊', x: 25, y: 75 },
              { emoji: '🎯', x: 75, y: 75 },
            ].map((node, i) => (
              <motion.div
                key={i}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 text-2xl"
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
              >
                {node.emoji}
              </motion.div>
            ))}
          </div>

          <p className="text-lg text-blue-200 italic mb-4">
            "Watch 12 AI agents work together in real-time"
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm">
            <div className="px-4 py-2 bg-emerald-500/10 rounded-full text-emerald-400">
              ✓ 4 hours → 23 seconds
            </div>
            <div className="px-4 py-2 bg-amber-500/10 rounded-full text-amber-400">
              ✓ 64.4% ML Accuracy
            </div>
            <div className="px-4 py-2 bg-purple-500/10 rounded-full text-purple-400">
              ✓ Zero Human-in-Loop
            </div>
          </div>

          <motion.button
            onClick={handleStart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-xl text-lg shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all"
          >
            ▶ Run LangGraph Pipeline
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  // ============ RUNNING / COMPLETE SCREEN ============
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-950 overflow-hidden"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur border-b border-slate-700 flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-4">
          <div className="text-xl font-bold text-white">
            BidDeed.AI<span className="text-amber-400">AI</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-sm">
            LangGraph V14.0
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="pt-16 h-full flex">
        {/* Left: Graph Visualization */}
        <div className="flex-1 relative p-6">
          <div className="absolute inset-6 rounded-2xl bg-slate-900/50 border border-slate-700 overflow-hidden">
            {/* Grid background */}
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }}
            />
            
            {/* SVG for edges */}
            <svg className="absolute inset-0 w-full h-full">
              {AGENT_EDGES.map((edge, i) => (
                <Edge
                  key={i}
                  from={edge.from}
                  to={edge.to}
                  isActive={activeEdges.includes(`${edge.from}-${edge.to}`)}
                  isComplete={
                    agentStatuses[edge.from] === 'complete' && 
                    agentStatuses[edge.to] === 'complete'
                  }
                />
              ))}
            </svg>

            {/* Agent Nodes */}
            {AGENT_NODES.map(node => (
              <AgentNode
                key={node.id}
                node={node}
                status={agentStatuses[node.id] || 'idle'}
                isActive={currentAgent?.id === node.id}
                progress={currentAgent?.id === node.id ? progress : 0}
              />
            ))}

            {/* "LangGraph" label */}
            <div className="absolute bottom-4 left-4 text-xs text-slate-500 font-mono">
              LangGraph Orchestration • 12 Agents • Parallel Execution
            </div>
          </div>
        </div>

        {/* Right: Terminal & Stats */}
        <div className="w-96 bg-slate-900/80 border-l border-slate-700 p-6 flex flex-col">
          {/* Property Card */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-4">
            <div className="text-xs text-slate-400 mb-2">ANALYZING PROPERTY</div>
            <div className="text-white font-medium text-sm mb-1">{DEMO_PROPERTY.address}</div>
            <div className="text-slate-400 text-xs">Case: {DEMO_PROPERTY.caseNumber}</div>
            <div className="text-slate-400 text-xs">Judgment: {DEMO_PROPERTY.judgment}</div>
          </div>

          {/* Stats */}
          <StatsPanel
            currentAgent={currentAgent}
            completedCount={completedCount}
            totalTime={totalTime}
            property={DEMO_PROPERTY}
          />

          {/* Terminal */}
          <div className="flex-1 mt-4 flex flex-col">
            <div className="text-xs text-slate-400 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              EXECUTION LOG
            </div>
            <div className="flex-1">
              <TerminalOutput lines={terminalLines} />
            </div>
          </div>

          {/* Complete State Actions */}
          {phase === 'complete' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 space-y-3"
            >
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
                <div className="text-emerald-400 font-bold text-lg mb-1">
                  ✅ Pipeline Complete
                </div>
                <div className="text-sm text-slate-300">
                  Recommendation: <span className="font-bold text-amber-400">{DEMO_PROPERTY.recommendation}</span>
                </div>
                <div className="text-sm text-slate-300">
                  Max Bid: <span className="font-bold text-emerald-400">{DEMO_PROPERTY.maxBid}</span>
                </div>
              </div>
              <button
                onClick={handleRestart}
                className="w-full py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors"
              >
                🔄 Run Again
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
