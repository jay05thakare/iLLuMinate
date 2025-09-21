import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useFacilityData } from '../hooks/useData';
import { useFacility } from '../contexts/FacilityContext';
import { useEmission } from '../contexts/EmissionContext';
import apiService from '../services/api';
import CementCalculatorModal from '../components/modals/CementCalculatorModal';
import CementDataEntryModal from '../components/modals/CementDataEntryModal';
import AIRecommendationsTab from '../components/ai/AIRecommendationsTab';
import EnhancedAlternativeFuelsOptimizer from '../components/ai/EnhancedAlternativeFuelsOptimizer';
import {
  BuildingOfficeIcon,
  MapPinIcon,
  CalendarIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  FireIcon,
  ArrowLeftIcon,
  LightBulbIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

const FacilityDetail = () => {
  const { facilityId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { facility, resources, emissionData, metrics, loading } = useFacilityData(facilityId);
  const { getFacilityById } = useFacility();
  const { facilityAssignments, fetchFacilityAssignments } = useEmission();
  
  // Get tab, sub-tab, month, and year from URL parameters or use defaults
  const urlParams = new URLSearchParams(location.search);
  const [activeTab, setActiveTab] = useState(urlParams.get('tab') || 'profile');
  const [activeSubTab, setActiveSubTab] = useState(urlParams.get('subTab') || 'data');
  const [cementModalOpen, setCementModalOpen] = useState(false);
  const [selectedCalculator, setSelectedCalculator] = useState(null);
  const [calculatorConfigs, setCalculatorConfigs] = useState({});
  const [dataEntryModalOpen, setDataEntryModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [cementDataEntries, setCementDataEntries] = useState([]);
  const [facilityTargets, setFacilityTargets] = useState([]);
  const [targetsLoading, setTargetsLoading] = useState(false);

  // Update URL when tabs change
  const updateActiveTab = (tabId) => {
    setActiveTab(tabId);
    const newParams = new URLSearchParams(location.search);
    newParams.set('tab', tabId);
    // Reset sub-tab when changing main tabs
    if (tabId === 'sustainability') {
      newParams.set('subTab', activeSubTab);
    } else {
      newParams.delete('subTab');
    }
    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
  };

  const updateActiveSubTab = (subTabId) => {
    setActiveSubTab(subTabId);
    const newParams = new URLSearchParams(location.search);
    newParams.set('tab', 'sustainability');
    newParams.set('subTab', subTabId);
    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
  };

  // Sync state with URL parameters when location changes
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    const subTabFromUrl = urlParams.get('subTab');
    
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
    if (subTabFromUrl && subTabFromUrl !== activeSubTab) {
      setActiveSubTab(subTabFromUrl);
    }
  }, [location.search, activeTab, activeSubTab]);

  // Fetch facility assignments for this facility when component mounts
  useEffect(() => {
    if (facilityId && !facilityAssignments[facilityId]) {
      fetchFacilityAssignments(facilityId);
    }
  }, [facilityId, facilityAssignments, fetchFacilityAssignments]);

  // Fetch facility-specific targets
  useEffect(() => {
    const fetchFacilityTargets = async () => {
      if (!facilityId) return;
      
      try {
        setTargetsLoading(true);
        console.log('🎯 Fetching targets for facility:', facilityId);
        
        const response = await apiService.getTargets({ facilityId });
        console.log('🎯 Facility targets API response:', response);
        
        if (response.success && response.data && response.data.targets) {
          setFacilityTargets(response.data.targets);
          console.log('🎯 Facility targets loaded:', response.data.targets.length);
        } else {
          console.error('🎯 Failed to fetch facility targets:', response.message);
          setFacilityTargets([]);
        }
      } catch (error) {
        console.error('🎯 Error fetching facility targets:', error);
        setFacilityTargets([]);
      } finally {
        setTargetsLoading(false);
      }
    };

    fetchFacilityTargets();
  }, [facilityId]);

  // Get facility-specific assigned resources
  const facilityResources = facilityAssignments[facilityId] || [];
  
  // Add debug logs to see what data we have
  console.log('🔧 FacilityDetail: facilityAssignments data:', facilityAssignments);
  console.log('🔧 FacilityDetail: facilityResources for this facility:', facilityResources);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="text-center py-12">
        <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Facility not found</h3>
        <Link to="/facilities" className="text-primary-600 hover:text-primary-800">
          ← Back to Facilities
        </Link>
      </div>
    );
  }

  // Extract metrics or calculate defaults
  const yearlyEmissions = parseFloat(metrics?.totalEmissions || emissionData?.reduce((sum, e) => sum + (parseFloat(e.total_emissions) || 0), 0) || 0) || 0;
  const yearlyProduction = parseFloat(metrics?.totalProduction || 0) || 0;
  const carbonIntensity = parseFloat(metrics?.carbonIntensity || (yearlyProduction > 0 ? (yearlyEmissions / yearlyProduction) : 0)) || 0;
  
  // Compatibility data for components that expect legacy format
  const facilityEmissions = emissionData || [];
  const facilityProduction = metrics?.totalProduction || 0;

  // Handle calculator configuration
  const handleCalculatorConfigure = (calculator) => {
    if (calculator && calculator.calculator_type === 'cement_industry') {
      setSelectedCalculator(calculator);
      setCementModalOpen(true);
    }
  };

  // Handle calculator configuration save
  const handleCalculatorConfigSave = (config) => {
    if (selectedCalculator) {
      setCalculatorConfigs(prev => ({
        ...prev,
        [selectedCalculator.id]: config
      }));
    }
  };

  // Handle data entry modal
  const handleAddCementData = () => {
    setDataEntryModalOpen(true);
  };

  const handleSaveCementData = (data) => {
    setCementDataEntries(prev => [...prev, {
      ...data,
      id: Date.now(),
      facilityId: facilityId
    }]);
    setDataEntryModalOpen(false);
  };

  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <ProfileTab 
            facility={facility} 
            yearlyEmissions={yearlyEmissions}
            yearlyProduction={yearlyProduction}
            carbonIntensity={carbonIntensity}
            facilityTargets={facilityTargets}
          />
        );
        case 'sustainability':
          return <SustainabilityTab 
            facility={facility} 
            emissions={facilityEmissions} 
            production={facilityProduction} 
            targets={facilityTargets}
            resources={facilityResources}
            emissionData={emissionData}
            activeSubTab={activeSubTab}
            setActiveSubTab={updateActiveSubTab}
            onCalculatorConfigure={handleCalculatorConfigure}
            calculatorConfigs={calculatorConfigs}
            targetsLoading={targetsLoading}
            facilityResources={facilityResources}
            navigate={navigate}
            location={location}
          />;
      case 'recommendations':
        return <AIRecommendationsTab facility={facility} />;
      default:
        return (
          <ProfileTab 
            facility={facility} 
            yearlyEmissions={yearlyEmissions}
            yearlyProduction={yearlyProduction}
            carbonIntensity={carbonIntensity}
            facilityTargets={facilityTargets}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/facilities"
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{facility.name}</h1>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <MapPinIcon className="h-4 w-4 mr-1" />
              {facility.location?.address}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="badge-success">{facility.status}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'profile', name: 'Profile', icon: BuildingOfficeIcon },
            { id: 'sustainability', name: 'Sustainability', icon: GlobeAltIcon },
            { id: 'recommendations', name: 'AI Recommendations', icon: LightBulbIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => updateActiveTab(tab.id)}
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

        {/* Cement Calculator Modal */}
        <CementCalculatorModal
          isOpen={cementModalOpen}
          onClose={() => setCementModalOpen(false)}
          calculatorName={selectedCalculator?.resource_name}
          onSave={handleCalculatorConfigSave}
          initialConfig={selectedCalculator ? calculatorConfigs[selectedCalculator.id] : null}
        />

        {/* Cement Data Entry Modal */}
        <CementDataEntryModal
          isOpen={dataEntryModalOpen}
          onClose={() => setDataEntryModalOpen(false)}
          onSave={handleSaveCementData}
          month={getMonthName(selectedMonth)}
          year={selectedYear}
          existingData={null}
        />
      </div>
    );
  };

