const express = require('express');
const Joi = require('joi');
const router = express.Router();
const emissionController = require('../controllers/emissionController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const { validate, validateWithBusinessLogic, schemas } = require('../middleware/validationMiddleware');

/**
 * Emission Routes
 * Handles emission resources, factors, and data operations
 */

/**
 * @route   GET /api/emissions/resources
 * @desc    Get emission resources
 * @access  Private (Organization members only)
 */
router.get('/resources', 
  authenticateToken,
  validate({
    query: Joi.object({
      scope: Joi.string().valid('scope1', 'scope2').optional(),
      category: Joi.string().optional(),
      type: Joi.string().optional(),
      search: Joi.string().min(2).max(100).optional(),
    })
  }),
  emissionController.getEmissionResources
);

/**
 * @route   GET /api/emissions/libraries
 * @desc    Get emission factor libraries
 * @access  Private (Organization members only)
 */
router.get('/libraries', 
  authenticateToken,
  validate({
    query: Joi.object({
      year: Joi.number().integer().min(2000).max(2100).optional(),
      region: Joi.string().optional(),
      isActive: Joi.string().valid('true', 'false').optional()
    })
  }),
  emissionController.getEmissionLibraries
);

/**
 * @route   GET /api/emissions/factors
 * @desc    Get emission factors
 * @access  Private (Organization members only)
 */
router.get('/factors', 
  authenticateToken,
  validate({
    query: Joi.object({
      resourceId: Joi.string().uuid().optional(),
      libraryId: Joi.string().uuid().optional(),
      scope: Joi.string().valid('scope1', 'scope2').optional(),
      category: Joi.string().optional()
    })
  }),
  emissionController.getEmissionFactors
);

/**
 * @route   GET /api/emissions/resources/:resourceId/factors
 * @desc    Get emission factors for a specific resource
 * @access  Private (Organization members only)
 */
router.get('/resources/:resourceId/factors', 
  authenticateToken,
  validate({
    params: Joi.object({
      resourceId: Joi.string().uuid().required()
    })
  }),
  emissionController.getResourceFactors
);

/**
 * @route   POST /api/emissions/factors/filtered
 * @desc    Get filtered emission factors based on cost, emission, and energy thresholds
 * @access  Private (Organization members only)
 */
router.post('/factors/filtered', 
  authenticateToken,
  validate({
    query: Joi.object({
      category: Joi.string().valid(
        'Stationary Combustion',
        'Fugitive Emissions', 
        'Mobile Combustion',
        'Purchased Electricity',
        'stationary_combustion'
      ).default('Stationary Combustion') // Default to Stationary Combustion
    }),
    body: Joi.object({
      facilityId: Joi.string().uuid().optional(),
      costLimit: Joi.number().min(0).optional(),
      emissionLimit: Joi.number().min(0).optional(),
      energyMinimum: Joi.number().min(0).optional()
    }).min(1) // At least one filter must be provided
  }),
  emissionController.getFilteredFactors
);

/**
 * @route   GET /api/emissions/categories
 * @desc    Get available resource categories
 * @access  Private (Organization members only)
 */
router.get('/categories', 
  authenticateToken,
  emissionController.getResourceCategories
);

/**
 * @route   GET /api/emissions/data/:facilityId
 * @desc    Get emission data for a facility
 * @access  Private (Organization members only)
 */
router.get('/data/:facilityId', 
  authenticateToken,
  validate({
    params: Joi.object({
      facilityId: Joi.string().uuid().required()
    }),
    query: Joi.object({
      year: Joi.number().integer().min(2000).max(2100).optional(),
      month: Joi.number().integer().min(1).max(12).optional(),
      scope: Joi.string().valid('scope1', 'scope2').optional()
    })
  }),
  emissionController.getEmissionData
);

/**
 * @route   POST /api/emissions/data
 * @desc    Create emission data entry
 * @access  Private (Organization members only)
 */
router.post('/data', 
  authenticateToken,
  validateWithBusinessLogic(schemas.createEmissionData),
  emissionController.createEmissionData
);

/**
 * @route   GET /api/emissions/data/entry/:id
 * @desc    Get single emission data entry by ID
 * @access  Private (Organization members only)
 */
router.get('/data/entry/:id', 
  authenticateToken,
  validate({
    params: Joi.object({
      id: Joi.string().uuid().required()
    })
  }),
  emissionController.getEmissionDataById
);

/**
 * @route   PUT /api/emissions/data/:id
 * @desc    Update emission data entry
 * @access  Private (Organization members only)
 */
router.put('/data/:id', 
  authenticateToken,
  validate({
    params: Joi.object({
      id: Joi.string().uuid().required()
    }),
    body: Joi.object({
      consumption: Joi.number().positive().optional(),
      consumptionUnit: Joi.string().optional()
    }).min(1) // At least one field must be provided
  }),
  emissionController.updateEmissionData
);

/**
 * @route   DELETE /api/emissions/data/:id
 * @desc    Delete emission data entry
 * @access  Private (Organization members only)
 */
router.delete('/data/:id', 
  authenticateToken,
  validate({
    params: Joi.object({
      id: Joi.string().uuid().required()
    })
  }),
  emissionController.deleteEmissionData
);

/**
 * @route   POST /api/emissions/facilities/:facilityId/resources
 * @desc    Configure facility resource
 * @access  Private (Admin only)
 */
router.post('/facilities/:facilityId/resources', 
  authenticateToken,
  requireAdmin,
  validate({
    params: Joi.object({
      facilityId: Joi.string().uuid().required()
    }),
    body: Joi.object({
      resourceId: Joi.string().uuid().required(),
      emissionFactorId: Joi.string().uuid().required()
    })
  }),
  emissionController.configureFacilityResource
);

/**
 * @route   GET /api/emissions/configurations/organization
 * @desc    Get organization emission resource configurations
 * @access  Private (Organization members only)
 */
router.get('/configurations/organization',
  authenticateToken,
  emissionController.getOrganizationResourceConfigurations
);

/**
 * @route   POST /api/emissions/configurations/organization
 * @desc    Configure organization emission resource
 * @access  Private (Admin only)
 */
router.post('/configurations/organization',
  authenticateToken,
  requireAdmin,
  validate({
    body: Joi.object({
      resourceId: Joi.string().uuid().required(),
      emissionFactorId: Joi.string().uuid().required()
    })
  }),
  emissionController.configureOrganizationResource
);

/**
 * @route   GET /api/emissions/configurations/facility/:facilityId
 * @desc    Get facility emission resource assignments
 * @access  Private (Organization members only)
 */
router.get('/configurations/facility/:facilityId',
  authenticateToken,
  validate({
    params: Joi.object({
      facilityId: Joi.string().uuid().required()
    })
  }),
  emissionController.getFacilityResourceAssignments
);

/**
 * @route   POST /api/emissions/configurations/facility/:facilityId/assign
 * @desc    Assign organization resource to facility
 * @access  Private (Admin only)
 */
router.post('/configurations/facility/:facilityId/assign',
  authenticateToken,
  requireAdmin,
  validate({
    params: Joi.object({
      facilityId: Joi.string().uuid().required()
    }),
    body: Joi.object({
      configurationId: Joi.string().uuid().required()
    })
  }),
  emissionController.assignResourceToFacility
);

module.exports = router;