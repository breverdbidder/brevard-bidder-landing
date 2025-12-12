"""
BidDeed.AI V13.1.2 - Plaintiff-Based XGBoost Model
========================================================
Third-party probability prediction based on plaintiff historical behavior.

Key Features:
- Plaintiff-specific base rates from industry patterns
- XGBoost classifier for third-party probability
- Equity and judgment factors
- Expected overpay calculations

Author: BidDeed.AI
Version: 13.1.2
"""

import json
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# =============================================================================
# PLAINTIFF BEHAVIOR DATABASE
# Based on industry patterns - UPDATE WITH REAL BREVARD DATA
# =============================================================================
PLAINTIFF_BEHAVIOR = {
    # Major Banks - Aggressive bidding, keep properties for REO
    'Bank of America': {
        'base_third_party_rate': 0.15,
        'bid_aggressiveness': 0.7,
        'avg_overpay_when_third_party': 0.05,
        'category': 'major_bank'
    },
    'Wells Fargo': {
        'base_third_party_rate': 0.18,
        'bid_aggressiveness': 0.7,
        'avg_overpay_when_third_party': 0.08,
        'category': 'major_bank'
    },
    'JPMorgan Chase': {
        'base_third_party_rate': 0.12,
        'bid_aggressiveness': 0.9,
        'avg_overpay_when_third_party': 0.04,
        'category': 'major_bank'
    },
    'Citibank': {
        'base_third_party_rate': 0.14,
        'bid_aggressiveness': 0.8,
        'avg_overpay_when_third_party': 0.05,
        'category': 'major_bank'
    },
    
    # Servicers - More willing to let third parties buy
    'Nationstar Mortgage': {
        'base_third_party_rate': 0.35,
        'bid_aggressiveness': 0.5,
        'avg_overpay_when_third_party': 0.15,
        'category': 'servicer'
    },
    'Nationstar': {
        'base_third_party_rate': 0.35,
        'bid_aggressiveness': 0.5,
        'avg_overpay_when_third_party': 0.15,
        'category': 'servicer'
    },
    'Mr Cooper': {
        'base_third_party_rate': 0.35,
        'bid_aggressiveness': 0.5,
        'avg_overpay_when_third_party': 0.15,
        'category': 'servicer'
    },
    'PHH Mortgage': {
        'base_third_party_rate': 0.40,
        'bid_aggressiveness': 0.3,
        'avg_overpay_when_third_party': 0.18,
        'category': 'servicer'
    },
    'Carrington Mortgage': {
        'base_third_party_rate': 0.45,
        'bid_aggressiveness': 0.3,
        'avg_overpay_when_third_party': 0.20,
        'category': 'servicer'
    },
    'Freedom Mortgage': {
        'base_third_party_rate': 0.38,
        'bid_aggressiveness': 0.5,
        'avg_overpay_when_third_party': 0.16,
        'category': 'servicer'
    },
    'Lakeview Loan Servicing': {
        'base_third_party_rate': 0.42,
        'bid_aggressiveness': 0.3,
        'avg_overpay_when_third_party': 0.18,
        'category': 'servicer'
    },
    'Pennymac': {
        'base_third_party_rate': 0.36,
        'bid_aggressiveness': 0.5,
        'avg_overpay_when_third_party': 0.14,
        'category': 'servicer'
    },
    'Ocwen': {
        'base_third_party_rate': 0.44,
        'bid_aggressiveness': 0.3,
        'avg_overpay_when_third_party': 0.19,
        'category': 'servicer'
    },
    'Specialized Loan Servicing': {
        'base_third_party_rate': 0.46,
        'bid_aggressiveness': 0.3,
        'avg_overpay_when_third_party': 0.20,
        'category': 'servicer'
    },
    'Newrez': {
        'base_third_party_rate': 0.40,
        'bid_aggressiveness': 0.4,
        'avg_overpay_when_third_party': 0.17,
        'category': 'servicer'
    },
    'Rocket Mortgage': {
        'base_third_party_rate': 0.30,
        'bid_aggressiveness': 0.6,
        'avg_overpay_when_third_party': 0.12,
        'category': 'servicer'
    },
    
    # Trustees - Often let properties go to third party
    'Bank of NY Mellon': {
        'base_third_party_rate': 0.48,
        'bid_aggressiveness': 0.1,
        'avg_overpay_when_third_party': 0.22,
        'category': 'trustee'
    },
    'US Bank NA': {
        'base_third_party_rate': 0.32,
        'bid_aggressiveness': 0.5,
        'avg_overpay_when_third_party': 0.12,
        'category': 'trustee'
    },
    'US Bank': {
        'base_third_party_rate': 0.32,
        'bid_aggressiveness': 0.5,
        'avg_overpay_when_third_party': 0.12,
        'category': 'trustee'
    },
    'Deutsche Bank': {
        'base_third_party_rate': 0.50,
        'bid_aggressiveness': 0.1,
        'avg_overpay_when_third_party': 0.25,
        'category': 'trustee'
    },
    'Wilmington Trust': {
        'base_third_party_rate': 0.52,
        'bid_aggressiveness': 0.1,
        'avg_overpay_when_third_party': 0.24,
        'category': 'trustee'
    },
    'Wilmington Savings': {
        'base_third_party_rate': 0.50,
        'bid_aggressiveness': 0.15,
        'avg_overpay_when_third_party': 0.22,
        'category': 'trustee'
    },
    
    # Government/GSE - Variable behavior
    'Federal National Mortgage': {
        'base_third_party_rate': 0.25,
        'bid_aggressiveness': 0.6,
        'avg_overpay_when_third_party': 0.10,
        'category': 'gse'
    },
    'Fannie Mae': {
        'base_third_party_rate': 0.25,
        'bid_aggressiveness': 0.6,
        'avg_overpay_when_third_party': 0.10,
        'category': 'gse'
    },
    'Federal Home Loan': {
        'base_third_party_rate': 0.28,
        'bid_aggressiveness': 0.55,
        'avg_overpay_when_third_party': 0.11,
        'category': 'gse'
    },
    'Freddie Mac': {
        'base_third_party_rate': 0.28,
        'bid_aggressiveness': 0.55,
        'avg_overpay_when_third_party': 0.11,
        'category': 'gse'
    },
    
    # Reverse Mortgage - Usually let go
    'Reverse Mortgage': {
        'base_third_party_rate': 0.55,
        'bid_aggressiveness': 0.1,
        'avg_overpay_when_third_party': 0.20,
        'category': 'reverse'
    },
    
    # Default for unknown plaintiffs
    'UNKNOWN': {
        'base_third_party_rate': 0.31,
        'bid_aggressiveness': 0.5,
        'avg_overpay_when_third_party': 0.10,
        'category': 'unknown'
    },
}


