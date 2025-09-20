const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { connectDatabase, query, transaction, queryWithClient, tableExists } = require('../config/database');
const { logger } = require('./logger');

class MigrationRunner {
  constructor() {
    this.migrationsPath = path.join(__dirname, '../../migrations');
  }

  /**
   * Run all pending migrations
   * @returns {Promise<void>}
   */
  async runMigrations() {
    try {
      // Connect to database first
      await connectDatabase();
      
      // First ensure migration_history table exists
      await this.ensureMigrationTable();
      
      const migrationFiles = this.getMigrationFiles();
      logger.info(`Found ${migrationFiles.length} migration files`);
      
      let appliedCount = 0;
      
      for (const file of migrationFiles) {
        if (!(await this.isMigrationApplied(file))) {
          await this.executeMigration(file);
          appliedCount++;
        } else {
          logger.debug(`Migration already applied: ${file}`);
        }
      }
      
      if (appliedCount === 0) {
        logger.info('No new migrations to apply');
      } else {
        logger.info(`Successfully applied ${appliedCount} new migrations`);
      }
      
    } catch (error) {
      logger.error('Migration execution failed:', error);
      throw error;
    }
  }

  /**
   * Ensure migration_history table exists
   * @returns {Promise<void>}
   */
  async ensureMigrationTable() {
    const exists = await tableExists('migration_history');
    
    if (!exists) {
      logger.info('Creating migration_history table...');
      const migrationTableSql = `
        CREATE TABLE migration_history (
          id SERIAL PRIMARY KEY,
          filename VARCHAR(255) NOT NULL UNIQUE,
          checksum VARCHAR(64) NOT NULL,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          execution_time_ms INTEGER,
          success BOOLEAN DEFAULT true,
          error_message TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_migration_history_filename ON migration_history(filename);
        CREATE INDEX IF NOT EXISTS idx_migration_history_applied_at ON migration_history(applied_at);
      `;
      
      await query(migrationTableSql);
      logger.info('Migration history table created successfully');
    }
  }

  /**
   * Get all migration files sorted by name
   * @returns {Array<string>} Sorted list of migration filenames
   */
  getMigrationFiles() {
    if (!fs.existsSync(this.migrationsPath)) {
      logger.warn(`Migrations directory does not exist: ${this.migrationsPath}`);
      return [];
    }
    
    return fs.readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort();
  }

  /**
   * Check if a migration has been applied
   * @param {string} filename - Migration filename
   * @returns {Promise<boolean>} True if migration has been applied
   */
  async isMigrationApplied(filename) {
    try {
      const result = await query(
        'SELECT filename FROM migration_history WHERE filename = $1 AND success = true',
        [filename]
      );
      return result.rows.length > 0;
    } catch (error) {
      // If table doesn't exist, migration hasn't been applied
      if (error.message.includes('relation "migration_history" does not exist')) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Execute a single migration
   * @param {string} filename - Migration filename
   * @returns {Promise<void>}
   */
  async executeMigration(filename) {
    const startTime = Date.now();
    const filePath = path.join(this.migrationsPath, filename);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Migration file not found: ${filePath}`);
    }
    
    const sql = fs.readFileSync(filePath, 'utf8');
    const checksum = crypto.createHash('sha256').update(sql).digest('hex');

    logger.info(`🔄 Running migration: ${filename}`);

    try {
      // Execute migration in a transaction
      await transaction(async (client) => {
        // Skip the migration_history table creation file if it's already executed via ensureMigrationTable
        if (filename !== '000_create_migration_history.sql') {
          await queryWithClient(client, sql);
        }
        
        // Record successful migration
        await queryWithClient(client, `
          INSERT INTO migration_history (filename, checksum, execution_time_ms, success) 
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (filename) DO UPDATE SET
            checksum = EXCLUDED.checksum,
            applied_at = CURRENT_TIMESTAMP,
            execution_time_ms = EXCLUDED.execution_time_ms,
            success = EXCLUDED.success,
            error_message = NULL
        `, [filename, checksum, Date.now() - startTime, true]);
      });
      
      const executionTime = Date.now() - startTime;
      logger.info(`✅ Applied migration: ${filename} (${executionTime}ms)`);
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      // Record failed migration
      try {
        await query(`
          INSERT INTO migration_history (filename, checksum, execution_time_ms, success, error_message) 
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (filename) DO UPDATE SET
            checksum = EXCLUDED.checksum,
            applied_at = CURRENT_TIMESTAMP,
            execution_time_ms = EXCLUDED.execution_time_ms,
            success = EXCLUDED.success,
            error_message = EXCLUDED.error_message
        `, [filename, checksum, executionTime, false, error.message]);
      } catch (logError) {
        logger.error('Failed to log migration error:', logError);
      }
      
      logger.error(`❌ Migration failed: ${filename} (${executionTime}ms)`, error);
      throw error;
    }
  }

  /**
   * Get migration status information
   * @returns {Promise<Object>} Migration status details
   */
  async getMigrationStatus() {
    await this.ensureMigrationTable();
    
    const appliedMigrations = await query(`
      SELECT filename, applied_at, execution_time_ms, success, error_message 
      FROM migration_history 
      ORDER BY applied_at
    `);
    
    const allMigrations = this.getMigrationFiles();
    const appliedFilenames = appliedMigrations.rows
      .filter(row => row.success)
      .map(row => row.filename);
    
    const pendingMigrations = allMigrations.filter(file => 
      !appliedFilenames.includes(file)
    );
    
    const failedMigrations = appliedMigrations.rows.filter(row => !row.success);
    
    return {
      applied: appliedMigrations.rows.filter(row => row.success),
      pending: pendingMigrations,
      failed: failedMigrations,
      total: allMigrations.length,
      lastMigration: appliedMigrations.rows
        .filter(row => row.success)
        .pop()?.filename || null
    };
  }

  /**
   * Rollback last migration (marks as failed, manual intervention required)
   * @returns {Promise<void>}
   */
  async rollbackLastMigration() {
    await this.ensureMigrationTable();
    
    const lastMigration = await query(`
      SELECT filename FROM migration_history 
      WHERE success = true 
      ORDER BY applied_at DESC 
      LIMIT 1
    `);
    
    if (lastMigration.rows.length === 0) {
      logger.info('No migrations to rollback');
      return;
    }
    
    const filename = lastMigration.rows[0].filename;
    logger.info(`🔄 Rolling back migration: ${filename}`);
    
    // Mark migration as rolled back
    await query(
      'UPDATE migration_history SET success = false, error_message = $1 WHERE filename = $2',
      ['Rolled back manually', filename]
    );
    
    logger.info(`✅ Rolled back migration: ${filename}`);
    logger.warn('⚠️  Note: Manual database changes may be required for complete rollback');
  }
}

module.exports = MigrationRunner;

// If run directly from command line
if (require.main === module) {
  const { closePool } = require('../config/database');
  const migrationRunner = new MigrationRunner();
  
  migrationRunner.runMigrations()
    .then(() => {
      logger.info('Migration process completed successfully');
      console.log('✅ Migration process completed successfully');
    })
    .catch((error) => {
      logger.error('Migration process failed:', error);
      console.error('❌ Migration process failed:', error.message);
    })
    .finally(async () => {
      await closePool();
      process.exit(0);
    });
}
