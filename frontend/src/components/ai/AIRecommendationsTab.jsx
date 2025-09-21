import React, { useState, useEffect } from 'react';
import { 
  LightBulbIcon, 
  ArrowPathIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  FireIcon,
  CogIcon,
  BeakerIcon,
  ComputerDesktopIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import apiService from '../../services/api';

const AIRecommendationsTab = ({ facility }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFocusAreas, setSelectedFocusAreas] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const focusAreaOptions = [
    { id: 'Alternative Fuels', label: 'Alternative Fuels', icon: FireIcon },
    { id: 'Energy Efficiency', label: 'Energy Efficiency', icon: ChartBarIcon },
    { id: 'Process Optimization', label: 'Process Optimization', icon: CogIcon },
    { id: 'Raw Materials', label: 'Raw Materials', icon: BeakerIcon },
    { id: 'Digital Technology', label: 'Digital Technology', icon: ComputerDesktopIcon },
    { id: 'Waste Management', label: 'Waste Management', icon: TrashIcon }
  ];

  const categoryIcons = {
    'Alternative Fuels': FireIcon,
    'Energy Efficiency': ChartBarIcon,
    'Process Optimization': CogIcon,
    'Raw Materials': BeakerIcon,
    'Digital Technology': ComputerDesktopIcon,
    'Waste Management': TrashIcon
  };

  const loadingStages = [
    { text: "Connecting to facility data systems...", icon: CogIcon, duration: 1000 },
    { text: "Analyzing emission patterns and consumption...", icon: ChartBarIcon, duration: 2000 },
    { text: "Reviewing sustainability targets...", icon: CheckCircleIcon, duration: 1500 },
    { text: "Consulting industry best practices...", icon: LightBulbIcon, duration: 2000 },
    { text: "Processing AI recommendations...", icon: BeakerIcon, duration: 3000 },
    { text: "Finalizing implementation strategies...", icon: ArrowPathIcon, duration: 1500 }
  ];

  useEffect(() => {
    if (facility?.id) {
      generateRecommendations();
    }
  }, [facility?.id]);

  // Loading animation effect
  useEffect(() => {
    if (loading) {
      setLoadingStage(0);
      setLoadingProgress(0);
      
      let currentStage = 0;
      let currentProgress = 0;
      const totalDuration = loadingStages.reduce((sum, stage) => sum + stage.duration, 0);
      let elapsed = 0;

      const interval = setInterval(() => {
        elapsed += 50;
        
        // Calculate which stage we should be in
        let stageElapsed = 0;
        let newStage = 0;
        for (let i = 0; i < loadingStages.length; i++) {
          if (elapsed <= stageElapsed + loadingStages[i].duration) {
            newStage = i;
            break;
          }
          stageElapsed += loadingStages[i].duration;
        }
        
        // Update progress
        const overallProgress = Math.min((elapsed / totalDuration) * 100, 95); // Cap at 95% until actual completion
        
        setLoadingStage(newStage);
        setLoadingProgress(overallProgress);
        
        // Stop when loading is complete or we've cycled through all stages
        if (!loading || elapsed >= totalDuration) {
          clearInterval(interval);
        }
      }, 50);

      return () => clearInterval(interval);
    } else {
      setLoadingProgress(100);
    }
  }, [loading]);

  const generateRecommendations = async (refreshing = false) => {
    if (!facility?.id) return;

    setLoading(!refreshing);
    setIsRefreshing(refreshing);
    setError(null);

    try {
      const response = await apiService.generateFacilityRecommendations(
        facility.id, 
        selectedFocusAreas.length > 0 ? selectedFocusAreas : null
      );

      if (response.success) {
        setRecommendations(response.data.recommendations || []);
        setLastUpdated(response.data.generated_at);
      } else {
        throw new Error(response.message || 'Failed to generate recommendations');
      }
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setError(err.message || 'Failed to generate AI recommendations');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefreshRecommendations = () => {
    generateRecommendations(true);
  };

  const handleFocusAreaChange = (focusAreaId) => {
    setSelectedFocusAreas(prev => {
      const newAreas = prev.includes(focusAreaId)
        ? prev.filter(id => id !== focusAreaId)
        : [...prev, focusAreaId];
      return newAreas;
    });
  };

  const applyFocusFilters = () => {
    generateRecommendations();
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'gray';
    }
  };

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    if (typeof value === 'string') return value;
    
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    } else {
      return `$${value.toLocaleString()}`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    const CurrentIcon = loadingStages[loadingStage]?.icon || LightBulbIcon;
    
    return (
      <div className="space-y-6">
        <div className="card p-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center max-w-md">
              {/* Animated Icon */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-purple-500 rounded-full opacity-20 animate-pulse"></div>
                <CurrentIcon className="h-16 w-16 text-purple-600 mx-auto relative z-10 animate-bounce" />
              </div>
              
              {/* Main Title */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Generating AI Recommendations
              </h3>
              
              {/* Dynamic Status Text */}
              <p className="text-gray-600 mb-6 min-h-[3rem] flex items-center justify-center">
                {loadingStages[loadingStage]?.text || "Analyzing facility data..."}
              </p>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out relative"
                  style={{ width: `${loadingProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white opacity-30 rounded-full animate-pulse"></div>
                </div>
              </div>
              
              {/* Progress Percentage */}
              <p className="text-sm text-gray-500 mb-6">
                {Math.round(loadingProgress)}% Complete
              </p>
              
              {/* Stage Indicators */}
              <div className="flex justify-center space-x-2">
                {loadingStages.map((stage, index) => {
                  const StageIcon = stage.icon;
                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
                        index < loadingStage ? 'bg-green-500 text-white' :
                        index === loadingStage ? 'bg-purple-500 text-white animate-pulse' :
                        'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <StageIcon className="w-4 h-4" />
                    </div>
                  );
                })}
              </div>
              
              {/* Facility Name */}
              <p className="text-xs text-gray-400 mt-4">
                Processing: {facility?.name || 'Facility'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="card p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Failed to Generate Recommendations
              </h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <button 
                onClick={() => generateRecommendations()}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
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
                <span className="text-xs text-gray-500">
                  Last updated: {formatDate(lastUpdated)}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={handleRefreshRecommendations}
            disabled={isRefreshing}
            className="btn-secondary text-sm flex items-center space-x-2"
          >
            <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Analysis'}</span>
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Based on your facility data, operational patterns, and industry best practices, 
          our AI has identified personalized recommendations to improve sustainability performance.
        </p>

        {/* Focus Areas Filter */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Focus Areas (Optional)</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {focusAreaOptions.map((area) => {
              const IconComponent = area.icon;
              const isSelected = selectedFocusAreas.includes(area.id);
              
              return (
                <button
                  key={area.id}
                  onClick={() => handleFocusAreaChange(area.id)}
                  className={`
                    inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all
                    ${isSelected 
                      ? 'bg-purple-100 text-purple-800 border border-purple-300' 
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                    }
                  `}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {area.label}
                </button>
              );
            })}
          </div>
          {selectedFocusAreas.length > 0 && (
            <button
              onClick={applyFocusFilters}
              className="btn-primary btn-sm"
            >
              Apply Focus Filters
            </button>
          )}
        </div>
      </div>

      {/* Recommendations Grid */}
      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {recommendations.map((rec) => {
            const CategoryIcon = categoryIcons[rec.category] || LightBulbIcon;
            
            return (
              <div key={rec.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow relative bg-white">
                {/* AI Badge */}
                <div className="absolute top-4 right-4">
                  <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-100 to-blue-100 px-2 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
                    <span className="text-xs text-purple-700 font-medium">AI</span>
                  </div>
                </div>
                
                <div className="flex items-start justify-between mb-4 pr-12">
                  <div>
                    <div className="flex items-center mb-2">
                      <span className={`badge-${getPriorityColor(rec.priority)} mr-2`}>
                        {rec.priority} Priority
                      </span>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <CategoryIcon className="h-4 w-4" />
                        <span>{rec.category}</span>
                      </div>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900">{rec.title}</h4>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Confidence</div>
                    <div className="text-lg font-bold text-primary-600">{rec.confidence_score}%</div>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{rec.description}</p>

                {/* Cement Process & Alternative Fuel Details */}
                <div className="space-y-3 mb-4">
                  {rec.cement_process && (
                    <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                      <CogIcon className="h-4 w-4 text-blue-600" />
                      <div>
                        <span className="text-sm font-medium text-blue-800">Manufacturing Process: </span>
                        <span className="text-sm text-blue-700">{rec.cement_process}</span>
                      </div>
                    </div>
                  )}
                  
                  {rec.alternative_fuel_details && rec.category === 'Alternative Fuels' && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <FireIcon className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Alternative Fuel Specifications</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-medium text-green-700">Fuel Type: </span>
                          <span className="text-green-600">{rec.alternative_fuel_details.fuel_type}</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-700">Emission Factor: </span>
                          <span className="text-green-600">{rec.alternative_fuel_details.emission_factor}</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-700">Heat Content: </span>
                          <span className="text-green-600">{rec.alternative_fuel_details.heat_content}</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-700">Availability: </span>
                          <span className="text-green-600">{rec.alternative_fuel_details.availability}</span>
                        </div>
                        {rec.alternative_fuel_details.sourcing_strategy && (
                          <div className="col-span-2">
                            <span className="font-medium text-green-700">Sourcing: </span>
                            <span className="text-green-600">{rec.alternative_fuel_details.sourcing_strategy}</span>
                          </div>
                        )}
                        {rec.alternative_fuel_details.local_suppliers && (
                          <div className="col-span-2">
                            <span className="font-medium text-green-700">Local Suppliers: </span>
                            <span className="text-green-600">{rec.alternative_fuel_details.local_suppliers}</span>
                          </div>
                        )}
                        {rec.alternative_fuel_details.transportation_distance && (
                          <div className="col-span-2">
                            <span className="font-medium text-green-700">Transport Distance: </span>
                            <span className="text-green-600">{rec.alternative_fuel_details.transportation_distance}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Impact Metrics */}
                {rec.impact && (
                  <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Emission Reduction</div>
                        <div className="text-lg font-bold text-green-600">
                          {rec.impact.emission_reduction_percentage}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {rec.impact.emission_reduction_absolute}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Annual Savings</div>
                        <div className="text-lg font-bold text-green-600">
                          {rec.impact.cost_savings_annual || formatCurrency(rec.impact.cost_savings_annual)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Cost Comparison Details */}
                    {rec.impact.cost_comparison && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <CurrencyDollarIcon className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Cost Analysis</span>
                        </div>
                        <div className="text-sm text-blue-700">
                          {rec.impact.cost_comparison}
                        </div>
                        {rec.impact.current_annual_expense && (
                          <div className="text-xs text-blue-600 mt-1">
                            Current annual expense: {rec.impact.current_annual_expense}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Implementation Details */}
                {rec.implementation && (
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-gray-500">
                        <ClockIcon className="h-4 w-4" />
                        <span>Timeline:</span>
                      </div>
                      <span className="font-medium">{rec.implementation.timeline}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-gray-500">
                        <CurrencyDollarIcon className="h-4 w-4" />
                        <span>Investment:</span>
                      </div>
                      <span className="font-medium">{formatCurrency(rec.implementation.investment_required)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-gray-500">
                        <CogIcon className="h-4 w-4" />
                        <span>Complexity:</span>
                      </div>
                      <span className="font-medium">{rec.implementation.complexity}</span>
                    </div>
                  </div>
                )}

                {/* Success Metrics */}
                {rec.success_metrics && rec.success_metrics.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Success Metrics</h5>
                    <ul className="space-y-1">
                      {rec.success_metrics.slice(0, 3).map((metric, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{metric}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 card">
          <LightBulbIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Available</h3>
          <p className="text-gray-500 mb-6">
            Unable to generate recommendations with current facility data.
          </p>
          <button 
            onClick={() => generateRecommendations()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default AIRecommendationsTab;
