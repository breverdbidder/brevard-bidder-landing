// components/layout/MobileLayout.tsx
// BidDeed.AI Mobile-First Layout
// PWA-optimized with bottom navigation, swipeable cards, offline support

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Home, 
  BarChart3, 
  FileText, 
  Settings,
  Wifi,
  WifiOff,
  ChevronRight,
  Bell,
  Search,
  User
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface MobileLayoutProps {
  children: React.ReactNode;
  currentRoute?: string;
  onNavigate?: (route: string) => void;
}

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  route: string;
  badge?: number;
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
  badge?: number;
}

// ============================================================================
// NAVIGATION CONFIG
// ============================================================================

const navItems: NavItem[] = [
  { id: 'properties', icon: <Home className="w-5 h-5" />, label: 'Properties', route: '/properties' },
  { id: 'pipeline', icon: <BarChart3 className="w-5 h-5" />, label: 'Pipeline', route: '/pipeline' },
  { id: 'reports', icon: <FileText className="w-5 h-5" />, label: 'Reports', route: '/reports', badge: 3 },
  { id: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Settings', route: '/settings' },
];

// ============================================================================
// MENU ITEM COMPONENT
// ============================================================================

function MenuItem({ icon, label, description, onClick, badge }: MenuItemProps) {
  return (
    <motion.button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-slate-800/50 transition-colors"
      whileTap={{ scale: 0.98 }}
    >
      <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
        {icon}
      </div>
      <div className="flex-1 text-left">
        <div className="font-medium text-white">{label}</div>
        {description && (
          <div className="text-sm text-gray-400">{description}</div>
        )}
      </div>
      {badge && badge > 0 && (
        <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
          {badge}
        </span>
      )}
      <ChevronRight className="w-4 h-4 text-gray-500" />
    </motion.button>
  );
}

// ============================================================================
// MOBILE MENU (Slide-out)
// ============================================================================

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

function MobileMenu({ isOpen, onClose, onNavigate }: MobileMenuProps) {
  const menuItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Dashboard', description: 'Overview & quick actions', route: '/dashboard' },
    { icon: <BarChart3 className="w-5 h-5" />, label: 'Active Auctions', description: 'Today\'s opportunities', route: '/auctions', badge: 12 },
    { icon: <FileText className="w-5 h-5" />, label: 'My Reports', description: 'Generated analyses', route: '/reports', badge: 3 },
    { icon: <Bell className="w-5 h-5" />, label: 'Notifications', description: 'Alerts & updates', route: '/notifications', badge: 5 },
    { icon: <User className="w-5 h-5" />, label: 'Profile', description: 'Account settings', route: '/profile' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-slate-900 border-l border-slate-700 z-50 overflow-y-auto"
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏔️</span>
                <div>
                  <div className="font-bold text-white">BidDeed.AI</div>
                  <div className="text-xs text-gray-400">Everest Capital</div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* User Section */}
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 
                              flex items-center justify-center text-white font-bold">
                  AS
                </div>
                <div>
                  <div className="font-medium text-white">Ariel Shapira</div>
                  <div className="text-sm text-gray-400">Managing Member</div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              {menuItems.map((item) => (
                <MenuItem
                  key={item.route}
                  icon={item.icon}
                  label={item.label}
                  description={item.description}
                  badge={item.badge}
                  onClick={() => {
                    onNavigate(item.route);
                    onClose();
                  }}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-900">
              <div className="text-xs text-gray-500 text-center">
                BidDeed.AI v13.4.0 • Everest Ascent™
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// BOTTOM NAVIGATION
// ============================================================================

interface BottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

function BottomNav({ currentRoute, onNavigate }: BottomNavProps) {
  return (
    <nav className="h-16 bg-slate-900/95 backdrop-blur-lg border-t border-slate-700 
                    flex items-center justify-around px-2 safe-area-bottom">
      {navItems.map((item) => {
        const isActive = currentRoute === item.route || currentRoute.startsWith(item.route);
        
        return (
          <motion.button
            key={item.id}
            onClick={() => onNavigate(item.route)}
            className={`relative flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-xl
                        transition-colors ${isActive ? 'text-indigo-400' : 'text-gray-500'}`}
            whileTap={{ scale: 0.9 }}
          >
            {/* Active indicator */}
            {isActive && (
              <motion.div
                layoutId="activeNavIndicator"
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-indigo-500 rounded-full"
              />
            )}

            {/* Icon with badge */}
            <div className="relative">
              {item.icon}
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white 
                               text-[10px] font-bold rounded-full flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </div>

            {/* Label */}
            <span className={`text-xs ${isActive ? 'font-medium' : ''}`}>
              {item.label}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
}

// ============================================================================
// OFFLINE INDICATOR
// ============================================================================

function OfflineIndicator({ isOnline }: { isOnline: boolean }) {
  if (isOnline) return null;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 
                 text-center py-2 text-sm font-medium flex items-center justify-center gap-2"
    >
      <WifiOff className="w-4 h-4" />
      <span>You're offline. Changes will sync when connected.</span>
    </motion.div>
  );
}

// ============================================================================
// MAIN MOBILE LAYOUT
// ============================================================================

export function MobileLayout({ 
  children, 
  currentRoute = '/properties',
  onNavigate = () => {} 
}: MobileLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white">
      {/* Offline Banner */}
      <AnimatePresence>
        <OfflineIndicator isOnline={isOnline} />
      </AnimatePresence>

      {/* Mobile Header */}
      <header className="h-14 bg-gradient-to-r from-indigo-600 to-purple-600 
                         flex items-center justify-between px-4 sticky top-0 z-30
                         safe-area-top">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-xl">🏔️</span>
          <span className="font-bold">BidDeed.AI</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Connection Status */}
          <div className={`p-2 rounded-full ${isOnline ? 'text-green-300' : 'text-yellow-300'}`}>
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          </div>

          {/* Search */}
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <Search className="w-5 h-5" />
          </button>

          {/* Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav currentRoute={currentRoute} onNavigate={onNavigate} />

      {/* Slide-out Menu */}
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={onNavigate}
      />
    </div>
  );
}

// ============================================================================
// PWA INSTALL PROMPT
// ============================================================================

interface PWAInstallPromptProps {
  onInstall: () => void;
  onDismiss: () => void;
}

export function PWAInstallPrompt({ onInstall, onDismiss }: PWAInstallPromptProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-20 left-4 right-4 bg-slate-800 border border-slate-700 
                 rounded-2xl p-4 shadow-2xl z-40"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-indigo-500/20 rounded-xl">
          <span className="text-2xl">🏔️</span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white">Install BidDeed.AI</h3>
          <p className="text-sm text-gray-400 mt-1">
            Add to your home screen for faster access and offline support.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={onInstall}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white 
                       text-sm font-medium rounded-lg transition-colors"
            >
              Install App
            </button>
            <button
              onClick={onDismiss}
              className="px-4 py-2 text-gray-400 hover:text-white 
                       text-sm font-medium transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
        <button onClick={onDismiss} className="text-gray-500 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default MobileLayout;
