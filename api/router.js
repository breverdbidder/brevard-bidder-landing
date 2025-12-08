// BrevardBidderAI - Smart Router API
// Routes requests to optimal LLM tier based on complexity
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

export const config = { runtime: 'edge' };

const ROUTER_TIERS = {
  FREE: {
    models: ['gemini-1.5-flash', 'llama-3.1-8b'],
    maxTokens: 1000,
    tasks: ['greeting', 'simple_query', 'filter']
  },
  ULTRA_CHEAP: {
    models: ['deepseek-v3.2'],
    cost: 0.28, // per 1M tokens
    tasks: ['summarize', 'format']
  },
  BUDGET: {
    models: ['claude-3-haiku'],
    cost: 0.25,
    tasks: ['calendar', 'list', 'compare']
  },
  PRODUCTION: {
    models: ['claude-sonnet-4'],
    cost: 3.0,
    tasks: ['analyze', 'pipeline', 'report']
  },
  CRITICAL: {
    models: ['claude-opus-4.5'],
    cost: 15.0,
    tasks: ['complex_decision', 'legal', 'lien_priority']
  }
};

function detectComplexity(message) {
  const lower = message.toLowerCase();
  
  if (/^(hi|hello|hey|thanks)/.test(lower)) return 'FREE';
  if (/show|list|filter|bid properties|skip/.test(lower)) return 'FREE';
  if (/calendar|schedule|when|date/.test(lower)) return 'BUDGET';
  if (/summarize|compare/.test(lower)) return 'ULTRA_CHEAP';
  if (/analyze|pipeline|detail|report/.test(lower)) return 'PRODUCTION';
  if (/lien|priority|legal|title search|complex/.test(lower)) return 'CRITICAL';
  
  return 'FREE';
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  try {
    const body = await req.json();
    const { message, forcetier } = body;
    
    const tier = forcetier || detectComplexity(message);
    const config = ROUTER_TIERS[tier];
    
    return new Response(JSON.stringify({
      success: true,
      tier,
      model: config.models[0],
      cost: config.cost || 0,
      tasks: config.tasks,
      message: `Routed to ${tier} tier using ${config.models[0]}`
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