// Sustainability Tab Component with Sub-tabs
const SustainabilityTab = ({ facility, emissions, production, targets, resources, emissionData, activeSubTab, setActiveSubTab, onCalculatorConfigure, calculatorConfigs, facilityResources, targetsLoading, navigate, location }) => {
  const subTabs = [
    { id: 'data', name: 'Data', icon: ChartBarIcon },
    { id: 'goals', name: 'Goals', icon: ClipboardDocumentListIcon },
    { id: 'fuels', name: 'Alternate Fuels', icon: FireIcon },
  ];

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'data':
        return <DataTab 
          facility={facility} 
          emissions={emissions} 
          production={production} 
          resources={facilityResources}
          emissionData={emissionData}
          onCalculatorConfigure={onCalculatorConfigure}
          calculatorConfigs={calculatorConfigs}
          navigate={navigate}
          location={location}
        />;
      case 'goals':
        return <TargetsTab facility={facility} targets={targets} loading={targetsLoading} />;
      case 'fuels':
        return <FuelsTab facility={facility} />;
      default:
        return <DataTab 
          facility={facility} 
          emissions={emissions} 
          production={production} 
          resources={facilityResources}
          emissionData={emissionData}
          onCalculatorConfigure={onCalculatorConfigure}
          calculatorConfigs={calculatorConfigs}
          navigate={navigate}
          location={location}
        />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {subTabs.map((subTab) => (
            <button
              key={subTab.id}
              onClick={() => setActiveSubTab(subTab.id)}
              className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeSubTab === subTab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <subTab.icon
                className={`-ml-0.5 mr-2 h-4 w-4 ${
                  activeSubTab === subTab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {subTab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Sub-tab Content */}
      <div>
        {renderSubTabContent()}
      </div>
    </div>
  );
};

// Profile Tab Component
const ProfileTab = ({ facility, yearlyEmissions, yearlyProduction, carbonIntensity, facilityTargets = [] }) => (
  <div className="space-y-6">
    {/* Facility Information */}
    <div className="card p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Facility Information</h3>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <dt className="text-sm font-medium text-gray-500">Description</dt>
          <dd className="text-sm text-gray-900 mt-1">{facility.description}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Location</dt>
          <dd className="text-sm text-gray-900 mt-1">
            <div className="flex items-center">
              <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
              {facility.location?.address}
            </div>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Capacity</dt>
          <dd className="text-sm text-gray-900 mt-1">{facility.capacity} tonnes/year</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Technology</dt>
          <dd className="text-sm text-gray-900 mt-1">{facility.technology}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Status</dt>
          <dd className="text-sm text-gray-900 mt-1">
            <span className="badge-success">{facility.status}</span>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Active Since</dt>
          <dd className="text-sm text-gray-900 mt-1">
            {new Date(facility.created_at).getFullYear()}
          </dd>
        </div>
      </dl>
    </div>

    {/* Key Metrics Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="card p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-danger-50">
            <FireIcon className="h-6 w-6 text-danger-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Annual Emissions</p>
            <p className="text-2xl font-semibold text-gray-900">
              {(yearlyEmissions / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-gray-500">kgCO2e</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-primary-50">
            <BuildingOfficeIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Annual Production</p>
            <p className="text-2xl font-semibold text-gray-900">
              {(yearlyProduction / 1000).toFixed(0)}k
            </p>
            <p className="text-xs text-gray-500">tonnes</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-warning-50">
            <ChartBarIcon className="h-6 w-6 text-warning-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Carbon Intensity</p>
            <p className="text-2xl font-semibold text-gray-900">
              {carbonIntensity.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">kgCO2e/tonne</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-success-50">
            <ClipboardDocumentListIcon className="h-6 w-6 text-success-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Active Targets</p>
            <p className="text-2xl font-semibold text-gray-900">
              {facilityTargets.filter(t => t.status === 'active').length}
            </p>
            <p className="text-xs text-gray-500">targets</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Data Tab Component
const DataTab = ({ facility, emissions, production, resources, emissionData, onCalculatorConfigure, calculatorConfigs, navigate, location }) => {
  // Get month and year from URL parameters or use defaults
  const urlParams = new URLSearchParams(location.search);
  const [selectedMonth, setSelectedMonth] = useState(parseInt(urlParams.get('month')) || new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(parseInt(urlParams.get('year')) || new Date().getFullYear());
  const [consumptionData, setConsumptionData] = useState({});
  const [existingEmissionData, setExistingEmissionData] = useState({});
  const [productionValue, setProductionValue] = useState('');
  const [showIndustrialModal, setShowIndustrialModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Use the facility-specific data passed as props
  const facilityResourcesList = resources || [];
  const facilityEmissionData = emissionData || [];
  
  console.log('🔧 DataTab: Facility resources received:', facilityResourcesList);
  console.log('🔧 DataTab: Emission data received:', facilityEmissionData);
  
  // Transform facility assignments to match expected format
  // The facilityResourcesList contains raw assignment data from the API
  const transformedResources = facilityResourcesList.map(assignment => ({
    id: assignment.assignment_id, // Use assignment_id as the primary key
    assignment_id: assignment.assignment_id,
    resource_id: assignment.resource_id,
    resource_name: assignment.resource_name,
    category: assignment.category,
    scope: assignment.scope,
    emission_factor: assignment.emission_factor,
    emission_factor_unit: assignment.emission_factor_unit,
    heat_content: assignment.heat_content,
    heat_content_unit: assignment.heat_content_unit,
    library_name: assignment.library_name,
    library_year: assignment.library_year,
    // Add the original assignment for reference
    _originalAssignment: assignment
  }));

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Fetch emission data for selected month/year and prefill consumption data
  const fetchAndPrefillEmissionData = async (month, year) => {
    if (!facility?.id) return;
    
    setIsLoading(true);
    try {
      console.log(`🔄 Fetching emission data for ${facility.id}, month: ${month}, year: ${year}`);
      
      const response = await apiService.getEmissionData(facility.id, { month, year });
      
      if (response.success && response.data?.emissionData) {
        const monthYearData = response.data.emissionData;
        console.log('📊 Emission data for period:', monthYearData);
        
        // Store the existing emission data for reference
        const existingDataMap = {};
        const consumptionMap = {};
        
        monthYearData.forEach(data => {
          // The emission data has resource.name, we need to match it with facility assignments
          const emissionResourceName = data.resource?.name;
          
          if (!emissionResourceName) {
            console.log('⚠️  Emission data missing resource name:', data);
            return;
          }
          
          // Find matching facility resource assignment by resource name
          // facilityResourcesList contains the raw assignment data with resource_name field
          const matchingAssignment = facilityResourcesList.find(assignment => 
            assignment.resource_name === emissionResourceName
          );
          
          if (matchingAssignment) {
            // Use assignment_id as the key for mapping
            const assignmentId = matchingAssignment.assignment_id;
            
            // Check if this emission data belongs to this assignment
            // The emission data should have facilityConfigId that matches assignment_id
            if (data.facilityConfigId === assignmentId) {
              existingDataMap[assignmentId] = {
                ...data,
                facilityAssignmentId: assignmentId,
                facilityResourceId: assignmentId // This will be used for API calls
              };
              consumptionMap[assignmentId] = data.consumption;
              
              console.log(`✅ Mapped emission data for resource "${emissionResourceName}" (Assignment ID: ${assignmentId}):`, {
                consumption: data.consumption,
                totalEmissions: data.totalEmissions,
                facilityConfigId: data.facilityConfigId,
                assignmentDetails: matchingAssignment
              });
            } else {
              console.log(`⚠️  Emission data facilityConfigId (${data.facilityConfigId}) doesn't match assignment ID (${assignmentId}) for resource "${emissionResourceName}"`);
            }
          } else {
            console.log(`⚠️  No matching facility assignment found for emission resource "${emissionResourceName}"`);
            console.log('🔍 Available facility assignments:', facilityResourcesList.map(a => a.resource_name));
          }
        });
        
        setExistingEmissionData(existingDataMap);
        setConsumptionData(consumptionMap);
        
        console.log('🎯 Prefilled consumption data:', consumptionMap);
      } else {
        console.log('📋 No existing emission data found for this period');
        setExistingEmissionData({});
        setConsumptionData({});
      }
    } catch (error) {
      console.error('❌ Error fetching emission data:', error);
      setExistingEmissionData({});
      setConsumptionData({});
    } finally {
      setIsLoading(false);
    }
  };

  // Update URL when month/year changes
  const updateMonthYear = (month, year) => {
    const newParams = new URLSearchParams(location.search);
    newParams.set('tab', 'sustainability');
    newParams.set('subTab', 'data');
    newParams.set('month', month.toString());
    newParams.set('year', year.toString());
    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
  };

  // Sync state with URL parameters when location changes
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const monthFromUrl = parseInt(urlParams.get('month'));
    const yearFromUrl = parseInt(urlParams.get('year'));
    
    if (monthFromUrl && monthFromUrl !== selectedMonth && monthFromUrl >= 1 && monthFromUrl <= 12) {
      setSelectedMonth(monthFromUrl);
    }
    if (yearFromUrl && yearFromUrl !== selectedYear && yearFromUrl >= 2020 && yearFromUrl <= 2030) {
      setSelectedYear(yearFromUrl);
    }
  }, [location.search]);

  // Fetch data when month/year changes
  useEffect(() => {
    fetchAndPrefillEmissionData(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear, facility?.id]);
  
  // Helper functions for calculations (adapted for facility resources)
  const getResourceWithFactor = (assignmentId) => {
    // Find the resource by assignment_id (which is now our primary key)
    const facilityResource = transformedResources.find(r => 
      r.assignment_id === assignmentId || 
      r.id === assignmentId
    );
    return facilityResource || null;
  };

  const handleConsumptionChange = (resourceId, value) => {
    setConsumptionData(prev => ({
      ...prev,
      [resourceId]: parseFloat(value) || 0
    }));
  };

  const calculateEmissions = (resource, consumption) => {
    const factor = parseFloat(resource.emission_factor) || 0;
    if (!factor || !consumption) return 0;
    const result = parseFloat(consumption) * factor;
    return parseFloat(result) || 0;
  };

  const calculateHeatContent = (resource, consumption) => {
    const heatContent = parseFloat(resource.heat_content) || 0;
    if (!heatContent || !consumption) return 0;
    const result = parseFloat(consumption) * heatContent;
    return parseFloat(result) || 0;
  };

  // Get facility resources by category
  const getResourcesByCategory = (scope, category) => {
    const resources = transformedResources.filter(r => {
      const resourceScope = r.scope;
      const resourceCategory = r.category;
      
      return resourceScope === scope && 
             resourceCategory === category;
    });
    
    console.log(`🔍 getResourcesByCategory(${scope}, ${category}) found ${resources.length} resources:`, 
      resources.map(r => ({ name: r.resource_name, id: r.assignment_id }))
    );
    
    return resources;
  };

  // Save emission data (create or update)
  const saveEmissionData = async () => {
    if (!facility?.id) return;
    
    setIsSaving(true);
    try {
      console.log('💾 Saving emission data for consumption:', consumptionData);
      
      const savePromises = [];
      
      Object.entries(consumptionData).forEach(([assignmentId, consumption]) => {
        if (consumption && parseFloat(consumption) > 0) {
          const existingData = existingEmissionData[assignmentId];
          const resource = transformedResources.find(r => 
            r.assignment_id === assignmentId || r.id === assignmentId
          );
          
          if (!resource) {
            console.log(`⚠️  Resource assignment not found for ID: ${assignmentId}`);
            return;
          }
          
          if (existingData) {
            // Update existing record
            const updatePromise = apiService.updateEmissionData(existingData.id, {
              consumption: parseFloat(consumption),
              consumptionUnit: resource.emission_factor_unit || 'kg'
            });
            savePromises.push(updatePromise);
            console.log(`🔄 Updating existing record for ${resource.resource_name} (emission data ID: ${existingData.id})`);
          } else {
            // Create new record - need to check if we're using the new schema or old schema
            // For now, let's try with assignment_id as facilityResourceId (this might need backend adjustment)
            const createPromise = apiService.createEmissionData({
              facilityId: facility.id,
              facilityResourceId: assignmentId, // This might need to be adjusted based on backend schema
              month: selectedMonth,
              year: selectedYear,
              consumption: parseFloat(consumption),
              consumptionUnit: resource.emission_factor_unit || 'kg'
            });
            savePromises.push(createPromise);
            console.log(`➕ Creating new record for ${resource.resource_name} (assignment ID: ${assignmentId})`);
            console.log('🔍 Resource assignment object for debugging:', resource);
          }
        }
      });
      
      if (savePromises.length === 0) {
        alert('No data to save. Please enter consumption values.');
        return;
      }
      
      const results = await Promise.all(savePromises);
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      if (failed === 0) {
        alert(`✅ Successfully saved ${successful} emission records!`);
        // Refresh the data to show updated values
        await fetchAndPrefillEmissionData(selectedMonth, selectedYear);
      } else {
        alert(`⚠️ Saved ${successful} records, but ${failed} failed. Check console for details.`);
        results.forEach((result, index) => {
          if (!result.success) {
            console.error(`Failed to save record ${index}:`, result);
          }
        });
      }
      
    } catch (error) {
      console.error('❌ Error saving emission data:', error);
      alert('Failed to save emission data. Check console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleIndustrialProcessClick = () => {
    setShowIndustrialModal(true);
  };

  const handleSaveIndustrialData = (data) => {
    console.log('Industrial process data saved:', data);
    setShowIndustrialModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Month/Year Selection */}
      <div className="card p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Monthly Data Entry</h3>
            <p className="text-sm text-gray-500 mt-1">
              Enter consumption data by emission scope and category
            </p>
            {Object.keys(existingEmissionData).length > 0 && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-green-800 font-medium">
                    {Object.keys(existingEmissionData).length} resource(s) have existing data for {months[selectedMonth - 1]} {selectedYear}
                  </span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Fields with existing data are highlighted and will be updated when you save.
                </p>
              </div>
            )}
            
            {/* Debug information - remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md text-xs">
                <details>
                  <summary className="cursor-pointer text-blue-800 font-medium">Debug Information</summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <strong>Facility Resources:</strong> {facilityResourcesList.length} assignments
                    </div>
                    <div>
                      <strong>Transformed Resources:</strong> {transformedResources.length} resources
                    </div>
                    <div>
                      <strong>Existing Emission Data:</strong> {Object.keys(existingEmissionData).length} records
                    </div>
                    <div>
                      <strong>Consumption Data:</strong> {Object.keys(consumptionData).length} entries
                    </div>
                  </div>
                </details>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Period:</span>
            <select 
              className="input w-auto"
              value={selectedMonth}
              onChange={(e) => {
                const newMonth = parseInt(e.target.value);
                setSelectedMonth(newMonth);
                updateMonthYear(newMonth, selectedYear);
              }}
              disabled={isLoading}
            >
              {months.map((month, index) => (
                <option key={month} value={index + 1}>{month}</option>
              ))}
            </select>
            <select 
              className="input w-auto"
              value={selectedYear}
              onChange={(e) => {
                const newYear = parseInt(e.target.value);
                setSelectedYear(newYear);
                updateMonthYear(selectedMonth, newYear);
              }}
              disabled={isLoading}
            >
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
              <option value={2022}>2022</option>
            </select>
            {isLoading && (
              <div className="flex items-center text-sm text-gray-500">
                <div className="loading-spinner h-4 w-4 mr-2"></div>
                Loading data...
              </div>
            )}
            <button 
              className="btn-primary"
              onClick={saveEmissionData}
              disabled={isLoading || isSaving}
            >
              {isSaving ? (
                <>
                  <div className="loading-spinner h-4 w-4 mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save All Data'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Scope 1 Emissions */}
      <Scope1Section 
        getResourcesByCategory={getResourcesByCategory}
        consumptionData={consumptionData}
        existingEmissionData={existingEmissionData}
        handleConsumptionChange={handleConsumptionChange}
        calculateEmissions={calculateEmissions}
        calculateHeatContent={calculateHeatContent}
        onIndustrialProcessClick={handleIndustrialProcessClick}
      />

      {/* Scope 2 Emissions */}
      <Scope2Section 
        getResourcesByCategory={getResourcesByCategory}
        consumptionData={consumptionData}
        existingEmissionData={existingEmissionData}
        handleConsumptionChange={handleConsumptionChange}
        calculateEmissions={calculateEmissions}
        calculateHeatContent={calculateHeatContent}
      />

      {/* Production Data */}
      <ProductionDataSection 
        productionValue={productionValue}
        setProductionValue={setProductionValue}
      />

      {/* Industrial Process Modal */}
      <CementDataEntryModal
        isOpen={showIndustrialModal}
        onClose={() => setShowIndustrialModal(false)}
        onSave={handleSaveIndustrialData}
        month={months[selectedMonth - 1]}
        year={selectedYear}
        existingData={null}
      />
    </div>
  );
};

