// BidDeed.AI - Mobile Navigation Component
// Vibe Coding: Mobile-first responsive design
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

import React, { useState, useEffect } from 'react';

export function MobileNav({ activeTab, onTabChange, darkMode, onDarkModeToggle }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [activeTab]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'auctions', label: 'Auctions', icon: '🏠' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'reports', label: 'Reports', icon: '📄' },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 glass border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="text-white font-semibold">BidDeed.AI</span>
        </div>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-neutral-400 hover:text-white transition-colors"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="absolute right-0 top-0 h-full w-72 bg-neutral-900 border-l border-neutral-800 p-6 animate-slideLeft"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between mb-8">
              <span className="text-white font-semibold">Menu</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-neutral-400 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nav Items */}
            <nav className="space-y-2" role="navigation" aria-label="Main navigation">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                  aria-current={activeTab === item.id ? 'page' : undefined}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Dark Mode Toggle */}
            <div className="mt-8 pt-8 border-t border-neutral-800">
              <button
                onClick={onDarkModeToggle}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="flex items-center gap-3">
                  <span className="text-xl">{darkMode ? '🌙' : '☀️'}</span>
                  <span className="font-medium">{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
                </span>
                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${darkMode ? 'bg-blue-600' : 'bg-neutral-700'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-4' : ''}`} />
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 left-6 right-6 text-center">
              <p className="text-neutral-500 text-xs">
                BidDeed.AI V13.4.0
              </p>
              <p className="text-neutral-600 text-xs mt-1">
                Agentic AI Ecosystem
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation (Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-neutral-800 z-40">
        <nav className="flex justify-around py-2" role="navigation" aria-label="Quick navigation">
          {navItems.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all ${
                activeTab === item.id
                  ? 'text-blue-400'
                  : 'text-neutral-500 hover:text-white'
              }`}
              aria-current={activeTab === item.id ? 'page' : undefined}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Add slide animation keyframe */}
      <style>{`
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideLeft {
          animation: slideLeft 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}

export default MobileNav;
