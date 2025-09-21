-- Migration: Complete emission factors ingestion from CSV
-- Created: 2024-09-21
-- Description: Insert ALL 548 emission factors from ef_libraries_with_cost.csv

-- This migration includes ALL emission factors from the CSV
-- Converting INR costs to USD using rate: 1 USD = 83 INR

WITH all_emission_factors AS (
  SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Asphalt and Road Oil' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    3.15560755189492::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    44.0371706969117::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.42::DECIMAL(10,2) as approximate_cost, -- 35.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Mixed (Commercial Sector)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.23999885624178::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    24.87657::DECIMAL(10,2) as heat_content,
    'GJ/kg' as heat_content_unit,
    0.14::DECIMAL(10,2) as approximate_cost, -- 12.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Mixed (Electric Power Sector)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.09334645554113::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    22.94599::DECIMAL(10,2) as heat_content,
    'GJ/kg' as heat_content_unit,
    0.12::DECIMAL(10,2) as approximate_cost, -- 10.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Mixed (Industrial Coking)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.74136992207342::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    30.56364::DECIMAL(10,2) as heat_content,
    'GJ/kg' as heat_content_unit,
    0.14::DECIMAL(10,2) as approximate_cost, -- 12.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Mixed (Industrial Sector)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.35038642735547::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    25.99305::DECIMAL(10,2) as heat_content,
    'GJ/kg' as heat_content_unit,
    0.14::DECIMAL(10,2) as approximate_cost, -- 12.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Coal Coke' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    3.12744414109082::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    28.8424::DECIMAL(10,2) as heat_content,
    'GJ/kg' as heat_content_unit,
    0.18::DECIMAL(10,2) as approximate_cost, -- 15.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Municipal Solid Waste' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1.01683208427867::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    11.57185::DECIMAL(10,2) as heat_content,
    'GJ/kg' as heat_content_unit,
    0.02::DECIMAL(10,2) as approximate_cost, -- 2.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Petroleum Coke (Solid)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    3.45306734326241::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    34.89::DECIMAL(10,2) as heat_content,
    'GJ/kg' as heat_content_unit,
    1.14::DECIMAL(10,2) as approximate_cost, -- 95.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Plastics' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    3.22573988623309::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    44.194::DECIMAL(10,2) as heat_content,
    'GJ/kg' as heat_content_unit,
    0.78::DECIMAL(10,2) as approximate_cost, -- 65.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Tires' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.71544691106687::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    32.564::DECIMAL(10,2) as heat_content,
    'GJ/kg' as heat_content_unit,
    0.54::DECIMAL(10,2) as approximate_cost, -- 45.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Agricultural Byproducts' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1.09291603604355::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    9.59475::DECIMAL(10,2) as heat_content,
    'GJ/kg' as heat_content_unit,
    0.1::DECIMAL(10,2) as approximate_cost, -- 8.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Peat' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1.00397632349945::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    9.304::DECIMAL(10,2) as heat_content,
    'GJ/kg' as heat_content_unit,
    0.18::DECIMAL(10,2) as approximate_cost, -- 15.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Solid Byproducts' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1.23141666823011::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    12.08357::DECIMAL(10,2) as heat_content,
    'GJ/kg' as heat_content_unit,
    0.06::DECIMAL(10,2) as approximate_cost, -- 5.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Wood and Wood Residuals' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1.82964264588489::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    20.32924::DECIMAL(10,2) as heat_content,
    'GJ/kg' as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Aviation Gasoline' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.20297301447083::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    33.4459524280341::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.14::DECIMAL(10,2) as approximate_cost, -- 95.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Butane' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1.76898561878518::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    28.7077758340626::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.7::DECIMAL(10,2) as approximate_cost, -- 58.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Butylene' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1.91290021293271::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    29.2652083745299::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.6::DECIMAL(10,2) as approximate_cost, -- 50.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Crude Oil' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.72626984850774::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    38.4628452922392::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.9::DECIMAL(10,2) as approximate_cost, -- 75.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Distillate Fuel Oil No. 1' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.69865673636172::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    38.7415615624728::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.05::DECIMAL(10,2) as approximate_cost, -- 87.5 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Distillate Fuel Oil No. 2' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.70512551741465::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    38.4628452922392::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.05::DECIMAL(10,2) as approximate_cost, -- 87.5 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Distillate Fuel Oil No. 4' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.90359903724926::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    40.6925754541082::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.05::DECIMAL(10,2) as approximate_cost, -- 87.5 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Ethane' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1.07500167392621::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    18.952706375886::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.6::DECIMAL(10,2) as approximate_cost, -- 50.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Ethylene' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1.01436097924332::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    16.1655436735499::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.6::DECIMAL(10,2) as approximate_cost, -- 50.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Heavy Gas Oils' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.93868267087181::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    41.2500079945754::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.9::DECIMAL(10,2) as approximate_cost, -- 75.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Isobutane' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1.70473316379863::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    27.5929107531282::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.7::DECIMAL(10,2) as approximate_cost, -- 58.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Isobutylene' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1.88027337939969::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    28.7077758340626::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.6::DECIMAL(10,2) as approximate_cost, -- 50.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Kerosene' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.69054084256059::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    37.6266964815384::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.54::DECIMAL(10,2) as approximate_cost, -- 45.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Kerosene-Type Jet Fuel' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.58426442578461::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    37.6266964815384::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.14::DECIMAL(10,2) as approximate_cost, -- 95.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Liquefied Petroleum Gases (LPG)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1.50569510828753::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    25.6418968614928::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.14::DECIMAL(10,2) as approximate_cost, -- 95.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Lubricants' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.83453231077545::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    40.1351429136409::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.6::DECIMAL(10,2) as approximate_cost, -- 50.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Motor Gasoline' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.32679441812272::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    34.8395337792022::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.14::DECIMAL(10,2) as approximate_cost, -- 95.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Naphtha (<401 deg F)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.25414710364747::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    34.8395337792022::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.6::DECIMAL(10,2) as approximate_cost, -- 50.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Natural Gasoline' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1.95052227580905::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    30.6587897256979::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.42::DECIMAL(10,2) as approximate_cost, -- 35.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Other Oil (>401 deg F)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.80771488485197::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    38.7415615624728::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.9::DECIMAL(10,2) as approximate_cost, -- 75.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Pentanes Plus' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.04176730278998::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    30.6587897256979::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.6::DECIMAL(10,2) as approximate_cost, -- 50.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Petrochemical Feedstocks' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.35321162338645::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    34.8395337792022::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.45::DECIMAL(10,2) as approximate_cost, -- 120.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Petroleum Coke' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    3.87788168187082::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    39.8564266434073::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.14::DECIMAL(10,2) as approximate_cost, -- 95.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Propane' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1.51721485898689::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    25.3631805912592::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.7::DECIMAL(10,2) as approximate_cost, -- 58.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Propylene' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1.63500917725786::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    25.3631805912592::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.6::DECIMAL(10,2) as approximate_cost, -- 50.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Residual Fuel Oil No. 5' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.70623662506804::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    39.0202778327065::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.78::DECIMAL(10,2) as approximate_cost, -- 65.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Residual Fuel Oil No. 6' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.98552724427777::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    41.8074405350427::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.78::DECIMAL(10,2) as approximate_cost, -- 65.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Special Naphtha' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.39680001207161::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    34.8395337792022::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.6::DECIMAL(10,2) as approximate_cost, -- 50.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Unfinished Oils' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.74602542712011::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    38.7415615624728::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.9::DECIMAL(10,2) as approximate_cost, -- 75.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Used Oil' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.7065837471452::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    38.4628452922392::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.9::DECIMAL(10,2) as approximate_cost, -- 75.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Biodiesel (100%)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.49885458960557::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    35.6756825899031::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.05::DECIMAL(10,2) as approximate_cost, -- 87.5 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Ethanol (100%)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1.52004488135238::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    23.4121666996239::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.54::DECIMAL(10,2) as approximate_cost, -- 45.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Vegetable Oil' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.58708816085525::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    33.4459524280341::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.9::DECIMAL(10,2) as approximate_cost, -- 75.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Aviation Gasoline - Aviation Gasoline Aircraft' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.25519190411565::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    34.997::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.14::DECIMAL(10,2) as approximate_cost, -- 95.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Motor Gasoline - Gasoline Motorcycles' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.36843585877994::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    34.981769078784::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.14::DECIMAL(10,2) as approximate_cost, -- 95.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Motor Gasoline - Other Gasoline Non-Road Vehicles' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.33853026156113::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    34.981769078784::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.14::DECIMAL(10,2) as approximate_cost, -- 95.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Diesel Fuel - Diesel Agricultural Equipment' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.72604952901584::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    38.5959153857992::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.05::DECIMAL(10,2) as approximate_cost, -- 87.5 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Motor Gasoline - Gasoline Passenger Cars' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.32798028646701::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    34.981769078784::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.14::DECIMAL(10,2) as approximate_cost, -- 95.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Motor Gasoline - Gasoline Light-duty Trucks (Vans, Pickup Trucks, SUVs)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.32886882388262::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    34.981769078784::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.14::DECIMAL(10,2) as approximate_cost, -- 95.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Motor Gasoline - Hybrid (Gasoline) Passenger Cars' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.33127080565021::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    34.981769078784::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.14::DECIMAL(10,2) as approximate_cost, -- 95.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Motor Gasoline - Gasoline Heavy-duty Vehicles' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.32985324518645::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    34.981769078784::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.14::DECIMAL(10,2) as approximate_cost, -- 95.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Motor Gasoline - Gasoline Ships and Boats' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.33956581600747::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    34.981769078784::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.14::DECIMAL(10,2) as approximate_cost, -- 95.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Motor Gasoline - Gasoline Agricultural Equipment' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.34415184284126::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    34.981769078784::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.14::DECIMAL(10,2) as approximate_cost, -- 95.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Diesel Fuel - Diesel Ships and Boats' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.72914298375222::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    38.5959153857992::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.05::DECIMAL(10,2) as approximate_cost, -- 87.5 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Diesel Fuel - Diesel Passenger Cars' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.69885499748722::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    38.5959153857992::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.05::DECIMAL(10,2) as approximate_cost, -- 87.5 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Diesel Fuel - Diesel Light-duty Trucks' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.69901762180283::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    38.5959153857992::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.05::DECIMAL(10,2) as approximate_cost, -- 87.5 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Diesel Fuel - Diesel Medium- and Heavy-duty Vehicles' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.70048566288342::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    38.5959153857992::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.05::DECIMAL(10,2) as approximate_cost, -- 87.5 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Jet Fuel - Jet Fuel Aircraft' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.5966791913983::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    34.997::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.14::DECIMAL(10,2) as approximate_cost, -- 95.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Compressed Natural Gas - CNG Light-duty Vehicles' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    0.1593996199254991::DECIMAL(15,6) as emission_factor,
    'kgCO2e/m3' as emission_factor_unit,
    0.029::DECIMAL(10,2) as heat_content,
    'GJ/m3' as heat_content_unit,
    0.42::DECIMAL(10,2) as approximate_cost, -- 35.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Compressed Natural Gas - CNG Medium- and Heavy-duty Vehicles' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    0.2501610005434323::DECIMAL(15,6) as emission_factor,
    'kgCO2e/m3' as emission_factor_unit,
    0.029::DECIMAL(10,2) as heat_content,
    'GJ/m3' as heat_content_unit,
    0.42::DECIMAL(10,2) as approximate_cost, -- 35.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Natural Gas' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    0.0019244896075398::DECIMAL(15,6) as emission_factor,
    'kgCO2e/m3' as emission_factor_unit,
    0.0382276783880349::DECIMAL(10,2) as heat_content,
    'GJ/m3' as heat_content_unit,
    0.42::DECIMAL(10,2) as approximate_cost, -- 35.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Blast Furnace Gas' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    0.000891339880762::DECIMAL(15,6) as emission_factor,
    'kgCO2e/m3' as emission_factor_unit,
    0.003427823013352::DECIMAL(10,2) as heat_content,
    'GJ/m3' as heat_content_unit,
    0.42::DECIMAL(10,2) as approximate_cost, -- 35.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Coke Oven Gas' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    0.0009918856593304::DECIMAL(15,6) as emission_factor,
    'kgCO2e/m3' as emission_factor_unit,
    0.0223181085325856::DECIMAL(10,2) as heat_content,
    'GJ/m3' as heat_content_unit,
    0.42::DECIMAL(10,2) as approximate_cost, -- 35.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Fuel Gas' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    0.0029038997583862::DECIMAL(15,6) as emission_factor,
    'kgCO2e/m3' as emission_factor_unit,
    0.0517154167666593::DECIMAL(10,2) as heat_content,
    'GJ/m3' as heat_content_unit,
    0.42::DECIMAL(10,2) as approximate_cost, -- 35.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Propane Gas' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    0.0054824165343326::DECIMAL(15,6) as emission_factor,
    'kgCO2e/m3' as emission_factor_unit,
    0.0937435076260193::DECIMAL(10,2) as heat_content,
    'GJ/m3' as heat_content_unit,
    0.7::DECIMAL(10,2) as approximate_cost, -- 58.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Landfill Gas' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    0.0008962289166054::DECIMAL(15,6) as emission_factor,
    'kgCO2e/m3' as emission_factor_unit,
    0.0180705887116928::DECIMAL(10,2) as heat_content,
    'GJ/m3' as heat_content_unit,
    0.42::DECIMAL(10,2) as approximate_cost, -- 35.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Other Biomass Gases' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    0.0012103710110856::DECIMAL(15,6) as emission_factor,
    'kgCO2e/m3' as emission_factor_unit,
    0.0244046094972348::DECIMAL(10,2) as heat_content,
    'GJ/m3' as heat_content_unit,
    0.42::DECIMAL(10,2) as approximate_cost, -- 35.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Electricity - Mobile - Electric Vehicle' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    0.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kWh' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.08::DECIMAL(10,2) as approximate_cost, -- 6.5 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Anthracite Coal' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.8879982923875::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    29.17967::DECIMAL(10,2) as heat_content,
    'GJ/kg' as heat_content_unit,
    0.1::DECIMAL(10,2) as approximate_cost, -- 8.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Bituminous Coal' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.58350813969821::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    28.99359::DECIMAL(10,2) as heat_content,
    'GJ/kg' as heat_content_unit,
    0.1::DECIMAL(10,2) as approximate_cost, -- 8.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Sub-bituminous Coal' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1.86159381384656::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    20.06175::DECIMAL(10,2) as heat_content,
    'GJ/kg' as heat_content_unit,
    0.1::DECIMAL(10,2) as approximate_cost, -- 8.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Lignite Coal' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1.54213674273225::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    16.5262300000001::DECIMAL(10,2) as heat_content,
    'GJ/kg' as heat_content_unit,
    0.1::DECIMAL(10,2) as approximate_cost, -- 8.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Diesel' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.7244005::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    40.7208464150138::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.05::DECIMAL(10,2) as approximate_cost, -- 87.5 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Rendered Animal Fat' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.34848789687023::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    34.8395337792022::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.6::DECIMAL(10,2) as approximate_cost, -- 50.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Ethanol (100%) - Ethanol Light-duty Vehicles' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    0.082574636041313::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    23.4121666431437::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.54::DECIMAL(10,2) as approximate_cost, -- 45.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Ethanol (100%) - Ethanol Medium- and Heavy-duty Vehicles' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    0.120631737453937::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    23.4121666431437::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.54::DECIMAL(10,2) as approximate_cost, -- 45.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Biodiesel (100%) - Biodiesel Passenger Cars' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    0.001658340060431::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    35.6756825038381::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.05::DECIMAL(10,2) as approximate_cost, -- 87.5 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Biodiesel (100%) - Biodiesel Light-duty Vehicles' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    0.00119400484351::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    35.6756825038381::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.05::DECIMAL(10,2) as approximate_cost, -- 87.5 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Biodiesel (100%) - Biodiesel Medium- and Heavy-duty Vehicles' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    0.0034057061026::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    35.6756825038381::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.05::DECIMAL(10,2) as approximate_cost, -- 87.5 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Agricultural Byproducts' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    0.018269983245089::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    9.59475::DECIMAL(10,2) as heat_content,
    'GJ/kg' as heat_content_unit,
    0.1::DECIMAL(10,2) as approximate_cost, -- 8.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Peat' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    0.017716347389177::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    9.304::DECIMAL(10,2) as heat_content,
    'GJ/kg' as heat_content_unit,
    0.18::DECIMAL(10,2) as approximate_cost, -- 15.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Solid Byproducts' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    0.023009106171693::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    12.08357::DECIMAL(10,2) as heat_content,
    'GJ/kg' as heat_content_unit,
    0.06::DECIMAL(10,2) as approximate_cost, -- 5.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Wood and Wood Residuals' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    0.022266565021806::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    20.32924::DECIMAL(10,2) as heat_content,
    'GJ/kg' as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HCFC-225ca' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    127.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-125' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    3170.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-134' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1120.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HCFC-225cb' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    525.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HCFC-21' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    148.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Nitrogen trifluoride' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    16100.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'PFC-9-1-18' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    7190.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Carbon dioxide' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Methane' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    28.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Nitrous oxide' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    265.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-23' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    12400.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-32' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    677.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-41' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    116.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-134a' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1300.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-143' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    328.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-143a' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    4800.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-152a' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    138.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-227ea' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    3350.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-236fa' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    8060.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-245fa' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    858.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-43-I0mee' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1650.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Perfluoromethane (PFC-14)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    6630.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Perfluoroethane (PFC-116)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    11100.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Perfluoropropane (PFC-218)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    8900.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.7::DECIMAL(10,2) as approximate_cost, -- 58.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Perfluorocyclobutane (PFC-318)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    9540.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.7::DECIMAL(10,2) as approximate_cost, -- 58.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Perfluorobutane (PFC-3-1-10)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    9200.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.7::DECIMAL(10,2) as approximate_cost, -- 58.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Perfluoropentane (PFC-4-1-12)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    8550.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Perfluorohexane (PFC-5-1-14)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    7910.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Sulphur hexafluoride (SF6)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    23500.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-152' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    16.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-161' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    4.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-236cb' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1120.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-236ea' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1330.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-245ca' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    716.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-365mfc' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    804.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-404A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    3943.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-407A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1923.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-407C' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1624.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-407F' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1674.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-408A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2430.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-410A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1924.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-507A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    3985.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-403A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1780.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'CFC-13' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    13900.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'CFC-113' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    5820.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'CFC-114' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    8590.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'CFC-115' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    7670.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Halon-1211' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1750.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Halon-1301' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    6290.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Halon-2402' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1470.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Carbon tetrachloride' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1730.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    1.45::DECIMAL(10,2) as approximate_cost, -- 120.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Methyl bromide' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Methyl chloroform' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    160.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HCFC-123' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    79.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HCFC-124' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    527.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HCFC-141b' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    782.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HCFC-142b' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1980.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Trifluoromethyl sulphur pentafluoride' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    17400.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-125' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    12400.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-134' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    5560.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-143a' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    523.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HCFE-235da2' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    491.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-245cb2' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    654.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-245fa2' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    812.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-254cb2' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    301.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-347mcc3' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    530.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-347pcf2' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    889.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-356pcc3' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    413.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-449sl (HFE-7100)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    421.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-569sf2 (HFE-7200)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    57.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-43-10pccc124 (H-Galden1040x)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2820.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-236ca12 (HG-10)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    5350.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-338pcc13 (HG-01)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    2910.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'PFPMIE' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    9710.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Methylene chloride' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    9.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    1.45::DECIMAL(10,2) as approximate_cost, -- 120.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Methyl chloride' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    12.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    1.45::DECIMAL(10,2) as approximate_cost, -- 120.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'CFC-11/R11 (trichlorofluoromethane)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    4660.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'CFC-12/R12 (dichlorodifluoromethane)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    10200.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HCFC-22/R22 (chlorodifluoromethane)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    1760.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-404A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'IPCC' AND version = 'ar6' AND year = 2023) as library_id,
    4562.4::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Landfill Gas' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    0.004394089206247::DECIMAL(15,6) as emission_factor,
    'kgCO2e/m3' as emission_factor_unit,
    18.070588711693::DECIMAL(10,2) as heat_content,
    'GJ/m3' as heat_content_unit,
    0.42::DECIMAL(10,2) as approximate_cost, -- 35.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Other Biomass Gases' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    0.005934285422869::DECIMAL(15,6) as emission_factor,
    'kgCO2e/m3' as emission_factor_unit,
    24.404609497235::DECIMAL(10,2) as heat_content,
    'GJ/m3' as heat_content_unit,
    0.42::DECIMAL(10,2) as approximate_cost, -- 35.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Biodiesel (100%)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    0.002027150663118::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    35.675682589903::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.05::DECIMAL(10,2) as approximate_cost, -- 87.5 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Ethanol (100%)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    0.001330317622671::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    23.412166699624::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.54::DECIMAL(10,2) as approximate_cost, -- 45.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Rendered Animal Fat' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    0.001979639319451::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    34.839533779202::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.6::DECIMAL(10,2) as approximate_cost, -- 50.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Vegetable Oil' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) as library_id,
    0.001900453746673::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    33.445952428034::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.9::DECIMAL(10,2) as approximate_cost, -- 75.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-407C' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    1908.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-404A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    4728.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Nitrogen trifluoride' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    17200.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-245ca' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    693.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-245fa' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    1030.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-32' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    675.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-365mfc' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    794.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-41' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    92.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-43-I0mee' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    1640.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-125' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    14900.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-134' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    6320.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-143a' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    756.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-236ca12 (HG-10)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    2800.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-245cb2' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    708.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-245fa2' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    659.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-254cb2' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    359.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-338pcc13 (HG-01)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    1500.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-347mcc3' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    575.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-449sl (HFE-7100)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    297.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-347pcf2' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    580.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-356pcc3' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    110.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-43-10pccc124 (H-Galden1040x)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    1870.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-569sf2 (HFE-7200)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    59.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Methane' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    25.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Methyl bromide' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    5.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Methyl chloride' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    13.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    1.45::DECIMAL(10,2) as approximate_cost, -- 120.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Methyl chloroform' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    146.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Methylene chloride' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    9.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    1.45::DECIMAL(10,2) as approximate_cost, -- 120.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Nitrous oxide' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    298.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Perfluorocyclopropane' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    17340.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.7::DECIMAL(10,2) as approximate_cost, -- 58.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Perfluoroethane (PFC-116)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    12200.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Perfluoromethane (PFC-14)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    7390.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Perfluoropropane (PFC-218)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    8830.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.7::DECIMAL(10,2) as approximate_cost, -- 58.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Perfluorocyclobutane (PFC-318)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    10300.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.7::DECIMAL(10,2) as approximate_cost, -- 58.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Perfluorobutane (PFC-3-1-10)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    8860.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.7::DECIMAL(10,2) as approximate_cost, -- 58.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Perfluoropentane (PFC-4-1-12)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    9160.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Perfluorohexane (PFC-5-1-14)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    9300.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'PFC-9-1-18' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    7500.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'PFPMIE' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    10300.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R1234yf' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    1.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R1234ze' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    1.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R1270 (propene)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    2.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R170 (ethane)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    6.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R290 (propane)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    3.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.7::DECIMAL(10,2) as approximate_cost, -- 58.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-401A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    1182.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-401B' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    1288.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-401C' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    933.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-402A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    2788.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-402B' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    2416.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-403A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    3124.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-403B' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    4457.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-404A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    3922.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R405A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    4716.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R406A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    1943.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-407A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    2107.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-407B' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    2804.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-407C' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    1774.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-407D' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    1627.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-407E' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    1552.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-407F' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    1825.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-408A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    3152.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R409A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    1585.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R409B' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    1560.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-410A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    2088.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-410B' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    2229.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-411A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    1597.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-411B' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    1705.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-412A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    2286.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-413A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    2053.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R414A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    1478.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R414B' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    1362.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-415A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    1507.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-415B' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    546.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-416A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    1084.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-417A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    2346.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-417B' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    3027.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-417C' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    1809.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-418A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    1741.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-419A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    2967.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-419B' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    2384.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-420A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    1536.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-421A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    2631.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-421B' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    3190.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-422A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    3143.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-422B' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    2526.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-422C' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    3085.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-422D' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    2729.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-422E' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    2592.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-423A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    2280.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-424A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    2440.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-425A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    1505.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-426A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    1508.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-427A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    2138.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-428A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    3607.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-429A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    14.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-430A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    95.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-431A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    38.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R432A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    2.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R433A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    3.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R433B' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    3.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R433C' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    3.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-434A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    3245.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-435A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    26.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R436A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    3.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R436B' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    3.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-437A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    1805.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-438A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    2265.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-439A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    1983.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R440A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    144.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R441A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    3.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R442A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    1888.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R443A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    2.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-444A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    88.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-445A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    130.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-500' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    8077.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R501' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    4083.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R502' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    4657.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-503' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    14560.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-504' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    4143.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R505' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    8502.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R506' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    4490.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-507A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    3985.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-508A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    13214.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-508B' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    13396.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-509A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    5741.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R510A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    1.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R511A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    9.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-512A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    189.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R600 (butane)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    4.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.7::DECIMAL(10,2) as approximate_cost, -- 58.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R600A (isobutane)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    3.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.7::DECIMAL(10,2) as approximate_cost, -- 58.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R601 (pentane)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    5.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R601A (isopentane)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    5.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Sulphur hexafluoride (SF6)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    22800.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Trifluoromethyl sulphur pentafluoride' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar4' AND year = 2022) as library_id,
    17700.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R 125' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'IPCC' AND version = 'ar6' AND year = 2023) as library_id,
    3740.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R 407A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'IPCC' AND version = 'ar6' AND year = 2023) as library_id,
    2262.2::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R 410A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'IPCC' AND version = 'ar6' AND year = 2023) as library_id,
    2255.5::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-125' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    3170.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Carbon dioxide' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    1.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-134' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    1120.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-134a' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    1300.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-143' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    328.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-143a' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    4800.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-152' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    16.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-152a' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    138.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-161' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    4.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-227ea' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    3350.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-23' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    12400.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-236cb' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    1210.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-236ea' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    1330.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-236fa' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    8060.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-245ca' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    716.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-245fa' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    858.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-32' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    677.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-365mfc' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    804.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-41' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    116.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-43-I0mee' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    1650.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Methane' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    28.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Nitrogen trifluoride' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    16100.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Nitrous oxide' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    265.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Perfluoroethane (PFC-116)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    11100.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Perfluorocyclopropane' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    9200.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.7::DECIMAL(10,2) as approximate_cost, -- 58.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Perfluoromethane (PFC-14)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    6630.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Perfluoropropane (PFC-218)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    8900.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.7::DECIMAL(10,2) as approximate_cost, -- 58.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Perfluorocyclobutane (PFC-318)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    9540.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.7::DECIMAL(10,2) as approximate_cost, -- 58.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Perfluorobutane (PFC-3-1-10)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    9200.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.7::DECIMAL(10,2) as approximate_cost, -- 58.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Perfluoropentane (PFC-4-1-12)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    8550.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Perfluorohexane (PFC-5-1-14)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    7910.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'PFC-9-1-18' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    7190.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-401A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    18.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-401B' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    15.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-401C' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    21.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-402A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    1902.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-402B' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    1205.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-403A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    1780.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-403B' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    3471.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-404A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    3943.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R405A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    3920.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-407A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    1923.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-407B' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2547.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-407C' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    1624.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-407D' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    1487.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-407E' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    1425.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-407F' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    1674.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-408A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2430.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-410A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    1924.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-410B' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2048.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-411A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    15.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-411B' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    4.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-412A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    445.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-413A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    1945.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-415A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    25.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-415B' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    104.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-416A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    767.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-417A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2127.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-417B' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2742.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-417C' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    1643.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-418A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    3.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-419A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2688.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-419B' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2161.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-420A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    1144.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-421A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2385.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-421B' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2890.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-422A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2847.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-422B' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2290.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-434A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    3075.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-422C' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2794.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-422D' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2473.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-422E' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2350.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-423A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2274.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-424A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2212.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-425A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    1431.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-437A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    1639.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-426A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    1371.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-427A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2024.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-428A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    3417.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-429A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    13.8::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-430A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    105.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-431A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    40.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-435A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    27.6::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-438A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2059.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-439A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    1828.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R440A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    156.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R442A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    1754.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-444A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    88.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-445A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    117.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-500' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    36.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-503' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    4972.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-504' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    326.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-507A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    3985.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-508A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    11607.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-508B' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    11698.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-509A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    4984.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R511A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    6.9::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-512A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    196.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Sulphur hexafluoride (SF6)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    23500.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HCFC-22/R22 (chlorodifluoromethane)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    1760.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Electricity supplied from grid' AND scope = 'scope2') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'CEA' AND version = 'ar5' AND year = 2023) as library_id,
    0.716::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kWh' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.08::DECIMAL(10,2) as approximate_cost, -- 6.5 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Butane' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    1.74532963221477::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.7::DECIMAL(10,2) as approximate_cost, -- 58.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Coal (electricity generation - home produced coal only)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    2.19589669798658::DECIMAL(15,6) as emission_factor,
    'kgCO2e/t' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.1::DECIMAL(10,2) as approximate_cost, -- 8.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Petroleum coke' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    3.38657167516779::DECIMAL(15,6) as emission_factor,
    'kgCO2e/t' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    1.14::DECIMAL(10,2) as approximate_cost, -- 95.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Coking coal' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    3.16465001879195::DECIMAL(15,6) as emission_factor,
    'kgCO2e/t' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.1::DECIMAL(10,2) as approximate_cost, -- 8.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Coal (domestic)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    2.90495233557047::DECIMAL(15,6) as emission_factor,
    'kgCO2e/t' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.1::DECIMAL(10,2) as approximate_cost, -- 8.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Coal (electricity generation)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    2.19933448322148::DECIMAL(15,6) as emission_factor,
    'kgCO2e/t' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.1::DECIMAL(10,2) as approximate_cost, -- 8.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Coal (industrial)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    2.39647994362416::DECIMAL(15,6) as emission_factor,
    'kgCO2e/t' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.1::DECIMAL(10,2) as approximate_cost, -- 8.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Marine fuel oil' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    3.10202288590604::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.84::DECIMAL(10,2) as approximate_cost, -- 70.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Marine gas oil' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    2.77138877315436::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.9::DECIMAL(10,2) as approximate_cost, -- 75.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Waste oils' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    2.74923668456376::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.06::DECIMAL(10,2) as approximate_cost, -- 5.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Refinery miscellaneous' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    2.94432092751678::DECIMAL(15,6) as emission_factor,
    'kgCO2e/t' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.1::DECIMAL(10,2) as approximate_cost, -- 8.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Processed fuel oils - distillate oil' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    2.75540897852349::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    1.05::DECIMAL(10,2) as approximate_cost, -- 87.5 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Processed fuel oils - residual oil' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    3.17492498255034::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    38.8277566744::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.78::DECIMAL(10,2) as approximate_cost, -- 65.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Petrol (100% mineral petrol)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    2.34502534630872::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    33.0186761168::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.14::DECIMAL(10,2) as approximate_cost, -- 95.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Petrol (average biofuel blend)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    2.09747312751678::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    33.0186761168::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.14::DECIMAL(10,2) as approximate_cost, -- 95.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Petrol (average biofuel blend)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    2.09747312751678::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    33.0186761168::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.14::DECIMAL(10,2) as approximate_cost, -- 95.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Naphtha' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    2.11893915436242::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    32.4120238715::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.6::DECIMAL(10,2) as approximate_cost, -- 50.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Lubricants' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    2.74933914899329::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    36.1070361156::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.6::DECIMAL(10,2) as approximate_cost, -- 50.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Gas oil' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    2.75540897852349::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    39.271062532::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.9::DECIMAL(10,2) as approximate_cost, -- 75.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Fuel oil' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    3.17492498255034::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.84::DECIMAL(10,2) as approximate_cost, -- 70.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Diesel (100% mineral diesel)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    2.65937173691275::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    39.271062532::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.05::DECIMAL(10,2) as approximate_cost, -- 87.5 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Diesel (average biofuel blend)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    2.51206388456376::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    39.271062532::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.05::DECIMAL(10,2) as approximate_cost, -- 87.5 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Diesel (average biofuel blend)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    2.51206388456376::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    39.271062532::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.05::DECIMAL(10,2) as approximate_cost, -- 87.5 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Burning oil' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    2.54015585637584::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.9::DECIMAL(10,2) as approximate_cost, -- 75.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Aviation turbine fuel' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    2.5426884::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    31.207525283::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.9::DECIMAL(10,2) as approximate_cost, -- 75.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Aviation spirit' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    2.33116264295302::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.6::DECIMAL(10,2) as approximate_cost, -- 50.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Propane' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    1.54357759865772::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.7::DECIMAL(10,2) as approximate_cost, -- 58.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Other petroleum gas' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    0.94441512348993::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    1.14::DECIMAL(10,2) as approximate_cost, -- 95.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Natural gas (100% mineral blend)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    0.0020538303100671::DECIMAL(15,6) as emission_factor,
    'kgCO2e/m3' as emission_factor_unit,
    0.0336::DECIMAL(10,2) as heat_content,
    'GJ/m3' as heat_content_unit,
    0.42::DECIMAL(10,2) as approximate_cost, -- 35.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Natural gas' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    0.0020383903100671::DECIMAL(15,6) as emission_factor,
    'kgCO2e/m3' as emission_factor_unit,
    0.0336::DECIMAL(10,2) as heat_content,
    'GJ/m3' as heat_content_unit,
    0.42::DECIMAL(10,2) as approximate_cost, -- 35.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'LPG' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    1.55712778389262::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    23.3447854900593::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.72::DECIMAL(10,2) as approximate_cost, -- 60.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'LPG' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    1.55712778389262::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    23.3447854900593::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.72::DECIMAL(10,2) as approximate_cost, -- 60.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'LNG' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    1.16832964966443::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.6::DECIMAL(10,2) as approximate_cost, -- 50.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'CNG' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2023) as library_id,
    0.44844653020134::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.93::DECIMAL(10,2) as approximate_cost, -- 77.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'CNG' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    0.44942::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.93::DECIMAL(10,2) as approximate_cost, -- 77.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Coal (domestic)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2.90495234::DECIMAL(15,6) as emission_factor,
    'kgCO2e/t' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.1::DECIMAL(10,2) as approximate_cost, -- 8.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Aviation spirit' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2.33116::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.6::DECIMAL(10,2) as approximate_cost, -- 50.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Aviation turbine fuel' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2.54269::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.9::DECIMAL(10,2) as approximate_cost, -- 75.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Burning oil' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2.54015::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.9::DECIMAL(10,2) as approximate_cost, -- 75.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Butane' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    1.74532::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.7::DECIMAL(10,2) as approximate_cost, -- 58.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Coal (electricity generation - home produced coal only)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2.2585867::DECIMAL(15,6) as emission_factor,
    'kgCO2e/t' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.1::DECIMAL(10,2) as approximate_cost, -- 8.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Coal (electricity generation)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2.26211448::DECIMAL(15,6) as emission_factor,
    'kgCO2e/t' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.1::DECIMAL(10,2) as approximate_cost, -- 8.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Coal (industrial)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2.39943994::DECIMAL(15,6) as emission_factor,
    'kgCO2e/t' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.1::DECIMAL(10,2) as approximate_cost, -- 8.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Coking coal' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    3.16465002::DECIMAL(15,6) as emission_factor,
    'kgCO2e/t' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.1::DECIMAL(10,2) as approximate_cost, -- 8.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Fuel oil' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    3.17493::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.84::DECIMAL(10,2) as approximate_cost, -- 70.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Gas oil' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2.75541::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.9::DECIMAL(10,2) as approximate_cost, -- 75.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'LNG' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    1.17216::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.6::DECIMAL(10,2) as approximate_cost, -- 50.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Lubricants' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2.74934::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.6::DECIMAL(10,2) as approximate_cost, -- 50.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Marine fuel oil' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    3.10202::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.84::DECIMAL(10,2) as approximate_cost, -- 70.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Marine gas oil' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2.77139::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.9::DECIMAL(10,2) as approximate_cost, -- 75.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Naphtha' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2.11894::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.6::DECIMAL(10,2) as approximate_cost, -- 50.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Other petroleum gas' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    0.94441::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    1.14::DECIMAL(10,2) as approximate_cost, -- 95.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Petrol (100% mineral petrol)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2.35372::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    1.14::DECIMAL(10,2) as approximate_cost, -- 95.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Petroleum coke' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    3.38657168::DECIMAL(15,6) as emission_factor,
    'kgCO2e/t' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    1.14::DECIMAL(10,2) as approximate_cost, -- 95.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Processed fuel oils - distillate oil' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2.75541::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    1.05::DECIMAL(10,2) as approximate_cost, -- 87.5 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Processed fuel oils - residual oil' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    3.17493::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.78::DECIMAL(10,2) as approximate_cost, -- 65.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Propane' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    1.54357::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.7::DECIMAL(10,2) as approximate_cost, -- 58.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Refinery miscellaneous' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2.94432093::DECIMAL(15,6) as emission_factor,
    'kgCO2e/t' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.1::DECIMAL(10,2) as approximate_cost, -- 8.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Waste oils' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2.74923::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.06::DECIMAL(10,2) as approximate_cost, -- 5.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Diesel (100% mineral diesel)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2.66155::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    39.271062532::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.05::DECIMAL(10,2) as approximate_cost, -- 87.5 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Diesel (average biofuel blend)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2.51279::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    39.271062532::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.05::DECIMAL(10,2) as approximate_cost, -- 87.5 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Petrol (average biofuel blend)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2.0844::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    33.0186761168::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.14::DECIMAL(10,2) as approximate_cost, -- 95.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Petrol (average biofuel blend)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2.0844::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    33.0186761168::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.14::DECIMAL(10,2) as approximate_cost, -- 95.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'LPG' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    1.55713::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    23.344785490059::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.72::DECIMAL(10,2) as approximate_cost, -- 60.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'LPG' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    1.55713::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    23.344785490059::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    0.72::DECIMAL(10,2) as approximate_cost, -- 60.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Natural gas' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    0.00204542::DECIMAL(15,6) as emission_factor,
    'kgCO2e/m3' as emission_factor_unit,
    33.6::DECIMAL(10,2) as heat_content,
    'GJ/m3' as heat_content_unit,
    0.42::DECIMAL(10,2) as approximate_cost, -- 35.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Natural gas (100% mineral blend)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    0.00206318::DECIMAL(15,6) as emission_factor,
    'kgCO2e/m3' as emission_factor_unit,
    33.6::DECIMAL(10,2) as heat_content,
    'GJ/m3' as heat_content_unit,
    0.42::DECIMAL(10,2) as approximate_cost, -- 35.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-410A' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    2256.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R-600' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    0.006::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Diesel (average biofuel blend)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    2.51279::DECIMAL(15,6) as emission_factor,
    'kgCO2e/L' as emission_factor_unit,
    39.271062532::DECIMAL(10,2) as heat_content,
    'GJ/L' as heat_content_unit,
    1.05::DECIMAL(10,2) as approximate_cost, -- 87.5 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'R290 = propane' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'DEFRA/BEIS' AND version = 'ar5' AND year = 2024) as library_id,
    0.06::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.7::DECIMAL(10,2) as approximate_cost, -- 58.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Electricity supplied from grid' AND scope = 'scope2') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'CEA' AND version = 'ar5' AND year = 2024) as library_id,
    0.727::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kWh' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.08::DECIMAL(10,2) as approximate_cost, -- 6.5 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-245fa' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    962.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'PFC-14' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    7380.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-236fa' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    8690.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-245ca' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    787.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-32' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    771.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-365mfc' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    914.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-41' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    135.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-43-10mee' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    1600.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-125' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    14300.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-134' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    6630.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-143a' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    616.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-245cb2' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    747.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-245fa2' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    878.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-347mcc3' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    576.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-347pcf2' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    980.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-356pcc3' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    277.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-356pcf3' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    484.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFE-374pc2' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    12.5::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Methane' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    27.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Methyl bromide' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    2.43::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Methyl chloride' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    5.54::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    1.45::DECIMAL(10,2) as approximate_cost, -- 120.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Methyl chloroform' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    161.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Methylene chloride' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    11.2::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    1.45::DECIMAL(10,2) as approximate_cost, -- 120.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Nitrogen trifluoride' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    17400.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Nitrous oxide' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    273.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'PFC-116' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    12400.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'PFC-218' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    9290.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'PFC-31-10' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    10000.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'PFC-41-12' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    9220.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'PFC-51-14' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    8620.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'PFC-91-18' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    7480.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'PFPMIE' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    10300.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Sulphur hexafluoride (SF6)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    24300.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Carbon dioxide' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    1.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Carbon tetrachloride' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    2200.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    1.45::DECIMAL(10,2) as approximate_cost, -- 120.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'CFC-113' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    6520.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'CFC-114' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    9430.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'CFC-115' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    9600.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'CFC-11/R11 (trichlorofluoromethane)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    6230.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'CFC-12/R12 (dichlorodifluoromethane)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    12500.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'CFC-13' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    16200.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Halon-1211' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    1930.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Halon-1301' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    7200.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'Halon-2402' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    2170.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HCFC-123' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    90.4::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HCFC-124' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    597.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HCFC-141b' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    860.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HCFC-142b' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    2300.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HCFC-21' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    160.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HCFC-225ca' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    137.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HCFC-225cb' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    568.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HCFC-22/R22 (chlorodifluoromethane)' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    1960.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HCFE-235da2' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    539.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    0.3::DECIMAL(10,2) as approximate_cost, -- 25.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-125' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    3740.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-134' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    1260.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-134a' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    1530.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-143' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    364.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-143a' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    5810.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-152' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    21.5::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-152a' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    164.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-161' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    4.84::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-227ea' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    3600.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-23' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    14600.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-236cb' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    1350.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
  UNION ALL SELECT 
    (SELECT id FROM emission_resources WHERE resource_name = 'HFC-236ea' AND scope = 'scope1') as resource_id,
    (SELECT id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar6' AND year = 2024) as library_id,
    1500.0::DECIMAL(15,6) as emission_factor,
    'kgCO2e/kg' as emission_factor_unit,
    NULL as heat_content,
    NULL as heat_content_unit,
    3.01::DECIMAL(10,2) as approximate_cost, -- 250.0 INR / 83
    'USD' as cost_unit,
    8 as availability_score
)
INSERT INTO emission_factors (resource_id, library_id, emission_factor, emission_factor_unit, heat_content, heat_content_unit, approximate_cost, cost_unit, availability_score)
SELECT resource_id, library_id, emission_factor, emission_factor_unit, heat_content, heat_content_unit, approximate_cost, cost_unit, availability_score
FROM all_emission_factors
WHERE resource_id IS NOT NULL AND library_id IS NOT NULL
ON CONFLICT (resource_id, library_id) DO NOTHING;

-- Report results
DO $$ 
DECLARE
    inserted_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO inserted_count FROM emission_factors;
    RAISE NOTICE 'Total emission factors after insertion: %', inserted_count;
END $$;
