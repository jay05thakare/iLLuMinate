import { useState } from 'react';
import { useEmission } from '../../contexts/EmissionContext';
import { useFacility } from '../../contexts/FacilityContext';
import {
  CalendarIcon,
  FireIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useNotification } from '../../contexts/NotificationContext';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import apiService from '../../services/api';
import LoadingSpinner from '../ui/LoadingSpinner';

const EmissionDataForm = ({ facilityId, onClose, onSubmit, emissionData = null, mode = 'add' }) => {
  const { resources, factors } = useEmission();
  const { facilities } = useFacility();
  const { showSuccess, showError } = useNotification();
  const { handleError, clearError } = useErrorHandler();
  
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    facilityResourceId: '',
    consumption: '',
    consumptionUnit: 'tonnes',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [facilityResources, setFacilityResources] = useState([]);

  // Get available emission resources
  const emissionResources = mockData.emissionResources || [];
  const scope1Resources = emissionResources.filter(r => r.scope === 'scope1');
  const scope2Resources = emissionResources.filter(r => r.scope === 'scope2');

  const currentResources = formData.scope === 'scope1' ? scope1Resources : scope2Resources;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    // Auto-set consumption unit based on resource type
    if (name === 'resource_type') {
      const resource = currentResources.find(r => r.id === value);
      if (resource) {
        setFormData(prev => ({
          ...prev,
          consumption_unit: resource.default_unit || 'kg'
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.month || formData.month < 1 || formData.month > 12) {
      newErrors.month = 'Please select a valid month';
    }

    if (!formData.year || formData.year < 2020 || formData.year > new Date().getFullYear()) {
      newErrors.year = 'Please enter a valid year';
    }

    if (!formData.resource_type) {
      newErrors.resource_type = 'Please select a resource type';
    }

    if (!formData.consumption || parseFloat(formData.consumption) <= 0) {
      newErrors.consumption = 'Please enter a valid consumption amount';
    }

    if (!formData.consumption_unit) {
      newErrors.consumption_unit = 'Please select a consumption unit';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    clearError(); // Clear any previous errors
    
    try {
      const emissionDataPayload = {
        facilityId,
        facilityResourceId: formData.facilityResourceId,
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        consumption: parseFloat(formData.consumption),
        consumptionUnit: formData.consumptionUnit,
      };

      let response;
      if (mode === 'add') {
        response = await apiService.createEmissionData(emissionDataPayload);
      } else {
        response = await apiService.updateEmissionData(emissionData.id, {
          consumption: parseFloat(formData.consumption),
          consumptionUnit: formData.consumptionUnit,
        });
      }
      
      if (response.success) {
        showSuccess(
          `Emission data ${mode === 'add' ? 'created' : 'updated'} successfully`,
          { title: mode === 'add' ? 'Data Created' : 'Data Updated' }
        );
        onSubmit?.(response.data);
        onClose?.();
      } else {
        throw new Error(response.message || `Failed to ${mode} emission data`);
      }
    } catch (error) {
      handleError(error, { 
        context: `${mode === 'add' ? 'Creating' : 'Updating'} emission data`,
        facilityId,
        period: `${formData.year}-${formData.month}`
      });
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        setErrors({ submit: 'Emission data already exists for this period and resource.' });
      } else if (error.response?.status === 404) {
        setErrors({ submit: 'Facility resource configuration not found. Please configure resources first.' });
      } else if (error.response?.status === 422) {
        setErrors({ submit: 'Please check your input data.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-screen overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FireIcon className="h-5 w-5 mr-2 text-primary-600" />
              Add Emission Data
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          {errors.submit && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-md text-sm flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              {errors.submit}
            </div>
          )}

          {/* Period Selection */}
          <div>
            <label className="form-label flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              Reporting Period
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <select
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select Month</option>
                  {months.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                {errors.month && <p className="form-error">{errors.month}</p>}
              </div>
              <div>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  min="2020"
                  max={new Date().getFullYear()}
                  className="form-input"
                  placeholder="Year"
                />
                {errors.year && <p className="form-error">{errors.year}</p>}
              </div>
            </div>
          </div>

          {/* Scope Selection */}
          <div>
            <label className="form-label">Emission Scope</label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="scope"
                  value="scope1"
                  checked={formData.scope === 'scope1'}
                  onChange={handleChange}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900 flex items-center">
                    <FireIcon className="h-4 w-4 mr-1 text-danger-600" />
                    Scope 1
                  </div>
                  <div className="text-sm text-gray-500">Direct emissions</div>
                </div>
              </label>
              <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="scope"
                  value="scope2"
                  checked={formData.scope === 'scope2'}
                  onChange={handleChange}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900 flex items-center">
                    <BoltIcon className="h-4 w-4 mr-1 text-warning-600" />
                    Scope 2
                  </div>
                  <div className="text-sm text-gray-500">Indirect emissions</div>
                </div>
              </label>
            </div>
          </div>

          {/* Resource Type */}
          <div>
            <label className="form-label">Resource Type</label>
            <select
              name="resource_type"
              value={formData.resource_type}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Select Resource Type</option>
              {currentResources.map(resource => (
                <option key={resource.id} value={resource.id}>
                  {resource.name} ({resource.category})
                </option>
              ))}
            </select>
            {errors.resource_type && <p className="form-error">{errors.resource_type}</p>}
          </div>

          {/* Consumption */}
          <div>
            <label className="form-label">Consumption</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  name="consumption"
                  value={formData.consumption}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder="Amount"
                />
                {errors.consumption && <p className="form-error">{errors.consumption}</p>}
              </div>
              <div>
                <select
                  name="consumption_unit"
                  value={formData.consumption_unit}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Unit</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="tonnes">Tonnes</option>
                  <option value="m3">Cubic meters (m³)</option>
                  <option value="liters">Liters</option>
                  <option value="kWh">Kilowatt hours (kWh)</option>
                  <option value="MWh">Megawatt hours (MWh)</option>
                </select>
                {errors.consumption_unit && <p className="form-error">{errors.consumption_unit}</p>}
              </div>
            </div>
          </div>

          {/* Calculation Preview */}
          {formData.consumption && formData.resource_type && (
            <div className="bg-primary-50 border border-primary-200 rounded-md p-4">
              <div className="flex items-center mb-2">
                <CheckCircleIcon className="h-5 w-5 text-primary-600 mr-2" />
                <span className="font-medium text-primary-900">Calculated Emissions</span>
              </div>
              <div className="text-sm text-primary-800">
                <div className="flex justify-between">
                  <span>Consumption:</span>
                  <span>{formData.consumption} {formData.consumption_unit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Emission Factor:</span>
                  <span>2.5 kgCO2e/{formData.consumption_unit}</span>
                </div>
                <div className="flex justify-between font-medium mt-2 pt-2 border-t border-primary-200">
                  <span>Total Emissions:</span>
                  <span>{(parseFloat(formData.consumption || 0) * 2.5).toFixed(2)} kgCO2e</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary"
            >
              {loading ? (
                <>
                  <div className="loading-spinner h-4 w-4 mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Data'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmissionDataForm;
