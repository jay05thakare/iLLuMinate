/**
 * Time-Series Analytics Test Page
 * Comprehensive testing of monthly/yearly data analysis functions
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFacility } from '../contexts/FacilityContext';
import { useNotification } from '../contexts/NotificationContext';
import apiService from '../services/api';

// Advanced time-series calculation utilities
import {
  calculateMovingAverage,
  calculateExponentialMovingAverage,
  detectTrendChanges,
  calculateYearOverYearGrowth,
  calculateQuarterOverQuarterGrowth,
  performSeasonalDecomposition,
  calculateCorrelation,
  generateAdvancedForecast
} from '../utils/calculations';

// UI Components
import LoadingSpinner from '../components/ui/LoadingSpinner';

const TimeSeriesAnalyticsTest = () => {
  const { user } = useAuth();
  const { facilities } = useFacility();
  const { showSuccess, showError, showInfo } = useNotification();

  // Test states
  const [activeAnalysis, setActiveAnalysis] = useState('timeseries');
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);

  // Test parameters
  const [parameters, setParameters] = useState({
    startYear: new Date().getFullYear() - 2,
    endYear: new Date().getFullYear(),
    granularity: 'monthly',
    forecastPeriods: 6,
    selectedFacility: '',
    metric: 'emissions',
    analysisType: 'comprehensive'
  });

  // Initialize with first facility
  useEffect(() => {
    if (facilities.length > 0) {
      setParameters(prev => ({ ...prev, selectedFacility: facilities[0].id }));
    }
  }, [facilities]);

  // Generate mock time-series data for testing
  const generateMockTimeSeriesData = (periods = 24, baseValue = 1000, trend = 0.02, seasonality = true) => {
    const data = [];
    const startYear = new Date().getFullYear() - 2;
    
    for (let i = 0; i < periods; i++) {
      const month = (i % 12) + 1;
      const year = startYear + Math.floor(i / 12);
      
      // Base trend
      let value = baseValue * (1 + trend * i);
      
      // Add seasonality if enabled
      if (seasonality) {
        const seasonalFactor = 1 + 0.2 * Math.sin((month - 1) * Math.PI / 6);
        value *= seasonalFactor;
      }
      
      // Add random noise
      value *= (0.9 + Math.random() * 0.2);
      
      data.push({
        year,
        month,
        period: `${year}-${String(month).padStart(2, '0')}`,
        value: Math.round(value),
        originalValue: value
      });
    }
    
    return data;
  };

  // Test Organization Time-Series Analytics
  const testOrganizationTimeSeries = async () => {
    try {
      showInfo('Testing organization time-series analytics...', { title: 'Time-Series Test' });
      
      const response = await apiService.getOrganizationTimeSeries(user.organizationId, {
        startYear: parameters.startYear,
        endYear: parameters.endYear,
        granularity: parameters.granularity,
        metrics: 'all',
        includeForecast: true,
        forecastPeriods: parameters.forecastPeriods
      });

      if (response.success) {
        const analytics = response.data;
        
        // Apply additional frontend time-series analysis
        const emissionTimeSeries = analytics.timeSeries?.emissions || [];
        
        if (emissionTimeSeries.length > 0) {
          // Calculate moving averages
          const movingAverage = calculateMovingAverage(emissionTimeSeries, 3, 'value');
          const exponentialMA = calculateExponentialMovingAverage(emissionTimeSeries, 0.3, 'value');
          
          // Detect trend changes
          const trendChanges = detectTrendChanges(emissionTimeSeries, 0.15, 'value');
          
          // Calculate year-over-year growth
          const yoyGrowth = calculateYearOverYearGrowth(emissionTimeSeries, 'value');
          
          // Perform seasonal decomposition
          const seasonalDecomposition = performSeasonalDecomposition(emissionTimeSeries, 'value');
          
          analytics.advancedAnalysis = {
            movingAverage: movingAverage.slice(-6), // Last 6 months
            exponentialMA: exponentialMA.slice(-6),
            trendChanges,
            yoyGrowth: yoyGrowth.slice(-12), // Last year
            seasonalDecomposition: {
              hasSeasonality: seasonalDecomposition.hasSeasonality,
              trendSample: seasonalDecomposition.trend.slice(-6),
              seasonalSample: seasonalDecomposition.seasonal.slice(-6)
            }
          };
        }

        setTestResults(prev => ({
          ...prev,
          organizationTimeSeries: {
            ...analytics,
            calculatedAt: new Date().toISOString()
          }
        }));

        showSuccess('Organization time-series analytics completed!', { title: 'Test Complete' });
      }

    } catch (error) {
      showError(`Organization time-series test failed: ${error.message}`, { title: 'Test Failed' });
      setTestResults(prev => ({
        ...prev,
        organizationTimeSeries: { error: error.message }
      }));
    }
  };

  // Test Facility Time-Series Analytics
  const testFacilityTimeSeries = async () => {
    if (!parameters.selectedFacility) {
      showError('Please select a facility', { title: 'Test Error' });
      return;
    }

    try {
      showInfo('Testing facility time-series analytics...', { title: 'Facility Test' });
      
      const response = await apiService.getFacilityTimeSeries(parameters.selectedFacility, {
        startYear: parameters.startYear,
        endYear: parameters.endYear,
        analysisType: parameters.analysisType,
        includeBenchmarking: true,
        compareToOrganization: true
      });

      if (response.success) {
        const analytics = response.data;
        
        // Apply additional frontend analysis
        const productionTimeSeries = analytics.timeSeries?.production || [];
        
        if (productionTimeSeries.length > 0) {
          // Calculate quarter-over-quarter growth
          const qoqGrowth = calculateQuarterOverQuarterGrowth(productionTimeSeries, 'production');
          
          // Generate advanced forecast
          const advancedForecast = generateAdvancedForecast(productionTimeSeries, 6, 'ensemble', 'production');
          
          analytics.advancedAnalysis = {
            qoqGrowth,
            advancedForecast,
            utilizationTrend: analytics.performance?.utilizationTrend || {},
            consistencyScore: analytics.performance?.consistencyScore || 0
          };
        }

        setTestResults(prev => ({
          ...prev,
          facilityTimeSeries: {
            ...analytics,
            calculatedAt: new Date().toISOString()
          }
        }));

        showSuccess(`Facility time-series analytics completed for ${analytics.facility?.name}!`, { title: 'Test Complete' });
      }

    } catch (error) {
      showError(`Facility time-series test failed: ${error.message}`, { title: 'Test Failed' });
      setTestResults(prev => ({
        ...prev,
        facilityTimeSeries: { error: error.message }
      }));
    }
  };

  // Test Advanced Trend Analysis
  const testAdvancedTrendAnalysis = async () => {
    try {
      showInfo('Testing advanced trend analysis...', { title: 'Trend Analysis Test' });
      
      const response = await apiService.getAdvancedTrendAnalysis(user.organizationId, {
        metric: parameters.metric,
        period: 'monthly',
        forecastMethod: 'linear_regression',
        forecastHorizon: parameters.forecastPeriods,
        confidenceLevel: 95,
        includeSeasonality: true
      });

      if (response.success) {
        const trendAnalysis = response.data;
        
        setTestResults(prev => ({
          ...prev,
          advancedTrendAnalysis: {
            ...trendAnalysis,
            calculatedAt: new Date().toISOString()
          }
        }));

        showSuccess(`Advanced trend analysis completed for ${parameters.metric}!`, { title: 'Test Complete' });
      }

    } catch (error) {
      showError(`Advanced trend analysis test failed: ${error.message}`, { title: 'Test Failed' });
      setTestResults(prev => ({
        ...prev,
        advancedTrendAnalysis: { error: error.message }
      }));
    }
  };

  // Test Frontend Time-Series Functions
  const testFrontendTimeSeriesFunctions = async () => {
    try {
      showInfo('Testing frontend time-series calculation functions...', { title: 'Frontend Functions Test' });

      // Generate mock data for comprehensive testing
      const mockData1 = generateMockTimeSeriesData(24, 1000, 0.05, true);  // Growing with seasonality
      const mockData2 = generateMockTimeSeriesData(24, 800, -0.02, false); // Declining without seasonality

      // Test all time-series functions
      const results = {
        movingAverage: calculateMovingAverage(mockData1, 3, 'value'),
        exponentialMA: calculateExponentialMovingAverage(mockData1, 0.3, 'value'),
        trendChanges: detectTrendChanges(mockData1, 0.1, 'value'),
        yoyGrowth: calculateYearOverYearGrowth(mockData1, 'value'),
        qoqGrowth: calculateQuarterOverQuarterGrowth(mockData1, 'value'),
        seasonalDecomposition: performSeasonalDecomposition(mockData1, 'value'),
        correlation: calculateCorrelation(mockData1, mockData2, 'value', 'value'),
        advancedForecast: generateAdvancedForecast(mockData1, 6, 'ensemble', 'value')
      };

      // Add sample data for visualization
      results.sampleData = {
        mockData1: mockData1.slice(-12), // Last 12 months
        mockData2: mockData2.slice(-12)
      };

      setTestResults(prev => ({
        ...prev,
        frontendTimeSeriesFunctions: {
          ...results,
          calculatedAt: new Date().toISOString()
        }
      }));

      showSuccess('Frontend time-series functions tested successfully!', { title: 'Test Complete' });

    } catch (error) {
      showError(`Frontend functions test failed: ${error.message}`, { title: 'Test Failed' });
      setTestResults(prev => ({
        ...prev,
        frontendTimeSeriesFunctions: { error: error.message }
      }));
    }
  };

  // Test Comparative Analysis
  const testComparativeAnalysis = async () => {
    try {
      showInfo('Testing comparative time-series analysis...', { title: 'Comparative Test' });
      
      const response = await apiService.getComparativeAnalysis(user.organizationId, {
        compareWith: 'industry',
        timeRange: '24months',
        metrics: 'emissions,production,intensity'
      });

      if (response.success) {
        const analysis = response.data;
        
        setTestResults(prev => ({
          ...prev,
          comparativeAnalysis: {
            ...analysis,
            calculatedAt: new Date().toISOString()
          }
        }));

        showSuccess('Comparative analysis completed!', { title: 'Test Complete' });
      }

    } catch (error) {
      showError(`Comparative analysis test failed: ${error.message}`, { title: 'Test Failed' });
      setTestResults(prev => ({
        ...prev,
        comparativeAnalysis: { error: error.message }
      }));
    }
  };

  // Run comprehensive time-series test
  const runComprehensiveTimeSeriesTest = async () => {
    setIsRunning(true);
    setTestResults({});

    try {
      showInfo('Running comprehensive time-series analytics test suite...', { title: 'Comprehensive Test' });

      await testFrontendTimeSeriesFunctions();
      await testOrganizationTimeSeries();
      await testFacilityTimeSeries();
      await testAdvancedTrendAnalysis();
      await testComparativeAnalysis();

      showSuccess('Comprehensive time-series analytics test completed!', { title: 'Test Suite Complete' });

    } catch (error) {
      showError(`Test suite failed: ${error.message}`, { title: 'Test Suite Failed' });
    } finally {
      setIsRunning(false);
    }
  };

  const formatValue = (value, decimals = 2) => {
    if (value === undefined || value === null || isNaN(value)) return 'N/A';
    if (value === 0) return '0';
    return parseFloat(value).toFixed(decimals);
  };

  const renderTestResults = (testData, title) => {
    if (!testData) return null;

    if (testData.error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-red-800 mb-2">{title} Error</h4>
          <p className="text-red-700 text-sm">{testData.error}</p>
        </div>
      );
    }

    return (
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <pre className="text-sm text-gray-700 overflow-auto max-h-96">
            {JSON.stringify(testData, null, 2)}
          </pre>
        </div>
        
        <div className="text-xs text-gray-500">
          Calculated at: {testData.calculatedAt}
        </div>
      </div>
    );
  };

  const renderMetricsSummary = () => {
    if (!testResults.frontendTimeSeriesFunctions) return null;

    const data = testResults.frontendTimeSeriesFunctions;
    
    return (
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Time-Series Analysis Summary</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {data.yoyGrowth?.length || 0}
            </div>
            <div className="text-sm text-gray-600">YoY Data Points</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {data.trendChanges?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Trend Changes</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {data.seasonalDecomposition?.hasSeasonality ? 'Yes' : 'No'}
            </div>
            <div className="text-sm text-gray-600">Seasonality Detected</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {formatValue(data.correlation?.correlation)}
            </div>
            <div className="text-sm text-gray-600">Correlation Coefficient</div>
          </div>
        </div>
        
        {data.advancedForecast && (
          <div className="mt-4 bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">🔮 Forecast Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Method:</span> {data.advancedForecast.method}
              </div>
              <div>
                <span className="font-medium">Confidence:</span> {data.advancedForecast.confidence}
              </div>
              <div>
                <span className="font-medium">Periods:</span> {data.advancedForecast.forecast?.length || 0}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          📈 Time-Series Analytics & Monthly/Yearly Data Analysis Test
        </h1>
        
        {/* Test Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Test Parameters */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Analysis Parameters</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Year</label>
                <select
                  value={parameters.startYear}
                  onChange={(e) => setParameters(prev => ({ ...prev, startYear: parseInt(e.target.value) }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 4 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Year</label>
                <select
                  value={parameters.endYear}
                  onChange={(e) => setParameters(prev => ({ ...prev, endYear: parseInt(e.target.value) }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - 1 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Granularity</label>
              <select
                value={parameters.granularity}
                onChange={(e) => setParameters(prev => ({ ...prev, granularity: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Forecast Periods</label>
              <select
                value={parameters.forecastPeriods}
                onChange={(e) => setParameters(prev => ({ ...prev, forecastPeriods: parseInt(e.target.value) }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value={3}>3 periods</option>
                <option value={6}>6 periods</option>
                <option value={12}>12 periods</option>
                <option value={24}>24 periods</option>
              </select>
            </div>
          </div>

          {/* Analysis Configuration */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Analysis Configuration</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facility</label>
              <select
                value={parameters.selectedFacility}
                onChange={(e) => setParameters(prev => ({ ...prev, selectedFacility: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Facility</option>
                {facilities.map(facility => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Analysis Metric</label>
              <select
                value={parameters.metric}
                onChange={(e) => setParameters(prev => ({ ...prev, metric: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="emissions">Emissions</option>
                <option value="production">Production</option>
                <option value="intensity">Carbon Intensity</option>
                <option value="energy">Energy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Analysis Type</label>
              <select
                value={parameters.analysisType}
                onChange={(e) => setParameters(prev => ({ ...prev, analysisType: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="comprehensive">Comprehensive</option>
                <option value="performance">Performance Focus</option>
                <option value="trends">Trends Focus</option>
                <option value="efficiency">Efficiency Focus</option>
              </select>
            </div>
          </div>

          {/* Test Actions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Test Actions</h3>
            
            <div className="space-y-2">
              <button
                onClick={testFrontendTimeSeriesFunctions}
                disabled={isRunning}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Test Frontend Functions
              </button>
              
              <button
                onClick={testOrganizationTimeSeries}
                disabled={isRunning}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Test Organization Time-Series
              </button>
              
              <button
                onClick={testFacilityTimeSeries}
                disabled={isRunning || !parameters.selectedFacility}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                Test Facility Time-Series
              </button>
              
              <button
                onClick={testAdvancedTrendAnalysis}
                disabled={isRunning}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50"
              >
                Test Advanced Trends
              </button>
              
              <button
                onClick={testComparativeAnalysis}
                disabled={isRunning}
                className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 disabled:opacity-50"
              >
                Test Comparative Analysis
              </button>
              
              <button
                onClick={runComprehensiveTimeSeriesTest}
                disabled={isRunning}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isRunning ? <LoadingSpinner size="sm" /> : 'Run All Time-Series Tests'}
              </button>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Test Results</h2>
          
          {Object.keys(testResults).length === 0 ? (
            <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
              No test results yet. Run some tests to see comprehensive time-series analytics here.
            </div>
          ) : (
            <div className="space-y-6">
              {renderMetricsSummary()}
              
              {testResults.frontendTimeSeriesFunctions && 
                renderTestResults(testResults.frontendTimeSeriesFunctions, '🧮 Frontend Time-Series Functions')}
              
              {testResults.organizationTimeSeries && 
                renderTestResults(testResults.organizationTimeSeries, '🏢 Organization Time-Series Analytics')}
              
              {testResults.facilityTimeSeries && 
                renderTestResults(testResults.facilityTimeSeries, '🏭 Facility Time-Series Analytics')}
              
              {testResults.advancedTrendAnalysis && 
                renderTestResults(testResults.advancedTrendAnalysis, '📊 Advanced Trend Analysis')}
              
              {testResults.comparativeAnalysis && 
                renderTestResults(testResults.comparativeAnalysis, '⚖️ Comparative Analysis')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeSeriesAnalyticsTest;
