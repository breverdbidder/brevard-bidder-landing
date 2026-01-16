// BidDeed.AI - Premium Landing Page
// Vibe Coding Best Practices: Shadcn + Tailwind + Inter/Geist + Animations
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import dynamic from 'next/dynamic';

// Dynamic import for AnimatedDemo (avoid SSR issues)
const AnimatedDemo = dynamic(() => import('../src/AnimatedDemo'), { ssr: false });

// ============================================================
// DESIGN SYSTEM CONSTANTS
// ============================================================
const COLORS = {
  bid: '#22c55e',
  review: '#f59e0b', 
  skip: '#ef4444',
  primary: '#3b82f6',
  dark: '#18181b',
};

// ============================================================
// MAIN APP COMPONENT
// ============================================================
export default function BidDeed.AI() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      const response = await fetch('/api/auctions');
      const data = await response.json();
      setAuctions(data.auctions || []);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  // Calculate stats
  const stats = {
    total: auctions.length,
    bid: auctions.filter(a => a.recommendation === 'BID').length,
    review: auctions.filter(a => a.recommendation === 'REVIEW').length,
    skip: auctions.filter(a => a.recommendation === 'SKIP').length,
    totalJudgment: auctions.reduce((sum, a) => sum + (a.judgment_amount || 0), 0),
  };

  const pieData = [
    { name: 'BID', value: stats.bid, color: COLORS.bid },
    { name: 'REVIEW', value: stats.review, color: COLORS.review },
    { name: 'SKIP', value: stats.skip, color: COLORS.skip },
  ].filter(d => d.value > 0);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-neutral-950' : 'bg-neutral-50'}`}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
        
        /* Smooth animations */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse { animation: pulse 2s ease-in-out infinite; }
        
        /* Gradient text */
        .gradient-text {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        /* Glass morphism */
        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        /* Hover lift effect */
        .hover-lift {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.3);
        }
      `}</style>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">BidDeed.AI</h1>
                <p className="text-neutral-400 text-xs">Agentic AI Ecosystem</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {['dashboard', 'auctions', 'analytics'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab 
                      ? 'bg-blue-600 text-white' 
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </nav>

      {/* AnimatedDemo Modal */}
      {showDemo && (
        <AnimatedDemo onClose={() => setShowDemo(false)} />
      )}

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-neutral-950"></div>
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-blue-300 text-sm font-medium">Agentic AI Ecosystem</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            <span className="gradient-text">BidDeed.AI</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-neutral-300 mb-4 max-w-3xl mx-auto">
            12-Stage Foreclosure Auction Intelligence Pipeline
          </p>
          
          <p className="text-neutral-400 mb-8 max-w-2xl mx-auto">
            Built by <span className="text-blue-400">Ariel Shapira</span> • Solo Founder, Everest Capital USA
            <br/>
            <span className="text-emerald-400">64.4% ML Accuracy</span> • <span className="text-amber-400">100x ROI</span> • <span className="text-purple-400">7 Hours → 23 Seconds</span>
          </p>
          
          {/* PLAY DEMO Button - Primary CTA */}
          <button
            onClick={() => setShowDemo(true)}
            className="group relative inline-flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-red-600 to-red-700 text-white font-black text-2xl rounded-2xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-2xl shadow-red-500/40 hover:shadow-red-500/60 hover:scale-105 border-2 border-red-400/30"
          >
            {/* Play Icon */}
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <div className="text-left">
              <div className="text-3xl tracking-wide">PLAY DEMO</div>
              <div className="text-sm font-normal text-red-200">See the 12-Stage AI Pipeline in Action</div>
            </div>
          </button>
          
          <p className="mt-6 text-neutral-400 text-sm">
            ⏱️ 47 seconds • Real Brevard County auction data • Interactive walkthrough
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Properties"
            value={stats.total}
            icon="🏠"
            color="blue"
            delay={0}
          />
          <StatCard
            title="BID"
            value={stats.bid}
            icon="✅"
            color="green"
            delay={100}
          />
          <StatCard
            title="REVIEW"
            value={stats.review}
            icon="⚠️"
            color="amber"
            delay={200}
          />
          <StatCard
            title="SKIP"
            value={stats.skip}
            icon="❌"
            color="red"
            delay={300}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Properties List */}
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl p-6 animate-fadeIn" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Upcoming Auctions</h2>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                  Dec 10, 2025
                </span>
              </div>
              
              {loading ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-24 bg-neutral-800 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {auctions.slice(0, 6).map((auction, idx) => (
                    <PropertyRow key={idx} auction={auction} index={idx} />
                  ))}
                </div>
              )}
              
              {auctions.length > 6 && (
                <button className="w-full mt-4 py-3 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                  View all {auctions.length} properties →
                </button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Distribution Chart */}
            <div className="glass rounded-2xl p-6 animate-fadeIn" style={{ animationDelay: '300ms' }}>
              <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
              <div className="h-48">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#27272a', 
                        border: 'none', 
                        borderRadius: '8px',
                        color: 'white' 
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {pieData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-neutral-400 text-sm">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ML Model Stats */}
            <div className="glass rounded-2xl p-6 animate-fadeIn" style={{ animationDelay: '400ms' }}>
              <h3 className="text-lg font-semibold text-white mb-4">ML Performance</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-400">Accuracy</span>
                    <span className="text-white font-semibold">64.4%</span>
                  </div>
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: '64.4%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-400">Total Predictions</span>
                    <span className="text-white font-semibold">1,393</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-400">Plaintiffs Tracked</span>
                    <span className="text-white font-semibold">28</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass rounded-2xl p-6 animate-fadeIn" style={{ animationDelay: '500ms' }}>
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <ActionButton icon="📊" label="Generate Reports" />
                <ActionButton icon="🔍" label="Search Properties" />
                <ActionButton icon="📅" label="View Calendar" />
                <ActionButton icon="⚙️" label="Settings" />
              </div>
            </div>
          </div>
        </div>

        {/* Smart Router Stats */}
        <div className="mt-8 glass rounded-2xl p-6 animate-fadeIn" style={{ animationDelay: '600ms' }}>
          <h3 className="text-lg font-semibold text-white mb-6">Smart Router Performance</h3>
          <div className="grid grid-cols-5 gap-4">
            {[
              { tier: 'FREE', pct: 52, color: '#22c55e' },
              { tier: 'ULTRA_CHEAP', pct: 28, color: '#84cc16' },
              { tier: 'BUDGET', pct: 12, color: '#eab308' },
              { tier: 'PRODUCTION', pct: 6, color: '#f97316' },
              { tier: 'CRITICAL', pct: 2, color: '#ef4444' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#27272a" strokeWidth="4" />
                    <circle 
                      cx="32" cy="32" r="28" fill="none" 
                      stroke={item.color} strokeWidth="4"
                      strokeDasharray={`${item.pct * 1.76} 176`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                    {item.pct}%
                  </span>
                </div>
                <p className="text-neutral-400 text-xs">{item.tier}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-neutral-500 text-sm mt-4">
            Target: 90% FREE tier • Current: 52% ✅
          </p>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p className="text-neutral-500 text-sm">
            BidDeed.AI V13.4.0 • Agentic AI Ecosystem
          </p>
          <p className="text-neutral-600 text-xs mt-1">
            © 2025 Ariel Shapira, Solo Founder • Everest Capital USA
          </p>
        </div>
      </footer>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function StatCard({ title, value, icon, color, delay }) {
  const colors = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    amber: 'from-amber-500/20 to-amber-600/20 border-amber-500/30',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30',
  };
  
  return (
    <div 
      className={`
        glass rounded-2xl p-6 border
        bg-gradient-to-br ${colors[color]}
        hover-lift animate-fadeIn
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-neutral-400 text-sm">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

