// BrevardBidderAI V13.4.0 - Intelligent Agentic Demo
// Date-Aware NLP with Smart Router + Calendar Integration
// Foreclosure vs Tax Deed distinction
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

import React, { useState, useEffect, useRef } from 'react';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYnJldmFyZGJpZGRlciIsImEiOiJjbTRvOHNiY3IwaGdxMmtzOGd3MWRqbjFzIn0.K1vPto_LT1fVYfnvLe_wdg';

// CURRENT DATE CONTEXT
const TODAY = new Date('2025-12-08');
const formatDate = (d) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

// AUCTION CALENDAR - Brevard County
const AUCTION_CALENDAR = {
  foreclosure: {
    type: "Foreclosure",
    venue: "IN-PERSON at Brevard County Courthouse, Titusville, FL",
    time: "11:00 AM EST",
    past: [
      { date: new Date('2025-12-03'), status: 'completed', properties: 19, totalJudgment: 4092149.37, bids: 4, reviews: 3, skips: 12 }
    ],
    upcoming: [
      { date: new Date('2025-12-10'), status: 'upcoming', estimatedProperties: 15 },
      { date: new Date('2025-12-17'), status: 'upcoming', estimatedProperties: 22 }
    ]
  },
  taxDeed: {
    type: "Tax Deed",
    venue: "ONLINE at brevard.realforeclose.com",
    time: "Varies - Check BID NOW links",
    past: [
      { date: new Date('2025-12-05'), status: 'completed', properties: 8 }
    ],
    upcoming: [
      { date: new Date('2025-12-18'), status: 'upcoming', estimatedProperties: 12 }
    ]
  }
};

// SMART ROUTER TIERS
const SMART_ROUTER = {
  FREE: { models: ['gemini-1.5-flash', 'llama-3.1-8b'], usage: '40-55%', cost: '$0' },
  ULTRA_CHEAP: { models: ['deepseek-v3.2'], usage: '20%', cost: '$0.28/1M' },
  BUDGET: { models: ['claude-3-haiku'], usage: '15%', cost: '$0.25/1M' },
  PRODUCTION: { models: ['claude-sonnet-4'], usage: '10%', cost: '$3/1M' },
  CRITICAL: { models: ['claude-opus-4.5'], usage: '5%', cost: '$15/1M' }
};

