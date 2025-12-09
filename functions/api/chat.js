// BrevardBidderAI Chat API V3 - Robust error handling, timeout protection
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

IMPORTANT: When using tools, complete your response after getting results. Don't leave responses incomplete.

TOOLS AVAILABLE:
1. supabase_query - Query auction database (historical_auctions: 1,393+ records, insights, auction_results)
2. github_list_files - Browse repository code
3. github_read_file - Read file contents  
4. web_search - Search the internet (may be slow, use sparingly)

DATABASE TABLES:
- historical_auctions: auction_id, case_number, property_address, plaintiff, defendant, final_judgment, opening_bid, sale_price, status, auction_date
- insights: id, insight_type, title, description, source, priority, created_at
- auction_results: Results from actual auctions

DECISION FRAMEWORK:
- BID (≥75% bid/judgment): Strong opportunity
- REVIEW (60-74%): Needs evaluation  
- SKIP (<60%): Not recommended

Max Bid Formula: (ARV×70%) - Repairs - $10K - MIN($25K, 15%×ARV)

CREATOR: Ariel Shapira, Solo Founder | Everest Capital USA

Always provide complete responses. If a tool fails, explain what happened and provide what information you can.`;

    const tools = [
      {
        name: "supabase_query",
        description: "Query Supabase database. Tables: historical_auctions (1393 records), insights, auction_results",
        input_schema: {
          type: "object",
          properties: {
            table: { type: "string", description: "Table: historical_auctions, insights, or auction_results" },
            select: { type: "string", description: "Columns (default: *)" },
            filter: { type: "string", description: "Filter like: status=eq.SOLD or insight_type=eq.mcp_reference" },
            order: { type: "string", description: "Order: auction_date.desc or created_at.desc" },
            limit: { type: "number", description: "Max rows (default: 10)" }
          },
          required: ["table"]
        }
      },
      {
        name: "github_list_files",
        description: "List files in a repository directory",
        input_schema: {
          type: "object",
          properties: {
            repo: { type: "string", description: "breverdbidder/brevard-bidder-scraper or breverdbidder/brevard-bidder-landing" },
            path: { type: "string", description: "Directory path, empty for root" }
          },
          required: ["repo"]
        }
      },
      {
        name: "github_read_file",
        description: "Read file contents from repository",
        input_schema: {
          type: "object",
          properties: {
            repo: { type: "string", description: "Repository owner/repo" },
            path: { type: "string", description: "File path" }
          },
          required: ["repo", "path"]
        }
      },
      {
        name: "web_search",
        description: "Search web for current info. Use sparingly - can be slow.",
        input_schema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" }
          },
          required: ["query"]
        }
      }
    ];

    // Execute tool with timeout
    async function executeTool(name, input) {
      const timeout = (ms) => new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Tool timeout')), ms)
      );
      
      try {
        const result = await Promise.race([
          executeToolInternal(name, input),
          timeout(25000) // 25 second timeout per tool
        ]);
        return result;
      } catch (e) {
        return { error: `Tool ${name} failed: ${e.message}` };
      }
    }

    async function executeToolInternal(name, input) {
      if (name === "supabase_query") {
        const { table, select = "*", filter, order, limit = 10 } = input;
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
        return { rows, count: rows.length };
      }
      
      if (name === "github_list_files") {
        const { repo, path = "" } = input;
        const url = `https://api.github.com/repos/${repo}/contents/${path}`;
        const resp = await fetch(url, {
          headers: { 
            'Authorization': `token ${env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'BrevardBidderAI'
          }
        });
        if (!resp.ok) return { error: `GitHub error: ${resp.status}` };
        const files = await resp.json();
        if (Array.isArray(files)) {
          return { files: files.map(f => ({ name: f.name, type: f.type, path: f.path })) };
        }
        return { error: "Not a directory" };
      }
      
      if (name === "github_read_file") {
        const { repo, path } = input;
        const url = `https://raw.githubusercontent.com/${repo}/main/${path}`;
        const resp = await fetch(url, {
          headers: { 'Authorization': `token ${env.GITHUB_TOKEN}` }
        });
        if (!resp.ok) return { error: `File not found: ${path}` };
        const content = await resp.text();
        return { content: content.substring(0, 6000) };
      }

      if (name === "web_search") {
        const { query } = input;
        try {
          const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
          const resp = await fetch(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
          });
          if (!resp.ok) return { error: `Search failed: ${resp.status}` };
          const html = await resp.text();
          
          const results = [];
          const titleRegex = /<a[^>]+class="result__a"[^>]*>([^<]+)<\/a>/gi;
          const urlRegex = /<a[^>]+class="result__a"[^>]*href="([^"]+)"/gi;
          
          let match;
          while ((match = titleRegex.exec(html)) !== null && results.length < 5) {
            results.push({ title: match[1].trim() });
          }
          
          let i = 0;
          while ((match = urlRegex.exec(html)) !== null && i < results.length) {
            if (results[i]) results[i].url = match[1];
            i++;
          }
          
          return results.length > 0 ? { results, query } : { message: "No results found", query };
        } catch (e) {
          return { error: `Search error: ${e.message}` };
        }
      }
      
      return { error: "Unknown tool" };
    }

    async function callAnthropic(msgs) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          system: systemPrompt,
          tools: tools,
          messages: msgs
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Anthropic API error ${response.status}: ${errText.substring(0, 200)}`);
      }

      return response.json();
    }

    // Main conversation loop with error recovery
    let conversationMessages = [...messages];
    let data;
    let totalTokens = 0;
    let toolsUsed = [];
    
    for (let i = 0; i < 5; i++) {  // Max 5 tool iterations
      try {
        data = await callAnthropic(conversationMessages);
        totalTokens += (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
        
        if (data.stop_reason !== 'tool_use') break;
        
        const toolCalls = data.content.filter(b => b.type === 'tool_use');
        if (toolCalls.length === 0) break;
        
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
        
      } catch (loopError) {
        // If error in loop, return what we have so far
        return new Response(JSON.stringify({
          content: [{ type: 'text', text: `⚠️ Processing interrupted: ${loopError.message}. Please try a simpler query.` }],
          _meta: { error: true, tools_used: toolsUsed, partial: true }
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Return response with metadata
    return new Response(JSON.stringify({
      ...data,
      _meta: {
        session_tokens: totalTokens,
        message_count: messages.length,
        tools_used: toolsUsed
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal error',
      content: [{ type: 'text', text: `⚠️ Error: ${error.message}. Please try again with a simpler query.` }]
    }), {
      status: 200, // Return 200 with error content so frontend can display it
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
