import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import CementCalculatorModal from '../components/modals/CementCalculatorModal';
import CementDataEntryModal from '../components/modals/CementDataEntryModal';
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
  const { facilities, emissions, production, targets, loading } = useData();
  const [activeTab, setActiveTab] = useState('profile');
  const [activeSubTab, setActiveSubTab] = useState('data');
  const [cementModalOpen, setCementModalOpen] = useState(false);
  const [selectedCalculator, setSelectedCalculator] = useState(null);
  const [calculatorConfigs, setCalculatorConfigs] = useState({});
  const [dataEntryModalOpen, setDataEntryModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [cementDataEntries, setCementDataEntries] = useState([]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  const facility = facilities.find(f => f.id === facilityId);
  
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

  // Get facility-specific data
  const facilityEmissions = emissions.filter(e => e.facility_id === facilityId);
  const facilityProduction = production.filter(p => p.facility_id === facilityId);
  const facilityTargets = targets.filter(t => t.facility_id === facilityId);

  // Calculate summary metrics
  const yearlyEmissions = facilityEmissions.reduce((sum, e) => sum + (e.total_emissions || 0), 0);
  const yearlyProduction = facilityProduction.reduce((sum, p) => sum + (p.cement_production || 0), 0);
  const carbonIntensity = yearlyProduction > 0 ? (yearlyEmissions / yearlyProduction) : 0;

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
          activeSubTab={activeSubTab}
          setActiveSubTab={setActiveSubTab}
          onCalculatorConfigure={handleCalculatorConfigure}
          calculatorConfigs={calculatorConfigs}
        />;
      case 'recommendations':
        return <RecommendationsTab facility={facility} />;
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
const SustainabilityTab = ({ facility, emissions, production, targets, activeSubTab, setActiveSubTab, onCalculatorConfigure, calculatorConfigs }) => {
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
          onCalculatorConfigure={onCalculatorConfigure}
          calculatorConfigs={calculatorConfigs}
        />;
      case 'goals':
        return <TargetsTab facility={facility} targets={targets} />;
      case 'fuels':
        return <FuelsTab facility={facility} />;
      default:
        return <DataTab 
          facility={facility} 
          emissions={emissions} 
          production={production} 
          onCalculatorConfigure={onCalculatorConfigure}
          calculatorConfigs={calculatorConfigs}
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
const ProfileTab = ({ facility, yearlyEmissions, yearlyProduction, carbonIntensity, facilityTargets }) => (
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
const DataTab = ({ facility, emissions, production, onCalculatorConfigure, calculatorConfigs }) => {
  const { mockData } = useData();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [consumptionData, setConsumptionData] = useState({});
  const [productionValue, setProductionValue] = useState('');
  const [showIndustrialModal, setShowIndustrialModal] = useState(false);
  
  // Get the comprehensive data structures
  const emissionResources = mockData.emissionResources || [];
  const emissionFactors = mockData.emissionFactors || [];
  const organizationResources = mockData.organizationResources || [];
  const facilityResources = mockData.facilityResources || [];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Helper functions for calculations (keeping existing logic)
  const getResourceWithFactor = (resourceId) => {
    const resource = emissionResources.find(r => r.id === resourceId);
    const factor = emissionFactors.find(ef => ef.resource_id === resourceId);
    return { ...resource, emissionFactor: factor };
  };

  const handleConsumptionChange = (resourceId, value) => {
    setConsumptionData(prev => ({
      ...prev,
      [resourceId]: parseFloat(value) || 0
    }));
  };

  const calculateEmissions = (resource, consumption) => {
    if (!resource.emissionFactor || !consumption) return 0;
    return (consumption * resource.emissionFactor.emission_factor) || 0;
  };

  const calculateHeatContent = (resource, consumption) => {
    if (!resource.emissionFactor || !consumption) return 0;
    return (consumption * (resource.emissionFactor.heat_content || 0)) || 0;
  };

  // Get resources by category for the new structure
  const getResourcesByCategory = (scope, category) => {
    return emissionResources.filter(r => 
      r.scope === scope && 
      r.category === category && 
      !r.is_calculator
    ).map(resource => getResourceWithFactor(resource.id));
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
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Period:</span>
            <select 
              className="input w-auto"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {months.map((month, index) => (
                <option key={month} value={index + 1}>{month}</option>
              ))}
            </select>
            <select 
              className="input w-auto"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
              <option value={2022}>2022</option>
            </select>
            <button className="btn-primary">Save All Data</button>
          </div>
        </div>
      </div>

      {/* Scope 1 Emissions */}
      <Scope1Section 
        getResourcesByCategory={getResourcesByCategory}
        consumptionData={consumptionData}
        handleConsumptionChange={handleConsumptionChange}
        calculateEmissions={calculateEmissions}
        calculateHeatContent={calculateHeatContent}
        onIndustrialProcessClick={handleIndustrialProcessClick}
      />

      {/* Scope 2 Emissions */}
      <Scope2Section 
        getResourcesByCategory={getResourcesByCategory}
        consumptionData={consumptionData}
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
                const consumption = consumptionData[resource.id] || 0;
                const emissions = calculateEmissions(resource, consumption);
                const heat = calculateHeatContent(resource, consumption);
                
                return (
                  <tr key={resource.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3 font-medium text-gray-900">{resource.resource_name}</td>
                    <td className="py-3 px-3 text-center">
                      <input 
                        type="number" 
                        className="input w-24 text-center"
                        placeholder="0"
                        step="0.01"
                        value={consumption || ''}
                        onChange={(e) => handleConsumptionChange(resource.id, e.target.value)}
                      />
                    </td>
                    <td className="py-3 px-3 text-center text-gray-600">{resource.unit}</td>
                    <td className="py-3 px-3 text-center text-gray-600">
                      {resource.emissionFactor ? 
                        `${resource.emissionFactor.emission_factor} ${resource.emissionFactor.emission_factor_unit}` : 
                        'N/A'
                      }
                    </td>
                    <td className="py-3 px-3 text-center text-gray-600">
                      {resource.emissionFactor && resource.emissionFactor.heat_content > 0 ? 
                        `${resource.emissionFactor.heat_content} ${resource.emissionFactor.heat_content_unit}` : 
                        'N/A'
                      }
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
const TargetsTab = ({ facility, targets }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium text-gray-900">Facility Goals</h3>
      <button className="btn-primary">Create New Target</button>
    </div>
    
    {targets.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {targets.map((target) => (
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
                <span className="text-gray-500">Baseline ({target.baseline_year})</span>
                <span className="font-medium">{target.baseline_value} {target.unit}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Target ({target.target_year})</span>
                <span className="font-medium text-primary-600">
                  {target.target_value} {target.unit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div className="bg-primary-600 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">45% progress towards target</p>
            </div>
          </div>
        ))}
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

// Fuels Tab Component
const FuelsTab = ({ facility }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium text-gray-900">AI-Powered Fuel Recommendations</h3>
      <button className="btn-primary">Get New Recommendations</button>
    </div>
    
    <div className="card p-6">
      <h4 className="text-lg font-medium text-gray-900 mb-4">Optimization Preferences</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-4 border border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50">
          <div className="text-center">
            <div className="text-2xl mb-2">💰</div>
            <div className="font-medium">Cost Optimization</div>
            <div className="text-sm text-gray-500 mt-1">Minimize fuel costs</div>
          </div>
        </button>
        <button className="p-4 border border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50">
          <div className="text-center">
            <div className="text-2xl mb-2">🌱</div>
            <div className="font-medium">Carbon Reduction</div>
            <div className="text-sm text-gray-500 mt-1">Lower emissions priority</div>
          </div>
        </button>
        <button className="p-4 border border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50">
          <div className="text-center">
            <div className="text-2xl mb-2">⚖️</div>
            <div className="font-medium">Balanced Approach</div>
            <div className="text-sm text-gray-500 mt-1">Cost and environmental balance</div>
          </div>
        </button>
      </div>
    </div>

    <div className="card p-6">
      <h4 className="text-lg font-medium text-gray-900 mb-4">Current Fuel Mix</h4>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
            <span className="font-medium">Coal</span>
          </div>
          <span className="text-gray-600">65%</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
            <span className="font-medium">Natural Gas</span>
          </div>
          <span className="text-gray-600">25%</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <span className="font-medium">Alternative Fuels</span>
          </div>
          <span className="text-gray-600">10%</span>
        </div>
      </div>
    </div>

    <div className="card p-6">
      <h4 className="text-lg font-medium text-gray-900 mb-4">AI Recommendations</h4>
      <div className="space-y-4">
        <div className="border border-green-200 bg-green-50 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-green-600 mr-3 mt-1">✓</div>
            <div>
              <h5 className="font-medium text-green-900">Biomass Integration Opportunity</h5>
              <p className="text-sm text-green-700 mt-1">
                Replace 15% of coal with biomass waste. Estimated 12% emissions reduction and 8% cost savings.
              </p>
              <button className="mt-3 text-sm bg-green-600 text-white px-3 py-1 rounded">
                Learn More
              </button>
            </div>
          </div>
        </div>
        
        <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-blue-600 mr-3 mt-1">💡</div>
            <div>
              <h5 className="font-medium text-blue-900">Waste Heat Recovery</h5>
              <p className="text-sm text-blue-700 mt-1">
                Install waste heat recovery system. Potential 20% energy efficiency improvement.
              </p>
              <button className="mt-3 text-sm bg-blue-600 text-white px-3 py-1 rounded">
                Get Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
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
