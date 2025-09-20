/**
 * Data Validation Functions
 * Handles client-side validation and data quality checks
 */

/**
 * Generic validation rules
 */
export const validationRules = {
  required: (value) => {
    if (value === null || value === undefined || value === '') {
      return 'This field is required';
    }
    return null;
  },

  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Please enter a valid email address';
  },

  minLength: (min) => (value) => {
    if (!value) return null;
    return value.length >= min ? null : `Must be at least ${min} characters`;
  },

  maxLength: (max) => (value) => {
    if (!value) return null;
    return value.length <= max ? null : `Must be no more than ${max} characters`;
  },

  number: (value) => {
    if (!value && value !== 0) return null;
    return !isNaN(parseFloat(value)) && isFinite(value) ? null : 'Must be a valid number';
  },

  positiveNumber: (value) => {
    if (!value && value !== 0) return null;
    const num = parseFloat(value);
    if (isNaN(num) || !isFinite(num)) return 'Must be a valid number';
    return num >= 0 ? null : 'Must be a positive number';
  },

  range: (min, max) => (value) => {
    if (!value && value !== 0) return null;
    const num = parseFloat(value);
    if (isNaN(num) || !isFinite(num)) return 'Must be a valid number';
    if (num < min || num > max) return `Must be between ${min} and ${max}`;
    return null;
  },

  year: (value) => {
    if (!value) return null;
    const year = parseInt(value);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1900 || year > currentYear + 100) {
      return `Must be a valid year between 1900 and ${currentYear + 100}`;
    }
    return null;
  },

  month: (value) => {
    if (!value && value !== 0) return null;
    const month = parseInt(value);
    return (month >= 1 && month <= 12) ? null : 'Must be a valid month (1-12)';
  },

  percentage: (value) => {
    if (!value && value !== 0) return null;
    const num = parseFloat(value);
    if (isNaN(num) || !isFinite(num)) return 'Must be a valid number';
    return (num >= 0 && num <= 100) ? null : 'Must be between 0 and 100';
  },

  phone: (value) => {
    if (!value) return null;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(value.replace(/[\s\-\(\)]/g, '')) ? null : 'Please enter a valid phone number';
  },

  url: (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  },
};

/**
 * Form validation function
 */
export const validateForm = (data, schema) => {
  const errors = {};
  let isValid = true;

  Object.keys(schema).forEach(field => {
    const rules = Array.isArray(schema[field]) ? schema[field] : [schema[field]];
    const value = data[field];

    for (const rule of rules) {
      const error = typeof rule === 'function' ? rule(value) : null;
      if (error) {
        errors[field] = error;
        isValid = false;
        break; // Stop at first error for this field
      }
    }
  });

  return { isValid, errors };
};

/**
 * Entity-specific validation schemas
 */
