// BrevardBidderAI Chat API V2 - Context Management + Checkpoints
// Overcomes Claude context limits via automatic summarization

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

    // === CONTEXT MANAGEMENT ===
    const TOKEN_THRESHOLD = 150000; // Trigger summarization at 150K
    const MAX_MESSAGES = 50; // Max messages before summarizing
    
    // Load session state from Supabase
    let sessionState = await loadSessionState(env, session_id);
    
    // Estimate current token count (rough: 4 chars = 1 token)
    const estimatedTokens = JSON.stringify(messages).length / 4;
    
    // If approaching limit, summarize older messages
    let processedMessages = messages;
    if (estimatedTokens > TOKEN_THRESHOLD || messages.length > MAX_MESSAGES) {
      processedMessages = await summarizeConversation(env, messages, sessionState);
    }

    const now = new Date();
    const flTime = now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

    // Include context from previous checkpoints
    const contextPrefix = sessionState?.summary 
      ? `[CONTEXT FROM PREVIOUS SESSION: ${sessionState.summary}]\n\n` 
      : '';

    const systemPrompt = `You are BrevardBidderAI Assistant - Foreclosure auction intelligence for Brevard County, FL.

CURRENT TIME: ${dateStr} | ${flTime} EST

${contextPrefix}PLATFORM: Agentic AI ecosystem with 12-stage pipeline for foreclosure analysis.

TOOLS AVAILABLE:
1. github_list_files - Browse repository code
2. github_read_file - Read file contents  
3. supabase_query - Query auction database (historical_auctions: 1,393+ records)
4. web_search - Search the internet
5. memory_search - Search knowledge base

DECISION FRAMEWORK:
- BID (≥75% bid/judgment): Strong opportunity
- REVIEW (60-74%): Needs evaluation  
- SKIP (<60%): Not recommended

Max Bid: (ARV×70%) - Repairs - $10K - MIN($25K, 15%×ARV)

CREATOR: Ariel Shapira, Solo Founder | Everest Capital USA

USE TOOLS proactively. You have UNLIMITED context via automatic checkpointing.`;

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
        description: "Query auction database. Tables: historical_auctions, insights, daily_metrics, auction_results, chat_sessions",
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
        description: "Search stored knowledge: architecture, past analyses, checkpoints",
        input_schema: {
          type: "object",
          properties: {
            query: { type: "string", description: "What to search for" },
            type: { type: "string", description: "Optional: mcp_reference, auction_analysis, checkpoint" }
          },
          required: ["query"]
        }
      },
      {
        name: "save_checkpoint",
        description: "Save current conversation state for continuity. Use when: long conversation, important findings, before context limit.",
        input_schema: {
          type: "object",
          properties: {
            summary: { type: "string", description: "Summary of conversation so far" },
            key_findings: { type: "string", description: "Important discoveries or decisions" },
            next_steps: { type: "string", description: "What to do next" }
          },
          required: ["summary"]
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
        
        if (name === "save_checkpoint") {
          const { summary, key_findings, next_steps } = input;
          
          // Save to Supabase insights table
          const checkpoint = {
            insight_type: 'chat_checkpoint',
            title: `Checkpoint: ${session_id}`,
            description: JSON.stringify({ summary, key_findings, next_steps }),
            source: 'brevard_chat',
            priority: 'medium',
            created_at: new Date().toISOString()
          };
          
          await fetch(`${env.SUPABASE_URL}/rest/v1/insights`, {
            method: 'POST',
            headers: {
              'apikey': env.SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(checkpoint)
          });
          
          return { success: true, message: "Checkpoint saved. Context preserved for future sessions." };
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

    let conversationMessages = [...processedMessages];
    let data;
    let totalTokens = 0;
    
    for (let i = 0; i < 8; i++) {  // Increased tool loop to 8
      data = await callAnthropic(conversationMessages);
      
      // Track tokens
      totalTokens += (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
      
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

    // Save session state with token tracking
    await saveSessionState(env, session_id, {
      total_tokens: totalTokens,
      message_count: messages.length,
      last_activity: new Date().toISOString()
    });

    // Add token info to response
    const responseWithMeta = {
      ...data,
      _meta: {
        session_tokens: totalTokens,
        message_count: messages.length,
        context_managed: estimatedTokens > TOKEN_THRESHOLD
      }
    };

    return new Response(JSON.stringify(responseWithMeta), {
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

// === HELPER FUNCTIONS ===

async function loadSessionState(env, session_id) {
  try {
    const resp = await fetch(
      `${env.SUPABASE_URL}/rest/v1/chat_sessions?session_id=eq.${session_id}&select=*`,
      {
        headers: {
          'apikey': env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
        }
      }
    );
    if (!resp.ok) return null;
    const rows = await resp.json();
    return rows[0] || null;
  } catch {
    return null;
  }
}

async function saveSessionState(env, session_id, state) {
  try {
    await fetch(`${env.SUPABASE_URL}/rest/v1/chat_sessions`, {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        session_id,
        ...state,
        updated_at: new Date().toISOString()
      })
    });
  } catch {}
}

async function summarizeConversation(env, messages, sessionState) {
  // Keep last 20 messages, summarize the rest
  if (messages.length <= 20) return messages;
  
  const oldMessages = messages.slice(0, -20);
  const recentMessages = messages.slice(-20);
  
  // Create summary using Claude
  try {
    const summaryResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `Summarize this conversation in 2-3 sentences, focusing on key topics, decisions, and findings:\n\n${JSON.stringify(oldMessages)}`
        }]
      })
    });
    
    if (summaryResp.ok) {
      const summaryData = await summaryResp.json();
      const summary = summaryData.content?.[0]?.text || '';
      
      // Return context message + recent messages
      return [
        { role: 'user', content: `[Previous conversation summary: ${summary}]` },
        { role: 'assistant', content: 'I understand the context. Continuing our discussion.' },
        ...recentMessages
      ];
    }
  } catch {}
  
  // Fallback: just return recent messages
  return recentMessages;
}
