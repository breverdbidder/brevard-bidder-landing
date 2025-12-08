// BrevardBidderAI Agentic UI Demo
// Split-screen interface with Chat + Map + Property Drawer
// Author: Ariel Shapira, Everest Capital USA

import React, { useState, useRef, useCallback, useEffect } from 'react';

// Mock data for demo
const MOCK_PROPERTIES = [
  {
    id: '1',
    address: '123 Ocean Blvd',
    city: 'Melbourne',
    zip: '32901',
    latitude: 28.0836,
    longitude: -80.6081,
    case_number: '05-2024-CA-012345',
    recommendation: 'BID',
    ml_score: 87,
    max_bid: 142000,
    judgment_amount: 189000,
    arv: 285000,
    repairs: 35000,
    bid_judgment_ratio: 75,
    lien_count: 2,
    sale_date: 'Dec 17, 2024',
    photo_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
  },
  {
    id: '2',
    address: '456 Palm Dr',
    city: 'Satellite Beach',
    zip: '32937',
    latitude: 28.1761,
    longitude: -80.5901,
    case_number: '05-2024-CA-012346',
    recommendation: 'REVIEW',
    ml_score: 65,
    max_bid: 98000,
    judgment_amount: 145000,
    arv: 220000,
    repairs: 50000,
    bid_judgment_ratio: 68,
    lien_count: 3,
    sale_date: 'Dec 17, 2024',
    photo_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
  },
  {
    id: '3',
    address: '789 Riverside Ave',
    city: 'Cocoa',
    zip: '32922',
    latitude: 28.3861,
    longitude: -80.7420,
    case_number: '05-2024-CA-012347',
    recommendation: 'SKIP',
    ml_score: 34,
    max_bid: 45000,
    judgment_amount: 210000,
    arv: 180000,
    repairs: 85000,
    bid_judgment_ratio: 21,
    lien_count: 5,
    senior_lien_survives: true,
    sale_date: 'Dec 17, 2024',
    photo_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400',
  },
  {
    id: '4',
    address: '321 Banana River Dr',
    city: 'Merritt Island',
    zip: '32953',
    latitude: 28.3584,
    longitude: -80.6823,
    case_number: '05-2024-CA-012348',
    recommendation: 'BID',
    ml_score: 91,
    max_bid: 178000,
    judgment_amount: 225000,
    arv: 340000,
    repairs: 28000,
    bid_judgment_ratio: 79,
    lien_count: 1,
    sale_date: 'Dec 17, 2024',
    photo_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
  },
];

const STATUS_COLORS = {
  BID: '#10B981',
  REVIEW: '#F59E0B',
  SKIP: '#EF4444',
};

const SUGGESTED_PROMPTS = [
  "Show all BID properties",
  "Filter ML score > 70",
  "What liens survive?",
  "Analyze selected property",
];

