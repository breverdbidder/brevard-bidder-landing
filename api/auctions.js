// BrevardBidderAI - Real Auction Data API
// Connected to Supabase: mocerqjnksmhcjzxrewo.supabase.co
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

export const config = {
  runtime: 'edge',
};

const SUPABASE_URL = 'https://mocerqjnksmhcjzxrewo.supabase.co';
// Service role key for full access
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2VycWpua3NtaGNqenhyZXdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDUzMjUyNiwiZXhwIjoyMDgwMTA4NTI2fQ.fL255mO0V8-rrU0Il3L41cIdQXUau-HRQXiamTqp9nE';

export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const auctionDate = url.searchParams.get('date');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    
    // Query historical_auctions with CORRECT column names
    let query = `${SUPABASE_URL}/rest/v1/historical_auctions?select=*&order=auction_date.desc,final_judgment.desc&limit=${limit}`;
    
    if (auctionDate) {
      query += `&auction_date=eq.${auctionDate}`;
    }

    const response = await fetch(query, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status}`);
    }

    const rawAuctions = await response.json();

    // Transform to consistent frontend format
    const auctions = rawAuctions.map(a => {
      const judgment = parseFloat(a.final_judgment) || 0;
      const opening = parseFloat(a.opening_bid) || judgment * 0.75;
      const ratio = judgment > 0 ? (opening / judgment) * 100 : 0;
      
      return {
        case_number: a.case_number,
        property_address: a.address || 'Address TBD',
        auction_date: a.auction_date,
        judgment_amount: judgment,
        opening_bid: opening,
        plaintiff: a.plaintiff || 'Unknown',
        defendant: a.defendant || 'Unknown',
        recommendation: calculateRecommendation(ratio, a.status),
        bid_judgment_ratio: Math.round(ratio),
        ml_probability: a.ml_probability || null,
        photo_url: a.photo_url || null,
        property_type: 'SFR',
        market_value: parseFloat(a.market_value) || null,
        status: a.status || 'scheduled',
        county: a.county || 'Brevard',
        num_bidders: a.num_bidders || 0,
        winning_bid: parseFloat(a.winning_bid) || null,
      };
    });

    // Calculate summary stats
    const stats = {
      total: auctions.length,
      bid: auctions.filter(a => a.recommendation === 'BID').length,
      review: auctions.filter(a => a.recommendation === 'REVIEW').length,
      skip: auctions.filter(a => a.recommendation === 'SKIP').length,
      totalJudgment: auctions.reduce((sum, a) => sum + a.judgment_amount, 0),
      avgJudgment: auctions.length > 0 
        ? Math.round(auctions.reduce((sum, a) => sum + a.judgment_amount, 0) / auctions.length)
        : 0,
    };

    // Get unique auction dates
    const auctionDates = [...new Set(auctions.map(a => a.auction_date).filter(Boolean))].sort().reverse();

    return new Response(JSON.stringify({
      success: true,
      source: 'supabase_live',
      timestamp: new Date().toISOString(),
      stats,
      auctionDates,
      auctions,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('API error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      source: 'error',
      auctions: [],
      stats: { total: 0, bid: 0, review: 0, skip: 0 },
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

function calculateRecommendation(ratio, status) {
  // Already sold = show actual result
  if (status === 'SOLD' || status === 'THIRD_PARTY') return 'BID';
  if (status === 'CANCELLED') return 'SKIP';
  
  // BrevardBidderAI formula for scheduled auctions
  if (ratio >= 75) return 'BID';
  if (ratio >= 60) return 'REVIEW';
  return 'SKIP';
}
