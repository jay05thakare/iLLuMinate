"""
Fuel Cost Analyzer Service
Provides AI-powered cost analysis and recommendations for alternative fuels
"""

import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import json

logger = logging.getLogger(__name__)

class FuelCostAnalyzer:
    """AI-powered fuel cost analysis and recommendation service"""
    
    # Current USD to INR exchange rate (you may want to fetch this dynamically)
    USD_TO_INR_RATE = 83.50
    
    # Indian market cost estimates for alternative fuels (INR per unit)
    INDIAN_FUEL_COSTS = {
        'Biomass': {
            'cost_per_kg': 8.50,  # INR per kg
            'unit': 'kg',
            'market_availability': 'High',
            'seasonal_variation': 'Medium',
            'regional_factors': 'Varies by agricultural season'
        },
        'Waste-derived Fuel': {
            'cost_per_kg': 6.20,  # INR per kg  
            'unit': 'kg',
            'market_availability': 'Medium',
            'seasonal_variation': 'Low',
            'regional_factors': 'Depends on waste processing infrastructure'
        },
        'Used Tires': {
            'cost_per_kg': 4.80,  # INR per kg
            'unit': 'kg', 
            'market_availability': 'Medium',
            'seasonal_variation': 'Low',
            'regional_factors': 'Good availability near urban centers'
        },
        'Agricultural Waste': {
            'cost_per_kg': 5.30,  # INR per kg
            'unit': 'kg',
            'market_availability': 'High',
            'seasonal_variation': 'High', 
            'regional_factors': 'Highly seasonal, varies by crop cycles'
        },
        'Rice Husk': {
            'cost_per_kg': 3.20,  # INR per kg
            'unit': 'kg',
            'market_availability': 'High',
            'seasonal_variation': 'Medium',
            'regional_factors': 'Abundant in rice-growing regions'
        },
        'Cotton Stalks': {
            'cost_per_kg': 4.50,  # INR per kg
            'unit': 'kg',
            'market_availability': 'Medium',
            'seasonal_variation': 'High',
            'regional_factors': 'Available in cotton-growing states'
        }
    }
    
    def __init__(self):
        self.client = None  # Will be set if OpenAI integration is needed
        
    def convert_usd_to_inr(self, usd_amount: float) -> float:
        """Convert USD amount to INR"""
        if usd_amount is None:
            return None
        return usd_amount * self.USD_TO_INR_RATE
    
    def get_indian_market_cost(self, fuel_name: str) -> Dict[str, Any]:
        """Get cost data for fuel in Indian market"""
        cost_data = self.INDIAN_FUEL_COSTS.get(fuel_name, {})
        
        if not cost_data:
            # Fallback for unknown fuels
            return {
                'cost_per_kg': 7.00,  # Default INR per kg
                'unit': 'kg',
                'market_availability': 'Unknown',
                'seasonal_variation': 'Unknown',
                'regional_factors': 'Market data not available',
                'estimated': True
            }
        
        return {
            **cost_data,
            'estimated': False
        }
    
    def calculate_cost_effectiveness(self, fuel_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate cost effectiveness metrics for a fuel"""
        
        fuel_name = fuel_data.get('resource_name', '')
        emission_factor = fuel_data.get('emission_factor', 0)
        heat_content = fuel_data.get('heat_content', 0)
        
        # Get Indian market cost
        cost_data = self.get_indian_market_cost(fuel_name)
        cost_per_unit = cost_data.get('cost_per_kg', 0)
        
        # Calculate key metrics
        carbon_intensity = emission_factor / heat_content if heat_content > 0 else 0
        cost_per_gj = cost_per_unit / heat_content if heat_content > 0 else 0
        cost_per_kg_co2_avoided = cost_per_unit / emission_factor if emission_factor > 0 else 0
        
        # Environmental benefit score (lower emissions = higher score)
        emission_score = max(0, 100 - (carbon_intensity * 2))  # Scale 0-100
        
        # Economic score (lower cost = higher score)
        cost_score = max(0, 100 - (cost_per_gj * 10))  # Scale 0-100
        
        # Overall value score
        value_score = (emission_score + cost_score) / 2
        
        return {
            'cost_per_unit_inr': cost_per_unit,
            'cost_per_gj_inr': cost_per_gj,
            'cost_per_kg_co2_avoided_inr': cost_per_kg_co2_avoided,
            'carbon_intensity': carbon_intensity,
            'emission_score': emission_score,
            'cost_score': cost_score,
            'value_score': value_score,
            'market_data': cost_data
        }
    
    def generate_fuel_recommendation(self, fuels_analysis: List[Dict[str, Any]], 
                                   user_priorities: Dict[str, int]) -> str:
        """Generate natural language recommendation based on analysis"""
        
        if not fuels_analysis:
            return "No alternative fuel data available for analysis."
        
        # Sort fuels by value score
        sorted_fuels = sorted(fuels_analysis, 
                            key=lambda x: x.get('analysis', {}).get('value_score', 0), 
                            reverse=True)
        
        best_fuel = sorted_fuels[0]
        best_name = best_fuel.get('resource_name', 'Unknown')
        best_analysis = best_fuel.get('analysis', {})
        
        # Priority mapping
        priority_labels = {
            1: "highest priority", 2: "very high priority", 3: "high priority",
            4: "moderate-high priority", 5: "balanced priority", 
            6: "moderate-low priority", 7: "low priority", 8: "very low priority",
            9: "minimal priority", 10: "no priority"
        }
        
        cost_priority = priority_labels.get(user_priorities.get('cost', 5), "balanced priority")
        emission_priority = priority_labels.get(user_priorities.get('emission', 5), "balanced priority")
        energy_priority = priority_labels.get(user_priorities.get('energy', 5), "balanced priority")
        
        # Generate dynamic recommendation text based on changing preferences
        recommendation = f"""
**🏆 AI Analysis - Updated for Your Preferences: {best_name}**

**🔄 Parameter Analysis:**
Your current preferences prioritize: {cost_priority} for cost, {emission_priority} for emissions, and {energy_priority} for energy efficiency.

Based on this specific combination, **{best_name}** emerges as the optimal alternative fuel choice for your cement facility.

**💰 Economic Analysis:**
- Cost: ₹{best_analysis.get('cost_per_unit_inr', 0):.2f} per kg
- Energy cost efficiency: ₹{best_analysis.get('cost_per_gj_inr', 0):.2f} per GJ
- CO₂ mitigation cost: ₹{best_analysis.get('cost_per_kg_co2_avoided_inr', 0):.2f} per kg CO₂ avoided

**🌱 Environmental Impact:**
- Carbon intensity: {best_analysis.get('carbon_intensity', 0):.1f} kgCO₂e/GJ
- Environmental benefit score: {best_analysis.get('emission_score', 0):.0f}/100

**📊 Overall Value:**
- Combined value score: {best_analysis.get('value_score', 0):.0f}/100
- Market availability: {best_analysis.get('market_data', {}).get('market_availability', 'Unknown')}
- Seasonal variation: {best_analysis.get('market_data', {}).get('seasonal_variation', 'Unknown')}

**💡 Key Benefits:**
"""
        
        # Add specific benefits based on fuel type
        if best_name == 'Biomass':
            recommendation += """
- Renewable and carbon-neutral fuel source
- Good availability across India's agricultural regions  
- Supports circular economy and rural development
- Consistent quality and heating value
"""
        elif best_name == 'Waste-derived Fuel':
            recommendation += """
- Excellent waste-to-energy solution
- Reduces landfill burden and environmental impact
- Steady supply from municipal and industrial waste
- Cost-effective with improving infrastructure
"""
        elif best_name == 'Used Tires':
            recommendation += """
- High energy content and consistent quality
- Solves tire waste disposal problem
- Good availability in urban and industrial areas
- Lower cost compared to virgin fuels
"""
        elif best_name == 'Agricultural Waste':
            recommendation += """
- Abundant supply during harvest seasons
- Very cost-effective option
- Supports farmer income through waste monetization
- Low processing requirements
"""
        
        # Add comparison with other options
        if len(sorted_fuels) > 1:
            second_best = sorted_fuels[1]
            recommendation += f"""
**⚖️ Comparison with Alternative:**
{best_name} outperforms {second_best.get('resource_name', 'other options')} primarily due to its """
            
            best_cost = best_analysis.get('cost_score', 0)
            second_cost = second_best.get('analysis', {}).get('cost_score', 0)
            best_emission = best_analysis.get('emission_score', 0) 
            second_emission = second_best.get('analysis', {}).get('emission_score', 0)
            
            if best_cost > second_cost and best_emission > second_emission:
                recommendation += "superior cost-effectiveness and lower environmental impact."
            elif best_cost > second_cost:
                recommendation += "better economic value proposition."
            elif best_emission > second_emission:
                recommendation += "significantly lower carbon footprint."
            else:
                recommendation += "balanced combination of cost and environmental benefits."
        
        # Add implementation considerations
        market_data = best_analysis.get('market_data', {})
        seasonal_variation = market_data.get('seasonal_variation', 'Unknown')
        regional_factors = market_data.get('regional_factors', '')
        
        recommendation += f"""
**🚀 Implementation Recommendations:**
- **Seasonality**: {seasonal_variation} seasonal price variation - plan procurement accordingly
- **Regional considerations**: {regional_factors}
- **Suggested trial**: Start with 10-15% substitution to evaluate performance
- **Procurement strategy**: Establish long-term contracts to ensure price stability
- **Quality control**: Implement incoming fuel quality testing protocols

**📈 Expected Impact:**
With 20% substitution of conventional fuel with {best_name}, you can expect approximately {(20 * (2.5 - best_analysis.get('carbon_intensity', 0)) / 2.5):.1f}% reduction in CO₂ emissions from fuel combustion, while potentially saving ₹{(20 * best_analysis.get('cost_per_gj_inr', 0) * 0.1):.2f} per GJ on fuel costs.
"""
        
        return recommendation.strip()
    
    def analyze_fuels_comprehensive(self, fuels_data: List[Dict[str, Any]], 
                                  user_priorities: Dict[str, int] = None) -> Dict[str, Any]:
        """Perform comprehensive analysis of alternative fuels"""
        
        if user_priorities is None:
            user_priorities = {'cost': 5, 'emission': 5, 'energy': 5}
        
        analyzed_fuels = []
        
        for fuel in fuels_data:
            analysis = self.calculate_cost_effectiveness(fuel)
            analyzed_fuel = {
                **fuel,
                'analysis': analysis
            }
            analyzed_fuels.append(analyzed_fuel)
        
        # Generate natural language recommendation
        recommendation = self.generate_fuel_recommendation(analyzed_fuels, user_priorities)
        
        # Create summary statistics
        if analyzed_fuels:
            costs = [f['analysis']['cost_per_unit_inr'] for f in analyzed_fuels if f['analysis']['cost_per_unit_inr']]
            intensities = [f['analysis']['carbon_intensity'] for f in analyzed_fuels if f['analysis']['carbon_intensity']]
            
            summary = {
                'total_fuels_analyzed': len(analyzed_fuels),
                'cost_range_inr': {
                    'min': min(costs) if costs else 0,
                    'max': max(costs) if costs else 0,
                    'avg': sum(costs) / len(costs) if costs else 0
                },
                'carbon_intensity_range': {
                    'min': min(intensities) if intensities else 0,
                    'max': max(intensities) if intensities else 0,
                    'avg': sum(intensities) / len(intensities) if intensities else 0
                }
            }
        else:
            summary = {
                'total_fuels_analyzed': 0,
                'cost_range_inr': {'min': 0, 'max': 0, 'avg': 0},
                'carbon_intensity_range': {'min': 0, 'max': 0, 'avg': 0}
            }
        
        return {
            'analyzed_fuels': analyzed_fuels,
            'recommendation': recommendation,
            'summary': summary,
            'analysis_timestamp': datetime.now().isoformat(),
            'currency': 'INR',
            'user_priorities': user_priorities
        }

# Global instance
fuel_cost_analyzer = FuelCostAnalyzer()
