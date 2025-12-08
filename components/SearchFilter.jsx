// BrevardBidderAI - Search & Filter Component
// Vibe Coding Best Practice: Interactive filtering
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

import React, { useState, useMemo } from 'react';

export function SearchFilter({ 
  data = [], 
  onFilter, 
  searchFields = ['property_address', 'case_number'],
  placeholder = "Search properties..."
}) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    recommendation: 'all',
    minJudgment: '',
    maxJudgment: '',
    sortBy: 'judgment_desc'
  });
  const [showFilters, setShowFilters] = useState(false);

  const filteredData = useMemo(() => {
    let result = [...data];
    
    // Text search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(item => 
        searchFields.some(field => 
          String(item[field] || '').toLowerCase().includes(searchLower)
        )
      );
    }
    
    // Recommendation filter
    if (filters.recommendation !== 'all') {
      result = result.filter(item => item.recommendation === filters.recommendation);
    }
    
    // Judgment range
    if (filters.minJudgment) {
      result = result.filter(item => (item.judgment_amount || 0) >= Number(filters.minJudgment));
    }
    if (filters.maxJudgment) {
      result = result.filter(item => (item.judgment_amount || 0) <= Number(filters.maxJudgment));
    }
    
    // Sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'judgment_desc':
          return (b.judgment_amount || 0) - (a.judgment_amount || 0);
        case 'judgment_asc':
          return (a.judgment_amount || 0) - (b.judgment_amount || 0);
        case 'address':
          return (a.property_address || '').localeCompare(b.property_address || '');
        case 'probability':
          return (b.ml_probability || 0) - (a.ml_probability || 0);
        default:
          return 0;
      }
    });
    
    return result;
  }, [data, search, filters, searchFields]);

  // Notify parent of filtered results
  React.useEffect(() => {
    onFilter?.(filteredData);
  }, [filteredData, onFilter]);

  const activeFiltersCount = [
    filters.recommendation !== 'all',
    filters.minJudgment,
    filters.maxJudgment,
  ].filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          aria-label="Search properties"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute inset-y-0 right-12 flex items-center pr-3 text-neutral-400 hover:text-white"
            aria-label="Clear search"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`absolute inset-y-0 right-0 flex items-center pr-4 ${activeFiltersCount > 0 ? 'text-blue-400' : 'text-neutral-400'} hover:text-white transition-colors`}
          aria-label="Toggle filters"
          aria-expanded={showFilters}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-xs flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="glass rounded-xl p-4 space-y-4 animate-slideDown">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Recommendation Filter */}
            <div>
              <label className="block text-xs text-neutral-400 mb-1.5">Recommendation</label>
              <select
                value={filters.recommendation}
                onChange={(e) => setFilters({...filters, recommendation: e.target.value})}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Filter by recommendation"
              >
                <option value="all">All</option>
                <option value="BID">BID</option>
                <option value="REVIEW">REVIEW</option>
                <option value="SKIP">SKIP</option>
              </select>
            </div>

            {/* Min Judgment */}
            <div>
              <label className="block text-xs text-neutral-400 mb-1.5">Min Judgment</label>
              <input
                type="number"
                value={filters.minJudgment}
                onChange={(e) => setFilters({...filters, minJudgment: e.target.value})}
                placeholder="$0"
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Minimum judgment amount"
              />
            </div>

            {/* Max Judgment */}
            <div>
              <label className="block text-xs text-neutral-400 mb-1.5">Max Judgment</label>
              <input
                type="number"
                value={filters.maxJudgment}
                onChange={(e) => setFilters({...filters, maxJudgment: e.target.value})}
                placeholder="No limit"
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Maximum judgment amount"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-xs text-neutral-400 mb-1.5">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Sort results"
              >
                <option value="judgment_desc">Judgment (High to Low)</option>
                <option value="judgment_asc">Judgment (Low to High)</option>
                <option value="address">Address (A-Z)</option>
                <option value="probability">ML Probability</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <button
              onClick={() => setFilters({ recommendation: 'all', minJudgment: '', maxJudgment: '', sortBy: 'judgment_desc' })}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-400">
          Showing <span className="text-white font-medium">{filteredData.length}</span> of {data.length} properties
        </span>
        {search && (
          <span className="text-neutral-500">
            Searching: "{search}"
          </span>
        )}
      </div>
    </div>
  );
}

export default SearchFilter;
