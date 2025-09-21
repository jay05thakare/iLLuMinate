-- Migration: Add production data, country, verification status, and unit columns
-- Created: 2025-09-21
-- Description: Updates production numbers, sets country as India, verified as true, and adds unit columns for all quantitative data fields.

-- 1. Add unit columns for all quantitative data fields
DO $$ 
BEGIN 
    -- Add unit columns for environmental metrics
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'scope_1_unit') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN scope_1_unit VARCHAR(50) DEFAULT 'MTCO2e';
        COMMENT ON COLUMN industry_benchmarking.scope_1_unit IS 'Unit for Scope 1 emissions';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'scope_2_unit') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN scope_2_unit VARCHAR(50) DEFAULT 'MTCO2e';
        COMMENT ON COLUMN industry_benchmarking.scope_2_unit IS 'Unit for Scope 2 emissions';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'scope_3_unit') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN scope_3_unit VARCHAR(50) DEFAULT 'MTCO2e';
        COMMENT ON COLUMN industry_benchmarking.scope_3_unit IS 'Unit for Scope 3 emissions';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'water_consumption_unit') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN water_consumption_unit VARCHAR(50) DEFAULT 'm3';
        COMMENT ON COLUMN industry_benchmarking.water_consumption_unit IS 'Unit for water consumption';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'water_withdrawal_unit') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN water_withdrawal_unit VARCHAR(50) DEFAULT 'm3';
        COMMENT ON COLUMN industry_benchmarking.water_withdrawal_unit IS 'Unit for water withdrawal';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'waste_generated_unit') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN waste_generated_unit VARCHAR(50) DEFAULT 'MT';
        COMMENT ON COLUMN industry_benchmarking.waste_generated_unit IS 'Unit for waste generated';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'renewable_energy_consumption_unit') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN renewable_energy_consumption_unit VARCHAR(50) DEFAULT 'Joules';
        COMMENT ON COLUMN industry_benchmarking.renewable_energy_consumption_unit IS 'Unit for renewable energy consumption';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'total_energy_consumption_unit') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN total_energy_consumption_unit VARCHAR(50) DEFAULT 'Joules';
        COMMENT ON COLUMN industry_benchmarking.total_energy_consumption_unit IS 'Unit for total energy consumption';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'revenue_unit') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN revenue_unit VARCHAR(50) DEFAULT 'INR';
        COMMENT ON COLUMN industry_benchmarking.revenue_unit IS 'Unit for revenue';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'annual_cement_production_unit') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN annual_cement_production_unit VARCHAR(50) DEFAULT 'MT';
        COMMENT ON COLUMN industry_benchmarking.annual_cement_production_unit IS 'Unit for annual cement production';
    END IF;
    
    -- Add unit columns for intensity metrics
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'scope_1_intensity_unit') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN scope_1_intensity_unit VARCHAR(50) DEFAULT 'MTCO2e/million INR';
        COMMENT ON COLUMN industry_benchmarking.scope_1_intensity_unit IS 'Unit for Scope 1 intensity';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'scope_2_intensity_unit') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN scope_2_intensity_unit VARCHAR(50) DEFAULT 'MTCO2e/million INR';
        COMMENT ON COLUMN industry_benchmarking.scope_2_intensity_unit IS 'Unit for Scope 2 intensity';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'scope_3_intensity_unit') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN scope_3_intensity_unit VARCHAR(50) DEFAULT 'MTCO2e/million INR';
        COMMENT ON COLUMN industry_benchmarking.scope_3_intensity_unit IS 'Unit for Scope 3 intensity';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'water_consumption_intensity_unit') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN water_consumption_intensity_unit VARCHAR(50) DEFAULT 'm3/million INR';
        COMMENT ON COLUMN industry_benchmarking.water_consumption_intensity_unit IS 'Unit for water consumption intensity';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'water_withdrawal_intensity_unit') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN water_withdrawal_intensity_unit VARCHAR(50) DEFAULT 'm3/million INR';
        COMMENT ON COLUMN industry_benchmarking.water_withdrawal_intensity_unit IS 'Unit for water withdrawal intensity';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'waste_generated_intensity_unit') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN waste_generated_intensity_unit VARCHAR(50) DEFAULT 'MT/million INR';
        COMMENT ON COLUMN industry_benchmarking.waste_generated_intensity_unit IS 'Unit for waste generated intensity';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'renewable_energy_intensity_unit') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN renewable_energy_intensity_unit VARCHAR(50) DEFAULT 'Joules/million INR';
        COMMENT ON COLUMN industry_benchmarking.renewable_energy_intensity_unit IS 'Unit for renewable energy intensity';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'total_energy_intensity_unit') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN total_energy_intensity_unit VARCHAR(50) DEFAULT 'Joules/million INR';
        COMMENT ON COLUMN industry_benchmarking.total_energy_intensity_unit IS 'Unit for total energy intensity';
    END IF;
    
    -- Add unit columns for social metrics
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'male_employee_percentage_unit') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN male_employee_percentage_unit VARCHAR(50) DEFAULT '%';
        COMMENT ON COLUMN industry_benchmarking.male_employee_percentage_unit IS 'Unit for male employee percentage';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'female_employee_percentage_unit') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN female_employee_percentage_unit VARCHAR(50) DEFAULT '%';
        COMMENT ON COLUMN industry_benchmarking.female_employee_percentage_unit IS 'Unit for female employee percentage';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'permanent_employees_per_million_rs_unit') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN permanent_employees_per_million_rs_unit VARCHAR(50) DEFAULT 'Head Count/million INR';
        COMMENT ON COLUMN industry_benchmarking.permanent_employees_per_million_rs_unit IS 'Unit for permanent employees per million rupees';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'other_employees_per_million_rs_unit') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN other_employees_per_million_rs_unit VARCHAR(50) DEFAULT 'Head Count/million INR';
        COMMENT ON COLUMN industry_benchmarking.other_employees_per_million_rs_unit IS 'Unit for other employees per million rupees';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'msme_sourcing_percentage_unit') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN msme_sourcing_percentage_unit VARCHAR(50) DEFAULT '%';
        COMMENT ON COLUMN industry_benchmarking.msme_sourcing_percentage_unit IS 'Unit for MSME sourcing percentage';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'health_safety_complaints_unit') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN health_safety_complaints_unit VARCHAR(50) DEFAULT 'Count';
        COMMENT ON COLUMN industry_benchmarking.health_safety_complaints_unit IS 'Unit for health and safety complaints';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'working_conditions_complaints_unit') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN working_conditions_complaints_unit VARCHAR(50) DEFAULT 'Count';
        COMMENT ON COLUMN industry_benchmarking.working_conditions_complaints_unit IS 'Unit for working conditions complaints';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'industry_benchmarking' AND column_name = 'posh_complaints_unit') THEN
        ALTER TABLE industry_benchmarking ADD COLUMN posh_complaints_unit VARCHAR(50) DEFAULT 'Count';
        COMMENT ON COLUMN industry_benchmarking.posh_complaints_unit IS 'Unit for POSH complaints';
    END IF;
