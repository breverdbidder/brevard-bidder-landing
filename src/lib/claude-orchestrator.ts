// lib/claude-orchestrator.ts
// BidDeed.AI Claude Sonnet 4 Integration Layer
// Implements the Everest Ascent™ 12-Stage Pipeline

import Anthropic from '@anthropic-ai/sdk';

// Types
export interface PipelineStage {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  startTime?: Date;
  endTime?: Date;
  result?: any;
  error?: string;
}

export interface Property {
  id: string;
  case_number: string;
  address: string;
  city: string;
  zip: string;
  parcel_id: string;
  latitude?: number;
  longitude?: number;
  auction_date: string;
  opening_bid?: number;
  final_judgment?: number;
  plaintiff: string;
  bcpao_data?: BCPAOData;
  liens: Lien[];
  ml_prediction?: MLPrediction;
  max_bid?: number;
  estimated_arv?: number;
  estimated_repairs?: number;
  roi_estimate?: number;
  bid_judgment_ratio?: number;
  status: 'pending' | 'analyzed' | 'bid' | 'won' | 'lost' | 'skipped';
}

export interface BCPAOData {
  account_number: string;
  property_type: string;
  year_built: number;
  living_sqft: number;
  lot_sqft: number;
  bedrooms: number;
  bathrooms: number;
  has_pool: boolean;
  just_value: number;
  photo_url?: string;
}

export interface Lien {
  id: string;
  type: 'mortgage' | 'hoa' | 'tax' | 'judgment' | 'mechanics' | 'other';
  holder: string;
  amount: number;
  recording_date: string;
  book_page?: string;
  priority: number;
  survives_foreclosure: boolean;
}

export interface MLPrediction {
  recommendation: 'BID' | 'REVIEW' | 'SKIP';
  confidence: number;
  third_party_probability: number;
  estimated_sale_price?: number;
  reasoning: string;
}

export interface AnalysisResult {
  property: Property;
  stages: Record<string, PipelineStage>;
  decision: 'BID' | 'REVIEW' | 'SKIP';
  reasoning: string;
  report_url?: string;
}

// Pipeline Stage Definitions
export const PIPELINE_STAGES = [
  { id: 'discovery', name: 'Discovery', icon: '🔍', description: 'Find case on RealForeclose' },
  { id: 'scraping', name: 'Scraping', icon: '📥', description: 'Extract case details' },
  { id: 'title', name: 'Title Search', icon: '📜', description: 'Query AcclaimWeb' },
  { id: 'lien_priority', name: 'Lien Priority', icon: '⚖️', description: 'Analyze lien structure' },
  { id: 'tax_certs', name: 'Tax Certs', icon: '💰', description: 'Check RealTDM' },
  { id: 'demographics', name: 'Demographics', icon: '👥', description: 'Census API analysis' },
  { id: 'ml_score', name: 'ML Score', icon: '🤖', description: 'Run XGBoost prediction' },
  { id: 'max_bid', name: 'Max Bid', icon: '🎯', description: 'Calculate optimal bid' },
  { id: 'decision', name: 'Decision', icon: '✅', description: 'BID/REVIEW/SKIP' },
  { id: 'report', name: 'Report', icon: '📄', description: 'Generate DOCX' },
  { id: 'disposition', name: 'Disposition', icon: '📊', description: 'Track outcome' },
  { id: 'archive', name: 'Archive', icon: '🗄️', description: 'Store to Supabase' },
] as const;

