/**
 * Facility Resource Configuration Test Page
 * Demonstrates comprehensive facility resource management APIs
 */

import React, { useState, useEffect } from 'react';
import { useFacility } from '../contexts/FacilityContext';
import { useEmission } from '../contexts/EmissionContext';
import { useNotification } from '../contexts/NotificationContext';
import apiService from '../services/api';

// UI Components
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorAlert from '../components/ui/ErrorAlert';

const FacilityResourceConfigTest = () => {
  const { facilities, loading: facilitiesLoading } = useFacility();
  const { resources: emissionResources, libraries, factors, loading: emissionLoading } = useEmission();
  const { showSuccess, showError, showInfo, showWarning } = useNotification();

  // State for selected facility and operations
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [sourceFacility, setSourceFacility] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('cement_plant');
  
  // State for resource data
  const [facilityResources, setFacilityResources] = useState([]);
  const [availableTemplates, setAvailableTemplates] = useState(null);
  const [selectedResources, setSelectedResources] = useState([]);
  
  // Loading states
  const [loadingResources, setLoadingResources] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [operationLoading, setOperationLoading] = useState(false);

  // Initialize with first facility
  useEffect(() => {
    if (facilities && facilities.length > 0 && !selectedFacility) {
      setSelectedFacility(facilities[0]);
    }
  }, [facilities, selectedFacility]);

  // Load facility resources when facility changes
  useEffect(() => {
    if (selectedFacility) {
      loadFacilityResources();
    }
  }, [selectedFacility]);

  // Load templates on component mount
  useEffect(() => {
    loadResourceTemplates();
  }, [selectedTemplate]);

  const loadFacilityResources = async () => {
    if (!selectedFacility) return;

    setLoadingResources(true);
    try {
      const response = await apiService.getFacilityResources(selectedFacility.id);
      
      if (response.success) {
        setFacilityResources(response.data.resources || []);
      } else {
        throw new Error(response.message || 'Failed to load facility resources');
      }
    } catch (error) {
      showError(`Failed to load facility resources: ${error.message}`, { title: 'Resource Error' });
      setFacilityResources([]);
    } finally {
      setLoadingResources(false);
    }
  };

  const loadResourceTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const response = await apiService.getResourceTemplates(selectedTemplate);
      
      if (response.success) {
        setAvailableTemplates(response.data);
      } else {
        throw new Error(response.message || 'Failed to load templates');
      }
    } catch (error) {
      showError(`Failed to load templates: ${error.message}`, { title: 'Template Error' });
      setAvailableTemplates(null);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleBulkConfigure = async () => {
    if (!selectedFacility || selectedResources.length === 0) {
      showWarning('Please select resources to configure', { title: 'No Selection' });
      return;
    }

    setOperationLoading(true);
    try {
      const resourceConfigs = selectedResources.map(resourceId => {
        // Find the first available emission factor for this resource
        const resourceFactors = factors.filter(f => f.resource_id === resourceId);
        if (resourceFactors.length === 0) {
          throw new Error(`No emission factors found for resource ${resourceId}`);
        }
        
        return {
          resourceId,
          emissionFactorId: resourceFactors[0].id // Use the first available factor
        };
      });

      const response = await apiService.bulkConfigureFacilityResources(
        selectedFacility.id,
        resourceConfigs
      );
      
      if (response.success) {
        showSuccess(
          `Bulk configuration completed: ${response.data.summary.configured} configured, ${response.data.summary.skipped} skipped`,
          { title: 'Configuration Complete' }
        );
        setSelectedResources([]);
        await loadFacilityResources(); // Refresh the list
      } else {
        throw new Error(response.message || 'Bulk configuration failed');
      }
    } catch (error) {
      showError(`Bulk configuration failed: ${error.message}`, { title: 'Configuration Error' });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleApplyTemplate = async () => {
    if (!selectedFacility) {
      showWarning('Please select a facility', { title: 'No Selection' });
      return;
    }

    setOperationLoading(true);
    try {
      const response = await apiService.applyResourceTemplate(
        selectedFacility.id,
        selectedTemplate,
        false // Don't overwrite existing
      );
      
      if (response.success) {
        showSuccess(
          `Template applied: ${response.data.summary.applied} resources configured, ${response.data.summary.skipped} skipped`,
          { title: 'Template Applied' }
        );
        await loadFacilityResources(); // Refresh the list
      } else {
        throw new Error(response.message || 'Template application failed');
      }
    } catch (error) {
      showError(`Template application failed: ${error.message}`, { title: 'Template Error' });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleCopyResources = async () => {
    if (!selectedFacility || !sourceFacility) {
      showWarning('Please select both source and target facilities', { title: 'Incomplete Selection' });
      return;
    }

    if (selectedFacility.id === sourceFacility.id) {
      showWarning('Source and target facilities must be different', { title: 'Invalid Selection' });
      return;
    }

    setOperationLoading(true);
    try {
      const response = await apiService.copyFacilityResources(
        selectedFacility.id,
        sourceFacility.id
      );
      
      if (response.success) {
        showSuccess(
          `Resources copied: ${response.data.summary.copied} copied, ${response.data.summary.skipped} skipped`,
          { title: 'Copy Complete' }
        );
        await loadFacilityResources(); // Refresh the list
      } else {
        throw new Error(response.message || 'Resource copy failed');
      }
    } catch (error) {
      showError(`Resource copy failed: ${error.message}`, { title: 'Copy Error' });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleRemoveResource = async (resourceId) => {
    if (!selectedFacility) return;

    setOperationLoading(true);
    try {
      const response = await apiService.removeFacilityResource(
        selectedFacility.id,
        resourceId
      );
      
      if (response.success) {
        showSuccess('Resource configuration removed successfully', { title: 'Resource Removed' });
        await loadFacilityResources(); // Refresh the list
      } else {
        throw new Error(response.message || 'Failed to remove resource');
      }
    } catch (error) {
      showError(`Failed to remove resource: ${error.message}`, { title: 'Remove Error' });
    } finally {
      setOperationLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num === undefined || num === null) return 'N/A';
    return new Intl.NumberFormat().format(Math.round(num * 100) / 100);
  };

  if (facilitiesLoading || emissionLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading facility data..." />
      </div>
    );
  }

  if (!facilities || facilities.length === 0) {
    return (
      <ErrorAlert
        type="warning"
        title="No Facilities Found"
        message="No facilities available for resource configuration."
      />
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🔧 Facility Resource Configuration
        </h1>
        
        {/* Facility Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Facility
            </label>
            <select
              value={selectedFacility?.id || ''}
              onChange={(e) => {
                const facility = facilities.find(f => f.id === e.target.value);
                setSelectedFacility(facility);
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {facilities.map(facility => (
                <option key={facility.id} value={facility.id}>
                  {facility.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source Facility (for copying)
            </label>
            <select
              value={sourceFacility?.id || ''}
              onChange={(e) => {
                const facility = facilities.find(f => f.id === e.target.value);
                setSourceFacility(facility);
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select source facility...</option>
              {facilities.map(facility => (
                <option key={facility.id} value={facility.id}>
                  {facility.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Current Configuration */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              📋 Current Configuration
            </h2>
            {loadingResources && <LoadingSpinner size="sm" />}
          </div>

          {selectedFacility && (
            <div className="mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="font-medium text-blue-900">{selectedFacility.name}</div>
                <div className="text-sm text-blue-700">
                  {facilityResources.length} resource{facilityResources.length !== 1 ? 's' : ''} configured
                </div>
              </div>
            </div>
          )}

          {facilityResources.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {facilityResources.map((resource, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{resource.resource_name}</div>
                      <div className="text-sm text-gray-600">
                        {resource.scope?.toUpperCase()} • {resource.category}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {resource.library_name} {resource.library_version} ({resource.library_year})
                      </div>
                      <div className="text-xs text-gray-500">
                        Factor: {formatNumber(resource.emission_factor)} {resource.emission_factor_unit}
                        {resource.heat_content && (
                          <> • Heat: {formatNumber(resource.heat_content)} {resource.heat_content_unit}</>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveResource(resource.resource_id)}
                      disabled={operationLoading}
                      className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No resources configured for this facility
            </div>
          )}
        </div>

        {/* Configuration Operations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bulk Configuration */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📦 Bulk Configuration
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Resources ({selectedResources.length} selected)
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md">
                  {emissionResources && emissionResources.length > 0 ? (
                    emissionResources.slice(0, 10).map((resource) => (
                      <label key={resource.id} className="flex items-center p-2 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedResources.includes(resource.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedResources([...selectedResources, resource.id]);
                            } else {
                              setSelectedResources(selectedResources.filter(id => id !== resource.id));
                            }
                          }}
                          className="mr-2"
                        />
                        <div className="text-sm">
                          <div className="font-medium">{resource.name}</div>
                          <div className="text-gray-600">{resource.scope?.toUpperCase()} • {resource.category}</div>
                        </div>
                      </label>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-gray-500">No emission resources available</div>
                  )}
                </div>
              </div>

              <button
                onClick={handleBulkConfigure}
                disabled={operationLoading || selectedResources.length === 0}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {operationLoading ? <LoadingSpinner size="sm" /> : 'Configure Selected Resources'}
              </button>
            </div>
          </div>

          {/* Template Application */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                📋 Apply Template
              </h3>
              {loadingTemplates && <LoadingSpinner size="sm" />}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Type
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="cement_plant">Cement Plant</option>
                  <option value="office_building">Office Building</option>
                </select>
              </div>

              {availableTemplates && (
                <div className="bg-white p-3 rounded-lg border">
                  <div className="font-medium text-sm">{availableTemplates.template?.name}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {availableTemplates.template?.description}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {availableTemplates.template?.totalResources || 0} resources available
                  </div>
                </div>
              )}

              <button
                onClick={handleApplyTemplate}
                disabled={operationLoading || !selectedFacility}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {operationLoading ? <LoadingSpinner size="sm" /> : 'Apply Template'}
              </button>
            </div>
          </div>

          {/* Copy Configuration */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📋 Copy Configuration
            </h3>
            
            <div className="space-y-4">
              {sourceFacility && (
                <div className="bg-white p-3 rounded-lg border">
                  <div className="font-medium text-sm">Source: {sourceFacility.name}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Copy resource configuration from this facility
                  </div>
                </div>
              )}

              {selectedFacility && sourceFacility && (
                <div className="bg-white p-3 rounded-lg border">
                  <div className="font-medium text-sm">Target: {selectedFacility.name}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Resources will be copied to this facility
                  </div>
                </div>
              )}

              <button
                onClick={handleCopyResources}
                disabled={operationLoading || !selectedFacility || !sourceFacility}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {operationLoading ? <LoadingSpinner size="sm" /> : 'Copy Resources'}
              </button>
            </div>
          </div>
        </div>

        {/* API Endpoints Documentation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="font-semibold text-blue-900 mb-4">📚 Facility Resource Configuration API Endpoints</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-800">Bulk Configuration</div>
              <div className="text-blue-700 font-mono">POST /api/facilities/:id/resources/bulk</div>
              <div className="text-blue-600 text-xs mt-1">
                Configure multiple resources in a single operation with detailed reporting
              </div>
            </div>
            <div>
              <div className="font-medium text-blue-800">Resource Templates</div>
              <div className="text-blue-700 font-mono">GET /api/facilities/templates/resources</div>
              <div className="text-blue-600 text-xs mt-1">
                Predefined facility types with standard resource configurations
              </div>
            </div>
            <div>
              <div className="font-medium text-blue-800">Copy Configuration</div>
              <div className="text-blue-700 font-mono">POST /api/facilities/:id/resources/copy</div>
              <div className="text-blue-600 text-xs mt-1">
                Copy resource configuration between facilities with conflict handling
              </div>
            </div>
            <div>
              <div className="font-medium text-blue-800">Resource Management</div>
              <div className="text-blue-700 font-mono">PUT/DELETE /api/facilities/:id/resources/:resourceId</div>
              <div className="text-blue-600 text-xs mt-1">
                Update or remove individual resource configurations with safety checks
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityResourceConfigTest;
