// BrevardBidderAI Application Demo
// Standalone split-screen interface demo
// Author: Ariel Shapira, Everest Capital USA

import React, { useState } from 'react';

const STATUS_COLORS = {
  BID: '#10B981',
  REVIEW: '#F59E0B',
  SKIP: '#EF4444',
};

const MOCK_PROPERTIES = [
  { id: 1, address: "123 Ocean Blvd, Satellite Beach", recommendation: "BID", ml_score: 87, max_bid: 185000, case_number: "05-2024-CA-012345" },
  { id: 2, address: "456 Riverside Dr, Melbourne", recommendation: "REVIEW", ml_score: 65, max_bid: 142000, case_number: "05-2024-CA-023456" },
  { id: 3, address: "789 Palm Ave, Cocoa Beach", recommendation: "SKIP", ml_score: 32, max_bid: 95000, case_number: "05-2024-CA-034567" },
  { id: 4, address: "321 Harbor View, Merritt Island", recommendation: "BID", ml_score: 91, max_bid: 225000, case_number: "05-2024-CA-045678" },
  { id: 5, address: "555 Brevard Way, Titusville", recommendation: "BID", ml_score: 78, max_bid: 165000, case_number: "05-2024-CA-056789" },
];

const SUGGESTED_PROMPTS = ["Show all BID properties", "Analyze Dec 17 auction", "What liens survive foreclosure?", "Filter by ML score > 70"];

export function AppDemo() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "👋 Welcome to BrevardBidderAI. I'm your Agentic AI Copilot for Brevard County foreclosure auctions." }
  ]);
  const [input, setInput] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: `Analyzing: "${input}"...

Found ${MOCK_PROPERTIES.filter(p => p.recommendation === 'BID').length} BID recommendations in current auction.` }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="h-screen w-screen bg-slate-950 flex overflow-hidden">
      {/* Chat Panel */}
      <div className="w-[30%] min-w-[320px] border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">BB</span>
            </div>
            <div>
              <h1 className="text-white font-semibold">BrevardBidderAI</h1>
              <p className="text-xs text-gray-400">Agentic AI Copilot</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg p-3 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-200'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-800 rounded-lg p-3 flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
              </div>
            </div>
          )}
        </div>

        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button key={idx} onClick={() => setInput(prompt)} className="text-xs bg-slate-800 hover:bg-slate-700 text-gray-300 px-3 py-1.5 rounded-full">
              {prompt}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-700 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about any foreclosure..."
            className="flex-1 bg-slate-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button onClick={handleSend} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg">→</button>
        </div>
      </div>

      {/* Map Panel */}
      <div className="flex-1 relative">
        <div className={`h-full transition-all ${selectedProperty ? 'mr-[380px]' : ''}`}>
          <div className="h-full bg-gradient-to-br from-slate-800 to-slate-900 relative">
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234B5563'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/svg%3E")`}} />
            
            {MOCK_PROPERTIES.map((property, idx) => (
              <div
                key={property.id}
                onClick={() => setSelectedProperty(property)}
                className={`absolute cursor-pointer transition-transform hover:scale-125 ${selectedProperty?.id === property.id ? 'scale-125 z-20' : 'z-10'}`}
                style={{ left: `${15 + (idx * 16)}%`, top: `${20 + (idx * 14)}%` }}
              >
                <div className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: STATUS_COLORS[property.recommendation] }}>
                  {idx + 1}
                </div>
              </div>
            ))}

            <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur p-3 rounded-lg">
              <div className="text-xs text-gray-400 mb-2">Recommendation</div>
              <div className="flex gap-3">
                {Object.entries(STATUS_COLORS).map(([status, color]) => (
                  <div key={status} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs text-white">{status}</span>
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-2">{MOCK_PROPERTIES.length} properties</div>
            </div>
          </div>
        </div>

        {/* Property Drawer */}
        {selectedProperty && (
          <div className="absolute top-0 right-0 h-full w-[380px] bg-slate-900 border-l border-slate-700 overflow-y-auto">
            <div className="p-4 border-b border-slate-700 flex justify-between">
              <div>
                <span className={`text-white text-xs px-2 py-1 rounded font-semibold`} style={{backgroundColor: STATUS_COLORS[selectedProperty.recommendation]}}>
                  {selectedProperty.recommendation}
                </span>
                <h2 className="text-lg font-semibold text-white mt-2">{selectedProperty.address}</h2>
              </div>
              <button onClick={() => setSelectedProperty(null)} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>
            
            <div className="p-4 grid grid-cols-2 gap-3">
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="text-xs text-gray-400">ML Score</div>
                <div className="text-lg font-semibold text-emerald-400 font-mono">{selectedProperty.ml_score}</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="text-xs text-gray-400">Max Bid</div>
                <div className="text-lg font-semibold text-white font-mono">${selectedProperty.max_bid.toLocaleString()}</div>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-medium">📄 Generate Report</button>
              <button className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg font-medium">💬 Analyze in Chat</button>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur border-t border-slate-700 px-4 py-2 flex justify-between text-xs text-gray-500">
        <span>© 2025 Ariel Shapira, Everest Capital USA</span>
        <span>BrevardBidderAI v13.4.0</span>
      </div>
    </div>
  );
}

export default AppDemo;
