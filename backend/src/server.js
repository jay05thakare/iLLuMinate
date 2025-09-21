const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { config } = require('./config/environment');
const { logger } = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { connectDatabase } = require('./config/database');

// Import route modules
const authRoutes = require('./routes/auth');
const organizationRoutes = require('./routes/organizations');
const userRoutes = require('./routes/users');
const facilityRoutes = require('./routes/facilities');
const emissionRoutes = require('./routes/emissions');
const productionRoutes = require('./routes/production');
const aggregationRoutes = require('./routes/aggregation');
const analyticsRoutes = require('./routes/analytics');
const targetsRoutes = require('./routes/targets');
const benchmarkingRoutes = require('./routes/benchmarking');
const industryBenchmarkingRoutes = require('./routes/industryBenchmarking');
const chatRoutes = require('./routes/chat');
const healthRoutes = require('./routes/health');

/**
 * Create and configure Express application
 * @returns {Express} Configured Express app
 */
const createApp = () => {
  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"]
      }
    }
  }));

  // CORS configuration
  app.use(cors({
    origin: config.corsOrigin.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

  // Rate limiting - temporarily disabled for development
  if (config.nodeEnv === 'production') {
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    app.use('/api', limiter);
  }

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging middleware
  if (config.nodeEnv !== 'test') {
    app.use(morgan('combined', {
      stream: {
        write: (message) => logger.info(message.trim())
      }
    }));
  }

  // Health check route (before authentication)
  app.use('/health', healthRoutes);

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/organizations', organizationRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/facilities', facilityRoutes);
  app.use('/api/emissions', emissionRoutes);
  app.use('/api/production', productionRoutes);
  app.use('/api/aggregation', aggregationRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/targets', targetsRoutes);
  app.use('/api/benchmarking', benchmarkingRoutes);
  app.use('/api/industry-benchmarking', industryBenchmarkingRoutes);
  app.use('/api/chat', chatRoutes);

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'iLLuMinate API Server',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
      documentation: '/api/docs'
    });
  });

  // Error handling middleware (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Connect to database for Phase 3
    await connectDatabase();
    logger.info('Database connection established');

    // Create app
    const app = createApp();

    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`🚀 iLLuMinate API Server running on port ${config.port}`);
      logger.info(`📊 Environment: ${config.nodeEnv}`);
      logger.info(`🌐 CORS Origin: ${config.corsOrigin}`);
      
      if (config.nodeEnv === 'development') {
        logger.info(`🔗 Health Check: http://localhost:${config.port}/health`);
        logger.info(`🔗 API Docs: http://localhost:${config.port}/api/docs`);
      }
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      logger.info(`Received ${signal}. Graceful shutdown...`);
      server.close((err) => {
        if (err) {
          logger.error('Error during server shutdown:', err);
          process.exit(1);
        }
        logger.info('Server closed successfully');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return app;

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { createApp, startServer };
