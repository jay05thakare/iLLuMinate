/**
 * Data Transformation Functions
 * Handles converting raw API data into frontend-ready formats
 */

/**
 * Format numbers with appropriate units and precision
 */
export const formatNumber = (value, options = {}) => {
  const {
    precision = 2,
    unit = '',
    compact = false,
    currency = false,
    percentage = false,
  } = options;

  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }

  let formattedValue = parseFloat(value);

  if (percentage) {
    formattedValue = formattedValue * 100;
    return `${formattedValue.toFixed(precision)}%`;
  }

  if (currency) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }).format(formattedValue);
  }

  if (compact && Math.abs(formattedValue) >= 1000) {
    // Convert to compact notation (K, M, B)
    if (Math.abs(formattedValue) >= 1000000000) {
      formattedValue = (formattedValue / 1000000000).toFixed(precision) + 'B';
    } else if (Math.abs(formattedValue) >= 1000000) {
      formattedValue = (formattedValue / 1000000).toFixed(precision) + 'M';
    } else if (Math.abs(formattedValue) >= 1000) {
      formattedValue = (formattedValue / 1000).toFixed(precision) + 'K';
    } else {
      formattedValue = formattedValue.toFixed(precision);
    }
  } else {
    formattedValue = formattedValue.toLocaleString('en-US', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    });
  }

  return unit ? `${formattedValue} ${unit}` : formattedValue;
};

/**
 * Format dates consistently across the application
 */
export const formatDate = (date, format = 'default') => {
  if (!date) return 'N/A';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return 'Invalid Date';

  const options = {
    default: { year: 'numeric', month: 'short', day: 'numeric' },
    short: { month: 'short', day: 'numeric' },
    long: { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    },
    monthYear: { year: 'numeric', month: 'long' },
    time: { hour: '2-digit', minute: '2-digit' },
  };

  return dateObj.toLocaleDateString('en-US', options[format] || options.default);
};

/**
 * Transform organization data for dashboard display
 */
export const transformOrganizationData = (organization, stats) => {
  if (!organization) return null;

  return {
    id: organization.id,
    name: organization.name,
    description: organization.description,
    status: organization.status,
    subscriptionPlan: organization.subscriptionPlan,
    
    // Formatted statistics
    metrics: {
      totalUsers: stats?.users?.total || 0,
      adminUsers: stats?.users?.admins || 0,
      regularUsers: stats?.users?.regular || 0,
      
      totalFacilities: stats?.facilities?.total || 0,
      activeFacilities: stats?.facilities?.active || 0,
      
      totalTargets: stats?.targets?.total || 0,
      activeTargets: stats?.targets?.active || 0,
      
      // Data completeness metrics
      emissionRecords: stats?.dataRecords?.emissions || 0,
      productionRecords: stats?.dataRecords?.production || 0,
      recentEmissions: stats?.dataRecords?.recentEmissions || 0,
      recentProduction: stats?.dataRecords?.recentProduction || 0,
      
      // Current year totals
      currentYearProduction: stats?.currentYearTotals?.production?.totalProduction || 0,
      currentYearEmissions: Object.values(stats?.currentYearTotals?.emissions || {})
        .reduce((sum, val) => sum + (val || 0), 0),
      
      // Calculated metrics
      carbonIntensity: calculateCarbonIntensity(
        Object.values(stats?.currentYearTotals?.emissions || {}).reduce((sum, val) => sum + (val || 0), 0),
        stats?.currentYearTotals?.production?.totalProduction || 0
      ),
      
      dataCompleteness: calculateDataCompleteness(stats),
    },

    // Formatted dates
    createdAt: formatDate(organization.createdAt),
    updatedAt: formatDate(organization.updatedAt),
    
    // Activity status
    lastActivity: {
      lastEmissionEntry: stats?.lastActivity?.lastEmissionEntry 
        ? formatDate(stats.lastActivity.lastEmissionEntry, 'long')
        : 'No data',
      lastProductionEntry: stats?.lastActivity?.lastProductionEntry
        ? formatDate(stats.lastActivity.lastProductionEntry, 'long')
        : 'No data',
    }
  };
};

/**
 * Transform facility data for detailed view
 */
