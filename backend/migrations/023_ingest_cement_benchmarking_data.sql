-- Migration: Ingest cement benchmarking data from Excel
-- Created: 2025-09-21
-- Description: Add missing columns and ingest comprehensive cement industry benchmarking data

-- Step 1: Add missing columns to industry_benchmarking table
-- Add columns for social metrics (only if they don't exist)
DO $$ 
BEGIN
    -- Add social metrics columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'male_employee_percentage') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN male_employee_percentage DOUBLE PRECISION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'female_employee_percentage') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN female_employee_percentage DOUBLE PRECISION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'permanent_employees_per_million_rs') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN permanent_employees_per_million_rs DOUBLE PRECISION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'other_employees_per_million_rs') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN other_employees_per_million_rs DOUBLE PRECISION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'msme_sourcing_percentage') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN msme_sourcing_percentage DOUBLE PRECISION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'health_safety_complaints') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN health_safety_complaints INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'working_conditions_complaints') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN working_conditions_complaints INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'child_labour_complaints') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN child_labour_complaints INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'discrimination_complaints') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN discrimination_complaints INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'forced_labour_complaints') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN forced_labour_complaints INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'other_human_rights_complaints') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN other_human_rights_complaints INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'sexual_harassment_complaints') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN sexual_harassment_complaints INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'wages_complaints') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN wages_complaints INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'posh_complaints') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN posh_complaints INTEGER;
    END IF;
    
    -- Add intensity metrics columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'scope_1_intensity') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN scope_1_intensity DOUBLE PRECISION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'scope_2_intensity') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN scope_2_intensity DOUBLE PRECISION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'scope_3_intensity') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN scope_3_intensity DOUBLE PRECISION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'water_consumption_intensity') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN water_consumption_intensity DOUBLE PRECISION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'water_withdrawal_intensity') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN water_withdrawal_intensity DOUBLE PRECISION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'waste_generated_intensity') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN waste_generated_intensity DOUBLE PRECISION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'renewable_energy_intensity') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN renewable_energy_intensity DOUBLE PRECISION;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'total_energy_intensity') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN total_energy_intensity DOUBLE PRECISION;
    END IF;
    
    -- Add reporting_year column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'reporting_year') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN reporting_year INTEGER DEFAULT 2024;
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN industry_benchmarking.male_employee_percentage IS 'Percentage of male employees';
COMMENT ON COLUMN industry_benchmarking.female_employee_percentage IS 'Percentage of female employees';
COMMENT ON COLUMN industry_benchmarking.permanent_employees_per_million_rs IS 'Permanent employees per million rupees revenue';
COMMENT ON COLUMN industry_benchmarking.other_employees_per_million_rs IS 'Other than permanent employees per million rupees revenue';
COMMENT ON COLUMN industry_benchmarking.msme_sourcing_percentage IS 'Percentage sourced from MSMEs/Small Producers';
COMMENT ON COLUMN industry_benchmarking.health_safety_complaints IS 'Number of health and safety complaints';
COMMENT ON COLUMN industry_benchmarking.working_conditions_complaints IS 'Number of working conditions complaints';
COMMENT ON COLUMN industry_benchmarking.child_labour_complaints IS 'Number of child labour complaints';
COMMENT ON COLUMN industry_benchmarking.discrimination_complaints IS 'Number of discrimination complaints';
COMMENT ON COLUMN industry_benchmarking.forced_labour_complaints IS 'Number of forced or involuntary labour complaints';
COMMENT ON COLUMN industry_benchmarking.other_human_rights_complaints IS 'Number of other human rights complaints';
COMMENT ON COLUMN industry_benchmarking.sexual_harassment_complaints IS 'Number of sexual harassment complaints';
COMMENT ON COLUMN industry_benchmarking.wages_complaints IS 'Number of wages complaints';
COMMENT ON COLUMN industry_benchmarking.posh_complaints IS 'Number of POSH (Prevention of Sexual Harassment) complaints';
COMMENT ON COLUMN industry_benchmarking.scope_1_intensity IS 'Scope 1 emissions intensity (MTCO2e/million Rs.)';
COMMENT ON COLUMN industry_benchmarking.scope_2_intensity IS 'Scope 2 emissions intensity (MTCO2e/million Rs.)';
COMMENT ON COLUMN industry_benchmarking.scope_3_intensity IS 'Scope 3 emissions intensity (MTCO2e/million Rs.)';
COMMENT ON COLUMN industry_benchmarking.water_consumption_intensity IS 'Water consumption intensity (m3/million Rs.)';
COMMENT ON COLUMN industry_benchmarking.water_withdrawal_intensity IS 'Water withdrawal intensity (m3/million Rs.)';
COMMENT ON COLUMN industry_benchmarking.waste_generated_intensity IS 'Waste generated intensity (MT/million Rs.)';
COMMENT ON COLUMN industry_benchmarking.renewable_energy_intensity IS 'Renewable energy consumption intensity (Joules/million Rs.)';
COMMENT ON COLUMN industry_benchmarking.total_energy_intensity IS 'Total energy consumption intensity (Joules/million Rs.)';
COMMENT ON COLUMN industry_benchmarking.annual_cement_production IS 'Annual cement production in tonnes';
COMMENT ON COLUMN industry_benchmarking.reporting_year IS 'Year of reporting';

