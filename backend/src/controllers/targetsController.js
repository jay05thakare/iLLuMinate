const { query } = require('../config/database');
const { logger } = require('../utils/logger');

/**
 * Targets Controller
 * Handles sustainability targets and goals operations
 */

/**
 * Get sustainability targets for an organization
 * GET /api/targets
 */
const getTargets = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { page = 1, limit = 10, status, facilityId } = req.query;

    const offset = (page - 1) * limit;

    // Build WHERE clause for filters
    let whereConditions = ['st.organization_id = $1'];
    let params = [organizationId];
    let paramIndex = 2;

    if (status) {
      whereConditions.push(`st.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (facilityId) {
      whereConditions.push(`st.facility_id = $${paramIndex}`);
      params.push(facilityId);
      paramIndex++;
    }

    // Get targets with facility information
    const targetsResult = await query(`
      SELECT 
        st.id,
        st.name,
        st.description,
        st.target_type,
        st.baseline_value,
        st.target_value,
        st.baseline_year,
        st.target_year,
        st.unit,
        st.status,
        st.created_at,
        st.updated_at,
        f.name as facility_name,
        f.id as facility_id
      FROM sustainability_targets st
      LEFT JOIN facilities f ON st.facility_id = f.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY st.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total 
      FROM sustainability_targets st
      WHERE ${whereConditions.join(' AND ')}
    `, params);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    logger.info(`Retrieved ${targetsResult.rows.length} targets for organization ${organizationId}`);

    res.json({
      success: true,
      data: {
        targets: targetsResult.rows.map(target => ({
          id: target.id,
          name: target.name,
          description: target.description,
          targetType: target.target_type,
          baselineValue: parseFloat(target.baseline_value),
          targetValue: parseFloat(target.target_value),
          baselineYear: target.baseline_year,
          targetYear: target.target_year,
          unit: target.unit,
          status: target.status,
          facility: target.facility_id ? {
            id: target.facility_id,
            name: target.facility_name
          } : null,
          createdAt: target.created_at,
          updatedAt: target.updated_at
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
    logger.error('Get targets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get specific target by ID
 * GET /api/targets/:id
 */
const getTarget = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    const targetResult = await query(`
      SELECT 
        st.id,
        st.name,
        st.description,
        st.target_type,
        st.baseline_value,
        st.target_value,
        st.baseline_year,
        st.target_year,
        st.unit,
        st.status,
        st.created_at,
        st.updated_at,
        f.name as facility_name,
        f.id as facility_id
      FROM sustainability_targets st
      LEFT JOIN facilities f ON st.facility_id = f.id
      WHERE st.id = $1 AND st.organization_id = $2
    `, [id, organizationId]);

    if (targetResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Target not found'
      });
    }

    const target = targetResult.rows[0];

    res.json({
      success: true,
      data: {
        target: {
          id: target.id,
          name: target.name,
          description: target.description,
          targetType: target.target_type,
          baselineValue: parseFloat(target.baseline_value),
          targetValue: parseFloat(target.target_value),
          baselineYear: target.baseline_year,
          targetYear: target.target_year,
          unit: target.unit,
          status: target.status,
          facility: target.facility_id ? {
            id: target.facility_id,
            name: target.facility_name
          } : null,
          createdAt: target.created_at,
          updatedAt: target.updated_at
        }
      }
    });

  } catch (error) {
    logger.error('Get target error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getTargets,
  getTarget
};
