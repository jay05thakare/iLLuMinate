-- Migration: Add missing emission factor libraries from CSV
-- Created: 2024-09-21
-- Description: Add all required libraries referenced in the CSV data

INSERT INTO emission_factor_libraries (library_name, version, year, region, description, source_url, is_active)
VALUES
  -- GHG Protocol libraries
  ('GHG Protocol', 'ar5', 2022, 'Global', 'GHG Protocol Emission Factors from IPCC Fifth Assessment Report (AR5)', 'https://ghgprotocol.org/', true),
  ('GHG Protocol', 'ar6', 2024, 'Global', 'GHG Protocol Emission Factors from IPCC Sixth Assessment Report (AR6)', 'https://ghgprotocol.org/', true),
  
  -- CEA (Central Electricity Authority) libraries  
  ('CEA', 'ar5', 2023, 'India', 'Central Electricity Authority India Grid Emission Factors 2023', 'https://cea.nic.in/', true),
  ('CEA', 'ar5', 2024, 'India', 'Central Electricity Authority India Grid Emission Factors 2024', 'https://cea.nic.in/', true),
  
  -- DEFRA/BEIS libraries
  ('DEFRA/BEIS', 'ar4', 2022, 'UK', 'DEFRA/BEIS UK Government GHG Conversion Factors 2022', 'https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting', true),
  ('DEFRA/BEIS', 'ar5', 2023, 'UK', 'DEFRA/BEIS UK Government GHG Conversion Factors 2023', 'https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting', true),
  ('DEFRA/BEIS', 'ar5', 2024, 'UK', 'DEFRA/BEIS UK Government GHG Conversion Factors 2024', 'https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting', true),
  
  -- IPCC libraries
  ('IPCC', 'ar6', 2023, 'Global', 'IPCC Sixth Assessment Report Working Group III 2023', 'https://www.ipcc.ch/', true)

ON CONFLICT (library_name, version, year) DO NOTHING;

-- Report results
DO $$ 
DECLARE
    library_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO library_count FROM emission_factor_libraries;
    RAISE NOTICE 'Total emission factor libraries after insertion: %', library_count;
END $$;
