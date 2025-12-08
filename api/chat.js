// Vercel Serverless Function - Smart Router Chat API
// Routes queries to appropriate LLM tier based on complexity
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

const SMART_ROUTER_TIERS = {
  FREE: { models: ['gemini-1.5-flash'], maxTokens: 1000 },
  ULTRA_CHEAP: { models: ['deepseek-v3'], maxTokens: 2000, cost: 0.28 },
  BUDGET: { models: ['claude-3-haiku'], maxTokens: 4000, cost: 0.25 },
  PRODUCTION: { models: ['claude-sonnet-4'], maxTokens: 8000, cost: 3.0 },
  CRITICAL: { models: ['claude-opus-4.5'], maxTokens: 16000, cost: 15.0 }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, context } = req.body;
  
  // Determine complexity and select tier
  const tier = selectTier(message);
  const tierConfig = SMART_ROUTER_TIERS[tier];
  
  // For now, return intent analysis (can be expanded to call actual LLMs)
  const intent = analyzeIntent(message);
  
  return res.status(200).json({
    success: true,
    tier,
    model: tierConfig.models[0],
    intent,
    response: generateResponse(intent, context),
    timestamp: new Date().toISOString()
  });
}

function selectTier(message) {
  const lower = message.toLowerCase();
  
  // Simple queries = FREE
  if (/^(hi|hello|help|calendar|show|list)/.test(lower)) return 'FREE';
  
  // Filter/search = ULTRA_CHEAP
  if (/bid|review|skip|filter|search/.test(lower)) return 'ULTRA_CHEAP';
  
  // Analysis = BUDGET
  if (/analyze|compare|summary/.test(lower)) return 'BUDGET';
  
  // Complex reasoning = PRODUCTION
  if (/strategy|recommend|should i|which/.test(lower)) return 'PRODUCTION';
  
  // Critical decisions = CRITICAL
  if (/max bid|final|invest|purchase/.test(lower)) return 'CRITICAL';
  
  return 'FREE';
}

function analyzeIntent(message) {
  const lower = message.toLowerCase();
  return {
    isTaxDeed: /tax\s*deed|tax\s*sale|tax\s*lien/.test(lower),
    isForeclosure: /foreclosure|mortgage|bank/.test(lower),
    isPast: /last|previous|results|dec\s*3/.test(lower),
    isUpcoming: /upcoming|next|dec\s*10|dec\s*17|dec\s*18/.test(lower),
    wantsList: /show|list|all|properties/.test(lower),
    wantsAnalysis: /analyze|pipeline|detail/.test(lower),
    wantsCalendar: /calendar|schedule|when/.test(lower),
    needsClarification: false
  };
}

function generateResponse(intent, context) {
  // This would be replaced with actual LLM calls in production
  if (intent.wantsCalendar) {
    return 'Fetching auction calendar from Supabase...';
  }
  if (intent.isPast) {
    return 'Loading December 3, 2025 auction results...';
  }
  if (intent.isUpcoming) {
    return 'Loading upcoming auction preview...';
  }
  return 'Processing your request...';
}
