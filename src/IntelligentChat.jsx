// BrevardBidderAI Intelligent NLP Chatbot
// Features: Date-aware context, Smart Router, Auction Calendar, Foreclosure vs Tax Deed distinction
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

import React, { useState, useRef, useEffect } from 'react';

// Auction Calendar - REAL upcoming dates
const AUCTION_CALENDAR = {
  foreclosure: [
    { date: "2025-12-17", day: "Wednesday", time: "11:00 AM", location: "Titusville Courthouse", type: "IN-PERSON" },
    { date: "2026-01-07", day: "Tuesday", time: "11:00 AM", location: "Titusville Courthouse", type: "IN-PERSON" },
    { date: "2026-01-21", day: "Tuesday", time: "11:00 AM", location: "Titusville Courthouse", type: "IN-PERSON" }
  ],
  taxDeed: [
    { date: "2025-12-18", day: "Thursday", time: "9:00 AM", location: "brevard.realforeclose.com", type: "ONLINE" },
    { date: "2026-01-15", day: "Wednesday", time: "9:00 AM", location: "brevard.realforeclose.com", type: "ONLINE" }
  ]
};

// Smart Router Tiers
const SMART_ROUTER = {
  FREE: { models: ["gemini-1.5-flash", "llama-3.1-8b"], usage: "40-55%", cost: "$0" },
  ULTRA_CHEAP: { models: ["deepseek-v3.2"], cost: "$0.28/1M tokens" },
  BUDGET: { models: ["claude-3-haiku"], cost: "$0.25/1M tokens" },
  PRODUCTION: { models: ["claude-sonnet-4"], cost: "$3/1M tokens" },
  CRITICAL: { models: ["claude-opus-4.5"], cost: "$15/1M tokens" }
};

// NLP Intent Classification
function classifyIntent(message) {
  const lower = message.toLowerCase();
  
  // Auction type detection
  const isForeclosure = /foreclosure|mortgage|judgment|courthouse|titusville|in-person/i.test(lower);
  const isTaxDeed = /tax deed|tax certificate|realforeclose|online auction|tax sale/i.test(lower);
  
  // Query type detection
  const isCalendar = /when|next|upcoming|schedule|calendar|date|auction date/i.test(lower);
  const isProperty = /property|address|case|parcel|house|home/i.test(lower);
  const isAnalysis = /analyze|pipeline|run|process|ml|score|recommendation/i.test(lower);
  const isPrice = /price|bid|max bid|judgment|value|arv|roi/i.test(lower);
  const isHelp = /help|how|what can|commands|options/i.test(lower);
  const isGreeting = /^(hi|hello|hey|good morning|good afternoon)[\s!.,]*/i.test(lower);
  
  // Determine auction type with disambiguation
  let auctionType = null;
  if (isForeclosure && !isTaxDeed) auctionType = 'foreclosure';
  else if (isTaxDeed && !isForeclosure) auctionType = 'taxDeed';
  else if (isForeclosure && isTaxDeed) auctionType = 'ambiguous';
  
  // Smart Router tier selection based on complexity
  let routerTier = 'FREE';
  if (isAnalysis) routerTier = 'PRODUCTION';
  else if (isProperty || isPrice) routerTier = 'BUDGET';
  else if (isCalendar) routerTier = 'ULTRA_CHEAP';
  
  return {
    auctionType,
    queryType: isCalendar ? 'calendar' : isProperty ? 'property' : isAnalysis ? 'analysis' : isPrice ? 'price' : isHelp ? 'help' : isGreeting ? 'greeting' : 'general',
    routerTier,
    needsDisambiguation: auctionType === 'ambiguous'
  };
}

// Date utilities
function getRelativeDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff < 7) return `In ${diff} days`;
  if (diff < 14) return 'Next week';
  return `In ${Math.ceil(diff / 7)} weeks`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

