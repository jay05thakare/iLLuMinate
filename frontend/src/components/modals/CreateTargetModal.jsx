import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const CreateTargetModal = ({ isOpen, onClose, onSave, facilities }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goalType: 'absolute',
    metric: 'total_emissions',
    selectedResource: '',
    assignedFacilities: [],
    baseYear: new Date().getFullYear() - 1,
    baseValue: '',
    targetYear: new Date().getFullYear() + 6,
    targetType: 'reduce_by_percent',
    targetValue: '',
    isGeneratingAI: false,
    aiSuggestedTargetYear: null,
    aiSuggestedTargetValue: null,
    aiSuggestedReasoning: '',
    aiActionItems: [],
  });

  const [errors, setErrors] = useState({});
  const [showAISuggestions, setShowAISuggestions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        goalType: 'absolute',
        metric: 'total_emissions',
        selectedResource: '',
        assignedFacilities: [],
        baseYear: new Date().getFullYear() - 1,
        baseValue: '',
        targetYear: new Date().getFullYear() + 6,
        targetType: 'reduce_by_percent',
        targetValue: '',
        isGeneratingAI: false,
        aiSuggestedTargetYear: null,
        aiSuggestedTargetValue: null,
        aiSuggestedReasoning: '',
        aiActionItems: [],
      });
      setErrors({});
      setShowAISuggestions(false);
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updatedData = { ...prev, [field]: value };
      return updatedData;
    });
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Effect to auto-trigger AI suggestions when key fields are filled
  useEffect(() => {
    if (formData.name.trim() && formData.goalType && formData.metric) {
      if (!showAISuggestions && !formData.isGeneratingAI) {
        const timer = setTimeout(() => {
          generateAISuggestions();
        }, 1000); // 1 second delay to avoid excessive triggering while typing
        
        return () => clearTimeout(timer);
      }
    }
  }, [formData.name, formData.goalType, formData.metric, showAISuggestions, formData.isGeneratingAI]);

  const handleFacilityToggle = (facilityId, checked) => {
    const updatedFacilities = checked
      ? [...formData.assignedFacilities, facilityId]
      : formData.assignedFacilities.filter(id => id !== facilityId);
    handleInputChange('assignedFacilities', updatedFacilities);
  };

  const generateAISuggestions = async () => {
    setFormData(prev => ({ ...prev, isGeneratingAI: true }));
    setShowAISuggestions(true);

    await new Promise(resolve => setTimeout(resolve, 2500));

    // Analyze target name and description to provide intelligent suggestions
    const targetName = formData.name.toLowerCase();
    const targetDescription = formData.description.toLowerCase();
    const currentYear = new Date().getFullYear();
    
    let suggestedYear, suggestedValue, reasoning, actionItems;

    // Intelligent analysis based on target name/description patterns
    if (targetName.includes('net zero') || targetName.includes('carbon neutral')) {
      suggestedYear = 2030; // Industry standard for net zero commitments
      suggestedValue = formData.targetType.includes('percent') ? '100' : '0';
      reasoning = `Net zero commitments align with global climate goals and the Paris Agreement. Industry leaders typically target 2030 for ambitious reductions, with cement companies like HeidelbergCement and Holcim setting similar timelines. Your current baseline allows for aggressive action through alternative fuels (50%+), renewable energy adoption, and carbon capture technologies.`;
      actionItems = [
        'Increase alternative fuel co-processing to 60% by 2028',
        'Install 100MW+ renewable energy capacity across facilities',
        'Implement carbon capture, utilization and storage (CCUS) pilot',
        'Optimize clinker substitution with SCMs to 50%',
        'Establish green hydrogen production for high-temperature processes'
      ];
    } else if (targetName.includes('carbon intensity') || targetDescription.includes('intensity')) {
      suggestedYear = currentYear + 5;
      suggestedValue = formData.targetType.includes('percent') ? '35' : '550';
      reasoning = `Carbon intensity targets of 35% reduction by ${currentYear + 5} align with Science-Based Targets initiative (SBTi) guidelines for cement industry. Leading companies like LafargeHolcim have achieved 20-30% reductions. This target positions you in top quartile performance while remaining technically and economically feasible.`;
      actionItems = [
        'Deploy alternative fuels to achieve 40% thermal substitution rate',
        'Implement energy efficiency measures (waste heat recovery)',
        'Increase use of supplementary cementitious materials (SCMs)',
        'Optimize kiln operations with advanced process control',
        'Develop local renewable energy supply contracts'
      ];
    } else if (targetName.includes('energy') || formData.metric.includes('energy')) {
      suggestedYear = currentYear + 4;
      suggestedValue = formData.targetType.includes('percent') ? '25' : '800';
      reasoning = `Energy efficiency improvements of 25% over 4 years follow IEA Technology Roadmap for cement industry. Best-in-class facilities achieve 3.2-3.5 GJ/tonne cement. This target leverages proven technologies while allowing gradual implementation across your facility portfolio.`;
      actionItems = [
        'Install waste heat recovery systems (WHR) in all kilns',
        'Upgrade to high-efficiency motors and variable frequency drives',
        'Implement predictive maintenance to optimize equipment efficiency',
        'Deploy real-time energy monitoring and management systems',
        'Optimize grinding operations with high-pressure grinding rolls'
      ];
    } else if (targetDescription.includes('scope 1') || formData.metric === 'scope1_emissions') {
      suggestedYear = currentYear + 6;
      suggestedValue = formData.targetType.includes('percent') ? '40' : '750000';
      reasoning = `Scope 1 emissions reductions of 40% by ${currentYear + 6} align with cement industry decarbonization pathways. This timeline allows for capital-intensive improvements like kiln modifications, alternative fuel infrastructure, and process optimization while maintaining operational excellence.`;
      actionItems = [
        'Scale alternative fuel usage to 50% thermal substitution',
        'Implement process modifications for alternative raw materials',
        'Deploy advanced combustion optimization technologies',
        'Establish waste-derived fuel supply chain partnerships',
        'Pilot novel cement chemistries with lower process emissions'
      ];
    } else {
      // Default intelligent suggestions
      suggestedYear = currentYear + 5;
      suggestedValue = formData.targetType.includes('percent') ? '30' : '650000';
      reasoning = `Based on your target "${formData.name}", a 5-year timeline provides optimal balance between ambition and feasibility. Industry benchmarking shows leading cement companies achieving 25-35% reductions through systematic implementation of proven technologies and operational improvements.`;
      actionItems = [
        'Develop comprehensive alternative fuels strategy',
        'Implement energy efficiency optimization program',
        'Enhance use of supplementary cementitious materials',
        'Deploy digital technologies for process optimization',
        'Establish renewable energy procurement strategy'
      ];
    }

    // Adjust suggestions based on goal type and metric
    if (formData.goalType === 'intensity') {
      reasoning += ` Intensity-based targets are preferred for cement industry as they account for production variations while driving operational improvements.`;
    }

    if (formData.baseValue && parseFloat(formData.baseValue) > 0) {
      const baseValue = parseFloat(formData.baseValue);
      if (formData.targetType.includes('percent')) {
        const reduction = parseFloat(suggestedValue);
        const absoluteTarget = baseValue * (1 - reduction / 100);
        reasoning += ` Starting from your baseline of ${baseValue.toLocaleString()} ${getMetricUnit(formData.metric)}, this represents a target of ${absoluteTarget.toLocaleString()} ${getMetricUnit(formData.metric)}.`;
      }
    }

    const mockSuggestions = {
      aiSuggestedTargetYear: suggestedYear,
      aiSuggestedTargetValue: suggestedValue,
      aiSuggestedReasoning: reasoning,
      aiActionItems: actionItems
    };

    setFormData(prev => ({ ...prev, ...mockSuggestions, isGeneratingAI: false }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Target name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.assignedFacilities.length === 0) newErrors.assignedFacilities = 'At least one facility must be assigned';
    if (!formData.baseValue.trim() || isNaN(parseFloat(formData.baseValue))) newErrors.baseValue = 'Base value must be a valid number';
    if (!formData.targetValue.trim() || isNaN(parseFloat(formData.targetValue))) newErrors.targetValue = 'Target value must be a valid number';
    if (formData.metric === 'resource_level' && !formData.selectedResource) newErrors.selectedResource = 'Resource must be selected';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    const targetData = {
      ...formData,
      id: `target-${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      progress: 0,
      baseline_value: parseFloat(formData.baseValue),
      target_value: parseFloat(formData.targetValue),
      goals: formData.assignedFacilities.map(facilityId => {
        const facility = facilities.find(f => f.id === facilityId);
        return {
          id: `goal-${facilityId}-${Date.now()}`,
          targetId: `target-${Date.now()}`,
          facilityId,
          facility_name: facility?.name || 'Unknown',
          target_name: formData.name,
          status: 'active',
          progress: 0,
          baseline_value: parseFloat(formData.baseValue),
          target_value: parseFloat(formData.targetValue),
          current_value: parseFloat(formData.baseValue) * 0.85, // Mock current value (85% of baseline)
          createdAt: new Date().toISOString()
        };
      })
    };
    
    onSave(targetData);
  };

  const getMetricUnit = (metric) => {
    switch (metric) {
      case 'total_emissions':
      case 'scope1_emissions':
      case 'scope2_emissions':
        return 'tonnes CO2e';
      case 'total_energy':
        return 'GJ';
      case 'carbon_intensity':
        return 'kgCO2e/tonne cement';
      case 'energy_intensity':
        return 'MJ/tonne cement';
      case 'resource_level':
        return 'units';
      default:
        return '';
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 31 }, (_, i) => currentYear - 5 + i);
  const targetYears = Array.from({ length: 27 }, (_, i) => currentYear + 3 + i);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Create Sustainability Target</h2>
              <p className="text-sm text-gray-600 mt-1">Define an organization-level target that creates goals for assigned facilities</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Net Zero Emissions by 2030"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the target objectives and scope..."
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>
            </div>

            {/* Goal Type and Metric */}
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Type *
                </label>
                <select
                  value={formData.goalType}
                  onChange={(e) => handleInputChange('goalType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="absolute">Absolute (Total values)</option>
                  <option value="intensity">Intensity (Per unit production)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metric *
                </label>
                <select
                  value={formData.metric}
                  onChange={(e) => handleInputChange('metric', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="total_emissions">Total Emissions (Scope 1 + 2)</option>
                  <option value="scope1_emissions">Scope 1 Emissions</option>
                  <option value="scope2_emissions">Scope 2 Emissions</option>
                  <option value="total_energy">Total Energy Consumption</option>
                  <option value="carbon_intensity">Carbon Intensity</option>
                  <option value="energy_intensity">Energy Intensity</option>
                  <option value="resource_level">Resource Level Emissions</option>
                </select>
              </div>

              {formData.metric === 'resource_level' && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Resource *
                  </label>
                  <select
                    value={formData.selectedResource}
                    onChange={(e) => handleInputChange('selectedResource', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.selectedResource ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">-- Select a resource --</option>
                    <option value="natural_gas">Natural Gas</option>
                    <option value="coal">Coal</option>
                    <option value="electricity">Electricity</option>
                    <option value="biomass">Biomass</option>
                    <option value="waste_fuels">Waste Fuels</option>
                  </select>
                  {errors.selectedResource && <p className="text-red-500 text-xs mt-1">{errors.selectedResource}</p>}
                </div>
              )}
            </div>

            {/* AI Suggestions Section - Auto-triggered when name, goalType, and metric are filled */}
            {(showAISuggestions) && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex items-center mb-3">
                  <SparklesIcon className="h-5 w-5 text-purple-500 mr-2" />
                  <h3 className="text-sm font-medium text-gray-900">
                    AI-Powered Target Suggestions
                  </h3>
                  {formData.isGeneratingAI && (
                    <div className="ml-auto flex items-center text-xs text-purple-600">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600 mr-2"></div>
                      Analyzing...
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {formData.isGeneratingAI ? (
                    <div className="flex items-center text-sm text-gray-600 py-4">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-3"></div>
                      Analyzing "{formData.name}" based on industry best practices and sustainability frameworks...
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-md border border-purple-200">
                          <p className="text-xs font-medium text-gray-700 mb-1">AI Suggested Target Year:</p>
                          <p className="text-lg text-purple-700 font-bold">{formData.aiSuggestedTargetYear}</p>
                        </div>
                        <div className="bg-white p-3 rounded-md border border-purple-200">
                          <p className="text-xs font-medium text-gray-700 mb-1">AI Suggested Target Value:</p>
                          <p className="text-lg text-purple-700 font-bold">
                            {formData.aiSuggestedTargetValue} {formData.targetType.includes('percent') ? '%' : getMetricUnit(formData.metric)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-white p-3 rounded-md border border-blue-200">
                        <p className="text-xs font-medium text-gray-700 mb-2">AI Reasoning:</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{formData.aiSuggestedReasoning}</p>
                      </div>

                      <div className="bg-white p-3 rounded-md border border-green-200">
                        <p className="text-xs font-medium text-gray-700 mb-2">Recommended Action Items:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {formData.aiActionItems.map((item, index) => (
                            <li key={index} className="flex items-start">
                              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => {
                            handleInputChange('targetYear', formData.aiSuggestedTargetYear);
                            handleInputChange('targetValue', formData.aiSuggestedTargetValue);
                          }}
                          className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
                        >
                          Apply AI Suggestions
                        </button>
                        <button
                          onClick={() => setShowAISuggestions(false)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Facility Assignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Assign to Facilities *
              </label>
              {errors.assignedFacilities && <p className="text-red-500 text-xs mb-2">{errors.assignedFacilities}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {facilities.map(facility => (
                  <div key={facility.id} className="flex items-start p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                    <input
                      type="checkbox"
                      id={`facility-${facility.id}`}
                      checked={formData.assignedFacilities.includes(facility.id)}
                      onChange={(e) => handleFacilityToggle(facility.id, e.target.checked)}
                      className="mt-1 mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <label htmlFor={`facility-${facility.id}`} className="text-sm font-medium text-gray-900 cursor-pointer">
                        {facility.name}
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        {facility.location.city}, {facility.location.country}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Base Year, Target Year and Base Value */}
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Year *
                </label>
                <select
                  value={formData.baseYear}
                  onChange={(e) => handleInputChange('baseYear', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Value * ({getMetricUnit(formData.metric)})
                </label>
                <input
                  type="number"
                  value={formData.baseValue}
                  onChange={(e) => handleInputChange('baseValue', e.target.value)}
                  placeholder="e.g., 125000"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.baseValue ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.baseValue && <p className="text-red-500 text-xs mt-1">{errors.baseValue}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Year *
                </label>
                <select
                  value={formData.targetYear}
                  onChange={(e) => handleInputChange('targetYear', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {targetYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Target Action and Value */}
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Action *
                </label>
                <select
                  value={formData.targetType}
                  onChange={(e) => handleInputChange('targetType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="reduce_by_percent">Reduce by Percentage (%)</option>
                  <option value="reduce_to_number">Reduce to Absolute Value</option>
                  <option value="increase_by_percent">Increase by Percentage (%)</option>
                  <option value="increase_to_number">Increase to Absolute Value</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Value * ({formData.targetType.includes('percent') ? '%' : getMetricUnit(formData.metric)})
                </label>
                <input
                  type="number"
                  value={formData.targetValue}
                  onChange={(e) => handleInputChange('targetValue', e.target.value)}
                  placeholder={formData.targetType.includes('percent') ? 'e.g., 50' : 'e.g., 75000'}
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.targetValue ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.targetValue && <p className="text-red-500 text-xs mt-1">{errors.targetValue}</p>}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Target & Goals
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTargetModal;