END $$;

-- 2. Update production numbers, country, and verification status
UPDATE industry_benchmarking SET 
    annual_cement_production = 112230000,
    country = 'India',
    is_verified = true,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'UltraTech Cement Limited';

UPDATE industry_benchmarking SET 
    annual_cement_production = 65200000,
    country = 'India',
    is_verified = true,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'Ambuja Cements Limited';

UPDATE industry_benchmarking SET 
    annual_cement_production = 31790000,
    country = 'India',
    is_verified = true,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'Shree Cement Limited';

UPDATE industry_benchmarking SET 
    annual_cement_production = 19090000,
    country = 'India',
    is_verified = true,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'JK Cement Limited';

UPDATE industry_benchmarking SET 
    annual_cement_production = 18400000,
    country = 'India',
    is_verified = true,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'The Ramco Cements Limited';

UPDATE industry_benchmarking SET 
    annual_cement_production = 5470000,
    country = 'India',
    is_verified = true,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'SAGAR CEMENTS LIMITED';

UPDATE industry_benchmarking SET 
    annual_cement_production = 4450000,
    country = 'India',
    is_verified = true,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'Star Cement Limited';

UPDATE industry_benchmarking SET 
    annual_cement_production = 2880000,
    country = 'India',
    is_verified = true,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'Mangalam Cement Limited';

UPDATE industry_benchmarking SET 
    annual_cement_production = 8815000,
    country = 'India',
    is_verified = true,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'THE INDIA CEMENTS LIMITED';

UPDATE industry_benchmarking SET 
    annual_cement_production = 5320000,
    country = 'India',
    is_verified = true,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'HeidelbergCement India Limited';

-- 3. Create indexes for the new unit columns for better query performance
CREATE INDEX IF NOT EXISTS idx_industry_benchmarking_country ON industry_benchmarking (country);
CREATE INDEX IF NOT EXISTS idx_industry_benchmarking_is_verified ON industry_benchmarking (is_verified);
CREATE INDEX IF NOT EXISTS idx_industry_benchmarking_annual_cement_production ON industry_benchmarking (annual_cement_production);
