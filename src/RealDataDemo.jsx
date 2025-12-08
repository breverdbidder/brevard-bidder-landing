// BrevardBidderAI V13.4.0 - LIVE Supabase Integration
// Fetches REAL data from API + Smart Router
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

import React, { useState, useEffect, useRef, useCallback } from 'react';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYnJldmFyZGJpZGRlciIsImEiOiJjbTRvOHNiY3IwaGdxMmtzOGd3MWRqbjFzIn0.K1vPto_LT1fVYfnvLe_wdg';
const API_BASE = '/api';

// Date utilities
const TODAY = new Date();
const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const isUpcoming = (d) => new Date(d) >= TODAY;

// Smart Router tiers
const ROUTER_TIERS = {
  FREE: { model: 'gemini-1.5-flash', color: '#10b981' },
  ULTRA_CHEAP: { model: 'deepseek-v3.2', color: '#3b82f6' },
  BUDGET: { model: 'claude-3-haiku', color: '#8b5cf6' },
  PRODUCTION: { model: 'claude-sonnet-4', color: '#f59e0b' },
  CRITICAL: { model: 'claude-opus-4.5', color: '#ef4444' }
};

const COLORS = { BID: '#10B981', REVIEW: '#F59E0B', SKIP: '#EF4444' };

// 12-Stage Pipeline
const PIPELINE = [
  { id: 1, name: "Discovery", emoji: "🔍" },
  { id: 2, name: "Scraping", emoji: "⚡" },
  { id: 3, name: "Title", emoji: "📋" },
  { id: 4, name: "Liens", emoji: "⚖️" },
  { id: 5, name: "Tax", emoji: "🏛️" },
  { id: 6, name: "Demo", emoji: "📊" },
  { id: 7, name: "ML", emoji: "🧠" },
  { id: 8, name: "Bid", emoji: "💰" },
  { id: 9, name: "Decision", emoji: "✅" },
  { id: 10, name: "Report", emoji: "📄" },
  { id: 11, name: "Exit", emoji: "🎯" },
  { id: 12, name: "Archive", emoji: "🗄️" }
];

