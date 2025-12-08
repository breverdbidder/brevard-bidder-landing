// BrevardBidderAI Chat Panel Component
// NLP-powered Agentic AI Interface
// Author: Ariel Shapira, Everest Capital USA

import React, { useState, useRef, useEffect } from 'react';

const SUGGESTED_PROMPTS = [
  "Show all BID properties",
  "Analyze Dec 17 auction",
  "What liens survive foreclosure?",
  "Filter by ML score > 70",
];

const DEMO_RESPONSES = {
  "Show all BID properties": "Found 3 properties with BID recommendation:

1. **123 Ocean Blvd** - ML Score: 87, Max Bid: $185,000
2. **321 Harbor View** - ML Score: 91, Max Bid: $225,000
3. **555 Brevard Way** - ML Score: 78, Max Bid: $165,000

All properties have favorable lien positions and strong equity margins.",
  "Analyze Dec 17 auction": "Dec 17, 2025 Auction Analysis:

📊 **19 properties** scheduled
✅ **4 BID** recommendations
⚠️ **3 REVIEW** recommendations
❌ **12 SKIP** recommendations

Total judgment value: $4.35M
Best opportunity: 321 Harbor View (91 ML Score)",
  "default": "I can help you analyze foreclosure properties, calculate max bids, check lien priority, and generate reports. What would you like to know?"
};

export function ChatPanel({ onPropertyCommand }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "👋 Welcome to BrevardBidderAI. I'm your Agentic AI Copilot for Brevard County foreclosure auctions. Ask me anything about properties, liens, or auction strategy." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = DEMO_RESPONSES[userMessage] || DEMO_RESPONSES.default;
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 1000);
  };

  const handlePromptClick = (prompt) => {
    setInput(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Header */}
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-800 text-gray-200'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="px-4 pb-2">
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handlePromptClick(prompt)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-gray-300 px-3 py-1.5 rounded-full transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about any Brevard County foreclosure..."
            className="flex-1 bg-slate-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={handleSend}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPanel;
