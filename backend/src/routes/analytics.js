/**
 * Advanced Analytics Routes
 * Monthly/yearly data analysis and time-series analytics
 */

const express = require('express');
const Joi = require('joi');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

/**
 * Validation schemas for analytics endpoints
 */
const schemas = {
  organizationTimeSeries: {
    params: Joi.object({
      id: Joi.string().uuid().required()
    }),
    query: Joi.object({
      startYear: Joi.number().integer().min(2000).max(2100).default(new Date().getFullYear() - 2),
      endYear: Joi.number().integer().min(2000).max(2100).default(new Date().getFullYear()),
      granularity: Joi.string().valid('monthly', 'quarterly', 'yearly').default('monthly'),
      metrics: Joi.string().valid('all', 'emissions', 'production', 'intensity').default('all'),
      includeForecast: Joi.boolean().default(false),
      forecastPeriods: Joi.number().integer().min(1).max(24).default(6)
    })
  },

  facilityTimeSeries: {
    params: Joi.object({
      id: Joi.string().uuid().required()
    }),
    query: Joi.object({
      startYear: Joi.number().integer().min(2000).max(2100).default(new Date().getFullYear() - 2),
      endYear: Joi.number().integer().min(2000).max(2100).default(new Date().getFullYear()),
      analysisType: Joi.string().valid('comprehensive', 'performance', 'trends', 'efficiency').default('comprehensive'),
      includeBenchmarking: Joi.boolean().default(false),
      compareToOrganization: Joi.boolean().default(false)
    })
  },

  advancedTrendAnalysis: {
    params: Joi.object({
      organizationId: Joi.string().uuid().required()
    }),
    query: Joi.object({
      metric: Joi.string().valid('emissions', 'production', 'intensity', 'energy').default('emissions'),
      period: Joi.string().valid('monthly', 'quarterly', 'yearly').default('monthly'),
      forecastMethod: Joi.string().valid('linear_regression', 'exponential_smoothing', 'arima').default('linear_regression'),
      forecastHorizon: Joi.number().integer().min(1).max(36).default(12),
      confidenceLevel: Joi.number().integer().min(80).max(99).default(95),
      includeSeasonality: Joi.boolean().default(true)
    })
  },

  comparativeAnalysis: {
    params: Joi.object({
      organizationId: Joi.string().uuid().required()
    }),
    query: Joi.object({
      compareWith: Joi.string().valid('industry', 'facilities', 'targets', 'benchmarks').default('industry'),
      facilityIds: Joi.string().pattern(/^[0-9a-fA-F-]+(?:,[0-9a-fA-F-]+)*$/).optional(),
      timeRange: Joi.string().valid('12months', '24months', '36months', '5years').default('12months'),
      metrics: Joi.string().pattern(/^[a-z,]+$/).default('emissions,production,intensity')
    })
  },

  // Custom validation for ensuring endYear >= startYear
  yearRangeValidation: {
    custom: (value, helpers) => {
      const { startYear, endYear } = helpers.state.ancestors[0];
      if (endYear < startYear) {
        return helpers.error('any.invalid', { message: 'End year must be greater than or equal to start year' });
      }
      return value;
    }
  }
};

/**
 * @route   GET /api/analytics/organization/:id/timeseries
 * @desc    Get comprehensive time-series analytics for organization
 * @access  Private (Organization members only)
 */
router.get('/organization/:id/timeseries',
  authenticateToken,
  validate(schemas.organizationTimeSeries),
  analyticsController.getOrganizationTimeSeries
);

/**
 * @route   GET /api/analytics/facility/:id/timeseries
 * @desc    Get facility-level time-series analytics
 * @access  Private (Organization members only)
 */
router.get('/facility/:id/timeseries',
  authenticateToken,
  validate(schemas.facilityTimeSeries),
  analyticsController.getFacilityTimeSeries
);

/**
 * @route   GET /api/analytics/trends/:organizationId
 * @desc    Get advanced trend analysis and forecasting
 * @access  Private (Organization members only)
 */
router.get('/trends/:organizationId',
  authenticateToken,
  validate(schemas.advancedTrendAnalysis),
  analyticsController.getAdvancedTrendAnalysis
);

/**
 * @route   GET /api/analytics/comparative/:organizationId
 * @desc    Get comparative time-series analysis
 * @access  Private (Organization members only)
 */
router.get('/comparative/:organizationId',
  authenticateToken,
  validate(schemas.comparativeAnalysis),
  analyticsController.getComparativeAnalysis
);

module.exports = router;
