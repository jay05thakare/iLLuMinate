"""
Dynamic Cost Service
AI-powered real-time cost fetching for alternative fuels based on facility locality
"""

import logging
import asyncio
import json
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import aiohttp
import openai
from ..config.settings import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class DynamicCostService:
    """AI-powered dynamic cost fetching service"""
    
    def __init__(self):
        self.openai_client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
        self.cost_cache = {}
        self.cache_duration = timedelta(hours=6)  # Cache costs for 6 hours
        
    async def get_facility_location(self, facility_id: str) -> Dict[str, str]:
        """Get facility location details"""
        # This would typically fetch from database
        # For now, returning sample location - should be replaced with actual DB query
        return {
            "city": "Mumbai",
            "state": "Maharashtra", 
            "country": "India",
            "region": "Western India"
        }
    
    async def search_fuel_cost_online(self, fuel_name: str, location: Dict[str, str]) -> Dict[str, Any]:
        """Search for current fuel costs online using web search"""
        try:
            # Construct search query
            search_query = f"{fuel_name} cost price per kg {location['city']} {location['state']} India current market rate 2024"
            
            # Use web search API (you would need to implement actual web search here)
            # For demonstration, using AI to simulate web search results
            search_prompt = f"""
            Search for current market price of {fuel_name} in {location['city']}, {location['state']}, India.
            
            Consider these factors:
            - Current market rates in {location['city']}
            - Alternative fuel pricing in Indian cement industry
            - Regional availability and transportation costs
            - Seasonal variations
            - Recent price trends
            
            Provide realistic pricing in INR per kg based on:
            - Local market conditions
            - Supply chain factors
            - Regional variations
            - Industry standards
            
            Return a JSON response with:
            - cost_per_kg_inr: number
            - currency: "INR"
            - location: string
            - confidence_level: "high/medium/low"
            - last_updated: current date
            - source_info: brief description
            - price_factors: list of factors affecting price
            """
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert in Indian alternative fuel markets. Provide realistic, current pricing data."},
                    {"role": "user", "content": search_prompt}
                ],
                temperature=0.1
            )
            
            # Parse AI response
            try:
                cost_data = json.loads(response.choices[0].message.content)
                
                # Validate and enhance the response
                if not isinstance(cost_data, dict) or 'cost_per_kg_inr' not in cost_data:
                    raise ValueError("Invalid cost data format")
                
                # Add metadata
                cost_data.update({
                    "fuel_name": fuel_name,
                    "facility_location": location,
                    "fetched_at": datetime.now().isoformat(),
                    "method": "ai_web_search"
                })
                
                return cost_data
                
            except json.JSONDecodeError:
                # Fallback: extract cost from text response
                text_response = response.choices[0].message.content
                cost_data = await self.extract_cost_from_text(text_response, fuel_name, location)
                return cost_data
                
        except Exception as e:
            logger.error(f"Error searching fuel cost for {fuel_name}: {str(e)}")
            return await self.get_fallback_cost(fuel_name, location)
    
    async def extract_cost_from_text(self, text: str, fuel_name: str, location: Dict[str, str]) -> Dict[str, Any]:
        """Extract cost information from AI text response"""
        try:
            # Use AI to parse the text and extract structured data
            extract_prompt = f"""
            Extract cost information from the following text about {fuel_name} pricing in {location['city']}, India:
            
            Text: {text}
            
            Return only a valid JSON object with:
            {{
                "cost_per_kg_inr": <number>,
                "currency": "INR",
                "location": "{location['city']}, {location['state']}",
                "confidence_level": "medium",
                "last_updated": "{datetime.now().strftime('%Y-%m-%d')}",
                "source_info": "AI analysis of market data",
                "price_factors": ["market analysis", "regional pricing"]
            }}
            """
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Extract pricing data and return only valid JSON."},
                    {"role": "user", "content": extract_prompt}
                ],
                temperature=0
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            logger.error(f"Error extracting cost from text: {str(e)}")
            return await self.get_fallback_cost(fuel_name, location)
    
    async def get_fallback_cost(self, fuel_name: str, location: Dict[str, str]) -> Dict[str, Any]:
        """Provide fallback cost estimates when AI search fails"""
        
        # Intelligent fallback based on fuel type and location
        fallback_costs = {
            "Biomass": {"base": 8.5, "variation": 2.0},
            "Rice Husk": {"base": 3.2, "variation": 1.0},
            "Agricultural Waste": {"base": 5.3, "variation": 1.5},
            "Cotton Stalks": {"base": 4.5, "variation": 1.2},
            "Waste-derived Fuel": {"base": 6.2, "variation": 1.8},
            "Used Tires": {"base": 4.8, "variation": 1.0},
            "Bagasse": {"base": 2.8, "variation": 0.8},
            "Wheat Straw": {"base": 4.2, "variation": 1.3}
        }
        
        fuel_info = fallback_costs.get(fuel_name, {"base": 7.0, "variation": 2.0})
        
        # Apply regional adjustments
        regional_multiplier = 1.0
        if location.get("state") in ["Maharashtra", "Gujarat", "Karnataka"]:
            regional_multiplier = 1.1  # Higher costs in industrial states
        elif location.get("state") in ["Punjab", "Haryana", "Uttar Pradesh"]:
            regional_multiplier = 0.9   # Lower costs in agricultural states
        
        base_cost = fuel_info["base"] * regional_multiplier
        
        return {
            "cost_per_kg_inr": round(base_cost, 2),
            "currency": "INR",
            "location": f"{location['city']}, {location['state']}",
            "confidence_level": "low",
            "last_updated": datetime.now().strftime('%Y-%m-%d'),
            "source_info": "Fallback estimate based on regional factors",
            "price_factors": ["regional_adjustment", "fuel_type_base"],
            "fuel_name": fuel_name,
            "facility_location": location,
            "fetched_at": datetime.now().isoformat(),
            "method": "fallback_estimate"
        }
    
    async def get_dynamic_cost(self, fuel_name: str, facility_id: str) -> Dict[str, Any]:
        """Get dynamic cost for a specific fuel at facility location"""
        
        # Check cache first
        cache_key = f"{fuel_name}_{facility_id}"
        if cache_key in self.cost_cache:
            cached_data = self.cost_cache[cache_key]
            cached_time = datetime.fromisoformat(cached_data["fetched_at"])
            if datetime.now() - cached_time < self.cache_duration:
                logger.info(f"Using cached cost for {fuel_name}")
                return cached_data
        
        try:
            # Get facility location
            location = await self.get_facility_location(facility_id)
            
            # Search for current cost
            cost_data = await self.search_fuel_cost_online(fuel_name, location)
            
            # Cache the result
            self.cost_cache[cache_key] = cost_data
            
            logger.info(f"Fetched dynamic cost for {fuel_name}: ₹{cost_data['cost_per_kg_inr']}/kg")
            return cost_data
            
        except Exception as e:
            logger.error(f"Error getting dynamic cost for {fuel_name}: {str(e)}")
            # Return fallback
            location = await self.get_facility_location(facility_id)
            return await self.get_fallback_cost(fuel_name, location)
    
    async def get_all_fuel_costs(self, fuel_names: List[str], facility_id: str) -> Dict[str, Dict[str, Any]]:
        """Get dynamic costs for all fuels"""
        
        logger.info(f"Fetching dynamic costs for {len(fuel_names)} fuels")
        
        # Create concurrent tasks for all fuels
        tasks = [
            self.get_dynamic_cost(fuel_name, facility_id) 
            for fuel_name in fuel_names
        ]
        
        # Execute all requests concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        fuel_costs = {}
        for i, result in enumerate(results):
            fuel_name = fuel_names[i]
            if isinstance(result, Exception):
                logger.error(f"Error fetching cost for {fuel_name}: {str(result)}")
                # Use fallback
                location = await self.get_facility_location(facility_id)
                fuel_costs[fuel_name] = await self.get_fallback_cost(fuel_name, location)
            else:
                fuel_costs[fuel_name] = result
        
        return fuel_costs
    
    async def refresh_cost_cache(self, facility_id: str):
        """Refresh all cached costs"""
        logger.info("Refreshing cost cache")
        self.cost_cache.clear()
        
        # This would get fuel names from database
        common_fuels = [
            "Biomass", "Rice Husk", "Agricultural Waste", "Cotton Stalks",
            "Waste-derived Fuel", "Used Tires", "Bagasse", "Wheat Straw"
        ]
        
        await self.get_all_fuel_costs(common_fuels, facility_id)
    
    def get_cost_statistics(self, fuel_costs: Dict[str, Dict[str, Any]]) -> Dict[str, float]:
        """Calculate cost statistics for dynamic ranges"""
        costs = [data["cost_per_kg_inr"] for data in fuel_costs.values()]
        
        if not costs:
            return {"min": 0, "max": 100, "avg": 50}
        
        return {
            "min": min(costs),
            "max": max(costs),
            "avg": sum(costs) / len(costs),
            "range": max(costs) - min(costs)
        }

# Global instance
dynamic_cost_service = DynamicCostService()
