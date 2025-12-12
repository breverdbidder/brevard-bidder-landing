// BidDeed.AI - Live NLP Chat API
// Real Anthropic Claude integration + Supabase data
// Author: Ariel Shapira, Solo Founder, Everest Capital USA
// Dec 10, 2025 Live Demo

export const config = {
  runtime: 'edge',
};

const SUPABASE_URL = 'https://mocerqjnksmhcjzxrewo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2VycWpua3NtaGNqenhyZXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MzI1MjYsImV4cCI6MjA4MDEwODUyNn0.ySFJIOngWWB0aqYra4PoGFuqcbdHOx1ZV6T9-klKQDw';

// Fetch auction data from Supabase
async function getAuctionData(date = null) {
  let url = `${SUPABASE_URL}/rest/v1/historical_auctions?select=*&order=auction_date.desc&limit=50`;
  if (date) {
    url = `${SUPABASE_URL}/rest/v1/historical_auctions?auction_date=eq.${date}&select=*`;
  }
  
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  });
  return res.json();
}

// Get upcoming auctions
async function getUpcomingAuctions() {
  const today = new Date().toISOString().split('T')[0];
  const url = `${SUPABASE_URL}/rest/v1/historical_auctions?auction_date=gte.${today}&select=auction_date,case_number,address,city,final_judgment,market_value,status&order=auction_date.asc&limit=30`;
  
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  });
  return res.json();
}

// Build context for Claude
function buildContext(auctionData, upcomingAuctions) {
  const enriched = auctionData.filter(a => a.address);
  const dec10 = auctionData.filter(a => a.auction_date === '2025-12-10');
  
  return `You are BidDeed.AI, an Agentic AI Copilot for Brevard County foreclosure auctions.

CURRENT DATE: ${new Date().toLocaleDateString()}
NEXT AUCTION: December 10, 2025 @ Titusville Courthouse 11AM (IN-PERSON)

AUCTION DATA AVAILABLE:
- Dec 10, 2025: ${dec10.length} properties scheduled
- Total enriched properties: ${enriched.length}

SAMPLE PROPERTIES WITH DATA:
${enriched.slice(0, 5).map(p => `- ${p.address}, ${p.city}: Market Value $${(p.market_value || 0).toLocaleString()}, Status: ${p.status}`).join('\n')}

UPCOMING AUCTIONS:
${upcomingAuctions.slice(0, 5).map(a => `- ${a.auction_date}: ${a.case_number}`).join('\n')}

CAPABILITIES:
- Analyze foreclosure properties
- Calculate max bid: (ARV×70%)-Repairs-$10K-MIN($25K,15%ARV)
- Check lien priority (senior mortgages survive HOA foreclosures)
- Generate BID/REVIEW/SKIP recommendations based on 64.4% accuracy ML model
- Answer Florida foreclosure law questions

AUCTION CALENDAR:
- Dec 10, 2025: Foreclosure @ Titusville 11AM IN-PERSON
- Dec 17, 2025: Foreclosure @ Titusville 11AM IN-PERSON
- Dec 18, 2025: Tax Deed @ brevard.realforeclose.com ONLINE

Be helpful, concise, and data-driven. Use the auction data to provide specific answers.`;
}

