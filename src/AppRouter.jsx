// BidDeed.AI App Router
// Routes: / = Landing, #demo = Real Data Demo, #pipeline = 12-Stage Pipeline Demo
import React from 'react';
import { useState, useEffect } from 'react';
import App from './App';
import RealDataDemo from './RealDataDemo';
import PipelineDemo from './PipelineDemo';

export default function AppRouter() {
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Route to Pipeline Demo - auto-animated 12-stage walkthrough
  if (route === '#pipeline' || route === '#investor') {
    return <PipelineDemo />;
  }

  // Route to Real Data Demo with 12-stage pipeline and Live AI
  if (route === '#demo' || route === '#agentic') {
    return <RealDataDemo />;
  }

  // Default: Landing page
  return <App />;
}
