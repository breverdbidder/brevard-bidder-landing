// BidDeed.AI - Auction Results API
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

export const config = {
  runtime: 'edge',
};

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

  const url = new URL(req.url);
  const date = url.searchParams.get('date') || '2025-12-03';

  let results = [];
  let text = '';

  if (date === '2025-12-03') {
    results = DEC3_RESULTS;
    text = formatResults(results);
  }

  return new Response(JSON.stringify({
    success: true,
    date: date,
    count: results.length,
    formatted: text,
    data: results,
    timestamp: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function formatResults(results) {
  let text = '🏛️ **December 3, 2025 Auction Results**\n\n';
  
  results.forEach(p => {
    const emoji = p.result === 'SOLD' ? '🎯' : p.result === 'CANCELLED' ? '❌' : '🏦';
    text += `${emoji} **${p.address}**\n`;
    text += `   Case: ${p.case_number}\n`;
    text += `   Judgment: $${p.judgment.toLocaleString()}\n`;
    text += `   Result: ${p.result}`;
    if (p.sold_price) text += ` - Sold for $${p.sold_price.toLocaleString()}`;
    text += '\n\n';
  });
  
  const sold = results.filter(p => p.result === 'SOLD').length;
  const bank = results.filter(p => p.result === 'BANK').length;
  const cancelled = results.filter(p => p.result === 'CANCELLED').length;
  
  text += '---\n';
  text += `📊 **Summary:** ${sold} third party, ${bank} bank, ${cancelled} cancelled`;
  
  return text;
}
