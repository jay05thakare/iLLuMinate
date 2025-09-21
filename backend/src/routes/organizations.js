const express = require('express');
const Joi = require('joi');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const { authenticateToken, requireSameOrganization } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validationMiddleware');

/**
 * Organization Routes
 * Handles organization management operations
 */

/**
 * @route   GET /api/organizations/:id
 * @desc    Get organization details
 * @access  Private (Organization members only)
 */
router.get('/:id', 
  authenticateToken,
  validate(schemas.uuidParam),
  requireSameOrganization,
  organizationController.getOrganization
);

/**
 * @route   PUT /api/organizations/:id
 * @desc    Update organization details
 * @access  Private (Admin only)
 */
router.put('/:id', 
  authenticateToken,
  validate({
    params: schemas.uuidParam.params,
    body: schemas.updateOrganization.body
  }),
  requireSameOrganization,
  organizationController.updateOrganization
);

/**
 * @route   GET /api/organizations/:id/stats
 * @desc    Get organization statistics
 * @access  Private (Organization members only)
 */
router.get('/:id/stats', 
  authenticateToken,
  validate(schemas.uuidParam),
  requireSameOrganization,
  organizationController.getOrganizationStats
);

/**
 * @route   GET /api/organizations/:id/users
 * @desc    Get organization users
 * @access  Private (Organization members only)
 */
router.get('/:id/users', 
  authenticateToken,
  validate({
    params: schemas.uuidParam.params,
    query: schemas.pagination.query.keys({
      role: Joi.string().valid('admin', 'user').optional(),
      status: Joi.string().valid('active', 'inactive', 'pending').optional()
    })
  }),
  requireSameOrganization,
  organizationController.getOrganizationUsers
);

/**
 * @route   GET /api/organizations/:id/emissions/analytics
 * @desc    Get organization emission analytics
 * @access  Private (Organization members only)
 */
router.get('/:id/emissions/analytics',
  authenticateToken,
  validate({
    params: schemas.uuidParam.params,
    query: Joi.object({
      year: Joi.number().integer().min(2000).max(2100).default(new Date().getFullYear()),
      period: Joi.string().valid('monthly', 'quarterly', 'yearly').default('monthly')
    })
  }),
  requireSameOrganization,
  organizationController.getOrganizationEmissionAnalytics
);

/**
 * @route   GET /api/organizations/:id/dashboard
 * @desc    Get organization dashboard summary
 * @access  Private (Organization members only)
 */
router.get('/:id/dashboard',
  authenticateToken,
  validate({
    params: schemas.uuidParam.params,
    query: Joi.object({
      year: Joi.number().integer().min(2000).max(2100).default(new Date().getFullYear())
    })
  }),
  requireSameOrganization,
  organizationController.getOrganizationDashboard
);

/**
 * @route   GET /api/organizations/:id/facilities
 * @desc    Get organization facilities for AI service
 * @access  Private (Organization members only)
 */
router.get('/:id/facilities',
  authenticateToken,
  validate(schemas.uuidParam),
  requireSameOrganization,
  organizationController.getOrganizationFacilities
);

/**
 * @route   GET /api/organizations/:id/facilities/ai
 * @desc    Get organization facilities for AI service (with API key authentication)
 * @access  AI Service only (API key required)
 */
router.get('/:id/facilities/ai',
  validate(schemas.uuidParam),
  organizationController.getOrganizationFacilitiesForAI
);

module.exports = router;