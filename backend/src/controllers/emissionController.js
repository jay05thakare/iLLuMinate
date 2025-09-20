const { query } = require('../config/database');
const { logger } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * Emission Controller
 * Handles emission resources, emission factors, and data operations
 */

/**
 * Get emission resources
 * GET /api/emissions/resources
 */
const getEmissionResources = async (req, res) => {
  try {
    const { scope, category, type, search } = req.query;

    // Build WHERE clause for filters
    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    if (scope) {
      whereConditions.push(`er.scope = $${paramIndex}`);
      params.push(scope);
      paramIndex++;
    }

    if (category) {
      whereConditions.push(`er.category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (type) {
      whereConditions.push(`er.resource_type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(er.resource_name ILIKE $${paramIndex} OR er.description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const resourcesResult = await query(`
      SELECT 
        er.id,
        er.resource_name as name,
        er.category,
        er.resource_type as type,
        er.scope,
        er.description,
        er.created_at,
        COUNT(ef.id) as available_factors
      FROM emission_resources er
      LEFT JOIN emission_factors ef ON er.id = ef.resource_id
      ${whereClause}
      GROUP BY er.id, er.resource_name, er.category, er.resource_type, er.scope, er.description, er.created_at
      ORDER BY er.scope, er.category, er.resource_name
    `, params);

    res.json({
      success: true,
      data: {
        resources: resourcesResult.rows.map(resource => ({
          id: resource.id,
          name: resource.name,
          category: resource.category,
          type: resource.type,
          scope: resource.scope,
          description: resource.description,
          availableFactors: parseInt(resource.available_factors),
          createdAt: resource.created_at
        }))
      }
    });

  } catch (error) {
    logger.error('Get emission resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get emission factor libraries
 * GET /api/emissions/libraries
 */
const getEmissionLibraries = async (req, res) => {
  try {
    const { year, region, isActive } = req.query;

    // Build WHERE clause for filters
    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    if (year) {
      whereConditions.push(`efl.year = $${paramIndex}`);
      params.push(parseInt(year));
      paramIndex++;
    }

    if (region) {
      whereConditions.push(`efl.region ILIKE $${paramIndex}`);
      params.push(`%${region}%`);
      paramIndex++;
    }

    if (isActive !== undefined) {
      whereConditions.push(`efl.is_active = $${paramIndex}`);
      params.push(isActive === 'true');
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const librariesResult = await query(`
      SELECT 
        efl.id,
        efl.library_name,
        efl.version,
        efl.year,
        efl.region,
        efl.description,
        efl.source_url,
        efl.is_active,
        efl.created_at,
        COUNT(ef.id) as factors_count
      FROM emission_factor_libraries efl
      LEFT JOIN emission_factors ef ON efl.id = ef.library_id
      ${whereClause}
      GROUP BY efl.id, efl.library_name, efl.version, efl.year, efl.region, efl.description, efl.source_url, efl.is_active, efl.created_at
      ORDER BY efl.year DESC, efl.library_name
    `, params);

    res.json({
      success: true,
      data: {
        libraries: librariesResult.rows.map(library => ({
          id: library.id,
          name: library.library_name,
          version: library.version,
          year: library.year,
          region: library.region,
          description: library.description,
          sourceUrl: library.source_url,
          isActive: library.is_active,
          factorsCount: parseInt(library.factors_count),
          createdAt: library.created_at
        }))
      }
    });

  } catch (error) {
    logger.error('Get emission libraries error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get emission factors
 * GET /api/emissions/factors
 */
const getEmissionFactors = async (req, res) => {
  try {
    const { resourceId, libraryId, scope, category } = req.query;

    // Build WHERE clause for filters
    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    if (resourceId) {
      whereConditions.push(`ef.resource_id = $${paramIndex}`);
      params.push(resourceId);
      paramIndex++;
    }

    if (libraryId) {
      whereConditions.push(`ef.library_id = $${paramIndex}`);
      params.push(libraryId);
      paramIndex++;
    }

    if (scope) {
      whereConditions.push(`er.scope = $${paramIndex}`);
      params.push(scope);
      paramIndex++;
    }

    if (category) {
      whereConditions.push(`er.category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const factorsResult = await query(`
      SELECT 
        ef.id,
        ef.resource_id,
        ef.library_id,
        ef.emission_factor,
        ef.emission_factor_unit,
        ef.heat_content,
        ef.heat_content_unit,
        ef.approximate_cost,
        ef.cost_unit,
        ef.availability_score,
        ef.created_at,
        er.resource_name,
        er.category as resource_category,
        er.resource_type,
        er.scope as resource_scope,
        efl.library_name,
        efl.version as library_version,
        efl.year as library_year,
        efl.region as library_region
      FROM emission_factors ef
      JOIN emission_resources er ON ef.resource_id = er.id
      JOIN emission_factor_libraries efl ON ef.library_id = efl.id
      ${whereClause}
      ORDER BY er.scope, er.category, er.resource_name, efl.year DESC
    `, params);

    res.json({
      success: true,
      data: {
        factors: factorsResult.rows.map(factor => ({
          id: factor.id,
          emissionFactor: parseFloat(factor.emission_factor),
          emissionFactorUnit: factor.emission_factor_unit,
          heatContent: parseFloat(factor.heat_content),
          heatContentUnit: factor.heat_content_unit,
          approximateCost: parseFloat(factor.approximate_cost),
          costUnit: factor.cost_unit,
          availabilityScore: parseInt(factor.availability_score),
          resource: {
            id: factor.resource_id,
            name: factor.resource_name,
            category: factor.resource_category,
            type: factor.resource_type,
            scope: factor.resource_scope
          },
          library: {
            id: factor.library_id,
            name: factor.library_name,
            version: factor.library_version,
            year: factor.library_year,
            region: factor.library_region
          },
          createdAt: factor.created_at
        }))
      }
    });

  } catch (error) {
    logger.error('Get emission factors error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get emission data for a facility
 * GET /api/emissions/data/:facilityId
 */
const getEmissionData = async (req, res) => {
  try {
    const { facilityId } = req.params;
    const { organizationId } = req.user;
    const { year, month, scope } = req.query;

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
    let whereConditions = ['ed.facility_id = $1', 'ed.organization_id = $2'];
    let params = [facilityId, organizationId];
    let paramIndex = 3;

    if (year) {
      whereConditions.push(`ed.year = $${paramIndex}`);
      params.push(parseInt(year));
      paramIndex++;
    }

    if (month) {
      whereConditions.push(`ed.month = $${paramIndex}`);
      params.push(parseInt(month));
      paramIndex++;
    }

    if (scope) {
      whereConditions.push(`ed.scope = $${paramIndex}`);
      params.push(scope);
      paramIndex++;
    }

    const emissionDataResult = await query(`
      SELECT 
        ed.id,
        ed.month,
        ed.year,
        ed.scope,
        ed.consumption,
        ed.consumption_unit,
        ed.emission_factor,
        ed.heat_content,
        ed.total_emissions,
        ed.total_energy,
        ed.created_at,
        ed.updated_at,
        er.resource_name,
        er.category as resource_category,
        er.resource_type,
        efl.library_name,
        efl.version as library_version
      FROM emission_data ed
      JOIN facility_resources fr ON ed.facility_resource_id = fr.id
      JOIN emission_resources er ON fr.resource_id = er.id
      JOIN emission_factors ef ON fr.emission_factor_id = ef.id
      JOIN emission_factor_libraries efl ON ef.library_id = efl.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ed.year DESC, ed.month DESC, ed.scope, er.resource_name
    `, params);

    res.json({
      success: true,
      data: {
        facilityId,
        emissionData: emissionDataResult.rows.map(data => ({
          id: data.id,
          month: data.month,
          year: data.year,
          scope: data.scope,
          consumption: parseFloat(data.consumption),
          consumptionUnit: data.consumption_unit,
          emissionFactor: parseFloat(data.emission_factor),
          heatContent: parseFloat(data.heat_content),
          totalEmissions: parseFloat(data.total_emissions),
          totalEnergy: parseFloat(data.total_energy),
          resource: {
            name: data.resource_name,
            category: data.resource_category,
            type: data.resource_type
          },
          library: {
            name: data.library_name,
            version: data.library_version
          },
          createdAt: data.created_at,
          updatedAt: data.updated_at
        }))
      }
    });

  } catch (error) {
    logger.error('Get emission data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Create emission data entry
 * POST /api/emissions/data
 */
const createEmissionData = async (req, res) => {
  try {
    const { facilityId, facilityResourceId, month, year, consumption, consumptionUnit } = req.body;
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

    // Get facility resource configuration
    const facilityResourceResult = await query(`
      SELECT 
        fr.id,
        fr.resource_id,
        fr.emission_factor_id,
        er.scope,
        ef.emission_factor,
        ef.heat_content
      FROM facility_resources fr
      JOIN emission_resources er ON fr.resource_id = er.id
      JOIN emission_factors ef ON fr.emission_factor_id = ef.id
      WHERE fr.id = $1 AND fr.facility_id = $2 AND fr.organization_id = $3 AND fr.is_active = true
    `, [facilityResourceId, facilityId, organizationId]);

    if (facilityResourceResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Facility resource configuration not found'
      });
    }

    const facilityResource = facilityResourceResult.rows[0];

    // Check if data already exists for this month/year/resource
    const existingDataResult = await query(`
      SELECT id FROM emission_data 
      WHERE facility_id = $1 AND facility_resource_id = $2 AND month = $3 AND year = $4
    `, [facilityId, facilityResourceId, month, year]);

    if (existingDataResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Emission data already exists for this period and resource'
      });
    }

    // Calculate total emissions and energy
    const emissionFactor = parseFloat(facilityResource.emission_factor);
    const heatContent = parseFloat(facilityResource.heat_content);
    const consumptionValue = parseFloat(consumption);

    const totalEmissions = consumptionValue * emissionFactor;
    const totalEnergy = consumptionValue * heatContent;

    // Create emission data entry
    const emissionDataId = uuidv4();
    const createResult = await query(`
      INSERT INTO emission_data (
        id, organization_id, facility_id, facility_resource_id, 
        month, year, scope, consumption, consumption_unit, 
        emission_factor, heat_content, total_emissions, total_energy
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, month, year, scope, consumption, consumption_unit, 
                emission_factor, heat_content, total_emissions, total_energy, created_at
    `, [
      emissionDataId, organizationId, facilityId, facilityResourceId,
      month, year, facilityResource.scope, consumption, consumptionUnit,
      emissionFactor, heatContent, totalEmissions, totalEnergy
    ]);

    const newEmissionData = createResult.rows[0];

    logger.info(`Emission data created for facility ${facilityId}`, {
      emissionDataId: emissionDataId,
      facilityId: facilityId,
      month: month,
      year: year,
      scope: facilityResource.scope,
      totalEmissions: totalEmissions,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Emission data created successfully',
      data: {
        emissionData: {
          id: newEmissionData.id,
          month: newEmissionData.month,
          year: newEmissionData.year,
          scope: newEmissionData.scope,
          consumption: parseFloat(newEmissionData.consumption),
          consumptionUnit: newEmissionData.consumption_unit,
          emissionFactor: parseFloat(newEmissionData.emission_factor),
          heatContent: parseFloat(newEmissionData.heat_content),
          totalEmissions: parseFloat(newEmissionData.total_emissions),
          totalEnergy: parseFloat(newEmissionData.total_energy),
          createdAt: newEmissionData.created_at
        }
      }
    });

  } catch (error) {
    logger.error('Create emission data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Configure facility resource
 * POST /api/emissions/facilities/:facilityId/resources
 */
const configureFacilityResource = async (req, res) => {
  try {
    const { facilityId } = req.params;
    const { resourceId, emissionFactorId } = req.body;
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
      SELECT id FROM facilities 
      WHERE id = $1 AND organization_id = $2
    `, [facilityId, organizationId]);

    if (facilityCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }

    // Check if resource and emission factor exist
    const resourceCheck = await query(`
      SELECT er.id, er.name, ef.id as factor_id
      FROM emission_resources er
      JOIN emission_factors ef ON er.id = ef.resource_id
      WHERE er.id = $1 AND ef.id = $2
    `, [resourceId, emissionFactorId]);

    if (resourceCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resource or emission factor not found'
      });
    }

    // Check if resource is already configured for this facility
    const existingConfigResult = await query(`
      SELECT id FROM facility_resources 
      WHERE facility_id = $1 AND resource_id = $2 AND organization_id = $3
    `, [facilityId, resourceId, organizationId]);

    if (existingConfigResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Resource already configured for this facility'
      });
    }

    // Create facility resource configuration
    const facilityResourceId = uuidv4();
    const createResult = await query(`
      INSERT INTO facility_resources (id, organization_id, facility_id, resource_id, emission_factor_id, is_active)
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING id, created_at
    `, [facilityResourceId, organizationId, facilityId, resourceId, emissionFactorId]);

    const newFacilityResource = createResult.rows[0];

    logger.info(`Facility resource configured`, {
      facilityResourceId: facilityResourceId,
      facilityId: facilityId,
      resourceId: resourceId,
      emissionFactorId: emissionFactorId,
      configuredBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Facility resource configured successfully',
      data: {
        facilityResource: {
          id: newFacilityResource.id,
          facilityId: facilityId,
          resourceId: resourceId,
          emissionFactorId: emissionFactorId,
          isActive: true,
          createdAt: newFacilityResource.created_at
        }
      }
    });

  } catch (error) {
    logger.error('Configure facility resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update emission data entry
 * PUT /api/emissions/data/:id
 */
const updateEmissionData = async (req, res) => {
  try {
    const { id } = req.params;
    const { consumption, consumptionUnit } = req.body;
    const { organizationId } = req.user;

    // Check if emission data exists and belongs to user's organization
    const existingDataResult = await query(`
      SELECT ed.*, fr.emission_factor_id, ef.emission_factor, ef.heat_content
      FROM emission_data ed
      JOIN facility_resources fr ON ed.facility_resource_id = fr.id
      JOIN emission_factors ef ON fr.emission_factor_id = ef.id
      JOIN facilities f ON ed.facility_id = f.id
      WHERE ed.id = $1 AND f.organization_id = $2
    `, [id, organizationId]);

    if (existingDataResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Emission data not found'
      });
    }

    const existingData = existingDataResult.rows[0];
    
    // Calculate new totals if consumption changed
    const newConsumption = consumption !== undefined ? parseFloat(consumption) : parseFloat(existingData.consumption);
    const newConsumptionUnit = consumptionUnit || existingData.consumption_unit;
    const emissionFactor = parseFloat(existingData.emission_factor);
    const heatContent = parseFloat(existingData.heat_content) || 0;
    
    const totalEmissions = newConsumption * emissionFactor;
    const totalEnergy = newConsumption * heatContent;

    // Update emission data
    const updateResult = await query(`
      UPDATE emission_data 
      SET 
        consumption = $1,
        consumption_unit = $2,
        total_emissions = $3,
        total_energy = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `, [newConsumption, newConsumptionUnit, totalEmissions, totalEnergy, id]);

    const updatedRecord = updateResult.rows[0];

    logger.info(`Updated emission data entry ${id}`, {
      facilityId: updatedRecord.facility_id,
      period: `${updatedRecord.year}-${updatedRecord.month}`,
      consumption: newConsumption,
      totalEmissions
    });

    res.json({
      success: true,
      message: 'Emission data updated successfully',
      data: updatedRecord
    });

  } catch (error) {
    logger.error('Update emission data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete emission data entry
 * DELETE /api/emissions/data/:id
 */
const deleteEmissionData = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    // Check if emission data exists and belongs to user's organization
    const existingDataResult = await query(`
      SELECT ed.*, f.organization_id 
      FROM emission_data ed
      JOIN facilities f ON ed.facility_id = f.id
      WHERE ed.id = $1 AND f.organization_id = $2
    `, [id, organizationId]);

    if (existingDataResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Emission data not found'
      });
    }

    const emissionData = existingDataResult.rows[0];

    // Delete emission data
    await query(`
      DELETE FROM emission_data WHERE id = $1
    `, [id]);

    logger.info(`Deleted emission data entry ${id}`, {
      facilityId: emissionData.facility_id,
      period: `${emissionData.year}-${emissionData.month}`,
      scope: emissionData.scope
    });

    res.json({
      success: true,
      message: 'Emission data deleted successfully'
    });

  } catch (error) {
    logger.error('Delete emission data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get single emission data entry by ID
 * GET /api/emissions/data/entry/:id
 */
const getEmissionDataById = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    const emissionDataResult = await query(`
      SELECT 
        ed.id,
        ed.facility_id,
        ed.month,
        ed.year,
        ed.scope,
        ed.consumption,
        ed.consumption_unit,
        ed.emission_factor,
        ed.heat_content,
        ed.total_emissions,
        ed.total_energy,
        ed.created_at,
        ed.updated_at,
        er.resource_name,
        er.category as resource_category,
        er.resource_type,
        efl.library_name,
        efl.version as library_version,
        f.name as facility_name
      FROM emission_data ed
      JOIN facility_resources fr ON ed.facility_resource_id = fr.id
      JOIN emission_resources er ON fr.resource_id = er.id
      JOIN emission_factors ef ON fr.emission_factor_id = ef.id
      JOIN emission_factor_libraries efl ON ef.library_id = efl.id
      JOIN facilities f ON ed.facility_id = f.id
      WHERE ed.id = $1 AND f.organization_id = $2
    `, [id, organizationId]);

    if (emissionDataResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Emission data not found'
      });
    }

    const data = emissionDataResult.rows[0];

    res.json({
      success: true,
      data: {
        id: data.id,
        facilityId: data.facility_id,
        facilityName: data.facility_name,
        month: data.month,
        year: data.year,
        scope: data.scope,
        consumption: parseFloat(data.consumption),
        consumptionUnit: data.consumption_unit,
        emissionFactor: parseFloat(data.emission_factor),
        heatContent: parseFloat(data.heat_content),
        totalEmissions: parseFloat(data.total_emissions),
        totalEnergy: parseFloat(data.total_energy),
        resource: {
          name: data.resource_name,
          category: data.resource_category,
          type: data.resource_type
        },
        library: {
          name: data.library_name,
          version: data.library_version
        },
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    });

  } catch (error) {
    logger.error('Get emission data by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get organization emission resource configurations
 * GET /api/emissions/configurations/organization
 */
const getOrganizationResourceConfigurations = async (req, res) => {
  try {
    const { organizationId } = req.user;

    // Get organization-level emission resource configurations
    const configurationsResult = await query(`
      SELECT 
        erc.id as configuration_id,
        erc.is_active,
        erc.created_at as configured_at,
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
      FROM emission_resource_configurations erc
      JOIN emission_resources er ON erc.resource_id = er.id
      JOIN emission_factors ef ON erc.emission_factor_id = ef.id
      JOIN emission_factor_libraries efl ON ef.library_id = efl.id
      WHERE erc.organization_id = $1 AND erc.is_active = true
      ORDER BY er.scope, er.category, er.resource_name
    `, [organizationId]);

    res.json({
      success: true,
      data: {
        configurations: configurationsResult.rows
      }
    });

  } catch (error) {
    logger.error('Get organization resource configurations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Configure organization emission resource
 * POST /api/emissions/configurations/organization
 */
const configureOrganizationResource = async (req, res) => {
  try {
    const { resourceId, emissionFactorId } = req.body;
    const { organizationId } = req.user;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin role required to configure organization resources'
      });
    }

    // Check if resource and emission factor exist
    const resourceCheck = await query(`
      SELECT er.id, er.resource_name, ef.id as factor_id
      FROM emission_resources er
      JOIN emission_factors ef ON er.id = ef.resource_id
      WHERE er.id = $1 AND ef.id = $2
    `, [resourceId, emissionFactorId]);

    if (resourceCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resource or emission factor not found'
      });
    }

    // Check if resource is already configured for this organization
    const existingConfigResult = await query(`
      SELECT id FROM emission_resource_configurations 
      WHERE organization_id = $1 AND resource_id = $2 AND emission_factor_id = $3
    `, [organizationId, resourceId, emissionFactorId]);

    if (existingConfigResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Resource already configured for this organization'
      });
    }

    // Create organization emission resource configuration
    const configurationId = uuidv4();
    const createResult = await query(`
      INSERT INTO emission_resource_configurations (id, organization_id, resource_id, emission_factor_id, is_active)
      VALUES ($1, $2, $3, $4, true)
      RETURNING id, created_at
    `, [configurationId, organizationId, resourceId, emissionFactorId]);

    const newConfiguration = createResult.rows[0];

    logger.info(`Organization resource configured`, {
      configurationId: configurationId,
      organizationId: organizationId,
      resourceId: resourceId,
      emissionFactorId: emissionFactorId,
      configuredBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Organization resource configured successfully',
      data: {
        configuration: {
          id: newConfiguration.id,
          organizationId: organizationId,
          resourceId: resourceId,
          emissionFactorId: emissionFactorId,
          isActive: true,
          createdAt: newConfiguration.created_at
        }
      }
    });

  } catch (error) {
    logger.error('Configure organization resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get facility emission resource assignments
 * GET /api/emissions/configurations/facility/:facilityId
 */
const getFacilityResourceAssignments = async (req, res) => {
  try {
    const { facilityId } = req.params;
    const { organizationId } = req.user;

    logger.info(`Getting facility resource assignments for facility: ${facilityId}, organization: ${organizationId}`);

    // Check if facility exists and belongs to organization
    const facilityCheck = await query(`
      SELECT id, name FROM facilities 
      WHERE id = $1 AND organization_id = $2
    `, [facilityId, organizationId]);

    logger.info(`Facility check result: ${facilityCheck.rows.length} rows found`);

    if (facilityCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }

    // Get facility resource assignments
    logger.info(`Querying facility resource assignments...`);
    
    const assignmentsResult = await query(`
      SELECT 
        erfc.id as assignment_id,
        erfc.is_active,
        erfc.effective_from,
        erfc.effective_to,
        erfc.created_at as assigned_at,
        erc.id as configuration_id,
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
      FROM emission_resource_facility_configurations erfc
      JOIN emission_resource_configurations erc ON erfc.emission_resource_config_id = erc.id
      JOIN emission_resources er ON erc.resource_id = er.id
      JOIN emission_factors ef ON erc.emission_factor_id = ef.id
      JOIN emission_factor_libraries efl ON ef.library_id = efl.id
      WHERE erfc.facility_id = $1 AND erfc.organization_id = $2 AND erfc.is_active = true
      ORDER BY er.scope, er.category, er.resource_name
    `, [facilityId, organizationId]);

    logger.info(`Assignments query result: ${assignmentsResult.rows.length} rows found`);

    res.json({
      success: true,
      data: {
        facilityId: facilityId,
        assignments: assignmentsResult.rows
      }
    });

  } catch (error) {
    logger.error('Get facility resource assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Assign organization resource to facility
 * POST /api/emissions/configurations/facility/:facilityId/assign
 */
const assignResourceToFacility = async (req, res) => {
  try {
    const { facilityId } = req.params;
    const { configurationId } = req.body;
    const { organizationId } = req.user;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin role required to assign facility resources'
      });
    }

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

    // Check if configuration exists and belongs to organization
    const configCheck = await query(`
      SELECT id FROM emission_resource_configurations 
      WHERE id = $1 AND organization_id = $2 AND is_active = true
    `, [configurationId, organizationId]);

    if (configCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resource configuration not found'
      });
    }

    // Check if already assigned
    const existingAssignmentResult = await query(`
      SELECT id FROM emission_resource_facility_configurations 
      WHERE facility_id = $1 AND emission_resource_config_id = $2 AND is_active = true
    `, [facilityId, configurationId]);

    if (existingAssignmentResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Resource already assigned to this facility'
      });
    }

    // Create facility resource assignment
    const assignmentId = uuidv4();
    const createResult = await query(`
      INSERT INTO emission_resource_facility_configurations (id, organization_id, facility_id, emission_resource_config_id, is_active)
      VALUES ($1, $2, $3, $4, true)
      RETURNING id, created_at
    `, [assignmentId, organizationId, facilityId, configurationId]);

    const newAssignment = createResult.rows[0];

    logger.info(`Resource assigned to facility`, {
      assignmentId: assignmentId,
      facilityId: facilityId,
      configurationId: configurationId,
      assignedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Resource assigned to facility successfully',
      data: {
        assignment: {
          id: newAssignment.id,
          facilityId: facilityId,
          configurationId: configurationId,
          isActive: true,
          createdAt: newAssignment.created_at
        }
      }
    });

  } catch (error) {
    logger.error('Assign resource to facility error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getEmissionResources,
  getEmissionLibraries,
  getEmissionFactors,
  getEmissionData,
  createEmissionData,
  updateEmissionData,
  deleteEmissionData,
  getEmissionDataById,
  configureFacilityResource,
  getOrganizationResourceConfigurations,
  configureOrganizationResource,
  getFacilityResourceAssignments,
  assignResourceToFacility
};
