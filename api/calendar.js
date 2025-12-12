// BidDeed.AI - Auction Calendar API
// Returns upcoming and past auction dates
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

export const config = { runtime: 'edge' };

const SUPABASE_URL = 'https://mocerqjnksmhcjzxrewo.supabase.co';

export default async function handler(req) {
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // Get auction dates from database
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/auction_results?select=auction_date,auction_type,count&order=auction_date.asc`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );
    
    const data = await response.json();
    
    // Group by date
    const calendar = {
      foreclosure: {
        past: [],
        upcoming: []
      },
      taxDeed: {
        past: [],
        upcoming: []
      }
    };
    
    // Known Brevard County schedule
    const knownDates = {
      foreclosure: [
        { date: '2025-12-03', status: 'completed', venue: 'Titusville Courthouse', time: '11:00 AM' },
        { date: '2025-12-10', status: 'upcoming', venue: 'Titusville Courthouse', time: '11:00 AM' },
        { date: '2025-12-17', status: 'upcoming', venue: 'Titusville Courthouse', time: '11:00 AM' }
      ],
      taxDeed: [
        { date: '2025-12-18', status: 'upcoming', venue: 'brevard.realforeclose.com', time: 'Online' }
      ]
    };

    return new Response(JSON.stringify({
      today,
      calendar: knownDates,
      fromDatabase: data
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
