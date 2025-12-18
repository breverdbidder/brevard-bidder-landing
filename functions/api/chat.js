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
      model: 'gemini-2.0-flash',
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
2. **Auction Intelligence**: Provide information about upcoming auctions
3. **Investment Recommendations**: Offer BID/REVIEW/SKIP recommendations based on 12-stage pipeline analysis
4. **Market Insights**: Share demographic data, market trends, and neighborhood analysis
5. **Lien Analysis**: Explain lien priority, title issues, and their impact on investments

## Auction Calendar (Brevard County, Florida):
- **December 18, 2025 (Thursday)**: Tax Deed Auction @ 9:00 AM - ONLINE at brevard.realforeclose.com
- **January 7, 2026 (Tuesday)**: Foreclosure Auction @ 11:00 AM - IN-PERSON at Titusville Courthouse

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

Remember: You're speaking with real estate investors who need actionable intelligence, not generic advice.`;

// Call Gemini API
async function callGemini(messages, apiKey, config) {
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY not configured');
  }

  // Convert messages to Gemini format
  const geminiMessages = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({
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
    const errorText = await response.text();
    console.error('Gemini API error:', response.status, errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
    console.error('Unexpected Gemini response:', JSON.stringify(data));
    throw new Error('Invalid response from Gemini');
  }

  return {
    content: data.candidates[0].content.parts[0].text,
    model: config.model,
    provider: 'google',
    tokens: data.usageMetadata?.totalTokenCount || 0,
  };
}

// Call Claude API
async function callClaude(messages, apiKey, config) {
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

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
    const errorText = await response.text();
    console.error('Claude API error:', response.status, errorText);
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.content?.[0]?.text || 'No response',
    model: config.model,
    provider: 'anthropic',
    tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
  };
}

// Route to appropriate LLM
async function routeToLLM(messages, tier, env) {
  const config = SMART_ROUTER_CONFIG.tiers[tier] || SMART_ROUTER_CONFIG.tiers.FREE;
  
  if (config.provider === 'google') {
    return await callGemini(messages, env.GOOGLE_API_KEY, config);
  } else if (config.provider === 'anthropic') {
    return await callClaude(messages, env.ANTHROPIC_API_KEY, config);
  }
  
  throw new Error('Invalid LLM provider');
}

// Main handler
export default {
  async fetch(request, env, ctx) {
    const startTime = Date.now();

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
        const { messages, tier = 'FREE', session_id } = body;

        if (!messages || !Array.isArray(messages)) {
          return new Response(JSON.stringify({ 
            error: 'Invalid messages format',
            content: [{ type: 'text', text: 'Error: Invalid request format' }]
          }), {
            status: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          });
        }

        // Route to LLM
        const llmResponse = await routeToLLM(messages, tier, env);
        const elapsed = Date.now() - startTime;

        // Return in format expected by chat.html frontend
        return new Response(JSON.stringify({
          content: [{ type: 'text', text: llmResponse.content }],
          _meta: {
            router: tier === 'FREE' ? 'GEMINI_FREE' : 'CLAUDE',
            model: llmResponse.model,
            provider: llmResponse.provider,
            tokens: llmResponse.tokens,
            elapsed_ms: elapsed,
            cost: tier === 'FREE' ? 'FREE' : `~$${(llmResponse.tokens * 0.00001).toFixed(4)}`,
            session_id: session_id,
            timestamp: new Date().toISOString(),
          },
        }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });

      } catch (error) {
        console.error('Chat API error:', error);
        const elapsed = Date.now() - startTime;
        
        return new Response(JSON.stringify({
          error: error.message,
          content: [{ type: 'text', text: `⚠️ Error: ${error.message}\n\nPlease try again or rephrase your question.` }],
          _meta: {
            router: 'ERROR',
            elapsed_ms: elapsed,
            timestamp: new Date().toISOString(),
          },
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