// Scope 1 Section Component
const Scope1Section = ({ 
  getResourcesByCategory, 
  consumptionData, 
  existingEmissionData,
  handleConsumptionChange, 
  calculateEmissions, 
  calculateHeatContent,
  onIndustrialProcessClick 
}) => {
  const categories = [
    { key: 'stationary_combustion', name: 'Stationary Combustion', color: 'red' },
    { key: 'mobile_combustion', name: 'Mobile Combustion', color: 'orange' },
    { key: 'industrial_process', name: 'Industrial Process', color: 'purple' },
    { key: 'fugitive_emissions', name: 'Fugitive Emissions', color: 'pink' }
  ];

  return (
    <div className="card p-6">
      <div className="flex items-center mb-6">
        <span className="inline-block w-4 h-4 bg-red-500 rounded-full mr-3"></span>
        <h3 className="text-xl font-semibold text-gray-900">Scope 1 Emissions</h3>
        <span className="ml-2 text-sm text-gray-500">(Direct emissions from owned sources)</span>
      </div>

      <div className="space-y-6">
        {categories.map(category => (
          <CategorySection 
            key={category.key}
            category={category}
            scope="scope1"
            resources={getResourcesByCategory('scope1', category.key)}
            consumptionData={consumptionData}
            existingEmissionData={existingEmissionData}
            handleConsumptionChange={handleConsumptionChange}
            calculateEmissions={calculateEmissions}
            calculateHeatContent={calculateHeatContent}
            onIndustrialProcessClick={category.key === 'industrial_process' ? onIndustrialProcessClick : null}
          />
        ))}
      </div>
    </div>
  );
};

