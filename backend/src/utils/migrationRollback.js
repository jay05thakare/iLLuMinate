const { connectDatabase, closePool } = require('../config/database');
const MigrationRunner = require('./migrationRunner');
const { logger } = require('./logger');

/**
 * Rollback the last migration
 */
async function rollbackLastMigration() {
  try {
    // Connect to database
    await connectDatabase();
    
    const migrationRunner = new MigrationRunner();
    await migrationRunner.rollbackLastMigration();
    
    console.log('✅ Migration rollback completed');
    
  } catch (error) {
    logger.error('Failed to rollback migration:', error);
    console.error('❌ Failed to rollback migration:', error.message);
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Run if called directly
if (require.main === module) {
  rollbackLastMigration();
}

module.exports = { rollbackLastMigration };
