import React, { useState, useEffect } from 'react';

// Scraper Status Component for BrevardBidderAI Chat Interface
// Monitors: Modal (10-step) + Browserless BECA (9-step) dual scraper architecture
// Polls every 30 seconds for status updates

const ScraperStatus = ({ supabaseUrl, supabaseKey }) => {
  const [scrapers, setScrapers] = useState({
    modal: { name: 'Modal', currentStep: 0, totalSteps: 10, status: 'idle', lastUpdate: null },
    browserless: { name: 'Browserless BECA', currentStep: 0, totalSteps: 9, status: 'idle', lastUpdate: null }
  });
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState(null);

  // Status colors
  const statusColors = {
    idle: 'bg-gray-500',
    running: 'bg-blue-500 animate-pulse',
    completed: 'bg-green-500',
    error: 'bg-red-500'
  };

  // Fetch scraper status from Supabase
  const fetchStatus = async () => {
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/scraper_status?select=*&order=updated_at.desc&limit=2`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch status');
      
      const data = await response.json();
      
      // Update scrapers state from database
      if (data.length > 0) {
        const newScrapers = { ...scrapers };
        data.forEach(row => {
          const key = row.scraper_type === 'modal' ? 'modal' : 'browserless';
          newScrapers[key] = {
            ...newScrapers[key],
            currentStep: row.current_step || 0,
            status: row.status || 'idle',
            lastUpdate: row.updated_at
          };
        });
        setScrapers(newScrapers);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Polling effect
  useEffect(() => {
    if (isPolling) {
      const interval = setInterval(fetchStatus, 30000); // 30 sec polling
      fetchStatus(); // Initial fetch
      return () => clearInterval(interval);
    }
  }, [isPolling]);

  // Progress bar component
  const ProgressBar = ({ current, total, status }) => {
    const percentage = (current / total) * 100;
    return (
      <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
        <div 
          className={`h-2.5 rounded-full transition-all duration-500 ${
            status === 'running' ? 'bg-blue-500' : 
            status === 'completed' ? 'bg-green-500' : 
            status === 'error' ? 'bg-red-500' : 'bg-gray-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  // Scraper card component
  const ScraperCard = ({ scraper }) => (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${statusColors[scraper.status]}`} />
          <span className="font-semibold text-white">{scraper.name}</span>
        </div>
        <span className="text-sm text-gray-400">
          Step {scraper.currentStep}/{scraper.totalSteps}
        </span>
      </div>
      <ProgressBar 
        current={scraper.currentStep} 
        total={scraper.totalSteps} 
        status={scraper.status} 
      />
      {scraper.lastUpdate && (
        <p className="text-xs text-gray-500 mt-2">
          Last update: {new Date(scraper.lastUpdate).toLocaleTimeString()}
        </p>
      )}
    </div>
  );

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-700 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          Dual Scraper Monitor
        </h3>
        <button
          onClick={() => setIsPolling(!isPolling)}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            isPolling 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isPolling ? '⏹ Stop' : '▶ Start'} Polling
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-2 mb-4 text-red-200 text-sm">
          Error: {error}
        </div>
      )}

      {/* Polling indicator */}
      {isPolling && (
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Polling every 30 sec
        </div>
      )}

      {/* Scraper cards */}
      <div className="space-y-3">
        <ScraperCard scraper={scrapers.modal} />
        <ScraperCard scraper={scrapers.browserless} />
      </div>

      {/* Summary footer */}
      <div className="mt-4 pt-3 border-t border-gray-700 flex justify-between text-sm">
        <span className="text-gray-400">
          Total Progress: {scrapers.modal.currentStep + scrapers.browserless.currentStep}/
          {scrapers.modal.totalSteps + scrapers.browserless.totalSteps}
        </span>
        <span className={`font-medium ${
          scrapers.modal.status === 'running' || scrapers.browserless.status === 'running'
            ? 'text-blue-400'
            : scrapers.modal.status === 'completed' && scrapers.browserless.status === 'completed'
            ? 'text-green-400'
            : 'text-gray-400'
        }`}>
          {scrapers.modal.status === 'running' || scrapers.browserless.status === 'running'
            ? '🔄 Running'
            : scrapers.modal.status === 'completed' && scrapers.browserless.status === 'completed'
            ? '✅ Complete'
            : '⏸ Idle'}
        </span>
      </div>
    </div>
  );
};

export default ScraperStatus;