export const transformFacilityData = (facility) => {
  if (!facility) return null;

  const location = facility.location || {};
  
  return {
    id: facility.id,
    name: facility.name,
    description: facility.description,
    status: facility.status,
    
    // Location information
    location: {
      city: location.city || 'Unknown',
      state: location.state || 'Unknown',
      country: location.country || 'Unknown',
      address: location.address || 'Address not provided',
      coordinates: {
        latitude: location.latitude || null,
        longitude: location.longitude || null,
      },
      
      // Technical specifications
      technology: location.technology || 'Not specified',
      capacity: {
        tpd: location.capacity_tpd || 0,
        mtpa: location.capacity_mtpa || 0,
        formatted: formatNumber(location.capacity_mtpa || 0, { unit: 'MTPA', precision: 1 }),
      },
      commissionedYear: location.commissioned_year || 'Unknown',
    },

    // Performance metrics
    statistics: facility.statistics ? {
      emissionRecordsCount: facility.statistics.emissionRecordsCount || 0,
      productionRecordsCount: facility.statistics.productionRecordsCount || 0,
      targetsCount: facility.statistics.targetsCount || 0,
      configuredResourcesCount: facility.statistics.configuredResourcesCount || 0,
      
      // Current year performance
      currentYearEmissions: facility.statistics.currentYearEmissions || 0,
      currentYearProduction: facility.statistics.currentYearProduction || 0,
      
      // Calculated metrics
      carbonIntensity: calculateCarbonIntensity(
        facility.statistics.currentYearEmissions || 0,
        facility.statistics.currentYearProduction || 0
      ),
      
      // Capacity utilization
      capacityUtilization: calculateCapacityUtilization(
        facility.statistics.currentYearProduction || 0,
        location.capacity_mtpa || 0
      ),
      
      // Data quality indicators
      dataCompleteness: calculateFacilityDataCompleteness(facility.statistics),
    } : null,

    // Formatted values for display
    display: {
      status: capitalizeFirst(facility.status),
      capacity: formatNumber(location.capacity_mtpa || 0, { unit: 'MTPA', precision: 1 }),
      carbonIntensity: formatNumber(
        calculateCarbonIntensity(
          facility.statistics?.currentYearEmissions || 0,
          facility.statistics?.currentYearProduction || 0
        ), 
        { unit: 'kgCO2e/tonne', precision: 3 }
      ),
      currentYearEmissions: formatNumber(
        facility.statistics?.currentYearEmissions || 0, 
        { unit: 'kgCO2e', compact: true }
      ),
      currentYearProduction: formatNumber(
        facility.statistics?.currentYearProduction || 0, 
        { unit: 'tonnes', compact: true }
      ),
    },

    // Dates
    createdAt: formatDate(facility.createdAt),
    updatedAt: formatDate(facility.updatedAt),
  };
};

/**
 * Transform emission data for charts and analysis
 */
export const transformEmissionData = (emissionData) => {
  if (!Array.isArray(emissionData) || emissionData.length === 0) {
    return {
      monthly: [],
      yearly: [],
      byScope: { scope1: 0, scope2: 0 },
      byCategory: {},
      totalEmissions: 0,
    };
  }

  // Group by month and year
  const monthlyData = groupEmissionsByPeriod(emissionData, 'monthly');
  const yearlyData = groupEmissionsByPeriod(emissionData, 'yearly');
  
  // Group by scope
  const byScope = emissionData.reduce((acc, emission) => {
    const scope = emission.scope || 'unknown';
    acc[scope] = (acc[scope] || 0) + (emission.totalEmissions || 0);
    return acc;
  }, {});

  // Group by category
  const byCategory = emissionData.reduce((acc, emission) => {
    const category = emission.resource?.category || 'unknown';
    acc[category] = (acc[category] || 0) + (emission.totalEmissions || 0);
    return acc;
  }, {});

  // Calculate total emissions
  const totalEmissions = emissionData.reduce((sum, emission) => sum + (emission.totalEmissions || 0), 0);

  return {
    monthly: monthlyData,
    yearly: yearlyData,
    byScope,
    byCategory,
    totalEmissions,
    
    // Chart-ready data
    chartData: {
      monthly: prepareChartData(monthlyData, 'monthly'),
      yearly: prepareChartData(yearlyData, 'yearly'),
      scopeDistribution: Object.entries(byScope).map(([scope, value]) => ({
        name: scope.replace('scope', 'Scope '),
        value: value,
        percentage: totalEmissions > 0 ? (value / totalEmissions * 100).toFixed(1) : 0,
      })),
      categoryDistribution: Object.entries(byCategory).map(([category, value]) => ({
        name: formatCategoryName(category),
        value: value,
        percentage: totalEmissions > 0 ? (value / totalEmissions * 100).toFixed(1) : 0,
      })),
    },

    // Summary statistics
    summary: {
      totalEmissions: formatNumber(totalEmissions, { unit: 'kgCO2e', compact: true }),
      scope1Percentage: totalEmissions > 0 ? ((byScope.scope1 || 0) / totalEmissions * 100).toFixed(1) : 0,
      scope2Percentage: totalEmissions > 0 ? ((byScope.scope2 || 0) / totalEmissions * 100).toFixed(1) : 0,
      averageMonthlyEmissions: monthlyData.length > 0 
        ? formatNumber(totalEmissions / monthlyData.length, { unit: 'kgCO2e', compact: true })
        : 'N/A',
    }
  };
};

