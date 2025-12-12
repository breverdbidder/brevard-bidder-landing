# BidDeed.AI Enterprise UI/UX Architecture
## Ultimate Sources & Unicorn-Scale Implementation

**Version:** 2.0 Enterprise  
**Date:** December 2025  
**Status:** Production-Ready Architecture

---

## 🎯 Executive Summary

**Architecture Decision:** Hybrid **LobeChat + assistant-ui + BrevardBidderAI Components** with Claude Sonnet 4 integration

### Why This Stack Wins at Unicorn Scale

| Criteria | Score | Reasoning |
|----------|-------|-----------|
| **Claude Integration** | 10/10 | Native Anthropic API, streaming, artifacts, tool calling |
| **MCP Support** | 10/10 | Built-in Model Context Protocol for 12-stage pipeline |
| **Scale** | 10/10 | Combined 200k+ GitHub stars, battle-tested |
| **Customization** | 10/10 | Radix-style composable primitives |
| **Commercial License** | 10/10 | Apache 2.0 / MIT - unrestricted |

---

## 📚 Ultimate UI/UX Sources (From API Mega Library)

### Tier 1: Core Foundation (MANDATORY)

| Library | Stars | Purpose | License |
|---------|-------|---------|---------|
| **assistant-ui** | 7.6k+ | AI Chat Primitives (Y Combinator backed, 400k+ monthly downloads) | MIT |
| **LobeChat** | 69k+ | Full Agent Workspace, MCP Marketplace, Artifacts | Apache 2.0 |
| **shadcn/ui** | 78k+ | Radix-based component primitives | MIT |
| **Recharts** | 24k+ | React charting for financial data | MIT |
| **Framer Motion** | 24k+ | Production animations | MIT |
| **react-resizable-panels** | 4k+ | Split-screen layout (40/60) | MIT |

### Tier 2: Extended Ecosystem

| Library | Stars | Use Case |
|---------|-------|----------|
| **Material UI** | 94k+ | Enterprise component system |
| **Ant Design** | 93k+ | Data-dense tables & forms |
| **Radix UI** | 16k+ | Unstyled accessible primitives |
| **Tremor** | 16k+ | Dashboard analytics |
| **NextUI** | 22k+ | Modern component library |
| **TanStack Table** | 26k+ | Headless table logic |
| **React Query** | 43k+ | Server state management |
| **Zustand** | 48k+ | Client state (lightweight Redux alternative) |

### Tier 3: Agent/AI-Specific

| Library | Stars | BidDeed.AI Integration |
|---------|-------|------------------------|
| **OpenManus** | 50.8k | Multi-agent coordination reference |
| **OpenHands** | 65k+ | Code execution agent patterns |
| **Vercel AI SDK** | 10k+ | Streaming, tool calling |
| **CopilotKit** | 13k+ | Inline AI assistance |
| **LangChain Agent Chat UI** | 2k+ | LangGraph visualization |

### Tier 4: Specialized Tools

| Library | Purpose |
|---------|---------|
| **Mapbox GL JS** | Property location mapping |
| **react-map-gl** | React wrapper for Mapbox |
| **Nivo** | Advanced data visualization |
| **Visx** | Low-level chart components |
| **React Hook Form** | Form validation |
| **Zod** | Runtime type validation |

---

## 🏗️ Enterprise Architecture

### Split-Screen Enterprise Pattern

