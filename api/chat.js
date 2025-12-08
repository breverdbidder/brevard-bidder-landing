// Deployed: 2025-12-08T17:15:32Z
// BrevardBidderAI - Smart Router Chat API
// ACTUALLY fetches and returns auction data
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

export const config = {
  runtime: 'edge',
};

const SUPABASE_URL = 'https://mocerqjnksmhcjzxrewo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2VycWpua3NtaGNqenhyZXdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDUzMjUyNiwiZXhwIjoyMDgwMTA4NTI2fQ.fL255mO0V8-rrU0Il3L41cIdQXUau-HRQXiamTqp9nE';

const GEMINI_API_KEY = 'AIzaSyCbLGRTT8cXE26X7q8x3pLYI3FcMQDXQg8';

export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    const intent = analyzeIntent(message);
    
    // ACTUALLY FETCH DATA based on intent
    let data = null;
    let responseText = '';
    
    if (intent.isPastResults) {
      // Get Dec 3 auction results
      data = await fetchAuctionResults('2025-12-03');
      responseText = formatPastResults(data);
    } else if (intent.isUpcoming) {
      // Get upcoming auctions
      data = await fetchUpcomingAuctions();
      responseText = formatUpcomingAuctions(data);
    } else if (intent.isCalendar) {
      responseText = formatCalendar();
    } else if (intent.isTaxDeed) {
      responseText = '📋 **Tax Deed Auctions**

Next tax deed auction: December 18, 2025
Location: Online at brevard.realforeclose.com

Tax deeds are separate from foreclosures. Use BidDeedAI for tax deed analysis.';
    } else {
      // Default - show quick stats
      data = await fetchQuickStats();
      responseText = formatQuickStats(data);
    }

    // Select tier for logging
    const tier = selectTier(message);

    return new Response(JSON.stringify({
      success: true,
      tier,
      model: tier === 'FREE' ? 'gemini-1.5-flash' : 'deepseek-v3',
      response: responseText,
      data: data,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      response: '❌ Error loading data. Please try again.',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

function analyzeIntent(message) {
  const lower = message.toLowerCase();
  return {
    isPastResults: /dec\s*3|december\s*3|past|results|last\s*auction|completed/.test(lower),
    isUpcoming: /upcoming|next|dec\s*10|dec\s*17|preview|scheduled/.test(lower),
    isCalendar: /calendar|schedule|when|dates/.test(lower),
    isTaxDeed: /tax\s*deed|tax\s*sale/.test(lower),
  };
}

async function fetchAuctionResults(date) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/historical_auctions?auction_date=eq.${date}&select=*&order=final_judgment.desc`,
    {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    }
  );
  
  if (!response.ok) {
    // Try auction_results table
    const altResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/auction_results?auction_date=eq.${date}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    if (altResponse.ok) return altResponse.json();
  }
  
  return response.json();
}

async function fetchUpcomingAuctions() {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/historical_auctions?auction_date=gt.2025-12-08&select=*&order=auction_date.asc,final_judgment.desc&limit=20`,
    {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    }
  );
  return response.json();
}

async function fetchQuickStats() {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/historical_auctions?select=*&order=auction_date.desc&limit=100`,
    {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    }
  );
  return response.json();
}

function formatPastResults(auctions) {
  if (!auctions || auctions.length === 0) {
    return '📭 No auction results found for December 3, 2025.';
  }

  let text = `🏛️ **December 3, 2025 Auction Results**

`;
  text += `Found **${auctions.length}** completed auctions:

`;

  auctions.forEach((a, i) => {
    const judgment = parseFloat(a.final_judgment) || 0;
    const status = a.status || 'Unknown';
    const winner = a.winning_bidder || 'Plaintiff';
    const winBid = parseFloat(a.winning_bid) || judgment;
    
    // Determine outcome emoji
    let emoji = '🏦'; // Plaintiff
    if (status === 'THIRD_PARTY' || a.num_bidders > 0) emoji = '🎯'; // Third party
    if (status === 'CANCELLED') emoji = '❌';
    
    text += `${emoji} **${a.address || 'Address TBD'}**
`;
    text += `   Case: ${a.case_number}
`;
    text += `   Judgment: $${judgment.toLocaleString()}
`;
    text += `   Result: ${status} ${a.num_bidders ? `(${a.num_bidders} bidders)` : ''}
`;
    if (winBid && winBid !== judgment) {
      text += `   Sold for: $${winBid.toLocaleString()}
`;
    }
    text += '
';
  });

  // Summary
  const thirdParty = auctions.filter(a => a.status === 'THIRD_PARTY' || a.num_bidders > 0).length;
  const plaintiff = auctions.filter(a => a.status !== 'THIRD_PARTY' && a.status !== 'CANCELLED' && !a.num_bidders).length;
  const cancelled = auctions.filter(a => a.status === 'CANCELLED').length;

  text += `---
`;
  text += `📊 **Summary:**
`;
  text += `• Third Party Sales: ${thirdParty}
`;
  text += `• Back to Plaintiff: ${plaintiff}
`;
  text += `• Cancelled: ${cancelled}
`;

  return text;
}

function formatUpcomingAuctions(auctions) {
  if (!auctions || auctions.length === 0) {
    return '📭 No upcoming auctions found.';
  }

  let text = `📅 **Upcoming Foreclosure Auctions**

`;

  // Group by date
  const byDate = {};
  auctions.forEach(a => {
    const date = a.auction_date || 'TBD';
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(a);
  });

  Object.keys(byDate).sort().forEach(date => {
    const props = byDate[date];
    text += `**${date}** (${props.length} properties)
`;
    props.slice(0, 5).forEach(a => {
      const judgment = parseFloat(a.final_judgment) || 0;
      text += `• ${a.address || 'TBD'} - $${judgment.toLocaleString()}
`;
    });
    if (props.length > 5) {
      text += `  ...and ${props.length - 5} more
`;
    }
    text += '
';
  });

  return text;
}

function formatCalendar() {
  return `📅 **Brevard County Auction Calendar**

**December 2025:**
• Dec 3 ✅ COMPLETED - 8 properties
• Dec 10 - Foreclosure Auction @ Titusville 11AM
• Dec 17 - Foreclosure Auction @ Titusville 11AM
• Dec 18 - Tax Deed Auction @ brevard.realforeclose.com

**January 2026:**
• Jan 7 - Foreclosure Auction @ Titusville 11AM
• Jan 21 - Foreclosure Auction @ Titusville 11AM

All foreclosure auctions are IN-PERSON at Brevard County Courthouse in Titusville.
Tax deed auctions are ONLINE only.`;
}

function formatQuickStats(auctions) {
  const total = auctions?.length || 0;
  const totalJudgment = auctions?.reduce((sum, a) => sum + (parseFloat(a.final_judgment) || 0), 0) || 0;

  return `🏠 **BrevardBidderAI Quick Stats**

• Properties tracked: ${total}
• Total judgment value: $${totalJudgment.toLocaleString()}
• Next auction: Dec 10, 2025

**Quick Commands:**
• "Dec 3 results" - Past auction results
• "Upcoming" - Preview next auctions
• "Calendar" - Full schedule
• "Tax deed" - Tax deed info`;
}

function selectTier(message) {
  const lower = message.toLowerCase();
  if (/results|calendar|show|list/.test(lower)) return 'FREE';
  if (/analyze|compare/.test(lower)) return 'BUDGET';
  if (/strategy|recommend/.test(lower)) return 'PRODUCTION';
  return 'FREE';
}