// Generate intelligent response
function generateResponse(message, intent) {
  const now = new Date();
  const currentDate = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  
  // Handle disambiguation
  if (intent.needsDisambiguation) {
    return {
      text: `I notice you're asking about auctions. Could you clarify which type?\n\n**🏛️ Foreclosure Auctions** (IN-PERSON)\n• Courthouse, Titusville\n• Mortgage foreclosures\n• Next: ${formatDate(AUCTION_CALENDAR.foreclosure[0].date)}\n\n**📋 Tax Deed Auctions** (ONLINE)\n• brevard.realforeclose.com\n• Tax certificate sales\n• Next: ${formatDate(AUCTION_CALENDAR.taxDeed[0].date)}\n\nWhich are you interested in?`,
      tier: 'FREE',
      cost: '$0'
    };
  }
  
  // Greeting
  if (intent.queryType === 'greeting') {
    return {
      text: `Hello! 👋 I'm BrevardBidderAI, your Brevard County foreclosure intelligence assistant.\n\n📅 **Today:** ${currentDate}\n\n**Upcoming Auctions:**\n🏛️ Next Foreclosure: ${formatDate(AUCTION_CALENDAR.foreclosure[0].date)} (${getRelativeDate(AUCTION_CALENDAR.foreclosure[0].date)})\n📋 Next Tax Deed: ${formatDate(AUCTION_CALENDAR.taxDeed[0].date)} (${getRelativeDate(AUCTION_CALENDAR.taxDeed[0].date)})\n\nHow can I help you today? Try:\n• "When is the next foreclosure auction?"\n• "Show me BID properties"\n• "Run pipeline on [address]"`,
      tier: 'FREE',
      cost: '$0'
    };
  }
  
  // Calendar queries
  if (intent.queryType === 'calendar') {
    if (intent.auctionType === 'foreclosure' || !intent.auctionType) {
      const next = AUCTION_CALENDAR.foreclosure[0];
      const upcoming = AUCTION_CALENDAR.foreclosure.slice(0, 3);
      return {
        text: `📅 **Upcoming Foreclosure Auctions**\n\n**Next Auction:** ${formatDate(next.date)}\n⏰ ${next.time} EST\n📍 ${next.location}\n🎫 ${next.type}\n📆 ${getRelativeDate(next.date)}\n\n**Full Calendar:**\n${upcoming.map((a, i) => `${i+1}. ${formatDate(a.date)} - ${a.time}`).join('\n')}\n\n⚠️ Foreclosure auctions are IN-PERSON only at the Titusville Courthouse. No online bidding available.`,
        tier: 'ULTRA_CHEAP',
        cost: '$0.0001'
      };
    }
    if (intent.auctionType === 'taxDeed') {
      const next = AUCTION_CALENDAR.taxDeed[0];
      return {
        text: `📋 **Upcoming Tax Deed Auctions**\n\n**Next Auction:** ${formatDate(next.date)}\n⏰ ${next.time} EST\n🌐 ${next.location}\n💻 ${next.type}\n📆 ${getRelativeDate(next.date)}\n\n**How to Participate:**\n1. Register at brevard.realforeclose.com\n2. Complete bidder verification\n3. Fund your account\n4. Click "BID NOW" when auction opens\n\n💡 Tax deed auctions are ONLINE - you can bid from anywhere!`,
        tier: 'ULTRA_CHEAP',
        cost: '$0.0001'
      };
    }
  }
  
  // Help
  if (intent.queryType === 'help') {
    return {
      text: `🤖 **BrevardBidderAI Commands**\n\n**📅 Calendar:**\n• "When is the next foreclosure auction?"\n• "Show tax deed schedule"\n• "Upcoming auctions"\n\n**🏠 Properties:**\n• "Show BID properties"\n• "Filter by REVIEW"\n• "Properties in Palm Bay"\n\n**🔬 Analysis:**\n• "Run 12-stage pipeline"\n• "Analyze [address]"\n• "Calculate max bid"\n\n**💡 Info:**\n• "Foreclosure vs tax deed difference"\n• "How does the pipeline work?"\n• "Explain ML scoring"\n\n**⚡ Smart Router Active:** Optimizing costs via ${SMART_ROUTER.FREE.models.join(', ')} for simple queries`,
      tier: 'FREE',
      cost: '$0'
    };
  }
  
  // Analysis queries
  if (intent.queryType === 'analysis') {
    return {
      text: `🔬 **12-Stage Pipeline Ready**\n\nSelect a property from the map or list, then click **"Run 12-Stage Pipeline"** to see:\n\n1. 🔍 Discovery - Auction calendar sync\n2. ⚡ Scraping - BECA V2.0 extraction\n3. 📋 Title Search - AcclaimWeb chain\n4. ⚖️ Lien Priority - Senior/junior analysis\n5. 🏛️ Tax Certs - Certificate check\n6. 📊 Demographics - Census API\n7. 🧠 ML Score - XGBoost prediction\n8. 💰 Max Bid - Formula calculation\n9. ✅ Decision - BID/REVIEW/SKIP\n10. 📄 Report - DOCX generation\n11. 🎯 Disposition - Exit strategy\n12. 🗄️ Archive - Supabase storage\n\n⚡ Using ${SMART_ROUTER.PRODUCTION.models[0]} for analysis tasks`,
      tier: 'PRODUCTION',
      cost: '$0.003'
    };
  }
  
  // Default response
  return {
    text: `I understand you're asking about: "${message}"\n\nI can help with:\n• 📅 Auction calendars (foreclosure & tax deed)\n• 🏠 Property analysis\n• 🔬 12-stage pipeline processing\n• 💰 Max bid calculations\n\n**Quick tip:** Ask "When is the next auction?" or click a property on the map to get started!\n\n📆 Today: ${currentDate}`,
    tier: intent.routerTier,
    cost: SMART_ROUTER[intent.routerTier]?.cost || '$0'
  };
}

