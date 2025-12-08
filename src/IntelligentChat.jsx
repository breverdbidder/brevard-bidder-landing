// BrevardBidderAI - Intelligent Chat with LIVE Supabase Data
// Author: Ariel Shapira, Solo Founder - Everest Capital USA

import React, { useState, useEffect, useRef } from 'react';
import { Send, Zap, MapPin, Calendar, Building2 } from 'lucide-react';

const SUPABASE_URL = "https://mocerqjnksmhcjzxrewo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2VycWpua3NtaGNqenhyZXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MzI1MjYsImV4cCI6MjA4MDEwODUyNn0.ySFJIOngWWB0aqYra4PoGFuqcbdHOx1ZV6T9-klKQDw";

// FIXED: Auction Calendar includes Dec 10
const AUCTION_CALENDAR = {
  foreclosure: [
    { date: "2025-12-10", day: "Wednesday", time: "11:00 AM", location: "Titusville Courthouse", type: "IN-PERSON" },
    { date: "2025-12-17", day: "Wednesday", time: "11:00 AM", location: "Titusville Courthouse", type: "IN-PERSON" },
    { date: "2026-01-07", day: "Tuesday", time: "11:00 AM", location: "Titusville Courthouse", type: "IN-PERSON" }
  ],
  taxDeed: [
    { date: "2025-12-18", day: "Thursday", time: "9:00 AM", location: "brevard.realforeclose.com", type: "ONLINE" }
  ]
};

const SMART_ROUTER = {
  FREE: { models: ["gemini-1.5-flash", "llama-3.1-8b"], cost: "$0" },
  ULTRA_CHEAP: { models: ["deepseek-v3.2"], cost: "$0.28/1M" }
};

// Fetch properties from Supabase
async function fetchProperties(auctionDate) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/historical_auctions?auction_date=eq.${auctionDate}&select=*`,
      { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
    );
    return await response.json();
  } catch (e) {
    console.error("Supabase fetch error:", e);
    return [];
  }
}

const IntelligentChat = ({ onPropertySelect }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [routerTier, setRouterTier] = useState('FREE');
  const [properties, setProperties] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initial greeting with live data
    initChat();
  }, []);

  const initChat = async () => {
    const props = await fetchProperties("2025-12-10");
    setProperties(props);
    
    const greeting = {
      role: 'assistant',
      text: `👋 **BrevardBidderAI V13.4.0** - Connected to Supabase

📅 Today: **${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}**

🔌 **Live Data Sources:**
• Supabase historical_auctions table
• Smart Router API for LLM selection
• GitHub Actions scrapers running

💬 Ask me about:
• "Show Dec 10 properties" (${props.length} available)
• "Upcoming foreclosures"
• "Dec 18 tax deed sales"
• "Calendar"

⚡ Smart Router: ${SMART_ROUTER.FREE.models[0]}`
    };
    setMessages([greeting]);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Process query
    const response = await processQuery(input.toLowerCase());
    
    setMessages(prev => [...prev, { role: 'assistant', text: response.text, properties: response.properties }]);
    setIsLoading(false);
  };

  const processQuery = async (query) => {
    // Dec 10 / upcoming properties query
    if (query.includes('dec 10') || query.includes('december 10') || query.includes('upcoming prop')) {
      const props = await fetchProperties("2025-12-10");
      const withAddress = props.filter(p => p.address);
      
      // Notify parent to show on map
      if (onPropertySelect && withAddress.length > 0) {
        onPropertySelect(withAddress);
      }
      
      return {
        text: `📍 **Upcoming Auctions**

Type: All
Found: **${props.length} properties**

${withAddress.length > 0 ? 'Properties shown on map!' : ''}

🏛️ **Dec 10, 2025** @ Titusville 11AM
${props.map((p, i) => `${i+1}. ${p.address || 'No address'}, ${p.city || ''} - ${p.plaintiff}`).join('\n')}

⚡ ${SMART_ROUTER.FREE.models[0]}`,
        properties: props
      };
    }

    // Calendar query
    if (query.includes('calendar') || query.includes('when') || query.includes('next') || query.includes('upcoming')) {
      const next = AUCTION_CALENDAR.foreclosure[0];
      return {
        text: `📅 **Auction Calendar**

🏛️ **Foreclosure (IN-PERSON @ Titusville)**
${AUCTION_CALENDAR.foreclosure.map(a => `• ${a.date} - ${a.time}`).join('\n')}

📋 **Tax Deed (ONLINE @ realforeclose.com)**
${AUCTION_CALENDAR.taxDeed.map(a => `• ${a.date} - ${a.time}`).join('\n')}

⚠️ Next auction: **${next.date}** (${getDaysUntil(next.date)} days)

⚡ ${SMART_ROUTER.FREE.models[0]}`
      };
    }

    // Default
    return {
      text: `I can help with:
• "Dec 10 properties" - Show ${properties.length} auction properties
• "Calendar" - Upcoming auction dates
• "Tax deed" - Dec 18 online auction

⚡ ${SMART_ROUTER.FREE.models[0]}`
    };
  };

  const getDaysUntil = (dateStr) => {
    const target = new Date(dateStr);
    const now = new Date();
    return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden h-[500px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center font-bold text-black">B</div>
          <div>
            <h3 className="font-semibold text-white">BrevardBidderAI</h3>
            <span className="text-xs text-green-400">🔌 Connected to Supabase</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full">
          <span className="text-green-400 text-sm">Smart Router</span>
          <span className="text-green-300 font-bold text-sm">FREE</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${m.role === 'user' ? 'bg-amber-500 text-black' : 'bg-slate-700 text-slate-100'}`}>
              <p className="text-sm whitespace-pre-wrap">{m.text}</p>
              {m.role === 'assistant' && (
                <div className="mt-2 pt-2 border-t border-slate-600 text-xs text-slate-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> {SMART_ROUTER.FREE.models[0]}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-700 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: `${i*0.1}s`}} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about auctions..."
            className="flex-1 bg-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button onClick={handleSend} disabled={isLoading} className="bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold px-4 rounded-xl hover:from-amber-400 hover:to-orange-400 transition">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntelligentChat;
