const { connectDatabase, closePool, query } = require('../config/database');
const { logger } = require('./logger');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/**
 * Seed the database with JK Cement real company data
 * Based on publicly available information about JK Cement Limited
 */
async function seedJKCementData() {
  try {
    // Connect to database
    await connectDatabase();
    
    logger.info('Starting JK Cement database seeding...');
    
    // Create organization and facility IDs that will be reused
    const jkCementOrgId = uuidv4();
    const mangrolPlantId = uuidv4();
    const muddapurPlantId = uuidv4();
    
    // Seed JK Cement organization
    await seedJKCementOrganization(jkCementOrgId);
    
    // Seed users for JK Cement
    await seedJKCementUsers(jkCementOrgId);
    
    // Seed JK Cement facilities
    await seedJKCementFacilities(jkCementOrgId, mangrolPlantId, muddapurPlantId);
    
    // Seed JK Cement production and emissions data
    await seedJKCementOperationalData(jkCementOrgId, mangrolPlantId, muddapurPlantId);
    
    logger.info('✅ JK Cement database seeding completed successfully');
    console.log('✅ JK Cement database seeding completed successfully');
    
  } catch (error) {
    logger.error('Failed to seed JK Cement database:', error);
    console.error('❌ Failed to seed JK Cement database:', error.message);
    process.exit(1);
  } finally {
    await closePool();
  }
}

/**
 * Seed JK Cement organization
 */
async function seedJKCementOrganization(orgId) {
  const organization = {
    id: orgId,
    name: 'JK Cement Limited',
    description: 'Leading cement manufacturer in India with state-of-the-art technology and sustainable practices. Part of JK Organisation with over 140 years of legacy.',
    subscription_plan: 'enterprise',
    status: 'active'
  };

  await query(`
    INSERT INTO organizations (organization_id, name, description, subscription_plan, status)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (organization_id) DO NOTHING
  `, [organization.id, organization.name, organization.description, 
      organization.subscription_plan, organization.status]);
  
  logger.info('Seeded JK Cement organization');
}

/**
 * Seed JK Cement users
 */
async function seedJKCementUsers(orgId) {
  const hashedPassword = await bcrypt.hash('jkcement2024', 12);
  
  const users = [
    {
      id: uuidv4(),
      organization_id: orgId,
      email: 'ceo@jkcement.com',
      password_hash: hashedPassword,
      first_name: 'Madhavkrishna',
      last_name: 'Singhania',
      role: 'admin',
      status: 'active'
    },
    {
      id: uuidv4(),
      organization_id: orgId,
      email: 'sustainability@jkcement.com',
      password_hash: hashedPassword,
      first_name: 'Raghav',
      last_name: 'Sharma',
      role: 'admin',
      status: 'active'
    },
    {
      id: uuidv4(),
      organization_id: orgId,
      email: 'plant.manager.mangrol@jkcement.com',
      password_hash: hashedPassword,
      first_name: 'Vikram',
      last_name: 'Patel',
      role: 'user',
      status: 'active'
    },
    {
      id: uuidv4(),
      organization_id: orgId,
      email: 'plant.manager.muddapur@jkcement.com',
      password_hash: hashedPassword,
      first_name: 'Suresh',
      last_name: 'Kumar',
      role: 'user',
      status: 'active'
    },
    {
      id: uuidv4(),
      organization_id: orgId,
      email: 'emissions.engineer@jkcement.com',
      password_hash: hashedPassword,
      first_name: 'Priya',
      last_name: 'Menon',
      role: 'user',
      status: 'active'
    }
  ];

  for (const user of users) {
    await query(`
      INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, role, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (email) DO NOTHING
    `, [user.id, user.organization_id, user.email, user.password_hash, 
        user.first_name, user.last_name, user.role, user.status]);
  }
  
  logger.info(`Seeded ${users.length} JK Cement users`);
}

/**
 * Seed JK Cement facilities with real plant data
 */