// Tool Definitions for Claude
const BIDDEED_TOOLS: Anthropic.Tool[] = [
  {
    name: "bcpao_search",
    description: "Search Brevard County Property Appraiser for property details including bedrooms, bathrooms, sqft, year built, just value, and photos",
    input_schema: {
      type: "object" as const,
      properties: {
        parcel_id: { 
          type: "string", 
          description: "The parcel ID or property address to search" 
        }
      },
      required: ["parcel_id"]
    }
  },
  {
    name: "acclaimweb_title",
    description: "Query AcclaimWeb Official Records for title records, mortgages, liens, and recorded documents",
    input_schema: {
      type: "object" as const,
      properties: {
        owner_name: { 
          type: "string",
          description: "Property owner name to search"
        },
        parcel_id: { 
          type: "string",
          description: "Parcel ID for property-specific search"
        }
      }
    }
  },
  {
    name: "realtdm_tax_certs",
    description: "Check RealTDM for tax certificates on the property",
    input_schema: {
      type: "object" as const,
      properties: {
        parcel_id: { 
          type: "string",
          description: "Parcel ID to check for tax certificates"
        }
      },
      required: ["parcel_id"]
    }
  },
  {
    name: "census_demographics",
    description: "Get demographic data from Census API for the property's zip code including median income, population, and vacancy rates",
    input_schema: {
      type: "object" as const,
      properties: {
        zip_code: { 
          type: "string",
          description: "5-digit zip code for demographic lookup"
        }
      },
      required: ["zip_code"]
    }
  },
  {
    name: "ml_predict",
    description: "Run the BidDeed.AI XGBoost ML model to predict third-party purchase probability and generate BID/REVIEW/SKIP recommendation",
    input_schema: {
      type: "object" as const,
      properties: {
        case_number: { type: "string", description: "Foreclosure case number" },
        final_judgment: { type: "number", description: "Final judgment amount" },
        opening_bid: { type: "number", description: "Opening bid amount" },
        plaintiff: { type: "string", description: "Plaintiff name (bank/servicer)" },
        property_type: { type: "string", description: "SFR, Condo, Townhouse, etc." },
        year_built: { type: "number", description: "Year property was built" },
        living_sqft: { type: "number", description: "Living area in square feet" },
        bedrooms: { type: "number", description: "Number of bedrooms" },
        bathrooms: { type: "number", description: "Number of bathrooms" },
        has_pool: { type: "boolean", description: "Whether property has a pool" },
        zip_code: { type: "string", description: "Property zip code" }
      },
      required: ["case_number", "final_judgment", "plaintiff"]
    }
  },
  {
    name: "calculate_max_bid",
    description: "Calculate maximum bid using the Everest Capital formula: (ARV × 70%) - Repairs - $10K - MIN($25K, 15% × ARV)",
    input_schema: {
      type: "object" as const,
      properties: {
        arv: { 
          type: "number", 
          description: "After Repair Value (estimated market value after repairs)" 
        },
        estimated_repairs: { 
          type: "number",
          description: "Estimated repair costs"
        }
      },
      required: ["arv", "estimated_repairs"]
    }
  },
  {
    name: "generate_report",
    description: "Generate a one-page DOCX property analysis report with BidDeed.AI branding",
    input_schema: {
      type: "object" as const,
      properties: {
        case_number: { type: "string" },
        property_data: { type: "object", description: "Full property analysis data" }
      },
      required: ["case_number", "property_data"]
    }
  },
  {
    name: "save_to_supabase",
    description: "Save the analysis results to Supabase auction_results table",
    input_schema: {
      type: "object" as const,
      properties: {
        analysis_data: { type: "object", description: "Complete analysis data to store" }
      },
      required: ["analysis_data"]
    }
  }
];

