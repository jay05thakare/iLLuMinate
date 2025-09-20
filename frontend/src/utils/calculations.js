/**
 * Business Logic Calculations
 * Handles complex calculations and business rules
 */

/**
 * Carbon intensity calculations
 */
export const calculateCarbonIntensity = (emissions, production) => {
  if (!production || production === 0) return 0;
  return emissions / production;
};

export const calculateEnergyIntensity = (energy, production) => {
  if (!production || production === 0) return 0;
  return energy / production;
};

/**
 * Emission factor calculations
 */
export const calculateEmissions = (consumption, emissionFactor) => {
  return (consumption || 0) * (emissionFactor || 0);
};

export const calculateTotalEnergyContent = (consumption, heatContent) => {
  return (consumption || 0) * (heatContent || 0);
};

/**
 * Capacity utilization calculations
 */
export const calculateCapacityUtilization = (actualProduction, capacity, timeUnit = 'annual') => {
  if (!capacity || capacity === 0) return 0;
  
  let annualCapacity = capacity;
  if (timeUnit === 'daily') {
    annualCapacity = capacity * 365;
  } else if (timeUnit === 'monthly') {
    annualCapacity = capacity * 12;
  }
  
  return Math.min((actualProduction / annualCapacity) * 100, 100);
};

/**
 * Target progress calculations
 */
export const calculateTargetProgress = (baseline, current, target) => {
  if (target === baseline) return 0;
  
  const isReductionTarget = target < baseline;
  
  if (isReductionTarget) {
    // For reduction targets (e.g., emissions reduction)
    const totalReduction = baseline - target;
    const currentReduction = baseline - current;
    return Math.max(0, Math.min(100, (currentReduction / totalReduction) * 100));
  } else {
    // For increase targets (e.g., renewable energy increase)
    const totalIncrease = target - baseline;
    const currentIncrease = current - baseline;
    return Math.max(0, Math.min(100, (currentIncrease / totalIncrease) * 100));
  }
};

/**
 * Time-based progress calculations
 */
export const calculateTimeProgress = (startYear, endYear, currentYear = new Date().getFullYear()) => {
  const totalDuration = endYear - startYear;
  const elapsed = currentYear - startYear;
  
  if (totalDuration <= 0) return 100;
  return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
};

/**
 * Data quality and completeness calculations
 */
export const calculateDataCompleteness = (actualRecords, expectedRecords) => {
  if (expectedRecords === 0) return 100;
  return Math.min((actualRecords / expectedRecords) * 100, 100);
};

export const calculateMonthlyCompleteness = (monthlyData, year = new Date().getFullYear()) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const expectedMonths = year === currentYear ? currentMonth : 12;
  const actualMonths = monthlyData?.length || 0;
  
  return calculateDataCompleteness(actualMonths, expectedMonths);
};

/**
 * Financial calculations
 */
export const calculateCostSavings = (baselineCost, currentCost) => {
  if (!baselineCost || baselineCost === 0) return 0;
  return ((baselineCost - currentCost) / baselineCost) * 100;
};

export const calculateROI = (benefits, costs) => {
  if (!costs || costs === 0) return 0;
  return ((benefits - costs) / costs) * 100;
};

/**
 * Trend analysis
 */
export const calculateTrend = (data, valueKey = 'value') => {
  if (!Array.isArray(data) || data.length < 2) {
    return { direction: 'stable', percentage: 0, status: 'insufficient_data' };
  }
  
  const sortedData = [...data].sort((a, b) => {
    // Assume data has year/month for sorting
    if (a.year !== b.year) return a.year - b.year;
    return (a.month || 0) - (b.month || 0);
  });
  
  const firstValue = sortedData[0][valueKey] || 0;
  const lastValue = sortedData[sortedData.length - 1][valueKey] || 0;
  
  if (firstValue === 0) {
    return { direction: 'stable', percentage: 0, status: 'no_baseline' };
  }
  
  const percentageChange = ((lastValue - firstValue) / firstValue) * 100;
  
  let direction = 'stable';
  let status = 'stable';
  
  if (Math.abs(percentageChange) < 5) {
    direction = 'stable';
    status = 'stable';
  } else if (percentageChange > 0) {
    direction = 'increasing';
    status = percentageChange > 20 ? 'rapidly_increasing' : 'increasing';
  } else {
    direction = 'decreasing';
    status = percentageChange < -20 ? 'rapidly_decreasing' : 'decreasing';
  }
  
  return {
    direction,
    percentage: Math.round(Math.abs(percentageChange)),
    status,
    raw_percentage: percentageChange,
  };
};

/**
 * Benchmarking calculations
 */
