const express = require('express');
const router = express.Router();
const { authenticateToken, requireSameOrganization } = require('../middleware/authMiddleware');
const {
  getPeerOrganizations,
  getBenchmarkingMetrics,
  getPeerTargets,
  getESGComparison
} = require('../controllers/benchmarkingController');

/**
 * @swagger
 * components:
 *   schemas:
 *     PeerOrganization:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         industry:
 *           type: string
 *         country:
 *           type: string
 *         region:
 *           type: string
 *         sector:
 *           type: string
 *         revenue:
 *           type: number
 *         total_emissions:
 *           type: number
 *         carbon_intensity:
 *           type: number
 *         esg_score:
 *           type: number
 */

/**
 * @swagger
 * /api/benchmarking/peers:
 *   get:
 *     summary: Get peer organizations for benchmarking
 *     tags: [Benchmarking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *         description: Filter by industry (e.g., cement, hospitality)
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Filter by region
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for metrics data
 *     responses:
 *       200:
 *         description: List of peer organizations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     organizations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PeerOrganization'
 */
router.get('/peers', authenticateToken, getPeerOrganizations);

/**
 * @swagger
 * /api/benchmarking/metrics:
 *   get:
 *     summary: Get benchmarking metrics comparison
 *     tags: [Benchmarking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: metric
 *         required: true
 *         schema:
 *           type: string
 *           enum: [carbon_intensity, energy_intensity, total_emissions, esg_score]
 *         description: Metric to compare
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *         description: Filter by industry
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for comparison
 *     responses:
 *       200:
 *         description: Benchmarking metrics comparison
 *       400:
 *         description: Missing required metric parameter
 */
router.get('/metrics', authenticateToken, getBenchmarkingMetrics);

/**
 * @swagger
 * /api/benchmarking/targets:
 *   get:
 *     summary: Get peer organization targets
 *     tags: [Benchmarking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *         description: Filter by industry
 *       - in: query
 *         name: targetType
 *         schema:
 *           type: string
 *           enum: [absolute, intensity, percentage]
 *         description: Filter by target type
 *       - in: query
 *         name: metricType
 *         schema:
 *           type: string
 *         description: Filter by metric type
 *     responses:
 *       200:
 *         description: List of peer organization targets
 */
router.get('/targets', authenticateToken, getPeerTargets);

/**
 * @swagger
 * /api/benchmarking/esg:
 *   get:
 *     summary: Get ESG comparison data
 *     tags: [Benchmarking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *         description: Filter by industry
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for ESG data
 *     responses:
 *       200:
 *         description: ESG comparison data with industry averages
 */
router.get('/esg', authenticateToken, getESGComparison);

module.exports = router;
