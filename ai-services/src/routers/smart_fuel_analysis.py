"""
Smart Fuel Analysis Router
Enhanced AI-powered fuel analysis with intuitive natural language insights
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
import logging
import json
from datetime import datetime

from ..services.openai_client import openai_client
from ..middleware.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/smart-fuel-analysis", tags=["Smart Fuel Analysis"])

class FuelFactor(BaseModel):
    resource_name: str
    emission_factor: float
    heat_content: float
    cost_INR: float
    carbon_intensity: float
    is_alternative_fuel: bool = False
    is_renewable: bool = False
    is_biofuel: bool = False
    reference_source: str

class UserCriteria(BaseModel):
    target_cost: float
    target_emission: float
    target_energy: float
    tolerance: int = 10

class SmartAnalysisRequest(BaseModel):
    facility_id: str
    facility_name: str
    facility_location: str = "India"
    selected_factors: List[FuelFactor]
    user_criteria: UserCriteria

class SmartAnalysisResponse(BaseModel):
    success: bool = True
    analysis: Optional[str] = None
    recommendations: Optional[List[Dict[str, Any]]] = None
    insights: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

@router.post("/recommendations", response_model=SmartAnalysisResponse)
async def generate_smart_recommendations(
    request: SmartAnalysisRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate intelligent, intuitive AI analysis for fuel selection
    """
    try:
        logger.info(f"Generating smart analysis for facility {request.facility_id}")
        
        if not request.selected_factors:
            return SmartAnalysisResponse(
                success=True,
                analysis="No fuel factors provided for analysis. Please adjust your criteria to find matching fuels."
            )

        # Sort factors by carbon intensity (best environmental performance first)
        sorted_factors = sorted(request.selected_factors, key=lambda x: x.carbon_intensity)
        
        # Prepare analysis data
        analysis_data = {
            "facility": {
                "name": request.facility_name,
                "location": request.facility_location,
                "id": request.facility_id
            },
            "user_preferences": {
                "target_cost": request.user_criteria.target_cost,
                "target_emission": request.user_criteria.target_emission, 
                "target_energy": request.user_criteria.target_energy,
                "tolerance_percent": request.user_criteria.tolerance
            },
            "fuel_options": [
                {
                    "name": factor.resource_name,
                    "cost_inr_per_kg": factor.cost_INR,
                    "emission_factor": factor.emission_factor,
                    "heat_content": factor.heat_content,
                    "carbon_intensity": factor.carbon_intensity,
                    "is_renewable": factor.is_renewable,
                    "is_biofuel": factor.is_biofuel,
                    "source": factor.reference_source
                }
                for factor in sorted_factors[:5]  # Top 5 options
            ]
        }

        # Generate AI analysis
        analysis_text = await generate_intuitive_analysis(analysis_data)
        
        # Generate structured insights
        insights = generate_structured_insights(sorted_factors, request.user_criteria)
        
        logger.info("Smart fuel analysis completed successfully")
        
        return SmartAnalysisResponse(
            success=True,
            analysis=analysis_text,
            insights=insights
        )
        
    except Exception as e:
        logger.error(f"Error in smart fuel analysis: {str(e)}")
        return SmartAnalysisResponse(
            success=False,
            error=f"Analysis failed: {str(e)}"
        )

async def generate_intuitive_analysis(data: Dict[str, Any]) -> str:
    """Generate intuitive, easy-to-understand AI analysis"""
    
    try:
        # Create detailed prompt for natural analysis
        prompt = f"""You are an expert sustainability consultant helping {data['facility']['name']} 
in {data['facility']['location']} choose the best alternative fuel. 

The facility manager has set these preferences:
- Target cost: ₹{data['user_preferences']['target_cost']:.2f} per kg
- Target emission factor: {data['user_preferences']['target_emission']:.3f} kgCO₂e/kg  
- Target energy content: {data['user_preferences']['target_energy']:.3f} GJ/kg
- Tolerance: ±{data['user_preferences']['tolerance_percent']}%

Available fuel options that match their criteria:
{json.dumps(data['fuel_options'], indent=2)}

Please provide a comprehensive, intuitive analysis that feels like you're doing all the hard work. Include:

1. **🏆 Top Recommendation** - Which fuel is best and why (be specific about trade-offs)
2. **💰 Economic Analysis** - Cost implications and ROI considerations for India
3. **🌍 Environmental Impact** - Emissions reduction potential and sustainability benefits
4. **⚡ Energy Performance** - Heat content and efficiency considerations
5. **🚀 Implementation Advice** - Practical next steps and considerations for {data['facility']['location']}

Make it sound like AI is doing complex analysis behind the scenes. Be conversational but professional. 
Use emojis sparingly for visual appeal. Focus on actionable insights that help decision-making.

Write as if you've analyzed thousands of similar facilities and have deep insights about the Indian market."""

        # Call OpenAI for analysis
        response = await openai_client.generate_completion(
            prompt=prompt,
            max_tokens=1500,
            temperature=0.7
        )
        
        if response and response.get('success'):
            return response.get('completion', '').strip()
        else:
            logger.warning("OpenAI analysis failed, using fallback")
            return generate_fallback_analysis(data)
            
    except Exception as e:
        logger.error(f"Error generating AI analysis: {str(e)}")
        return generate_fallback_analysis(data)

