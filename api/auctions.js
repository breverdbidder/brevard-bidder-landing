// BrevardBidderAI - Auction Data API V2
// Connects to Supabase for REAL auction data
// Supports: foreclosure + tax deed, past + upcoming
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

export const config = { runtime: 'edge' };

const SUPABASE_URL = 'https://mocerqjnksmhcjzxrewo.supabase.co';

export default async function handler(req) {
  const url = new URL(req.url);
  const date = url.searchParams.get('date');
  const type = url.searchParams.get('type') || 'all'; // foreclosure, taxdeed, all
  const status = url.searchParams.get('status') || 'all'; // past, upcoming, all
  const limit = url.searchParams.get('limit') || '50';
  
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;
  
  if (!SUPABASE_KEY) {
    // Return mock data if no key (for development)
    return new Response(JSON.stringify({
      success: true,
      source: 'fallback',
      message: 'Using fallback data - Supabase key not configured',
      data: []
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  };

  const today = new Date().toISOString().split('T')[0];
  
  try {
    // Build query for auction_results table
    let query = `${SUPABASE_URL}/rest/v1/auction_results?select=*`;
    
    // Filter by specific date
    if (date) {
      query += `&auction_date=eq.${date}`;
    }
    
    // Filter by auction type
    if (type === 'foreclosure') {
      query += `&auction_type=eq.foreclosure`;
    } else if (type === 'taxdeed') {
      query += `&auction_type=eq.taxdeed`;
    }
    
    // Filter by past/upcoming
    if (status === 'past') {
      query += `&auction_date=lt.${today}`;
    } else if (status === 'upcoming') {
      query += `&auction_date=gte.${today}`;
    }
    
    query += `&order=auction_date.desc,ml_score.desc&limit=${limit}`;

    const response = await fetch(query, { headers });
    
    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Calculate summary stats
    const summary = {
      total: data.length,
      bid: data.filter(p => p.recommendation === 'BID').length,
      review: data.filter(p => p.recommendation === 'REVIEW').length,
      skip: data.filter(p => p.recommendation === 'SKIP').length,
      totalJudgment: data.reduce((sum, p) => sum + (parseFloat(p.final_judgment) || 0), 0)
    };

    return new Response(JSON.stringify({
      success: true,
      source: 'supabase',
      query: { date, type, status },
      summary,
      data
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      query: { date, type, status }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
