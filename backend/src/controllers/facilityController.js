const { query } = require('../config/database');
const { logger } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * Facility Controller
 * Handles facility management operations
 */

/**
 * Get facilities for an organization
 * GET /api/facilities
 */
const getFacilities = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { page = 1, limit = 10, status, search } = req.query;

    const offset = (page - 1) * limit;

    // Build WHERE clause for filters
    let whereConditions = ['f.organization_id = $1'];
    let params = [organizationId];
    let paramIndex = 2;

    if (status) {
      whereConditions.push(`f.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(f.name ILIKE $${paramIndex} OR f.description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Get facilities with aggregated data
    const facilitiesResult = await query(`
      SELECT 
        f.id,
        f.name,
        f.description,
        f.location,
        f.status,
        f.created_at,
        f.updated_at,
        COUNT(DISTINCT ed.id) as emission_records_count,
        COUNT(DISTINCT pd.id) as production_records_count,
        COUNT(DISTINCT st.id) as targets_count,
        MAX(ed.created_at) as last_emission_entry,
        MAX(pd.created_at) as last_production_entry
      FROM facilities f
      LEFT JOIN emission_resource_facility_configurations erfc ON f.id = erfc.facility_id
      LEFT JOIN emission_data ed ON erfc.id = ed.emission_resource_facility_config_id
      LEFT JOIN production_data pd ON f.id = pd.facility_id
      LEFT JOIN sustainability_targets st ON f.id = st.facility_id AND st.status = 'active'
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY f.id, f.name, f.description, f.location, f.status, f.created_at, f.updated_at
      ORDER BY f.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM facilities f
      WHERE ${whereConditions.join(' AND ')}
    `, params);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        facilities: facilitiesResult.rows.map(facility => ({
          id: facility.id,
          name: facility.name,
          description: facility.description,
          location: facility.location,
          status: facility.status,
          emissionRecordsCount: parseInt(facility.emission_records_count),
          productionRecordsCount: parseInt(facility.production_records_count),
          targetsCount: parseInt(facility.targets_count),
          lastEmissionEntry: facility.last_emission_entry,
          lastProductionEntry: facility.last_production_entry,
          createdAt: facility.created_at,
          updatedAt: facility.updated_at
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
    logger.error('Get facilities error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get facility by ID
 * GET /api/facilities/:id
 */
const getFacilityById = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    const facilityResult = await query(`
      SELECT 
        f.id,
        f.organization_id,
        f.name,
        f.description,
        f.location,
        f.status,
        f.created_at,
        f.updated_at,
        COUNT(DISTINCT ed.id) as emission_records_count,
        COUNT(DISTINCT pd.id) as production_records_count,
        COUNT(DISTINCT st.id) as targets_count,
        COUNT(DISTINCT fr.id) as configured_resources_count,
        SUM(CASE WHEN ed.year = EXTRACT(YEAR FROM CURRENT_DATE) THEN ed.total_emissions ELSE 0 END) as current_year_emissions,
        SUM(CASE WHEN pd.year = EXTRACT(YEAR FROM CURRENT_DATE) THEN pd.cement_production ELSE 0 END) as current_year_production
      FROM facilities f
      LEFT JOIN emission_resource_facility_configurations erfc ON f.id = erfc.facility_id
      LEFT JOIN emission_data ed ON erfc.id = ed.emission_resource_facility_config_id
      LEFT JOIN production_data pd ON f.id = pd.facility_id
      LEFT JOIN sustainability_targets st ON f.id = st.facility_id AND st.status = 'active'
      LEFT JOIN facility_resources fr ON f.id = fr.facility_id AND fr.is_active = true
      WHERE f.id = $1 AND f.organization_id = $2
      GROUP BY f.id, f.organization_id, f.name, f.description, f.location, f.status, f.created_at, f.updated_at
    `, [id, organizationId]);

    if (facilityResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }

    const facility = facilityResult.rows[0];

    // Get recent production data (last 12 months)
    const recentProductionResult = await query(`
      SELECT 
        month,
        year,
        cement_production as production,
        unit,
        created_at
      FROM production_data
      WHERE facility_id = $1
        AND (year * 12 + month) >= (EXTRACT(YEAR FROM CURRENT_DATE) * 12 + EXTRACT(MONTH FROM CURRENT_DATE) - 12)
      ORDER BY year DESC, month DESC
      LIMIT 12
    `, [id]);

    // Get recent emission data (last 12 months) 
    const recentEmissionsResult = await query(`
      SELECT 
        ed.month,
        ed.year,
        ed.scope,
        SUM(ed.total_emissions) as total_emissions,
        SUM(ed.total_energy) as total_energy,
        COUNT(*) as records_count
      FROM emission_data ed
      JOIN emission_resource_facility_configurations erfc ON ed.emission_resource_facility_config_id = erfc.id
      WHERE erfc.facility_id = $1
        AND (ed.year * 12 + ed.month) >= (EXTRACT(YEAR FROM CURRENT_DATE) * 12 + EXTRACT(MONTH FROM CURRENT_DATE) - 12)
      GROUP BY ed.month, ed.year, ed.scope
      ORDER BY ed.year DESC, ed.month DESC
    `, [id]);

    // Get facility targets
    const targetsResult = await query(`
      SELECT 
        id,
        name,
        description,
        target_type,
        baseline_value,
        target_value,
        baseline_year,
        target_year,
        unit,
        status,
        created_at
      FROM sustainability_targets
      WHERE facility_id = $1 OR (organization_id = $2 AND facility_id IS NULL)
      ORDER BY created_at DESC
    `, [id, organizationId]);

    // Calculate carbon intensity
    const currentYearEmissions = parseFloat(facility.current_year_emissions) || 0;
    const currentYearProduction = parseFloat(facility.current_year_production) || 0;
    const carbonIntensity = currentYearProduction > 0 ? currentYearEmissions / currentYearProduction : 0;

    res.json({
      success: true,
      data: {
        facility: {
          id: facility.id,
          name: facility.name,
          description: facility.description,
          location: facility.location,
          status: facility.status,
          organizationId: facility.organization_id,
          statistics: {
            emissionRecordsCount: parseInt(facility.emission_records_count),
            productionRecordsCount: parseInt(facility.production_records_count),
            targetsCount: parseInt(facility.targets_count),
            configuredResourcesCount: parseInt(facility.configured_resources_count),
            currentYearEmissions: currentYearEmissions,
            currentYearProduction: currentYearProduction,
            carbonIntensity: parseFloat(carbonIntensity.toFixed(3))
          },
          recentData: {
            production: recentProductionResult.rows,
            emissions: recentEmissionsResult.rows
          },
          targets: targetsResult.rows,
          createdAt: facility.created_at,
          updatedAt: facility.updated_at
        }
      }
    });

  } catch (error) {
    logger.error('Get facility by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Create new facility
 * POST /api/facilities
 */
const createFacility = async (req, res) => {
  try {
    const { name, description, location } = req.body;
    const { organizationId } = req.user;

    // Check if current user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin role required to create facilities'
      });
    }

    // Create facility
    const facilityId = uuidv4();
    const createResult = await query(`
      INSERT INTO facilities (id, organization_id, name, description, location, status)
      VALUES ($1, $2, $3, $4, $5, 'active')
      RETURNING id, name, description, location, status, created_at
    `, [facilityId, organizationId, name, description, JSON.stringify(location)]);

    const newFacility = createResult.rows[0];

    logger.info(`Facility created: ${newFacility.name}`, {
      facilityId: facilityId,
      organizationId: organizationId,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Facility created successfully',
      data: {
        facility: {
          id: newFacility.id,
          name: newFacility.name,
          description: newFacility.description,
          location: newFacility.location,
          status: newFacility.status,
          createdAt: newFacility.created_at
        }
      }
    });

  } catch (error) {
    logger.error('Create facility error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update facility
 * PUT /api/facilities/:id
 */
const updateFacility = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, location, status } = req.body;
    const { organizationId } = req.user;

    // Check if current user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin role required to update facilities'
      });
    }

    // Check if facility exists and belongs to organization
    const facilityCheck = await query(`
      SELECT id, name FROM facilities 
      WHERE id = $1 AND organization_id = $2
    `, [id, organizationId]);

    if (facilityCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }

    // Update facility
    const updateResult = await query(`
      UPDATE facilities 
      SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        location = COALESCE($3, location),
        status = COALESCE($4, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 AND organization_id = $6
      RETURNING id, name, description, location, status, updated_at
    `, [name, description, location ? JSON.stringify(location) : null, status, id, organizationId]);

    const updatedFacility = updateResult.rows[0];

    logger.info(`Facility updated: ${updatedFacility.name}`, {
      facilityId: id,
      updatedBy: req.user.id,
      changes: { name, description, location, status }
    });

    res.json({
      success: true,
      message: 'Facility updated successfully',
      data: {
        facility: {
          id: updatedFacility.id,
          name: updatedFacility.name,
          description: updatedFacility.description,
          location: updatedFacility.location,
          status: updatedFacility.status,
          updatedAt: updatedFacility.updated_at
        }
      }
    });

  } catch (error) {
    logger.error('Update facility error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete facility
 * DELETE /api/facilities/:id
 */
const deleteFacility = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    // Check if current user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin role required to delete facilities'
      });
    }

    // Check if facility exists and belongs to organization
    const facilityCheck = await query(`
      SELECT id, name FROM facilities 
      WHERE id = $1 AND organization_id = $2
    `, [id, organizationId]);

    if (facilityCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }

    const facility = facilityCheck.rows[0];

    // Check if facility has associated data
    const dataCheck = await query(`
      SELECT 
        COUNT(DISTINCT ed.id) as emission_records,
        COUNT(DISTINCT pd.id) as production_records
      FROM facilities f
      LEFT JOIN emission_resource_facility_configurations erfc ON f.id = erfc.facility_id
      LEFT JOIN emission_data ed ON erfc.id = ed.emission_resource_facility_config_id
      LEFT JOIN production_data pd ON f.id = pd.facility_id
      WHERE f.id = $1
    `, [id]);

    const dataCount = dataCheck.rows[0];
    const hasData = parseInt(dataCount.emission_records) > 0 || parseInt(dataCount.production_records) > 0;

    if (hasData) {
      // Soft delete if facility has data
      await query(`
        UPDATE facilities 
        SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND organization_id = $2
      `, [id, organizationId]);

      logger.info(`Facility soft deleted: ${facility.name}`, {
        facilityId: id,
        deletedBy: req.user.id,
        reason: 'Has associated data'
      });

      res.json({
        success: true,
        message: 'Facility archived successfully (has associated data)'
      });
    } else {
      // Hard delete if no data
      await query(`
        DELETE FROM facilities 
        WHERE id = $1 AND organization_id = $2
      `, [id, organizationId]);

      logger.info(`Facility hard deleted: ${facility.name}`, {
        facilityId: id,
        deletedBy: req.user.id
      });

      res.json({
        success: true,
        message: 'Facility deleted successfully'
      });
    }

  } catch (error) {
    logger.error('Delete facility error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get facility resources configuration
 * GET /api/facilities/:id/resources
 */
const getFacilityResources = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    console.log('🔧 getFacilityResources called:', { facilityId: id, organizationId, userId: req.user.id });

    // Check if facility exists and belongs to organization
    const facilityCheck = await query(`
      SELECT id, name FROM facilities 
      WHERE id = $1 AND organization_id = $2
    `, [id, organizationId]);

    if (facilityCheck.rows.length === 0) {
      console.log('❌ Facility not found:', { facilityId: id, organizationId });
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }

    console.log('✅ Facility found:', facilityCheck.rows[0]);

    // Get configured resources with emission factors
    const resourcesResult = await query(`
      SELECT 
        fr.id as facility_resource_id,
        fr.is_active,
        fr.created_at as configured_at,
        er.id as resource_id,
        er.resource_name,
        er.category,
        er.resource_type as type,
        er.scope,
        er.description,
        ef.id as emission_factor_id,
        ef.emission_factor,
        ef.emission_factor_unit,
        ef.heat_content,
        ef.heat_content_unit,
        efl.library_name,
        efl.version as library_version,
        efl.year as library_year
      FROM facility_resources fr
      JOIN emission_resources er ON fr.resource_id = er.id
      JOIN emission_factors ef ON fr.emission_factor_id = ef.id
      JOIN emission_factor_libraries efl ON ef.library_id = efl.id
      WHERE fr.facility_id = $1 AND fr.organization_id = $2
      ORDER BY er.scope, er.category, er.resource_name
    `, [id, organizationId]);

    console.log('🔧 Resources query result:', { resourceCount: resourcesResult.rows.length, facilityId: id });

    res.json({
      success: true,
      data: {
        facilityId: id,
        resources: resourcesResult.rows.map(resource => ({
          facilityResourceId: resource.facility_resource_id,
          isActive: resource.is_active,
          configuredAt: resource.configured_at,
          resource: {
            id: resource.resource_id,
            name: resource.resource_name,
            category: resource.category,
            type: resource.type,
            scope: resource.scope,
            description: resource.description
          },
          emissionFactor: {
            id: resource.emission_factor_id,
            value: parseFloat(resource.emission_factor),
            unit: resource.emission_factor_unit,
            heatContent: parseFloat(resource.heat_content),
            heatContentUnit: resource.heat_content_unit,
            library: {
              name: resource.library_name,
              version: resource.library_version,
              year: resource.library_year
            }
          }
        }))
      }
    });

  } catch (error) {
    logger.error('Get facility resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get facility resources for AI service (API key authentication)
 * GET /api/facilities/:id/resources/ai
 */
const getFacilityResourcesForAI = async (req, res) => {
  try {
    const { id } = req.params;

    // Get configured resources with emission factors and recent consumption data
    const resourcesResult = await query(`
      SELECT 
        fr.id as facility_resource_id,
        fr.is_active,
        fr.created_at as configured_at,
        er.id as resource_id,
        er.resource_name,
        er.category,
        er.resource_type as type,
        er.scope,
        er.description,
        ef.id as emission_factor_id,
        ef.emission_factor,
        ef.emission_factor_unit,
        ef.heat_content,
        ef.heat_content_unit,
        efl.library_name,
        efl.version as library_version,
        efl.year as library_year,
        -- Get recent consumption data (last 6 months)
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'year', ed.year,
                'month', ed.month,
                'consumption', ed.consumption,
                'consumption_unit', ed.consumption_unit,
                'total_emissions', ed.total_emissions,
                'total_energy', ed.total_energy
              ) ORDER BY ed.year DESC, ed.month DESC
            )
            FROM emission_data ed 
            JOIN emission_resource_facility_configurations erfc ON ed.emission_resource_facility_config_id = erfc.id
            JOIN emission_resource_configurations erc ON erfc.emission_resource_config_id = erc.id
            WHERE erfc.facility_id = fr.facility_id AND erc.resource_id = fr.resource_id 
              AND (ed.year * 12 + ed.month) >= (EXTRACT(YEAR FROM CURRENT_DATE) * 12 + EXTRACT(MONTH FROM CURRENT_DATE) - 6)
            LIMIT 6
          ), 
          '[]'::json
        ) as recent_consumption
      FROM facility_resources fr
      JOIN emission_resources er ON fr.resource_id = er.id
      JOIN emission_factors ef ON fr.emission_factor_id = ef.id
      JOIN emission_factor_libraries efl ON ef.library_id = efl.id
      WHERE fr.facility_id = $1 AND fr.is_active = true
      ORDER BY er.scope, er.category, er.resource_name
    `, [id]);

    const resources = resourcesResult.rows.map(resource => ({
      facilityResourceId: resource.facility_resource_id,
      isActive: resource.is_active,
      configuredAt: resource.configured_at,
      resource: {
        id: resource.resource_id,
        name: resource.resource_name,
        category: resource.category,
        type: resource.type,
        scope: resource.scope,
        description: resource.description
      },
      emissionFactor: {
        id: resource.emission_factor_id,
        value: parseFloat(resource.emission_factor),
        unit: resource.emission_factor_unit,
        heatContent: parseFloat(resource.heat_content),
        heatContentUnit: resource.heat_content_unit,
        library: {
          name: resource.library_name,
          version: resource.library_version,
          year: resource.library_year
        }
      },
      recentConsumption: resource.recent_consumption || []
    }));

    logger.info(`AI service retrieved ${resources.length} resources for facility ${id}`);

    res.json({
      success: true,
      data: {
        facilityId: id,
        resources,
        totalResources: resources.length,
        activeResources: resources.filter(r => r.isActive).length
      }
    });

  } catch (error) {
    logger.error('Get facility resources for AI error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get facility resources for AI service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get comprehensive facility data for AI analysis (API key authentication)
 * GET /api/facilities/:id/ai-analysis
 */
const getFacilityForAIAnalysis = async (req, res) => {
  try {
    const { id } = req.params;

    logger.info(`Fetching comprehensive AI analysis data for facility: ${id}`);

    // Get basic facility information
    const facilityResult = await query(`
      SELECT 
        f.id,
        f.organization_id,
        f.name,
        f.description,
        f.location,
        f.status,
        f.created_at,
        f.updated_at,
        COUNT(DISTINCT ed.id) as emission_records_count,
        COUNT(DISTINCT pd.id) as production_records_count,
        COUNT(DISTINCT st.id) as targets_count,
        COUNT(DISTINCT fr.id) as configured_resources_count,
        SUM(CASE WHEN ed.year = EXTRACT(YEAR FROM CURRENT_DATE) THEN ed.total_emissions ELSE 0 END) as current_year_emissions,
        SUM(CASE WHEN pd.year = EXTRACT(YEAR FROM CURRENT_DATE) THEN pd.cement_production ELSE 0 END) as current_year_production
      FROM facilities f
      LEFT JOIN emission_resource_facility_configurations erfc ON f.id = erfc.facility_id
      LEFT JOIN emission_data ed ON erfc.id = ed.emission_resource_facility_config_id
      LEFT JOIN production_data pd ON f.id = pd.facility_id
      LEFT JOIN sustainability_targets st ON f.id = st.facility_id AND st.status = 'active'
      LEFT JOIN facility_resources fr ON f.id = fr.facility_id AND fr.is_active = true
      WHERE f.id = $1
      GROUP BY f.id, f.organization_id, f.name, f.description, f.location, f.status, f.created_at, f.updated_at
    `, [id]);

    if (facilityResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }

    const facility = facilityResult.rows[0];

    // Get recent production data (last 12 months)
    const recentProductionResult = await query(`
      SELECT 
        month,
        year,
        cement_production as production,
        unit,
        created_at
      FROM production_data
      WHERE facility_id = $1
        AND (year * 12 + month) >= (EXTRACT(YEAR FROM CURRENT_DATE) * 12 + EXTRACT(MONTH FROM CURRENT_DATE) - 12)
      ORDER BY year DESC, month DESC
      LIMIT 12
    `, [id]);

    // Get recent emission data (last 12 months) with resource breakdown
    const recentEmissionsResult = await query(`
      SELECT 
        ed.month,
        ed.year,
        ed.scope,
        ed.consumption,
        ed.consumption_unit,
        ed.total_emissions,
        ed.total_energy,
        er.resource_name,
        er.category,
        er.resource_type
      FROM emission_data ed
      JOIN emission_resource_facility_configurations erfc ON ed.emission_resource_facility_config_id = erfc.id
      JOIN emission_resource_configurations erc ON erfc.emission_resource_config_id = erc.id
      JOIN emission_resources er ON erc.resource_id = er.id
      WHERE erfc.facility_id = $1
        AND (ed.year * 12 + ed.month) >= (EXTRACT(YEAR FROM CURRENT_DATE) * 12 + EXTRACT(MONTH FROM CURRENT_DATE) - 12)
      ORDER BY ed.year DESC, ed.month DESC, er.scope, er.resource_name
    `, [id]);

    // Get facility sustainability targets
    const targetsResult = await query(`
      SELECT 
        id,
        name,
        description,
        target_type,
        baseline_value,
        target_value,
        baseline_year,
        target_year,
        unit,
        status,
        created_at
      FROM sustainability_targets
      WHERE facility_id = $1 AND status = 'active'
      ORDER BY created_at DESC
    `, [id]);

    // Get configured resources with consumption data
    const resourcesResult = await query(`
      SELECT 
        fr.id as facility_resource_id,
        fr.is_active,
        fr.created_at as configured_at,
        er.id as resource_id,
        er.resource_name,
        er.category,
        er.resource_type as type,
        er.scope,
        er.description,
        ef.id as emission_factor_id,
        ef.emission_factor,
        ef.emission_factor_unit,
        ef.heat_content,
        ef.heat_content_unit,
        ef.approximate_cost,
        ef.cost_unit,
        ef.availability_score,
        efl.library_name,
        efl.version as library_version,
        efl.year as library_year,
        efl.region as library_region,
        -- Get recent consumption data (last 6 months)
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'year', ed.year,
                'month', ed.month,
                'consumption', ed.consumption,
                'consumption_unit', ed.consumption_unit,
                'total_emissions', ed.total_emissions,
                'total_energy', ed.total_energy
              ) ORDER BY ed.year DESC, ed.month DESC
            )
            FROM emission_data ed 
            JOIN emission_resource_facility_configurations erfc ON ed.emission_resource_facility_config_id = erfc.id
            JOIN emission_resource_configurations erc ON erfc.emission_resource_config_id = erc.id
            WHERE erfc.facility_id = fr.facility_id AND erc.resource_id = fr.resource_id 
              AND (ed.year * 12 + ed.month) >= (EXTRACT(YEAR FROM CURRENT_DATE) * 12 + EXTRACT(MONTH FROM CURRENT_DATE) - 6)
            LIMIT 6
          ), 
          '[]'::json
        ) as recent_consumption
      FROM facility_resources fr
      JOIN emission_resources er ON fr.resource_id = er.id
      JOIN emission_factors ef ON fr.emission_factor_id = ef.id
      JOIN emission_factor_libraries efl ON ef.library_id = efl.id
      WHERE fr.facility_id = $1 AND fr.is_active = true
      ORDER BY er.scope, er.category, er.resource_name
    `, [id]);

    // Calculate carbon intensity
    const currentYearEmissions = parseFloat(facility.current_year_emissions) || 0;
    const currentYearProduction = parseFloat(facility.current_year_production) || 0;
    const carbonIntensity = currentYearProduction > 0 ? currentYearEmissions / currentYearProduction : 0;

    // Build comprehensive facility data response
    const facilityData = {
      facility: {
        id: facility.id,
        name: facility.name,
        description: facility.description,
        location: facility.location,
        status: facility.status,
        organizationId: facility.organization_id,
        statistics: {
          emissionRecordsCount: parseInt(facility.emission_records_count),
          productionRecordsCount: parseInt(facility.production_records_count),
          targetsCount: parseInt(facility.targets_count),
          configuredResourcesCount: parseInt(facility.configured_resources_count),
          currentYearEmissions: currentYearEmissions,
          currentYearProduction: currentYearProduction,
          carbonIntensity: parseFloat(carbonIntensity.toFixed(3))
        },
        createdAt: facility.created_at,
        updatedAt: facility.updated_at
      },
      recent_production: recentProductionResult.rows.map(prod => ({
        month: prod.month,
        year: prod.year,
        production: parseFloat(prod.production),
        unit: prod.unit,
        createdAt: prod.created_at
      })),
      recent_emissions: recentEmissionsResult.rows.map(emission => ({
        month: emission.month,
        year: emission.year,
        scope: emission.scope,
        consumption: parseFloat(emission.consumption) || 0,
        consumptionUnit: emission.consumption_unit,
        totalEmissions: parseFloat(emission.total_emissions) || 0,
        totalEnergy: parseFloat(emission.total_energy) || 0,
        resourceName: emission.resource_name,
        category: emission.category,
        resourceType: emission.resource_type
      })),
      targets: targetsResult.rows.map(target => ({
        id: target.id,
        name: target.name,
        description: target.description,
        target_type: target.target_type,
        baseline_value: parseFloat(target.baseline_value),
        target_value: parseFloat(target.target_value),
        baseline_year: target.baseline_year,
        target_year: target.target_year,
        unit: target.unit,
        status: target.status,
        created_at: target.created_at
      })),
      facility_resources: resourcesResult.rows.map(resource => ({
        facilityResourceId: resource.facility_resource_id,
        isActive: resource.is_active,
        configuredAt: resource.configured_at,
        resource: {
          id: resource.resource_id,
          name: resource.resource_name,
          category: resource.category,
          type: resource.type,
          scope: resource.scope,
          description: resource.description
        },
        emissionFactor: {
          id: resource.emission_factor_id,
          value: parseFloat(resource.emission_factor),
          unit: resource.emission_factor_unit,
          heatContent: parseFloat(resource.heat_content),
          heatContentUnit: resource.heat_content_unit,
          approximateCost: parseFloat(resource.approximate_cost) || 0,
          costUnit: resource.cost_unit,
          availabilityScore: parseInt(resource.availability_score) || 0,
          library: {
            name: resource.library_name,
            version: resource.library_version,
            year: resource.library_year,
            region: resource.library_region
          }
        },
        recentConsumption: resource.recent_consumption || []
      }))
    };

    logger.info(`Successfully retrieved comprehensive AI analysis data for facility ${id}`);

    res.json({
      success: true,
      data: facilityData,
      message: `Comprehensive facility data retrieved for AI analysis`
    });

  } catch (error) {
    logger.error('Get facility for AI analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get facility data for AI analysis',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Bulk configure facility resources
 * POST /api/facilities/:id/resources/bulk
 */
const bulkConfigureFacilityResources = async (req, res) => {
  try {
    const { id: facilityId } = req.params;
    const { resources } = req.body; // Array of { resourceId, emissionFactorId }
    const { organizationId } = req.user;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin role required to configure facility resources'
      });
    }

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

    // Validate all resources and emission factors exist
    for (const resource of resources) {
      const resourceCheck = await query(`
        SELECT er.id, er.resource_name, ef.id as factor_id
        FROM emission_resources er
        JOIN emission_factors ef ON er.id = ef.resource_id
        WHERE er.id = $1 AND ef.id = $2
      `, [resource.resourceId, resource.emissionFactorId]);

      if (resourceCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Resource ${resource.resourceId} or emission factor ${resource.emissionFactorId} not found`
        });
      }
    }

    const configuredResources = [];
    const skippedResources = [];
    const errors = [];

    // Process each resource configuration
    for (const resource of resources) {
      try {
        // Check if resource is already configured
        const existingConfigResult = await query(`
          SELECT id FROM facility_resources 
          WHERE facility_id = $1 AND resource_id = $2 AND organization_id = $3
        `, [facilityId, resource.resourceId, organizationId]);

        if (existingConfigResult.rows.length > 0) {
          skippedResources.push({
            resourceId: resource.resourceId,
            reason: 'Already configured'
          });
          continue;
        }

        // Create facility resource configuration
        const facilityResourceId = uuidv4();
        const createResult = await query(`
          INSERT INTO facility_resources (id, organization_id, facility_id, resource_id, emission_factor_id, is_active)
          VALUES ($1, $2, $3, $4, $5, true)
          RETURNING id, created_at
        `, [facilityResourceId, organizationId, facilityId, resource.resourceId, resource.emissionFactorId]);

        configuredResources.push({
          facilityResourceId: facilityResourceId,
          resourceId: resource.resourceId,
          emissionFactorId: resource.emissionFactorId,
          createdAt: createResult.rows[0].created_at
        });

      } catch (error) {
        errors.push({
          resourceId: resource.resourceId,
          error: error.message
        });
      }
    }

    logger.info(`Bulk facility resource configuration completed`, {
      facilityId,
      facilityName: facility.name,
      configured: configuredResources.length,
      skipped: skippedResources.length,
      errors: errors.length,
      configuredBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: `Bulk configuration completed: ${configuredResources.length} configured, ${skippedResources.length} skipped, ${errors.length} errors`,
      data: {
        facility: {
          id: facilityId,
          name: facility.name
        },
        summary: {
          totalRequested: resources.length,
          configured: configuredResources.length,
          skipped: skippedResources.length,
          errors: errors.length
        },
        configuredResources,
        skippedResources,
        errors
      }
    });

  } catch (error) {
    logger.error('Bulk configure facility resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update facility resource configuration
 * PUT /api/facilities/:id/resources/:resourceId
 */
const updateFacilityResource = async (req, res) => {
  try {
    const { id: facilityId, resourceId } = req.params;
    const { emissionFactorId, isActive } = req.body;
    const { organizationId } = req.user;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin role required to update facility resources'
      });
    }

    // Check if facility resource exists
    const existingResourceResult = await query(`
      SELECT fr.id, er.resource_name, f.name as facility_name
      FROM facility_resources fr
      JOIN emission_resources er ON fr.resource_id = er.id
      JOIN facilities f ON fr.facility_id = f.id
      WHERE fr.facility_id = $1 AND fr.resource_id = $2 AND fr.organization_id = $3
    `, [facilityId, resourceId, organizationId]);

    if (existingResourceResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Facility resource configuration not found'
      });
    }

    const existingResource = existingResourceResult.rows[0];

    // If emissionFactorId is provided, validate it
    if (emissionFactorId) {
      const factorCheck = await query(`
        SELECT id FROM emission_factors 
        WHERE id = $1 AND resource_id = $2
      `, [emissionFactorId, resourceId]);

      if (factorCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Emission factor not valid for this resource'
        });
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (emissionFactorId !== undefined) {
      updateFields.push(`emission_factor_id = $${paramIndex}`);
      updateValues.push(emissionFactorId);
      paramIndex++;
    }

    if (isActive !== undefined) {
      updateFields.push(`is_active = $${paramIndex}`);
      updateValues.push(isActive);
      paramIndex++;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add WHERE clause parameters
    updateValues.push(existingResource.id);

    const updateResult = await query(`
      UPDATE facility_resources 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, emission_factor_id, is_active, updated_at
    `, updateValues);

    const updatedResource = updateResult.rows[0];

    logger.info(`Facility resource configuration updated`, {
      facilityResourceId: updatedResource.id,
      facilityId,
      resourceId,
      updatedBy: req.user.id
    });

    res.json({
      success: true,
      message: 'Facility resource configuration updated successfully',
      data: {
        facilityResource: {
          id: updatedResource.id,
          facilityId,
          resourceId,
          resourceName: existingResource.resource_name,
          facilityName: existingResource.facility_name,
          emissionFactorId: updatedResource.emission_factor_id,
          isActive: updatedResource.is_active,
          updatedAt: updatedResource.updated_at
        }
      }
    });

  } catch (error) {
    logger.error('Update facility resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Remove facility resource configuration
 * DELETE /api/facilities/:id/resources/:resourceId
 */
const removeFacilityResource = async (req, res) => {
  try {
    const { id: facilityId, resourceId } = req.params;
    const { organizationId } = req.user;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin role required to remove facility resources'
      });
    }

    // Check if facility resource exists
    const existingResourceResult = await query(`
      SELECT fr.id, er.resource_name, f.name as facility_name,
             COUNT(ed.id) as emission_entries_count
      FROM facility_resources fr
      JOIN emission_resources er ON fr.resource_id = er.id
      JOIN facilities f ON fr.facility_id = f.id
      LEFT JOIN emission_data ed ON fr.id = ed.facility_resource_id
      WHERE fr.facility_id = $1 AND fr.resource_id = $2 AND fr.organization_id = $3
      GROUP BY fr.id, er.resource_name, f.name
    `, [facilityId, resourceId, organizationId]);

    if (existingResourceResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Facility resource configuration not found'
      });
    }

    const existingResource = existingResourceResult.rows[0];

    // Check if there are emission data entries using this configuration
    if (parseInt(existingResource.emission_entries_count) > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot remove resource configuration: ${existingResource.emission_entries_count} emission data entries depend on it`,
        data: {
          dependentEntries: parseInt(existingResource.emission_entries_count)
        }
      });
    }

    // Remove facility resource configuration
    await query(`
      DELETE FROM facility_resources 
      WHERE id = $1
    `, [existingResource.id]);

    logger.info(`Facility resource configuration removed`, {
      facilityResourceId: existingResource.id,
      facilityId,
      resourceId,
      resourceName: existingResource.resource_name,
      removedBy: req.user.id
    });

    res.json({
      success: true,
      message: 'Facility resource configuration removed successfully',
      data: {
        removedResource: {
          facilityId,
          resourceId,
          resourceName: existingResource.resource_name,
          facilityName: existingResource.facility_name
        }
      }
    });

  } catch (error) {
    logger.error('Remove facility resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Copy resource configuration from one facility to another
 * POST /api/facilities/:id/resources/copy
 */
const copyFacilityResources = async (req, res) => {
  try {
    const { id: targetFacilityId } = req.params;
    const { sourceFacilityId } = req.body;
    const { organizationId } = req.user;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin role required to copy facility resources'
      });
    }

    // Check if both facilities exist and belong to organization
    const facilitiesCheck = await query(`
      SELECT id, name FROM facilities 
      WHERE id IN ($1, $2) AND organization_id = $3
    `, [targetFacilityId, sourceFacilityId, organizationId]);

    if (facilitiesCheck.rows.length !== 2) {
      return res.status(404).json({
        success: false,
        message: 'One or both facilities not found'
      });
    }

    const facilityMap = {};
    facilitiesCheck.rows.forEach(f => {
      facilityMap[f.id] = f.name;
    });

    // Get source facility's resource configuration
    const sourceResourcesResult = await query(`
      SELECT resource_id, emission_factor_id
      FROM facility_resources
      WHERE facility_id = $1 AND organization_id = $2 AND is_active = true
    `, [sourceFacilityId, organizationId]);

    if (sourceResourcesResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active resources found in source facility'
      });
    }

    const copiedResources = [];
    const skippedResources = [];

    // Copy each resource configuration
    for (const sourceResource of sourceResourcesResult.rows) {
      try {
        // Check if resource is already configured in target facility
        const existingConfigResult = await query(`
          SELECT id FROM facility_resources 
          WHERE facility_id = $1 AND resource_id = $2 AND organization_id = $3
        `, [targetFacilityId, sourceResource.resource_id, organizationId]);

        if (existingConfigResult.rows.length > 0) {
          skippedResources.push({
            resourceId: sourceResource.resource_id,
            reason: 'Already configured in target facility'
          });
          continue;
        }

        // Create new facility resource configuration
        const facilityResourceId = uuidv4();
        const createResult = await query(`
          INSERT INTO facility_resources (id, organization_id, facility_id, resource_id, emission_factor_id, is_active)
          VALUES ($1, $2, $3, $4, $5, true)
          RETURNING id, created_at
        `, [facilityResourceId, organizationId, targetFacilityId, sourceResource.resource_id, sourceResource.emission_factor_id]);

        copiedResources.push({
          facilityResourceId: facilityResourceId,
          resourceId: sourceResource.resource_id,
          emissionFactorId: sourceResource.emission_factor_id,
          createdAt: createResult.rows[0].created_at
        });

      } catch (error) {
        skippedResources.push({
          resourceId: sourceResource.resource_id,
          reason: `Error: ${error.message}`
        });
      }
    }

    logger.info(`Facility resource configuration copied`, {
      sourceFacilityId,
      sourceFacilityName: facilityMap[sourceFacilityId],
      targetFacilityId,
      targetFacilityName: facilityMap[targetFacilityId],
      copied: copiedResources.length,
      skipped: skippedResources.length,
      copiedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: `Resource configuration copied: ${copiedResources.length} resources copied, ${skippedResources.length} skipped`,
      data: {
        sourceFacility: {
          id: sourceFacilityId,
          name: facilityMap[sourceFacilityId]
        },
        targetFacility: {
          id: targetFacilityId,
          name: facilityMap[targetFacilityId]
        },
        summary: {
          totalSource: sourceResourcesResult.rows.length,
          copied: copiedResources.length,
          skipped: skippedResources.length
        },
        copiedResources,
        skippedResources
      }
    });

  } catch (error) {
    logger.error('Copy facility resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get facility resource configuration templates
 * GET /api/facilities/templates/resources
 */
const getResourceTemplates = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { facilityType = 'cement_plant' } = req.query;

    // Define standard resource templates for different facility types
    const templates = {
      cement_plant: {
        name: 'Standard Cement Plant Configuration',
        description: 'Common emission resources for cement manufacturing facilities',
        scopes: {
          scope1: {
            stationary_combustion: [
              'coal_bituminous',
              'natural_gas',
              'fuel_oil_heavy',
              'diesel',
              'pet_coke'
            ],
            mobile_combustion: [
              'diesel_mobile',
              'gasoline_mobile'
            ],
            industrial_process: [
              'limestone_calcination',
              'cement_kiln_dust'
            ]
          },
          scope2: {
            purchased_electricity: [
              'electricity_grid_average'
            ]
          }
        }
      },
      office_building: {
        name: 'Standard Office Building Configuration',
        description: 'Common emission resources for office facilities',
        scopes: {
          scope1: {
            stationary_combustion: [
              'natural_gas'
            ],
            mobile_combustion: [
              'gasoline_mobile',
              'diesel_mobile'
            ]
          },
          scope2: {
            purchased_electricity: [
              'electricity_grid_average'
            ]
          }
        }
      }
    };

    const template = templates[facilityType];
    if (!template) {
      return res.status(404).json({
        success: false,
        message: `Template not found for facility type: ${facilityType}`
      });
    }

    // Get actual emission resources that match the template
    const templateResources = [];

    for (const [scope, categories] of Object.entries(template.scopes)) {
      for (const [category, resourceNames] of Object.entries(categories)) {
        for (const resourceName of resourceNames) {
          // Find emission resources that match the template
          const resourceResult = await query(`
            SELECT 
              er.id as resource_id,
              er.resource_name,
              er.category,
              er.scope,
              er.description,
              ef.id as emission_factor_id,
              ef.emission_factor,
              ef.emission_factor_unit,
              efl.library_name,
              efl.version,
              efl.year
            FROM emission_resources er
            JOIN emission_factors ef ON er.id = ef.resource_id
            JOIN emission_factor_libraries efl ON ef.library_id = efl.id
            WHERE er.resource_name ILIKE $1 
              AND er.scope = $2 
              AND er.category = $3
            ORDER BY efl.year DESC, ef.emission_factor DESC
            LIMIT 1
          `, [`%${resourceName}%`, scope, category]);

          if (resourceResult.rows.length > 0) {
            templateResources.push({
              category,
              scope,
              templateName: resourceName,
              resource: resourceResult.rows[0]
            });
          }
        }
      }
    }

    res.json({
      success: true,
      data: {
        template: {
          name: template.name,
          description: template.description,
          facilityType,
          totalResources: templateResources.length
        },
        resources: templateResources,
        availableTypes: Object.keys(templates)
      }
    });

  } catch (error) {
    logger.error('Get resource templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Apply resource template to facility
 * POST /api/facilities/:id/templates/apply
 */
const applyResourceTemplate = async (req, res) => {
  try {
    const { id: facilityId } = req.params;
    const { templateType = 'cement_plant', overwriteExisting = false } = req.body;
    const { organizationId } = req.user;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin role required to apply resource templates'
      });
    }

    // Check if facility exists
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

    // Get template resources (reuse the template logic)
    const templateResponse = await getResourceTemplates({ 
      user: req.user,
      query: { facilityType: templateType }
    }, { 
      json: (data) => data 
    });

    const templateResources = templateResponse.data.resources;

    if (templateResources.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No resources found for template type: ${templateType}`
      });
    }

    const appliedResources = [];
    const skippedResources = [];
    const errors = [];

    // Apply each template resource
    for (const templateResource of templateResources) {
      try {
        const resourceId = templateResource.resource.resource_id;
        const emissionFactorId = templateResource.resource.emission_factor_id;

        // Check if resource is already configured
        const existingConfigResult = await query(`
          SELECT id FROM facility_resources 
          WHERE facility_id = $1 AND resource_id = $2 AND organization_id = $3
        `, [facilityId, resourceId, organizationId]);

        if (existingConfigResult.rows.length > 0) {
          if (!overwriteExisting) {
            skippedResources.push({
              resourceId,
              resourceName: templateResource.resource.resource_name,
              reason: 'Already configured (overwrite disabled)'
            });
            continue;
          } else {
            // Update existing configuration
            await query(`
              UPDATE facility_resources 
              SET emission_factor_id = $1, updated_at = CURRENT_TIMESTAMP
              WHERE facility_id = $2 AND resource_id = $3 AND organization_id = $4
            `, [emissionFactorId, facilityId, resourceId, organizationId]);

            appliedResources.push({
              resourceId,
              resourceName: templateResource.resource.resource_name,
              emissionFactorId,
              action: 'updated'
            });
            continue;
          }
        }

        // Create new facility resource configuration
        const facilityResourceId = uuidv4();
        await query(`
          INSERT INTO facility_resources (id, organization_id, facility_id, resource_id, emission_factor_id, is_active)
          VALUES ($1, $2, $3, $4, $5, true)
        `, [facilityResourceId, organizationId, facilityId, resourceId, emissionFactorId]);

        appliedResources.push({
          facilityResourceId,
          resourceId,
          resourceName: templateResource.resource.resource_name,
          emissionFactorId,
          action: 'created'
        });

      } catch (error) {
        errors.push({
          resourceId: templateResource.resource.resource_id,
          resourceName: templateResource.resource.resource_name,
          error: error.message
        });
      }
    }

    logger.info(`Resource template applied to facility`, {
      facilityId,
      facilityName: facility.name,
      templateType,
      applied: appliedResources.length,
      skipped: skippedResources.length,
      errors: errors.length,
      appliedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: `Template applied: ${appliedResources.length} resources configured, ${skippedResources.length} skipped, ${errors.length} errors`,
      data: {
        facility: {
          id: facilityId,
          name: facility.name
        },
        template: {
          type: templateType,
          totalResources: templateResources.length
        },
        summary: {
          applied: appliedResources.length,
          skipped: skippedResources.length,
          errors: errors.length
        },
        appliedResources,
        skippedResources,
        errors
      }
    });

  } catch (error) {
    logger.error('Apply resource template error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getFacilities,
  getFacilityById,
  createFacility,
  updateFacility,
  deleteFacility,
  getFacilityResources,
  getFacilityResourcesForAI,
  getFacilityForAIAnalysis,
  bulkConfigureFacilityResources,
  updateFacilityResource,
  removeFacilityResource,
  copyFacilityResources,
  getResourceTemplates,
  applyResourceTemplate
};
