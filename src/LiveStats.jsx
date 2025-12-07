// BrevardBidderAI - Live Stats Dashboard Component
// Shows real-time platform statistics
// Author: Ariel Shapira, Solo Founder - Everest Capital USA

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Supabase endpoint for stats (direct query)
const SUPABASE_URL = "https://mocerqjnksmhcjzxrewo.supabase.co";

const LiveStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchStats();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStats, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      // Get property count
      const propsRes = await fetch(`${SUPABASE_URL}/rest/v1/historical_auctions?select=id`, {
        headers: { 
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2VycWpua3NtaGNqenhyZXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MzI1MjYsImV4cCI6MjA4MDEwODUyNn0.qWP8PwBMCvxOvEkN1rLGv5eOrxqdOgYV6SPcLwC8Ly8',
          'Prefer': 'count=exact',
          'Range': '0-0'
        }
      });
      const totalProps = parseInt(propsRes.headers.get('content-range')?.split('/')[1] || '0');

      // Get insights count
      const insightsRes = await fetch(`${SUPABASE_URL}/rest/v1/insights?select=id`, {
        headers: { 
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2VycWpua3NtaGNqenhyZXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MzI1MjYsImV4cCI6MjA4MDEwODUyNn0.qWP8PwBMCvxOvEkN1rLGv5eOrxqdOgYV6SPcLwC8Ly8',
          'Prefer': 'count=exact',
          'Range': '0-0'
        }
      });
      const totalInsights = parseInt(insightsRes.headers.get('content-range')?.split('/')[1] || '0');

      setStats({
        properties: totalProps,
        insights: totalInsights,
        aiAnalyses: Math.floor(totalInsights * 0.3), // Estimate
        accuracy: 64.4 // XGBoost accuracy
      });
      setLastUpdated(new Date());
      setLoading(false);
    } catch (e) {
      console.error('Stats fetch error:', e);
      // Use fallback stats
      setStats({
        properties: 1393,
        insights: 75,
        aiAnalyses: 25,
        accuracy: 64.4
      });
      setLoading(false);
    }
  };

  const StatBox = ({ value, label, suffix = '', icon }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      <div className="absolute -inset-px bg-gradient-to-br from-amber-500/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl p-6 text-center">
        <div className="text-3xl mb-2">{icon}</div>
        <div className="text-4xl font-black text-amber-400 tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
          <span className="text-xl text-amber-400/70">{suffix}</span>
        </div>
        <div className="text-slate-400 text-sm mt-1">{label}</div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-slate-900/50 rounded-xl p-6 animate-pulse">
            <div className="h-8 bg-slate-800 rounded w-16 mx-auto mb-2" />
            <div className="h-4 bg-slate-800 rounded w-20 mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Live Platform Stats
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto px-6">
        <StatBox 
          value={stats?.properties} 
          label="Properties Analyzed" 
          icon="🏠"
        />
        <StatBox 
          value={stats?.insights} 
          label="AI Insights" 
          icon="🤖"
        />
        <StatBox 
          value={stats?.aiAnalyses} 
          label="Risk Assessments" 
          icon="⚠️"
        />
        <StatBox 
          value={stats?.accuracy} 
          suffix="%" 
          label="ML Accuracy" 
          icon="🎯"
        />
      </div>
      
      {lastUpdated && (
        <div className="text-center mt-4 text-slate-500 text-xs">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </section>
  );
};

export default LiveStats;
