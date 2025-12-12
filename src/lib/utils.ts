import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind CSS conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/**
 * Format duration in seconds to human readable
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return remaining > 0 ? `${minutes}m ${remaining}s` : `${minutes}m`;
}

/**
 * Decision type to color mapping
 */
export const decisionColors = {
  BID: {
    gradient: 'from-green-500 to-emerald-600',
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    border: 'border-green-500/20',
  },
  REVIEW: {
    gradient: 'from-yellow-500 to-amber-600',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    border: 'border-yellow-500/20',
  },
  SKIP: {
    gradient: 'from-red-500 to-rose-600',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/20',
  },
} as const;

/**
 * Pipeline stage status to color mapping
 */
export const stageStatusColors = {
  pending: {
    bg: 'bg-slate-600/20',
    text: 'text-slate-400',
    icon: 'text-slate-500',
  },
  running: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    icon: 'text-blue-400',
  },
  complete: {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    icon: 'text-green-400',
  },
  error: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    icon: 'text-red-400',
  },
  skipped: {
    bg: 'bg-slate-700/20',
    text: 'text-slate-500',
    icon: 'text-slate-600',
  },
} as const;

/**
 * The 12 stages of The Everest Ascent™ pipeline
 */
export const PIPELINE_STAGES = [
  { id: 'discovery', name: 'Discovery', icon: '🔍', description: 'Find case on RealForeclose', estimatedDuration: 5 },
  { id: 'scraping', name: 'Scraping', icon: '📥', description: 'Extract case details', estimatedDuration: 10 },
  { id: 'title-search', name: 'Title Search', icon: '📜', description: 'Query AcclaimWeb records', estimatedDuration: 15 },
  { id: 'lien-priority', name: 'Lien Priority', icon: '⚖️', description: 'Analyze surviving liens', estimatedDuration: 8 },
  { id: 'tax-certs', name: 'Tax Certs', icon: '💰', description: 'Check RealTDM balance', estimatedDuration: 5 },
  { id: 'demographics', name: 'Demographics', icon: '👥', description: 'Census API analysis', estimatedDuration: 3 },
  { id: 'ml-score', name: 'ML Score', icon: '🤖', description: 'XGBoost prediction', estimatedDuration: 2 },
  { id: 'max-bid', name: 'Max Bid', icon: '🎯', description: 'Everest Capital formula', estimatedDuration: 1 },
  { id: 'decision', name: 'Decision', icon: '✅', description: 'BID/REVIEW/SKIP output', estimatedDuration: 1 },
  { id: 'report', name: 'Report', icon: '📄', description: 'Generate DOCX', estimatedDuration: 5 },
  { id: 'disposition', name: 'Disposition', icon: '📊', description: 'Track action taken', estimatedDuration: 1 },
  { id: 'archive', name: 'Archive', icon: '🗄️', description: 'Save to Supabase', estimatedDuration: 2 },
] as const;

/**
 * Type guard for decision types
 */
export function isValidDecision(value: string): value is 'BID' | 'REVIEW' | 'SKIP' {
  return ['BID', 'REVIEW', 'SKIP'].includes(value);
}