export const calculateBenchmarkPosition = (value, benchmarks) => {
  if (!benchmarks || !Array.isArray(benchmarks) || benchmarks.length === 0) {
    return { position: 'unknown', percentile: 0, status: 'no_benchmark' };
  }
  
  const sortedBenchmarks = [...benchmarks].sort((a, b) => a - b);
  const position = sortedBenchmarks.findIndex(benchmark => value <= benchmark);
  
  let percentile = 0;
  let status = 'unknown';
  
  if (position === -1) {
    // Value is worse than all benchmarks
    percentile = 100;
    status = 'below_benchmark';
  } else {
    percentile = (position / sortedBenchmarks.length) * 100;
    
    if (percentile <= 25) {
      status = 'excellent';
    } else if (percentile <= 50) {
      status = 'good';
    } else if (percentile <= 75) {
      status = 'average';
    } else {
      status = 'below_average';
    }
  }
  
  return {
    position: position === -1 ? sortedBenchmarks.length + 1 : position + 1,
    percentile: Math.round(percentile),
    status,
    total_benchmarks: sortedBenchmarks.length,
  };
};

/**
 * Aggregation functions
 */
export const aggregateByPeriod = (data, period, valueKey, groupKey = null) => {
  if (!Array.isArray(data) || data.length === 0) return [];
  
  const aggregated = data.reduce((acc, item) => {
    let key;
    
    switch (period) {
      case 'monthly':
        key = `${item.year}-${String(item.month).padStart(2, '0')}`;
        break;
      case 'quarterly':
        const quarter = Math.ceil(item.month / 3);
        key = `${item.year}-Q${quarter}`;
        break;
      case 'yearly':
        key = item.year.toString();
        break;
      default:
        key = 'total';
    }
    
    if (groupKey) {
      key = `${key}-${item[groupKey]}`;
    }
    
    if (!acc[key]) {
      acc[key] = {
        period: key,
        year: item.year,
        month: period === 'monthly' ? item.month : null,
        quarter: period === 'quarterly' ? Math.ceil(item.month / 3) : null,
        total: 0,
        count: 0,
        items: [],
      };
      
      if (groupKey) {
        acc[key][groupKey] = item[groupKey];
      }
    }
    
    acc[key].total += item[valueKey] || 0;
    acc[key].count++;
    acc[key].items.push(item);
    
    return acc;
  }, {});
  
  return Object.values(aggregated).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    if (a.quarter && b.quarter) return a.quarter - b.quarter;
    return (a.month || 0) - (b.month || 0);
  });
};

/**
 * Statistical calculations
 */
export const calculateStatistics = (values) => {
  if (!Array.isArray(values) || values.length === 0) {
    return {
      count: 0,
      sum: 0,
      average: 0,
      median: 0,
      min: 0,
      max: 0,
      standardDeviation: 0,
    };
  }
  
  const numericValues = values.filter(v => typeof v === 'number' && !isNaN(v));
  
  if (numericValues.length === 0) {
    return {
      count: 0,
      sum: 0,
      average: 0,
      median: 0,
      min: 0,
      max: 0,
      standardDeviation: 0,
    };
  }
  
  const sorted = [...numericValues].sort((a, b) => a - b);
  const sum = numericValues.reduce((acc, val) => acc + val, 0);
  const average = sum / numericValues.length;
  
  // Calculate median
  const middle = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
  
  // Calculate standard deviation
  const variance = numericValues.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / numericValues.length;
  const standardDeviation = Math.sqrt(variance);
  
  return {
    count: numericValues.length,
    sum: sum,
    average: average,
    median: median,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    standardDeviation: standardDeviation,
  };
};

/**
 * Growth rate calculations
 */
export const calculateGrowthRate = (currentValue, previousValue, periods = 1) => {
  if (!previousValue || previousValue === 0) return null;
  
  const rate = ((currentValue - previousValue) / previousValue) * 100;
  
  // Annualize if periods is not 1
  if (periods !== 1) {
    return Math.pow((currentValue / previousValue), (1 / periods)) - 1;
  }
  
  return rate;
};

export const calculateCAGR = (endValue, beginValue, numberOfYears) => {
  if (!beginValue || beginValue === 0 || numberOfYears === 0) return 0;
  
  return (Math.pow(endValue / beginValue, 1 / numberOfYears) - 1) * 100;
};

/**
 * Industry benchmark calculations
 */
export const calculateIndustryPosition = (facilityValue, industryData) => {
  if (!industryData || !Array.isArray(industryData.benchmarks)) {
    return { position: 'unknown', status: 'no_data' };
  }
  
  const { best_practice, industry_average, regulatory_limit } = industryData;
  
  let status = 'unknown';
  let position = 'unknown';
  
  if (best_practice && facilityValue <= best_practice) {
    status = 'best_practice';
    position = 'top_quartile';
  } else if (industry_average) {
    if (facilityValue <= industry_average * 1.1) {
      status = 'above_average';
      position = 'second_quartile';
    } else if (facilityValue <= industry_average * 1.25) {
      status = 'average';
      position = 'third_quartile';
    } else {
      status = 'below_average';
      position = 'bottom_quartile';
    }
  }
  
  if (regulatory_limit && facilityValue > regulatory_limit) {
    status = 'non_compliant';
    position = 'bottom_quartile';
  }
  
  return {
    position,
    status,
    comparison: {
      vs_best_practice: best_practice ? ((facilityValue - best_practice) / best_practice * 100) : null,
      vs_industry_average: industry_average ? ((facilityValue - industry_average) / industry_average * 100) : null,
      vs_regulatory_limit: regulatory_limit ? ((facilityValue - regulatory_limit) / regulatory_limit * 100) : null,
    }
  };
};