@dataclass
class PlaintiffInfo:
    """Plaintiff behavior information"""
    name: str
    base_third_party_rate: float
    bid_aggressiveness: float
    avg_overpay_when_third_party: float
    category: str


@dataclass
class ThirdPartyPrediction:
    """Third-party probability prediction result"""
    plaintiff: str
    plaintiff_category: str
    plaintiff_base_rate: float
    equity_pct: float
    third_party_probability: float
    confidence: str  # HIGH, MEDIUM, LOW
    expected_overpay_pct: float
    expected_winning_bid: float
    bid_strategy: str


class PlaintiffXGBoostModel:
    """
    XGBoost model for third-party probability prediction
    based on plaintiff historical behavior.
    """
    
    def __init__(self):
        self.model = None
        self.feature_names = [
            'plaintiff_base_rate',
            'plaintiff_aggressiveness', 
            'final_judgment',
            'equity_pct'
        ]
        self.is_trained = False
        self.model_accuracy = 0.0
        self.feature_importance = {}
        
    def get_plaintiff_info(self, plaintiff_name: str) -> PlaintiffInfo:
        """Look up plaintiff behavior data"""
        name = str(plaintiff_name).strip() if plaintiff_name else "UNKNOWN"
        
        # Direct match
        if name in PLAINTIFF_BEHAVIOR:
            data = PLAINTIFF_BEHAVIOR[name]
            return PlaintiffInfo(
                name=name,
                base_third_party_rate=data['base_third_party_rate'],
                bid_aggressiveness=data['bid_aggressiveness'],
                avg_overpay_when_third_party=data['avg_overpay_when_third_party'],
                category=data['category']
            )
        
        # Partial match (case-insensitive)
        name_upper = name.upper()
        for key, data in PLAINTIFF_BEHAVIOR.items():
            if key.upper() in name_upper or name_upper in key.upper():
                return PlaintiffInfo(
                    name=key,
                    base_third_party_rate=data['base_third_party_rate'],
                    bid_aggressiveness=data['bid_aggressiveness'],
                    avg_overpay_when_third_party=data['avg_overpay_when_third_party'],
                    category=data['category']
                )
        
        # Default to unknown
        data = PLAINTIFF_BEHAVIOR['UNKNOWN']
        return PlaintiffInfo(
            name="UNKNOWN",
            base_third_party_rate=data['base_third_party_rate'],
            bid_aggressiveness=data['bid_aggressiveness'],
            avg_overpay_when_third_party=data['avg_overpay_when_third_party'],
            category=data['category']
        )
    
    def generate_training_data(self, samples_per_plaintiff: int = 50) -> pd.DataFrame:
        """
        Generate training data based on plaintiff behavior patterns.
        In production, replace this with REAL historical data from Supabase.
        """
        np.random.seed(42)
        records = []
        
        for plaintiff, behavior in PLAINTIFF_BEHAVIOR.items():
            if plaintiff == 'UNKNOWN':
                continue
                
            base_rate = behavior['base_third_party_rate']
            aggressiveness = behavior['bid_aggressiveness']
            avg_overpay = behavior['avg_overpay_when_third_party']
            
            for _ in range(samples_per_plaintiff):
                # Random property characteristics
                judgment = np.random.uniform(50000, 500000)
                equity_pct = np.random.uniform(-20, 60)
                
                # Third party probability based on:
                # 1. Plaintiff's base rate
                # 2. Equity percentage (more equity = more competition)
                # 3. Plaintiff aggressiveness (higher = less third party)
                
                equity_factor = max(0, min(1, equity_pct / 50))
                
                prob = base_rate * (1 + equity_factor * 0.6) * (1 - aggressiveness * 0.25)
                prob = min(0.95, max(0.05, prob))
                
                is_third_party = np.random.random() < prob
                
                if is_third_party:
                    overpay_pct = np.random.uniform(0.03, avg_overpay * 2)
                    winning_bid = judgment * (1 + overpay_pct)
                else:
                    winning_bid = judgment
                    overpay_pct = 0
                
                records.append({
                    'plaintiff': plaintiff,
                    'plaintiff_base_rate': base_rate,
                    'plaintiff_aggressiveness': aggressiveness,
                    'final_judgment': judgment,
                    'equity_pct': equity_pct,
                    'winning_bid': winning_bid,
                    'overpay_pct': overpay_pct * 100,
                    'is_third_party': int(is_third_party)
                })
        
        return pd.DataFrame(records)
    
    def train(self, df: pd.DataFrame = None) -> Dict:
        """Train the XGBoost model"""
        logger.info("Training XGBoost Third-Party Classifier...")
        
        if df is None:
            df = self.generate_training_data()
        
        X = df[self.feature_names]
        y = df['is_third_party']
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        self.model = xgb.XGBClassifier(
            n_estimators=100,
            max_depth=4,
            learning_rate=0.1,
            random_state=42,
            verbosity=0,
            use_label_encoder=False,
            eval_metric='logloss'
        )
        
        self.model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test)
        self.model_accuracy = accuracy_score(y_test, y_pred)
        
        # Feature importance
        self.feature_importance = dict(
            zip(self.feature_names, self.model.feature_importances_)
        )
        
        self.is_trained = True
        
        logger.info(f"Model trained with accuracy: {self.model_accuracy:.1%}")
        logger.info(f"Feature importance: {self.feature_importance}")
        
        return {
            'accuracy': self.model_accuracy,
            'feature_importance': self.feature_importance,
            'training_samples': len(df)
        }
    
    def predict(
        self,
        plaintiff: str,
        final_judgment: float,
        market_value: float
    ) -> ThirdPartyPrediction:
        """
        Predict third-party probability for a property.
        
        Args:
            plaintiff: Plaintiff/lender name
            final_judgment: Final judgment amount
            market_value: BCPAO market value (CMA)
            
        Returns:
            ThirdPartyPrediction with probability and strategy
        """
        if not self.is_trained:
            self.train()
        
        # Get plaintiff info
        plaintiff_info = self.get_plaintiff_info(plaintiff)
        
        # Calculate equity
        if market_value <= 0:
            market_value = final_judgment * 1.3
        
        equity_pct = ((market_value - final_judgment) / max(market_value, 1)) * 100
        
        # Prepare features
        X = pd.DataFrame([{
            'plaintiff_base_rate': plaintiff_info.base_third_party_rate,
            'plaintiff_aggressiveness': plaintiff_info.bid_aggressiveness,
            'final_judgment': final_judgment,
            'equity_pct': equity_pct
        }])
        
        # Predict
        probability = float(self.model.predict_proba(X)[0][1])
        
        # Confidence level
        if probability > 0.6 or probability < 0.2:
            confidence = "HIGH"
        elif probability > 0.4 or probability < 0.3:
            confidence = "MEDIUM"
        else:
            confidence = "LOW"
        
        # Expected overpay if third party wins
        equity_factor = max(0, equity_pct / 50)
        expected_overpay = plaintiff_info.avg_overpay_when_third_party * (1 + equity_factor)
        expected_overpay = min(0.50, expected_overpay)  # Cap at 50%
        
        if probability > 0.5:
            expected_winning_bid = final_judgment * (1 + expected_overpay)
        else:
            expected_winning_bid = final_judgment
        
        # Bid strategy
        if probability > 0.6:
            strategy = "EXPECT COMPETITION - Be prepared to bid above judgment"
        elif probability > 0.4:
            strategy = "MODERATE COMPETITION - Have backup bid ready"
        elif probability > 0.25:
            strategy = "POSSIBLE COMPETITION - Monitor closely"
        else:
            strategy = "LOW COMPETITION - Likely goes back to bank at judgment"
        
        return ThirdPartyPrediction(
            plaintiff=plaintiff_info.name,
            plaintiff_category=plaintiff_info.category,
            plaintiff_base_rate=plaintiff_info.base_third_party_rate,
            equity_pct=equity_pct,
            third_party_probability=probability,
            confidence=confidence,
            expected_overpay_pct=expected_overpay * 100,
            expected_winning_bid=expected_winning_bid,
            bid_strategy=strategy
        )
    
    def predict_batch(
        self,
        properties: List[Dict]
    ) -> List[ThirdPartyPrediction]:
        """Predict third-party probability for multiple properties"""
        results = []
        for prop in properties:
            prediction = self.predict(
                plaintiff=prop.get('plaintiff', 'UNKNOWN'),
                final_judgment=float(prop.get('final_judgment', 0) or 0),
                market_value=float(prop.get('market_value', 0) or 0)
            )
            results.append(prediction)
        return results
    
    def get_model_info(self) -> Dict:
        """Get model information and metrics"""
        return {
            'model_type': 'XGBoost Classifier',
            'version': '13.1.2',
            'is_trained': self.is_trained,
            'accuracy': self.model_accuracy,
            'features': self.feature_names,
            'feature_importance': self.feature_importance,
            'plaintiff_database_size': len(PLAINTIFF_BEHAVIOR),
            'data_source': 'Industry patterns - needs validation with real Brevard data'
        }
    
    def export_plaintiff_database(self) -> Dict:
        """Export plaintiff behavior database"""
        return PLAINTIFF_BEHAVIOR.copy()


