// BidDeed.AI - Shadcn-Inspired UI Component Library
// Based on Vibe Coding Community Best Practices
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

import React from 'react';

// ============================================================
// DESIGN TOKENS (Vibe Coding Recommended)
// ============================================================
export const tokens = {
  colors: {
    // Primary palette
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
    // Success (for BID recommendations)
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a',
    },
    // Warning (for REVIEW recommendations)
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
    },
    // Danger (for SKIP recommendations)
    danger: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
    },
    // Neutral
    neutral: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
      950: '#09090b',
    }
  },
  fonts: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'Geist Mono', 'JetBrains Mono', monospace",
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
  radii: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  }
};

// ============================================================
// BUTTON COMPONENT (Shadcn-style)
// ============================================================
export function Button({ 
  children, 
  variant = 'default', 
  size = 'md', 
  disabled = false,
  loading = false,
  icon,
  onClick,
  className = '',
  ...props 
}) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2 
    font-medium transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-[0.98]
  `;
  
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus:ring-neutral-400',
    outline: 'border-2 border-neutral-200 bg-transparent hover:bg-neutral-50 focus:ring-neutral-400',
    ghost: 'bg-transparent hover:bg-neutral-100 focus:ring-neutral-400',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    warning: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-lg',
    xl: 'px-8 py-4 text-lg rounded-xl',
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon}
      {children}
    </button>
  );
}

// ============================================================
// CARD COMPONENT (Shadcn-style)
// ============================================================
export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div 
      className={`
        bg-white dark:bg-neutral-900 
        border border-neutral-200 dark:border-neutral-800 
        rounded-xl shadow-sm
        ${hover ? 'hover:shadow-md hover:border-neutral-300 transition-all duration-200' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-lg font-semibold text-neutral-900 dark:text-white ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-neutral-500 dark:text-neutral-400 mt-1 ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 rounded-b-xl ${className}`}>
      {children}
    </div>
  );
}

// ============================================================
// BADGE COMPONENT (For BID/REVIEW/SKIP)
// ============================================================
export function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const variants = {
    default: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    primary: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    // BidDeed.AI specific
    bid: 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400',
    review: 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
    skip: 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };
  
  return (
    <span className={`
      inline-flex items-center font-medium rounded-full
      ${variants[variant]} ${sizes[size]} ${className}
    `}>
      {children}
    </span>
  );
}

// ============================================================
// TABLE COMPONENT (For auction listings)
// ============================================================
export function Table({ children, className = '' }) {
  return (
    <div className={`overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800 ${className}`}>
      <table className="w-full text-sm">
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }) {
  return (
    <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
      {children}
    </thead>
  );
}

export function TableBody({ children }) {
  return <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">{children}</tbody>;
}

export function TableRow({ children, className = '', hover = true }) {
  return (
    <tr className={`
      ${hover ? 'hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors' : ''}
      ${className}
    `}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '' }) {
  return (
    <th className={`px-4 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '' }) {
  return (
    <td className={`px-4 py-3 text-neutral-700 dark:text-neutral-300 ${className}`}>
      {children}
    </td>
  );
}

// ============================================================
// INPUT COMPONENT
// ============================================================
export function Input({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  disabled = false,
  error,
  icon,
  className = '',
  ...props 
}) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`
          w-full px-4 py-2.5 
          ${icon ? 'pl-10' : ''}
          bg-white dark:bg-neutral-900
          border ${error ? 'border-red-500' : 'border-neutral-200 dark:border-neutral-700'}
          rounded-lg
          text-neutral-900 dark:text-white
          placeholder:text-neutral-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

// ============================================================
// SKELETON LOADER (For loading states)
// ============================================================
export function Skeleton({ className = '', variant = 'text' }) {
  const variants = {
    text: 'h-4 rounded',
    title: 'h-6 w-48 rounded',
    avatar: 'h-10 w-10 rounded-full',
    card: 'h-32 rounded-xl',
    image: 'h-48 rounded-lg',
  };
  
  return (
    <div className={`
      animate-pulse bg-neutral-200 dark:bg-neutral-800
      ${variants[variant]} ${className}
    `} />
  );
}

// ============================================================
// STAT CARD (For KPI display)
// ============================================================
export function StatCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon,
  className = '' 
}) {
  const changeColors = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-neutral-600 bg-neutral-50',
  };
  
  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{title}</p>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">{value}</p>
            {change && (
              <span className={`
                inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2
                ${changeColors[changeType]}
              `}>
                {changeType === 'positive' ? '↑' : changeType === 'negative' ? '↓' : '→'} {change}
              </span>
            )}
          </div>
          {icon && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// PROPERTY CARD (BidDeed.AI specific)
// ============================================================
export function PropertyCard({ 
  address,
  caseNumber,
  judgment,
  openingBid,
  recommendation,
  mlProbability,
  photo,
  onClick
}) {
  const recColors = {
    BID: 'success',
    REVIEW: 'warning',
    SKIP: 'danger',
  };
  
  return (
    <Card hover className="overflow-hidden cursor-pointer" onClick={onClick}>
      {photo && (
        <div className="h-40 overflow-hidden">
          <img 
            src={photo} 
            alt={address}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      <CardContent>
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-neutral-900 dark:text-white line-clamp-1">
            {address}
          </h3>
          <Badge variant={recColors[recommendation] || 'default'}>
            {recommendation}
          </Badge>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
          {caseNumber}
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-neutral-500 dark:text-neutral-400">Judgment</p>
            <p className="font-semibold text-neutral-900 dark:text-white">
              ${judgment?.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-neutral-500 dark:text-neutral-400">Opening Bid</p>
            <p className="font-semibold text-neutral-900 dark:text-white">
              ${openingBid?.toLocaleString()}
            </p>
          </div>
        </div>
        {mlProbability && (
          <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500">ML Probability</span>
              <span className="text-sm font-semibold text-blue-600">{mlProbability}%</span>
            </div>
            <div className="mt-1 h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${mlProbability}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default {
  Button,
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Badge,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Input,
  Skeleton,
  StatCard,
  PropertyCard,
  tokens,
};
