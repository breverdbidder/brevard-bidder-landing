// BrevardBidderAI Chat API V5 - Smart Router with Gemini FREE Tier
// Gemini 1.5 Flash: FREE, 1M context, 15 RPM, 1M TPM
// Claude Sonnet: Paid, for complex analysis

export async function onRequest(context) {
  const { request, env } = context;
  const startTime = Date.now();
  
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

  try {
    const body = await request.json();
    const { password, messages, session_id, force_claude } = body;

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

    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    
    // SMART ROUTER DECISION
    // Route to FREE Gemini for: simple queries, data lookups, summaries
    // Route to Claude for: complex analysis, tool use, reports, code
    const needsClaude = force_claude || 
      lastMessage.includes('report') ||
      lastMessage.includes('analyze') ||
      lastMessage.includes('investment') ||
      lastMessage.includes('calculate') ||
      lastMessage.includes('max bid') ||
      lastMessage.includes('12 stage') ||
      lastMessage.includes('pipeline') ||
      lastMessage.includes('code') ||
      lastMessage.includes('search') ||
      lastMessage.includes('github') ||
      lastMessage.includes('supabase') ||
      messages.length > 6; // Multi-turn complex conversations

    const router = needsClaude ? 'CLAUDE_SONNET' : 'GEMINI_FREE';
    
    const now = new Date();
    const flTime = now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

    const systemPrompt = `You are BrevardBidderAI Assistant - Foreclosure intelligence for Brevard County, FL.
CURRENT TIME: ${dateStr} | ${flTime} EST
ROUTER: ${router}

You help with Brevard County foreclosure auctions. Key info:
- Decision Framework: BID (≥75% ratio), REVIEW (60-74%), SKIP (<60%)
- Max Bid Formula: (ARV×70%) - Repairs - $10K - MIN($25K, 15%×ARV)
- Next auction: December 17, 2025 at Titusville Courthouse 11AM

For complex queries requiring database access, code, or detailed reports, suggest: "For detailed analysis, try asking for a full investment report."

CREATOR: Ariel Shapira, Solo Founder | Everest Capital USA`;

    // ========== GEMINI FREE TIER ==========
    if (router === 'GEMINI_FREE') {
      const geminiMessages = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: geminiMessages,
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048
            }
          })
        }
      );

      if (!geminiResponse.ok) {
        // Fallback to Claude if Gemini fails
        console.log('Gemini failed, falling back to Claude');
      } else {
        const geminiData = await geminiResponse.json();
        const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
        
        return new Response(JSON.stringify({
          content: [{ type: 'text', text }],
          model: 'gemini-1.5-flash',
          _meta: {
            router: 'GEMINI_FREE',
            elapsed_ms: Date.now() - startTime,
            cost: '$0.00'
          }
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // ========== CLAUDE SONNET (with tools) ==========
    const tools = [
      {
        name: "supabase_query",
        description: "Query database. Tables: historical_auctions (1393 records), insights, auction_results",
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
        description: "Read file from repository",
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
        description: "Search the web",
        input_schema: {
          type: "object",
          properties: { query: { type: "string" } },
          required: ["query"]
        }
      }
    ];

    async function executeTool(name, input) {
      try {
        if (name === "supabase_query") {
          const { table, select = "*", filter, order, limit = 10 } = input;
          let url = `${env.SUPABASE_URL}/rest/v1/${table}?select=${select}&limit=${limit}`;
          if (filter) url += `&${filter}`;
          if (order) url += `&order=${order}`;
          
          const resp = await fetch(url, {
            headers: {
              'apikey': env.SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
            }
          });
          if (!resp.ok) return { error: `DB error: ${resp.status}` };
          return { rows: await resp.json() };
        }
        
        if (name === "github_read_file") {
          const { repo, path } = input;
          const resp = await fetch(`https://raw.githubusercontent.com/${repo}/main/${path}`, {
            headers: { 'Authorization': `token ${env.GITHUB_TOKEN}` }
          });
          if (!resp.ok) return { error: `File not found` };
          const content = await resp.text();
          return { content: content.substring(0, 5000) };
        }

        if (name === "web_search") {
          const { query } = input;
          const resp = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });
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

    const claudeSystemPrompt = systemPrompt + `

TOOLS AVAILABLE: supabase_query, github_read_file, web_search
DATABASE: historical_auctions (auction_id, case_number, address, city, final_judgment, opening_bid, market_value, status, auction_date)

IMPORTANT: Complete your response after tool results. Keep responses concise but complete.`;

    let conversationMessages = [...messages];
    let data;
    let totalTokens = 0;
    let toolsUsed = [];
    
    for (let i = 0; i < 3; i++) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          system: claudeSystemPrompt,
          tools: tools,
          messages: conversationMessages
        })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      
      data = await response.json();
      totalTokens += (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
      
      if (data.stop_reason !== 'tool_use') break;
      
      const toolCalls = data.content.filter(b => b.type === 'tool_use');
      if (toolCalls.length === 0) break;
      
      const toolResults = [];
      for (const tc of toolCalls.slice(0, 2)) {
        toolsUsed.push(tc.name);
        const result = await executeTool(tc.name, tc.input);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: tc.id,
          content: JSON.stringify(result)
        });
      }
      
      conversationMessages.push({ role: 'assistant', content: data.content });
      conversationMessages.push({ role: 'user', content: toolResults });
    }

    // Estimate cost: ~$0.003/1K input, ~$0.015/1K output for Sonnet
    const estimatedCost = (totalTokens * 0.009 / 1000).toFixed(4);

    return new Response(JSON.stringify({
      ...data,
      model: 'claude-sonnet-4-20250514',
      _meta: {
        router: 'CLAUDE_SONNET',
        session_tokens: totalTokens,
        tools_used: toolsUsed,
        elapsed_ms: Date.now() - startTime,
        cost: `~$${estimatedCost}`
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message,
      content: [{ type: 'text', text: `❌ Error: ${error.message}` }]
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
