const Joi = require('joi');
const { logger } = require('../utils/logger');

/**
 * Validation Middleware
 * Validates request data using Joi schemas
 */

/**
 * Generic validation middleware
 * @param {Object} schema - Joi schema object with body, params, query properties
 */
const validate = (schema) => {
  return (req, res, next) => {
    const validationErrors = [];

    // Validate request body
    if (schema.body) {
      const { error } = schema.body.validate(req.body);
      if (error) {
        validationErrors.push({
          field: 'body',
          message: error.details[0].message,
          path: error.details[0].path
        });
      }
    }

    // Validate request params
    if (schema.params) {
      const { error } = schema.params.validate(req.params);
      if (error) {
        validationErrors.push({
          field: 'params',
          message: error.details[0].message,
          path: error.details[0].path
        });
      }
    }

    // Validate request query
    if (schema.query) {
      const { error } = schema.query.validate(req.query);
      if (error) {
        validationErrors.push({
          field: 'query',
          message: error.details[0].message,
          path: error.details[0].path
        });
      }
    }

    if (validationErrors.length > 0) {
      logger.warn('Validation failed:', {
        url: req.url,
        method: req.method,
        errors: validationErrors
      });

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    next();
  };
};

// Common validation schemas
const schemas = {
  // Authentication schemas
  login: {
    body: Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
      password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required'
      })
    })
  },

  updateProfile: {
    body: Joi.object({
      firstName: Joi.string().min(2).max(50).required().messages({
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name must not exceed 50 characters',
        'any.required': 'First name is required'
      }),
      lastName: Joi.string().min(2).max(50).required().messages({
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name must not exceed 50 characters',
        'any.required': 'Last name is required'
      })
    })
  },

  changePassword: {
    body: Joi.object({
      currentPassword: Joi.string().required().messages({
        'any.required': 'Current password is required'
      }),
      newPassword: Joi.string().min(6).required().messages({
        'string.min': 'New password must be at least 6 characters long',
        'any.required': 'New password is required'
      })
    })
  },

  // UUID parameter validation
  uuidParam: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        'string.guid': 'Invalid ID format',
        'any.required': 'ID is required'
      })
    })
  },

  // Pagination validation
  pagination: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      sortBy: Joi.string().default('created_at'),
      sortOrder: Joi.string().valid('asc', 'desc').default('desc')
    })
  },

  // Organization schemas
  createOrganization: {
    body: Joi.object({
      name: Joi.string().min(2).max(255).required().messages({
        'string.min': 'Organization name must be at least 2 characters long',
        'string.max': 'Organization name must not exceed 255 characters',
        'any.required': 'Organization name is required'
      }),
      description: Joi.string().max(1000).optional(),
      subscriptionPlan: Joi.string().valid('trial', 'professional', 'enterprise').default('trial')
    })
  },

  updateOrganization: {
    body: Joi.object({
      name: Joi.string().min(2).max(255).optional(),
      description: Joi.string().max(1000).optional(),
      subscriptionPlan: Joi.string().valid('trial', 'professional', 'enterprise').optional()
    })
  },

  // Facility schemas
  createFacility: {
    body: Joi.object({
      name: Joi.string().min(2).max(255).required(),
      description: Joi.string().max(1000).optional(),
      location: Joi.object({
        address: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        country: Joi.string().required(),
        latitude: Joi.number().optional(),
        longitude: Joi.number().optional(),
        capacity_mtpa: Joi.number().positive().optional()
      }).required()
    })
  },

  updateFacility: {
    body: Joi.object({
      name: Joi.string().min(2).max(255).optional(),
      description: Joi.string().max(1000).optional(),
      location: Joi.object({
        address: Joi.string().optional(),
        city: Joi.string().optional(),
        state: Joi.string().optional(),
        country: Joi.string().optional(),
        latitude: Joi.number().optional(),
        longitude: Joi.number().optional(),
        capacity_mtpa: Joi.number().positive().optional()
      }).optional(),
      status: Joi.string().valid('active', 'inactive').optional()
    })
  },

  // Emission data schemas
  createEmissionData: {
    body: Joi.object({
      facilityId: Joi.string().uuid().required(),
      facilityResourceId: Joi.string().uuid().required(),
      month: Joi.number().integer().min(1).max(12).required(),
      year: Joi.number().integer().min(2000).max(2100).required(),
      consumption: Joi.number().positive().required(),
      consumptionUnit: Joi.string().required()
    })
  },

  // Production data schemas
  createProductionData: {
    body: Joi.object({
      facilityId: Joi.string().uuid().required(),
      month: Joi.number().integer().min(1).max(12).required(),
      year: Joi.number().integer().min(2000).max(2100).required(),
      cementProduction: Joi.number().positive().required(),
      unit: Joi.string().default('tonnes')
    })
  },

  // User schemas
  createUser: {
    body: Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
      firstName: Joi.string().min(2).max(50).required().messages({
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name must not exceed 50 characters',
        'any.required': 'First name is required'
      }),
      lastName: Joi.string().min(2).max(50).required().messages({
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name must not exceed 50 characters',
        'any.required': 'Last name is required'
      }),
      role: Joi.string().valid('admin', 'user').default('user'),
      password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required'
      })
    })
  },

  updateUser: {
    body: Joi.object({
      firstName: Joi.string().min(2).max(50).optional(),
      lastName: Joi.string().min(2).max(50).optional(),
      role: Joi.string().valid('admin', 'user').optional(),
      status: Joi.string().valid('active', 'inactive', 'pending').optional()
    })
  },

  updateUserPassword: {
    body: Joi.object({
      newPassword: Joi.string().min(6).required().messages({
        'string.min': 'New password must be at least 6 characters long',
        'any.required': 'New password is required'
      })
    })
  },

  userQuery: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      role: Joi.string().valid('admin', 'user').optional(),
      status: Joi.string().valid('active', 'inactive', 'pending').optional(),
      search: Joi.string().min(2).max(100).optional()
    })
  },

  // Date range validation
  dateRange: {
    query: Joi.object({
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
      year: Joi.number().integer().min(2000).max(2100).optional(),
      month: Joi.number().integer().min(1).max(12).optional()
    })
  }
};

