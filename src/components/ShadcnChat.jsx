// ShadcnChat.jsx - Unified Chat Component for BidDeed.AI & Life OS
// Shadcn new-york preset + Smart Router V5 (Gemini 2.5 Flash FREE)
// © 2025 Everest Capital USA. All Rights Reserved.

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Loader2, Mountain, Sparkles, ChevronDown, 
  CheckCircle2, Circle, AlertCircle, Home, MessageSquare,
  Calendar, Calculator, Scale, HelpCircle, Zap
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// DESIGN SYSTEM - Shadcn New York + BidDeed Brand
// ═══════════════════════════════════════════════════════════════

const VARIANTS = {
  biddeed: {
    name: 'BidDeed.AI',
    icon: Mountain,
    accent: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    bgGradient: 'from-slate-950 via-slate-900 to-slate-950',
    subtitle: 'Everest Summit Edition',
    quickActions: [
      { icon: Calendar, label: 'Dec 18 Auction', query: 'What auctions are on Dec 18?' },
      { icon: Calculator, label: 'Max Bid Formula', query: 'Explain max bid formula' },
      { icon: Scale, label: 'Lien Priority', query: 'How do liens work?' },
      { icon: HelpCircle, label: 'Help', query: 'What can you help me with?' },
    ],
    welcomeMessage: `Welcome to **BidDeed.AI V18** — Everest Summit Edition

📅 **Upcoming Auctions:**
• **Dec 18, 2025** — Tax Deed @ 9AM ONLINE
• **Jan 7, 2026** — Foreclosure @ 11AM Titusville

Ask me about properties, liens, or auction strategy.`,
  },
  lifeos: {
    name: 'Life OS',
    icon: Home,
    accent: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-slate-950 via-slate-900 to-slate-950',
    subtitle: 'ADHD-Optimized Productivity',
    quickActions: [
      { icon: Calendar, label: 'Today\'s Tasks', query: 'What are my tasks for today?' },
      { icon: Zap, label: 'Quick Capture', query: 'Log a new task' },
      { icon: MessageSquare, label: 'Michael D1', query: 'Show Michael\'s swim progress' },
      { icon: HelpCircle, label: 'Help', query: 'What can you help me with?' },
    ],
    welcomeMessage: `Welcome to **Life OS** — Your ADHD-Optimized Command Center

🏠 **Family Dashboard**
• Track tasks, goals, and habits
• Michael D1 swimming analytics
• ADHD-friendly accountability

What would you like to accomplish?`,
  },
};

// ═══════════════════════════════════════════════════════════════
// SMART ROUTER INTEGRATION
// ═══════════════════════════════════════════════════════════════

const SmartRouter = {
  async sendMessage(messages, variant = 'biddeed') {
    const endpoint = variant === 'biddeed' 
      ? '/api/chat'
      : '/api/chat';
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          model: 'gemini-2.5-flash', // FREE tier default
        }),
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (error) {
      console.error('Smart Router error:', error);
      throw error;
    }
  }
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

function WelcomeScreen({ config, onQuickAction }) {
  const Icon = config.icon;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full px-6 text-center"
    >
      {/* Hero Icon */}
      <motion.div 
        className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${config.gradient} 
                    flex items-center justify-center mb-6 shadow-2xl shadow-${config.accent}-500/20`}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
      >
        <Icon className="w-10 h-10 text-white" strokeWidth={1.5} />
      </motion.div>
      
      {/* Title */}
      <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">
        {config.name}
      </h2>
      <p className="text-sm text-slate-400 mb-6">{config.subtitle}</p>
      
      {/* Welcome Message */}
      <div className="max-w-md text-left bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 mb-6">
        <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line"
             dangerouslySetInnerHTML={{ 
               __html: config.welcomeMessage
                 .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white">$1</strong>')
                 .replace(/\n/g, '<br/>') 
             }} 
        />
      </div>
      
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 justify-center max-w-md">
        {config.quickActions.map((action, i) => (
          <motion.button
            key={i}
            onClick={() => onQuickAction(action.query)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full
                       bg-slate-800/80 border border-slate-700/50
                       text-sm text-slate-300 hover:text-white
                       hover:border-${config.accent}-500/50 hover:bg-slate-800
                       transition-all duration-200`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
          >
            <action.icon className="w-4 h-4" />
            {action.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function MessageBubble({ message, config }) {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div className={`
        max-w-[85%] rounded-2xl px-4 py-3
        ${isUser 
          ? `bg-gradient-to-br ${config.gradient} text-white shadow-lg shadow-${config.accent}-500/10` 
          : 'bg-slate-800/80 text-slate-200 border border-slate-700/50'}
      `}>
        {/* Message Content */}
        <div 
          className="text-sm leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ 
            __html: message.content
              .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
              .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-black/20 rounded text-xs font-mono">$1</code>')
              .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="mt-2 p-3 bg-black/30 rounded-lg overflow-x-auto text-xs font-mono">$2</pre>')
          }} 
        />
        
        {/* Timestamp */}
        <div className={`text-xs mt-2 ${isUser ? 'text-white/60' : 'text-slate-500'}`}>
          {message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
}

function TypingIndicator({ config }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex justify-start mb-3"
    >
      <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className={`w-2 h-2 rounded-full bg-${config.accent}-500`}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
          <span className="text-sm text-slate-400">Thinking...</span>
        </div>
      </div>
    </motion.div>
  );
}

