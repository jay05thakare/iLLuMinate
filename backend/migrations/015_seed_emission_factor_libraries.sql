-- Migration: Seed emission factor libraries and factors
-- Created: 2024-01-20
-- Description: Insert emission factor libraries and their factors

-- Insert Emission Factor Libraries
INSERT INTO emission_factor_libraries (library_name, version, year, region, description, source_url, is_active) VALUES
('DEFRA', 'AR4', 2022, 'UK', 'UK Department for Environment, Food & Rural Affairs emission factors', 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2022', true),
('EPA', 'eGRID2021', 2023, 'US', 'US Environmental Protection Agency emission factors', 'https://www.epa.gov/egrid', true),
('IPCC', 'AR6', 2021, 'Global', 'Intergovernmental Panel on Climate Change Assessment Report 6', 'https://www.ipcc.ch/assessment-report/ar6/', true)
ON CONFLICT (library_name, version, year) DO NOTHING;

-- Get library IDs for factor insertion
DO $$
DECLARE
    defra_lib_id UUID;
    epa_lib_id UUID;
    ipcc_lib_id UUID;
    resource_record RECORD;
BEGIN
    -- Get library IDs
    SELECT id INTO defra_lib_id FROM emission_factor_libraries WHERE library_name = 'DEFRA' AND version = 'AR4';
    SELECT id INTO epa_lib_id FROM emission_factor_libraries WHERE library_name = 'EPA' AND version = 'eGRID2021';
    SELECT id INTO ipcc_lib_id FROM emission_factor_libraries WHERE library_name = 'IPCC' AND version = 'AR6';
    
    -- Insert emission factors for each resource with each library
    FOR resource_record IN SELECT id, resource_name, scope FROM emission_resources WHERE is_calculator = false LOOP
        
        -- DEFRA factors
        IF resource_record.resource_name = 'Natural Gas' THEN
            INSERT INTO emission_factors (resource_id, library_id, emission_factor, emission_factor_unit, heat_content, heat_content_unit, approximate_cost, cost_unit, availability_score)
            VALUES (resource_record.id, defra_lib_id, 1.95, 'kgCO2e/m3', 0.0378, 'GJ/m3', 0.45, '$/m3', 9)
            ON CONFLICT (resource_id, library_id) DO NOTHING;
            
        ELSIF resource_record.resource_name = 'Coal' THEN
            INSERT INTO emission_factors (resource_id, library_id, emission_factor, emission_factor_unit, heat_content, heat_content_unit, approximate_cost, cost_unit, availability_score)
            VALUES (resource_record.id, defra_lib_id, 2.45, 'kgCO2e/kg', 0.025, 'GJ/kg', 0.08, '$/kg', 7)
            ON CONFLICT (resource_id, library_id) DO NOTHING;
            
        ELSIF resource_record.resource_name = 'Petcoke' THEN
            INSERT INTO emission_factors (resource_id, library_id, emission_factor, emission_factor_unit, heat_content, heat_content_unit, approximate_cost, cost_unit, availability_score)
            VALUES (resource_record.id, defra_lib_id, 3.21, 'kgCO2e/kg', 0.032, 'GJ/kg', 0.06, '$/kg', 6)
            ON CONFLICT (resource_id, library_id) DO NOTHING;
            
        ELSIF resource_record.resource_name = 'Heavy Fuel Oil' THEN
            INSERT INTO emission_factors (resource_id, library_id, emission_factor, emission_factor_unit, heat_content, heat_content_unit, approximate_cost, cost_unit, availability_score)
            VALUES (resource_record.id, defra_lib_id, 3.15, 'kgCO2e/L', 0.040, 'GJ/L', 0.75, '$/L', 8)
            ON CONFLICT (resource_id, library_id) DO NOTHING;
            
        ELSIF resource_record.resource_name = 'Diesel' THEN
            INSERT INTO emission_factors (resource_id, library_id, emission_factor, emission_factor_unit, heat_content, heat_content_unit, approximate_cost, cost_unit, availability_score)
            VALUES (resource_record.id, defra_lib_id, 2.68, 'kgCO2e/L', 0.038, 'GJ/L', 1.25, '$/L', 9)
            ON CONFLICT (resource_id, library_id) DO NOTHING;
            
        ELSIF resource_record.resource_name = 'Gasoline' THEN
            INSERT INTO emission_factors (resource_id, library_id, emission_factor, emission_factor_unit, heat_content, heat_content_unit, approximate_cost, cost_unit, availability_score)
            VALUES (resource_record.id, defra_lib_id, 2.31, 'kgCO2e/L', 0.034, 'GJ/L', 1.35, '$/L', 9)
            ON CONFLICT (resource_id, library_id) DO NOTHING;
            
        ELSIF resource_record.resource_name = 'Biomass' THEN
            INSERT INTO emission_factors (resource_id, library_id, emission_factor, emission_factor_unit, heat_content, heat_content_unit, approximate_cost, cost_unit, availability_score)
            VALUES (resource_record.id, defra_lib_id, 0.39, 'kgCO2e/kg', 0.015, 'GJ/kg', 0.12, '$/kg', 5)
            ON CONFLICT (resource_id, library_id) DO NOTHING;
            
        ELSIF resource_record.resource_name = 'Grid Electricity' AND resource_record.scope = 'scope2' THEN
            INSERT INTO emission_factors (resource_id, library_id, emission_factor, emission_factor_unit, heat_content, heat_content_unit, approximate_cost, cost_unit, availability_score)
            VALUES (resource_record.id, defra_lib_id, 0.193, 'kgCO2e/kWh', 0.0036, 'GJ/kWh', 0.15, '$/kWh', 10)
            ON CONFLICT (resource_id, library_id) DO NOTHING;
            
        ELSIF resource_record.resource_name = 'Solar Electricity' THEN
            INSERT INTO emission_factors (resource_id, library_id, emission_factor, emission_factor_unit, heat_content, heat_content_unit, approximate_cost, cost_unit, availability_score)
            VALUES (resource_record.id, defra_lib_id, 0.048, 'kgCO2e/kWh', 0.0036, 'GJ/kWh', 0.08, '$/kWh', 6)
            ON CONFLICT (resource_id, library_id) DO NOTHING;
        END IF;
        
        -- EPA factors (different values for US market)
        IF resource_record.resource_name = 'Natural Gas' THEN
            INSERT INTO emission_factors (resource_id, library_id, emission_factor, emission_factor_unit, heat_content, heat_content_unit, approximate_cost, cost_unit, availability_score)
            VALUES (resource_record.id, epa_lib_id, 1.91, 'kgCO2e/m3', 0.0378, 'GJ/m3', 0.35, '$/m3', 9)
            ON CONFLICT (resource_id, library_id) DO NOTHING;
            
        ELSIF resource_record.resource_name = 'Coal' THEN
            INSERT INTO emission_factors (resource_id, library_id, emission_factor, emission_factor_unit, heat_content, heat_content_unit, approximate_cost, cost_unit, availability_score)
            VALUES (resource_record.id, epa_lib_id, 2.23, 'kgCO2e/kg', 0.025, 'GJ/kg', 0.06, '$/kg', 8)
            ON CONFLICT (resource_id, library_id) DO NOTHING;
            
        ELSIF resource_record.resource_name = 'Grid Electricity' AND resource_record.scope = 'scope2' THEN
            INSERT INTO emission_factors (resource_id, library_id, emission_factor, emission_factor_unit, heat_content, heat_content_unit, approximate_cost, cost_unit, availability_score)
            VALUES (resource_record.id, epa_lib_id, 0.386, 'kgCO2e/kWh', 0.0036, 'GJ/kWh', 0.12, '$/kWh', 10)
            ON CONFLICT (resource_id, library_id) DO NOTHING;
        END IF;
        
        -- IPCC factors (global averages)
        IF resource_record.resource_name = 'Natural Gas' THEN
            INSERT INTO emission_factors (resource_id, library_id, emission_factor, emission_factor_unit, heat_content, heat_content_unit, approximate_cost, cost_unit, availability_score)
            VALUES (resource_record.id, ipcc_lib_id, 2.03, 'kgCO2e/m3', 0.0378, 'GJ/m3', 0.40, '$/m3', 8)
            ON CONFLICT (resource_id, library_id) DO NOTHING;
            
        ELSIF resource_record.resource_name = 'Coal' THEN
            INSERT INTO emission_factors (resource_id, library_id, emission_factor, emission_factor_unit, heat_content, heat_content_unit, approximate_cost, cost_unit, availability_score)
            VALUES (resource_record.id, ipcc_lib_id, 2.42, 'kgCO2e/kg', 0.025, 'GJ/kg', 0.07, '$/kg', 7)
            ON CONFLICT (resource_id, library_id) DO NOTHING;
            
        ELSIF resource_record.resource_name = 'Grid Electricity' AND resource_record.scope = 'scope2' THEN
            INSERT INTO emission_factors (resource_id, library_id, emission_factor, emission_factor_unit, heat_content, heat_content_unit, approximate_cost, cost_unit, availability_score)
            VALUES (resource_record.id, ipcc_lib_id, 0.475, 'kgCO2e/kWh', 0.0036, 'GJ/kWh', 0.13, '$/kWh', 9)
            ON CONFLICT (resource_id, library_id) DO NOTHING;
        END IF;
        
    END LOOP;
END $$;
