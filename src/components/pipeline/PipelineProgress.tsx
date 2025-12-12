// components/pipeline/PipelineProgress.tsx
// Enhanced 12-Stage Pipeline Visualization
// Real-time progress tracking with stage details

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Loader2, 
  AlertCircle,
  ChevronRight,
  Clock,
  Zap
} from 'lucide-react';

// Pipeline Stage Definitions
export const PIPELINE_STAGES = [
  { 
    id: 'discovery', 
    name: 'Discovery', 
    icon: '🔍', 
    description: 'Find case on RealForeclose',
    estimatedTime: '5s'
  },
  { 
    id: 'scraping', 
    name: 'Scraping', 
    icon: '📥', 
    description: 'Extract case details (plaintiff, judgment, defendant)',
    estimatedTime: '10s'
  },
  { 
    id: 'title', 
    name: 'Title Search', 
    icon: '📜', 
    description: 'Query AcclaimWeb for liens and encumbrances',
    estimatedTime: '15s'
  },
  { 
    id: 'lien_priority', 
    name: 'Lien Priority', 
    icon: '⚖️', 
    description: 'Analyze which liens survive foreclosure',
    estimatedTime: '8s'
  },
  { 
    id: 'tax_certs', 
    name: 'Tax Certs', 
    icon: '💰', 
    description: 'Check RealTDM for outstanding tax certificates',
    estimatedTime: '5s'
  },
  { 
    id: 'demographics', 
    name: 'Demographics', 
    icon: '👥', 
    description: 'Census API for zip code analysis',
    estimatedTime: '3s'
  },
  { 
    id: 'ml_score', 
    name: 'ML Score', 
    icon: '🤖', 
    description: 'Run XGBoost third-party probability model',
    estimatedTime: '2s'
  },
  { 
    id: 'max_bid', 
    name: 'Max Bid', 
    icon: '🎯', 
    description: 'Calculate using Everest Capital formula',
    estimatedTime: '1s'
  },
  { 
    id: 'decision', 
    name: 'Decision', 
    icon: '✅', 
    description: 'Generate BID/REVIEW/SKIP recommendation',
    estimatedTime: '1s'
  },
  { 
    id: 'report', 
    name: 'Report', 
    icon: '📄', 
    description: 'Generate one-page DOCX analysis',
    estimatedTime: '5s'
  },
  { 
    id: 'disposition', 
    name: 'Disposition', 
    icon: '📊', 
    description: 'Track intended action',
    estimatedTime: '1s'
  },
  { 
    id: 'archive', 
    name: 'Archive', 
    icon: '🗄️', 
    description: 'Save to Supabase auction_results',
    estimatedTime: '2s'
  },
] as const;

export type StageId = typeof PIPELINE_STAGES[number]['id'];
export type StageStatus = 'pending' | 'running' | 'complete' | 'error' | 'skipped';

export interface StageResult {
  summary?: string;
  data?: any;
  duration?: number;
  error?: string;
}

interface PipelineProgressProps {
  stages: Record<StageId, StageStatus>;
  results?: Record<StageId, StageResult>;
  compact?: boolean;
  onStageClick?: (stageId: StageId) => void;
}

