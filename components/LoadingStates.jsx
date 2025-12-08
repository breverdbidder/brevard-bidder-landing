// BrevardBidderAI - Loading States & Error Handling
// Vibe Coding: Always show loading/error states
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

import React from 'react';

// ============================================================
// SKELETON LOADERS
// ============================================================

export function PropertyCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg bg-neutral-800" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-neutral-800 rounded w-3/4" />
          <div className="h-3 bg-neutral-800 rounded w-1/2" />
        </div>
        <div className="space-y-2 text-right">
          <div className="h-4 bg-neutral-800 rounded w-20 ml-auto" />
          <div className="h-3 bg-neutral-800 rounded w-16 ml-auto" />
        </div>
        <div className="h-8 w-16 bg-neutral-800 rounded-lg" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 bg-neutral-800 rounded w-20" />
          <div className="h-8 bg-neutral-800 rounded w-16" />
        </div>
        <div className="w-12 h-12 bg-neutral-800 rounded-xl" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="glass rounded-xl overflow-hidden animate-pulse">
      <div className="h-12 bg-neutral-800/50 border-b border-neutral-800" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 border-b border-neutral-800 flex items-center px-4 gap-4">
          <div className="w-10 h-10 bg-neutral-800 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-neutral-800 rounded w-2/3" />
            <div className="h-2 bg-neutral-800 rounded w-1/3" />
          </div>
          <div className="h-6 w-16 bg-neutral-800 rounded" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="glass rounded-2xl p-6 animate-pulse">
      <div className="h-5 bg-neutral-800 rounded w-32 mb-6" />
      <div className="h-48 bg-neutral-800 rounded-xl flex items-center justify-center">
        <svg className="w-12 h-12 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
    </div>
  );
}

// ============================================================
// LOADING SPINNER
// ============================================================

export function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <svg 
      className={`animate-spin ${sizes[size]} ${className}`} 
      fill="none" 
      viewBox="0 0 24 24"
      aria-label="Loading"
      role="status"
    >
      <circle 
        className="opacity-25" 
        cx="12" cy="12" r="10" 
        stroke="currentColor" 
        strokeWidth="4" 
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
      />
    </svg>
  );
}

// ============================================================
// FULL PAGE LOADER
// ============================================================

export function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 bg-neutral-950 flex flex-col items-center justify-center z-50">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 animate-pulse">
        <span className="text-white font-bold text-2xl">B</span>
      </div>
      <Spinner size="lg" className="text-blue-500 mb-4" />
      <p className="text-neutral-400 text-sm">{message}</p>
    </div>
  );
}

// ============================================================
// ERROR STATES
// ============================================================

export function ErrorMessage({ 
  title = 'Something went wrong', 
  message = 'Please try again later.',
  onRetry,
  className = ''
}) {
  return (
    <div className={`glass rounded-2xl p-8 text-center ${className}`} role="alert">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-neutral-400 mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ 
  title = 'No data found', 
  message = 'There are no items to display.',
  icon = '📭',
  action,
  actionLabel = 'Add New'
}) {
  return (
    <div className="glass rounded-2xl p-8 text-center">
      <span className="text-5xl mb-4 block">{icon}</span>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-neutral-400 mb-6">{message}</p>
      {action && (
        <button
          onClick={action}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// ============================================================
// ERROR BOUNDARY
// ============================================================

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Could send to error tracking service here
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
          <ErrorMessage
            title="Application Error"
            message="Something unexpected happened. Please refresh the page."
            onRetry={() => window.location.reload()}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================

export function Toast({ message, type = 'info', onClose, duration = 5000 }) {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    info: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    success: 'bg-green-500/20 border-green-500/30 text-green-400',
    warning: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
    error: 'bg-red-500/20 border-red-500/30 text-red-400',
  };

  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };

  return (
    <div 
      className={`fixed bottom-20 md:bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border ${typeStyles[type]} animate-slideUp`}
      role="alert"
      aria-live="polite"
    >
      <span>{icons[type]}</span>
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

export default {
  PropertyCardSkeleton,
  StatCardSkeleton,
  TableSkeleton,
  ChartSkeleton,
  Spinner,
  PageLoader,
  ErrorMessage,
  EmptyState,
  ErrorBoundary,
  Toast,
};
