const { connectDatabase, closePool } = require('../config/database');
const MigrationRunner = require('./migrationRunner');
const { logger } = require('./logger');

/**
 * Display migration status in a formatted table
 */
async function showMigrationStatus() {
  try {
    // Connect to database
    await connectDatabase();
    
    const migrationRunner = new MigrationRunner();
    const status = await migrationRunner.getMigrationStatus();
    
    console.log('\n📊 Migration Status Report');
    console.log('==========================');
    console.log(`Total migrations: ${status.total}`);
    console.log(`Applied: ${status.applied.length}`);
    console.log(`Pending: ${status.pending.length}`);
    console.log(`Failed: ${status.failed.length}`);
    console.log(`Last migration: ${status.lastMigration || 'None'}`);
    
    if (status.applied.length > 0) {
      console.log('\n✅ Applied Migrations:');
      console.log('─────────────────────');
      status.applied.forEach(migration => {
        const date = new Date(migration.applied_at).toLocaleString();
        const time = migration.execution_time_ms ? `${migration.execution_time_ms}ms` : 'N/A';
        console.log(`  ${migration.filename} (${date}) - ${time}`);
      });
    }
    
    if (status.pending.length > 0) {
      console.log('\n⏳ Pending Migrations:');
      console.log('─────────────────────');
      status.pending.forEach(filename => {
        console.log(`  ${filename}`);
      });
    }
    
    if (status.failed.length > 0) {
      console.log('\n❌ Failed Migrations:');
      console.log('────────────────────');
      status.failed.forEach(migration => {
        const date = new Date(migration.applied_at).toLocaleString();
        console.log(`  ${migration.filename} (${date})`);
        console.log(`    Error: ${migration.error_message}`);
      });
    }
    
    console.log('\n');
    
  } catch (error) {
    logger.error('Failed to get migration status:', error);
    console.error('❌ Failed to get migration status:', error.message);
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Run if called directly
if (require.main === module) {
  showMigrationStatus();
}

module.exports = { showMigrationStatus };
