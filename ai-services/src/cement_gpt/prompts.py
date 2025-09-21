"""
Cement GPT Prompts and Context Management
"""

from typing import Dict, Optional, Any


class CementPrompts:
    """
    Manages all prompts and context for Cement GPT
    """
    
    @staticmethod
    def get_base_system_prompt() -> str:
        """
        Get the base system prompt for Cement GPT
        
        Returns:
            str: Base system prompt for cement industry expertise
        """
        return """
You are CementGPT, a specialized AI assistant with deep expertise in cement manufacturing and sustainability.

Your knowledge includes:

🏭 CEMENT MANUFACTURING PROCESS:
- Raw material preparation (limestone, clay, iron ore, coal)
- Pyroprocessing in rotary kilns (1450°C)
- Clinker production and cooling
- Cement grinding and packaging
- Quality control and testing

🌱 SUSTAINABILITY & EMISSIONS:
- Scope 1 emissions (direct): Process emissions from calcination, fuel combustion
- Scope 2 emissions (indirect): Electricity consumption
- Scope 3 emissions: Raw materials, transportation, waste
- Emission factors and calculation methodologies
- Alternative fuels (biomass, RDF, waste heat recovery)
- Carbon capture and utilization technologies

📊 KEY PERFORMANCE INDICATORS:
- Emission intensity (kgCO2e/ton cement)
- Energy consumption (MJ/ton cement)
- Alternative fuel substitution rates
- Clinker-to-cement ratio
- Thermal efficiency

🎯 SUSTAINABILITY TARGETS:
- Net Zero commitments and pathways
- Energy efficiency improvements
- Alternative fuel adoption
- Process optimization
- Carbon capture technologies

💡 BEST PRACTICES:
- Energy management systems
- Waste heat recovery
- Predictive maintenance
- Digital twins and IoT applications
- Environmental management systems

Always provide practical, industry-specific advice based on current cement industry standards and emerging technologies.
Use technical terminology appropriately and cite relevant industry practices when possible.
"""

    @staticmethod
    def get_facility_context(facility_data: Optional[Dict] = None) -> str:
        """
        Get facility-specific context if available
        
        Args:
            facility_data: Optional facility data
            
        Returns:
            str: Facility context
        """
        if not facility_data:
            return "\nNo specific facility data available for this query."
            
        context = f"""
\nFACILITY CONTEXT:
- Name: {facility_data.get('name', 'N/A')}
- Location: {facility_data.get('location', 'N/A')}
- Annual Production: {facility_data.get('annual_production', 'N/A')} tons/year
- Recent Emission Intensity: {facility_data.get('emission_intensity', 'N/A')} kgCO2e/ton
- Energy Intensity: {facility_data.get('energy_intensity', 'N/A')} MJ/ton
- Alternative Fuel Rate: {facility_data.get('alt_fuel_rate', 'N/A')}%
"""
        return context

    @staticmethod
    def get_complete_system_prompt(facility_data: Optional[Dict] = None) -> str:
        """
        Get the complete system prompt including facility context
        
        Args:
            facility_data: Optional facility data
            
        Returns:
            str: Complete system prompt
        """
        base_prompt = CementPrompts.get_base_system_prompt()
        facility_context = CementPrompts.get_facility_context(facility_data)
        
        return base_prompt + facility_context

    @staticmethod
    def get_demo_responses() -> Dict[str, str]:
        """
        Get demo responses for development mode
        
        Returns:
            Dict mapping keywords to demo responses
        """
        return {
            "hello": "Hello! I'm CementGPT, your AI assistant for cement industry sustainability. How can I help you today?",
            "emissions": "Cement production typically generates emissions from two main sources: process emissions from limestone calcination (~60%) and energy emissions from fuel combustion (~40%). The industry average is around 800-900 kgCO2e per ton of cement.",
            "alternative fuels": "Alternative fuels like biomass, refuse-derived fuel (RDF), and waste materials can significantly reduce CO2 emissions. Best practices include maintaining 20-30% substitution rates while ensuring product quality.",
            "energy efficiency": "Key energy efficiency measures include waste heat recovery, efficient grinding systems, and process optimization. Modern plants can achieve 3.2-3.8 GJ/ton of cement.",
            "sustainability": "Cement industry sustainability focuses on: reducing CO2 emissions, increasing alternative fuel use, improving energy efficiency, and developing carbon capture technologies.",
            "scope 1": "Scope 1 emissions are direct emissions from owned or controlled sources, including process emissions from limestone calcination and fuel combustion in kilns.",
            "scope 2": "Scope 2 emissions are indirect emissions from purchased electricity, steam, heating, and cooling consumed by the cement plant.",
            "calculation": "Emission calculations use the formula: Total Emissions (kgCO2e) = Activity Data × Emission Factor. For cement, this includes both process and energy-related emissions.",
            "kiln": "Rotary kilns operate at approximately 1450°C to convert raw materials into clinker. Modern kilns use preheaters and precalciners to improve thermal efficiency.",
            "clinker": "Clinker is the intermediate product formed by sintering limestone and clay at high temperatures. The clinker-to-cement ratio is a key sustainability metric.",
            "default": "Thank you for your question about cement manufacturing and sustainability. I'm currently running in demo mode. In production, I would provide detailed, context-aware responses about cement manufacturing, sustainability practices, emission calculations, and industry best practices."
        }

    @staticmethod
    def get_demo_response(user_message: str) -> str:
        """
        Get an appropriate demo response based on user message
        
        Args:
            user_message: User's message
            
        Returns:
            str: Appropriate demo response
        """
        demo_responses = CementPrompts.get_demo_responses()
        message_lower = user_message.lower()
        
        # Find the best matching response
        for keyword, response in demo_responses.items():
            if keyword != "default" and keyword in message_lower:
                return response
        
        # Return default response if no match
        return demo_responses["default"].replace(
            "Thank you for your question about cement manufacturing and sustainability.",
            f"Thank you for your question about '{user_message[:50]}...'."
        )

    @staticmethod
    def build_conversation_messages(
        user_message: str,
        facility_data: Optional[Dict] = None,
        chat_history: Optional[list] = None
    ) -> list:
        """
        Build conversation messages for OpenAI API
        
        Args:
            user_message: Current user message
            facility_data: Optional facility data
            chat_history: Optional chat history
            
        Returns:
            List of message dictionaries for OpenAI API
        """
        messages = []
        
        # System message with cement industry context
        system_prompt = CementPrompts.get_complete_system_prompt(facility_data)
        messages.append({
            "role": "system",
            "content": system_prompt
        })
        
        # Add chat history if available (last 5 messages for context)
        if chat_history:
            recent_history = chat_history[-5:] if len(chat_history) > 5 else chat_history
            for chat in recent_history:
                if chat.get("role") in ["user", "assistant"]:
                    messages.append({
                        "role": chat["role"],
                        "content": chat["content"]
                    })
        
        # Add current user message
        messages.append({
            "role": "user",
            "content": user_message
        })
        
        return messages
