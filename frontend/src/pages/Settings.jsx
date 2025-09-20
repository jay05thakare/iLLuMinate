import { useState, useEffect } from 'react';
import { useEmission } from '../contexts/EmissionContext';
import { useFacility } from '../contexts/FacilityContext';
import { useUser } from '../contexts/UserContext';
import {
  CogIcon,
  BuildingOfficeIcon,
  BeakerIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  BookOpenIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

const Settings = () => {
  const { facilities } = useFacility();
  const { 
    resources: emissionResources, 
    libraries: emissionFactorLibraries,
    organizationConfigurations,
    facilityAssignments,
    fetchOrganizationConfigurations,
    fetchFacilityAssignments,
    configureOrganizationResource,
    assignResourceToFacility
  } = useEmission();
  const [activeTab, setActiveTab] = useState('organization');
  const [organizationResources, setOrganizationResources] = useState({});
  const [facilityResources, setFacilityResources] = useState({});

  // Mock data for emission factors (since they're not in the context yet)
  const emissionFactors = [];
  const orgResources = [];

  // Initialize organization resources selection based on actual configurations
  useEffect(() => {
    const initialSelection = {};
    organizationConfigurations.forEach(config => {
      initialSelection[config.resource_id] = true;
    });
    setOrganizationResources(initialSelection);
  }, [organizationConfigurations]);

  // Initialize facility resources selection based on actual assignments
  useEffect(() => {
    const initialFacilitySelection = {};
    Object.entries(facilityAssignments).forEach(([facilityId, assignments]) => {
      initialFacilitySelection[facilityId] = {};
      assignments.forEach(assignment => {
        initialFacilitySelection[facilityId][assignment.resource_id] = true;
      });
    });
    setFacilityResources(initialFacilitySelection);
  }, [facilityAssignments]);

  // Load facility assignments when switching to facility assignment tab
  useEffect(() => {
    if (activeTab === 'facility-assignment' && facilities.length > 0) {
      facilities.forEach(facility => {
        if (!facilityAssignments[facility.id]) {
          fetchFacilityAssignments(facility.id);
        }
      });
    }
  }, [activeTab, facilities, facilityAssignments, fetchFacilityAssignments]);
  
  const tabs = [
    { id: 'organization', name: 'Organization', icon: BuildingOfficeIcon },
    { id: 'emission-inventory', name: 'Emission Factor Inventory', icon: BookOpenIcon },
    { id: 'facility-assignment', name: 'Facility Assignment', icon: AdjustmentsHorizontalIcon },
  ];

  // Handle organization-level resource selection
  const handleOrganizationResourceToggle = async (resourceId) => {
    const isCurrentlySelected = organizationResources[resourceId];
    
    if (!isCurrentlySelected) {
      // Need to configure this resource - find the first emission factor for it
      const emissionFactors = []; // This should come from context when available
      const factor = emissionFactors.find(f => f.resource_id === resourceId);
      
      if (factor) {
        try {
          const result = await configureOrganizationResource({
            resourceId: resourceId,
            emissionFactorId: factor.id
          });
          
          if (result.success) {
            console.log('✅ Resource configured successfully');
          } else {
            console.error('❌ Failed to configure resource:', result.error);
          }
        } catch (error) {
          console.error('❌ Error configuring resource:', error);
        }
      } else {
        console.warn('⚠️ No emission factor found for resource:', resourceId);
        // For now, just update local state
        setOrganizationResources(prev => ({
          ...prev,
          [resourceId]: !prev[resourceId]
        }));
      }
    } else {
      // TODO: Implement remove configuration
      setOrganizationResources(prev => ({
        ...prev,
        [resourceId]: !prev[resourceId]
      }));
    }
  };

  // Handle facility resource assignment
  const handleFacilityResourceToggle = async (facilityId, resourceId) => {
    const isCurrentlyAssigned = facilityResources[facilityId]?.[resourceId];
    
    if (!isCurrentlyAssigned) {
      // Need to assign this resource - find the organization configuration for it
      const orgConfig = organizationConfigurations.find(config => config.resource_id === resourceId);
      
      if (orgConfig) {
        try {
          const result = await assignResourceToFacility(facilityId, {
            configurationId: orgConfig.configuration_id
          });
          
          if (result.success) {
            console.log('✅ Resource assigned to facility successfully');
          } else {
            console.error('❌ Failed to assign resource to facility:', result.error);
          }
        } catch (error) {
          console.error('❌ Error assigning resource to facility:', error);
        }
      } else {
        console.warn('⚠️ No organization configuration found for resource:', resourceId);
        // For now, just update local state
        setFacilityResources(prev => ({
          ...prev,
          [facilityId]: {
            ...prev[facilityId],
            [resourceId]: !prev[facilityId]?.[resourceId]
          }
        }));
      }
    } else {
      // TODO: Implement remove assignment
      setFacilityResources(prev => ({
        ...prev,
        [facilityId]: {
          ...prev[facilityId],
          [resourceId]: !prev[facilityId]?.[resourceId]
        }
      }));
    }
  };

  // Helper function to get resource with emission factor
  const getResourceWithFactor = (resourceId) => {
    const resource = emissionResources.find(r => r.id === resourceId);
    const emissionFactor = emissionFactors.find(ef => ef.resource_id === resourceId);
    return {
      ...resource,
      emissionFactor
    };
  };



  const renderTabContent = () => {
    switch (activeTab) {
      case 'organization':
        return <OrganizationTab />;
      case 'emission-inventory':
        return (
          <EmissionInventoryTab 
            emissionResources={emissionResources}
            emissionFactorLibraries={emissionFactorLibraries}
            emissionFactors={emissionFactors}
            organizationResources={organizationResources}
            onResourceToggle={handleOrganizationResourceToggle}
          />
        );
      case 'facility-assignment':
        return (
          <FacilityAssignmentTab 
            facilities={facilities}
            emissionResources={emissionResources}
            organizationResources={organizationResources}
            facilityResources={facilityResources}
            onResourceToggle={handleFacilityResourceToggle}
            getResourceWithFactor={getResourceWithFactor}
          />
        );
      default:
        return <OrganizationTab />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your organization and emission library configuration</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon
                className={`-ml-0.5 mr-2 h-5 w-5 ${
                  activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

// Organization Tab Component
const OrganizationTab = () => {
  const { user } = useUser();
  
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Organization Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Name
            </label>
            <input
              type="text"
              className="input"
              defaultValue={user?.organization?.name || "Green Cement Industries"}
              placeholder="Enter organization name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry Type
            </label>
            <select className="input">
              <option>Cement Manufacturing</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              className="input"
              defaultValue={user?.email || "admin@greencement.com"}
              placeholder="Enter contact email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              className="input"
              defaultValue="+1-555-0123"
              placeholder="Enter phone number"
            />
          </div>
        </div>
        <div className="mt-6">
          <button className="btn-primary">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

// Emission Factor Inventory Tab Component
const EmissionInventoryTab = ({ 
  emissionResources, 
  emissionFactorLibraries, 
  emissionFactors,
  organizationResources,
  onResourceToggle 
}) => {
  const { organizationConfigurations } = useEmission();
  const [activeScope, setActiveScope] = useState('scope1');
  const [activeCategory, setActiveCategory] = useState('stationary_combustion');
  const [showCementModal, setShowCementModal] = useState(false);
  
  // State for cement calculator configuration
  const [clinkers, setClinkers] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [silicateResources, setSilicateResources] = useState([]);
  const [currentInput, setCurrentInput] = useState({ clinker: '', rawMaterial: '', silicate: '' });

  const selectedResources = Object.keys(organizationResources).filter(id => organizationResources[id]);

  const getCategoryName = (category) => {
    const categoryNames = {
      'stationary_combustion': 'Stationary Combustion',
      'mobile_combustion': 'Mobile Combustion', 
      'industrial_process': 'Industrial Process',
      'fugitive_emissions': 'Fugitive Emissions',
      'purchased_electricity': 'Purchased Electricity',
      'renewable_energy': 'Renewable Energy',
      'purchased_heat_steam': 'Purchased Heat & Steam',
      'purchased_cooling': 'Purchased Cooling'
    };
    return categoryNames[category] || category;
  };

  const categorizeResources = (scope) => {
    const scopeResources = emissionResources.filter(r => r.scope === scope && !r.is_calculator);
    const categories = {};
    scopeResources.forEach(resource => {
      if (!categories[resource.category]) {
        categories[resource.category] = [];
      }
      categories[resource.category].push(resource);
    });
    return categories;
  };

  const scope1Categories = categorizeResources('scope1');
  const scope2Categories = categorizeResources('scope2');

  // Get category tabs for current scope
  const getCurrentScopeCategories = () => {
    if (activeScope === 'scope1') {
      return Object.keys(scope1Categories);
    } else {
      return Object.keys(scope2Categories);
    }
  };

  // Handle scope change and reset category
  const handleScopeChange = (scope) => {
    setActiveScope(scope);
    const categories = scope === 'scope1' ? Object.keys(scope1Categories) : Object.keys(scope2Categories);
    setActiveCategory(categories[0] || '');
  };

  // Handle adding items
  const addClinker = () => {
    if (currentInput.clinker.trim()) {
      setClinkers([...clinkers, { id: Date.now(), name: currentInput.clinker.trim() }]);
      setCurrentInput({ ...currentInput, clinker: '' });
    }
  };

  const addRawMaterial = () => {
    if (currentInput.rawMaterial.trim()) {
      setRawMaterials([...rawMaterials, { id: Date.now(), name: currentInput.rawMaterial.trim() }]);
      setCurrentInput({ ...currentInput, rawMaterial: '' });
    }
  };

  const addSilicateResource = () => {
    if (currentInput.silicate.trim()) {
      setSilicateResources([...silicateResources, { id: Date.now(), name: currentInput.silicate.trim() }]);
      setCurrentInput({ ...currentInput, silicate: '' });
    }
  };

  // Handle removing items
  const removeClinker = (id) => {
    setClinkers(clinkers.filter(item => item.id !== id));
  };

  const removeRawMaterial = (id) => {
    setRawMaterials(rawMaterials.filter(item => item.id !== id));
  };

  const removeSilicateResource = (id) => {
    setSilicateResources(silicateResources.filter(item => item.id !== id));
  };

  const handleSaveConfiguration = () => {
    // Save the configuration (can be enhanced later)
    console.log('Saved configuration:', { clinkers, rawMaterials, silicateResources });
    setShowCementModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Hierarchical Resource Selection */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Organization Resource Inventory</h3>
            <p className="text-gray-600 text-sm">Select resources used across your organization</p>
          </div>
          <div className="text-sm text-gray-600">
            {selectedResources.length} resources selected
          </div>
        </div>

        {/* Scope Level Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => handleScopeChange('scope1')}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeScope === 'scope1'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                  activeScope === 'scope1' ? 'bg-red-500' : 'bg-gray-400'
                }`}></span>
                Scope 1 Resources
              </button>
              <button
                onClick={() => handleScopeChange('scope2')}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeScope === 'scope2'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                  activeScope === 'scope2' ? 'bg-blue-500' : 'bg-gray-400'
                }`}></span>
                Scope 2 Resources
              </button>
            </nav>
          </div>
        </div>

        {/* Category Level Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6 overflow-x-auto">
              {getCurrentScopeCategories().map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                    activeCategory === category
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {getCategoryName(category)}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Industrial Process Special Section */}
        {activeCategory === 'industrial_process' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Industrial Process Calculators</h4>
            <p className="text-sm text-gray-600 mb-6">Configure industry-specific calculation tools</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                  <h5 className="font-medium text-gray-900">Cement Industry</h5>
                </div>
                <p className="text-sm text-gray-600 mb-4">Configure cement production parameters including clinkers, raw materials, and silicate sources.</p>
                <button 
                  onClick={() => setShowCementModal(true)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Configure
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cement Industry Configuration Modal */}
        {showCementModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Configure Cement Industry Calculator
                  </h2>
                  <button
                    onClick={() => setShowCementModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Clinkers Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Add Clinkers</h3>
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Enter clinker name"
                          value={currentInput.clinker}
                          onChange={(e) => setCurrentInput({ ...currentInput, clinker: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button 
                          onClick={addClinker}
                          className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700"
                        >
                          Add
                        </button>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {clinkers.map((clinker) => (
                          <div key={clinker.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                            <span className="text-sm">{clinker.name}</span>
                            <button 
                              onClick={() => removeClinker(clinker.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Raw Materials Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Add Raw Materials</h3>
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Enter raw material name"
                          value={currentInput.rawMaterial}
                          onChange={(e) => setCurrentInput({ ...currentInput, rawMaterial: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button 
                          onClick={addRawMaterial}
                          className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700"
                        >
                          Add
                        </button>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {rawMaterials.map((material) => (
                          <div key={material.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                            <span className="text-sm">{material.name}</span>
                            <button 
                              onClick={() => removeRawMaterial(material.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Silicate Source Raw Materials Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Add Silicate Source Raw Materials</h3>
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Enter silicate name"
                          value={currentInput.silicate}
                          onChange={(e) => setCurrentInput({ ...currentInput, silicate: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button 
                          onClick={addSilicateResource}
                          className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700"
                        >
                          Add
                        </button>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {silicateResources.map((silicate) => (
                          <div key={silicate.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                            <span className="text-sm">{silicate.name}</span>
                            <button 
                              onClick={() => removeSilicateResource(silicate.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
                  <button
                    onClick={() => setShowCementModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveConfiguration}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resource Table */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-medium text-gray-900">
              {getCategoryName(activeCategory)} Resources
            </h4>
            <p className="text-sm text-gray-600">
              {activeScope === 'scope1' && scope1Categories[activeCategory] 
                ? scope1Categories[activeCategory].length 
                : activeScope === 'scope2' && scope2Categories[activeCategory]
                ? scope2Categories[activeCategory].length 
                : 0} resources available
            </p>
          </div>

          {/* Resource Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Emission Factor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EF Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Heat Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    HC Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Library
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Version
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {organizationConfigurations
                  .filter(config => config.scope === activeScope && config.category === activeCategory)
                  .map((config) => {
                    const isSelected = true; // All configs here are selected by definition

                    return (
                      <tr 
                        key={config.configuration_id}
                        className="hover:bg-gray-50 bg-blue-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            checked={true}
                            onChange={() => onResourceToggle(config.resource_id)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{config.resource_name}</div>
                          <div className="text-xs text-gray-500">{config.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {config.type || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {config.emission_factor || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {config.emission_factor_unit || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {config.heat_content || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {config.heat_content_unit || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {config.library_name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {config.library_year ? `${config.library_version} (${config.library_year})` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                {organizationConfigurations.filter(config => config.scope === activeScope && config.category === activeCategory).length === 0 && (
                  <tr>
                    <td colSpan="9" className="px-6 py-8 text-center">
                      <BeakerIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No resources configured for {getCategoryName(activeCategory)}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Facility Assignment Tab Component  
const FacilityAssignmentTab = ({ 
  facilities, 
  emissionResources, 
  organizationResources, 
  facilityResources, 
  onResourceToggle,
  getResourceWithFactor 
}) => {
  const { facilityAssignments } = useEmission();
  const selectedOrgResources = Object.keys(organizationResources).filter(id => organizationResources[id]);
  const availableResources = emissionResources.filter(r => selectedOrgResources.includes(r.id));

  if (selectedOrgResources.length === 0) {
    return (
      <div className="text-center py-12">
        <BeakerIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Organization Resources Selected</h3>
        <p className="text-gray-500 mb-6">Select resources in the Emission Factor Inventory first</p>
        <button className="btn-primary">Go to Inventory</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Facility Resource Assignment</h3>
            <p className="text-gray-600 text-sm">Assign selected organization resources to each facility</p>
          </div>
          <div className="text-sm text-gray-600">
            {selectedOrgResources.length} resources available
          </div>
        </div>

        {facilities.length > 0 ? (
          <div className="space-y-8">
            {facilities.map((facility) => (
              <div key={facility.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-6">
                  <BuildingOfficeIcon className="h-6 w-6 text-primary-600 mr-3" />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{facility.name}</h4>
                    <p className="text-sm text-gray-500">{facility.location?.country}</p>
                  </div>
                </div>

                {/* Facility Resources Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assign
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Resource Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Resource Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Scope
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Emission Factor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          EF Unit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Heat Content
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          HC Unit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Library
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Version
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(facilityAssignments[facility.id] || []).map((assignment) => {
                        const isAssigned = true; // All items here are assigned by definition
                        
                        return (
                          <tr 
                            key={assignment.assignment_id}
                            className="hover:bg-gray-50 bg-green-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                checked={true}
                                onChange={() => onResourceToggle(facility.id, assignment.resource_id)}
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{assignment.resource_name}</div>
                              <div className="text-xs text-gray-500">{assignment.category}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {assignment.type || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                assignment.scope === 'scope1' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {assignment.scope === 'scope1' ? 'Scope 1' : 'Scope 2'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {assignment.emission_factor || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {assignment.emission_factor_unit || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {assignment.heat_content || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {assignment.heat_content_unit || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {assignment.library_name || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {assignment.library_year ? `${assignment.library_version} (${assignment.library_year})` : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {Object.values(facilityResources[facility.id] || {}).filter(Boolean).length} of {availableResources.length} resources assigned
                    </span>
                    <button className="btn-secondary text-sm">Save Assignment</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No facilities found</h3>
            <p className="text-gray-500">Create facilities first to assign resources</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Settings;
