const express = require('express');
const Joi = require('joi');
const router = express.Router();
const facilityController = require('../controllers/facilityController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validationMiddleware');

/**
 * Facility Routes
 * Handles facility management operations
 */

/**
 * @route   GET /api/facilities
 * @desc    Get facilities for current organization
 * @access  Private (Organization members only)
 */
router.get('/', 
  authenticateToken,
  validate({
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      status: Joi.string().valid('active', 'inactive').optional(),
      search: Joi.string().min(2).max(100).optional()
    })
  }),
  facilityController.getFacilities
);

/**
 * @route   GET /api/facilities/templates/resources
 * @desc    Get facility resource configuration templates
 * @access  Private (Organization members only)
 */
router.get('/templates/resources', 
  authenticateToken,
  validate({
    query: Joi.object({
      facilityType: Joi.string().valid('cement_plant', 'office_building').default('cement_plant')
    })
  }),
  facilityController.getResourceTemplates
);

/**
 * @route   GET /api/facilities/:id
 * @desc    Get facility by ID
 * @access  Private (Organization members only)
 */
router.get('/:id', 
  authenticateToken,
  validate(schemas.uuidParam),
  facilityController.getFacilityById
);

/**
 * @route   POST /api/facilities
 * @desc    Create new facility
 * @access  Private (Admin only)
 */
router.post('/', 
  authenticateToken,
  requireAdmin,
  validate(schemas.createFacility),
  facilityController.createFacility
);

/**
 * @route   PUT /api/facilities/:id
 * @desc    Update facility
 * @access  Private (Admin only)
 */
router.put('/:id', 
  authenticateToken,
  requireAdmin,
  validate({
    params: schemas.uuidParam.params,
    body: schemas.updateFacility.body
  }),
  facilityController.updateFacility
);

/**
 * @route   DELETE /api/facilities/:id
 * @desc    Delete facility
 * @access  Private (Admin only)
 */
router.delete('/:id', 
  authenticateToken,
  requireAdmin,
  validate(schemas.uuidParam),
  facilityController.deleteFacility
);

/**
 * @route   GET /api/facilities/:id/resources
 * @desc    Get facility resources configuration
 * @access  Private (Organization members only)
 */
router.get('/:id/resources', 
  authenticateToken,
  validate(schemas.uuidParam),
  facilityController.getFacilityResources
);

/**
 * @route   GET /api/facilities/:id/resources/ai
 * @desc    Get facility resources for AI service (API key authentication)
 * @access  Private (AI service only)
 */
router.get('/:id/resources/ai',
  require('../middleware/authMiddleware').authenticateApiKey,
  validate(schemas.uuidParam),
  facilityController.getFacilityResourcesForAI
);

/**
 * @route   POST /api/facilities/:id/resources/bulk
 * @desc    Bulk configure facility resources
 * @access  Private (Admin only)
 */
router.post('/:id/resources/bulk', 
  authenticateToken,
  requireAdmin,
  validate({
    params: Joi.object({
      id: Joi.string().uuid().required()
    }),
    body: Joi.object({
      resources: Joi.array().items(
        Joi.object({
          resourceId: Joi.string().uuid().required(),
          emissionFactorId: Joi.string().uuid().required()
        })
      ).min(1).required()
    })
  }),
  facilityController.bulkConfigureFacilityResources
);

/**
 * @route   PUT /api/facilities/:id/resources/:resourceId
 * @desc    Update facility resource configuration
 * @access  Private (Admin only)
 */
router.put('/:id/resources/:resourceId', 
  authenticateToken,
  requireAdmin,
  validate({
    params: Joi.object({
      id: Joi.string().uuid().required(),
      resourceId: Joi.string().uuid().required()
    }),
    body: Joi.object({
      emissionFactorId: Joi.string().uuid().optional(),
      isActive: Joi.boolean().optional()
    }).min(1) // At least one field must be provided
  }),
  facilityController.updateFacilityResource
);

/**
 * @route   DELETE /api/facilities/:id/resources/:resourceId
 * @desc    Remove facility resource configuration
 * @access  Private (Admin only)
 */
router.delete('/:id/resources/:resourceId', 
  authenticateToken,
  requireAdmin,
  validate({
    params: Joi.object({
      id: Joi.string().uuid().required(),
      resourceId: Joi.string().uuid().required()
    })
  }),
  facilityController.removeFacilityResource
);

/**
 * @route   POST /api/facilities/:id/resources/copy
 * @desc    Copy resource configuration from another facility
 * @access  Private (Admin only)
 */
router.post('/:id/resources/copy', 
  authenticateToken,
  requireAdmin,
  validate({
    params: Joi.object({
      id: Joi.string().uuid().required()
    }),
    body: Joi.object({
      sourceFacilityId: Joi.string().uuid().required()
    })
  }),
  facilityController.copyFacilityResources
);

/**
 * @route   POST /api/facilities/:id/templates/apply
 * @desc    Apply resource template to facility
 * @access  Private (Admin only)
 */
router.post('/:id/templates/apply', 
  authenticateToken,
  requireAdmin,
  validate({
    params: Joi.object({
      id: Joi.string().uuid().required()
    }),
    body: Joi.object({
      templateType: Joi.string().valid('cement_plant', 'office_building').default('cement_plant'),
      overwriteExisting: Joi.boolean().default(false)
    })
  }),
  facilityController.applyResourceTemplate
);

module.exports = router;