// Main Orchestrator Class
export class BidDeedClaudeOrchestrator {
  private client: Anthropic;
  private stages: Record<string, PipelineStage>;
  
  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
      maxRetries: 3,
      timeout: 120000 // 2 minutes for complex analyses
    });
    this.stages = {};
    this.initializeStages();
  }

  private initializeStages() {
    PIPELINE_STAGES.forEach(stage => {
      this.stages[stage.id] = {
        id: stage.id,
        name: stage.name,
        status: 'pending'
      };
    });
  }

  async analyzeProperty(
    caseNumber: string,
    onStageUpdate?: (stage: PipelineStage) => void,
    onMessage?: (content: string) => void
  ): Promise<AnalysisResult> {
    this.initializeStages();

    const systemPrompt = `You are the BidDeed.AI Claude Orchestrator, an expert foreclosure auction analyst for Everest Capital USA operating in Brevard County, Florida.

Your role is to execute the Everest Ascent™ 12-stage pipeline to analyze foreclosure properties and provide BID/REVIEW/SKIP recommendations.

Pipeline Stages:
1. Discovery - Find the case on RealForeclose
2. Scraping - Extract case details (plaintiff, final judgment, opening bid, defendant, address)
3. Title Search - Query AcclaimWeb for liens and encumbrances
4. Lien Priority - Analyze which liens survive foreclosure (critical for HOA foreclosures)
5. Tax Certificates - Check RealTDM for outstanding tax certs
6. Demographics - Get Census data for the zip code
7. ML Score - Run XGBoost model for third-party probability prediction
8. Max Bid - Calculate using formula: (ARV × 70%) - Repairs - $10K - MIN($25K, 15% × ARV)
9. Decision - Determine BID (ratio ≥75%), REVIEW (60-74%), or SKIP (<60%)
10. Report - Generate one-page DOCX analysis
11. Disposition - Track intended action
12. Archive - Save to Supabase

Decision Thresholds:
- BID: bid_judgment_ratio ≥ 75% AND max_bid > opening_bid AND no senior liens survive
- REVIEW: bid_judgment_ratio 60-74% OR needs manual verification
- SKIP: bid_judgment_ratio < 60% OR senior liens survive OR DO_NOT_BID condition

CRITICAL RULES:
- If plaintiff is an HOA, check if senior mortgage survives - if yes, mark DO_NOT_BID
- Never guess Final Judgment or Opening Bid - only use verified BECA V22 data
- Always explain reasoning for decisions
- Use actual recorded documents, never guesswork`;

    const userMessage = `Analyze foreclosure case ${caseNumber} through the complete Everest Ascent™ 12-stage pipeline.

Execute each stage in order, use the appropriate tools, and provide a final BID/REVIEW/SKIP recommendation with detailed reasoning.

After completing all stages, summarize:
1. Property details (address, bedrooms, bathrooms, sqft, year built)
2. Financial summary (final judgment, opening bid, max bid, ROI estimate)
3. Lien analysis (surviving liens, priority issues)
4. ML prediction (confidence, third-party probability)
5. Final decision with reasoning`;

    try {
      const response = await this.client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8096,
        system: systemPrompt,
        tools: BIDDEED_TOOLS,
        messages: [{ role: "user", content: userMessage }]
      });

      // Process response and extract results
      let analysisText = '';
      let property: Partial<Property> = {
        case_number: caseNumber,
        status: 'analyzed',
        liens: []
      };

      for (const block of response.content) {
        if (block.type === 'text') {
          analysisText += block.text;
          onMessage?.(block.text);
        } else if (block.type === 'tool_use') {
          // Update stage status based on tool call
          const stageId = this.mapToolToStage(block.name);
          if (stageId) {
            this.stages[stageId] = {
              ...this.stages[stageId],
              status: 'running',
              startTime: new Date()
            };
            onStageUpdate?.(this.stages[stageId]);
          }
        }
      }

      // Parse decision from response
      const decision = this.extractDecision(analysisText);

      return {
        property: property as Property,
        stages: this.stages,
        decision: decision.recommendation,
        reasoning: decision.reasoning
      };

    } catch (error) {
      console.error('Claude Orchestrator Error:', error);
      throw error;
    }
  }

  // Stream-based analysis for real-time updates
  async *analyzePropertyStream(
    caseNumber: string
  ): AsyncGenerator<{ type: string; data: any }> {
    this.initializeStages();

    const systemPrompt = `You are the BidDeed.AI Claude Orchestrator for Everest Capital USA.
Execute the Everest Ascent™ 12-stage pipeline for foreclosure analysis.`;

    const stream = await this.client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8096,
      system: systemPrompt,
      tools: BIDDEED_TOOLS,
      messages: [{
        role: "user",
        content: `Analyze foreclosure case ${caseNumber} through the 12-stage pipeline.`
      }]
    });

    for await (const event of stream) {
      if (event.type === 'content_block_start') {
        if (event.content_block.type === 'tool_use') {
          const stageId = this.mapToolToStage(event.content_block.name);
          if (stageId) {
            this.stages[stageId].status = 'running';
            yield { type: 'stage_update', data: this.stages[stageId] };
          }
        }
      } else if (event.type === 'content_block_delta') {
        if (event.delta.type === 'text_delta') {
          yield { type: 'text', data: event.delta.text };
        }
      } else if (event.type === 'message_stop') {
        yield { type: 'complete', data: this.stages };
      }
    }
  }

  private mapToolToStage(toolName: string): string | null {
    const mapping: Record<string, string> = {
      'bcpao_search': 'scraping',
      'acclaimweb_title': 'title',
      'realtdm_tax_certs': 'tax_certs',
      'census_demographics': 'demographics',
      'ml_predict': 'ml_score',
      'calculate_max_bid': 'max_bid',
      'generate_report': 'report',
      'save_to_supabase': 'archive'
    };
    return mapping[toolName] || null;
  }

  private extractDecision(text: string): { recommendation: 'BID' | 'REVIEW' | 'SKIP'; reasoning: string } {
    // Simple extraction - in production, use structured output
    if (text.includes('BID') && text.includes('recommend')) {
      return { recommendation: 'BID', reasoning: text };
    } else if (text.includes('REVIEW')) {
      return { recommendation: 'REVIEW', reasoning: text };
    }
    return { recommendation: 'SKIP', reasoning: text };
  }

  // Calculate max bid using Everest Capital formula
  calculateMaxBid(arv: number, repairs: number): number {
    const wholesaleDiscount = arv * 0.70; // 70% of ARV
    const fixedBuffer = 10000; // $10K fixed buffer
    const variableBuffer = Math.min(25000, arv * 0.15); // MIN($25K, 15% of ARV)
    
    return wholesaleDiscount - repairs - fixedBuffer - variableBuffer;
  }

  // Get current pipeline status
  getStages(): Record<string, PipelineStage> {
    return { ...this.stages };
  }
}

// Export singleton instance
export const claudeOrchestrator = new BidDeedClaudeOrchestrator();
