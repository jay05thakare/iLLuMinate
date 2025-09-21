-- Migration: Ingest emission factor libraries data from CSV
-- Created: 2024-09-21
-- Description: Import comprehensive emission factor libraries, resources, and factors from ef_libraries_with_cost.csv

-- Step 1: Insert emission factor libraries with ON CONFLICT DO NOTHING
WITH libraries_cte AS (
  SELECT DISTINCT
    'GHG Protocol' as library_name, 'ar5' as version, 2022 as year, 'Global' as region,
    'Greenhouse Gas Protocol emission factors' as description,
    'https://ghgprotocol.org/' as source_url
  UNION ALL
  SELECT 'GHG Protocol', 'ar6', 2023, 'Global',
    'Greenhouse Gas Protocol emission factors',
    'https://ghgprotocol.org/'
  UNION ALL
  SELECT 'GHG Protocol', 'ar6', 2024, 'Global',
    'Greenhouse Gas Protocol emission factors',
    'https://ghgprotocol.org/'
  UNION ALL
  SELECT 'IPCC', 'ar6', 2023, 'Global',
    'Intergovernmental Panel on Climate Change emission factors',
    'https://www.ipcc.ch/'
  UNION ALL
  SELECT 'DEFRA/BEIS', 'ar4', 2022, 'UK',
    'UK Department for Environment, Food & Rural Affairs / Business, Energy & Industrial Strategy emission factors',
    'https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting'
  UNION ALL
  SELECT 'DEFRA/BEIS', 'ar5', 2023, 'UK',
    'UK Department for Environment, Food & Rural Affairs / Business, Energy & Industrial Strategy emission factors',
    'https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting'
  UNION ALL
  SELECT 'DEFRA/BEIS', 'ar5', 2024, 'UK',
    'UK Department for Environment, Food & Rural Affairs / Business, Energy & Industrial Strategy emission factors',
    'https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting'
  UNION ALL
  SELECT 'CEA', 'ar5', 2023, 'India',
    'Central Electricity Authority emission factors',
    'https://cea.nic.in/'
  UNION ALL
  SELECT 'CEA', 'ar5', 2024, 'India',
    'Central Electricity Authority emission factors',
    'https://cea.nic.in/'
)
INSERT INTO emission_factor_libraries (library_name, version, year, region, description, source_url, is_active)
SELECT library_name, version, year, region, description, source_url, true
FROM libraries_cte
ON CONFLICT (library_name, version, year) DO NOTHING;

