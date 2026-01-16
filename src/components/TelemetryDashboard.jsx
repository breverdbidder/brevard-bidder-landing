import { useState, useEffect, useCallback } from 'react';

// Supabase config - uses env vars in production
const SUPABASE_URL = 'https://mocerqjnksmhcjzxrewo.supabase.co';
const SUPABASE_ANON_KEY = ''; // Set via Cloudflare env

// Color scheme matching BidDeed.AI brand
const COLORS = {
  navy: '#1E3A5F',
  green: '#10B981',
  red: '#EF4444',
  orange: '#F59E0B',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  gray: '#6B7280',
  dark: '#111827',
  light: '#F9FAFB',
};

// Supabase client helper
async function supabaseQuery(table, options = {}) {
  const params = new URLSearchParams();
  if (options.select) params.append('select', options.select);
  if (options.order) params.append('order', options.order);
  if (options.limit) params.append('limit', options.limit);
  if (options.filter) {
    Object.entries(options.filter).forEach(([key, value]) => {
      params.append(key, value);
    });
  }
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  return response.json();
}

// Stat Card Component
function StatCard({ title, value, subtitle, trend, color = COLORS.blue, icon }) {
  const trendColor = trend > 0 ? COLORS.green : trend < 0 ? COLORS.red : COLORS.gray;
  
  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-header">
        <span className="stat-icon">{icon}</span>
        <span className="stat-title">{title}</span>
      </div>
      <div className="stat-value">{value}</div>
      {subtitle && <div className="stat-subtitle">{subtitle}</div>}
      {trend !== undefined && (
        <div className="stat-trend" style={{ color: trendColor }}>
          {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
  );
}

// Mini Chart Component (sparkline-style)
function MiniChart({ data, color = COLORS.blue, height = 40 }) {
  if (!data || data.length === 0) return null;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 100 / data.length;
  
  return (
    <svg viewBox={`0 0 100 ${height}`} className="mini-chart">
      <defs>
        <linearGradient id={`grad-${color.slice(1)}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path
        d={`M 0 ${height} ${data.map((v, i) => 
          `L ${i * width + width/2} ${height - ((v - min) / range) * (height - 5)}`
        ).join(' ')} L 100 ${height} Z`}
        fill={`url(#grad-${color.slice(1)})`}
      />
      <path
        d={data.map((v, i) => 
          `${i === 0 ? 'M' : 'L'} ${i * width + width/2} ${height - ((v - min) / range) * (height - 5)}`
        ).join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
    </svg>
  );
}

// Alert Badge Component
function AlertBadge({ alerts }) {
  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;
  const warningCount = alerts.filter(a => a.severity === 'warning' && !a.acknowledged).length;
  
  if (criticalCount === 0 && warningCount === 0) return null;
  
  return (
    <div className="alert-badges">
      {criticalCount > 0 && (
        <span className="badge critical">{criticalCount} Critical</span>
      )}
      {warningCount > 0 && (
        <span className="badge warning">{warningCount} Warning</span>
      )}
    </div>
  );
}

// Workflow Status Row
function WorkflowRow({ workflow }) {
  const statusColors = {
    success: COLORS.green,
    failure: COLORS.red,
    running: COLORS.blue,
  };
  
  const duration = workflow.duration_seconds 
    ? `${Math.floor(workflow.duration_seconds / 60)}m ${workflow.duration_seconds % 60}s`
    : 'Running...';
  
  return (
    <div className="workflow-row">
      <div className="workflow-status" style={{ backgroundColor: statusColors[workflow.status] || COLORS.gray }}>
        {workflow.status === 'running' ? '●' : workflow.status === 'success' ? '✓' : '✗'}
      </div>
      <div className="workflow-info">
        <div className="workflow-name">{workflow.workflow_name}</div>
        <div className="workflow-meta">
          {new Date(workflow.created_at).toLocaleString()} · {duration}
        </div>
      </div>
      <div className="workflow-stats">
        <span className="bid">{workflow.properties_bid || 0} BID</span>
        <span className="review">{workflow.properties_review || 0} REVIEW</span>
        <span className="skip">{workflow.properties_skip || 0} SKIP</span>
      </div>
      <div className="workflow-cost">${(workflow.total_cost_usd || 0).toFixed(4)}</div>
    </div>
  );
}

// Model Tier Distribution
function TierDistribution({ data }) {
  const tiers = ['FREE', 'ULTRA_CHEAP', 'CHEAP', 'STANDARD', 'PREMIUM'];
  const tierColors = {
    FREE: COLORS.green,
    ULTRA_CHEAP: COLORS.blue,
    CHEAP: COLORS.purple,
    STANDARD: COLORS.orange,
    PREMIUM: COLORS.red,
  };
  
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
  
  return (
    <div className="tier-distribution">
      <div className="tier-bar">
        {tiers.map(tier => {
          const pct = ((data[tier] || 0) / total) * 100;
          if (pct === 0) return null;
          return (
            <div 
              key={tier}
              className="tier-segment"
              style={{ width: `${pct}%`, backgroundColor: tierColors[tier] }}
              title={`${tier}: ${pct.toFixed(1)}%`}
            />
          );
        })}
      </div>
      <div className="tier-legend">
        {tiers.map(tier => (
          <div key={tier} className="tier-item">
            <span className="tier-dot" style={{ backgroundColor: tierColors[tier] }} />
            <span className="tier-label">{tier}</span>
            <span className="tier-value">{((data[tier] || 0) / total * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Dashboard Component
export default function TelemetryDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  // Dashboard state
  const [dailyMetrics, setDailyMetrics] = useState([]);
  const [recentWorkflows, setRecentWorkflows] = useState([]);
  const [routerMetrics, setRouterMetrics] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [tierCounts, setTierCounts] = useState({});
  
  // Computed metrics
  const todayMetrics = dailyMetrics[0] || {};
  const yesterdayMetrics = dailyMetrics[1] || {};
  
  const costTrend = yesterdayMetrics.total_cost_usd 
    ? ((todayMetrics.total_cost_usd - yesterdayMetrics.total_cost_usd) / yesterdayMetrics.total_cost_usd) * 100 
    : 0;
  
  const freeTierTrend = yesterdayMetrics.free_tier_percentage
    ? todayMetrics.free_tier_percentage - yesterdayMetrics.free_tier_percentage
    : 0;

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [daily, workflows, router, alertsData] = await Promise.all([
        supabaseQuery('telemetry_daily', { order: 'date.desc', limit: 14 }),
        supabaseQuery('workflow_runs', { order: 'created_at.desc', limit: 10 }),
        supabaseQuery('smart_router_metrics', { 
          order: 'created_at.desc', 
          limit: 1000,
          filter: { 'created_at': `gte.${new Date(Date.now() - 24*60*60*1000).toISOString()}` }
        }),
        supabaseQuery('telemetry_alerts', { 
          order: 'created_at.desc', 
          limit: 20,
          filter: { 'acknowledged': 'eq.false' }
        }),
      ]);
      
      setDailyMetrics(daily);
      setRecentWorkflows(workflows);
      setRouterMetrics(router);
      setAlerts(alertsData);
      
      // Calculate tier distribution
      const counts = {};
      router.forEach(m => {
        counts[m.model_tier] = (counts[m.model_tier] || 0) + 1;
      });
      setTierCounts(counts);
      
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchData]);

  // Prepare chart data
  const costHistory = dailyMetrics.slice().reverse().map(d => d.total_cost_usd || 0);
  const propertiesHistory = dailyMetrics.slice().reverse().map(d => d.properties_processed || 0);
  const freeTierHistory = dailyMetrics.slice().reverse().map(d => d.free_tier_percentage || 0);

  return (
    <div className="dashboard">
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .dashboard {
          font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
          background: linear-gradient(135deg, ${COLORS.dark} 0%, #1a1a2e 100%);
          min-height: 100vh;
          color: ${COLORS.light};
          padding: 24px;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, ${COLORS.blue}, ${COLORS.purple});
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        
        .logo-text {
          font-size: 24px;
          font-weight: 700;
          background: linear-gradient(90deg, ${COLORS.blue}, ${COLORS.purple});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .logo-sub {
          font-size: 12px;
          color: ${COLORS.gray};
          letter-spacing: 2px;
        }
        
        .refresh-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .refresh-time {
          font-size: 12px;
          color: ${COLORS.gray};
        }
        
        .refresh-btn {
          background: rgba(255,255,255,0.1);
          border: none;
          color: ${COLORS.light};
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.2s;
        }
        
        .refresh-btn:hover {
          background: rgba(255,255,255,0.2);
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }
        
        .stat-card {
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 20px;
          border-left: 4px solid;
          backdrop-filter: blur(10px);
        }
        
        .stat-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        
        .stat-icon {
          font-size: 18px;
        }
        
        .stat-title {
          font-size: 12px;
          color: ${COLORS.gray};
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .stat-value {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        
        .stat-subtitle {
          font-size: 12px;
          color: ${COLORS.gray};
        }
        
        .stat-trend {
          font-size: 14px;
          margin-top: 8px;
        }
        
        .section {
          background: rgba(255,255,255,0.03);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
        }
        
        .section-title {
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: ${COLORS.gray};
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .mini-chart {
          width: 100%;
          height: 40px;
          margin-top: 12px;
        }
        
        .workflow-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        
        .workflow-row:last-child {
          border-bottom: none;
        }
        
        .workflow-status {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: white;
        }
        
        .workflow-info {
          flex: 1;
        }
        
        .workflow-name {
          font-weight: 600;
          font-size: 14px;
        }
        
        .workflow-meta {
          font-size: 12px;
          color: ${COLORS.gray};
        }
        
        .workflow-stats {
          display: flex;
          gap: 12px;
          font-size: 12px;
        }
        
        .workflow-stats .bid { color: ${COLORS.green}; }
        .workflow-stats .review { color: ${COLORS.orange}; }
        .workflow-stats .skip { color: ${COLORS.red}; }
        
        .workflow-cost {
          font-size: 14px;
          color: ${COLORS.purple};
          font-weight: 600;
        }
        
        .tier-distribution {
          margin-top: 16px;
        }
        
        .tier-bar {
          height: 12px;
          border-radius: 6px;
          background: rgba(255,255,255,0.1);
          display: flex;
          overflow: hidden;
          margin-bottom: 16px;
        }
        
        .tier-segment {
          height: 100%;
          transition: width 0.3s ease;
        }
        
        .tier-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .tier-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
        }
        
        .tier-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        
        .tier-label {
          color: ${COLORS.gray};
        }
        
        .tier-value {
          font-weight: 600;
        }
        
        .alert-badges {
          display: flex;
          gap: 8px;
        }
        
        .badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }
        
        .badge.critical {
          background: ${COLORS.red};
          color: white;
        }
        
        .badge.warning {
          background: ${COLORS.orange};
          color: white;
        }
        
        .grid-2 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
        }
        
        .error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid ${COLORS.red};
          padding: 16px;
          border-radius: 8px;
          color: ${COLORS.red};
        }
        
        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: ${COLORS.gray};
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .loading::after {
          content: 'Loading telemetry data...';
          animation: pulse 1.5s infinite;
        }
      `}</style>

      {/* Header */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">📊</div>
          <div>
            <div className="logo-text">BidDeed.AI</div>
            <div className="logo-sub">TELEMETRY</div>
          </div>
        </div>
        <div className="refresh-info">
          <AlertBadge alerts={alerts} />
          <span className="refresh-time">
            Last refresh: {lastRefresh.toLocaleTimeString()}
          </span>
          <button className="refresh-btn" onClick={fetchData} disabled={loading}>
            {loading ? '...' : '↻ Refresh'}
          </button>
        </div>
      </header>

      {error && <div className="error">Error: {error}</div>}

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Properties Today"
          value={todayMetrics.properties_processed || 0}
          subtitle={`${todayMetrics.properties_bid || 0} BID · ${todayMetrics.properties_review || 0} REVIEW`}
          color={COLORS.blue}
          icon="🏠"
        />
        <StatCard
          title="Free Tier %"
          value={`${(todayMetrics.free_tier_percentage || 0).toFixed(1)}%`}
          subtitle="Target: 90%"
          trend={freeTierTrend}
          color={COLORS.green}
          icon="🎯"
        />
        <StatCard
          title="Cost Today"
          value={`$${(todayMetrics.total_cost_usd || 0).toFixed(4)}`}
          subtitle="Monthly budget: $100"
          trend={costTrend}
          color={COLORS.purple}
          icon="💰"
        />
        <StatCard
          title="Avg Latency"
          value={`${todayMetrics.avg_latency_ms || 0}ms`}
          subtitle="Smart Router response"
          color={COLORS.orange}
          icon="⚡"
        />
        <StatCard
          title="Workflows"
          value={todayMetrics.total_workflows || 0}
          subtitle={`${todayMetrics.successful_workflows || 0} successful`}
          color={COLORS.navy}
          icon="🔄"
        />
        <StatCard
          title="Errors"
          value={todayMetrics.error_count || 0}
          subtitle="Today's failures"
          color={todayMetrics.error_count > 0 ? COLORS.red : COLORS.gray}
          icon="⚠️"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid-2">
        {/* Recent Workflows */}
        <div className="section">
          <h2 className="section-title">📋 Recent Workflows</h2>
          {loading && recentWorkflows.length === 0 ? (
            <div className="loading" />
          ) : (
            recentWorkflows.map(wf => (
              <WorkflowRow key={wf.id} workflow={wf} />
            ))
          )}
        </div>

        {/* Smart Router Distribution */}
        <div className="section">
          <h2 className="section-title">🧠 Smart Router Distribution (24h)</h2>
          <TierDistribution data={tierCounts} />
          <div style={{ marginTop: 24 }}>
            <div className="section-title" style={{ marginBottom: 8 }}>Cost Trend (14 days)</div>
            <MiniChart data={costHistory} color={COLORS.purple} height={60} />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2">
        <div className="section">
          <h2 className="section-title">📈 Properties Processed (14 days)</h2>
          <MiniChart data={propertiesHistory} color={COLORS.blue} height={80} />
        </div>
        <div className="section">
          <h2 className="section-title">🎯 Free Tier % (14 days)</h2>
          <MiniChart data={freeTierHistory} color={COLORS.green} height={80} />
        </div>
      </div>
    </div>
  );
}
