// app/(dashboard)/analytics/page.tsx
// BidDeed.AI Analytics Dashboard
// Historical performance tracking, ML accuracy, ROI analysis

'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Filter,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  description?: string;
}

interface TimeRange {
  label: string;
  value: '7d' | '30d' | '90d' | '1y' | 'all';
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mlPerformanceData = [
  { month: 'Jul', accuracy: 62, precision: 58, recall: 65 },
  { month: 'Aug', accuracy: 65, precision: 62, recall: 68 },
  { month: 'Sep', accuracy: 68, precision: 65, recall: 70 },
  { month: 'Oct', accuracy: 72, precision: 70, recall: 73 },
  { month: 'Nov', accuracy: 78, precision: 76, recall: 79 },
  { month: 'Dec', accuracy: 87, precision: 85, recall: 88 },
];

const decisionData = [
  { name: 'BID', value: 47, color: '#22c55e' },
  { name: 'REVIEW', value: 28, color: '#eab308' },
  { name: 'SKIP', value: 125, color: '#ef4444' },
];

const roiByTypeData = [
  { type: 'SFR', roi: 28, count: 32 },
  { type: 'Condo', roi: 22, count: 18 },
  { type: 'Townhouse', roi: 25, count: 12 },
  { type: 'Multi-Family', roi: 35, count: 5 },
  { type: 'Land', roi: 18, count: 3 },
];

const monthlyVolumeData = [
  { month: 'Jul', analyzed: 45, bid: 8, won: 3, roi: 22 },
  { month: 'Aug', analyzed: 52, bid: 12, won: 5, roi: 25 },
  { month: 'Sep', analyzed: 68, bid: 15, won: 6, roi: 28 },
  { month: 'Oct', analyzed: 85, bid: 18, won: 8, roi: 26 },
  { month: 'Nov', analyzed: 102, bid: 22, won: 11, roi: 31 },
  { month: 'Dec', analyzed: 120, bid: 25, won: 14, roi: 28 },
];

const comparisonMetrics = [
  { metric: 'Time per Property', manual: '2.5 hours', biddeed: '8 minutes', improvement: '94% faster' },
  { metric: 'Analysis Accuracy', manual: '68%', biddeed: '87%', improvement: '+19%' },
  { metric: 'Properties/Day', manual: '3', biddeed: '100+', improvement: '33x more' },
  { metric: 'Cost per Analysis', manual: '$250', biddeed: '$2.50', improvement: '99% cheaper' },
  { metric: 'Missed Opportunities', manual: '~40%', biddeed: '<5%', improvement: '8x better' },
];

const timeRanges: TimeRange[] = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: '1 Year', value: '1y' },
  { label: 'All Time', value: 'all' },
];

// ============================================================================
// KPI CARD COMPONENT
// ============================================================================