/**
 * Forecasting and projections
 */
export const projectLinearTrend = (historicalData, periods, valueKey = 'value') => {
  if (!Array.isArray(historicalData) || historicalData.length < 2) {
    return [];
  }
  
  // Simple linear regression for trend projection
  const n = historicalData.length;
  const sumX = historicalData.reduce((sum, _, index) => sum + index, 0);
  const sumY = historicalData.reduce((sum, item) => sum + (item[valueKey] || 0), 0);
  const sumXY = historicalData.reduce((sum, item, index) => sum + index * (item[valueKey] || 0), 0);
  const sumXX = historicalData.reduce((sum, _, index) => sum + index * index, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  const projections = [];
  for (let i = 1; i <= periods; i++) {
    const projectedValue = slope * (n + i - 1) + intercept;
    projections.push({
      period: n + i,
      projected_value: Math.max(0, projectedValue), // Ensure non-negative
      confidence: Math.max(0.1, 1 - (i * 0.1)), // Decreasing confidence over time
    });
  }
  
  return projections;
};

/**
 * Advanced aggregation functions
 */
export const calculateResourceContribution = (resourceData, totalEmissions) => {
  if (!Array.isArray(resourceData) || totalEmissions <= 0) {
    return [];
  }

  return resourceData.map(resource => ({
    ...resource,
    contribution: (resource.emissions / totalEmissions) * 100,
    intensity: resource.production > 0 ? resource.emissions / resource.production : 0
  })).sort((a, b) => b.contribution - a.contribution);
};

export const calculateFacilityEfficiency = (facilities, benchmarks = {}) => {
  const defaultBenchmarks = {
    carbonIntensity: 900, // kgCO2e/tonne
    energyIntensity: 3500, // MJ/tonne
    capacityUtilization: 80 // %
  };

  const activeBenchmarks = { ...defaultBenchmarks, ...benchmarks };

  return facilities.map(facility => {
    const efficiency = {
      carbonEfficiency: 0,
      energyEfficiency: 0,
      capacityEfficiency: 0,
      overallScore: 0
    };

    // Carbon efficiency (lower intensity is better)
    if (facility.carbonIntensity > 0) {
      efficiency.carbonEfficiency = Math.max(0, 
        100 - ((facility.carbonIntensity - activeBenchmarks.carbonIntensity) / activeBenchmarks.carbonIntensity) * 100
      );
    }

    // Energy efficiency (lower intensity is better)
    if (facility.energyIntensity > 0) {
      efficiency.energyEfficiency = Math.max(0,
        100 - ((facility.energyIntensity - activeBenchmarks.energyIntensity) / activeBenchmarks.energyIntensity) * 100
      );
    }

    // Capacity efficiency (higher utilization is better up to optimal point)
    if (facility.capacityUtilization > 0) {
      const optimalUtilization = activeBenchmarks.capacityUtilization;
      if (facility.capacityUtilization <= optimalUtilization) {
        efficiency.capacityEfficiency = (facility.capacityUtilization / optimalUtilization) * 100;
      } else {
        // Penalize over-utilization
        efficiency.capacityEfficiency = Math.max(0, 100 - (facility.capacityUtilization - optimalUtilization));
      }
    }

    // Calculate overall efficiency score
    const scores = [efficiency.carbonEfficiency, efficiency.energyEfficiency, efficiency.capacityEfficiency];
    const validScores = scores.filter(score => score > 0);
    efficiency.overallScore = validScores.length > 0 ? 
      validScores.reduce((sum, score) => sum + score, 0) / validScores.length : 0;

    return {
      ...facility,
      efficiency,
      performanceLevel: getPerformanceLevel(efficiency.overallScore)
    };
  });
};

export const calculateMonthlyAggregation = (data, aggregationType = 'sum') => {
  if (!Array.isArray(data) || data.length === 0) return [];

  const monthlyData = {};

  data.forEach(item => {
    const monthKey = `${item.year}-${String(item.month).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        year: item.year,
        month: item.month,
        monthName: getMonthName(item.month),
        values: [],
        count: 0
      };
    }

    monthlyData[monthKey].values.push(item.value || 0);
    monthlyData[monthKey].count++;
  });

  return Object.values(monthlyData).map(month => {
    let aggregatedValue = 0;

    switch (aggregationType) {
      case 'sum':
        aggregatedValue = month.values.reduce((sum, val) => sum + val, 0);
        break;
      case 'average':
        aggregatedValue = month.values.reduce((sum, val) => sum + val, 0) / month.values.length;
        break;
      case 'max':
        aggregatedValue = Math.max(...month.values);
        break;
      case 'min':
        aggregatedValue = Math.min(...month.values);
        break;
      default:
        aggregatedValue = month.values.reduce((sum, val) => sum + val, 0);
    }

    return {
      year: month.year,
      month: month.month,
      monthName: month.monthName,
      value: aggregatedValue,
      count: month.count,
      period: `${month.year}-${String(month.month).padStart(2, '0')}`
    };
  }).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });
};

export const calculateIntensityMetrics = (emissionData, productionData, energyData = []) => {
  const metrics = {
    carbonIntensity: [],
    energyIntensity: [],
    waterIntensity: [],
    overallIntensity: {}
  };

  const productionMap = new Map();
  productionData.forEach(prod => {
    const key = `${prod.year}-${prod.month}`;
    productionMap.set(key, prod.value || prod.production || 0);
  });

  emissionData.forEach(emission => {
    const key = `${emission.year}-${emission.month}`;
    const production = productionMap.get(key) || 0;

    if (production > 0) {
      metrics.carbonIntensity.push({
        year: emission.year,
        month: emission.month,
        monthName: getMonthName(emission.month),
        value: (emission.value || emission.emissions || 0) / production,
        production: production,
        emissions: emission.value || emission.emissions || 0
      });
    }
  });

  energyData.forEach(energy => {
    const key = `${energy.year}-${energy.month}`;
    const production = productionMap.get(key) || 0;

    if (production > 0) {
      metrics.energyIntensity.push({
        year: energy.year,
        month: energy.month,
        monthName: getMonthName(energy.month),
        value: (energy.value || energy.energy || 0) / production,
        production: production,
        energy: energy.value || energy.energy || 0
      });
    }
  });

  // Calculate overall intensity metrics
  if (metrics.carbonIntensity.length > 0) {
    const totalEmissions = metrics.carbonIntensity.reduce((sum, item) => sum + item.emissions, 0);
    const totalProduction = metrics.carbonIntensity.reduce((sum, item) => sum + item.production, 0);
    metrics.overallIntensity.carbon = totalProduction > 0 ? totalEmissions / totalProduction : 0;
  }

  if (metrics.energyIntensity.length > 0) {
    const totalEnergy = metrics.energyIntensity.reduce((sum, item) => sum + item.energy, 0);
    const totalProduction = metrics.energyIntensity.reduce((sum, item) => sum + item.production, 0);
    metrics.overallIntensity.energy = totalProduction > 0 ? totalEnergy / totalProduction : 0;
  }

  return metrics;
};

export const calculatePerformanceIndicators = (currentData, benchmarkData, targetData = null) => {
  const indicators = {
    efficiency: 0,
    compliance: 0,
    improvement: 0,
    sustainability: 0,
    overall: 0
  };

  // Calculate efficiency indicator
  if (benchmarkData.efficiency) {
    indicators.efficiency = Math.min(100, (benchmarkData.efficiency / currentData.value) * 100);
  }

  // Calculate compliance indicator
  if (benchmarkData.limit) {
    indicators.compliance = currentData.value <= benchmarkData.limit ? 100 : 
      Math.max(0, 100 - ((currentData.value - benchmarkData.limit) / benchmarkData.limit) * 100);
  }

  // Calculate improvement indicator
  if (currentData.previousValue) {
    const improvement = ((currentData.previousValue - currentData.value) / currentData.previousValue) * 100;
    indicators.improvement = Math.max(-100, Math.min(100, improvement));
  }

  // Calculate target progress
  if (targetData) {
    const targetProgress = calculateTargetProgress(
      targetData.baseline,
      currentData.value,
      targetData.target
    );
    indicators.sustainability = targetProgress;
  }

  // Calculate overall performance
  const validIndicators = Object.values(indicators).filter(val => val !== 0);
  indicators.overall = validIndicators.length > 0 ? 
    validIndicators.reduce((sum, val) => sum + val, 0) / validIndicators.length : 0;

  return indicators;
};

export const calculateVariabilityMetrics = (data, windowSize = 12) => {
  if (!Array.isArray(data) || data.length < 2) {
    return { variability: 0, consistency: 100, trend: 'stable' };
  }

  const values = data.map(item => item.value || 0);
  const recentValues = values.slice(-windowSize);

  // Calculate coefficient of variation
  const mean = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
  const variance = recentValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / recentValues.length;
  const standardDeviation = Math.sqrt(variance);
  const coefficientOfVariation = mean > 0 ? (standardDeviation / mean) * 100 : 0;

  // Calculate consistency score (inverse of variability)
  const consistency = Math.max(0, 100 - coefficientOfVariation);

  // Calculate trend
  const trend = calculateTrend(recentValues);

  return {
    variability: coefficientOfVariation,
    consistency: consistency,
    trend: trend.direction,
    trendStrength: trend.strength,
    mean: mean,
    standardDeviation: standardDeviation
  };
};

export const calculateSeasonalPatterns = (monthlyData) => {
  if (!Array.isArray(monthlyData) || monthlyData.length < 12) {
    return { hasPattern: false, patterns: [] };
  }

  const monthlyAverages = {};
  const monthlyValues = {};

  // Group data by month
  monthlyData.forEach(item => {
    const month = item.month || new Date(item.date).getMonth() + 1;
    if (!monthlyValues[month]) {
      monthlyValues[month] = [];
    }
    monthlyValues[month].push(item.value || 0);
  });

  // Calculate averages for each month
  Object.keys(monthlyValues).forEach(month => {
    const values = monthlyValues[month];
    monthlyAverages[month] = values.reduce((sum, val) => sum + val, 0) / values.length;
  });

  // Calculate overall average
  const overallAverage = Object.values(monthlyAverages).reduce((sum, avg) => sum + avg, 0) / Object.keys(monthlyAverages).length;

  // Identify seasonal patterns
  const patterns = [];
  const seasonalIndices = [];

  Object.entries(monthlyAverages).forEach(([month, average]) => {
    const seasonalIndex = (average / overallAverage) * 100;
    seasonalIndices.push(seasonalIndex);

    if (seasonalIndex > 110) {
      patterns.push({
        month: parseInt(month),
        monthName: getMonthName(parseInt(month)),
        type: 'peak',
        index: seasonalIndex,
        deviation: seasonalIndex - 100
      });
    } else if (seasonalIndex < 90) {
      patterns.push({
        month: parseInt(month),
        monthName: getMonthName(parseInt(month)),
        type: 'trough',
        index: seasonalIndex,
        deviation: seasonalIndex - 100
      });
    }
  });

  // Determine if there's a significant seasonal pattern
  const seasonalVariance = calculateStatistics(seasonalIndices).variance;
  const hasPattern = seasonalVariance > 100; // Threshold for significant seasonality

  return {
    hasPattern,
    patterns: patterns.sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation)),
    seasonalIndices: Object.entries(monthlyAverages).map(([month, average]) => ({
      month: parseInt(month),
      monthName: getMonthName(parseInt(month)),
      average: average,
      seasonalIndex: (average / overallAverage) * 100
    })).sort((a, b) => a.month - b.month),
    overallAverage,
    seasonalVariance
  };
};

/**
 * Helper functions
 */
const getMonthName = (month) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month - 1] || 'Unknown';
};

const getPerformanceLevel = (score) => {
  if (score >= 90) return 'excellent';
  if (score >= 80) return 'good';
  if (score >= 70) return 'average';
  if (score >= 60) return 'below_average';
  return 'poor';
};

// Export statements moved to end of file to include all functions

/**
 * Advanced Time-Series Analysis Functions
 */

/**
 * Calculate moving averages for trend smoothing
 */
export const calculateMovingAverage = (data, windowSize = 3, valueKey = 'value') => {
  if (!Array.isArray(data) || data.length < windowSize) {
    return data.map(item => ({ ...item, movingAverage: item[valueKey] || 0 }));
  }

  return data.map((item, index) => {
    if (index < windowSize - 1) {
      return { ...item, movingAverage: item[valueKey] || 0 };
    }

    const window = data.slice(index - windowSize + 1, index + 1);
    const average = window.reduce((sum, d) => sum + (d[valueKey] || 0), 0) / windowSize;
    
    return { ...item, movingAverage: average };
  });
};

/**
 * Calculate exponential moving average for trend analysis
 */
export const calculateExponentialMovingAverage = (data, alpha = 0.3, valueKey = 'value') => {
  if (!Array.isArray(data) || data.length === 0) return [];

  const result = [];
  let ema = data[0][valueKey] || 0;

  data.forEach((item, index) => {
    if (index === 0) {
      ema = item[valueKey] || 0;
    } else {
      ema = alpha * (item[valueKey] || 0) + (1 - alpha) * ema;
    }

    result.push({ ...item, exponentialMovingAverage: ema });
  });

  return result;
};

/**
 * Detect trend changes and reversals
 */
export const detectTrendChanges = (data, sensitivity = 0.1, valueKey = 'value') => {
  if (!Array.isArray(data) || data.length < 3) return [];

  const smoothedData = calculateMovingAverage(data, 3, valueKey);
  const changes = [];

  for (let i = 2; i < smoothedData.length; i++) {
    const prev = smoothedData[i - 2].movingAverage;
    const current = smoothedData[i - 1].movingAverage;
    const next = smoothedData[i].movingAverage;

    // Calculate directional changes
    const prevDirection = current > prev ? 'up' : current < prev ? 'down' : 'flat';
    const nextDirection = next > current ? 'up' : next < current ? 'down' : 'flat';

    // Detect reversal
    if (prevDirection !== nextDirection && prevDirection !== 'flat' && nextDirection !== 'flat') {
      const changeIntensity = Math.abs((next - prev) / prev) * 100;
      
      if (changeIntensity > sensitivity * 100) {
        changes.push({
          index: i,
          period: data[i].period || `${data[i].year}-${data[i].month}`,
          year: data[i].year,
          month: data[i].month,
          changeType: prevDirection === 'up' ? 'reversal_to_decrease' : 'reversal_to_increase',
          intensity: changeIntensity,
          values: { prev, current, next }
        });
      }
    }
  }

  return changes;
};

/**
 * Calculate year-over-year growth rates
 */
export const calculateYearOverYearGrowth = (data, valueKey = 'value') => {
  if (!Array.isArray(data) || data.length === 0) return [];

  // Group data by month across years
  const monthlyData = {};
  data.forEach(item => {
    const month = item.month || new Date(item.date).getMonth() + 1;
    if (!monthlyData[month]) {
      monthlyData[month] = [];
    }
    monthlyData[month].push({
      year: item.year || new Date(item.date).getFullYear(),
      value: item[valueKey] || 0,
      originalData: item
    });
  });

  // Calculate YoY growth for each month
  const yoyGrowth = [];
  
  Object.keys(monthlyData).forEach(month => {
    const monthData = monthlyData[month].sort((a, b) => a.year - b.year);
    
    for (let i = 1; i < monthData.length; i++) {
      const currentYear = monthData[i];
      const previousYear = monthData[i - 1];
      
      const growthRate = previousYear.value > 0 ? 
        ((currentYear.value - previousYear.value) / previousYear.value) * 100 : 0;

      yoyGrowth.push({
        ...currentYear.originalData,
        yoyGrowthRate: growthRate,
        currentValue: currentYear.value,
        previousYearValue: previousYear.value,
        absoluteChange: currentYear.value - previousYear.value
      });
    }
  });

  return yoyGrowth.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return (a.month || 0) - (b.month || 0);
  });
};

/**
 * Calculate quarter-over-quarter growth rates
 */
export const calculateQuarterOverQuarterGrowth = (data, valueKey = 'value') => {
  if (!Array.isArray(data) || data.length === 0) return [];

  // Aggregate data by quarters
  const quarterlyData = {};
  data.forEach(item => {
    const year = item.year || new Date(item.date).getFullYear();
    const month = item.month || new Date(item.date).getMonth() + 1;
    const quarter = Math.ceil(month / 3);
    const key = `${year}-Q${quarter}`;

    if (!quarterlyData[key]) {
      quarterlyData[key] = {
        year,
        quarter,
        values: [],
        total: 0,
        count: 0
      };
    }

    quarterlyData[key].values.push(item[valueKey] || 0);
    quarterlyData[key].total += item[valueKey] || 0;
    quarterlyData[key].count++;
  });

  // Calculate quarterly averages
  const quarterlyAverages = Object.entries(quarterlyData).map(([key, data]) => ({
    period: key,
    year: data.year,
    quarter: data.quarter,
    average: data.total / data.count,
    total: data.total,
    dataPoints: data.count
  })).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.quarter - b.quarter;
  });

  // Calculate QoQ growth
  const qoqGrowth = [];
  for (let i = 1; i < quarterlyAverages.length; i++) {
    const current = quarterlyAverages[i];
    const previous = quarterlyAverages[i - 1];
    
    const growthRate = previous.average > 0 ? 
      ((current.average - previous.average) / previous.average) * 100 : 0;

    qoqGrowth.push({
      ...current,
      qoqGrowthRate: growthRate,
      previousQuarterValue: previous.average,
      absoluteChange: current.average - previous.average
    });
  }

  return qoqGrowth;
};

/**
 * Perform seasonal decomposition
 */
export const performSeasonalDecomposition = (data, valueKey = 'value') => {
  if (!Array.isArray(data) || data.length < 24) {
    return { trend: [], seasonal: [], residual: [], hasSeasonality: false };
  }

  // Calculate 12-month moving average for trend
  const trendData = calculateMovingAverage(data, 12, valueKey);
  
  // Calculate seasonal indices
  const monthlyIndices = {};
  data.forEach((item, index) => {
    const month = item.month || ((index % 12) + 1);
    const trend = trendData[index]?.movingAverage || 0;
    const actual = item[valueKey] || 0;
    
    if (trend > 0) {
      if (!monthlyIndices[month]) {
        monthlyIndices[month] = [];
      }
      monthlyIndices[month].push(actual / trend);
    }
  });

  // Calculate average seasonal indices
  const seasonalPattern = {};
  Object.keys(monthlyIndices).forEach(month => {
    const indices = monthlyIndices[month];
    seasonalPattern[month] = indices.reduce((sum, idx) => sum + idx, 0) / indices.length;
  });

  // Normalize seasonal indices to average 1.0
  const avgSeasonalIndex = Object.values(seasonalPattern).reduce((sum, idx) => sum + idx, 0) / Object.keys(seasonalPattern).length;
  Object.keys(seasonalPattern).forEach(month => {
    seasonalPattern[month] = seasonalPattern[month] / avgSeasonalIndex;
  });

  // Calculate seasonal and residual components
  const decomposition = {
    trend: [],
    seasonal: [],
    residual: [],
    hasSeasonality: false
  };

  data.forEach((item, index) => {
    const month = item.month || ((index % 12) + 1);
    const actual = item[valueKey] || 0;
    const trend = trendData[index]?.movingAverage || 0;
    const seasonal = seasonalPattern[month] || 1;
    const seasonalComponent = trend * seasonal;
    const residual = actual - trend - (seasonalComponent - trend);

    decomposition.trend.push({
      ...item,
      trend: trend
    });

    decomposition.seasonal.push({
      ...item,
      seasonal: seasonalComponent - trend,
      seasonalIndex: seasonal
    });

    decomposition.residual.push({
      ...item,
      residual: residual
    });
  });

  // Determine if there's significant seasonality
  const seasonalVariance = Object.values(seasonalPattern).reduce((sum, idx) => sum + Math.pow(idx - 1, 2), 0) / Object.keys(seasonalPattern).length;
  decomposition.hasSeasonality = seasonalVariance > 0.01; // Threshold for significant seasonality

  return decomposition;
};

/**
 * Calculate correlation between two time series
 */
export const calculateCorrelation = (series1, series2, valueKey1 = 'value', valueKey2 = 'value') => {
  if (!Array.isArray(series1) || !Array.isArray(series2) || series1.length !== series2.length) {
    return { correlation: 0, strength: 'no_correlation', isSignificant: false };
  }

  const n = series1.length;
  const values1 = series1.map(item => item[valueKey1] || 0);
  const values2 = series2.map(item => item[valueKey2] || 0);

  const mean1 = values1.reduce((sum, val) => sum + val, 0) / n;
  const mean2 = values2.reduce((sum, val) => sum + val, 0) / n;

  let numerator = 0;
  let sumSq1 = 0;
  let sumSq2 = 0;

  for (let i = 0; i < n; i++) {
    const diff1 = values1[i] - mean1;
    const diff2 = values2[i] - mean2;
    
    numerator += diff1 * diff2;
    sumSq1 += diff1 * diff1;
    sumSq2 += diff2 * diff2;
  }

  const denominator = Math.sqrt(sumSq1 * sumSq2);
  const correlation = denominator > 0 ? numerator / denominator : 0;

  // Determine correlation strength
  const absCorr = Math.abs(correlation);
  let strength = 'no_correlation';
  if (absCorr >= 0.8) strength = 'very_strong';
  else if (absCorr >= 0.6) strength = 'strong';
  else if (absCorr >= 0.4) strength = 'moderate';
  else if (absCorr >= 0.2) strength = 'weak';

  // Simple significance test (rule of thumb for sample size)
  const isSignificant = n > 10 && absCorr > (2 / Math.sqrt(n));

  return {
    correlation: correlation,
    strength: strength,
    isSignificant: isSignificant,
    sampleSize: n,
    direction: correlation > 0 ? 'positive' : correlation < 0 ? 'negative' : 'none'
  };
};

/**
 * Advanced forecasting using multiple methods
 */
export const generateAdvancedForecast = (data, periods = 6, method = 'ensemble', valueKey = 'value') => {
  if (!Array.isArray(data) || data.length < 6) {
    return { forecast: [], confidence: 'insufficient_data', method: 'none' };
  }

  const values = data.map(item => item[valueKey] || 0);
  const forecasts = {};

  // Linear regression forecast
  forecasts.linear = generateLinearForecast(data, periods, valueKey);
  
  // Exponential smoothing forecast
  forecasts.exponential = generateExponentialForecast(values, periods);
  
  // Seasonal naive forecast (if seasonal pattern detected)
  if (data.length >= 12) {
    forecasts.seasonal = generateSeasonalForecast(data, periods, valueKey);
  }

  // Moving average forecast
  forecasts.movingAverage = generateMovingAverageForecast(values, periods);

  // Ensemble forecast (average of all methods)
  const ensemble = [];
  const availableMethods = Object.keys(forecasts).filter(key => forecasts[key].length > 0);
  
  for (let i = 0; i < periods; i++) {
    let sum = 0;
    let count = 0;
    
    availableMethods.forEach(methodName => {
      if (forecasts[methodName][i]) {
        sum += forecasts[methodName][i].value;
        count++;
      }
    });

    const lastPeriod = data[data.length - 1];
    const nextMonth = lastPeriod.month + i + 1;
    const nextYear = lastPeriod.year + Math.floor((nextMonth - 1) / 12);
    const adjustedMonth = ((nextMonth - 1) % 12) + 1;

    ensemble.push({
      period: `${nextYear}-${String(adjustedMonth).padStart(2, '0')}`,
      year: nextYear,
      month: adjustedMonth,
      value: count > 0 ? sum / count : 0,
      confidence: count > 2 ? 'high' : count > 1 ? 'medium' : 'low',
      methods: availableMethods.length,
      variance: calculateForecastVariance(forecasts, i)
    });
  }

  return {
    forecast: method === 'ensemble' ? ensemble : forecasts[method] || ensemble,
    confidence: ensemble.length > 0 ? ensemble[0].confidence : 'low',
    method: method,
    individualForecasts: forecasts,
    metrics: {
      methodsUsed: availableMethods.length,
      dataPoints: data.length,
      seasonalityDetected: 'seasonal' in forecasts
    }
  };
};

/**
 * Helper function to generate linear regression forecast
 */
const generateLinearForecast = (data, periods, valueKey) => {
  const n = data.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = data.map(item => item[valueKey] || 0);

  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumXX = x.reduce((sum, val) => sum + val * val, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const forecast = [];
  for (let i = 1; i <= periods; i++) {
    const value = slope * (n + i - 1) + intercept;
    forecast.push({ value: Math.max(0, value), method: 'linear' });
  }

  return forecast;
};

/**
 * Helper function to generate exponential smoothing forecast
 */
const generateExponentialForecast = (values, periods, alpha = 0.3) => {
  let ema = values[0];
  
  for (let i = 1; i < values.length; i++) {
    ema = alpha * values[i] + (1 - alpha) * ema;
  }

  const forecast = [];
  for (let i = 0; i < periods; i++) {
    forecast.push({ value: Math.max(0, ema), method: 'exponential' });
  }

  return forecast;
};

/**
 * Helper function to generate seasonal forecast
 */
const generateSeasonalForecast = (data, periods, valueKey) => {
  const seasonalPattern = calculateSeasonalPatterns(data);
  const lastYear = data[data.length - 1];
  const lastValue = lastYear[valueKey] || 0;

  const forecast = [];
  for (let i = 1; i <= periods; i++) {
    const targetMonth = ((lastYear.month + i - 1) % 12) + 1;
    const monthKey = `month_${targetMonth}`;
    const seasonalIndex = seasonalPattern.seasonalIndices?.find(s => s.month === targetMonth)?.seasonalIndex || 100;
    const adjustedValue = lastValue * (seasonalIndex / 100);

    forecast.push({ value: Math.max(0, adjustedValue), method: 'seasonal' });
  }

  return forecast;
};

/**
 * Helper function to generate moving average forecast
 */
const generateMovingAverageForecast = (values, periods, windowSize = 3) => {
  const recentValues = values.slice(-windowSize);
  const average = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;

  const forecast = [];
  for (let i = 0; i < periods; i++) {
    forecast.push({ value: Math.max(0, average), method: 'moving_average' });
  }

  return forecast;
};

/**
 * Helper function to calculate forecast variance
 */
const calculateForecastVariance = (forecasts, index) => {
  const values = Object.values(forecasts)
    .filter(forecast => forecast[index])
    .map(forecast => forecast[index].value);

  if (values.length < 2) return 0;

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  
  return Math.sqrt(variance);
};

export default {
  calculateCarbonIntensity,
  calculateEnergyIntensity,
  calculateEmissions,
  calculateTotalEnergyContent,
  calculateCapacityUtilization,
  calculateTargetProgress,
  calculateTimeProgress,
  calculateDataCompleteness,
  calculateMonthlyCompleteness,
  calculateCostSavings,
  calculateROI,
  calculateTrend,
  calculateBenchmarkPosition,
  aggregateByPeriod,
  calculateStatistics,
  calculateGrowthRate,
  calculateCAGR,
  calculateIndustryPosition,
  projectLinearTrend,
  calculateResourceContribution,
  calculateFacilityEfficiency,
  calculateMonthlyAggregation,
  calculateIntensityMetrics,
  calculatePerformanceIndicators,
  calculateVariabilityMetrics,
  calculateSeasonalPatterns,
  // Advanced time-series functions
  calculateMovingAverage,
  calculateExponentialMovingAverage,
  detectTrendChanges,
  calculateYearOverYearGrowth,
  calculateQuarterOverQuarterGrowth,
  performSeasonalDecomposition,
  calculateCorrelation,
  generateAdvancedForecast,
};