function PropertyRow({ auction, index }) {
  const recColors = {
    BID: 'bg-green-500/20 text-green-400 border-green-500/30',
    REVIEW: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    SKIP: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  
  return (
    <div 
      className="flex items-center gap-4 p-4 bg-neutral-900/50 rounded-xl hover:bg-neutral-800/50 transition-all duration-200 cursor-pointer hover-lift animate-fadeIn"
      style={{ animationDelay: `${(index + 3) * 100}ms` }}
    >
      {auction.photo_url ? (
        <img 
          src={auction.photo_url} 
          alt={auction.property_address}
          className="w-16 h-16 rounded-lg object-cover"
        />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-neutral-800 flex items-center justify-center text-2xl">
          🏠
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-medium truncate">
          {auction.property_address || 'Address TBD'}
        </h4>
        <p className="text-neutral-500 text-sm truncate">
          {auction.case_number}
        </p>
      </div>
      
      <div className="text-right">
        <p className="text-white font-semibold">
          ${(auction.judgment_amount || 0).toLocaleString()}
        </p>
        <p className="text-neutral-500 text-xs">Judgment</p>
      </div>
      
      <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${recColors[auction.recommendation] || recColors.REVIEW}`}>
        {auction.recommendation || 'REVIEW'}
      </span>
    </div>
  );
}

function ActionButton({ icon, label }) {
  return (
    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-neutral-300 hover:text-white hover:bg-neutral-800/50 transition-all duration-200">
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
      <span className="ml-auto text-neutral-600">→</span>
    </button>
  );
}
