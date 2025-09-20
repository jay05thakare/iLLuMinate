/**
 * Data Aggregation Test Page
 * Comprehensive testing of advanced aggregation and calculation services
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFacility } from '../contexts/FacilityContext';
import { useNotification } from '../contexts/NotificationContext';
import apiService from '../services/api';

// Advanced calculation utilities
import {
  calculateResourceContribution,
  calculateFacilityEfficiency,
  calculateMonthlyAggregation,
  calculateIntensityMetrics,
  calculatePerformanceIndicators,
  calculateVariabilityMetrics,
  calculateSeasonalPatterns
} from '../utils/calculations';

// UI Components
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorAlert from '../components/ui/ErrorAlert';

const AggregationTest = () => {
  const { user } = useAuth();
  const { facilities } = useFacility();
  const { showSuccess, showError, showInfo } = useNotification();

  // Test states
  const [activeTest, setActiveTest] = useState('organization');
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);

  // Test parameters
  const [parameters, setParameters] = useState({
    year: new Date().getFullYear(),
    months: 12,
    includeProjections: false,
    includeResourceBreakdown: false,
    selectedFacilities: []
  });

  // Initialize with available facilities
  useEffect(() => {
    if (facilities.length > 0) {
      setParameters(prev => ({
        ...prev,
        selectedFacilities: facilities.slice(0, Math.min(3, facilities.length)).map(f => f.id)
      }));
    }
  }, [facilities]);

  // Test Organization Metrics
  const testOrganizationMetrics = async () => {
    try {
      showInfo('Testing organization metrics aggregation...', { title: 'Organization Test' });
      
      const response = await apiService.getOrganizationMetrics(user.organizationId, {
        year: parameters.year,
        period: 'monthly',
        includeProjections: parameters.includeProjections
      });

      if (response.success) {
        const metrics = response.data.metrics;
        
        // Calculate additional insights using frontend utilities
        const facilityEfficiency = calculateFacilityEfficiency(
          Object.values(metrics.byFacility),
          response.data.benchmarks
        );

        const performanceIndicators = calculatePerformanceIndicators(
          { value: metrics.summary.carbonIntensity },
          { efficiency: 700, limit: 1200 }
        );

        setTestResults(prev => ({
          ...prev,
          organizationMetrics: {
            ...response.data,
            facilityEfficiency,
            performanceIndicators,
            calculatedAt: new Date().toISOString()
          }
        }));

        showSuccess('Organization metrics calculated successfully!', { title: 'Test Complete' });
      }

    } catch (error) {
      showError(`Organization metrics test failed: ${error.message}`, { title: 'Test Failed' });
      setTestResults(prev => ({
        ...prev,
        organizationMetrics: { error: error.message }
      }));
    }
  };

  // Test Facility Metrics
  const testFacilityMetrics = async () => {
    if (facilities.length === 0) {
      showError('No facilities available for testing', { title: 'Test Error' });
      return;
    }

    try {
      showInfo('Testing facility metrics aggregation...', { title: 'Facility Test' });
      
      const facility = facilities[0];
      const response = await apiService.getFacilityMetrics(facility.id, {
        year: parameters.year,
        months: parameters.months,
        includeResourceBreakdown: parameters.includeResourceBreakdown
      });

      if (response.success) {
        const data = response.data;
        
        // Create mock monthly data for advanced calculations
        const mockMonthlyData = Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          year: parameters.year,
          value: Math.random() * 1000 + 500 // Mock emission values
        }));

        // Calculate variability metrics
        const variabilityMetrics = calculateVariabilityMetrics(mockMonthlyData);
        
        // Calculate seasonal patterns
        const seasonalPatterns = calculateSeasonalPatterns(mockMonthlyData);

        // Calculate monthly aggregation
        const monthlyAggregation = calculateMonthlyAggregation(mockMonthlyData, 'sum');

        setTestResults(prev => ({
          ...prev,
          facilityMetrics: {
            ...data,
            advancedAnalysis: {
              variabilityMetrics,
              seasonalPatterns,
              monthlyAggregation
            },
            calculatedAt: new Date().toISOString()
          }
        }));

        showSuccess(`Facility metrics calculated for ${facility.name}!`, { title: 'Test Complete' });
      }

    } catch (error) {
      showError(`Facility metrics test failed: ${error.message}`, { title: 'Test Failed' });
      setTestResults(prev => ({
        ...prev,
        facilityMetrics: { error: error.message }
      }));
    }
  };

  // Test Facility Comparison
  const testFacilityComparison = async () => {
    if (parameters.selectedFacilities.length < 2) {
      showError('Select at least 2 facilities for comparison', { title: 'Test Error' });
      return;
    }

    try {
      showInfo('Testing facility comparison analysis...', { title: 'Comparison Test' });
      
      const response = await apiService.getFacilityComparison(parameters.selectedFacilities, {
        year: parameters.year,
        metrics: 'intensity'
      });

      if (response.success) {
        const data = response.data;
        
        // Calculate resource contribution analysis
        const mockResourceData = [
          { name: 'Coal', emissions: 15000, production: 1000 },
          { name: 'Electricity', emissions: 8000, production: 1000 },
          { name: 'Natural Gas', emissions: 5000, production: 1000 }
        ];
        
        const totalEmissions = mockResourceData.reduce((sum, r) => sum + r.emissions, 0);
        const resourceContribution = calculateResourceContribution(mockResourceData, totalEmissions);

        // Calculate intensity metrics
        const mockEmissionData = data.facilities.map(f => ({
          year: parameters.year,
          month: 6,
          emissions: f.totalEmissions || 0
        }));
        
        const mockProductionData = data.facilities.map(f => ({
          year: parameters.year,
          month: 6,
          production: f.totalProduction || 0
        }));

        const intensityMetrics = calculateIntensityMetrics(mockEmissionData, mockProductionData);

        setTestResults(prev => ({
          ...prev,
          facilityComparison: {
            ...data,
            advancedAnalysis: {
              resourceContribution,
              intensityMetrics
            },
            calculatedAt: new Date().toISOString()
          }
        }));

        showSuccess(`Compared ${parameters.selectedFacilities.length} facilities successfully!`, { title: 'Test Complete' });
      }

    } catch (error) {
      showError(`Facility comparison test failed: ${error.message}`, { title: 'Test Failed' });
      setTestResults(prev => ({
        ...prev,
        facilityComparison: { error: error.message }
      }));
    }
  };

  // Test Advanced Calculations
  const testAdvancedCalculations = async () => {
    try {
      showInfo('Testing advanced calculation functions...', { title: 'Calculations Test' });

      // Generate mock data for testing
      const mockFacilities = [
        { name: 'Plant A', carbonIntensity: 850, energyIntensity: 3200, capacityUtilization: 85 },
        { name: 'Plant B', carbonIntensity: 920, energyIntensity: 3600, capacityUtilization: 78 },
        { name: 'Plant C', carbonIntensity: 780, energyIntensity: 3000, capacityUtilization: 92 }
      ];

      const mockMonthlyData = Array.from({ length: 24 }, (_, i) => ({
        month: (i % 12) + 1,
        year: Math.floor(i / 12) + 2023,
        value: 800 + Math.sin(i * Math.PI / 6) * 100 + Math.random() * 50
      }));

      // Test facility efficiency calculation
      const facilityEfficiency = calculateFacilityEfficiency(mockFacilities);
      
      // Test variability metrics
      const variabilityMetrics = calculateVariabilityMetrics(mockMonthlyData);
      
      // Test seasonal patterns
      const seasonalPatterns = calculateSeasonalPatterns(mockMonthlyData);
      
      // Test monthly aggregation
      const monthlyAggregation = calculateMonthlyAggregation(mockMonthlyData, 'average');

      // Test performance indicators
      const performanceIndicators = calculatePerformanceIndicators(
        { value: 850, previousValue: 900 },
        { efficiency: 700, limit: 1200 },
        { baseline: 1000, target: 700 }
      );

      setTestResults(prev => ({
        ...prev,
        advancedCalculations: {
          facilityEfficiency,
          variabilityMetrics,
          seasonalPatterns,
          monthlyAggregation: monthlyAggregation.slice(0, 6), // Show first 6 months
          performanceIndicators,
          calculatedAt: new Date().toISOString()
        }
      }));

      showSuccess('Advanced calculations completed successfully!', { title: 'Test Complete' });

    } catch (error) {
      showError(`Advanced calculations test failed: ${error.message}`, { title: 'Test Failed' });
      setTestResults(prev => ({
        ...prev,
        advancedCalculations: { error: error.message }
      }));
    }
  };

  // Run comprehensive aggregation test
  const runComprehensiveTest = async () => {
    setIsRunning(true);
    setTestResults({});

    try {
      showInfo('Running comprehensive aggregation test suite...', { title: 'Comprehensive Test' });

      await testOrganizationMetrics();
      await testFacilityMetrics();
      await testFacilityComparison();
      await testAdvancedCalculations();

      showSuccess('Comprehensive aggregation test completed!', { title: 'Test Suite Complete' });

    } catch (error) {
      showError(`Test suite failed: ${error.message}`, { title: 'Test Suite Failed' });
    } finally {
      setIsRunning(false);
    }
  };

  const formatMetricValue = (value, decimals = 2) => {
    if (value === undefined || value === null || isNaN(value)) return 'N/A';
    if (value === 0) return '0';
    return parseFloat(value).toFixed(decimals);
  };

  const renderTestResults = (testData, title) => {
    if (!testData) return null;

    if (testData.error) {
      return (
        <ErrorAlert
          type="error"
          title={`${title} Error`}
          message={testData.error}
        />
      );
    }

    return (
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <pre className="text-sm text-gray-700 overflow-auto max-h-96">
            {JSON.stringify(testData, null, 2)}
          </pre>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          Calculated at: {testData.calculatedAt}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          📊 Data Aggregation & Calculation Services Test
        </h1>
        
        {/* Test Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Test Parameters */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Test Parameters</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                value={parameters.year}
                onChange={(e) => setParameters(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Analysis Period (months)</label>
              <select
                value={parameters.months}
                onChange={(e) => setParameters(prev => ({ ...prev, months: parseInt(e.target.value) }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value={6}>6 months</option>
                <option value={12}>12 months</option>
                <option value={24}>24 months</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={parameters.includeProjections}
                  onChange={(e) => setParameters(prev => ({ ...prev, includeProjections: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm">Include Projections</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={parameters.includeResourceBreakdown}
                  onChange={(e) => setParameters(prev => ({ ...prev, includeResourceBreakdown: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm">Include Resource Breakdown</span>
              </label>
            </div>
          </div>

          {/* Facility Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Facility Selection</h3>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {facilities.map(facility => (
                <label key={facility.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={parameters.selectedFacilities.includes(facility.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setParameters(prev => ({
                          ...prev,
                          selectedFacilities: [...prev.selectedFacilities, facility.id]
                        }));
                      } else {
                        setParameters(prev => ({
                          ...prev,
                          selectedFacilities: prev.selectedFacilities.filter(id => id !== facility.id)
                        }));
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">{facility.name}</span>
                </label>
              ))}
            </div>

            <div className="text-xs text-gray-500">
              Selected: {parameters.selectedFacilities.length} of {facilities.length} facilities
            </div>
          </div>

          {/* Test Actions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Test Actions</h3>
            
            <div className="space-y-2">
              <button
                onClick={testOrganizationMetrics}
                disabled={isRunning}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Test Organization Metrics
              </button>
              
              <button
                onClick={testFacilityMetrics}
                disabled={isRunning || facilities.length === 0}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Test Facility Metrics
              </button>
              
              <button
                onClick={testFacilityComparison}
                disabled={isRunning || parameters.selectedFacilities.length < 2}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                Test Facility Comparison
              </button>
              
              <button
                onClick={testAdvancedCalculations}
                disabled={isRunning}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50"
              >
                Test Advanced Calculations
              </button>
              
              <button
                onClick={runComprehensiveTest}
                disabled={isRunning}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isRunning ? <LoadingSpinner size="sm" /> : 'Run All Tests'}
              </button>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Test Results</h2>
          
          {Object.keys(testResults).length === 0 ? (
            <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
              No test results yet. Run some tests to see results here.
            </div>
          ) : (
            <div className="space-y-6">
              {testResults.organizationMetrics && 
                renderTestResults(testResults.organizationMetrics, '🏢 Organization Metrics')}
              
              {testResults.facilityMetrics && 
                renderTestResults(testResults.facilityMetrics, '🏭 Facility Metrics')}
              
              {testResults.facilityComparison && 
                renderTestResults(testResults.facilityComparison, '📊 Facility Comparison')}
              
              {testResults.advancedCalculations && 
                renderTestResults(testResults.advancedCalculations, '🧮 Advanced Calculations')}
            </div>
          )}
        </div>

        {/* Quick Metrics Summary */}
        {testResults.organizationMetrics && !testResults.organizationMetrics.error && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Quick Metrics Summary</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatMetricValue(testResults.organizationMetrics.metrics?.summary?.totalEmissions)}
                </div>
                <div className="text-sm text-gray-600">Total Emissions (kgCO2e)</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatMetricValue(testResults.organizationMetrics.metrics?.summary?.totalProduction)}
                </div>
                <div className="text-sm text-gray-600">Total Production (tonnes)</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatMetricValue(testResults.organizationMetrics.metrics?.summary?.carbonIntensity)}
                </div>
                <div className="text-sm text-gray-600">Carbon Intensity (kgCO2e/tonne)</div>
              </div>
              
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {testResults.organizationMetrics.metrics?.summary?.activeFacilities || 0}
                </div>
                <div className="text-sm text-gray-600">Active Facilities</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AggregationTest;
