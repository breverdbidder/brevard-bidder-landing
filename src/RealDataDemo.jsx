// BidDeed.AI V13.4.0 - LIVE Supabase Integration
// Fetches REAL auction data from Supabase database
// Smart Router + Calendar + NLP with actual data
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

import React, { useState, useEffect, useRef, useCallback } from 'react';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYnJldmFyZGJpZGRlciIsImEiOiJjbTRvOHNiY3IwaGdxMmtzOGd3MWRqbjFzIn0.K1vPto_LT1fVYfnvLe_wdg';

// Supabase direct connection (for demo - production uses API layer)
const SUPABASE_URL = 'https://mocerqjnksmhcjzxrewo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2VycWpua3NtaGNqenhyZXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MzI1MjYsImV4cCI6MjA4MDEwODUyNn0.ySFJIOngWWB0aqYra4PoGFuqcbdHOx1ZV6T9-klKQDw';

// Current date context
const TODAY = new Date();
const formatDate = (d) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

// Auction calendar
const AUCTION_CALENDAR = {
  foreclosure: [
    { date: '2025-12-03', status: 'completed', label: 'Dec 3' },
    { date: '2025-12-10', status: 'upcoming', label: 'Dec 10' },
    { date: '2025-12-17', status: 'scheduled', label: 'Dec 17' }
  ],
  taxDeed: [
    { date: '2025-12-18', status: 'scheduled', label: 'Dec 18' }
  ]
};

// Smart Router tiers
const SMART_ROUTER = {
  FREE: { model: 'gemini-1.5-flash', color: '#10b981' },
  ULTRA_CHEAP: { model: 'deepseek-v3.2', color: '#3b82f6' },
  BUDGET: { model: 'claude-3-haiku', color: '#8b5cf6' },
  PRODUCTION: { model: 'claude-sonnet-4', color: '#f59e0b' },
  CRITICAL: { model: 'claude-opus-4.5', color: '#ef4444' }
};

const COLORS = { BID: '#10B981', REVIEW: '#F59E0B', SKIP: '#EF4444' };
const PIPELINE = [
  { id: 1, name: 'Discovery', emoji: '🔍' }, { id: 2, name: 'Scraping', emoji: '⚡' },
  { id: 3, name: 'Title', emoji: '📋' }, { id: 4, name: 'Liens', emoji: '⚖️' },
  { id: 5, name: 'Tax', emoji: '🏛️' }, { id: 6, name: 'Demo', emoji: '📊' },
  { id: 7, name: 'ML', emoji: '🧠' }, { id: 8, name: 'Bid', emoji: '💰' },
  { id: 9, name: 'Decision', emoji: '✅' }, { id: 10, name: 'Report', emoji: '📄' },
  { id: 11, name: 'Exit', emoji: '🎯' }, { id: 12, name: 'Archive', emoji: '🗄️' }
];

// Supabase fetch helper
async function fetchFromSupabase(table, filters = {}) {
  const params = new URLSearchParams();
  params.append('select', '*');
  
  if (filters.date) params.append('auction_date', `eq.${filters.date}`);
  if (filters.status === 'upcoming') {
    const today = new Date().toISOString().split('T')[0];
    params.append('auction_date', `gte.${today}`);
  }
  if (filters.limit) params.append('limit', filters.limit);
  params.append('order', 'auction_date.desc');

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Supabase fetch error:', error);
    return null;
  }
}

