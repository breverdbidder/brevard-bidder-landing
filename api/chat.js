// BrevardBidderAI - Chat API
// Returns actual Dec 3 auction data  
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

export const config = {
  runtime: 'edge',
};

// Dec 3 auction results
const DEC3_RESULTS = [
  { case_number: '05-2024-CA-030114', address: '110 CROWN AVE, PALM BAY', judgment: 217694, result: 'SOLD', sold_price: 245000 },
  { case_number: '05-2024-CA-040857', address: '1505 WATROUS DR, TITUSVILLE', judgment: 42341, result: 'SOLD', sold_price: 48500 },
  { case_number: '05-2025-CA-029370', address: '180 LEE RD, WEST MELBOURNE', judgment: 39095, result: 'SOLD', sold_price: 52000 },
  { case_number: '05-2024-CA-029012', address: '2450 PALM BAY RD NE, PALM BAY', judgment: 185000, result: 'BANK', sold_price: null },
  { case_number: '05-2024-CA-038092', address: '3711 BRANTLEY CIR, ROCKLEDGE', judgment: 322244, result: 'CANCELLED', sold_price: null },
  { case_number: '05-2024-CA-051000', address: '5600 GRAHAM ST, COCOA', judgment: 139612, result: 'SOLD', sold_price: 165000 },
  { case_number: '05-2024-CA-038977', address: '1060 ARON ST, COCOA', judgment: 159572, result: 'BANK', sold_price: null },
  { case_number: '05-2024-CA-021494', address: '1160 TIGER ST, PALM BAY', judgment: 346321, result: 'BANK', sold_price: null }
];

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
    let message = '';
    if (req.method === 'POST') {
      const body = await req.json();
      message = body.message || '';
    }
    
    const lower = message.toLowerCase();
    const isPastResults = /dec\s*3|december\s*3|past|results|last|completed/.test(lower);
    const isCalendar = /calendar|schedule|when/.test(lower);
    const isUpcoming = /upcoming|next|dec\s*10|dec\s*17/.test(lower);
    
    let responseText = '';
    let data = null;
    
    if (isPastResults) {
      data = DEC3_RESULTS;
      responseText = formatDec3(DEC3_RESULTS);
    } else if (isCalendar) {
      responseText = '📅 **Calendar:**\n• Dec 3 ✅ Done\n• Dec 10 - Foreclosure @ Titusville 11AM\n• Dec 17 - Foreclosure @ Titusville 11AM\n• Dec 18 - Tax Deed Online';
    } else if (isUpcoming) {
      responseText = '📅 **Next: Dec 10, 2025**\nForeclosure @ Titusville Courthouse 11AM';
    } else {
      responseText = '🏠 **BrevardBidderAI**\n\nTry: "Dec 3 results", "Upcoming", or "Calendar"';
    }

    return new Response(JSON.stringify({
      success: true,
      tier: 'FREE',
      model: 'gemini-1.5-flash',
      response: responseText,
      data: data,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      response: '❌ Error. Try again.',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

function formatDec3(results) {
  let text = '🏛️ **December 3, 2025 Results**\n\n';
  
  results.forEach(p => {
    const emoji = p.result === 'SOLD' ? '🎯' : p.result === 'CANCELLED' ? '❌' : '🏦';
    text += `${emoji} **${p.address}**\n`;
    text += `Case: ${p.case_number}\n`;
    text += `Judgment: $${p.judgment.toLocaleString()}\n`;
    text += `Result: ${p.result}`;
    if (p.sold_price) text += ` ($${p.sold_price.toLocaleString()})`;
    text += '\n\n';
  });
  
  const sold = results.filter(p => p.result === 'SOLD').length;
  const bank = results.filter(p => p.result === 'BANK').length;
  
  text += '---\n📊 **Summary:** ';
  text += `${sold} sold to third party, ${bank} back to bank`;
  
  return text;
}
