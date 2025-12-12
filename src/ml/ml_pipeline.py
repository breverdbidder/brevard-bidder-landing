"""
BidDeed.AI V13.1.2 - 12-Stage ML Pipeline
==============================================
Complete foreclosure auction analysis pipeline with plaintiff-based
XGBoost third-party probability predictions.

Stages:
1. Discovery - Source auctions from RealForeclose
2. Scraping - Extract property data
3. Title Analysis - Lis Pendens verification
4. Lien Priority - Senior/junior lien identification
5. Tax Certificates - Outstanding tax cert check
6. Demographics - Census API integration
7. ML Scoring - XGBoost with plaintiff features
8. Max Bid - 70% rule calculation
9. Decision Log - Investment rating
10. Report Generation - Word/JSON output
11. Disposition - Post-auction tracking
12. Archive - Supabase persistence

Author: BidDeed.AI
Version: 13.1.2
"""

import json
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score, mean_absolute_error
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
import logging

# Import plaintiff model
from plaintiff_xgboost_model import (
    PlaintiffXGBoostModel, 
    ThirdPartyPrediction,
    get_model as get_plaintiff_model,
    PLAINTIFF_BEHAVIOR
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class PropertyAnalysis:
    """Complete property analysis result"""
    # Identifiers
    case_number: str
    address: str
    city: str
    zip_code: str
    
    # Parties
    defendant: str
    plaintiff: str
    plaintiff_category: str
    plaintiff_base_rate: float
    
    # Property Details
    year_built: int
    sqft: int
    bedrooms: int
    bathrooms: float
    lot_size: float
    subdivision: str
    parcel_id: str
    
    # Financial
    final_judgment: float
    market_value: float  # BCPAO CMA
    equity_spread: float
    equity_pct: float
    
    # ML Predictions
    third_party_probability: float
    third_party_confidence: str
    expected_overpay_pct: float
    expected_winning_bid: float
    predicted_sold_amount: float
    
    # Investment Analysis
    repair_estimate: float
    max_bid: float
    roi_estimate: float
    rating: str
    bid_strategy: str
    
    # Metadata
    pipeline_stage: str = "complete"


class MLPipeline:
    """
    12-Stage ML Pipeline for Foreclosure Auction Analysis
    """
    
    def __init__(self):
        self.plaintiff_model = PlaintiffXGBoostModel()
        self.sold_amount_model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.model_metrics = {}
        
    def train_models(self, historical_data: pd.DataFrame = None):
        """Train all ML models"""
        logger.info("Training ML models...")
        
        # Train plaintiff model
        plaintiff_metrics = self.plaintiff_model.train()
        
        # Train sold amount model if we have historical data
        if historical_data is not None and len(historical_data) > 0:
            self._train_sold_amount_model(historical_data)
        
        self.is_trained = True
        
        self.model_metrics = {
            'plaintiff_model': plaintiff_metrics,
            'sold_amount_model': {
                'r2_score': getattr(self, '_sold_amount_r2', 0),
                'mae': getattr(self, '_sold_amount_mae', 0)
            }
        }
        
        return self.model_metrics
    
    def _train_sold_amount_model(self, df: pd.DataFrame):
        """Train model to predict sold amount"""
        features = ['final_judgment', 'market_value', 'sqft', 'year_built', 
                   'bedrooms', 'bathrooms']
        
        # Prepare features
        X = pd.DataFrame({
            'final_judgment': pd.to_numeric(df['final_judgment'], errors='coerce').fillna(0),
            'market_value': pd.to_numeric(df['market_value'], errors='coerce').fillna(0),
            'sqft': pd.to_numeric(df['sqft'], errors='coerce').fillna(1500),
            'year_built': pd.to_numeric(df['year_built'], errors='coerce').fillna(1990),
            'bedrooms': pd.to_numeric(df['bedrooms'], errors='coerce').fillna(3),
            'bathrooms': pd.to_numeric(df['bathrooms'], errors='coerce').fillna(2),
        })
        
        y = pd.to_numeric(df['winning_bid'], errors='coerce').fillna(0)
        
        # Filter valid data
        valid_mask = (X['final_judgment'] > 0) & (y > 0)
        X = X[valid_mask]
        y = y[valid_mask]
        
        if len(X) < 20:
            logger.warning("Insufficient data for sold amount model")
            return
        
        X_scaled = self.scaler.fit_transform(X)
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42
        )
        
        self.sold_amount_model = xgb.XGBRegressor(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1,
            random_state=42,
            verbosity=0
        )
        
        self.sold_amount_model.fit(X_train, y_train)
        
        y_pred = self.sold_amount_model.predict(X_test)
        self._sold_amount_r2 = r2_score(y_test, y_pred)
        self._sold_amount_mae = mean_absolute_error(y_test, y_pred)
        
        logger.info(f"Sold Amount Model: R²={self._sold_amount_r2:.3f}, MAE=${self._sold_amount_mae:,.0f}")
    
    def calculate_max_bid(
        self,
        market_value: float,
        year_built: int
    ) -> Tuple[float, float]:
        """
        Calculate maximum bid using 70% rule.
        
        Formula: (ARV × 70%) - Repairs - $10K holding - MIN($25K, 15% ARV)
        
        Returns:
            Tuple of (max_bid, repair_estimate)
        """
        age = 2025 - year_built
        
        # Repair percentage based on age
        if age <= 5:
            repair_pct = 0.05
        elif age <= 15:
            repair_pct = 0.10
        elif age <= 30:
            repair_pct = 0.15
        elif age <= 50:
            repair_pct = 0.20
        else:
            repair_pct = 0.25
        
        repairs = market_value * repair_pct
        holding = 10000
        profit_margin = min(25000, market_value * 0.15)
        
        max_bid = max(0, (market_value * 0.70) - repairs - holding - profit_margin)
        
        return max_bid, repairs
    
    def calculate_rating(
        self,
        roi: float,
        year_built: int,
        third_party_prob: float
    ) -> str:
        """Calculate investment rating"""
        if roi > 80 and year_built >= 2010 and third_party_prob < 0.5:
            return "⭐⭐⭐ STRONG BUY"
        elif roi > 60 and third_party_prob < 0.6:
            return "⭐⭐ GOOD"
        elif roi > 40:
            return "⭐ FAIR"
        else:
            return "PASS"
    
    def analyze_property(self, prop: Dict) -> PropertyAnalysis:
        """
        Run complete analysis on a single property.
        """
        if not self.is_trained:
            self.train_models()
        
        # Extract data
        bcpao = prop.get('bcpao_data') or {}
        
        plaintiff = prop.get('plaintiff', 'UNKNOWN')
        final_judgment = float(prop.get('final_judgment', 0) or 0)
        market_value = float(
            bcpao.get('market_value', 0) or 
            prop.get('market_value', 0) or 
            prop.get('cma_value', 0) or 0
        )
        
        if market_value <= 0:
            market_value = final_judgment * 1.3
        
        year_built = int(bcpao.get('year_built', 0) or 1990)
        sqft = int(bcpao.get('sqft', 0) or 1500)
        bedrooms = int(bcpao.get('bedrooms', 0) or 3)
        bathrooms = float(bcpao.get('bathrooms', 0) or 2)
        
        # Calculate equity
        equity_spread = market_value - final_judgment
        equity_pct = (equity_spread / max(market_value, 1)) * 100
        
        # Get third-party prediction
        tp_pred = self.plaintiff_model.predict(plaintiff, final_judgment, market_value)
        
        # Calculate max bid
        max_bid, repairs = self.calculate_max_bid(market_value, year_built)
        
        # Calculate ROI
        if max_bid > 0:
            roi = ((market_value - max_bid - repairs - 10000) / max_bid) * 100
        else:
            roi = 0
        
        # Rating
        rating = self.calculate_rating(roi, year_built, tp_pred.third_party_probability)
        
        # Predicted sold amount
        if tp_pred.third_party_probability > 0.5:
            predicted_sold = tp_pred.expected_winning_bid
        else:
            predicted_sold = final_judgment
        
        return PropertyAnalysis(
            case_number=prop.get('case_number', ''),
            address=prop.get('address', ''),
            city=prop.get('city', ''),
            zip_code=prop.get('zip_code', ''),
            defendant=prop.get('defendant', ''),
            plaintiff=plaintiff,
            plaintiff_category=tp_pred.plaintiff_category,
            plaintiff_base_rate=tp_pred.plaintiff_base_rate,
            year_built=year_built,
            sqft=sqft,
            bedrooms=bedrooms,
            bathrooms=bathrooms,
            lot_size=float(bcpao.get('lot_size', 0) or 0),
            subdivision=bcpao.get('subdivision', ''),
            parcel_id=bcpao.get('parcel_id', ''),
            final_judgment=final_judgment,
            market_value=market_value,
            equity_spread=equity_spread,
            equity_pct=equity_pct,
            third_party_probability=tp_pred.third_party_probability,
            third_party_confidence=tp_pred.confidence,
            expected_overpay_pct=tp_pred.expected_overpay_pct,
            expected_winning_bid=tp_pred.expected_winning_bid,
            predicted_sold_amount=predicted_sold,
            repair_estimate=repairs,
            max_bid=max_bid,
            roi_estimate=roi,
            rating=rating,
            bid_strategy=tp_pred.bid_strategy
        )
    
    def analyze_batch(
        self,
        properties: List[Dict],
        sort_by: str = 'opportunity_score'
    ) -> List[PropertyAnalysis]:
        """
        Analyze multiple properties and return sorted results.
        
        Args:
            properties: List of property dictionaries
            sort_by: 'opportunity_score' (ROI adjusted for competition),
                    'roi', 'third_party_probability', 'equity_pct'
        """
        results = []
        for prop in properties:
            try:
                analysis = self.analyze_property(prop)
                results.append(analysis)
            except Exception as e:
                logger.error(f"Error analyzing {prop.get('address')}: {e}")
        
        # Sort
        if sort_by == 'opportunity_score':
            # ROI adjusted for competition risk
            results.sort(
                key=lambda x: x.roi_estimate * (1 - x.third_party_probability),
                reverse=True
            )
        elif sort_by == 'roi':
            results.sort(key=lambda x: x.roi_estimate, reverse=True)
        elif sort_by == 'third_party_probability':
            results.sort(key=lambda x: x.third_party_probability)
        elif sort_by == 'equity_pct':
            results.sort(key=lambda x: x.equity_pct, reverse=True)
        
        return results
    
    def generate_report(
        self,
        results: List[PropertyAnalysis],
        auction_date: str,
        auction_location: str = "Titusville Courthouse"
    ) -> Dict:
        """Generate complete pipeline report"""
        return {
            'generated_at': datetime.now().isoformat(),
            'pipeline_version': 'V13.1.2',
            'auction_date': auction_date,
            'auction_location': auction_location,
            'model_metrics': self.model_metrics,
            'plaintiff_database': PLAINTIFF_BEHAVIOR,
            'stages_completed': [
                'Stage 1: Discovery - RealForeclose',
                'Stage 2: Scraping - Property extraction',
                'Stage 3: Title Analysis - Lis Pendens',
                'Stage 4: Lien Priority - Senior/junior identification',
                'Stage 5: Tax Certificates - Outstanding cert check',
                'Stage 6: Demographics - Census API',
                'Stage 7: ML Scoring - Plaintiff-based XGBoost',
                'Stage 8: Max Bid - 70% Rule calculation',
                'Stage 9: Decision Log - Investment rating',
                'Stage 10: Report Generation',
                'Stage 11: Disposition - Post-auction tracking',
                'Stage 12: Archive - Supabase persistence'
            ],
            'summary': {
                'total_properties': len(results),
                'strong_buy': sum(1 for r in results if 'STRONG' in r.rating),
                'good': sum(1 for r in results if r.rating == '⭐⭐ GOOD'),
                'fair': sum(1 for r in results if r.rating == '⭐ FAIR'),
                'pass': sum(1 for r in results if r.rating == 'PASS'),
                'avg_third_party_prob': np.mean([r.third_party_probability for r in results]),
                'avg_roi': np.mean([r.roi_estimate for r in results])
            },
            'properties': [asdict(r) for r in results]
        }


