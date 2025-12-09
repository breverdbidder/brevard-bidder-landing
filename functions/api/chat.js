// BrevardBidderAI Chat API V5 - Smart Router with Gemini FREE Tier
// Routes: FREE (Gemini Flash) → PRODUCTION (Claude Sonnet)

export async function onRequest(context) {
  const { request, env } = context;
  const startTime = Date.now();
  const MAX_EXECUTION_TIME = 25000;
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  function timeRemaining() { return MAX_EXECUTION_TIME - (Date.now() - startTime); }
  function isTimeUp() { return timeRemaining() < 3000; }

  try {
    const body = await request.json();
    const { password, messages, session_id } = body;

    if (password !== env.BIDDER_PASSWORD) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const now = new Date();
    const flTime = now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    const lastUserMsg = messages[messages.length - 1]?.content || '';

    // SMART ROUTER: Determine which tier to use
    function routeQuery(query) {
      const q = query.toLowerCase();
      
      // PRODUCTION tier (Claude) - Complex queries requiring tools
      const needsClaude = [
        'search', 'web', 'query', 'database', 'supabase', 'github',
        'auction', 'property', 'forecast', 'analyze', 'report',
        'calculate', 'max bid', 'investment', 'scrape', 'fetch'
      ];
      
      if (needsClaude.some(kw => q.includes(kw))) {
        return 'PRODUCTION';
      }
      
      // FREE tier (Gemini) - Simple queries
      return 'FREE';
    }

    const tier = routeQuery(lastUserMsg);
    
    const systemPrompt = `You are BrevardBidderAI Assistant - Foreclosure intelligence for Brevard County, FL.

CURRENT: ${dateStr} | ${flTime} EST

You help with foreclosure auction analysis. Key info:
- Decision: BID (≥75%), REVIEW (60-74%), SKIP (<60%)
- Max Bid: (ARV×70%) - Repairs - $10K - MIN($25K, 15%×ARV)
- Next auction: December 17, 2025 at Titusville Courthouse 11AM

For database queries or web searches, tell user to ask specifically.
Creator: Ariel Shapira, Solo Founder | Everest Capital USA`;

    // Gemini FREE tier - no tool use, fast responses
    async function callGemini(msgs) {
      const geminiMessages = msgs.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: geminiMessages,
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
              maxOutputTokens: 2048,
              temperature: 0.7
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
      
      return {
        content: [{ type: 'text', text }],
        model: 'gemini-1.5-flash',
        usage: { input_tokens: 0, output_tokens: 0 } // Gemini doesn't return this easily
      };
    }

    // Claude PRODUCTION tier - with tools
    const tools = [
      {
        name: "supabase_query",
        description: "Query database - FAST. Tables: historical_auctions, insights, auction_results",
        input_schema: {
          type: "object",
          properties: {
            table: { type: "string" },
            select: { type: "string" },
            filter: { type: "string" },
            order: { type: "string" },
            limit: { type: "number" }
          },
          required: ["table"]
        }
      },
      {
        name: "github_read_file",
        description: "Read file from repo",
        input_schema: {
          type: "object",
          properties: {
            repo: { type: "string" },
            path: { type: "string" }
          },
          required: ["repo", "path"]
        }
      },
      {
        name: "web_search",
        description: "Search internet",
        input_schema: {
          type: "object",
          properties: { query: { type: "string" } },
          required: ["query"]
        }
      }
    ];

    async function fetchWithTimeout(url, options, timeoutMs = 8000) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeout);
        return response;
      } catch (e) {
        clearTimeout(timeout);
        throw e.name === 'AbortError' ? new Error('Timeout') : e;
      }
    }

    async function executeTool(name, input) {
      if (isTimeUp()) return { error: "Time limit", skipped: true };

      try {
        if (name === "supabase_query") {
          const { table, select = "*", filter, order, limit = 10 } = input;
          let url = `${env.SUPABASE_URL}/rest/v1/${table}?select=${select}&limit=${limit}`;
          if (filter) url += `&${filter}`;
          if (order) url += `&order=${order}`;
          
          const resp = await fetchWithTimeout(url, {
            headers: {
              'apikey': env.SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
            }
          }, 5000);
          
          if (!resp.ok) return { error: `DB error: ${resp.status}` };
          const rows = await resp.json();
          return { rows: rows.slice(0, limit), count: rows.length };
        }
        
        if (name === "github_read_file") {
          const { repo, path } = input;
          const resp = await fetchWithTimeout(
            `https://raw.githubusercontent.com/${repo}/main/${path}`,
            { headers: { 'Authorization': `token ${env.GITHUB_TOKEN}` } },
            5000
          );
          if (!resp.ok) return { error: `File not found` };
          const content = await resp.text();
          return { content: content.substring(0, 4000) };
        }

        if (name === "web_search") {
          const { query } = input;
          const resp = await fetchWithTimeout(
            `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
            { headers: { 'User-Agent': 'Mozilla/5.0' } },
            6000
          );
          if (!resp.ok) return { error: "Search failed" };
          const html = await resp.text();
          const results = [];
          const regex = /<a[^>]+class="result__a"[^>]*>([^<]+)<\/a>/gi;
          let match;
          while ((match = regex.exec(html)) !== null && results.length < 5) {
            results.push({ title: match[1].trim() });
          }
          return results.length ? { results } : { message: "No results" };
        }
        
        return { error: "Unknown tool" };
      } catch (e) {
        return { error: e.message };
      }
    }

    async function callClaude(msgs) {
      const response = await fetchWithTimeout(
        'https://api.anthropic.com/v1/messages',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2048,
            system: systemPrompt + '\n\nUse tools when needed. Complete response after tool results.',
            tools: tools,
            messages: msgs
          })
        },
        15000
      );

      if (!response.ok) throw new Error(`Claude error: ${response.status}`);
      return response.json();
    }

    let data;
    let totalTokens = 0;
    let toolsUsed = [];

    if (tier === 'FREE') {
      // Use Gemini - fast, no tools
      try {
        data = await callGemini(messages);
        totalTokens = 0; // FREE!
      } catch (geminiError) {
        // Fallback to Claude if Gemini fails
        console.log('Gemini failed, falling back to Claude:', geminiError.message);
        data = await callClaude(messages);
        totalTokens = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
      }
    } else {
      // PRODUCTION tier - Claude with tools
      let conversationMessages = [...messages];
      
      for (let i = 0; i < 3; i++) {
        if (isTimeUp()) {
          return new Response(JSON.stringify({
            content: [{ type: 'text', text: `⏱️ Time limit. Tools used: ${toolsUsed.join(', ') || 'none'}` }],
            _meta: { timeout: true, tier, tools_used: toolsUsed }
          }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        try {
          data = await callClaude(conversationMessages);
          totalTokens += (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
          
          if (data.stop_reason !== 'tool_use') break;
          
          const toolCalls = data.content.filter(b => b.type === 'tool_use');
          if (toolCalls.length === 0) break;
          
          const toolResults = [];
          for (const tc of toolCalls.slice(0, 2)) {
            if (isTimeUp()) break;
            toolsUsed.push(tc.name);
            const result = await executeTool(tc.name, tc.input);
            toolResults.push({
              type: 'tool_result',
              tool_use_id: tc.id,
              content: JSON.stringify(result)
            });
          }
          
          if (toolResults.length === 0) break;
          
          conversationMessages.push({ role: 'assistant', content: data.content });
          conversationMessages.push({ role: 'user', content: toolResults });
          
        } catch (loopError) {
          if (data?.content) {
            return new Response(JSON.stringify({
              ...data,
              _meta: { error: loopError.message, tier, tools_used: toolsUsed }
            }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
          throw loopError;
        }
      }
    }

    // Calculate cost savings
    const savings = tier === 'FREE' ? 'FREE (Gemini)' : `${totalTokens} tokens (Claude)`;

    return new Response(JSON.stringify({
      ...data,
      _meta: {
        tier,
        session_tokens: totalTokens,
        tools_used: toolsUsed,
        elapsed_ms: Date.now() - startTime,
        cost: savings
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message,
      content: [{ type: 'text', text: `❌ Error: ${error.message}` }],
      _meta: { elapsed_ms: Date.now() - startTime }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
