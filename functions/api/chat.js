// BrevardBidderAI Chat API V4 - Extended tool loop for full reports
// Fixes: More iterations, longer timeout, complete response delivery

export async function onRequest(context) {
  const { request, env } = context;
  
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

    const systemPrompt = `You are BrevardBidderAI Assistant - Foreclosure auction intelligence for Brevard County, FL.

CURRENT TIME: ${dateStr} | ${flTime} EST

IMPORTANT: When asked for reports or analysis, COMPLETE THE FULL RESPONSE. Do not stop mid-way.
If you start listing properties, finish listing ALL of them with details.

12-STAGE PIPELINE:
1. Discovery - Find auction listings
2. Scraping - Get property details  
3. Title Search - Check ownership
4. Lien Priority - Analyze liens/mortgages
5. Tax Certificates - Check tax status
6. Demographics - Area analysis
7. ML Score - Predict third-party probability
8. Max Bid - Calculate maximum bid
9. Decision - BID/REVIEW/SKIP recommendation
10. Report - Generate summary
11. Disposition - Track outcome
12. Archive - Store for history

DECISION FRAMEWORK:
- BID (≥75% bid/judgment): Strong opportunity
- REVIEW (60-74%): Needs manual evaluation  
- SKIP (<60%): Not recommended

MAX BID FORMULA: (ARV×70%) - Repairs - $10K - MIN($25K, 15%×ARV)

TOOLS - USE THEM TO GET REAL DATA:
1. supabase_query - Query auction database (historical_auctions has 1,393+ records)
2. github_list_files / github_read_file - Browse code
3. web_search - Search for current info
4. memory_search - Search stored knowledge

For INVESTMENT REPORTS: Query historical_auctions for the auction date, then provide analysis for EACH property.

CREATOR: Ariel Shapira, Solo Founder | Everest Capital USA`;

    const tools = [
      {
        name: "supabase_query",
        description: "Query Supabase database. Key tables: historical_auctions (auction_id, address, case_number, plaintiff, final_judgment, opening_bid, sold_amount, auction_date, status), insights, auction_results",
        input_schema: {
          type: "object",
          properties: {
            table: { type: "string", description: "Table: historical_auctions, insights, auction_results, daily_metrics" },
            select: { type: "string", description: "Columns to select (default: *)" },
            filter: { type: "string", description: "PostgREST filter, e.g.: auction_date=eq.2025-12-10 or status=eq.SOLD" },
            order: { type: "string", description: "Order by, e.g.: created_at.desc or final_judgment.desc" },
            limit: { type: "number", description: "Max rows (default: 20)" }
          },
          required: ["table"]
        }
      },
      {
        name: "github_list_files",
        description: "List files in repository directory",
        input_schema: {
          type: "object",
          properties: {
            repo: { type: "string", description: "breverdbidder/brevard-bidder-scraper or breverdbidder/brevard-bidder-landing" },
            path: { type: "string", description: "Directory path (empty for root)" }
          },
          required: ["repo"]
        }
      },
      {
        name: "github_read_file",
        description: "Read file from repository",
        input_schema: {
          type: "object",
          properties: {
            repo: { type: "string", description: "Repository owner/name" },
            path: { type: "string", description: "File path" }
          },
          required: ["repo", "path"]
        }
      },
      {
        name: "web_search",
        description: "Search the web for current information",
        input_schema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" }
          },
          required: ["query"]
        }
      },
      {
        name: "memory_search",
        description: "Search stored insights and checkpoints",
        input_schema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search terms" },
            type: { type: "string", description: "Filter by type: mcp_reference, chat_checkpoint, auction_analysis" }
          },
          required: ["query"]
        }
      }
    ];

    // Tool execution with 30s timeout
    async function executeTool(name, input) {
      const timeout = (ms) => new Promise((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), ms)
      );
      
      try {
        const result = await Promise.race([
          executeToolInternal(name, input),
          timeout(30000)
        ]);
        return result;
      } catch (e) {
        return { error: e.message };
      }
    }

    async function executeToolInternal(name, input) {
      if (name === "supabase_query") {
        const { table, select = "*", filter, order, limit = 20 } = input;
        let url = `${env.SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(select)}&limit=${limit}`;
        if (filter) url += `&${filter}`;
        if (order) url += `&order=${order}`;
        
        const resp = await fetch(url, {
          headers: {
            'apikey': env.SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
          }
        });
        if (!resp.ok) return { error: `Query failed: ${resp.status}` };
        const rows = await resp.json();
        return { rows, count: rows.length, table };
      }
      
      if (name === "github_list_files") {
        const { repo, path = "" } = input;
        const resp = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
          headers: { 
            'Authorization': `token ${env.GITHUB_TOKEN}`,
            'User-Agent': 'BrevardBidderAI'
          }
        });
        if (!resp.ok) return { error: `Failed: ${resp.status}` };
        const files = await resp.json();
        return Array.isArray(files) 
          ? { files: files.map(f => ({ name: f.name, type: f.type, path: f.path })) }
          : { error: "Not a directory" };
      }
      
      if (name === "github_read_file") {
        const { repo, path } = input;
        const resp = await fetch(`https://raw.githubusercontent.com/${repo}/main/${path}`, {
          headers: { 'Authorization': `token ${env.GITHUB_TOKEN}` }
        });
        if (!resp.ok) return { error: `Not found: ${path}` };
        return { content: (await resp.text()).substring(0, 8000) };
      }
      
      if (name === "web_search") {
        const { query } = input;
        const resp = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BrevardBidderAI/1.0)' }
        });
        if (!resp.ok) return { error: `Search failed` };
        const html = await resp.text();
        const results = [];
        const regex = /<a[^>]+class="result__a"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
        let match;
        while ((match = regex.exec(html)) !== null && results.length < 5) {
          results.push({ url: match[1], title: match[2].trim() });
        }
        return results.length ? { results } : { message: "No results" };
      }
      
      if (name === "memory_search") {
        const { query, type } = input;
        let url = `${env.SUPABASE_URL}/rest/v1/insights?select=*&order=created_at.desc&limit=5`;
        if (type) url += `&insight_type=eq.${type}`;
        const resp = await fetch(url, {
          headers: {
            'apikey': env.SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
          }
        });
        if (!resp.ok) return { error: "Search failed" };
        return { results: await resp.json() };
      }
      
      return { error: "Unknown tool" };
    }

    // Call Claude API
    async function callClaude(msgs) {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8192,  // Increased for full reports
          system: systemPrompt,
          tools: tools,
          messages: msgs
        })
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error?.message || `API ${resp.status}`);
      }
      return resp.json();
    }

    // Main loop - up to 12 iterations for full pipeline
    let conversationMessages = [...messages];
    let data;
    let totalTokens = 0;
    let toolsUsed = [];
    
    for (let i = 0; i < 12; i++) {
      data = await callClaude(conversationMessages);
      totalTokens += (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
      
      if (data.stop_reason !== 'tool_use') break;
      
      const toolCalls = data.content.filter(b => b.type === 'tool_use');
      if (!toolCalls.length) break;
      
      const toolResults = [];
      for (const tc of toolCalls) {
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

    // Ensure we have text response
    let textContent = data.content?.filter(b => b.type === 'text').map(b => b.text).join('\n\n') || '';
    
    if (!textContent && data.stop_reason === 'tool_use') {
      textContent = '⚠️ Report generation incomplete. The query required more processing. Try breaking it into smaller requests:\n\n1. "Show December 10 auctions"\n2. Then for each: "Analyze [address]"';
    }

    return new Response(JSON.stringify({
      ...data,
      _meta: {
        session_tokens: totalTokens,
        tools_used: toolsUsed,
        iterations: toolsUsed.length,
        message_count: messages.length
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message,
      content: [{ type: 'text', text: `⚠️ Error: ${error.message}. Try a simpler query.` }]
    }), {
      status: 200, // Return 200 so frontend displays the error message
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
