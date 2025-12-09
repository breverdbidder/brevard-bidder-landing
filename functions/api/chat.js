// BrevardBidderAI Chat API - Cloudflare Pages Function
// Foreclosure intelligence with tool access

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

    const systemPrompt = `You are BrevardBidderAI Assistant - an intelligent foreclosure auction analysis system for Brevard County, FL.

CURRENT TIME: ${dateStr} | ${flTime} EST

PLATFORM OVERVIEW:
BrevardBidderAI is an Agentic AI ecosystem (NOT SaaS) that automates foreclosure auction intelligence through a 12-stage pipeline:
1. Discovery → 2. Scraping → 3. Title Search → 4. Lien Priority Analysis → 5. Tax Certificates → 6. Demographics → 7. ML Score → 8. Max Bid Calculation → 9. Decision Log → 10. Report → 11. Disposition → 12. Archive

TOOLS AVAILABLE:
1. github_list_files - Browse repository code
2. github_read_file - Read specific files  
3. supabase_query - Query auction data, insights, metrics
4. web_search - Search for current property/market info
5. memory_search - Search BrevardBidderAI knowledge base

KEY DATA SOURCES:
- historical_auctions: 1,393+ foreclosure records with judgment amounts, bid history, outcomes
- insights (mcp_reference): Architecture documentation, pipeline details
- BCPAO: Property values, photos, ownership
- RealForeclose: Live auction listings

DECISION FRAMEWORK:
- BID (≥75% bid/judgment): Strong opportunity
- REVIEW (60-74%): Needs manual evaluation  
- SKIP (<60%): Not recommended

Max Bid Formula: (ARV×70%) - Repairs - $10K - MIN($25K, 15%×ARV)

CREATOR: Ariel Shapira, Solo Founder | Real Estate Developer & Founder, Everest Capital USA

USE TOOLS proactively for any questions about auction data, property values, code, or market conditions.`;

    const tools = [
      {
        name: "github_list_files",
        description: "List files in BrevardBidderAI repository",
        input_schema: {
          type: "object",
          properties: {
            repo: { type: "string", description: "Repository: breverdbidder/brevard-bidder-scraper or breverdbidder/brevard-bidder-landing" },
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
            repo: { type: "string", description: "Repository in format owner/repo" },
            path: { type: "string", description: "File path" }
          },
          required: ["repo", "path"]
        }
      },
      {
        name: "supabase_query",
        description: "Query auction database. Tables: historical_auctions (1393 records), insights, daily_metrics, auction_results",
        input_schema: {
          type: "object",
          properties: {
            table: { type: "string", description: "Table name" },
            select: { type: "string", description: "Columns (default: *)" },
            filter: { type: "string", description: "Filter like: insight_type=eq.mcp_reference" },
            order: { type: "string", description: "Order: created_at.desc" },
            limit: { type: "number", description: "Max rows (default: 10)" }
          },
          required: ["table"]
        }
      },
      {
        name: "web_search",
        description: "Search web for property info, market data, news",
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
        description: "Search BrevardBidderAI knowledge: architecture, past analyses, pipeline docs",
        input_schema: {
          type: "object",
          properties: {
            query: { type: "string", description: "What to search for" },
            type: { type: "string", description: "Optional: mcp_reference, auction_analysis, pipeline" }
          },
          required: ["query"]
        }
      }
    ];

    async function executeTool(name, input) {
      try {
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
          return { content: content.substring(0, 8000) };
        }
        
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
          if (!resp.ok) return { error: `Query failed: ${resp.status}` };
          const rows = await resp.json();
          return { rows, count: rows.length };
        }

        if (name === "web_search") {
          const { query } = input;
          const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
          const resp = await fetch(searchUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BrevardBidderAI/1.0)' }
          });
          if (!resp.ok) return { error: `Search failed: ${resp.status}` };
          const html = await resp.text();
          
          const results = [];
          const regex = /<a[^>]+class="result__a"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
          let match;
          while ((match = regex.exec(html)) !== null && results.length < 5) {
            results.push({ url: match[1], title: match[2].trim() });
          }
          
          if (results.length === 0) return { message: "No results found", query };
          return { results, query };
        }

        if (name === "memory_search") {
          const { query, type } = input;
          let url = `${env.SUPABASE_URL}/rest/v1/insights?select=*&order=created_at.desc&limit=5`;
          if (type) url += `&insight_type=eq.${type}`;
          url += `&or=(title.ilike.*${encodeURIComponent(query)}*,description.ilike.*${encodeURIComponent(query)}*)`;
          
          const resp = await fetch(url, {
            headers: {
              'apikey': env.SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
            }
          });
          if (!resp.ok) {
            const fallbackUrl = `${env.SUPABASE_URL}/rest/v1/insights?select=*&order=created_at.desc&limit=5${type ? `&insight_type=eq.${type}` : ''}`;
            const fallbackResp = await fetch(fallbackUrl, {
              headers: {
                'apikey': env.SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
              }
            });
            if (!fallbackResp.ok) return { error: `Search failed` };
            const rows = await fallbackResp.json();
            return { results: rows, query };
          }
          const rows = await resp.json();
          return { results: rows, query };
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
          max_tokens: 4096,
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
    
    for (let i = 0; i < 6; i++) {
      data = await callAnthropic(conversationMessages);
      
      if (data.stop_reason !== 'tool_use') break;
      
      const toolCalls = data.content.filter(b => b.type === 'tool_use');
      if (toolCalls.length === 0) break;
      
      const toolResults = [];
      for (const tc of toolCalls) {
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

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
