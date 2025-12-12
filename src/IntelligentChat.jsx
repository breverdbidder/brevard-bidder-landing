// BidDeed.AI - Intelligent Chat with LangGraph Pipeline Integration
// Now triggers full 12-stage analysis on demand
// Author: Ariel Shapira, Solo Founder - Everest Capital USA

import React, { useState, useEffect, useRef } from 'react';
import { Send, Zap, MapPin, Calendar, Building2, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const SUPABASE_URL = "https://mocerqjnksmhcjzxrewo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2VycWpua3NtaGNqenhyZXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MzI1MjYsImV4cCI6MjA4MDEwODUyNn0.ySFJIOngWWB0aqYra4PoGFuqcbdHOx1ZV6T9-klKQDw";

// API endpoints
const API_BASE = '/api';
const PIPELINE_TRIGGER = `${API_BASE}/pipeline-trigger`;
const PIPELINE_STATUS = `${API_BASE}/pipeline-status`;
const CHAT_API = `${API_BASE}/chat`;

// Auction calendar
const AUCTION_CALENDAR = {
  foreclosure: [
    { date: "2025-12-17", day: "Wednesday", time: "11:00 AM", location: "Titusville Courthouse", type: "IN-PERSON" },
    { date: "2026-01-07", day: "Tuesday", time: "11:00 AM", location: "Titusville Courthouse", type: "IN-PERSON" }
  ],
  taxDeed: [
    { date: "2025-12-18", day: "Thursday", time: "9:00 AM", location: "brevard.realforeclose.com", type: "ONLINE" }
  ]
};

// Intent detection patterns
const PIPELINE_INTENTS = {
  singleAnalysis: /(?:analyze|analysis|check|evaluate|assess|run pipeline on|deep dive)\s+(?:property\s+)?(?:at\s+)?(.+)/i,
  batchAnalysis: /(?:analyze|run|process|check)\s+(?:all\s+)?(?:dec(?:ember)?\s*(\d{1,2})|(\d{4}-\d{2}-\d{2}))\s*(?:auction|properties|batch)?/i,
  addressExtract: /(\d+\s+[\w\s]+(?:st|street|rd|road|ave|avenue|dr|drive|blvd|boulevard|ln|lane|ct|court|way|pl|place)[\w\s,]*)/i,
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
  const [pipelineStatus, setPipelineStatus] = useState(null);
  const [properties, setProperties] = useState([]);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    initChat();
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initChat = async () => {
    const props = await fetchProperties("2025-12-17");
    setProperties(props);
    
    const greeting = {
      role: 'assistant',
      text: `👋 **BidDeed.AI V13.4.0** - LangGraph Pipeline Connected

📅 Today: **${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}**

🔌 **Live Systems:**
• LangGraph 12-Stage Orchestrator
• BECA Manus V22 OCR Scraper
• XGBoost ML (64.4% accuracy)
• Smart Router V5

💬 **Try these commands:**
• "Analyze 123 Main St Melbourne" → Full pipeline
• "Run Dec 17 batch" → All properties
• "Show Dec 17 properties" → Quick view
• "Calendar" → Upcoming auctions

⚡ Pipeline executes autonomously in ~3-5 minutes`,
      timestamp: new Date().toISOString(),
    };
    setMessages([greeting]);
  };

  // Detect intent from message
  const detectIntent = (message) => {
    // Check for single property analysis
    const singleMatch = message.match(PIPELINE_INTENTS.singleAnalysis);
    if (singleMatch) {
      const addressMatch = singleMatch[1].match(PIPELINE_INTENTS.addressExtract);
      if (addressMatch) {
        return {
          type: 'pipeline_single',
          address: addressMatch[1].trim(),
          raw: singleMatch[1],
        };
      }
    }

    // Check for batch analysis
    const batchMatch = message.match(PIPELINE_INTENTS.batchAnalysis);
    if (batchMatch) {
      const day = batchMatch[1] || batchMatch[2];
      let auctionDate;
      if (day && day.length <= 2) {
        auctionDate = `2025-12-${day.padStart(2, '0')}`;
      } else if (day) {
        auctionDate = day;
      } else {
        auctionDate = '2025-12-17';
      }
      return {
        type: 'pipeline_batch',
        auctionDate,
      };
    }

    // Default to chat
    return { type: 'chat' };
  };

  // Trigger pipeline
  const triggerPipeline = async (intent) => {
    try {
      const payload = intent.type === 'pipeline_batch'
        ? { action: 'batch', auctionDate: intent.auctionDate }
        : { action: 'single', address: intent.address, city: extractCity(intent.address) };

      const response = await fetch(PIPELINE_TRIGGER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success && data.runId) {
        setPipelineStatus({
          runId: data.runId,
          status: 'queued',
          startTime: new Date(),
          intent,
        });
        
        // Start polling
        startPolling(data.runId);
        return data;
      } else {
        throw new Error(data.error || 'Failed to trigger pipeline');
      }
    } catch (error) {
      console.error('Pipeline trigger error:', error);
      throw error;
    }
  };

  // Poll for pipeline status
  const startPolling = (runId) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    
    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`${PIPELINE_STATUS}?runId=${runId}`);
        const data = await response.json();

        setPipelineStatus(prev => ({
          ...prev,
          ...data,
        }));

        // Update progress message
        updateProgressMessage(data);

        // Stop polling when complete
        if (!data.inProgress) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          handlePipelineComplete(data);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 5000); // Poll every 5 seconds
  };

  // Update progress message in chat
  const updateProgressMessage = (status) => {
    setMessages(prev => {
      const filtered = prev.filter(m => !m.isPipelineProgress);
      return [...filtered, {
        role: 'assistant',
        isPipelineProgress: true,
        text: `🔄 **Pipeline Running...**

**Status:** ${status.status}
**Progress:** ${status.progressPercent || 0}%
**Elapsed:** ${status.elapsedSeconds || 0}s
${status.estimatedRemainingSeconds ? `**Est. Remaining:** ${status.estimatedRemainingSeconds}s` : ''}

${getProgressBar(status.progressPercent || 0)}`,
        timestamp: new Date().toISOString(),
      }];
    });
  };

  // Handle pipeline completion
  const handlePipelineComplete = (status) => {
    const isSuccess = status.conclusion === 'success';
    
    let resultText;
    if (isSuccess && status.logSummary) {
      const summary = status.logSummary;
      resultText = `✅ **Pipeline Complete!**

**Results:**
• Properties Analyzed: ${summary.properties}
• 🟢 BID: ${summary.recommendations.BID}
• 🟡 REVIEW: ${summary.recommendations.REVIEW}
• 🔴 SKIP: ${summary.recommendations.SKIP}
${summary.totalJudgment ? `• Total Judgment: $${summary.totalJudgment.toLocaleString()}` : ''}

**Duration:** ${status.elapsedSeconds}s

${status.results?.properties ? formatPropertyResults(status.results.properties) : ''}

[View Full Report](${status.htmlUrl})`;
    } else if (isSuccess) {
      resultText = `✅ **Pipeline Complete!**

Analysis finished in ${status.elapsedSeconds}s.

[View Details](${status.htmlUrl})`;
    } else {
      resultText = `❌ **Pipeline Failed**

Status: ${status.conclusion}
Duration: ${status.elapsedSeconds}s

${status.logSummary?.errors?.length ? `Errors:\n${status.logSummary.errors.join('\n')}` : ''}

[View Logs](${status.htmlUrl})`;
    }

    setMessages(prev => {
      const filtered = prev.filter(m => !m.isPipelineProgress);
      return [...filtered, {
        role: 'assistant',
        text: resultText,
        timestamp: new Date().toISOString(),
      }];
    });

    setPipelineStatus(null);
  };

  // Handle send message
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      text: userMessage,
      timestamp: new Date().toISOString(),
    }]);

    try {
      const intent = detectIntent(userMessage);

      if (intent.type === 'pipeline_single' || intent.type === 'pipeline_batch') {
        // Pipeline request
        const actionDesc = intent.type === 'pipeline_batch'
          ? `batch analysis for ${intent.auctionDate}`
          : `analysis for "${intent.address}"`;

        setMessages(prev => [...prev, {
          role: 'assistant',
          text: `🚀 **Triggering LangGraph Pipeline**

**Action:** ${actionDesc}
**Stages:** Discovery → Scraping → Title → Liens → Tax → Demographics → ML → MaxBid → Decision → Report

Initializing...`,
          timestamp: new Date().toISOString(),
        }]);

        await triggerPipeline(intent);

      } else {
        // Regular chat - use existing chat API
        const response = await fetch(CHAT_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            history: messages.filter(m => !m.isPipelineProgress).slice(-10).map(m => ({
              role: m.role,
              content: m.text,
            })),
          }),
        });

        const data = await response.json();
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          text: data.response || data.error || 'No response received',
          source: data.source,
          timestamp: new Date().toISOString(),
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `❌ Error: ${error.message}`,
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden h-[600px] flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <span className="font-semibold text-white">BidDeed.AI Chat</span>
          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
            LangGraph Connected
          </span>
        </div>
        {pipelineStatus && (
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            <span className="text-blue-400">Pipeline: {pipelineStatus.status}</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : msg.isPipelineProgress
                  ? 'bg-amber-900/30 border border-amber-500/30 text-amber-100'
                  : 'bg-slate-800 text-gray-100'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {formatMessage(msg.text)}
              </div>
              {msg.source && (
                <div className="mt-2 text-xs text-gray-400">
                  via {msg.source}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700 bg-slate-800/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Try: 'Analyze 1847 Coral Bay Dr Satellite Beach' or 'Run Dec 17 batch'"
            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg px-4 py-2 transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <div className="mt-2 flex gap-2 flex-wrap">
          {['Analyze 1847 Coral Bay Dr', 'Run Dec 17 batch', 'Calendar', 'Show Dec 17 properties'].map(suggestion => (
            <button
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="text-xs bg-slate-700 hover:bg-slate-600 text-gray-300 px-2 py-1 rounded transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper functions
function extractCity(address) {
  const cities = ['Melbourne', 'Satellite Beach', 'Palm Bay', 'Cocoa', 'Titusville', 'Merritt Island', 'Indialantic', 'Rockledge', 'Viera'];
  for (const city of cities) {
    if (address.toLowerCase().includes(city.toLowerCase())) {
      return city;
    }
  }
  return 'Melbourne';
}

function getProgressBar(percent) {
  const filled = Math.round(percent / 5);
  const empty = 20 - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${percent}%`;
}

function formatMessage(text) {
  // Convert markdown-style formatting
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1') // Bold markers (React will handle styling)
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" class="text-blue-400 underline">$1</a>');
}

function formatPropertyResults(properties) {
  if (!properties || properties.length === 0) return '';
  
  return `\n**Top Results:**\n${properties.slice(0, 5).map(p => 
    `• ${p.address}: ${p.recommendation} (ML: ${p.mlScore || 'N/A'})`
  ).join('\n')}`;
}

export default IntelligentChat;