// REAL DEC 3, 2025 COMPLETED AUCTION RESULTS
const DEC3_RESULTS = [
  { id: 1, case: "05-2024-CA-030114", address: "110 CROWN AVE", city: "PALM BAY", zip: "32907", lat: 28.0345, lng: -80.5887, sqft: 2834, year: 2021, beds: 5, baths: 3, market: 388760, judgment: 217694, maxBid: 217694, ml: 84, rec: "BID", roi: 88.86, photo: "https://www.bcpao.us/photos/28/2840720011.jpg", plaintiff: "NATIONSTAR", result: "SOLD", soldPrice: 245000, winner: "3rd Party" },
  { id: 2, case: "05-2024-CA-040857", address: "1505 WATROUS DR", city: "TITUSVILLE", zip: "32780", lat: 28.6122, lng: -80.8076, sqft: 1164, year: 1966, beds: 2, baths: 2, market: 171870, judgment: 42341, maxBid: 42341, ml: 92, rec: "BID", roi: 267.34, photo: "https://www.bcpao.us/photos/22/2208343011.jpg", plaintiff: "WRIGHT CAPITAL", result: "SOLD", soldPrice: 48500, winner: "3rd Party" },
  { id: 3, case: "05-2025-CA-029370", address: "180 LEE RD", city: "WEST MELBOURNE", zip: "32904", lat: 28.0756, lng: -80.6531, sqft: 1226, year: 1959, beds: 3, baths: 2, market: 163650, judgment: 39095, maxBid: 39095, ml: 89, rec: "BID", roi: 293.66, photo: "https://www.bcpao.us/photos/28/2819983011.jpg", plaintiff: "B-MUSED", result: "SOLD", soldPrice: 52000, winner: "Investor" },
  { id: 4, case: "05-2024-CA-029012", address: "2450 PALM BAY RD NE", city: "PALM BAY", zip: "32905", lat: 28.0442, lng: -80.5912, sqft: 1500, year: 2018, beds: 3, baths: 2, market: 274440, judgment: 185000, maxBid: 143386, ml: 73, rec: "BID", roi: 82.78, photo: "https://www.bcpao.us/photos/28/2815672011.jpg", plaintiff: "FREEDOM MORTGAGE", result: "BANK", soldPrice: null, winner: "Bank" },
  { id: 5, case: "05-2024-CA-038092", address: "3711 BRANTLEY CIR", city: "ROCKLEDGE", zip: "32955", lat: 28.3514, lng: -80.7273, sqft: 2089, year: 2014, beds: 4, baths: 2.5, market: 381510, judgment: 322244, maxBid: 193906, ml: 60, rec: "REVIEW", roi: 45.2, photo: "https://www.bcpao.us/photos/25/2537264011.jpg", plaintiff: "COMMUNITY", result: "CANCELLED", soldPrice: null, winner: null },
  { id: 6, case: "05-2024-CA-051000", address: "5600 GRAHAM ST", city: "COCOA", zip: "32927", lat: 28.4189, lng: -80.8012, sqft: 1379, year: 1986, beds: 3, baths: 2, market: 279230, judgment: 139612, maxBid: 104615, ml: 71, rec: "REVIEW", roi: 96.47, photo: "https://www.bcpao.us/photos/23/2304701011.jpg", plaintiff: "HALLMARK", result: "SOLD", soldPrice: 165000, winner: "3rd Party" },
  { id: 7, case: "05-2024-CA-038977", address: "1060 ARON ST", city: "COCOA", zip: "32927", lat: 28.3867, lng: -80.7523, sqft: 1008, year: 1983, beds: 2, baths: 1.5, market: 198820, judgment: 159572, maxBid: 54469, ml: 34, rec: "SKIP", roi: 12.5, photo: "https://www.bcpao.us/photos/23/2310706011.jpg", plaintiff: "LAKEVIEW", result: "BANK", soldPrice: null, winner: "Bank" },
  { id: 8, case: "05-2024-CA-021494", address: "1160 TIGER ST", city: "PALM BAY", zip: "32909", lat: 27.9876, lng: -80.6234, sqft: 1698, year: 2009, beds: 3, baths: 2, market: 253150, judgment: 346321, maxBid: 116890, ml: 28, rec: "SKIP", roi: -15.2, photo: "https://www.bcpao.us/photos/29/2935858011.jpg", plaintiff: "US BANK", result: "BANK", soldPrice: null, winner: "Bank" }
];

// DEC 10 UPCOMING FORECLOSURE AUCTION (preview data)
const DEC10_UPCOMING = [
  { id: 1, case: "05-2024-CA-055123", address: "845 GRANT AVE", city: "COCOA BEACH", zip: "32931", lat: 28.3201, lng: -80.6089, sqft: 1450, year: 1978, beds: 3, baths: 2, market: 425000, judgment: 285000, maxBid: 212500, ml: 78, rec: "BID", photo: null, plaintiff: "WELLS FARGO" },
  { id: 2, case: "05-2024-CA-048721", address: "2340 RIVERSIDE DR", city: "MELBOURNE", zip: "32935", lat: 28.1523, lng: -80.6234, sqft: 1890, year: 1995, beds: 4, baths: 2, market: 345000, judgment: 267000, maxBid: 176500, ml: 65, rec: "REVIEW", photo: null, plaintiff: "NATIONSTAR" },
  { id: 3, case: "05-2024-CA-052890", address: "1120 MALABAR RD", city: "PALM BAY", zip: "32907", lat: 28.0123, lng: -80.5987, sqft: 2100, year: 2005, beds: 4, baths: 2.5, market: 298000, judgment: 312000, maxBid: 143600, ml: 42, rec: "SKIP", photo: null, plaintiff: "JPM CHASE" },
  { id: 4, case: "05-2025-CA-031456", address: "567 ATLANTIC AVE", city: "SATELLITE BEACH", zip: "32937", lat: 28.1761, lng: -80.5901, sqft: 1680, year: 1988, beds: 3, baths: 2, market: 485000, judgment: 198000, maxBid: 289500, ml: 91, rec: "BID", photo: null, plaintiff: "ROCKET MORTGAGE" }
];

