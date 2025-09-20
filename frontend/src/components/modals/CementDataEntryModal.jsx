import { useState, useEffect } from 'react';
import { calculateCementEmissions, formatNumber } from '../../utils/cementCalculations';

const CementDataEntryModal = ({ isOpen, onClose, onSave, month, year, existingData }) => {
  const [activeTab, setActiveTab] = useState('calculate');
  const [formData, setFormData] = useState({
    // Processed Materials (Clinkers)
    processedMaterials: [],
    // Raw Materials  
    rawMaterials: [],
    // Silicate Source Raw Materials
    silicateRawMaterials: []
  });
  const [calculationResults, setCalculationResults] = useState(null);
  const [errors, setErrors] = useState([]);

  // Initialize form data
  useEffect(() => {
    if (existingData) {
      setFormData(existingData);
    } else {
      // Initialize with empty structures
      setFormData({
        processedMaterials: [
          { name: '', value: '', caoContent: '', mgoContent: '' }
        ],
        rawMaterials: [
          { name: '', value: '', caoContent: '', mgoContent: '' }
        ],
        silicateRawMaterials: [
          { name: '', value: '', caContent: '', mgContent: '' }
        ]
      });
    }
  }, [existingData, isOpen]);

  // Calculate emissions when form data changes
  useEffect(() => {
    if (activeTab === 'summary') {
      calculateEmissions();
    }
  }, [formData, activeTab]);

  const calculateEmissions = () => {
    try {
      const entries = [];
      
      // Add processed materials (clinkers)
      formData.processedMaterials.forEach((material, index) => {
        if (material.value) {
          // Total clinker production
          entries.push({
            type: 'processed_material',
            value: parseFloat(material.value) || 0,
            name: material.name || `Clinker ${index + 1}`
          });
          
          // CaO content in clinker
          if (material.caoContent) {
            entries.push({
              type: 'processed_material',
              value: parseFloat(material.caoContent) || 0,
              materialValue: parseFloat(material.value) || 0,
              attribute: 'CaO content (incl. free lime)',
              name: material.name || `Clinker ${index + 1}`
            });
          }
          
          // MgO content in clinker
          if (material.mgoContent) {
            entries.push({
              type: 'processed_material',
              value: parseFloat(material.mgoContent) || 0,
              materialValue: parseFloat(material.value) || 0,
              attribute: 'MgO content',
              name: material.name || `Clinker ${index + 1}`
            });
          }
        }
      });

      // Add raw materials
      formData.rawMaterials.forEach((material, index) => {
        if (material.value) {
          // CaO content in raw materials
          if (material.caoContent) {
            entries.push({
              type: 'raw_material',
              value: parseFloat(material.caoContent) || 0,
              materialValue: parseFloat(material.value) || 0,
              attribute: 'CaO content',
              name: material.name || `Raw Material ${index + 1}`
            });
          }
          
          // MgO content in raw materials
          if (material.mgoContent) {
            entries.push({
              type: 'raw_material',
              value: parseFloat(material.mgoContent) || 0,
              materialValue: parseFloat(material.value) || 0,
              attribute: 'MgO content',
              name: material.name || `Raw Material ${index + 1}`
            });
          }
        }
      });

      // Add silicate raw materials
      formData.silicateRawMaterials.forEach((material, index) => {
        if (material.value) {
          // Ca content in silicate materials
          if (material.caContent) {
            entries.push({
              type: 'silicate_raw_material',
              value: parseFloat(material.caContent) || 0,
              materialValue: parseFloat(material.value) || 0,
              attribute: 'Ca content of Ca-Silicate raw materials',
              name: material.name || `Silicate Material ${index + 1}`
            });
          }
          
          // Mg content in silicate materials
          if (material.mgContent) {
            entries.push({
              type: 'silicate_raw_material',
              value: parseFloat(material.mgContent) || 0,
              materialValue: parseFloat(material.value) || 0,
              attribute: 'Mg content of Mg-Silicate raw materials',
              name: material.name || `Silicate Material ${index + 1}`
            });
          }
        }
      });

      const results = calculateCementEmissions(entries);
      setCalculationResults(results);
      setErrors([]);
    } catch (error) {
      console.error('Calculation error:', error);
      setErrors(['Error in emission calculations. Please check your input values.']);
      setCalculationResults(null);
    }
  };

  const updateMaterialField = (section, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };


  const handleSave = () => {
    if (calculationResults) {
      const dataToSave = {
        month,
        year,
        formData,
        calculationResults,
        timestamp: new Date().toISOString()
      };
      onSave(dataToSave);
      onClose();
    } else {
      setErrors(['Please calculate emissions first by going to the Summary tab.']);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Cement Production Data Entry
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {month} {year} - Industrial Process Emissions Calculator
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Tabs */}
          <div className="mt-4">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('calculate')}
                className={`inline-block text-base font-medium py-2 px-1 border-b-2 ${
                  activeTab === 'calculate'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-blue-600 hover:border-blue-300'
                }`}
              >
                Calculate
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`inline-block text-base font-medium py-2 px-1 border-b-2 ${
                  activeTab === 'summary'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-blue-600 hover:border-blue-300'
                }`}
              >
                Summary
              </button>
            </nav>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'calculate' && (
            <CalculateTab
              formData={formData}
              updateMaterialField={updateMaterialField}
              errors={errors}
            />
          )}
          
          {activeTab === 'summary' && (
            <SummaryTab
              calculationResults={calculationResults}
              errors={errors}
            />
          )}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!calculationResults}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Save Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Calculate Tab Component
