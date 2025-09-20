/**
 * Data Transformation Test Page
 * Test all data transformation functions and utilities
 */

import React, { useState } from 'react';
import { formatNumber, formatDate, transformOrganizationData, transformFacilityData, transformEmissionData, transformProductionData, transformUserData, transformTargetsData } from '../utils/dataTransformers';
import { calculateCarbonIntensity, calculateCapacityUtilization, calculateTargetProgress, calculateTrend, aggregateByPeriod, calculateStatistics } from '../utils/calculations';
import { validateForm, validationSchemas, validateDataQuality, validateBusinessRules } from '../utils/validators';

const TransformTest = () => {
  const [testResults, setTestResults] = useState({});

  // Mock data for testing
  const mockOrganizationData = {
    id: '1',
    name: 'JK Cement Limited',
    description: 'Leading cement manufacturer',
    status: 'active',
    subscriptionPlan: 'enterprise',
    createdAt: '2020-01-15T10:30:00Z',
    updatedAt: '2024-12-15T14:20:00Z',
  };

  const mockOrgStats = {
    users: { total: 25, admins: 3, regular: 22 },
    facilities: { total: 2, active: 2 },
    targets: { total: 5, active: 3 },
    dataRecords: { emissions: 48, production: 48, recentEmissions: 12, recentProduction: 12 },
    currentYearTotals: {
      production: { totalProduction: 2500000 },
      emissions: { scope1: 1800000, scope2: 200000 },
    },
  };

  const mockFacilityData = {
    id: '1',
    name: 'Mangrol Plant',
    description: 'Main production facility',
    status: 'active',
    location: {
      city: 'Mangrol',
      state: 'Gujarat',
      country: 'India',
      address: 'Industrial Area, Mangrol',
      latitude: 21.1202,
      longitude: 70.1247,
      technology: 'Dry Process',
      capacity_mtpa: 2.5,
      capacity_tpd: 6849,
      commissioned_year: 2015,
    },
    statistics: {
      emissionRecordsCount: 24,
      productionRecordsCount: 24,
      targetsCount: 2,
      configuredResourcesCount: 8,
      currentYearEmissions: 1800000,
      currentYearProduction: 2500000,
    },
    createdAt: '2020-06-01T00:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z',
  };

  const mockEmissionData = [
    { year: 2024, month: 1, scope: 'scope1', totalEmissions: 150000, resource: { category: 'stationary_combustion' } },
    { year: 2024, month: 2, scope: 'scope1', totalEmissions: 155000, resource: { category: 'stationary_combustion' } },
    { year: 2024, month: 3, scope: 'scope1', totalEmissions: 148000, resource: { category: 'stationary_combustion' } },
    { year: 2024, month: 1, scope: 'scope2', totalEmissions: 15000, resource: { category: 'purchased_electricity' } },
    { year: 2024, month: 2, scope: 'scope2', totalEmissions: 16000, resource: { category: 'purchased_electricity' } },
    { year: 2024, month: 3, scope: 'scope2', totalEmissions: 14500, resource: { category: 'purchased_electricity' } },
  ];

  const mockProductionData = [
    { year: 2024, month: 1, cement_production: 200000 },
    { year: 2024, month: 2, cement_production: 210000 },
    { year: 2024, month: 3, cement_production: 205000 },
    { year: 2023, month: 12, cement_production: 195000 },
  ];

  const mockUserData = [
    { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@jkcement.com', role: 'admin', status: 'active', lastLogin: '2024-12-15T09:00:00Z', createdAt: '2020-01-01T00:00:00Z' },
    { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@jkcement.com', role: 'user', status: 'active', lastLogin: '2024-12-14T16:30:00Z', createdAt: '2020-02-01T00:00:00Z' },
    { id: '3', firstName: 'Bob', lastName: 'Johnson', email: 'bob@jkcement.com', role: 'user', status: 'inactive', lastLogin: null, createdAt: '2020-03-01T00:00:00Z' },
  ];

  const mockTargetsData = [
    {
      id: '1',
      name: 'Reduce Carbon Intensity by 25%',
      description: 'Achieve 25% reduction in carbon intensity by 2030',
      target_type: 'emissions_reduction',
      baseline_value: 800,
      target_value: 600,
      baseline_year: 2020,
      target_year: 2030,
      unit: 'kgCO2e/tonne',
      status: 'active',
      created_at: '2020-01-01T00:00:00Z',
    },
  ];

  // Test formatting functions
  const testFormatting = () => {
    console.log('🧮 Testing Formatting Functions...');
    
    const formatTests = {
      formatNumber: {
        basic: formatNumber(12345.67),
        compact: formatNumber(12345678, { compact: true }),
        currency: formatNumber(1234.56, { currency: true }),
        percentage: formatNumber(0.2567, { percentage: true }),
        withUnit: formatNumber(850.5, { unit: 'kgCO2e', precision: 1 }),
      },
      formatDate: {
        default: formatDate('2024-12-15T10:30:00Z'),
        short: formatDate('2024-12-15T10:30:00Z', 'short'),
        long: formatDate('2024-12-15T10:30:00Z', 'long'),
        monthYear: formatDate('2024-12-15T10:30:00Z', 'monthYear'),
      },
    };
    
    console.log('Format Tests:', formatTests);
    setTestResults(prev => ({ ...prev, formatting: formatTests }));
  };

  // Test transformation functions
  const testTransformations = () => {
    console.log('🔄 Testing Data Transformations...');
    
    const transformTests = {
      organization: transformOrganizationData(mockOrganizationData, mockOrgStats),
      facility: transformFacilityData(mockFacilityData),
      emissions: transformEmissionData(mockEmissionData),
      production: transformProductionData(mockProductionData),
      users: transformUserData(mockUserData),
      targets: transformTargetsData(mockTargetsData),
    };
    
    console.log('Transform Tests:', transformTests);
    setTestResults(prev => ({ ...prev, transformations: transformTests }));
  };

  // Test calculation functions
  const testCalculations = () => {
    console.log('🧮 Testing Calculation Functions...');
    
    const calculationTests = {
      carbonIntensity: calculateCarbonIntensity(1800000, 2500000),
      capacityUtilization: calculateCapacityUtilization(2500000, 2.5),
      targetProgress: calculateTargetProgress(800, 720, 600),
      trend: calculateTrend(mockProductionData, 'cement_production'),
      aggregation: aggregateByPeriod(mockEmissionData, 'monthly', 'totalEmissions'),
      statistics: calculateStatistics([150000, 155000, 148000, 15000, 16000, 14500]),
    };
    
    console.log('Calculation Tests:', calculationTests);
    setTestResults(prev => ({ ...prev, calculations: calculationTests }));
  };

  // Test validation functions
  const testValidations = () => {
    console.log('✅ Testing Validation Functions...');
    
    const validationTests = {
      formValidation: {
        validUser: validateForm(
          { firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'admin' },
          validationSchemas.user
        ),
        invalidUser: validateForm(
          { firstName: 'J', lastName: '', email: 'invalid-email', role: '' },
          validationSchemas.user
        ),
      },
      
      dataQuality: {
        completeness: validateDataQuality.checkCompleteness(
          mockFacilityData,
          ['name', 'location.city', 'location.capacity_mtpa', 'status']
        ),
        consistency: validateDataQuality.checkConsistency({
          emissions: mockEmissionData,
          production: mockProductionData,
          targets: mockTargetsData,
        }),
        outliers: validateDataQuality.checkOutliers([150000, 155000, 148000, 300000, 15000]),
      },
      
      businessRules: {
        targetFeasibility: validateBusinessRules.validateTargetFeasibility(
          mockTargetsData[0],
          [800, 780, 760, 740, 720]
        ),
        dataRanges: validateBusinessRules.validateDataRanges({
          carbonIntensity: 720,
          capacityUtilization: 85,
        }, {
          carbonIntensity: {
            industry_average: 800,
            industry_worst: 1200,
          }
        }),
      },
    };
    
    console.log('Validation Tests:', validationTests);
    setTestResults(prev => ({ ...prev, validations: validationTests }));
  };

  // Test edge cases and error handling
  const testEdgeCases = () => {
    console.log('🚨 Testing Edge Cases...');
    
    const edgeCaseTests = {
      nullValues: {
        formatNumber: formatNumber(null),
        formatDate: formatDate(null),
        transformEmissions: transformEmissionData(null),
        carbonIntensity: calculateCarbonIntensity(1000, 0),
      },
      emptyArrays: {
        emptyEmissions: transformEmissionData([]),
        emptyProduction: transformProductionData([]),
        emptyUsers: transformUserData([]),
        emptyStatistics: calculateStatistics([]),
      },
      invalidData: {
        invalidDate: formatDate('invalid-date'),
        invalidNumber: formatNumber('not-a-number'),
        negativeValues: calculateTargetProgress(-100, 50, 200),
      },
    };
    
    console.log('Edge Case Tests:', edgeCaseTests);
    setTestResults(prev => ({ ...prev, edgeCases: edgeCaseTests }));
  };

  // Run all tests
  const runAllTests = () => {
    console.log('🚀 Running All Data Transformation Tests...');
    console.log('=====================================');
    
    testFormatting();
    console.log('-------------------------------------');
    
    testTransformations();
    console.log('-------------------------------------');
    
    testCalculations();
    console.log('-------------------------------------');
    
    testValidations();
    console.log('-------------------------------------');
    
    testEdgeCases();
    console.log('=====================================');
    console.log('✅ All Tests Complete!');
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Data Transformation Functions Test Page
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formatting Tests */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">📊 Formatting Functions</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Basic Number:</strong> {testResults.formatting?.formatNumber?.basic || 'Not tested'}</div>
              <div><strong>Compact:</strong> {testResults.formatting?.formatNumber?.compact || 'Not tested'}</div>
              <div><strong>Currency:</strong> {testResults.formatting?.formatNumber?.currency || 'Not tested'}</div>
              <div><strong>Percentage:</strong> {testResults.formatting?.formatNumber?.percentage || 'Not tested'}</div>
              <div><strong>With Unit:</strong> {testResults.formatting?.formatNumber?.withUnit || 'Not tested'}</div>
              <div><strong>Date Default:</strong> {testResults.formatting?.formatDate?.default || 'Not tested'}</div>
              <div><strong>Date Long:</strong> {testResults.formatting?.formatDate?.long || 'Not tested'}</div>
            </div>
            <button
              onClick={testFormatting}
              className="mt-3 bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
            >
              Test Formatting
            </button>
          </div>

          {/* Transformation Tests */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">🔄 Data Transformations</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Organization:</strong> {testResults.transformations?.organization ? '✅ Tested' : '❌ Not tested'}</div>
              <div><strong>Facility:</strong> {testResults.transformations?.facility ? '✅ Tested' : '❌ Not tested'}</div>
              <div><strong>Emissions:</strong> {testResults.transformations?.emissions ? '✅ Tested' : '❌ Not tested'}</div>
              <div><strong>Production:</strong> {testResults.transformations?.production ? '✅ Tested' : '❌ Not tested'}</div>
              <div><strong>Users:</strong> {testResults.transformations?.users ? '✅ Tested' : '❌ Not tested'}</div>
              <div><strong>Targets:</strong> {testResults.transformations?.targets ? '✅ Tested' : '❌ Not tested'}</div>
            </div>
            <button
              onClick={testTransformations}
              className="mt-3 bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600"
            >
              Test Transformations
            </button>
          </div>

          {/* Calculation Tests */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">🧮 Calculation Functions</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Carbon Intensity:</strong> {testResults.calculations?.carbonIntensity?.toFixed(3) || 'Not tested'} kgCO2e/tonne</div>
              <div><strong>Capacity Utilization:</strong> {testResults.calculations?.capacityUtilization?.toFixed(1) || 'Not tested'}%</div>
              <div><strong>Target Progress:</strong> {testResults.calculations?.targetProgress?.toFixed(1) || 'Not tested'}%</div>
              <div><strong>Trend Direction:</strong> {testResults.calculations?.trend?.direction || 'Not tested'}</div>
              <div><strong>Aggregated Periods:</strong> {testResults.calculations?.aggregation?.length || 0} periods</div>
              <div><strong>Statistics Count:</strong> {testResults.calculations?.statistics?.count || 0} values</div>
            </div>
            <button
              onClick={testCalculations}
              className="mt-3 bg-purple-500 text-white px-4 py-2 rounded text-sm hover:bg-purple-600"
            >
              Test Calculations
            </button>
          </div>

          {/* Validation Tests */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">✅ Validation Functions</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Valid User Form:</strong> {testResults.validations?.formValidation?.validUser?.isValid ? '✅ Valid' : '❌ Invalid'}</div>
              <div><strong>Invalid User Form:</strong> {testResults.validations?.formValidation?.invalidUser?.isValid ? '✅ Valid' : '❌ Invalid'}</div>
              <div><strong>Data Completeness:</strong> {testResults.validations?.dataQuality?.completeness?.completeness?.toFixed(1) || 'Not tested'}%</div>
              <div><strong>Data Consistency:</strong> {testResults.validations?.dataQuality?.consistency?.isConsistent ? '✅ Consistent' : '❌ Issues found'}</div>
              <div><strong>Outliers Detected:</strong> {testResults.validations?.dataQuality?.outliers?.outliers?.length || 0}</div>
              <div><strong>Target Feasible:</strong> {testResults.validations?.businessRules?.targetFeasibility?.isValid ? '✅ Feasible' : '⚠️ Has warnings'}</div>
            </div>
            <button
              onClick={testValidations}
              className="mt-3 bg-orange-500 text-white px-4 py-2 rounded text-sm hover:bg-orange-600"
            >
              Test Validations
            </button>
          </div>

          {/* Edge Cases */}
          <div className="border rounded-lg p-4 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-3">🚨 Edge Case Testing</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Null Values:</h3>
                <div className="space-y-1 text-sm">
                  <div>Format Null Number: {testResults.edgeCases?.nullValues?.formatNumber || 'Not tested'}</div>
                  <div>Format Null Date: {testResults.edgeCases?.nullValues?.formatDate || 'Not tested'}</div>
                  <div>Division by Zero: {testResults.edgeCases?.nullValues?.carbonIntensity || 'Not tested'}</div>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Empty Data:</h3>
                <div className="space-y-1 text-sm">
                  <div>Empty Emissions: {testResults.edgeCases?.emptyArrays?.emptyEmissions ? '✅ Handled' : 'Not tested'}</div>
                  <div>Empty Production: {testResults.edgeCases?.emptyArrays?.emptyProduction ? '✅ Handled' : 'Not tested'}</div>
                  <div>Empty Statistics: {testResults.edgeCases?.emptyArrays?.emptyStatistics ? '✅ Handled' : 'Not tested'}</div>
                </div>
              </div>
            </div>
            <button
              onClick={testEdgeCases}
              className="mt-3 bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600"
            >
              Test Edge Cases
            </button>
          </div>
        </div>

        {/* Run All Tests */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={runAllTests}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            🧪 Run All Transformation Tests
          </button>
        </div>

        {/* Test Results Summary */}
        {Object.keys(testResults).length > 0 && (
          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">📋 Test Results Summary</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {testResults.formatting ? '✅' : '⏳'}
                </div>
                <div>Formatting</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {testResults.transformations ? '✅' : '⏳'}
                </div>
                <div>Transformations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {testResults.calculations ? '✅' : '⏳'}
                </div>
                <div>Calculations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {testResults.validations ? '✅' : '⏳'}
                </div>
                <div>Validations</div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Testing Instructions</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Click individual test buttons to test specific transformation categories</li>
            <li>• Click "Run All Transformation Tests" to execute all tests sequentially</li>
            <li>• Check browser console for detailed test output and results</li>
            <li>• All functions should handle edge cases gracefully without throwing errors</li>
            <li>• Validation functions should catch data quality issues and business rule violations</li>
            <li>• Formatting functions should provide consistent, user-friendly output</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TransformTest;