function PipelineProgress({ stages, show }) {
  if (!show) return null;
  
  const completedCount = stages.filter(s => s.status === 'complete').length;
  const progress = (completedCount / stages.length) * 100;
  
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="border-b border-slate-700/50 overflow-hidden"
    >
      <div className="p-3 bg-slate-900/50">
        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-slate-500 font-mono">{completedCount}/{stages.length}</span>
          <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        
        {/* Stage Grid */}
        <div className="grid grid-cols-6 gap-1">
          {stages.map((stage) => {
            const StatusIcon = stage.status === 'complete' ? CheckCircle2 
              : stage.status === 'running' ? Loader2 
              : stage.status === 'error' ? AlertCircle 
              : Circle;
            
            const statusColor = stage.status === 'complete' ? 'text-emerald-500 bg-emerald-500/10'
              : stage.status === 'running' ? 'text-amber-500 bg-amber-500/10'
              : stage.status === 'error' ? 'text-red-500 bg-red-500/10'
              : 'text-slate-600 bg-slate-800/50';
            
            return (
              <div 
                key={stage.id}
                className={`flex items-center gap-1 p-1.5 rounded text-[10px] ${statusColor}`}
              >
                <StatusIcon className={`w-3 h-3 ${stage.status === 'running' ? 'animate-spin' : ''}`} />
                <span className="truncate">{stage.icon}</span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function ShadcnChat({ variant = 'biddeed' }) {
  const config = VARIANTS[variant] || VARIANTS.biddeed;
  const Icon = config.icon;
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPipeline, setShowPipeline] = useState(false);
  const [stages, setStages] = useState([
    { id: 'discovery', name: 'Discovery', icon: '🔍', status: 'pending' },
    { id: 'scraping', name: 'Scraping', icon: '📥', status: 'pending' },
    { id: 'title', name: 'Title', icon: '📜', status: 'pending' },
    { id: 'lien', name: 'Liens', icon: '⚖️', status: 'pending' },
    { id: 'tax', name: 'Tax', icon: '💰', status: 'pending' },
    { id: 'ml', name: 'ML', icon: '🤖', status: 'pending' },
  ]);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    const content = input.trim();
    if (!content || isLoading) return;
    
    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Show pipeline for BidDeed variant
    if (variant === 'biddeed') {
      setShowPipeline(true);
      setStages(prev => prev.map(s => ({ ...s, status: 'pending' })));
    }
    
    try {
      const response = await SmartRouter.sendMessage([...messages, userMessage], variant);
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      const assistantMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      if (reader) {
        let fullContent = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          fullContent += chunk;
          
          setMessages(prev => 
            prev.map(m => 
              m.id === assistantMessage.id 
                ? { ...m, content: fullContent }
                : m
            )
          );
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: '⚠️ Connection error. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, variant]);
  
  const handleQuickAction = useCallback((query) => {
    setInput(query);
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} });
    }, 100);
  }, [handleSubmit]);
  
  return (
    <div className={`flex flex-col h-screen bg-gradient-to-br ${config.bgGradient}`}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 
                        bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${config.gradient} 
                          flex items-center justify-center shadow-lg`}>
            <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white tracking-tight">
              {config.name}
            </h1>
            <p className="text-xs text-slate-500">{config.subtitle}</p>
          </div>
        </div>
        
        {variant === 'biddeed' && (
          <button
            onClick={() => setShowPipeline(!showPipeline)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                      text-xs text-slate-400 hover:text-white
                      bg-slate-800/50 hover:bg-slate-800 transition-colors"
          >
            Pipeline
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showPipeline ? 'rotate-180' : ''}`} />
          </button>
        )}
      </header>
      
      {/* Pipeline (BidDeed only) */}
      <AnimatePresence>
        {variant === 'biddeed' && (
          <PipelineProgress stages={stages} show={showPipeline} />
        )}
      </AnimatePresence>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <WelcomeScreen config={config} onQuickAction={handleQuickAction} />
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} config={config} />
            ))}
            
            <AnimatePresence>
              {isLoading && <TypingIndicator config={config} />}
            </AnimatePresence>
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="p-4 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800/50">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={variant === 'biddeed' 
                ? 'Ask about properties, auctions, or liens...' 
                : 'What would you like to accomplish?'}
              className="w-full bg-slate-800/80 text-white text-sm
                        rounded-xl px-4 py-3 pr-12
                        border border-slate-700/50 
                        placeholder:text-slate-500
                        focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent
                        transition-all"
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient}
                       flex items-center justify-center
                       text-white shadow-lg shadow-${config.accent}-500/20
                       disabled:opacity-50 disabled:cursor-not-allowed
                       hover:opacity-90 active:scale-95 transition-all`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        
        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-3">
          Powered by Smart Router V5 • Gemini 2.5 Flash (FREE)
        </p>
      </div>
    </div>
  );
}

// Export variants for convenience
export const BidDeedChat = () => <ShadcnChat variant="biddeed" />;
export const LifeOSChat = () => <ShadcnChat variant="lifeos" />;