// Scope 2 Section Component
const Scope2Section = ({ 
  getResourcesByCategory, 
  consumptionData, 
  existingEmissionData,
  handleConsumptionChange, 
  calculateEmissions, 
  calculateHeatContent 
}) => {
  const categories = [
    { key: 'purchased_electricity', name: 'Purchased Electricity', color: 'blue' },
    { key: 'renewable_energy', name: 'Renewable Energy', color: 'green' },
    { key: 'purchased_heat_steam', name: 'Purchased Heat & Steam', color: 'indigo' },
    { key: 'purchased_cooling', name: 'Purchased Cooling', color: 'cyan' }
  ];

  return (
    <div className="card p-6">
      <div className="flex items-center mb-6">
        <span className="inline-block w-4 h-4 bg-blue-500 rounded-full mr-3"></span>
        <h3 className="text-xl font-semibold text-gray-900">Scope 2 Emissions</h3>
        <span className="ml-2 text-sm text-gray-500">(Indirect emissions from purchased energy)</span>
      </div>

      <div className="space-y-6">
        {categories.map(category => (
          <CategorySection 
            key={category.key}
            category={category}
            scope="scope2"
            resources={getResourcesByCategory('scope2', category.key)}
            consumptionData={consumptionData}
            existingEmissionData={existingEmissionData}
            handleConsumptionChange={handleConsumptionChange}
            calculateEmissions={calculateEmissions}
            calculateHeatContent={calculateHeatContent}
          />
        ))}
      </div>
    </div>
  );
};

