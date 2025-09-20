/**
 * Data Fetching Hooks Test Page
 * Test all custom data hooks and their functionality
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFacility } from '../contexts/FacilityContext';
import { 
  useDashboardData, 
  useFacilityData, 
  useEmissionFactors, 
  useUserManagement,
  useRealTimeData 
} from '../hooks/useData';
import { useApiCall, useFetch, useMutation } from '../hooks/useApi';
import apiService from '../services/api';

const HooksTest = () => {
  const { user } = useAuth();
  const { facilities } = useFacility();
  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const [testResults, setTestResults] = useState({});

  // Test dashboard data hook
  const dashboardData = useDashboardData();
  
  // Test facility data hook
  const facilityData = useFacilityData(selectedFacilityId);
  
  // Test emission factors hook
  const emissionFactors = useEmissionFactors();
  
  // Test user management hook
  const userManagement = useUserManagement();
  
  // Test real-time data hook
  const realTimeData = useRealTimeData(selectedFacilityId);
  
  // Test generic API call hook
  const { execute: executeApiCall, loading: apiCallLoading, error: apiCallError } = useApiCall();
  
  // Test fetch hook
  const { data: healthData, loading: healthLoading, refetch: refetchHealth } = useFetch(
    apiService.healthCheck,
    [],
    { immediate: true }
  );
  
  // Test mutation hook
  const { mutate: testMutation, loading: mutationLoading, error: mutationError } = useMutation(
    apiService.healthCheck,
    {
      onSuccess: (data) => {
        console.log('Mutation test successful:', data);
        setTestResults(prev => ({ ...prev, mutation: 'success' }));
      },
      onError: (error) => {
        console.error('Mutation test failed:', error);
        setTestResults(prev => ({ ...prev, mutation: 'error' }));
      }
    }
  );

  // Test functions
  const testDashboardHook = async () => {
    console.log('Testing Dashboard Hook...');
    console.log('Dashboard Metrics:', dashboardData.metrics);
    console.log('Dashboard Loading:', dashboardData.loading);
    console.log('Dashboard Error:', dashboardData.error);
    
    const refreshResult = await dashboardData.refreshDashboard();
    console.log('Dashboard Refresh Result:', refreshResult);
    
    setTestResults(prev => ({ ...prev, dashboard: 'completed' }));
  };

  const testFacilityHook = async () => {
    if (!selectedFacilityId) {
      alert('Please select a facility first');
      return;
    }
    
    console.log('Testing Facility Hook...');
    console.log('Facility Data:', facilityData.facility);
    console.log('Facility Resources:', facilityData.resources);
    console.log('Facility Emission Data:', facilityData.emissionData);
    console.log('Facility Metrics:', facilityData.metrics);
    console.log('Facility Loading:', facilityData.loading);
    
    const refreshResult = await facilityData.refetchAll();
    console.log('Facility Refresh Result:', refreshResult);
    
    setTestResults(prev => ({ ...prev, facility: 'completed' }));
  };

  const testEmissionFactorsHook = () => {
    console.log('Testing Emission Factors Hook...');
    console.log('Factors:', emissionFactors.factors);
    console.log('Grouped Factors:', emissionFactors.groupedFactors);
    console.log('Factors Loading:', emissionFactors.loading);
    
    // Test utility functions
    if (emissionFactors.factors.length > 0) {
      const firstFactor = emissionFactors.factors[0];
      const resourceFactors = emissionFactors.getFactorsForResource(firstFactor.resource.id);
      const libraryFactors = emissionFactors.getFactorsByLibrary(firstFactor.library.id);
      
      console.log('Resource Factors for first resource:', resourceFactors);
      console.log('Library Factors for first library:', libraryFactors);
    }
    
    setTestResults(prev => ({ ...prev, emissionFactors: 'completed' }));
  };

  const testUserManagementHook = () => {
    console.log('Testing User Management Hook...');
    console.log('Users:', userManagement.users);
    console.log('User Stats:', userManagement.userStats);
    console.log('Can Manage Users:', userManagement.canManageUsers);
    console.log('User Management Loading:', userManagement.loading);
    console.log('User Management Error:', userManagement.error);
    
    // Test utility functions
    const adminUsers = userManagement.getAdminUsers();
    const regularUsers = userManagement.getRegularUsers();
    
    console.log('Admin Users:', adminUsers);
    console.log('Regular Users:', regularUsers);
    
    setTestResults(prev => ({ ...prev, userManagement: 'completed' }));
  };

  const testRealTimeHook = () => {
    console.log('Testing Real-Time Data Hook...');
    console.log('Organization Data:', realTimeData.organizationData);
    console.log('Facility Data:', realTimeData.facilityData);
    console.log('Is Polling:', realTimeData.isPolling);
    
    if (!realTimeData.isPolling) {
      realTimeData.startPolling();
      console.log('Started polling...');
    } else {
      realTimeData.stopPolling();
      console.log('Stopped polling...');
    }
    
    setTestResults(prev => ({ ...prev, realTime: 'completed' }));
  };

  const testApiCallHook = async () => {
    console.log('Testing API Call Hook...');
    
    try {
      const result = await executeApiCall(apiService.healthCheck);
      console.log('API Call Result:', result);
      setTestResults(prev => ({ ...prev, apiCall: 'success' }));
    } catch (error) {
      console.error('API Call Error:', error);
      setTestResults(prev => ({ ...prev, apiCall: 'error' }));
    }
  };

  const testMutationHook = async () => {
    console.log('Testing Mutation Hook...');
    await testMutation();
  };

  const runAllHookTests = async () => {
    console.log('🚀 Starting All Hook Tests...');
    console.log('=====================================');
    
    await testDashboardHook();
    console.log('-------------------------------------');
    
    await testFacilityHook();
    console.log('-------------------------------------');
    
    testEmissionFactorsHook();
    console.log('-------------------------------------');
    
    testUserManagementHook();
    console.log('-------------------------------------');
    
    testRealTimeHook();
    console.log('-------------------------------------');
    
    await testApiCallHook();
    console.log('-------------------------------------');
    
    await testMutationHook();
    console.log('=====================================');
    console.log('✅ All Hook Tests Complete!');
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Data Fetching Hooks Test Page
        </h1>

        {/* Facility Selection */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Facility for Testing:
          </label>
          <select
            value={selectedFacilityId}
            onChange={(e) => setSelectedFacilityId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">-- Select a Facility --</option>
            {facilities.map(facility => (
              <option key={facility.id} value={facility.id}>
                {facility.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dashboard Data Hook */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">📊 Dashboard Data Hook</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Loading:</strong> {dashboardData.loading ? '⏳ Yes' : '✅ No'}</div>
              <div><strong>Error:</strong> {dashboardData.error || 'None'}</div>
              <div><strong>Total Users:</strong> {dashboardData.metrics.totalUsers}</div>
              <div><strong>Total Facilities:</strong> {dashboardData.metrics.totalFacilities}</div>
              <div><strong>Active Targets:</strong> {dashboardData.metrics.activeTargets}</div>
              <div><strong>Carbon Intensity:</strong> {dashboardData.metrics.carbonIntensity} kgCO2e/tonne</div>
              <div><strong>Test Status:</strong> {testResults.dashboard || 'Not tested'}</div>
            </div>
            <button
              onClick={testDashboardHook}
              className="mt-3 bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
            >
              Test Dashboard Hook
            </button>
          </div>

          {/* Facility Data Hook */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">🏭 Facility Data Hook</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Selected:</strong> {facilityData.facility?.name || 'None'}</div>
              <div><strong>Loading:</strong> {facilityData.loading ? '⏳ Yes' : '✅ No'}</div>
              <div><strong>Resources:</strong> {facilityData.resources.length}</div>
              <div><strong>Emission Records:</strong> {facilityData.emissionData.length}</div>
              <div><strong>Status:</strong> {facilityData.facility?.status || 'Unknown'}</div>
              <div><strong>Capacity:</strong> {facilityData.metrics?.capacity || 0} MTPA</div>
              <div><strong>Test Status:</strong> {testResults.facility || 'Not tested'}</div>
            </div>
            <button
              onClick={testFacilityHook}
              disabled={!selectedFacilityId}
              className="mt-3 bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600 disabled:bg-gray-400"
            >
              Test Facility Hook
            </button>
          </div>

          {/* Emission Factors Hook */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">🌿 Emission Factors Hook</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Loading:</strong> {emissionFactors.loading ? '⏳ Yes' : '✅ No'}</div>
              <div><strong>Total Factors:</strong> {emissionFactors.factors.length}</div>
              <div><strong>Scope 1 Categories:</strong> {Object.keys(emissionFactors.groupedFactors.scope1).length}</div>
              <div><strong>Scope 2 Categories:</strong> {Object.keys(emissionFactors.groupedFactors.scope2).length}</div>
              <div><strong>Test Status:</strong> {testResults.emissionFactors || 'Not tested'}</div>
            </div>
            <button
              onClick={testEmissionFactorsHook}
              className="mt-3 bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600"
            >
              Test Emission Factors Hook
            </button>
          </div>

          {/* User Management Hook */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">👥 User Management Hook</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Can Manage:</strong> {userManagement.canManageUsers ? '✅ Yes' : '❌ No'}</div>
              <div><strong>Loading:</strong> {userManagement.loading ? '⏳ Yes' : '✅ No'}</div>
              <div><strong>Total Users:</strong> {userManagement.userStats.total}</div>
              <div><strong>Admin Users:</strong> {userManagement.userStats.admins}</div>
              <div><strong>Regular Users:</strong> {userManagement.userStats.regular}</div>
              <div><strong>Active Users:</strong> {userManagement.userStats.active}</div>
              <div><strong>Test Status:</strong> {testResults.userManagement || 'Not tested'}</div>
            </div>
            <button
              onClick={testUserManagementHook}
              className="mt-3 bg-purple-500 text-white px-4 py-2 rounded text-sm hover:bg-purple-600"
            >
              Test User Management Hook
            </button>
          </div>

          {/* Real-Time Data Hook */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">⚡ Real-Time Data Hook</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Is Polling:</strong> {realTimeData.isPolling ? '🔄 Yes' : '⏸️ No'}</div>
              <div><strong>Org Data:</strong> {realTimeData.organizationData ? '✅ Loaded' : '❌ None'}</div>
              <div><strong>Facility Data:</strong> {realTimeData.facilityData ? '✅ Loaded' : '❌ None'}</div>
              <div><strong>Test Status:</strong> {testResults.realTime || 'Not tested'}</div>
            </div>
            <button
              onClick={testRealTimeHook}
              className="mt-3 bg-yellow-500 text-white px-4 py-2 rounded text-sm hover:bg-yellow-600"
            >
              {realTimeData.isPolling ? 'Stop Polling' : 'Start Polling'}
            </button>
          </div>

          {/* API Call Hook */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">📡 API Call Hook</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Loading:</strong> {apiCallLoading ? '⏳ Yes' : '✅ No'}</div>
              <div><strong>Error:</strong> {apiCallError || 'None'}</div>
              <div><strong>Health Data:</strong> {healthData ? '✅ Loaded' : '❌ None'}</div>
              <div><strong>Health Loading:</strong> {healthLoading ? '⏳ Yes' : '✅ No'}</div>
              <div><strong>Test Status:</strong> {testResults.apiCall || 'Not tested'}</div>
            </div>
            <div className="mt-3 space-x-2">
              <button
                onClick={testApiCallHook}
                className="bg-indigo-500 text-white px-4 py-2 rounded text-sm hover:bg-indigo-600"
              >
                Test API Call Hook
              </button>
              <button
                onClick={refetchHealth}
                className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600"
              >
                Refetch Health
              </button>
            </div>
          </div>

          {/* Mutation Hook */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">🔄 Mutation Hook</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Loading:</strong> {mutationLoading ? '⏳ Yes' : '✅ No'}</div>
              <div><strong>Error:</strong> {mutationError || 'None'}</div>
              <div><strong>Test Status:</strong> {testResults.mutation || 'Not tested'}</div>
            </div>
            <button
              onClick={testMutationHook}
              className="mt-3 bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600"
            >
              Test Mutation Hook
            </button>
          </div>
        </div>

        {/* Run All Tests */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={runAllHookTests}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            🧪 Run All Hook Tests
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Testing Instructions</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Select a facility from the dropdown for facility-specific tests</li>
            <li>• Click individual test buttons to test specific hooks</li>
            <li>• Click "Run All Hook Tests" to test all hooks sequentially</li>
            <li>• Check browser console for detailed test output</li>
            <li>• All hooks should load data and provide utility functions</li>
            <li>• Real-time polling can be started/stopped to test polling functionality</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HooksTest;
