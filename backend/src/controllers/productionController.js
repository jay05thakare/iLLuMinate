/**
 * Production Data Controller
 * Handles production data management operations
 */

const { query } = require('../config/database');
const { logger } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * Get production data for a facility
 * GET /api/production/data/:facilityId
 */
const getProductionData = async (req, res) => {
  try {
    const { facilityId } = req.params;
    const { organizationId } = req.user;
    const { year, month } = req.query;

    // Check if facility belongs to user's organization
    const facilityCheck = await query(`
      SELECT id FROM facilities 
      WHERE id = $1 AND organization_id = $2
    `, [facilityId, organizationId]);

    if (facilityCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }

    // Build WHERE clause for filters
    let whereConditions = ['pd.facility_id = $1', 'pd.organization_id = $2'];
    let params = [facilityId, organizationId];
    let paramIndex = 3;

    if (year) {
      whereConditions.push(`pd.year = $${paramIndex}`);
      params.push(parseInt(year));
      paramIndex++;
    }

    if (month) {
      whereConditions.push(`pd.month = $${paramIndex}`);
      params.push(parseInt(month));
      paramIndex++;
    }

    const productionDataResult = await query(`
      SELECT 
        pd.id,
        pd.month,
        pd.year,
        pd.cement_production,
        pd.unit,
        pd.created_at,
        pd.updated_at
      FROM production_data pd
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY pd.year DESC, pd.month DESC
    `, params);

    // Calculate aggregated statistics
    const totalProduction = productionDataResult.rows.reduce((sum, row) => 
      sum + (parseFloat(row.cement_production) || 0), 0
    );

    const avgProduction = productionDataResult.rows.length > 0 ? 
      totalProduction / productionDataResult.rows.length : 0;

    const monthlyTrend = productionDataResult.rows
      .sort((a, b) => (a.year * 12 + a.month) - (b.year * 12 + b.month))
      .map(row => ({
        period: `${row.year}-${row.month.toString().padStart(2, '0')}`,
        production: parseFloat(row.cement_production) || 0,
        unit: row.unit
      }));

    logger.info(`Retrieved ${productionDataResult.rows.length} production records for facility ${facilityId}`);

    res.json({
      success: true,
      data: {
        production_records: productionDataResult.rows,
        summary: {
          total_records: productionDataResult.rows.length,
          total_production: totalProduction,
          average_production: avgProduction,
          latest_period: productionDataResult.rows[0] ? 
            `${productionDataResult.rows[0].year}-${productionDataResult.rows[0].month}` : null
        },
        trends: {
          monthly: monthlyTrend
        }
      }
    });

  } catch (error) {
    logger.error('Get production data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Create production data entry
 * POST /api/production/data
 */
const createProductionData = async (req, res) => {
  try {
    const { 
      facilityId, 
      month, 
      year, 
      cementProduction, 
      unit = 'tonnes'
    } = req.body;
    const { organizationId } = req.user;

    // Check if facility belongs to user's organization
    const facilityCheck = await query(`
      SELECT id FROM facilities 
      WHERE id = $1 AND organization_id = $2
    `, [facilityId, organizationId]);

    if (facilityCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }

    // Check if data already exists for this month/year
    const existingDataResult = await query(`
      SELECT id FROM production_data 
      WHERE facility_id = $1 AND month = $2 AND year = $3
    `, [facilityId, month, year]);

    if (existingDataResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Production data already exists for this period'
      });
    }

    // Create production data entry
    const id = uuidv4();
    const productionDataResult = await query(`
      INSERT INTO production_data (
        id, organization_id, facility_id, month, year, 
        cement_production, unit
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      id, organizationId, facilityId, month, year,
      cementProduction, unit
    ]);

    const newRecord = productionDataResult.rows[0];

    // Log any validation warnings
    if (req.validationWarnings && req.validationWarnings.length > 0) {
      logger.warn(`Production data created with validation warnings for facility ${facilityId}, period ${year}-${month}`, {
        productionDataId: id,
        warnings: req.validationWarnings
      });
    }

    logger.info(`Created production data entry for facility ${facilityId}, period ${year}-${month}`, {
      productionDataId: id,
      cementProduction,
      unit
    });

    res.status(201).json({
      success: true,
      message: 'Production data created successfully',
      data: newRecord,
      warnings: req.validationWarnings || []
    });

  } catch (error) {
    logger.error('Create production data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update production data entry
 * PUT /api/production/data/:id
 */
const updateProductionData = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      cementProduction, 
      unit
    } = req.body;
    const { organizationId } = req.user;

    // Check if production data exists and belongs to user's organization
    const existingDataResult = await query(`
      SELECT pd.*, f.organization_id 
      FROM production_data pd
      JOIN facilities f ON pd.facility_id = f.id
      WHERE pd.id = $1 AND f.organization_id = $2
    `, [id, organizationId]);

    if (existingDataResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Production data not found'
      });
    }

    // Update production data
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (cementProduction !== undefined) {
      updateFields.push(`cement_production = $${paramIndex}`);
      updateValues.push(cementProduction);
      paramIndex++;
    }

    if (unit !== undefined) {
      updateFields.push(`unit = $${paramIndex}`);
      updateValues.push(unit);
      paramIndex++;
    }

    updateFields.push(`updated_at = $${paramIndex}`);
    updateValues.push(new Date());
    paramIndex++;

    updateValues.push(id);

    const updateResult = await query(`
      UPDATE production_data 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, updateValues);

    const updatedRecord = updateResult.rows[0];

    logger.info(`Updated production data entry ${id}`, {
      facilityId: updatedRecord.facility_id,
      period: `${updatedRecord.year}-${updatedRecord.month}`
    });

    res.json({
      success: true,
      message: 'Production data updated successfully',
      data: updatedRecord
    });

  } catch (error) {
    logger.error('Update production data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete production data entry
 * DELETE /api/production/data/:id
 */
const deleteProductionData = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    // Check if production data exists and belongs to user's organization
    const existingDataResult = await query(`
      SELECT pd.*, f.organization_id 
      FROM production_data pd
      JOIN facilities f ON pd.facility_id = f.id
      WHERE pd.id = $1 AND f.organization_id = $2
    `, [id, organizationId]);

    if (existingDataResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Production data not found'
      });
    }

    const productionData = existingDataResult.rows[0];

    // Delete production data
    await query(`
      DELETE FROM production_data WHERE id = $1
    `, [id]);

    logger.info(`Deleted production data entry ${id}`, {
      facilityId: productionData.facility_id,
      period: `${productionData.year}-${productionData.month}`
    });

    res.json({
      success: true,
      message: 'Production data deleted successfully'
    });

  } catch (error) {
    logger.error('Delete production data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get production analytics for a facility
 * GET /api/production/analytics/:facilityId
 */
const getProductionAnalytics = async (req, res) => {
  try {
    const { facilityId } = req.params;
    const { organizationId } = req.user;
    const { 
      startYear = new Date().getFullYear() - 1,
      endYear = new Date().getFullYear(),
      comparison = 'year-over-year'
    } = req.query;

    // Check if facility belongs to user's organization
    const facilityCheck = await query(`
      SELECT id, name FROM facilities 
      WHERE id = $1 AND organization_id = $2
    `, [facilityId, organizationId]);

    if (facilityCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }

    const facility = facilityCheck.rows[0];

    // Get production data for the specified period
    const productionDataResult = await query(`
      SELECT 
        pd.year,
        pd.month,
        pd.cement_production,
        pd.unit,
        pd.created_at
      FROM production_data pd
      WHERE pd.facility_id = $1 
        AND pd.organization_id = $2
        AND pd.year BETWEEN $3 AND $4
      ORDER BY pd.year, pd.month
    `, [facilityId, organizationId, parseInt(startYear), parseInt(endYear)]);

    const productionData = productionDataResult.rows;

    // Calculate analytics
    const analytics = {
      facility: {
        id: facility.id,
        name: facility.name
      },
      period: {
        startYear: parseInt(startYear),
        endYear: parseInt(endYear),
        totalMonths: productionData.length
      },
      summary: {
        totalProduction: 0,
        averageMonthlyProduction: 0,
        peakProduction: 0,
        lowProduction: 0,
        dataCompleteness: 0
      },
      trends: {
        monthly: [],
        yearly: [],
        quarterlyGrowth: [],
        seasonalPatterns: {}
      },
      capacity: {
        utilizationRate: 0,
        targetCapacity: 0, // This would come from facility configuration
        efficiency: 0
      },
      comparisons: {}
    };

    if (productionData.length > 0) {
      // Summary calculations
      const productions = productionData.map(d => parseFloat(d.cement_production) || 0);
      analytics.summary.totalProduction = productions.reduce((sum, val) => sum + val, 0);
      analytics.summary.averageMonthlyProduction = analytics.summary.totalProduction / productions.length;
      analytics.summary.peakProduction = Math.max(...productions);
      analytics.summary.lowProduction = Math.min(...productions);

      // Data completeness (months with data vs expected months)
      const expectedMonths = ((parseInt(endYear) - parseInt(startYear)) + 1) * 12;
      analytics.summary.dataCompleteness = (productionData.length / expectedMonths) * 100;

      // Monthly trends
      analytics.trends.monthly = productionData.map(d => ({
        year: d.year,
        month: d.month,
        production: parseFloat(d.cement_production),
        unit: d.unit,
        period: `${d.year}-${d.month.toString().padStart(2, '0')}`
      }));

      // Yearly aggregation
      const yearlyData = {};
      productionData.forEach(d => {
        const year = d.year;
        if (!yearlyData[year]) {
          yearlyData[year] = { totalProduction: 0, monthCount: 0 };
        }
        yearlyData[year].totalProduction += parseFloat(d.cement_production) || 0;
        yearlyData[year].monthCount += 1;
      });

      analytics.trends.yearly = Object.entries(yearlyData).map(([year, data]) => ({
        year: parseInt(year),
        totalProduction: data.totalProduction,
        averageMonthlyProduction: data.totalProduction / data.monthCount,
        monthsWithData: data.monthCount
      }));

      // Quarterly growth calculation
      const quarters = {};
      productionData.forEach(d => {
        const quarter = Math.ceil(d.month / 3);
        const key = `${d.year}-Q${quarter}`;
        if (!quarters[key]) {
          quarters[key] = { production: 0, months: 0 };
        }
        quarters[key].production += parseFloat(d.cement_production) || 0;
        quarters[key].months += 1;
      });

      const sortedQuarters = Object.entries(quarters).sort();
      analytics.trends.quarterlyGrowth = sortedQuarters.map(([period, data], index) => {
        const prevQuarter = index > 0 ? sortedQuarters[index - 1][1] : null;
        const growthRate = prevQuarter ? 
          ((data.production - prevQuarter.production) / prevQuarter.production) * 100 : 0;
        
        return {
          period,
          production: data.production,
          averageMonthlyProduction: data.production / data.months,
          growthRate: parseFloat(growthRate.toFixed(2))
        };
      });

      // Seasonal patterns
      const monthlyAverages = {};
      productionData.forEach(d => {
        const month = d.month;
        if (!monthlyAverages[month]) {
          monthlyAverages[month] = { total: 0, count: 0 };
        }
        monthlyAverages[month].total += parseFloat(d.cement_production) || 0;
        monthlyAverages[month].count += 1;
      });

      analytics.trends.seasonalPatterns = Object.entries(monthlyAverages).reduce((acc, [month, data]) => {
        acc[`month_${month}`] = {
          averageProduction: data.total / data.count,
          dataPoints: data.count
        };
        return acc;
      }, {});

      // Year-over-year comparison
      if (comparison === 'year-over-year' && analytics.trends.yearly.length >= 2) {
        const currentYear = analytics.trends.yearly[analytics.trends.yearly.length - 1];
        const previousYear = analytics.trends.yearly[analytics.trends.yearly.length - 2];
        
        analytics.comparisons.yearOverYear = {
          currentYear: {
            year: currentYear.year,
            production: currentYear.totalProduction,
            averageMonthly: currentYear.averageMonthlyProduction
          },
          previousYear: {
            year: previousYear.year,
            production: previousYear.totalProduction,
            averageMonthly: previousYear.averageMonthlyProduction
          },
          change: {
            absolute: currentYear.totalProduction - previousYear.totalProduction,
            percentage: ((currentYear.totalProduction - previousYear.totalProduction) / previousYear.totalProduction) * 100
          }
        };
      }
    }

    logger.info(`Generated production analytics for facility ${facilityId}`, {
      period: `${startYear}-${endYear}`,
      dataPoints: productionData.length,
      totalProduction: analytics.summary.totalProduction
    });

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    logger.error('Get production analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get organization-wide production summary
 * GET /api/production/summary/organization
 */
const getOrganizationProductionSummary = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { 
      year = new Date().getFullYear(),
      groupBy = 'facility'
    } = req.query;

    // Get organization facilities
    const facilitiesResult = await query(`
      SELECT id, name FROM facilities 
      WHERE organization_id = $1 AND status = 'active'
      ORDER BY name
    `, [organizationId]);

    const facilities = facilitiesResult.rows;

    // Get production data for all facilities
    const productionDataResult = await query(`
      SELECT 
        f.id as facility_id,
        f.name as facility_name,
        pd.month,
        pd.year,
        pd.cement_production,
        pd.unit
      FROM production_data pd
      JOIN facilities f ON pd.facility_id = f.id
      WHERE pd.organization_id = $1 
        AND pd.year = $2
      ORDER BY f.name, pd.month
    `, [organizationId, parseInt(year)]);

    const productionData = productionDataResult.rows;

    // Aggregate by groupBy parameter
    let summary = {
      organization: {
        totalFacilities: facilities.length,
        activeFacilities: facilities.length,
        year: parseInt(year)
      },
      totals: {
        production: 0,
        facilitiesWithData: 0,
        dataCompleteness: 0
      },
      breakdown: []
    };

    if (groupBy === 'facility') {
      // Group by facility
      const facilityData = {};
      facilities.forEach(f => {
        facilityData[f.id] = {
          facilityId: f.id,
          facilityName: f.name,
          monthlyData: Array(12).fill(0),
          totalProduction: 0,
          monthsWithData: 0,
          averageMonthlyProduction: 0
        };
      });

      productionData.forEach(d => {
        const fData = facilityData[d.facility_id];
        if (fData) {
          const production = parseFloat(d.cement_production) || 0;
          fData.monthlyData[d.month - 1] = production;
          fData.totalProduction += production;
          if (production > 0) fData.monthsWithData += 1;
        }
      });

      // Calculate averages and completeness
      Object.values(facilityData).forEach(fData => {
        fData.averageMonthlyProduction = fData.monthsWithData > 0 ? 
          fData.totalProduction / fData.monthsWithData : 0;
        fData.dataCompleteness = (fData.monthsWithData / 12) * 100;
        
        summary.totals.production += fData.totalProduction;
        if (fData.monthsWithData > 0) summary.totals.facilitiesWithData += 1;
      });

      summary.breakdown = Object.values(facilityData);
    } else if (groupBy === 'month') {
      // Group by month
      const monthlyData = Array(12).fill(0).map((_, index) => ({
        month: index + 1,
        monthName: new Date(2000, index, 1).toLocaleString('default', { month: 'long' }),
        totalProduction: 0,
        facilitiesReporting: 0,
        facilityBreakdown: []
      }));

      productionData.forEach(d => {
        const monthIndex = d.month - 1;
        const production = parseFloat(d.cement_production) || 0;
        
        monthlyData[monthIndex].totalProduction += production;
        monthlyData[monthIndex].facilityBreakdown.push({
          facilityId: d.facility_id,
          facilityName: d.facility_name,
          production: production
        });
        
        summary.totals.production += production;
      });

      // Count unique facilities per month
      monthlyData.forEach(mData => {
        const uniqueFacilities = new Set(mData.facilityBreakdown.map(f => f.facilityId));
        mData.facilitiesReporting = uniqueFacilities.size;
      });

      summary.breakdown = monthlyData;
    }

    // Overall data completeness
    summary.totals.dataCompleteness = facilities.length > 0 ? 
      (summary.totals.facilitiesWithData / facilities.length) * 100 : 0;

    logger.info(`Generated organization production summary for ${year}`, {
      organizationId,
      groupBy,
      totalFacilities: facilities.length,
      totalProduction: summary.totals.production
    });

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    logger.error('Get organization production summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get production trends and forecasting
 * GET /api/production/trends/:facilityId
 */
const getProductionTrends = async (req, res) => {
  try {
    const { facilityId } = req.params;
    const { organizationId } = req.user;
    const { 
      months = 12,
      includeForecasting = false
    } = req.query;

    // Check if facility belongs to user's organization
    const facilityCheck = await query(`
      SELECT id, name FROM facilities 
      WHERE id = $1 AND organization_id = $2
    `, [facilityId, organizationId]);

    if (facilityCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }

    const facility = facilityCheck.rows[0];

    // Get recent production data
    const productionDataResult = await query(`
      SELECT 
        pd.year,
        pd.month,
        pd.cement_production,
        pd.unit,
        pd.created_at
      FROM production_data pd
      WHERE pd.facility_id = $1 
        AND pd.organization_id = $2
        AND (pd.year * 12 + pd.month) >= (EXTRACT(YEAR FROM CURRENT_DATE) * 12 + EXTRACT(MONTH FROM CURRENT_DATE) - $3)
      ORDER BY pd.year, pd.month
    `, [facilityId, organizationId, parseInt(months)]);

    const productionData = productionDataResult.rows;

    const trends = {
      facility: {
        id: facility.id,
        name: facility.name
      },
      period: {
        months: parseInt(months),
        dataPoints: productionData.length
      },
      historical: {
        data: productionData.map(d => ({
          year: d.year,
          month: d.month,
          production: parseFloat(d.cement_production),
          unit: d.unit,
          period: `${d.year}-${d.month.toString().padStart(2, '0')}`,
          timestamp: d.created_at
        })),
        statistics: {
          average: 0,
          median: 0,
          standardDeviation: 0,
          trend: 'stable', // 'increasing', 'decreasing', 'stable'
          volatility: 0
        }
      },
      patterns: {
        seasonality: {},
        cyclical: {},
        irregular: []
      }
    };

    if (productionData.length > 0) {
      const productions = productionData.map(d => parseFloat(d.cement_production) || 0);
      
      // Statistical calculations
      trends.historical.statistics.average = productions.reduce((sum, val) => sum + val, 0) / productions.length;
      
      const sortedProductions = [...productions].sort((a, b) => a - b);
      const mid = Math.floor(sortedProductions.length / 2);
      trends.historical.statistics.median = sortedProductions.length % 2 !== 0 ? 
        sortedProductions[mid] : 
        (sortedProductions[mid - 1] + sortedProductions[mid]) / 2;

      // Standard deviation
      const variance = productions.reduce((sum, val) => sum + Math.pow(val - trends.historical.statistics.average, 2), 0) / productions.length;
      trends.historical.statistics.standardDeviation = Math.sqrt(variance);

      // Trend analysis (simple linear regression)
      if (productions.length >= 3) {
        const n = productions.length;
        const xValues = Array.from({ length: n }, (_, i) => i);
        const yValues = productions;
        
        const sumX = xValues.reduce((sum, val) => sum + val, 0);
        const sumY = yValues.reduce((sum, val) => sum + val, 0);
        const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
        const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        
        if (slope > 0.1) trends.historical.statistics.trend = 'increasing';
        else if (slope < -0.1) trends.historical.statistics.trend = 'decreasing';
        else trends.historical.statistics.trend = 'stable';
      }

      // Volatility (coefficient of variation)
      trends.historical.statistics.volatility = trends.historical.statistics.average > 0 ? 
        (trends.historical.statistics.standardDeviation / trends.historical.statistics.average) * 100 : 0;

      // Seasonality analysis
      const monthlyAverages = {};
      productionData.forEach(d => {
        const month = d.month;
        if (!monthlyAverages[month]) {
          monthlyAverages[month] = { total: 0, count: 0 };
        }
        monthlyAverages[month].total += parseFloat(d.cement_production) || 0;
        monthlyAverages[month].count += 1;
      });

      trends.patterns.seasonality = Object.entries(monthlyAverages).reduce((acc, [month, data]) => {
        const average = data.total / data.count;
        const deviationFromOverall = ((average - trends.historical.statistics.average) / trends.historical.statistics.average) * 100;
        
        acc[`month_${month}`] = {
          averageProduction: average,
          deviationFromOverall: parseFloat(deviationFromOverall.toFixed(2)),
          dataPoints: data.count
        };
        return acc;
      }, {});

      // Simple forecasting (if requested)
      if (includeForecasting === 'true' && productions.length >= 6) {
        // Simple moving average forecast for next 3 months
        const lastNMonths = 3;
        const recentProductions = productions.slice(-lastNMonths);
        const forecastValue = recentProductions.reduce((sum, val) => sum + val, 0) / recentProductions.length;
        
        trends.forecast = {
          method: 'simple_moving_average',
          confidence: 'low', // Would be calculated based on historical accuracy
          nextMonths: Array(3).fill(0).map((_, index) => ({
            monthOffset: index + 1,
            predictedProduction: forecastValue,
            confidenceInterval: {
              lower: forecastValue * 0.9,
              upper: forecastValue * 1.1
            }
          }))
        };
      }
    }

    logger.info(`Generated production trends for facility ${facilityId}`, {
      months: parseInt(months),
      dataPoints: productionData.length,
      includeForecasting
    });

    res.json({
      success: true,
      data: trends
    });

  } catch (error) {
    logger.error('Get production trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getProductionData,
  createProductionData,
  updateProductionData,
  deleteProductionData,
  getProductionAnalytics,
  getOrganizationProductionSummary,
  getProductionTrends
};
