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

🧮 CARBON FOOTPRINT CALCULATIONS:
ALWAYS perform calculations when consumption data and emission factors are available:
- Total Emissions = Σ(Consumption × Emission Factor) for each resource
- Emission Intensity = Total Emissions ÷ Production Volume
- For facilities with configured resources, calculate actual CO2e values
- If no consumption data exists, clearly state "No consumption data currently configured"
- Provide step-by-step calculation methodology and sample calculations when possible
- Show what the calculations would look like with example data

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
        Get facility-specific or organization-specific context if available
        
        Args:
            facility_data: Optional facility data (single facility or organization)
            
        Returns:
            str: Facility/organization context
        """
        if not facility_data:
            return "\nNo specific facility data available for this query."
        
        # Handle organization-level data (multiple facilities)
        if "organization_facilities" in facility_data:
            facilities = facility_data.get("organization_facilities", [])
            facility_count = facility_data.get("facility_count", 0)
            
            if facility_count == 0:
                return "\nORGANIZATION CONTEXT:\n- No facilities found in your organization."
            
            context_parts = [
                f"\nORGANIZATION FACILITIES OVERVIEW:",
                f"- Total Facilities: {facility_count}",
                ""
            ]
            
            for i, facility in enumerate(facilities[:5], 1):  # Show first 5 facilities for context
                facility_info = [
                    f"FACILITY {i}: {facility.get('name', 'Unnamed')}",
                    f"  - Location: {facility.get('location', {}).get('city', 'N/A')}, {facility.get('location', {}).get('country', 'N/A')}",
                    f"  - Type: {facility.get('facility_type', 'N/A')}",
                    f"  - Capacity: {facility.get('annual_production_capacity_tons', 'N/A')} tons/year",
                    ""
                ]
                context_parts.extend(facility_info)
            
            if facility_count > 5:
                context_parts.append(f"... and {facility_count - 5} more facilities")
            
            # Add targets context if available
            targets_context = CementPrompts._get_targets_context(facility_data)
            if targets_context:
                context_parts.extend(["", targets_context])
            
            # Add resources context if available (for organization-level)
            resources_context = CementPrompts._get_resources_context(facility_data)
            if resources_context:
                context_parts.extend(["", resources_context])
            
            return "\n".join(context_parts)
        
        # Handle single facility data (existing logic)
        context = f"""
\nFACILITY CONTEXT:
- Name: {facility_data.get('name', 'N/A')}
- Location: {facility_data.get('location', 'N/A')}
- Annual Production: {facility_data.get('annual_production', 'N/A')} tons/year
- Recent Emission Intensity: {facility_data.get('emission_intensity', 'N/A')} kgCO2e/ton
- Energy Intensity: {facility_data.get('energy_intensity', 'N/A')} MJ/ton
- Alternative Fuel Rate: {facility_data.get('alt_fuel_rate', 'N/A')}%
"""
        
        # Add targets context if available
        targets_context = CementPrompts._get_targets_context(facility_data)
        if targets_context:
            context += "\n" + targets_context
        
        # Add resources context if available
        resources_context = CementPrompts._get_resources_context(facility_data)
        if resources_context:
            context += "\n" + resources_context
        else:
            # If no resources configured, add guidance for calculations
            context += """
RESOURCE CONFIGURATION STATUS:
- No consumption data currently configured for this facility
- To calculate carbon footprint, the following data would be needed:
  • Fuel consumption (coal, gas, alternative fuels) with emission factors
  • Electricity consumption with grid emission factors
  • Raw material consumption with process emission factors
  • Production volumes for emission intensity calculations

CALCULATION EXAMPLE (what would happen with data):
If your facility had consumption data configured, the calculation would be:
- Coal: 1000 tonnes/month × 2.42 kgCO2/kg = 2,420 tonnes CO2
- Electricity: 500 MWh/month × 0.82 kgCO2/kWh = 410 tonnes CO2
- Process: 1500 tonnes cement × 0.52 kgCO2/kg = 780 tonnes CO2
- Total: 3,610 tonnes CO2/month
- Emission Intensity: 2,407 kgCO2/tonne cement