const CalculateTab = ({ formData, updateMaterialField, errors }) => {
  return (
    <div className="space-y-8">
      {/* Error Display */}
      {errors.length > 0 && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-600">
            <ul className="space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Clinkers Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Clinkers</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-r border-gray-200">
                  Clinkers
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-r border-gray-200">
                  Clinker produced (tons)
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-r border-gray-200">
                  CaO content (incl. free lime) (%)
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-200">
                  MgO content (%)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {formData.processedMaterials.map((material, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="bg-gray-100 px-3 py-2 rounded text-sm text-gray-700">
                      {material.name || `Clinker ${index + 1}`}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center border-r border-gray-200">
                    <div className="flex items-center justify-center">
                      <input
                        type="number"
                        placeholder="+"
                        value={material.value || ''}
                        onChange={(e) => updateMaterialField('processedMaterials', index, 'value', e.target.value)}
                        className="w-20 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-500">tons</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center border-r border-gray-200">
                    <div className="flex items-center justify-center">
                      <input
                        type="number"
                        placeholder="+"
                        value={material.caoContent || ''}
                        onChange={(e) => updateMaterialField('processedMaterials', index, 'caoContent', e.target.value)}
                        className="w-20 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-500">%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                      <input
                        type="number"
                        placeholder="+"
                        value={material.mgoContent || ''}
                        onChange={(e) => updateMaterialField('processedMaterials', index, 'mgoContent', e.target.value)}
                        className="w-20 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-500">%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
      </div>

      {/* Raw Materials Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Raw Materials (tons)</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-r border-gray-200">
                  Raw Materials
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-r border-gray-200">
                  non-carbonate source in raw material consumed
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-r border-gray-200">
                  CaO content (%)
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-200">
                  MgO content (%)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {formData.rawMaterials.map((material, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="bg-gray-100 px-3 py-2 rounded text-sm text-gray-700">
                      {material.name || `Raw Material ${index + 1}`}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center border-r border-gray-200">
                    <div className="flex items-center justify-center">
                      <input
                        type="number"
                        placeholder="+"
                        value={material.value || ''}
                        onChange={(e) => updateMaterialField('rawMaterials', index, 'value', e.target.value)}
                        className="w-20 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-500">tons</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center border-r border-gray-200">
                    <div className="flex items-center justify-center">
                      <input
                        type="number"
                        placeholder="+"
                        value={material.caoContent || ''}
                        onChange={(e) => updateMaterialField('rawMaterials', index, 'caoContent', e.target.value)}
                        className="w-20 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-500">%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                      <input
                        type="number"
                        placeholder="+"
                        value={material.mgoContent || ''}
                        onChange={(e) => updateMaterialField('rawMaterials', index, 'mgoContent', e.target.value)}
                        className="w-20 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-500">%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
      </div>

      {/* Silicate Source Raw Materials Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Silicate source raw material (tons)</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-r border-gray-200">
                  Silicate Materials
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-r border-gray-200">
                  Ca/Mg-silicate source Raw material consumed
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-r border-gray-200">
                  Ca content of Ca-Silicate raw materials (%)
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-200">
                  Mg content of Mg-Silicate raw materials (%)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {formData.silicateRawMaterials.map((material, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="bg-gray-100 px-3 py-2 rounded text-sm text-gray-700">
                      {material.name || `SRM ${index + 1}`}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center border-r border-gray-200">
                    <div className="flex items-center justify-center">
                      <input
                        type="number"
                        placeholder="+"
                        value={material.value || ''}
                        onChange={(e) => updateMaterialField('silicateRawMaterials', index, 'value', e.target.value)}
                        className="w-20 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-500">tons</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center border-r border-gray-200">
                    <div className="flex items-center justify-center">
                      <input
                        type="number"
                        placeholder="+"
                        value={material.caContent || ''}
                        onChange={(e) => updateMaterialField('silicateRawMaterials', index, 'caContent', e.target.value)}
                        className="w-20 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-500">%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                      <input
                        type="number"
                        placeholder="+"
                        value={material.mgContent || ''}
                        onChange={(e) => updateMaterialField('silicateRawMaterials', index, 'mgContent', e.target.value)}
                        className="w-20 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-500">%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
      </div>
    </div>
  );
};


// Summary Tab Component
const SummaryTab = ({ calculationResults, errors }) => {
  if (errors.length > 0) {
    return (
      <div className="text-center py-8">
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-600">
            <ul className="space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (!calculationResults) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-700 font-bold">
          No Data Available for summary
        </div>
        <p className="text-gray-500 mt-2">
          Please fill in the Calculate tab first to see emission calculations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SummaryCard
          title="Uncorrected Emissions"
          value={formatNumber(calculationResults.uncorrectedCo2Emissions)}
          unit="tonnes CO2"
          description="Total CO2 emissions from clinker production before corrections"
        />
        
        <SummaryCard
          title="Correction for Non-carbonate Sources"
          value={formatNumber(calculationResults.correctionForNonCarbonateSource)}
          unit="tonnes CO2"
          description="CO2 corrections for non-carbonate calcium and magnesium sources"
        />
        
        <SummaryCard
          title="Correction for Silicate Sources"
          value={formatNumber(calculationResults.correctionForSilicateSource)}
          unit="tonnes CO2"
          description="CO2 corrections for silicate-based calcium and magnesium sources"
        />
        
        <SummaryCard
          title="Corrected Direct Emissions"
          value={formatNumber(calculationResults.correctedDirectCo2Emissions)}
          unit="tonnes CO2"
          description="Final CO2 emissions after all corrections applied"
          highlight={true}
        />
        
        <SummaryCard
          title="Uncorrected Calcination Factor"
          value={formatNumber(calculationResults.uncorrectedCalcinationFactor)}
          unit="tonnes CO2/tonne clinker"
          description="Emission factor per tonne of clinker before corrections"
        />
        
        <SummaryCard
          title="Corrected Calcination Factor"
          value={formatNumber(calculationResults.correctedCalcinationFactor)}
          unit="tonnes CO2/tonne clinker"
          description="Final emission factor per tonne of clinker after corrections"
          highlight={true}
        />
      </div>
    </div>
  );
};

// Summary Card Component
const SummaryCard = ({ title, value, unit, description, highlight = false }) => {
  return (
    <div className={`border rounded-lg p-6 shadow-sm ${
      highlight ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
    }`}>
      <dt className="text-sm font-medium text-gray-500 truncate">
        {title} ({unit})
      </dt>
      <dd className={`mt-1 text-3xl font-semibold tracking-tight ${
        highlight ? 'text-blue-900' : 'text-gray-900'
      }`}>
        {value}
      </dd>
      <p className="text-xs text-gray-600 mt-2">{description}</p>
    </div>
  );
};

export default CementDataEntryModal;
