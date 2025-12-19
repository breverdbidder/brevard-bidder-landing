// ShadcnChat.jsx - Unified Chat Component V2
// Shadcn new-york preset + Premium Typography + Smart Router V5
// © 2025 Everest Capital USA. All Rights Reserved.

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Loader2, Mountain, Sparkles, ChevronDown, 
  CheckCircle2, Circle, AlertCircle, Home, MessageSquare,
  Calendar, Calculator, Scale, HelpCircle, Zap, User, Bot
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// SHADCN NEW-YORK DESIGN TOKENS
// Premium typography: Geist + Geist Mono (Vercel's flagship fonts)
// ═══════════════════════════════════════════════════════════════

const tokens = {
  colors: {
    background: 'hsl(240 10% 3.9%)',
    foreground: 'hsl(0 0% 98%)',
    card: 'hsl(240 10% 3.9%)',
    cardForeground: 'hsl(0 0% 98%)',
    popover: 'hsl(240 10% 3.9%)',
    popoverForeground: 'hsl(0 0% 98%)',
    primary: 'hsl(0 0% 98%)',
    primaryForeground: 'hsl(240 5.9% 10%)',
    secondary: 'hsl(240 3.7% 15.9%)',
    secondaryForeground: 'hsl(0 0% 98%)',
    muted: 'hsl(240 3.7% 15.9%)',
    mutedForeground: 'hsl(240 5% 64.9%)',
    accent: 'hsl(240 3.7% 15.9%)',
    accentForeground: 'hsl(0 0% 98%)',
    destructive: 'hsl(0 62.8% 30.6%)',
    destructiveForeground: 'hsl(0 0% 98%)',
    border: 'hsl(240 3.7% 15.9%)',
    input: 'hsl(240 3.7% 15.9%)',
    ring: 'hsl(240 4.9% 83.9%)',
  },
  radius: '0.5rem',
};

// ═══════════════════════════════════════════════════════════════
// VARIANT CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════

const VARIANTS = {
  biddeed: {
    name: 'BidDeed.AI',
    tagline: 'Everest Summit Edition',
    icon: Mountain,
    accentHue: 38, // Amber
    accentColor: 'hsl(38 92% 50%)',
    accentGradient: 'linear-gradient(135deg, hsl(38 92% 50%), hsl(24 95% 53%))',
    glowColor: 'hsla(38, 92%, 50%, 0.15)',
    quickActions: [
      { icon: Calendar, label: 'Upcoming Auctions', query: 'What auctions are coming up?' },
      { icon: Calculator, label: 'Max Bid Formula', query: 'Explain max bid calculation' },
      { icon: Scale, label: 'Lien Priority', query: 'How do liens get prioritized?' },
      { icon: HelpCircle, label: 'Help', query: 'What can you help me with?' },
    ],
    welcomeMessage: {
      headline: 'Foreclosure Intelligence',
      subheadline: 'AI-powered auction analysis for Brevard County',
      features: [
        { emoji: '📅', label: 'Live auction tracking' },
        { emoji: '⚖️', label: 'Automated lien discovery' },
        { emoji: '🎯', label: 'ML-powered bid recommendations' },
      ],
    },
    placeholder: 'Ask about properties, auctions, or liens...',
  },
  lifeos: {
    name: 'Life OS',
    tagline: 'ADHD Command Center',
    icon: Home,
    accentHue: 160, // Emerald
    accentColor: 'hsl(160 84% 39%)',
    accentGradient: 'linear-gradient(135deg, hsl(160 84% 39%), hsl(172 66% 39%))',
    glowColor: 'hsla(160, 84%, 39%, 0.15)',
    quickActions: [
      { icon: Calendar, label: "Today's Tasks", query: 'What are my tasks for today?' },
      { icon: Zap, label: 'Quick Capture', query: 'Log a new task' },
      { icon: MessageSquare, label: 'Michael D1', query: "Show Michael's swim progress" },
      { icon: HelpCircle, label: 'Help', query: 'What can you help me with?' },
    ],
    welcomeMessage: {
      headline: 'Productivity Dashboard',
      subheadline: 'ADHD-optimized task management & accountability',
      features: [
        { emoji: '🎯', label: 'Task state tracking' },
        { emoji: '🏊', label: 'Michael D1 analytics' },
        { emoji: '⚡', label: 'Smart interventions' },
      ],
    },
    placeholder: 'What would you like to accomplish?',
  },
};