/**
 * Transform production data for analysis
 */
export const transformProductionData = (productionData) => {
  if (!Array.isArray(productionData) || productionData.length === 0) {
    return {
      monthly: [],
      yearly: [],
      totalProduction: 0,
      chartData: { monthly: [], yearly: [] },
      summary: {},
    };
  }

  // Group by month and year
  const monthlyData = groupProductionByPeriod(productionData, 'monthly');
  const yearlyData = groupProductionByPeriod(productionData, 'yearly');
  
  // Calculate total production
  const totalProduction = productionData.reduce((sum, prod) => sum + (prod.cement_production || 0), 0);

  return {
    monthly: monthlyData,
    yearly: yearlyData,
    totalProduction,
    
    // Chart-ready data
    chartData: {
      monthly: prepareProductionChartData(monthlyData, 'monthly'),
      yearly: prepareProductionChartData(yearlyData, 'yearly'),
    },

    // Summary statistics
    summary: {
      totalProduction: formatNumber(totalProduction, { unit: 'tonnes', compact: true }),
      averageMonthlyProduction: monthlyData.length > 0 
        ? formatNumber(totalProduction / monthlyData.length, { unit: 'tonnes', compact: true })
        : 'N/A',
      peakMonth: findPeakProductionPeriod(monthlyData),
      growthRate: calculateProductionGrowthRate(yearlyData),
    }
  };
};

/**
 * Transform user data for management interface
 */
export const transformUserData = (users) => {
  if (!Array.isArray(users)) return { users: [], statistics: {} };

  const transformedUsers = users.map(user => ({
    ...user,
    displayName: `${user.firstName} ${user.lastName}`,
    roleBadge: {
      admin: { color: 'red', label: 'Admin' },
      user: { color: 'blue', label: 'User' },
    }[user.role] || { color: 'gray', label: 'Unknown' },
    statusBadge: {
      active: { color: 'green', label: 'Active' },
      inactive: { color: 'gray', label: 'Inactive' },
    }[user.status] || { color: 'gray', label: 'Unknown' },
    lastLoginFormatted: user.lastLogin ? formatDate(user.lastLogin, 'long') : 'Never',
    createdAtFormatted: formatDate(user.createdAt),
  }));

  const statistics = {
    total: users.length,
    byRole: users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {}),
    byStatus: users.reduce((acc, user) => {
      acc[user.status] = (acc[user.status] || 0) + 1;
      return acc;
    }, {}),
    recentLogins: users.filter(user => {
      if (!user.lastLogin) return false;
      const lastLogin = new Date(user.lastLogin);
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return lastLogin > oneWeekAgo;
    }).length,
  };

  return { users: transformedUsers, statistics };
};

/**
 * Helper Functions
 */

// Calculate carbon intensity (emissions per unit of production)
const calculateCarbonIntensity = (emissions, production) => {
  if (!production || production === 0) return 0;
  return emissions / production;
};

