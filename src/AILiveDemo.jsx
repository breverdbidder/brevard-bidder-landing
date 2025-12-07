// BrevardBidderAI - AI Live Demo Component
// Shows real-time Fara V8 AI analysis
// Author: Ariel Shapira, Solo Founder - Everest Capital USA

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Fara V8 Endpoints
const FARA_HEALTH = "https://brevardbidderai--brevardbidderai-fara-v8-health.modal.run";
const FARA_ANALYZE = "https://brevardbidderai--brevardbidderai-fara-v8-analyze.modal.run";

// Sample properties for demo
const DEMO_PROPERTIES = [
  {
    address: "123 Ocean Blvd, Melbourne Beach FL 32951",
    case_number: "05-2025-CA-DEMO-001",
    judgment_amount: 285000,
    context: "Market Value: $340,000 | Plaintiff: Wells Fargo"
  },
  {
    address: "456 Riverside Dr, Cocoa FL 32922",
    case_number: "05-2025-CA-DEMO-002", 
    judgment_amount: 175000,
    context: "Market Value: $210,000 | Plaintiff: US Bank"
  },
  {
    address: "789 Palm Ave, Titusville FL 32780",
    case_number: "05-2025-CA-DEMO-003",
    judgment_amount: 142000,
    context: "Market Value: $185,000 | Plaintiff: Rocket Mortgage"
  }
];

const AILiveDemo = () => {
  const [isHealthy, setIsHealthy] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check health on mount
  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const response = await fetch(FARA_HEALTH);
      const data = await response.json();
      setIsHealthy(data.status === "healthy");
    } catch (e) {
      setIsHealthy(false);
    }
  };

  const runAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    const prop = DEMO_PROPERTIES[selectedProperty];

    try {
      const response = await fetch(FARA_ANALYZE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_address: prop.address,
          case_number: prop.case_number,
          judgment_amount: prop.judgment_amount,
          context: prop.context
        })
      });

      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setAnalysis(data);
      }
    } catch (e) {
      setError("Failed to connect to AI service");
    } finally {
      setIsLoading(false);
    }
  };

  // Extract risk level from analysis
  const getRiskLevel = (analysisText) => {
    if (!analysisText) return null;
    const upper = analysisText.toUpperCase();
    if (upper.includes("HIGH")) return { level: "HIGH", color: "text-red-400", bg: "bg-red-500/20" };
    if (upper.includes("LOW")) return { level: "LOW", color: "text-green-400", bg: "bg-green-500/20" };
    return { level: "MEDIUM", color: "text-amber-400", bg: "bg-amber-500/20" };
  };

  const risk = analysis ? getRiskLevel(analysis.analysis) : null;

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-5" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
            <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-amber-400 text-sm font-medium">
              {isHealthy === null ? 'Checking...' : isHealthy ? 'AI System Online' : 'AI System Offline'}
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Clash Display, sans-serif' }}>
            Live AI Analysis Demo
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Watch our TinyLlama AI analyze a foreclosure property in real-time. 
            Running on Tesla T4 GPU via Modal.
          </p>
        </motion.div>

        {/* Demo Interface */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden"
        >
          {/* Property Selector */}
          <div className="border-b border-slate-800 p-6">
            <label className="block text-sm text-slate-400 mb-3">Select Demo Property</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {DEMO_PROPERTIES.map((prop, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedProperty(idx)}
                  className={`p-4 rounded-xl text-left transition-all ${
                    selectedProperty === idx 
                      ? 'bg-amber-500/20 border-2 border-amber-500/50' 
                      : 'bg-slate-800/50 border-2 border-transparent hover:border-slate-700'
                  }`}
                >
                  <div className="text-white font-medium text-sm mb-1 truncate">
                    {prop.address.split(',')[0]}
                  </div>
                  <div className="text-slate-400 text-xs">
                    Judgment: ${prop.judgment_amount.toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Analysis Panel */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white font-semibold">{DEMO_PROPERTIES[selectedProperty].address}</h3>
                <p className="text-slate-400 text-sm">{DEMO_PROPERTIES[selectedProperty].context}</p>
              </div>
              <button
                onClick={runAnalysis}
                disabled={isLoading || !isHealthy}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  isLoading || !isHealthy
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 hover:shadow-lg hover:shadow-amber-500/25'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  '🤖 Run AI Analysis'
                )}
              </button>
            </div>

            {/* Results */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400"
                >
                  {error}
                </motion.div>
              )}

              {analysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Risk Badge */}
                  {risk && (
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${risk.bg}`}>
                      <span className={`text-sm font-bold ${risk.color}`}>
                        Risk Level: {risk.level}
                      </span>
                    </div>
                  )}

                  {/* Analysis Text */}
                  <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-amber-400">🤖</span>
                      <span className="text-slate-300 text-sm font-medium">Fara V8 Analysis</span>
                      <span className="text-slate-500 text-xs">({analysis.model})</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {analysis.analysis}
                    </p>
                  </div>

                  {/* Model Info */}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>Model: {analysis.model}</span>
                    <span>•</span>
                    <span>Version: {analysis.version}</span>
                    <span>•</span>
                    <span>GPU: Tesla T4</span>
                  </div>
                </motion.div>
              )}

              {!analysis && !error && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-slate-500"
                >
                  <p>Click "Run AI Analysis" to see the AI in action</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <p className="text-slate-500 text-sm">
            Powered by <span className="text-slate-400">TinyLlama-1.1B</span> on 
            <span className="text-slate-400"> Modal</span> • 
            <span className="text-slate-400"> Tesla T4 GPU</span> • 
            <span className="text-slate-400"> ~15s inference</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AILiveDemo;