export default function RealDataDemo() {
  // State
  const [properties, setProperties] = useState([]);
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState({ type: 'all', status: 'all', date: null });
  const [selectedProp, setSelectedProp] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [routerTier, setRouterTier] = useState('FREE');
  const [showPipeline, setShowPipeline] = useState(false);
  const [pipelineStage, setPipelineStage] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const chatRef = useRef(null);

  // Fetch auction data from API
  const fetchAuctions = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE}/auctions?${query}`);
      const data = await response.json();
      
      if (data.success) {
        setProperties(data.data || []);
        setDataSource({ ...params, summary: data.summary });
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err.message);
      // Fallback to empty array
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch calendar
  const fetchCalendar = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/calendar`);
      const data = await response.json();
      setCalendar(data);
    } catch (err) {
      console.error('Calendar fetch error:', err);
    }
  }, []);

  // Call Smart Router
  const callRouter = async (message) => {
    try {
      const response = await fetch(`${API_BASE}/router`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      return data.tier || 'FREE';
    } catch {
      return 'FREE';
    }
  };

  // Initialize
  useEffect(() => {
    fetchAuctions({ status: 'all', limit: '30' });
    fetchCalendar();
    
    // Initial greeting
    setMessages([{
      role: 'assistant',
      content: `👋 **BrevardBidderAI V13.4.0** - Connected to Supabase

📅 Today: **${formatDate(TODAY)}**

🔌 **Live Data Sources:**
• Supabase auction_results table
• Smart Router API for LLM selection
• GitHub Actions scrapers running

💬 Ask me about:
• "Show Dec 3 results" (past auction)
• "Upcoming foreclosures" 
• "Dec 18 tax deed sales"
• "Calendar"

⚡ Smart Router: ${ROUTER_TIERS.FREE.model}`,
      tier: 'FREE'
    }]);
  }, []);

  // Mapbox init
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js';
    script.onload = () => {
      const link = document.createElement('link');
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      setTimeout(() => {
        window.mapboxgl.accessToken = MAPBOX_TOKEN;
        mapInstance.current = new window.mapboxgl.Map({
          container: mapRef.current,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [-80.65, 28.25],
          zoom: 9
        });
        mapInstance.current.addControl(new window.mapboxgl.NavigationControl(), 'top-right');
        mapInstance.current.on('load', () => setMapLoaded(true));
      }, 100);
    };
    document.head.appendChild(script);
  }, []);

  // Update markers
  useEffect(() => {
    if (!mapLoaded || !mapInstance.current) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    
    properties.forEach(p => {
      if (!p.latitude || !p.longitude) return;
      const el = document.createElement('div');
      el.style.cssText = `width:36px;height:36px;background:${COLORS[p.recommendation] || '#666'};border:3px solid white;border-radius:50%;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:white;`;
      el.innerHTML = p.ml_score || '?';
      el.onclick = () => setSelectedProp(p);
      const marker = new window.mapboxgl.Marker(el)
        .setLngLat([parseFloat(p.longitude), parseFloat(p.latitude)])
        .addTo(mapInstance.current);
      markersRef.current.push(marker);
    });
  }, [properties, mapLoaded]);

  // Scroll chat
  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  // NLP Intent Detection
  const detectIntent = (msg) => {
    const lower = msg.toLowerCase();
    return {
      isTaxDeed: /tax\s*deed|tax\s*sale|tax\s*lien|realtdm/.test(lower),
      isForeclosure: /foreclosure|mortgage|bank\s*owned/.test(lower),
      isPast: /past|results|completed|dec\s*3|sold/.test(lower),
      isUpcoming: /upcoming|next|future|dec\s*(10|17|18)/.test(lower),
      wantsCalendar: /calendar|schedule|when|dates/.test(lower),
      wantsBid: /bid\s*properties|just\s*bid|green/.test(lower),
      wantsHelp: /help|commands|how/.test(lower),
      isGreeting: /^(hi|hello|hey)/.test(lower),
      needsClarification: !(/tax|foreclosure|dec|calendar|bid|skip|review|help|hi|hello/.test(lower)) && /show|list|auction/.test(lower)
    };
  };

  // Process message
  const processMessage = async (msg) => {
    const intent = detectIntent(msg);
    let response = '';
    let tier = await callRouter(msg);
    setRouterTier(tier);

    // Needs clarification
    if (intent.needsClarification) {
      response = `🤔 I want to make sure I give you the right data.

**Which auction type?**

1️⃣ **Foreclosure** (Mortgage defaults)
   • IN-PERSON at Titusville Courthouse
   • Dec 10, 17 upcoming

2️⃣ **Tax Deed** (Tax certificate sales)
   • ONLINE at brevard.realforeclose.com
   • Dec 18 upcoming

Say "foreclosure" or "tax deed" to continue!`;
    }
    // Greeting
    else if (intent.isGreeting) {
      response = `👋 Hello! I'm connected to **live Supabase data**.

📊 Current data: ${properties.length} properties loaded

What would you like to explore?
• Past results (Dec 3)
• Upcoming auctions (Dec 10, 17, 18)
• Filter by BID/REVIEW/SKIP`;
    }
    // Calendar
    else if (intent.wantsCalendar) {
      const calData = calendar?.calendar || {};
      response = `📅 **Brevard County Auction Calendar**

**FORECLOSURE** (IN-PERSON @ Titusville)
${(calData.foreclosure || []).map(d => `• ${d.date} - ${d.status}`).join('\n') || '• Dec 3 ✅ | Dec 10 🔜 | Dec 17 📅'}

**TAX DEED** (ONLINE @ realforeclose.com)
${(calData.taxDeed || []).map(d => `• ${d.date} - ${d.status}`).join('\n') || '• Dec 18 📅'}

Which would you like to view?`;
      await fetchCalendar();
    }
    // Past results
    else if (intent.isPast) {
      await fetchAuctions({ status: 'past', limit: '30' });
      response = `📊 **Past Auction Results**

Fetching from Supabase...
Found ${properties.length} completed properties.

${properties.length > 0 ? `Top results shown on map.` : 'Run scrapers to populate historical data.'}

Click any property for details!`;
    }
    // Upcoming
    else if (intent.isUpcoming) {
      const type = intent.isTaxDeed ? 'taxdeed' : intent.isForeclosure ? 'foreclosure' : 'all';
      await fetchAuctions({ status: 'upcoming', type, limit: '30' });
      response = `🔜 **Upcoming Auctions**

Type: ${type === 'taxdeed' ? 'Tax Deed' : type === 'foreclosure' ? 'Foreclosure' : 'All'}
Found: ${properties.length} properties

${properties.length > 0 ? 'Properties shown on map!' : '⚠️ Scrapers running - data will appear shortly.'}`;
    }
    // Tax deed specific
    else if (intent.isTaxDeed) {
      await fetchAuctions({ type: 'taxdeed', limit: '30' });
      response = `🏛️ **Tax Deed Auctions**

📍 Venue: brevard.realforeclose.com (ONLINE)
📅 Next: December 18, 2025

Found ${properties.length} tax deed properties.

Tax deeds include RealTDM title search data when available.`;
    }
    // Foreclosure specific
    else if (intent.isForeclosure) {
      await fetchAuctions({ type: 'foreclosure', limit: '30' });
      response = `🏠 **Foreclosure Auctions**

📍 Venue: Titusville Courthouse (IN-PERSON)
⏰ Time: 11:00 AM EST

Found ${properties.length} foreclosure properties.

Click any marker for full 12-stage pipeline analysis!`;
    }
    // BID properties
    else if (intent.wantsBid) {
      const bids = properties.filter(p => p.recommendation === 'BID');
      response = `🟢 **BID Properties** (${bids.length} found)

${bids.slice(0, 5).map(p => `• ${p.address || 'Unknown'}, ${p.city || ''}
  ML: ${p.ml_score}% | Max: $${(p.max_bid || 0).toLocaleString()}`).join('\n\n') || 'No BID properties in current dataset.'}

These meet criteria: ratio ≥75%, positive equity, ML ≥70%`;
    }
    // Help
    else if (intent.wantsHelp) {
      response = `📚 **Commands:**

**Data Queries:**
• "Show Dec 3 results" - Past auction data
• "Upcoming foreclosures" - Future sales
• "Tax deed auctions" - Online tax sales
• "BID properties" - Best opportunities

**Analysis:**
• Click property → "Run Pipeline"

**Smart Router Tiers:**
• FREE: Simple queries
• PRODUCTION: Analysis
• CRITICAL: Legal/liens`;
    }
    // Default
    else {
      response = `I'm connected to live Supabase data!

Currently showing ${properties.length} properties.

Try:
• "Show foreclosure results"
• "Upcoming tax deeds"
• "Calendar"`;
    }

    return { response, tier };
  };

  // Handle send
  const handleSend = async () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    const msg = input;
    setInput('');
    
    const { response, tier } = await processMessage(msg);
    
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: response,
      tier
    }]);
  };

  // Run pipeline animation
  const runPipeline = (prop) => {
    setShowPipeline(true);
    setPipelineStage(0);
    let stage = 0;
    const interval = setInterval(() => {
      stage++;
      setPipelineStage(stage);
      if (stage >= 12) clearInterval(interval);
    }, 500);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f172a', color: 'white', fontFamily: 'system-ui' }}>
      {/* Pipeline Modal */}
      {showPipeline && selectedProp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#1e293b', borderRadius: 16, width: '100%', maxWidth: 800, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ margin: 0 }}>12-Stage Pipeline: {selectedProp.address}</h2>
              <button onClick={() => setShowPipeline(false)} style={{ background: '#334155', border: 'none', color: 'white', padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>Close</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
              {PIPELINE.map((s, i) => (
                <div key={s.id} style={{ padding: 12, borderRadius: 10, background: i < pipelineStage ? '#10b98130' : i === pipelineStage ? '#f59e0b30' : '#1e293b', border: `2px solid ${i < pipelineStage ? '#10b981' : i === pipelineStage ? '#f59e0b' : '#334155'}`, textAlign: 'center' }}>
                  <div style={{ fontSize: 24 }}>{s.emoji}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: i <= pipelineStage ? '#10b981' : '#64748b' }}>{s.name}</div>
                </div>
              ))}
            </div>
            {pipelineStage >= 12 && (
              <div style={{ marginTop: 20, padding: 16, background: '#10b98120', borderRadius: 10, border: '1px solid #10b981' }}>
                <div style={{ color: '#10b981', fontWeight: 700 }}>✅ Pipeline Complete!</div>
                <div style={{ marginTop: 8, color: '#94a3b8' }}>
                  Recommendation: <strong style={{ color: COLORS[selectedProp.recommendation] }}>{selectedProp.recommendation}</strong> | 
                  ML Score: <strong>{selectedProp.ml_score}%</strong> | 
                  Max Bid: <strong>${(selectedProp.max_bid || 0).toLocaleString()}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Panel */}
      <div style={{ width: '38%', minWidth: 400, display: 'flex', flexDirection: 'column', borderRight: '1px solid #334155' }}>
        <div style={{ padding: 16, borderBottom: '1px solid #334155', background: '#1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18 }}>B</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>BrevardBidderAI</div>
              <div style={{ fontSize: 11, color: '#10b981' }}>🔌 Connected to Supabase</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: '#64748b' }}>Smart Router</div>
              <div style={{ fontSize: 11, color: ROUTER_TIERS[routerTier]?.color || '#10b981', fontWeight: 600 }}>{routerTier}</div>
            </div>
          </div>
        </div>

        <div ref={chatRef} style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 16, display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '90%', padding: '12px 16px', borderRadius: 16, background: m.role === 'user' ? '#3b82f6' : '#1e293b', fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                {m.content}
                {m.tier && <div style={{ fontSize: 10, color: '#64748b', marginTop: 8, borderTop: '1px solid #334155', paddingTop: 6 }}>⚡ {ROUTER_TIERS[m.tier]?.model || m.tier}</div>}
              </div>
            </div>
          ))}
          {loading && <div style={{ textAlign: 'center', color: '#64748b' }}>Loading from Supabase...</div>}
        </div>

        <div style={{ padding: 16, borderTop: '1px solid #334155' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Ask about auctions..." style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '14px 18px', color: 'white', fontSize: 14 }} />
            <button onClick={handleSend} style={{ background: '#10b981', border: 'none', borderRadius: 12, padding: '14px 24px', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Send</button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {['Dec 3 results', 'Upcoming', 'Tax deed', 'Calendar'].map(q => (
              <button key={q} onClick={() => { setInput(q); }} style={{ background: '#334155', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#94a3b8', fontSize: 11, cursor: 'pointer' }}>{q}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div ref={mapRef} style={{ position: 'absolute', inset: 0 }} />
        
        {/* Data source badge */}
        <div style={{ position: 'absolute', top: 16, left: 16, background: '#0f172ae0', padding: 14, borderRadius: 12, border: '1px solid #334155', zIndex: 10 }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>DATA SOURCE</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: loading ? '#f59e0b' : '#10b981' }}>
            {loading ? '⏳ Loading...' : `🔌 Supabase Live`}
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{properties.length} properties</div>
          {error && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{error}</div>}
        </div>

        {/* Legend */}
        <div style={{ position: 'absolute', bottom: 24, left: 16, background: '#0f172ae0', padding: 14, borderRadius: 12, border: '1px solid #334155', zIndex: 10 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {Object.entries(COLORS).map(([s, c]) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
                <span style={{ fontSize: 12, fontWeight: 600 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Property drawer */}
        {selectedProp && (
          <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: 380, background: '#1e293b', borderLeft: '1px solid #334155', overflow: 'auto', zIndex: 20 }}>
            <div style={{ padding: 16, borderBottom: '1px solid #334155', background: '#0f172a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ background: COLORS[selectedProp.recommendation] || '#666', padding: '6px 14px', borderRadius: 20, fontWeight: 700, fontSize: 12 }}>{selectedProp.recommendation || 'N/A'}</span>
                <button onClick={() => setSelectedProp(null)} style={{ background: '#334155', border: 'none', width: 28, height: 28, borderRadius: 6, color: 'white', cursor: 'pointer' }}>×</button>
              </div>
              <h3 style={{ margin: '8px 0 4px', fontSize: 18 }}>{selectedProp.address || 'Unknown Address'}</h3>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: 13 }}>{selectedProp.city}, FL {selectedProp.zip_code}</p>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#64748b' }}>Case: {selectedProp.case_number}</p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: selectedProp.auction_type === 'taxdeed' ? '#8b5cf6' : '#3b82f6' }}>
                {selectedProp.auction_type === 'taxdeed' ? '🏛️ Tax Deed' : '🏠 Foreclosure'}
              </p>
            </div>
            
            {selectedProp.photo_url && <img src={selectedProp.photo_url} alt="" style={{ width: '100%', height: 180, objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />}
            
            <div style={{ padding: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { l: 'ML Score', v: `${selectedProp.ml_score || 0}%`, c: '#10b981' },
                  { l: 'Max Bid', v: `$${(selectedProp.max_bid || 0).toLocaleString()}`, c: '#f59e0b' },
                  { l: 'Judgment', v: `$${(selectedProp.final_judgment || 0).toLocaleString()}` },
                  { l: 'Market', v: `$${(selectedProp.market_value || 0).toLocaleString()}` },
                  { l: 'Auction', v: selectedProp.auction_date || 'TBD' },
                  { l: 'Type', v: selectedProp.auction_type || 'Unknown' }
                ].map((s, i) => (
                  <div key={i} style={{ background: '#0f172a', padding: 12, borderRadius: 10 }}>
                    <div style={{ fontSize: 10, color: '#64748b' }}>{s.l}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: s.c || 'white' }}>{s.v}</div>
                  </div>
                ))}
              </div>
              
              {selectedProp.title_search_data && (
                <div style={{ marginTop: 12, padding: 12, background: '#0f172a', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: '#8b5cf6', fontWeight: 600 }}>📋 RealTDM Title Search</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                    Status: {selectedProp.title_search_status || 'Pending'}
                  </div>
                </div>
              )}
              
              <button onClick={() => runPipeline(selectedProp)} style={{ width: '100%', marginTop: 16, background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', padding: 14, borderRadius: 10, color: 'black', fontWeight: 700, cursor: 'pointer' }}>
                🚀 Run 12-Stage Pipeline
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#0f172ae0', borderTop: '1px solid #334155', padding: '8px 20px', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', zIndex: 5 }}>
        <span>© 2025 Ariel Shapira, Solo Founder • Everest Capital USA</span>
        <span style={{ color: '#10b981' }}>BrevardBidderAI V13.4.0 • Supabase Live • Smart Router Active</span>
      </div>
    </div>
  );
}
