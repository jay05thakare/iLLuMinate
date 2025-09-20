/**
 * Business Validation Test Page
 * Comprehensive testing of data validation and business logic
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFacility } from '../contexts/FacilityContext';
import { useNotification } from '../contexts/NotificationContext';
import apiService from '../services/api';

// Validation utilities
import { realTimeValidation, validateForm, validationSchemas } from '../utils/validators';

// UI Components
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorAlert from '../components/ui/ErrorAlert';

const BusinessValidationTest = () => {
  const { user } = useAuth();
  const { facilities } = useFacility();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  // Test states
  const [activeTest, setActiveTest] = useState('production');
  const [testResults, setTestResults] = useState({});
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Test form data
  const [productionTest, setProductionTest] = useState({
    facilityId: '',
    production: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const [emissionTest, setEmissionTest] = useState({
    facilityId: '',
    consumption: '',
    emissionFactor: '',
    resourceType: 'diesel',
    scope: 'scope1'
  });

  const [targetTest, setTargetTest] = useState({
    baseline: '',
    target: '',
    baselineYear: new Date().getFullYear() - 2,
    targetYear: new Date().getFullYear() + 8
  });

  const [intensityTest, setIntensityTest] = useState({
    carbonIntensity: '',
    industryType: 'cement'
  });

  // Initialize with first facility
  useEffect(() => {
    if (facilities.length > 0) {
      const firstFacility = facilities[0];
      setProductionTest(prev => ({ ...prev, facilityId: firstFacility.id }));
      setEmissionTest(prev => ({ ...prev, facilityId: firstFacility.id }));
    }
  }, [facilities]);

  // Real-time validation functions
  const validateProductionCapacity = () => {
    const facility = facilities.find(f => f.id === productionTest.facilityId);
    if (!facility || !productionTest.production) return null;

    const capacity = facility.location?.capacity_mtpa || facility.capacity_mtpa || 1.0;
    const production = parseFloat(productionTest.production);

    const validation = realTimeValidation.validateProductionCapacity(production, capacity);
    setTestResults(prev => ({
      ...prev,
      productionCapacity: {
        ...validation,
        facility: facility.name,
        capacity: capacity,
        production: production
      }
    }));

    return validation;
  };

  const validateEmissionFactor = () => {
    if (!emissionTest.emissionFactor || !emissionTest.resourceType) return null;

    const factor = parseFloat(emissionTest.emissionFactor);
    const validation = realTimeValidation.validateEmissionFactor(
      factor, 
      emissionTest.resourceType, 
      emissionTest.scope
    );

    setTestResults(prev => ({
      ...prev,
      emissionFactor: {
        ...validation,
        factor: factor,
        resourceType: emissionTest.resourceType,
        scope: emissionTest.scope
      }
    }));

    return validation;
  };

  const validateCarbonIntensity = () => {
    if (!intensityTest.carbonIntensity) return null;

    const intensity = parseFloat(intensityTest.carbonIntensity);
    const validation = realTimeValidation.validateCarbonIntensity(
      intensity, 
      intensityTest.industryType
    );

    setTestResults(prev => ({
      ...prev,
      carbonIntensity: {
        ...validation,
        intensity: intensity,
        industryType: intensityTest.industryType
      }
    }));

    return validation;
  };

  const validateTargetFeasibility = () => {
    if (!targetTest.baseline || !targetTest.target) return null;

    const baseline = parseFloat(targetTest.baseline);
    const target = parseFloat(targetTest.target);
    const timespan = targetTest.targetYear - targetTest.baselineYear;

    // Mock historical data for testing
    const historicalData = [
      { value: baseline * 1.1, year: targetTest.baselineYear - 2 },
      { value: baseline * 1.05, year: targetTest.baselineYear - 1 },
      { value: baseline, year: targetTest.baselineYear }
    ];

    const validation = realTimeValidation.validateTargetFeasibility(
      baseline, 
      target, 
      timespan, 
      historicalData
    );

    setTestResults(prev => ({
      ...prev,
      targetFeasibility: {
        ...validation,
        baseline: baseline,
        target: target,
        timespan: timespan
      }
    }));

    return validation;
  };

  // API validation tests
  const testProductionAPIValidation = async () => {
    try {
      showInfo('Testing production data validation...', { title: 'API Test' });
      
      // Test with extreme values to trigger validation
      const extremeData = {
        facilityId: productionTest.facilityId,
        month: productionTest.month,
        year: productionTest.year,
        cementProduction: 50000000, // Extremely high production
        unit: 'tonnes'
      };

      const response = await apiService.createProductionData(extremeData);
      
      if (response.success) {
        showSuccess('Production data accepted (no validation warnings)', { title: 'API Test' });
      } else if (response.warnings && response.warnings.length > 0) {
        showWarning(`Validation warnings: ${response.warnings.join(', ')}`, { title: 'API Validation' });
      } else if (response.errors && response.errors.length > 0) {
        showError(`Validation errors: ${response.errors.join(', ')}`, { title: 'API Validation' });
      }

      setTestResults(prev => ({
        ...prev,
        apiValidation: {
          production: {
            success: response.success,
            errors: response.errors || [],
            warnings: response.warnings || [],
            testData: extremeData
          }
        }
      }));

    } catch (error) {
      if (error.response && error.response.data) {
        const { errors = [], warnings = [] } = error.response.data;
        showError(`API Validation: ${errors.concat(warnings).join(', ')}`, { title: 'Business Logic' });
        
        setTestResults(prev => ({
          ...prev,
          apiValidation: {
            production: {
              success: false,
              errors: errors,
              warnings: warnings,
              status: error.response.status
            }
          }
        }));
      } else {
        showError(`API test failed: ${error.message}`, { title: 'Test Error' });
      }
    }
  };

  const testEmissionAPIValidation = async () => {
    try {
      showInfo('Testing emission data validation...', { title: 'API Test' });
      
      // Test with extreme values
      const extremeData = {
        facilityId: emissionTest.facilityId,
        month: 1,
        year: 2024,
        scope: emissionTest.scope,
        consumption: -500, // Negative consumption to trigger validation
        consumptionUnit: 'litres'
      };

      const response = await apiService.createEmissionData(extremeData);
      
      if (response.success) {
        showSuccess('Emission data accepted', { title: 'API Test' });
      }

      setTestResults(prev => ({
        ...prev,
        apiValidation: {
          ...prev.apiValidation,
          emission: {
            success: response.success,
            errors: response.errors || [],
            warnings: response.warnings || [],
            testData: extremeData
          }
        }
      }));

    } catch (error) {
      if (error.response && error.response.data) {
        const { errors = [], warnings = [] } = error.response.data;
        showError(`API Validation: ${errors.concat(warnings).join(', ')}`, { title: 'Business Logic' });
        
        setTestResults(prev => ({
          ...prev,
          apiValidation: {
            ...prev.apiValidation,
            emission: {
              success: false,
              errors: errors,
              warnings: warnings,
              status: error.response.status
            }
          }
        }));
      } else {
        showError(`API test failed: ${error.message}`, { title: 'Test Error' });
      }
    }
  };

  // Run all validation tests
  const runComprehensiveValidationTest = async () => {
    setIsRunningTests(true);
    setTestResults({});

    try {
      showInfo('Running comprehensive validation tests...', { title: 'Validation Test' });

      // Run real-time validations
      validateProductionCapacity();
      validateEmissionFactor();
      validateCarbonIntensity();
      validateTargetFeasibility();

      // Run API validations
      await testProductionAPIValidation();
      await testEmissionAPIValidation();

      showSuccess('Comprehensive validation tests completed!', { title: 'Test Complete' });

    } catch (error) {
      showError(`Test suite failed: ${error.message}`, { title: 'Test Failed' });
    } finally {
      setIsRunningTests(false);
    }
  };

  const formatValidationResult = (result, title) => {
    if (!result) return null;

    const { errors = [], warnings = [], insights = [], ...data } = result;
    
    return (
      <div className="bg-white border rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-gray-900 mb-3">{title}</h4>
        
        {/* Errors */}
        {errors.length > 0 && (
          <div className="mb-3">
            <div className="text-sm font-medium text-red-600 mb-1">❌ Errors:</div>
            {errors.map((error, index) => (
              <div key={index} className="text-sm text-red-700 pl-4">• {error}</div>
            ))}
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="mb-3">
            <div className="text-sm font-medium text-yellow-600 mb-1">⚠️  Warnings:</div>
            {warnings.map((warning, index) => (
              <div key={index} className="text-sm text-yellow-700 pl-4">• {warning}</div>
            ))}
          </div>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <div className="mb-3">
            <div className="text-sm font-medium text-blue-600 mb-1">💡 Insights:</div>
            {insights.map((insight, index) => (
              <div key={index} className="text-sm text-blue-700 pl-4">• {insight}</div>
            ))}
          </div>
        )}

        {/* Additional data */}
        {Object.keys(data).length > 0 && (
          <div className="bg-gray-50 rounded p-2 mt-3">
            <div className="text-xs font-medium text-gray-600 mb-1">Validation Data:</div>
            <pre className="text-xs text-gray-700">{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🔍 Business Validation & Logic Test
        </h1>
        
        {/* Test Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Test Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Active Test
            </label>
            <select
              value={activeTest}
              onChange={(e) => setActiveTest(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="production">Production Capacity Validation</option>
              <option value="emission">Emission Factor Validation</option>
              <option value="intensity">Carbon Intensity Benchmarking</option>
              <option value="target">Target Feasibility Analysis</option>
              <option value="api">API Business Logic Validation</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end space-x-3">
            <button
              onClick={runComprehensiveValidationTest}
              disabled={isRunningTests}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isRunningTests ? <LoadingSpinner size="sm" /> : 'Run All Tests'}
            </button>
            <button
              onClick={() => setTestResults({})}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Clear Results
            </button>
          </div>
        </div>

        {/* Test Input Forms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Forms */}
          <div className="space-y-6">
            {/* Production Capacity Test */}
            {activeTest === 'production' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Production Capacity Test</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facility</label>
                    <select
                      value={productionTest.facilityId}
                      onChange={(e) => setProductionTest(prev => ({ ...prev, facilityId: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Facility</option>
                      {facilities.map(facility => (
                        <option key={facility.id} value={facility.id}>
                          {facility.name} ({facility.location?.capacity_mtpa || 'N/A'} MTPA)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Production (tonnes)</label>
                    <input
                      type="number"
                      value={productionTest.production}
                      onChange={(e) => setProductionTest(prev => ({ ...prev, production: e.target.value }))}
                      onBlur={validateProductionCapacity}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Enter monthly production..."
                    />
                  </div>
                  <button
                    onClick={validateProductionCapacity}
                    className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                  >
                    Validate Production Capacity
                  </button>
                </div>
              </div>
            )}

            {/* Emission Factor Test */}
            {activeTest === 'emission' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Emission Factor Test</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
                    <select
                      value={emissionTest.resourceType}
                      onChange={(e) => setEmissionTest(prev => ({ ...prev, resourceType: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="diesel">Diesel</option>
                      <option value="coal">Coal</option>
                      <option value="natural_gas">Natural Gas</option>
                      <option value="electricity">Electricity</option>
                      <option value="petrol">Petrol</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scope</label>
                    <select
                      value={emissionTest.scope}
                      onChange={(e) => setEmissionTest(prev => ({ ...prev, scope: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="scope1">Scope 1</option>
                      <option value="scope2">Scope 2</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emission Factor (kgCO2e/unit)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={emissionTest.emissionFactor}
                      onChange={(e) => setEmissionTest(prev => ({ ...prev, emissionFactor: e.target.value }))}
                      onBlur={validateEmissionFactor}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Enter emission factor..."
                    />
                  </div>
                  <button
                    onClick={validateEmissionFactor}
                    className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                  >
                    Validate Emission Factor
                  </button>
                </div>
              </div>
            )}

            {/* Carbon Intensity Test */}
            {activeTest === 'intensity' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Carbon Intensity Benchmarking</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry Type</label>
                    <select
                      value={intensityTest.industryType}
                      onChange={(e) => setIntensityTest(prev => ({ ...prev, industryType: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="cement">Cement</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Carbon Intensity (kgCO2e/tonne)</label>
                    <input
                      type="number"
                      value={intensityTest.carbonIntensity}
                      onChange={(e) => setIntensityTest(prev => ({ ...prev, carbonIntensity: e.target.value }))}
                      onBlur={validateCarbonIntensity}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Enter carbon intensity..."
                    />
                  </div>
                  <button
                    onClick={validateCarbonIntensity}
                    className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                  >
                    Validate Carbon Intensity
                  </button>
                </div>
              </div>
            )}

            {/* Target Feasibility Test */}
            {activeTest === 'target' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Target Feasibility Analysis</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Baseline Value</label>
                      <input
                        type="number"
                        value={targetTest.baseline}
                        onChange={(e) => setTargetTest(prev => ({ ...prev, baseline: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Baseline..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Value</label>
                      <input
                        type="number"
                        value={targetTest.target}
                        onChange={(e) => setTargetTest(prev => ({ ...prev, target: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Target..."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Baseline Year</label>
                      <input
                        type="number"
                        value={targetTest.baselineYear}
                        onChange={(e) => setTargetTest(prev => ({ ...prev, baselineYear: parseInt(e.target.value) }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Year</label>
                      <input
                        type="number"
                        value={targetTest.targetYear}
                        onChange={(e) => setTargetTest(prev => ({ ...prev, targetYear: parseInt(e.target.value) }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <button
                    onClick={validateTargetFeasibility}
                    className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                  >
                    Analyze Target Feasibility
                  </button>
                </div>
              </div>
            )}

            {/* API Validation Test */}
            {activeTest === 'api' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">API Business Logic Validation</h3>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 mb-3">
                    These tests will send data with intentional validation issues to the backend to test business logic validation.
                  </div>
                  <button
                    onClick={testProductionAPIValidation}
                    disabled={isRunningTests}
                    className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 disabled:opacity-50 mb-2"
                  >
                    Test Production API Validation
                  </button>
                  <button
                    onClick={testEmissionAPIValidation}
                    disabled={isRunningTests}
                    className="w-full bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 disabled:opacity-50"
                  >
                    Test Emission API Validation
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Results Display */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-lg">Validation Results</h3>
            
            {Object.keys(testResults).length === 0 ? (
              <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
                No validation results yet. Run some tests to see results here.
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {testResults.productionCapacity && formatValidationResult(testResults.productionCapacity, 'Production Capacity Validation')}
                {testResults.emissionFactor && formatValidationResult(testResults.emissionFactor, 'Emission Factor Validation')}
                {testResults.carbonIntensity && formatValidationResult(testResults.carbonIntensity, 'Carbon Intensity Benchmarking')}
                {testResults.targetFeasibility && formatValidationResult(testResults.targetFeasibility, 'Target Feasibility Analysis')}
                {testResults.apiValidation && (
                  <div className="bg-white border rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-3">API Validation Results</h4>
                    {testResults.apiValidation.production && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">Production API:</div>
                        <div className="text-xs text-gray-600">
                          Status: {testResults.apiValidation.production.success ? '✅ Success' : '❌ Failed'}
                          {testResults.apiValidation.production.errors?.length > 0 && (
                            <div className="text-red-600 mt-1">
                              Errors: {testResults.apiValidation.production.errors.join(', ')}
                            </div>
                          )}
                          {testResults.apiValidation.production.warnings?.length > 0 && (
                            <div className="text-yellow-600 mt-1">
                              Warnings: {testResults.apiValidation.production.warnings.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {testResults.apiValidation.emission && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">Emission API:</div>
                        <div className="text-xs text-gray-600">
                          Status: {testResults.apiValidation.emission.success ? '✅ Success' : '❌ Failed'}
                          {testResults.apiValidation.emission.errors?.length > 0 && (
                            <div className="text-red-600 mt-1">
                              Errors: {testResults.apiValidation.emission.errors.join(', ')}
                            </div>
                          )}
                          {testResults.apiValidation.emission.warnings?.length > 0 && (
                            <div className="text-yellow-600 mt-1">
                              Warnings: {testResults.apiValidation.emission.warnings.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessValidationTest;