/**
 * Business Logic Validation
 * Advanced validation rules for sustainability data
 */
const businessValidation = {
  // Validate emission factor compatibility
  emissionFactorCompatibility: (resourceType, scope, emissionFactor) => {
    const errors = [];
    
    // Scope 1 resources should have higher emission factors than Scope 2
    if (scope === 'scope2' && emissionFactor > 10) {
      errors.push('Scope 2 emission factors typically should be less than 10 kgCO2e/unit');
    }
    
    // Common ranges for cement industry
    const ranges = {
      'coal': { min: 2.0, max: 3.5 }, // kgCO2e/kg
      'natural_gas': { min: 1.8, max: 2.5 },
      'electricity': { min: 0.1, max: 1.5 },
      'diesel': { min: 2.5, max: 3.2 }
    };
    
    const resourceTypeKey = resourceType.toLowerCase().replace(/[^a-z]/g, '');
    if (ranges[resourceTypeKey]) {
      const range = ranges[resourceTypeKey];
      if (emissionFactor < range.min || emissionFactor > range.max) {
        errors.push(`Emission factor for ${resourceType} typically ranges from ${range.min} to ${range.max} kgCO2e/unit`);
      }
    }
    
    return errors;
  },

  // Validate production capacity constraints
  productionCapacityValidation: (facilityCapacity, monthlyProduction, month, year) => {
    const errors = [];
    const warnings = [];
    
    if (!facilityCapacity || facilityCapacity <= 0) {
      errors.push('Facility capacity must be specified and positive');
      return { errors, warnings };
    }
    
    // Convert annual capacity to monthly (assuming MTPA)
    const monthlyCapacity = (facilityCapacity * 1000000) / 12; // tonnes per month
    
    // Check if production exceeds capacity
    if (monthlyProduction > monthlyCapacity) {
      errors.push(`Monthly production (${monthlyProduction} tonnes) exceeds facility capacity (${monthlyCapacity.toFixed(0)} tonnes/month)`);
    }
    
    // Check utilization rates
    const utilizationRate = (monthlyProduction / monthlyCapacity) * 100;
    
    if (utilizationRate > 100) {
      errors.push(`Capacity utilization exceeds 100% (${utilizationRate.toFixed(1)}%)`);
    } else if (utilizationRate > 95) {
      warnings.push(`Very high capacity utilization (${utilizationRate.toFixed(1)}%) - please verify data accuracy`);
    } else if (utilizationRate < 10) {
      warnings.push(`Very low capacity utilization (${utilizationRate.toFixed(1)}%) - may indicate operational issues`);
    }
    
    return { errors, warnings, utilizationRate: utilizationRate.toFixed(1) };
  },

  // Validate emission intensity against industry benchmarks
  emissionIntensityValidation: (carbonIntensity, facilityType = 'cement_plant') => {
    const errors = [];
    const warnings = [];
    
    // Industry benchmarks for cement plants (kgCO2e/tonne)
    const benchmarks = {
      cement_plant: {
        best_practice: 700,
        industry_average: 900,
        regulatory_limit: 1200,
        industry_worst: 1500
      }
    };
    
    const benchmark = benchmarks[facilityType];
    if (!benchmark) {
      warnings.push(`No benchmarks available for facility type: ${facilityType}`);
      return { errors, warnings };
    }
    
    if (carbonIntensity > benchmark.industry_worst) {
      errors.push(`Carbon intensity (${carbonIntensity.toFixed(1)} kgCO2e/tonne) exceeds industry worst performance (${benchmark.industry_worst})`);
    } else if (carbonIntensity > benchmark.regulatory_limit) {
      warnings.push(`Carbon intensity (${carbonIntensity.toFixed(1)} kgCO2e/tonne) exceeds typical regulatory limits (${benchmark.regulatory_limit})`);
    } else if (carbonIntensity > benchmark.industry_average * 1.2) {
      warnings.push(`Carbon intensity (${carbonIntensity.toFixed(1)} kgCO2e/tonne) is above industry average (${benchmark.industry_average})`);
    } else if (carbonIntensity < benchmark.best_practice * 0.8) {
      warnings.push(`Carbon intensity (${carbonIntensity.toFixed(1)} kgCO2e/tonne) is exceptionally low - please verify calculation`);
    }
    
    return { errors, warnings };
  },

  // Validate target feasibility
  targetFeasibilityValidation: (baseline, target, timespan, historicalData = []) => {
    const errors = [];
    const warnings = [];
    
    if (timespan <= 0) {
      errors.push('Target timespan must be positive');
      return { errors, warnings };
    }
    
    // Calculate required annual change rate
    const totalChange = Math.abs(target - baseline);
    const annualChangeRate = (totalChange / baseline) / timespan * 100;
    
    // Check feasibility based on change rate
    if (annualChangeRate > 50) {
      errors.push(`Target requires extreme annual changes (${annualChangeRate.toFixed(1)}% per year) - may not be feasible`);
    } else if (annualChangeRate > 25) {
      warnings.push(`Target requires aggressive annual changes (${annualChangeRate.toFixed(1)}% per year) - ensure adequate resources and planning`);
    } else if (annualChangeRate > 15) {
      warnings.push(`Target requires significant annual changes (${annualChangeRate.toFixed(1)}% per year) - ambitious but achievable with strong commitment`);
    }
    
    // Analyze historical trend if available
    if (historicalData.length >= 3) {
      const values = historicalData.map(d => d.value).filter(v => v !== null && v !== undefined);
      if (values.length >= 3) {
        // Calculate historical trend
        const firstValue = values[0];
        const lastValue = values[values.length - 1];
        const historicalTimespan = historicalData.length - 1;
        const historicalChangeRate = Math.abs((lastValue - firstValue) / firstValue) / historicalTimespan * 100;
        
        if (annualChangeRate > historicalChangeRate * 3) {
          warnings.push(`Target change rate (${annualChangeRate.toFixed(1)}%/year) is much faster than historical performance (${historicalChangeRate.toFixed(1)}%/year)`);
        }
      }
    }
    
    return { errors, warnings };
  },

  // Validate data consistency across related records
  dataConsistencyValidation: (emissionData, productionData, facilityData) => {
    const errors = [];
    const warnings = [];
    
    // Check emission-production alignment
    if (emissionData && productionData) {
      const emissionMonths = new Set(emissionData.map(e => `${e.year}-${e.month}`));
      const productionMonths = new Set(productionData.map(p => `${p.year}-${p.month}`));
      
      // Find missing production data for emission periods
      const missingProduction = [...emissionMonths].filter(month => !productionMonths.has(month));
      if (missingProduction.length > 0) {
        warnings.push(`Missing production data for periods with emission data: ${missingProduction.join(', ')}`);
      }
      
      // Find missing emission data for production periods
      const missingEmissions = [...productionMonths].filter(month => !emissionMonths.has(month));
      if (missingEmissions.length > 0) {
        warnings.push(`Missing emission data for periods with production data: ${missingEmissions.join(', ')}`);
      }
    }
    
    // Check facility capacity consistency
    if (facilityData && productionData) {
      const facilityCapacity = facilityData.capacity_mtpa;
      if (facilityCapacity) {
        const maxMonthlyProduction = Math.max(...productionData.map(p => p.cement_production || 0));
        const maxMonthlyCapacity = (facilityCapacity * 1000000) / 12;
        
        if (maxMonthlyProduction > maxMonthlyCapacity * 1.1) { // 10% tolerance
          errors.push(`Maximum monthly production (${maxMonthlyProduction.toLocaleString()} tonnes) significantly exceeds facility capacity (${maxMonthlyCapacity.toLocaleString()} tonnes/month)`);
        }
      }
    }
    
    return { errors, warnings };
  }
};