// ═══════════════════════════════════════════════════════════════
// SMART ROUTER V5 INTEGRATION
// ═══════════════════════════════════════════════════════════════

const SmartRouter = {
  async sendMessage(messages, variant = 'biddeed') {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          model: 'gemini-2.5-flash',
          variant,
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
// SUBCOMPONENTS
// ═══════════════════════════════════════════════════════════════

function WelcomeScreen({ config, onQuickAction }) {
  const Icon = config.icon;
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-full px-6"
    >
      {/* Hero Section */}
      <motion.div 
        className="relative mb-8"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.4, delay: 0.1 }}
      >
        {/* Glow Effect */}
        <div 
          className="absolute inset-0 blur-3xl opacity-40 rounded-full scale-150"
          style={{ background: config.accentGradient }}
        />
        
        {/* Icon Container */}
        <div 
          className="relative w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl"
          style={{ background: config.accentGradient }}
        >
          <Icon className="w-12 h-12 text-white" strokeWidth={1.5} />
        </div>
      </motion.div>
      
      {/* Typography */}
      <motion.div 
        className="text-center mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">
          {config.welcomeMessage.headline}
        </h1>
        <p className="text-base text-zinc-400 max-w-md">
          {config.welcomeMessage.subheadline}
        </p>
      </motion.div>
      
      {/* Feature Pills */}
      <motion.div 
        className="flex flex-wrap gap-3 justify-center mb-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {config.welcomeMessage.features.map((feature, i) => (
          <div 
            key={i}
            className="flex items-center gap-2 px-4 py-2 rounded-full 
                       bg-zinc-900/80 border border-zinc-800"
          >
            <span className="text-lg">{feature.emoji}</span>
            <span className="text-sm text-zinc-300">{feature.label}</span>
          </div>
        ))}
      </motion.div>
      
      {/* Quick Actions */}
      <motion.div 
        className="grid grid-cols-2 gap-3 w-full max-w-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {config.quickActions.map((action, i) => (
          <motion.button
            key={i}
            onClick={() => onQuickAction(action.query)}
            className="group flex items-center gap-3 p-4 rounded-2xl
                       bg-zinc-900/60 border border-zinc-800/80
                       hover:bg-zinc-800/80 hover:border-zinc-700
                       transition-all duration-200 text-left"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center
                         bg-zinc-800 group-hover:bg-zinc-700 transition-colors"
              style={{ 
                boxShadow: `0 0 20px ${config.glowColor}`,
              }}
            >
              <action.icon 
                className="w-5 h-5 transition-colors" 
                style={{ color: config.accentColor }}
              />
            </div>
            <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
              {action.label}
            </span>
          </motion.button>
        ))}
      </motion.div>
      
      {/* Powered By */}
      <motion.p 
        className="mt-10 text-xs text-zinc-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Powered by Smart Router V5 • Gemini 2.5 Flash
      </motion.p>
    </motion.div>
  );
}

function MessageBubble({ message, config, isLast }) {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div 
        className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center
                    ${isUser ? 'bg-zinc-700' : ''}`}
        style={!isUser ? { background: config.accentGradient } : undefined}
      >
        {isUser ? (
          <User className="w-4 h-4 text-zinc-300" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>
      
      {/* Bubble */}
      <div className={`
        max-w-[80%] rounded-2xl px-4 py-3
        ${isUser 
          ? 'bg-zinc-800 text-zinc-100' 
          : 'bg-zinc-900/80 border border-zinc-800 text-zinc-200'}
      `}>
        {/* Content */}
        <div 
          className="text-[15px] leading-relaxed whitespace-pre-wrap [&>strong]:font-semibold [&>strong]:text-white [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:bg-zinc-800 [&>code]:rounded [&>code]:text-[13px] [&>code]:font-mono [&>pre]:mt-3 [&>pre]:p-3 [&>pre]:bg-zinc-950 [&>pre]:rounded-xl [&>pre]:overflow-x-auto [&>pre]:text-[13px] [&>pre]:font-mono"
          dangerouslySetInnerHTML={{ 
            __html: message.content
              .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
              .replace(/`([^`]+)`/g, '<code>$1</code>')
              .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre>$2</pre>')
          }} 
        />
        
        {/* Timestamp */}
        <div className={`text-xs mt-2 ${isUser ? 'text-zinc-500' : 'text-zinc-600'}`}>
          {message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
}

