"""
Facility Recommendations Router
AI-driven facility sustainability recommendations API endpoints
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
import logging

from ..facility_advisor import get_facility_advisor_service, FacilityAdvisorService
from ..services.facility_data_service import get_facility_data_service, FacilityDataService
from ..middleware.auth import api_key_auth
from ..utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/facility-recommendations", tags=["Facility Recommendations"])


@router.post("/generate/{facility_id}")
async def generate_facility_recommendations(
    facility_id: str,
    focus_areas: Optional[List[str]] = Query(None, description="Specific focus areas for recommendations"),
    facility_advisor: FacilityAdvisorService = Depends(get_facility_advisor_service),
    facility_data_service: FacilityDataService = Depends(get_facility_data_service),
    _: str = Depends(api_key_auth)
):
    """
    Generate AI-driven sustainability recommendations for a specific facility
    
    Args:
        facility_id: ID of the facility to analyze
        focus_areas: Optional list of focus areas (e.g., ["Alternative Fuels", "Energy Efficiency"])
        
    Returns:
        Comprehensive facility recommendations with implementation details
    """
    try:
        logger.info(f"Generating recommendations for facility: {facility_id}")
        
        # Validate facility_id
        if not facility_id or len(facility_id.strip()) == 0:
            raise HTTPException(status_code=400, detail="Facility ID is required")
        
        # Fetch comprehensive facility data
        logger.info(f"Fetching comprehensive data for facility: {facility_id}")
        facility_data = await facility_data_service.get_comprehensive_facility_data(facility_id)
        
        # Validate that we have facility data
        if not facility_data.get('facility'):
            raise HTTPException(
                status_code=404, 
                detail=f"Facility with ID {facility_id} not found or insufficient data available"
            )
        
        # Generate AI recommendations
        logger.info(f"Generating AI recommendations for facility: {facility_id}")
        recommendations = await facility_advisor.generate_recommendations(
            facility_data=facility_data,
            focus_areas=focus_areas
        )
        
        # Log successful generation
        rec_count = len(recommendations.get('recommendations', []))
        logger.info(f"Successfully generated {rec_count} recommendations for facility {facility_id}")
        
        return {
            "success": True,
            "data": recommendations,
            "message": f"Generated {rec_count} recommendations for facility analysis"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating facility recommendations: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error while generating recommendations"
        )


@router.get("/health")
async def facility_recommendations_health():
    """
    Health check endpoint for facility recommendations service
    """
    try:
        facility_advisor = await get_facility_advisor_service()
        facility_data_service = await get_facility_data_service()
        
        return {
            "success": True,
            "service": "Facility Recommendations AI",
            "status": "healthy",
            "capabilities": {
                "ai_recommendations": True,
                "comprehensive_data_fetching": True,
                "focus_area_filtering": True,
                "demo_mode_available": True
            },
            "supported_focus_areas": [
                "Alternative Fuels",
                "Energy Efficiency", 
                "Process Optimization",
                "Raw Materials",
                "Digital Technology",
                "Waste Management"
            ]
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail="Service health check failed")


@router.get("/data-sources/{facility_id}")
async def get_facility_data_sources(
    facility_id: str,
    facility_data_service: FacilityDataService = Depends(get_facility_data_service),
    _: str = Depends(api_key_auth)
):
    """
    Get information about available data sources for a facility
    
    Args:
        facility_id: ID of the facility to check
        
    Returns:
        Summary of available data sources and completeness
    """
    try:
        logger.info(f"Checking data sources for facility: {facility_id}")
        
        # Fetch comprehensive facility data
        facility_data = await facility_data_service.get_comprehensive_facility_data(facility_id)
        
        # Calculate data availability summary
        data_summary = {
            "facility_id": facility_id,
            "facility_name": facility_data.get('facility', {}).get('name', 'Unknown'),
            "data_sources": {
                "basic_info": {
                    "available": bool(facility_data.get('facility')),
                    "details": "Facility name, location, status, and basic statistics"
                },
                "resource_configuration": {
                    "available": bool(facility_data.get('facility_resources')),
                    "count": len(facility_data.get('facility_resources', [])),
                    "details": "Configured resources with emission factors and consumption data"
                },
                "emission_data": {
                    "available": bool(facility_data.get('recent_emissions')),
                    "records": len(facility_data.get('recent_emissions', [])),
                    "details": "Historical emission data by month and scope"
                },
                "production_data": {
                    "available": bool(facility_data.get('recent_production')),
                    "records": len(facility_data.get('recent_production', [])),
                    "details": "Historical production volumes and capacity utilization"
                },
                "sustainability_targets": {
                    "available": bool(facility_data.get('targets')),
                    "count": len(facility_data.get('targets', [])),
                    "details": "Active sustainability targets and baselines"
                },
                "emission_factors": {
                    "available": bool(facility_data.get('available_emission_factors')),
                    "count": len(facility_data.get('available_emission_factors', [])),
                    "details": "Available emission factors for alternative resource analysis"
                }
            },
            "data_completeness": _calculate_completeness_score(facility_data),
            "recommendation_readiness": _assess_recommendation_readiness(facility_data),
            "data_timestamp": facility_data.get('data_timestamp')
        }
        
        return {
            "success": True,
            "data": data_summary
        }
        
    except Exception as e:
        logger.error(f"Error checking facility data sources: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error checking facility data sources"
        )


def _calculate_completeness_score(facility_data: dict) -> dict:
    """Calculate data completeness score"""
    sources = [
        'facility', 'facility_resources', 'recent_emissions',
        'recent_production', 'targets', 'available_emission_factors'
    ]
    
    available = sum(1 for source in sources if facility_data.get(source))
    total = len(sources)
    percentage = (available / total) * 100
    
    if percentage >= 80:
        grade = "Excellent"
    elif percentage >= 60:
        grade = "Good"
    elif percentage >= 40:
        grade = "Moderate"
    else:
        grade = "Limited"
    
    return {
        "score": percentage,
        "grade": grade,
        "available_sources": available,
        "total_sources": total
    }


def _assess_recommendation_readiness(facility_data: dict) -> dict:
    """Assess readiness for generating recommendations"""
    has_basic_info = bool(facility_data.get('facility'))
    has_resources = bool(facility_data.get('facility_resources'))
    has_emissions = bool(facility_data.get('recent_emissions'))
    has_targets = bool(facility_data.get('targets'))
    
    # Minimum requirements for meaningful recommendations
    min_requirements_met = has_basic_info and (has_resources or has_emissions)
    
    readiness_level = "Not Ready"
    if min_requirements_met:
        if has_basic_info and has_resources and has_emissions and has_targets:
            readiness_level = "Excellent"
        elif has_basic_info and has_resources and (has_emissions or has_targets):
            readiness_level = "Good"
        else:
            readiness_level = "Basic"
    
    return {
        "ready": min_requirements_met,
        "level": readiness_level,
        "requirements": {
            "basic_facility_info": has_basic_info,
            "resource_configuration": has_resources,
            "emission_data": has_emissions,
            "sustainability_targets": has_targets
        },
        "recommendations": {
            "min_data_available": min_requirements_met,
            "quality_level": readiness_level
        }
    }
