const express = require('express');
const { healthCheck } = require('../config/database');
const { successResponse } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

const router = express.Router();

/**
 * Health check endpoint
 * GET /health
 */
router.get('/', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Database health check for Phase 3
    const dbHealth = await healthCheck();
    
    // Check basic system metrics
    const systemHealth = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid
    };

    const responseTime = Date.now() - startTime;

    const healthStatus = {
      status: dbHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbHealth,
        system: systemHealth
      }
    };

    // Set appropriate status code
    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;

    res.status(statusCode).json(successResponse(healthStatus, 'Health check completed'));

  } catch (error) {
    logger.error('Health check failed:', error);
    
    res.status(503).json({
      success: false,
      error: {
        message: 'Health check failed',
        code: 'HEALTH_CHECK_ERROR',
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * Readiness check endpoint
 * GET /health/ready
 */
router.get('/ready', async (req, res) => {
  try {
    // Database readiness check for Phase 3
    const dbHealth = await healthCheck();
    
    const isReady = dbHealth.status === 'healthy' || dbHealth.status === 'skipped';
    
    if (isReady) {
      res.json(successResponse({ ready: true }, 'Service is ready'));
    } else {
      res.status(503).json({
        success: false,
        error: {
          message: 'Service not ready',
          code: 'SERVICE_NOT_READY',
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    logger.error('Readiness check failed:', error);
    
    res.status(503).json({
      success: false,
      error: {
        message: 'Readiness check failed',
        code: 'READINESS_CHECK_ERROR',
        timestamp: new Date().toISOString()
      }
    });
  }
});

/**
 * Liveness check endpoint
 * GET /health/live
 */
router.get('/live', (req, res) => {
  // Simple liveness check - if we can respond, we're alive
  res.json(successResponse({ alive: true }, 'Service is alive'));
});

module.exports = router;