export const validationSchemas = {
  // User validation
  user: {
    firstName: [validationRules.required, validationRules.minLength(2), validationRules.maxLength(50)],
    lastName: [validationRules.required, validationRules.minLength(2), validationRules.maxLength(50)],
    email: [validationRules.required, validationRules.email],
    role: [validationRules.required],
    phone: [validationRules.phone],
  },

  userPassword: {
    password: [
      validationRules.required,
      validationRules.minLength(8),
      (value) => {
        if (!value) return null;
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        
        if (!hasUpper) return 'Password must contain at least one uppercase letter';
        if (!hasLower) return 'Password must contain at least one lowercase letter';
        if (!hasNumber) return 'Password must contain at least one number';
        if (!hasSpecial) return 'Password must contain at least one special character';
        
        return null;
      }
    ],
    confirmPassword: [
      validationRules.required,
      (value, data) => {
        return value === data.password ? null : 'Passwords do not match';
      }
    ],
  },

  // Facility validation
  facility: {
    name: [validationRules.required, validationRules.minLength(3), validationRules.maxLength(100)],
    description: [validationRules.maxLength(500)],
    'location.city': [validationRules.required, validationRules.maxLength(100)],
    'location.state': [validationRules.required, validationRules.maxLength(100)],
    'location.country': [validationRules.required, validationRules.maxLength(100)],
    'location.capacity_mtpa': [validationRules.required, validationRules.positiveNumber],
    'location.capacity_tpd': [validationRules.positiveNumber],
    'location.commissioned_year': [validationRules.year],
    'location.technology': [validationRules.maxLength(100)],
    'location.latitude': [validationRules.range(-90, 90)],
    'location.longitude': [validationRules.range(-180, 180)],
  },

  // Emission data validation
  emissionData: {
    facilityId: [validationRules.required],
    facilityResourceId: [validationRules.required],
    month: [validationRules.required, validationRules.month],
    year: [validationRules.required, validationRules.year],
    consumption: [validationRules.required, validationRules.positiveNumber],
    consumptionUnit: [validationRules.required],
  },

  // Production data validation
  productionData: {
    facilityId: [validationRules.required],
    month: [validationRules.required, validationRules.month],
    year: [validationRules.required, validationRules.year],
    cementProduction: [validationRules.required, validationRules.positiveNumber],
    unit: [validationRules.required],
  },

  // Target validation
  target: {
    name: [validationRules.required, validationRules.minLength(5), validationRules.maxLength(200)],
    description: [validationRules.maxLength(1000)],
    targetType: [validationRules.required],
    baselineValue: [validationRules.required, validationRules.number],
    targetValue: [validationRules.required, validationRules.number],
    baselineYear: [validationRules.required, validationRules.year],
    targetYear: [
      validationRules.required,
      validationRules.year,
      (value, data) => {
        const baselineYear = parseInt(data.baselineYear);
        const targetYear = parseInt(value);
        if (isNaN(baselineYear) || isNaN(targetYear)) return null;
        return targetYear > baselineYear ? null : 'Target year must be after baseline year';
      }
    ],
    unit: [validationRules.required],
  },

  // Organization validation
  organization: {
    name: [validationRules.required, validationRules.minLength(3), validationRules.maxLength(200)],
    description: [validationRules.maxLength(1000)],
    website: [validationRules.url],
    phone: [validationRules.phone],
  },
};

/**
 * Data quality validation
 */