# =============================================================================
# CONVENIENCE FUNCTIONS
# =============================================================================

_model_instance = None

def get_model() -> PlaintiffXGBoostModel:
    """Get or create singleton model instance"""
    global _model_instance
    if _model_instance is None:
        _model_instance = PlaintiffXGBoostModel()
        _model_instance.train()
    return _model_instance


def predict_third_party(
    plaintiff: str,
    final_judgment: float,
    market_value: float
) -> ThirdPartyPrediction:
    """
    Quick prediction function.
    
    Usage:
        result = predict_third_party("Bank of America", 200000, 280000)
        print(f"Third-party probability: {result.third_party_probability:.1%}")
    """
    model = get_model()
    return model.predict(plaintiff, final_judgment, market_value)


def get_plaintiff_info(plaintiff: str) -> PlaintiffInfo:
    """Get plaintiff behavior information"""
    model = get_model()
    return model.get_plaintiff_info(plaintiff)


# =============================================================================
# CLI / TESTING
# =============================================================================

if __name__ == "__main__":
    # Test the model
    print("=" * 70)
    print("    BidDeed.AI - Plaintiff XGBoost Model Test")
    print("=" * 70)
    
    model = PlaintiffXGBoostModel()
    metrics = model.train()
    
    print(f"\nModel Accuracy: {metrics['accuracy']:.1%}")
    print(f"Training Samples: {metrics['training_samples']}")
    print(f"\nFeature Importance:")
    for feat, imp in sorted(metrics['feature_importance'].items(), key=lambda x: x[1], reverse=True):
        print(f"  {feat}: {imp:.1%}")
    
    # Test predictions
    test_cases = [
        ("Bank of America", 200000, 280000),
        ("Bank of NY Mellon", 150000, 250000),
        ("Wells Fargo", 300000, 350000),
        ("Carrington Mortgage", 180000, 280000),
    ]
    
    print("\n" + "=" * 70)
    print("    Test Predictions")
    print("=" * 70)
    
    for plaintiff, judgment, market in test_cases:
        pred = model.predict(plaintiff, judgment, market)
        print(f"\n{plaintiff}:")
        print(f"  Judgment: ${judgment:,} | Market: ${market:,}")
        print(f"  Equity: {pred.equity_pct:.1f}%")
        print(f"  Third-Party Prob: {pred.third_party_probability:.1%} ({pred.confidence})")
        print(f"  Strategy: {pred.bid_strategy}")
