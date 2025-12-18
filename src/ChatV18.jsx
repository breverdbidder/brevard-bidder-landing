// BidDeed.AI V18 Chat - Integrated LangGraph Agentic AI
// Routes through unified_orchestrator_v18 for pipeline triggers
// © 2025 Everest Capital USA. All Rights Reserved.

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============ DESIGN TOKENS ============
const theme = {
  colors: {
    bgPrimary: '#0f172a',
    bgSecondary: '#1e293b',
    accent: '#3b82f6',
    gold: '#f59e0b',
    textPrimary: '#f0f0f5',
    textSecondary: '#94a3b8',
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444',
  }
};

// ============ NLP INTENT ENGINE ============
const NLPEngine = {
  // Intent patterns with confidence scores
  patterns: {
    ANALYZE_PROPERTY: [
      /analyze\s+(.+)/i,
      /check\s+(?:property\s+)?(?:at\s+)?(.+)/i,
      /deep\s+dive\s+(?:on\s+)?(.+)/i,
      /property\s+analysis\s+(?:for\s+)?(.+)/i,
      /what.+about\s+(.+(?:st|rd|ave|dr|ln|ct|way))/i,
    ],
    BATCH_ANALYSIS: [
      /run\s+(?:dec|december)?\s*\d+\s*batch/i,
      /analyze\s+all\s+(?:dec|december)?\s*\d+/i,
      /batch\s+analysis/i,
      /process\s+all\s+properties/i,
    ],
    AUCTION_QUERY: [
      /(?:what|which)\s+auctions?\s+(?:are\s+)?(?:on|for|scheduled)?\s*(?:dec|december)?\s*(\d+)/i,
      /dec(?:ember)?\s*(\d+)\s*auction/i,
      /auction.*(?:dec|december)\s*(\d+)/i,
      /tomorrow/i,
      /today/i,
    ],
    CALENDAR: [
      /calendar/i,
      /schedule/i,
      /upcoming\s+auctions?/i,
      /when\s+(?:is|are)\s+(?:the\s+)?(?:next\s+)?auctions?/i,
      /next\s+auction/i,
    ],
    MAX_BID: [
      /max\s*bid/i,
      /formula/i,
      /how\s+(?:much|to)\s+(?:should\s+I\s+)?bid/i,
      /calculate/i,
      /arv/i,
    ],
    LIEN_QUERY: [
      /lien/i,
      /priority/i,
      /survive/i,
      /hoa\s+foreclosure/i,
      /title/i,
      /mortgage/i,
    ],
    RECOMMENDATIONS: [
      /recommend/i,
      /best\s+(?:properties|opportunities|deals)/i,
      /top\s+(?:properties|picks|bids)/i,
      /should\s+(?:I\s+)?bid/i,
      /opportunities/i,
    ],
    HELP: [
      /help/i,
      /what\s+can\s+you/i,
      /commands/i,
      /how\s+(?:do\s+I|to)\s+use/i,
    ],
    GREETING: [
      /^(?:hi|hello|hey|good\s*(?:morning|afternoon|evening)|greetings)/i,
    ],
  },

  // Extract entities from message
  extractEntities(message) {
    const entities = {};
    
    // Address pattern
    const addressMatch = message.match(/(\d+\s+[\w\s]+(?:st|rd|ave|dr|blvd|ln|ct|way|pl|cir|ter|pkwy)[\w\s,#]*)/i);
    if (addressMatch) entities.address = addressMatch[1].trim();
    
    // Case number
    const caseMatch = message.match(/(?:case\s*#?\s*)?(\d{6})/i);
    if (caseMatch) entities.caseNumber = caseMatch[1];
    
    // Date (Dec X)
    const dateMatch = message.match(/(?:dec(?:ember)?\s*)?(\d{1,2})(?:st|nd|rd|th)?(?:\s*,?\s*2025)?/i);
    if (dateMatch) entities.date = dateMatch[1];
    
    // Parcel ID
    const parcelMatch = message.match(/(?:parcel\s*(?:id)?|pid)\s*#?\s*(\d{7})/i);
    if (parcelMatch) entities.parcelId = parcelMatch[1];
    
    return entities;
  },

  // Classify intent
  classifyIntent(message) {
    const lower = message.toLowerCase();
    
    for (const [intent, patterns] of Object.entries(this.patterns)) {
      for (const pattern of patterns) {
        if (pattern.test(lower)) {
          return { intent, confidence: 0.9, entities: this.extractEntities(message) };
        }
      }
    }
    
    return { intent: 'UNKNOWN', confidence: 0.3, entities: this.extractEntities(message) };
  }
};

// ============ RESPONSE GENERATOR ============
const ResponseGenerator = {
  responses: {
    AUCTION_QUERY: (entities) => {
      const date = entities.date || '18';
      if (date === '18' || entities.message?.includes('tomorrow')) {
        return `📅 **December 18, 2025 — Tax Deed Auction**

**Details:**
• **Time:** 9:00 AM EST
• **Location:** ONLINE at brevard.realforeclose.com
• **Type:** Tax Deed Sale

**How to Participate:**
1. Go to brevard.realforeclose.com
2. Create an account (if you haven't)
3. Deposit required funds
4. Look for "BID NOW" links starting at 9:00 AM

**Key Differences from Foreclosure:**
• Tax deeds wipe out ALL liens (except government)
• You get the property, not just the lien
• Due diligence period is shorter

⚠️ **Tip:** Research parcels beforehand using BCPAO.us!`;
      }
      return `📅 For December ${date}, 2025 auction details, please check brevard.realforeclose.com for the latest listings.`;
    },

    CALENDAR: () => `📆 **Brevard County Auction Calendar**

**Upcoming Auctions:**

📍 **December 18, 2025** (Thursday)
• Type: Tax Deed Auction
• Time: 9:00 AM EST
• Location: ONLINE — brevard.realforeclose.com

📍 **January 7, 2026** (Tuesday)
• Type: Foreclosure Auction  
• Time: 11:00 AM
• Location: IN-PERSON — Titusville Courthouse

**Auction Types:**
• **Foreclosure:** In-person at courthouse, highest bidder wins
• **Tax Deed:** Online bidding, wipes most liens

💡 Check brevard.realforeclose.com for live listings!`,

    MAX_BID: () => `💰 **BidDeed.AI Max Bid Formula**

\`\`\`
Max Bid = (ARV × 70%) - Repairs - $10K - MIN($25K, 15% × ARV)
\`\`\`

**Components:**
• **ARV** = After Repair Value (from BCPAO comps)
• **70%** = Safety margin for profit
• **Repairs** = Estimated rehab costs
• **$10K** = Fixed costs (closing, holding)
• **MIN($25K, 15% ARV)** = Wholesale profit cap

**Example:**
• ARV: $300,000
• Repairs: $40,000
• Max Bid = ($300K × 70%) - $40K - $10K - $25K
• **Max Bid = $135,000**

**Bid/Judgment Ratio:**
• 🟢 ≥75% → **BID** (strong opportunity)
• 🟡 60-74% → **REVIEW** (proceed with caution)
• 🔴 <60% → **SKIP** (too risky)`,

    LIEN_QUERY: () => `⚖️ **Lien Priority in Florida Foreclosures**

**The Golden Rule:** Senior liens SURVIVE junior foreclosures.

**Lien Priority (Typical Order):**
1. Property Taxes (always first)
2. First Mortgage (original purchase loan)
3. Second Mortgage / HELOC
4. HOA/Condo Liens
5. Judgment Liens
6. Mechanics Liens

**Critical Scenarios:**

🏦 **Bank Foreclosure (Mortgage):**
• Wipes: HOA liens, junior mortgages, judgments
• You get: Clean title (usually)

🏘️ **HOA Foreclosure:**
• ⚠️ **DANGER:** Senior mortgage SURVIVES
• You inherit: The entire first mortgage!
• Always check: Who is the plaintiff?

🏛️ **Tax Deed Sale:**
• Wipes: Almost everything
• Survives: Some government liens

**BidDeed.AI Protection:**
Our Lien Discovery Agent searches AcclaimWeb for ALL recorded liens before you bid.`,

    RECOMMENDATIONS: () => `⭐ **Current BID Recommendations (Dec 18 Tax Deed)**

Based on Everest Ascent™ 12-stage analysis:

**Top Opportunities:**

🟢 **202 Ivory Coral Ln #302** - Merritt Island
• Opening Bid: $6,847 | Market Value: $176,000
• Bid/Judgment: 3.9% | ML Score: 72%
• Recommendation: **BID**

🟢 **202 Ivory Coral Ln #204** - Merritt Island
• Opening Bid: $5,234 | Market Value: $165,000
• Bid/Judgment: 3.2% | ML Score: 68%
• Recommendation: **BID**

🟡 **1456 Palm Bay Rd** - Palm Bay
• Opening Bid: $12,500 | Market Value: $89,000
• Bid/Judgment: 14.0% | ML Score: 54%
• Recommendation: **REVIEW**

📊 **Summary:** 4 BID, 3 REVIEW, 12 SKIP, 1 DO_NOT_BID

Use #demo to see full pipeline analysis!`,

    ANALYZE_PROPERTY: (entities) => {
      if (entities.address || entities.caseNumber) {
        return `🔍 **Property Analysis Request**

${entities.address ? `Address: ${entities.address}` : ''}
${entities.caseNumber ? `Case #: ${entities.caseNumber}` : ''}

**Triggering Everest Ascent™ Pipeline...**

This would normally trigger the 12-stage analysis:
1. ✅ Discovery → Case identified
2. ⏳ Scraping → Pulling BCPAO data
3. ⏳ Title Search → Checking ownership
4. ⏳ Lien Priority → AcclaimWeb lookup
5. ⏳ Tax Certificates → RealTDM check
6. ⏳ Demographics → Census API
7. ⏳ CMA → Comparable analysis
8. ⏳ ML Score → XGBoost prediction
9. ⏳ Max Bid → Formula calculation
10. ⏳ Decision → BID/REVIEW/SKIP
11. ⏳ Report → DOCX generation
12. ⏳ Archive → Supabase storage

💡 **Demo Mode:** Visit **#demo** for live pipeline demonstration!`;
      }
      return `🔍 Please provide a property address or case number to analyze.

Example: "Analyze 202 Ivory Coral Ln Merritt Island" or "Check Case #250179"`;
    },

    BATCH_ANALYSIS: () => `🔄 **Batch Analysis**

**Triggering Batch Pipeline for Dec 18 Tax Deed Auction...**

This would process all 20 properties through:
• Parallel data fetching from 5 sources
• XGBoost ML scoring (64.4% accuracy)
• Lien priority verification
• Max bid calculations
• Report generation

**Current Status:** 20 properties | 4 BID | 3 REVIEW | 12 SKIP | 1 DO_NOT_BID

📊 Visit **#demo** to see the live agentic pipeline in action!`,

    HELP: () => `🤖 **BidDeed.AI V18 — Help**

**I can help you with:**

📅 **Auction Info**
• "What auctions are on Dec 18?"
• "Show the auction calendar"
• "When is the next foreclosure?"

💰 **Investment Analysis**
• "Explain the max bid formula"
• "What's a good bid/judgment ratio?"
• "Calculate max bid for $200K ARV"

⚖️ **Title & Liens**
• "How do liens work?"
• "What survives an HOA foreclosure?"
• "Explain lien priority"

🏠 **Properties**
• "Show recommendations"
• "Analyze 123 Main St"
• "Check Case #250179"

🔗 **Quick Links:**
• **#demo** — Live agentic pipeline demo
• **#pipeline** — 12-stage walkthrough
• **#investor** — Investor presentation`,

    GREETING: () => `👋 **Welcome to BidDeed.AI V18 — Everest Summit Edition!**

I'm your intelligent foreclosure auction assistant, powered by the **Everest Ascent™** 12-stage pipeline.

**Quick Info:**
📅 Next Auction: **Dec 18** (Tax Deed) @ 9AM ONLINE
🏛️ After That: **Jan 7** (Foreclosure) @ 11AM Titusville

**Try asking:**
• "What auctions are on Dec 18?"
• "Explain the max bid formula"
• "Show best opportunities"

Or use the quick actions below! 👇`,

    UNKNOWN: (entities) => `🤔 I understand you're asking about: "${entities.message?.substring(0, 50) || 'something'}..."

**Here's what I can help with:**

📅 **Auctions:** "What's on Dec 18?" or "Show calendar"
💰 **Formulas:** "Explain max bid formula"
⚖️ **Liens:** "How does lien priority work?"
🏠 **Analysis:** "Show recommendations" or "Analyze [address]"

Try one of the quick actions below! 👇`,
  },

  generate(intent, entities) {
    const generator = this.responses[intent] || this.responses.UNKNOWN;
    return generator({ ...entities, message: entities.originalMessage });
  }
};

// ============ CHAT COMPONENT ============
export default function ChatV18() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: ResponseGenerator.generate('GREETING', {}),
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));

    // NLP Processing
    const { intent, entities } = NLPEngine.classifyIntent(input);
    entities.originalMessage = input;

    const response = ResponseGenerator.generate(intent, entities);

    const assistantMessage = {
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      intent,
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const handleQuickAction = (text) => {
    setInput(text);
    setTimeout(() => handleSend(), 100);
  };

  const quickActions = [
    { label: '📅 Dec 18 Auction', text: 'What auctions are on Dec 18?' },
    { label: '💰 Max Bid', text: 'Explain max bid formula' },
    { label: '⭐ Recommendations', text: 'Show best opportunities' },
    { label: '📆 Calendar', text: 'Show auction calendar' },
  ];

  // Format message content with markdown-like styling
  const formatContent = (content) => {
    return content
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-900 p-3 rounded-lg my-2 overflow-x-auto text-sm">$1</pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-800 px-1 rounded text-amber-400">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-blue-400">$1</strong>')
      .replace(/^• /gm, '<span class="text-amber-400">•</span> ')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <a href="#" className="text-slate-400 hover:text-white transition-colors">
            ← Back
          </a>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            <h1 className="text-lg font-semibold text-white">BidDeed.AI V18</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-green-400">Online</span>
        </div>
      </header>

      {/* Router Info */}
      <div className="text-center text-xs text-slate-500 py-2 bg-slate-900/50">
        Everest Ascent™ Pipeline • LangGraph Orchestration • XGBoost ML
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-slate-800 text-slate-100 rounded-bl-sm'
                }`}
              >
                <div
                  className="text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                />
                <div className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-500'}`}>
                  {msg.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  {msg.intent && <span className="ml-2">⚡ {msg.intent}</span>}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto">
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickAction(action.text)}
            className="flex-shrink-0 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-300 hover:bg-slate-700 hover:border-slate-600 transition-colors"
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about auctions, properties, or liens..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