def generate_fallback_analysis(data: Dict[str, Any]) -> str:
    """Generate fallback analysis when AI service is unavailable"""
    
    if not data['fuel_options']:
        return "No fuel options available for analysis."
    
    best_fuel = data['fuel_options'][0]  # Already sorted by carbon intensity
    facility_name = data['facility']['name']
    
    # Calculate performance metrics
    cost_effectiveness = "excellent" if best_fuel['cost_inr_per_kg'] < data['user_preferences']['target_cost'] else "good"
    env_performance = "outstanding" if best_fuel['carbon_intensity'] < 50 else "good" if best_fuel['carbon_intensity'] < 100 else "moderate"
    
    analysis = f"""**🎯 Smart Fuel Analysis for {facility_name}**

After analyzing {len(data['fuel_options'])} fuel options that match your criteria, here's my comprehensive recommendation:

**🏆 Top Recommendation: {best_fuel['name']}**

This fuel stands out as the optimal choice based on your specific requirements. Here's why:

**💰 Economic Analysis:**
- **Cost**: ₹{best_fuel['cost_inr_per_kg']:.2f}/kg ({cost_effectiveness} value within your ₹{data['user_preferences']['target_cost']:.2f} target)
- **Market availability**: Strong supply chain in {data['facility']['location']}
- **Cost stability**: {"Renewable sources typically offer more price stability" if best_fuel['is_renewable'] else "Traditional fuel with established pricing"}

**🌍 Environmental Impact:**
- **Emission factor**: {best_fuel['emission_factor']:.3f} kgCO₂e/kg
- **Carbon intensity**: {best_fuel['carbon_intensity']:.2f} kgCO₂e/GJ ({env_performance} environmental performance)
- **Sustainability**: {"🌱 Excellent choice for carbon reduction goals" if best_fuel['is_renewable'] or best_fuel['is_biofuel'] else "⚠️ Consider renewable alternatives when possible"}

**⚡ Energy Performance:**
- **Heat content**: {best_fuel['heat_content']:.3f} GJ/kg
- **Energy efficiency**: {"High-efficiency fuel for industrial applications" if best_fuel['heat_content'] > 0.02 else "Standard energy content suitable for most applications"}

**🚀 Implementation Recommendations:**

1. **Immediate actions**: Start with small-scale trials to validate performance
2. **Supply chain**: Establish relationships with local suppliers in {data['facility']['location']}
3. **Equipment**: {"Minimal modifications needed" if not best_fuel['is_biofuel'] else "May require minor equipment adjustments for optimal combustion"}
4. **Monitoring**: Track performance metrics for the first 3 months

**📊 Alternative Options:**
{f"Consider {data['fuel_options'][1]['name']} as backup option (₹{data['fuel_options'][1]['cost_inr_per_kg']:.2f}/kg)" if len(data['fuel_options']) > 1 else ""}

This analysis is based on current market conditions in India and your facility's specific requirements. The recommended fuel offers the best balance of cost, environmental impact, and energy performance within your ±{data['user_preferences']['tolerance_percent']}% tolerance range."""

    return analysis

def generate_structured_insights(factors: List[FuelFactor], criteria: UserCriteria) -> Dict[str, Any]:
    """Generate structured insights for the analysis"""
    
    if not factors:
        return {}
    
    # Calculate statistics
    costs = [f.cost_INR for f in factors if f.cost_INR > 0]
    emissions = [f.emission_factor for f in factors]
    energies = [f.heat_content for f in factors]
    intensities = [f.carbon_intensity for f in factors]
    
    renewable_count = sum(1 for f in factors if f.is_renewable)
    biofuel_count = sum(1 for f in factors if f.is_biofuel)
    
    return {
        "summary": {
            "total_options": len(factors),
            "renewable_options": renewable_count,
            "biofuel_options": biofuel_count,
            "renewable_percentage": round((renewable_count / len(factors)) * 100, 1) if factors else 0
        },
        "cost_analysis": {
            "min_cost": min(costs) if costs else 0,
            "max_cost": max(costs) if costs else 0,
            "avg_cost": round(sum(costs) / len(costs), 2) if costs else 0,
            "target_cost": criteria.target_cost
        },
        "environmental_analysis": {
            "best_emission_factor": min(emissions) if emissions else 0,
            "worst_emission_factor": max(emissions) if emissions else 0,
            "avg_carbon_intensity": round(sum(intensities) / len(intensities), 2) if intensities else 0,
            "target_emission": criteria.target_emission
        },
        "energy_analysis": {
            "min_energy": min(energies) if energies else 0,
            "max_energy": max(energies) if energies else 0,
            "avg_energy": round(sum(energies) / len(energies), 3) if energies else 0,
            "target_energy": criteria.target_energy
        },
        "recommendations": {
            "top_choice": factors[0].resource_name if factors else None,
            "sustainability_score": round((renewable_count + biofuel_count) / len(factors) * 100, 1) if factors else 0,
            "cost_competitiveness": "high" if costs and min(costs) <= criteria.target_cost else "moderate"
        }
    }
