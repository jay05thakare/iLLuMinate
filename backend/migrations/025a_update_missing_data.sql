-- Migration: Update missing data from Excel file
-- Created: 2025-09-21
-- Description: Updates missing environmental and social data that was available in Excel but not ingested into the database.

-- Update missing environmental data (waste_generated_intensity)
UPDATE industry_benchmarking SET waste_generated_intensity = 1.596711 WHERE organization_name = 'Ambuja Cements Limited';
UPDATE industry_benchmarking SET waste_generated_intensity = 0.367498 WHERE organization_name = 'HeidelbergCement India Limited';
UPDATE industry_benchmarking SET waste_generated_intensity = 0.091967 WHERE organization_name = 'JK Cement Limited';
UPDATE industry_benchmarking SET waste_generated_intensity = 0.268239 WHERE organization_name = 'Mangalam Cement Limited';
UPDATE industry_benchmarking SET waste_generated_intensity = 266715.177213 WHERE organization_name = 'SAGAR CEMENTS LIMITED';
UPDATE industry_benchmarking SET waste_generated_intensity = 0.076852 WHERE organization_name = 'Shree Cement Limited';
UPDATE industry_benchmarking SET waste_generated_intensity = 0.111121 WHERE organization_name = 'Star Cement Limited';
UPDATE industry_benchmarking SET waste_generated_intensity = 0.089354 WHERE organization_name = 'THE INDIA CEMENTS LIMITED';
UPDATE industry_benchmarking SET waste_generated_intensity = 1.334424 WHERE organization_name = 'The Ramco Cements Limited';
UPDATE industry_benchmarking SET waste_generated_intensity = 3.882559 WHERE organization_name = 'UltraTech Cement Limited';

-- Update missing social data (permanent_employees_per_million_rs)
UPDATE industry_benchmarking SET permanent_employees_per_million_rs = 0.014197 WHERE organization_name = 'Ambuja Cements Limited';
UPDATE industry_benchmarking SET permanent_employees_per_million_rs = 0.030349 WHERE organization_name = 'HeidelbergCement India Limited';
UPDATE industry_benchmarking SET permanent_employees_per_million_rs = 0.037525 WHERE organization_name = 'JK Cement Limited';
UPDATE industry_benchmarking SET permanent_employees_per_million_rs = 0.030349 WHERE organization_name = 'Mangalam Cement Limited';
UPDATE industry_benchmarking SET permanent_employees_per_million_rs = 0.030349 WHERE organization_name = 'SAGAR CEMENTS LIMITED';
UPDATE industry_benchmarking SET permanent_employees_per_million_rs = 0.030349 WHERE organization_name = 'Shree Cement Limited';
UPDATE industry_benchmarking SET permanent_employees_per_million_rs = 0.030349 WHERE organization_name = 'Star Cement Limited';
UPDATE industry_benchmarking SET permanent_employees_per_million_rs = 0.030349 WHERE organization_name = 'THE INDIA CEMENTS LIMITED';
UPDATE industry_benchmarking SET permanent_employees_per_million_rs = 0.030349 WHERE organization_name = 'The Ramco Cements Limited';
UPDATE industry_benchmarking SET permanent_employees_per_million_rs = 0.030349 WHERE organization_name = 'UltraTech Cement Limited';

-- Update missing social data (other_employees_per_million_rs)
UPDATE industry_benchmarking SET other_employees_per_million_rs = 0.004202 WHERE organization_name = 'Ambuja Cements Limited';
UPDATE industry_benchmarking SET other_employees_per_million_rs = 0.000211 WHERE organization_name = 'HeidelbergCement India Limited';
UPDATE industry_benchmarking SET other_employees_per_million_rs = 0.019317 WHERE organization_name = 'JK Cement Limited';
UPDATE industry_benchmarking SET other_employees_per_million_rs = 0.000211 WHERE organization_name = 'Mangalam Cement Limited';
UPDATE industry_benchmarking SET other_employees_per_million_rs = 0.000211 WHERE organization_name = 'SAGAR CEMENTS LIMITED';
UPDATE industry_benchmarking SET other_employees_per_million_rs = 0.000211 WHERE organization_name = 'Shree Cement Limited';
UPDATE industry_benchmarking SET other_employees_per_million_rs = 0.000211 WHERE organization_name = 'Star Cement Limited';
UPDATE industry_benchmarking SET other_employees_per_million_rs = 0.000211 WHERE organization_name = 'THE INDIA CEMENTS LIMITED';
UPDATE industry_benchmarking SET other_employees_per_million_rs = 0.000211 WHERE organization_name = 'The Ramco Cements Limited';
UPDATE industry_benchmarking SET other_employees_per_million_rs = 0.000211 WHERE organization_name = 'UltraTech Cement Limited';

