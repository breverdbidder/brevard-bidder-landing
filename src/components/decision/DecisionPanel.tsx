// components/decision/DecisionPanel.tsx
// AI Decision Display with Explainable Reasoning
// Shows BID/REVIEW/SKIP with confidence and factor breakdown

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ThumbsUp, 
  AlertTriangle, 
  ThumbsDown, 
  Brain,
  ChevronDown,
  TrendingUp,
  DollarSign,
  Shield,
  Scale
} from 'lucide-react';

// Types
export interface DecisionReasoning {
  pros: string[];
  cons: string[];
  risks: string[];
  mlFactors: MLFactor[];
}

export interface MLFactor {
  factor: string;
  weight: number;
  value: string | number;
  impact: 'positive' | 'negative' | 'neutral';
}

interface DecisionPanelProps {
  decision: 'BID' | 'REVIEW' | 'SKIP';
  confidence: number;
  maxBid?: number;
  roiEstimate?: number;
  bidJudgmentRatio?: number;
  reasoning: DecisionReasoning;
  caseNumber?: string;
}

// Decision configuration
const DECISION_CONFIG = {
  BID: {
    icon: ThumbsUp,
    color: 'text-bb-bid',
    bgColor: 'bg-bb-bid/20',
    borderColor: 'border-bb-bid',
    gradientFrom: 'from-green-500',
    gradientTo: 'to-emerald-600',
    label: 'RECOMMENDED BID',
    description: 'Property meets investment criteria'
  },
  REVIEW: {
    icon: AlertTriangle,
    color: 'text-bb-review',
    bgColor: 'bg-bb-review/20',
    borderColor: 'border-bb-review',
    gradientFrom: 'from-yellow-500',
    gradientTo: 'to-amber-600',
    label: 'MANUAL REVIEW REQUIRED',
    description: 'Additional analysis recommended'
  },
  SKIP: {
    icon: ThumbsDown,
    color: 'text-bb-skip',
    bgColor: 'bg-bb-skip/20',
    borderColor: 'border-bb-skip',
    gradientFrom: 'from-red-500',
    gradientTo: 'to-rose-600',
    label: 'DO NOT BID',
    description: 'Property does not meet criteria'
  }
};

export function DecisionPanel({
  decision,
  confidence,
  maxBid,
  roiEstimate,
  bidJudgmentRatio,
  reasoning,
  caseNumber
}: DecisionPanelProps) {
  const config = DECISION_CONFIG[decision];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border-2 ${config.borderColor} ${config.bgColor} overflow-hidden`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{config.label}</h3>
              <p className="text-sm text-white/80">{config.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">
              {(confidence * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-white/70">ML Confidence</p>
          </div>
        </div>
      </div>

      {/* Financial Summary (for BID decisions) */}
      {decision === 'BID' && (
        <div className="grid grid-cols-3 gap-4 p-4 bg-bb-dark/50">
          <FinancialMetric
            icon={DollarSign}
            label="Maximum Bid"
            value={maxBid ? `$${maxBid.toLocaleString()}` : 'N/A'}
            color="text-bb-primary"
          />
          <FinancialMetric
            icon={TrendingUp}
            label="Expected ROI"
            value={roiEstimate ? `${roiEstimate}%` : 'N/A'}
            color="text-bb-bid"
          />
          <FinancialMetric
            icon={Scale}
            label="Bid/Judgment"
            value={bidJudgmentRatio ? `${(bidJudgmentRatio * 100).toFixed(0)}%` : 'N/A'}
            color="text-bb-secondary"
          />
        </div>
      )}

      {/* Reasoning Sections */}
      <div className="p-4 space-y-3">
        {/* Positive Factors */}
        <AccordionSection
          icon={ThumbsUp}
          iconColor="text-green-500"
          title="Positive Factors"
          count={reasoning.pros.length}
          defaultOpen={decision === 'BID'}
        >
          <ul className="space-y-2">
            {reasoning.pros.map((pro, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-2 text-sm text-gray-300"
              >
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>{pro}</span>
              </motion.li>
            ))}
          </ul>
        </AccordionSection>

        {/* Negative Factors */}
        <AccordionSection
          icon={ThumbsDown}
          iconColor="text-red-500"
          title="Negative Factors"
          count={reasoning.cons.length}
          defaultOpen={decision === 'SKIP'}
        >
          <ul className="space-y-2">
            {reasoning.cons.map((con, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-2 text-sm text-gray-300"
              >
                <span className="text-red-500 mt-0.5 flex-shrink-0">✗</span>
                <span>{con}</span>
              </motion.li>
            ))}
          </ul>
        </AccordionSection>

        {/* Risk Factors */}
        <AccordionSection
          icon={Shield}
          iconColor="text-yellow-500"
          title="Risk Factors"
          count={reasoning.risks.length}
          defaultOpen={decision === 'REVIEW'}
        >
          <ul className="space-y-2">
            {reasoning.risks.map((risk, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-2 text-sm text-gray-300"
              >
                <span className="text-yellow-500 mt-0.5 flex-shrink-0">⚠</span>
                <span>{risk}</span>
              </motion.li>
            ))}
          </ul>
        </AccordionSection>

        {/* ML Model Factors */}
        <AccordionSection
          icon={Brain}
          iconColor="text-bb-primary"
          title="ML Model Factors"
          count={reasoning.mlFactors.length}
        >
          <div className="space-y-4">
            {reasoning.mlFactors.map((factor, i) => (
              <MLFactorBar key={i} factor={factor} index={i} />
            ))}
          </div>
        </AccordionSection>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-bb-dark/30 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>BidDeed.AI Decision Engine v13.4</span>
          {caseNumber && <span>Case: {caseNumber}</span>}
        </div>
      </div>
    </div>
  );
}

// Sub-components

function FinancialMetric({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string; 
  color: string;
}) {
  return (
    <div className="bg-bb-dark rounded-lg p-3 text-center">
      <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${color} font-mono`}>{value}</p>
    </div>
  );
}

