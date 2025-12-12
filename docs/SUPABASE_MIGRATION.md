# 🗄️ BidDeed.AI Supabase Migration Guide

## Database Details
- **URL**: https://mocerqjnksmhcjzxrewo.supabase.co
- **Schema**: `sql/biddeed_schema.sql`

## Migration Steps

### Option 1: Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard/project/mocerqjnksmhcjzxrewo
2. Navigate to **SQL Editor**
3. Copy contents of `sql/biddeed_schema.sql`
4. Paste and click **Run**

### Option 2: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref mocerqjnksmhcjzxrewo

# Run migration
supabase db push
```

### Option 3: Direct psql

```bash
# Get connection string from Supabase Dashboard > Settings > Database
psql "postgresql://postgres:[PASSWORD]@db.mocerqjnksmhcjzxrewo.supabase.co:5432/postgres" \
  -f sql/biddeed_schema.sql
```

## Tables Created

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `auction_results` | Core foreclosure data | case_number, decision, ml_predictions |
| `historical_auctions` | ML training data | plaintiff, outcome, bid_judgment_ratio |
| `pipeline_runs` | Pipeline execution tracking | stage_results, status, timing |
| `insights` | General logging | category, content, search_vector |
| `daily_metrics` | Performance metrics | pipelines, decisions, costs |
| `plaintiff_stats` | Plaintiff scoring | third_party_rate, category |
| `activities` | Life OS tasks | domain, complexity, status |
| `michael_swim_times` | Swimming performance | event, time, personal_best |
| `smart_router_logs` | LLM routing decisions | tier, model, cost |

## Views Created

- `v_upcoming_auctions` - Properties for upcoming auctions
- `v_daily_summary` - Daily aggregated metrics
- `v_plaintiff_leaderboard` - Plaintiff performance rankings

## Functions Created

- `update_auction_timestamp()` - Auto-update timestamps
- `refresh_plaintiff_stats()` - Recalculate plaintiff metrics
- `insights_search_trigger()` - Full-text search indexing

## Post-Migration Verification

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check row counts
SELECT 'auction_results' as tbl, COUNT(*) FROM auction_results
UNION ALL SELECT 'historical_auctions', COUNT(*) FROM historical_auctions
UNION ALL SELECT 'insights', COUNT(*) FROM insights;

-- Test a view
SELECT * FROM v_upcoming_auctions LIMIT 5;
```

## Environment Variables

After migration, ensure these are set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://mocerqjnksmhcjzxrewo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Troubleshooting

### "relation already exists"
Tables may already exist. Use `DROP TABLE IF EXISTS` or run individual CREATE statements.

### "permission denied"
Ensure you're using the service_role key, not anon key.

### Full-text search not working
Run: `CREATE EXTENSION IF NOT EXISTS pg_trgm;`

---

*Schema version: 1.0.0 | Last updated: December 2025*
