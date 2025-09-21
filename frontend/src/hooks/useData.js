/**
 * Specialized Data Fetching Hooks
 * Domain-specific hooks for iLLuMinate entities
 */

import React, { useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { useFacility } from '../contexts/FacilityContext';
import { useEmission } from '../contexts/EmissionContext';
import { useUser } from '../contexts/UserContext';
import { useFetch, useMutation, usePolling } from './useApi';
import apiService from '../services/api';

/**
 * Hook for dashboard data - now uses real dashboard API with fallback for no-auth
 */
export const useDashboardData = (year = new Date().getFullYear()) => {
  const { user } = useAuth();
  console.log('📊 useDashboardData hook called with:', { user, year });

  // Check if we have authentication bypass enabled
  const hasValidUser = user && user.organizationId;
  console.log('🔐 Has valid user for API calls:', hasValidUser);
  console.log('🔐 Authentication state:', { user, isAuthenticated: !!user });

  // Fetch dashboard summary from API (only if authenticated)
  const { 
    data: dashboardData, 
    loading: dashboardLoading, 
    error: dashboardError,
    refetch: refetchDashboard 
  } = useFetch(
    () => hasValidUser ? apiService.getOrganizationDashboard(user.organizationId, { year }) : Promise.resolve({ success: false }),
    [hasValidUser, user?.organizationId, year],
    {
      immediate: hasValidUser,
      refetchInterval: hasValidUser ? 5 * 60 * 1000 : null, // Only refresh if authenticated
    }
  );

  // Fetch emission analytics for charts (only if authenticated)
  const { 
    data: analyticsData, 
    loading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics 
  } = useFetch(
    () => hasValidUser ? apiService.getOrganizationEmissionAnalytics(user.organizationId, { year, period: 'monthly' }) : Promise.resolve({ success: false }),
    [hasValidUser, user?.organizationId, year],
    {
      immediate: hasValidUser,
      refetchInterval: hasValidUser ? 5 * 60 * 1000 : null, // Only refresh if authenticated
    }
  );

  console.log('📡 API call results:', {
    hasValidUser,
    dashboardLoading,
    analyticsLoading,
    dashboardDataFull: dashboardData,
    analyticsDataFull: analyticsData,
    dashboardSuccess: dashboardData?.success,
    analyticsSuccess: analyticsData?.success
  });
  
  // Critical debug: Log the exact data structure we're receiving
  console.log('🚨 CRITICAL DEBUG - Dashboard Data Structure:', JSON.stringify(dashboardData, null, 2));
  console.log('🚨 CRITICAL DEBUG - Analytics Data Structure:', JSON.stringify(analyticsData, null, 2));

  // Refresh all dashboard data
  const refreshDashboard = useCallback(async () => {
    if (!user?.organizationId) return;

    const promises = [
      refetchDashboard(),
      refetchAnalytics(),
    ];

    const results = await Promise.allSettled(promises);
    return results;
  }, [user?.organizationId, refetchDashboard, refetchAnalytics]);

  // Process and structure dashboard metrics with fallback for no-auth
  const metrics = useMemo(() => {
    console.log('🔄 Processing metrics with data:', { 
      hasValidUser, 
      dashboardSuccess: dashboardData?.success,
      analyticsSuccess: analyticsData?.success 
    });

    // If no authentication, provide mock data for UI testing
    if (!hasValidUser) {
      console.log('🎭 Using mock data - no authentication');
      return {
        // Core organization metrics
        totalFacilities: 2,
        activeFacilities: 2,
        totalUsers: 3,
        activeTargets: 1,
        
        // Emission and production metrics
        totalEmissions: 15420000, // 15.42M kgCO2e
        totalEnergy: 23850000,    // 23.85M MJ
        totalProduction: 1850000, // 1.85M tonnes
        
        // Calculated intensities
        carbonIntensity: 833.5,   // kgCO2e/tonne
        energyIntensity: 12897.3, // MJ/tonne
        
        // Data completeness
        dataCompleteness: {
          overall: 85,
          emissions: 90,
          production: 80
        },
        
        // Chart data for dashboard
        monthlyEmissions: [
          { month: 'Jan', value: 1350000, scope1: 1150000, scope2: 200000 },
          { month: 'Feb', value: 1420000, scope1: 1200000, scope2: 220000 },
          { month: 'Mar', value: 1380000, scope1: 1180000, scope2: 200000 },
          { month: 'Apr', value: 1290000, scope1: 1100000, scope2: 190000 },
          { month: 'May', value: 1340000, scope1: 1140000, scope2: 200000 },
          { month: 'Jun', value: 1220000, scope1: 1050000, scope2: 170000 }
        ],
        
        monthlyProduction: [
          { month: 'Jan', value: 155000 },
          { month: 'Feb', value: 162000 },
          { month: 'Mar', value: 158000 },
          { month: 'Apr', value: 148000 },
          { month: 'May', value: 152000 },
          { month: 'Jun', value: 145000 }
        ],
        
        monthlyIntensity: [
          { month: 'Jan', carbon: 870, energy: 13200 },
          { month: 'Feb', carbon: 877, energy: 13150 },
          { month: 'Mar', carbon: 873, energy: 13100 },
          { month: 'Apr', carbon: 872, energy: 13250 },
          { month: 'May', carbon: 882, energy: 13300 },
          { month: 'Jun', carbon: 842, energy: 12900 }
        ],
        
        scopeBreakdown: [
          { name: 'Scope 1', value: 12850000, percentage: 83.3 },
          { name: 'Scope 2', value: 2570000, percentage: 16.7 }
        ],
        
        trends: {
          emissions: { value: 2.3, direction: 'increasing' },
          production: { value: 1.8, direction: 'increasing' },
          carbonIntensity: { value: -1.2, direction: 'decreasing' }
        }
      };
    }

    // Use real API data if authenticated
    // Fix: useFetch already extracts .data, so dashboardData IS the data
    const dashboard = dashboardData || {};
    const analytics = analyticsData || {};
    
    console.log('🔍 Raw API dashboard data:', dashboard);
    console.log('🔍 Raw API analytics data:', analytics);
    console.log('🔍 Dashboard data success:', dashboardData?.success);
    console.log('🔍 Analytics data success:', analyticsData?.success);
    console.log('🔍 Dashboard raw structure:', Object.keys(dashboard));
    
    const summary = dashboard.summary || {};
    const monthlyData = analytics.monthlyData || [];
    const trends = analytics.trends || {};
    
    console.log('🔍 Extracted summary data:', summary);
    console.log('🔍 Summary keys:', Object.keys(summary));
    console.log('🔍 Key metric values:', {
      totalFacilities: summary.totalFacilities,
      activeTargets: summary.activeTargets,
      totalEmissions: summary.totalEmissions,
      totalProduction: summary.totalProduction
    });
    
    return {
      // Core organization metrics
      totalFacilities: summary.totalFacilities || 0,
      activeFacilities: summary.activeFacilities || 0,
      totalUsers: summary.totalUsers || 0,
      activeTargets: summary.activeTargets || 0,
      
      // Emission and production metrics
      totalEmissions: summary.totalEmissions || 0,
      totalEnergy: summary.totalEnergy || 0,
      totalProduction: summary.totalProduction || 0,
      
      // Calculated intensities
      carbonIntensity: summary.carbonIntensity || 0,
      energyIntensity: summary.energyIntensity || 0,
      
      // Data completeness
      dataCompleteness: summary.dataCompleteness || {},
      
      // Chart data for dashboard
      monthlyEmissions: monthlyData.map(m => ({
        month: m.monthName,
        value: m.totalEmissions || 0,
        scope1: m.scope1Emissions || 0,
        scope2: m.scope2Emissions || 0
      })),
      
      monthlyProduction: monthlyData.map(m => ({
        month: m.monthName,
        value: m.totalProduction || 0
      })),
      
      monthlyIntensity: monthlyData.map(m => ({
        month: m.monthName,
        carbonIntensity: m.carbonIntensity || 0,
        energyIntensity: m.energyIntensity || 0
      })),
      
      // Facility breakdown
      facilityBreakdown: analytics.facilityData || [],
      
      // Scope breakdown
      scopeBreakdown: analytics.scopeBreakdown || { scope1: [], scope2: [] },
      
      // Category breakdown
      categoryBreakdown: analytics.categoryBreakdown || [],
      
      // Trends
      trends: {
        emissions: trends.emissions || { value: 0, direction: 'stable' },
        production: trends.production || { value: 0, direction: 'stable' },
        carbonIntensity: trends.carbonIntensity || { value: 0, direction: 'stable' },
        energyIntensity: trends.energyIntensity || { value: 0, direction: 'stable' }
      }
    };
  }, [hasValidUser, dashboardData, analyticsData]);

  // Don't show loading if we're using mock data (no authentication)
  const loading = hasValidUser ? (dashboardLoading || analyticsLoading) : false;
  const error = hasValidUser ? (dashboardError || analyticsError) : null;

  console.log('🔄 Final hook state:', { 
    hasValidUser, 
    loading, 
    error, 
    metricsCount: Object.keys(metrics).length,
    metricsPreview: {
      totalFacilities: metrics.totalFacilities,
      activeTargets: metrics.activeTargets,
      totalEmissions: metrics.totalEmissions,
      totalProduction: metrics.totalProduction
    }
  });

  return {
    metrics,
    loading,
    error,
    refreshDashboard,
    dashboardData: dashboardData,
    analyticsData: analyticsData
  };
};

/**
 * Hook for facility-specific data
 */
export const useFacilityData = (facilityId) => {
  const facility = useFacility();
  const emission = useEmission();
  const { isAuthenticated } = useAuth();

  // Check if facilityId is a mock ID
  const isMockFacility = facilityId && (facilityId === 'facility-1' || facilityId === 'facility-2');

  // Fetch facility details - use mock data for mock IDs or when not authenticated
  const { data: facilityData, loading: facilityLoading, refetch: refetchFacility } = useFetch(
    () => {
      if (!facilityId) return Promise.resolve({ success: false });
      
      // If it's a mock facility ID or not authenticated, provide mock data
      if (isMockFacility || !isAuthenticated) {
        const mockFacilities = {
          'facility-1': {
            success: true,
            facility: {
              id: 'facility-1',
              name: 'JK Cement Muddapur Plant',
              description: 'Modern cement plant in Muddapur, Karnataka with 1.5 MTPA capacity',
              location: { 
                city: 'Muddapur', 
                state: 'Karnataka', 
                country: 'India', 
                capacity_mtpa: 1.5,
                technology: 'Dry Process Kiln'
              },
              status: 'active',
              organizationId: 'mock-org-id',
              statistics: {
                emissionRecordsCount: 12,
                productionRecordsCount: 12,
                targetsCount: 2,
                configuredResourcesCount: 8,
                currentYearEmissions: 850000,
                currentYearProduction: 1200000,
                carbonIntensity: 0.708
              },
              createdAt: '2020-01-01T00:00:00Z',
              updatedAt: '2024-12-01T00:00:00Z'
            }
          },
          'facility-2': {
            success: true,
            facility: {
              id: 'facility-2',
              name: 'JK Cement Mangrol Plant',
              description: 'State-of-the-art cement manufacturing facility in Mangrol, Rajasthan with 2.7 MTPA capacity',
              location: { 
                city: 'Mangrol', 
                state: 'Rajasthan', 
                country: 'India', 
                capacity_mtpa: 2.7,
                technology: 'Dry Process with WHR'
              },
              status: 'active',
              organizationId: 'mock-org-id',
              statistics: {
                emissionRecordsCount: 12,
                productionRecordsCount: 12,
                targetsCount: 3,
                configuredResourcesCount: 10,
                currentYearEmissions: 1200000,
                currentYearProduction: 2400000,
                carbonIntensity: 0.500
              },
              createdAt: '2019-01-01T00:00:00Z',
              updatedAt: '2024-12-01T00:00:00Z'
            }
          }
        };
        
        return Promise.resolve(mockFacilities[facilityId] || { success: false, message: 'Mock facility not found' });
      }
      
      // For real facility IDs with authentication, use the API
      return apiService.getFacility(facilityId);
    },
    [facilityId, isMockFacility, isAuthenticated],
    {
      immediate: !!facilityId,
      onSuccess: (data) => {
        // Update context with facility data only for real facilities
        if (!isMockFacility && isAuthenticated) {
          facility.fetchFacility(facilityId);
        }
      }
    }
  );

  // Fetch facility resources
  const { data: resourcesData, loading: resourcesLoading, refetch: refetchResources } = useFetch(
    () => {
      if (!facilityId) return Promise.resolve({ success: false });
      
      // Use mock data for mock facilities or when not authenticated
      if (isMockFacility || !isAuthenticated) {
        return Promise.resolve({
          success: true,
          resources: [
            { id: 'res1', scope: 'scope1', category: 'fuel', name: 'Coal', consumption: 1000 },
            { id: 'res2', scope: 'scope1', category: 'fuel', name: 'Biomass', consumption: 200 },
            { id: 'res3', scope: 'scope2', category: 'electricity', name: 'Grid Electricity', consumption: 500 }
          ]
        });
      }
      
      return apiService.getFacilityResources(facilityId);
    },
    [facilityId, isMockFacility, isAuthenticated],
    { immediate: !!facilityId }
  );

  // Fetch facility emission data
  const { data: emissionData, loading: emissionLoading, refetch: refetchEmissions } = useFetch(
    () => {
      if (!facilityId) return Promise.resolve({ success: false });
      
      // Use mock data for mock facilities or when not authenticated
      if (isMockFacility || !isAuthenticated) {
        const currentYear = new Date().getFullYear();
        const mockEmissions = [];
        for (let month = 1; month <= 12; month++) {
          mockEmissions.push({
            id: `emit_${month}`,
            year: currentYear,
            month,
            scope: 'scope1',
            totalEmissions: 70000 + Math.random() * 10000,
            totalEnergy: 250000 + Math.random() * 50000,
            resource: { category: 'stationary_combustion' }
          });
        }
        return Promise.resolve({
          success: true,
          emissionData: mockEmissions
        });
      }
      
      return apiService.getEmissionData(facilityId);
    },
    [facilityId, isMockFacility, isAuthenticated],
    { immediate: !!facilityId }
  );

  // Calculate facility metrics
  const facilityMetrics = useMemo(() => {
    if (!facilityData?.facility) return null;

    const facility = facilityData.facility;
    const emissions = emissionData?.emissionData || [];
    const resources = resourcesData?.resources || [];

    // Calculate annual totals
    const currentYear = new Date().getFullYear();
    const annualEmissions = emissions
      .filter(e => e.year === currentYear)
      .reduce((sum, e) => sum + (e.totalEmissions || 0), 0);

    const annualProduction = facility.statistics?.currentYearProduction || 0;

    return {
      name: facility.name,
      status: facility.status,
      capacity: facility.location?.capacity_mtpa || 0,
      technology: facility.location?.technology || 'Unknown',
      location: `${facility.location?.city}, ${facility.location?.state}`,
      
      // Current year metrics
      annualEmissions,
      annualProduction,
      carbonIntensity: annualProduction > 0 ? (annualEmissions / annualProduction).toFixed(3) : 0,
      
      // Resource metrics
      configuredResources: resources.length,
      scope1Resources: resources.filter(r => r.scope === 'scope1').length,
      scope2Resources: resources.filter(r => r.scope === 'scope2').length,
      
      // Data availability
      hasEmissionData: emissions.length > 0,
      hasResources: resources.length > 0,
      dataCompleteness: calculateDataCompleteness(emissions, currentYear),
    };
  }, [facilityData, emissionData, resourcesData]);

  const loading = facilityLoading || resourcesLoading || emissionLoading;

  const refetchAll = useCallback(async () => {
    const promises = [refetchFacility(), refetchResources(), refetchEmissions()];
    return Promise.allSettled(promises);
  }, [refetchFacility, refetchResources, refetchEmissions]);

  return {
    facility: facilityData?.facility,
    resources: resourcesData?.resources || [],
    emissionData: emissionData?.emissionData || [],
    metrics: facilityMetrics,
    loading,
    refetchAll,
  };
};

/**
 * Hook for emission factor management
 */
export const useEmissionFactors = (filters = {}) => {
  const emission = useEmission();

  // Fetch emission factors with filters
  const { data: factorsData, loading, refetch } = useFetch(
    () => apiService.getEmissionFactors(filters),
    [JSON.stringify(filters)],
    { immediate: true }
  );

  // Group factors by scope and category
  const groupedFactors = useMemo(() => {
    const factors = factorsData?.factors || [];
    
    const grouped = {
      scope1: {},
      scope2: {},
    };

    factors.forEach(factor => {
      const scope = factor.resource.scope;
      const category = factor.resource.category;
      
      if (!grouped[scope][category]) {
        grouped[scope][category] = [];
      }
      
      grouped[scope][category].push(factor);
    });

    return grouped;
  }, [factorsData]);

  // Get factors for specific resource
  const getFactorsForResource = useCallback((resourceId) => {
    const factors = factorsData?.factors || [];
    return factors.filter(factor => factor.resource.id === resourceId);
  }, [factorsData]);

  // Get factors by library
  const getFactorsByLibrary = useCallback((libraryId) => {
    const factors = factorsData?.factors || [];
    return factors.filter(factor => factor.library.id === libraryId);
  }, [factorsData]);

  return {
    factors: factorsData?.factors || [],
    groupedFactors,
    loading,
    refetch,
    getFactorsForResource,
    getFactorsByLibrary,
  };
};

/**
 * Hook for user management
 */
export const useUserManagement = () => {
  const user = useUser();
  const { isAdmin } = useAuth();

  // Create user mutation
  const createUserMutation = useMutation(apiService.createUser, {
    onSuccess: (data) => {
      user.fetchUsers(); // Refresh user list
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation(
    ({ userId, userData }) => apiService.updateUser(userId, userData),
    {
      onSuccess: (data) => {
        user.fetchUsers(); // Refresh user list
      }
    }
  );

  // Delete user mutation
  const deleteUserMutation = useMutation(apiService.deleteUser, {
    onSuccess: (data) => {
      user.fetchUsers(); // Refresh user list
    }
  });

  // User statistics
  const userStats = useMemo(() => {
    return user.getUserStats();
  }, [user]);

  return {
    // Data
    users: user.users,
    userStats,
    loading: user.loading || createUserMutation.loading || updateUserMutation.loading || deleteUserMutation.loading,
    error: user.error || createUserMutation.error || updateUserMutation.error || deleteUserMutation.error,
    
    // Actions
    createUser: createUserMutation.mutate,
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    refreshUsers: user.fetchUsers,
    
    // Utilities
    getUserById: user.getUserById,
    getUsersByRole: user.getUsersByRole,
    getAdminUsers: user.getAdminUsers,
    getRegularUsers: user.getRegularUsers,
    
    // Access control
    canManageUsers: isAdmin,
  };
};

/**
 * Hook for real-time data monitoring
 */
export const useRealTimeData = (facilityId, interval = 30000) => {
  const { user } = useAuth();
  
  // Poll organization stats
  const orgPolling = usePolling(
    () => user?.organizationId ? apiService.getOrganizationStats(user.organizationId) : Promise.resolve({ success: false }),
    interval,
    [user?.organizationId]
  );

  // Poll facility data if facilityId provided
  const facilityPolling = usePolling(
    () => facilityId ? apiService.getFacility(facilityId) : Promise.resolve({ success: false }),
    interval,
    [facilityId]
  );

  // Start/stop polling based on page visibility
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      orgPolling.stopPolling();
      facilityPolling.stopPolling();
    } else {
      orgPolling.startPolling();
      if (facilityId) facilityPolling.startPolling();
    }
  }, [orgPolling, facilityPolling, facilityId]);

  // Set up visibility change listener
  React.useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  return {
    organizationData: orgPolling.data,
    facilityData: facilityPolling.data,
    isPolling: orgPolling.isPolling || facilityPolling.isPolling,
    startPolling: () => {
      orgPolling.startPolling();
      if (facilityId) facilityPolling.startPolling();
    },
    stopPolling: () => {
      orgPolling.stopPolling();
      facilityPolling.stopPolling();
    },
  };
};

// Utility function to calculate data completeness
function calculateDataCompleteness(emissionData, year) {
  const monthsInYear = 12;
  const currentMonth = new Date().getMonth() + 1;
  const targetMonths = year === new Date().getFullYear() ? currentMonth : monthsInYear;
  
  const availableMonths = new Set(
    emissionData
      .filter(e => e.year === year)
      .map(e => e.month)
  ).size;
  
  return targetMonths > 0 ? (availableMonths / targetMonths * 100).toFixed(1) : 0;
}
