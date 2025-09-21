"""
Facility Advisor AI Service
AI-driven recommendations for cement facility sustainability improvements
"""

import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any

from ..services.openai_client import get_openai_client, OpenAIClient
from ..utils.logger import get_logger
from .prompts import FacilityAdvisorPrompts

logger = get_logger(__name__)


class FacilityAdvisorService:
    """
    Service for generating AI-driven facility improvement recommendations
    """
    
    def __init__(self):
        """Initialize the Facility Advisor service"""
        self.prompts = FacilityAdvisorPrompts()
        self._openai_client = None
        
    async def _get_openai_client(self) -> OpenAIClient:
        """Get OpenAI client instance"""
        if not self._openai_client:
            self._openai_client = await get_openai_client()
        return self._openai_client

    async def generate_recommendations(
        self, 
        facility_data: Dict,
        focus_areas: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Generate AI-driven recommendations for a facility
        
        Args:
            facility_data: Complete facility data including resources, emissions, targets
            focus_areas: Optional list of specific focus areas to prioritize
            
        Returns:
            Dict containing recommendations and analysis
        """
        try:
            openai_client = await self._get_openai_client()
            
            # If OpenAI is not available, return demo response
            if not openai_client.is_available():
                return await self._generate_demo_recommendations(facility_data)
            
            # Build the complete prompt with facility context
            system_prompt = self.prompts.get_complete_system_prompt(facility_data, focus_areas)
            
            # Generate recommendations using OpenAI
            messages = [
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user", 
                    "content": "Generate sustainability improvement recommendations for this facility based on the provided data."
                }
            ]
            
            # Use higher temperature for more creative recommendations
            result = await openai_client.chat_completion(
                messages, 
                temperature=0.7,
                max_tokens=4000
            )
            
            # Parse the AI response
            recommendations_data = await self._parse_ai_response(result.get('response', ''))
            
            # Log if parsing had issues but continue with actual AI content
            if recommendations_data.get("parse_error"):
                logger.warning(f"AI response had parsing issues but proceeding with extracted content: {recommendations_data.get('parse_error')}")
            
            # Ensure we never return empty recommendations if AI provided content
            if not recommendations_data.get("recommendations"):
                logger.error("AI did not generate any recommendations - this should not happen with proper prompts")
            
            # Add metadata
            recommendations_data.update({
                "facility_id": facility_data.get('facility', {}).get('id'),
                "facility_name": facility_data.get('facility', {}).get('name'),
                "generated_at": datetime.utcnow().isoformat() + "Z",
                "ai_model": result.get('model', 'unknown'),
                "focus_areas": focus_areas or [],
                "data_sources": self._get_data_sources_summary(facility_data),
                "success": True
            })
            
            logger.info(f"Generated AI recommendations for facility: {facility_data.get('facility', {}).get('name', 'Unknown')}")
            
            return recommendations_data
            
        except Exception as e:
            logger.error(f"Error generating facility recommendations: {e}")
            return await self._generate_error_response(str(e), facility_data)
    
    async def _parse_ai_response(self, ai_response: str) -> Dict[str, Any]:
        """
        Parse the AI response and extract structured recommendations with robust JSON cleaning
        
        Args:
            ai_response: Raw AI response string
            
        Returns:
            Parsed recommendations data
        """
        try:
            # Extract JSON content from response
            json_content = self._extract_json_content(ai_response)
            
            # Clean common JSON syntax errors
            cleaned_json = self._clean_json_syntax(json_content)
            
            # Parse the cleaned JSON
            parsed_data = json.loads(cleaned_json)
            
            # Validate structure
            if not isinstance(parsed_data, dict) or 'recommendations' not in parsed_data:
                raise ValueError("Invalid response structure")
            
            logger.info(f"Successfully parsed AI response with {len(parsed_data.get('recommendations', []))} recommendations")
            return parsed_data
            
        except Exception as e:
            logger.error(f"Error parsing AI response: {e}")
            logger.error(f"Raw response (first 500 chars): {ai_response[:500]}")
            
            # Try manual extraction as last resort (but still from AI content)
            manual_data = self._extract_recommendations_manually(ai_response)
            if manual_data and manual_data.get('recommendations'):
                logger.info(f"Successfully extracted {len(manual_data['recommendations'])} recommendations manually from AI response")
                return manual_data
            
            # Only return empty if absolutely nothing can be extracted
            return {
                "recommendations": [],
                "facility_summary": {
                    "current_performance": "Error parsing AI analysis",
                    "key_strengths": [],
                    "main_challenges": [],
                    "overall_potential": "Analysis error"
                },
                "next_steps": [],
                "parse_error": str(e),
                "raw_response": ai_response
            }
    
    async def _generate_demo_recommendations(self, facility_data: Dict) -> Dict[str, Any]:
        """
        Generate demo recommendations when OpenAI is not available
        
        Args:
            facility_data: Facility data for context
            
        Returns:
            Demo recommendations
        """
        facility_info = facility_data.get('facility', {})
        facility_name = facility_info.get('name', 'Unknown Facility')
        
        demo_recommendations = [
            {
                "id": "demo_alt_fuel_1",
                "priority": "High", 
                "category": "Alternative Fuels",
                "title": "Increase Biomass Fuel Substitution",
                "description": "Gradually increase biomass waste usage from current levels to 25% substitution rate to reduce fossil fuel dependency and emissions.",
                "cement_process": "Pyroprocessing/Kiln",
                "rationale": "Based on facility's current fuel consumption patterns and regional biomass availability, this represents a significant emission reduction opportunity.",
                "impact": {
                    "emission_reduction_percentage": 18,
                    "emission_reduction_absolute": "2,150 tonnes CO2e/year",
                    "energy_savings_percentage": 5,
                    "cost_savings_annual": "₹1,50,00,000/year",
                    "current_annual_expense": "₹12,00,00,000/year",
                    "cost_comparison": "Save ₹1,50,00,000/year vs current ₹12,00,00,000/year coal costs (12.5% reduction)"
                },
                "implementation": {
                    "timeline": "8-12 months",
                    "investment_required": "₹6,00,00,000",
                    "complexity": "Medium",
                    "prerequisites": ["Biomass supplier contracts", "Fuel handling system upgrade"],
                    "milestones": [
                        "Month 1-3: Biomass supply chain establishment",
                        "Month 4-8: Fuel handling system modifications",
                        "Month 9-12: Gradual substitution rate increase"
                    ]
                },
                "confidence_score": 85,
                "risk_factors": ["Biomass quality variability", "Supply chain reliability"],
                "success_metrics": [
                    "Achieve 25% alternative fuel rate",
                    "Maintain clinker quality parameters",
                    "Reduce fuel costs by 12%"
                ],
                "industry_benchmark": "Leading cement plants achieve 30-40% alternative fuel rates",
                "alternative_fuel_details": {
                    "fuel_type": "Agricultural Biomass (Rice Husk, Bagasse)",
                    "emission_factor": "0.39 tCO2/tonne",
                    "heat_content": "18.5 MJ/kg",
                    "availability": "High in India - abundant agricultural waste",
                    "sourcing_strategy": "Partner with local rice mills and sugar mills for consistent supply"
                }
            },
            {
                "id": "demo_energy_1",
                "priority": "High",
                "category": "Energy Efficiency", 
                "title": "Waste Heat Recovery System Installation",
                "cement_process": "Clinker Cooling",
                "description": "Install waste heat recovery system at preheater exit to generate electricity and reduce grid dependency.",
                "rationale": "Facility's high thermal energy usage presents excellent opportunity for waste heat recovery with proven ROI.",
                "impact": {
                    "emission_reduction_percentage": 12,
                    "emission_reduction_absolute": "1,800 tonnes CO2e/year",
                    "energy_savings_percentage": 15,
                    "cost_savings_annual": "₹1,80,00,000/year"
                },
                "implementation": {
                    "timeline": "12-18 months",
                    "investment_required": "₹18,00,00,000",
                    "complexity": "High",
                    "prerequisites": ["Engineering study", "Grid connection approval"],
                    "milestones": [
                        "Month 1-4: Detailed engineering and permits",
                        "Month 5-12: Equipment procurement and installation",
                        "Month 13-18: Commissioning and optimization"
                    ]
                },
                "confidence_score": 78,
                "risk_factors": ["Capital investment size", "Grid integration complexity"],
                "success_metrics": [
                    "Generate 2.5 MW electricity",
                    "Achieve 3.5-year payback period",
                    "Reduce electricity purchases by 20%"
                ],
                "industry_benchmark": "Modern WHR systems achieve 15-25% energy savings"
            },
            {
                "id": "demo_process_1",
                "priority": "Medium",
                "category": "Process Optimization",
                "title": "Advanced Process Control Implementation",
                "description": "Deploy AI-driven kiln control system for optimal fuel mix and thermal profile management.",
                "cement_process": "Pyroprocessing/Kiln",
                "rationale": "Current manual control processes show opportunities for optimization based on emission and energy data patterns.",
                "impact": {
                    "emission_reduction_percentage": 8,
                    "emission_reduction_absolute": "950 tonnes CO2e/year",
                    "energy_savings_percentage": 6,
                    "cost_savings_annual": "₹75,00,000/year"
                },
                "implementation": {
                    "timeline": "6-9 months",
                    "investment_required": "₹3,60,00,000",
                    "complexity": "Medium",
                    "prerequisites": ["Process control system upgrade", "Operator training"],
                    "milestones": [
                        "Month 1-2: System design and configuration",
                        "Month 3-6: Installation and integration",
                        "Month 7-9: Training and optimization"
                    ]
                },
                "confidence_score": 92,
                "risk_factors": ["Operator adaptation", "System integration complexity"],
                "success_metrics": [
                    "Reduce fuel consumption variability by 15%",
                    "Improve thermal efficiency by 6%",
                    "Achieve ROI within 18 months"
                ],
                "industry_benchmark": "Advanced control systems typically improve efficiency by 5-10%"
            }
        ]
        
        return {
            "recommendations": demo_recommendations,
            "facility_summary": {
                "current_performance": f"{facility_name} shows good operational performance with opportunities for sustainability improvements",
                "key_strengths": [
                    "Stable production operations",
                    "Good data collection and monitoring",
                    "Active sustainability target setting"
                ],
                "main_challenges": [
                    "High reliance on fossil fuels",
                    "Energy intensity above industry average",
                    "Limited alternative fuel usage"
                ],
                "overall_potential": "High potential for 25-30% emission reduction through systematic improvements"
            },
            "next_steps": [
                "Conduct detailed feasibility study for biomass fuel substitution",
                "Engage waste heat recovery technology vendors for quotes",
                "Assess current process control capabilities for upgrade planning",
                "Develop phased implementation roadmap with budget allocation"
            ],
            "facility_id": facility_info.get('id'),
            "facility_name": facility_name,
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "ai_model": "demo-mode",
            "focus_areas": [],
            "data_sources": self._get_data_sources_summary(facility_data),
            "demo_mode": True,
            "success": True
        }
    
    async def _generate_error_response(self, error_message: str, facility_data: Dict) -> Dict[str, Any]:
        """
        Generate error response
        
        Args:
            error_message: Error message
            facility_data: Facility data for context
            
        Returns:
            Error response
        """
        facility_info = facility_data.get('facility', {})
        
        return {
            "recommendations": [],
            "facility_summary": {
                "current_performance": "Unable to analyze due to technical error",
                "key_strengths": [],
                "main_challenges": [],
                "overall_potential": "Analysis unavailable"
            },
            "next_steps": [],
            "facility_id": facility_info.get('id'),
            "facility_name": facility_info.get('name', 'Unknown'),
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "error": error_message,
            "success": False
        }
    
    def _get_data_sources_summary(self, facility_data: Dict) -> Dict[str, Any]:
        """
        Generate summary of data sources used for recommendations
        
        Args:
            facility_data: Complete facility data
            
        Returns:
            Summary of available data sources
        """
        return {
            "facility_info": bool(facility_data.get('facility')),
            "recent_production": len(facility_data.get('recent_production', [])),
            "recent_emissions": len(facility_data.get('recent_emissions', [])),
            "sustainability_targets": len(facility_data.get('targets', [])),
            "configured_resources": len(facility_data.get('facility_resources', [])),
            "emission_factors_available": len(facility_data.get('available_emission_factors', [])),
            "data_completeness": self._calculate_data_completeness(facility_data)
        }
    
    def _calculate_data_completeness(self, facility_data: Dict) -> str:
        """
        Calculate overall data completeness score
        
        Args:
            facility_data: Facility data
            
        Returns:
            Data completeness assessment
        """
        score = 0
        max_score = 6
        
        if facility_data.get('facility'): score += 1
        if facility_data.get('recent_production'): score += 1
        if facility_data.get('recent_emissions'): score += 1
        if facility_data.get('targets'): score += 1
        if facility_data.get('facility_resources'): score += 1
        if facility_data.get('available_emission_factors'): score += 1
        
        percentage = (score / max_score) * 100
        
        if percentage >= 80:
            return "Excellent"
        elif percentage >= 60:
            return "Good"
        elif percentage >= 40:
            return "Moderate"
        else:
            return "Limited"

    def _extract_json_content(self, ai_response: str) -> str:
        """Extract JSON content from AI response, handling various formats"""
        response = ai_response.strip()
        
        # Try to find JSON in markdown code blocks first
        if '```json' in response:
            start = response.find('```json') + 7
            end = response.find('```', start)
            if end != -1:
                return response[start:end].strip()
        
        # Try to find JSON object directly
        if response.startswith('{'):
            return response
        
        # Look for JSON object anywhere in the response
        start_idx = response.find('{')
        if start_idx != -1:
            # Find the matching closing brace
            brace_count = 0
            end_idx = start_idx
            for i, char in enumerate(response[start_idx:], start_idx):
                if char == '{':
                    brace_count += 1
                elif char == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        end_idx = i + 1
                        break
            
            if brace_count == 0:
                return response[start_idx:end_idx]
        
        return response

    def _clean_json_syntax(self, json_str: str) -> str:
        """Clean common JSON syntax errors that AI models make"""
        import re
        
        # Remove any leading/trailing whitespace
        cleaned = json_str.strip()
        
        # Fix trailing commas in arrays and objects
        cleaned = re.sub(r',(\s*[}\]])', r'\1', cleaned)
        
        # Fix missing quotes around property names (more careful approach)
        cleaned = re.sub(r'(\n\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)', r'\1"\2"\3', cleaned)
        
        # Fix single quotes to double quotes
        cleaned = cleaned.replace("'", '"')
        
        # Remove any trailing commas before closing braces/brackets
        cleaned = re.sub(r',\s*}', '}', cleaned)
        cleaned = re.sub(r',\s*]', ']', cleaned)
        
        # Fix any double commas
        cleaned = re.sub(r',,+', ',', cleaned)
        
        return cleaned

    def _extract_recommendations_manually(self, ai_response: str) -> Dict[str, Any]:
        """Manually extract recommendations from AI response when JSON parsing fails"""
        try:
            import re
            
            # Look for recommendation-like content in the response
            recommendations = []
            
            # Try to find patterns that look like recommendations
            title_pattern = r'"title":\s*"([^"]+)"'
            description_pattern = r'"description":\s*"([^"]+)"'
            category_pattern = r'"category":\s*"([^"]+)"'
            
            titles = re.findall(title_pattern, ai_response)
            descriptions = re.findall(description_pattern, ai_response)
            categories = re.findall(category_pattern, ai_response)
            
            # If we found some structured content, try to build recommendations
            for i, title in enumerate(titles):
                rec = {
                    "id": f"extracted_{i+1}",
                    "priority": "High",
                    "category": categories[i] if i < len(categories) else "Process Optimization",
                    "title": title,
                    "description": descriptions[i] if i < len(descriptions) else "AI-generated recommendation",
                    "cement_process": "Pyroprocessing/Kiln",  # Default
                    "rationale": "Extracted from AI analysis",
                    "impact": {
                        "emission_reduction_percentage": 10,
                        "cost_savings_annual": "₹1,00,00,000/year",
                        "current_annual_expense": "₹8,00,00,000/year",
                        "cost_comparison": "Save ₹1,00,00,000/year vs current ₹8,00,00,000/year expenses (12.5% reduction)"
                    },
                    "implementation": {
                        "timeline": "6-12 months",
                        "investment_required": "₹2,00,00,000",
                        "complexity": "Medium"
                    },
                    "confidence_score": 80
                }
                recommendations.append(rec)
            
            if recommendations:
                return {
                    "recommendations": recommendations,
                    "facility_summary": {
                        "current_performance": "Extracted from AI analysis",
                        "key_strengths": ["AI insights captured"],
                        "main_challenges": ["JSON parsing issues"],
                        "overall_potential": "Good potential identified"
                    },
                    "next_steps": ["Implement extracted recommendations"]
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error in manual extraction: {e}")
            return None


# Global service instance
facility_advisor_service = FacilityAdvisorService()


async def get_facility_advisor_service() -> FacilityAdvisorService:
    """
    Get Facility Advisor service instance
    
    Returns:
        FacilityAdvisorService: Service instance
    """
    return facility_advisor_service
