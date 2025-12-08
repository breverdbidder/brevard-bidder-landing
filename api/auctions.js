// BrevardBidderAI - Auction Data API
// Fetches real data from Supabase
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

export const config = { runtime: 'edge' };

const SUPABASE_URL = 'https://mocerqjnksmhcjzxrewo.supabase.co';

export default async function handler(req) {
  const url = new URL(req.url);
  const date = url.searchParams.get('date');
  const type = url.searchParams.get('type') || 'foreclosure';
  const status = url.searchParams.get('status'); // past, upcoming, all
  
  // Get API key from environment
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
  
  if (!SUPABASE_KEY) {
    return new Response(JSON.stringify({ error: 'Missing Supabase key' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Build query based on parameters
    let query = `${SUPABASE_URL}/rest/v1/auction_results?select=*`;
    
    if (date) {
      query += `&auction_date=eq.${date}`;
    }
    
    if (status === 'past') {
      const today = new Date().toISOString().split('T')[0];
      query += `&auction_date=lt.${today}`;
    } else if (status === 'upcoming') {
      const today = new Date().toISOString().split('T')[0];
      query += `&auction_date=gte.${today}`;
    }
    
    query += '&order=auction_date.desc&limit=50';

    const response = await fetch(query, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    const data = await response.json();
    
    return new Response(JSON.stringify({
      success: true,
      count: data.length,
      type,
      data
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