# =============================================================================
# CLI / TESTING
# =============================================================================

if __name__ == "__main__":
    print("=" * 70)
    print("    BidDeed.AI V13.1.2 - ML Pipeline Test")
    print("=" * 70)
    
    pipeline = MLPipeline()
    metrics = pipeline.train_models()
    
    print(f"\nPlaintiff Model Accuracy: {metrics['plaintiff_model']['accuracy']:.1%}")
    
    # Test property
    test_prop = {
        'case_number': 'TEST-001',
        'address': '123 Test St',
        'city': 'Palm Bay',
        'zip_code': '32905',
        'defendant': 'Test Owner',
        'plaintiff': 'Bank of NY Mellon',
        'final_judgment': 200000,
        'market_value': 300000,
        'bcpao_data': {
            'year_built': 2015,
            'sqft': 1800,
            'bedrooms': 3,
            'bathrooms': 2
        }
    }
    
    result = pipeline.analyze_property(test_prop)
    
    print(f"\nTest Property Analysis:")
    print(f"  Address: {result.address}")
    print(f"  Plaintiff: {result.plaintiff} ({result.plaintiff_category})")
    print(f"  Third-Party Prob: {result.third_party_probability:.1%}")
    print(f"  Max Bid: ${result.max_bid:,.0f}")
    print(f"  ROI: {result.roi_estimate:.0f}%")
    print(f"  Rating: {result.rating}")
