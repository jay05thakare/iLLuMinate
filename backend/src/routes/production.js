/**
 * Production Data Routes
 * Handles production data API routes
 */

const express = require('express');
const router = express.Router();
const Joi = require('joi');

const productionController = require('../controllers/productionController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validate, validateWithBusinessLogic, schemas: validationSchemas } = require('../middleware/validationMiddleware');

// Production-specific validation schemas
const schemas = {
  createProductionData: {
    body: Joi.object({
      facilityId: Joi.string().uuid().required(),
      month: Joi.number().integer().min(1).max(12).required(),
      year: Joi.number().integer().min(2000).max(2100).required(),
      cementProduction: Joi.number().positive().required(),
      unit: Joi.string().default('tonnes')
    })
  },

  updateProductionData: {
    body: Joi.object({
      cementProduction: Joi.number().positive().optional(),
      unit: Joi.string().optional()
    }).min(1) // At least one field must be provided
  },

  getProductionData: {
    params: Joi.object({
      facilityId: Joi.string().uuid().required()
    }),
    query: Joi.object({
      year: Joi.number().integer().min(2000).max(2100).optional(),
      month: Joi.number().integer().min(1).max(12).optional()
    })
  },

  productionDataId: {
    params: Joi.object({
      id: Joi.string().uuid().required()
    })
  }
};

/**
 * @route   GET /api/production/data/:facilityId
 * @desc    Get production data for a facility
 * @access  Private (Organization members only)
 */
router.get('/data/:facilityId', 
  authenticateToken,
  validate(schemas.getProductionData),
  productionController.getProductionData
);

/**
 * @route   POST /api/production/data
 * @desc    Create production data entry
 * @access  Private (Organization members only)
 */
router.post('/data', 
  authenticateToken,
  validateWithBusinessLogic(schemas.createProductionData),
  productionController.createProductionData
);

/**
 * @route   PUT /api/production/data/:id
 * @desc    Update production data entry
 * @access  Private (Organization members only)
 */
router.put('/data/:id', 
  authenticateToken,
  validate(schemas.productionDataId),
  validate(schemas.updateProductionData),
  productionController.updateProductionData
);

/**
 * @route   DELETE /api/production/data/:id
 * @desc    Delete production data entry
 * @access  Private (Organization members only)
 */
router.delete('/data/:id', 
  authenticateToken,
  validate(schemas.productionDataId),
  productionController.deleteProductionData
);

/**
 * @route   GET /api/production/analytics/:facilityId
 * @desc    Get production analytics for a facility
 * @access  Private (Organization members only)
 */
router.get('/analytics/:facilityId', 
  authenticateToken,
  validate({
    params: Joi.object({
      facilityId: Joi.string().uuid().required()
    }),
    query: Joi.object({
      startYear: Joi.number().integer().min(2000).max(2100).optional(),
      endYear: Joi.number().integer().min(2000).max(2100).optional(),
      comparison: Joi.string().valid('year-over-year', 'month-over-month').default('year-over-year')
    })
  }),
  productionController.getProductionAnalytics
);

/**
 * @route   GET /api/production/summary/organization
 * @desc    Get organization-wide production summary
 * @access  Private (Organization members only)
 */
router.get('/summary/organization', 
  authenticateToken,
  validate({
    query: Joi.object({
      year: Joi.number().integer().min(2000).max(2100).optional(),
      groupBy: Joi.string().valid('facility', 'month').default('facility')
    })
  }),
  productionController.getOrganizationProductionSummary
);

/**
 * @route   GET /api/production/trends/:facilityId
 * @desc    Get production trends and forecasting
 * @access  Private (Organization members only)
 */
router.get('/trends/:facilityId', 
  authenticateToken,
  validate({
    params: Joi.object({
      facilityId: Joi.string().uuid().required()
    }),
    query: Joi.object({
      months: Joi.number().integer().min(1).max(60).default(12),
      includeForecasting: Joi.boolean().default(false)
    })
  }),
  productionController.getProductionTrends
);

module.exports = router;
