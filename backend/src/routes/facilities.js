const express = require('express');
const { successResponse } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * Facility routes placeholder
 * These will be implemented in later phases
 */

/**
 * Get facilities
 * GET /api/facilities
 */
router.get('/', (req, res) => {
  res.json(successResponse(
    { message: 'Facilities list endpoint - Coming in Phase 2' },
    'Endpoint placeholder'
  ));
});

/**
 * Create facility
 * POST /api/facilities
 */
router.post('/', (req, res) => {
  res.json(successResponse(
    { message: 'Create facility endpoint - Coming in Phase 2' },
    'Endpoint placeholder'
  ));
});

module.exports = router;