function TypingIndicator({ config }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="flex gap-3 mb-4"
    >
      <div 
        className="w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ background: config.accentGradient }}
      >
        <Bot className="w-4 h-4 text-white" />
      </div>
      
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: config.accentColor }}
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ 
                duration: 1, 
                repeat: Infinity, 
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function PipelineProgress({ stages, show, config }) {
  if (!show) return null;
  
  const completedCount = stages.filter(s => s.status === 'complete').length;
  const progress = (completedCount / stages.length) * 100;
  
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="border-b border-zinc-800/80 overflow-hidden"
    >
      <div className="p-4 bg-zinc-950/50">
        {/* Progress Bar */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-zinc-500 font-mono tabular-nums">
            {completedCount}/{stages.length}
          </span>
          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: config.accentGradient }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          <span className="text-xs text-zinc-500">{Math.round(progress)}%</span>
        </div>
        
        {/* Stage Grid */}
        <div className="grid grid-cols-6 gap-2">
          {stages.map((stage) => {
            const StatusIcon = stage.status === 'complete' ? CheckCircle2 
              : stage.status === 'running' ? Loader2 
              : stage.status === 'error' ? AlertCircle 
              : Circle;
            
            const statusStyles = {
              complete: { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
              running: { bg: 'bg-amber-500/10', text: 'text-amber-500' },
              error: { bg: 'bg-red-500/10', text: 'text-red-500' },
              pending: { bg: 'bg-zinc-800/50', text: 'text-zinc-600' },
            }[stage.status] || { bg: 'bg-zinc-800/50', text: 'text-zinc-600' };
            
            return (
              <div 
                key={stage.id}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-lg ${statusStyles.bg}`}
              >
                <StatusIcon className={`w-3.5 h-3.5 ${statusStyles.text} ${stage.status === 'running' ? 'animate-spin' : ''}`} />
                <span className={`text-[11px] ${statusStyles.text}`}>{stage.icon}</span>
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
    <div className="flex flex-col h-screen bg-zinc-950">
      {/* CSS Variables */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');
        
        :root {
          --font-geist: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          --font-geist-mono: 'Geist Mono', 'SF Mono', monospace;
        }
        
        body {
          font-family: var(--font-geist);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        code, pre {
          font-family: var(--font-geist-mono);
        }
      `}</style>
      
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 
                        bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/80">
        <div className="flex items-center gap-4">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ 
              background: config.accentGradient,
              boxShadow: `0 8px 24px ${config.glowColor}`,
            }}
          >
            <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-[17px] font-semibold text-white tracking-tight">
              {config.name}
            </h1>
            <p className="text-xs text-zinc-500">{config.tagline}</p>
          </div>
        </div>
        
        {variant === 'biddeed' && (
          <button
            onClick={() => setShowPipeline(!showPipeline)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl
                      text-xs font-medium text-zinc-400 hover:text-white
                      bg-zinc-900 hover:bg-zinc-800 border border-zinc-800
                      transition-all duration-200"
          >
            Pipeline
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showPipeline ? 'rotate-180' : ''}`} />
          </button>
        )}
      </header>
      
      {/* Pipeline (BidDeed only) */}
      <AnimatePresence>
        {variant === 'biddeed' && (
          <PipelineProgress stages={stages} show={showPipeline} config={config} />
        )}
      </AnimatePresence>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        {messages.length === 0 ? (
          <WelcomeScreen config={config} onQuickAction={handleQuickAction} />
        ) : (
          <>
            {messages.map((msg, i) => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                config={config}
                isLast={i === messages.length - 1}
              />
            ))}
            
            <AnimatePresence>
              {isLoading && <TypingIndicator config={config} />}
            </AnimatePresence>
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="p-5 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/80">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={config.placeholder}
              className="w-full bg-zinc-900 text-white text-[15px]
                        rounded-xl px-4 py-3.5
                        border border-zinc-800 
                        placeholder:text-zinc-500
                        focus:outline-none focus:ring-2 focus:border-transparent
                        transition-all duration-200"
              style={{ 
                '--tw-ring-color': config.accentColor,
              }}
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-12 h-12 rounded-xl flex items-center justify-center
                       text-white shadow-lg
                       disabled:opacity-40 disabled:cursor-not-allowed
                       hover:opacity-90 active:scale-95 transition-all duration-200"
            style={{ 
              background: config.accentGradient,
              boxShadow: `0 8px 24px ${config.glowColor}`,
            }}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// Export variants
export const BidDeedChat = () => <ShadcnChat variant="biddeed" />;
export const LifeOSChat = () => <ShadcnChat variant="lifeos" />;
