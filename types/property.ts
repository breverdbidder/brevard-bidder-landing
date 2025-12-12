// BidDeed.AI Property Types
// Version: 1.0.0 | December 2025

export interface Property {
  id: string;
  case_number: string;
  address: string;
  city: string;
  zip: string;
  parcel_id?: string;
  latitude?: number;
  longitude?: number;
  
  // Auction Data
  auction_date: string;
  opening_bid?: number;
  final_judgment?: number;
  plaintiff?: string;
  
  // BCPAO Data
  bcpao_data?: {
    account_number?: string;
    property_type?: string;
    year_built?: number;
    living_sqft?: number;
    lot_sqft?: number;
    bedrooms?: number;
    bathrooms?: number;
    has_pool?: boolean;
    just_value?: number;
    photo_url?: string;
  };
  
  // Lien Data
  liens?: Lien[];
  
  // ML Prediction
  ml_prediction?: {
    recommendation: 'BID' | 'REVIEW' | 'SKIP';
    confidence: number;
    third_party_probability?: number;
    estimated_sale_price?: number;
    reasoning?: string;
  };
  
  // Calculated Fields
  max_bid?: number;
  estimated_arv?: number;
  estimated_repairs?: number;
  roi_estimate?: number;
  bid_judgment_ratio?: number;
  
  // Metadata
  created_at: string;
  updated_at: string;
  status: 'pending' | 'analyzed' | 'bid' | 'won' | 'lost' | 'skipped';
}

export interface Lien {
  id: string;
  document_type: string;
  recorded_date: string;
  amount?: number;
  creditor?: string;
  priority: number;
  status: 'active' | 'released' | 'foreclosed';
  survives_sale: boolean;
}

export interface FilterState {
  recommendation: ('BID' | 'REVIEW' | 'SKIP')[];
  minPrice: number;
  maxPrice: number;
  cities: string[];
  hasPool: boolean | null;
  hasPhoto: boolean | null;
  sortBy: 'roi' | 'price' | 'address' | 'date' | 'confidence';
  sortOrder: 'asc' | 'desc';
}

export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}

export interface AuctionStats {
  total: number;
  bid: number;
  review: number;
  skip: number;
  pending: number;
  totalJudgment: number;
  averageRoi: number;
}

export interface PipelineStage {
  id: string;
  name: string;
  status: 'queued' | 'running' | 'complete' | 'failed' | 'skipped';
  startTime?: string;
  endTime?: string;
  result?: any;
  error?: string;
}

export interface PipelineState {
  propertyId: string;
  stages: PipelineStage[];
  currentStage: string;
  startTime: string;
  endTime?: string;
  status: 'running' | 'complete' | 'failed';
}

// 12-Stage Pipeline Definition
export const PIPELINE_STAGES = [
  { id: 'discovery', name: 'Discovery', icon: 'Search' },
  { id: 'scraping', name: 'Scraping', icon: 'Download' },
  { id: 'title', name: 'Title Search', icon: 'FileText' },
  { id: 'lien_priority', name: 'Lien Priority', icon: 'Layers' },
  { id: 'tax_certs', name: 'Tax Certificates', icon: 'Receipt' },
  { id: 'demographics', name: 'Demographics', icon: 'Users' },
  { id: 'ml_score', name: 'ML Score', icon: 'Brain' },
  { id: 'max_bid', name: 'Max Bid', icon: 'Calculator' },
  { id: 'decision', name: 'Decision Log', icon: 'CheckCircle' },
  { id: 'report', name: 'Report', icon: 'FileOutput' },
  { id: 'disposition', name: 'Disposition', icon: 'Target' },
  { id: 'archive', name: 'Archive', icon: 'Archive' },
] as const;

export type PipelineStageId = typeof PIPELINE_STAGES[number]['id'];