-- Step 2: Insert emission resources with ON CONFLICT DO NOTHING
WITH resources_cte AS (
  SELECT 'Natural Gas' as resource_name, 'fuel' as resource_type, 'stationary_combustion' as category, 'scope1' as scope, false as is_alternative_fuel, false as is_calculator, 'Natural Gas for stationary combustion operations' as description
  UNION ALL SELECT 'Coal Coke', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Coal Coke for stationary combustion operations'
  UNION ALL SELECT 'Municipal Solid Waste', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Municipal Solid Waste for stationary combustion operations'
  UNION ALL SELECT 'Petroleum Coke (Solid)', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Petroleum Coke (Solid) for stationary combustion operations'
  UNION ALL SELECT 'Plastics', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Plastics for stationary combustion operations'
  UNION ALL SELECT 'Tires', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Tires for stationary combustion operations'
  UNION ALL SELECT 'Agricultural Byproducts (Non Biogenic)', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Agricultural Byproducts (Non Biogenic) for stationary combustion operations'
  UNION ALL SELECT 'Peat (Non Biogenic)', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Peat (Non Biogenic) for stationary combustion operations'
  UNION ALL SELECT 'Solid Byproducts (Non Biogenic)', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Solid Byproducts (Non Biogenic) for stationary combustion operations'
  UNION ALL SELECT 'Wood and Wood Residuals (Non Biogenic)', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Wood and Wood Residuals (Non Biogenic) for stationary combustion operations'
  UNION ALL SELECT 'Aviation Gasoline', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Aviation Gasoline for stationary combustion operations'
  UNION ALL SELECT 'Butane', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Butane for stationary combustion operations'
  UNION ALL SELECT 'Butylene', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Butylene for stationary combustion operations'
  UNION ALL SELECT 'Crude Oil', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Crude Oil for stationary combustion operations'
  UNION ALL SELECT 'Distillate Fuel Oil No. 1', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Distillate Fuel Oil No. 1 for stationary combustion operations'
  UNION ALL SELECT 'Distillate Fuel Oil No. 2', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Distillate Fuel Oil No. 2 for stationary combustion operations'
  UNION ALL SELECT 'Distillate Fuel Oil No. 4', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Distillate Fuel Oil No. 4 for stationary combustion operations'
  UNION ALL SELECT 'Ethane', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Ethane for stationary combustion operations'
  UNION ALL SELECT 'Ethylene', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Ethylene for stationary combustion operations'
  UNION ALL SELECT 'Heavy Gas Oils', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Heavy Gas Oils for stationary combustion operations'
  UNION ALL SELECT 'Isobutane', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Isobutane for stationary combustion operations'
  UNION ALL SELECT 'Isobutylene', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Isobutylene for stationary combustion operations'
  UNION ALL SELECT 'Kerosene', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Kerosene for stationary combustion operations'
  UNION ALL SELECT 'Kerosene-Type Jet Fuel', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Kerosene-Type Jet Fuel for stationary combustion operations'
  UNION ALL SELECT 'Liquefied Petroleum Gases (LPG)', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Liquefied Petroleum Gases (LPG) for stationary combustion operations'
  UNION ALL SELECT 'Lubricants', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Lubricants for stationary combustion operations'
  UNION ALL SELECT 'Motor Gasoline', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Motor Gasoline for stationary combustion operations'
  UNION ALL SELECT 'Naphtha (<401 deg F)', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Naphtha (<401 deg F) for stationary combustion operations'
  UNION ALL SELECT 'Natural Gasoline', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Natural Gasoline for stationary combustion operations'
  UNION ALL SELECT 'Other Oil (>401 deg F)', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Other Oil (>401 deg F) for stationary combustion operations'
  UNION ALL SELECT 'Pentanes Plus', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Pentanes Plus for stationary combustion operations'
  UNION ALL SELECT 'Petrochemical Feedstocks', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Petrochemical Feedstocks for stationary combustion operations'
  UNION ALL SELECT 'Petroleum Coke', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Petroleum Coke for stationary combustion operations'
  UNION ALL SELECT 'Propane', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Propane for stationary combustion operations'
  UNION ALL SELECT 'Propylene', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Propylene for stationary combustion operations'
  UNION ALL SELECT 'Residual Fuel Oil No. 5', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Residual Fuel Oil No. 5 for stationary combustion operations'
  UNION ALL SELECT 'Residual Fuel Oil No. 6', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Residual Fuel Oil No. 6 for stationary combustion operations'
  UNION ALL SELECT 'Special Naphtha', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Special Naphtha for stationary combustion operations'
  UNION ALL SELECT 'Unfinished Oils', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Unfinished Oils for stationary combustion operations'
  UNION ALL SELECT 'Used Oil', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Used Oil for stationary combustion operations'
  UNION ALL SELECT 'Blast Furnace Gas', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Blast Furnace Gas for stationary combustion operations'
  UNION ALL SELECT 'Coke Oven Gas', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Coke Oven Gas for stationary combustion operations'
  UNION ALL SELECT 'Fuel Gas', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Fuel Gas for stationary combustion operations'
  UNION ALL SELECT 'Propane Gas', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Propane Gas for stationary combustion operations'
  UNION ALL SELECT 'Anthracite Coal', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Anthracite Coal for stationary combustion operations'
  UNION ALL SELECT 'Bituminous Coal', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Bituminous Coal for stationary combustion operations'
  UNION ALL SELECT 'Sub-bituminous Coal', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Sub-bituminous Coal for stationary combustion operations'
  UNION ALL SELECT 'Lignite Coal', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Lignite Coal for stationary combustion operations'
  UNION ALL SELECT 'Diesel', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Diesel for stationary combustion operations'
  -- Alternative fuels (biofuel = true)
  UNION ALL SELECT 'Agricultural Byproducts', 'fuel', 'stationary_combustion', 'scope1', true, false, 'Agricultural Byproducts for stationary combustion operations'
  UNION ALL SELECT 'Peat', 'fuel', 'stationary_combustion', 'scope1', true, false, 'Peat for stationary combustion operations'
  UNION ALL SELECT 'Solid Byproducts', 'fuel', 'stationary_combustion', 'scope1', true, false, 'Solid Byproducts for stationary combustion operations'
  UNION ALL SELECT 'Wood and Wood Residuals', 'fuel', 'stationary_combustion', 'scope1', true, false, 'Wood and Wood Residuals for stationary combustion operations'
  UNION ALL SELECT 'Landfill Gas', 'fuel', 'stationary_combustion', 'scope1', true, false, 'Landfill Gas for stationary combustion operations'
  UNION ALL SELECT 'Other Biomass Gases', 'fuel', 'stationary_combustion', 'scope1', true, false, 'Other Biomass Gases for stationary combustion operations'
  UNION ALL SELECT 'Biodiesel (100%)', 'fuel', 'stationary_combustion', 'scope1', true, false, 'Biodiesel (100%) for stationary combustion operations'
  UNION ALL SELECT 'Ethanol (100%)', 'fuel', 'stationary_combustion', 'scope1', true, false, 'Ethanol (100%) for stationary combustion operations'
  UNION ALL SELECT 'Rendered Animal Fat', 'fuel', 'stationary_combustion', 'scope1', true, false, 'Rendered Animal Fat for stationary combustion operations'
  UNION ALL SELECT 'Vegetable Oil', 'fuel', 'stationary_combustion', 'scope1', true, false, 'Vegetable Oil for stationary combustion operations'
  -- Refrigerants
  UNION ALL SELECT 'HFC-125', 'refrigerant', 'fugitive_emissions', 'scope1', false, false, 'HFC-125 fugitive emissions'
  UNION ALL SELECT 'HFC-134a', 'refrigerant', 'fugitive_emissions', 'scope1', false, false, 'HFC-134a fugitive emissions'
  UNION ALL SELECT 'R-404A', 'refrigerant', 'fugitive_emissions', 'scope1', false, false, 'R-404A fugitive emissions'
  UNION ALL SELECT 'R-407A', 'refrigerant', 'fugitive_emissions', 'scope1', false, false, 'R-407A fugitive emissions'
  UNION ALL SELECT 'R-407C', 'refrigerant', 'fugitive_emissions', 'scope1', false, false, 'R-407C fugitive emissions'
  UNION ALL SELECT 'R-410A', 'refrigerant', 'fugitive_emissions', 'scope1', false, false, 'R-410A fugitive emissions'
  -- Electricity
  UNION ALL SELECT 'Electricity supplied from grid', 'electricity', 'purchased_electricity', 'scope2', false, false, 'Electricity supplied from grid purchased electricity'
)
INSERT INTO emission_resources (resource_name, resource_type, category, scope, is_alternative_fuel, is_calculator, description)
SELECT resource_name, resource_type, category, scope, is_alternative_fuel, is_calculator, description
FROM resources_cte
ON CONFLICT (resource_name, scope) DO NOTHING;

-- Note: Emission factors are now handled by dedicated batch migrations (031-034)
-- This migration focuses on setting up libraries and basic resources only.
