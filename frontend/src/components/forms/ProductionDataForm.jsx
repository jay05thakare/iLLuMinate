import { useState } from 'react';
import {
  CalendarIcon,
  ScaleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const ProductionDataForm = ({ facilityId, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    cement_production: '',
    unit: 'tonnes',
    clinker_production: '',
    alternative_fuels_percentage: '',
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

    if (!formData.cement_production || parseFloat(formData.cement_production) <= 0) {
      newErrors.cement_production = 'Please enter a valid production amount';
    }

    if (formData.clinker_production && parseFloat(formData.clinker_production) < 0) {
      newErrors.clinker_production = 'Clinker production cannot be negative';
    }

    if (formData.alternative_fuels_percentage && 
        (parseFloat(formData.alternative_fuels_percentage) < 0 || 
         parseFloat(formData.alternative_fuels_percentage) > 100)) {
      newErrors.alternative_fuels_percentage = 'Percentage must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newEntry = {
        id: `production-${Date.now()}`,
        facility_id: facilityId,
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        cement_production: parseFloat(formData.cement_production),
        unit: formData.unit,
        clinker_production: formData.clinker_production ? parseFloat(formData.clinker_production) : null,
        alternative_fuels_percentage: formData.alternative_fuels_percentage ? 
          parseFloat(formData.alternative_fuels_percentage) : null,
        notes: formData.notes,
        created_at: new Date().toISOString(),
      };

      onSubmit?.(newEntry);
      onClose?.();
    } catch (error) {
      setErrors({ submit: 'Failed to save production data. Please try again.' });
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
                  name="cement_production"
                  value={formData.cement_production}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder="Amount"
                />
                {errors.cement_production && <p className="form-error">{errors.cement_production}</p>}
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
              name="clinker_production"
              value={formData.clinker_production}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="form-input"
              placeholder="Clinker production in tonnes"
            />
            {errors.clinker_production && <p className="form-error">{errors.clinker_production}</p>}
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
                name="alternative_fuels_percentage"
                value={formData.alternative_fuels_percentage}
                onChange={handleChange}
                step="0.1"
                min="0"
                max="100"
                className="form-input pr-8"
                placeholder="Percentage of alternative fuels used"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
            {errors.alternative_fuels_percentage && (
              <p className="form-error">{errors.alternative_fuels_percentage}</p>
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

export default ProductionDataForm;
