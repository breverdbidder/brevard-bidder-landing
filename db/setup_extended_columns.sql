-- BidDeed.AI: One-time schema extension
-- Run this ONCE in Supabase SQL Editor to enable photo/pool tracking

ALTER TABLE historical_auctions ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE historical_auctions ADD COLUMN IF NOT EXISTS pool BOOLEAN DEFAULT FALSE;
ALTER TABLE historical_auctions ADD COLUMN IF NOT EXISTS last_sale_price DECIMAL(12,2);
ALTER TABLE historical_auctions ADD COLUMN IF NOT EXISTS last_sale_date DATE;

CREATE INDEX IF NOT EXISTS idx_auctions_date_status ON historical_auctions(auction_date, status);
CREATE INDEX IF NOT EXISTS idx_auctions_pool ON historical_auctions(pool) WHERE pool = true;

SELECT 'SUCCESS: Extended columns added!' as result;
