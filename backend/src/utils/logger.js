const winston = require('winston');
const path = require('path');
const fs = require('fs');
const { config } = require('../config/environment');

/**
 * Ensure logs directory exists
 */
const ensureLogDirectory = () => {
  const logDir = path.resolve(__dirname, '../../', config.logging.directory);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  return logDir;
};

/**
 * Custom log format for development
 */
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = '\n' + JSON.stringify(meta, null, 2);
    }
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

/**
 * Custom log format for production
 */
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Create logger instance
 */
const createLogger = () => {
  const logDir = ensureLogDirectory();
  
  const transports = [];

  // Console transport
  if (config.nodeEnv !== 'test') {
    transports.push(
      new winston.transports.Console({
        level: config.logging.level,
        format: config.nodeEnv === 'development' ? developmentFormat : productionFormat,
        handleExceptions: true
      })
    );
  }

  // File transports for production and development
  if (config.nodeEnv !== 'test') {
    // Combined log file
    transports.push(
      new winston.transports.File({
        filename: path.join(logDir, 'combined.log'),
        level: 'info',
        format: productionFormat,
        maxsize: config.logging.maxFileSize,
        maxFiles: config.logging.maxFiles,
        handleExceptions: true
      })
    );

    // Error log file
    transports.push(
      new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
        format: productionFormat,
        maxsize: config.logging.maxFileSize,
        maxFiles: config.logging.maxFiles,
        handleExceptions: true
      })
    );

    // Debug log file (development only)
    if (config.nodeEnv === 'development') {
      transports.push(
        new winston.transports.File({
          filename: path.join(logDir, 'debug.log'),
          level: 'debug',
          format: productionFormat,
          maxsize: config.logging.maxFileSize,
          maxFiles: config.logging.maxFiles
        })
      );
    }
  }

  return winston.createLogger({
    level: config.logging.level,
    format: productionFormat,
    defaultMeta: {
      service: config.appName,
      environment: config.nodeEnv,
      version: '1.0.0'
    },
    transports,
    exitOnError: false
  });
};

/**
 * Logger instance
 */
const logger = createLogger();

/**
 * Log HTTP request information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} responseTime - Response time in milliseconds
 */
const logRequest = (req, res, responseTime) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user?.id || null,
    organizationId: req.user?.organization_id || null
  };

  if (res.statusCode >= 400) {
    logger.warn('HTTP Request completed with error', logData);
  } else {
    logger.info('HTTP Request completed successfully', logData);
  }
};

/**
 * Log database query information
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @param {number} duration - Query execution time in milliseconds
 * @param {number} rowCount - Number of rows affected/returned
 */
const logQuery = (query, params, duration, rowCount) => {
  const logData = {
    query: query.replace(/\s+/g, ' ').trim(),
    params: params || [],
    duration: `${duration}ms`,
    rowCount
  };

  if (duration > 1000) {
    logger.warn('Slow database query detected', logData);
  } else {
    logger.debug('Database query executed', logData);
  }
};

/**
 * Log authentication events
 * @param {string} event - Authentication event type
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {Object} metadata - Additional metadata
 */
const logAuth = (event, userId, email, metadata = {}) => {
  logger.info('Authentication event', {
    event,
    userId,
    email,
    timestamp: new Date().toISOString(),
    ...metadata
  });
};

/**
 * Log business events
 * @param {string} event - Business event type
 * @param {Object} data - Event data
 */
const logBusinessEvent = (event, data = {}) => {
  logger.info('Business event', {
    event,
    timestamp: new Date().toISOString(),
    ...data
  });
};

/**
 * Log security events
 * @param {string} event - Security event type
 * @param {Object} data - Event data
 */
const logSecurity = (event, data = {}) => {
  logger.warn('Security event', {
    event,
    timestamp: new Date().toISOString(),
    ...data
  });
};

/**
 * Log performance metrics
 * @param {string} operation - Operation name
 * @param {number} duration - Operation duration in milliseconds
 * @param {Object} metadata - Additional metadata
 */
const logPerformance = (operation, duration, metadata = {}) => {
  const logData = {
    operation,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
    ...metadata
  };

  if (duration > 5000) {
    logger.warn('Slow operation detected', logData);
  } else {
    logger.debug('Performance metric', logData);
  }
};

/**
 * Create child logger with additional context
 * @param {Object} context - Additional context to include in all logs
 * @returns {Object} Child logger instance
 */
const createChildLogger = (context) => {
  return logger.child(context);
};

/**
 * Stream for Morgan HTTP logger
 */
const stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

module.exports = {
  logger,
  logRequest,
  logQuery,
  logAuth,
  logBusinessEvent,
  logSecurity,
  logPerformance,
  createChildLogger,
  stream
};

