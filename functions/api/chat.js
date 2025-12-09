// BrevardBidderAI Chat API V4 - Aggressive timeout handling for Cloudflare Workers
// Cloudflare has 30s CPU limit - we must complete within that

export async function onRequest(context) {
  const { request, env } = context;
  const startTime = Date.now();
  const MAX_EXECUTION_TIME = 25000; // 25 seconds max, leave buffer for Cloudflare
  
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

  // Helper: Check if we're running out of time
  function timeRemaining() {
    return MAX_EXECUTION_TIME - (Date.now() - startTime);
  }

  function isTimeUp() {
    return timeRemaining() < 3000; // Less than 3 seconds left
  }

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

    const systemPrompt = `You are BrevardBidderAI Assistant - Foreclosure intelligence for Brevard County, FL.

CURRENT TIME: ${dateStr} | ${flTime} EST

CRITICAL INSTRUCTIONS:
1. Use MINIMAL tool calls - prefer supabase_query over web_search
2. After getting tool results, IMMEDIATELY provide your analysis
3. DO NOT chain multiple tools unless absolutely necessary
4. If you have enough data, respond WITHOUT more tool calls
5. Keep responses concise but complete

TOOLS (use sparingly):
1. supabase_query - Query database (FAST - prefer this)
2. github_list_files - List repo files
3. github_read_file - Read file content
4. web_search - Internet search (SLOW - avoid if possible)

DATABASE TABLES:
- historical_auctions: auction_id, case_number, property_address, plaintiff, final_judgment, opening_bid, sale_price, status
- insights: insight_type, title, description
- auction_results: Recent auction outcomes

DECISION FRAMEWORK:
- BID (≥75%): Strong buy
- REVIEW (60-74%): Evaluate manually
- SKIP (<60%): Pass

Max Bid: (ARV×70%) - Repairs - $10K - MIN($25K, 15%×ARV)

IMPORTANT: Complete your response after 1-2 tool calls. Don't leave responses hanging.`;

    const tools = [
      {
        name: "supabase_query",
        description: "Query database - FAST. Use this for auction data.",
        input_schema: {
          type: "object",
          properties: {
            table: { type: "string", description: "historical_auctions, insights, or auction_results" },
            select: { type: "string", description: "Columns (default: *)" },
            filter: { type: "string", description: "e.g. status=eq.SOLD" },
            order: { type: "string", description: "e.g. auction_date.desc" },
            limit: { type: "number", description: "Max rows (default 10)" }
          },
          required: ["table"]
        }
      },
      {
        name: "github_list_files",
        description: "List repository files",
        input_schema: {
          type: "object",
          properties: {
            repo: { type: "string" },
            path: { type: "string" }
          },
          required: ["repo"]
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
        description: "Search internet - SLOW, use only if necessary",
        input_schema: {
          type: "object",
          properties: {
            query: { type: "string" }
          },
          required: ["query"]
        }
      }
    ];

    // Fetch with timeout
    async function fetchWithTimeout(url, options, timeoutMs = 8000) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      
      try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeout);
        return response;
      } catch (e) {
        clearTimeout(timeout);
        if (e.name === 'AbortError') {
          throw new Error('Request timed out');
        }
        throw e;
      }
    }

    async function executeTool(name, input) {
      if (isTimeUp()) {
        return { error: "Time limit reached - skipping tool", skipped: true };
      }

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
        
        if (name === "github_list_files") {
          const { repo, path = "" } = input;
          const resp = await fetchWithTimeout(
            `https://api.github.com/repos/${repo}/contents/${path}`,
            {
              headers: { 
                'Authorization': `token ${env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'BrevardBidderAI'
              }
            }, 5000
          );
          if (!resp.ok) return { error: `GitHub error: ${resp.status}` };
          const files = await resp.json();
          if (Array.isArray(files)) {
            return { files: files.slice(0, 20).map(f => ({ name: f.name, type: f.type })) };
          }
          return { error: "Not a directory" };
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
          while ((match = regex.exec(html)) !== null && results.length < 3) {
            results.push({ title: match[1].trim() });
          }
          return results.length ? { results } : { message: "No results" };
        }
        
        return { error: "Unknown tool" };
      } catch (e) {
        return { error: e.message };
      }
    }

    async function callAnthropic(msgs) {
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
            max_tokens: 2048, // Reduced for faster responses
            system: systemPrompt,
            tools: tools,
            messages: msgs
          })
        },
        15000 // 15 second timeout for Anthropic
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    }

    // Main loop - strict limits
    let conversationMessages = [...messages];
    let data;
    let totalTokens = 0;
    let toolsUsed = [];
    const MAX_TOOL_LOOPS = 3; // Strict limit
    
    for (let i = 0; i < MAX_TOOL_LOOPS; i++) {
      // Check time before each iteration
      if (isTimeUp()) {
        return new Response(JSON.stringify({
          content: [{ type: 'text', text: `⏱️ Time limit reached. Partial response from tools: ${toolsUsed.join(', ') || 'none'}. Please try a simpler query.` }],
          _meta: { timeout: true, tools_used: toolsUsed, elapsed_ms: Date.now() - startTime }
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        data = await callAnthropic(conversationMessages);
        totalTokens += (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
        
        // If Claude finished (no more tool calls), we're done
        if (data.stop_reason !== 'tool_use') break;
        
        const toolCalls = data.content.filter(b => b.type === 'tool_use');
        if (toolCalls.length === 0) break;
        
        // Execute tools (limit to 2 per iteration)
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
        // Return partial response on error
        if (data && data.content) {
          return new Response(JSON.stringify({
            ...data,
            _meta: { error: loopError.message, tools_used: toolsUsed, partial: true }
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        throw loopError;
      }
    }

    // Success response
    return new Response(JSON.stringify({
      ...data,
      _meta: {
        session_tokens: totalTokens,
        tools_used: toolsUsed,
        elapsed_ms: Date.now() - startTime
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
