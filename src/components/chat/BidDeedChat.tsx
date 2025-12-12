// components/chat/BidDeedChat.tsx
// AI Chat Interface using assistant-ui primitives
// Integrates with Claude Orchestrator for 12-stage pipeline

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Loader2, 
  CheckCircle2, 
  Circle, 
  AlertCircle,
  ChevronDown,
  Sparkles,
  Mountain
} from 'lucide-react';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
}

interface ToolCall {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  result?: any;
}

interface PipelineStage {
  id: string;
  name: string;
  icon: string;
  status: 'pending' | 'running' | 'complete' | 'error';
}

// Pipeline Stages Configuration
const PIPELINE_STAGES: PipelineStage[] = [
  { id: 'discovery', name: 'Discovery', icon: '🔍', status: 'pending' },
  { id: 'scraping', name: 'Scraping', icon: '📥', status: 'pending' },
  { id: 'title', name: 'Title Search', icon: '📜', status: 'pending' },
  { id: 'lien_priority', name: 'Lien Priority', icon: '⚖️', status: 'pending' },
  { id: 'tax_certs', name: 'Tax Certs', icon: '💰', status: 'pending' },
  { id: 'demographics', name: 'Demographics', icon: '👥', status: 'pending' },
  { id: 'ml_score', name: 'ML Score', icon: '🤖', status: 'pending' },
  { id: 'max_bid', name: 'Max Bid', icon: '🎯', status: 'pending' },
  { id: 'decision', name: 'Decision', icon: '✅', status: 'pending' },
  { id: 'report', name: 'Report', icon: '📄', status: 'pending' },
  { id: 'disposition', name: 'Disposition', icon: '📊', status: 'pending' },
  { id: 'archive', name: 'Archive', icon: '🗄️', status: 'pending' },
];

export function BidDeedChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stages, setStages] = useState<PipelineStage[]>(PIPELINE_STAGES);
  const [showPipeline, setShowPipeline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowPipeline(true);

    // Reset pipeline stages
    setStages(PIPELINE_STAGES.map(s => ({ ...s, status: 'pending' })));

    try {
      // Call the chat API (Smart Router integration)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      if (reader) {
        const assistantMessage: Message = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: '',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          assistantContent += chunk;

          // Update message content
          setMessages(prev => 
            prev.map(m => 
              m.id === assistantMessage.id 
                ? { ...m, content: assistantContent }
                : m
            )
          );

          // Simulate pipeline progress based on content
          updatePipelineFromContent(assistantContent);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Update pipeline stages based on response content
  const updatePipelineFromContent = (content: string) => {
    const contentLower = content.toLowerCase();
    
    setStages(prev => prev.map(stage => {
      let newStatus: 'pending' | 'running' | 'complete' | 'error' = stage.status;
      
      // Check if stage is mentioned in content
      if (contentLower.includes(stage.name.toLowerCase())) {
        if (contentLower.includes(`${stage.name.toLowerCase()} complete`) ||
            contentLower.includes(`✅ ${stage.name.toLowerCase()}`)) {
          newStatus = 'complete';
        } else if (contentLower.includes(`${stage.name.toLowerCase()} running`) ||
                   contentLower.includes(`analyzing`)) {
          newStatus = 'running';
        }
      }
      
      return { ...stage, status: newStatus };
    }));
  };

  return (
    <div className="flex flex-col h-full bg-bb-dark">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-bb-accent bg-bb-darker">
        <div className="flex items-center gap-2">
          <Mountain className="w-5 h-5 text-bb-primary" />
          <div>
            <h2 className="text-lg font-semibold text-white">Claude Orchestrator</h2>
            <p className="text-xs text-gray-500">Everest Ascent™ Pipeline</p>
          </div>
        </div>
        <button
          onClick={() => setShowPipeline(!showPipeline)}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Pipeline
          <ChevronDown className={`w-4 h-4 transition-transform ${showPipeline ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Pipeline Progress (collapsible) */}
      <AnimatePresence>
        {showPipeline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-bb-accent overflow-hidden"
          >
            <div className="p-3 bg-bb-darker">
              <PipelineProgress stages={stages} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <WelcomeMessage />
        )}
        
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <LoadingIndicator />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-bb-accent bg-bb-darker">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter case number or ask about properties..."
            className="w-full bg-bb-dark text-white rounded-lg pl-4 pr-12 py-3 
                       placeholder-gray-500 border border-bb-accent
                       focus:outline-none focus:ring-2 focus:ring-bb-primary focus:border-transparent
                       transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2
                       bg-gradient-to-r from-bb-primary to-bb-secondary 
                       rounded-lg text-white
                       disabled:opacity-50 disabled:cursor-not-allowed
                       hover:opacity-90 transition-opacity"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500 text-center">
          Powered by Claude Sonnet 4 + Smart Router (42% FREE via Gemini 2.5)
        </p>
      </form>
    </div>
  );
}

// Sub-components

function WelcomeMessage() {
  const suggestions = [
    'Analyze case 2024-CA-012345',
    'Show me BID properties for Dec 17',
    'What liens survive HOA foreclosure?',
    'Calculate max bid for $300K ARV'
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-bb-primary to-bb-secondary 
                      flex items-center justify-center mb-4">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">
        Welcome to BidDeed.AI
      </h3>
      <p className="text-gray-400 mb-6 max-w-md">
        I'm your AI-powered foreclosure analyst. Enter a case number to begin analysis 
        through the Everest Ascent™ 12-stage pipeline.
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className="px-3 py-1.5 text-sm bg-bb-accent text-gray-300 rounded-full
                       hover:bg-bb-primary hover:text-white transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`
        max-w-[80%] rounded-lg px-4 py-3
        ${isUser 
          ? 'bg-gradient-to-r from-bb-primary to-bb-secondary text-white' 
          : 'bg-bb-darker text-gray-200 border border-bb-accent'}
      `}>
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-1 ${isUser ? 'text-white/60' : 'text-gray-500'}`}>
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </motion.div>
  );
}

function LoadingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-bb-darker border border-bb-accent rounded-lg px-4 py-3">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-bb-primary" />
          <span className="text-gray-400">Analyzing...</span>
        </div>
      </div>
    </div>
  );
}

function PipelineProgress({ stages }: { stages: PipelineStage[] }) {
  const completedCount = stages.filter(s => s.status === 'complete').length;
  const progress = (completedCount / stages.length) * 100;

  return (
    <div>
      {/* Progress Bar */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-gray-500">{completedCount}/{stages.length}</span>
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-bb-primary to-bb-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Stage Grid */}
      <div className="grid grid-cols-6 gap-1">
        {stages.map((stage) => (
          <StageIndicator key={stage.id} stage={stage} />
        ))}
      </div>
    </div>
  );
}

function StageIndicator({ stage }: { stage: PipelineStage }) {
  const statusStyles = {
    pending: 'bg-white/5 text-gray-500',
    running: 'bg-bb-review/20 text-bb-review',
    complete: 'bg-bb-bid/20 text-bb-bid',
    error: 'bg-bb-skip/20 text-bb-skip'
  };

  const StatusIcon = {
    pending: Circle,
    running: Loader2,
    complete: CheckCircle2,
    error: AlertCircle
  }[stage.status];

  return (
    <div className={`
      flex items-center gap-1 p-1.5 rounded text-[10px]
      ${statusStyles[stage.status]}
    `}>
      <StatusIcon className={`w-3 h-3 ${stage.status === 'running' ? 'animate-spin' : ''}`} />
      <span className="truncate">{stage.icon}</span>
    </div>
  );
}

export default BidDeedChat;