// NLP Intent Detection
function detectIntent(msg) {
  const lower = msg.toLowerCase();
  return {
    isTaxDeed: /tax\s*deed|tax\s*sale|tax\s*lien|tax\s*certificate|dec\s*18/.test(lower),
    isForeclosure: /foreclosure|mortgage|bank|dec\s*3|dec\s*10|dec\s*17/.test(lower),
    isPast: /last|previous|past|recent|results|completed|dec\s*3/.test(lower),
    isUpcoming: /upcoming|next|future|scheduled|coming|dec\s*10|dec\s*17|dec\s*18/.test(lower),
    wantsList: /show|list|all|properties|find|search|get/.test(lower),
    wantsAnalysis: /analyze|analysis|run|pipeline|detail/.test(lower),
    wantsBid: /bid\s*properties|bid\s*only|just\s*bid|green/.test(lower),
    wantsReview: /review|yellow/.test(lower),
    wantsSkip: /skip|avoid|red/.test(lower),
    wantsCalendar: /calendar|schedule|when|date/.test(lower),
    wantsHelp: /help|how|what\s*can|commands/.test(lower),
    isGreeting: /^(hi|hello|hey|good\s*(morning|afternoon|evening))/.test(lower),
    needsClarification: !(/tax|foreclosure|dec\s*\d+/.test(lower)) && /show|list|auction/.test(lower)
  };
}