```
┌─────────────────────────────────────────────────────────────────────────┐
│  HEADER: BidDeed.AI Logo | Auction: Dec 17 | Pipeline Status | Profile  │
├────────────────────┬────────────────────────────────────────────────────┤
│                    │                                                     │
│  AI CHAT PANEL     │  MULTI-VIEW WORKSPACE                              │
│  (30% width)       │  (70% width, resizable)                            │
│  ┌──────────────┐  │  ┌────────────────────────────────────────────┐   │
│  │ Claude Sonnet│  │  │ TABS: Property | Pipeline | Report | Map   │   │
│  │ Orchestrator │  │  ├────────────────────────────────────────────┤   │
│  │              │  │  │                                            │   │
│  │ "Analyzing   │  │  │  ┌─────────────┐  ┌─────────────────────┐ │   │
│  │  Case #2024  │  │  │  │ BCPAO Photo │  │ Lien Timeline       │ │   │
│  │  -FL-12345"  │  │  │  │ [Property]  │  │ ────●────●────●──── │ │   │
│  │              │  │  │  └─────────────┘  └─────────────────────┘ │   │
│  │ [Tool Calls] │  │  │                                            │   │
│  │ ✅ BCPAO     │  │  │  ┌──────────────────────────────────────┐ │   │
│  │ ✅ AcclaimWeb│  │  │  │ DECISION: BID          Confidence: 87%│ │   │
│  │ ⏳ ML Model  │  │  │  │ Max Bid: $245,000     ROI Est: 23%    │ │   │
│  │ ⏳ Max Bid   │  │  │  │ ──────────────────────────────────────│ │   │
│  └──────────────┘  │  │  │ 📊 ML Reasoning (expand)              │ │   │
│                    │  │  └──────────────────────────────────────┘ │   │
│  ┌──────────────┐  │  │                                            │   │
│  │ Quick Actions│  │  │  [Pipeline Progress: 9/12 Complete]       │   │
│  │ ○ Run Batch  │  │  │  ████████████░░░ 75%                      │   │
│  │ ○ Export     │  │  │  discovery → scraping → title → liens →  │   │
│  │ ○ Settings   │  │  │  tax → demo → ML → maxbid → decision     │   │
│  └──────────────┘  │  └────────────────────────────────────────────┘   │
│                    │                                                     │
├────────────────────┴────────────────────────────────────────────────────┤
│ STATUS: 47 properties | 12 BID | 8 REVIEW | 27 SKIP | Smart Router: 42% │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 Tech Stack Specification

### Frontend Architecture

```yaml
Framework:
  Runtime: Next.js 15 (App Router + React Server Components)
  React: 18.3.1
  TypeScript: 5.x (strict mode)

UI Libraries:
  Primary: assistant-ui/react (chat primitives)
  Components: shadcn/ui (Radix-based)
  Reference: LobeChat patterns (MCP, artifacts)
  
State Management:
  Client: Zustand (lightweight, 48k stars)
  Server: React Query v5 (TanStack)
  Real-time: Supabase Realtime subscriptions
  
Styling:
  Framework: Tailwind CSS 4.0
  Variants: CVA (class-variance-authority)
  Animations: Framer Motion 11.x
  Icons: Lucide React

Data Visualization:
  Charts: Recharts (24k stars)
  Maps: Mapbox GL + react-map-gl
  Tables: TanStack Table v8

Forms:
  Validation: React Hook Form + Zod
  Inputs: shadcn/ui form components
```

### Backend Integration

```yaml
API Layer:
  Primary: Claude Sonnet 4 (Anthropic API)
  Fallback: Gemini 2.5 Flash (Smart Router)
  Protocol: MCP (Model Context Protocol)

Database:
  Primary: Supabase PostgreSQL
  ORM: Prisma (optional)
  Caching: Upstash Redis (serverless)

Queue System:
  Pipeline: BullMQ (12-stage orchestration)
  Background: GitHub Actions workers

Authentication:
  Provider: Clerk (enterprise SSO ready)
  RLS: Supabase Row-Level Security
```

### Deployment

```yaml
Platform:
  Production: Cloudflare Pages (current)
  Enterprise: Vercel Enterprise or AWS ECS Fargate
  
CDN: Cloudflare (existing)
CI/CD: GitHub Actions (auto-deploy on push)
Monitoring: Supabase Dashboard + custom analytics
```

---

## 🧩 Component Implementation

### 1. Claude Integration Layer

```typescript
// lib/claude-orchestrator.ts
import Anthropic from '@anthropic-ai/sdk';

interface PipelineStage {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  result?: any;
}