export const validateDataQuality = {
  // Check for missing critical data
  checkCompleteness: (data, requiredFields) => {
    const missing = requiredFields.filter(field => {
      const value = getNestedValue(data, field);
      return value === null || value === undefined || value === '';
    });

    return {
      isComplete: missing.length === 0,
      missingFields: missing,
      completeness: ((requiredFields.length - missing.length) / requiredFields.length) * 100,
    };
  },

  // Check for data consistency
  checkConsistency: (data) => {
    const issues = [];

    // Check emission data consistency
    if (data.emissions && Array.isArray(data.emissions)) {
      data.emissions.forEach((emission, index) => {
        if (emission.totalEmissions < 0) {
          issues.push(`Emission record ${index + 1}: Negative emissions value`);
        }
        if (emission.consumption <= 0) {
          issues.push(`Emission record ${index + 1}: Zero or negative consumption`);
        }
        if (emission.emissionFactor <= 0) {
          issues.push(`Emission record ${index + 1}: Zero or negative emission factor`);
        }
      });
    }

    // Check production data consistency
    if (data.production && Array.isArray(data.production)) {
      data.production.forEach((prod, index) => {
        if (prod.cementProduction < 0) {
          issues.push(`Production record ${index + 1}: Negative production value`);
        }
      });
    }

    // Check target consistency
    if (data.targets && Array.isArray(data.targets)) {
      data.targets.forEach((target, index) => {
        if (target.baselineYear >= target.targetYear) {
          issues.push(`Target ${index + 1}: Baseline year must be before target year`);
        }
      });
    }

    return {
      isConsistent: issues.length === 0,
      issues,
    };
  },

  // Check for outliers in numerical data
  checkOutliers: (values, threshold = 2) => {
    if (!Array.isArray(values) || values.length < 3) {
      return { outliers: [], cleanData: values };
    }

    const numericValues = values.filter(v => typeof v === 'number' && !isNaN(v));
    if (numericValues.length < 3) {
      return { outliers: [], cleanData: values };
    }

    // Calculate mean and standard deviation
    const mean = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
    const variance = numericValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numericValues.length;
    const stdDev = Math.sqrt(variance);

    const outliers = [];
    const cleanData = [];

    values.forEach((value, index) => {
      if (typeof value === 'number' && !isNaN(value)) {
        const zScore = Math.abs((value - mean) / stdDev);
        if (zScore > threshold) {
          outliers.push({ index, value, zScore });
        } else {
          cleanData.push(value);
        }
      } else {
        cleanData.push(value);
      }
    });

    return { outliers, cleanData };
  },

  // Validate time series data
  validateTimeSeries: (data, dateField = 'date') => {
    if (!Array.isArray(data) || data.length === 0) {
      return { isValid: true, issues: [] };
    }

    const issues = [];
    const sortedData = [...data].sort((a, b) => new Date(a[dateField]) - new Date(b[dateField]));

    // Check for gaps in time series
    for (let i = 1; i < sortedData.length; i++) {
      const current = new Date(sortedData[i][dateField]);
      const previous = new Date(sortedData[i - 1][dateField]);
      
      // Check for large gaps (more than expected interval)
      const diffMonths = (current.getFullYear() - previous.getFullYear()) * 12 + 
                        (current.getMonth() - previous.getMonth());
      
      if (diffMonths > 3) { // Gap of more than 3 months
        issues.push(`Gap in data between ${previous.toISOString().split('T')[0]} and ${current.toISOString().split('T')[0]}`);
      }
    }

    // Check for duplicate dates
    const dateMap = new Map();
    data.forEach((item, index) => {
      const dateKey = new Date(item[dateField]).toISOString().split('T')[0];
      if (dateMap.has(dateKey)) {
        issues.push(`Duplicate data for date ${dateKey} at indices ${dateMap.get(dateKey)} and ${index}`);
      } else {
        dateMap.set(dateKey, index);
      }
    });

    return {
      isValid: issues.length === 0,
      issues,
      dataIntegrity: {
        totalRecords: data.length,
        dateRange: {
          start: sortedData[0][dateField],
          end: sortedData[sortedData.length - 1][dateField],
        },
        duplicateCount: data.length - dateMap.size,
      }
    };
  },
};

/**
 * Real-time business logic validation
 */
