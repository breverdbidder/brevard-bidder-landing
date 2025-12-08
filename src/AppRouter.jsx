// BrevardBidderAI App Router
// Handles routing between landing page and agentic demo
// Author: Ariel Shapira, Everest Capital USA

import React, { useState, useEffect } from 'react';
import App from './App';
import AgenticDemo from './AgenticDemo';

export default function AppRouter() {
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    // Check URL hash for demo mode
    const checkHash = () => {
      setShowDemo(window.location.hash === '#demo' || window.location.hash === '#agentic');
    };
    
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  if (showDemo) {
    return (
      <div className="relative">
        <a 
          href="#" 
          className="fixed top-4 left-4 z-50 bg-slate-800 hover:bg-slate-700 text-white text-sm px-4 py-2 rounded-lg shadow-lg"
        >
          ← Back to Home
        </a>
        <AgenticDemo />
      </div>
    );
  }

  return <App />;
}
