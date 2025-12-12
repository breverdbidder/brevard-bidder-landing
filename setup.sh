#!/bin/bash
# BidDeed.AI Enterprise UI Setup Script
# Run: chmod +x setup.sh && ./setup.sh

set -e

echo "🏔️ BidDeed.AI Enterprise UI Setup"
echo "=================================="

# Check Node version
NODE_VERSION=$(node -v 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Node.js 20+ required. Current: $(node -v)"
  exit 1
fi
echo "✅ Node.js $(node -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Core AI/Chat dependencies
echo "📦 Installing AI chat dependencies..."
npm install @anthropic-ai/sdk @assistant-ui/react @supabase/supabase-js

# State management
echo "📦 Installing state management..."
npm install zustand @tanstack/react-query framer-motion

# UI components
echo "📦 Installing UI components..."
npm install lucide-react recharts react-resizable-panels
npm install clsx tailwind-merge class-variance-authority

# Radix UI primitives (for shadcn/ui)
echo "📦 Installing Radix UI..."
npm install @radix-ui/react-accordion @radix-ui/react-dialog \
  @radix-ui/react-progress @radix-ui/react-scroll-area \
  @radix-ui/react-tooltip @radix-ui/react-tabs

# Setup environment
if [ ! -f .env.local ]; then
  echo ""
  echo "📝 Creating .env.local from template..."
  cp .env.example .env.local
  echo "⚠️  Edit .env.local with your API keys"
fi

# Verify installation
echo ""
echo "🔍 Verifying installation..."
npm list @anthropic-ai/sdk @assistant-ui/react zustand --depth=0 2>/dev/null || true

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env.local with your API keys"
echo "  2. Run: npm run dev"
echo "  3. Open: http://localhost:3000/test"
echo ""
echo "🏔️ The Everest Ascent™ awaits!"