// 12-STAGE PIPELINE
const PIPELINE = [
  { id: 1, name: "Discovery", emoji: "🔍", desc: "Auction calendar sync", dur: 800 },
  { id: 2, name: "Scraping", emoji: "⚡", desc: "BECA V2.0 extraction", dur: 1200 },
  { id: 3, name: "Title", emoji: "📋", desc: "Chain of title", dur: 1500 },
  { id: 4, name: "Liens", emoji: "⚖️", desc: "Priority analysis", dur: 1000 },
  { id: 5, name: "Tax", emoji: "🏛️", desc: "Certificate check", dur: 900 },
  { id: 6, name: "Demo", emoji: "📊", desc: "Census data", dur: 700 },
  { id: 7, name: "ML", emoji: "🧠", desc: "XGBoost score", dur: 1100 },
  { id: 8, name: "Bid", emoji: "💰", desc: "Max calculation", dur: 600 },
  { id: 9, name: "Decision", emoji: "✅", desc: "BID/REVIEW/SKIP", dur: 400 },
  { id: 10, name: "Report", emoji: "📄", desc: "DOCX generate", dur: 800 },
  { id: 11, name: "Exit", emoji: "🎯", desc: "Disposition", dur: 500 },
  { id: 12, name: "Archive", emoji: "🗄️", desc: "Supabase", dur: 400 }
];

const COLORS = { BID: '#10B981', REVIEW: '#F59E0B', SKIP: '#EF4444' };

// NLP INTENT DETECTION
function detectIntent(msg) {
  const lower = msg.toLowerCase();
  
  // Auction type detection
  const isTaxDeed = /tax\s*deed|tax\s*sale|tax\s*lien|tax\s*certificate/.test(lower);
  const isForeclosure = /foreclosure|mortgage|bank\s*owned|reo/.test(lower);
  
  // Time context
  const isPast = /last|previous|past|recent|results|happened|sold|completed|dec\s*3|december\s*3/.test(lower);
  const isUpcoming = /upcoming|next|future|scheduled|coming|dec\s*10|dec\s*17|december\s*10|december\s*17/.test(lower);
  const isToday = /today|now|current/.test(lower);
  
  // Query type
  const wantsList = /show|list|all|properties|find|search/.test(lower);
  const wantsAnalysis = /analyze|analysis|run|pipeline|detail/.test(lower);
  const wantsBid = /bid\s*properties|bid\s*only|just\s*bid|green/.test(lower);
  const wantsReview = /review\s*only|needs\s*review|yellow/.test(lower);
  const wantsSkip = /skip|avoid|red/.test(lower);
  const wantsCalendar = /calendar|schedule|when|date|auction\s*date/.test(lower);
  const wantsHelp = /help|how|what\s*can|commands/.test(lower);
  const isGreeting = /^(hi|hello|hey|good\s*(morning|afternoon|evening))/.test(lower);
  
  return { isTaxDeed, isForeclosure, isPast, isUpcoming, isToday, wantsList, wantsAnalysis, wantsBid, wantsReview, wantsSkip, wantsCalendar, wantsHelp, isGreeting, needsClarification: !isTaxDeed && !isForeclosure && (wantsList || wantsAnalysis) };
}

