const { connectDatabase, closePool, query } = require('../config/database');
const { logger } = require('./logger');

/**
 * Clear all data from the database (keeps tables and schema)
 */
async function clearDatabase() {
  try {
    // Connect to database
    await connectDatabase();
    
    logger.info('Starting database cleanup...');
    console.log('🗑️  Clearing all database data...');
    
    // Disable foreign key checks temporarily and clear all data
    await query('BEGIN');
    
    // Get all table names except migration_history
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name != 'migration_history'
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    
    // Truncate all tables in correct order (reverse dependency order)
    const truncateOrder = [
      'ai_recommendations',
      'chat_history', 
      'emission_data',
      'facility_resources',
      'emission_factors',
      'emission_factor_libraries',
      'emission_resources',
      'production_data',
      'sustainability_targets',
      'facilities',
      'users',
      'organizations',
      'industry_benchmarking'
    ];
    
    for (const tableName of truncateOrder) {
      if (tables.includes(tableName)) {
        await query(`TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE`);
        logger.info(`Cleared table: ${tableName}`);
      }
    }
    
    await query('COMMIT');
    
    logger.info('✅ Database cleanup completed successfully');
    console.log('✅ Database cleanup completed successfully');
    
  } catch (error) {
    await query('ROLLBACK');
    logger.error('Failed to clear database:', error);
    console.error('❌ Failed to clear database:', error.message);
    throw error;
  } finally {
    await closePool();
  }
}

// Run if called directly
if (require.main === module) {
  clearDatabase();
}

module.exports = { clearDatabase };
