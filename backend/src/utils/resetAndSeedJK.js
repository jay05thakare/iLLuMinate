const { clearDatabase } = require('./clearDatabase');
const { seedJKCementData } = require('./seedJKCement');
const { seedPeerOrganizations } = require('./seedPeerOrganizations');
const { connectDatabase, closePool, query } = require('../config/database');
const { logger } = require('./logger');

/**
 * Complete database reset with JK Cement data
 * This function clears all existing data and seeds with JK Cement real data
 */
async function resetAndSeedJKCement() {
  try {
    console.log('🚀 Starting complete database reset with JK Cement data...');
    logger.info('Starting complete database reset with JK Cement data');
    
    // Step 1: Clear all existing data
    console.log('\n📋 Step 1: Clearing existing database data...');
    await clearDatabase();
    
    // Step 2: Re-seed emission resources (as they were cleared)
    console.log('\n📋 Step 2: Re-seeding emission resources...');
    await connectDatabase();
    
    // Re-run the emission resources and libraries migration
    const fs = require('fs');
    const path = require('path');
    
    // Re-seed emission resources
    const emissionResourcesSql = fs.readFileSync(
      path.join(__dirname, '../../migrations/014_seed_emission_resources.sql'), 
      'utf8'
    );
    await query(emissionResourcesSql);
    console.log('✅ Emission resources re-seeded');
    
    // Re-seed emission factor libraries
    const emissionLibrariesSql = fs.readFileSync(
      path.join(__dirname, '../../migrations/015_seed_emission_factor_libraries.sql'), 
      'utf8'
    );
    await query(emissionLibrariesSql);
    console.log('✅ Emission factor libraries re-seeded');
    
    await closePool();
    
    // Step 3: Seed with JK Cement data
    console.log('\n📋 Step 3: Seeding with JK Cement data...');
    await seedJKCementData();
    
    // Step 4: Seed peer organizations for benchmarking
    console.log('\n📋 Step 4: Seeding peer organizations for benchmarking...');
    await seedPeerOrganizations();
    
    console.log('\n🎉 Database reset and JK Cement seeding completed successfully!');
    console.log('\n📊 JK Cement data now available:');
    console.log('   🏢 Organization: JK Cement Limited');
    console.log('   👥 Users: CEO, Sustainability Manager, Plant Managers, Engineers');
    console.log('   🏭 Facilities: Mangrol Plant (2.7 MTPA), Muddapur Plant (1.5 MTPA)');
    console.log('   📈 Production Data: 8 months of 2024 data');
    console.log('   🎯 Targets: Carbon neutrality, Alternative fuels, Energy efficiency');
    console.log('\n🔐 Login credentials:');
    console.log('   📧 ceo@jkcement.com / jkcement2024');
    console.log('   📧 sustainability@jkcement.com / jkcement2024');
    console.log('   📧 plant.manager.mangrol@jkcement.com / jkcement2024');
    
  } catch (error) {
    logger.error('Failed to reset and seed database:', error);
    console.error('❌ Failed to reset and seed database:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  resetAndSeedJKCement();
}

module.exports = { resetAndSeedJKCement };
