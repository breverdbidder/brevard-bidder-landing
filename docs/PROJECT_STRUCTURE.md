# BidDeed.AI Frontend Project Structure
## Complete Component Library & Architecture

**Version:** 2.0 Enterprise  
**Stack:** Next.js 15 + React 18 + TypeScript + Tailwind CSS

---

## 📁 Directory Structure

```
biddeed-ai-ui/
├── app/                           # Next.js 15 App Router
│   ├── (auth)/                    # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/               # Protected dashboard routes
│   │   ├── layout.tsx             # Dashboard layout with sidebar
│   │   ├── page.tsx               # Main split-screen view
│   │   ├── properties/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx       # Property detail view
│   │   │   └── page.tsx           # Property list/table
│   │   ├── auctions/
│   │   │   └── [date]/
│   │   │       └── page.tsx       # Auction-specific view
│   │   ├── pipeline/
│   │   │   └── page.tsx           # Pipeline monitoring
│   │   └── reports/
│   │       └── page.tsx           # Generated reports
│   ├── api/                       # API Routes
│   │   ├── chat/
│   │   │   └── route.ts           # Chat API (Smart Router)
│   │   ├── claude/
│   │   │   └── route.ts           # Claude API proxy
│   │   ├── properties/
│   │   │   └── route.ts           # Property CRUD
│   │   ├── pipeline/
│   │   │   └── route.ts           # Pipeline orchestration
│   │   └── webhooks/
│   │       └── supabase/
│   │           └── route.ts       # Realtime webhooks
│   ├── layout.tsx                 # Root layout
│   ├── globals.css                # Global styles
│   └── providers.tsx              # Context providers
│
├── components/                    # React Components
│   ├── chat/                      # AI Chat Interface
│   │   ├── BidDeedChat.tsx        # Main chat component
│   │   ├── MessageBubble.tsx      # Message display
│   │   ├── ToolCallMonitor.tsx    # Tool call visualization
│   │   ├── ChatInput.tsx          # Input with suggestions
│   │   └── WelcomeMessage.tsx     # Initial state
│   │
│   ├── layout/                    # Layout Components
│   │   ├── SplitScreenLayout.tsx  # Main 30/70 split
│   │   ├── Header.tsx             # Top navigation
│   │   ├── Sidebar.tsx            # Side navigation
│   │   └── StatusBar.tsx          # Bottom status bar
│   │
│   ├── property/                  # Property Components
│   │   ├── PropertyCard.tsx       # Property card with ML badge
│   │   ├── PropertyTable.tsx      # Data table view
│   │   ├── PropertyDetail.tsx     # Full property view
│   │   ├── PropertyFilters.tsx    # Filter controls
│   │   ├── PhotoGallery.tsx       # BCPAO photos
│   │   └── LienTimeline.tsx       # Lien visualization
│   │
│   ├── pipeline/                  # Pipeline Components
│   │   ├── PipelineProgress.tsx   # 12-stage progress
│   │   ├── StageCard.tsx          # Individual stage
│   │   └── StageTimeline.tsx      # Horizontal timeline
│   │
│   ├── decision/                  # Decision Components
│   │   ├── DecisionPanel.tsx      # Main decision display
│   │   ├── DecisionBadge.tsx      # BID/REVIEW/SKIP badge
│   │   └── ReasoningAccordion.tsx # Expandable reasoning
│   │
│   ├── report/                    # Report Components
│   │   ├── ReportPreview.tsx      # Report preview
│   │   ├── ReportDownload.tsx     # Download buttons
│   │   └── ReportGenerator.tsx    # Generation trigger
│   │
│   ├── workspace/                 # Workspace Components
│   │   ├── WorkspacePanel.tsx     # Right panel container
│   │   ├── TabNavigation.tsx      # Tab switcher
│   │   └── ContentArea.tsx        # Tab content
│   │
│   ├── map/                       # Map Components
│   │   ├── MapView.tsx            # Mapbox integration
│   │   ├── PropertyMarker.tsx     # Color-coded markers
│   │   └── MapControls.tsx        # Zoom/filter controls
│   │
│   └── ui/                        # shadcn/ui Components
│       ├── button.tsx
│       ├── card.tsx
│       ├── accordion.tsx
│       ├── tabs.tsx
│       ├── badge.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── skeleton.tsx
│       ├── table.tsx
│       ├── toast.tsx
│       └── tooltip.tsx
│
├── lib/                           # Core Libraries
│   ├── claude-orchestrator.ts     # Claude Sonnet 4 integration
│   ├── smart-router.ts            # Multi-model router
│   ├── supabase-client.ts         # Client-side Supabase
│   ├── supabase-server.ts         # Server-side Supabase
│   ├── utils.ts                   # Utility functions
│   ├── cn.ts                      # Class name merger
│   ├── pipeline/                  # Pipeline stage handlers
│   │   ├── index.ts
│   │   ├── discovery.ts
│   │   ├── scraping.ts
│   │   ├── title-search.ts
│   │   ├── lien-priority.ts
│   │   ├── tax-certs.ts
│   │   ├── demographics.ts
│   │   ├── ml-prediction.ts
│   │   ├── max-bid.ts
│   │   ├── decision.ts
│   │   ├── report.ts
│   │   ├── disposition.ts
│   │   └── archive.ts
│   └── validators/                # Zod schemas
│       ├── property.ts
│       └── pipeline.ts
│
├── stores/                        # Zustand State Stores
│   ├── useAuctionStore.ts         # Auction data
│   ├── usePipelineStore.ts        # Pipeline state
│   ├── usePropertyStore.ts        # Property state
│   ├── useChatStore.ts            # Chat history
│   └── useUIStore.ts              # UI preferences
│
├── hooks/                         # Custom React Hooks
│   ├── useClaudeStream.ts         # Claude streaming
│   ├── usePropertyData.ts         # Property queries
│   ├── usePipelineStatus.ts       # Pipeline monitoring
│   ├── useRealtimeUpdates.ts      # Supabase realtime
│   ├── useSmartRouter.ts          # Model selection
│   └── useLocalStorage.ts         # Persistent state
│
├── types/                         # TypeScript Types
│   ├── property.ts                # Property interfaces
│   ├── pipeline.ts                # Pipeline types
│   ├── decision.ts                # Decision types
│   ├── chat.ts                    # Chat message types
│   ├── supabase.ts                # Database types
│   └── index.ts                   # Re-exports
│
├── styles/                        # Additional Styles
│   ├── animations.css             # Custom animations
│   └── map.css                    # Mapbox overrides
│
├── public/                        # Static Assets
│   ├── fonts/
│   │   ├── Inter.woff2
│   │   └── JetBrainsMono.woff2
│   ├── images/
│   │   ├── logo.svg
│   │   ├── logo-dark.svg
│   │   └── placeholder-property.jpg
│   └── icons/
│       └── favicon.ico
│
├── .env.local                     # Local environment
├── .env.example                   # Example environment
├── next.config.js                 # Next.js config
├── tailwind.config.ts             # Tailwind config
├── tsconfig.json                  # TypeScript config
├── package.json                   # Dependencies
├── postcss.config.js              # PostCSS config
└── README.md                      # Documentation
```