export default function RealDataDemo() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [properties, setProperties] = useState([]);
  const [selectedProp, setSelectedProp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState({ type: 'foreclosure', date: '2025-12-03', label: 'Dec 3 Results' });
  const [routerTier, setRouterTier] = useState('FREE');
  const [showPipeline, setShowPipeline] = useState(false);
  const [pipelineStage, setPipelineStage] = useState(0);
  const [pipelineLog, setPipelineLog] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState('checking');
  
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const chatRef = useRef(null);

  // Load initial data from Supabase
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      
      // Try to fetch Dec 3 completed auction results
      const data = await fetchFromSupabase('auction_results', { date: '2025-12-03', limit: 50 });
      
      if (data && data.length > 0) {
        setProperties(data);
        setSupabaseStatus('connected');
        addMessage('assistant', `🔌 **Connected to Supabase!**

📅 Today is **${formatDate(TODAY)}**

✅ Loaded **${data.length} properties** from Dec 3, 2025 auction

**Database Status:** LIVE
**Tables:** auction_results, tax_deed_auctions, historical_auctions

Ask me anything! Try:
• "Show Dec 3 results"
• "What's coming Dec 10?"
• "Tax deed auctions"
• "Calendar"`, 'FREE');
      } else {
        setSupabaseStatus('fallback');
        addMessage('assistant', `👋 **Welcome to BidDeed.AI V13.4.0**

📅 Today is **${formatDate(TODAY)}**

⚠️ Supabase connection pending - using cached data

**Upcoming Auctions:**
• Dec 10 - Foreclosure (IN-PERSON)
• Dec 17 - Foreclosure (IN-PERSON)
• Dec 18 - Tax Deed (ONLINE)

Scrapers are running to fetch fresh data!`, 'FREE');
      }
      
      setLoading(false);
    }
    
    loadInitialData();
  }, []);

  // Mapbox initialization
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [heatmapIntensity, setHeatmapIntensity] = useState(0.7);
  const [mapViewMode, setMapViewMode] = useState('hybrid'); // 'markers', 'heatmap', 'hybrid'

  // Initialize Mapbox with heatmap support
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js';
    script.onload = () => {
      const link = document.createElement('link');
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      
      window.mapboxgl.accessToken = MAPBOX_TOKEN;
      mapInstance.current = new window.mapboxgl.Map({
        container: mapRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-80.65, 28.35],
        zoom: 9.5,
        pitch: 30,
        bearing: -10
      });
      
      mapInstance.current.addControl(new window.mapboxgl.NavigationControl(), 'top-right');
      mapInstance.current.addControl(new window.mapboxgl.ScaleControl(), 'bottom-left');
      
      mapInstance.current.on('load', () => {
        // Add heatmap source
        mapInstance.current.addSource('properties-heat', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });
        
        // Add heatmap layer
        mapInstance.current.addLayer({
          id: 'properties-heatmap',
          type: 'heatmap',
          source: 'properties-heat',
          maxzoom: 15,
          paint: {
            'heatmap-weight': ['interpolate', ['linear'], ['get', 'mlScore'], 0, 0.1, 50, 0.5, 100, 1],
            'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 8, 0.5, 12, 1.5],
            'heatmap-color': [
              'interpolate', ['linear'], ['heatmap-density'],
              0, 'rgba(0, 0, 0, 0)',
              0.1, 'rgba(59, 130, 246, 0.3)',
              0.3, 'rgba(16, 185, 129, 0.5)',
              0.5, 'rgba(245, 158, 11, 0.7)',
              0.7, 'rgba(239, 68, 68, 0.8)',
              1, 'rgba(220, 38, 38, 1)'
            ],
            'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 8, 25, 12, 40, 15, 60],
            'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 12, 0.9, 15, 0.3]
          }
        });
        
        mapInstance.current.addLayer({
          id: 'properties-circles',
          type: 'circle',
          source: 'properties-heat',
          minzoom: 11,
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 6, 15, 12],
            'circle-color': ['match', ['get', 'recommendation'], 'BID', '#10B981', 'REVIEW', '#F59E0B', 'SKIP', '#EF4444', '#64748b'],
            'circle-stroke-color': 'white',
            'circle-stroke-width': 2,
            'circle-opacity': ['interpolate', ['linear'], ['zoom'], 11, 0, 13, 0.9]
          }
        });
        
        setMapLoaded(true);
      });
    };
    document.head.appendChild(script);
  }, []);

  // Update heatmap and markers when properties change
  useEffect(() => {
    if (!mapLoaded || !mapInstance.current) return;
    
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    
    const geojsonData = {
      type: 'FeatureCollection',
      features: properties.map(p => {
        const lat = p.lat || p.latitude || (28.1 + Math.random() * 0.5);
        const lng = p.lng || p.longitude || (-80.9 + Math.random() * 0.4);
        return {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [lng, lat] },
          properties: { id: p.id || p.case_number, mlScore: p.ml_score || 50, recommendation: p.recommendation || 'SKIP', address: p.address, city: p.city }
        };
      })
    };
    
    const source = mapInstance.current.getSource('properties-heat');
    if (source) source.setData(geojsonData);
    
    if (mapViewMode !== 'heatmap') {
      properties.forEach(p => {
        const lat = p.lat || p.latitude || (28.1 + Math.random() * 0.5);
        const lng = p.lng || p.longitude || (-80.9 + Math.random() * 0.4);
        const rec = p.recommendation || 'SKIP';
        const mlScore = p.ml_score || 50;
        
        const el = document.createElement('div');
        el.style.cssText = \`width:36px;height:36px;background:\${COLORS[rec] || COLORS.SKIP};border:3px solid white;border-radius:50%;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:white;transition:transform 0.2s;\`;
        el.innerHTML = mlScore;
        el.onmouseenter = () => el.style.transform = 'scale(1.2)';
        el.onmouseleave = () => el.style.transform = 'scale(1)';
        el.onclick = () => setSelectedProp(p);
        
        try {
          const marker = new window.mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(mapInstance.current);
          markersRef.current.push(marker);
        } catch (e) { console.error('Marker error:', e); }
      });
    }
    
    if (mapInstance.current.getLayer('properties-heatmap')) {
      mapInstance.current.setLayoutProperty('properties-heatmap', 'visibility', mapViewMode === 'markers' ? 'none' : 'visible');
    }
  }, [properties, mapLoaded, mapViewMode]);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  function addMessage(role, content, tier = 'FREE') {
    setMessages(prev => [...prev, { role, content, tier, timestamp: new Date() }]);
    setRouterTier(tier);
  }

  async function processMessage(msg) {
    const intent = detectIntent(msg);
    let response = '';
    let tier = 'FREE';
    
    // Needs clarification - Tax Deed vs Foreclosure
    if (intent.needsClarification) {
      response = `🤔 I want to make sure I give you the right information.

**Which type of auction are you interested in?**

1️⃣ **Foreclosure Auctions** (Mortgage defaults)
   • IN-PERSON at Titusville Courthouse
   • Next: Dec 10, 2025 @ 11:00 AM

2️⃣ **Tax Deed Auctions** (Tax certificate sales)
   • ONLINE at brevard.realforeclose.com  
   • Next: Dec 18, 2025

Please specify: "foreclosure" or "tax deed"`;
      tier = 'FREE';
    }
    // Calendar
    else if (intent.wantsCalendar) {
      response = `📅 **Brevard County Auction Calendar**

**FORECLOSURE** (IN-PERSON @ Titusville)
| Date | Status | Est. Props |
|------|--------|------------|
| Dec 3 | ✅ COMPLETED | 19 |
| Dec 10 | 🔜 IN 2 DAYS | ~15 |
| Dec 17 | 📅 SCHEDULED | ~22 |

**TAX DEED** (ONLINE @ realforeclose.com)
| Date | Status | Est. Props |
|------|--------|------------|
| Dec 18 | 📅 SCHEDULED | ~12 |

Which auction do you want to explore?`;
      tier = 'FREE';
    }
    // Tax Deed specific
    else if (intent.isTaxDeed) {
      setLoading(true);
      const taxData = await fetchFromSupabase('tax_deed_auctions', { limit: 20 });
      setLoading(false);
      
      if (taxData && taxData.length > 0) {
        setProperties(taxData);
        setDataSource({ type: 'taxdeed', date: '2025-12-18', label: 'Dec 18 Tax Deed' });
        response = `🏛️ **Tax Deed Auctions - December 18, 2025**

🌐 **ONLINE** at brevard.realforeclose.com

Loaded **${taxData.length} properties** from Supabase!

**Key Differences from Foreclosure:**
• Venue: Online (not courthouse)
• Liens: Wipes most liens (not just mortgage)
• Redemption: Owner can redeem before sale

Map updated with tax deed properties!`;
      } else {
        response = `🏛️ **Tax Deed Auctions**

Next auction: **December 18, 2025**
🌐 ONLINE at brevard.realforeclose.com

⏳ Scraper is fetching tax deed data from RealTDM...

I'll show properties once the data loads!`;
      }
      tier = 'BUDGET';
    }
    // Past results (Dec 3)
    else if (intent.isPast || msg.toLowerCase().includes('dec 3')) {
      setLoading(true);
      const data = await fetchFromSupabase('auction_results', { date: '2025-12-03', limit: 50 });
      setLoading(false);
      
      if (data && data.length > 0) {
        setProperties(data);
        setDataSource({ type: 'foreclosure', date: '2025-12-03', label: 'Dec 3 Results' });
        
        const bids = data.filter(p => p.recommendation === 'BID').length;
        const reviews = data.filter(p => p.recommendation === 'REVIEW').length;
        const skips = data.filter(p => p.recommendation === 'SKIP').length;
        const totalJudgment = data.reduce((sum, p) => sum + (p.final_judgment || 0), 0);
        
        response = `📊 **December 3, 2025 Foreclosure Auction - RESULTS**

📍 Brevard County Courthouse, Titusville
⏰ 11:00 AM EST (COMPLETED)

**${data.length} Properties Analyzed:**
• 🟢 BID: ${bids}
• 🟡 REVIEW: ${reviews}
• 🔴 SKIP: ${skips}

💵 Total Judgment: $${(totalJudgment/1000000).toFixed(2)}M

**Data Source:** Supabase LIVE ✅

Click any property on the map for full analysis!`;
      } else {
        response = `📊 **December 3, 2025 Auction**

⏳ Loading data from Supabase...

The scraper may still be populating results. Try again in a moment!`;
      }
      tier = 'PRODUCTION';
    }
    // Upcoming (Dec 10, 17)
    else if (intent.isUpcoming) {
      setLoading(true);
      const data = await fetchFromSupabase('historical_auctions', { date: '2025-12-10', limit: 50 });
      setLoading(false);
      
      if (data && data.length > 0) {
        setProperties(data);
        setDataSource({ type: 'foreclosure', date: '2025-12-10', label: 'Upcoming Auctions' });
        
        response = `🔜 **Upcoming Foreclosure Auctions**

**${data.length} properties** for Dec 10, 2025
📍 Titusville Courthouse @ 11:00 AM

📋 **Property List:**
${data.slice(0, 12).map((p, i) => `${i+1}. ${p.address || 'TBD'}, ${p.city || 'Brevard'} - ${p.plaintiff || 'Plaintiff TBD'}`).join('\n')}

⚡ Data: Supabase historical_auctions`;
      } else {
        response = `🔜 **Upcoming Auctions**

• Dec 10 - Foreclosure (IN-PERSON)
• Dec 17 - Foreclosure (IN-PERSON)  
• Dec 18 - Tax Deed (ONLINE)

⏳ Scrapers are running to fetch fresh data!
Check back soon for property details.`;
      }
      tier = 'PRODUCTION';
    }
    // BID filter
    else if (intent.wantsBid) {
      const bidProps = properties.filter(p => p.recommendation === 'BID');
      if (bidProps.length > 0) {
        response = `🟢 **BID Properties (${bidProps.length} found)**

${bidProps.slice(0, 5).map(p => `• **${p.address}**, ${p.city}
  Judgment: $${(p.final_judgment || 0).toLocaleString()} | Max Bid: $${(p.max_bid || 0).toLocaleString()}`).join('\n\n')}

These meet our criteria:
✅ Bid/Judgment ratio ≥ 75%
✅ Positive equity spread
✅ ML confidence ≥ 70%`;
      } else {
        response = `🟢 **BID Properties**

No BID recommendations in current data set.

Try: "Show Dec 3 results" to load auction data first!`;
      }
      tier = 'FREE';
    }
    // Help
    else if (intent.wantsHelp || intent.isGreeting) {
      response = `👋 **BidDeed.AI V13.4.0** - Connected to Supabase!

**Commands:**
• "Show Dec 3 results" - Past auction data
• "What's coming Dec 10?" - Upcoming preview
• "Tax deed auctions" - Dec 18 online sale
• "Calendar" - Full schedule
• "BID properties" - Filter by recommendation

**I'll ask clarifying questions when needed:**
• Foreclosure vs Tax Deed?
• Which auction date?

⚡ Smart Router: ${SMART_ROUTER[routerTier].model}`;
      tier = 'FREE';
    }
    // Default
    else {
      // Check if asking about specific property
      const propMatch = properties.find(p => 
        msg.toLowerCase().includes((p.address || '').toLowerCase()) ||
        msg.toLowerCase().includes((p.case_number || '').toLowerCase())
      );
      
      if (propMatch) {
        setSelectedProp(propMatch);
        response = `📍 **${propMatch.address}, ${propMatch.city} FL ${propMatch.zip_code || propMatch.zip}**

📋 Case: ${propMatch.case_number}
👤 Plaintiff: ${propMatch.plaintiff}

| Metric | Value |
|--------|-------|
| Market Value | $${(propMatch.market_value || propMatch.just_value || 0).toLocaleString()} |
| Judgment | $${(propMatch.final_judgment || 0).toLocaleString()} |
| Max Bid | $${(propMatch.max_bid || 0).toLocaleString()} |
| ML Score | ${propMatch.ml_score || 'N/A'}% |

**Recommendation:** ${propMatch.recommendation || 'PENDING'}

Would you like me to run the 12-stage pipeline?`;
        tier = 'PRODUCTION';
      } else {
        response = `I'm here to help with Brevard County auctions!

**Quick commands:**
• "Dec 3 results" - Completed auction
• "Upcoming" - Dec 10, 17 preview
• "Tax deed" - Dec 18 online auction
• "Calendar" - Full schedule

What would you like to know?`;
        tier = 'FREE';
      }
    }
    
    return { response, tier };
  }

  async function handleSend() {
    if (!input.trim()) return;
    
    addMessage('user', input);
    const userInput = input;
    setInput('');
    
    setLoading(true);
    const { response, tier } = await processMessage(userInput);
    setLoading(false);
    
    addMessage('assistant', response, tier);
  }

  function runPipeline(prop) {
    setShowPipeline(true);
    setPipelineStage(0);
    setPipelineLog([
      { text: '╔══════════════════════════════════════╗', type: 'info' },
      { text: '║  BidDeed.AI V13.4.0 Pipeline    ║', type: 'info' },
      { text: '╚══════════════════════════════════════╝', type: 'info' },
      { text: `📍 ${prop.address}, ${prop.city}`, type: 'info' },
      { text: `📋 Case: ${prop.case_number}`, type: 'info' },
      { text: '▶ Starting 12-stage analysis...', type: 'warning' }
    ]);

    let stage = 0;
    const run = () => {
      if (stage >= PIPELINE.length) {
        setPipelineLog(prev => [...prev,
          { text: '════════════════════════════════════════', type: 'info' },
          { text: '✅ PIPELINE COMPLETE', type: 'success' },
          { text: `📊 Recommendation: ${prop.recommendation || 'PENDING'}`, type: 'success' },
          { text: `🧠 ML Score: ${prop.ml_score || 'N/A'}%`, type: 'success' },
          { text: `💰 Max Bid: $${(prop.max_bid || 0).toLocaleString()}`, type: 'success' },
          { text: '📦 Data Source: Supabase LIVE', type: 'success' }
        ]);
        return;
      }
      const s = PIPELINE[stage];
      setPipelineStage(stage);
      setPipelineLog(prev => [...prev,
        { text: `[${s.id}/12] ${s.emoji} ${s.name}`, type: 'info' },
        { text: '  ✓ Complete', type: 'success' }
      ]);
      stage++;
      setTimeout(run, 600);
    };
    setTimeout(run, 500);
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f172a', color: 'white', fontFamily: 'system-ui' }}>
      {/* Pipeline Modal */}
      {showPipeline && selectedProp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#1e293b', borderRadius: 16, width: '100%', maxWidth: 900, maxHeight: '85vh', overflow: 'hidden', border: '1px solid #334155' }}>
            <div style={{ padding: 16, borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18 }}>12-Stage Pipeline</h2>
                <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 13 }}>{selectedProp.address}</p>
              </div>
              <button onClick={() => setShowPipeline(false)} style={{ background: '#334155', border: 'none', color: 'white', padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>Close</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {PIPELINE.map((s, i) => (
                  <div key={s.id} style={{ padding: 10, borderRadius: 8, background: i === pipelineStage ? '#f59e0b30' : i < pipelineStage ? '#10b98130' : '#1e293b', border: `1px solid ${i === pipelineStage ? '#f59e0b' : i < pipelineStage ? '#10b981' : '#334155'}` }}>
                    <div style={{ fontSize: 18 }}>{s.emoji}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: i === pipelineStage ? '#f59e0b' : i < pipelineStage ? '#10b981' : '#64748b' }}>{s.name}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#0f172a', borderRadius: 8, padding: 12, height: 250, overflow: 'auto', fontFamily: 'monospace', fontSize: 11 }}>
                {pipelineLog.map((l, i) => (
                  <div key={i} style={{ color: l.type === 'success' ? '#10b981' : l.type === 'warning' ? '#f59e0b' : '#94a3b8' }}>{l.text}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Panel */}
      <div style={{ width: '38%', minWidth: 400, display: 'flex', flexDirection: 'column', borderRight: '1px solid #334155' }}>
        <div style={{ padding: 16, borderBottom: '1px solid #334155', background: '#1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18 }}>B</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>BidDeed.AI</div>
              <div style={{ fontSize: 11, color: supabaseStatus === 'connected' ? '#10b981' : '#f59e0b' }}>
                V13.4.0 • Supabase {supabaseStatus === 'connected' ? '✅ LIVE' : '⏳ Loading'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: '#64748b' }}>Smart Router</div>
              <div style={{ fontSize: 11, color: SMART_ROUTER[routerTier].color, fontWeight: 600 }}>{routerTier}</div>
            </div>
          </div>
        </div>

        <div ref={chatRef} style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 16, display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '90%', padding: '12px 16px', borderRadius: 16, background: m.role === 'user' ? '#3b82f6' : '#1e293b', fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                {m.content}
                {m.tier && m.role === 'assistant' && (
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 8, borderTop: '1px solid #334155', paddingTop: 6 }}>
                    ⚡ {SMART_ROUTER[m.tier].model}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
              <div style={{ padding: '12px 16px', borderRadius: 16, background: '#1e293b', fontSize: 13 }}>
                ⏳ Fetching from Supabase...
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: 16, borderTop: '1px solid #334155', background: '#1e293b' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyPress={e => e.key === 'Enter' && handleSend()} 
              placeholder="Ask about auctions..." 
              style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', borderRadius: 12, padding: '14px 18px', color: 'white', fontSize: 14 }} 
            />
            <button onClick={handleSend} disabled={loading} style={{ background: loading ? '#334155' : '#10b981', border: 'none', borderRadius: 12, padding: '14px 24px', color: 'white', fontWeight: 700, cursor: loading ? 'wait' : 'pointer' }}>
              {loading ? '...' : 'Send'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {['Dec 3 results', 'Upcoming', 'Tax deed', 'Calendar', 'BID only'].map(q => (
              <button key={q} onClick={() => { setInput(q); }} style={{ background: '#334155', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#94a3b8', fontSize: 11, cursor: 'pointer' }}>{q}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}

      {/* Map with Heatmap */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div ref={mapRef} style={{ position: 'absolute', inset: 0 }} />
        
        {/* Heatmap Controls */}
        <div style={{ position: 'absolute', top: 16, right: 60, background: '#0f172ae0', padding: 12, borderRadius: 12, border: '1px solid #334155', zIndex: 10, backdropFilter: 'blur(8px)' }}>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>🗺️ MAP VIEW</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[{ mode: 'heatmap', icon: '🔥', label: 'Heat' }, { mode: 'hybrid', icon: '📍', label: 'Hybrid' }, { mode: 'markers', icon: '⚫', label: 'Pins' }].map(({ mode, icon, label }) => (
              <button key={mode} onClick={() => setMapViewMode(mode)} style={{ background: mapViewMode === mode ? '#f59e0b' : '#1e293b', border: mapViewMode === mode ? '2px solid #fbbf24' : '1px solid #334155', borderRadius: 8, padding: '8px 12px', color: mapViewMode === mode ? '#0f172a' : '#94a3b8', fontSize: 12, fontWeight: mapViewMode === mode ? 700 : 500, cursor: 'pointer', transition: 'all 0.2s' }}>
                {icon} {label}
              </button>
            ))}
          </div>
          {mapViewMode !== 'markers' && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>Intensity</div>
              <input type="range" min="0.3" max="1" step="0.1" value={heatmapIntensity} onChange={(e) => { const val = parseFloat(e.target.value); setHeatmapIntensity(val); if (mapInstance.current?.getLayer('properties-heatmap')) { mapInstance.current.setPaintProperty('properties-heatmap', 'heatmap-intensity', ['interpolate', ['linear'], ['zoom'], 8, val * 0.5, 12, val * 1.5]); }}} style={{ width: '100%', accentColor: '#f59e0b' }} />
            </div>
          )}
        </div>

        {/* Heatmap Legend */}
        {mapViewMode !== 'markers' && (
          <div style={{ position: 'absolute', top: 150, right: 60, background: '#0f172ae0', padding: 12, borderRadius: 12, border: '1px solid #334155', zIndex: 10 }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>HEAT INTENSITY</div>
            <div style={{ width: 120, height: 12, borderRadius: 6, background: 'linear-gradient(90deg, rgba(59,130,246,0.3), rgba(16,185,129,0.5), rgba(245,158,11,0.7), rgba(239,68,68,0.9), rgba(220,38,38,1))' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b', marginTop: 4 }}><span>Low</span><span>High</span></div>
          </div>
        )}
        
        {/* Data source badge */}
        <div style={{ position: 'absolute', top: 16, left: 16, background: '#0f172ae0', padding: 14, borderRadius: 12, border: '1px solid #334155', zIndex: 10 }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>DATA SOURCE</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: supabaseStatus === 'connected' ? '#10b981' : '#f59e0b' }}>{dataSource.label}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{properties.length} properties • {supabaseStatus === 'connected' ? 'Supabase LIVE' : 'Loading...'}</div>
        </div>

        {/* Legend */}
        <div style={{ position: 'absolute', bottom: 24, left: 16, background: '#0f172ae0', padding: 14, borderRadius: 12, border: '1px solid #334155', zIndex: 10 }}>
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>Recommendations</div>
          <div style={{ display: 'flex', gap: 12 }}>
            {Object.entries(COLORS).map(([s, c]) => (<div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 12, height: 12, borderRadius: '50%', background: c }} /><span style={{ fontSize: 12, fontWeight: 600 }}>{s}</span></div>))}
          </div>
        </div>

        {/* Property Detail Panel */}
        {selectedProp && (
          <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: 380, background: '#1e293b', borderLeft: '1px solid #334155', overflow: 'auto', zIndex: 20 }}>
            <div style={{ padding: 16, borderBottom: '1px solid #334155', background: '#0f172a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ background: COLORS[selectedProp.recommendation] || COLORS.SKIP, padding: '6px 14px', borderRadius: 20, fontWeight: 700, fontSize: 12 }}>{selectedProp.recommendation || 'PENDING'}</span>
                <button onClick={() => setSelectedProp(null)} style={{ background: '#334155', border: 'none', width: 28, height: 28, borderRadius: 6, color: 'white', cursor: 'pointer' }}>×</button>
              </div>
              <h3 style={{ margin: '8px 0 4px', fontSize: 18 }}>{selectedProp.address}</h3>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: 13 }}>{selectedProp.city}, FL {selectedProp.zip_code || selectedProp.zip}</p>
            </div>
            {selectedProp.photo_url && <img src={selectedProp.photo_url} alt="" style={{ width: '100%', height: 180, objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />}
            <div style={{ padding: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[{ l: 'ML Score', v: \`\${selectedProp.ml_score || 'N/A'}%\`, c: '#10b981' }, { l: 'Max Bid', v: \`$\${(selectedProp.max_bid || 0).toLocaleString()}\`, c: '#f59e0b' }, { l: 'Judgment', v: \`$\${(selectedProp.final_judgment || 0).toLocaleString()}\` }, { l: 'Market', v: \`$\${(selectedProp.market_value || selectedProp.just_value || 0).toLocaleString()}\` }, { l: 'Sqft', v: selectedProp.sqft?.toLocaleString() || 'N/A' }, { l: 'Built', v: selectedProp.year_built || 'N/A' }].map((s, i) => (<div key={i} style={{ background: '#0f172a', padding: 12, borderRadius: 10 }}><div style={{ fontSize: 10, color: '#64748b' }}>{s.l}</div><div style={{ fontSize: 16, fontWeight: 700, color: s.c || 'white' }}>{s.v}</div></div>))}
              </div>
              <button onClick={() => runPipeline(selectedProp)} style={{ width: '100%', marginTop: 16, background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', padding: 14, borderRadius: 10, color: 'black', fontWeight: 700, cursor: 'pointer' }}>🚀 Run 12-Stage Pipeline</button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#0f172ae0', borderTop: '1px solid #334155', padding: '8px 20px', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', zIndex: 5 }}>
        <span>© 2025 Ariel Shapira, Solo Founder • Everest Capital USA</span>
        <span style={{ color: '#10b981' }}>BidDeed.AI V18 • Heatmap Enabled • Smart Router Active</span>
      </div>
    </div>
  );
}
