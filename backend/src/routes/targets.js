const express = require('express');
const Joi = require('joi');
const router = express.Router();
const targetsController = require('../controllers/targetsController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

/**
 * Targets Routes
 * Handles sustainability targets and goals operations
 */

/**
 * @route   GET /api/targets
 * @desc    Get sustainability targets for current organization
 * @access  Private (Organization members only)
 */
router.get('/', 
  authenticateToken,
  validate({
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      status: Joi.string().valid('active', 'achieved', 'cancelled').optional(),
      facilityId: Joi.string().uuid().optional()
    })
  }),
  targetsController.getTargets
);

/**
 * @route   GET /api/targets/:id
 * @desc    Get target by ID
 * @access  Private (Organization members only)
 */
router.get('/:id', 
  authenticateToken,
  validate({
    params: Joi.object({
      id: Joi.string().uuid().required()
    })
  }),
  targetsController.getTarget
);

module.exports = router;
