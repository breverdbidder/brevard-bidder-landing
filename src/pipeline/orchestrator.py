"""
BidDeed.AI 13-Stage Pipeline Orchestrator
Following SKILL.md Standards

Version: 13.5.0
Updated: December 2, 2025
"""

import asyncio
from typing import List, Dict, Optional
from dataclasses import dataclass
from datetime import datetime
import json

from models.report_data import (
    PipelineReportData,
    RealForecloseData,
    BCPAOData,
    AcclaimWebData,
    BECAData,
    RealTDMData,
    MLPrediction,
    ARVData,
    RepairEstimate,
    DemographicsData,
    MaxBidCalculation,
    MarketData,
    ReportMetadata,
    TitleRiskData,
    Lien,
    TaxCertificate,
    Comparable,
    RepairItem,
    BlockingIssue,
    Recommendation,
    RiskLevel,
    Condition,
    DemandLevel,
    MarketTrend,
    CompetitionLevel,
    is_target_zip
)

from pipeline.title_risk_score import TitleRiskScorer, calculate_adjusted_max_bid
from pipeline.municipal_lien_search import check_municipal_liens


@dataclass
class PipelineConfig:
    """Pipeline configuration"""
    enable_ml_prediction: bool = True
    enable_title_risk: bool = True
    enable_municipal_check: bool = True
    default_repair_contingency: float = 0.15  # 15% of ARV
    min_comparables: int = 3
    arv_confidence_threshold: float = 70.0