export class BidDeedClaudeOrchestrator {
  private client: Anthropic;
  
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      maxRetries: 3,
      timeout: 120000
    });
  }

  async analyzeProperty(caseNumber: string, onStageUpdate: (stage: PipelineStage) => void) {
    const stream = await this.client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8096,
      tools: this.getBidDeedTools(),
      messages: [{
        role: "user",
        content: `Analyze foreclosure case ${caseNumber} through the Everest Ascent 12-stage pipeline:
        1. Discovery - Find case on RealForeclose
        2. Scraping - Extract case details
        3. Title Search - Query AcclaimWeb
        4. Lien Priority - Analyze lien structure
        5. Tax Certificates - Check RealTDM
        6. Demographics - Census API analysis
        7. ML Score - Run XGBoost prediction
        8. Max Bid - Calculate optimal bid
        9. Decision - BID/REVIEW/SKIP
        10. Report - Generate DOCX
        11. Disposition - Track outcome
        12. Archive - Store to Supabase`
      }]
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'tool_use') {
        onStageUpdate({
          id: event.delta.id,
          name: event.delta.name,
          status: 'running'
        });
      }
    }

    return stream.finalMessage();
  }

  private getBidDeedTools() {
    return [
      {
        name: "bcpao_search",
        description: "Search Brevard County Property Appraiser for property details",
        input_schema: {
          type: "object",
          properties: {
            parcel_id: { type: "string", description: "Parcel ID or address" }
          },
          required: ["parcel_id"]
        }
      },
      {
        name: "acclaimweb_title",
        description: "Query AcclaimWeb for title records and liens",
        input_schema: {
          type: "object",
          properties: {
            owner_name: { type: "string" },
            parcel_id: { type: "string" }
          }
        }
      },
      {
        name: "ml_predict",
        description: "Run XGBoost model for bid recommendation",
        input_schema: {
          type: "object",
          properties: {
            case_number: { type: "string" },
            final_judgment: { type: "number" },
            opening_bid: { type: "number" },
            plaintiff: { type: "string" },
            property_type: { type: "string" },
            year_built: { type: "number" },
            living_sqft: { type: "number" }
          },
          required: ["case_number", "final_judgment", "plaintiff"]
        }
      },
      {
        name: "calculate_max_bid",
        description: "Calculate maximum bid using formula: (ARV×70%)-Repairs-$10K-MIN($25K,15%ARV)",
        input_schema: {
          type: "object",
          properties: {
            arv: { type: "number", description: "After Repair Value" },
            estimated_repairs: { type: "number" }
          },
          required: ["arv", "estimated_repairs"]
        }
      }
    ];
  }
}
```

### 2. Assistant-UI Chat Component

```tsx
// components/chat/BidDeedChat.tsx
'use client';

import { Thread, ThreadPrimitive, Message, useThread } from '@assistant-ui/react';
import { useState } from 'react';
import { BidDeedClaudeOrchestrator } from '@/lib/claude-orchestrator';

