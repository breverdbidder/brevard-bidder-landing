// BrevardBidderAI - Auction Data API with Fallback
export const config = { runtime: 'edge' };

const SUPABASE_URL = 'https://mocerqjnksmhcjzxrewo.supabase.co';

// Real Dec 3, 2025 auction results (fallback data)
const DEC3_FALLBACK = [
  { id: 1, case_number: "05-2024-CA-030114", address: "110 CROWN AVE", city: "PALM BAY", zip: "32907", lat: 28.0345, lng: -80.5887, sqft: 2834, year_built: 2021, beds: 5, baths: 3, market_value: 388760, judgment: 217694, max_bid: 217694, ml_score: 84, recommendation: "BID", roi: 88.86, photo_url: "https://www.bcpao.us/photos/28/2840720011.jpg", plaintiff: "NATIONSTAR", result: "SOLD", sold_price: 245000, auction_date: "2025-12-03" },
  { id: 2, case_number: "05-2024-CA-040857", address: "1505 WATROUS DR", city: "TITUSVILLE", zip: "32780", lat: 28.6122, lng: -80.8076, sqft: 1164, year_built: 1966, beds: 2, baths: 2, market_value: 171870, judgment: 42341, max_bid: 42341, ml_score: 92, recommendation: "BID", roi: 267.34, photo_url: "https://www.bcpao.us/photos/22/2208343011.jpg", plaintiff: "WRIGHT CAPITAL", result: "SOLD", sold_price: 48500, auction_date: "2025-12-03" },
  { id: 3, case_number: "05-2025-CA-029370", address: "180 LEE RD", city: "WEST MELBOURNE", zip: "32904", lat: 28.0756, lng: -80.6531, sqft: 1226, year_built: 1959, beds: 3, baths: 2, market_value: 163650, judgment: 39095, max_bid: 39095, ml_score: 89, recommendation: "BID", roi: 293.66, photo_url: "https://www.bcpao.us/photos/28/2819983011.jpg", plaintiff: "B-MUSED", result: "SOLD", sold_price: 52000, auction_date: "2025-12-03" },
  { id: 4, case_number: "05-2024-CA-029012", address: "2450 PALM BAY RD NE", city: "PALM BAY", zip: "32905", lat: 28.0442, lng: -80.5912, sqft: 1500, year_built: 2018, beds: 3, baths: 2, market_value: 274440, judgment: 185000, max_bid: 143386, ml_score: 73, recommendation: "BID", roi: 82.78, photo_url: "https://www.bcpao.us/photos/28/2815672011.jpg", plaintiff: "FREEDOM MORTGAGE", result: "BANK", auction_date: "2025-12-03" },
  { id: 5, case_number: "05-2024-CA-038092", address: "3711 BRANTLEY CIR", city: "ROCKLEDGE", zip: "32955", lat: 28.3514, lng: -80.7273, sqft: 2089, year_built: 2014, beds: 4, baths: 2.5, market_value: 381510, judgment: 322244, max_bid: 193906, ml_score: 60, recommendation: "REVIEW", roi: 45.2, photo_url: "https://www.bcpao.us/photos/25/2537264011.jpg", plaintiff: "COMMUNITY", result: "CANCELLED", auction_date: "2025-12-03" },
  { id: 6, case_number: "05-2024-CA-051000", address: "5600 GRAHAM ST", city: "COCOA", zip: "32927", lat: 28.4189, lng: -80.8012, sqft: 1379, year_built: 1986, beds: 3, baths: 2, market_value: 279230, judgment: 139612, max_bid: 104615, ml_score: 71, recommendation: "REVIEW", roi: 96.47, photo_url: "https://www.bcpao.us/photos/23/2304701011.jpg", plaintiff: "HALLMARK", result: "SOLD", sold_price: 165000, auction_date: "2025-12-03" },
  { id: 7, case_number: "05-2024-CA-038977", address: "1060 ARON ST", city: "COCOA", zip: "32927", lat: 28.3867, lng: -80.7523, sqft: 1008, year_built: 1983, beds: 2, baths: 1.5, market_value: 198820, judgment: 159572, max_bid: 54469, ml_score: 34, recommendation: "SKIP", roi: 12.5, photo_url: "https://www.bcpao.us/photos/23/2310706011.jpg", plaintiff: "LAKEVIEW", result: "BANK", auction_date: "2025-12-03" },
  { id: 8, case_number: "05-2024-CA-021494", address: "1160 TIGER ST", city: "PALM BAY", zip: "32909", lat: 27.9876, lng: -80.6234, sqft: 1698, year_built: 2009, beds: 3, baths: 2, market_value: 253150, judgment: 346321, max_bid: 116890, ml_score: 28, recommendation: "SKIP", roi: -15.2, photo_url: "https://www.bcpao.us/photos/29/2935858011.jpg", plaintiff: "US BANK", result: "BANK", auction_date: "2025-12-03" }
];

export default async function handler(req) {
  const url = new URL(req.url);
  const date = url.searchParams.get('date');
  const status = url.searchParams.get('status');
  
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
  
  // Try Supabase first
  if (SUPABASE_KEY) {
    try {
      let query = SUPABASE_URL + '/rest/v1/auction_results?select=*';
      if (date) query += '&auction_date=eq.' + date;
      query += '&order=auction_date.desc&limit=50';
      
      const response = await fetch(query, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          return new Response(JSON.stringify({ success: true, source: 'supabase', count: data.length, data }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
      }
    } catch (e) { console.log('Supabase error, using fallback'); }
  }
  
  // Fallback to embedded real data
  let filteredData = DEC3_FALLBACK;
  if (date && date !== '2025-12-03') {
    filteredData = []; // Only have Dec 3 data in fallback
  }
  
  return new Response(JSON.stringify({
    success: true,
    source: 'fallback',
    message: 'Real Dec 3, 2025 auction data',
    count: filteredData.length,
    data: filteredData
  }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
