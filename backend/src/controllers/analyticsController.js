/**
 * Advanced Analytics Controller
 * Comprehensive monthly/yearly data analysis functions
 */

const { query } = require('../config/database');
const { logger } = require('../utils/logger');

/**
 * Get comprehensive time-series analytics for organization
 * GET /api/analytics/organization/:id/timeseries
 */
const getOrganizationTimeSeries = async (req, res) => {
  try {
    const { id: organizationId } = req.params;
    const { 
      startYear = new Date().getFullYear() - 2,
      endYear = new Date().getFullYear(),
      granularity = 'monthly',
      metrics = 'all',
      includeForecast = false,
      forecastPeriods = 6
    } = req.query;

    // Check organization access
    if (req.user.organizationId !== organizationId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this organization'
      });
    }

    // Get time-series emission data
    const emissionTimeSeriesQuery = `
      SELECT 
        ed.year,
        ed.month,
        ed.scope,
        SUM(ed.total_emissions) as total_emissions,
        SUM(ed.total_energy) as total_energy,
        COUNT(*) as data_points,
        COUNT(DISTINCT ed.facility_id) as active_facilities,
        AVG(ed.emission_factor) as avg_emission_factor,
        er.category
      FROM emission_data ed
      JOIN facility_resources fr ON ed.facility_resource_id = fr.id
      JOIN emission_resources er ON fr.resource_id = er.id
      WHERE ed.organization_id = $1 
        AND ed.year >= $2 AND ed.year <= $3
      GROUP BY ed.year, ed.month, ed.scope, er.category
      ORDER BY ed.year, ed.month
    `;

    const emissionTimeSeries = await query(emissionTimeSeriesQuery, [organizationId, parseInt(startYear), parseInt(endYear)]);

    // Get time-series production data
    const productionTimeSeriesQuery = `
      SELECT 
        pd.year,
        pd.month,
        SUM(pd.cement_production) as total_production,
        AVG(pd.cement_production) as avg_facility_production,
        COUNT(*) as data_points,
        COUNT(DISTINCT pd.facility_id) as producing_facilities
      FROM production_data pd
      WHERE pd.organization_id = $1 
        AND pd.year >= $2 AND pd.year <= $3
      GROUP BY pd.year, pd.month
      ORDER BY pd.year, pd.month
    `;

    const productionTimeSeries = await query(productionTimeSeriesQuery, [organizationId, parseInt(startYear), parseInt(endYear)]);

    // Get facility operational metrics over time
    const facilityTimeSeriesQuery = `
      SELECT 
        f.id as facility_id,
        f.name as facility_name,
        f.location->>'capacity_mtpa' as capacity_mtpa,
        pd.year,
        pd.month,
        pd.cement_production,
        COALESCE(SUM(ed.total_emissions), 0) as facility_emissions,
        COALESCE(SUM(ed.total_energy), 0) as facility_energy
      FROM facilities f
      LEFT JOIN production_data pd ON f.id = pd.facility_id 
        AND pd.year >= $2 AND pd.year <= $3
      LEFT JOIN emission_data ed ON f.id = ed.facility_id 
        AND ed.year = pd.year AND ed.month = pd.month
      WHERE f.organization_id = $1
      GROUP BY f.id, f.name, f.location, pd.year, pd.month, pd.cement_production
      ORDER BY f.name, pd.year, pd.month
    `;

    const facilityTimeSeries = await query(facilityTimeSeriesQuery, [organizationId, parseInt(startYear), parseInt(endYear)]);

    // Process and analyze time-series data
    const analytics = await processTimeSeriesAnalytics(
      emissionTimeSeries.rows,
      productionTimeSeries.rows,
      facilityTimeSeries.rows,
      {
        startYear: parseInt(startYear),
        endYear: parseInt(endYear),
        granularity,
        metrics,
        includeForecast: includeForecast === 'true',
        forecastPeriods: parseInt(forecastPeriods)
      }
    );

    logger.info(`Generated time-series analytics for organization ${organizationId}`, {
      startYear: parseInt(startYear),
      endYear: parseInt(endYear),
      granularity,
      dataPoints: emissionTimeSeries.rows.length + productionTimeSeries.rows.length
    });

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    logger.error('Get organization time-series analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get facility-level time-series analytics
 * GET /api/analytics/facility/:id/timeseries
 */
const getFacilityTimeSeries = async (req, res) => {
  try {
    const { id: facilityId } = req.params;
    const { 
      startYear = new Date().getFullYear() - 2,
      endYear = new Date().getFullYear(),
      analysisType = 'comprehensive',
      includeBenchmarking = false,
      compareToOrganization = false
    } = req.query;

    // Verify facility access
    const facilityCheck = await query(`
      SELECT f.*, o.name as organization_name
      FROM facilities f
      JOIN organizations o ON f.organization_id = o.id
      WHERE f.id = $1 AND f.organization_id = $2
    `, [facilityId, req.user.organizationId]);

    if (facilityCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }

    const facility = facilityCheck.rows[0];

    // Get detailed facility time-series data
    const facilityEmissionsQuery = `
      SELECT 
        ed.year,
        ed.month,
        ed.scope,
        ed.consumption,
        ed.consumption_unit,
        ed.emission_factor,
        ed.total_emissions,
        ed.total_energy,
        er.category,
        er.resource_name,
        er.resource_type
      FROM emission_data ed
      JOIN facility_resources fr ON ed.facility_resource_id = fr.id
      JOIN emission_resources er ON fr.resource_id = er.id
      WHERE ed.facility_id = $1 
        AND ed.year >= $2 AND ed.year <= $3
      ORDER BY ed.year, ed.month, er.category
    `;

    const emissionData = await query(facilityEmissionsQuery, [facilityId, parseInt(startYear), parseInt(endYear)]);

    // Get facility production time-series
    const facilityProductionQuery = `
      SELECT 
        pd.year,
        pd.month,
        pd.cement_production,
        pd.unit,
        pd.created_at
      FROM production_data pd
      WHERE pd.facility_id = $1 
        AND pd.year >= $2 AND pd.year <= $3
      ORDER BY pd.year, pd.month
    `;

    const productionData = await query(facilityProductionQuery, [facilityId, parseInt(startYear), parseInt(endYear)]);

    // Get organization comparison data if requested
    let organizationData = null;
    if (compareToOrganization === 'true') {
      const orgComparisonQuery = `
        SELECT 
          pd.year,
          pd.month,
          SUM(pd.cement_production) as org_total_production,
          AVG(pd.cement_production) as org_avg_facility_production,
          COUNT(DISTINCT pd.facility_id) as org_active_facilities
        FROM production_data pd
        WHERE pd.organization_id = $1 
          AND pd.year >= $2 AND pd.year <= $3
        GROUP BY pd.year, pd.month
        ORDER BY pd.year, pd.month
      `;

      const orgData = await query(orgComparisonQuery, [req.user.organizationId, parseInt(startYear), parseInt(endYear)]);
      organizationData = orgData.rows;
    }

    // Process facility-specific analytics
    const analytics = await processFacilityTimeSeriesAnalytics(
      emissionData.rows,
      productionData.rows,
      facility,
      organizationData,
      {
        startYear: parseInt(startYear),
        endYear: parseInt(endYear),
        analysisType,
        includeBenchmarking: includeBenchmarking === 'true'
      }
    );

    logger.info(`Generated facility time-series analytics for ${facilityId}`, {
      facilityName: facility.name,
      startYear: parseInt(startYear),
      endYear: parseInt(endYear),
      analysisType
    });

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    logger.error('Get facility time-series analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get advanced trend analysis and forecasting
 * GET /api/analytics/trends/:organizationId
 */
const getAdvancedTrendAnalysis = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { 
      metric = 'emissions',
      period = 'monthly',
      forecastMethod = 'linear_regression',
      forecastHorizon = 12,
      confidenceLevel = 95,
      includeSeasonality = true
    } = req.query;

    // Check organization access
    if (req.user.organizationId !== organizationId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this organization'
      });
    }

    // Get historical data for trend analysis
    let dataQuery = '';
    let queryParams = [organizationId];

    switch (metric) {
      case 'emissions':
        dataQuery = `
          SELECT 
            ed.year,
            ed.month,
            SUM(ed.total_emissions) as value,
            'emissions' as metric,
            'kgCO2e' as unit
          FROM emission_data ed
          WHERE ed.organization_id = $1
          GROUP BY ed.year, ed.month
          ORDER BY ed.year, ed.month
        `;
        break;
      case 'production':
        dataQuery = `
          SELECT 
            pd.year,
            pd.month,
            SUM(pd.cement_production) as value,
            'production' as metric,
            'tonnes' as unit
          FROM production_data pd
          WHERE pd.organization_id = $1
          GROUP BY pd.year, pd.month
          ORDER BY pd.year, pd.month
        `;
        break;
      case 'intensity':
        dataQuery = `
          SELECT 
            COALESCE(ed.year, pd.year) as year,
            COALESCE(ed.month, pd.month) as month,
            CASE 
              WHEN SUM(pd.cement_production) > 0 
              THEN SUM(ed.total_emissions) / SUM(pd.cement_production)
              ELSE 0
            END as value,
            'intensity' as metric,
            'kgCO2e/tonne' as unit
          FROM emission_data ed
          FULL OUTER JOIN production_data pd ON 
            ed.organization_id = pd.organization_id 
            AND ed.year = pd.year 
            AND ed.month = pd.month
          WHERE COALESCE(ed.organization_id, pd.organization_id) = $1
          GROUP BY COALESCE(ed.year, pd.year), COALESCE(ed.month, pd.month)
          HAVING SUM(pd.cement_production) > 0
          ORDER BY year, month
        `;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid metric specified'
        });
    }

    const historicalData = await query(dataQuery, queryParams);

    if (historicalData.rows.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient historical data for trend analysis (minimum 6 data points required)'
      });
    }

    // Perform advanced trend analysis
    const trendAnalysis = await performAdvancedTrendAnalysis(
      historicalData.rows,
      {
        metric,
        period,
        forecastMethod,
        forecastHorizon: parseInt(forecastHorizon),
        confidenceLevel: parseInt(confidenceLevel),
        includeSeasonality: includeSeasonality === 'true'
      }
    );

    logger.info(`Generated advanced trend analysis for organization ${organizationId}`, {
      metric,
      period,
      forecastMethod,
      dataPoints: historicalData.rows.length
    });

    res.json({
      success: true,
      data: trendAnalysis
    });

  } catch (error) {
    logger.error('Get advanced trend analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get comparative time-series analysis
 * GET /api/analytics/comparative/:organizationId
 */
const getComparativeAnalysis = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { 
      compareWith = 'industry',
      facilityIds,
      timeRange = '12months',
      metrics = 'emissions,production,intensity'
    } = req.query;

    // Check organization access
    if (req.user.organizationId !== organizationId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this organization'
      });
    }

    const metricsArray = metrics.split(',');
    const currentYear = new Date().getFullYear();
    const startYear = timeRange === '12months' ? currentYear : 
                     timeRange === '24months' ? currentYear - 1 : 
                     timeRange === '36months' ? currentYear - 2 : currentYear - 2;

    let comparativeData = {};

    if (compareWith === 'facilities' && facilityIds) {
      // Compare facilities within organization
      const facilityIdArray = facilityIds.split(',');
      
      comparativeData = await getFacilityComparativeData(
        facilityIdArray,
        organizationId,
        startYear,
        currentYear,
        metricsArray
      );
    } else if (compareWith === 'industry') {
      // Compare with industry benchmarks
      comparativeData = await getIndustryComparativeData(
        organizationId,
        startYear,
        currentYear,
        metricsArray
      );
    } else if (compareWith === 'targets') {
      // Compare with organizational targets
      comparativeData = await getTargetComparativeData(
        organizationId,
        startYear,
        currentYear,
        metricsArray
      );
    }

    // Perform comparative analysis
    const analysis = await performComparativeAnalysis(comparativeData, {
      compareWith,
      timeRange,
      metrics: metricsArray
    });

    logger.info(`Generated comparative analysis for organization ${organizationId}`, {
      compareWith,
      timeRange,
      metrics: metricsArray
    });

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    logger.error('Get comparative analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Process time-series analytics for organization
 */
const processTimeSeriesAnalytics = async (emissionData, productionData, facilityData, options) => {
  const { startYear, endYear, granularity, metrics, includeForecast, forecastPeriods } = options;

  const analytics = {
    period: {
      startYear,
      endYear,
      granularity,
      totalPeriods: granularity === 'monthly' ? (endYear - startYear + 1) * 12 : (endYear - startYear + 1)
    },
    timeSeries: {
      emissions: [],
      production: [],
      intensity: [],
      facilityPerformance: []
    },
    trends: {
      emissions: {},
      production: {},
      intensity: {},
      seasonality: {}
    },
    patterns: {
      monthly: {},
      quarterly: {},
      yearly: {}
    },
    anomalies: [],
    forecast: null
  };

  // Build monthly time series
  const monthlyData = {};

  // Process emission data
  emissionData.forEach(row => {
    const key = `${row.year}-${String(row.month).padStart(2, '0')}`;
    if (!monthlyData[key]) {
      monthlyData[key] = {
        year: row.year,
        month: row.month,
        period: key,
        emissions: 0,
        energy: 0,
        production: 0,
        activeFacilities: 0,
        scope1: 0,
        scope2: 0,
        byCategory: {}
      };
    }

    monthlyData[key].emissions += parseFloat(row.total_emissions) || 0;
    monthlyData[key].energy += parseFloat(row.total_energy) || 0;
    monthlyData[key].activeFacilities = Math.max(monthlyData[key].activeFacilities, parseInt(row.active_facilities) || 0);

    if (row.scope === 'scope1') {
      monthlyData[key].scope1 += parseFloat(row.total_emissions) || 0;
    } else if (row.scope === 'scope2') {
      monthlyData[key].scope2 += parseFloat(row.total_emissions) || 0;
    }

    if (!monthlyData[key].byCategory[row.category]) {
      monthlyData[key].byCategory[row.category] = 0;
    }
    monthlyData[key].byCategory[row.category] += parseFloat(row.total_emissions) || 0;
  });

  // Process production data
  productionData.forEach(row => {
    const key = `${row.year}-${String(row.month).padStart(2, '0')}`;
    if (!monthlyData[key]) {
      monthlyData[key] = {
        year: row.year,
        month: row.month,
        period: key,
        emissions: 0,
        energy: 0,
        production: 0,
        activeFacilities: 0,
        scope1: 0,
        scope2: 0,
        byCategory: {}
      };
    }

    monthlyData[key].production += parseFloat(row.total_production) || 0;
  });

  // Calculate intensities and build time series
  const sortedKeys = Object.keys(monthlyData).sort();
  
  analytics.timeSeries.emissions = sortedKeys.map(key => {
    const data = monthlyData[key];
    return {
      period: key,
      year: data.year,
      month: data.month,
      value: data.emissions,
      scope1: data.scope1,
      scope2: data.scope2,
      byCategory: data.byCategory,
      activeFacilities: data.activeFacilities
    };
  });

  analytics.timeSeries.production = sortedKeys.map(key => {
    const data = monthlyData[key];
    return {
      period: key,
      year: data.year,
      month: data.month,
      value: data.production,
      activeFacilities: data.activeFacilities
    };
  });

  analytics.timeSeries.intensity = sortedKeys.map(key => {
    const data = monthlyData[key];
    const intensity = data.production > 0 ? data.emissions / data.production : 0;
    const energyIntensity = data.production > 0 ? data.energy / data.production : 0;
    
    return {
      period: key,
      year: data.year,
      month: data.month,
      carbonIntensity: intensity,
      energyIntensity: energyIntensity,
      production: data.production,
      emissions: data.emissions
    };
  });

  // Perform trend analysis
  if (analytics.timeSeries.emissions.length > 2) {
    analytics.trends.emissions = calculateLinearTrend(analytics.timeSeries.emissions, 'value');
    analytics.trends.production = calculateLinearTrend(analytics.timeSeries.production, 'value');
    analytics.trends.intensity = calculateLinearTrend(analytics.timeSeries.intensity, 'carbonIntensity');
  }

  // Analyze seasonal patterns
  analytics.patterns.monthly = analyzeMonthlyPatterns(analytics.timeSeries.emissions);
  analytics.patterns.quarterly = analyzeQuarterlyPatterns(analytics.timeSeries.emissions);
  analytics.patterns.yearly = analyzeYearlyPatterns(analytics.timeSeries.emissions);

  // Detect anomalies
  analytics.anomalies = detectAnomalies(analytics.timeSeries.emissions);

  // Generate forecast if requested
  if (includeForecast && analytics.timeSeries.emissions.length >= 6) {
    analytics.forecast = generateForecast(analytics.timeSeries.emissions, forecastPeriods);
  }

  return analytics;
};

/**
 * Process facility-specific time-series analytics
 */
const processFacilityTimeSeriesAnalytics = async (emissionData, productionData, facility, organizationData, options) => {
  const analytics = {
    facility: {
      id: facility.id,
      name: facility.name,
      capacity: facility.location?.capacity_mtpa || 0,
      organizationName: facility.organization_name
    },
    timeSeries: {
      emissions: [],
      production: [],
      intensity: [],
      efficiency: []
    },
    performance: {
      utilizationTrend: {},
      efficiencyTrend: {},
      consistencyScore: 0,
      reliabilityScore: 0
    },
    benchmarking: null,
    comparison: null
  };

  // Build facility time series
  const facilityMonthlyData = {};

  // Process emission data
  emissionData.forEach(row => {
    const key = `${row.year}-${String(row.month).padStart(2, '0')}`;
    if (!facilityMonthlyData[key]) {
      facilityMonthlyData[key] = {
        year: row.year,
        month: row.month,
        period: key,
        emissions: 0,
        energy: 0,
        consumption: {},
        byResource: {},
        scope1: 0,
        scope2: 0
      };
    }

    facilityMonthlyData[key].emissions += parseFloat(row.total_emissions) || 0;
    facilityMonthlyData[key].energy += parseFloat(row.total_energy) || 0;

    if (row.scope === 'scope1') {
      facilityMonthlyData[key].scope1 += parseFloat(row.total_emissions) || 0;
    } else if (row.scope === 'scope2') {
      facilityMonthlyData[key].scope2 += parseFloat(row.total_emissions) || 0;
    }

    // Resource-level breakdown
    if (!facilityMonthlyData[key].byResource[row.resource_name]) {
      facilityMonthlyData[key].byResource[row.resource_name] = {
        emissions: 0,
        consumption: 0,
        category: row.category
      };
    }
    facilityMonthlyData[key].byResource[row.resource_name].emissions += parseFloat(row.total_emissions) || 0;
    facilityMonthlyData[key].byResource[row.resource_name].consumption += parseFloat(row.consumption) || 0;
  });

  // Process production data
  productionData.forEach(row => {
    const key = `${row.year}-${String(row.month).padStart(2, '0')}`;
    if (!facilityMonthlyData[key]) {
      facilityMonthlyData[key] = {
        year: row.year,
        month: row.month,
        period: key,
        emissions: 0,
        energy: 0,
        consumption: {},
        byResource: {},
        scope1: 0,
        scope2: 0
      };
    }

    facilityMonthlyData[key].production = parseFloat(row.cement_production) || 0;
  });

  // Build time series with capacity utilization
  const facilityCapacity = analytics.facility.capacity;
  const monthlyCapacity = facilityCapacity > 0 ? (facilityCapacity * 1000000) / 12 : 0;

  const sortedKeys = Object.keys(facilityMonthlyData).sort();

  analytics.timeSeries.production = sortedKeys.map(key => {
    const data = facilityMonthlyData[key];
    const production = data.production || 0;
    const utilization = monthlyCapacity > 0 ? (production / monthlyCapacity) * 100 : 0;

    return {
      period: key,
      year: data.year,
      month: data.month,
      production: production,
      capacity: monthlyCapacity,
      utilization: utilization
    };
  });

  analytics.timeSeries.emissions = sortedKeys.map(key => {
    const data = facilityMonthlyData[key];
    return {
      period: key,
      year: data.year,
      month: data.month,
      totalEmissions: data.emissions,
      scope1: data.scope1,
      scope2: data.scope2,
      byResource: data.byResource
    };
  });

  analytics.timeSeries.intensity = sortedKeys.map(key => {
    const data = facilityMonthlyData[key];
    const production = data.production || 0;
    const carbonIntensity = production > 0 ? data.emissions / production : 0;
    const energyIntensity = production > 0 ? data.energy / production : 0;

    return {
      period: key,
      year: data.year,
      month: data.month,
      carbonIntensity: carbonIntensity,
      energyIntensity: energyIntensity,
      production: production,
      emissions: data.emissions
    };
  });

  // Calculate performance metrics
  if (analytics.timeSeries.production.length > 0) {
    const utilizations = analytics.timeSeries.production.map(p => p.utilization).filter(u => u > 0);
    
    analytics.performance.utilizationTrend = calculateLinearTrend(
      analytics.timeSeries.production.filter(p => p.utilization > 0), 
      'utilization'
    );

    // Consistency score (inverse of coefficient of variation)
    if (utilizations.length > 1) {
      const mean = utilizations.reduce((sum, u) => sum + u, 0) / utilizations.length;
      const variance = utilizations.reduce((sum, u) => sum + Math.pow(u - mean, 2), 0) / utilizations.length;
      const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;
      analytics.performance.consistencyScore = Math.max(0, 100 - (cv * 100));
    }

    // Reliability score (data completeness)
    const expectedDataPoints = ((options.endYear - options.startYear + 1) * 12);
    analytics.performance.reliabilityScore = (analytics.timeSeries.production.length / expectedDataPoints) * 100;
  }

  // Organization comparison if provided
  if (organizationData) {
    analytics.comparison = compareWithOrganization(facilityMonthlyData, organizationData);
  }

  return analytics;
};

/**
 * Helper function to calculate linear trend
 */
const calculateLinearTrend = (data, valueKey) => {
  if (!data || data.length < 2) {
    return { direction: 'stable', slope: 0, rSquared: 0, confidence: 'low' };
  }

  const n = data.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = data.map(item => parseFloat(item[valueKey]) || 0);

  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumXX = x.reduce((sum, val) => sum + val * val, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared
  const yMean = sumY / n;
  const ssRes = y.reduce((sum, val, i) => sum + Math.pow(val - (slope * x[i] + intercept), 2), 0);
  const ssTot = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
  const rSquared = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;

  const direction = Math.abs(slope) < 0.01 ? 'stable' : slope > 0 ? 'increasing' : 'decreasing';
  const confidence = rSquared > 0.8 ? 'high' : rSquared > 0.5 ? 'medium' : 'low';

  return {
    direction,
    slope,
    intercept,
    rSquared,
    confidence,
    changeRate: slope,
    strength: Math.abs(slope)
  };
};

/**
 * Helper function to analyze monthly patterns
 */
const analyzeMonthlyPatterns = (timeSeries) => {
  const monthlyAverages = {};
  
  timeSeries.forEach(item => {
    const month = item.month;
    if (!monthlyAverages[month]) {
      monthlyAverages[month] = { total: 0, count: 0 };
    }
    monthlyAverages[month].total += item.value || 0;
    monthlyAverages[month].count++;
  });

  const overallAverage = Object.values(monthlyAverages).reduce((sum, data) => sum + (data.total / data.count), 0) / Object.keys(monthlyAverages).length;

  const patterns = {};
  Object.entries(monthlyAverages).forEach(([month, data]) => {
    const average = data.total / data.count;
    patterns[`month_${month}`] = {
      average: average,
      deviation: average - overallAverage,
      seasonalIndex: (average / overallAverage) * 100,
      dataPoints: data.count
    };
  });

  return patterns;
};

/**
 * Helper function to analyze quarterly patterns
 */
const analyzeQuarterlyPatterns = (timeSeries) => {
  const quarterlyData = {};

  timeSeries.forEach(item => {
    const quarter = Math.ceil(item.month / 3);
    const key = `${item.year}_Q${quarter}`;
    
    if (!quarterlyData[key]) {
      quarterlyData[key] = { total: 0, count: 0, year: item.year, quarter };
    }
    quarterlyData[key].total += item.value || 0;
    quarterlyData[key].count++;
  });

  return Object.entries(quarterlyData).map(([key, data]) => ({
    period: key,
    year: data.year,
    quarter: data.quarter,
    total: data.total,
    average: data.total / data.count,
    dataPoints: data.count
  }));
};

/**
 * Helper function to analyze yearly patterns
 */
const analyzeYearlyPatterns = (timeSeries) => {
  const yearlyData = {};

  timeSeries.forEach(item => {
    const year = item.year;
    
    if (!yearlyData[year]) {
      yearlyData[year] = { total: 0, count: 0 };
    }
    yearlyData[year].total += item.value || 0;
    yearlyData[year].count++;
  });

  return Object.entries(yearlyData).map(([year, data]) => ({
    year: parseInt(year),
    total: data.total,
    average: data.total / data.count,
    dataPoints: data.count
  }));
};

/**
 * Helper function to detect anomalies
 */
const detectAnomalies = (timeSeries) => {
  if (timeSeries.length < 6) return [];

  const values = timeSeries.map(item => item.value || 0);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);

  const anomalies = [];
  const threshold = 2; // 2 standard deviations

  timeSeries.forEach((item, index) => {
    const value = item.value || 0;
    const zScore = stdDev > 0 ? Math.abs(value - mean) / stdDev : 0;
    
    if (zScore > threshold) {
      anomalies.push({
        period: item.period,
        year: item.year,
        month: item.month,
        value: value,
        expected: mean,
        deviation: value - mean,
        zScore: zScore,
        severity: zScore > 3 ? 'high' : 'medium'
      });
    }
  });

  return anomalies;
};

/**
 * Helper function to generate forecast
 */
const generateForecast = (timeSeries, periods) => {
  const values = timeSeries.map(item => item.value || 0);
  const trend = calculateLinearTrend(timeSeries, 'value');

  const forecast = [];
  const lastPeriod = timeSeries[timeSeries.length - 1];
  
  for (let i = 1; i <= periods; i++) {
    const forecastValue = trend.slope * (timeSeries.length + i - 1) + trend.intercept;
    const nextMonth = lastPeriod.month + i;
    const nextYear = lastPeriod.year + Math.floor((nextMonth - 1) / 12);
    const adjustedMonth = ((nextMonth - 1) % 12) + 1;

    forecast.push({
      period: `${nextYear}-${String(adjustedMonth).padStart(2, '0')}`,
      year: nextYear,
      month: adjustedMonth,
      forecast: Math.max(0, forecastValue),
      confidence: trend.confidence,
      method: 'linear_regression',
      confidenceInterval: {
        lower: Math.max(0, forecastValue * 0.8),
        upper: forecastValue * 1.2
      }
    });
  }

  return {
    method: 'linear_regression',
    confidence: trend.confidence,
    trendDirection: trend.direction,
    forecast: forecast
  };
};

/**
 * Perform advanced trend analysis
 */
const performAdvancedTrendAnalysis = async (historicalData, options) => {
  const { metric, period, forecastMethod, forecastHorizon, confidenceLevel, includeSeasonality } = options;

  const analysis = {
    metric,
    period,
    historical: {
      dataPoints: historicalData.length,
      startPeriod: historicalData[0]?.year && historicalData[0]?.month ? 
        `${historicalData[0].year}-${String(historicalData[0].month).padStart(2, '0')}` : 'Unknown',
      endPeriod: historicalData[historicalData.length - 1]?.year && historicalData[historicalData.length - 1]?.month ? 
        `${historicalData[historicalData.length - 1].year}-${String(historicalData[historicalData.length - 1].month).padStart(2, '0')}` : 'Unknown',
      values: historicalData
    },
    trend: {},
    seasonality: {},
    forecast: {},
    analysis: {
      volatility: 0,
      reliability: 0,
      patterns: []
    }
  };

  // Calculate basic trend statistics
  const values = historicalData.map(item => parseFloat(item.value) || 0);
  if (values.length > 0) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    analysis.historical.statistics = {
      mean: mean,
      median: values.sort((a, b) => a - b)[Math.floor(values.length / 2)],
      min: Math.min(...values),
      max: Math.max(...values),
      standardDeviation: stdDev,
      coefficientOfVariation: mean > 0 ? (stdDev / mean) * 100 : 0
    };
  }

  // Calculate linear trend
  analysis.trend = calculateLinearTrend(historicalData, 'value');

  // Perform seasonality analysis if requested and sufficient data
  if (includeSeasonality && historicalData.length >= 12) {
    analysis.seasonality = analyzeSeasonality(historicalData);
  }

  // Generate forecast
  if (forecastHorizon > 0) {
    analysis.forecast = generateTrendForecast(historicalData, forecastHorizon, forecastMethod);
  }

  // Calculate volatility and reliability
  analysis.analysis.volatility = analysis.historical.statistics?.coefficientOfVariation || 0;
  analysis.analysis.reliability = analysis.trend.rSquared > 0.7 ? 'high' : 
                                 analysis.trend.rSquared > 0.4 ? 'medium' : 'low';

  return analysis;
};