class PipelineOrchestrator:
    """
    13-Stage Pipeline Orchestrator
    
    Stages:
    1. RealForeclose - Auction data
    2. BCPAO - Property data
    3. AcclaimWeb - Official records
    4. BECA - Foreclosure case
    5. RealTDM - Tax certificates
    6. ML Prediction - Third party probability
    7. ARV Calculator - After repair value
    8. Repair Estimator - Repair costs
    9. Demographics - Census/rental data
    10. Max Bid Calculator - Bid formula
    11. Tool Search - Market data
    12. Report Generator - Output
    13. Title Risk Score - Title assessment
    """
    
    def __init__(self, config: PipelineConfig = None):
        self.config = config or PipelineConfig()
        self.title_scorer = TitleRiskScorer()
        self.stages_completed = []
        self.errors = []
    
    async def run_pipeline(self, case_number: str) -> PipelineReportData:
        """
        Execute full 13-stage pipeline for a single property
        
        Args:
            case_number: Foreclosure case number
            
        Returns:
            PipelineReportData with all stages populated
        """
        report = PipelineReportData()
        
        # Stage 1: RealForeclose
        report.realforeclose = await self._stage_1_realforeclose(case_number)
        self.stages_completed.append("Stage 1: RealForeclose")
        
        # Stage 2: BCPAO
        report.bcpao = await self._stage_2_bcpao(report.realforeclose)
        self.stages_completed.append("Stage 2: BCPAO")
        
        # Stage 3: AcclaimWeb
        report.acclaimweb = await self._stage_3_acclaimweb(report.bcpao.parcel_id)
        self.stages_completed.append("Stage 3: AcclaimWeb")
        
        # Stage 4: BECA
        report.beca = await self._stage_4_beca(case_number)
        self.stages_completed.append("Stage 4: BECA")
        
        # Stage 5: RealTDM
        report.realtdm = await self._stage_5_realtdm(report.bcpao.parcel_id)
        self.stages_completed.append("Stage 5: RealTDM")
        
        # Stage 6: ML Prediction
        if self.config.enable_ml_prediction:
            report.ml_prediction = await self._stage_6_ml_prediction(report)
            self.stages_completed.append("Stage 6: ML Prediction")
        
        # Stage 7: ARV Calculator
        report.arv = await self._stage_7_arv(report.bcpao)
        self.stages_completed.append("Stage 7: ARV Calculator")
        
        # Stage 8: Repair Estimator
        report.repairs = await self._stage_8_repairs(report.bcpao, report.arv.arv)
        self.stages_completed.append("Stage 8: Repair Estimator")
        
        # Stage 9: Demographics
        report.demographics = await self._stage_9_demographics(report.bcpao.zip_code)
        self.stages_completed.append("Stage 9: Demographics")
        
        # Stage 11: Market Data (before Max Bid for context)
        report.market = await self._stage_11_market(report.bcpao)
        self.stages_completed.append("Stage 11: Tool Search")
        
        # Stage 13: Title Risk Score (before Max Bid for cure costs)
        if self.config.enable_title_risk:
            report.title_risk = await self._stage_13_title_risk(report)
            self.stages_completed.append("Stage 13: Title Risk Score")
        
        # Stage 10: Max Bid Calculator (needs stages 7, 8, 13)
        report.max_bid = self._stage_10_max_bid(report)
        self.stages_completed.append("Stage 10: Max Bid Calculator")
        
        # Stage 12: Report Metadata
        report.metadata = ReportMetadata()
        self.stages_completed.append("Stage 12: Report Generator")
        
        return report
    
    async def _stage_1_realforeclose(self, case_number: str) -> RealForecloseData:
        """Stage 1: Fetch auction data from RealForeclose"""
        # In production, this calls the RealForeclose scraper
        # Placeholder structure:
        return RealForecloseData(
            case_number=case_number,
            auction_date="",
            auction_time="11:00 AM",
            auction_location="Brevard County Government Center North, Titusville"
        )
    
    async def _stage_2_bcpao(self, rf_data: RealForecloseData) -> BCPAOData:
        """Stage 2: Fetch property data from BCPAO"""
        # In production, this calls the BCPAO scraper
        return BCPAOData(
            parcel_id="",
            property_address="",
            city="",
            zip_code=""
        )
    
    async def _stage_3_acclaimweb(self, parcel_id: str) -> AcclaimWebData:
        """Stage 3: Fetch official records from AcclaimWeb"""
        # In production, this calls the AcclaimWeb scraper
        return AcclaimWebData()
    
    async def _stage_4_beca(self, case_number: str) -> BECAData:
        """Stage 4: Fetch foreclosure case details from BECA"""
        # In production, this calls BECA Scraper V2.0
        return BECAData()
    
    async def _stage_5_realtdm(self, parcel_id: str) -> RealTDMData:
        """Stage 5: Fetch tax certificate data from RealTDM"""
        # In production, this calls RealTDM scraper
        return RealTDMData()
    
    async def _stage_6_ml_prediction(self, report: PipelineReportData) -> MLPrediction:
        """Stage 6: Generate ML predictions"""
        # In production, this calls the ML model
        return MLPrediction(
            third_party_probability=0.0,
            predicted_winning_bid=0.0,
            competition_level=CompetitionLevel.MODERATE
        )
    
    async def _stage_7_arv(self, bcpao: BCPAOData) -> ARVData:
        """Stage 7: Calculate ARV from comparables"""
        # In production, this fetches comps and calculates ARV
        return ARVData()
    
    async def _stage_8_repairs(self, bcpao: BCPAOData, arv: float) -> RepairEstimate:
        """Stage 8: Estimate repairs based on property condition"""
        # In production, this uses condition assessment and cost matrix
        return RepairEstimate(
            total_estimate=arv * self.config.default_repair_contingency,
            condition=Condition.FAIR
        )
    
    async def _stage_9_demographics(self, zip_code: str) -> DemographicsData:
        """Stage 9: Fetch census and rental market data"""
        # In production, this calls Census API
        return DemographicsData(
            target_zip=is_target_zip(zip_code)
        )
    
    def _stage_10_max_bid(self, report: PipelineReportData) -> MaxBidCalculation:
        """Stage 10: Calculate max bid using formula"""
        calc = MaxBidCalculation()
        calc.calculate(
            arv=report.arv.arv,
            repairs=report.repairs.total_estimate,
            judgment=report.realforeclose.judgment_amount,
            cure_costs=report.title_risk.total_cure_cost
        )
        return calc
    
    async def _stage_11_market(self, bcpao: BCPAOData) -> MarketData:
        """Stage 11: Fetch market data via tool search"""
        # In production, this uses web search integration
        return MarketData()
    
    async def _stage_13_title_risk(self, report: PipelineReportData) -> TitleRiskData:
        """Stage 13: Calculate title risk score"""
        
        title_data = TitleRiskData()
        blocking_issues = []
        
        # Check tax delinquency (from Stage 2)
        if report.bcpao.tax_owed > 0:
            blocking_issues.append(BlockingIssue(
                issue=f"{report.bcpao.tax_status}",
                cure_cost=report.bcpao.tax_owed,
                data_source="BCPAO"
            ))
        
        # Check tax certificates (from Stage 5)
        for cert in report.realtdm.tax_certificates:
            blocking_issues.append(BlockingIssue(
                issue=f"Tax Certificate #{cert.certificate_number}",
                cure_cost=cert.amount * 1.25,  # Add 25% for interest
                data_source="RealTDM"
            ))
        
        # Check recorded liens (from Stage 3)
        for lien in report.acclaimweb.liens:
            blocking_issues.append(BlockingIssue(
                issue=f"{lien.lien_type}",
                cure_cost=lien.amount,
                data_source="AcclaimWeb"
            ))
        
        # Check NOC (from Stage 3)
        if report.acclaimweb.noc_active:
            blocking_issues.append(BlockingIssue(
                issue="Active Notice of Commencement",
                cure_cost=500,
                data_source="AcclaimWeb"
            ))
        
        # Municipal lien check
        if self.config.enable_municipal_check:
            municipal_check = check_municipal_liens(
                parcel_id=report.bcpao.parcel_id,
                property_address=report.bcpao.property_address,
                zip_code=report.bcpao.zip_code,
                property_condition="vacant_maintained"
            )
            title_data.municipal_flag = municipal_check.get("municipality", "")
            title_data.municipal_contingency = municipal_check.get("risk_contingency", 2500)
        
        title_data.blocking_issues = blocking_issues
        title_data.calculate_total_cure()
        
        # Calculate risk score
        base_score = len(blocking_issues) * 10
        if report.realtdm.tax_deed_pending:
            base_score += 30
        if report.bcpao.tax_owed > 5000:
            base_score += 10
        
        title_data.title_risk_score = min(base_score, 100)
        
        # Determine risk level
        if title_data.title_risk_score <= 25:
            title_data.risk_level = RiskLevel.LOW
        elif title_data.title_risk_score <= 50:
            title_data.risk_level = RiskLevel.MODERATE
        elif title_data.title_risk_score <= 75:
            title_data.risk_level = RiskLevel.HIGH
        else:
            title_data.risk_level = RiskLevel.CRITICAL
        
        return title_data
    
    def get_status(self) -> Dict:
        """Get pipeline execution status"""
        return {
            "stages_completed": self.stages_completed,
            "total_stages": 13,
            "completion_percentage": (len(self.stages_completed) / 13) * 100,
            "errors": self.errors
        }


