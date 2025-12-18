// BidDeed.AI - Auction Data API for AnimatedDemo
// Returns real auction data from Supabase for the demo component
// Path: /api/auction-data

export async function onRequest(context) {
  const { env } = context;
  
  // Get Supabase credentials from environment
  const SUPABASE_URL = env.SUPABASE_URL || 'https://mocerqjnksmhcjzxrewo.supabase.co';
  const SUPABASE_KEY = env.SUPABASE_SERVICE_KEY || env.SUPABASE_KEY || '';
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
  
  // Handle preflight
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // If no Supabase key, return fallback data
  if (!SUPABASE_KEY) {
    return new Response(JSON.stringify({
      source: 'fallback',
      message: 'Supabase key not configured',
      data: getFallbackData(),
    }), { headers: { ...corsHeaders, 'X-Data-Source': 'fallback' } });
  }
  
  try {
    // Fetch auction results
    const auctionResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/auction_results?order=created_at.desc&limit=20`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    
    // Fetch historical stats
    const statsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/historical_auctions?select=count`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'count=exact',
        },
      }
    );
    
    const auctionResults = await auctionResponse.json();
    const totalCount = statsResponse.headers.get('content-range')?.split('/')[1] || '1393';
    
    // Transform data for demo
    if (Array.isArray(auctionResults) && auctionResults.length > 0) {
      const latest = auctionResults[0];
      
      const responseData = {
        source: 'supabase',
        auction: {
          date: latest.auction_date || '2025-12-18',
          type: latest.auction_type || 'TAX_DEED',
          location: 'Brevard County, FL',
          totalProperties: auctionResults.length,
          bidRecommended: auctionResults.filter(r => r.recommendation === 'BID').length,
          reviewRecommended: auctionResults.filter(r => r.recommendation === 'REVIEW').length,
          skipRecommended: auctionResults.filter(r => r.recommendation === 'SKIP').length,
        },
        sampleProperty: {
          caseNumber: latest.case_number || latest.caseNumber || '250179',
          parcelId: latest.parcel_id || latest.parcelId || '3021477',
          address: latest.property_address || latest.address || '202 Ivory Coral Ln #304, Merritt Island, FL 32953',
          propertyType: latest.property_type || 'CONDO',
          sqft: latest.building_sqft || latest.sqft || 1248,
          yearBuilt: latest.year_built || latest.yearBuilt || 2006,
          ownerName: latest.owner_name || 'OWNER',
          marketValue: latest.market_value || latest.arv || 185000,
          openingBid: latest.opening_bid || latest.openingBid || 12847.23,
          finalJudgment: latest.final_judgment || latest.finalJudgment || 15420.88,
          bidJudgmentRatio: latest.bid_judgment_ratio || latest.bidJudgmentRatio || 83.3,
          recommendation: latest.recommendation || 'BID',
          mlProbability: latest.ml_probability || latest.mlProbability || 0.42,
          maxBid: latest.max_bid || latest.maxBid || 98500,
          liens: latest.liens || [
            { type: 'HOA', amount: 8420.50, survives: false },
            { type: 'Tax Certificate', amount: 4426.73, survives: false },
          ],
          winProbabilityMatrix: latest.win_probability_matrix || {
            '10%': 46250, '20%': 55500, '40%': 74000,
            '60%': 92500, '80%': 111000, '95%': 129500,
          },
        },
        stats: {
          totalProcessed: parseInt(totalCount) || 1393,
          mlAccuracy: 64.4,
          avgProcessingTime: 23,
          costSavings: 90,
        },
      };
      
      return new Response(JSON.stringify(responseData), {
        headers: { ...corsHeaders, 'X-Data-Source': 'supabase-live' },
      });
    } else {
      // No data in Supabase, use fallback
      return new Response(JSON.stringify({
        source: 'fallback',
        message: 'No auction results found',
        ...getFallbackData(),
      }), { headers: { ...corsHeaders, 'X-Data-Source': 'fallback' } });
    }
  } catch (error) {
    console.error('Supabase error:', error);
    return new Response(JSON.stringify({
      source: 'fallback',
      error: error.message,
      ...getFallbackData(),
    }), { headers: { ...corsHeaders, 'X-Data-Source': 'error-fallback' } });
  }
}

function getFallbackData() {
  return {
    auction: {
      date: '2025-12-18',
      type: 'TAX_DEED',
      location: 'Brevard County, FL',
      totalProperties: 20,
      bidRecommended: 15,
      reviewRecommended: 3,
      skipRecommended: 2,
    },
    sampleProperty: {
      caseNumber: '250179',
      parcelId: '3021477',
      address: '202 Ivory Coral Ln #304, Merritt Island, FL 32953',
      propertyType: 'CONDO',
      sqft: 1248,
      yearBuilt: 2006,
      ownerName: 'CAPE CROSSING CONDO ASSN INC',
      marketValue: 185000,
      openingBid: 12847.23,
      finalJudgment: 15420.88,
      bidJudgmentRatio: 83.3,
      recommendation: 'BID',
      mlProbability: 0.42,
      maxBid: 98500,
      liens: [
        { type: 'HOA', amount: 8420.50, survives: false },
        { type: 'Tax Certificate', amount: 4426.73, survives: false },
      ],
      winProbabilityMatrix: {
        '10%': 46250, '20%': 55500, '40%': 74000,
        '60%': 92500, '80%': 111000, '95%': 129500,
      },
    },
    stats: {
      totalProcessed: 1393,
      mlAccuracy: 64.4,
      avgProcessingTime: 23,
      costSavings: 90,
    },
  };
}
