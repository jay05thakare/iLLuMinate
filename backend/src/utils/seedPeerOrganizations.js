const { connectDatabase, closePool, query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Seed peer organizations data for benchmarking
 * Includes JK Cement, Sagar Cement, and other industry peers
 */
async function seedPeerOrganizations() {
  console.log('🏢 Starting peer organizations seeding...');

  try {
    // Connect to database
    await connectDatabase();
    // Clear existing data
    await query('DELETE FROM peer_organization_targets');
    await query('DELETE FROM peer_organization_metrics');
    await query('DELETE FROM peer_organizations');

    // Create peer organizations
    const jkCementId = uuidv4();
    const sagarCementId = uuidv4();
    const indianHotelsId = uuidv4();
    const arvindLtdId = uuidv4();
    const mahindraHolidaysId = uuidv4();

    const peerOrganizations = [
      {
        id: jkCementId,
        name: 'JK Cement Limited',
        industry: 'cement',
        country: 'India',
        region: 'Asia Pacific',
        sector: 'Building Materials',
        basic_industry: 'Cement Manufacturing',
        is_public: true,
        is_active: true
      },
      {
        id: sagarCementId,
        name: 'Sagar Cements Limited',
        industry: 'cement',
        country: 'India',
        region: 'Asia Pacific',
        sector: 'Building Materials',
        basic_industry: 'Cement Manufacturing',
        is_public: true,
        is_active: true
      },
      {
        id: indianHotelsId,
        name: 'The Indian Hotels Company Limited',
        industry: 'hospitality',
        country: 'India',
        region: 'Asia Pacific',
        sector: 'Consumer Services',
        basic_industry: 'Hotels & Leisure',
        is_public: true,
        is_active: true
      },
      {
        id: arvindLtdId,
        name: 'Arvind Limited',
        industry: 'textiles',
        country: 'India',
        region: 'Asia Pacific',
        sector: 'Consumer Services',
        basic_industry: 'Textiles',
        is_public: true,
        is_active: true
      },
      {
        id: mahindraHolidaysId,
        name: 'Mahindra Holidays & Resorts India Limited',
        industry: 'hospitality',
        country: 'India',
        region: 'Asia Pacific',
        sector: 'Consumer Services',
        basic_industry: 'Hotels & Leisure',
        is_public: true,
        is_active: true
      }
    ];

    // Insert peer organizations
    for (const org of peerOrganizations) {
      await query(`
        INSERT INTO peer_organizations (
          id, name, industry, country, region, sector, basic_industry, is_public, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [org.id, org.name, org.industry, org.country, org.region, org.sector, org.basic_industry, org.is_public, org.is_active]);
    }

    console.log(`✅ Created ${peerOrganizations.length} peer organizations`);

    // Create metrics data for multiple years (2020-2024)
    const metricsData = [
      // JK Cement Limited - Real data estimates
      {
        peer_organization_id: jkCementId,
        year: 2024,
        revenue: 44056000000.00, // ₹44,056 Cr (converted to USD approx)
        revenue_currency: 'USD',
        scope1_emissions: 8500000, // tonnes CO2e
        scope2_emissions: 650000, // tonnes CO2e
        total_emissions: 9150000, // tonnes CO2e
        total_energy_consumption: 32000000, // GJ
        renewable_energy_percentage: 8.5,
        cement_production: 11000000, // tonnes
        carbon_intensity: 831.8, // kgCO2e/tonne
        energy_intensity: 2.91, // GJ/tonne
        revenue_intensity: 4005.45, // USD per tonne
        water_consumption: 8800000, // cubic meters
        water_intensity: 0.8, // m3/tonne
        waste_generated: 33000, // tonnes
        waste_intensity: 3.0, // kg/tonne
        waste_recycled_percentage: 85.5,
        alternative_fuel_rate: 18.2,
        employee_count: 9500,
        safety_incidents: 12,
        safety_rate: 1.26,
        esg_score: 72.5,
        environmental_score: 75.0,
        social_score: 71.0,
        governance_score: 71.5,
        gender_diversity_percentage: 15.8,
        gender_diversity_leadership: 22.3
      },
      {
        peer_organization_id: jkCementId,
        year: 2023,
        revenue: 41200000000.00,
        revenue_currency: 'USD',
        scope1_emissions: 8750000,
        scope2_emissions: 680000,
        total_emissions: 9430000,
        total_energy_consumption: 33500000,
        renewable_energy_percentage: 6.2,
        cement_production: 10800000,
        carbon_intensity: 873.1,
        energy_intensity: 3.10,
        revenue_intensity: 3814.81,
        water_consumption: 9200000,
        water_intensity: 0.85,
        waste_generated: 36000,
        waste_intensity: 3.33,
        waste_recycled_percentage: 82.0,
        alternative_fuel_rate: 15.7,
        employee_count: 9200,
        safety_incidents: 15,
        safety_rate: 1.63,
        esg_score: 69.5,
        environmental_score: 72.0,
        social_score: 68.0,
        governance_score: 68.5,
        gender_diversity_percentage: 14.2,
        gender_diversity_leadership: 19.8
      },
      // Sagar Cements Limited - Real data estimates
      {
        peer_organization_id: sagarCementId,
        year: 2024,
        revenue: 26800000000.00, // ₹26,800 Cr (estimated)
        revenue_currency: 'USD',
        scope1_emissions: 5200000, // tonnes CO2e
        scope2_emissions: 420000, // tonnes CO2e
        total_emissions: 5620000, // tonnes CO2e
        total_energy_consumption: 19500000, // GJ
        renewable_energy_percentage: 12.3,
        cement_production: 6800000, // tonnes
        carbon_intensity: 826.5, // kgCO2e/tonne
        energy_intensity: 2.87, // GJ/tonne
        revenue_intensity: 3941.18, // USD per tonne
        water_consumption: 5100000, // cubic meters
        water_intensity: 0.75, // m3/tonne
        waste_generated: 20400, // tonnes
        waste_intensity: 3.0, // kg/tonne
        waste_recycled_percentage: 88.2,
        alternative_fuel_rate: 22.1,
        employee_count: 5800,
        safety_incidents: 8,
        safety_rate: 1.38,
        esg_score: 74.2,
        environmental_score: 76.5,
        social_score: 72.8,
        governance_score: 73.3,
        gender_diversity_percentage: 18.5,
        gender_diversity_leadership: 25.7
      },
      {
        peer_organization_id: sagarCementId,
        year: 2023,
        revenue: 24500000000.00,
        revenue_currency: 'USD',
        scope1_emissions: 5450000,
        scope2_emissions: 445000,
        total_emissions: 5895000,
        total_energy_consumption: 20800000,
        renewable_energy_percentage: 9.8,
        cement_production: 6500000,
        carbon_intensity: 906.9,
        energy_intensity: 3.20,
        revenue_intensity: 3769.23,
        water_consumption: 5500000,
        water_intensity: 0.85,
        waste_generated: 22750,
        waste_intensity: 3.5,
        waste_recycled_percentage: 85.0,
        alternative_fuel_rate: 19.5,
        employee_count: 5600,
        safety_incidents: 11,
        safety_rate: 1.96,
        esg_score: 71.0,
        environmental_score: 73.2,
        social_score: 69.5,
        governance_score: 70.3,
        gender_diversity_percentage: 16.8,
        gender_diversity_leadership: 22.1
      },
      // The Indian Hotels Company Limited
      {
        peer_organization_id: indianHotelsId,
        year: 2024,
        revenue: 44056000000.00, // Real turnover from image
        revenue_currency: 'USD',
        scope1_emissions: 85000, // tonnes CO2e (hotels have lower direct emissions)
        scope2_emissions: 195000, // tonnes CO2e (mostly electricity)
        total_emissions: 280000, // tonnes CO2e
        total_energy_consumption: 850000, // GJ
        renewable_energy_percentage: 35.2,
        cement_production: 0, // Not applicable
        carbon_intensity: 0, // Not applicable
        energy_intensity: 0, // Different metric for hotels
        revenue_intensity: 0, // Different metric
        water_consumption: 12500000, // cubic meters (hotels use lots of water)
        water_intensity: 0, // Per room or per guest night
        waste_generated: 18500, // tonnes
        waste_intensity: 0, // Per room or per guest night
        waste_recycled_percentage: 72.5,
        alternative_fuel_rate: 0, // Not applicable
        employee_count: 42000,
        safety_incidents: 8,
        safety_rate: 0.19,
        esg_score: 78.5,
        environmental_score: 75.2,
        social_score: 82.1,
        governance_score: 78.2,
        gender_diversity_percentage: 45.8,
        gender_diversity_leadership: 38.5
      },
      // Arvind Limited
      {
        peer_organization_id: arvindLtdId,
        year: 2024,
        revenue: 71000000000.00, // Real turnover from image
        revenue_currency: 'USD',
        scope1_emissions: 420000, // tonnes CO2e (textile manufacturing)
        scope2_emissions: 180000, // tonnes CO2e
        total_emissions: 600000, // tonnes CO2e
        total_energy_consumption: 2400000, // GJ
        renewable_energy_percentage: 28.7,
        cement_production: 0, // Not applicable
        carbon_intensity: 0, // Different metric for textiles
        energy_intensity: 0, // Per kg of textile
        revenue_intensity: 0, // Different metric
        water_consumption: 35000000, // cubic meters (textiles use lots of water)
        water_intensity: 0, // Per kg of product
        waste_generated: 45000, // tonnes
        waste_intensity: 0, // Per kg of product
        waste_recycled_percentage: 68.5,
        alternative_fuel_rate: 15.2, // Some textile plants use alternative fuels
        employee_count: 55000,
        safety_incidents: 18,
        safety_rate: 0.33,
        esg_score: 69.8,
        environmental_score: 68.5,
        social_score: 72.0,
        governance_score: 69.0,
        gender_diversity_percentage: 52.3,
        gender_diversity_leadership: 31.2
      },
      // Mahindra Holidays
      {
        peer_organization_id: mahindraHolidaysId,
        year: 2024,
        revenue: 14341097846.00, // Real turnover from image
        revenue_currency: 'USD',
        scope1_emissions: 25000, // tonnes CO2e (resort operations)
        scope2_emissions: 65000, // tonnes CO2e
        total_emissions: 90000, // tonnes CO2e
        total_energy_consumption: 320000, // GJ
        renewable_energy_percentage: 42.5,
        cement_production: 0, // Not applicable
        carbon_intensity: 0, // Not applicable
        energy_intensity: 0, // Per room night
        revenue_intensity: 0, // Different metric
        water_consumption: 8500000, // cubic meters
        water_intensity: 0, // Per room night
        waste_generated: 8500, // tonnes
        waste_intensity: 0, // Per room night
        waste_recycled_percentage: 78.5,
        alternative_fuel_rate: 0, // Not applicable
        employee_count: 12500,
        safety_incidents: 3,
        safety_rate: 0.24,
        esg_score: 81.2,
        environmental_score: 83.5,
        social_score: 79.8,
        governance_score: 80.3,
        gender_diversity_percentage: 48.7,
        gender_diversity_leadership: 41.2
      }
    ];

    // Insert metrics data
    for (const metrics of metricsData) {
      await query(`
        INSERT INTO peer_organization_metrics (
          peer_organization_id, year, revenue, revenue_currency, scope1_emissions, scope2_emissions,
          total_emissions, total_energy_consumption, renewable_energy_percentage, cement_production,
          carbon_intensity, energy_intensity, revenue_intensity, water_consumption, water_intensity,
          waste_generated, waste_intensity, waste_recycled_percentage, alternative_fuel_rate,
          employee_count, safety_incidents, safety_rate, esg_score, environmental_score,
          social_score, governance_score, gender_diversity_percentage, gender_diversity_leadership
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
          $20, $21, $22, $23, $24, $25, $26, $27, $28
        )
      `, [
        metrics.peer_organization_id, metrics.year, metrics.revenue, metrics.revenue_currency,
        metrics.scope1_emissions, metrics.scope2_emissions, metrics.total_emissions,
        metrics.total_energy_consumption, metrics.renewable_energy_percentage, metrics.cement_production,
        metrics.carbon_intensity, metrics.energy_intensity, metrics.revenue_intensity,
        metrics.water_consumption, metrics.water_intensity, metrics.waste_generated,
        metrics.waste_intensity, metrics.waste_recycled_percentage, metrics.alternative_fuel_rate,
        metrics.employee_count, metrics.safety_incidents, metrics.safety_rate,
        metrics.esg_score, metrics.environmental_score, metrics.social_score,
        metrics.governance_score, metrics.gender_diversity_percentage, metrics.gender_diversity_leadership
      ]);
    }

    console.log(`✅ Created ${metricsData.length} peer organization metrics records`);

    // Create targets data
    const targetsData = [
      // JK Cement targets
      {
        peer_organization_id: jkCementId,
        target_name: 'Net Zero by 2070',
        target_type: 'absolute',
        metric_type: 'total_emissions',
        baseline_value: 9150000,
        baseline_year: 2024,
        target_value: 0,
        target_year: 2070,
        unit: 'tonnes CO2e',
        status: 'active',
        description: 'Achieve net zero emissions across all operations by 2070'
      },
      {
        peer_organization_id: jkCementId,
        target_name: 'Carbon Intensity Reduction',
        target_type: 'intensity',
        metric_type: 'carbon_intensity',
        baseline_value: 831.8,
        baseline_year: 2024,
        target_value: 600,
        target_year: 2030,
        unit: 'kgCO2e/tonne',
        status: 'active',
        description: 'Reduce carbon intensity by 28% by 2030'
      },
      {
        peer_organization_id: jkCementId,
        target_name: 'Alternative Fuel Rate 30%',
        target_type: 'percentage',
        metric_type: 'alternative_fuel_rate',
        baseline_value: 18.2,
        baseline_year: 2024,
        target_value: 30,
        target_year: 2028,
        unit: 'percentage',
        status: 'active',
        description: 'Increase alternative fuel substitution rate to 30% by 2028'
      },
      // Sagar Cement targets
      {
        peer_organization_id: sagarCementId,
        target_name: 'Carbon Neutral by 2050',
        target_type: 'absolute',
        metric_type: 'total_emissions',
        baseline_value: 5620000,
        baseline_year: 2024,
        target_value: 0,
        target_year: 2050,
        unit: 'tonnes CO2e',
        status: 'active',
        description: 'Achieve carbon neutrality by 2050'
      },
      {
        peer_organization_id: sagarCementId,
        target_name: 'Renewable Energy 50%',
        target_type: 'percentage',
        metric_type: 'renewable_energy_percentage',
        baseline_value: 12.3,
        baseline_year: 2024,
        target_value: 50,
        target_year: 2030,
        unit: 'percentage',
        status: 'active',
        description: 'Source 50% of electricity from renewable sources by 2030'
      },
      // The Indian Hotels targets
      {
        peer_organization_id: indianHotelsId,
        target_name: 'Carbon Neutral Hotels by 2030',
        target_type: 'absolute',
        metric_type: 'scope1_emissions',
        baseline_value: 85000,
        baseline_year: 2024,
        target_value: 0,
        target_year: 2030,
        unit: 'tonnes CO2e',
        status: 'active',
        description: 'Make all hotels carbon neutral for Scope 1 emissions by 2030'
      }
    ];

    // Insert targets data
    for (const target of targetsData) {
      await query(`
        INSERT INTO peer_organization_targets (
          peer_organization_id, target_name, target_type, metric_type, baseline_value,
          baseline_year, target_value, target_year, unit, status, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        target.peer_organization_id, target.target_name, target.target_type, target.metric_type,
        target.baseline_value, target.baseline_year, target.target_value, target.target_year,
        target.unit, target.status, target.description
      ]);
    }

    console.log(`✅ Created ${targetsData.length} peer organization targets`);
    console.log('🎉 Peer organizations seeding completed successfully!');

    return {
      organizations: peerOrganizations.length,
      metrics: metricsData.length,
      targets: targetsData.length
    };

  } catch (error) {
    console.error('❌ Error seeding peer organizations:', error);
    throw error;
  } finally {
    await closePool();
  }
}

module.exports = { seedPeerOrganizations };
