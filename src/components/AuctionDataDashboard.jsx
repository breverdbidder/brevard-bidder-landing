import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, DollarSign, TrendingUp, MapPin, Filter } from 'lucide-react';

const AuctionDataDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, foreclosure, taxdeed
  const [cityFilter, setCityFilter] = useState('all');

  useEffect(() => {
    // Load 120-day data
    fetch('/data/brevard_120day_results_20251229.json')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading auction data...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Error loading data</div>
      </div>
    );
  }

  // Process data for visualizations
  const allProperties = Object.entries(data.by_date).flatMap(([date, dateData]) => 
    dateData.properties.map(p => ({ ...p, date }))
  );

  // Filter data
  const filteredProperties = allProperties.filter(p => {
    if (filter !== 'all' && p.type.toLowerCase() !== filter) return false;
    if (cityFilter !== 'all' && p.city !== cityFilter) return false;
    return true;
  });

  // Get unique cities
  const cities = [...new Set(allProperties.map(p => p.city))].sort();

  // Prepare chart data - Volume by Date
  const volumeByDate = Object.entries(data.by_date)
    .map(([date, dateData]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: date,
      volume: dateData.volume,
      count: dateData.count,
      type: dateData.type
    }))
    .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));

  // Volume by Type
  const volumeByType = [
    { name: 'Foreclosures', value: data.summary.foreclosures.volume, count: data.summary.foreclosures.count },
    { name: 'Tax Deeds', value: data.summary.tax_deeds.volume, count: data.summary.tax_deeds.count }
  ];

  // Top 10 Properties
  const top10 = [...allProperties]
    .sort((a, b) => b.sold_amount - a.sold_amount)
    .slice(0, 10);

  // Volume by City
  const cityStats = {};
  allProperties.forEach(p => {
    if (!cityStats[p.city]) {
      cityStats[p.city] = { city: p.city, volume: 0, count: 0 };
    }
    cityStats[p.city].volume += p.sold_amount;
    cityStats[p.city].count += 1;
  });
  const topCities = Object.values(cityStats)
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 8);

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316', '#6366f1'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Brevard County Auction Data
          </h1>
          <p className="text-slate-300 text-lg">
            120-Day Analysis: {data.date_range.start} to {data.date_range.end}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold">{data.summary.total_dates}</span>
            </div>
            <p className="text-slate-400">Auction Dates</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold">{data.summary.total_properties}</span>
            </div>
            <p className="text-slate-400">Properties Sold</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-purple-400" />
              <span className="text-3xl font-bold">
                ${(data.summary.total_volume / 1000000).toFixed(1)}M
              </span>
            </div>
            <p className="text-slate-400">Total Volume</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <MapPin className="w-8 h-8 text-orange-400" />
              <span className="text-3xl font-bold">{cities.length}</span>
            </div>
            <p className="text-slate-400">Cities Covered</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <Filter className="w-5 h-5 text-slate-400" />
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                All Types
              </button>
              <button
                onClick={() => setFilter('foreclosure')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'foreclosure'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Foreclosures
              </button>
              <button
                onClick={() => setFilter('tax deed')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'tax deed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Tax Deeds
              </button>
            </div>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600"
            >
              <option value="all">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Volume Over Time */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Volume Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={volumeByDate}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Volume']}
                />
                <Bar dataKey="volume" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Type Distribution */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Volume by Type</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={volumeByType}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: $${(entry.value / 1000000).toFixed(1)}M`}
                >
                  {volumeByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Cities by Volume */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Top Cities by Volume</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCities} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                <YAxis type="category" dataKey="city" stroke="#94a3b8" width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Volume']}
                />
                <Bar dataKey="volume" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Property Count Over Time */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Properties Sold by Date</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={volumeByDate}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 10 Properties Table */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Top 10 Properties by Sale Price</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4">Rank</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Address</th>
                  <th className="text-left py-3 px-4">City</th>
                  <th className="text-right py-3 px-4">Sale Price</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Winner</th>
                </tr>
              </thead>
              <tbody>
                {top10.map((prop, idx) => (
                  <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                    <td className="py-3 px-4 font-bold text-blue-400">#{idx + 1}</td>
                    <td className="py-3 px-4">{new Date(prop.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{prop.address}</td>
                    <td className="py-3 px-4">{prop.city}</td>
                    <td className="py-3 px-4 text-right font-bold text-green-400">
                      ${prop.sold_amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        prop.type === 'FORECLOSURE' ? 'bg-blue-600' : 'bg-purple-600'
                      }`}>
                        {prop.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">{prop.winner_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDataDashboard;