/**
 * Helper function to analyze seasonality
 */
const analyzeSeasonality = (historicalData) => {
  const monthlyAverages = {};
  const monthlyValues = {};

  // Group data by month
  historicalData.forEach(item => {
    const month = item.month;
    if (!monthlyValues[month]) {
      monthlyValues[month] = [];
    }
    monthlyValues[month].push(parseFloat(item.value) || 0);
  });

  // Calculate monthly averages
  Object.keys(monthlyValues).forEach(month => {
    const values = monthlyValues[month];
    monthlyAverages[month] = values.reduce((sum, val) => sum + val, 0) / values.length;
  });

  // Calculate overall average
  const overallAverage = Object.values(monthlyAverages).reduce((sum, avg) => sum + avg, 0) / Object.keys(monthlyAverages).length;

  // Calculate seasonal indices
  const seasonalIndices = {};
  Object.entries(monthlyAverages).forEach(([month, average]) => {
    seasonalIndices[month] = (average / overallAverage) * 100;
  });

  // Determine seasonality strength
  const indices = Object.values(seasonalIndices);
  const seasonalVariance = indices.reduce((sum, idx) => sum + Math.pow(idx - 100, 2), 0) / indices.length;
  const hasSeasonality = seasonalVariance > 100; // Threshold for significant seasonality

  return {
    hasSeasonality,
    seasonalStrength: seasonalVariance,
    monthlyAverages,
    seasonalIndices,
    peakMonth: Object.entries(seasonalIndices).reduce((max, [month, index]) => 
      index > max.index ? { month: parseInt(month), index } : max, { month: 1, index: 0 }),
    troughMonth: Object.entries(seasonalIndices).reduce((min, [month, index]) => 
      index < min.index ? { month: parseInt(month), index } : min, { month: 1, index: 200 })
  };
};

