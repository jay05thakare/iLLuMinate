import { useState } from 'react';
import {
  CalendarIcon,
  ScaleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useNotification } from '../../contexts/NotificationContext';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import apiService from '../../services/api';
import LoadingSpinner from '../ui/LoadingSpinner';

const ProductionDataForm = ({ facilityId, onClose, onSubmit }) => {
  const { showSuccess, showError } = useNotification();
  const { handleError, clearError } = useErrorHandler();
  
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    cementProduction: '',
    unit: 'tonnes',
    clinkerProduction: '',
    alternativeFuelsPercentage: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
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

    if (!formData.cementProduction || parseFloat(formData.cementProduction) <= 0) {
      newErrors.cementProduction = 'Please enter a valid production amount';
    }

    if (formData.clinkerProduction && parseFloat(formData.clinkerProduction) < 0) {
      newErrors.clinkerProduction = 'Clinker production cannot be negative';
    }

    if (formData.alternativeFuelsPercentage && 
        (parseFloat(formData.alternativeFuelsPercentage) < 0 || 
         parseFloat(formData.alternativeFuelsPercentage) > 100)) {
      newErrors.alternativeFuelsPercentage = 'Percentage must be between 0 and 100';
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
      const productionData = {
        facilityId,
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        cementProduction: parseFloat(formData.cementProduction),
        unit: formData.unit,
        clinkerProduction: formData.clinkerProduction ? parseFloat(formData.clinkerProduction) : null,
        alternativeFuelsPercentage: formData.alternativeFuelsPercentage ? 
          parseFloat(formData.alternativeFuelsPercentage) : null,
        notes: formData.notes || null,
      };

      const response = await apiService.createProductionData(productionData);
      
      if (response.success) {
        showSuccess(
          'Production data saved successfully',
          { title: 'Data Saved' }
        );
        onSubmit?.(response.data);
        onClose?.();
      } else {
        throw new Error(response.message || 'Failed to save production data');
      }
    } catch (error) {
      handleError(error, { 
        context: 'Creating production data',
        facilityId,
        period: `${formData.year}-${formData.month}`
      });
      
      // If it's a validation error from the backend, show specific field errors
      if (error.response?.status === 409) {
        setErrors({ submit: 'Production data already exists for this period.' });
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
              <ScaleIcon className="h-5 w-5 mr-2 text-primary-600" />
              Add Production Data
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

          {/* Cement Production */}
          <div>
            <label className="form-label">Cement Production *</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  name="cementProduction"
                  value={formData.cementProduction}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder="Amount"
                />
                {errors.cementProduction && <p className="form-error">{errors.cementProduction}</p>}
              </div>
              <div>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="tonnes">Tonnes</option>
                  <option value="kg">Kilograms</option>
                  <option value="million_tonnes">Million Tonnes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Clinker Production (Optional) */}
          <div>
            <label className="form-label">
              Clinker Production
              <span className="text-gray-500 font-normal"> (Optional)</span>
            </label>
            <input
              type="number"
              name="clinkerProduction"
              value={formData.clinkerProduction}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="form-input"
              placeholder="Clinker production in tonnes"
            />
            {errors.clinkerProduction && <p className="form-error">{errors.clinkerProduction}</p>}
          </div>

          {/* Alternative Fuels Percentage */}
          <div>
            <label className="form-label">
              Alternative Fuels Usage
              <span className="text-gray-500 font-normal"> (Optional)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="alternativeFuelsPercentage"
                value={formData.alternativeFuelsPercentage}
                onChange={handleChange}
                step="0.1"
                min="0"
                max="100"
                className="form-input pr-8"
                placeholder="Percentage of alternative fuels used"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
            {errors.alternativeFuelsPercentage && (
              <p className="form-error">{errors.alternativeFuelsPercentage}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="form-label">
              Notes
              <span className="text-gray-500 font-normal"> (Optional)</span>
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="form-input"
              placeholder="Additional notes about this production period..."
            />
          </div>

          {/* Production Summary */}
          {formData.cement_production && (
            <div className="bg-success-50 border border-success-200 rounded-md p-4">
              <div className="flex items-center mb-2">
                <CheckCircleIcon className="h-5 w-5 text-success-600 mr-2" />
                <span className="font-medium text-success-900">Production Summary</span>
              </div>
              <div className="text-sm text-success-800">
                <div className="flex justify-between">
                  <span>Cement Production:</span>
                  <span>{formData.cement_production} {formData.unit}</span>
                </div>
                {formData.clinker_production && (
                  <div className="flex justify-between">
                    <span>Clinker Production:</span>
                    <span>{formData.clinker_production} tonnes</span>
                  </div>
                )}
                {formData.alternative_fuels_percentage && (
                  <div className="flex justify-between">
                    <span>Alternative Fuels:</span>
                    <span>{formData.alternative_fuels_percentage}%</span>
                  </div>
                )}
                <div className="flex justify-between font-medium mt-2 pt-2 border-t border-success-200">
                  <span>Reporting Period:</span>
                  <span>{months.find(m => m.value == formData.month)?.label} {formData.year}</span>
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
                  <LoadingSpinner size="sm" variant="white" />
                  <span className="ml-2">Saving...</span>
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

export default ProductionDataForm;
