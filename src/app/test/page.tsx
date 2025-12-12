'use client';

/**
 * BidDeed.AI Component Test Page
 * Tests DecisionPanel and PipelineProgress with mock data
 */

import React, { useState } from 'react';
import { DecisionPanel, mockDecisionData, type DecisionType } from '@/components/decision/DecisionPanel';
import { PipelineProgress, mockPipelineData } from '@/components/pipeline/PipelineProgress';

// Additional test scenarios
const testDecisions = {
  bid: {
    decision: 'BID' as DecisionType,
    confidence: 0.87,
    maxBid: 245000,
    roiEstimate: 23,
    bidJudgmentRatio: 0.78,
    caseNumber: '2024-CA-012345',
    reasoning: {
      pros: [
        'Strong plaintiff (WELLS FARGO BANK) - 78% historical third-party rate',
        'Desirable location: 32937 Satellite Beach (median income $82K)',
        'Single-family residential - highest demand category',
        'Low tax certificate balance ($1,847.23)',
        'Clear title - no junior liens found'
      ],
      cons: [
        'Estimated repairs $35,000 (roof, HVAC)',
        'Pool maintenance liability'
      ],
      risks: [
        'Hurricane season approaching (June-November)',
        'Market showing 2% softening trend'
      ],
      mlFactors: [
        { factor: 'Plaintiff Score', weight: 0.85, value: 'WELLS FARGO BANK', impact: 'positive' as const },
        { factor: 'Property Type', weight: 0.72, value: 'Single Family', impact: 'positive' as const },
        { factor: 'Zip Code Score', weight: 0.68, value: '32937', impact: 'positive' as const },
        { factor: 'Judgment Amount', weight: 0.45, value: '$312,450', impact: 'neutral' as const },
        { factor: 'Days on Market', weight: 0.38, value: '142 days', impact: 'negative' as const }
      ]
    }
  },
  review: {
    decision: 'REVIEW' as DecisionType,
    confidence: 0.62,
    maxBid: 178000,
    roiEstimate: 15,
    bidJudgmentRatio: 0.68,
    caseNumber: '2024-CA-023456',
    reasoning: {
      pros: [
        'Good location: 32940 Viera corridor',
        'Newer construction (2018)',
        'HOA community with amenities'
      ],
      cons: [
        'HOA foreclosure - senior mortgage survives',
        'Unknown plaintiff track record',
        'Higher judgment amount relative to value'
      ],
      risks: [
        'CRITICAL: Verify senior mortgage payoff amount',
        'HOA special assessment pending ($8,500)',
        'Community has litigation with builder'
      ],
      mlFactors: [
        { factor: 'Plaintiff Score', weight: 0.32, value: 'UNKNOWN HOA', impact: 'negative' as const },
        { factor: 'Property Type', weight: 0.72, value: 'Townhouse', impact: 'neutral' as const },
        { factor: 'Zip Code Score', weight: 0.65, value: '32940', impact: 'positive' as const },
        { factor: 'Senior Lien Risk', weight: 0.95, value: 'MORTGAGE SURVIVES', impact: 'negative' as const }
      ]
    }
  },
  skip: {
    decision: 'SKIP' as DecisionType,
    confidence: 0.91,
    maxBid: 0,
    roiEstimate: -15,
    bidJudgmentRatio: 0.45,
    caseNumber: '2024-CA-034567',
    reasoning: {
      pros: [
        'Large lot (0.5 acres)'
      ],
      cons: [
        'Manufactured home - limited financing options',
        'Flood zone AE - mandatory insurance',
        'Multiple junior liens totaling $45,000',
        'Property in severe disrepair',
        'Remote location - low demand'
      ],
      risks: [
        'Environmental contamination suspected',
        'Unpermitted additions',
        'Title issues with easements'
      ],
      mlFactors: [
        { factor: 'Plaintiff Score', weight: 0.22, value: 'PRIVATE LENDER', impact: 'negative' as const },
        { factor: 'Property Type', weight: 0.15, value: 'Manufactured', impact: 'negative' as const },
        { factor: 'Flood Risk', weight: 0.92, value: 'Zone AE', impact: 'negative' as const },
        { factor: 'Junior Liens', weight: 0.88, value: '$45,000', impact: 'negative' as const }
      ]
    }
  }
};

// Pipeline test scenarios
const pipelineScenarios = {
  completed: {
    ...mockPipelineData,
    stages: mockPipelineData.stages.map(s => ({ ...s, status: 'complete' as const, duration: s.estimatedDuration }))
  },
  running: mockPipelineData,
  error: {
    stages: mockPipelineData.stages.map((s, i) => ({
      ...s,
      status: i < 3 ? 'complete' as const : i === 3 ? 'error' as const : 'pending' as const,
      duration: i < 3 ? s.estimatedDuration : undefined
    })),
    results: {
      ...mockPipelineData.results,
      'lien-priority': { error: 'AcclaimWeb connection timeout after 30s', timestamp: new Date().toISOString() }
    }
  }
};

