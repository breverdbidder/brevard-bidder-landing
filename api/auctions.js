// BrevardBidderAI - Real Auction Data API
// Connected to Supabase: mocerqjnksmhcjzxrewo.supabase.co
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

export const config = {
  runtime: 'edge',
};

const SUPABASE_URL = 'https://mocerqjnksmhcjzxrewo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2VycWpua3NtaGNqenhyZXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1MzI1MjYsImV4cCI6MjA0ODEwODUyNn0.H9PVK06G5j_diedMHhPI-XOjRNgcMBq0r1BqZO5hZTc';

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
    // Get URL params
    const url = new URL(req.url);
    const auctionDate = url.searchParams.get('date');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    
    // Try auction_results first (latest scraped data)
    let query = `${SUPABASE_URL}/rest/v1/auction_results?select=*&order=auction_date.desc,judgment_amount.desc&limit=${limit}`;
    
    if (auctionDate) {
      query += `&auction_date=eq.${auctionDate}`;
    }

    let response = await fetch(query, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    let auctions = [];
    
    if (response.ok) {
      auctions = await response.json();
    }

    // If no auction_results, try historical_auctions
    if (auctions.length === 0) {
      const histQuery = `${SUPABASE_URL}/rest/v1/historical_auctions?select=*&order=auction_date.desc,judgment_amount.desc&limit=${limit}`;
      
      response = await fetch(histQuery, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        auctions = await response.json();
      }
    }

    // Transform data to consistent format
    const formattedAuctions = auctions.map(a => ({
      case_number: a.case_number || a.case_id,
      property_address: a.property_address || a.address || 'Address TBD',
      auction_date: a.auction_date,
      judgment_amount: parseFloat(a.judgment_amount) || 0,
      opening_bid: parseFloat(a.opening_bid) || parseFloat(a.judgment_amount) * 0.75 || 0,
      plaintiff: a.plaintiff || a.plaintiff_name || 'Unknown',
      defendant: a.defendant || a.defendant_name || 'Unknown',
      recommendation: calculateRecommendation(a),
      ml_probability: a.ml_probability || a.third_party_probability || null,
      bid_judgment_ratio: a.bid_judgment_ratio || null,
      photo_url: a.photo_url || a.bcpao_photo || null,
      property_type: a.property_type || 'SFR',
      market_value: parseFloat(a.market_value) || null,
      max_bid: a.max_bid || null,
      status: a.status || 'scheduled',
    }));

    // Calculate summary stats
    const stats = {
      total: formattedAuctions.length,
      bid: formattedAuctions.filter(a => a.recommendation === 'BID').length,
      review: formattedAuctions.filter(a => a.recommendation === 'REVIEW').length,
      skip: formattedAuctions.filter(a => a.recommendation === 'SKIP').length,
      totalJudgment: formattedAuctions.reduce((sum, a) => sum + (a.judgment_amount || 0), 0),
      avgJudgment: formattedAuctions.length > 0 
        ? formattedAuctions.reduce((sum, a) => sum + (a.judgment_amount || 0), 0) / formattedAuctions.length 
        : 0,
    };

    // Get unique auction dates
    const auctionDates = [...new Set(formattedAuctions.map(a => a.auction_date).filter(Boolean))].sort().reverse();

    return new Response(JSON.stringify({
      success: true,
      source: 'supabase',
      timestamp: new Date().toISOString(),
      stats,
      auctionDates,
      auctions: formattedAuctions,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Supabase error:', error);
    
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

function calculateRecommendation(auction) {
  // If already has recommendation, use it
  if (auction.recommendation) return auction.recommendation;
  
  // Calculate based on bid/judgment ratio
  const ratio = auction.bid_judgment_ratio || 
    (auction.opening_bid && auction.judgment_amount 
      ? (auction.opening_bid / auction.judgment_amount) * 100 
      : null);
  
  if (ratio === null) return 'REVIEW';
  
  // BrevardBidderAI formula:
  // BID: ratio >= 75%
  // REVIEW: ratio 60-74%
  // SKIP: ratio < 60%
  if (ratio >= 75) return 'BID';
  if (ratio >= 60) return 'REVIEW';
  return 'SKIP';
}