export function PipelineProgress({ 
  stages, 
  results = {}, 
  compact = false,
  onStageClick 
}: PipelineProgressProps) {
  const [expandedStage, setExpandedStage] = useState<StageId | null>(null);
  
  const completedCount = Object.values(stages).filter(s => s === 'complete').length;
  const errorCount = Object.values(stages).filter(s => s === 'error').length;
  const runningStage = PIPELINE_STAGES.find(s => stages[s.id] === 'running');
  const progress = (completedCount / PIPELINE_STAGES.length) * 100;

  // Calculate total duration
  const totalDuration = Object.values(results).reduce((acc, r) => acc + (r.duration || 0), 0);

  if (compact) {
    return <CompactPipeline stages={stages} progress={progress} completedCount={completedCount} />;
  }

  return (
    <div className="bg-bb-darker rounded-xl p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🏔️</span>
            Everest Ascent™ Pipeline
          </h3>
          <p className="text-sm text-gray-400 mt-1">12-Stage Foreclosure Analysis</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-bb-primary">{completedCount}</span>
            <span className="text-gray-500">/</span>
            <span className="text-xl text-gray-400">12</span>
          </div>
          <p className="text-xs text-gray-500">Stages Complete</p>
          {totalDuration > 0 && (
            <p className="text-xs text-gray-600 mt-1 flex items-center justify-end gap-1">
              <Clock className="w-3 h-3" />
              {(totalDuration / 1000).toFixed(1)}s total
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${errorCount > 0 
                ? 'bg-gradient-to-r from-bb-skip to-red-600' 
                : 'bg-gradient-to-r from-bb-primary to-bb-secondary'}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <span className="text-sm font-mono text-gray-400 w-12 text-right">
            {progress.toFixed(0)}%
          </span>
        </div>
        
        {/* Currently Running */}
        {runningStage && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-bb-review"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Running: {runningStage.name}</span>
            <span className="text-gray-500">({runningStage.description})</span>
          </motion.div>
        )}
      </div>

      {/* Stage Grid/List */}
      <div className="space-y-2">
        {PIPELINE_STAGES.map((stage, index) => {
          const status = stages[stage.id] || 'pending';
          const result = results[stage.id];
          const isExpanded = expandedStage === stage.id;

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              {/* Stage Row */}
              <div
                onClick={() => {
                  setExpandedStage(isExpanded ? null : stage.id);
                  onStageClick?.(stage.id);
                }}
                className={`
                  flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                  ${status === 'complete' ? 'bg-green-500/10 hover:bg-green-500/20' : ''}
                  ${status === 'running' ? 'bg-yellow-500/10 hover:bg-yellow-500/20' : ''}
                  ${status === 'error' ? 'bg-red-500/10 hover:bg-red-500/20' : ''}
                  ${status === 'pending' ? 'bg-white/5 hover:bg-white/10' : ''}
                  ${status === 'skipped' ? 'bg-gray-500/10 hover:bg-gray-500/20 opacity-50' : ''}
                `}
              >
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  <StageStatusIcon status={status} />
                </div>

                {/* Stage Number */}
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-mono text-gray-400">
                  {index + 1}
                </div>

                {/* Stage Emoji */}
                <span className="text-xl">{stage.icon}</span>

                {/* Stage Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{stage.name}</span>
                    {result?.duration && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {(result.duration / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>
                  {result?.summary && (
                    <p className="text-xs text-gray-400 truncate">{result.summary}</p>
                  )}
                </div>

                {/* Status Badge */}
                <StageStatusBadge status={status} />

                {/* Expand Arrow */}
                <ChevronRight 
                  className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                />
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && result && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-12 mr-4 mt-2 p-3 bg-bb-dark rounded-lg text-sm">
                      <p className="text-gray-400 mb-2">{stage.description}</p>
                      {result.data && (
                        <pre className="text-xs text-gray-500 overflow-auto max-h-32 bg-black/20 p-2 rounded">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      )}
                      {result.error && (
                        <p className="text-red-400 text-xs mt-2">Error: {result.error}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3 mt-6 pt-4 border-t border-white/10">
        <StatBox label="Completed" value={completedCount} color="text-bb-bid" />
        <StatBox label="Running" value={Object.values(stages).filter(s => s === 'running').length} color="text-bb-review" />
        <StatBox label="Pending" value={Object.values(stages).filter(s => s === 'pending').length} color="text-gray-400" />
        <StatBox label="Errors" value={errorCount} color="text-bb-skip" />
      </div>
    </div>
  );
}

// Sub-components

function StageStatusIcon({ status }: { status: StageStatus }) {
  switch (status) {
    case 'complete':
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case 'running':
      return <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />;
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    case 'skipped':
      return <Circle className="w-5 h-5 text-gray-500" />;
    default:
      return <Circle className="w-5 h-5 text-gray-600" />;
  }
}

function StageStatusBadge({ status }: { status: StageStatus }) {
  const styles = {
    complete: 'bg-green-500 text-white',
    running: 'bg-yellow-500 text-black',
    error: 'bg-red-500 text-white',
    pending: 'bg-gray-600 text-white',
    skipped: 'bg-gray-700 text-gray-400'
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${styles[status]}`}>
      {status.toUpperCase()}
    </span>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-bb-dark rounded-lg p-2 text-center">
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

// Compact version for status bar
function CompactPipeline({ 
  stages, 
  progress, 
  completedCount 
}: { 
  stages: Record<StageId, StageStatus>; 
  progress: number;
  completedCount: number;
}) {
  return (
    <div className="flex items-center gap-3">
      {/* Mini stage indicators */}
      <div className="flex gap-0.5">
        {PIPELINE_STAGES.map((stage) => {
          const status = stages[stage.id] || 'pending';
          return (
            <div
              key={stage.id}
              title={`${stage.name}: ${status}`}
              className={`w-2 h-4 rounded-sm transition-colors ${
                status === 'complete' ? 'bg-bb-bid' :
                status === 'running' ? 'bg-bb-review animate-pulse' :
                status === 'error' ? 'bg-bb-skip' :
                'bg-white/20'
              }`}
            />
          );
        })}
      </div>
      
      {/* Progress text */}
      <span className="text-xs text-gray-400 font-mono">
        {completedCount}/12 ({progress.toFixed(0)}%)
      </span>
    </div>
  );
}

// Export mock data for testing
export const mockPipelineData: { stages: Record<StageId, StageStatus>; results: Record<StageId, StageResult> } = {
  stages: {
    discovery: 'complete',
    scraping: 'complete',
    title: 'complete',
    lien_priority: 'complete',
    tax_certs: 'complete',
    demographics: 'complete',
    ml_score: 'complete',
    max_bid: 'running',
    decision: 'pending',
    report: 'pending',
    disposition: 'pending',
    archive: 'pending'
  },
  results: {
    discovery: { summary: 'Found case 2024-CA-012345 on RealForeclose', duration: 4200 },
    scraping: { summary: 'Extracted: Final Judgment $312,450, Opening Bid $245,000', duration: 8500 },
    title: { summary: 'Found 3 liens: 1 mortgage, 1 HOA, 1 tax cert', duration: 12300 },
    lien_priority: { summary: 'No senior liens survive - safe to bid', duration: 2100 },
    tax_certs: { summary: 'Tax cert #2023-00456: $3,200 outstanding', duration: 3400 },
    demographics: { summary: 'Zip 32937: Median income $78K, vacancy 5.2%', duration: 1800 },
    ml_score: { summary: 'Third-party probability: 67%, Confidence: 87%', duration: 1200 },
    max_bid: { summary: 'Calculating...', duration: 0 },
    decision: {},
    report: {},
    disposition: {},
    archive: {}
  }
};

export default PipelineProgress;