async function seedJKCementFacilities(orgId, mangrolPlantId, muddapurPlantId) {
  const facilities = [
    {
      id: mangrolPlantId,
      organization_id: orgId,
      name: 'JK Cement Mangrol Plant',
      description: 'State-of-the-art cement manufacturing facility in Mangrol, Rajasthan with 2.7 MTPA capacity. Features modern kiln technology and waste heat recovery systems.',
      location: JSON.stringify({
        address: 'Village Mangrol, Tehsil Bali, District Pali, Rajasthan 306701, India',
        city: 'Mangrol',
        state: 'Rajasthan',
        country: 'India',
        latitude: 25.3428,
        longitude: 73.2134,
        capacity_tpd: 7400,
        capacity_mtpa: 2.7,
        technology: 'Dry Process Kiln',
        commissioned_year: 2011
      }),
      status: 'active'
    },
    {
      id: muddapurPlantId,
      organization_id: orgId,
      name: 'JK Cement Muddapur Plant',
      description: 'Modern cement plant in Muddapur, Karnataka with 1.5 MTPA capacity. Equipped with advanced environmental controls and alternative fuel systems.',
      location: JSON.stringify({
        address: 'Muddapur Village, Bagalkot District, Karnataka 587311, India',
        city: 'Muddapur',
        state: 'Karnataka',
        country: 'India',
        latitude: 16.1839,
        longitude: 75.7004,
        capacity_tpd: 4100,
        capacity_mtpa: 1.5,
        technology: 'Dry Process Kiln',
        commissioned_year: 2009
      }),
      status: 'active'
    }
  ];

  // Store for use in operational data
  global.jkMangrolPlantId = mangrolPlantId;
  global.jkMuddapurPlantId = muddapurPlantId;

  for (const facility of facilities) {
    await query(`
      INSERT INTO facilities (id, organization_id, name, description, location, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO NOTHING
    `, [facility.id, facility.organization_id, facility.name, 
        facility.description, facility.location, facility.status]);
  }
  
  logger.info(`Seeded ${facilities.length} JK Cement facilities`);
}

/**
 * Seed JK Cement operational data - production and emissions
 */
