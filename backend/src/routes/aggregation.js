/**
 * Aggregation Routes
 * Advanced data aggregation and calculation services
 */

const express = require('express');
const Joi = require('joi');
const router = express.Router();
const aggregationController = require('../controllers/aggregationController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

/**
 * Validation schemas for aggregation endpoints
 */
const schemas = {
  organizationMetrics: {
    params: Joi.object({
      id: Joi.string().uuid().required()
    }),
    query: Joi.object({
      year: Joi.number().integer().min(2000).max(2100).default(new Date().getFullYear()),
      period: Joi.string().valid('monthly', 'quarterly', 'yearly').default('yearly'),
      includeProjections: Joi.boolean().default(false)
    })
  },

  facilityMetrics: {
    params: Joi.object({
      id: Joi.string().uuid().required()
    }),
    query: Joi.object({
      year: Joi.number().integer().min(2000).max(2100).default(new Date().getFullYear()),
      months: Joi.number().integer().min(1).max(60).default(12),
      includeResourceBreakdown: Joi.boolean().default(false)
    })
  },

  facilityComparison: {
    query: Joi.object({
      facilityIds: Joi.alternatives().try(
        Joi.array().items(Joi.string().uuid()).min(2).max(10),
        Joi.string().pattern(/^[0-9a-fA-F-]+(?:,[0-9a-fA-F-]+)*$/) // CSV of UUIDs
      ).required(),
      year: Joi.number().integer().min(2000).max(2100).default(new Date().getFullYear()),
      metrics: Joi.string().valid('intensity', 'absolute', 'efficiency').default('intensity')
    })
  }
};

/**
 * @route   GET /api/aggregation/organization/:id/metrics
 * @desc    Get comprehensive organization-wide sustainability metrics
 * @access  Private (Organization members only)
 */
router.get('/organization/:id/metrics',
  authenticateToken,
  validate(schemas.organizationMetrics),
  aggregationController.getOrganizationMetrics
);

/**
 * @route   GET /api/aggregation/facility/:id/metrics
 * @desc    Get detailed facility-level aggregated metrics
 * @access  Private (Organization members only)
 */
router.get('/facility/:id/metrics',
  authenticateToken,
  validate(schemas.facilityMetrics),
  aggregationController.getFacilityMetrics
);

/**
 * @route   GET /api/aggregation/comparison/facilities
 * @desc    Get comparative analysis between multiple facilities
 * @access  Private (Organization members only)
 */
router.get('/comparison/facilities',
  authenticateToken,
  validate(schemas.facilityComparison),
  aggregationController.getFacilityComparison
);

module.exports = router;
