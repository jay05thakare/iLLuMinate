"""
Fuel Cost Analysis Router
Provides AI-powered cost analysis and recommendations for alternative fuels
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import logging

from ..services.fuel_cost_analyzer import fuel_cost_analyzer
from ..services.facility_data_service import FacilityDataService
from ..middleware.auth_middleware import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/fuel-cost-analysis", tags=["Fuel Cost Analysis"])

class UserPreferences(BaseModel):
    cost: int = 5  # 1-10 scale
    emission: int = 5  # 1-10 scale  
    energy: int = 5  # 1-10 scale

class FuelCostAnalysisRequest(BaseModel):
    facility_id: str
    preferences: UserPreferences = UserPreferences()
    include_conventional_fuels: bool = False

class FuelCostAnalysisResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

@router.post("/analyze", response_model=FuelCostAnalysisResponse)
async def analyze_fuel_costs(
    request: FuelCostAnalysisRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Analyze fuel costs and provide AI-powered recommendations
    """
    try:
        logger.info(f"Starting fuel cost analysis for facility {request.facility_id}")
        
        # Get facility data service
        facility_service = FacilityDataService()
        
        # Fetch facility data including emission factors
        facility_data = await facility_service.get_facility_data(request.facility_id)
        
        if not facility_data:
            raise HTTPException(status_code=404, detail="Facility data not found")
        
        # Extract alternative fuels from facility data
        alternative_fuels = []
        
        # Get resources data from facility
        resources = facility_data.get('resources', [])
        
        for resource in resources:
            # Check if this is an alternative fuel
            if resource.get('category') == 'stationary_combustion' and resource.get('is_alternative_fuel'):
                # Get emission factors for this resource
                emission_factors = resource.get('emission_factors', [])
                
                for factor in emission_factors:
                    fuel_data = {
                        'resource_id': resource.get('id'),
                        'resource_name': resource.get('resource_name'),
                        'category': resource.get('category'),
                        'description': resource.get('description', ''),
                        'emission_factor': factor.get('emission_factor', 0),
                        'emission_factor_unit': factor.get('emission_factor_unit', ''),
                        'heat_content': factor.get('heat_content', 0),
                        'heat_content_unit': factor.get('heat_content_unit', ''),
                        'library_name': factor.get('library_name', ''),
                        'library_version': factor.get('library_version', ''),
                        'availability_score': factor.get('availability_score', 5)
                    }
                    alternative_fuels.append(fuel_data)
        
        # If no alternative fuels found in facility data, get from database
        if not alternative_fuels:
            logger.info("No alternative fuels found in facility data, fetching from database")
            
            # Create sample alternative fuels based on database seeded data
            sample_fuels = [
                {
                    'resource_name': 'Biomass',
                    'category': 'stationary_combustion',
                    'description': 'Biomass for alternative fuel co-processing',
                    'emission_factor': 0.39,  # From DEFRA
                    'emission_factor_unit': 'kgCO2e/kg',
                    'heat_content': 0.015,
                    'heat_content_unit': 'GJ/kg',
                    'library_name': 'DEFRA',
                    'library_version': 'AR4',
                    'availability_score': 5
                },
                {
                    'resource_name': 'Waste-derived Fuel',
                    'category': 'stationary_combustion', 
                    'description': 'Municipal and industrial waste-derived fuel',
                    'emission_factor': 1.85,  # Estimated
                    'emission_factor_unit': 'kgCO2e/kg',
                    'heat_content': 0.022,
                    'heat_content_unit': 'GJ/kg',
                    'library_name': 'Estimated',
                    'library_version': 'India',
                    'availability_score': 6
                },
                {
                    'resource_name': 'Used Tires',
                    'category': 'stationary_combustion',
                    'description': 'Shredded used tires for fuel',
                    'emission_factor': 2.95,  # Estimated
                    'emission_factor_unit': 'kgCO2e/kg',
                    'heat_content': 0.032,
                    'heat_content_unit': 'GJ/kg',
                    'library_name': 'Estimated',
                    'library_version': 'India',
                    'availability_score': 7
                },
                {
                    'resource_name': 'Agricultural Waste',
                    'category': 'stationary_combustion',
                    'description': 'Agricultural residues and waste',
                    'emission_factor': 0.45,  # Estimated
                    'emission_factor_unit': 'kgCO2e/kg',
                    'heat_content': 0.014,
                    'heat_content_unit': 'GJ/kg',
                    'library_name': 'Estimated',
                    'library_version': 'India',
                    'availability_score': 8
                },
                {
                    'resource_name': 'Rice Husk',
                    'category': 'stationary_combustion',
                    'description': 'Rice husk biomass fuel',
                    'emission_factor': 0.42,  # Estimated
                    'emission_factor_unit': 'kgCO2e/kg',
                    'heat_content': 0.013,
                    'heat_content_unit': 'GJ/kg',
                    'library_name': 'Estimated',
                    'library_version': 'India',
                    'availability_score': 9
                },
                {
                    'resource_name': 'Cotton Stalks',
                    'category': 'stationary_combustion',
                    'description': 'Cotton stalk agricultural waste',
                    'emission_factor': 0.48,  # Estimated
                    'emission_factor_unit': 'kgCO2e/kg',
                    'heat_content': 0.016,
                    'heat_content_unit': 'GJ/kg',
                    'library_name': 'Estimated',
                    'library_version': 'India',
                    'availability_score': 6
                }
            ]
            alternative_fuels = sample_fuels
        
        logger.info(f"Found {len(alternative_fuels)} alternative fuels for analysis")
        
        # Convert preferences to dict
        preferences_dict = {
            'cost': request.preferences.cost,
            'emission': request.preferences.emission,
            'energy': request.preferences.energy
        }
        
        # Perform comprehensive analysis
        analysis_result = fuel_cost_analyzer.analyze_fuels_comprehensive(
            alternative_fuels, 
            preferences_dict
        )
        
        logger.info("Fuel cost analysis completed successfully")
        
        return FuelCostAnalysisResponse(
            success=True,
            data=analysis_result
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in fuel cost analysis: {str(e)}")
        return FuelCostAnalysisResponse(
            success=False,
            error=f"Analysis failed: {str(e)}"
        )

@router.get("/market-costs", response_model=Dict[str, Any])
async def get_market_costs(
    fuel_name: Optional[str] = Query(None, description="Specific fuel name"),
    current_user: dict = Depends(get_current_user)
):
    """
    Get current market costs for alternative fuels in India
    """
    try:
        if fuel_name:
            cost_data = fuel_cost_analyzer.get_indian_market_cost(fuel_name)
            return {
                'success': True,
                'data': {
                    'fuel_name': fuel_name,
                    'cost_data': cost_data,
                    'currency': 'INR'
                }
            }
        else:
            # Return all available market costs
            all_costs = {}
            for fuel in fuel_cost_analyzer.INDIAN_FUEL_COSTS.keys():
                all_costs[fuel] = fuel_cost_analyzer.get_indian_market_cost(fuel)
            
            return {
                'success': True,
                'data': {
                    'all_costs': all_costs,
                    'currency': 'INR',
                    'last_updated': '2024-01-01',  # You may want to make this dynamic
                    'exchange_rate_usd_inr': fuel_cost_analyzer.USD_TO_INR_RATE
                }
            }
            
    except Exception as e:
        logger.error(f"Error getting market costs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get market costs: {str(e)}")

@router.post("/compare-fuels")
async def compare_fuels(
    fuel_names: List[str],
    preferences: UserPreferences = UserPreferences(),
    current_user: dict = Depends(get_current_user)
):
    """
    Compare specific alternative fuels
    """
    try:
        # Get data for requested fuels
        fuel_data = []
        
        for fuel_name in fuel_names:
            # Create fuel data entry
            if fuel_name == 'Biomass':
                fuel_entry = {
                    'resource_name': 'Biomass',
                    'emission_factor': 0.39,
                    'heat_content': 0.015,
                    'emission_factor_unit': 'kgCO2e/kg',
                    'heat_content_unit': 'GJ/kg'
                }
            elif fuel_name == 'Waste-derived Fuel':
                fuel_entry = {
                    'resource_name': 'Waste-derived Fuel',
                    'emission_factor': 1.85,
                    'heat_content': 0.022,
                    'emission_factor_unit': 'kgCO2e/kg',
                    'heat_content_unit': 'GJ/kg'
                }
            elif fuel_name == 'Used Tires':
                fuel_entry = {
                    'resource_name': 'Used Tires',
                    'emission_factor': 2.95,
                    'heat_content': 0.032,
                    'emission_factor_unit': 'kgCO2e/kg',
                    'heat_content_unit': 'GJ/kg'
                }
            elif fuel_name == 'Agricultural Waste':
                fuel_entry = {
                    'resource_name': 'Agricultural Waste',
                    'emission_factor': 0.45,
                    'heat_content': 0.014,
                    'emission_factor_unit': 'kgCO2e/kg',
                    'heat_content_unit': 'GJ/kg'
                }
            else:
                continue  # Skip unknown fuels
            
            fuel_data.append(fuel_entry)
        
        if not fuel_data:
            raise HTTPException(status_code=400, detail="No valid fuels provided for comparison")
        
        # Perform analysis
        preferences_dict = {
            'cost': preferences.cost,
            'emission': preferences.emission,
            'energy': preferences.energy
        }
        
        analysis_result = fuel_cost_analyzer.analyze_fuels_comprehensive(
            fuel_data, 
            preferences_dict
        )
        
        return {
            'success': True,
            'data': analysis_result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error comparing fuels: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        'status': 'healthy',
        'service': 'fuel-cost-analysis',
        'features': [
            'cost_analysis',
            'ai_recommendations', 
            'market_costs',
            'fuel_comparison'
        ]
    }
