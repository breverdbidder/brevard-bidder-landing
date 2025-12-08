// BrevardBidderAI Split-Screen Layout
// Main Application Interface
// Author: Ariel Shapira, Everest Capital USA

import React, { useState } from 'react';
import { ChatPanel } from './ChatPanel';
import { AuctionMap } from './AuctionMap';
import { PropertyDrawer } from './PropertyDrawer';

export function SplitScreenLayout() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);

  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
    setShowDrawer(true);
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setSelectedProperty(null);
  };

  return (
    <div className="h-screen w-screen bg-slate-950 flex overflow-hidden">
      {/* Left Panel - Chat (30%) */}
      <div className="w-[30%] min-w-[320px] border-r border-slate-700">
        <ChatPanel onPropertyCommand={handlePropertySelect} />
      </div>

      {/* Right Panel - Map + Drawer (70%) */}
      <div className="flex-1 relative">
        {/* Map */}
        <div className={`h-full transition-all duration-300 ${showDrawer ? 'mr-[400px]' : ''}`}>
          <AuctionMap 
            onPropertySelect={handlePropertySelect}
            selectedProperty={selectedProperty}
          />
        </div>

        {/* Property Drawer (slides in from right) */}
        {showDrawer && (
          <div className="absolute top-0 right-0 h-full w-[400px]">
            <PropertyDrawer 
              property={selectedProperty}
              onClose={handleCloseDrawer}
            />
          </div>
        )}
      </div>

      {/* Footer Attribution */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur border-t border-slate-700 px-4 py-2 flex justify-between items-center text-xs text-gray-500">
        <span>© 2025 Ariel Shapira, Everest Capital USA</span>
        <span>BrevardBidderAI v13.4.0 • 12-Stage Agentic Pipeline</span>
      </div>
    </div>
  );
}

export default SplitScreenLayout;