export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let message = '';
    let conversationHistory = [];
    
    if (req.method === 'POST') {
      const body = await req.json();
      message = body.message || '';
      conversationHistory = body.history || [];
    }

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'No message provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch real auction data
    const [auctionData, upcomingAuctions] = await Promise.all([
      getAuctionData(),
      getUpcomingAuctions(),
    ]);

    // Check for Anthropic API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      // Fallback to smart rule-based responses if no API key
      const response = generateFallbackResponse(message, auctionData, upcomingAuctions);
      return new Response(
        JSON.stringify({ response, source: 'fallback', data: { auctionCount: auctionData.length } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build messages for Claude
    const systemPrompt = buildContext(auctionData, upcomingAuctions);
    
    const messages = [
      ...conversationHistory.map(m => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    // Call Anthropic API
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages,
      }),
    });

    if (!anthropicRes.ok) {
      const error = await anthropicRes.text();
      console.error('Anthropic API error:', error);
      // Fallback on API error
      const response = generateFallbackResponse(message, auctionData, upcomingAuctions);
      return new Response(
        JSON.stringify({ response, source: 'fallback', error: 'API temporarily unavailable' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await anthropicRes.json();
    const responseText = result.content[0]?.text || 'I apologize, I could not generate a response.';

    return new Response(
      JSON.stringify({
        response: responseText,
        source: 'claude',
        model: 'claude-3-haiku-20240307',
        data: {
          auctionCount: auctionData.length,
          nextAuction: 'Dec 10, 2025',
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Fallback response generator when API unavailable
function generateFallbackResponse(message, auctionData, upcomingAuctions) {
  const lower = message.toLowerCase();
  const dec10 = auctionData.filter(a => a.auction_date === '2025-12-10');
  const enriched = auctionData.filter(a => a.address);
  
  // Calendar/schedule queries
  if (/calendar|schedule|when|next|upcoming/.test(lower)) {
    return `📅 **Upcoming Auctions:**

• **Dec 10, 2025** - Foreclosure @ Titusville Courthouse 11AM (${dec10.length} properties)
• **Dec 17, 2025** - Foreclosure @ Titusville Courthouse 11AM
• **Dec 18, 2025** - Tax Deed @ brevard.realforeclose.com (ONLINE)

The Dec 10 auction is IN-PERSON at the Brevard County Courthouse in Titusville. Arrive by 10:30 AM.`;
  }

  // Dec 10 specific
  if (/dec\s*10|december\s*10/.test(lower)) {
    return `📊 **Dec 10, 2025 Auction:**

• **${dec10.length} properties** scheduled
• Location: Titusville Courthouse, 11AM IN-PERSON
• Status: Analysis in progress

Properties are being enriched with BCPAO market values and lien analysis. Full recommendations will be available by auction day.`;
  }

  // Property queries
  if (/properties|list|show/.test(lower)) {
    const sample = enriched.slice(0, 5);
    let response = `📋 **Sample Properties:**\n\n`;
    sample.forEach((p, i) => {
      response += `${i + 1}. **${p.address}, ${p.city}**\n   Market: $${(p.market_value || 0).toLocaleString()} | Status: ${p.status}\n\n`;
    });
    response += `\n_Showing ${sample.length} of ${enriched.length} enriched properties_`;
    return response;
  }

  // Max bid formula
  if (/max bid|formula|calculate/.test(lower)) {
    return `📐 **Max Bid Formula:**

\`\`\`
Max Bid = (ARV × 70%) - Repairs - $10K - MIN($25K, 15% × ARV)
\`\`\`

**Components:**
• ARV: After Repair Value (from BCPAO + comps)
• 70%: Safety margin for profit
• $10K: Fixed costs (closing, holding)
• 15% ARV cap: Maximum wholesale profit

**Bid/Judgment Ratio:**
• ≥75% → **BID** recommendation
• 60-74% → **REVIEW** recommendation
• <60% → **SKIP** recommendation`;
  }

  // Liens
  if (/lien|survive|priority|hoa/.test(lower)) {
    return `⚖️ **Lien Priority in Florida Foreclosures:**

**Key Rule:** Senior liens survive junior foreclosures.

• **Mortgage foreclosure:** Wipes HOA liens (usually)
• **HOA foreclosure:** Senior mortgage SURVIVES - you inherit it!
• **Tax deed:** Wipes everything except government liens

**BidDeed.AI checks:**
1. Plaintiff type (bank vs HOA vs condo)
2. Recording dates of all liens
3. Super-lien status for HOAs

⚠️ Always verify lien position before bidding.`;
  }

  // Default
  return `👋 I'm BidDeed.AI, your foreclosure auction copilot.

**Next Auction:** Dec 10, 2025 @ Titusville 11AM (${dec10.length} properties)

I can help you:
• Analyze auction properties
• Calculate max bids
• Check lien priority
• View the auction calendar

What would you like to know?`;
}
