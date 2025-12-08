// BrevardBidderAI App Router
// Hash-based routing between landing page and agentic demo
// Author: Ariel Shapira, Everest Capital USA

import React, { useState, useEffect } from 'react';
import App from './App';
import AgenticDemo from './AgenticDemo';

export default function AppRouter() {
  const [currentRoute, setCurrentRoute] = useState('home');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'demo' || hash === 'app') {
        setCurrentRoute('demo');
      } else {
        setCurrentRoute('home');
      }
    };

    // Check initial hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (currentRoute === 'demo') {
    return (
      <div className="relative">
        <a 
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.location.hash = '';
            setCurrentRoute('home');
          }}
          className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-sm px-4 py-2 rounded-lg shadow-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </a>
        <AgenticDemo />
      </div>
    );
  }

  return <App />;
}
