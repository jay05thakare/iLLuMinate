const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  getIndustryBenchmarkingData,
  getRevenueComparison,
  getTargetsComparison,
  getSourcesData
} = require('../controllers/industryBenchmarkingController');

/**
 * @swagger
 * components:
 *   schemas:
 *     IndustryBenchmarkingData:
 *       type: object
 *       properties:
 *         organization_name:
 *           type: string
 *         revenue:
 *           type: number
 *         revenue_unit:
 *           type: string
 *         annual_cement_production:
 *           type: number
 *         annual_cement_production_unit:
 *           type: string
 *         scope_1:
 *           type: number
 *         scope_1_unit:
 *           type: string
 *         scope_2:
 *           type: number
 *         scope_2_unit:
 *           type: string
 *         scope_3:
 *           type: number
 *         scope_3_unit:
 *           type: string
 *         water_consumption:
 *           type: number
 *         water_consumption_unit:
 *           type: string
 *         waste_generated:
 *           type: number
 *         waste_generated_unit:
 *           type: string
 *         country:
 *           type: string
 *         is_target:
 *           type: boolean
 *         is_verified:
 *           type: boolean
 *         targets:
 *           type: object
 *         initiatives:
 *           type: object
 *         sources:
 *           type: array
 */

/**
 * @swagger
 * /api/industry-benchmarking/data:
 *   get:
 *     summary: Get industry benchmarking data
 *     tags: [Industry Benchmarking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for benchmarking data (default: current year)
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country
 *       - in: query
 *         name: include_targets
 *         schema:
 *           type: boolean
 *         description: Include targets data (default: true)
 *     responses:
 *       200:
 *         description: Industry benchmarking data
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
 *                     companies:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/IndustryBenchmarkingData'
 *                     target_company:
 *                       type: string
 *                     total_companies:
 *                       type: integer
 */
router.get('/data', getIndustryBenchmarkingData);

/**
 * @swagger
 * /api/industry-benchmarking/revenue-comparison:
 *   get:
 *     summary: Get revenue comparison data for benchmarking
 *     tags: [Industry Benchmarking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for revenue data (default: current year)
 *     responses:
 *       200:
 *         description: Revenue comparison data
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
 *                     companies:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           revenue:
 *                             type: number
 *                           revenue_unit:
 *                             type: string
 *                           is_target:
 *                             type: boolean
 *                     target_company:
 *                       type: string
 */
router.get('/revenue-comparison', getRevenueComparison);

/**
 * @swagger
 * /api/industry-benchmarking/targets-comparison:
 *   get:
 *     summary: Get sustainability targets comparison data for benchmarking
 *     tags: [Industry Benchmarking]
 *     responses:
 *       200:
 *         description: Targets comparison data
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
 *                         type: object
 *                         properties:
 *                           organizationName:
 *                             type: string
 *                           isTargetCompany:
 *                             type: boolean
 *                           targets:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 name:
 *                                   type: string
 *                                 description:
 *                                   type: string
 *                                 targetType:
 *                                   type: string
 *                                 baselineValue:
 *                                   type: number
 *                                 targetValue:
 *                                   type: number
 *                                 baselineYear:
 *                                   type: integer
 *                                 targetYear:
 *                                   type: integer
 *                                 unit:
 *                                   type: string
 *                                 status:
 *                                   type: string
 */
router.get('/targets-comparison', getTargetsComparison);

/**
 * @swagger
 * /api/industry-benchmarking/sources:
 *   get:
 *     summary: Get sources data for benchmarking information
 *     tags: [Industry Benchmarking]
 *     responses:
 *       200:
 *         description: Sources data
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
 *                         type: object
 *                         properties:
 *                           organizationName:
 *                             type: string
 *                           isTargetCompany:
 *                             type: boolean
 *                           sources:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 title:
 *                                   type: string
 *                                 referenceLink:
 *                                   type: string
 *                                 type:
 *                                   type: string
 *                                 year:
 *                                   type: integer
 */
router.get('/sources', getSourcesData);

module.exports = router;
