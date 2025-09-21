-- Migration: Update social data for cement companies
-- Created: 2025-09-21
-- Description: Update social metrics for companies in industry_benchmarking table

-- Update social data for companies that have social metrics
-- Note: This data comes from the Social sheet of the Excel file

-- Ambuja Cements Limited
UPDATE industry_benchmarking 
SET 
    male_employee_percentage = 97.33,
    female_employee_percentage = 2.67,
    permanent_employees_per_million_rs = NULL, -- Data not available in Excel
    other_employees_per_million_rs = NULL, -- Data not available in Excel
    msme_sourcing_percentage = NULL, -- Data not available in Excel
    health_safety_complaints = NULL, -- Data not available in Excel
    working_conditions_complaints = NULL, -- Data not available in Excel
    child_labour_complaints = NULL, -- Data not available in Excel
    discrimination_complaints = NULL, -- Data not available in Excel
    forced_labour_complaints = NULL, -- Data not available in Excel
    other_human_rights_complaints = NULL, -- Data not available in Excel
    sexual_harassment_complaints = NULL, -- Data not available in Excel
    wages_complaints = NULL, -- Data not available in Excel
    posh_complaints = 0.0,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'Ambuja Cements Limited';

-- HeidelbergCement India Limited
UPDATE industry_benchmarking 
SET 
    male_employee_percentage = 97.65,
    female_employee_percentage = 2.35,
    permanent_employees_per_million_rs = NULL,
    other_employees_per_million_rs = NULL,
    msme_sourcing_percentage = NULL,
    health_safety_complaints = NULL,
    working_conditions_complaints = NULL,
    child_labour_complaints = NULL,
    discrimination_complaints = NULL,
    forced_labour_complaints = NULL,
    other_human_rights_complaints = NULL,
    sexual_harassment_complaints = NULL,
    wages_complaints = NULL,
    posh_complaints = 18.0,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'HeidelbergCement India Limited';

-- JK Cement Limited (TARGET COMPANY)
UPDATE industry_benchmarking 
SET 
    male_employee_percentage = 97.18,
    female_employee_percentage = 2.82,
    permanent_employees_per_million_rs = NULL,
    other_employees_per_million_rs = NULL,
    msme_sourcing_percentage = NULL,
    health_safety_complaints = NULL,
    working_conditions_complaints = NULL,
    child_labour_complaints = NULL,
    discrimination_complaints = NULL,
    forced_labour_complaints = NULL,
    other_human_rights_complaints = NULL,
    sexual_harassment_complaints = NULL,
    wages_complaints = NULL,
    posh_complaints = 209.0,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'JK Cement Limited';

-- Mangalam Cement Limited
UPDATE industry_benchmarking 
SET 
    male_employee_percentage = 97.83,
    female_employee_percentage = 2.17,
    permanent_employees_per_million_rs = NULL,
    other_employees_per_million_rs = NULL,
    msme_sourcing_percentage = NULL,
    health_safety_complaints = NULL,
    working_conditions_complaints = NULL,
    child_labour_complaints = NULL,
    discrimination_complaints = NULL,
    forced_labour_complaints = NULL,
    other_human_rights_complaints = NULL,
    sexual_harassment_complaints = NULL,
    wages_complaints = NULL,
    posh_complaints = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'Mangalam Cement Limited';

-- SAGAR CEMENTS LIMITED
UPDATE industry_benchmarking 
SET 
    male_employee_percentage = 98.45,
    female_employee_percentage = 1.55,
    permanent_employees_per_million_rs = NULL,
    other_employees_per_million_rs = NULL,
    msme_sourcing_percentage = NULL,
    health_safety_complaints = NULL,
    working_conditions_complaints = NULL,
    child_labour_complaints = NULL,
    discrimination_complaints = NULL,
    forced_labour_complaints = NULL,
    other_human_rights_complaints = NULL,
    sexual_harassment_complaints = NULL,
    wages_complaints = NULL,
    posh_complaints = 0.0,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'SAGAR CEMENTS LIMITED';