async def run_batch_pipeline(case_numbers: List[str]) -> List[PipelineReportData]:
    """
    Run pipeline for multiple properties
    
    Args:
        case_numbers: List of foreclosure case numbers
        
    Returns:
        List of PipelineReportData for each property
    """
    orchestrator = PipelineOrchestrator()
    results = []
    
    for case_num in case_numbers:
        try:
            report = await orchestrator.run_pipeline(case_num)
            results.append(report)
        except Exception as e:
            print(f"Error processing {case_num}: {e}")
    
    return results


def generate_summary(reports: List[PipelineReportData]) -> Dict:
    """
    Generate auction summary from multiple reports
    
    Args:
        reports: List of completed pipeline reports
        
    Returns:
        Summary dictionary
    """
    bid_count = sum(1 for r in reports if r.max_bid.recommendation == Recommendation.BID)
    review_count = sum(1 for r in reports if r.max_bid.recommendation == Recommendation.REVIEW)
    skip_count = sum(1 for r in reports if r.max_bid.recommendation == Recommendation.SKIP)
    
    total_judgment = sum(r.realforeclose.judgment_amount for r in reports)
    total_max_bid = sum(r.max_bid.adjusted_max_bid for r in reports if r.max_bid.recommendation != Recommendation.SKIP)
    
    return {
        "total_properties": len(reports),
        "recommendations": {
            "BID": bid_count,
            "REVIEW": review_count,
            "SKIP": skip_count
        },
        "total_judgment_value": total_judgment,
        "total_max_bid_value": total_max_bid,
        "average_bid_judgment_ratio": sum(r.max_bid.bid_judgment_ratio for r in reports) / len(reports) if reports else 0,
        "title_risk_summary": {
            "average_score": sum(r.title_risk.title_risk_score for r in reports) / len(reports) if reports else 0,
            "total_cure_costs": sum(r.title_risk.total_cure_cost for r in reports)
        }
    }


# Export for use in report generator
__all__ = [
    "PipelineOrchestrator",
    "PipelineConfig",
    "run_batch_pipeline",
    "generate_summary"
]
