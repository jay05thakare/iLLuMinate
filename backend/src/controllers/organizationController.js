const { query } = require('../config/database');
const { logger } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * Organization Controller
 * Handles organization management operations
 */

/**
 * Get organization details
 * GET /api/organizations/:id
 */
const getOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Ensure user can only access their own organization
    const organizationResult = await query(`
      SELECT 
        o.organization_id,
        o.name,
        o.description,
        o.subscription_plan,
        o.status,
        o.created_at,
        o.updated_at,
        COUNT(DISTINCT u.id) as user_count,
        COUNT(DISTINCT f.id) as facility_count
      FROM organizations o
      LEFT JOIN users u ON o.organization_id = u.organization_id AND u.status = 'active'
      LEFT JOIN facilities f ON o.organization_id = f.organization_id AND f.status = 'active'
      WHERE o.organization_id = $1 
        AND EXISTS (
          SELECT 1 FROM users 
          WHERE organization_id = o.organization_id 
            AND id = $2 
            AND status = 'active'
        )
      GROUP BY o.organization_id, o.name, o.description, o.subscription_plan, o.status, o.created_at, o.updated_at
    `, [id, userId]);

    if (organizationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found or access denied'
      });
    }

    const organization = organizationResult.rows[0];

    res.json({
      success: true,
      data: {
        organization: {
          id: organization.organization_id,
          name: organization.name,
          description: organization.description,
          subscriptionPlan: organization.subscription_plan,
          status: organization.status,
          userCount: parseInt(organization.user_count),
          facilityCount: parseInt(organization.facility_count),
          createdAt: organization.created_at,
          updatedAt: organization.updated_at
        }
      }
    });

  } catch (error) {
    logger.error('Get organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update organization details
 * PUT /api/organizations/:id
 */
const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, subscriptionPlan } = req.body;
    const userId = req.user.id;

    // Check if user is admin of this organization
    const userCheck = await query(`
      SELECT role FROM users 
      WHERE id = $1 AND organization_id = $2 AND status = 'active'
    `, [userId, id]);

    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin role required to update organization'
      });
    }

    // Update organization
    const updateResult = await query(`
      UPDATE organizations 
      SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        subscription_plan = COALESCE($3, subscription_plan),
        updated_at = CURRENT_TIMESTAMP
      WHERE organization_id = $4
      RETURNING organization_id, name, description, subscription_plan, status, created_at, updated_at
    `, [name, description, subscriptionPlan, id]);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    const organization = updateResult.rows[0];

    logger.info(`Organization updated: ${organization.name}`, {
      organizationId: id,
      updatedBy: userId
    });

    res.json({
      success: true,
      message: 'Organization updated successfully',
      data: {
        organization: {
          id: organization.organization_id,
          name: organization.name,
          description: organization.description,
          subscriptionPlan: organization.subscription_plan,
          status: organization.status,
          createdAt: organization.created_at,
          updatedAt: organization.updated_at
        }
      }
    });

  } catch (error) {
    logger.error('Update organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get organization statistics
 * GET /api/organizations/:id/stats
 */
const getOrganizationStats = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Ensure user belongs to this organization
    const userCheck = await query(`
      SELECT 1 FROM users 
      WHERE id = $1 AND organization_id = $2 AND status = 'active'
    `, [userId, id]);

    if (userCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this organization'
      });
    }

    // Get comprehensive statistics
    const statsResult = await query(`
      SELECT 
        -- User statistics
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT CASE WHEN u.role = 'admin' THEN u.id END) as admin_users,
        COUNT(DISTINCT CASE WHEN u.role = 'user' THEN u.id END) as regular_users,
        
        -- Facility statistics
        COUNT(DISTINCT f.id) as total_facilities,
        COUNT(DISTINCT CASE WHEN f.status = 'active' THEN f.id END) as active_facilities,
        
        -- Data statistics
        COUNT(DISTINCT ed.id) as total_emission_records,
        COUNT(DISTINCT pd.id) as total_production_records,
        COUNT(DISTINCT st.id) as total_targets,
        COUNT(DISTINCT CASE WHEN st.status = 'active' THEN st.id END) as active_targets
        
      FROM organizations o
      LEFT JOIN users u ON o.organization_id = u.organization_id AND u.status = 'active'
      LEFT JOIN facilities f ON o.organization_id = f.organization_id
      LEFT JOIN emission_resource_facility_configurations erfc ON o.organization_id = erfc.organization_id
      LEFT JOIN emission_data ed ON erfc.id = ed.emission_resource_facility_config_id
      LEFT JOIN production_data pd ON o.organization_id = pd.organization_id
      LEFT JOIN sustainability_targets st ON o.organization_id = st.organization_id
      WHERE o.organization_id = $1
      GROUP BY o.organization_id
    `, [id]);

    // Get recent activity (last 30 days)
    const recentActivityResult = await query(`
      SELECT 
        COUNT(DISTINCT ed.id) as recent_emission_records,
        COUNT(DISTINCT pd.id) as recent_production_records,
        MAX(ed.created_at) as last_emission_entry,
        MAX(pd.created_at) as last_production_entry
      FROM organizations o
      LEFT JOIN emission_resource_facility_configurations erfc ON o.organization_id = erfc.organization_id
      LEFT JOIN emission_data ed ON erfc.id = ed.emission_resource_facility_config_id 
        AND ed.created_at >= CURRENT_DATE - INTERVAL '30 days'
      LEFT JOIN production_data pd ON o.organization_id = pd.organization_id 
        AND pd.created_at >= CURRENT_DATE - INTERVAL '30 days'
      WHERE o.organization_id = $1
      GROUP BY o.organization_id
    `, [id]);

    // Get current year emission totals by scope
    const currentYear = new Date().getFullYear();
    const emissionTotalsResult = await query(`
      SELECT 
        ed.scope,
        SUM(ed.total_emissions) as total_emissions,
        SUM(ed.total_energy) as total_energy,
        COUNT(*) as record_count
      FROM emission_data ed
      WHERE ed.organization_id = $1 
        AND ed.year = $2
      GROUP BY ed.scope
    `, [id, currentYear]);

    // Get production totals for current year
    const productionTotalsResult = await query(`
      SELECT 
        SUM(cement_production) as total_production,
        COUNT(DISTINCT facility_id) as facilities_with_data,
        COUNT(*) as record_count
      FROM production_data 
      WHERE organization_id = $1 
        AND year = $2
    `, [id, currentYear]);

    const stats = statsResult.rows[0] || {};
    const recentActivity = recentActivityResult.rows[0] || {};
    const productionTotals = productionTotalsResult.rows[0] || {};

    // Process emission totals by scope
    const emissionsByScope = {};
    emissionTotalsResult.rows.forEach(row => {
      emissionsByScope[row.scope] = {
        totalEmissions: parseFloat(row.total_emissions) || 0,
        totalEnergy: parseFloat(row.total_energy) || 0,
        recordCount: parseInt(row.record_count) || 0
      };
    });

    res.json({
      success: true,
      data: {
        organizationId: id,
        year: currentYear,
        users: {
          total: parseInt(stats.total_users) || 0,
          admins: parseInt(stats.admin_users) || 0,
          regular: parseInt(stats.regular_users) || 0
        },
        facilities: {
          total: parseInt(stats.total_facilities) || 0,
          active: parseInt(stats.active_facilities) || 0
        },
        dataRecords: {
          emissions: parseInt(stats.total_emission_records) || 0,
          production: parseInt(stats.total_production_records) || 0,
          recentEmissions: parseInt(recentActivity.recent_emission_records) || 0,
          recentProduction: parseInt(recentActivity.recent_production_records) || 0
        },
        targets: {
          total: parseInt(stats.total_targets) || 0,
          active: parseInt(stats.active_targets) || 0
        },
        currentYearTotals: {
          production: {
            totalProduction: parseFloat(productionTotals.total_production) || 0,
            facilitiesWithData: parseInt(productionTotals.facilities_with_data) || 0,
            recordCount: parseInt(productionTotals.record_count) || 0
          },
          emissions: emissionsByScope
        },
        lastActivity: {
          lastEmissionEntry: recentActivity.last_emission_entry,
          lastProductionEntry: recentActivity.last_production_entry
        }
      }
    });

  } catch (error) {
    logger.error('Get organization stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get organization users
 * GET /api/organizations/:id/users
 */
const getOrganizationUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 10, role, status } = req.query;

    const offset = (page - 1) * limit;

    // Check if user belongs to this organization
    const userCheck = await query(`
      SELECT role FROM users 
      WHERE id = $1 AND organization_id = $2 AND status = 'active'
    `, [userId, id]);

    if (userCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this organization'
      });
    }

    // Build WHERE clause for filters
    let whereConditions = ['u.organization_id = $1'];
    let params = [id];
    let paramIndex = 2;

    if (role) {
      whereConditions.push(`u.role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`u.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    // Get users with pagination
    const usersResult = await query(`
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.role,
        u.status,
        u.last_login,
        u.created_at
      FROM users u
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM users u
      WHERE ${whereConditions.join(' AND ')}
    `, params);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        users: usersResult.rows.map(user => ({
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          status: user.status,
          lastLogin: user.last_login,
          createdAt: user.created_at
        }))
      },
      meta: {
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    logger.error('Get organization users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get organization emission analytics
 * GET /api/organizations/:id/emissions/analytics
 */
const getOrganizationEmissionAnalytics = async (req, res) => {
  try {
    const { id: organizationId } = req.params;
    const { year = new Date().getFullYear(), period = 'monthly' } = req.query;

    // Check if organization exists and user has access
    if (req.user.organizationId !== organizationId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this organization'
      });
    }

    const organizationCheck = await query(`
      SELECT organization_id, name FROM organizations WHERE organization_id = $1
    `, [organizationId]);

    if (organizationCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    const organization = organizationCheck.rows[0];

    // Get emission data aggregated by month/year
    const emissionDataResult = await query(`
      SELECT 
        ed.year,
        ed.month,
        ed.scope,
        SUM(ed.total_emissions) as total_emissions,
        SUM(ed.total_energy) as total_energy,
        COUNT(*) as data_entries,
        f.id as facility_id,
        f.name as facility_name,
        er.category as resource_category
      FROM emission_data ed
      JOIN facilities f ON ed.facility_id = f.id
      JOIN facility_resources fr ON ed.facility_resource_id = fr.id
      JOIN emission_resources er ON fr.resource_id = er.id
      WHERE ed.organization_id = $1 
        AND ed.year = $2
      GROUP BY ed.year, ed.month, ed.scope, f.id, f.name, er.category
      ORDER BY ed.year DESC, ed.month DESC, ed.scope, f.name
    `, [organizationId, parseInt(year)]);

    // Get production data for intensity calculations
    const productionDataResult = await query(`
      SELECT 
        pd.year,
        pd.month,
        SUM(pd.cement_production) as total_production,
        f.id as facility_id,
        f.name as facility_name
      FROM production_data pd
      JOIN facilities f ON pd.facility_id = f.id
      WHERE pd.organization_id = $1 
        AND pd.year = $2
      GROUP BY pd.year, pd.month, f.id, f.name
      ORDER BY pd.year DESC, pd.month DESC, f.name
    `, [organizationId, parseInt(year)]);

    // Process and aggregate data
    const monthlyData = {};
    const facilityData = {};
    const scopeData = { scope1: {}, scope2: {} };
    const categoryData = {};

    // Initialize monthly structure
    for (let month = 1; month <= 12; month++) {
      monthlyData[month] = {
        month,
        monthName: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month - 1],
        totalEmissions: 0,
        totalEnergy: 0,
        totalProduction: 0,
        scope1Emissions: 0,
        scope2Emissions: 0,
        carbonIntensity: 0,
        energyIntensity: 0,
        dataEntries: 0
      };
    }

    // Aggregate emission data
    emissionDataResult.rows.forEach(row => {
      const month = row.month;
      const facilityId = row.facility_id;
      const scope = row.scope;
      const category = row.resource_category;
      const emissions = parseFloat(row.total_emissions) || 0;
      const energy = parseFloat(row.total_energy) || 0;

      // Monthly aggregation
      monthlyData[month].totalEmissions += emissions;
      monthlyData[month].totalEnergy += energy;
      monthlyData[month].dataEntries += parseInt(row.data_entries);

      if (scope === 'scope1') {
        monthlyData[month].scope1Emissions += emissions;
      } else if (scope === 'scope2') {
        monthlyData[month].scope2Emissions += emissions;
      }

      // Facility aggregation
      if (!facilityData[facilityId]) {
        facilityData[facilityId] = {
          facilityId,
          facilityName: row.facility_name,
          totalEmissions: 0,
          totalEnergy: 0,
          scope1Emissions: 0,
          scope2Emissions: 0,
          dataEntries: 0
        };
      }
      facilityData[facilityId].totalEmissions += emissions;
      facilityData[facilityId].totalEnergy += energy;
      facilityData[facilityId].dataEntries += parseInt(row.data_entries);

      if (scope === 'scope1') {
        facilityData[facilityId].scope1Emissions += emissions;
      } else if (scope === 'scope2') {
        facilityData[facilityId].scope2Emissions += emissions;
      }

      // Scope aggregation
      if (!scopeData[scope][month]) {
        scopeData[scope][month] = { month, monthName: monthlyData[month].monthName, emissions: 0, energy: 0 };
      }
      scopeData[scope][month].emissions += emissions;
      scopeData[scope][month].energy += energy;

      // Category aggregation
      if (!categoryData[category]) {
        categoryData[category] = { category, totalEmissions: 0, totalEnergy: 0 };
      }
      categoryData[category].totalEmissions += emissions;
      categoryData[category].totalEnergy += energy;
    });

    // Aggregate production data and calculate intensities
    productionDataResult.rows.forEach(row => {
      const month = row.month;
      const production = parseFloat(row.total_production) || 0;

      monthlyData[month].totalProduction += production;

      // Calculate intensities
      if (production > 0) {
        monthlyData[month].carbonIntensity = monthlyData[month].totalEmissions / production;
        monthlyData[month].energyIntensity = monthlyData[month].totalEnergy / production;
      }
    });

    // Convert to arrays and calculate trends
    const monthlyArray = Object.values(monthlyData);
    const facilityArray = Object.values(facilityData);
    const scope1Array = Object.values(scopeData.scope1);
    const scope2Array = Object.values(scopeData.scope2);
    const categoryArray = Object.values(categoryData);

    // Calculate yearly totals and trends
    const yearlyTotals = {
      totalEmissions: monthlyArray.reduce((sum, m) => sum + m.totalEmissions, 0),
      totalEnergy: monthlyArray.reduce((sum, m) => sum + m.totalEnergy, 0),
      totalProduction: monthlyArray.reduce((sum, m) => sum + m.totalProduction, 0),
      scope1Emissions: monthlyArray.reduce((sum, m) => sum + m.scope1Emissions, 0),
      scope2Emissions: monthlyArray.reduce((sum, m) => sum + m.scope2Emissions, 0),
      dataCompleteness: (monthlyArray.filter(m => m.dataEntries > 0).length / 12) * 100
    };

    yearlyTotals.carbonIntensity = yearlyTotals.totalProduction > 0 ? 
      yearlyTotals.totalEmissions / yearlyTotals.totalProduction : 0;
    yearlyTotals.energyIntensity = yearlyTotals.totalProduction > 0 ? 
      yearlyTotals.totalEnergy / yearlyTotals.totalProduction : 0;

    // Calculate simple trends (last 3 months vs previous 3 months)
    const monthsWithData = monthlyArray.filter(m => m.dataEntries > 0);
    const recentMonths = monthsWithData.slice(-3);
    const previousMonths = monthsWithData.slice(-6, -3);

    const calculateTrend = (recent, previous, field) => {
      if (recent.length === 0 || previous.length === 0) return { value: 0, direction: 'stable' };
      
      const recentAvg = recent.reduce((sum, m) => sum + m[field], 0) / recent.length;
      const previousAvg = previous.reduce((sum, m) => sum + m[field], 0) / previous.length;
      
      if (previousAvg === 0) return { value: 0, direction: 'stable' };
      
      const change = ((recentAvg - previousAvg) / previousAvg) * 100;
      return {
        value: Math.abs(change),
        direction: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable'
      };
    };

    const trends = {
      emissions: calculateTrend(recentMonths, previousMonths, 'totalEmissions'),
      production: calculateTrend(recentMonths, previousMonths, 'totalProduction'),
      carbonIntensity: calculateTrend(recentMonths, previousMonths, 'carbonIntensity'),
      energyIntensity: calculateTrend(recentMonths, previousMonths, 'energyIntensity')
    };

    logger.info(`Generated emission analytics for organization ${organizationId}`, {
      year: parseInt(year),
      totalEmissions: yearlyTotals.totalEmissions,
      totalProduction: yearlyTotals.totalProduction,
      facilities: facilityArray.length,
      dataCompleteness: yearlyTotals.dataCompleteness
    });

    res.json({
      success: true,
      data: {
        organization: {
          id: organization.id,
          name: organization.name
        },
        period: {
          year: parseInt(year),
          type: period
        },
        summary: yearlyTotals,
        trends,
        monthlyData: monthlyArray,
        facilityData: facilityArray,
        scopeBreakdown: {
          scope1: scope1Array,
          scope2: scope2Array
        },
        categoryBreakdown: categoryArray
      }
    });

  } catch (error) {
    logger.error('Get organization emission analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get organization dashboard summary
 * GET /api/organizations/:id/dashboard
 */
const getOrganizationDashboard = async (req, res) => {
  try {
    const { id: organizationId } = req.params;
    const { year = new Date().getFullYear() } = req.query;

    // Check if organization exists and user has access
    if (req.user.organizationId !== organizationId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this organization'
      });
    }

    // Get basic organization stats
    const statsResult = await query(`
      SELECT 
        o.organization_id,
        o.name,
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT f.id) as total_facilities,
        COUNT(DISTINCT CASE WHEN f.status = 'active' THEN f.id END) as active_facilities
      FROM organizations o
      LEFT JOIN users u ON o.organization_id = u.organization_id
      LEFT JOIN facilities f ON o.organization_id = f.organization_id
      WHERE o.organization_id = $1
      GROUP BY o.organization_id, o.name
    `, [organizationId]);

    if (statsResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    const orgStats = statsResult.rows[0];

    // Get emission totals for the year
    const emissionTotalsResult = await query(`
      SELECT 
        SUM(ed.total_emissions) as total_emissions,
        SUM(ed.total_energy) as total_energy,
        COUNT(DISTINCT ed.facility_id) as facilities_with_data,
        COUNT(*) as total_entries
      FROM emission_data ed
      WHERE ed.organization_id = $1 AND ed.year = $2
    `, [organizationId, parseInt(year)]);

    // Get production totals for the year
    const productionTotalsResult = await query(`
      SELECT 
        SUM(pd.cement_production) as total_production,
        COUNT(DISTINCT pd.facility_id) as facilities_with_production,
        COUNT(*) as production_entries
      FROM production_data pd
      WHERE pd.organization_id = $1 AND pd.year = $2
    `, [organizationId, parseInt(year)]);

    // Get active targets count
    const targetsResult = await query(`
      SELECT COUNT(*) as active_targets
      FROM sustainability_targets st
      WHERE st.organization_id = $1 AND st.status = 'active'
    `, [organizationId]);

    const emissionTotals = emissionTotalsResult.rows[0] || {};
    const productionTotals = productionTotalsResult.rows[0] || {};
    const targets = targetsResult.rows[0] || {};

    const dashboard = {
      organization: {
        id: organizationId,
        name: orgStats.name
      },
      year: parseInt(year),
      summary: {
        totalFacilities: parseInt(orgStats.total_facilities) || 0,
        activeFacilities: parseInt(orgStats.active_facilities) || 0,
        totalUsers: parseInt(orgStats.total_users) || 0,
        activeTargets: parseInt(targets.active_targets) || 0,
        totalEmissions: parseFloat(emissionTotals.total_emissions) || 0,
        totalEnergy: parseFloat(emissionTotals.total_energy) || 0,
        totalProduction: parseFloat(productionTotals.total_production) || 0,
        carbonIntensity: 0,
        energyIntensity: 0,
        dataCompleteness: {
          facilitiesWithEmissionData: parseInt(emissionTotals.facilities_with_data) || 0,
          facilitiesWithProductionData: parseInt(productionTotals.facilities_with_production) || 0,
          totalEmissionEntries: parseInt(emissionTotals.total_entries) || 0,
          totalProductionEntries: parseInt(productionTotals.production_entries) || 0
        }
      }
    };

    // Calculate intensities
    if (dashboard.summary.totalProduction > 0) {
      dashboard.summary.carbonIntensity = dashboard.summary.totalEmissions / dashboard.summary.totalProduction;
      dashboard.summary.energyIntensity = dashboard.summary.totalEnergy / dashboard.summary.totalProduction;
    }

    logger.info(`Generated dashboard summary for organization ${organizationId}`, {
      year: parseInt(year),
      totalFacilities: dashboard.summary.totalFacilities,
      totalEmissions: dashboard.summary.totalEmissions,
      totalProduction: dashboard.summary.totalProduction
    });

    res.json({
      success: true,
      data: dashboard
    });

  } catch (error) {
    logger.error('Get organization dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get organization facilities
 * GET /api/organizations/:id/facilities
 */
const getOrganizationFacilities = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Ensure user belongs to this organization
    const userCheck = await query(`
      SELECT 1 FROM users 
      WHERE id = $1 AND organization_id = $2 AND status = 'active'
    `, [userId, id]);

    if (userCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this organization'
      });
    }

    // Get facilities for the organization
    const facilitiesResult = await query(`
      SELECT 
        f.id,
        f.name,
        f.description,
        f.location,
        f.status,
        f.created_at,
        f.updated_at,
        COUNT(DISTINCT ed.id) as emission_data_count,
        COUNT(DISTINCT pd.id) as production_data_count
      FROM facilities f
      LEFT JOIN emission_resource_facility_configurations erfc ON f.id = erfc.facility_id
      LEFT JOIN emission_data ed ON erfc.id = ed.emission_resource_facility_config_id
      LEFT JOIN production_data pd ON f.id = pd.facility_id
      WHERE f.organization_id = $1
      GROUP BY f.id, f.name, f.description, f.location, f.status, f.created_at, f.updated_at
      ORDER BY f.created_at ASC
    `, [id]);

    // Transform facilities data to match AI service expectations
    const facilities = facilitiesResult.rows.map(facility => {
      const location = facility.location || {};
      
      return {
        id: facility.id,
        name: facility.name,
        description: facility.description,
        facility_type: 'Cement Manufacturing', // Default for JK Cement
        location: {
          address: location.address || '',
          city: location.city || '',
          state: location.state || '',
          country: location.country || '',
          latitude: location.latitude || null,
          longitude: location.longitude || null
        },
        annual_production_capacity_tons: location.capacity_mtpa ? Math.round(location.capacity_mtpa * 1000000) : null,
        daily_capacity_tons: location.capacity_tpd || null,
        technology: location.technology || 'Dry Process Kiln',
        commissioned_year: location.commissioned_year || null,
        primary_fuel: 'Coal', // Default, could be enhanced with actual data
        alternative_fuel_rate_percent: null, // Could be calculated from emission data
        clinker_to_cement_ratio_percent: null, // Could be calculated from production data
        status: facility.status,
        data_availability: {
          emission_records: parseInt(facility.emission_data_count) || 0,
          production_records: parseInt(facility.production_data_count) || 0,
          has_data: (parseInt(facility.emission_data_count) > 0) || (parseInt(facility.production_data_count) > 0)
        },
        created_at: facility.created_at,
        updated_at: facility.updated_at
      };
    });

    logger.info(`Retrieved ${facilities.length} facilities for organization ${id}`, {
      organizationId: id,
      facilityCount: facilities.length,
      activeFacilities: facilities.filter(f => f.status === 'active').length
    });

    res.json({
      success: true,
      data: facilities,
      meta: {
        total: facilities.length,
        active: facilities.filter(f => f.status === 'active').length,
        with_data: facilities.filter(f => f.data_availability.has_data).length
      }
    });

  } catch (error) {
    logger.error('Get organization facilities error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get organization facilities for AI service
 * GET /api/organizations/:id/facilities/ai
 */
const getOrganizationFacilitiesForAI = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Simple API key authentication for AI service
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    const expectedApiKey = process.env.AI_SERVICE_API_KEY || 'ai-service-key-123'; // Should be in environment variable
    
    if (!apiKey || apiKey !== expectedApiKey) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key for AI service'
      });
    }

    // Get facilities for the organization (without user authentication)
    const facilitiesResult = await query(`
      SELECT 
        f.id,
        f.name,
        f.description,
        f.location,
        f.status,
        f.created_at,
        f.updated_at,
        COUNT(DISTINCT ed.id) as emission_data_count,
        COUNT(DISTINCT pd.id) as production_data_count
      FROM facilities f
      LEFT JOIN emission_resource_facility_configurations erfc ON f.id = erfc.facility_id
      LEFT JOIN emission_data ed ON erfc.id = ed.emission_resource_facility_config_id
      LEFT JOIN production_data pd ON f.id = pd.facility_id
      WHERE f.organization_id = $1
      GROUP BY f.id, f.name, f.description, f.location, f.status, f.created_at, f.updated_at
      ORDER BY f.created_at ASC
    `, [id]);

    // Check if organization exists
    if (facilitiesResult.rows.length === 0) {
      // Verify organization exists
      const orgCheck = await query(`SELECT organization_id FROM organizations WHERE organization_id = $1`, [id]);
      if (orgCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found'
        });
      }
    }

    // Transform facilities data to match AI service expectations
    const facilities = facilitiesResult.rows.map(facility => {
      const location = facility.location || {};
      
      return {
        id: facility.id,
        name: facility.name,
        description: facility.description,
        facility_type: 'Cement Manufacturing', // Default for JK Cement
        location: {
          address: location.address || '',
          city: location.city || '',
          state: location.state || '',
          country: location.country || '',
          latitude: location.latitude || null,
          longitude: location.longitude || null
        },
        annual_production_capacity_tons: location.capacity_mtpa ? Math.round(location.capacity_mtpa * 1000000) : null,
        daily_capacity_tons: location.capacity_tpd || null,
        technology: location.technology || 'Dry Process Kiln',
        commissioned_year: location.commissioned_year || null,
        primary_fuel: 'Coal', // Default, could be enhanced with actual data
        alternative_fuel_rate_percent: null, // Could be calculated from emission data
        clinker_to_cement_ratio_percent: null, // Could be calculated from production data
        status: facility.status,
        data_availability: {
          emission_records: parseInt(facility.emission_data_count) || 0,
          production_records: parseInt(facility.production_data_count) || 0,
          has_data: (parseInt(facility.emission_data_count) > 0) || (parseInt(facility.production_data_count) > 0)
        },
        created_at: facility.created_at,
        updated_at: facility.updated_at
      };
    });

    logger.info(`AI Service: Retrieved ${facilities.length} facilities for organization ${id}`, {
      organizationId: id,
      facilityCount: facilities.length,
      activeFacilities: facilities.filter(f => f.status === 'active').length,
      requestSource: 'AI_SERVICE'
    });

    res.json({
      success: true,
      data: facilities,
      meta: {
        total: facilities.length,
        active: facilities.filter(f => f.status === 'active').length,
        with_data: facilities.filter(f => f.data_availability.has_data).length
      }
    });

  } catch (error) {
    logger.error('Get organization facilities for AI error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getOrganization,
  updateOrganization,
  getOrganizationStats,
  getOrganizationUsers,
  getOrganizationEmissionAnalytics,
  getOrganizationDashboard,
  getOrganizationFacilities,
  getOrganizationFacilitiesForAI
};