function KPICard({ icon, label, value, change, trend, description }: KPICardProps) {
  const trendColors = {
    up: 'text-green-400 bg-green-400/10',
    down: 'text-red-400 bg-red-400/10',
    neutral: 'text-gray-400 bg-gray-400/10',
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 hover:border-indigo-500/30 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="p-2 bg-indigo-500/20 rounded-xl">
          {icon}
        </div>
        {change && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${trendColors[trend]}`}>
            {TrendIcon && <TrendIcon className="w-3 h-3" />}
            {change}
          </div>
        )}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-gray-400 mt-1">{label}</div>
        {description && (
          <div className="text-xs text-gray-500 mt-2">{description}</div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// CHART CARD COMPONENT
// ============================================================================

interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function ChartCard({ title, subtitle, icon, children }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 border border-slate-700/50 rounded-2xl overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              {icon}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="p-5">
        {children}
      </div>
    </motion.div>
  );
}

// ============================================================================
// COMPARISON TABLE COMPONENT
// ============================================================================

function ComparisonTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700/50">
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Metric</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">Manual Research</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">BidDeed.AI</th>
            <th className="text-right py-3 px-4 text-indigo-400 font-medium">Improvement</th>
          </tr>
        </thead>
        <tbody>
          {comparisonMetrics.map((row, index) => (
            <motion.tr
              key={row.metric}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors"
            >
              <td className="py-3 px-4 text-white">{row.metric}</td>
              <td className="text-right py-3 px-4 text-gray-400">{row.manual}</td>
              <td className="text-right py-3 px-4 text-white font-medium">{row.biddeed}</td>
              <td className="text-right py-3 px-4">
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">
                  {row.improvement}
                </span>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// CUSTOM TOOLTIP
// ============================================================================

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) {
  if (!active || !payload) return null;

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
      <p className="text-gray-400 text-sm mb-2">{label}</p>
      {payload.map((item, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-gray-300">{item.name}:</span>
          <span className="text-white font-medium">{item.value}%</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// PIE CHART LABEL
// ============================================================================

function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
}) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// ============================================================================
// MAIN ANALYTICS PAGE
// ============================================================================

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange['value']>('30d');

  // Calculate totals
  const totals = useMemo(() => ({
    analyzed: monthlyVolumeData.reduce((sum, m) => sum + m.analyzed, 0),
    bid: monthlyVolumeData.reduce((sum, m) => sum + m.bid, 0),
    won: monthlyVolumeData.reduce((sum, m) => sum + m.won, 0),
    avgRoi: Math.round(monthlyVolumeData.reduce((sum, m) => sum + m.roi, 0) / monthlyVolumeData.length),
  }), []);

  const winRate = Math.round((totals.won / totals.bid) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <p className="text-gray-400 mt-1">Track your investment performance and ML model accuracy</p>
          </div>
          
          {/* Time Range Filter */}
          <div className="flex items-center gap-2 bg-slate-900/50 rounded-xl p-1">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range.value
                    ? 'bg-indigo-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          icon={<Target className="w-5 h-5 text-indigo-400" />}
          label="Win Rate"
          value={`${winRate}%`}
          change="+5.2%"
          trend="up"
          description="Successful bids / Total bids"
        />
        <KPICard
          icon={<DollarSign className="w-5 h-5 text-indigo-400" />}
          label="Average ROI"
          value={`${totals.avgRoi}%`}
          change="+3.1%"
          trend="up"
          description="Return on investment per deal"
        />
        <KPICard
          icon={<Award className="w-5 h-5 text-indigo-400" />}
          label="Properties Won"
          value={totals.won.toString()}
          change="+12"
          trend="up"
          description="Successful acquisitions"
        />
        <KPICard
          icon={<TrendingUp className="w-5 h-5 text-indigo-400" />}
          label="Properties Analyzed"
          value={totals.analyzed.toString()}
          change="+18.3%"
          trend="up"
          description="Total properties processed"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* ML Model Performance */}
        <ChartCard
          title="ML Model Performance"
          subtitle="Prediction accuracy over time"
          icon={<BarChart3 className="w-4 h-4 text-indigo-400" />}
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mlPerformanceData}>
              <defs>
                <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPrecision" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} domain={[50, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="accuracy"
                name="Accuracy"
                stroke="#6366f1"
                fillOpacity={1}
                fill="url(#colorAccuracy)"
              />
              <Area
                type="monotone"
                dataKey="precision"
                name="Precision"
                stroke="#22c55e"
                fillOpacity={1}
                fill="url(#colorPrecision)"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500" />
              <span className="text-gray-400">Current Accuracy:</span>
              <span className="text-white font-bold">87%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-400">Target:</span>
              <span className="text-white font-bold">90%</span>
            </div>
          </div>
        </ChartCard>

        {/* Decision Distribution */}
        <ChartCard
          title="Decision Distribution"
          subtitle="BID / REVIEW / SKIP breakdown"
          icon={<PieChartIcon className="w-4 h-4 text-indigo-400" />}
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={decisionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {decisionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-4">
            {decisionData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-gray-400">{item.name}:</span>
                <span className="text-white font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* ROI by Property Type */}
        <ChartCard
          title="ROI by Property Type"
          subtitle="Average return by category"
          icon={<DollarSign className="w-4 h-4 text-indigo-400" />}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roiByTypeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" fontSize={12} />
              <YAxis type="category" dataKey="type" stroke="#94a3b8" fontSize={12} width={80} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="roi" name="ROI %" fill="#6366f1" radius={[0, 4, 4, 0]}>
                {roiByTypeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.roi >= 30 ? '#22c55e' : entry.roi >= 25 ? '#6366f1' : '#eab308'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Monthly Volume */}
        <ChartCard
          title="Monthly Activity"
          subtitle="Properties analyzed vs. acquired"
          icon={<Calendar className="w-4 h-4 text-indigo-400" />}
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyVolumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="analyzed"
                name="Analyzed"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: '#6366f1' }}
              />
              <Line
                type="monotone"
                dataKey="bid"
                name="Bid"
                stroke="#eab308"
                strokeWidth={2}
                dot={{ fill: '#eab308' }}
              />
              <Line
                type="monotone"
                dataKey="won"
                name="Won"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: '#22c55e' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Comparison Table */}
      <ChartCard
        title="BidDeed.AI vs Manual Research"
        subtitle="Quantified efficiency gains"
        icon={<TrendingUp className="w-4 h-4 text-indigo-400" />}
      >
        <ComparisonTable />
      </ChartCard>

      {/* Summary Stats */}
      <div className="mt-8 p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-500/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-indigo-500/20 rounded-xl">
            <Award className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Platform ROI Summary</h3>
            <p className="text-gray-400 text-sm">Estimated value generated by BidDeed.AI</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-900/50 rounded-xl">
            <div className="text-2xl font-bold text-green-400">$50K</div>
            <div className="text-sm text-gray-400">Extra Deal/Quarter</div>
          </div>
          <div className="text-center p-4 bg-slate-900/50 rounded-xl">
            <div className="text-2xl font-bold text-red-400">$100K</div>
            <div className="text-sm text-gray-400">Avoided Loss/Year</div>
          </div>
          <div className="text-center p-4 bg-slate-900/50 rounded-xl">
            <div className="text-2xl font-bold text-indigo-400">520 hrs</div>
            <div className="text-sm text-gray-400">Time Saved/Year</div>
          </div>
          <div className="text-center p-4 bg-slate-900/50 rounded-xl">
            <div className="text-2xl font-bold text-yellow-400">100x</div>
            <div className="text-sm text-gray-400">ROI vs Platform Cost</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { KPICard, ChartCard, ComparisonTable };
