const { connectDatabase, closePool, query } = require('../config/database');
const { logger } = require('./logger');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { seedPeerOrganizations } = require('./seedPeerOrganizations');

/**
 * Seed the database with initial development data
 */
async function seedDatabase() {
  try {
    // Connect to database
    await connectDatabase();
    
    logger.info('Starting database seeding...');
    
    // Create organization IDs that will be reused
    const orgId1 = uuidv4();
    const orgId2 = uuidv4();
    
    // Seed organizations
    await seedOrganizations(orgId1, orgId2);
    
    // Seed users
    await seedUsers(orgId1, orgId2);
    
    // Seed facilities
    await seedFacilities(orgId1);
    
    // Seed sample data
    await seedSampleData(orgId1);
    
    // Seed peer organizations for benchmarking
    await seedPeerOrganizations();
    
    logger.info('✅ Database seeding completed successfully');
    console.log('✅ Database seeding completed successfully');
    
  } catch (error) {
    logger.error('Failed to seed database:', error);
    console.error('❌ Failed to seed database:', error.message);
    process.exit(1);
  } finally {
    await closePool();
  }
}

/**
 * Seed organizations
 */
async function seedOrganizations(orgId1, orgId2) {
  const organizations = [
    {
      id: orgId1,
      name: 'Green Cement Corp',
      description: 'Leading sustainable cement manufacturer',
      subscription_plan: 'enterprise',
      status: 'active'
    },
    {
      id: orgId2, 
      name: 'EcoCement Industries',
      description: 'Innovative cement solutions for a greener future',
      subscription_plan: 'professional',
      status: 'active'
    }
  ];

  for (const org of organizations) {
    await query(`
      INSERT INTO organizations (organization_id, name, description, subscription_plan, status)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (organization_id) DO NOTHING
    `, [org.id, org.name, org.description, org.subscription_plan, org.status]);
  }
  
  logger.info(`Seeded ${organizations.length} organizations`);
}

/**
 * Seed users
 */
async function seedUsers(orgId1, orgId2) {
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const users = [
    {
      id: uuidv4(),
      organization_id: orgId1,
      email: 'admin@greencement.com',
      password_hash: hashedPassword,
      first_name: 'John',
      last_name: 'Doe',
      role: 'admin',
      status: 'active'
    },
    {
      id: uuidv4(),
      organization_id: orgId1,
      email: 'user@greencement.com',
      password_hash: hashedPassword,
      first_name: 'Jane',
      last_name: 'Smith',
      role: 'user',
      status: 'active'
    },
    {
      id: uuidv4(),
      organization_id: orgId2,
      email: 'admin@ecocement.com',
      password_hash: hashedPassword,
      first_name: 'Mike',
      last_name: 'Johnson',
      role: 'admin',
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
  
  logger.info(`Seeded ${users.length} users`);
}

/**
 * Seed facilities
 */
async function seedFacilities(orgId1) {
  const facilityId1 = uuidv4();
  const facilityId2 = uuidv4();
  
  const facilities = [
    {
      id: facilityId1,
      organization_id: orgId1,
      name: 'Portland Plant North',
      description: 'Main cement production facility with kiln capacity of 3000 TPD',
      location: JSON.stringify({
        address: '123 Industrial Blvd, Portland, OR 97201',
        city: 'Portland',
        state: 'Oregon',
        country: 'United States',
        latitude: 45.5152,
        longitude: -122.6784
      }),
      status: 'active'
    },
    {
      id: facilityId2,
      organization_id: orgId1,
      name: 'Denver Manufacturing Hub',
      description: 'Secondary production facility specializing in sustainable cement',
      location: JSON.stringify({
        address: '456 Production Way, Denver, CO 80202',
        city: 'Denver',
        state: 'Colorado',
        country: 'United States',
        latitude: 39.7392,
        longitude: -104.9903
      }),
      status: 'active'
    }
  ];
  
  // Store for use in sample data
  global.facilityId1 = facilityId1;
  global.facilityId2 = facilityId2;

  for (const facility of facilities) {
    await query(`
      INSERT INTO facilities (id, organization_id, name, description, location, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO NOTHING
    `, [facility.id, facility.organization_id, facility.name, 
        facility.description, facility.location, facility.status]);
  }
  
  logger.info(`Seeded ${facilities.length} facilities`);
}

/**
 * Seed sample emission and production data
 */
async function seedSampleData(orgId1) {
  // Sample production data for 2024
  const productionData = [
    { facility_id: global.facilityId1, month: 1, year: 2024, cement_production: 85000, unit: 'tonnes' },
    { facility_id: global.facilityId1, month: 2, year: 2024, cement_production: 92000, unit: 'tonnes' },
    { facility_id: global.facilityId1, month: 3, year: 2024, cement_production: 88000, unit: 'tonnes' },
    { facility_id: global.facilityId2, month: 1, year: 2024, cement_production: 45000, unit: 'tonnes' },
    { facility_id: global.facilityId2, month: 2, year: 2024, cement_production: 48000, unit: 'tonnes' },
    { facility_id: global.facilityId2, month: 3, year: 2024, cement_production: 47000, unit: 'tonnes' }
  ];

  for (const data of productionData) {
    await query(`
      INSERT INTO production_data (id, organization_id, facility_id, month, year, cement_production, unit)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (facility_id, month, year) DO NOTHING
    `, [uuidv4(), orgId1, data.facility_id, data.month, data.year, 
        data.cement_production, data.unit]);
  }
  
  logger.info(`Seeded ${productionData.length} production data records`);
  
  // Sample sustainability targets
  const targets = [
    {
      id: uuidv4(),
      organization_id: orgId1,
      facility_id: null, // Organization-wide target
      name: 'Net Zero Emissions by 2035',
      description: 'Achieve net-zero Scope 1 and Scope 2 emissions across all facilities by 2035',
      target_type: 'emissions_reduction',
      baseline_value: 220000,
      target_value: 0,
      baseline_year: 2023,
      target_year: 2035,
      unit: 'tonnes CO2e',
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
  
  logger.info(`Seeded ${targets.length} sustainability targets`);
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