// Calculate capacity utilization percentage
const calculateCapacityUtilization = (actualProduction, capacityMTPA) => {
  if (!capacityMTPA || capacityMTPA === 0) return 0;
  // Convert MTPA to annual tonnes
  const capacityTonnes = capacityMTPA * 1000000;
  return (actualProduction / capacityTonnes) * 100;
};

// Calculate data completeness percentage
const calculateDataCompleteness = (stats) => {
  if (!stats) return 0;
  
  const totalPossibleRecords = (stats.facilities?.total || 0) * 12; // 12 months
  const actualRecords = (stats.dataRecords?.emissions || 0) + (stats.dataRecords?.production || 0);
  
  if (totalPossibleRecords === 0) return 0;
  return Math.min((actualRecords / totalPossibleRecords) * 100, 100);
};

// Calculate facility-specific data completeness
const calculateFacilityDataCompleteness = (statistics) => {
  if (!statistics) return 0;
  
  const currentMonth = new Date().getMonth() + 1;
  const expectedRecords = currentMonth * 2; // Both emission and production data
  const actualRecords = (statistics.emissionRecordsCount || 0) + (statistics.productionRecordsCount || 0);
  
  if (expectedRecords === 0) return 0;
  return Math.min((actualRecords / expectedRecords) * 100, 100);
};

// Group emissions by time period
const groupEmissionsByPeriod = (emissionData, period) => {
  const grouped = emissionData.reduce((acc, emission) => {
    let key;
    if (period === 'monthly') {
      key = `${emission.year}-${String(emission.month).padStart(2, '0')}`;
    } else {
      key = emission.year.toString();
    }
    
    if (!acc[key]) {
      acc[key] = {
        period: key,
        year: emission.year,
        month: period === 'monthly' ? emission.month : null,
        totalEmissions: 0,
        scope1Emissions: 0,
        scope2Emissions: 0,
        resourceCount: 0,
      };
    }
    
    acc[key].totalEmissions += emission.totalEmissions || 0;
    if (emission.scope === 'scope1') {
      acc[key].scope1Emissions += emission.totalEmissions || 0;
    } else if (emission.scope === 'scope2') {
      acc[key].scope2Emissions += emission.totalEmissions || 0;
    }
    acc[key].resourceCount++;
    
    return acc;
  }, {});

  return Object.values(grouped).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return (a.month || 0) - (b.month || 0);
  });
};

// Group production by time period
const groupProductionByPeriod = (productionData, period) => {
  const grouped = productionData.reduce((acc, production) => {
    let key;
    if (period === 'monthly') {
      key = `${production.year}-${String(production.month).padStart(2, '0')}`;
    } else {
      key = production.year.toString();
    }
    
    if (!acc[key]) {
      acc[key] = {
        period: key,
        year: production.year,
        month: period === 'monthly' ? production.month : null,
        totalProduction: 0,
        recordCount: 0,
      };
    }
    
    acc[key].totalProduction += production.cement_production || 0;
    acc[key].recordCount++;
    
    return acc;
  }, {});

  return Object.values(grouped).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return (a.month || 0) - (b.month || 0);
  });
};

// Prepare chart data
const prepareChartData = (data, period) => {
  return data.map(item => ({
    name: period === 'monthly' 
      ? `${getMonthName(item.month)} ${item.year}`
      : item.year.toString(),
    totalEmissions: item.totalEmissions,
    scope1: item.scope1Emissions,
    scope2: item.scope2Emissions,
  }));
};

// Prepare production chart data
const prepareProductionChartData = (data, period) => {
  return data.map(item => ({
    name: period === 'monthly' 
      ? `${getMonthName(item.month)} ${item.year}`
      : item.year.toString(),
    production: item.totalProduction,
  }));
};

// Find peak production period
const findPeakProductionPeriod = (monthlyData) => {
  if (monthlyData.length === 0) return 'N/A';
  
  const peak = monthlyData.reduce((max, current) => 
    current.totalProduction > max.totalProduction ? current : max
  );
  
  return `${getMonthName(peak.month)} ${peak.year}`;
};