export default function ComponentTestPage() {
  const [selectedDecision, setSelectedDecision] = useState<'bid' | 'review' | 'skip'>('bid');
  const [selectedPipeline, setSelectedPipeline] = useState<'completed' | 'running' | 'error'>('running');
  const [compactMode, setCompactMode] = useState(false);

  const handleStageClick = (stageId: string) => {
    console.log('Stage clicked:', stageId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
          BidDeed.AI Component Test Suite
        </h1>
        <p className="text-slate-400 mt-2">Enterprise UI/UX Component Testing</p>
      </header>

      {/* DecisionPanel Tests */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-200">DecisionPanel Component</h2>
          <div className="flex gap-2">
            {(['bid', 'review', 'skip'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedDecision(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedDecision === type
                    ? type === 'bid' ? 'bg-green-600 text-white' 
                      : type === 'review' ? 'bg-yellow-600 text-white'
                      : 'bg-red-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <DecisionPanel {...testDecisions[selectedDecision]} />
        </div>

        {/* Usage Code */}
        <details className="mt-4">
          <summary className="cursor-pointer text-slate-400 hover:text-slate-200">
            View Usage Code
          </summary>
          <pre className="mt-2 p-4 bg-slate-900 rounded-lg overflow-x-auto text-sm text-slate-300">
{`import { DecisionPanel } from '@/components/decision/DecisionPanel';

<DecisionPanel
  decision="${testDecisions[selectedDecision].decision}"
  confidence={${testDecisions[selectedDecision].confidence}}
  maxBid={${testDecisions[selectedDecision].maxBid}}
  roiEstimate={${testDecisions[selectedDecision].roiEstimate}}
  bidJudgmentRatio={${testDecisions[selectedDecision].bidJudgmentRatio}}
  caseNumber="${testDecisions[selectedDecision].caseNumber}"
  reasoning={{
    pros: [...],
    cons: [...],
    risks: [...],
    mlFactors: [...]
  }}
/>`}
          </pre>
        </details>
      </section>

      {/* PipelineProgress Tests */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-200">PipelineProgress Component</h2>
          <div className="flex gap-2 items-center">
            <label className="flex items-center gap-2 text-slate-400 text-sm">
              <input
                type="checkbox"
                checked={compactMode}
                onChange={(e) => setCompactMode(e.target.checked)}
                className="rounded"
              />
              Compact Mode
            </label>
            <div className="w-px h-6 bg-slate-700 mx-2" />
            {(['running', 'completed', 'error'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedPipeline(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPipeline === type
                    ? type === 'completed' ? 'bg-green-600 text-white'
                      : type === 'running' ? 'bg-blue-600 text-white'
                      : 'bg-red-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <PipelineProgress
            stages={pipelineScenarios[selectedPipeline].stages}
            results={pipelineScenarios[selectedPipeline].results}
            compact={compactMode}
            onStageClick={handleStageClick}
          />
        </div>

        {/* Usage Code */}
        <details className="mt-4">
          <summary className="cursor-pointer text-slate-400 hover:text-slate-200">
            View Usage Code
          </summary>
          <pre className="mt-2 p-4 bg-slate-900 rounded-lg overflow-x-auto text-sm text-slate-300">
{`import { PipelineProgress } from '@/components/pipeline/PipelineProgress';

<PipelineProgress
  stages={[
    { id: 'discovery', name: 'Discovery', status: 'complete', duration: 5 },
    { id: 'scraping', name: 'Scraping', status: 'running', progress: 45 },
    // ... 12 stages total
  ]}
  results={{
    discovery: { caseNumber: '2024-CA-012345', ... },
    scraping: { judgment: 312450, plaintiff: 'WELLS FARGO BANK', ... }
  }}
  compact={${compactMode}}
  onStageClick={(stageId) => console.log('Clicked:', stageId)}
/>`}
          </pre>
        </details>
      </section>

      {/* Integration Example */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Full Integration Example</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pipeline on left */}
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <h3 className="text-sm font-medium text-slate-400 mb-3">The Everest Ascent™ Pipeline</h3>
            <PipelineProgress
              stages={pipelineScenarios.completed.stages}
              results={mockPipelineData.results}
              compact={true}
              onStageClick={handleStageClick}
            />
          </div>

          {/* Decision on right */}
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <h3 className="text-sm font-medium text-slate-400 mb-3">ML Decision Output</h3>
            <DecisionPanel
              {...testDecisions.bid}
              initialExpanded={false}
            />
          </div>
        </div>
      </section>

      {/* Install Instructions */}
      <section className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Installation</h2>
        <pre className="p-4 bg-slate-950 rounded-lg overflow-x-auto text-sm text-slate-300">
{`# Install dependencies
npm install @anthropic-ai/sdk @assistant-ui/react @supabase/supabase-js
npm install zustand @tanstack/react-query framer-motion lucide-react recharts
npm install react-resizable-panels clsx tailwind-merge class-variance-authority

# Environment variables (.env.local)
ANTHROPIC_API_KEY=your-api-key
NEXT_PUBLIC_SUPABASE_URL=https://mocerqjnksmhcjzxrewo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`}
        </pre>
      </section>

      {/* Footer */}
      <footer className="mt-12 text-center text-slate-500 text-sm">
        <p>BidDeed.AI v1.0.0 | Enterprise Foreclosure Auction Intelligence</p>
        <p className="mt-1">Powered by The Everest Ascent™ Methodology</p>
      </footer>
    </div>
  );
}
