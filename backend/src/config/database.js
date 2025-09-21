const { Pool } = require('pg');
const { config, getDatabaseUrl } = require('./environment');
const { logger } = require('../utils/logger');

/**
 * Database connection pool
 */
let pool = null;

/**
 * Database configuration for PostgreSQL
 */
const dbConfig = {
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  max: config.database.maxConnections,
  connectionTimeoutMillis: config.database.connectionTimeout,
  idleTimeoutMillis: config.database.idleTimeout,
  // Disable SSL for Cloud SQL Unix sockets (starts with /cloudsql/)
  ssl: config.database.host.startsWith('/cloudsql/') ? false : 
       (config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false)
};

/**
 * Create and configure database connection pool
 * @returns {Pool} PostgreSQL connection pool
 */
const createPool = () => {
  if (pool) {
    return pool;
  }

  pool = new Pool(dbConfig);

  // Handle pool errors
  pool.on('error', (err) => {
    logger.error('Unexpected error on idle client:', err);
    process.exit(-1);
  });

  // Handle connection events
  pool.on('connect', (client) => {
    logger.debug('New client connected to database');
  });

  pool.on('acquire', (client) => {
    logger.debug('Client acquired from pool');
  });

  pool.on('remove', (client) => {
    logger.debug('Client removed from pool');
  });

  return pool;
};

/**
 * Connect to the database and test the connection
 * @returns {Promise<Pool>} Database connection pool
 */
const connectDatabase = async () => {
  try {
    pool = createPool();
    
    // Test the connection
    const client = await pool.connect();
    
    // Run a simple query to verify connection
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    logger.info('Database connected successfully');
    logger.debug(`Database time: ${result.rows[0].current_time}`);
    logger.debug(`PostgreSQL version: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
    
    client.release();
    
    return pool;
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
};

/**
 * Get database connection pool
 * @returns {Pool} Database connection pool
 * @throws {Error} If pool is not initialized
 */
const getPool = () => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call connectDatabase() first.');
  }
  return pool;
};

/**
 * Execute a database query
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
const query = async (text, params = []) => {
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    logger.debug(`Query executed in ${duration}ms`, {
      query: text,
      params: params,
      rowCount: result.rowCount
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error(`Query failed after ${duration}ms`, {
      query: text,
      params: params,
      error: error.message
    });
    throw error;
  }
};

/**
 * Execute a query with a specific client (for transactions)
 * @param {Object} client - Database client
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
const queryWithClient = async (client, text, params = []) => {
  const start = Date.now();
  
  try {
    const result = await client.query(text, params);
    const duration = Date.now() - start;
    
    logger.debug(`Transaction query executed in ${duration}ms`, {
      query: text,
      params: params,
      rowCount: result.rowCount
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error(`Transaction query failed after ${duration}ms`, {
      query: text,
      params: params,
      error: error.message
    });
    throw error;
  }
};

/**
 * Execute a function within a database transaction
 * @param {Function} fn - Function to execute within transaction
 * @returns {Promise<any>} Result of the function
 */
const transaction = async (fn) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    
    logger.debug('Transaction committed successfully');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction rolled back due to error:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Check if a table exists in the database
 * @param {string} tableName - Name of the table to check
 * @returns {Promise<boolean>} True if table exists
 */
const tableExists = async (tableName) => {
  try {
    const result = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `, [tableName]);
    
    return result.rows[0].exists;
  } catch (error) {
    logger.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
};

/**
 * Get database connection statistics
 * @returns {Promise<Object>} Connection statistics
 */
const getConnectionStats = async () => {
  if (!pool) {
    return {
      totalConnections: 0,
      idleConnections: 0,
      waitingClients: 0
    };
  }

  return {
    totalConnections: pool.totalCount,
    idleConnections: pool.idleCount,
    waitingClients: pool.waitingCount
  };
};

/**
 * Close database connection pool
 * @returns {Promise<void>}
 */
const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('Database connection pool closed');
  }
};

/**
 * Health check for database connection
 * @returns {Promise<Object>} Health status
 */
const healthCheck = async () => {
  try {
    const start = Date.now();
    const result = await query('SELECT 1 as healthy');
    const responseTime = Date.now() - start;
    
    const stats = await getConnectionStats();
    
    return {
      status: 'healthy',
      responseTime,
      connections: stats,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

module.exports = {
  connectDatabase,
  getPool,
  query,
  queryWithClient,
  transaction,
  tableExists,
  getConnectionStats,
  closePool,
  healthCheck,
  getDatabaseUrl
};

