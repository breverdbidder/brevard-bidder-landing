// BrevardBidderAI - Auctions API (Next.js Pages Router)
// Dec 10, 2025 Auction Data
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

const DEC10_DATA = [
  { id: 1, case_number: "05-2024-CA-032156", address: "2847 WESTCHESTER DR N", city: "MELBOURNE", zip: "32904", judgment: 198500, max_bid: 172500, ml_score: 68, recommendation: "BID", photo_url: "https://www.bcpao.us/photos/28/2820145011.jpg", plaintiff: "WELLS FARGO", auction_date: "2025-12-10" },
  { id: 2, case_number: "05-2024-CA-045678", address: "1234 SATURN BLVD", city: "COCOA", zip: "32926", judgment: 156000, max_bid: 125500, ml_score: 72, recommendation: "BID", photo_url: "https://www.bcpao.us/photos/23/2312567011.jpg", plaintiff: "NATIONSTAR", auction_date: "2025-12-10" },
  { id: 3, case_number: "05-2024-CA-055432", address: "789 RIVER RD", city: "MERRITT ISLAND", zip: "32953", judgment: 225000, max_bid: 211750, ml_score: 78, recommendation: "BID", photo_url: "https://www.bcpao.us/photos/24/2415678011.jpg", plaintiff: "LAKEVIEW", auction_date: "2025-12-10" },
  { id: 4, case_number: "05-2024-CA-038901", address: "567 HARBOR CITY BLVD", city: "MELBOURNE", zip: "32935", judgment: 142000, max_bid: 104500, ml_score: 58, recommendation: "REVIEW", photo_url: "https://www.bcpao.us/photos/28/2835890011.jpg", plaintiff: "FREEDOM MORTGAGE", auction_date: "2025-12-10" },
  { id: 5, case_number: "05-2024-CA-041234", address: "890 PALM BAY RD NE", city: "PALM BAY", zip: "32905", judgment: 245000, max_bid: 157500, ml_score: 45, recommendation: "REVIEW", photo_url: "https://www.bcpao.us/photos/29/2915678011.jpg", plaintiff: "US BANK", auction_date: "2025-12-10" },
  { id: 6, case_number: "05-2024-CA-043210", address: "456 INDIAN RIVER DR", city: "ROCKLEDGE", zip: "32955", judgment: 289000, max_bid: 220750, ml_score: 52, recommendation: "REVIEW", photo_url: "https://www.bcpao.us/photos/25/2532456011.jpg", plaintiff: "PHH MORTGAGE", auction_date: "2025-12-10" },
  { id: 7, case_number: "05-2024-CA-052345", address: "1456 GRANT ST", city: "TITUSVILLE", zip: "32780", judgment: 185000, max_bid: 95500, ml_score: 32, recommendation: "SKIP", photo_url: "https://www.bcpao.us/photos/22/2207890011.jpg", plaintiff: "WILMINGTON SAVINGS", auction_date: "2025-12-10" },
  { id: 8, case_number: "05-2024-CA-048765", address: "3210 DAIRY RD", city: "WEST MELBOURNE", zip: "32904", judgment: 378000, max_bid: 233750, ml_score: 28, recommendation: "SKIP", photo_url: "https://www.bcpao.us/photos/28/2819234011.jpg", plaintiff: "BANK OF AMERICA", auction_date: "2025-12-10" }
];

export default function handler(req, res) {
  const stats = {
    total: DEC10_DATA.length,
    bid: DEC10_DATA.filter(a => a.recommendation === 'BID').length,
    review: DEC10_DATA.filter(a => a.recommendation === 'REVIEW').length,
    skip: DEC10_DATA.filter(a => a.recommendation === 'SKIP').length,
    total_judgment: DEC10_DATA.reduce((s, a) => s + a.judgment, 0)
  };
  
  res.status(200).json({
    success: true,
    source: "dec10_auction",
    message: "Dec 10, 2025 Foreclosure Auction - Titusville Courthouse 11:00 AM",
    auction_date: "2025-12-10",
    days_until: 2,
    count: DEC10_DATA.length,
    stats,
    data: DEC10_DATA
  });
}