export const realTimeValidation = {
  // Production capacity validation
  validateProductionCapacity: (production, facilityCapacity, tolerancePercent = 10) => {
    const errors = [];
    const warnings = [];
    
    if (!facilityCapacity || facilityCapacity <= 0) {
      warnings.push('Facility capacity not specified - cannot validate production limits');
      return { errors, warnings };
    }
    
    // Convert annual capacity to monthly (MTPA to tonnes/month)
    const monthlyCapacity = (facilityCapacity * 1000000) / 12;
    const utilizationRate = (production / monthlyCapacity) * 100;
    
    if (utilizationRate > 100 + tolerancePercent) {
      errors.push(`Production exceeds facility capacity by ${(utilizationRate - 100).toFixed(1)}%`);
    } else if (utilizationRate > 100) {
      warnings.push(`Production slightly exceeds nominal capacity (${utilizationRate.toFixed(1)}% utilization)`);
    } else if (utilizationRate > 95) {
      warnings.push(`Very high capacity utilization (${utilizationRate.toFixed(1)}%) - verify data accuracy`);
    } else if (utilizationRate < 10) {
      warnings.push(`Very low capacity utilization (${utilizationRate.toFixed(1)}%) - may indicate issues`);
    }
    
    return { errors, warnings, utilizationRate: utilizationRate.toFixed(1) };
  },

  // Emission factor range validation
  validateEmissionFactor: (factor, resourceType, scope) => {
    const errors = [];
    const warnings = [];
    
    // Industry standard ranges (kgCO2e per unit)
    const ranges = {
      'coal': { min: 2.0, max: 3.5, unit: 'kg' },
      'natural_gas': { min: 1.8, max: 2.5, unit: 'kg' },
      'electricity': { min: 0.1, max: 1.5, unit: 'kWh' },
      'diesel': { min: 2.5, max: 3.2, unit: 'L' },
      'petrol': { min: 2.2, max: 2.8, unit: 'L' },
      'lpg': { min: 1.5, max: 2.0, unit: 'kg' }
    };
    
    const resourceKey = resourceType.toLowerCase().replace(/[^a-z]/g, '');
    const range = ranges[resourceKey];
    
    if (scope === 'scope2' && factor > 10) {
      warnings.push('Scope 2 emission factors are typically lower than Scope 1 factors');
    }
    
    if (range) {
      if (factor < range.min) {
        warnings.push(`Emission factor (${factor}) is below typical range (${range.min}-${range.max} kgCO2e/${range.unit})`);
      } else if (factor > range.max) {
        warnings.push(`Emission factor (${factor}) is above typical range (${range.min}-${range.max} kgCO2e/${range.unit})`);
      }
    }
    
    if (factor <= 0) {
      errors.push('Emission factor must be positive');
    } else if (factor > 50) {
      warnings.push('Very high emission factor - please verify source data');
    }
    
    return { errors, warnings };
  },

  // Carbon intensity benchmarking
  validateCarbonIntensity: (intensity, industryType = 'cement') => {
    const errors = [];
    const warnings = [];
    
    const benchmarks = {
      cement: {
        best_practice: 700,
        good_performance: 800,
        industry_average: 900,
        poor_performance: 1100,
        regulatory_concern: 1200
      }
    };
    
    const benchmark = benchmarks[industryType];
    if (!benchmark) {
      warnings.push(`No benchmarks available for industry type: ${industryType}`);
      return { errors, warnings };
    }
    
    let performanceLevel = '';
    if (intensity <= benchmark.best_practice) {
      performanceLevel = 'Excellent (Best Practice)';
    } else if (intensity <= benchmark.good_performance) {
      performanceLevel = 'Good Performance';
    } else if (intensity <= benchmark.industry_average) {
      performanceLevel = 'Average Performance';
    } else if (intensity <= benchmark.poor_performance) {
      performanceLevel = 'Below Average';
      warnings.push(`Carbon intensity is above industry average (${benchmark.industry_average} kgCO2e/tonne)`);
    } else if (intensity <= benchmark.regulatory_concern) {
      performanceLevel = 'Poor Performance';
      warnings.push(`Carbon intensity exceeds good practice levels (${benchmark.good_performance} kgCO2e/tonne)`);
    } else {
      performanceLevel = 'Regulatory Concern';
      errors.push(`Carbon intensity may exceed regulatory limits (>${benchmark.regulatory_concern} kgCO2e/tonne)`);
    }
    
    return { errors, warnings, performanceLevel, benchmark: benchmark.industry_average };
  },

  // Target feasibility analysis
  validateTargetFeasibility: (baseline, target, timespan, historicalData = []) => {
    const errors = [];
    const warnings = [];
    const insights = [];
    
    if (timespan <= 0) {
      errors.push('Target timespan must be positive');
      return { errors, warnings, insights };
    }
    
    const totalChangePercent = ((target - baseline) / baseline) * 100;
    const annualChangeRate = Math.abs(totalChangePercent) / timespan;
    const direction = target > baseline ? 'increase' : 'decrease';
    
    // Feasibility assessment
    if (annualChangeRate > 50) {
      errors.push(`Target requires extreme annual changes (${annualChangeRate.toFixed(1)}%/year) - likely not feasible`);
    } else if (annualChangeRate > 25) {
      warnings.push(`Very aggressive target (${annualChangeRate.toFixed(1)}%/year) - requires exceptional effort`);
      insights.push('Consider: Revolutionary technology adoption, major process changes, significant investment');
    } else if (annualChangeRate > 15) {
      warnings.push(`Ambitious target (${annualChangeRate.toFixed(1)}%/year) - challenging but achievable`);
      insights.push('Consider: Technology upgrades, operational efficiency improvements, staff training');
    } else if (annualChangeRate > 5) {
      insights.push(`Moderate target (${annualChangeRate.toFixed(1)}%/year) - achievable with good planning`);
      insights.push('Consider: Gradual improvements, best practice adoption, regular monitoring');
    } else {
      insights.push(`Conservative target (${annualChangeRate.toFixed(1)}%/year) - easily achievable`);
    }
    
    // Historical trend analysis
    if (historicalData.length >= 3) {
      const values = historicalData.map(d => parseFloat(d.value)).filter(v => !isNaN(v));
      if (values.length >= 3) {
        const historicalChange = ((values[values.length - 1] - values[0]) / values[0]) * 100;
        const historicalRate = Math.abs(historicalChange) / (values.length - 1);
        
        if (annualChangeRate > historicalRate * 2) {
          warnings.push(`Target rate (${annualChangeRate.toFixed(1)}%/year) is much faster than historical performance (${historicalRate.toFixed(1)}%/year)`);
          insights.push('Historical trend suggests this target may require significant strategy changes');
        } else if (annualChangeRate > historicalRate * 1.5) {
          insights.push(`Target rate (${annualChangeRate.toFixed(1)}%/year) is faster than historical trend (${historicalRate.toFixed(1)}%/year)`);
        } else {
          insights.push(`Target aligns well with historical performance trend (${historicalRate.toFixed(1)}%/year)`);
        }
      }
    }
    
    return { 
      errors, 
      warnings, 
      insights,
      analysis: {
        totalChangePercent: totalChangePercent.toFixed(1),
        annualChangeRate: annualChangeRate.toFixed(1),
        direction,
        timespan
      }
    };
  },

  // Data completeness and quality assessment
  validateDataQuality: (monthlyData, requiredMonths = 12) => {
    const errors = [];
    const warnings = [];
    const insights = [];
    
    if (!Array.isArray(monthlyData)) {
      errors.push('Invalid data format');
      return { errors, warnings, insights };
    }
    
    const dataPoints = monthlyData.filter(d => d.value !== null && d.value !== undefined && !isNaN(d.value));
    const completeness = (dataPoints.length / requiredMonths) * 100;
    
    if (completeness < 50) {
      warnings.push(`Low data completeness (${completeness.toFixed(0)}%) - may affect accuracy of analysis`);
    } else if (completeness < 80) {
      insights.push(`Moderate data completeness (${completeness.toFixed(0)}%) - consider improving data collection`);
    } else {
      insights.push(`Good data completeness (${completeness.toFixed(0)}%)`);
    }
    
    // Check for outliers
    if (dataPoints.length >= 3) {
      const values = dataPoints.map(d => parseFloat(d.value));
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      const stdDev = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length);
      
      const outliers = values.filter(v => Math.abs(v - mean) > 2 * stdDev);
      if (outliers.length > 0) {
        warnings.push(`${outliers.length} potential outlier(s) detected - verify data accuracy`);
        insights.push(`Outlier values: ${outliers.map(v => v.toFixed(0)).join(', ')}`);
      }
    }
    
    // Check for missing consecutive months
    if (dataPoints.length > 1) {
      const missingStreaks = [];
      let currentStreak = 0;
      
      for (let i = 0; i < requiredMonths; i++) {
        const hasData = monthlyData.some(d => d.month === i + 1 && d.value !== null && d.value !== undefined);
        if (!hasData) {
          currentStreak++;
        } else {
          if (currentStreak >= 3) {
            missingStreaks.push(currentStreak);
          }
          currentStreak = 0;
        }
      }
      
      if (missingStreaks.length > 0) {
        warnings.push(`Missing data for ${Math.max(...missingStreaks)} consecutive months - may indicate systematic issues`);
      }
    }
    
    return { 
      errors, 
      warnings, 
      insights,
      quality: {
        completeness: completeness.toFixed(1),
        dataPoints: dataPoints.length,
        requiredPoints: requiredMonths
      }
    };
  }
};