---

## 🧩 Component Inventory

### Core Components (Deployed)

| Component | File | Status | Description |
|-----------|------|--------|-------------|
| BidDeedChat | `components/chat/BidDeedChat.tsx` | ✅ Deployed | AI chat with pipeline |
| SplitScreenLayout | `components/layout/SplitScreenLayout.tsx` | ✅ Deployed | 30/70 resizable |
| PropertyCard | `components/property/PropertyCard.tsx` | ✅ Deployed | ML badge display |
| PipelineProgress | `components/pipeline/PipelineProgress.tsx` | ✅ Deployed | 12-stage tracker |
| DecisionPanel | `components/decision/DecisionPanel.tsx` | ✅ Deployed | Reasoning accordion |

### Integration Libraries (Deployed)

| Library | File | Status | Description |
|---------|------|--------|-------------|
| Claude Orchestrator | `lib/claude-orchestrator.ts` | ✅ Deployed | Sonnet 4 + tools |
| Smart Router | `lib/smart-router.ts` | 🔜 Pending | Multi-model router |
| Supabase Client | `lib/supabase-client.ts` | 🔜 Pending | Database connection |

---

## 📦 Dependencies

### Core Dependencies

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.20.0",
    "@assistant-ui/react": "^0.5.0",
    "@supabase/supabase-js": "^2.39.0",
    "@tanstack/react-query": "^5.0.0",
    "next": "^15.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "zustand": "^4.5.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.400.0",
    "recharts": "^2.12.0",
    "react-resizable-panels": "^2.0.0",
    "mapbox-gl": "^3.0.0",
    "react-map-gl": "^7.1.0",
    "react-hook-form": "^7.50.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "class-variance-authority": "^0.7.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^4.0.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

---

## 🔧 Environment Variables

```bash
# .env.local

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-api03-...

# Google (Smart Router FREE tier)
GOOGLE_API_KEY=AIza...

# DeepSeek (ULTRA_CHEAP tier)
DEEPSEEK_API_KEY=sk-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://mocerqjnksmhcjzxrewo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ...

# Clerk (optional)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Feature Flags
NEXT_PUBLIC_ENABLE_SMART_ROUTER=true
NEXT_PUBLIC_FREE_TIER_TARGET=0.45
```

---

## 🚀 Deployment

### Cloudflare Pages (Current)

```bash
# Build
npm run build

# Deploy via GitHub integration
# Auto-deploys on push to main branch
```

### Vercel (Alternative)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker (Enterprise)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📊 Component Usage Examples

### BidDeedChat

```tsx
import { BidDeedChat } from '@/components/chat/BidDeedChat';

export default function ChatPage() {
  return (
    <div className="h-screen">
      <BidDeedChat />
    </div>
  );
}
```

### PipelineProgress

```tsx
import { PipelineProgress, mockPipelineData } from '@/components/pipeline/PipelineProgress';

export default function PipelinePage() {
  return (
    <PipelineProgress 
      stages={mockPipelineData.stages}
      results={mockPipelineData.results}
      onStageClick={(stageId) => console.log('Clicked:', stageId)}
    />
  );
}
```

### DecisionPanel

```tsx
import { DecisionPanel, mockDecisionData } from '@/components/decision/DecisionPanel';

export default function DecisionPage() {
  return (
    <DecisionPanel {...mockDecisionData} />
  );
}
```

---

## 🎨 Design Tokens Quick Reference

```css
/* Colors */
--bb-primary: #667eea;     /* Trust Blue */
--bb-secondary: #764ba2;   /* Accent Purple */
--bb-bid: #22c55e;         /* Green - BID */
--bb-review: #fbbf24;      /* Yellow - REVIEW */
--bb-skip: #ef4444;        /* Red - SKIP */
--bb-dark: #1a1a2e;        /* Background */
--bb-darker: #16213e;      /* Panel */
--bb-accent: #0f3460;      /* Border */

/* Typography */
font-family: 'Inter', system-ui;          /* Sans */
font-family: 'JetBrains Mono', monospace; /* Mono */
```

---

**Last Updated:** December 2025  
**Maintainer:** Claude AI Architect
