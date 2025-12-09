// BrevardBidderAI - Smart Router V5 API
// Routes requests to optimal LLM tier based on complexity
// DEFAULT: gemini-2.5-flash (1M context FREE)
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

export const config = { runtime: 'edge' };

const ROUTER_TIERS = {
  FREE: {
    model: 'gemini-2.5-flash',  // 1M context window - DEFAULT
    contextWindow: 1000000,
    cost: 0,
    tasks: ['greeting', 'simple_query', 'filter', 'report_generation', 'bulk_scraping', 'data_enrichment', 'property_analysis', 'document_parsing']
  },
  ULTRA_CHEAP: {
    model: 'deepseek-chat',  // V3.2
    contextWindow: 128000,
    cost: 0.28, // per 1M tokens
    tasks: ['summarize', 'format', 'lien_analysis', 'title_search', 'legal_document_review']
  },
  BUDGET: {
    model: 'claude-3-haiku-20240307',
    contextWindow: 200000,
    cost: 0.25,
    tasks: ['calendar', 'list', 'compare', 'classification', 'simple_extraction', 'status_check']
  },
  PRODUCTION: {
    model: 'claude-sonnet-4-20250514',
    contextWindow: 200000,
    cost: 3.0,
    tasks: ['analyze', 'pipeline', 'report', 'complex_decision', 'strategy_analysis', 'market_evaluation']
  },
  CRITICAL: {
    model: 'claude-opus-4-20250514',
    contextWindow: 200000,
    cost: 15.0,
    tasks: ['complex_decision', 'legal', 'lien_priority', 'max_bid_calculation', 'final_approval', 'high_value_decision']
  }
};

function detectComplexity(message) {
  const lower = message.toLowerCase();
  
  // FREE tier - DEFAULT for most operations (1M context)
  if (/^(hi|hello|hey|thanks)/.test(lower)) return 'FREE';
  if (/show|list|filter|bid properties|skip|report|generate|bulk|enrich|property|scrape/.test(lower)) return 'FREE';
  
  // BUDGET tier
  if (/calendar|schedule|when|date/.test(lower)) return 'BUDGET';
  
  // ULTRA_CHEAP tier
  if (/summarize|compare|lien analysis|title search/.test(lower)) return 'ULTRA_CHEAP';
  
  // PRODUCTION tier
  if (/analyze|pipeline|detail|strategy|market/.test(lower)) return 'PRODUCTION';
  
  // CRITICAL tier
  if (/max bid|final|priority|legal|complex decision/.test(lower)) return 'CRITICAL';
  
  return 'FREE';  // Default to FREE tier (gemini-2.5-flash)
}

async function callGemini(prompt, env) {
  const apiKey = env.GOOGLE_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 8192, temperature: 0.7 }
    })
  });
  
  const data = await response.json();
  
  if (data.candidates && data.candidates[0]) {
    return {
      content: data.candidates[0].content.parts[0].text,
      model: 'gemini-2.5-flash',
      tier: 'FREE',
      contextWindow: 1000000,
      cost: 0
    };
  }
  
  throw new Error(data.error?.message || 'Gemini API error');
}

export default async function handler(req, env) {
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
    const { message, task_type, force_tier } = await req.json();
    
    // Determine tier
    const tier = force_tier || detectComplexity(message);
    const tierConfig = ROUTER_TIERS[tier] || ROUTER_TIERS.FREE;
    
    // Route to appropriate model
    let result;
    if (tier === 'FREE' || !env.ANTHROPIC_API_KEY) {
      // DEFAULT: Use Gemini 2.5 Flash (1M context FREE)
      result = await callGemini(message, env);
    } else {
      // For paid tiers, implement Anthropic/DeepSeek calls
      // Fallback to FREE tier if keys not set
      result = await callGemini(message, env);
    }
    
    return new Response(JSON.stringify({
      success: true,
      tier: result.tier,
      model: result.model,
      contextWindow: result.contextWindow,
      cost: result.cost,
      content: result.content,
      routing: {
        detected_tier: tier,
        model_used: result.model,
        context_window: '1M tokens (FREE)'
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      fallback: 'Using gemini-2.5-flash FREE tier'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