export function BidDeedChat() {
  const thread = useThread();
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);

  return (
    <div className="flex flex-col h-full bg-bb-dark">
      {/* Header */}
      <div className="px-4 py-3 border-b border-bb-accent">
        <h2 className="text-lg font-semibold text-white">Claude Orchestrator</h2>
        <p className="text-sm text-gray-400">Everest Ascent™ Pipeline</p>
      </div>

      {/* Messages */}
      <ThreadPrimitive.Viewport className="flex-1 overflow-auto p-4 space-y-4">
        <ThreadPrimitive.Messages
          components={{
            Message: BidDeedMessage,
            UserMessage: UserMessage,
            AssistantMessage: AssistantMessage,
          }}
        />
      </ThreadPrimitive.Viewport>

      {/* Tool Call Monitor */}
      {toolCalls.length > 0 && (
        <div className="px-4 py-2 border-t border-bb-accent">
          <p className="text-xs text-gray-500 mb-2">Pipeline Stages</p>
          <div className="space-y-1">
            {toolCalls.map((tool) => (
              <ToolCallBadge key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <ThreadPrimitive.Composer className="p-4 border-t border-bb-accent">
        <ThreadPrimitive.Input
          className="w-full bg-bb-darker text-white rounded-lg px-4 py-3 
                     placeholder-gray-500 focus:ring-2 focus:ring-bb-primary"
          placeholder="Enter case number or ask about properties..."
        />
        <ThreadPrimitive.Submit className="mt-2 w-full bg-gradient-to-r from-bb-primary 
                                           to-bb-secondary text-white py-2 rounded-lg
                                           hover:opacity-90 transition-opacity">
          Analyze
        </ThreadPrimitive.Submit>
      </ThreadPrimitive.Composer>
    </div>
  );
}

function ToolCallBadge({ tool }: { tool: ToolCall }) {
  const statusColors = {
    pending: 'bg-gray-600',
    running: 'bg-yellow-500 animate-pulse',
    complete: 'bg-green-500',
    error: 'bg-red-500'
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={`w-2 h-2 rounded-full ${statusColors[tool.status]}`} />
      <span className="text-gray-300">{tool.name}</span>
      {tool.status === 'complete' && <span className="text-green-400">✓</span>}
    </div>
  );
}
```

### 3. Split-Screen Layout (From BrevardBidderAI)

```tsx
// components/layout/SplitScreenLayout.tsx
'use client';

import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { BidDeedChat } from '@/components/chat/BidDeedChat';
import { WorkspacePanel } from '@/components/workspace/WorkspacePanel';

export function SplitScreenLayout() {
  return (
    <div className="h-screen bg-bb-dark">
      {/* Header */}
      <header className="h-14 bg-gradient-to-r from-bb-primary to-bb-secondary 
                         flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏔️</span>
          <span className="text-white font-bold text-xl">BidDeed.AI</span>
          <span className="text-white/60 text-sm">by Everest Capital USA</span>
        </div>
        <div className="flex items-center gap-4 text-white/80 text-sm">
          <span>Next Auction: Dec 17, 2025</span>
          <span className="bg-white/10 px-2 py-1 rounded">Smart Router: 42% FREE</span>
        </div>
      </header>

      {/* Main Content */}
      <PanelGroup direction="horizontal" className="h-[calc(100vh-56px)]">
        {/* Chat Panel - 30% default */}
        <Panel defaultSize={30} minSize={20} maxSize={40}>
          <BidDeedChat />
        </Panel>

        {/* Resize Handle */}
        <PanelResizeHandle className="w-1 bg-bb-accent hover:bg-bb-primary 
                                       transition-colors cursor-col-resize" />

        {/* Workspace Panel - 70% default */}
        <Panel defaultSize={70} minSize={50}>
          <WorkspacePanel />
        </Panel>
      </PanelGroup>

      {/* Status Bar */}
      <footer className="h-8 bg-bb-darker border-t border-bb-accent 
                         flex items-center px-4 text-xs text-gray-500">
        <span>47 properties</span>
        <span className="mx-2">|</span>
        <span className="text-bb-bid">12 BID</span>
        <span className="mx-2">|</span>
        <span className="text-bb-review">8 REVIEW</span>
        <span className="mx-2">|</span>
        <span className="text-bb-skip">27 SKIP</span>
      </footer>
    </div>
  );
}
```

### 4. Property Card with ML Prediction

```tsx
// components/property/PropertyCard.tsx
'use client';

import { motion } from 'framer-motion';
import { MapPin, Home, DollarSign, TrendingUp } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  isSelected?: boolean;
  onClick?: () => void;
}

export function PropertyCard({ property, isSelected, onClick }: PropertyCardProps) {
  const recommendationStyles = {
    BID: 'border-l-bb-bid bg-bb-bid/10',
    REVIEW: 'border-l-bb-review bg-bb-review/10',
    SKIP: 'border-l-bb-skip bg-bb-skip/10',
    PENDING: 'border-l-gray-500 bg-gray-500/10'
  };

  const badgeStyles = {
    BID: 'bg-bb-bid text-white',
    REVIEW: 'bg-bb-review text-black',
    SKIP: 'bg-bb-skip text-white',
    PENDING: 'bg-gray-500 text-white'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        border-l-4 rounded-lg p-4 cursor-pointer transition-all
        ${recommendationStyles[property.ml_prediction?.recommendation || 'PENDING']}
        ${isSelected ? 'ring-2 ring-bb-primary' : 'hover:bg-white/5'}
      `}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-white">{property.case_number}</p>
          <p className="text-sm text-gray-400 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {property.address}, {property.city}
          </p>
        </div>
        <span className={`
          px-2 py-1 rounded text-xs font-bold
          ${badgeStyles[property.ml_prediction?.recommendation || 'PENDING']}
        `}>
          {property.ml_prediction?.recommendation || 'PENDING'}
        </span>
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div className="flex items-center gap-1 text-gray-400">
          <Home className="w-3 h-3" />
          {property.bcpao_data?.living_sqft?.toLocaleString()} sqft
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          {property.bcpao_data?.bedrooms}bd / {property.bcpao_data?.bathrooms}ba
        </div>
      </div>

      {/* Financial Summary */}
      <div className="flex justify-between text-sm">
        <div>
          <p className="text-gray-500">Opening Bid</p>
          <p className="text-white font-mono">
            ${property.opening_bid?.toLocaleString() || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Max Bid</p>
          <p className="text-bb-primary font-mono font-bold">
            ${property.max_bid?.toLocaleString() || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-gray-500">ROI Est.</p>
          <p className="text-bb-bid font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {property.roi_estimate ? `${property.roi_estimate}%` : 'N/A'}
          </p>
        </div>
      </div>

      {/* ML Confidence */}
      {property.ml_prediction && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">BidDeed.AI ML Confidence</span>
            <span className="text-bb-primary font-bold">
              {(property.ml_prediction.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-bb-primary to-bb-secondary"
              initial={{ width: 0 }}
              animate={{ width: `${property.ml_prediction.confidence * 100}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
```

### 5. Pipeline Progress Visualization

```tsx
// components/pipeline/PipelineProgress.tsx
'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

const PIPELINE_STAGES = [
  { id: 'discovery', name: 'Discovery', icon: '🔍' },
  { id: 'scraping', name: 'Scraping', icon: '📥' },
  { id: 'title', name: 'Title Search', icon: '📜' },
  { id: 'lien_priority', name: 'Lien Priority', icon: '⚖️' },
  { id: 'tax_certs', name: 'Tax Certs', icon: '💰' },
  { id: 'demographics', name: 'Demographics', icon: '👥' },
  { id: 'ml_score', name: 'ML Score', icon: '🤖' },
  { id: 'max_bid', name: 'Max Bid', icon: '🎯' },
  { id: 'decision', name: 'Decision', icon: '✅' },
  { id: 'report', name: 'Report', icon: '📄' },
  { id: 'disposition', name: 'Disposition', icon: '📊' },
  { id: 'archive', name: 'Archive', icon: '🗄️' },
];

interface PipelineProgressProps {
  stages: Record<string, 'pending' | 'running' | 'complete' | 'error'>;
}

export function PipelineProgress({ stages }: PipelineProgressProps) {
  const completedCount = Object.values(stages).filter(s => s === 'complete').length;
  const progress = (completedCount / PIPELINE_STAGES.length) * 100;

  return (
    <div className="bg-bb-darker rounded-lg p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold">Everest Ascent™ Pipeline</h3>
        <span className="text-bb-primary font-mono text-sm">
          {completedCount}/{PIPELINE_STAGES.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-gradient-to-r from-bb-primary to-bb-secondary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Stage Grid */}
      <div className="grid grid-cols-4 gap-2">
        {PIPELINE_STAGES.map((stage, index) => {
          const status = stages[stage.id] || 'pending';
          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`
                flex items-center gap-2 p-2 rounded text-xs
                ${status === 'complete' ? 'bg-bb-bid/20 text-bb-bid' :
                  status === 'running' ? 'bg-bb-review/20 text-bb-review' :
                  status === 'error' ? 'bg-bb-skip/20 text-bb-skip' :
                  'bg-white/5 text-gray-500'}
              `}
            >
              {status === 'complete' ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : status === 'running' ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Circle className="w-3 h-3" />
              )}
              <span className="truncate">{stage.name}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## 🎨 Design System

### Color Tokens

```css
:root {
  /* Brand Colors */
  --bb-primary: #667eea;      /* Trust Blue */
  --bb-secondary: #764ba2;    /* Accent Purple */
  
  /* Background */
  --bb-dark: #1a1a2e;         /* Dark background */
  --bb-darker: #16213e;       /* Darker panel */
  --bb-accent: #0f3460;       /* Panel accent */
  
  /* Decision Colors */
  --bb-bid: #22c55e;          /* Green - BID */
  --bb-review: #fbbf24;       /* Yellow - REVIEW */
  --bb-skip: #ef4444;         /* Red - SKIP */
  --bb-pending: #6b7280;      /* Gray - PENDING */
  
  /* Text */
  --bb-text-primary: #ffffff;
  --bb-text-secondary: #94a3b8;
  --bb-text-muted: #64748b;
}
```

### Typography

```css
:root {
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}

/* Scale */
.text-xs: 0.75rem;    /* 12px - badges, captions */
.text-sm: 0.875rem;   /* 14px - body small */
.text-base: 1rem;     /* 16px - body */
.text-lg: 1.125rem;   /* 18px - headings */
.text-xl: 1.25rem;    /* 20px - titles */
.text-2xl: 1.5rem;    /* 24px - page titles */
```

### Component Variants (CVA)

```typescript
// lib/variants.ts
import { cva } from 'class-variance-authority';

export const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold',
  {
    variants: {
      recommendation: {
        BID: 'bg-bb-bid text-white',
        REVIEW: 'bg-bb-review text-black',
        SKIP: 'bg-bb-skip text-white',
        PENDING: 'bg-gray-500 text-white',
      },
    },
    defaultVariants: {
      recommendation: 'PENDING',
    },
  }
);

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-bb-primary',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-r from-bb-primary to-bb-secondary text-white hover:opacity-90',
        secondary: 'bg-white/10 text-white hover:bg-white/20',
        danger: 'bg-bb-skip text-white hover:bg-bb-skip/90',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);
```

---

## 📦 Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Install core dependencies (assistant-ui, shadcn/ui, Zustand)
- [ ] Deploy SplitScreenLayout component
- [ ] Configure Tailwind with design tokens
- [ ] Set up Claude API integration
- [ ] Implement basic chat interface

### Phase 2: Core Features (Week 3-4)
- [ ] PropertyCard with ML prediction display
- [ ] PipelineProgress visualization
- [ ] MapView with color-coded markers
- [ ] PropertyFilters component
- [ ] Supabase real-time subscriptions

### Phase 3: Intelligence Layer (Week 5-6)
- [ ] Claude tool calling integration
- [ ] MCP server connections
- [ ] Smart Router V5 with Gemini fallback
- [ ] Decision reasoning accordion
- [ ] Report generation preview

### Phase 4: Polish & Scale (Week 7-8)
- [ ] Mobile responsive design
- [ ] Performance optimization (virtualization)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Error boundaries and retries
- [ ] Production deployment

---

## 💰 Cost Analysis

### Infrastructure (Monthly)

| Service | Tier | Cost |
|---------|------|------|
| Claude API | Smart Router optimized | $500 (40% FREE via Gemini) |
| Supabase | Pro | $25 |
| Cloudflare Pages | Free | $0 |
| Domain | Existing | $0 |
| **Total** | | **$525/month** |

### ROI Projection

**Internal Alpha Value:**
- 1 extra deal/quarter: $50,000
- 1 avoided loss/quarter: $100,000
- Time savings: $150,000/year
- **Annual Value:** $300-400K
- **Cost:** $6,300/year
- **ROI:** ~50-60x

---

## 🔗 Resources

### Official Documentation
- assistant-ui: https://www.assistant-ui.com/docs
- LobeChat: https://github.com/lobehub/lobe-chat
- shadcn/ui: https://ui.shadcn.com
- Anthropic API: https://docs.anthropic.com
- Supabase: https://supabase.com/docs

### BidDeed.AI Repositories
- Main: https://github.com/breverdbidder/brevard-bidder-scraper
- Landing: https://github.com/breverdbidder/brevard-bidder-landing
- Life OS: https://github.com/breverdbidder/life-os

---

**Document Version:** 2.0  
**Last Updated:** December 2025  
**Author:** Claude AI Architect  
**Owner:** Ariel Shapira, Everest Capital USA
