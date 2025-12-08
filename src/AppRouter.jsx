// BrevardBidderAI App Router
// Handles routing between landing page and application
// Author: Ariel Shapira, Everest Capital USA

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { SplitScreenLayout } from './components/SplitScreenLayout';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<App />} />
        
        {/* Full Application Interface */}
        <Route path="/app" element={<SplitScreenLayout />} />
        
        {/* Demo Routes */}
        <Route path="/demo" element={<SplitScreenLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