/**
 * Business rule validation
 */
export const validateBusinessRules = {
  // Validate emission factor assignments
  validateEmissionFactorAssignment: (resource, emissionFactor) => {
    const issues = [];

    if (resource.scope !== emissionFactor.resource.scope) {
      issues.push('Emission factor scope does not match resource scope');
    }

    if (resource.category !== emissionFactor.resource.category) {
      issues.push('Emission factor category does not match resource category');
    }

    // Check if emission factor is from an active library
    if (!emissionFactor.library.isActive) {
      issues.push('Emission factor is from an inactive library');
    }

    // Check if emission factor is recent (within last 5 years)
    const currentYear = new Date().getFullYear();
    if (emissionFactor.library.year < currentYear - 5) {
      issues.push('Emission factor library is more than 5 years old');
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  },

  // Validate target feasibility
  validateTargetFeasibility: (target, historicalData = []) => {
    const issues = [];
    const warnings = [];

    const baselineValue = parseFloat(target.baselineValue);
    const targetValue = parseFloat(target.targetValue);
    const timespan = target.targetYear - target.baselineYear;

    // Check if target is realistic based on historical trends
    if (historicalData.length >= 2) {
      const trend = calculateTrend(historicalData);
      const requiredAnnualChange = Math.abs((targetValue - baselineValue) / baselineValue) / timespan * 100;

      if (requiredAnnualChange > 50) {
        warnings.push('Target requires very aggressive annual changes (>50% per year)');
      } else if (requiredAnnualChange > 25) {
        warnings.push('Target requires significant annual changes (>25% per year)');
      }

      // Check if trend direction aligns with target direction
      const targetDirection = targetValue > baselineValue ? 'increasing' : 'decreasing';
      if (trend.direction !== 'stable' && trend.direction !== targetDirection) {
        warnings.push(`Historical trend (${trend.direction}) conflicts with target direction (${targetDirection})`);
      }
    }

    // Check timespan reasonableness
    if (timespan < 1) {
      issues.push('Target timespan must be at least 1 year');
    } else if (timespan > 50) {
      warnings.push('Target timespan is very long (>50 years)');
    }

    // Check for zero or negative targets where inappropriate
    if (target.targetType === 'emissions_reduction' && targetValue < 0) {
      issues.push('Emissions cannot be negative');
    }

    if (target.targetType === 'production_increase' && targetValue <= baselineValue) {
      issues.push('Production increase target must be higher than baseline');
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings,
    };
  },

  // Validate data entry ranges
  validateDataRanges: (data, benchmarks = {}) => {
    const issues = [];
    const warnings = [];

    // Check emission intensity against benchmarks
    if (data.carbonIntensity && benchmarks.carbonIntensity) {
      if (data.carbonIntensity > benchmarks.carbonIntensity.industry_worst) {
        issues.push('Carbon intensity exceeds industry worst performance');
      } else if (data.carbonIntensity > benchmarks.carbonIntensity.industry_average * 1.5) {
        warnings.push('Carbon intensity is significantly above industry average');
      }
    }

    // Check capacity utilization
    if (data.capacityUtilization !== undefined) {
      if (data.capacityUtilization > 100) {
        issues.push('Capacity utilization cannot exceed 100%');
      } else if (data.capacityUtilization > 95) {
        warnings.push('Very high capacity utilization (>95%) may indicate data entry error');
      } else if (data.capacityUtilization < 10) {
        warnings.push('Very low capacity utilization (<10%) may indicate operational issues or data error');
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings,
    };
  },
};

/**
 * Helper functions
 */
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

const calculateTrend = (data) => {
  // Simplified trend calculation for validation purposes
  if (data.length < 2) return { direction: 'stable' };
  
  const first = data[0];
  const last = data[data.length - 1];
  const change = (last - first) / first * 100;
  
  if (Math.abs(change) < 5) return { direction: 'stable' };
  return { direction: change > 0 ? 'increasing' : 'decreasing' };
};

export default {
  validationRules,
  validateForm,
  validationSchemas,
  validateDataQuality,
  validateBusinessRules,
};
