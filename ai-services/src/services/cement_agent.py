"""
Cement GPT Agent Service
Intelligent agent that analyzes questions and determines required data context
"""

import re
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any, Set
from dataclasses import dataclass
from enum import Enum

from .backend_service import get_backend_service, BackendService
from ..utils.logger import get_logger

logger = get_logger(__name__)


class DataRequirement(Enum):
    """Types of data that might be required for answering questions"""
    NONE = "none"
    FACILITY_BASIC = "facility_basic"
    EMISSION_DATA = "emission_data"
    PRODUCTION_DATA = "production_data"
    TARGETS_GOALS = "targets_goals"
    INDUSTRY_BENCHMARKS = "industry_benchmarks"
    HISTORICAL_TRENDS = "historical_trends"
    RESOURCES_CONFIG = "resources_config"
    ORGANIZATION_DATA = "organization_data"  # Added for org-level queries


@dataclass
class AnalysisResult:
    """Result of question analysis"""
    question_type: str
    data_requirements: Set[DataRequirement]
    confidence: float
    reasoning: str
    suggested_time_range: Optional[int] = None  # months
    

class CementAgent:
    """
    Intelligent agent for analyzing questions and fetching relevant context
    """
    
    def __init__(self):
        """Initialize the agent"""
        self.backend_service = None
        self._init_patterns()
        
    async def _get_backend_service(self) -> BackendService:
        """Get backend service instance"""
        if not self.backend_service:
            self.backend_service = await get_backend_service()
        return self.backend_service
    
    def _init_patterns(self):
        """Initialize question analysis patterns"""
        self.patterns = {
            # Performance and metrics questions
            "performance": {
                "patterns": [
                    r"\b(performance|performing|metrics|efficiency|intensity)\b",
                    r"\b(how\s+(are\s+)?(we|am\s+I|is\s+my)\s+(doing|performing))",
                    r"\b(what\s+(is|are)\s+(my|our)\s+(current|latest))",
                    r"\b(show\s+(me\s+)?(my|our)\s+(performance|metrics|data))",
                ],
                "requirements": {DataRequirement.FACILITY_BASIC, DataRequirement.EMISSION_DATA, DataRequirement.PRODUCTION_DATA},
                "confidence": 0.9
            },
            
            # Comprehensive facility state questions
            "facility_state": {
                "patterns": [
                    r"\b(current\s+state|facility.*state|state.*facility)\b",
                    r"\b(overview|summary|status|current\s+status)\b",
                    r"\b(what.*my\s+facility|how.*my\s+facility)\b",
                    r"\b(facility.*current|current.*facility)\b",
                    r"\b(comprehensive|complete|full)\s+(view|picture|assessment)\b",
                ],
                "requirements": {
                    DataRequirement.FACILITY_BASIC, 
                    DataRequirement.EMISSION_DATA, 
                    DataRequirement.PRODUCTION_DATA,
                    DataRequirement.TARGETS_GOALS,
                    DataRequirement.RESOURCES_CONFIG
                },
                "confidence": 0.95
            },
            
            # Emission-specific questions
            "emissions": {
                "patterns": [
                    r"\b(emission|emissions|carbon|CO2|greenhouse\s+gas)\b",
                    r"\b(scope\s+[123]|emission\s+intensity|carbon\s+footprint)\b",
                    r"\b(reduce\s+emissions|emission\s+reduction|decarboniz)",
                ],
                "requirements": {DataRequirement.FACILITY_BASIC, DataRequirement.EMISSION_DATA, DataRequirement.HISTORICAL_TRENDS},
                "confidence": 0.95
            },
            
            # Production-related questions
            "production": {
                "patterns": [
                    r"\b(production|output|cement\s+production|clinker|capacity)\b",
                    r"\b(tons?\s+(of\s+)?cement|monthly\s+production|annual\s+production)\b",
                    r"\b(utilization|capacity\s+utilization|production\s+efficiency)\b",
                ],
                "requirements": {DataRequirement.FACILITY_BASIC, DataRequirement.PRODUCTION_DATA, DataRequirement.HISTORICAL_TRENDS},
                "confidence": 0.9
            },
            
            # Target and goal questions
            "targets": {
                "patterns": [
                    r"\b(target|targets|goal|goals|objective|commitment)\b",
                    r"\b(net\s+zero|carbon\s+neutral|sustainability\s+target)\b",
                    r"\b(progress\s+towards|achievement|meeting\s+targets)\b",
                    r"\b(2030|2040|2050)\b",  # Common target years
                    r"\b(what.*targets|which.*targets|my.*targets|our.*targets)\b",
                    r"\b(facility.*targets|target.*facility|targets.*taken|targets.*set)\b",
                    r"\b(baseline|target\s+value|reduction\s+target|efficiency\s+target)\b",
                    r"\b(suggest.*targets|recommend.*targets|industry.*standards?)\b",
                ],
                "requirements": {DataRequirement.FACILITY_BASIC, DataRequirement.TARGETS_GOALS, DataRequirement.EMISSION_DATA},
                "confidence": 0.9
            },
            
            # Benchmarking questions
            "benchmarking": {
                "patterns": [
                    r"\b(benchmark|compare|comparison|industry\s+average)\b",
                    r"\b(how\s+do\s+(we|I)\s+compare|against\s+peers|vs\s+industry)\b",
                    r"\b(best\s+practice|leading|top\s+performer)\b",
                ],
                "requirements": {DataRequirement.FACILITY_BASIC, DataRequirement.EMISSION_DATA, DataRequirement.INDUSTRY_BENCHMARKS},
                "confidence": 0.8
            },
            
            # Alternative fuels questions
            "alternative_fuels": {
                "patterns": [
                    r"\b(alternative\s+fuel|alt\s+fuel|biomass|RDF|refuse\s+derived)\b",
                    r"\b(waste\s+fuel|fuel\s+substitution|fuel\s+mix)\b",
                    r"\b(thermal\s+substitution|tsr|fuel\s+replacement)\b",
                    r"\b(what.*fuel|which.*fuel|fuel.*should|recommend.*fuel)\b",
                ],
                "requirements": {DataRequirement.FACILITY_BASIC, DataRequirement.RESOURCES_CONFIG, DataRequirement.EMISSION_DATA},
                "confidence": 0.9
            },
            
            # Equipment and resources
            "resources": {
                "patterns": [
                    r"\b(equipment|kiln|mill|resources|configuration)\b",
                    r"\b(machinery|plant\s+setup|facility\s+configuration)\b",
                    r"\b(what\s+equipment|available\s+resources)\b",
                    r"\b(consumption|fuel\s+consumption|energy\s+consumption|resource\s+usage)\b",
                    r"\b(current\s+state|facility\s+resources|resource\s+breakdown)\b",
                    r"\b(what.*consuming|how\s+much.*using|usage\s+patterns)\b",
                ],
                "requirements": {DataRequirement.FACILITY_BASIC, DataRequirement.RESOURCES_CONFIG},
                "confidence": 0.8
            },
            
            # Organization-level questions  
            "organization": {
                "patterns": [
                    r"\b(how\s+many\s+facilities|number\s+of\s+facilities|list\s+(of\s+)?facilities)\b",
                    r"\b(my\s+facilities|our\s+facilities|all\s+(my|our)\s+facilities)\b",
                    r"\b(facilities\s+(do\s+)?(i|we)\s+have|organization\s+overview)\b",
                    r"\b(show\s+(me\s+)?(my|our)\s+facilities|facility\s+list)\b",
                    r"\b(what\s+facilities|which\s+facilities)\b",
                ],
                "requirements": {DataRequirement.ORGANIZATION_DATA},
                "confidence": 0.9
            },
            
            # General industry knowledge (no data needed)
            "general": {
                "patterns": [
                    r"\b(what\s+is|define|explain|tell\s+me\s+about)\b",
                    r"\b(how\s+does.*work|manufacturing\s+process|industry\s+standard)\b",
                    r"\b(best\s+practices|guidelines|recommendations)\b",
                ],
                "requirements": {DataRequirement.NONE},
                "confidence": 0.7
            }
        }
    
    def analyze_question(self, question: str, facility_id: Optional[str] = None) -> AnalysisResult:
        """
        Analyze a user question to determine required data context
        
        Args:
            question: User's question
            facility_id: Optional facility ID for context
            
        Returns:
            AnalysisResult with data requirements
        """
        question_lower = question.lower()
        
        # Score each question type
        scores = {}
        matched_requirements = set()
        reasoning_parts = []
        
        for question_type, config in self.patterns.items():
            score = 0
            matched_patterns = []
            
            for pattern in config["patterns"]:
                matches = re.findall(pattern, question_lower, re.IGNORECASE)
                if matches:
                    score += len(matches) * config["confidence"]
                    matched_patterns.append(pattern)
            
            if score > 0:
                scores[question_type] = score
                matched_requirements.update(config["requirements"])
                reasoning_parts.append(f"{question_type} (score: {score:.2f})")
        
        # Determine primary question type
        if scores:
            primary_type = max(scores.keys(), key=lambda k: scores[k])
            confidence = min(scores[primary_type] / len(question.split()), 1.0)
        else:
            primary_type = "general"
            matched_requirements = {DataRequirement.NONE}
            confidence = 0.5
            reasoning_parts = ["No specific patterns matched, defaulting to general"]
        
        # Remove NONE if other requirements exist
        if len(matched_requirements) > 1 and DataRequirement.NONE in matched_requirements:
            matched_requirements.remove(DataRequirement.NONE)
        
        # Determine time range based on question
        time_range = self._determine_time_range(question_lower)
        
        # Special handling for facility-specific questions
        if not facility_id and DataRequirement.NONE not in matched_requirements:
            logger.warning("Data requirements identified but no facility_id provided")
            confidence *= 0.7  # Reduce confidence
        
        reasoning = f"Matched patterns: {', '.join(reasoning_parts)}"
        
        logger.info(f"Question analysis: type={primary_type}, requirements={matched_requirements}, confidence={confidence:.2f}")
        
        return AnalysisResult(
            question_type=primary_type,
            data_requirements=matched_requirements,
            confidence=confidence,
            reasoning=reasoning,
            suggested_time_range=time_range
        )
    
    def _determine_time_range(self, question: str) -> Optional[int]:
        """Determine appropriate time range for data fetching"""
        if re.search(r'\b(recent|last|current|latest)\b', question):
            return 3  # Last 3 months
        elif re.search(r'\b(trend|trends|historical|over\s+time)\b', question):
            return 12  # Last 12 months
        elif re.search(r'\b(year|annual|yearly)\b', question):
            return 12  # Full year
        elif re.search(r'\b(month|monthly)\b', question):
            return 6   # Last 6 months
        else:
            return 6   # Default to 6 months
    
    async def fetch_context_data(
        self, 
        requirements: Set[DataRequirement], 
        facility_id: Optional[str] = None,
        organization_id: Optional[str] = None,
        time_range: Optional[int] = 6
    ) -> Dict[str, Any]:
        """
        Fetch required context data based on analysis
        
        Args:
            requirements: Set of data requirements
            facility_id: Optional facility ID
            organization_id: Optional organization ID
            time_range: Time range in months for historical data
            
        Returns:
            Dictionary containing fetched data
        """
        if DataRequirement.NONE in requirements:
            return {"context_type": "general", "message": "No specific data required"}
        
        # For organization-level questions, we don't need a specific facility_id
        # Also allow targets and resources questions to proceed without facility_id
        if not facility_id and DataRequirement.ORGANIZATION_DATA not in requirements and DataRequirement.TARGETS_GOALS not in requirements and DataRequirement.RESOURCES_CONFIG not in requirements:
            return {"context_type": "general", "message": "No specific facility data required"}
        
        try:
            backend_service = await self._get_backend_service()
            context_data = {}
            
            # Fetch organization-level data if required
            if DataRequirement.ORGANIZATION_DATA in requirements:
                org_facilities = await backend_service.get_organization_facilities(organization_id)
                if org_facilities:
                    context_data["organization_facilities"] = org_facilities
                    context_data["facility_count"] = len(org_facilities)
                    logger.info(f"Fetched {len(org_facilities)} facilities for organization {organization_id}")
                else:
                    context_data["organization_facilities"] = []
                    context_data["facility_count"] = 0
                    logger.warning(f"No facilities found for organization {organization_id}")

            # Fetch facility basic info if required
            if any(req in requirements for req in [
                DataRequirement.FACILITY_BASIC,
                DataRequirement.EMISSION_DATA,
                DataRequirement.PRODUCTION_DATA,
                DataRequirement.TARGETS_GOALS,
                DataRequirement.RESOURCES_CONFIG
            ]):
                facility_info = await backend_service.get_facility(facility_id, organization_id)
                if facility_info:
                    context_data["facility"] = facility_info
                    logger.info(f"Fetched facility info for {facility_id}")
            
            # Fetch emission data if required
            if DataRequirement.EMISSION_DATA in requirements or DataRequirement.HISTORICAL_TRENDS in requirements:
                emission_data = await backend_service.get_emission_data(
                    facility_id, months=time_range, organization_id=organization_id
                )
                if emission_data:
                    context_data["emissions"] = emission_data
                    logger.info(f"Fetched emission data for {facility_id} ({time_range} months)")
            
            # Fetch production data if required
            if DataRequirement.PRODUCTION_DATA in requirements or DataRequirement.HISTORICAL_TRENDS in requirements:
                production_data = await backend_service.get_production_data(
                    facility_id, months=time_range, organization_id=organization_id
                )
                if production_data:
                    context_data["production"] = production_data
                    logger.info(f"Fetched production data for {facility_id} ({time_range} months)")
            
            # Fetch targets data if required
            if DataRequirement.TARGETS_GOALS in requirements and organization_id:
                targets_data = await backend_service.get_targets(
                    organization_id=organization_id,
                    facility_id=facility_id
                )
                if targets_data:
                    context_data["targets"] = targets_data
                    context_data["target_count"] = len(targets_data)
                    logger.info(f"Fetched {len(targets_data)} targets for organization {organization_id}")
                else:
                    context_data["targets"] = []
                    context_data["target_count"] = 0
                    logger.info(f"No targets found for organization {organization_id}")
            
            # Fetch facility resources and consumption data if required
            if DataRequirement.RESOURCES_CONFIG in requirements and facility_id:
                resources_data = await backend_service.get_facility_resources(facility_id)
                if resources_data:
                    context_data["facility_resources"] = resources_data
                    context_data["resource_count"] = len(resources_data)
                    
                    # Calculate consumption summary
                    total_consumption_by_scope = {}
                    recent_consumption_summary = {}
                    
                    for resource in resources_data:
                        scope = resource.get('resource', {}).get('scope', 'unknown')
                        category = resource.get('resource', {}).get('category', 'unknown')
                        recent_consumption = resource.get('recentConsumption', [])
                        
                        if recent_consumption:
                            latest_consumption = recent_consumption[0]  # Most recent month
                            consumption_value = latest_consumption.get('consumption', 0)
                            consumption_unit = latest_consumption.get('consumption_unit', '')
                            
                            if scope not in recent_consumption_summary:
                                recent_consumption_summary[scope] = {}
                            recent_consumption_summary[scope][category] = {
                                'value': consumption_value,
                                'unit': consumption_unit,
                                'resource_name': resource.get('resource', {}).get('name', ''),
                                'month': latest_consumption.get('month'),
                                'year': latest_consumption.get('year')
                            }
                    
                    context_data["consumption_summary"] = recent_consumption_summary
                    logger.info(f"Fetched {len(resources_data)} resources for facility {facility_id}")
                else:
                    context_data["facility_resources"] = []
                    context_data["resource_count"] = 0
                    context_data["consumption_summary"] = {}
                    logger.info(f"No resources found for facility {facility_id}")
            
            # Calculate summary metrics
            if context_data:
                context_data["summary"] = self._calculate_summary_metrics(context_data)
                context_data["context_type"] = "facility_specific"
                context_data["time_range_months"] = time_range
                context_data["data_freshness"] = datetime.utcnow().isoformat() + "Z"
            
            logger.info(f"Successfully fetched context data: {list(context_data.keys())}")
            return context_data
            
        except Exception as e:
            logger.error(f"Error fetching context data: {e}")
            return {
                "context_type": "error",
                "message": "Failed to fetch facility data",
                "error": str(e)
            }
    
    def _calculate_summary_metrics(self, context_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate summary metrics from fetched data"""
        try:
            summary = {
                "facility_name": context_data.get("facility", {}).get("name", "Unknown"),
                "data_available": False
            }
            
            # Process emission data
            emissions = context_data.get("emissions", [])
            if emissions:
                latest_emission = emissions[0] if emissions else {}
                summary.update({
                    "latest_total_emissions": latest_emission.get("total_emissions", 0),
                    "emission_intensity": latest_emission.get("emission_intensity", 0),
                    "emission_data_points": len(emissions),
                    "data_available": True
                })
            
            # Process production data
            production = context_data.get("production", [])
            if production:
                latest_production = production[0] if production else {}
                summary.update({
                    "latest_cement_production": latest_production.get("cement_production", 0),
                    "production_data_points": len(production),
                    "data_available": True
                })
                
                # Calculate emission intensity if both are available
                if emissions and production:
                    total_emissions = latest_emission.get("total_emissions", 0)
                    cement_production = latest_production.get("cement_production", 0)
                    if cement_production > 0:
                        summary["calculated_emission_intensity"] = total_emissions / cement_production
            
            return summary
            
        except Exception as e:
            logger.error(f"Error calculating summary metrics: {e}")
            return {"error": "Failed to calculate metrics"}
    
    async def get_intelligent_context(
        self, 
        question: str, 
        facility_id: Optional[str] = None,
        organization_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Main method to get intelligent context based on question analysis
        
        Args:
            question: User's question
            facility_id: Optional facility ID
            organization_id: Optional organization ID
            
        Returns:
            Dictionary containing analysis and context data
        """
        # Analyze the question
        analysis = self.analyze_question(question, facility_id)
        
        # Intelligent facility selection: if no facility_id provided but facility-specific data is needed,
        # automatically select the first available facility from the organization
        effective_facility_id = facility_id
        if not facility_id and organization_id and self._requires_facility_data(analysis.data_requirements):
            effective_facility_id = await self._get_default_facility(organization_id)
            if effective_facility_id:
                logger.info(f"Auto-selected facility {effective_facility_id} for user question: {question[:50]}...")
        
        # Fetch required data
        context_data = await self.fetch_context_data(
            requirements=analysis.data_requirements,
            facility_id=effective_facility_id,
            organization_id=organization_id,
            time_range=analysis.suggested_time_range
        )
        
        # Combine analysis and data
        result = {
            "analysis": {
                "question_type": analysis.question_type,
                "data_requirements": [req.value for req in analysis.data_requirements],
                "confidence": analysis.confidence,
                "reasoning": analysis.reasoning,
                "time_range_months": analysis.suggested_time_range
            },
            "context": context_data,
            "agent_decision": {
                "requires_data": DataRequirement.NONE not in analysis.data_requirements,
                "data_types_fetched": list(context_data.keys()) if context_data else [],
                "decision_confidence": analysis.confidence
            }
        }
        
        logger.info(f"Agent analysis complete: requires_data={result['agent_decision']['requires_data']}")
        return result
    
    def _requires_facility_data(self, requirements: Set[DataRequirement]) -> bool:
        """
        Check if the data requirements need facility-specific data
        
        Args:
            requirements: Set of data requirements
            
        Returns:
            bool: True if facility-specific data is needed
        """
        facility_specific_requirements = {
            DataRequirement.FACILITY_BASIC,
            DataRequirement.EMISSION_DATA,
            DataRequirement.PRODUCTION_DATA,
            DataRequirement.RESOURCES_CONFIG
        }
        
        return bool(requirements.intersection(facility_specific_requirements))
    
    async def _get_default_facility(self, organization_id: str) -> Optional[str]:
        """
        Get the default facility for an organization (first available facility)
        
        Args:
            organization_id: Organization ID
            
        Returns:
            Optional facility ID
        """
        try:
            backend_service = await self._get_backend_service()
            org_facilities = await backend_service.get_organization_facilities(organization_id)
            
            if org_facilities and len(org_facilities) > 0:
                # Return the first facility (could be enhanced to select based on criteria)
                default_facility = org_facilities[0]
                facility_id = default_facility.get('id')
                facility_name = default_facility.get('name', 'Unknown')
                
                logger.info(f"Selected default facility: {facility_name} ({facility_id})")
                return facility_id
            else:
                logger.warning(f"No facilities found for organization {organization_id}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting default facility for organization {organization_id}: {e}")
            return None


# Global agent instance
cement_agent = CementAgent()


async def get_cement_agent() -> CementAgent:
    """
    Get cement agent instance
    
    Returns:
        CementAgent: Agent instance
    """
    return cement_agent