When actual data is configured, calculations will be performed automatically."""
        
        return context

    @staticmethod
    def _get_targets_context(facility_data: Optional[Dict] = None) -> str:
        """
        Get targets context from facility data
        
        Args:
            facility_data: Facility or organization data that may contain targets
            
        Returns:
            str: Formatted targets context or empty string
        """
        if not facility_data or "targets" not in facility_data:
            return ""
        
        targets = facility_data.get("targets", [])
        target_count = facility_data.get("target_count", len(targets))
        
        if not targets or target_count == 0:
            return "SUSTAINABILITY TARGETS:\n- No targets currently set"
        
        context_parts = [
            "SUSTAINABILITY TARGETS:",
            f"- Total Active Targets: {target_count}",
            ""
        ]
        
        # Group targets by type for better presentation
        targets_by_type = {}
        for target in targets[:10]:  # Show first 10 targets
            target_type = target.get("targetType", "general")
            if target_type not in targets_by_type:
                targets_by_type[target_type] = []
            targets_by_type[target_type].append(target)
        
        for target_type, type_targets in targets_by_type.items():
            context_parts.append(f"{target_type.upper()} TARGETS:")
            
            for target in type_targets:
                target_info = [
                    f"  • {target.get('name', 'Unnamed Target')}",
                    f"    - Baseline: {target.get('baselineValue', 'N/A')} {target.get('unit', '')} ({target.get('baselineYear', 'N/A')})",
                    f"    - Target: {target.get('targetValue', 'N/A')} {target.get('unit', '')} by {target.get('targetYear', 'N/A')}",
                    f"    - Status: {target.get('status', 'N/A')}",
                    f"    - Facility: {target.get('facility', {}).get('name', 'Organization-wide') if target.get('facility') else 'Organization-wide'}",
                    ""
                ]
                context_parts.extend(target_info)
        
        if target_count > 10:
            context_parts.append(f"... and {target_count - 10} more targets")
        
        return "\n".join(context_parts)

    @staticmethod
    def _get_resources_context(facility_data: Optional[Dict] = None) -> str:
        """
        Get facility resources and consumption context from facility data
        
        Args:
            facility_data: Facility data that may contain resources information
            
        Returns:
            str: Formatted resources context or empty string
        """
        if not facility_data or "facility_resources" not in facility_data:
            return ""
        
        resources = facility_data.get("facility_resources", [])
        resource_count = facility_data.get("resource_count", len(resources))
        consumption_summary = facility_data.get("consumption_summary", {})
        
        if not resources or resource_count == 0:
            return "FACILITY RESOURCES:\n- No resources configured"
        
        context_parts = [
            "FACILITY RESOURCES & CONSUMPTION:",
            f"- Total Configured Resources: {resource_count}",
            ""
        ]
        
        # Group resources by scope for better presentation
        resources_by_scope = {}
        for resource in resources:
            scope = resource.get("resource", {}).get("scope", "unknown")
            if scope not in resources_by_scope:
                resources_by_scope[scope] = []
            resources_by_scope[scope].append(resource)
        
        for scope, scope_resources in resources_by_scope.items():
            context_parts.append(f"{scope.upper()} SCOPE RESOURCES:")
            
            for resource in scope_resources[:5]:  # Show first 5 resources per scope
                resource_info = resource.get("resource", {})
                recent_consumption = resource.get("recentConsumption", [])
                
                resource_line = f"  • {resource_info.get('name', 'Unnamed Resource')} ({resource_info.get('category', 'N/A')})"
                context_parts.append(resource_line)
                
                if recent_consumption:
                    latest = recent_consumption[0]
                    consumption_value = latest.get('consumption', 0)
                    consumption_unit = latest.get('consumption_unit', '')
                    month_year = f"{latest.get('month', 'N/A')}/{latest.get('year', 'N/A')}"
                    
                    context_parts.append(f"    - Latest Consumption: {consumption_value} {consumption_unit} ({month_year})")
                    context_parts.append(f"    - Emissions: {latest.get('total_emissions', 'N/A')} kgCO2e")
                else:
                    context_parts.append("    - No recent consumption data")
                
                context_parts.append("")
            
            if len(scope_resources) > 5:
                context_parts.append(f"    ... and {len(scope_resources) - 5} more {scope} resources")
                context_parts.append("")
        
        # Add consumption summary
        if consumption_summary:
            context_parts.extend(["CURRENT CONSUMPTION SUMMARY:"])
            for scope, categories in consumption_summary.items():
                context_parts.append(f"  {scope.upper()}:")
                for category, data in categories.items():
                    month_year = f"{data.get('month', 'N/A')}/{data.get('year', 'N/A')}"
                    context_parts.append(f"    - {category}: {data.get('value', 0)} {data.get('unit', '')} ({month_year})")
            context_parts.append("")
        
        return "\n".join(context_parts)

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
