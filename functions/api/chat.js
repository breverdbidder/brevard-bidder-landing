// BrevardBidderAI Chat API v2 - Improved timeout handling
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

    const systemPrompt = `You are BrevardBidderAI Assistant - foreclosure auction intelligence for Brevard County, FL.

CURRENT: ${dateStr} | ${flTime} EST

CRITICAL RULES:
1. KEEP RESPONSES CONCISE - avoid timeouts on complex queries
2. For multi-property requests: summarize key data, don't generate full reports
3. Use MAX 2 tool calls per response to stay within time limits
4. If asked for "full 12-stage pipeline" or complex reports: explain you'll provide key highlights and suggest they request one property at a time for full details

12-STAGE PIPELINE OVERVIEW (reference only):
1. Discovery → 2. Scraping → 3. Title Search → 4. Lien Priority → 5. Tax Certs → 6. Demographics → 7. ML Score → 8. Max Bid → 9. Decision Log → 10. Report → 11. Disposition → 12. Archive

MAX BID FORMULA: (ARV×70%) - Repairs - $10K - MIN($25K, 15%×ARV)

DECISION THRESHOLDS:
- BID: Judgment/Value ratio ≥75%
- REVIEW: 60-74%  
- SKIP: <60%

TOOLS (use sparingly):
- supabase_query: Query historical_auctions, insights, auction_results
- github_list_files/read_file: Browse code
- web_search: Current property info
- memory_search: Knowledge base

CREATOR: Ariel Shapira, Solo Founder | Everest Capital USA`;

    const tools = [
      {
        name: "supabase_query",
        description: "Query auction database. Tables: historical_auctions, insights, auction_results. Keep queries focused.",
        input_schema: {
          type: "object",
          properties: {
            table: { type: "string" },
            select: { type: "string", description: "Columns (default: *)" },
            filter: { type: "string", description: "Filter like: address=ilike.*Melbourne*" },
            order: { type: "string" },
            limit: { type: "number", description: "Max 10 recommended" }
          },
          required: ["table"]
        }
      },
      {
        name: "github_list_files",
        description: "List files in repository",
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
        description: "Read file contents",
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
        description: "Search web for property/market info",
        input_schema: {
          type: "object",
          properties: {
            query: { type: "string" }
          },
          required: ["query"]
        }
      }
    ];

    async function executeTool(name, input) {
      try {
        if (name === "supabase_query") {
          const { table, select = "*", filter, order, limit = 10 } = input;
          let url = `${env.SUPABASE_URL}/rest/v1/${table}?select=${select}&limit=${Math.min(limit, 20)}`;
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
          return { rows: rows.slice(0, 10), count: rows.length };
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
          if (!resp.ok) return { error: `Failed: ${resp.status}` };
          const files = await resp.json();
          if (Array.isArray(files)) {
            return { files: files.slice(0, 15).map(f => ({ name: f.name, type: f.type })) };
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
          return { content: content.substring(0, 4000) };
        }

        if (name === "web_search") {
          const { query } = input;
          const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
          const resp = await fetch(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BrevardBidderAI/1.0)' }
          });
          if (!resp.ok) return { error: `Search failed` };
          const html = await resp.text();
          const results = [];
          const regex = /<a[^>]+class="result__a"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
          let match;
          while ((match = regex.exec(html)) !== null && results.length < 3) {
            results.push({ url: match[1], title: match[2].trim() });
          }
          return { results };
        }
        
        return { error: "Unknown tool" };
      } catch (e) {
        return { error: `Tool error: ${e.message}` };
      }
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
          max_tokens: 2048,
          system: systemPrompt,
          tools: tools,
          messages: msgs
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || `API error ${response.status}`);
      }
      return response.json();
    }

    let conversationMessages = [...messages];
    let data;
    
    // Reduced to 3 iterations to prevent timeout
    for (let i = 0; i < 3; i++) {
      data = await callAnthropic(conversationMessages);
      
      if (data.stop_reason !== 'tool_use') break;
      
      const toolCalls = data.content.filter(b => b.type === 'tool_use');
      if (toolCalls.length === 0) break;
      
      const toolResults = [];
      for (const tc of toolCalls.slice(0, 2)) { // Max 2 tools per iteration
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

    // Ensure we have text content
    const hasText = data.content?.some(b => b.type === 'text');
    if (!hasText && data.stop_reason === 'tool_use') {
      data.content.push({
        type: 'text',
        text: '⏱️ This query requires more processing time. Please try a simpler request, like asking about one property at a time.'
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal error',
      content: [{ type: 'text', text: `⚠️ Error: ${error.message}. Try a simpler query.` }]
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