export default function AgenticDemo() {
  const [properties] = useState(MOCK_PROPERTIES);
  const [filteredProperties, setFilteredProperties] = useState(MOCK_PROPERTIES);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Welcome to BrevardBidderAI. I can help you analyze foreclosure auctions in Brevard County. Try clicking a property on the map or ask me a question!' }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const addMessage = (role, content) => {
    setMessages(prev => [...prev, { role, content }]);
  };

  const handleCommand = async (cmd) => {
    setIsProcessing(true);
    addMessage('user', cmd);
    
    const lowerCmd = cmd.toLowerCase();
    
    setTimeout(() => {
      if (lowerCmd.includes('bid') && (lowerCmd.includes('show') || lowerCmd.includes('all'))) {
        const bids = properties.filter(p => p.recommendation === 'BID');
        setFilteredProperties(bids);
        addMessage('assistant', `Found ${bids.length} properties with BID recommendation. These have the best risk/reward profiles based on our ML analysis.`);
      } 
      else if (lowerCmd.includes('ml') || lowerCmd.includes('score')) {
        const high = properties.filter(p => p.ml_score >= 70);
        setFilteredProperties(high);
        addMessage('assistant', `Filtering ${high.length} properties with ML Score ≥ 70. These have the highest probability of profitable acquisition.`);
      }
      else if (lowerCmd.includes('lien') || lowerCmd.includes('survive')) {
        addMessage('assistant', `**Lien Priority in Florida:**\n\n• First mortgage wipes junior liens\n• HOA super-priority: 6 months dues survive\n• Tax liens ALWAYS survive\n• Municipal liens often survive\n\n⚠️ Property at 789 Riverside has a senior lien that survives!`);
      }
      else if (lowerCmd.includes('analyze') && selectedProperty) {
        addMessage('assistant', `**Analysis: ${selectedProperty.address}**\n\nML Score: ${selectedProperty.ml_score}/100\nMax Bid: $${selectedProperty.max_bid.toLocaleString()}\nARV: $${selectedProperty.arv.toLocaleString()}\nRepairs: $${selectedProperty.repairs.toLocaleString()}\n\nRecommendation: ${selectedProperty.recommendation}`);
      }
      else if (lowerCmd.includes('reset') || lowerCmd.includes('all properties')) {
        setFilteredProperties(properties);
        addMessage('assistant', `Showing all ${properties.length} properties.`);
      }
      else {
        addMessage('assistant', `I can help you:\n• "Show all BID properties"\n• "Filter ML score > 70"\n• "What liens survive?"\n• Click a property, then "Analyze selected"`);
      }
      setIsProcessing(false);
    }, 500);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    handleCommand(input);
    setInput('');
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      {/* Left Panel - Chat */}
      <div className="w-[30%] min-w-[300px] flex flex-col border-r border-slate-800">
        {/* Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center font-bold">B</div>
            <div>
              <h1 className="font-semibold">BrevardBidderAI</h1>
              <p className="text-xs text-gray-500">Agentic AI Copilot</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                m.role === 'user' ? 'bg-blue-600' : 'bg-slate-800'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex gap-1 text-gray-400">
              <span className="animate-bounce">●</span>
              <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>●</span>
              <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
            </div>
          )}
        </div>

        {/* Suggested Prompts */}
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {SUGGESTED_PROMPTS.map((p, i) => (
            <button key={i} onClick={() => setInput(p)} className="text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded-full">
              {p}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about foreclosures..."
              className="flex-1 bg-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button onClick={handleSend} className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg">
              →
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Map Area */}
      <div className="flex-1 relative bg-slate-900">
        {/* Simulated Map */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
          
          {/* Property Markers */}
          {filteredProperties.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setSelectedProperty(p)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-white shadow-lg transition-all hover:scale-125 ${
                selectedProperty?.id === p.id ? 'ring-4 ring-white/50 scale-125' : ''
              }`}
              style={{
                backgroundColor: STATUS_COLORS[p.recommendation],
                left: `${20 + (i * 18)}%`,
                top: `${25 + (i * 15)}%`,
              }}
            >
              <span className="sr-only">{p.address}</span>
            </button>
          ))}
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur p-3 rounded-lg">
          <div className="text-xs text-gray-400 mb-2">Recommendation</div>
          <div className="flex gap-3">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs">{status}</span>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-2">{filteredProperties.length} properties</div>
        </div>

        {/* Controls */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <button onClick={() => setFilteredProperties(properties)} className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-2 rounded-lg">
            🔄 Reset
          </button>
        </div>

        {/* Property Drawer */}
        {selectedProperty && (
          <div className="absolute right-0 top-0 h-full w-[350px] bg-slate-900 border-l border-slate-700 shadow-xl overflow-y-auto animate-in slide-in-from-right">
            <div className="p-4 border-b border-slate-700">
              <div className="flex justify-between">
                <span className={`text-xs px-2 py-1 rounded font-semibold text-white`} style={{ backgroundColor: STATUS_COLORS[selectedProperty.recommendation] }}>
                  {selectedProperty.recommendation}
                </span>
                <button onClick={() => setSelectedProperty(null)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <h2 className="text-lg font-semibold mt-2">{selectedProperty.address}</h2>
              <p className="text-sm text-gray-400">{selectedProperty.city}, FL {selectedProperty.zip}</p>
            </div>

            {selectedProperty.photo_url && (
              <img src={selectedProperty.photo_url} alt="" className="w-full h-40 object-cover" />
            )}

            <div className="p-4 grid grid-cols-2 gap-3">
              <div className="bg-slate-800 p-3 rounded-lg">
                <div className="text-xs text-gray-400">ML Score</div>
                <div className="text-xl font-semibold text-emerald-400 font-mono">{selectedProperty.ml_score}</div>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg">
                <div className="text-xs text-gray-400">Max Bid</div>
                <div className="text-xl font-semibold font-mono">${selectedProperty.max_bid.toLocaleString()}</div>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg">
                <div className="text-xs text-gray-400">Judgment</div>
                <div className="text-lg font-semibold font-mono">${selectedProperty.judgment_amount.toLocaleString()}</div>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg">
                <div className="text-xs text-gray-400">ARV</div>
                <div className="text-lg font-semibold font-mono">${selectedProperty.arv.toLocaleString()}</div>
              </div>
            </div>

            {selectedProperty.senior_lien_survives && (
              <div className="mx-4 mb-4 bg-red-500/20 text-red-400 text-sm p-3 rounded-lg">
                ⚠️ Senior lien survives foreclosure
              </div>
            )}

            <div className="p-4 space-y-2">
              <button className="w-full bg-emerald-600 hover:bg-emerald-700 py-2 rounded-lg font-medium">
                📄 Generate Report
              </button>
              <button 
                onClick={() => handleCommand(`Analyze ${selectedProperty.address}`)}
                className="w-full bg-slate-700 hover:bg-slate-600 py-2 rounded-lg"
              >
                💬 Analyze in Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