-- Shree Cement Limited
UPDATE industry_benchmarking 
SET 
    male_employee_percentage = 97.50,
    female_employee_percentage = 2.50,
    permanent_employees_per_million_rs = NULL,
    other_employees_per_million_rs = NULL,
    msme_sourcing_percentage = NULL,
    health_safety_complaints = NULL,
    working_conditions_complaints = NULL,
    child_labour_complaints = NULL,
    discrimination_complaints = NULL,
    forced_labour_complaints = NULL,
    other_human_rights_complaints = NULL,
    sexual_harassment_complaints = NULL,
    wages_complaints = NULL,
    posh_complaints = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'Shree Cement Limited';


-- Star Cement Limited
UPDATE industry_benchmarking 
SET 
    male_employee_percentage = 97.90,
    female_employee_percentage = 2.10,
    permanent_employees_per_million_rs = NULL,
    other_employees_per_million_rs = NULL,
    msme_sourcing_percentage = NULL,
    health_safety_complaints = NULL,
    working_conditions_complaints = NULL,
    child_labour_complaints = NULL,
    discrimination_complaints = NULL,
    forced_labour_complaints = NULL,
    other_human_rights_complaints = NULL,
    sexual_harassment_complaints = NULL,
    wages_complaints = NULL,
    posh_complaints = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'Star Cement Limited';

-- THE INDIA CEMENTS LIMITED
UPDATE industry_benchmarking 
SET 
    male_employee_percentage = 97.75,
    female_employee_percentage = 2.25,
    permanent_employees_per_million_rs = NULL,
    other_employees_per_million_rs = NULL,
    msme_sourcing_percentage = NULL,
    health_safety_complaints = NULL,
    working_conditions_complaints = NULL,
    child_labour_complaints = NULL,
    discrimination_complaints = NULL,
    forced_labour_complaints = NULL,
    other_human_rights_complaints = NULL,
    sexual_harassment_complaints = NULL,
    wages_complaints = NULL,
    posh_complaints = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'THE INDIA CEMENTS LIMITED';

-- The Ramco Cements Limited
UPDATE industry_benchmarking 
SET 
    male_employee_percentage = 97.60,
    female_employee_percentage = 2.40,
    permanent_employees_per_million_rs = NULL,
    other_employees_per_million_rs = NULL,
    msme_sourcing_percentage = NULL,
    health_safety_complaints = NULL,
    working_conditions_complaints = NULL,
    child_labour_complaints = NULL,
    discrimination_complaints = NULL,
    forced_labour_complaints = NULL,
    other_human_rights_complaints = NULL,
    sexual_harassment_complaints = NULL,
    wages_complaints = NULL,
    posh_complaints = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'The Ramco Cements Limited';

-- UltraTech Cement Limited
UPDATE industry_benchmarking 
SET 
    male_employee_percentage = 97.40,
    female_employee_percentage = 2.60,
    permanent_employees_per_million_rs = NULL,
    other_employees_per_million_rs = NULL,
    msme_sourcing_percentage = NULL,
    health_safety_complaints = NULL,
    working_conditions_complaints = NULL,
    child_labour_complaints = NULL,
    discrimination_complaints = NULL,
    forced_labour_complaints = NULL,
    other_human_rights_complaints = NULL,
    sexual_harassment_complaints = NULL,
    wages_complaints = NULL,
    posh_complaints = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'UltraTech Cement Limited';

-- Migration completion log
-- Note: Uncomment the following if migration_history table exists
/*
INSERT INTO migration_history (migration_name, applied_at, description) 
VALUES (
  '024_update_social_data',
  CURRENT_TIMESTAMP,
  'Updated social metrics for all cement companies in industry_benchmarking table'
) ON CONFLICT (migration_name) DO NOTHING;
*/