/**
 * Enhanced validation middleware with business logic
 */
const validateWithBusinessLogic = (validationConfig) => {
  return async (req, res, next) => {
    try {
      // First, run standard validation
      const standardValidation = validate(validationConfig);
      await new Promise((resolve, reject) => {
        standardValidation(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      // Then run business logic validation
      const businessValidationResult = await runBusinessValidation(req);
      
      if (businessValidationResult.errors.length > 0) {
        return res.status(422).json({
          success: false,
          message: 'Business logic validation failed',
          errors: businessValidationResult.errors,
          warnings: businessValidationResult.warnings
        });
      }
      
      // Attach warnings to request for logging
      if (businessValidationResult.warnings.length > 0) {
        req.validationWarnings = businessValidationResult.warnings;
      }
      
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
  };
};

/**
 * Run business validation based on endpoint
 */
const runBusinessValidation = async (req) => {
  const errors = [];
  const warnings = [];
  
  const path = req.route.path;
  const method = req.method;
  
  // Emission data validation
  if (path.includes('/emissions/data') && method === 'POST') {
    const { consumption, facilityId } = req.body;
    
    // Validate consumption ranges
    if (consumption !== undefined) {
      if (consumption < 0) {
        errors.push('Consumption cannot be negative');
      } else if (consumption === 0) {
        warnings.push('Zero consumption may indicate missing data or non-operational period');
      } else if (consumption > 1000000) { // 1M units threshold
        warnings.push('Very high consumption value - please verify accuracy');
      }
    }
  }
  
  // Production data validation
  if (path.includes('/production/data') && method === 'POST') {
    const { cementProduction, facilityId, month, year } = req.body;
    
    // Business validation for production data
    
    if (cementProduction !== undefined && facilityId) {
      // Get facility data for capacity validation
      try {
        const { query } = require('../config/database');
        const facilityResult = await query(`
          SELECT 
            capacity_mtpa,
            location
          FROM facilities WHERE id = $1
        `, [facilityId]);
        
        if (facilityResult.rows.length > 0) {
          const facilityData = facilityResult.rows[0];
          let facilityCapacity = facilityData.capacity_mtpa;
          
          // Try to get capacity from location field if not in capacity_mtpa
          if (!facilityCapacity && facilityData.location) {
            try {
              const locationData = typeof facilityData.location === 'string' 
                ? JSON.parse(facilityData.location) 
                : facilityData.location;
              facilityCapacity = locationData.capacity_mtpa;
            } catch (e) {
              // Location data is not valid JSON
            }
          }
          
          if (facilityCapacity) {
            const validation = businessValidation.productionCapacityValidation(
              facilityCapacity, cementProduction, month, year
            );
            errors.push(...validation.errors);
            warnings.push(...validation.warnings);
          } else {
            warnings.push('Facility capacity not available - cannot validate production limits');
          }
        }
      } catch (dbError) {
        warnings.push('Could not validate against facility capacity');
      }
    }
  }
  
  // Target validation
  if (path.includes('/targets') && method === 'POST') {
    const { baselineValue, targetValue, baselineYear, targetYear } = req.body;
    
    if (baselineValue !== undefined && targetValue !== undefined && baselineYear && targetYear) {
      const timespan = targetYear - baselineYear;
      const validation = businessValidation.targetFeasibilityValidation(
        baselineValue, targetValue, timespan
      );
      errors.push(...validation.errors);
      warnings.push(...validation.warnings);
    }
  }
  
  return { errors, warnings };
};

module.exports = {
  validate,
  validateWithBusinessLogic,
  businessValidation,
  schemas
};
