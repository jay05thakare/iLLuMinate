const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

/**
 * Environment configuration object
 * Validates and provides typed access to environment variables
 */
const config = {
  // Application
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  appName: process.env.APP_NAME || 'iLLuMinate',
  appUrl: process.env.APP_URL || 'http://localhost:3000',

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174',

  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'illuminate_db',
    user: process.env.DB_USER || 'illuminate',
    password: process.env.DB_PASSWORD || '',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS, 10) || 20,
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT, 10) || 5000,
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT, 10) || 30000
  },

  // Authentication
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'iLLuMinate',
    audience: process.env.JWT_AUDIENCE || 'iLLuMinate-users'
  },

  // AI Services
  aiService: {
    url: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    timeout: parseInt(process.env.AI_SERVICE_TIMEOUT, 10) || 30000
  },

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS, 10) || 1000,
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB, 10) || 0,
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'illuminate:'
  },

  // Email
  email: {
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      user: process.env.SMTP_USER || '',
      password: process.env.SMTP_PASSWORD || ''
    },
    from: process.env.FROM_EMAIL || 'noreply@illuminate.com',
    templates: {
      userInvitation: 'user-invitation',
      passwordReset: 'password-reset',
      welcomeUser: 'welcome-user'
    }
  },

  // File uploads
  uploads: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024, // 10MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,pdf,csv,xlsx').split(','),
    destination: process.env.UPLOAD_DESTINATION || 'uploads/',
    publicPath: process.env.UPLOAD_PUBLIC_PATH || '/uploads'
  },

  // AI Services
  ai: {
    apiKey: process.env.AI_SERVICE_API_KEY || 'illuminate-ai-service-2024',
    serviceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000'
  },

  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    sessionSecret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production'
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
    directory: process.env.LOG_DIRECTORY || 'logs',
    maxFileSize: process.env.LOG_MAX_FILE_SIZE || '20m',
    maxFiles: parseInt(process.env.LOG_MAX_FILES, 10) || 14,
    datePattern: process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD'
  }
};

/**
 * Validate required environment variables
 * @throws {Error} If required variables are missing
 */
const validateEnvironment = () => {
  const requiredVars = [
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    'JWT_SECRET'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Warn about development defaults
  if (config.nodeEnv === 'production') {
    const productionWarnings = [];

    if (config.jwt.secret.includes('change-in-production')) {
      productionWarnings.push('JWT_SECRET should be changed for production');
    }

    if (config.security.sessionSecret.includes('change-in-production')) {
      productionWarnings.push('SESSION_SECRET should be changed for production');
    }

    if (!config.openai.apiKey) {
      productionWarnings.push('OPENAI_API_KEY is not set');
    }

    if (productionWarnings.length > 0) {
      console.warn('Production warnings:', productionWarnings);
    }
  }
};

/**
 * Get database connection URL
 * @returns {string} PostgreSQL connection URL
 */
const getDatabaseUrl = () => {
  const { host, port, name, user, password } = config.database;
  return `postgresql://${user}:${password}@${host}:${port}/${name}`;
};

/**
 * Check if we're running in development mode
 * @returns {boolean}
 */
const isDevelopment = () => config.nodeEnv === 'development';

/**
 * Check if we're running in production mode
 * @returns {boolean}
 */
const isProduction = () => config.nodeEnv === 'production';

/**
 * Check if we're running in test mode
 * @returns {boolean}
 */
const isTest = () => config.nodeEnv === 'test';

module.exports = {
  config,
  validateEnvironment,
  getDatabaseUrl,
  isDevelopment,
  isProduction,
  isTest
};