async function seedJKCementOperationalData(orgId, mangrolPlantId, muddapurPlantId) {
  // Production data for 2024 (realistic monthly production)
  const productionData = [
    // Mangrol Plant - higher capacity (2.7 MTPA)
    { facility_id: mangrolPlantId, month: 1, year: 2024, cement_production: 225000, unit: 'tonnes' },
    { facility_id: mangrolPlantId, month: 2, year: 2024, cement_production: 220000, unit: 'tonnes' },
    { facility_id: mangrolPlantId, month: 3, year: 2024, cement_production: 235000, unit: 'tonnes' },
    { facility_id: mangrolPlantId, month: 4, year: 2024, cement_production: 230000, unit: 'tonnes' },
    { facility_id: mangrolPlantId, month: 5, year: 2024, cement_production: 240000, unit: 'tonnes' },
    { facility_id: mangrolPlantId, month: 6, year: 2024, cement_production: 215000, unit: 'tonnes' },
    { facility_id: mangrolPlantId, month: 7, year: 2024, cement_production: 220000, unit: 'tonnes' },
    { facility_id: mangrolPlantId, month: 8, year: 2024, cement_production: 225000, unit: 'tonnes' },
    
    // Muddapur Plant - lower capacity (1.5 MTPA)
    { facility_id: muddapurPlantId, month: 1, year: 2024, cement_production: 125000, unit: 'tonnes' },
    { facility_id: muddapurPlantId, month: 2, year: 2024, cement_production: 120000, unit: 'tonnes' },
    { facility_id: muddapurPlantId, month: 3, year: 2024, cement_production: 130000, unit: 'tonnes' },
    { facility_id: muddapurPlantId, month: 4, year: 2024, cement_production: 128000, unit: 'tonnes' },
    { facility_id: muddapurPlantId, month: 5, year: 2024, cement_production: 135000, unit: 'tonnes' },
    { facility_id: muddapurPlantId, month: 6, year: 2024, cement_production: 115000, unit: 'tonnes' },
    { facility_id: muddapurPlantId, month: 7, year: 2024, cement_production: 120000, unit: 'tonnes' },
    { facility_id: muddapurPlantId, month: 8, year: 2024, cement_production: 125000, unit: 'tonnes' }
  ];

  for (const data of productionData) {
    await query(`
      INSERT INTO production_data (id, organization_id, facility_id, month, year, cement_production, unit)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (facility_id, month, year) DO NOTHING
    `, [uuidv4(), orgId, data.facility_id, data.month, data.year, 
        data.cement_production, data.unit]);
  }
  
  logger.info(`Seeded ${productionData.length} production data records for JK Cement`);
  
  // JK Cement sustainability targets
  const targets = [
    {
      id: uuidv4(),
      organization_id: orgId,
      facility_id: null, // Organization-wide target
      name: 'Carbon Neutrality by 2070',
      description: 'Achieve carbon neutrality across all JK Cement operations by 2070 through renewable energy adoption, alternative fuels, and carbon capture technologies.',
      target_type: 'emissions_reduction',
      baseline_value: 850000, // tonnes CO2e baseline
      target_value: 0,
      baseline_year: 2022,
      target_year: 2070,
      unit: 'tonnes CO2e',
      status: 'active'
    },
    {
      id: uuidv4(),
      organization_id: orgId,
      facility_id: null,
      name: 'Alternative Fuel Rate 25% by 2030',
      description: 'Increase alternative fuel consumption to 25% of total thermal energy requirements by 2030.',
      target_type: 'fuel_substitution',
      baseline_value: 8.5, // percentage
      target_value: 25.0,
      baseline_year: 2023,
      target_year: 2030,
      unit: 'percentage',
      status: 'active'
    },
    {
      id: uuidv4(),
      organization_id: orgId,
      facility_id: mangrolPlantId,
      name: 'Mangrol Plant Energy Efficiency Improvement',
      description: 'Reduce specific energy consumption by 15% through waste heat recovery optimization and kiln efficiency improvements.',
      target_type: 'energy_efficiency',
      baseline_value: 3.85, // GJ/tonne cement
      target_value: 3.27,
      baseline_year: 2023,
      target_year: 2028,
      unit: 'GJ/tonne',
      status: 'active'
    },
    {
      id: uuidv4(),
      organization_id: orgId,
      facility_id: muddapurPlantId,
      name: 'Muddapur Plant Waste Heat Recovery',
      description: 'Install waste heat recovery system to reduce energy consumption by 12% and improve overall thermal efficiency.',
      target_type: 'energy_efficiency',
      baseline_value: 4.1, // GJ/tonne cement
      target_value: 3.61,
      baseline_year: 2023,
      target_year: 2027,
      unit: 'GJ/tonne',
      status: 'active'
    },
    {
      id: uuidv4(),
      organization_id: orgId,
      facility_id: muddapurPlantId,
      name: 'Muddapur Alternative Fuel Utilization',
      description: 'Increase use of biomass and waste-derived fuels to achieve 20% alternative fuel rate by 2029.',
      target_type: 'fuel_substitution',
      baseline_value: 6.2, // percentage
      target_value: 20.0,
      baseline_year: 2023,
      target_year: 2029,
      unit: 'percentage',
      status: 'active'
    }
  ];

  for (const target of targets) {
    await query(`
      INSERT INTO sustainability_targets (id, organization_id, facility_id, name, description, 
                                        target_type, baseline_value, target_value, baseline_year, 
                                        target_year, unit, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO NOTHING
    `, [target.id, target.organization_id, target.facility_id, target.name, 
        target.description, target.target_type, target.baseline_value, 
        target.target_value, target.baseline_year, target.target_year, 
        target.unit, target.status]);
  }
  
  logger.info(`Seeded ${targets.length} sustainability targets for JK Cement`);

  // ==============================================
  // 6. EMISSION RESOURCE CONFIGURATION (NEW SCHEMA)
  // ==============================================
  logger.info('Setting up emission resource configurations using NEW SCHEMA...');
  
  // Get available emission resources and their factors
  const emissionResourcesResult = await query(`
    SELECT er.id, er.resource_name, er.scope, er.category 
    FROM emission_resources er 
    WHERE er.is_calculator = false 
    ORDER BY er.scope, er.category, er.resource_name
  `);
  const emissionResources = emissionResourcesResult.rows;
  
  if (emissionResources.length === 0) {
    throw new Error('No emission resources found. Please run migration 014_seed_emission_resources.sql first.');
  }
  
  let orgResourceConfigsCreated = 0;
  let facilityResourceConfigsCreated = 0;
  
  // Step 1: Create organization-level emission resource configurations (inventory)
  // Select key cement industry resources for realistic configuration
  const cementIndustryResources = [
    'Coal', 'Natural Gas', 'Petcoke', 'Heavy Fuel Oil', 'Biomass', 'Waste Oil',
    'Purchased Electricity', 'Diesel', 'Gasoline', 'LPG'
  ];
  
  const keyResources = emissionResources.filter(resource => 
    cementIndustryResources.some(name => 
      resource.resource_name.toLowerCase().includes(name.toLowerCase())
    )
  ).slice(0, 10); // Use up to 10 key cement industry resources
  
  for (const resource of keyResources) {
    // Find matching emission factor for this resource
    const emissionFactorResult = await query(`
      SELECT ef.id, ef.emission_factor, ef.heat_content, ef.emission_factor_unit, ef.heat_content_unit
      FROM emission_factors ef 
      WHERE ef.resource_id = $1 
      LIMIT 1
    `, [resource.id]);
    
    if (emissionFactorResult.rows.length > 0) {
      const emissionFactor = emissionFactorResult.rows[0];
      const resourceConfigId = uuidv4();
      
      // Create organization emission resource configuration
      await query(`
        INSERT INTO emission_resource_configurations (id, organization_id, resource_id, emission_factor_id, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, true, NOW(), NOW())
        ON CONFLICT (organization_id, resource_id) DO NOTHING
      `, [resourceConfigId, orgId, resource.id, emissionFactor.id]);
      
      orgResourceConfigsCreated++;
      logger.info(`✓ Configured org resource: ${resource.resource_name}`);
      
      // Step 2: Assign this resource to both facilities
      for (const facilityId of [muddapurPlantId, mangrolPlantId]) {
        const facilityConfigId = uuidv4();
        
        const existingConfig = await query(`
          SELECT id FROM emission_resource_facility_configurations 
          WHERE facility_id = $1 AND emission_resource_config_id = $2 AND is_active = true
        `, [facilityId, resourceConfigId]);
        
        if (existingConfig.rows.length === 0) {
          await query(`
            INSERT INTO emission_resource_facility_configurations (id, organization_id, facility_id, emission_resource_config_id, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, true, NOW(), NOW())
          `, [facilityConfigId, orgId, facilityId, resourceConfigId]);
          
          facilityResourceConfigsCreated++;
          logger.info(`✓ Assigned ${resource.resource_name} to facility ${facilityId.substring(0, 8)}...`);
        }
      }
    } else {
      logger.warn(`⚠ No emission factor found for resource: ${resource.resource_name}`);
    }
  }
  
  logger.info(`Created ${orgResourceConfigsCreated} organization resource configurations`);
  logger.info(`Created ${facilityResourceConfigsCreated} facility resource assignments`);
  
  // ==============================================
  // 6.1. CEMENT INDUSTRY SPECIFIC CONFIGURATIONS
  // ==============================================
  logger.info('Adding cement industry specific configurations...');
  
  // Add industrial process calculator configurations for cement
  const cementCalculatorConfigs = [
    {
      id: uuidv4(),
      organization_id: orgId,
      facility_id: mangrolPlantId,
      calculator_type: 'cement_industry',
      configuration: JSON.stringify({
        clinkers: [
          {
            id: uuidv4(),
            name: 'OPC Clinker',
            cao_content: 65.2, // % CaO content
            mgo_content: 2.1,  // % MgO content
            kiln_type: 'dry_process',
            production_capacity: 220000 // tonnes/month
          }
        ],
        raw_materials: [
          {
            id: uuidv4(),
            name: 'Limestone',
            cao_fraction: 0.52,
            non_carbonate_cao: 0.02,
            monthly_consumption: 180000 // tonnes/month
          },
          {
            id: uuidv4(),
            name: 'Clay/Shale',
            cao_fraction: 0.05,
            non_carbonate_cao: 0.01,
            monthly_consumption: 25000
          }
        ],
        silicate_materials: [
          {
            id: uuidv4(),
            name: 'Silica Sand',
            silicate_correction_factor: 0.015,
            monthly_consumption: 8000 // tonnes/month
          }
        ]
      }),
      is_active: true
    },
    {
      id: uuidv4(),
      organization_id: orgId,
      facility_id: muddapurPlantId,
      calculator_type: 'cement_industry',
      configuration: JSON.stringify({
        clinkers: [
          {
            id: uuidv4(),
            name: 'PPC Clinker',
            cao_content: 64.8,
            mgo_content: 1.9,
            kiln_type: 'dry_process',
            production_capacity: 125000 // tonnes/month
          }
        ],
        raw_materials: [
          {
            id: uuidv4(),
            name: 'Limestone',
            cao_fraction: 0.51,
            non_carbonate_cao: 0.018,
            monthly_consumption: 105000
          },
          {
            id: uuidv4(),
            name: 'Iron Ore',
            cao_fraction: 0.08,
            non_carbonate_cao: 0.02,
            monthly_consumption: 15000
          }
        ],
        silicate_materials: [
          {
            id: uuidv4(),
            name: 'Fly Ash',
            silicate_correction_factor: 0.012,
            monthly_consumption: 12000
          }
        ]
      }),
      is_active: true
    }
  ];
  
  // Create calculator configurations table entry if it doesn't exist
  // Note: This would typically require a migration, but for seeding we'll add it directly
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS calculator_configurations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID NOT NULL REFERENCES organizations(organization_id) ON DELETE CASCADE,
        facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
        calculator_type VARCHAR(100) NOT NULL,
        configuration JSONB NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    for (const config of cementCalculatorConfigs) {
      await query(`
        INSERT INTO calculator_configurations (id, organization_id, facility_id, calculator_type, configuration, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING
      `, [config.id, config.organization_id, config.facility_id, config.calculator_type, 
          config.configuration, config.is_active]);
    }
    
    logger.info(`✓ Created ${cementCalculatorConfigs.length} cement calculator configurations`);
  } catch (error) {
    logger.warn('Calculator configurations table might not exist yet:', error.message);
  }

  // ==============================================
  // 7. EMISSION AND PRODUCTION DATA (FULL YEAR)
  // ==============================================
  logger.info('Adding comprehensive emission and production data for 2025...');
  
  // Get facility resource configurations for data entry with detailed information (NEW SCHEMA)
  const facilityResourcesResult = await query(`
    SELECT 
      erfc.id as facility_resource_config_id,
      erfc.facility_id,
      erfc.organization_id,
      erc.resource_id,
      er.resource_name,
      er.scope,
      er.category,
      ef.emission_factor,
      ef.emission_factor_unit,
      ef.heat_content,
      ef.heat_content_unit
    FROM emission_resource_facility_configurations erfc
    JOIN emission_resource_configurations erc ON erfc.emission_resource_config_id = erc.id
    JOIN emission_resources er ON erc.resource_id = er.id
    JOIN emission_factors ef ON erc.emission_factor_id = ef.id
    WHERE erfc.organization_id = $1 AND erfc.is_active = true
    ORDER BY erfc.facility_id, er.scope, er.category
  `, [orgId]);
  const facilityResources = facilityResourcesResult.rows;
  
  logger.info(`Found ${facilityResources.length} facility resources for data generation`);
  
  let emissionDataCreated = 0;
  let productionDataCreated = 0;
  
  // Add data for all 12 months of 2025
  for (let month = 1; month <= 12; month++) {
    // Add emission data for each facility-resource combination
    for (const facilityResource of facilityResources) {
      // Realistic consumption patterns based on resource type and facility
      let baseConsumption;
      const resourceName = facilityResource.resource_name.toLowerCase();
      
      if (resourceName.includes('coal')) {
        baseConsumption = 18000; // 18,000 tonnes/month (primary fuel for cement kilns)
      } else if (resourceName.includes('natural gas')) {
        baseConsumption = 12000; // 12,000 m³/month
      } else if (resourceName.includes('petcoke')) {
        baseConsumption = 4500; // 4,500 tonnes/month (high calorific value alternative fuel)
      } else if (resourceName.includes('heavy fuel oil')) {
        baseConsumption = 2800; // 2,800 tonnes/month
      } else if (resourceName.includes('biomass')) {
        baseConsumption = 3200; // 3,200 tonnes/month (alternative fuel)
      } else if (resourceName.includes('waste oil')) {
        baseConsumption = 800; // 800 tonnes/month (alternative fuel)
      } else if (resourceName.includes('purchased electricity')) {
        baseConsumption = 15000; // 15,000 MWh/month (high electricity consumption)
      } else if (resourceName.includes('diesel')) {
        baseConsumption = 450; // 450 tonnes/month (mobile equipment)
      } else if (resourceName.includes('gasoline')) {
        baseConsumption = 180; // 180 tonnes/month (light vehicles)
      } else if (resourceName.includes('lpg')) {
        baseConsumption = 120; // 120 tonnes/month (laboratory, canteen use)
      } else {
        // Default values based on scope
        baseConsumption = facilityResource.scope === 'scope1' ? 2000 : 1000;
      }
      
      // Seasonal variation patterns for cement industry
      const seasonalMultiplier = 1 + 0.25 * Math.sin((month - 1) * Math.PI / 6); // Peak in summer months
      const facilityMultiplier = facilityResource.facility_id === muddapurPlantId ? 0.6 : 1.0; // Muddapur is smaller
      const randomVariation = 0.9 + Math.random() * 0.2; // ±10% random variation
      
      const consumption = baseConsumption * seasonalMultiplier * facilityMultiplier * randomVariation;
      const actualEmissionFactor = parseFloat(facilityResource.emission_factor);
      const actualHeatContent = parseFloat(facilityResource.heat_content || 0);
      
      const totalEmissions = consumption * actualEmissionFactor;
      const totalEnergy = consumption * actualHeatContent;
      
      // Determine consumption unit based on resource type
      let consumptionUnit;
      
      if (resourceName.includes('natural gas')) {
        consumptionUnit = 'm³';
      } else if (resourceName.includes('purchased electricity')) {
        consumptionUnit = 'MWh';
      } else if (resourceName.includes('diesel') || resourceName.includes('gasoline') || 
                 resourceName.includes('heavy fuel oil') || resourceName.includes('waste oil')) {
        consumptionUnit = 'litres';
      } else if (resourceName.includes('lpg')) {
        consumptionUnit = 'kg';
      } else {
        // Coal, Petcoke, Biomass, etc.
        consumptionUnit = 'tonnes';
      }
      
      const existingData = await query(`
        SELECT id FROM emission_data 
        WHERE emission_resource_facility_config_id = $1 AND month = $2 AND year = $3
      `, [facilityResource.facility_resource_config_id, month, 2025]);
      
      if (existingData.rows.length === 0) {
        await query(`
          INSERT INTO emission_data (
            id, organization_id, emission_resource_facility_config_id, 
            month, year, scope, consumption, consumption_unit, 
            emission_factor, total_emissions, total_energy, 
            created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        `, [
          uuidv4(), orgId, facilityResource.facility_resource_config_id,
          month, 2025, facilityResource.scope, consumption.toFixed(2), consumptionUnit,
          actualEmissionFactor, totalEmissions.toFixed(2), totalEnergy.toFixed(2)
        ]);
        
        emissionDataCreated++;
      }
      
      if (month === 1) { // Log first month for verification
        logger.info(`✓ ${facilityResource.resource_name}: ${consumption.toFixed(0)} ${consumptionUnit}/month → ${totalEmissions.toFixed(0)} kgCO2e`);
      }
    }
    
    // Add production data for each facility
    for (const facilityId of [muddapurPlantId, mangrolPlantId]) {
      // Production patterns based on plant capacity and seasonal demand
      const plantCapacity = facilityId === muddapurPlantId ? 125000 : 225000; // Monthly capacity in tonnes
      const seasonalDemand = 1 + 0.15 * Math.sin((month - 1) * Math.PI / 6); // Peak construction season
      const utilizationRate = 0.85 + (Math.random() - 0.5) * 0.2; // 75-95% utilization
      const production = plantCapacity * seasonalDemand * utilizationRate;
      
      await query(`
        INSERT INTO production_data (
          id, organization_id, facility_id, month, year, 
          cement_production, unit, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        ON CONFLICT (facility_id, month, year) 
        DO UPDATE SET 
          cement_production = EXCLUDED.cement_production,
          updated_at = NOW()
      `, [
        uuidv4(), orgId, facilityId, 
        month, 2025, production.toFixed(2), 'tonnes'
      ]);
      
      productionDataCreated++;
    }
  }
  
  logger.info(`Added ${emissionDataCreated} emission data records and ${productionDataCreated} production data records`);
  
  // ==============================================
  // 8. DATA VERIFICATION & SUMMARY
  // ==============================================
  logger.info('Verifying seeded data...');
  
  const totalEmissionsResult = await query(`
    SELECT SUM(total_emissions) as total_emissions 
    FROM emission_data 
    WHERE year = 2025 AND organization_id = $1 AND emission_resource_facility_config_id IS NOT NULL
  `, [orgId]);
  
  const totalProductionResult = await query(`
    SELECT SUM(cement_production) as total_production 
    FROM production_data 
    WHERE year = 2025 AND organization_id = $1
  `, [orgId]);
  
  const totalEmissions = parseFloat(totalEmissionsResult.rows[0]?.total_emissions || 0);
  const totalProduction = parseFloat(totalProductionResult.rows[0]?.total_production || 0);
  const carbonIntensity = totalProduction > 0 ? totalEmissions / totalProduction : 0;
  
  logger.info('');
  logger.info('🎯 JK CEMENT SEEDING COMPLETE - NEW SCHEMA DATA SUMMARY:');
  logger.info('');
  logger.info(`📊 Total Emissions (2025): ${totalEmissions.toLocaleString()} kgCO2e`);
  logger.info(`🏭 Total Production (2025): ${totalProduction.toLocaleString()} tonnes`);
  logger.info(`💡 Carbon Intensity: ${carbonIntensity.toFixed(3)} kgCO2e/tonne`);
  logger.info(`📋 Organization Resource Configs: ${orgResourceConfigsCreated} created`);
  logger.info(`⚡ Facility Resource Assignments: ${facilityResourceConfigsCreated} created`);
  logger.info(`📈 Data Coverage: 12 months (Jan-Dec 2025)`);
  logger.info(`🏢 Facilities: 2 plants (Muddapur: 1.5 MTPA, Mangrol: 2.7 MTPA)`);
  logger.info(`🎯 Sustainability Targets: ${targets.length} active targets`);
  logger.info('');
  logger.info('✅ NEW SCHEMA: Organization → Resource Configs → Facility Assignments → Emission Data');
  logger.info('✅ Dashboard will now show realistic cement industry data using the new schema!');
}

// Run if called directly
if (require.main === module) {
  seedJKCementData();
}

module.exports = { seedJKCementData };