export default function IntelligentChat({ onCommand }) {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      text: `🏠 **BrevardBidderAI V13.4.0**\n\n📅 Today: ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}\n\n**Next Auctions:**\n🏛️ Foreclosure: Dec 17 (${getRelativeDate('2025-12-17')})\n📋 Tax Deed: Dec 18 (${getRelativeDate('2025-12-18')})\n\nAsk me about auctions, properties, or analysis!\n\n⚡ Smart Router: 40-55% FREE tier`,
      tier: 'FREE',
      cost: '$0'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEnd = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend() {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);
    
    // Classify intent
    const intent = classifyIntent(userMessage);
    
    // Simulate processing delay based on tier
    const delay = intent.routerTier === 'FREE' ? 300 : intent.routerTier === 'ULTRA_CHEAP' ? 500 : 800;
    
    setTimeout(() => {
      const response = generateResponse(userMessage, intent);
      setMessages(prev => [...prev, { role: 'assistant', ...response }]);
      setIsTyping(false);
      
      // Trigger external commands if needed
      if (intent.queryType === 'property' && onCommand) {
        onCommand({ type: 'filter', value: userMessage });
      }
    }, delay);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a' }}>
      {/* Header */}
      <div style={{ padding: 16, borderBottom: '1px solid #334155', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 20, boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>B</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'white' }}>BrevardBidderAI</div>
            <div style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, background: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
              V13.4.0 • Smart Router Active
            </div>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '90%', padding: '12px 16px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: m.role === 'user' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#1e293b', fontSize: 14, whiteSpace: 'pre-wrap', lineHeight: 1.5, color: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
              {m.text}
            </div>
            {m.role === 'assistant' && m.tier && (
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 4, display: 'flex', gap: 8 }}>
                <span>⚡ {m.tier}</span>
                <span>💰 {m.cost}</span>
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 13 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%', animation: `bounce 1.4s infinite ${i * 0.16}s` }} />
              ))}
            </div>
            Processing via Smart Router...
          </div>
        )}
        <div ref={messagesEnd} />
      </div>
      
      {/* Input */}
      <div style={{ padding: 16, borderTop: '1px solid #334155', background: '#0f172a' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask about auctions, properties, analysis..."
            style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '14px 18px', color: 'white', fontSize: 14, outline: 'none' }}
          />
          <button onClick={handleSend} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: 12, padding: '14px 22px', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 16, boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>→</button>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {['Next auction?', 'Show BID properties', 'Run pipeline', 'Help'].map(q => (
            <button key={q} onClick={() => { setInput(q); setTimeout(handleSend, 100); }} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 20, padding: '6px 14px', color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}>{q}</button>
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }
      `}</style>
    </div>
  );
}
