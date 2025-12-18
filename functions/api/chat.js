// BidDeed.AI V18 - Chat API Worker
// Cloudflare Worker with Smart Router + Gemini 2.5 Flash
// © 2025 Everest Capital USA. All Rights Reserved.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Smart Router Configuration
const SMART_ROUTER_CONFIG = {
  tiers: {
    FREE: {
      model: 'gemini-2.5-flash',
      provider: 'google',
      contextLimit: 1000000,
      rateLimit: 1000,
    },
    STANDARD: {
      model: 'claude-3-haiku-20240307',
      provider: 'anthropic',
      contextLimit: 200000,
      rateLimit: 100,
    },
    PREMIUM: {
      model: 'claude-sonnet-4-20250514',
      provider: 'anthropic',
      contextLimit: 200000,
      rateLimit: 50,
    },
  },
  defaultTier: 'FREE',
};

// System Prompt for BidDeed.AI
const SYSTEM_PROMPT = `You are BidDeed.AI V18, an intelligent foreclosure auction assistant powered by the Everest Ascent™ pipeline. You help real estate investors analyze properties, understand auction dynamics, and make informed investment decisions in Brevard County, Florida.

## Your Capabilities:
1. **Property Analysis**: Analyze foreclosure and tax deed properties using data from BCPAO, AcclaimWeb, RealTDM, and Census API
2. **Auction Intelligence**: Provide information about upcoming auctions (Dec 17 foreclosure, Dec 18 tax deed)
3. **Investment Recommendations**: Offer BID/REVIEW/SKIP recommendations based on 12-stage pipeline analysis
4. **Market Insights**: Share demographic data, market trends, and neighborhood analysis
5. **Lien Analysis**: Explain lien priority, title issues, and their impact on investments

## Response Guidelines:
- Be concise but comprehensive
- Use data to support recommendations
- Always mention risk factors
- Format responses with clear sections using **bold** for headers
- Include relevant emojis for visual clarity (📊 📅 💰 🏠 ⚠️ ✅ 🔴)
- Provide actionable next steps

## Key Knowledge:
- Brevard County auctions: Foreclosures at Titusville Courthouse (in-person), Tax Deeds at brevard.realforeclose.com (online)
- Investment formula: Max Bid = (ARV × 70%) - Repairs - $10K - MIN($25K, 15% ARV)
- Bid/Judgment Ratio: <10% = Excellent, 10-25% = Good, >25% = Risky
- ML Model Accuracy: 64.4% for third-party purchase prediction

## Current Context:
- Today's Date: ${new Date().toISOString().split('T')[0]}
- Upcoming Auctions: Dec 17 (Foreclosure), Dec 18 (Tax Deed)
- System Status: All pipelines operational

Remember: You're speaking with real estate investors who need actionable intelligence, not generic advice.`;

// Route request to appropriate LLM
async function routeToLLM(messages, tier, env) {
  const config = SMART_ROUTER_CONFIG.tiers[tier] || SMART_ROUTER_CONFIG.tiers.FREE;
  
  if (config.provider === 'google') {
    return await callGemini(messages, env.GOOGLE_API_KEY, config);
  } else if (config.provider === 'anthropic') {
    return await callClaude(messages, env.ANTHROPIC_API_KEY, config);
  }
  
  throw new Error('Invalid LLM provider');
}

// Call Gemini API
async function callGemini(messages, apiKey, config) {
  const geminiMessages = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: geminiMessages,
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          topP: 0.9,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return {
    content: data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate response',
    model: config.model,
    provider: 'google',
    tokens: data.usageMetadata?.totalTokenCount || 0,
  };
}

// Call Claude API
async function callClaude(messages, apiKey, config) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return {
    content: data.content?.[0]?.text || 'Unable to generate response',
    model: config.model,
    provider: 'anthropic',
    tokens: data.usage?.input_tokens + data.usage?.output_tokens || 0,
  };
}

// Fetch property data from Supabase
async function fetchPropertyData(query, env) {
  const supabaseUrl = env.SUPABASE_URL || 'https://mocerqjnksmhcjzxrewo.supabase.co';
  const supabaseKey = env.SUPABASE_ANON_KEY;

  if (!supabaseKey) return null;

  try {
    let endpoint = `${supabaseUrl}/rest/v1/`;
    
    if (query.type === 'property') {
      endpoint += `auction_results?address=ilike.*${encodeURIComponent(query.address)}*&limit=5`;
    } else if (query.type === 'auction') {
      endpoint += `historical_auctions?auction_date=eq.${query.date}&limit=50`;
    } else if (query.type === 'recommendations') {
      endpoint += `auction_results?recommendation=eq.BID&order=ml_score.desc&limit=10`;
    }

    const response = await fetch(endpoint, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Supabase fetch error:', error);
    return null;
  }
}

// Extract query context from message
function extractQueryContext(message) {
  const lowerMessage = message.toLowerCase();
  
  // Property address detection
  const addressMatch = message.match(/(\d+\s+[\w\s]+(?:st|rd|ave|dr|blvd|ln|ct|way|pl)[\w\s,]*)/i);
  if (addressMatch) {
    return { type: 'property', address: addressMatch[1] };
  }

  // Date detection for auctions
  const dateMatch = lowerMessage.match(/dec(?:ember)?\s*(\d{1,2})/);
  if (dateMatch) {
    return { type: 'auction', date: `2025-12-${dateMatch[1].padStart(2, '0')}` };
  }

  // Recommendations query
  if (lowerMessage.includes('recommend') || lowerMessage.includes('best') || lowerMessage.includes('top')) {
    return { type: 'recommendations' };
  }

  return null;
}

// Main request handler
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    // Health check
    if (url.pathname === '/api/chat/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        version: 'V18',
        timestamp: new Date().toISOString(),
        smartRouter: {
          defaultTier: SMART_ROUTER_CONFIG.defaultTier,
          availableModels: Object.keys(SMART_ROUTER_CONFIG.tiers),
        },
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // Chat endpoint
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { messages, tier = 'FREE', includeData = true } = body;

        if (!messages || !Array.isArray(messages)) {
          return new Response(JSON.stringify({ error: 'Invalid messages format' }), {
            status: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          });
        }

        // Get the last user message
        const lastUserMessage = messages.filter(m => m.role === 'user').pop();
        
        // Augment with database context if needed
        let dbContext = null;
        if (includeData && lastUserMessage) {
          const queryContext = extractQueryContext(lastUserMessage.content);
          if (queryContext) {
            dbContext = await fetchPropertyData(queryContext, env);
          }
        }

        // Prepare messages with context
        let augmentedMessages = [...messages];
        if (dbContext && dbContext.length > 0) {
          const contextMessage = {
            role: 'user',
            content: `[SYSTEM DATA - Use this to answer the user's question]\n${JSON.stringify(dbContext, null, 2)}\n\n[USER QUESTION]\n${lastUserMessage.content}`,
          };
          augmentedMessages = [
            ...messages.slice(0, -1),
            contextMessage,
          ];
        }

        // Route to LLM
        const llmResponse = await routeToLLM(augmentedMessages, tier, env);

        return new Response(JSON.stringify({
          success: true,
          response: llmResponse.content,
          metadata: {
            model: llmResponse.model,
            provider: llmResponse.provider,
            tokens: llmResponse.tokens,
            tier,
            hasDbContext: !!dbContext,
            timestamp: new Date().toISOString(),
          },
        }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });

      } catch (error) {
        console.error('Chat API error:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }
    }

    // 404 for unknown routes
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  },
};