/**
 * Helper function to generate trend forecast
 */
const generateTrendForecast = (historicalData, periods, method) => {
  const trend = calculateLinearTrend(historicalData, 'value');
  const lastPeriod = historicalData[historicalData.length - 1];
  
  const forecast = [];
  for (let i = 1; i <= periods; i++) {
    const forecastValue = trend.slope * (historicalData.length + i - 1) + trend.intercept;
    const nextMonth = lastPeriod.month + i;
    const nextYear = lastPeriod.year + Math.floor((nextMonth - 1) / 12);
    const adjustedMonth = ((nextMonth - 1) % 12) + 1;

    forecast.push({
      period: `${nextYear}-${String(adjustedMonth).padStart(2, '0')}`,
      year: nextYear,
      month: adjustedMonth,
      value: Math.max(0, forecastValue),
      confidence: trend.confidence,
      method: method,
      confidenceInterval: {
        lower: Math.max(0, forecastValue * 0.8),
        upper: forecastValue * 1.2
      }
    });
  }

  return {
    method: method,
    confidence: trend.confidence,
    trendDirection: trend.direction,
    forecast: forecast,
    metadata: {
      rSquared: trend.rSquared,
      slope: trend.slope,
      baselineValue: trend.intercept
    }
  };
};

/**
 * Helper functions for comparative analysis (stubs for now)
 */
