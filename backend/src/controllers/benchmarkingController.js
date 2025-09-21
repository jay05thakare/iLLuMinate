const { query } = require('../config/database');
const { logger } = require('../utils/logger');

/**
 * Get peer organizations for benchmarking
 */
const getPeerOrganizations = async (req, res) => {
  try {
    const { industry, country, region, year } = req.query;

    let whereClause = 'WHERE po.is_active = true';
    const params = [];
    let paramCount = 0;

    if (industry) {
      paramCount++;
      whereClause += ` AND po.industry = $${paramCount}`;
      params.push(industry);
    }

    if (country) {
      paramCount++;
      whereClause += ` AND po.country = $${paramCount}`;
      params.push(country);
    }

    if (region) {
      paramCount++;
      whereClause += ` AND po.region = $${paramCount}`;
      params.push(region);
    }

    // Main query to get peer organizations with their latest metrics
    const result = await query(`
      SELECT 
        po.id,
        po.name,
        po.industry,
        po.country,
        po.region,
        po.sector,
        po.basic_industry,
        pom.year,
        pom.revenue,
        pom.revenue_currency,
        pom.scope1_emissions,
        pom.scope2_emissions,
        pom.total_emissions,
        pom.total_energy_consumption,
        pom.renewable_energy_percentage,
        pom.cement_production,
        pom.carbon_intensity,
        pom.energy_intensity,
        pom.revenue_intensity,
        pom.water_consumption,
        pom.water_intensity,
        pom.waste_generated,
        pom.waste_intensity,
        pom.waste_recycled_percentage,
        pom.alternative_fuel_rate,
        pom.employee_count,
        pom.safety_incidents,
        pom.safety_rate,
        pom.esg_score,
        pom.environmental_score,
        pom.social_score,
        pom.governance_score,
        pom.gender_diversity_percentage,
        pom.gender_diversity_leadership
      FROM peer_organizations po
      LEFT JOIN peer_organization_metrics pom ON po.id = pom.peer_organization_id
        ${year ? `AND pom.year = $${paramCount + 1}` : 'AND pom.year = (SELECT MAX(year) FROM peer_organization_metrics WHERE peer_organization_id = po.id)'}
      ${whereClause}
      ORDER BY po.name
    `, year ? [...params, year] : params);

    logger.info(`Retrieved ${result.rows.length} peer organizations for benchmarking`);

    res.json({
      success: true,
      data: {
        organizations: result.rows,
        filters: {
          industry,
          country,
          region,
          year: year || 'latest'
        }
      }
    });

  } catch (error) {
    logger.error('Get peer organizations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get benchmarking metrics comparison
 */
const getBenchmarkingMetrics = async (req, res) => {
  try {
    const { metric, industry, year } = req.query;
    const { organizationId } = req.user;

    if (!metric) {
      return res.status(400).json({
        success: false,
        message: 'Metric parameter is required'
      });
    }

    const targetYear = year || new Date().getFullYear();

    // Get current organization's data
    const orgQuery = `
      SELECT 
        o.name as organization_name,
        SUM(ed.emission_amount) as total_emissions,
        SUM(pd.cement_production) as total_production,
        CASE 
          WHEN SUM(pd.cement_production) > 0 
          THEN SUM(ed.emission_amount) / SUM(pd.cement_production) 
          ELSE 0 
        END as carbon_intensity
      FROM organizations o
      LEFT JOIN facilities f ON o.organization_id = f.organization_id
      LEFT JOIN emission_resource_facility_configurations erfc ON f.id = erfc.facility_id
      LEFT JOIN emission_data ed ON erfc.id = ed.emission_resource_facility_config_id AND EXTRACT(YEAR FROM ed.created_at) = $2
      LEFT JOIN production_data pd ON f.id = pd.facility_id AND pd.year = $2
      WHERE o.organization_id = $1
      GROUP BY o.organization_id, o.name
    `;

    const orgResult = await query(orgQuery, [organizationId, targetYear]);

    // Get peer organizations data
    const peerQuery = `
      SELECT 
        po.name,
        po.industry,
        pom.total_emissions,
        pom.cement_production,
        pom.carbon_intensity,
        pom.energy_intensity,
        pom.alternative_fuel_rate,
        pom.renewable_energy_percentage,
        pom.water_intensity,
        pom.waste_intensity,
        pom.esg_score,
        pom.environmental_score,
        pom.social_score,
        pom.governance_score
      FROM peer_organizations po
      JOIN peer_organization_metrics pom ON po.id = pom.peer_organization_id
      WHERE po.is_active = true 
        AND pom.year = $1
        ${industry ? 'AND po.industry = $2' : ''}
      ORDER BY po.name
    `;

    const peerResult = await query(peerQuery, industry ? [targetYear, industry] : [targetYear]);

    // Calculate benchmarking statistics
    const peerMetrics = peerResult.rows.map(row => row[metric]).filter(val => val !== null && val !== undefined);
    
    const stats = {
      count: peerMetrics.length,
      min: peerMetrics.length > 0 ? Math.min(...peerMetrics) : 0,
      max: peerMetrics.length > 0 ? Math.max(...peerMetrics) : 0,
      average: peerMetrics.length > 0 ? peerMetrics.reduce((a, b) => a + b, 0) / peerMetrics.length : 0,
      median: peerMetrics.length > 0 ? calculateMedian(peerMetrics) : 0
    };

    // Calculate percentile for current organization
    const currentValue = orgResult.rows[0] ? parseFloat(orgResult.rows[0][metric]) || 0 : 0;
    const percentile = calculatePercentile(currentValue, peerMetrics);

    res.json({
      success: true,
      data: {
        metric,
        year: targetYear,
        currentOrganization: {
          name: orgResult.rows[0]?.organization_name || 'Unknown',
          value: currentValue,
          percentile: percentile
        },
        industry: {
          statistics: stats,
          organizations: peerResult.rows
        },
        comparison: {
          vs_average: currentValue - stats.average,
          vs_best: currentValue - stats.min,
          vs_worst: currentValue - stats.max
        }
      }
    });

  } catch (error) {
    logger.error('Get benchmarking metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get peer organization targets
 */
const getPeerTargets = async (req, res) => {
  try {
    const { industry, targetType, metricType } = req.query;

    let whereClause = 'WHERE po.is_active = true AND pot.status = \'active\'';
    const params = [];
    let paramCount = 0;

    if (industry) {
      paramCount++;
      whereClause += ` AND po.industry = $${paramCount}`;
      params.push(industry);
    }

    if (targetType) {
      paramCount++;
      whereClause += ` AND pot.target_type = $${paramCount}`;
      params.push(targetType);
    }

    if (metricType) {
      paramCount++;
      whereClause += ` AND pot.metric_type = $${paramCount}`;
      params.push(metricType);
    }

    const result = await query(`
      SELECT 
        po.name as organization_name,
        po.industry,
        po.country,
        pot.target_name,
        pot.target_type,
        pot.metric_type,
        pot.baseline_value,
        pot.baseline_year,
        pot.target_value,
        pot.target_year,
        pot.unit,
        pot.description,
        EXTRACT(YEAR FROM CURRENT_DATE) as current_year,
        CASE 
          WHEN pot.target_year > EXTRACT(YEAR FROM CURRENT_DATE) THEN 
            ((EXTRACT(YEAR FROM CURRENT_DATE) - pot.baseline_year) * 100.0) / (pot.target_year - pot.baseline_year)
          ELSE 100
        END as time_progress
      FROM peer_organizations po
      JOIN peer_organization_targets pot ON po.id = pot.peer_organization_id
      ${whereClause}
      ORDER BY po.name, pot.target_year
    `, params);

    res.json({
      success: true,
      data: {
        targets: result.rows,
        filters: {
          industry,
          targetType,
          metricType
        }
      }
    });

  } catch (error) {
    logger.error('Get peer targets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get ESG comparison data
 */
const getESGComparison = async (req, res) => {
  try {
    const { industry, year } = req.query;
    const targetYear = year || new Date().getFullYear();

    let whereClause = 'WHERE po.is_active = true';
    const params = [targetYear];
    let paramCount = 1;

    if (industry) {
      paramCount++;
      whereClause += ` AND po.industry = $${paramCount}`;
      params.push(industry);
    }

    const result = await query(`
      SELECT 
        po.name,
        po.industry,
        po.country,
        pom.esg_score,
        pom.environmental_score,
        pom.social_score,
        pom.governance_score,
        pom.scope1_emissions / 1000000.0 as scope1_mtco2e,
        pom.scope2_emissions / 1000000.0 as scope2_mtco2e,
        pom.total_energy_consumption / 1000000.0 as total_energy_tj,
        pom.renewable_energy_percentage,
        pom.water_consumption / 1000000.0 as water_consumption_mm3,
        pom.waste_generated / 1000.0 as waste_generated_kt,
        pom.waste_recycled_percentage,
        pom.gender_diversity_percentage,
        pom.gender_diversity_leadership,
        pom.revenue / 1000000.0 as revenue_millions
      FROM peer_organizations po
      JOIN peer_organization_metrics pom ON po.id = pom.peer_organization_id AND pom.year = $1
      ${whereClause}
      ORDER BY pom.esg_score DESC
    `, params);

    // Calculate industry averages
    const metrics = result.rows;
    const industryAvg = {
      esg_score: calculateAverage(metrics.map(m => m.esg_score)),
      environmental_score: calculateAverage(metrics.map(m => m.environmental_score)),
      social_score: calculateAverage(metrics.map(m => m.social_score)),
      governance_score: calculateAverage(metrics.map(m => m.governance_score)),
      scope1_mtco2e: calculateAverage(metrics.map(m => m.scope1_mtco2e)),
      scope2_mtco2e: calculateAverage(metrics.map(m => m.scope2_mtco2e)),
      renewable_energy_percentage: calculateAverage(metrics.map(m => m.renewable_energy_percentage)),
      water_consumption_mm3: calculateAverage(metrics.map(m => m.water_consumption_mm3)),
      waste_recycled_percentage: calculateAverage(metrics.map(m => m.waste_recycled_percentage)),
      gender_diversity_percentage: calculateAverage(metrics.map(m => m.gender_diversity_percentage))
    };

    res.json({
      success: true,
      data: {
        organizations: result.rows,
        industryAverage: industryAvg,
        year: targetYear,
        industry: industry || 'all'
      }
    });

  } catch (error) {
    logger.error('Get ESG comparison error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Helper functions
function calculateMedian(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function calculatePercentile(value, arr) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const below = sorted.filter(v => v < value).length;
  return (below / sorted.length) * 100;
}

function calculateAverage(arr) {
  const validValues = arr.filter(val => val !== null && val !== undefined && !isNaN(val));
  return validValues.length > 0 ? validValues.reduce((a, b) => a + b, 0) / validValues.length : 0;
}

module.exports = {
  getPeerOrganizations,
  getBenchmarkingMetrics,
  getPeerTargets,
  getESGComparison
};
