// BrevardBidderAI - Smart Router API
// Routes requests to optimal LLM based on complexity
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

export const config = { runtime: 'edge' };

const SMART_ROUTER = {
  FREE: {
    models: ['gemini-1.5-flash'],
    maxTokens: 1000,
    useCase: ['greetings', 'simple_queries', 'help']
  },
  ULTRA_CHEAP: {
    models: ['deepseek-v3'],
    cost: 0.00028,
    useCase: ['filtering', 'basic_analysis']
  },
  BUDGET: {
    models: ['claude-3-haiku'],
    cost: 0.00025,
    useCase: ['summaries', 'calendar']
  },
  PRODUCTION: {
    models: ['claude-sonnet-4'],
    cost: 0.003,
    useCase: ['property_analysis', 'recommendations']
  },
  CRITICAL: {
    models: ['claude-opus-4.5'],
    cost: 0.015,
    useCase: ['complex_decisions', 'lien_analysis']
  }
};

function selectTier(query, context) {
  const lower = query.toLowerCase();
  
  // Simple queries -> FREE
  if (/^(hi|hello|hey|help|what can you)/.test(lower)) return 'FREE';
  
  // Calendar/list queries -> BUDGET
  if (/calendar|schedule|list|show all/.test(lower)) return 'BUDGET';
  
  // Property analysis -> PRODUCTION
  if (/analyze|analysis|pipeline|details|recommendation/.test(lower)) return 'PRODUCTION';
  
  // Complex lien/title work -> CRITICAL
  if (/lien priority|title search|senior.*junior|hoa foreclosure/.test(lower)) return 'CRITICAL';
  
  // Default
  return 'ULTRA_CHEAP';
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST required' }), { status: 405 });
  }

  try {
    const body = await req.json();
    const { query, context, propertyId } = body;
    
    const tier = selectTier(query, context);
    const tierConfig = SMART_ROUTER[tier];
    
    // For now, return tier info + mock response
    // In production, this would call the actual LLM
    const response = {
      tier,
      model: tierConfig.models[0],
      cost: tierConfig.cost || 0,
      query,
      timestamp: new Date().toISOString(),
      // Mock response - replace with actual LLM call
      response: `[${tier}] Processing: "${query.substring(0, 50)}..."`,
      usage: {
        inputTokens: query.length / 4,
        outputTokens: 100,
        estimatedCost: tierConfig.cost ? tierConfig.cost * 0.001 : 0
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