const getFacilityComparativeData = async (facilityIds, organizationId, startYear, endYear, metrics) => {
  // This would fetch and process facility comparison data
  return { facilities: [], metrics: [], comparison: {} };
};

const getIndustryComparativeData = async (organizationId, startYear, endYear, metrics) => {
  // This would fetch industry benchmark data
  return { industry: [], organization: [], benchmarks: {} };
};

const getTargetComparativeData = async (organizationId, startYear, endYear, metrics) => {
  // This would fetch and compare against organizational targets
  return { targets: [], actual: [], performance: {} };
};

const performComparativeAnalysis = async (comparativeData, options) => {
  // This would perform the comparative analysis
  return {
    compareWith: options.compareWith,
    timeRange: options.timeRange,
    metrics: options.metrics,
    analysis: {
      summary: 'Comparative analysis completed',
      insights: [],
      recommendations: []
    }
  };
};

const compareWithOrganization = (facilityData, organizationData) => {
  // This would compare facility performance with organization average
  return {
    facilityPerformance: 'above_average',
    organizationAverage: 0,
    facilityAverage: 0,
    variance: 0
  };
};

module.exports = {
  getOrganizationTimeSeries,
  getFacilityTimeSeries,
  getAdvancedTrendAnalysis,
  getComparativeAnalysis
};