function AccordionSection({
  icon: Icon,
  iconColor,
  title,
  count,
  defaultOpen = false,
  children
}: {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  count: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-bb-dark rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${iconColor}`} />
          <span className="font-medium text-white">{title}</span>
          <span className="text-xs text-gray-500">({count})</span>
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MLFactorBar({ factor, index }: { factor: MLFactor; index: number }) {
  const impactColors = {
    positive: 'from-green-500 to-emerald-600',
    negative: 'from-red-500 to-rose-600',
    neutral: 'from-gray-500 to-gray-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="space-y-1"
    >
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">{factor.factor}</span>
        <span className="text-gray-400 font-mono">{factor.value}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${impactColors[factor.impact]}`}
          initial={{ width: 0 }}
          animate={{ width: `${factor.weight * 100}%` }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        />
      </div>
      <p className="text-xs text-gray-500">
        Weight: {(factor.weight * 100).toFixed(1)}% • Impact: {factor.impact}
      </p>
    </motion.div>
  );
}

// Example usage with mock data
export const mockDecisionData: DecisionPanelProps = {
  decision: 'BID',
  confidence: 0.87,
  maxBid: 245000,
  roiEstimate: 23,
  bidJudgmentRatio: 0.78,
  caseNumber: '2024-CA-012345',
  reasoning: {
    pros: [
      'Strong bid/judgment ratio at 78%',
      'Property in high-demand zip code (32937)',
      'Recent comparable sales support ARV estimate',
      'No senior liens detected that survive foreclosure',
      'Property has pool - adds 10-15% value'
    ],
    cons: [
      'Built in 1985 - may need roof/HVAC updates',
      'HOA has history of special assessments'
    ],
    risks: [
      'Unknown interior condition - budget conservatively',
      'Market cooling trend in Melbourne area',
      'Tax certificate #2023-00456 outstanding ($3,200)'
    ],
    mlFactors: [
      { factor: 'Plaintiff Bank', weight: 0.22, value: 'Chase Home Finance', impact: 'positive' },
      { factor: 'Property Type', weight: 0.18, value: 'SFR', impact: 'positive' },
      { factor: 'Days on Market', weight: 0.15, value: '45 days', impact: 'neutral' },
      { factor: 'Zip Code Score', weight: 0.14, value: '8.2/10', impact: 'positive' },
      { factor: 'Bid Competition', weight: 0.12, value: 'Medium', impact: 'neutral' },
      { factor: 'Judgment Amount', weight: 0.10, value: '$312,450', impact: 'negative' },
      { factor: 'Property Age', weight: 0.09, value: '39 years', impact: 'negative' }
    ]
  }
};

export default DecisionPanel;
