import { useState } from 'react';
import { useFacility } from '../contexts/FacilityContext';
import { useEmission } from '../contexts/EmissionContext';
import EmissionDataForm from '../components/forms/EmissionDataForm';
import ProductionDataForm from '../components/forms/ProductionDataForm';
import {
  PlusIcon,
  FireIcon,
  ScaleIcon,
  ChartBarIcon,
  CalendarIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

const Emissions = () => {
  const { facilities, loading: facilitiesLoading } = useFacility();
  const { emissionResources: emissions } = useEmission();
  const production = []; // TODO: Add production context
  const loading = facilitiesLoading;
  const [showEmissionForm, setShowEmissionForm] = useState(false);
  const [showProductionForm, setShowProductionForm] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedScope, setSelectedScope] = useState('all');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  // Filter data based on selections
  const filteredEmissions = emissions.filter(e => {
    const facilityMatch = !selectedFacility || e.facility_id === selectedFacility;
    const yearMatch = e.year === selectedYear;
    const scopeMatch = selectedScope === 'all' || e.scope === selectedScope;
    return facilityMatch && yearMatch && scopeMatch;
  });

  const filteredProduction = production.filter(p => {
    const facilityMatch = !selectedFacility || p.facility_id === selectedFacility;
    const yearMatch = p.year === selectedYear;
    return facilityMatch && yearMatch;
  });

  // Calculate summary metrics
  const totalEmissions = filteredEmissions.reduce((sum, e) => sum + e.total_emissions, 0);
  const scope1Emissions = filteredEmissions
    .filter(e => e.scope === 'scope1')
    .reduce((sum, e) => sum + e.total_emissions, 0);
  const scope2Emissions = filteredEmissions
    .filter(e => e.scope === 'scope2')
    .reduce((sum, e) => sum + e.total_emissions, 0);
  const totalProduction = filteredProduction.reduce((sum, p) => sum + p.cement_production, 0);
  const carbonIntensity = totalProduction > 0 ? totalEmissions / totalProduction : 0;

  const years = [...new Set(emissions.map(e => e.year))].sort().reverse();

  const handleEmissionSubmit = (newEntry) => {
    console.log('New emission entry:', newEntry);
    // In real app, this would update the data context or make API call
  };

  const handleProductionSubmit = (newEntry) => {
    console.log('New production entry:', newEntry);
    // In real app, this would update the data context or make API call
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Emissions & Production Data</h1>
          <p className="text-gray-600">Track and manage your facility emissions and production data</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowProductionForm(true)}
            className="btn-secondary"
          >
            <ScaleIcon className="h-5 w-5 mr-2" />
            Add Production Data
          </button>
          <button
            onClick={() => setShowEmissionForm(true)}
            className="btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Emission Data
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex items-center space-x-4">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
            <div>
              <label className="form-label">Facility</label>
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="form-input"
              >
                <option value="">All Facilities</option>
                {facilities.map(facility => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="form-input"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Scope</label>
              <select
                value={selectedScope}
                onChange={(e) => setSelectedScope(e.target.value)}
                className="form-input"
              >
                <option value="all">All Scopes</option>
                <option value="scope1">Scope 1 (Direct)</option>
                <option value="scope2">Scope 2 (Indirect)</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedFacility('');
                  setSelectedYear(new Date().getFullYear());
                  setSelectedScope('all');
                }}
                className="btn-secondary w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-danger-50">
              <FireIcon className="h-6 w-6 text-danger-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Emissions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {(totalEmissions / 1000000).toFixed(2)}M
              </p>
              <p className="text-xs text-gray-500">kgCO2e</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-warning-50">
              <FireIcon className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Scope 1 Emissions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {(scope1Emissions / 1000000).toFixed(2)}M
              </p>
              <p className="text-xs text-gray-500">kgCO2e</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-primary-50">
              <ScaleIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Production</p>
              <p className="text-2xl font-semibold text-gray-900">
                {(totalProduction / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-gray-500">tonnes cement</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-success-50">
              <ChartBarIcon className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Carbon Intensity</p>
              <p className="text-2xl font-semibold text-gray-900">
                {carbonIntensity.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500">kgCO2e/tonne</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emissions Data */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Emission Entries</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Date</th>
                  <th className="table-header">Facility</th>
                  <th className="table-header">Scope</th>
                  <th className="table-header">Emissions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmissions.slice(0, 10).map((emission, index) => {
                  const facility = facilities.find(f => f.id === emission.facility_id);
                  return (
                    <tr key={index}>
                      <td className="table-cell">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                          {emission.month}/{emission.year}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="font-medium text-gray-900">{facility?.name}</div>
                      </td>
                      <td className="table-cell">
                        <span className={`badge-${emission.scope === 'scope1' ? 'danger' : 'warning'}`}>
                          {emission.scope.replace('scope', 'Scope ')}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="font-medium text-gray-900">
                          {(emission.total_emissions / 1000).toFixed(1)}k kgCO2e
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Production Data */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Production Entries</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Date</th>
                  <th className="table-header">Facility</th>
                  <th className="table-header">Production</th>
                  <th className="table-header">Intensity</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProduction.slice(0, 10).map((prod, index) => {
                  const facility = facilities.find(f => f.id === prod.facility_id);
                  const emissions = filteredEmissions.filter(e => 
                    e.facility_id === prod.facility_id && 
                    e.month === prod.month && 
                    e.year === prod.year
                  );
                  const totalEmissions = emissions.reduce((sum, e) => sum + e.total_emissions, 0);
                  const intensity = totalEmissions / prod.cement_production;
                  
                  return (
                    <tr key={index}>
                      <td className="table-cell">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                          {prod.month}/{prod.year}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="font-medium text-gray-900">{facility?.name}</div>
                      </td>
                      <td className="table-cell">
                        <div className="font-medium text-gray-900">
                          {(prod.cement_production / 1000).toFixed(1)}k tonnes
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="font-medium text-gray-900">
                          {intensity.toFixed(0)} kgCO2e/t
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEmissionForm && (
        <EmissionDataForm
          facilityId={selectedFacility}
          onClose={() => setShowEmissionForm(false)}
          onSubmit={handleEmissionSubmit}
        />
      )}

      {showProductionForm && (
        <ProductionDataForm
          facilityId={selectedFacility}
          onClose={() => setShowProductionForm(false)}
          onSubmit={handleProductionSubmit}
        />
      )}
    </div>
  );
};

export default Emissions;