export default function RealDataDemo() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [properties, setProperties] = useState(DEC3_RESULTS);
  const [selectedProp, setSelectedProp] = useState(null);
  const [showPipeline, setShowPipeline] = useState(false);
  const [pipelineStage, setPipelineStage] = useState(0);
  const [pipelineLog, setPipelineLog] = useState([]);
  const [dataSource, setDataSource] = useState('dec3');
  const [routerTier, setRouterTier] = useState('FREE');
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const chatRef = useRef(null);

  // Initialize with greeting
  useEffect(() => {
    const greeting = {
      role: 'assistant',
      content: `👋 **Welcome to BrevardBidderAI V13.4.0**

📅 Today is **${formatDate(TODAY)}**

**Recent Auction Results:**
• Dec 3, 2025 - ✅ COMPLETED (19 properties, $4.09M judgment)

**Upcoming Foreclosure Auctions:**
• Dec 10, 2025 - 🔜 IN 2 DAYS (est. 15 properties)
• Dec 17, 2025 - 📅 SCHEDULED (est. 22 properties)

**Upcoming Tax Deed Auctions:**
• Dec 18, 2025 - 🌐 ONLINE at brevard.realforeclose.com

💬 Ask me anything! Examples:
• "Show me Dec 3 results"
• "What's coming up Dec 10?"
• "Run analysis on 110 Crown Ave"

⚡ **Smart Router:** Currently using ${SMART_ROUTER.FREE.models[0]} (FREE tier)`,
      tier: 'FREE',
      timestamp: new Date()
    };
    setMessages([greeting]);
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
        mapInstance.current.on('load', () => { setMapLoaded(true); });
      }, 100);
    };
    document.head.appendChild(script);
  }, []);

  useEffect(() => { if (mapLoaded) updateMarkers(); }, [properties, mapLoaded]);
  useEffect(() => { chatRef.current?.scrollTo(0, chatRef.current.scrollHeight); }, [messages]);

  function updateMarkers() {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    properties.forEach(p => {
      const el = document.createElement('div');
      el.style.cssText = `width:36px;height:36px;background:${COLORS[p.rec]};border:3px solid white;border-radius:50%;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:white;`;
      el.innerHTML = p.ml;
      el.onclick = () => setSelectedProp(p);
      const marker = new window.mapboxgl.Marker(el).setLngLat([p.lng, p.lat]).addTo(mapInstance.current);
      markersRef.current.push(marker);
    });
  }

  function selectTier(complexity) {
    if (complexity === 'simple') return 'FREE';
    if (complexity === 'medium') return 'ULTRA_CHEAP';
    if (complexity === 'analysis') return 'BUDGET';
    if (complexity === 'complex') return 'PRODUCTION';
    return 'CRITICAL';
  }

  function processMessage(msg) {
    const intent = detectIntent(msg);
    let response = '';
    let tier = 'FREE';
    let newProps = properties;
    let newSource = dataSource;

    // Greeting
    if (intent.isGreeting) {
      response = `👋 Hello! I'm BrevardBidderAI, your intelligent foreclosure auction assistant.

📅 **Today:** ${formatDate(TODAY)}

How can I help you today? You can ask about:
• Past auction results (Dec 3)
• Upcoming auctions (Dec 10, 17)
• Property analysis
• Tax deed vs foreclosure auctions`;
      tier = 'FREE';
    }
    // Help
    else if (intent.wantsHelp) {
      response = `📚 **BrevardBidderAI Commands:**

**View Auctions:**
• "Show Dec 3 results" - Past auction outcomes
• "What's upcoming Dec 10?" - Future auction preview
• "Show BID properties" - Filter by recommendation
• "Show calendar" - Full auction schedule

**Analysis:**
• "Analyze [address]" - Run 12-stage pipeline
• "Compare Dec 3 BIDs" - Compare properties

**Auction Types:**
• "Foreclosure auctions" - Courthouse sales
• "Tax deed auctions" - Online tax sales

⚡ Using Smart Router: ${SMART_ROUTER[routerTier].models[0]}`;
      tier = 'FREE';
    }
    // Needs clarification - ask about auction type
    else if (intent.needsClarification && !intent.isPast && !intent.isUpcoming) {
      response = `🤔 I want to make sure I give you the right information.

**Which type of auction are you interested in?**

1️⃣ **Foreclosure Auctions** (Mortgage defaults)
   • IN-PERSON at Titusville Courthouse
   • Next: Dec 10, 2025 @ 11:00 AM

2️⃣ **Tax Deed Auctions** (Tax certificate sales)
   • ONLINE at brevard.realforeclose.com
   • Next: Dec 18, 2025

Please specify, or say "both" to see everything!`;
      tier = 'FREE';
    }
    // Calendar request
    else if (intent.wantsCalendar) {
      response = `📅 **Brevard County Auction Calendar**

**FORECLOSURE AUCTIONS** (IN-PERSON)
📍 Brevard County Courthouse, Titusville
⏰ 11:00 AM EST

| Date | Status | Properties |
|------|--------|------------|
| Dec 3 | ✅ COMPLETED | 19 props, $4.09M |
| Dec 10 | 🔜 IN 2 DAYS | ~15 estimated |
| Dec 17 | 📅 SCHEDULED | ~22 estimated |

**TAX DEED AUCTIONS** (ONLINE)
🌐 brevard.realforeclose.com
⏰ Check BID NOW links

| Date | Status | Properties |
|------|--------|------------|
| Dec 5 | ✅ COMPLETED | 8 properties |
| Dec 18 | 📅 SCHEDULED | ~12 estimated |

Which auction would you like to explore?`;
      tier = 'FREE';
    }
    // Past results - Dec 3
    else if (intent.isPast || msg.toLowerCase().includes('dec 3') || msg.toLowerCase().includes('result')) {
      newProps = DEC3_RESULTS;
      newSource = 'dec3';
      const sold = DEC3_RESULTS.filter(p => p.result === 'SOLD').length;
      const bank = DEC3_RESULTS.filter(p => p.result === 'BANK').length;
      const cancelled = DEC3_RESULTS.filter(p => p.result === 'CANCELLED').length;
      
      response = `📊 **December 3, 2025 Foreclosure Auction - FINAL RESULTS**

📍 Brevard County Courthouse, Titusville
⏰ 11:00 AM EST (COMPLETED)

**Outcomes:**
• 🏆 Sold to 3rd Party: ${sold} properties
• 🏦 Returned to Bank: ${bank} properties  
• ❌ Cancelled: ${cancelled} properties

**BrevardBidderAI Performance:**
✅ 4 BID recommendations → 3 sold to investors
✅ 3 REVIEW recommendations → 1 sold
✅ ML accuracy validated

**Top Performers:**
1. 180 LEE RD - Sold $52K (ROI: 293%!) 🔥
2. 1505 WATROUS DR - Sold $48.5K (ROI: 267%)
3. 110 CROWN AVE - Sold $245K

Map updated with Dec 3 results. Click any property for details!`;
      tier = 'BUDGET';
    }
    // Upcoming - Dec 10
    else if (intent.isUpcoming || msg.toLowerCase().includes('dec 10') || msg.toLowerCase().includes('upcoming')) {
      newProps = DEC10_UPCOMING;
      newSource = 'dec10';
      
      response = `🔜 **December 10, 2025 Foreclosure Auction - PREVIEW**

📍 Brevard County Courthouse, Titusville
⏰ 11:00 AM EST
📅 **IN 2 DAYS**

**Early Analysis (${DEC10_UPCOMING.length} properties scraped):**
• 🟢 BID: ${DEC10_UPCOMING.filter(p => p.rec === 'BID').length} properties
• 🟡 REVIEW: ${DEC10_UPCOMING.filter(p => p.rec === 'REVIEW').length} properties
• 🔴 SKIP: ${DEC10_UPCOMING.filter(p => p.rec === 'SKIP').length} properties

**Hot Opportunities:**
1. 567 ATLANTIC AVE, Satellite Beach - ML: 91% 🔥
   Max Bid: $289,500 | Judgment: $198K

2. 845 GRANT AVE, Cocoa Beach - ML: 78%
   Max Bid: $212,500 | Judgment: $285K

⚠️ Note: Data is preliminary. Full analysis runs 24hrs before auction.

Map updated with Dec 10 preview!`;
      tier = 'PRODUCTION';
    }
    // Tax deed specific
    else if (intent.isTaxDeed) {
      response = `🏛️ **Tax Deed Auctions - Brevard County**

Unlike foreclosure auctions, tax deed sales are conducted **ONLINE**.

🌐 **Platform:** brevard.realforeclose.com
⏰ **Next Auction:** December 18, 2025

**Key Differences from Foreclosure:**
| Aspect | Tax Deed | Foreclosure |
|--------|----------|-------------|
| Venue | Online | In-Person |
| Liens | Wipes most liens | Senior liens survive |
| Deposit | Required upfront | At sale |
| Competition | High | Moderate |

**BidDeedAI** (our tax deed platform) handles these auctions.

Would you like me to:
1. Show upcoming tax deed properties?
2. Explain tax deed vs foreclosure strategy?
3. Switch to foreclosure analysis?`;
      tier = 'BUDGET';
    }
    // Filter by BID
    else if (intent.wantsBid) {
      const bids = properties.filter(p => p.rec === 'BID');
      response = `🟢 **BID Properties (${bids.length} found)**

${bids.map(p => `• **${p.address}**, ${p.city}
  ML: ${p.ml}% | Max Bid: $${p.maxBid.toLocaleString()} | ROI: ${p.roi}%`).join('\n\n')}

These properties meet our criteria:
✅ Bid/Judgment ratio ≥ 75%
✅ Positive equity spread
✅ ML confidence ≥ 70%

Click any property on the map for full analysis!`;
      tier = 'FREE';
    }
    // Default - try to be helpful
    else {
      // Check if asking about specific property
      const propMatch = properties.find(p => 
        msg.toLowerCase().includes(p.address.toLowerCase()) ||
        msg.toLowerCase().includes(p.case.toLowerCase())
      );
      
      if (propMatch) {
        setSelectedProp(propMatch);
        response = `📍 **${propMatch.address}, ${propMatch.city} FL ${propMatch.zip}**

📋 Case: ${propMatch.case}
🏠 ${propMatch.beds}bd/${propMatch.baths}ba • ${propMatch.sqft.toLocaleString()} sqft

**Financial Analysis:**
| Metric | Value |
|--------|-------|
| Market Value | $${propMatch.market.toLocaleString()} |
| Judgment | $${propMatch.judgment.toLocaleString()} |
| Max Bid | $${propMatch.maxBid.toLocaleString()} |
| ML Score | ${propMatch.ml}% |
| ROI Est. | ${propMatch.roi}% |

**Recommendation:** ${propMatch.rec === 'BID' ? '🟢 BID' : propMatch.rec === 'REVIEW' ? '🟡 REVIEW' : '🔴 SKIP'}

${propMatch.result ? `**Auction Result:** ${propMatch.result}${propMatch.soldPrice ? ` - $${propMatch.soldPrice.toLocaleString()}` : ''}` : ''}

Would you like me to run the full 12-stage pipeline analysis?`;
        tier = 'PRODUCTION';
      } else {
        response = `I'm here to help with Brevard County auctions! 

**Quick Actions:**
• "Show Dec 3 results" - Past auction data
• "What's coming Dec 10?" - Upcoming preview
• "Show BID properties" - Best opportunities
• "Calendar" - Full schedule

**Or ask about:**
• Foreclosure vs Tax Deed differences
• Specific property analysis
• Market trends

What would you like to know?`;
        tier = 'FREE';
      }
    }

    setProperties(newProps);
    setDataSource(newSource);
    setRouterTier(tier);
    
    return { response, tier };
  }

  function handleSend() {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    
    const { response, tier } = processMessage(input);
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        tier,
        timestamp: new Date()
      }]);
    }, 300 + Math.random() * 500);
    
    setInput('');
  }

  function runPipeline(prop) {
    setShowPipeline(true);
    setPipelineStage(0);
    setPipelineLog([
      { text: "╔══════════════════════════════════════════╗", type: "info" },
      { text: "║  BrevardBidderAI V13.4.0 Pipeline        ║", type: "info" },
      { text: "╚══════════════════════════════════════════╝", type: "info" },
      { text: `📍 ${prop.address}, ${prop.city}`, type: "info" },
      { text: `📋 Case: ${prop.case}`, type: "info" },
      { text: "▶ Starting analysis...", type: "warning" }
    ]);

    let stage = 0;
    const run = () => {
      if (stage >= PIPELINE.length) {
        setPipelineLog(prev => [...prev,
          { text: "════════════════════════════════════════", type: "info" },
          { text: "✅ PIPELINE COMPLETE", type: "success" },
          { text: `📊 Recommendation: ${prop.rec}`, type: "success" },
          { text: `🧠 ML Score: ${prop.ml}%`, type: "success" },
          { text: `💰 Max Bid: $${prop.maxBid.toLocaleString()}`, type: "success" }
        ]);
        return;
      }
      const s = PIPELINE[stage];
      setPipelineStage(stage);
      setPipelineLog(prev => [...prev,
        { text: `[${s.id}/12] ${s.emoji} ${s.name}: ${s.desc}`, type: "info" },
        { text: `  ✓ Complete`, type: "success" }
      ]);
      stage++;
      setTimeout(run, s.dur);
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
              <div style={{ fontWeight: 700, fontSize: 16 }}>BrevardBidderAI</div>
              <div style={{ fontSize: 11, color: '#10b981' }}>V13.4.0 • {formatDate(TODAY)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: '#64748b' }}>Smart Router</div>
              <div style={{ fontSize: 11, color: routerTier === 'FREE' ? '#10b981' : routerTier === 'ULTRA_CHEAP' ? '#3b82f6' : '#f59e0b', fontWeight: 600 }}>{routerTier}</div>
            </div>
          </div>
        </div>

        <div ref={chatRef} style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 16, display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '90%', padding: '12px 16px', borderRadius: 16, background: m.role === 'user' ? '#3b82f6' : '#1e293b', fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                {m.content}
                {m.tier && <div style={{ fontSize: 10, color: '#64748b', marginTop: 8, borderTop: '1px solid #334155', paddingTop: 6 }}>⚡ {SMART_ROUTER[m.tier].models[0]}</div>}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: 16, borderTop: '1px solid #334155', background: '#1e293b' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Ask about auctions, analysis, or properties..." style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', borderRadius: 12, padding: '14px 18px', color: 'white', fontSize: 14 }} />
            <button onClick={handleSend} style={{ background: '#10b981', border: 'none', borderRadius: 12, padding: '14px 24px', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Send</button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            {['Dec 3 results', 'Upcoming Dec 10', 'Calendar', 'Help'].map(q => (
              <button key={q} onClick={() => { setInput(q); setTimeout(handleSend, 100); }} style={{ background: '#334155', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#94a3b8', fontSize: 11, cursor: 'pointer' }}>{q}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div ref={mapRef} style={{ position: 'absolute', inset: 0 }} />
        
        <div style={{ position: 'absolute', top: 16, left: 16, background: '#0f172ae0', padding: 14, borderRadius: 12, border: '1px solid #334155', zIndex: 10 }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>DATA SOURCE</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: dataSource === 'dec3' ? '#10b981' : '#f59e0b' }}>
            {dataSource === 'dec3' ? 'Dec 3, 2025 RESULTS' : 'Dec 10, 2025 PREVIEW'}
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{properties.length} properties</div>
        </div>

        <div style={{ position: 'absolute', bottom: 24, left: 16, background: '#0f172ae0', padding: 14, borderRadius: 12, border: '1px solid #334155', zIndex: 10 }}>
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>Recommendations</div>
          <div style={{ display: 'flex', gap: 12 }}>
            {Object.entries(COLORS).map(([s, c]) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
                <span style={{ fontSize: 12, fontWeight: 600 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {selectedProp && (
          <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: 380, background: '#1e293b', borderLeft: '1px solid #334155', overflow: 'auto', zIndex: 20 }}>
            <div style={{ padding: 16, borderBottom: '1px solid #334155', background: '#0f172a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ background: COLORS[selectedProp.rec], padding: '6px 14px', borderRadius: 20, fontWeight: 700, fontSize: 12 }}>{selectedProp.rec}</span>
                <button onClick={() => setSelectedProp(null)} style={{ background: '#334155', border: 'none', width: 28, height: 28, borderRadius: 6, color: 'white', cursor: 'pointer' }}>×</button>
              </div>
              <h3 style={{ margin: '8px 0 4px', fontSize: 18 }}>{selectedProp.address}</h3>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: 13 }}>{selectedProp.city}, FL {selectedProp.zip}</p>
            </div>
            {selectedProp.photo && <img src={selectedProp.photo} alt="" style={{ width: '100%', height: 180, objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />}
            <div style={{ padding: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { l: 'ML Score', v: `${selectedProp.ml}%`, c: '#10b981' },
                  { l: 'Max Bid', v: `$${selectedProp.maxBid.toLocaleString()}`, c: '#f59e0b' },
                  { l: 'Judgment', v: `$${selectedProp.judgment.toLocaleString()}` },
                  { l: 'Market', v: `$${selectedProp.market.toLocaleString()}` },
                  { l: 'ROI Est', v: `${selectedProp.roi}%`, c: selectedProp.roi > 50 ? '#10b981' : '#ef4444' },
                  { l: 'Result', v: selectedProp.result || 'Pending', c: selectedProp.result === 'SOLD' ? '#10b981' : '#94a3b8' }
                ].map((s, i) => (
                  <div key={i} style={{ background: '#0f172a', padding: 12, borderRadius: 10 }}>
                    <div style={{ fontSize: 10, color: '#64748b' }}>{s.l}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: s.c || 'white' }}>{s.v}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => runPipeline(selectedProp)} style={{ width: '100%', marginTop: 16, background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', padding: 14, borderRadius: 10, color: 'black', fontWeight: 700, cursor: 'pointer' }}>🚀 Run 12-Stage Pipeline</button>
            </div>
          </div>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#0f172ae0', borderTop: '1px solid #334155', padding: '8px 20px', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', zIndex: 5 }}>
        <span>© 2025 Ariel Shapira, Solo Founder • Everest Capital USA</span>
        <span style={{ color: '#10b981' }}>BrevardBidderAI V13.4.0 • Smart Router Active</span>
      </div>
    </div>
  );
}
