"""
Facility Advisor Prompts and Context Management
"""

from typing import Dict, Optional, Any, List


class FacilityAdvisorPrompts:
    """
    Manages all prompts and context for Facility Advisor AI
    """
    
    @staticmethod
    def get_base_system_prompt() -> str:
        """
        Get the base system prompt for Facility Advisor AI
        
        Returns:
            str: Base system prompt for facility recommendations
        """
        return """
You are the Facility Advisor AI, a specialized AI consultant for cement manufacturing facilities focused on sustainability improvement and operational optimization.

Your expertise encompasses:

🏭 CEMENT MANUFACTURING OPERATIONS:
- Deep knowledge of cement production processes, equipment, and operational patterns
- Understanding of kiln operations, grinding processes, and material handling
- Quality control systems and production optimization techniques
- Energy management and thermal efficiency optimization

CEMENT MANUFACTURING PROCESS STAGES:
1. Raw Material Preparation: Quarrying, crushing, pre-blending, raw material grinding
2. Pyroprocessing/Kiln: Preheating, calcining, burning/sintering, clinker formation
3. Clinker Cooling: Heat recovery, clinker storage
4. Finish Grinding: Cement grinding, quality control, additives blending
5. Packing & Dispatch: Cement storage, packing, loading, transportation
6. Auxiliary Systems: Power generation, compressed air, water treatment

🌱 SUSTAINABILITY & EMISSIONS REDUCTION:
- Comprehensive understanding of cement industry emission sources and mitigation strategies
- Alternative fuel implementation strategies and feasibility assessment
- Energy efficiency technologies: waste heat recovery, grinding optimization, process control
- Carbon capture, utilization, and storage (CCUS) technologies
- Clinker substitution and supplementary cementitious materials (SCMs)

ALTERNATIVE FUELS DATABASE (use these specific values when recommending):
• Biomass (Agricultural waste): 0.39 tCO2/tonne, 18.5 MJ/kg
• RDF (Refuse Derived Fuel): 0.577 tCO2/tonne, 15.2 MJ/kg  
• Waste Oil/Used Oil: 2.96 tCO2/tonne, 41.0 MJ/kg
• Pet Coke: 3.20 tCO2/tonne, 32.5 MJ/kg
• Tyres (shredded): 2.39 tCO2/tonne, 30.0 MJ/kg
• Municipal Solid Waste: 0.91 tCO2/tonne, 12.5 MJ/kg
• Sewage Sludge: 0.25 tCO2/tonne, 11.0 MJ/kg
• Rice Husk: 0.39 tCO2/tonne, 16.2 MJ/kg

📊 DATA-DRIVEN ANALYSIS:
- Analyze facility emission patterns, consumption trends, and operational data
- Identify inefficiencies and improvement opportunities based on real data
- Benchmark against industry standards and best practices
- Calculate potential impact of recommended interventions

🎯 ACTIONABLE RECOMMENDATIONS:
- Provide specific, implementable recommendations with realistic timelines
- Consider facility constraints, investment capacity, and operational feasibility
- Prioritize recommendations based on impact potential and implementation complexity
- Include cost-benefit analysis and ROI estimates where possible

💡 TECHNOLOGY & BEST PRACTICES:
- Knowledge of cutting-edge cement industry technologies and innovations
- Understanding of industry benchmarks and performance standards
- Awareness of regulatory requirements and sustainability frameworks
- Experience with digital transformation and Industry 4.0 applications

CRITICAL PRINCIPLES:
1. BASE ALL RECOMMENDATIONS ON ACTUAL FACILITY DATA - Never hallucinate or make assumptions
2. Be REALISTIC about implementation timelines, costs, and expected outcomes (express all costs in Indian Rupees - ₹)
3. Consider facility-specific constraints and operational context
4. Prioritize recommendations by impact potential and feasibility
5. Provide actionable steps with specific metrics and targets
6. Reference industry standards and proven technologies only
7. Consider regional availability of alternative fuels and materials
8. Factor in existing equipment and infrastructure capabilities

ALWAYS provide:
- Specific, measurable improvement targets
- Implementation timelines and milestones
- Resource requirements and investment estimates
- Risk assessment and mitigation strategies
- Success metrics and monitoring approaches
"""

    @staticmethod
    def get_facility_analysis_context(facility_data: Dict) -> str:
        """
        Build comprehensive facility analysis context
        
        Args:
            facility_data: Complete facility data including resources, emissions, targets, etc.
            
        Returns:
            str: Detailed facility context for AI analysis
        """
        context_parts = [
            "\n🏭 FACILITY ANALYSIS CONTEXT:",
            "="*50
        ]
        
        # Basic facility information
        facility_info = facility_data.get('facility', {})
        
        # Extract location details for regional context
        location_data = facility_info.get('location', {})
        if isinstance(location_data, str):
            try:
                import json
                location_data = json.loads(location_data)
            except:
                location_data = {}
        
        facility_city = location_data.get('city', 'N/A')
        facility_state = location_data.get('state', 'N/A') 
        facility_country = location_data.get('country', 'N/A')
        facility_address = location_data.get('address', 'N/A')
        
        context_parts.extend([
            f"\nFACILITY OVERVIEW:",
            f"- Name: {facility_info.get('name', 'N/A')}",
            f"- Location: {facility_address}",
            f"- City: {facility_city}",
            f"- State/Region: {facility_state}",
            f"- Country: {facility_country}",
            f"- Status: {facility_info.get('status', 'N/A')}",
            f"- Organization: {facility_info.get('organizationId', 'N/A')}"
        ])
        
        # Statistics and performance metrics
        stats = facility_info.get('statistics', {})
        if stats:
            context_parts.extend([
                f"\nCURRENT PERFORMANCE METRICS:",
                f"- Current Year Emissions: {stats.get('currentYearEmissions', 0):,.2f} kgCO2e",
                f"- Current Year Production: {stats.get('currentYearProduction', 0):,.2f} tons",
                f"- Carbon Intensity: {stats.get('carbonIntensity', 0):.3f} kgCO2e/ton cement",
                f"- Configured Resources: {stats.get('configuredResourcesCount', 0)}",
                f"- Active Targets: {stats.get('targetsCount', 0)}"
            ])
        
        # Recent production trends
        recent_production = facility_data.get('recent_production', [])
        if recent_production:
            context_parts.extend([
                f"\nRECENT PRODUCTION TRENDS (Last 12 months):",
            ])
            for prod in recent_production[:6]:  # Show last 6 months
                month_year = f"{prod.get('month', 'N/A')}/{prod.get('year', 'N/A')}"
                production = prod.get('production', 0)
                context_parts.append(f"- {month_year}: {production:,.2f} tons")
        
        # Recent emission trends
        recent_emissions = facility_data.get('recent_emissions', [])
        if recent_emissions:
            context_parts.extend([
                f"\nRECENT EMISSION TRENDS (Last 12 months):",
            ])
            for emission in recent_emissions[:6]:  # Show last 6 months
                month_year = f"{emission.get('month', 'N/A')}/{emission.get('year', 'N/A')}"
                scope = emission.get('scope', 'N/A')
                total_emissions = emission.get('total_emissions', 0)
                total_energy = emission.get('total_energy', 0)
                context_parts.append(f"- {month_year} ({scope}): {total_emissions:,.2f} kgCO2e, {total_energy:,.2f} MJ")
        
        # Sustainability targets
        targets = facility_data.get('targets', [])
        if targets:
            context_parts.extend([
                f"\nSUSTAINABILITY TARGETS ({len(targets)} active):",
            ])
            for target in targets[:5]:  # Show first 5 targets
                name = target.get('name', 'Unnamed Target')
                target_type = target.get('target_type', 'N/A')
                baseline = target.get('baseline_value', 'N/A')
                target_value = target.get('target_value', 'N/A')
                target_year = target.get('target_year', 'N/A')
                unit = target.get('unit', '')
                status = target.get('status', 'N/A')
                context_parts.append(f"- {name} ({target_type}): {baseline} → {target_value} {unit} by {target_year} [{status}]")
        
        # Configured resources and consumption patterns
        resources = facility_data.get('facility_resources', [])
        if resources:
            context_parts.extend([
                f"\nCONFIGURED RESOURCES & CONSUMPTION ({len(resources)} resources):",
            ])
            
            # Group by scope for better organization
            resources_by_scope = {}
            for resource in resources:
                scope = resource.get('resource', {}).get('scope', 'unknown')
                if scope not in resources_by_scope:
                    resources_by_scope[scope] = []
                resources_by_scope[scope].append(resource)
            
            for scope, scope_resources in resources_by_scope.items():
                context_parts.append(f"\n{scope.upper()} SCOPE RESOURCES:")
                for resource in scope_resources:
                    resource_info = resource.get('resource', {})
                    resource_name = resource_info.get('name', 'Unknown Resource')
                    category = resource_info.get('category', 'N/A')
                    
                    # Recent consumption data
                    recent_consumption = resource.get('recentConsumption', [])
                    if recent_consumption:
                        latest = recent_consumption[0]
                        consumption = latest.get('consumption', 0)
                        consumption_unit = latest.get('consumption_unit', '')
                        emissions = latest.get('total_emissions', 0)
                        energy = latest.get('total_energy', 0)
                        month_year = f"{latest.get('month', 'N/A')}/{latest.get('year', 'N/A')}"
                        
                        # Calculate current costs based on emission factor cost and consumption
                        current_monthly_cost = 0
                        current_annual_cost = 0
                        cost_unit = ""
                        emission_factor_info = resource.get('emissionFactor', {})
                        if isinstance(emission_factor_info, dict):
                            approximate_cost = emission_factor_info.get('approximateCost', 0) or 0
                            cost_unit = emission_factor_info.get('costUnit', '')
                            if approximate_cost > 0 and consumption > 0:
                                current_monthly_cost = consumption * approximate_cost
                                current_annual_cost = current_monthly_cost * 12
                        
                        context_parts.append(f"  • {resource_name} ({category})")
                        context_parts.append(f"    - Latest: {consumption:,.2f} {consumption_unit} ({month_year})")
                        context_parts.append(f"    - Emissions: {emissions:,.2f} kgCO2e")
                        context_parts.append(f"    - Energy: {energy:,.2f} MJ")
                        if current_monthly_cost > 0:
                            context_parts.append(f"    - Current Cost: ₹{current_monthly_cost:,.0f}/month (₹{current_annual_cost:,.0f}/year)")
                    else:
                        context_parts.append(f"  • {resource_name} ({category}) - No recent consumption data")
        
        # Emission factor inventory context
        emission_factors = facility_data.get('available_emission_factors', [])
        if emission_factors:
            context_parts.extend([
                f"\nAVAILABLE EMISSION FACTORS INVENTORY ({len(emission_factors)} factors):",
            ])
            
            # Group by scope and category
            factors_by_scope = {}
            for factor in emission_factors:
                resource = factor.get('resource', {})
                scope = resource.get('scope', 'unknown')
                category = resource.get('category', 'unknown')
                
                if scope not in factors_by_scope:
                    factors_by_scope[scope] = {}
                if category not in factors_by_scope[scope]:
                    factors_by_scope[scope][category] = []
                factors_by_scope[scope][category].append(factor)
            
            for scope, categories in factors_by_scope.items():
                context_parts.append(f"\n{scope.upper()} SCOPE FACTORS:")
                for category, factors in categories.items():
                    context_parts.append(f"  {category.title()}:")
                    for factor in factors[:3]:  # Show first 3 factors per category
                        resource = factor.get('resource', {})
                        factor_value = factor.get('emissionFactor', 0)
                        factor_unit = factor.get('emissionFactorUnit', '')
                        library = factor.get('library', {})
                        availability = factor.get('availabilityScore', 0)
                        cost = factor.get('approximateCost', 0)
                        cost_unit = factor.get('costUnit', '')
                        library_region = library.get('region', 'Global')
                        
                        # Regional context for facility location
                        location_match = ""
                        if facility_state != 'N/A' and facility_country != 'N/A':
                            if facility_country.lower() in library_region.lower() or library_region.lower() == 'india':
                                location_match = f" [Available in {facility_state}, {facility_country}]"
                            elif library_region.lower() == 'global':
                                location_match = f" [Globally available, check {facility_state} supply]"
                        
                        context_parts.append(f"    • {resource.get('name', 'Unknown')}: {factor_value} {factor_unit}")
                        context_parts.append(f"      Availability: {availability}/100, Cost: ₹{cost} {cost_unit}{location_match}")
                        context_parts.append(f"      Source: {library.get('name', 'N/A')} ({library.get('year', 'N/A')})")
        
        return "\n".join(context_parts)
    
    @staticmethod
    def get_recommendation_prompt(facility_data: Dict, focus_areas: Optional[List[str]] = None) -> str:
        """
        Build the recommendation generation prompt
        
        Args:
            facility_data: Complete facility data
            focus_areas: Optional list of specific focus areas for recommendations
            
        Returns:
            str: Specific prompt for generating recommendations
        """
        focus_filter = ""
        if focus_areas:
            focus_filter = f"\nFOCUS AREAS: Please prioritize recommendations in these areas: {', '.join(focus_areas)}"
        
        return f"""
TASK: Generate actionable sustainability improvement recommendations for this cement facility.

{focus_filter}

ANALYSIS REQUIREMENTS:
1. Review the facility's current performance metrics, emission patterns, and resource consumption
2. Identify specific improvement opportunities based on actual data trends
3. Compare current performance against industry benchmarks and best practices
4. Consider available emission factors and alternative resources for potential switches
5. Evaluate the facility's sustainability targets and progress

RECOMMENDATION CRITERIA:
- Base recommendations ONLY on the provided facility data
- Do NOT hallucinate or assume data that isn't provided
- Prioritize by potential impact and implementation feasibility
- Include specific, measurable targets and timelines
- Consider regional resource availability and facility constraints
- Provide realistic cost estimates and ROI calculations where possible (use Indian Rupees - INR/₹)
- MANDATORY: For each recommendation, specify the exact cement manufacturing process it applies to
- MANDATORY: For Alternative Fuel recommendations, provide specific fuel details including emission factor and heat content
- MANDATORY: For cost savings, show comparison with current annual expenses (e.g., "Save ₹50,00,000/year vs current ₹2,00,00,000/year fuel costs")
- MANDATORY: For material sourcing, specify location relative to facility's state/region and local availability
- CRITICAL: Generate ONLY valid JSON - no trailing commas, all quotes properly closed, all brackets matched

OUTPUT FORMAT (STRICT JSON ONLY):
IMPORTANT: Respond with ONLY the JSON below. No extra text, no markdown, no explanations.
Ensure every opening bracket/brace has a closing one, every quote is properly closed, and no trailing commas.

Provide 4-6 prioritized recommendations in this EXACT JSON structure:

{{
  "recommendations": [
    {{
      "id": "unique_id",
      "priority": "High|Medium|Low",
      "category": "Alternative Fuels|Energy Efficiency|Process Optimization|Raw Materials|Digital Technology|Waste Management",
      "title": "Clear, specific recommendation title",
      "description": "Detailed description of the recommended action",
      "cement_process": "Specific cement manufacturing process where this applies (e.g., Raw Material Preparation, Pyroprocessing/Kiln, Grinding, Packing, etc.)",
      "rationale": "Why this recommendation is suitable for this facility based on the data",
      "impact": {{
        "emission_reduction_percentage": 15,
        "emission_reduction_absolute": "1250 tonnes CO2e/year",
        "energy_savings_percentage": 8,
        "cost_savings_annual": "₹1,00,00,000/year",
        "current_annual_expense": "₹8,00,00,000/year",
        "cost_comparison": "Save ₹1,00,00,000/year vs current ₹8,00,00,000/year expenses (12.5% reduction)"
      }},
      "implementation": {{
        "timeline": "6-12 months",
        "investment_required": "₹4,00,00,000",
        "complexity": "Medium",
        "prerequisites": ["Kiln shutdown scheduling", "Vendor selection"],
        "milestones": [
          "Month 1-2: Feasibility study and vendor selection",
          "Month 3-6: Equipment procurement and installation",
          "Month 7-12: Commissioning and optimization"
        ]
      }},
      "confidence_score": 85,
      "risk_factors": ["Equipment compatibility", "Operational disruption"],
      "success_metrics": [
        "Monthly fuel consumption reduction of 10%",
        "Emission intensity below 850 kgCO2e/ton",
        "ROI achievement within 24 months"
      ],
      "industry_benchmark": "Best practice facilities achieve 20-30% alternative fuel rates",
      "alternative_fuel_details": {{
        "applicable_only_if": "category is Alternative Fuels",
        "fuel_type": "Specific fuel name (e.g., Biomass, RDF, Waste Oil, Pet Coke, etc.)",
        "emission_factor": "CO2 emission factor value with unit (e.g., 0.39 tCO2/tonne)",
        "heat_content": "Calorific value with unit (e.g., 18.5 MJ/kg)",
        "availability": "Regional availability assessment for facility's state/region",
        "sourcing_strategy": "How to source this fuel locally in facility's state/region",
        "local_suppliers": "Potential suppliers or regions near facility location",
        "transportation_distance": "Approximate distance from facility to nearest supply sources"
      }}
    }}
  ],
  "facility_summary": {{
    "current_performance": "Brief assessment of current performance",
    "key_strengths": ["List of facility strengths"],
    "main_challenges": ["List of main challenges"],
    "overall_potential": "Assessment of overall improvement potential"
  }},
  "next_steps": [
    "Immediate actions the facility should take",
    "Medium-term planning recommendations",
    "Long-term strategic considerations"
  ]
}}

Remember: Only recommend actions that are technically feasible and economically viable for this specific facility based on the provided data.
"""
    
    @staticmethod
    def get_complete_system_prompt(facility_data: Dict, focus_areas: Optional[List[str]] = None) -> str:
        """
        Get the complete system prompt including facility context
        
        Args:
            facility_data: Complete facility data
            focus_areas: Optional focus areas for recommendations
            
        Returns:
            str: Complete system prompt
        """
        base_prompt = FacilityAdvisorPrompts.get_base_system_prompt()
        facility_context = FacilityAdvisorPrompts.get_facility_analysis_context(facility_data)
        recommendation_prompt = FacilityAdvisorPrompts.get_recommendation_prompt(facility_data, focus_areas)
        
        return base_prompt + facility_context + "\n" + recommendation_prompt