// Category Section Component
const CategorySection = ({ 
  category, 
  scope, 
  resources, 
  consumptionData, 
  existingEmissionData,
  handleConsumptionChange, 
  calculateEmissions, 
  calculateHeatContent,
  onIndustrialProcessClick 
}) => {
  const headerColorClasses = {
    red: 'bg-red-50 text-red-800',
    orange: 'bg-orange-50 text-orange-800',
    purple: 'bg-purple-50 text-purple-800',
    pink: 'bg-pink-50 text-pink-800',
    blue: 'bg-blue-50 text-blue-800',
    green: 'bg-green-50 text-green-800',
    indigo: 'bg-indigo-50 text-indigo-800',
    cyan: 'bg-cyan-50 text-cyan-800'
  };

  // Special handling for Industrial Process
  if (category.key === 'industrial_process') {
    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h4 className={`text-lg font-medium px-3 py-2 rounded ${headerColorClasses[category.color]}`}>
            {category.name}
          </h4>
          <button 
            onClick={onIndustrialProcessClick}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            Enter Clinker & Raw Material Data
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Click the button above to enter cement production data including clinkers, raw materials, and silicate sources.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <h4 className={`text-lg font-medium mb-4 px-3 py-2 rounded ${headerColorClasses[category.color]}`}>
        {category.name}
      </h4>
      
      {resources.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className={`border-b ${headerColorClasses[category.color]}`}>
                <th className="text-left py-3 px-3 font-medium">Resource</th>
                <th className="text-center py-3 px-3 font-medium">Consumption</th>
                <th className="text-center py-3 px-3 font-medium">Unit</th>
                <th className="text-center py-3 px-3 font-medium">Emission Factor</th>
                <th className="text-center py-3 px-3 font-medium">Heat Content</th>
                <th className="text-center py-3 px-3 font-medium">Total Emissions</th>
                <th className="text-center py-3 px-3 font-medium">Total Heat</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {resources.map((resource) => {
                const assignmentId = resource.assignment_id || resource.id;
                const resourceName = resource.resource_name || resource.name || 'Unknown Resource';
                // Direct access to flat data structure from API
                const factorValue = parseFloat(resource.emission_factor) || 0;
                const unit = resource.emission_factor_unit || 'N/A';
                const heatContentValue = parseFloat(resource.heat_content) || 0;
                const heatUnit = resource.heat_content_unit || 'GJ';
                
                const consumption = consumptionData[assignmentId] || 0;
                const emissions = calculateEmissions(resource, consumption);
                const heat = calculateHeatContent(resource, consumption);
                const hasExistingData = existingEmissionData[assignmentId];
                
                return (
                  <tr key={assignmentId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3 font-medium text-gray-900">
                      <div className="flex items-center">
                        {hasExistingData && (
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2" title="Has existing data"></div>
                        )}
                        {resourceName}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="relative">
                        <input 
                          type="number" 
                          className={`input w-24 text-center ${hasExistingData ? 'border-green-300 bg-green-50' : ''}`}
                          placeholder="0"
                          step="0.01"
                          value={consumption || ''}
                          onChange={(e) => handleConsumptionChange(assignmentId, e.target.value)}
                          title={hasExistingData ? `Existing data: ${hasExistingData.consumption}` : 'Enter consumption amount'}
                        />
                        {hasExistingData && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full text-white text-xs flex items-center justify-center">
                            ✓
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center text-gray-600">{unit}</td>
                    <td className="py-3 px-3 text-center text-gray-600">
                      {factorValue > 0 ? `${factorValue} ${unit}` : 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-center text-gray-600">
                      {heatContentValue > 0 ? `${heatContentValue} ${heatUnit}` : 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-red-600">
                      {emissions.toFixed(2)} kgCO2e
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-green-600">
                      {heat.toFixed(3)} GJ
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No resources configured for this category.</p>
          <p className="text-sm mt-1">Go to Settings → Emission Factor Inventory to configure resources.</p>
        </div>
      )}
    </div>
  );
};

// Production Data Section Component
const ProductionDataSection = ({ productionValue, setProductionValue }) => (
  <div className="card p-6">
    <div className="flex items-center mb-6">
      <span className="inline-block w-4 h-4 bg-green-500 rounded-full mr-3"></span>
      <h3 className="text-xl font-semibold text-gray-900">Production Data</h3>
      <span className="ml-2 text-sm text-gray-500">(Facility output data)</span>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cement Production
        </label>
        <input 
          type="number" 
          className="input"
          placeholder="Enter production amount"
          step="0.01"
          value={productionValue}
          onChange={(e) => setProductionValue(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Unit
        </label>
        <select className="input">
          <option>tonnes</option>
          <option>kg</option>
        </select>
      </div>
      <div className="flex items-end">
        <button className="btn-secondary w-full">Save Production Data</button>
      </div>
    </div>
  </div>
);

// Targets Tab Component
const TargetsTab = ({ facility, targets, loading }) => {
  const calculateProgress = (target) => {
    // Same calculation logic as in Targets.jsx
    if (!target || typeof target.baselineValue !== 'number' || typeof target.targetValue !== 'number' || 
        typeof target.baselineYear !== 'number' || typeof target.targetYear !== 'number') {
      return 0;
    }

    const currentYear = new Date().getFullYear();
    const totalYears = target.targetYear - target.baselineYear;
    const elapsedYears = currentYear - target.baselineYear;
    
    if (totalYears <= 0) {
      return target.baselineYear <= currentYear ? 100 : 0;
    }
    
    const timeProgress = Math.min(Math.max((elapsedYears / totalYears) * 100, 0), 100);
    const valueChange = target.baselineValue - target.targetValue;
    
    if (Math.abs(valueChange) < 0.001) {
      return timeProgress;
    }
    
    const mockCurrentValue = target.baselineValue - (valueChange * (timeProgress / 100) * 0.7);
    const actualChange = target.baselineValue - mockCurrentValue;
    const valueProgress = Math.abs(actualChange / valueChange) * 100;
    
    return Math.min(Math.max(valueProgress, 0), 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Facility Goals</h3>
        <button className="btn-primary">Create New Target</button>
      </div>
      
      {targets && targets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {targets.map((target) => {
            const progress = calculateProgress(target);
            return (
              <div key={target.id} className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">{target.name}</h4>
                  <span className={`badge-${target.status === 'active' ? 'info' : 'success'}`}>
                    {target.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{target.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Baseline ({target.baselineYear})</span>
                    <span className="font-medium">{target.baselineValue} {target.unit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Target ({target.targetYear})</span>
                    <span className="font-medium text-primary-600">
                      {target.targetValue} {target.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}% progress towards target</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 card">
          <ClipboardDocumentListIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No targets set</h3>
          <p className="text-gray-500 mb-6">Create sustainability targets to track progress</p>
          <button className="btn-primary">Create Your First Target</button>
        </div>
      )}
    </div>
  );
};

// Fuels Tab Component - now using the AI-driven DynamicAlternativeFuelsOptimizer
const FuelsTab = ({ facility }) => (
          <EnhancedAlternativeFuelsOptimizer facility={facility} />
);

// AI Recommendations Tab Component
const RecommendationsTab = ({ facility }) => {
  const recommendations = [
    {
      id: 1,
      type: 'Alternative Fuels',
      priority: 'High',
      title: 'Increase Biomass Usage',
      description: 'Switch 15% of coal to biomass to reduce emissions by 20%',
      impact: '20% emission reduction',
      cost: 'Cost neutral',
      timeline: '6-12 months',
      confidence: 85,
      aiGenerated: true,
      details: [
        'Regional biomass availability is high',
        'No significant kiln modifications required',
        'Proven technology with low risk',
        'Expected ROI within 18 months'
      ]
    },
    {
      id: 2,
      type: 'Energy Efficiency',
      priority: 'Medium',
      title: 'Waste Heat Recovery System',
      description: 'Install WHR system to capture waste heat from preheater',
      impact: '15% energy reduction',
      cost: '$2.5M investment',
      timeline: '12-18 months',
      confidence: 78,
      aiGenerated: true,
      details: [
        'Payback period: 3.5 years',
        '8-12% electricity cost savings',
        'Proven technology with high reliability',
        'Additional carbon credit opportunities'
      ]
    },
    {
      id: 3,
      type: 'Process Optimization',
      priority: 'Medium',
      title: 'Advanced Process Control',
      description: 'Implement AI-driven kiln optimization system',
      impact: '8% efficiency gain',
      cost: '$800K investment',
      timeline: '4-6 months',
      confidence: 92,
      aiGenerated: true,
      details: [
        'Real-time optimization of fuel mix',
        'Automated quality control',
        'Reduced operator dependency',
        'Quick implementation and ROI'
      ]
    },
    {
      id: 4,
      type: 'Raw Materials',
      priority: 'Low',
      title: 'Alternative Raw Materials',
      description: 'Introduce calcined clay to reduce clinker ratio',
      impact: '12% emission reduction',
      cost: 'Variable sourcing cost',
      timeline: '6-9 months',
      confidence: 65,
      aiGenerated: true,
      details: [
        'Local clay availability needs assessment',
        'Quality testing required',
        'Market acceptance to be validated',
        'Potential for significant long-term impact'
      ]
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600">
              <LightBulbIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                AI Recommendations for {facility.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                  <span className="text-xs text-purple-600 font-medium">AI POWERED</span>
                </div>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500">Last updated: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <button className="btn-secondary text-sm">
            Refresh Analysis
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Based on your facility data, operational patterns, and industry best practices, 
          our AI has identified personalized recommendations to improve sustainability performance.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {recommendations.map((rec) => (
            <div key={rec.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow relative">
              {/* AI Badge */}
              {rec.aiGenerated && (
                <div className="absolute top-4 right-4">
                  <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-100 to-blue-100 px-2 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
                    <span className="text-xs text-purple-700 font-medium">AI</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4 pr-12">
                <div>
                  <div className="flex items-center mb-2">
                    <span className={`badge-${getPriorityColor(rec.priority)} mr-2`}>
                      {rec.priority} Priority
                    </span>
                    <span className="text-sm text-gray-500">{rec.type}</span>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900">{rec.title}</h4>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Confidence</div>
                  <div className="text-lg font-bold text-primary-600">{rec.confidence}%</div>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{rec.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-500">Impact</div>
                  <div className="font-medium text-success-600">{rec.impact}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Investment</div>
                  <div className="font-medium text-gray-900">{rec.cost}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Timeline</div>
                  <div className="font-medium text-gray-900">{rec.timeline}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Type</div>
                  <div className="font-medium text-gray-900">{rec.type}</div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h5 className="font-medium text-gray-900 mb-2">Key Benefits</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {rec.details.map((detail, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex space-x-3">
                <button className="btn-primary flex-1">View Details</button>
                <button className="btn-secondary">Save for Later</button>
              </div>
            </div>
          ))}
        </div>
        
        {/* AI Insights Summary */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500">
              <LightBulbIcon className="h-5 w-5 text-white" />
            </div>
            <h4 className="text-lg font-medium text-gray-900">AI Analysis Summary</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">4</div>
              <div className="text-sm text-gray-600">Active Recommendations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">35%</div>
              <div className="text-sm text-gray-600">Potential Emission Reduction</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">$3.3M</div>
              <div className="text-sm text-gray-600">Total Investment Required</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-700">
            <strong>Priority Action:</strong> Focus on biomass adoption and waste heat recovery for maximum impact with minimal risk.
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityDetail;