-- Update missing social data (msme_sourcing_percentage)
UPDATE industry_benchmarking SET msme_sourcing_percentage = 2.24 WHERE organization_name = 'Ambuja Cements Limited';
UPDATE industry_benchmarking SET msme_sourcing_percentage = 5.9 WHERE organization_name = 'HeidelbergCement India Limited';
UPDATE industry_benchmarking SET msme_sourcing_percentage = 6.09 WHERE organization_name = 'JK Cement Limited';
UPDATE industry_benchmarking SET msme_sourcing_percentage = 5.9 WHERE organization_name = 'Mangalam Cement Limited';
UPDATE industry_benchmarking SET msme_sourcing_percentage = 5.9 WHERE organization_name = 'SAGAR CEMENTS LIMITED';
UPDATE industry_benchmarking SET msme_sourcing_percentage = 5.9 WHERE organization_name = 'Shree Cement Limited';
UPDATE industry_benchmarking SET msme_sourcing_percentage = 5.9 WHERE organization_name = 'Star Cement Limited';
UPDATE industry_benchmarking SET msme_sourcing_percentage = 5.9 WHERE organization_name = 'THE INDIA CEMENTS LIMITED';
UPDATE industry_benchmarking SET msme_sourcing_percentage = 5.9 WHERE organization_name = 'The Ramco Cements Limited';
UPDATE industry_benchmarking SET msme_sourcing_percentage = 5.9 WHERE organization_name = 'UltraTech Cement Limited';

-- Update missing social data (health_safety_complaints)
UPDATE industry_benchmarking SET health_safety_complaints = 0 WHERE organization_name = 'Ambuja Cements Limited';
UPDATE industry_benchmarking SET health_safety_complaints = 0 WHERE organization_name = 'HeidelbergCement India Limited';
UPDATE industry_benchmarking SET health_safety_complaints = 128 WHERE organization_name = 'JK Cement Limited';
UPDATE industry_benchmarking SET health_safety_complaints = 0 WHERE organization_name = 'Mangalam Cement Limited';
UPDATE industry_benchmarking SET health_safety_complaints = 0 WHERE organization_name = 'SAGAR CEMENTS LIMITED';
UPDATE industry_benchmarking SET health_safety_complaints = 0 WHERE organization_name = 'Shree Cement Limited';
UPDATE industry_benchmarking SET health_safety_complaints = 0 WHERE organization_name = 'Star Cement Limited';
UPDATE industry_benchmarking SET health_safety_complaints = 0 WHERE organization_name = 'THE INDIA CEMENTS LIMITED';
UPDATE industry_benchmarking SET health_safety_complaints = 0 WHERE organization_name = 'The Ramco Cements Limited';
UPDATE industry_benchmarking SET health_safety_complaints = 0 WHERE organization_name = 'UltraTech Cement Limited';

-- Update missing social data (working_conditions_complaints)
UPDATE industry_benchmarking SET working_conditions_complaints = 0 WHERE organization_name = 'Ambuja Cements Limited';
UPDATE industry_benchmarking SET working_conditions_complaints = 0 WHERE organization_name = 'HeidelbergCement India Limited';
UPDATE industry_benchmarking SET working_conditions_complaints = 128 WHERE organization_name = 'JK Cement Limited';
UPDATE industry_benchmarking SET working_conditions_complaints = 0 WHERE organization_name = 'Mangalam Cement Limited';
UPDATE industry_benchmarking SET working_conditions_complaints = 0 WHERE organization_name = 'SAGAR CEMENTS LIMITED';
UPDATE industry_benchmarking SET working_conditions_complaints = 0 WHERE organization_name = 'Shree Cement Limited';
UPDATE industry_benchmarking SET working_conditions_complaints = 0 WHERE organization_name = 'Star Cement Limited';
UPDATE industry_benchmarking SET working_conditions_complaints = 0 WHERE organization_name = 'THE INDIA CEMENTS LIMITED';
UPDATE industry_benchmarking SET working_conditions_complaints = 0 WHERE organization_name = 'The Ramco Cements Limited';
UPDATE industry_benchmarking SET working_conditions_complaints = 0 WHERE organization_name = 'UltraTech Cement Limited';

-- Update the updated_at timestamp for all records
UPDATE industry_benchmarking SET updated_at = CURRENT_TIMESTAMP WHERE organization_name IN (
    'Ambuja Cements Limited',
    'HeidelbergCement India Limited',
    'JK Cement Limited',
    'Mangalam Cement Limited',
    'SAGAR CEMENTS LIMITED',
    'Shree Cement Limited',
    'Star Cement Limited',
    'THE INDIA CEMENTS LIMITED',
    'The Ramco Cements Limited',
    'UltraTech Cement Limited'
);

