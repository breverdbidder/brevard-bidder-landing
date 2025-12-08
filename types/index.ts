// BrevardBidderAI - TypeScript Type Definitions
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

// ============================================================
// CORE TYPES
// ============================================================

export type Recommendation = 'BID' | 'REVIEW' | 'SKIP';

export type PropertyType = 'SFR' | 'CONDO' | 'TOWNHOUSE' | 'MULTI' | 'LAND' | 'COMMERCIAL';

export type AuctionStatus = 'SCHEDULED' | 'ACTIVE' | 'SOLD' | 'CANCELLED' | 'POSTPONED';

// ============================================================
// PROPERTY / AUCTION TYPES
// ============================================================

export interface Property {
  id: string;
  case_number: string;
  property_address: string;
  city: string;
  zip_code: string;
  property_type: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  year_built?: number;
  lot_size?: number;
  photo_url?: string;
  bcpao_account?: string;
}

export interface Auction {
  id: string;
  case_number: string;
  property_address: string;
  auction_date: string;
  auction_status: AuctionStatus;
  
  // Financial
  judgment_amount: number;
  opening_bid: number;
  max_bid?: number;
  final_bid?: number;
  
  // Analysis
  recommendation: Recommendation;
  bid_judgment_ratio: number;
  ml_probability: number;
  arv?: number;
  repair_estimate?: number;
  
  // Parties
  plaintiff: string;
  defendant: string;
  plaintiff_attorney?: string;
  
  // Metadata
  photo_url?: string;
  property_type?: PropertyType;
  created_at: string;
  updated_at: string;
}

export interface AuctionResult extends Auction {
  sold_to: 'PLAINTIFF' | 'THIRD_PARTY' | 'CANCELLED';
  sale_price?: number;
  winning_bidder?: string;
}

// ============================================================
// ML MODEL TYPES
// ============================================================

export interface MLPrediction {
  case_number: string;
  probability: number;
  confidence: number;
  features: MLFeatures;
  prediction_date: string;
}

export interface MLFeatures {
  bid_judgment_ratio: number;
  plaintiff_win_rate: number;
  property_type_encoded: number;
  zip_code_encoded: number;
  judgment_amount_log: number;
  days_since_filing: number;
}

export interface MLModelStats {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  total_predictions: number;
  last_trained: string;
}

// ============================================================
// SMART ROUTER TYPES
// ============================================================

export type RouterTier = 'FREE' | 'ULTRA_CHEAP' | 'BUDGET' | 'PRODUCTION' | 'CRITICAL';

export interface RouterConfig {
  tier: RouterTier;
  model: string;
  max_tokens: number;
  temperature: number;
  cost_per_1m_input: number;
  cost_per_1m_output: number;
}

export interface RouterStats {
  tier: RouterTier;
  percentage: number;
  requests: number;
  cost: number;
}

// ============================================================
// DASHBOARD / METRICS TYPES
// ============================================================

export interface DashboardStats {
  total_properties: number;
  bid_count: number;
  review_count: number;
  skip_count: number;
  total_judgment: number;
  avg_bid_ratio: number;
  ml_accuracy: number;
}

export interface DailyMetrics {
  date: string;
  auctions_analyzed: number;
  bid_recommendations: number;
  review_recommendations: number;
  skip_recommendations: number;
  total_judgment_value: number;
  router_free_pct: number;
  router_cost: number;
}

export interface InsightEntry {
  id: string;
  category: string;
  content: string;
  source?: string;
  confidence?: number;
  created_at: string;
}

// ============================================================
// COMPONENT PROPS TYPES
// ============================================================

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'bid' | 'review' | 'skip';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export interface PropertyCardProps {
  address: string;
  caseNumber: string;
  judgment: number;
  openingBid: number;
  recommendation: Recommendation;
  mlProbability?: number;
  photo?: string;
  onClick?: () => void;
}

export interface SearchFilterProps {
  data: Auction[];
  onFilter: (filtered: Auction[]) => void;
  searchFields?: string[];
  placeholder?: string;
}

export interface PropertyModalProps {
  property: Auction | null;
  isOpen: boolean;
  onClose: () => void;
}

export interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onClose: () => void;
  duration?: number;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface AuctionsResponse {
  auctions: Auction[];
  total: number;
  page: number;
  per_page: number;
}

export interface AnalyzeResponse {
  stats: DashboardStats;
  router_stats: RouterStats[];
  ml_stats: MLModelStats;
  recent_insights: InsightEntry[];
}

// ============================================================
// FORM TYPES
// ============================================================

export interface FilterState {
  recommendation: 'all' | Recommendation;
  minJudgment: string;
  maxJudgment: string;
  sortBy: 'judgment_desc' | 'judgment_asc' | 'address' | 'probability';
}

export interface SearchState {
  query: string;
  filters: FilterState;
  results: Auction[];
}

// ============================================================
// UTILITY TYPES
// ============================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type Nullable<T> = T | null;

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};
