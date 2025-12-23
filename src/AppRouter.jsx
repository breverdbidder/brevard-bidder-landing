// BidDeed.AI App Router V18
// Routes: / = Landing, #demo = Real Data, #pipeline = 12-Stage, #chat = V18 Chat, #telemetry = Dashboard
import React from 'react';
import { useState, useEffect } from 'react';
import App from './App';
import RealDataDemo from './RealDataDemo';
import PipelineDemo from './PipelineDemo';
import ChatV18 from './ChatV18';
import TelemetryDashboard from './components/TelemetryDashboard';

export default function AppRouter() {
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Route to Telemetry Dashboard
  if (route === '#telemetry' || route === '#metrics' || route === '#dashboard') {
    return <TelemetryDashboard />;
  }

  // Route to V18 Chat - Agentic AI Assistant
  if (route === '#chat' || route === '#assistant' || route === '#ai') {
    return <ChatV18 />; 
  }

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
