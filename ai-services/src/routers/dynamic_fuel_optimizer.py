"""
Dynamic Fuel Optimizer Router
Implements AI-driven fuel optimization with dynamic ranges and real-time cost fetching
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import logging
import asyncio

from ..services.dynamic_cost_service import dynamic_cost_service
from ..services.facility_data_service import FacilityDataService
from ..middleware.auth_middleware import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/dynamic-fuel-optimizer", tags=["Dynamic Fuel Optimizer"])

class DynamicRanges(BaseModel):
    cost_range: Dict[str, float]  # {"min": 3.2, "max": 8.5}
    emission_range: Dict[str, float]  # {"min": 0.38, "max": 2.95}
    energy_range: Dict[str, float]  # {"min": 0.013, "max": 0.032}

class UserSelections(BaseModel):
    cost_value: float
    emission_value: float
    energy_value: float
    tolerance_percent: float = 10.0  # ±10% tolerance

class FuelOptimizationRequest(BaseModel):
    facility_id: str
    selections: UserSelections

class FuelOptimizationResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

@router.get("/initialize/{facility_id}")
async def initialize_optimizer(
    facility_id: str,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """
    Initialize the optimizer by fetching dynamic costs and calculating ranges
    """
    try:
        logger.info(f"Initializing dynamic fuel optimizer for facility {facility_id}")
        
        # Get facility data service
        facility_service = FacilityDataService()
        
        # Fetch all alternative fuels from database
        facility_data = await facility_service.get_facility_data(facility_id)
        
        if not facility_data:
            raise HTTPException(status_code=404, detail="Facility data not found")
        
        # Extract alternative fuels
        alternative_fuels = []
        resources = facility_data.get('resources', [])
        
        for resource in resources:
            if resource.get('is_alternative_fuel'):
                emission_factors = resource.get('emission_factors', [])
                for factor in emission_factors:
                    fuel_entry = {
                        'resource_id': resource.get('id'),
                        'resource_name': resource.get('resource_name'),
                        'emission_factor': factor.get('emission_factor', 0),
                        'emission_factor_unit': factor.get('emission_factor_unit', ''),
                        'heat_content': factor.get('heat_content', 0),
                        'heat_content_unit': factor.get('heat_content_unit', ''),
                        'library_name': factor.get('library_name', ''),
                        'availability_score': factor.get('availability_score', 5)
                    }
                    alternative_fuels.append(fuel_entry)
        
        # If no fuels in facility data, use common Indian alternative fuels
        if not alternative_fuels:
            alternative_fuels = await get_default_alternative_fuels()
        
        # Extract unique fuel names
        fuel_names = list(set([fuel['resource_name'] for fuel in alternative_fuels]))
        
        # Get dynamic costs for all fuels using AI
        logger.info(f"Fetching dynamic costs for {len(fuel_names)} fuels")
        fuel_costs = await dynamic_cost_service.get_all_fuel_costs(fuel_names, facility_id)
        
        # Combine fuel data with dynamic costs
        enhanced_fuels = []
        for fuel in alternative_fuels:
            fuel_name = fuel['resource_name']
            cost_data = fuel_costs.get(fuel_name, {})
            
            enhanced_fuel = {
                **fuel,
                'dynamic_cost': cost_data.get('cost_per_kg_inr', 0),
                'cost_currency': 'INR',
                'cost_confidence': cost_data.get('confidence_level', 'low'),
                'cost_source': cost_data.get('source_info', 'fallback'),
                'cost_location': cost_data.get('location', 'Unknown'),
                'cost_factors': cost_data.get('price_factors', []),
                'last_updated': cost_data.get('last_updated', 'Unknown')
            }
            enhanced_fuels.append(enhanced_fuel)
        
        # Calculate dynamic ranges
        costs = [fuel['dynamic_cost'] for fuel in enhanced_fuels if fuel['dynamic_cost'] > 0]
        emissions = [fuel['emission_factor'] for fuel in enhanced_fuels if fuel['emission_factor'] > 0]
        energies = [fuel['heat_content'] for fuel in enhanced_fuels if fuel['heat_content'] > 0]
        
        dynamic_ranges = {
            'cost_range': {
                'min': min(costs) if costs else 0,
                'max': max(costs) if costs else 100,
                'unit': 'INR/kg'
            },
            'emission_range': {
                'min': min(emissions) if emissions else 0,
                'max': max(emissions) if emissions else 5,
                'unit': 'kgCO2e/kg'
            },
            'energy_range': {
                'min': min(energies) if energies else 0,
                'max': max(energies) if energies else 0.05,
                'unit': 'GJ/kg'
            }
        }
        
        # Start background task to refresh costs periodically
        background_tasks.add_task(schedule_cost_refresh, facility_id)
        
        return {
            'success': True,
            'data': {
                'facility_id': facility_id,
                'fuels': enhanced_fuels,
                'dynamic_ranges': dynamic_ranges,
                'total_fuels': len(enhanced_fuels),
                'cost_fetching_method': 'ai_powered',
                'last_updated': fuel_costs.get(list(fuel_costs.keys())[0], {}).get('fetched_at', 'Unknown') if fuel_costs else 'Unknown'
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error initializing optimizer: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Initialization failed: {str(e)}")

@router.post("/optimize", response_model=FuelOptimizationResponse)
async def optimize_fuels(
    request: FuelOptimizationRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Optimize fuel selection based on user's dynamic range selections
    """
    try:
        logger.info(f"Optimizing fuels for facility {request.facility_id}")
        
        # Get initialized data (this would typically be cached)
        init_response = await initialize_optimizer(request.facility_id, BackgroundTasks(), current_user)
        
        if not init_response['success']:
            raise HTTPException(status_code=500, detail="Failed to get fuel data")
        
        fuels = init_response['data']['fuels']
        ranges = init_response['data']['dynamic_ranges']
        
        # Apply 10% plus/minus filtering based on user selections
        tolerance = request.selections.tolerance_percent / 100.0
        
        # Filter by cost (±10%)
        cost_min = request.selections.cost_value * (1 - tolerance)
        cost_max = request.selections.cost_value * (1 + tolerance)
        cost_filtered = [f for f in fuels if cost_min <= f['dynamic_cost'] <= cost_max]
        
        # Filter by emission factor (±10%)
        emission_min = request.selections.emission_value * (1 - tolerance)
        emission_max = request.selections.emission_value * (1 + tolerance)
        emission_filtered = [f for f in cost_filtered if emission_min <= f['emission_factor'] <= emission_max]
        
        # Filter by energy/heat content (±10%)
        energy_min = request.selections.energy_value * (1 - tolerance)
        energy_max = request.selections.energy_value * (1 + tolerance)
        final_filtered = [f for f in emission_filtered if energy_min <= f['heat_content'] <= energy_max]
        
        # If no fuels match all criteria, relax constraints progressively
        if not final_filtered:
            # Try with larger tolerance
            tolerance = 0.2  # ±20%
            cost_min = request.selections.cost_value * (1 - tolerance)
            cost_max = request.selections.cost_value * (1 + tolerance)
            emission_min = request.selections.emission_value * (1 - tolerance)
            emission_max = request.selections.emission_value * (1 + tolerance)
            energy_min = request.selections.energy_value * (1 - tolerance)
            energy_max = request.selections.energy_value * (1 + tolerance)
            
            final_filtered = [f for f in fuels if 
                            cost_min <= f['dynamic_cost'] <= cost_max and
                            emission_min <= f['emission_factor'] <= emission_max and
                            energy_min <= f['heat_content'] <= energy_max]
        
        # If still no matches, take closest matches
        if not final_filtered:
            # Score each fuel by how close it is to user selections
            scored_fuels = []
            for fuel in fuels:
                cost_diff = abs(fuel['dynamic_cost'] - request.selections.cost_value) / ranges['cost_range']['max']
                emission_diff = abs(fuel['emission_factor'] - request.selections.emission_value) / ranges['emission_range']['max']
                energy_diff = abs(fuel['heat_content'] - request.selections.energy_value) / ranges['energy_range']['max']
                
                total_diff = cost_diff + emission_diff + energy_diff
                scored_fuels.append({**fuel, 'difference_score': total_diff})
            
            # Take top 3 closest matches
            final_filtered = sorted(scored_fuels, key=lambda x: x['difference_score'])[:3]
        
        # Generate AI recommendation
        ai_recommendation = await generate_ai_recommendation(
            final_filtered, 
            request.selections, 
            ranges,
            request.facility_id
        )
        
        # Calculate carbon intensity for each fuel
        for fuel in final_filtered:
            if fuel['heat_content'] > 0:
                fuel['carbon_intensity'] = fuel['emission_factor'] / fuel['heat_content']
            else:
                fuel['carbon_intensity'] = fuel['emission_factor']
        
        # Sort by best overall match (lowest difference score if available, or by carbon intensity)
        if 'difference_score' in final_filtered[0]:
            final_filtered.sort(key=lambda x: x['difference_score'])
        else:
            final_filtered.sort(key=lambda x: x['carbon_intensity'])
        
        return FuelOptimizationResponse(
            success=True,
            data={
                'filtered_fuels': final_filtered,
                'user_selections': request.selections.dict(),
                'applied_ranges': {
                    'cost': {'min': cost_min, 'max': cost_max},
                    'emission': {'min': emission_min, 'max': emission_max},
                    'energy': {'min': energy_min, 'max': energy_max}
                },
                'ai_recommendation': ai_recommendation,
                'total_matches': len(final_filtered),
                'tolerance_applied': f"±{request.selections.tolerance_percent}%",
                'optimization_timestamp': init_response['data']['last_updated']
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error optimizing fuels: {str(e)}")
        return FuelOptimizationResponse(
            success=False,
            error=f"Optimization failed: {str(e)}"
        )

async def generate_ai_recommendation(
    filtered_fuels: List[Dict[str, Any]], 
    selections: UserSelections,
    ranges: Dict[str, Dict[str, float]],
    facility_id: str
) -> str:
    """Generate AI recommendation for filtered fuels"""
    
    if not filtered_fuels:
        return "No fuels match your current criteria. Consider adjusting your selections."
    
    best_fuel = filtered_fuels[0]
    fuel_name = best_fuel['resource_name']
    
    # Get facility location for context
    location = await dynamic_cost_service.get_facility_location(facility_id)
    
    recommendation = f"""**🎯 AI-Optimized Recommendation: {fuel_name}**

**📊 Selection Analysis:**
Based on your specific criteria:
- Cost target: ₹{selections.cost_value:.2f}/kg (±{selections.tolerance_percent}%)
- Emission target: {selections.emission_value:.2f} kgCO₂e/kg (±{selections.tolerance_percent}%)
- Energy target: {selections.energy_value:.3f} GJ/kg (±{selections.tolerance_percent}%)

**🏆 Best Match: {fuel_name}**

**💰 Cost Analysis:**
- Current price: ₹{best_fuel['dynamic_cost']:.2f}/kg in {best_fuel.get('cost_location', location['city'])}
- Cost confidence: {best_fuel.get('cost_confidence', 'medium').title()}
- Price factors: {', '.join(best_fuel.get('cost_factors', ['market analysis']))}

**🌍 Environmental Impact:**
- Emission factor: {best_fuel['emission_factor']:.2f} {best_fuel['emission_factor_unit']}
- Carbon intensity: {best_fuel.get('carbon_intensity', 0):.1f} kgCO₂e/GJ
- Environmental performance: {"Excellent" if best_fuel.get('carbon_intensity', 0) < 50 else "Good" if best_fuel.get('carbon_intensity', 0) < 100 else "Moderate"}

**⚡ Energy Characteristics:**
- Heat content: {best_fuel['heat_content']:.3f} {best_fuel['heat_content_unit']}
- Energy efficiency: {"High" if best_fuel['heat_content'] > 0.02 else "Medium" if best_fuel['heat_content'] > 0.015 else "Standard"}

**🎯 Why This Choice:**
{fuel_name} matches your criteria within the ±{selections.tolerance_percent}% tolerance range. """

    # Add specific reasoning based on fuel characteristics
    if best_fuel['dynamic_cost'] <= selections.cost_value:
        recommendation += f"It offers cost advantage at ₹{best_fuel['dynamic_cost']:.2f}/kg, which is {'below' if best_fuel['dynamic_cost'] < selections.cost_value else 'at'} your target price. "
    
    if best_fuel['emission_factor'] <= selections.emission_value:
        recommendation += f"Environmental benefits include lower emissions than your target at {best_fuel['emission_factor']:.2f} kgCO₂e/kg. "
    
    if len(filtered_fuels) > 1:
        second_best = filtered_fuels[1]
        recommendation += f"""

**🔄 Alternative Option:**
{second_best['resource_name']} is also available at ₹{second_best['dynamic_cost']:.2f}/kg with {second_best['emission_factor']:.2f} kgCO₂e/kg emissions, providing a backup option.

**📈 Implementation Impact:**
- Expected CO₂ reduction: {max(0, (2.5 - best_fuel.get('carbon_intensity', 0)) / 2.5 * 100):.1f}% vs conventional fuels
- Cost impact: {'Savings' if best_fuel['dynamic_cost'] < 7 else 'Premium'} compared to average market rates
- Availability: {best_fuel.get('availability_score', 5)}/10 in your region

**🚀 Next Steps:**
1. Contact local suppliers in {location['city']} area
2. Request sample testing for quality verification
3. Start with 10-15% substitution for trial runs
4. Monitor performance and gradually increase usage"""
    
    return recommendation

async def get_default_alternative_fuels() -> List[Dict[str, Any]]:
    """Get default alternative fuels when facility data is not available"""
    return [
        {
            'resource_name': 'Biomass',
            'emission_factor': 0.39,
            'emission_factor_unit': 'kgCO2e/kg',
            'heat_content': 0.015,
            'heat_content_unit': 'GJ/kg',
            'library_name': 'DEFRA AR4',
            'availability_score': 8
        },
        {
            'resource_name': 'Rice Husk',
            'emission_factor': 0.38,
            'emission_factor_unit': 'kgCO2e/kg',
            'heat_content': 0.013,
            'heat_content_unit': 'GJ/kg',
            'library_name': 'India Market',
            'availability_score': 9
        },
        {
            'resource_name': 'Agricultural Waste',
            'emission_factor': 0.45,
            'emission_factor_unit': 'kgCO2e/kg',
            'heat_content': 0.014,
            'heat_content_unit': 'GJ/kg',
            'library_name': 'India Market',
            'availability_score': 8
        },
        {
            'resource_name': 'Cotton Stalks',
            'emission_factor': 0.48,
            'emission_factor_unit': 'kgCO2e/kg',
            'heat_content': 0.016,
            'heat_content_unit': 'GJ/kg',
            'library_name': 'India Market',
            'availability_score': 6
        },
        {
            'resource_name': 'Waste-derived Fuel',
            'emission_factor': 1.85,
            'emission_factor_unit': 'kgCO2e/kg',
            'heat_content': 0.022,
            'heat_content_unit': 'GJ/kg',
            'library_name': 'Estimated',
            'availability_score': 6
        },
        {
            'resource_name': 'Used Tires',
            'emission_factor': 2.95,
            'emission_factor_unit': 'kgCO2e/kg',
            'heat_content': 0.032,
            'heat_content_unit': 'GJ/kg',
            'library_name': 'Estimated',
            'availability_score': 7
        }
    ]

async def schedule_cost_refresh(facility_id: str):
    """Background task to refresh costs periodically"""
    try:
        await asyncio.sleep(3600)  # Wait 1 hour
        await dynamic_cost_service.refresh_cost_cache(facility_id)
        logger.info(f"Cost cache refreshed for facility {facility_id}")
    except Exception as e:
        logger.error(f"Error refreshing cost cache: {str(e)}")

@router.get("/refresh-costs/{facility_id}")
async def refresh_costs(
    facility_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Manually refresh cost data"""
    try:
        await dynamic_cost_service.refresh_cost_cache(facility_id)
        return {
            'success': True,
            'message': 'Cost cache refreshed successfully'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to refresh costs: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        'status': 'healthy',
        'service': 'dynamic-fuel-optimizer',
        'features': [
            'ai_cost_fetching',
            'dynamic_ranges',
            'plus_minus_filtering',
            'real_time_optimization'
        ]
    }
