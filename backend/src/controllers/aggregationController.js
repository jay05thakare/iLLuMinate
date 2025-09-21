/**
 * Data Aggregation Controller
 * Advanced aggregation services for sustainability metrics
 */

const { query } = require('../config/database');
const { logger } = require('../utils/logger');

/**
 * Calculate organization-wide sustainability metrics
 * GET /api/aggregation/organization/:id/metrics
 */
const getOrganizationMetrics = async (req, res) => {
  try {
    const { id: organizationId } = req.params;
    const { 
      year = new Date().getFullYear(),
      period = 'yearly',
      includeProjections = false 
    } = req.query;

    // Check organization access
    if (req.user.organizationId !== organizationId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this organization'
      });
    }

    // Get comprehensive emission metrics
    const emissionMetrics = await query(`
      SELECT 
        ed.year,
        ed.month,
        ed.scope,
        SUM(ed.total_emissions) as emissions,
        SUM(ed.total_energy) as energy,
        AVG(ed.emission_factor) as avg_emission_factor,
        COUNT(*) as data_points,
        COUNT(DISTINCT ed.facility_id) as facilities,
        er.category,
        er.resource_type
      FROM emission_data ed
      JOIN facility_resources fr ON ed.facility_resource_id = fr.id
      JOIN emission_resources er ON fr.resource_id = er.id
      WHERE ed.organization_id = $1 
        AND ed.year = $2
      GROUP BY ed.year, ed.month, ed.scope, er.category, er.resource_type
      ORDER BY ed.year, ed.month, ed.scope
    `, [organizationId, parseInt(year)]);

    // Get production metrics
    const productionMetrics = await query(`
      SELECT 
        pd.year,
        pd.month,
        SUM(pd.cement_production) as production,
        AVG(pd.cement_production) as avg_production,
        COUNT(*) as data_points,
        COUNT(DISTINCT pd.facility_id) as facilities,
        f.name as facility_name,
        f.location->>'capacity_mtpa' as capacity_mtpa
      FROM production_data pd
      JOIN facilities f ON pd.facility_id = f.id
      WHERE pd.organization_id = $1 
        AND pd.year = $2
      GROUP BY pd.year, pd.month, f.id, f.name, f.location
      ORDER BY pd.year, pd.month
    `, [organizationId, parseInt(year)]);

    // Get facility capacity and utilization metrics
    const facilityMetrics = await query(`
      SELECT 
        f.id,
        f.name,
        f.status,
        f.location->>'capacity_mtpa' as capacity_mtpa,
        f.location->>'technology' as technology,
        f.location->>'commissioned_year' as commissioned_year,
        COUNT(DISTINCT pd.id) as production_entries,
        COUNT(DISTINCT ed.id) as emission_entries,
        SUM(pd.cement_production) as total_production,
        SUM(ed.total_emissions) as total_emissions,
        SUM(ed.total_energy) as total_energy
      FROM facilities f
      LEFT JOIN production_data pd ON f.id = pd.facility_id AND pd.year = $2
      LEFT JOIN emission_resource_facility_configurations erfc ON f.id = erfc.facility_id
      LEFT JOIN emission_data ed ON erfc.id = ed.emission_resource_facility_config_id AND ed.year = $2
      WHERE f.organization_id = $1
      GROUP BY f.id, f.name, f.status, f.location
      ORDER BY f.name
    `, [organizationId, parseInt(year)]);

    // Aggregate and calculate metrics
    const aggregatedMetrics = calculateAggregatedMetrics(
      emissionMetrics.rows,
      productionMetrics.rows,
      facilityMetrics.rows,
      period
    );

    // Calculate projections if requested
    let projections = null;
    if (includeProjections === 'true') {
      projections = await calculateProjections(organizationId, year, aggregatedMetrics);
    }

    // Calculate benchmarks and performance indicators
    const benchmarks = calculateBenchmarks(aggregatedMetrics);

    logger.info(`Generated organization metrics for ${organizationId}`, {
      year: parseInt(year),
      period,
      facilitiesAnalyzed: facilityMetrics.rows.length,
      dataPoints: emissionMetrics.rows.length + productionMetrics.rows.length
    });

    res.json({
      success: true,
      data: {
        organization: {
          id: organizationId,
          year: parseInt(year),
          period
        },
        metrics: aggregatedMetrics,
        benchmarks,
        projections,
        metadata: {
          facilitiesAnalyzed: facilityMetrics.rows.length,
          emissionDataPoints: emissionMetrics.rows.length,
          productionDataPoints: productionMetrics.rows.length,
          calculatedAt: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    logger.error('Get organization metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Calculate facility-level aggregated metrics
 * GET /api/aggregation/facility/:id/metrics
 */
const getFacilityMetrics = async (req, res) => {
  try {
    const { id: facilityId } = req.params;
    const { 
      year = new Date().getFullYear(),
      months = 12,
      includeResourceBreakdown = false 
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

    // Get emission data - simplified query to avoid potential join issues
    const emissionQuery = `
      SELECT 
        ed.year,
        ed.month,
        ed.scope,
        ed.total_emissions,
        ed.total_energy,
        ed.emission_factor,
        ed.consumption,
        ed.consumption_unit
      FROM emission_data ed
      WHERE ed.facility_id = $1 
        AND ed.year >= $2
      ORDER BY ed.year DESC, ed.month DESC
    `;

    const emissionData = await query(emissionQuery, [facilityId, parseInt(year)]);

    // Get production data
    const productionData = await query(`
      SELECT 
        pd.year,
        pd.month,
        pd.cement_production,
        pd.unit,
        pd.created_at
      FROM production_data pd
      WHERE pd.facility_id = $1 
        AND pd.year >= $2
      ORDER BY pd.year DESC, pd.month DESC
    `, [facilityId, parseInt(year)]);

    // Calculate facility-specific metrics
    const facilityMetrics = calculateFacilitySpecificMetrics(
      emissionData.rows,
      productionData.rows,
      facility,
      parseInt(months)
    );

    // Calculate capacity utilization and efficiency metrics
    const operationalMetrics = calculateOperationalMetrics(
      productionData.rows,
      facility
    );

    // Calculate trends and forecasts
    const trends = calculateFacilityTrends(
      emissionData.rows,
      productionData.rows,
      parseInt(months)
    );

    logger.info(`Generated facility metrics for ${facilityId}`, {
      facilityName: facility.name,
      year: parseInt(year),
      months: parseInt(months),
      emissionDataPoints: emissionData.rows.length,
      productionDataPoints: productionData.rows.length
    });

    res.json({
      success: true,
      data: {
        facility: {
          id: facilityId,
          name: facility.name,
          organizationName: facility.organization_name,
          capacity: facility.location?.capacity_mtpa,
          technology: facility.location?.technology,
          status: facility.status
        },
        period: {
          year: parseInt(year),
          months: parseInt(months)
        },
        metrics: facilityMetrics,
        operational: operationalMetrics,
        trends,
        resourceBreakdown: includeResourceBreakdown === 'true' ? 
          calculateResourceBreakdown(emissionData.rows) : null,
        metadata: {
          emissionDataPoints: emissionData.rows.length,
          productionDataPoints: productionData.rows.length,
          calculatedAt: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    logger.error('Get facility metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Calculate comparative analysis between facilities
 * GET /api/aggregation/comparison/facilities
 */
const getFacilityComparison = async (req, res) => {
  try {
    const { 
      facilityIds,
      year = new Date().getFullYear(),
      metrics = 'intensity' 
    } = req.query;

    if (!facilityIds) {
      return res.status(400).json({
        success: false,
        message: 'Facility IDs are required for comparison'
      });
    }

    const facilityIdArray = Array.isArray(facilityIds) ? facilityIds : facilityIds.split(',');

    // Verify all facilities belong to user's organization
    const facilitiesCheck = await query(`
      SELECT id, name, location
      FROM facilities
      WHERE id = ANY($1) AND organization_id = $2
    `, [facilityIdArray, req.user.organizationId]);

    if (facilitiesCheck.rows.length !== facilityIdArray.length) {
      return res.status(403).json({
        success: false,
        message: 'One or more facilities not found or access denied'
      });
    }

    // Get comparison metrics for all facilities
    const comparisonData = await Promise.all(
      facilityIdArray.map(async (facilityId) => {
        // Get emission data
        const emissionResult = await query(`
          SELECT 
            SUM(ed.total_emissions) as total_emissions,
            SUM(ed.total_energy) as total_energy,
            COUNT(*) as emission_entries
          FROM emission_data ed
          WHERE ed.facility_id = $1 AND ed.year = $2
        `, [facilityId, parseInt(year)]);

        // Get production data
        const productionResult = await query(`
          SELECT 
            SUM(pd.cement_production) as total_production,
            COUNT(*) as production_entries
          FROM production_data pd
          WHERE pd.facility_id = $1 AND pd.year = $2
        `, [facilityId, parseInt(year)]);

        const facility = facilitiesCheck.rows.find(f => f.id === facilityId);
        const emission = emissionResult.rows[0] || {};
        const production = productionResult.rows[0] || {};

        return {
          facilityId,
          facilityName: facility.name,
          capacity: facility.location?.capacity_mtpa || 0,
          totalEmissions: parseFloat(emission.total_emissions) || 0,
          totalEnergy: parseFloat(emission.total_energy) || 0,
          totalProduction: parseFloat(production.total_production) || 0,
          carbonIntensity: parseFloat(production.total_production) > 0 ? 
            parseFloat(emission.total_emissions) / parseFloat(production.total_production) : 0,
          energyIntensity: parseFloat(production.total_production) > 0 ? 
            parseFloat(emission.total_energy) / parseFloat(production.total_production) : 0,
          capacityUtilization: facility.location?.capacity_mtpa > 0 ? 
            (parseFloat(production.total_production) / (facility.location.capacity_mtpa * 1000000)) * 100 : 0,
          dataCompleteness: {
            emission: parseInt(emission.emission_entries) || 0,
            production: parseInt(production.production_entries) || 0
          }
        };
      })
    );

    // Calculate comparative analysis
    const comparison = calculateFacilityComparison(comparisonData, metrics);

    logger.info(`Generated facility comparison`, {
      facilitiesCompared: facilityIdArray.length,
      year: parseInt(year),
      metrics
    });

    res.json({
      success: true,
      data: {
        period: {
          year: parseInt(year)
        },
        comparison,
        facilities: comparisonData,
        rankings: calculateFacilityRankings(comparisonData),
        metadata: {
          facilitiesCompared: facilityIdArray.length,
          comparisonMetrics: metrics,
          calculatedAt: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    logger.error('Get facility comparison error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Helper function to calculate aggregated metrics
 */
const calculateAggregatedMetrics = (emissionData, productionData, facilityData, period) => {
  const metrics = {
    summary: {
      totalEmissions: 0,
      totalEnergy: 0,
      totalProduction: 0,
      scope1Emissions: 0,
      scope2Emissions: 0,
      carbonIntensity: 0,
      energyIntensity: 0,
      activeFacilities: facilityData.filter(f => f.status === 'active').length,
      totalCapacity: 0
    },
    byPeriod: {},
    byFacility: {},
    byScope: { scope1: 0, scope2: 0 },
    byCategory: {},
    dataQuality: {
      completeness: 0,
      consistency: 0,
      accuracy: 0
    }
  };

  // Aggregate emission data
  emissionData.forEach(row => {
    const emissions = parseFloat(row.emissions) || 0;
    const energy = parseFloat(row.energy) || 0;

    metrics.summary.totalEmissions += emissions;
    metrics.summary.totalEnergy += energy;

    if (row.scope === 'scope1') {
      metrics.summary.scope1Emissions += emissions;
      metrics.byScope.scope1 += emissions;
    } else if (row.scope === 'scope2') {
      metrics.summary.scope2Emissions += emissions;
      metrics.byScope.scope2 += emissions;
    }

    // Aggregate by category
    if (!metrics.byCategory[row.category]) {
      metrics.byCategory[row.category] = 0;
    }
    metrics.byCategory[row.category] += emissions;

    // Aggregate by period
    const periodKey = period === 'monthly' ? `${row.year}-${String(row.month).padStart(2, '0')}` : row.year.toString();
    if (!metrics.byPeriod[periodKey]) {
      metrics.byPeriod[periodKey] = { emissions: 0, energy: 0, production: 0 };
    }
    metrics.byPeriod[periodKey].emissions += emissions;
    metrics.byPeriod[periodKey].energy += energy;
  });

  // Aggregate production data
  productionData.forEach(row => {
    const production = parseFloat(row.production) || 0;
    metrics.summary.totalProduction += production;

    const periodKey = period === 'monthly' ? `${row.year}-${String(row.month).padStart(2, '0')}` : row.year.toString();
    if (!metrics.byPeriod[periodKey]) {
      metrics.byPeriod[periodKey] = { emissions: 0, energy: 0, production: 0 };
    }
    metrics.byPeriod[periodKey].production += production;
  });

  // Aggregate facility data
  facilityData.forEach(facility => {
    const capacity = parseFloat(facility.capacity_mtpa) || 0;
    metrics.summary.totalCapacity += capacity;

    metrics.byFacility[facility.id] = {
      name: facility.name,
      capacity: capacity,
      emissions: parseFloat(facility.total_emissions) || 0,
      energy: parseFloat(facility.total_energy) || 0,
      production: parseFloat(facility.total_production) || 0,
      emissionEntries: parseInt(facility.emission_entries) || 0,
      productionEntries: parseInt(facility.production_entries) || 0
    };
  });

  // Calculate intensities
  if (metrics.summary.totalProduction > 0) {
    metrics.summary.carbonIntensity = metrics.summary.totalEmissions / metrics.summary.totalProduction;
    metrics.summary.energyIntensity = metrics.summary.totalEnergy / metrics.summary.totalProduction;
  }

  // Calculate data quality metrics
  const totalPossibleEntries = facilityData.length * 12; // 12 months per facility
  const actualEntries = Object.values(metrics.byFacility).reduce((sum, f) => sum + f.emissionEntries + f.productionEntries, 0);
  metrics.dataQuality.completeness = (actualEntries / (totalPossibleEntries * 2)) * 100; // 2 for emission + production

  return metrics;
};

/**
 * Helper function to calculate facility-specific metrics
 */
const calculateFacilitySpecificMetrics = (emissionData, productionData, facility, months) => {
  const metrics = {
    totals: {
      emissions: 0,
      energy: 0,
      production: 0
    },
    averages: {
      monthlyEmissions: 0,
      monthlyEnergy: 0,
      monthlyProduction: 0
    },
    intensities: {
      carbon: 0,
      energy: 0
    },
    efficiency: {
      capacityUtilization: 0,
      emissionPerUnit: 0,
      energyPerUnit: 0
    },
    trends: {
      emissionTrend: 'stable',
      productionTrend: 'stable',
      intensityTrend: 'stable'
    }
  };

  // Calculate totals
  emissionData.forEach(row => {
    metrics.totals.emissions += parseFloat(row.total_emissions) || 0;
    metrics.totals.energy += parseFloat(row.total_energy) || 0;
  });

  productionData.forEach(row => {
    metrics.totals.production += parseFloat(row.cement_production) || 0;
  });

  // Calculate averages
  if (emissionData.length > 0) {
    metrics.averages.monthlyEmissions = metrics.totals.emissions / emissionData.length;
    metrics.averages.monthlyEnergy = metrics.totals.energy / emissionData.length;
  }

  if (productionData.length > 0) {
    metrics.averages.monthlyProduction = metrics.totals.production / productionData.length;
  }

  // Calculate intensities
  if (metrics.totals.production > 0) {
    metrics.intensities.carbon = metrics.totals.emissions / metrics.totals.production;
    metrics.intensities.energy = metrics.totals.energy / metrics.totals.production;
  }

  // Calculate capacity utilization
  const facilityCapacity = facility.location?.capacity_mtpa || 0;
  if (facilityCapacity > 0) {
    const annualCapacity = facilityCapacity * 1000000; // Convert MTPA to tonnes
    const actualAnnualProduction = metrics.totals.production * (12 / months); // Extrapolate to annual
    metrics.efficiency.capacityUtilization = (actualAnnualProduction / annualCapacity) * 100;
  }

  return metrics;
};

/**
 * Helper function to calculate operational metrics
 */
const calculateOperationalMetrics = (productionData, facility) => {
  const capacity = facility.location?.capacity_mtpa || 0;
  const monthlyCapacity = capacity > 0 ? (capacity * 1000000) / 12 : 0;

  const operationalMetrics = {
    capacity: {
      annual: capacity * 1000000,
      monthly: monthlyCapacity,
      daily: monthlyCapacity / 30,
      hourly: monthlyCapacity / (30 * 24)
    },
    utilization: {
      average: 0,
      peak: 0,
      minimum: 0,
      variance: 0
    },
    efficiency: {
      consistency: 0,
      reliability: 0,
      availability: 0
    }
  };

  if (productionData.length > 0 && monthlyCapacity > 0) {
    const utilizationRates = productionData.map(row => {
      const production = parseFloat(row.cement_production) || 0;
      return (production / monthlyCapacity) * 100;
    });

    operationalMetrics.utilization.average = utilizationRates.reduce((sum, rate) => sum + rate, 0) / utilizationRates.length;
    operationalMetrics.utilization.peak = Math.max(...utilizationRates);
    operationalMetrics.utilization.minimum = Math.min(...utilizationRates);

    // Calculate variance
    const mean = operationalMetrics.utilization.average;
    const variance = utilizationRates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) / utilizationRates.length;
    operationalMetrics.utilization.variance = Math.sqrt(variance);

    // Calculate efficiency metrics
    operationalMetrics.efficiency.consistency = Math.max(0, 100 - operationalMetrics.utilization.variance);
    operationalMetrics.efficiency.reliability = (productionData.length / 12) * 100; // Data completeness as reliability proxy
    operationalMetrics.efficiency.availability = Math.min(100, operationalMetrics.utilization.average);
  }

  return operationalMetrics;
};

/**
 * Helper function to calculate facility trends
 */
const calculateFacilityTrends = (emissionData, productionData, months) => {
  const trends = {
    emission: { direction: 'stable', rate: 0, confidence: 0 },
    production: { direction: 'stable', rate: 0, confidence: 0 },
    intensity: { direction: 'stable', rate: 0, confidence: 0 }
  };

  // Calculate emission trend
  if (emissionData.length >= 3) {
    const emissionsByMonth = emissionData.reduce((acc, row) => {
      const key = `${row.year}-${String(row.month).padStart(2, '0')}`;
      if (!acc[key]) acc[key] = 0;
      acc[key] += parseFloat(row.total_emissions) || 0;
      return acc;
    }, {});

    const emissionValues = Object.values(emissionsByMonth);
    trends.emission = calculateLinearTrend(emissionValues);
  }

  // Calculate production trend
  if (productionData.length >= 3) {
    const productionValues = productionData.map(row => parseFloat(row.cement_production) || 0);
    trends.production = calculateLinearTrend(productionValues);
  }

  // Calculate intensity trend
  if (emissionData.length >= 3 && productionData.length >= 3) {
    const intensityValues = [];
    emissionData.forEach(emission => {
      const production = productionData.find(p => p.year === emission.year && p.month === emission.month);
      if (production && parseFloat(production.cement_production) > 0) {
        const intensity = parseFloat(emission.total_emissions) / parseFloat(production.cement_production);
        intensityValues.push(intensity);
      }
    });

    if (intensityValues.length >= 3) {
      trends.intensity = calculateLinearTrend(intensityValues);
    }
  }

  return trends;
};

/**
 * Helper function to calculate linear trend
 */
const calculateLinearTrend = (values) => {
  if (values.length < 2) return { direction: 'stable', rate: 0, confidence: 0 };

  const n = values.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = values;

  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumXX = x.reduce((sum, val) => sum + val * val, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared for confidence
  const yMean = sumY / n;
  const ssRes = y.reduce((sum, val, i) => sum + Math.pow(val - (slope * x[i] + intercept), 2), 0);
  const ssTot = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
  const rSquared = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;

  const direction = Math.abs(slope) < 0.01 ? 'stable' : slope > 0 ? 'increasing' : 'decreasing';
  const rate = Math.abs(slope);
  const confidence = Math.max(0, Math.min(100, rSquared * 100));

  return { direction, rate, confidence };
};

/**
 * Helper function to calculate facility comparison
 */
const calculateFacilityComparison = (facilityData, metrics) => {
  const comparison = {
    summary: {
      bestPerformer: null,
      worstPerformer: null,
      average: {},
      range: {}
    },
    rankings: {},
    insights: []
  };

  if (facilityData.length === 0) return comparison;

  // Calculate averages and ranges
  const fields = ['carbonIntensity', 'energyIntensity', 'capacityUtilization', 'totalEmissions', 'totalProduction'];
  
  fields.forEach(field => {
    const values = facilityData.map(f => f[field]).filter(v => v > 0);
    if (values.length > 0) {
      comparison.summary.average[field] = values.reduce((sum, v) => sum + v, 0) / values.length;
      comparison.summary.range[field] = {
        min: Math.min(...values),
        max: Math.max(...values),
        spread: Math.max(...values) - Math.min(...values)
      };
    }
  });

  // Find best and worst performers by carbon intensity
  const validFacilities = facilityData.filter(f => f.carbonIntensity > 0);
  if (validFacilities.length > 0) {
    comparison.summary.bestPerformer = validFacilities.reduce((best, current) => 
      current.carbonIntensity < best.carbonIntensity ? current : best
    );
    
    comparison.summary.worstPerformer = validFacilities.reduce((worst, current) => 
      current.carbonIntensity > worst.carbonIntensity ? current : worst
    );
  }

  // Generate insights
  if (comparison.summary.range.carbonIntensity) {
    const spread = comparison.summary.range.carbonIntensity.spread;
    const average = comparison.summary.average.carbonIntensity;
    
    if (spread > average * 0.3) {
      comparison.insights.push('High variability in carbon intensity across facilities suggests optimization opportunities');
    }
    
    if (comparison.summary.bestPerformer && comparison.summary.worstPerformer) {
      const improvement = ((comparison.summary.worstPerformer.carbonIntensity - comparison.summary.bestPerformer.carbonIntensity) / comparison.summary.worstPerformer.carbonIntensity * 100).toFixed(1);
      comparison.insights.push(`Best performing facility has ${improvement}% lower carbon intensity than worst performer`);
    }
  }

  return comparison;
};

/**
 * Helper function to calculate facility rankings
 */
const calculateFacilityRankings = (facilityData) => {
  const rankings = {
    carbonIntensity: [],
    energyIntensity: [],
    capacityUtilization: [],
    totalProduction: []
  };

  // Rank by carbon intensity (lower is better)
  rankings.carbonIntensity = facilityData
    .filter(f => f.carbonIntensity > 0)
    .sort((a, b) => a.carbonIntensity - b.carbonIntensity)
    .map((facility, index) => ({
      rank: index + 1,
      facilityId: facility.facilityId,
      facilityName: facility.facilityName,
      value: facility.carbonIntensity,
      unit: 'kgCO2e/tonne'
    }));

  // Rank by energy intensity (lower is better)
  rankings.energyIntensity = facilityData
    .filter(f => f.energyIntensity > 0)
    .sort((a, b) => a.energyIntensity - b.energyIntensity)
    .map((facility, index) => ({
      rank: index + 1,
      facilityId: facility.facilityId,
      facilityName: facility.facilityName,
      value: facility.energyIntensity,
      unit: 'MJ/tonne'
    }));

  // Rank by capacity utilization (higher is better)
  rankings.capacityUtilization = facilityData
    .filter(f => f.capacityUtilization > 0)
    .sort((a, b) => b.capacityUtilization - a.capacityUtilization)
    .map((facility, index) => ({
      rank: index + 1,
      facilityId: facility.facilityId,
      facilityName: facility.facilityName,
      value: facility.capacityUtilization,
      unit: '%'
    }));

  // Rank by total production (higher is better)
  rankings.totalProduction = facilityData
    .filter(f => f.totalProduction > 0)
    .sort((a, b) => b.totalProduction - a.totalProduction)
    .map((facility, index) => ({
      rank: index + 1,
      facilityId: facility.facilityId,
      facilityName: facility.facilityName,
      value: facility.totalProduction,
      unit: 'tonnes'
    }));

  return rankings;
};

/**
 * Helper function to calculate projections
 */
const calculateProjections = async (organizationId, year, currentMetrics) => {
  // This would typically use more sophisticated forecasting algorithms
  // For now, implementing simple linear projection based on current trends
  
  const projections = {
    nextYear: {},
    threeYear: {},
    methodology: 'linear_trend',
    confidence: 'medium'
  };

  // Simple projection based on current year data
  const currentYear = parseInt(year);
  const growthRate = 0.02; // Assume 2% growth for production, -1% for emissions

  projections.nextYear = {
    year: currentYear + 1,
    estimatedProduction: currentMetrics.summary.totalProduction * (1 + growthRate),
    estimatedEmissions: currentMetrics.summary.totalEmissions * (1 - 0.01),
    estimatedIntensity: currentMetrics.summary.carbonIntensity * (1 - 0.03)
  };

  projections.threeYear = {
    year: currentYear + 3,
    estimatedProduction: currentMetrics.summary.totalProduction * Math.pow(1 + growthRate, 3),
    estimatedEmissions: currentMetrics.summary.totalEmissions * Math.pow(1 - 0.01, 3),
    estimatedIntensity: currentMetrics.summary.carbonIntensity * Math.pow(1 - 0.03, 3)
  };

  return projections;
};

/**
 * Helper function to calculate benchmarks
 */
const calculateBenchmarks = (metrics) => {
  const benchmarks = {
    carbonIntensity: {
      current: metrics.summary.carbonIntensity,
      industryAverage: 900, // kgCO2e/tonne for cement
      bestPractice: 700,
      regulatoryLimit: 1200,
      performance: 'unknown'
    },
    energyIntensity: {
      current: metrics.summary.energyIntensity,
      industryAverage: 3500, // MJ/tonne for cement
      bestPractice: 3000,
      performance: 'unknown'
    },
    capacityUtilization: {
      current: metrics.summary.totalCapacity > 0 ? 
        (metrics.summary.totalProduction / (metrics.summary.totalCapacity * 1000000)) * 100 : 0,
      industryAverage: 75,
      optimal: 85,
      performance: 'unknown'
    }
  };

  // Determine performance levels
  if (benchmarks.carbonIntensity.current <= benchmarks.carbonIntensity.bestPractice) {
    benchmarks.carbonIntensity.performance = 'excellent';
  } else if (benchmarks.carbonIntensity.current <= benchmarks.carbonIntensity.industryAverage) {
    benchmarks.carbonIntensity.performance = 'good';
  } else if (benchmarks.carbonIntensity.current <= benchmarks.carbonIntensity.regulatoryLimit) {
    benchmarks.carbonIntensity.performance = 'average';
  } else {
    benchmarks.carbonIntensity.performance = 'poor';
  }

  if (benchmarks.energyIntensity.current <= benchmarks.energyIntensity.bestPractice) {
    benchmarks.energyIntensity.performance = 'excellent';
  } else if (benchmarks.energyIntensity.current <= benchmarks.energyIntensity.industryAverage) {
    benchmarks.energyIntensity.performance = 'good';
  } else {
    benchmarks.energyIntensity.performance = 'needs_improvement';
  }

  const utilizationCurrent = benchmarks.capacityUtilization.current;
  if (utilizationCurrent >= benchmarks.capacityUtilization.optimal) {
    benchmarks.capacityUtilization.performance = 'excellent';
  } else if (utilizationCurrent >= benchmarks.capacityUtilization.industryAverage) {
    benchmarks.capacityUtilization.performance = 'good';
  } else {
    benchmarks.capacityUtilization.performance = 'needs_improvement';
  }

  return benchmarks;
};

/**
 * Helper function to calculate resource breakdown
 */
const calculateResourceBreakdown = (emissionData) => {
  const breakdown = {
    byResource: {},
    byCategory: {},
    byScope: { scope1: {}, scope2: {} },
    topContributors: []
  };

  emissionData.forEach(row => {
    const resourceName = row.resource_name;
    const category = row.category;
    const scope = row.scope;
    const emissions = parseFloat(row.total_emissions) || 0;
    const energy = parseFloat(row.total_energy) || 0;

    // By resource
    if (!breakdown.byResource[resourceName]) {
      breakdown.byResource[resourceName] = {
        emissions: 0,
        energy: 0,
        category,
        scope,
        library: row.library_name
      };
    }
    breakdown.byResource[resourceName].emissions += emissions;
    breakdown.byResource[resourceName].energy += energy;

    // By category
    if (!breakdown.byCategory[category]) {
      breakdown.byCategory[category] = { emissions: 0, energy: 0 };
    }
    breakdown.byCategory[category].emissions += emissions;
    breakdown.byCategory[category].energy += energy;

    // By scope
    if (!breakdown.byScope[scope][category]) {
      breakdown.byScope[scope][category] = { emissions: 0, energy: 0 };
    }
    breakdown.byScope[scope][category].emissions += emissions;
    breakdown.byScope[scope][category].energy += energy;
  });

  // Calculate top contributors
  breakdown.topContributors = Object.entries(breakdown.byResource)
    .map(([resource, data]) => ({
      resource,
      emissions: data.emissions,
      energy: data.energy,
      category: data.category,
      scope: data.scope
    }))
    .sort((a, b) => b.emissions - a.emissions)
    .slice(0, 10);

  return breakdown;
};

module.exports = {
  getOrganizationMetrics,
  getFacilityMetrics,
  getFacilityComparison
};