// Calculate production growth rate
const calculateProductionGrowthRate = (yearlyData) => {
  if (yearlyData.length < 2) return 'N/A';
  
  const sorted = [...yearlyData].sort((a, b) => a.year - b.year);
  const latest = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];
  
  const growthRate = ((latest.totalProduction - previous.totalProduction) / previous.totalProduction) * 100;
  return `${growthRate >= 0 ? '+' : ''}${growthRate.toFixed(1)}%`;
};

// Utility functions
const getMonthName = (monthNumber) => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return months[monthNumber - 1] || 'Unknown';
};

const formatCategoryName = (category) => {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Transform targets data for display
 */
export const transformTargetsData = (targets) => {
  if (!Array.isArray(targets)) return [];

  return targets.map(target => {
    const progress = calculateTargetProgress(target);
    const timeline = calculateTargetTimeline(target);
    
    return {
      ...target,
      
      // Calculated values
      progress: {
        percentage: progress.percentage,
        status: progress.status,
        onTrack: progress.onTrack,
      },
      
      timeline: {
        totalYears: timeline.totalYears,
        yearsRemaining: timeline.yearsRemaining,
        percentageComplete: timeline.percentageComplete,
      },
      
      // Formatted values
      display: {
        targetType: formatCategoryName(target.target_type || ''),
        baselineValue: formatNumber(target.baseline_value, { precision: 2, unit: target.unit }),
        targetValue: formatNumber(target.target_value, { precision: 2, unit: target.unit }),
        currentValue: progress.currentValue 
          ? formatNumber(progress.currentValue, { precision: 2, unit: target.unit })
          : 'N/A',
        progress: `${progress.percentage}%`,
        status: capitalizeFirst(target.status || 'unknown'),
        timelineStatus: timeline.status,
      },

      // Dates
      baselineDate: formatDate(`${target.baseline_year}-01-01`, 'monthYear'),
      targetDate: formatDate(`${target.target_year}-01-01`, 'monthYear'),
      createdAt: formatDate(target.created_at),
    };
  });
};

// Calculate target progress
const calculateTargetProgress = (target) => {
  // This would be enhanced with actual current value data
  // For now, return placeholder calculations
  const mockCurrentValue = target.baseline_value; // TODO: Get actual current value
  
  const baselineValue = parseFloat(target.baseline_value) || 0;
  const targetValue = parseFloat(target.target_value) || 0;
  const currentValue = mockCurrentValue || baselineValue;
  
  let percentage = 0;
  let status = 'not_started';
  let onTrack = false;
  
  if (targetValue !== baselineValue) {
    if (targetValue > baselineValue) {
      // Increase target
      percentage = Math.max(0, Math.min(100, ((currentValue - baselineValue) / (targetValue - baselineValue)) * 100));
    } else {
      // Reduction target
      percentage = Math.max(0, Math.min(100, ((baselineValue - currentValue) / (baselineValue - targetValue)) * 100));
    }
    
    if (percentage >= 75) status = 'on_track';
    else if (percentage >= 25) status = 'behind';
    else status = 'off_track';
    
    onTrack = percentage >= 50; // Simple heuristic
  }
  
  return {
    percentage: Math.round(percentage),
    status,
    onTrack,
    currentValue,
  };
};

// Calculate target timeline
const calculateTargetTimeline = (target) => {
  const baselineYear = parseInt(target.baseline_year) || new Date().getFullYear();
  const targetYear = parseInt(target.target_year) || new Date().getFullYear();
  const currentYear = new Date().getFullYear();
  
  const totalYears = targetYear - baselineYear;
  const yearsRemaining = Math.max(0, targetYear - currentYear);
  const yearsElapsed = currentYear - baselineYear;
  
  const percentageComplete = totalYears > 0 ? Math.max(0, Math.min(100, (yearsElapsed / totalYears) * 100)) : 0;
  
  let status = 'active';
  if (currentYear >= targetYear) {
    status = 'completed';
  } else if (yearsRemaining <= 1) {
    status = 'urgent';
  } else if (percentageComplete >= 75) {
    status = 'approaching';
  }
  
  return {
    totalYears,
    yearsRemaining,
    percentageComplete: Math.round(percentageComplete),
    status,
  };
};

export default {
  formatNumber,
  formatDate,
  transformOrganizationData,
  transformFacilityData,
  transformEmissionData,
  transformProductionData,
  transformUserData,
  transformTargetsData,
};
