/**
 * Dashboard Integration Test Page
 * Tests real emission data integration with charts and metrics
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDashboardData } from '../hooks/useData';
import { useNotification } from '../contexts/NotificationContext';
import apiService from '../services/api';

// UI Components
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorAlert from '../components/ui/ErrorAlert';

const DashboardIntegrationTest = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Use the real dashboard data hook
  const { 
    metrics, 
    loading, 
    error, 
    refreshDashboard, 
    dashboardData, 
    analyticsData 
  } = useDashboardData(selectedYear);

  const [testResults, setTestResults] = useState({
    dashboardAPI: null,
    analyticsAPI: null,
    emissionCreation: null,
    productionCreation: null
  });

  const [isRunningTests, setIsRunningTests] = useState(false);

  // Test creating sample emission data
  const createSampleEmissionData = async () => {
    try {
      showInfo('Creating sample emission data...', { title: 'Data Creation' });
      
      // First, we need to get facilities
      const facilitiesResponse = await apiService.getFacilities();
      if (!facilitiesResponse.success || facilitiesResponse.data.facilities.length === 0) {
        throw new Error('No facilities found for emission data creation');
      }

      const facility = facilitiesResponse.data.facilities[0];
      
      // Get available emission resources
      const resourcesResponse = await apiService.getEmissionResources();
      if (!resourcesResponse.success || resourcesResponse.data.resources.length === 0) {
        throw new Error('No emission resources found');
      }

      const resource = resourcesResponse.data.resources[0];

      // Get emission factors for this resource
      const factorsResponse = await apiService.getEmissionFactors({ resourceId: resource.id });
      if (!factorsResponse.success || factorsResponse.data.factors.length === 0) {
        throw new Error('No emission factors found for resource');
      }

      const factor = factorsResponse.data.factors[0];

      // Configure facility resource if not already configured
      try {
        await apiService.configureFacilityResource(facility.id, {
          resourceId: resource.id,
          emissionFactorId: factor.id
        });
      } catch (configError) {
        // Resource might already be configured - that's okay
        console.log('Resource configuration:', configError.message);
      }

      // Create sample emission data for the past 6 months
      const createdEntries = [];
      const currentDate = new Date();
      
      for (let i = 0; i < 6; i++) {
        const entryDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const month = entryDate.getMonth() + 1;
        const year = entryDate.getFullYear();
        
        // Create varying consumption amounts
        const baseConsumption = 1000 + (Math.random() * 500); // 1000-1500 units
        const consumption = Math.round(baseConsumption);
        
        try {
          const emissionEntry = await apiService.createEmissionData({
            facilityId: facility.id,
            facilityResourceId: null, // Will be determined by backend
            month,
            year,
            scope: resource.scope,
            consumption,
            consumptionUnit: 'litres'
          });
          
          if (emissionEntry.success) {
            createdEntries.push({
              month,
              year,
              consumption,
              facilityName: facility.name,
              resourceName: resource.name
            });
          }
        } catch (entryError) {
          console.log(`Failed to create entry for ${year}-${month}:`, entryError.message);
        }
      }

      showSuccess(`Created ${createdEntries.length} emission data entries`, { title: 'Data Created' });
      return createdEntries;
      
    } catch (error) {
      showError(`Failed to create sample emission data: ${error.message}`, { title: 'Creation Error' });
      throw error;
    }
  };

  // Test creating sample production data
  const createSampleProductionData = async () => {
    try {
      showInfo('Creating sample production data...', { title: 'Production Data' });
      
      // Get facilities
      const facilitiesResponse = await apiService.getFacilities();
      if (!facilitiesResponse.success || facilitiesResponse.data.facilities.length === 0) {
        throw new Error('No facilities found for production data creation');
      }

      const createdEntries = [];
      
      // Create production data for all facilities
      for (const facility of facilitiesResponse.data.facilities) {
        for (let i = 0; i < 6; i++) {
          const entryDate = new Date();
          entryDate.setMonth(entryDate.getMonth() - i);
          const month = entryDate.getMonth() + 1;
          const year = entryDate.getFullYear();
          
          // Create varying production amounts based on facility capacity
          const facilityCapacity = facility.location?.capacity_mtpa || 1.0;
          const monthlyCapacity = (facilityCapacity * 1000000) / 12; // Convert MTPA to monthly tonnes
          const utilizationRate = 0.7 + (Math.random() * 0.2); // 70-90% utilization
          const production = Math.round(monthlyCapacity * utilizationRate);
          
          try {
            const productionEntry = await apiService.createProductionData({
              facilityId: facility.id,
              month,
              year,
              cementProduction: production,
              unit: 'tonnes'
            });
            
            if (productionEntry.success) {
              createdEntries.push({
                month,
                year,
                production,
                facilityName: facility.name
              });
            }
          } catch (entryError) {
            console.log(`Failed to create production entry for ${facility.name} ${year}-${month}:`, entryError.message);
          }
        }
      }

      showSuccess(`Created ${createdEntries.length} production data entries`, { title: 'Production Data Created' });
      return createdEntries;
      
    } catch (error) {
      showError(`Failed to create sample production data: ${error.message}`, { title: 'Production Error' });
      throw error;
    }
  };

  // Run comprehensive integration test
  const runIntegrationTest = async () => {
    setIsRunningTests(true);
    setTestResults({
      dashboardAPI: null,
      analyticsAPI: null,
      emissionCreation: null,
      productionCreation: null
    });

    try {
      // Test 1: Create sample data first
      showInfo('Running dashboard integration tests...', { title: 'Integration Test' });
      
      const emissionEntries = await createSampleEmissionData();
      setTestResults(prev => ({ ...prev, emissionCreation: { success: true, count: emissionEntries.length } }));
      
      const productionEntries = await createSampleProductionData();
      setTestResults(prev => ({ ...prev, productionCreation: { success: true, count: productionEntries.length } }));

      // Test 2: Test dashboard API directly
      try {
        const dashboardResponse = await apiService.getOrganizationDashboard(user.organizationId, { year: selectedYear });
        setTestResults(prev => ({ 
          ...prev, 
          dashboardAPI: { 
            success: dashboardResponse.success, 
            data: dashboardResponse.data?.summary 
          } 
        }));
      } catch (error) {
        setTestResults(prev => ({ 
          ...prev, 
          dashboardAPI: { 
            success: false, 
            error: error.message 
          } 
        }));
      }

      // Test 3: Test analytics API directly
      try {
        const analyticsResponse = await apiService.getOrganizationEmissionAnalytics(user.organizationId, { year: selectedYear });
        setTestResults(prev => ({ 
          ...prev, 
          analyticsAPI: { 
            success: analyticsResponse.success, 
            data: analyticsResponse.data?.summary 
          } 
        }));
      } catch (error) {
        setTestResults(prev => ({ 
          ...prev, 
          analyticsAPI: { 
            success: false, 
            error: error.message 
          } 
        }));
      }

      // Test 4: Refresh dashboard data
      await refreshDashboard();
      
      showSuccess('Dashboard integration test completed!', { title: 'Test Complete' });
      
    } catch (error) {
      showError(`Integration test failed: ${error.message}`, { title: 'Test Failed' });
    } finally {
      setIsRunningTests(false);
    }
  };

  const formatNumber = (num) => {
    if (num === undefined || num === null) return 'N/A';
    return new Intl.NumberFormat().format(Math.round(num * 100) / 100);
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard data..." />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          📊 Dashboard Integration Test
        </h1>
        
        {/* Year Selection and Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={runIntegrationTest}
              disabled={isRunningTests}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunningTests ? <LoadingSpinner size="sm" /> : 'Run Integration Test'}
            </button>
          </div>

          <div className="flex items-end">
            <button
              onClick={refreshDashboard}
              disabled={loading}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Refresh Dashboard'}
            </button>
          </div>
        </div>

        {/* Dashboard Metrics Display */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📈 Real Dashboard Metrics ({selectedYear})
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm font-medium text-gray-500">Total Facilities</div>
              <div className="text-2xl font-bold text-blue-600">{metrics.totalFacilities || 0}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm font-medium text-gray-500">Active Targets</div>
              <div className="text-2xl font-bold text-green-600">{metrics.activeTargets || 0}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm font-medium text-gray-500">Total Emissions</div>
              <div className="text-2xl font-bold text-red-600">{formatNumber(metrics.totalEmissions)} kgCO2e</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm font-medium text-gray-500">Total Production</div>
              <div className="text-2xl font-bold text-orange-600">{formatNumber(metrics.totalProduction)} tonnes</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm font-medium text-gray-500 mb-2">Carbon Intensity</div>
              <div className="text-xl font-bold text-purple-600">
                {formatNumber(metrics.carbonIntensity)} kgCO2e/tonne
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm font-medium text-gray-500 mb-2">Energy Intensity</div>
              <div className="text-xl font-bold text-indigo-600">
                {formatNumber(metrics.energyIntensity)} MJ/tonne
              </div>
            </div>
          </div>
        </div>

        {/* Chart Data Preview */}
        {(metrics.monthlyEmissions?.length > 0 || metrics.monthlyProduction?.length > 0) && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📊 Chart Data Preview
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Monthly Emissions */}
              {metrics.monthlyEmissions?.length > 0 && (
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold mb-3">Monthly Emissions Data</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {metrics.monthlyEmissions.slice(0, 6).map((data, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{data.month}</span>
                        <span className="font-medium">{formatNumber(data.value)} kgCO2e</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Monthly Production */}
              {metrics.monthlyProduction?.length > 0 && (
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold mb-3">Monthly Production Data</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {metrics.monthlyProduction.slice(0, 6).map((data, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{data.month}</span>
                        <span className="font-medium">{formatNumber(data.value)} tonnes</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Test Results */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🧪 Integration Test Results
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(testResults).map(([testName, result]) => (
              <div key={testName} className="bg-white p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900 capitalize">
                    {testName.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className={`text-sm font-medium ${
                    result === null ? 'text-gray-500' :
                    result.success ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {result === null ? 'Not Run' : result.success ? '✅ Success' : '❌ Failed'}
                  </div>
                </div>
                {result && (
                  <div className="text-sm text-gray-600">
                    {result.success ? (
                      result.count ? `Created ${result.count} entries` :
                      result.data ? `Data: ${JSON.stringify(result.data).substring(0, 100)}...` :
                      'Operation successful'
                    ) : (
                      `Error: ${result.error}`
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <ErrorAlert
            type="error"
            title="Dashboard Integration Error"
            message={error.message || 'Failed to load dashboard data'}
            onRetry={refreshDashboard}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardIntegrationTest;
