-- Migration: Fix alternative fuels emission factors with costs
-- Created: 2025-09-21
-- Description: Add emission factors with costs for existing alternative fuel resources

-- First, update existing alternative fuels to have cost_inr values
UPDATE emission_factors 
SET cost_inr = 8.0, updated_at = CURRENT_TIMESTAMP
WHERE resource_id IN (
    SELECT id FROM emission_resources WHERE resource_name = 'Biomass' AND is_alternative_fuel = true
);

UPDATE emission_factors 
SET cost_inr = 6.5, updated_at = CURRENT_TIMESTAMP
WHERE resource_id IN (
    SELECT id FROM emission_resources WHERE resource_name = 'Solar Electricity' AND is_alternative_fuel = true
);

-- Add emission factors for missing alternative fuels that have resources but no factors
-- Get the emission factor library ID (using DEFRA as it's commonly used for alternatives)
DO $$
DECLARE
    defra_library_id UUID;
    agricultural_waste_id UUID;
    used_tires_id UUID;
    wind_electricity_id UUID;
    waste_derived_fuel_id UUID;
BEGIN
    -- Get DEFRA library ID
    SELECT id INTO defra_library_id 
    FROM emission_factor_libraries 
    WHERE library_name = 'DEFRA' AND version = 'ar5' 
    LIMIT 1;
    
    -- Get resource IDs for missing alternative fuels
    SELECT id INTO agricultural_waste_id 
    FROM emission_resources 
    WHERE resource_name = 'Agricultural Waste' AND is_alternative_fuel = true;
    
    SELECT id INTO used_tires_id 
    FROM emission_resources 
    WHERE resource_name = 'Used Tires' AND is_alternative_fuel = true;
    
    SELECT id INTO wind_electricity_id 
    FROM emission_resources 
    WHERE resource_name = 'Wind Electricity' AND is_alternative_fuel = true;
    
    SELECT id INTO waste_derived_fuel_id 
    FROM emission_resources 
    WHERE resource_name = 'Waste-derived Fuel' AND is_alternative_fuel = true;
    
    -- Insert emission factors for missing alternative fuels (if resources exist)
    
    -- Agricultural Waste (similar to biomass)
    IF agricultural_waste_id IS NOT NULL AND defra_library_id IS NOT NULL THEN
        INSERT INTO emission_factors (
            resource_id, library_id, emission_factor, emission_factor_unit, 
            heat_content, heat_content_unit, approximate_cost, cost_unit, 
            cost_inr, availability_score, reference_source, notes
        ) VALUES (
            agricultural_waste_id, defra_library_id, 0.018, 'kgCO2e/kg',
            9.59, 'GJ/kg', 0.10, 'USD',
            8.0, 8, 'DEFRA/BEIS Emission Factors', 'Agricultural waste biomass - biogenic emissions'
        ) ON CONFLICT (resource_id, library_id) DO NOTHING;
    END IF;
    
    -- Used Tires
    IF used_tires_id IS NOT NULL AND defra_library_id IS NOT NULL THEN
        INSERT INTO emission_factors (
            resource_id, library_id, emission_factor, emission_factor_unit, 
            heat_content, heat_content_unit, approximate_cost, cost_unit, 
            cost_inr, availability_score, reference_source, notes
        ) VALUES (
            used_tires_id, defra_library_id, 2.715, 'kgCO2e/kg',
            32.56, 'GJ/kg', 0.54, 'USD',
            45.0, 7, 'DEFRA/BEIS Emission Factors', 'Waste tire combustion for energy recovery'
        ) ON CONFLICT (resource_id, library_id) DO NOTHING;
    END IF;
    
    -- Wind Electricity
    IF wind_electricity_id IS NOT NULL AND defra_library_id IS NOT NULL THEN
        INSERT INTO emission_factors (
            resource_id, library_id, emission_factor, emission_factor_unit, 
            approximate_cost, cost_unit, cost_inr, availability_score, 
            reference_source, notes
        ) VALUES (
            wind_electricity_id, defra_library_id, 0.012, 'kgCO2e/kWh',
            0.078, 'USD', 6.5, 9, 'DEFRA/BEIS Emission Factors', 
            'Wind electricity generation - lifecycle emissions'
        ) ON CONFLICT (resource_id, library_id) DO NOTHING;
    END IF;
    
    -- Waste-derived Fuel
    IF waste_derived_fuel_id IS NOT NULL AND defra_library_id IS NOT NULL THEN
        INSERT INTO emission_factors (
            resource_id, library_id, emission_factor, emission_factor_unit, 
            heat_content, heat_content_unit, approximate_cost, cost_unit, 
            cost_inr, availability_score, reference_source, notes
        ) VALUES (
            waste_derived_fuel_id, defra_library_id, 1.017, 'kgCO2e/kg',
            11.57, 'GJ/kg', 0.024, 'USD',
            2.0, 6, 'DEFRA/BEIS Emission Factors', 'Municipal solid waste derived fuel'
        ) ON CONFLICT (resource_id, library_id) DO NOTHING;
    END IF;
    
END $$;

-- Create indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_emission_factors_cost_inr ON emission_factors(cost_inr) WHERE cost_inr IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_emission_resources_alternative_fuel ON emission_resources(is_alternative_fuel) WHERE is_alternative_fuel = true;