-- Step 2: Insert environmental data (only if not already exists)
INSERT INTO industry_benchmarking (
    organization_name, 
    reporting_year,
    annual_cement_production,
    scope_1, 
    scope_1_intensity,
    scope_2, 
    scope_2_intensity,
    scope_3, 
    scope_3_intensity,
    water_consumption, 
    water_consumption_intensity,
    water_withdrawal, 
    water_withdrawal_intensity,
    waste_generated, 
    renewable_energy_consumption,
    total_energy_consumption,
    revenue,
    is_target,
    created_at,
    updated_at
) VALUES 
-- Ambuja Cements Limited
('Ambuja Cements Limited', 2024, 0, 15286295, 85.30775, 589017.0, 3.287109, NULL, NULL, 5644386.0, 31.49945, 5644384.0, 31.49944, 1.596711, NULL, NULL, 179190000000, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- HeidelbergCement India Limited
('HeidelbergCement India Limited', 2024, 0, 2477822, 104.7359, 168229.0, 7.110932, NULL, NULL, 1351453.0, 57.12505, 1351453.0, 57.12505, 0.367498, NULL, NULL, 23657800000, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- JK Cement Limited (TARGET COMPANY)
('JK Cement Limited', 2024, 0, 10334366, 94.65439, 368584.0, 3.375930, 2529576.00, 23.168859, 2897666.0, 26.54026, 2897666.0, 26.54026, 0.091967, NULL, NULL, 109180000000, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Mangalam Cement Limited
('Mangalam Cement Limited', 2024, 0, 2107986, 122.1680, 47667.0, 2.762534, NULL, NULL, 316411.0, 18.33755, 316411.0, 18.33755, 0.268239, NULL, NULL, 17254810000, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- SAGAR CEMENTS LIMITED
('SAGAR CEMENTS LIMITED', 2024, 0, 3671703, 1465978.0, 198660.0, 793177.380910, 66572.00, 265797.868730, 899112.0, 3589828.0, 899112.0, 3589828.0, 266715.177213, NULL, NULL, 25046, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Shree Cement Limited
('Shree Cement Limited', 2024, 0, 21945940, 112.0518, 369603.0, 1.887123, 310685.44, 1.586301, 2481362.8, 12.66937, 2484424.5, 12.68500, 0.076852, NULL, NULL, 195855300000, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),


-- Star Cement Limited
('Star Cement Limited', 2024, 0, 2519759, 85.78977, 69847.0, 2.378068, NULL, NULL, 2428322.0, 82.67663, 2428322.0, 82.67663, 0.111121, NULL, NULL, 29371320000, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- THE INDIA CEMENTS LIMITED
('THE INDIA CEMENTS LIMITED', 2024, 0, 5628584, 113.8829, 484547.0, 9.803821, NULL, NULL, 2952660.0, 59.74106, 2952660.0, 59.74106, 0.089354, NULL, NULL, 49424300000, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- The Ramco Cements Limited
('The Ramco Cements Limited', 2024, 0, 9980000, 106.2587, 740000.0, 7.878903, 0.00, 0.000000, 2521813.0, 26.85016, 2521813.0, 26.85016, 1.334424, NULL, NULL, 93921700000, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- UltraTech Cement Limited
('UltraTech Cement Limited', 2024, 0, 71237860, 102.0460, 1884386.6, 2.699326, 8250585.00, 11.818709, 27103472.0, 38.82489, 27778796.0, 39.79227, 3.882559, NULL, NULL, 698095300000, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Step 3: Update social data for companies that have it
-- Note: Social data will be updated in a separate step as it requires different handling

-- Step 4: Update targets data for JK Cement (marked as target company)
UPDATE industry_benchmarking 
SET 
    targets = '{
      "social_targets": [
        "Organising training and meetings of contractors to enhance skill development in new construction techniques",
        "Conducting Virtual Technical Services (VTS) initiatives during the pandemic for continued skill development",
        "Resuming onsite events with proper safety protocols post-Covid to ensure ongoing training and support"
      ],
      "environmental_targets": [
        "Co-processing of waste in cement kilns to reduce landfill usage"
      ],
      "governance_targets": [
        "Implementing a Code of Corporate Ethics and Conduct since 2002, signed by all employees upon joining",
        "Annual affirmation of compliance with the Code of Conduct for Board Members and Senior Management by Board Members and Senior Management"
      ]
    }'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'JK Cement Limited' AND reporting_year = 2024;

-- Step 5: Create indexes for better performance
CREATE INDEX idx_industry_benchmarking_organization_name ON industry_benchmarking(organization_name);
CREATE INDEX idx_industry_benchmarking_reporting_year ON industry_benchmarking(reporting_year);
CREATE INDEX idx_industry_benchmarking_scope_1 ON industry_benchmarking(scope_1);
CREATE INDEX idx_industry_benchmarking_scope_2 ON industry_benchmarking(scope_2);
CREATE INDEX idx_industry_benchmarking_revenue ON industry_benchmarking(revenue);

-- Migration completion log
-- Note: Uncomment the following if migration_history table exists
/*
INSERT INTO migration_history (migration_name, applied_at, description) 
VALUES (
  '023_ingest_cement_benchmarking_data',
  CURRENT_TIMESTAMP,
  'Added social and intensity columns, ingested comprehensive cement industry benchmarking data from Excel, marked JK Cement as target company'
) ON CONFLICT (migration_name) DO NOTHING;
*/
