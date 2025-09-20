import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  BeakerIcon,
  CubeIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';

const CementCalculatorModal = ({ isOpen, onClose, calculatorName, onSave, initialConfig = null }) => {
  console.log('CementCalculatorModal rendered with:', { isOpen, calculatorName, initialConfig });
  
  const [config, setConfig] = useState({
    production_lines: [],
    clinkers: [],
    raw_materials: [],
    silicate_sources: []
  });

  // Initialize with existing config if provided
  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    } else {
      // Reset to empty state when opening for new configuration
      setConfig({
        production_lines: [],
        clinkers: [],
        raw_materials: [],
        silicate_sources: []
      });
    }
  }, [initialConfig, isOpen]);

  // Add new production line
  const addProductionLine = () => {
    const newLine = {
      id: `prod-line-${Date.now()}`,
      name: '',
      capacity: '',
      unit: 'tonnes/day'
    };
    setConfig(prev => ({
      ...prev,
      production_lines: [...prev.production_lines, newLine]
    }));
  };

  // Add new clinker
  const addClinker = () => {
    const newClinker = {
      id: `clinker-${Date.now()}`,
      name: '',
      type: 'ordinary_portland',
      lime_saturation_factor: '',
      silica_modulus: '',
      alumina_modulus: ''
    };
    setConfig(prev => ({
      ...prev,
      clinkers: [...prev.clinkers, newClinker]
    }));
  };

  // Add new raw material
  const addRawMaterial = () => {
    const newMaterial = {
      id: `raw-material-${Date.now()}`,
      name: '',
      type: 'limestone',
      cao_content: '',
      sio2_content: '',
      al2o3_content: '',
      fe2o3_content: ''
    };
    setConfig(prev => ({
      ...prev,
      raw_materials: [...prev.raw_materials, newMaterial]
    }));
  };

  // Add new silicate source
  const addSilicateSource = () => {
    const newSilicate = {
      id: `silicate-${Date.now()}`,
      name: '',
      type: 'clay',
      sio2_content: '',
      al2o3_content: '',
      fe2o3_content: ''
    };
    setConfig(prev => ({
      ...prev,
      silicate_sources: [...prev.silicate_sources, newSilicate]
    }));
  };

  // Remove item from any category
  const removeItem = (category, itemId) => {
    setConfig(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item.id !== itemId)
    }));
  };

  // Update item in any category
  const updateItem = (category, itemId, field, value) => {
    setConfig(prev => ({
      ...prev,
      [category]: prev[category].map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  // Handle save
  const handleSave = () => {
    // Validate that we have at least some configuration
    const hasConfig = config.production_lines.length > 0 || 
                     config.clinkers.length > 0 || 
                     config.raw_materials.length > 0 || 
                     config.silicate_sources.length > 0;
    
    if (!hasConfig) {
      alert('Please add at least one production line, clinker, raw material, or silicate source.');
      return;
    }

    onSave && onSave(config);
    onClose();
  };

  if (!isOpen) {
    console.log('Modal not open, returning null');
    return null;
  }
  
  console.log('Modal is open, rendering modal');

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Configure {calculatorName}</h3>
            <p className="text-sm text-gray-600">Set up your cement production parameters</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto space-y-6">
          {/* Cement Production Lines */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <BuildingOffice2Icon className="h-5 w-5 text-orange-600 mr-2" />
                <h4 className="font-medium text-gray-900">Cement Production Lines</h4>
              </div>
              <button
                onClick={addProductionLine}
                className="btn-secondary text-sm flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Production Line
              </button>
            </div>
            
            {config.production_lines.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No production lines configured</p>
            ) : (
              <div className="space-y-3">
                {config.production_lines.map((line) => (
                  <div key={line.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                    <input
                      type="text"
                      placeholder="Production line name"
                      className="input flex-1"
                      value={line.name}
                      onChange={(e) => updateItem('production_lines', line.id, 'name', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Capacity"
                      className="input w-24"
                      value={line.capacity}
                      onChange={(e) => updateItem('production_lines', line.id, 'capacity', e.target.value)}
                    />
                    <select
                      className="input w-32"
                      value={line.unit}
                      onChange={(e) => updateItem('production_lines', line.id, 'unit', e.target.value)}
                    >
                      <option value="tonnes/day">tonnes/day</option>
                      <option value="tonnes/hour">tonnes/hour</option>
                    </select>
                    <button
                      onClick={() => removeItem('production_lines', line.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Clinkers */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <CubeIcon className="h-5 w-5 text-gray-600 mr-2" />
                <h4 className="font-medium text-gray-900">Clinkers</h4>
              </div>
              <button
                onClick={addClinker}
                className="btn-secondary text-sm flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Clinker
              </button>
            </div>
            
            {config.clinkers.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No clinkers configured</p>
            ) : (
              <div className="space-y-3">
                {config.clinkers.map((clinker) => (
                  <div key={clinker.id} className="p-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-3 mb-3">
                      <input
                        type="text"
                        placeholder="Clinker name"
                        className="input flex-1"
                        value={clinker.name}
                        onChange={(e) => updateItem('clinkers', clinker.id, 'name', e.target.value)}
                      />
                      <select
                        className="input w-40"
                        value={clinker.type}
                        onChange={(e) => updateItem('clinkers', clinker.id, 'type', e.target.value)}
                      >
                        <option value="ordinary_portland">Ordinary Portland</option>
                        <option value="rapid_hardening">Rapid Hardening</option>
                        <option value="low_heat">Low Heat</option>
                        <option value="sulfate_resistant">Sulfate Resistant</option>
                      </select>
                      <button
                        onClick={() => removeItem('clinkers', clinker.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="number"
                        placeholder="LSF (%)"
                        className="input"
                        value={clinker.lime_saturation_factor}
                        onChange={(e) => updateItem('clinkers', clinker.id, 'lime_saturation_factor', e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Silica Modulus"
                        className="input"
                        value={clinker.silica_modulus}
                        onChange={(e) => updateItem('clinkers', clinker.id, 'silica_modulus', e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Alumina Modulus"
                        className="input"
                        value={clinker.alumina_modulus}
                        onChange={(e) => updateItem('clinkers', clinker.id, 'alumina_modulus', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Raw Materials */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <BeakerIcon className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-gray-900">Raw Materials</h4>
              </div>
              <button
                onClick={addRawMaterial}
                className="btn-secondary text-sm flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Raw Material
              </button>
            </div>
            
            {config.raw_materials.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No raw materials configured</p>
            ) : (
              <div className="space-y-3">
                {config.raw_materials.map((material) => (
                  <div key={material.id} className="p-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-3 mb-3">
                      <input
                        type="text"
                        placeholder="Raw material name"
                        className="input flex-1"
                        value={material.name}
                        onChange={(e) => updateItem('raw_materials', material.id, 'name', e.target.value)}
                      />
                      <select
                        className="input w-32"
                        value={material.type}
                        onChange={(e) => updateItem('raw_materials', material.id, 'type', e.target.value)}
                      >
                        <option value="limestone">Limestone</option>
                        <option value="marl">Marl</option>
                        <option value="chalk">Chalk</option>
                        <option value="clay">Clay</option>
                        <option value="shale">Shale</option>
                        <option value="iron_ore">Iron Ore</option>
                        <option value="sand">Sand</option>
                      </select>
                      <button
                        onClick={() => removeItem('raw_materials', material.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <input
                        type="number"
                        placeholder="CaO (%)"
                        className="input"
                        value={material.cao_content}
                        onChange={(e) => updateItem('raw_materials', material.id, 'cao_content', e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="SiO2 (%)"
                        className="input"
                        value={material.sio2_content}
                        onChange={(e) => updateItem('raw_materials', material.id, 'sio2_content', e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Al2O3 (%)"
                        className="input"
                        value={material.al2o3_content}
                        onChange={(e) => updateItem('raw_materials', material.id, 'al2o3_content', e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Fe2O3 (%)"
                        className="input"
                        value={material.fe2o3_content}
                        onChange={(e) => updateItem('raw_materials', material.id, 'fe2o3_content', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Silicate Sources */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <BeakerIcon className="h-5 w-5 text-green-600 mr-2" />
                <h4 className="font-medium text-gray-900">Silicate Source Raw Materials</h4>
              </div>
              <button
                onClick={addSilicateSource}
                className="btn-secondary text-sm flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Silicate Source
              </button>
            </div>
            
            {config.silicate_sources.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No silicate sources configured</p>
            ) : (
              <div className="space-y-3">
                {config.silicate_sources.map((silicate) => (
                  <div key={silicate.id} className="p-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-3 mb-3">
                      <input
                        type="text"
                        placeholder="Silicate source name"
                        className="input flex-1"
                        value={silicate.name}
                        onChange={(e) => updateItem('silicate_sources', silicate.id, 'name', e.target.value)}
                      />
                      <select
                        className="input w-32"
                        value={silicate.type}
                        onChange={(e) => updateItem('silicate_sources', silicate.id, 'type', e.target.value)}
                      >
                        <option value="clay">Clay</option>
                        <option value="shale">Shale</option>
                        <option value="flyash">Fly Ash</option>
                        <option value="silica_sand">Silica Sand</option>
                        <option value="slag">Slag</option>
                      </select>
                      <button
                        onClick={() => removeItem('silicate_sources', silicate.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="number"
                        placeholder="SiO2 (%)"
                        className="input"
                        value={silicate.sio2_content}
                        onChange={(e) => updateItem('silicate_sources', silicate.id, 'sio2_content', e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Al2O3 (%)"
                        className="input"
                        value={silicate.al2o3_content}
                        onChange={(e) => updateItem('silicate_sources', silicate.id, 'al2o3_content', e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Fe2O3 (%)"
                        className="input"
                        value={silicate.fe2o3_content}
                        onChange={(e) => updateItem('silicate_sources', silicate.id, 'fe2o3_content', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default CementCalculatorModal;
