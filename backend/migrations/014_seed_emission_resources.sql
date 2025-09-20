-- Migration: Seed emission resources data
-- Created: 2024-01-20
-- Description: Insert standard emission resources for cement industry

INSERT INTO emission_resources (resource_name, resource_type, category, scope, is_alternative_fuel, is_calculator, description) VALUES
-- Scope 1 - Stationary Combustion
('Natural Gas', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Natural gas for kiln and heating operations'),
('Coal', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Coal for kiln operations'),
('Petcoke', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Petroleum coke for kiln operations'),
('Heavy Fuel Oil', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Heavy fuel oil for kiln operations'),
('Diesel', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Diesel for backup generators and heating'),
('LPG', 'fuel', 'stationary_combustion', 'scope1', false, false, 'Liquefied petroleum gas for heating'),

-- Scope 1 - Mobile Combustion
('Gasoline', 'fuel', 'mobile_combustion', 'scope1', false, false, 'Gasoline for vehicles and mobile equipment'),
('Diesel (Mobile)', 'fuel', 'mobile_combustion', 'scope1', false, false, 'Diesel for trucks, loaders, and mobile equipment'),

-- Scope 1 - Industrial Process
('Cement Production Calculator', 'process', 'industrial_process', 'scope1', false, true, 'Cement production process emissions calculator'),

-- Scope 1 - Fugitive Emissions
('Refrigerants (R-134a)', 'refrigerant', 'fugitive_emissions', 'scope1', false, false, 'R-134a refrigerant leakage'),
('Refrigerants (R-410A)', 'refrigerant', 'fugitive_emissions', 'scope1', false, false, 'R-410A refrigerant leakage'),

-- Scope 1 - Alternative Fuels
('Biomass', 'fuel', 'stationary_combustion', 'scope1', true, false, 'Biomass for alternative fuel co-processing'),
('Waste-derived Fuel', 'fuel', 'stationary_combustion', 'scope1', true, false, 'Municipal and industrial waste-derived fuel'),
('Used Tires', 'fuel', 'stationary_combustion', 'scope1', true, false, 'Shredded used tires for fuel'),
('Agricultural Waste', 'fuel', 'stationary_combustion', 'scope1', true, false, 'Agricultural residues and waste'),

-- Scope 2 - Purchased Electricity
('Grid Electricity', 'electricity', 'purchased_electricity', 'scope2', false, false, 'Electricity from national/regional grid'),
('Solar Electricity', 'electricity', 'renewable_energy', 'scope2', true, false, 'On-site solar electricity generation'),
('Wind Electricity', 'electricity', 'renewable_energy', 'scope2', true, false, 'On-site wind electricity generation'),

-- Scope 2 - Purchased Heat and Steam
('Purchased Steam', 'steam', 'purchased_heat_steam', 'scope2', false, false, 'Steam purchased from external sources'),
('District Heating', 'heat', 'purchased_heat_steam', 'scope2', false, false, 'Heat from district heating systems'),

-- Scope 2 - Purchased Cooling
('District Cooling', 'cooling', 'purchased_cooling', 'scope2', false, false, 'Cooling from district cooling systems')

ON CONFLICT (resource_name, scope) DO NOTHING;
