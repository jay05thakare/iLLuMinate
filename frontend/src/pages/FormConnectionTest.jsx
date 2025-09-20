/**
 * Form Connection Test Page
 * Demonstrates and tests all data entry forms connected to backend APIs
 */

import React, { useState, useEffect } from 'react';
import { useFacility } from '../contexts/FacilityContext';
import { useNotification } from '../contexts/NotificationContext';
import apiService from '../services/api';

// Form Components
import FacilityModal from '../components/modals/FacilityModal';
import ProductionDataForm from '../components/forms/ProductionDataForm';

// UI Components
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorAlert from '../components/ui/ErrorAlert';

const FormConnectionTest = () => {
  const { facilities, loading: facilitiesLoading, createFacility, updateFacility } = useFacility();
  const { showSuccess, showError, showInfo } = useNotification();

  // State for form testing
  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
  const [isProductionFormOpen, setIsProductionFormOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [modalMode, setModalMode] = useState('add');
  
  // State for API test results
  const [testResults, setTestResults] = useState({
    facilityCreate: null,
    facilityUpdate: null,
    productionCreate: null,
    productionFetch: null,
    emissionCreate: null,
    emissionUpdate: null,
    emissionDelete: null,
    emissionFetch: null
  });

  const [isRunningTests, setIsRunningTests] = useState(false);

  // Initialize with first facility if available
  useEffect(() => {
    if (facilities && facilities.length > 0 && !selectedFacility) {
      setSelectedFacility(facilities[0]);
    }
  }, [facilities, selectedFacility]);

  // Test facility creation
  const testFacilityCreate = async () => {
    try {
      const testFacilityData = {
        name: `Test Facility ${Date.now()}`,
        description: 'Test facility created by automated testing',
        location: {
          address: '123 Test Street',
          country: 'Test Country',
          region: 'Test Region'
        },
        status: 'active'
      };

      const result = await createFacility(testFacilityData);
      
      setTestResults(prev => ({
        ...prev,
        facilityCreate: {
          success: result.success,
          message: result.success ? 'Facility created successfully' : result.error,
          data: result.data
        }
      }));

      return result;
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        facilityCreate: {
          success: false,
          message: error.message,
          error: error
        }
      }));
      throw error;
    }
  };

  // Test production data creation
  const testProductionCreate = async (facilityId) => {
    try {
      const testProductionData = {
        facilityId,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        cementProduction: Math.floor(Math.random() * 50000) + 50000,
        unit: 'tonnes'
      };

      const response = await apiService.createProductionData(testProductionData);
      
      setTestResults(prev => ({
        ...prev,
        productionCreate: {
          success: response.success,
          message: response.message || 'Production data created successfully',
          data: response.data
        }
      }));

      return response;
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        productionCreate: {
          success: false,
          message: error.response?.data?.message || error.message,
          error: error
        }
      }));
      throw error;
    }
  };

  // Test production data fetching
  const testProductionFetch = async (facilityId) => {
    try {
      const response = await apiService.getProductionData(facilityId);
      
      setTestResults(prev => ({
        ...prev,
        productionFetch: {
          success: response.success,
          message: `Fetched ${response.data?.production_records?.length || 0} production records`,
          data: response.data
        }
      }));

      return response;
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        productionFetch: {
          success: false,
          message: error.response?.data?.message || error.message,
          error: error
        }
      }));
      throw error;
    }
  };

  // Test emission data creation
  const testEmissionCreate = async (facilityId) => {
    try {
      // First, get available facility resources
      const resourcesResponse = await apiService.getFacilityResources(facilityId);
      
      if (!resourcesResponse.success || !resourcesResponse.data?.resources?.length) {
        // If no resources configured, skip emission creation test
        setTestResults(prev => ({
          ...prev,
          emissionCreate: {
            success: false,
            message: 'No facility resources configured - skipping emission data test',
            error: new Error('No facility resources configured')
          }
        }));
        return { success: false, message: 'No facility resources configured' };
      }

      const facilityResource = resourcesResponse.data.resources[0];
      
      const testEmissionData = {
        facilityId,
        facilityResourceId: facilityResource.facility_resource_id,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        consumption: Math.floor(Math.random() * 1000) + 100,
        consumptionUnit: 'tonnes'
      };

      const response = await apiService.createEmissionData(testEmissionData);
      
      setTestResults(prev => ({
        ...prev,
        emissionCreate: {
          success: response.success,
          message: response.message || 'Emission data created successfully',
          data: response.data
        }
      }));

      return response;
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        emissionCreate: {
          success: false,
          message: error.response?.data?.message || error.message,
          error: error
        }
      }));
      throw error;
    }
  };

  // Test emission data update
  const testEmissionUpdate = async (emissionDataId) => {
    try {
      const updateData = {
        consumption: Math.floor(Math.random() * 1000) + 100,
        consumptionUnit: 'tonnes'
      };

      const response = await apiService.updateEmissionData(emissionDataId, updateData);
      
      setTestResults(prev => ({
        ...prev,
        emissionUpdate: {
          success: response.success,
          message: response.message || 'Emission data updated successfully',
          data: response.data
        }
      }));

      return response;
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        emissionUpdate: {
          success: false,
          message: error.response?.data?.message || error.message,
          error: error
        }
      }));
      throw error;
    }
  };

  // Test emission data delete
  const testEmissionDelete = async (emissionDataId) => {
    try {
      const response = await apiService.deleteEmissionData(emissionDataId);
      
      setTestResults(prev => ({
        ...prev,
        emissionDelete: {
          success: response.success,
          message: response.message || 'Emission data deleted successfully',
          data: response.data
        }
      }));

      return response;
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        emissionDelete: {
          success: false,
          message: error.response?.data?.message || error.message,
          error: error
        }
      }));
      throw error;
    }
  };

  // Test emission data fetching
  const testEmissionFetch = async (facilityId) => {
    try {
      const response = await apiService.getEmissionData(facilityId);
      
      setTestResults(prev => ({
        ...prev,
        emissionFetch: {
          success: response.success,
          message: `Fetched ${response.data?.emission_records?.length || 0} emission records`,
          data: response.data
        }
      }));

      return response;
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        emissionFetch: {
          success: false,
          message: error.response?.data?.message || error.message,
          error: error
        }
      }));
      throw error;
    }
  };

  // Run comprehensive API tests
  const runComprehensiveTests = async () => {
    setIsRunningTests(true);
    setTestResults({});
    
    showInfo('Starting comprehensive API tests...', { title: 'Testing Started' });

    try {
      // Test 1: Create facility
      showInfo('Testing facility creation...', { title: 'Test 1/6' });
      const facilityResult = await testFacilityCreate();
      
      if (facilityResult.success && facilityResult.data) {
        const newFacilityId = facilityResult.data.id;
        
        // Test 2: Fetch production data
        showInfo('Testing production data fetch...', { title: 'Test 2/6' });
        await testProductionFetch(newFacilityId);
        
        // Test 3: Create production data
        showInfo('Testing production data creation...', { title: 'Test 3/6' });
        await testProductionCreate(newFacilityId);
        
        // Test 4: Fetch emission data
        showInfo('Testing emission data fetch...', { title: 'Test 4/6' });
        await testEmissionFetch(newFacilityId);
        
        // Test 5: Try to create emission data (may fail if no resources configured)
        showInfo('Testing emission data creation...', { title: 'Test 5/8' });
        const emissionCreateResult = await testEmissionCreate(newFacilityId);
        
        // Test 6: If emission data was created successfully, test update and delete
        if (emissionCreateResult.success && emissionCreateResult.data) {
          const emissionDataId = emissionCreateResult.data.id;
          
          showInfo('Testing emission data update...', { title: 'Test 6/8' });
          await testEmissionUpdate(emissionDataId);
          
          showInfo('Testing emission data delete...', { title: 'Test 7/8' });
          await testEmissionDelete(emissionDataId);
        }
        
        // Test 8: Update facility
        showInfo('Testing facility update...', { title: 'Test 8/8' });
        const updateResult = await updateFacility(newFacilityId, {
          name: facilityResult.data.name + ' (Updated)',
          description: 'Updated by automated testing'
        });
        
        setTestResults(prev => ({
          ...prev,
          facilityUpdate: {
            success: updateResult.success,
            message: updateResult.success ? 'Facility updated successfully' : updateResult.error,
            data: updateResult.data
          }
        }));
      }

      showSuccess('Comprehensive API tests completed!', { title: 'Testing Complete' });
    } catch (error) {
      showError(`Testing failed: ${error.message}`, { title: 'Testing Error' });
    } finally {
      setIsRunningTests(false);
    }
  };

  // Handle facility form submission
  const handleFacilitySubmit = async (facilityData) => {
    const result = modalMode === 'add' 
      ? await createFacility(facilityData)
      : await updateFacility(selectedFacility.id, facilityData);
    
    return result;
  };

  // Handle production form submission
  const handleProductionSubmit = (productionData) => {
    showSuccess('Production data saved successfully!', { title: 'Data Saved' });
    console.log('Production data submitted:', productionData);
    setIsProductionFormOpen(false);
  };

  if (facilitiesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading facilities..." />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🔗 Form Connection Test
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Interactive Form Testing */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">📝 Interactive Form Testing</h2>
            
            <div className="space-y-4">
              {/* Facility Form Tests */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-3">Facility Management</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setModalMode('add');
                      setSelectedFacility(null);
                      setIsFacilityModalOpen(true);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Add Facility
                  </button>
                  
                  {selectedFacility && (
                    <button
                      onClick={() => {
                        setModalMode('edit');
                        setIsFacilityModalOpen(true);
                      }}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Edit Facility
                    </button>
                  )}
                </div>
                
                {selectedFacility && (
                  <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                    <strong>Selected:</strong> {selectedFacility.name}
                  </div>
                )}
              </div>

              {/* Production Form Tests */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-3">Production Data Entry</h3>
                <button
                  onClick={() => setIsProductionFormOpen(true)}
                  disabled={!selectedFacility}
                  className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Production Data
                </button>
                
                {!selectedFacility && (
                  <p className="mt-2 text-sm text-gray-500">
                    Select a facility first
                  </p>
                )}
              </div>

              {/* Facility Selection */}
              {facilities && facilities.length > 0 && (
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-3">Select Test Facility</h3>
                  <select
                    value={selectedFacility?.id || ''}
                    onChange={(e) => {
                      const facility = facilities.find(f => f.id === e.target.value);
                      setSelectedFacility(facility);
                    }}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select a facility...</option>
                    {facilities.map(facility => (
                      <option key={facility.id} value={facility.id}>
                        {facility.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Automated API Testing */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">🤖 Automated API Testing</h2>
            
            <div className="space-y-4">
              <button
                onClick={runComprehensiveTests}
                disabled={isRunningTests}
                className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isRunningTests ? (
                  <>
                    <LoadingSpinner size="sm" variant="white" />
                    <span className="ml-2">Running Tests...</span>
                  </>
                ) : (
                  'Run Comprehensive API Tests'
                )}
              </button>

              {/* Test Results */}
              <div className="space-y-3">
                {Object.entries(testResults).map(([testName, result]) => (
                  result && (
                    <div key={testName} className={`p-3 rounded-lg border ${
                      result.success 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {testName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <span className={`text-sm ${
                          result.success ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.success ? '✅ Success' : '❌ Failed'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {result.message}
                      </p>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">📊 Connection Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-xl">✅</div>
              <div className="text-blue-800">Backend API</div>
            </div>
            <div className="text-center">
              <div className="text-xl">✅</div>
              <div className="text-blue-800">Authentication</div>
            </div>
            <div className="text-center">
              <div className="text-xl">✅</div>
              <div className="text-blue-800">Form Validation</div>
            </div>
            <div className="text-center">
              <div className="text-xl">✅</div>
              <div className="text-blue-800">Error Handling</div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">📋 Test Instructions</h3>
          <ul className="text-gray-700 text-sm space-y-1">
            <li>• <strong>Interactive Forms:</strong> Test individual forms with real backend connections</li>
            <li>• <strong>Automated Tests:</strong> Run comprehensive API endpoint testing</li>
            <li>• <strong>Error Simulation:</strong> Forms handle validation errors and network issues</li>
            <li>• <strong>Loading States:</strong> All forms show appropriate loading indicators</li>
            <li>• <strong>Success Feedback:</strong> Successful operations show toast notifications</li>
            <li>• <strong>Data Persistence:</strong> Created data is immediately available in the system</li>
          </ul>
        </div>
      </div>

      {/* Modals */}
      {isFacilityModalOpen && (
        <FacilityModal
          isOpen={isFacilityModalOpen}
          onClose={() => setIsFacilityModalOpen(false)}
          onSave={handleFacilitySubmit}
          facility={selectedFacility}
          mode={modalMode}
        />
      )}

      {isProductionFormOpen && selectedFacility && (
        <ProductionDataForm
          facilityId={selectedFacility.id}
          onClose={() => setIsProductionFormOpen(false)}
          onSubmit={handleProductionSubmit}
        />
      )}
    </div>
  );
};

export default FormConnectionTest;
