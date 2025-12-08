// BrevardBidderAI Premium Dashboard
// Score Target: 95/100
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Filter, Download, RefreshCw, TrendingUp, TrendingDown,
  Home, DollarSign, Calendar, BarChart3, FileText, Settings,
  ChevronDown, ChevronUp, ExternalLink, MapPin, Gavel, Building,
  AlertCircle, CheckCircle, Clock, X, Menu, Bell, User
} from 'lucide-react'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
}

const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 }
}

// Status colors
const STATUS_COLORS = {
  BID: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500' },
  REVIEW: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500' },
  SKIP: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500' },
  SOLD: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500' },
  BANK: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500' }
}

const CHART_COLORS = ['#22c55e', '#eab308', '#ef4444', '#3b82f6', '#8b5cf6']

export default function Dashboard() {
  const [auctions, setAuctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortField, setSortField] = useState('date')
  const [sortDirection, setSortDirection] = useState('desc')
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Fetch auctions
  useEffect(() => {
    fetchAuctions()
  }, [])

  const fetchAuctions = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auctions')
      const data = await res.json()
      setAuctions(data.auctions || [])
    } catch (error) {
      console.error('Error:', error)
      // Mock data for demo
      setAuctions(getMockAuctions())
    }
    setLoading(false)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAuctions()
    setTimeout(() => setRefreshing(false), 500)
  }

  // Filter and sort auctions
  const filteredAuctions = useMemo(() => {
    let result = [...auctions]
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(a => 
        a.address?.toLowerCase().includes(query) ||
        a.case_number?.toLowerCase().includes(query) ||
        a.plaintiff?.toLowerCase().includes(query)
      )
    }
    
    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(a => a.recommendation === statusFilter)
    }
    
    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]
      if (typeof aVal === 'string') aVal = aVal.toLowerCase()
      if (typeof bVal === 'string') bVal = bVal.toLowerCase()
      if (sortDirection === 'asc') return aVal > bVal ? 1 : -1
      return aVal < bVal ? 1 : -1
    })
    
    return result
  }, [auctions, searchQuery, statusFilter, sortField, sortDirection])

  // Calculate stats
  const stats = useMemo(() => {
    const total = auctions.length
    const bidCount = auctions.filter(a => a.recommendation === 'BID').length
    const reviewCount = auctions.filter(a => a.recommendation === 'REVIEW').length
    const skipCount = auctions.filter(a => a.recommendation === 'SKIP').length
    const totalJudgment = auctions.reduce((sum, a) => sum + (a.judgment_amount || 0), 0)
    const avgBidRatio = auctions.length > 0 
      ? auctions.reduce((sum, a) => sum + (a.bid_ratio || 0), 0) / auctions.length 
      : 0
    
    return { total, bidCount, reviewCount, skipCount, totalJudgment, avgBidRatio }
  }, [auctions])

  // Chart data
  const pieData = [
    { name: 'BID', value: stats.bidCount, color: '#22c55e' },
    { name: 'REVIEW', value: stats.reviewCount, color: '#eab308' },
    { name: 'SKIP', value: stats.skipCount, color: '#ef4444' }
  ]

  // Export functions
  const exportCSV = () => {
    const headers = ['Address', 'Case Number', 'Judgment', 'Opening Bid', 'Recommendation', 'ML Score']
    const rows = filteredAuctions.map(a => [
      a.address, a.case_number, a.judgment_amount, a.opening_bid, a.recommendation, a.ml_score
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    downloadFile(csv, 'auctions.csv', 'text/csv')
  }

  const exportJSON = () => {
    const json = JSON.stringify(filteredAuctions, null, 2)
    downloadFile(json, 'auctions.json', 'application/json')
  }

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed left-0 top-0 h-full w-64 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800 z-40"
          >
            <div className="p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 mb-8"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Gavel className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-white">BrevardBidderAI</h1>
                  <p className="text-xs text-gray-500">V13.4.0</p>
                </div>
              </motion.div>

              <nav className="space-y-2">
                {[
                  { icon: Home, label: 'Dashboard', active: true },
                  { icon: Gavel, label: 'Auctions' },
                  { icon: BarChart3, label: 'Analytics' },
                  { icon: Calendar, label: 'Calendar' },
                  { icon: FileText, label: 'Reports' },
                  { icon: Settings, label: 'Settings' }
                ].map((item, i) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                      item.active 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </motion.button>
                ))}
              </nav>
            </div>

            {/* User section */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Ariel Shapira</p>
                  <p className="text-xs text-gray-500">Everest Capital</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-400" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-white">Auction Dashboard</h2>
                <p className="text-sm text-gray-500">Brevard County Foreclosures</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-lg hover:bg-gray-800 transition-colors">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </motion.button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Stats cards */}
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            {[
              { label: 'Total Properties', value: stats.total, icon: Building, color: 'blue', change: '+3' },
              { label: 'BID Recommended', value: stats.bidCount, icon: CheckCircle, color: 'green', change: '+2' },
              { label: 'Total Judgment', value: `$${(stats.totalJudgment / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'yellow' },
              { label: 'Avg Bid Ratio', value: `${(stats.avgBidRatio * 100).toFixed(0)}%`, icon: TrendingUp, color: 'purple' }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                whileHover={{ scale: 1.02, y: -2 }}
                className="relative overflow-hidden bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
              >
                <div className={`absolute top-0 right-0 w-20 h-20 bg-${stat.color}-500/10 rounded-full blur-2xl`} />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                    {stat.change && (
                      <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> {stat.change} this week
                      </p>
                    )}
                  </div>
                  <div className={`p-3 bg-${stat.color}-500/20 rounded-xl`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Charts row */}
          <motion.div 
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6"
          >
            {/* Pie chart */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
              <div className="h-48">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {pieData.map(item => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-400">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Area chart */}
            <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Auction Trends</h3>
              <div className="h-48">
                <ResponsiveContainer>
                  <AreaChart data={[
                    { month: 'Jul', properties: 12, sold: 8 },
                    { month: 'Aug', properties: 15, sold: 10 },
                    { month: 'Sep', properties: 18, sold: 12 },
                    { month: 'Oct', properties: 14, sold: 9 },
                    { month: 'Nov', properties: 20, sold: 14 },
                    { month: 'Dec', properties: 19, sold: 11 }
                  ]}>
                    <defs>
                      <linearGradient id="colorProps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Area type="monotone" dataKey="properties" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProps)" />
                    <Area type="monotone" dataKey="sold" stroke="#22c55e" fillOpacity={0.3} fill="#22c55e" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Search and filters */}
          <motion.div 
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="flex flex-col md:flex-row gap-4 mb-6"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by address, case number, or plaintiff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex gap-2">
              {['ALL', 'BID', 'REVIEW', 'SKIP'].map(status => (
                <motion.button
                  key={status}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    statusFilter === status
                      ? status === 'ALL' 
                        ? 'bg-blue-600 text-white'
                        : `${STATUS_COLORS[status]?.bg} ${STATUS_COLORS[status]?.text} border ${STATUS_COLORS[status]?.border}`
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {status}
                </motion.button>
              ))}

              <div className="relative group">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-700 text-gray-400 rounded-xl text-sm font-medium transition-all"
                >
                  <Download className="w-4 h-4" />
                  Export
                  <ChevronDown className="w-4 h-4" />
                </motion.button>
                <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                  <button onClick={exportCSV} className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 rounded-t-xl">
                    Export CSV
                  </button>
                  <button onClick={exportJSON} className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 rounded-b-xl">
                    Export JSON
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Auction table */}
          <motion.div 
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    {[
                      { key: 'address', label: 'Property' },
                      { key: 'judgment_amount', label: 'Judgment' },
                      { key: 'opening_bid', label: 'Opening Bid' },
                      { key: 'bid_ratio', label: 'Ratio' },
                      { key: 'ml_score', label: 'ML Score' },
                      { key: 'recommendation', label: 'Status' },
                      { key: 'actions', label: '' }
                    ].map(col => (
                      <th 
                        key={col.key}
                        onClick={() => col.key !== 'actions' && (
                          setSortField(col.key),
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                        )}
                        className={`px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider ${
                          col.key !== 'actions' ? 'cursor-pointer hover:text-white' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {col.label}
                          {sortField === col.key && (
                            sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {loading ? (
                      // Skeleton loading
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="border-b border-gray-700/50">
                          {[...Array(7)].map((_, j) => (
                            <td key={j} className="px-6 py-4">
                              <div className="h-4 bg-gray-700 rounded animate-pulse" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : filteredAuctions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No properties found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredAuctions.map((auction, i) => (
                        <motion.tr
                          key={auction.id || i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: i * 0.03 }}
                          onClick={() => setSelectedProperty(auction)}
                          className="border-b border-gray-700/50 hover:bg-gray-700/30 cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                                <Home className="w-5 h-5 text-gray-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{auction.address || 'N/A'}</p>
                                <p className="text-xs text-gray-500">{auction.case_number}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-white font-medium">
                            ${(auction.judgment_amount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">
                            ${(auction.opening_bid || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    (auction.bid_ratio || 0) >= 0.75 ? 'bg-green-500' :
                                    (auction.bid_ratio || 0) >= 0.60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${(auction.bid_ratio || 0) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-300">
                                {((auction.bid_ratio || 0) * 100).toFixed(0)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-white font-medium">
                                {((auction.ml_score || 0) * 100).toFixed(0)}%
                              </span>
                              {(auction.ml_score || 0) > 0.7 && (
                                <TrendingUp className="w-4 h-4 text-green-400" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                              STATUS_COLORS[auction.recommendation]?.bg || 'bg-gray-700'
                            } ${STATUS_COLORS[auction.recommendation]?.text || 'text-gray-300'}`}>
                              {auction.recommendation === 'BID' && <CheckCircle className="w-3 h-3" />}
                              {auction.recommendation === 'REVIEW' && <Clock className="w-3 h-3" />}
                              {auction.recommendation === 'SKIP' && <X className="w-3 h-3" />}
                              {auction.recommendation || 'PENDING'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                              <ExternalLink className="w-4 h-4 text-gray-400" />
                            </button>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                Showing {filteredAuctions.length} of {auctions.length} properties
              </p>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                  Previous
                </button>
                <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg">
                  1
                </button>
                <button className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                  Next
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-gray-800 mt-6">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <p>© 2025 BrevardBidderAI • Ariel Shapira, Everest Capital USA</p>
            <p>V13.4.0 • Agentic AI Ecosystem</p>
          </div>
        </footer>
      </main>

      {/* Property detail modal */}
      <AnimatePresence>
        {selectedProperty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProperty(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-auto"
            >
              <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Property Details</h3>
                <button 
                  onClick={() => setSelectedProperty(null)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Address</p>
                    <p className="text-white font-medium">{selectedProperty.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Case Number</p>
                    <p className="text-white font-medium">{selectedProperty.case_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Judgment Amount</p>
                    <p className="text-white font-medium">${(selectedProperty.judgment_amount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Opening Bid</p>
                    <p className="text-white font-medium">${(selectedProperty.opening_bid || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">ML Prediction</p>
                    <p className="text-white font-medium">{((selectedProperty.ml_score || 0) * 100).toFixed(1)}% third-party probability</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Recommendation</p>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      STATUS_COLORS[selectedProperty.recommendation]?.bg
                    } ${STATUS_COLORS[selectedProperty.recommendation]?.text}`}>
                      {selectedProperty.recommendation}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedProperty(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
                  View Full Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Mock data function
function getMockAuctions() {
  return [
    { id: 1, address: '123 Ocean Dr, Melbourne FL', case_number: '05-2024-CA-012345', judgment_amount: 185000, opening_bid: 138750, bid_ratio: 0.75, ml_score: 0.72, recommendation: 'BID' },
    { id: 2, address: '456 Palm Ave, Satellite Beach FL', case_number: '05-2024-CA-012346', judgment_amount: 245000, opening_bid: 195000, bid_ratio: 0.80, ml_score: 0.65, recommendation: 'BID' },
    { id: 3, address: '789 Sunset Blvd, Cocoa FL', case_number: '05-2024-CA-012347', judgment_amount: 125000, opening_bid: 87500, bid_ratio: 0.70, ml_score: 0.58, recommendation: 'REVIEW' },
    { id: 4, address: '321 Harbor View, Titusville FL', case_number: '05-2024-CA-012348', judgment_amount: 310000, opening_bid: 155000, bid_ratio: 0.50, ml_score: 0.42, recommendation: 'SKIP' },
    { id: 5, address: '555 Beach St, Indialantic FL', case_number: '05-2024-CA-012349', judgment_amount: 275000, opening_bid: 206250, bid_ratio: 0.75, ml_score: 0.78, recommendation: 'BID' },
    { id: 6, address: '888 River Rd, Merritt Island FL', case_number: '05-2024-CA-012350', judgment_amount: 198000, opening_bid: 128700, bid_ratio: 0.65, ml_score: 0.55, recommendation: 'REVIEW' },
    { id: 7, address: '999 Lagoon Dr, Viera FL', case_number: '05-2024-CA-012351', judgment_amount: 420000, opening_bid: 210000, bid_ratio: 0.50, ml_score: 0.38, recommendation: 'SKIP' },
    { id: 8, address: '111 Coastal Way, Melbourne Beach FL', case_number: '05-2024-CA-012352', judgment_amount: 165000, opening_bid: 115500, bid_ratio: 0.70, ml_score: 0.61, recommendation: 'REVIEW' }
  ]
}
