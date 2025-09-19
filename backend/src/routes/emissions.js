const express = require('express');
const { successResponse } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * Emission routes placeholder
 * These will be implemented in later phases
 */

/**
 * Get emissions data
 * GET /api/emissions
 */
router.get('/', (req, res) => {
  res.json(successResponse(
    { message: 'Emissions data endpoint - Coming in Phase 2' },
    'Endpoint placeholder'
  ));
});

/**
 * Create emission entry
 * POST /api/emissions
 */
router.post('/', (req, res) => {
  res.json(successResponse(
    { message: 'Create emission entry endpoint - Coming in Phase 2' },
    'Endpoint placeholder'
  ));
});

module.exports = router;

