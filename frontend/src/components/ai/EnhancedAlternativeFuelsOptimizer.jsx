/**
 * Enhanced Alternative Fuels Optimizer Component
 * Uses local database data with intelligent filtering and AI analysis
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  FireIcon,
  CurrencyDollarIcon,
  LightBulbIcon,
  InformationCircleIcon,
  SparklesIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ClockIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import apiService from '../../services/api';

/**
 * Extract recommended resource names from AI analysis text
 * @param {string} analysisText - The AI analysis text
 * @param {Array} factors - Available factors to match against
 * @returns {Array} - Array of recommended resource names
 */
const extractRecommendedResources = (analysisText, factors) => {
  if (!analysisText || !factors) return [];
  
  const recommendations = [];
  
  // Look for "Recommended Choice:" pattern
  const recommendedMatch = analysisText.match(/🏆\s*Recommended\s+Choice:\s*([^*\n]+)/i);
  if (recommendedMatch) {
    const recommendedName = recommendedMatch[1].trim();
    recommendations.push(recommendedName);
  }
  
  // Look for numbered alternatives like "2. **Resource Name**"
  const alternativeMatches = analysisText.matchAll(/\d+\.\s*\*\*([^*]+)\*\*/g);
  for (const match of alternativeMatches) {
    const resourceName = match[1].trim();
    if (!recommendations.includes(resourceName)) {
      recommendations.push(resourceName);
    }
  }
  
  // Filter to only include resources that actually exist in our factors
  const availableResourceNames = factors.map(f => f.resource_name);
  const validRecommendations = recommendations.filter(rec => 
    availableResourceNames.some(name => 
      name.toLowerCase().includes(rec.toLowerCase()) || 
      rec.toLowerCase().includes(name.toLowerCase())
    )
  );
  
  return validRecommendations;
};

/**
 * Check if a resource is recommended by AI
 * @param {string} resourceName - The resource name to check
 * @param {Array} recommendedResources - Array of recommended resource names
 * @returns {boolean} - True if resource is recommended
 */
const isResourceRecommended = (resourceName, recommendedResources) => {
  if (!recommendedResources || recommendedResources.length === 0) return false;
  
  return recommendedResources.some(rec => 
    resourceName.toLowerCase().includes(rec.toLowerCase()) || 
    rec.toLowerCase().includes(resourceName.toLowerCase())
  );
};

const EnhancedAlternativeFuelsOptimizer = ({ facility }) => {
  console.log('🎯 EnhancedAlternativeFuelsOptimizer mounted for facility:', facility?.id);
  
  // State for dynamic ranges (calculated from database)
  const [dynamicRanges, setDynamicRanges] = useState({
    cost: { min: 0, max: 100 },
    emission: { min: 0, max: 5 },
    energy: { min: 0, max: 0.05 },
    intensity: { min: 0, max: 10 }
  });

  // State for user selections (limit-based, not range-based)
  const [userSelections, setUserSelections] = useState({
    cost_limit: 50,
    emission_limit: 2.5,
    energy_minimum: 0.01,
    category: 'stationary_combustion' // Default to most common category
  });

  // State for available categories
  const [availableCategories, setAvailableCategories] = useState([]);

  // State for data
  const [availableFactors, setAvailableFactors] = useState([]);
  const [filteredFactors, setFilteredFactors] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [stats, setStats] = useState({ total: 0, filtered: 0, selected: 0 });
  
  // State for AI recommendations
  const [recommendedResources, setRecommendedResources] = useState([]);
  
  // State for loading and errors
  const [initializing, setInitializing] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Initialize component
  useEffect(() => {
    initializeOptimizer();
  }, []);

  // Optimize when user selections change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!initializing && dynamicRanges?.cost?.max && dynamicRanges.cost.max > 0) {
        optimizeFactors();
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(timeoutId);
  }, [userSelections, initializing, dynamicRanges]);

  const initializeOptimizer = async () => {
    try {
      setInitializing(true);
      setError(null);

      console.log('🚀 Initializing Enhanced Fuel Optimizer...');

      // First, get available categories
      try {
        const categoriesResponse = await apiService.request('/emissions/categories', {
          method: 'GET'
        });

        if (categoriesResponse.success && categoriesResponse.data.categories?.length > 0) {
          setAvailableCategories(categoriesResponse.data.categories);
          console.log('📋 Available categories loaded:', categoriesResponse.data.categories);
          console.log('✅ Default category highlighted:', userSelections.category);
          
          // Ensure stationary_combustion is in the list for highlighting
          const hasStationaryCombustion = categoriesResponse.data.categories.some(cat => 
            cat.category === 'stationary_combustion'
          );
          if (!hasStationaryCombustion) {
            console.warn('⚠️ stationary_combustion not found in categories, adding fallback');
            setAvailableCategories(prev => [...prev, { category: 'stationary_combustion', factor_count: 10 }]);
          }
          
          // Force re-render to highlight the default selection
          setUserSelections(prev => ({ ...prev, category: 'stationary_combustion' }));
          console.log('🎯 Forced highlighting for stationary_combustion');
          
          // Update ranges for default category
          await updateRangesForCategory('stationary_combustion');
        } else {
          throw new Error('No categories returned from API');
        }
      } catch (error) {
        console.warn('Failed to load categories, using fallback:', error);
      // Fallback categories if API fails
      setAvailableCategories([
        { category: 'stationary_combustion', factor_count: 10 },
        { category: 'mobile_combustion', factor_count: 1 },
        { category: 'purchased_electricity', factor_count: 3 },
        { category: 'renewable_energy', factor_count: 1 }
      ]);
      // Force highlighting for fallback case too
      setUserSelections(prev => ({ ...prev, category: 'stationary_combustion' }));
      console.log('💡 Using fallback categories with stationary_combustion highlighted');
      
      // Update ranges for default category in fallback case
      await updateRangesForCategory('stationary_combustion');
      }

      // Get initial filtered factors to calculate ranges (default to stationary_combustion)
      const response = await apiService.request('/emissions/factors/filtered?category=stationary_combustion', {
        method: 'POST',
        body: JSON.stringify({
          facilityId: facility.id
        })
      });

      if (response.success) {
        const data = response.data;
        
        // Handle case where no data is returned
        if (!data || !data.ranges) {
          console.warn('⚠️ No ranges data returned from API');
          setError('No emission factors data available for the selected category');
          setDynamicRanges({
            cost: { min: 0, max: 100 },
            emission: { min: 0, max: 5 },
            energy: { min: 0, max: 0.05 },
            intensity: { min: 0, max: 10 }
          });
          setStats({ total: 0, filtered: 0 });
          return;
        }
        
        // Set dynamic ranges from real database data
        setDynamicRanges(data.ranges);
        
        // Set all available factors
        setAvailableFactors(data.factors || []);
        
        // Set initial user selections to reasonable limits
        setUserSelections(prev => ({
          ...prev,
          cost_limit: Math.min(50, data.ranges?.cost?.max ? data.ranges.cost.max * 0.5 : 50), // 50% of max cost or ₹50, whichever is lower
          emission_limit: Math.min(5, data.ranges?.emission?.max ? data.ranges.emission.max * 0.1 : 2.5), // 10% of max emission or 5, whichever is lower
          energy_minimum: Math.max(0.01, data.ranges?.energy?.min || 0.01), // Minimum 0.01 or data minimum
          category: 'stationary_combustion' // Ensure category is maintained
        }));
        
        setStats(data.stats || { total: 0, filtered: 0 });
        setLastUpdated(new Date().toLocaleTimeString());
        
        console.log(`✅ Initialized with ${data.stats?.total || 0} emission factors`);
        console.log('📊 Dynamic ranges:', data.ranges);
        
        // Trigger initial optimization only if we have data
        if (data.stats?.total > 0) {
          setTimeout(() => optimizeFactors(), 100);
        }
        
      } else {
        throw new Error(response.message || 'Failed to initialize');
      }

    } catch (error) {
      console.error('❌ Initialization failed:', error);
      setError(`Initialization failed: ${error.message}`);
    } finally {
      setInitializing(false);
    }
  };

  const optimizeFactors = async () => {
    try {
      setAnalyzing(true);
      setError(null);
      setRecommendedResources([]); // Clear previous recommendations

      console.log('🔍 Optimizing factors with:', userSelections);

        // Get filtered factors based on user selections (limit-based)
        const filterRequest = {
          facilityId: facility.id,
          costLimit: userSelections.cost_limit,
          emissionLimit: userSelections.emission_limit
        };

        // Only add energy filter if we have actual energy data (not all zeros)
        if (dynamicRanges?.energy?.max > 0) {
          filterRequest.energyMinimum = userSelections.energy_minimum;
        }

        // Use category as query parameter
        const categoryParam = encodeURIComponent(userSelections.category);
        const filterResponse = await apiService.request(`/emissions/factors/filtered?category=${categoryParam}`, {
          method: 'POST',
          body: JSON.stringify(filterRequest)
        });

      if (filterResponse.success) {
        const data = filterResponse.data;
        setFilteredFactors(data.factors);
        setStats(data.stats);

        // Get AI analysis if we have filtered factors
        if (data.factors.length > 0) {
          await getAIAnalysis(data.factors, userSelections);
        } else {
          setAiAnalysis(`**🔍 No Matching Fuels Found**

Based on your criteria:
- **Maximum Cost**: ≤ ₹${userSelections.cost_limit.toFixed(2)} per unit
- **Maximum Emission Factor**: ≤ ${userSelections.emission_limit.toFixed(3)} kgCO₂e per unit
${dynamicRanges?.energy?.max > 0 ? `- **Minimum Energy Content**: ≥ ${(userSelections.energy_minimum * 1000).toFixed(1)} MJ per unit` : ''}

**💡 Suggestions:**
1. **Increase cost limit** to find more options within budget
2. **Increase emission limit** if environmental requirements allow
3. **Decrease energy minimum** if lower energy content is acceptable

Try adjusting the limits to explore different fuel options!`);
        }

        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        throw new Error(filterResponse.message || 'Failed to filter factors');
      }

    } catch (error) {
      console.error('❌ Optimization failed:', error);
      setError(`Analysis failed: ${error.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const getAIAnalysis = async (factors, criteria) => {
    try {
      // Create analysis request for AI
      const analysisRequest = {
        facility_id: facility.id,
        facility_name: facility.name,
        facility_location: facility.location || 'India',
        selected_factors: factors.map(f => ({
          resource_name: f.resource_name,
          emission_factor: f.emission_factor,
          heat_content: f.heat_content,
          cost_INR: f.cost_INR,
          carbon_intensity: f.carbon_intensity,
          is_alternative_fuel: f.is_alternative_fuel,
          is_renewable: f.is_renewable,
          is_biofuel: f.is_biofuel,
          reference_source: f.reference_source
        })),
        user_criteria: {
          cost_limit: criteria.cost_limit,
          emission_limit: criteria.emission_limit,
          energy_minimum: criteria.energy_minimum
        }
      };

      const aiResponse = await apiService.aiRequest('/smart-fuel-analysis/recommendations', {
        method: 'POST',
        data: analysisRequest
      });

      if (aiResponse.success) {
        const analysis = aiResponse.analysis || aiResponse.data?.analysis || 'Analysis completed successfully.';
        setAiAnalysis(analysis);
        
        // Extract recommended resources from AI analysis
        const extractedRecommendations = extractRecommendedResources(analysis, factors);
        setRecommendedResources(extractedRecommendations);
        console.log('✨ Extracted recommended resources:', extractedRecommendations);
      } else {
        // Fallback to local analysis
        const fallbackAnalysis = generateFallbackAnalysis(factors, criteria);
        setAiAnalysis(fallbackAnalysis);
        
        // Extract recommendations from fallback analysis too
        const extractedRecommendations = extractRecommendedResources(fallbackAnalysis, factors);
        setRecommendedResources(extractedRecommendations);
        console.log('✨ Extracted recommended resources (fallback):', extractedRecommendations);
      }

    } catch (error) {
      console.error('AI Analysis error:', error);
      // Generate fallback analysis
      const fallbackAnalysis = generateFallbackAnalysis(factors, criteria);
      setAiAnalysis(fallbackAnalysis);
    }
  };

  const generateFallbackAnalysis = (factors, criteria) => {
    if (!factors || factors.length === 0) return 'No factors available for analysis.';

    const sortedFactors = [...factors].sort((a, b) => a.carbon_intensity - b.carbon_intensity);
    const topFactor = sortedFactors[0];
    const alternatives = sortedFactors.slice(1, 3);

    return `**🎯 Smart Fuel Analysis Results**

Based on your criteria, here are the optimal fuel options:

**🏆 Recommended Choice: ${topFactor.resource_name}**
- **Cost**: ₹${topFactor.cost_INR?.toFixed(2) || 'N/A'}/kg
- **Emission Factor**: ${topFactor.emission_factor.toFixed(3)} kgCO₂e/kg
- **Energy Content**: ${(topFactor.heat_content * 1000).toFixed(1)} MJ/kg
- **Carbon Intensity**: ${(topFactor.carbon_intensity / 1000).toFixed(3)} kgCO₂e/MJ
- **Type**: ${topFactor.is_renewable ? '🌱 Renewable' : topFactor.is_biofuel ? '🌾 Biofuel' : '⚡ Conventional'}

**📊 Why This is Best:**
${topFactor.carbon_intensity < 50 
  ? '✅ **Low carbon intensity** - Excellent environmental performance'
  : topFactor.carbon_intensity < 100 
  ? '⚠️ **Moderate carbon intensity** - Balanced environmental impact'
  : '🔴 **High carbon intensity** - Consider alternatives for better sustainability'
}

${alternatives.length > 0 ? `**🔄 Alternative Options:**

${alternatives.map((alt, i) => 
  `${i + 2}. **${alt.resource_name}**
   - Cost: ₹${alt.cost_INR?.toFixed(2) || 'N/A'}/kg | Emission: ${alt.emission_factor.toFixed(3)} kgCO₂e/kg | Energy: ${(alt.heat_content * 1000).toFixed(1)} MJ/kg`
).join('\n\n')}` : ''}

**💰 Economic Impact:** 
${topFactor.cost_INR && topFactor.cost_INR < criteria.cost_value ? '💚 Cost-effective choice within your budget' : '💛 Premium option - consider cost vs. performance trade-offs'}

**🌍 Environmental Impact:**
${topFactor.is_renewable || topFactor.is_biofuel ? '🌱 Great choice for sustainability goals!' : '⚠️ Consider renewable alternatives when available'}

*Analysis based on ${factors.length} matching fuel${factors.length !== 1 ? 's' : ''} from our comprehensive database.*`;
  };

  const handleSliderChange = (type, value) => {
    setUserSelections(prev => ({
      ...prev,
      [`${type}_limit`]: parseFloat(value)
    }));
  };

  const handleEnergyChange = (value) => {
    setUserSelections(prev => ({
      ...prev,
      energy_minimum: parseFloat(value)
    }));
  };

  const resetToDefaults = () => {
    setUserSelections({
      cost_limit: Math.min(50, (dynamicRanges?.cost?.max || 100) * 0.5),
      emission_limit: Math.min(5, (dynamicRanges?.emission?.max || 10) * 0.1),
      energy_minimum: Math.max(0.01, dynamicRanges?.energy?.min || 0),
      category: 'stationary_combustion'
    });
  };

  const handleCategoryChange = async (category) => {
    setUserSelections(prev => ({
      ...prev,
      category: category
    }));
    
    // Update dynamic ranges based on new category
    await updateRangesForCategory(category);
  };

  // Function to update ranges based on selected category
  const updateRangesForCategory = async (category) => {
    try {
      console.log('🔄 Updating ranges for category:', category);
      
      // Get all factors for this category to calculate ranges
      const categoryParam = encodeURIComponent(category);
      const response = await apiService.request(`/emissions/factors/filtered?category=${categoryParam}`, {
        method: 'POST',
        body: JSON.stringify({
          facilityId: facility.id
          // No filters - get all factors for this category
        })
      });

      if (response.success && response.data.ranges) {
        const ranges = response.data.ranges;
        
        // Apply ±10% buffer to ranges
        const applyBuffer = (min, max) => {
          const range = max - min;
          const buffer = range * 0.1; // 10% buffer
          return {
            min: Math.max(0, min - buffer), // Don't go below 0
            max: max + buffer
          };
        };

        const newRanges = {
          cost: applyBuffer(ranges.cost.min, ranges.cost.max),
          emission: applyBuffer(ranges.emission.min, ranges.emission.max),
          energy: ranges.energy.max > 0 ? applyBuffer(ranges.energy.min, ranges.energy.max) : { min: 0, max: 0 },
          intensity: applyBuffer(ranges.intensity.min, ranges.intensity.max)
        };

        setDynamicRanges(newRanges);
        
        // Reset user selections to middle values of new ranges
        setUserSelections(prev => ({
          ...prev,
          cost_limit: newRanges.cost.max * 0.7, // 70% of max
          emission_limit: newRanges.emission.max * 0.7, // 70% of max  
          energy_minimum: newRanges.energy.min || 0
        }));

        console.log('📊 Updated ranges for category:', category, newRanges);
      }
    } catch (error) {
      console.error('❌ Failed to update ranges for category:', category, error);
    }
  };

  // Remove auto-optimize for now - user can manually optimize

  if (initializing) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Enhanced Fuel Optimizer</h3>
          <p className="text-gray-600">Loading comprehensive fuel database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <BeakerIcon className="h-6 w-6 text-blue-600 mr-2" />
              Enhanced Alternative Fuels Optimizer
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              AI-powered analysis using {stats.total} real emission factors from official databases
              <br />
              <span className="text-xs">
                Units: kg, L, kWh, m³, t | 
                Cost: ₹{dynamicRanges?.cost?.min?.toFixed(0) || '0'}-{dynamicRanges?.cost?.max?.toFixed(0) || '100'} | 
                Emissions: {dynamicRanges?.emission?.min?.toFixed(3) || '0.000'}-{dynamicRanges?.emission?.max?.toFixed(3) || '5.000'} kgCO₂e
                {dynamicRanges?.energy?.max > 0 && ` | Energy: ${(dynamicRanges.energy.min * 1000).toFixed(1)}-${(dynamicRanges.energy.max * 1000).toFixed(1)} MJ`}
              </span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              {lastUpdated && <span>Updated: {lastUpdated}</span>}
            </div>
            <div className="text-xs text-blue-600">
              {stats.filtered}/{stats.total} factors match criteria
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <div className="flex">
              <InformationCircleIcon className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}
      </div>

      {/* Category Selection */}
      <div className="mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <BeakerIcon className="h-5 w-5 text-blue-600 mr-2" />
            <span className="font-medium text-blue-900">Resource Category</span>
            <span className="ml-auto text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
              ✓ {userSelections.category
                  .split('_')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
            </span>
          </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {availableCategories.map((cat) => {
            const isSelected = userSelections.category === cat.category;
            console.log(`🔍 Rendering ${cat.category}: selected=${isSelected}`);
            
            // Convert database category names to display names
            const displayName = cat.category
              .split('_')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            
            return (
            <button
              key={`${cat.category}-${isSelected}`}
              onClick={() => handleCategoryChange(cat.category)}
              className={`p-4 rounded-xl text-center font-medium border-2 transition-all transform hover:scale-105 ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg ring-2 ring-blue-300 ring-offset-2'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-blue-50 shadow-sm'
              }`}
            >
                <div className="font-bold text-base mb-1">
                  {displayName}
                </div>
                <div className={`text-sm ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                  {cat.factor_count} factors
                </div>
              </button>
            );
          })}
          </div>
          <div className="text-xs text-blue-600 mt-2 text-center">
            Select the type of resources you want to analyze
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Cost Control */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <CurrencyDollarIcon className="h-5 w-5 text-green-600 mr-2" />
            <span className="font-medium text-green-900">Maximum Cost</span>
            <span className="ml-auto text-sm text-green-700">≤ ₹{userSelections.cost_limit.toFixed(2)}/unit</span>
          </div>
          <input
            type="range"
            min={dynamicRanges?.cost?.min || 0}
            max={dynamicRanges?.cost?.max || 100}
            value={userSelections.cost_limit}
            onChange={(e) => handleSliderChange('cost', e.target.value)}
            step="0.1"
            className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer slider-green"
          />
          <div className="flex justify-between text-xs text-green-600 mt-1">
            <span>₹{dynamicRanges?.cost?.min?.toFixed(0) || '0'}</span>
            <span>₹{dynamicRanges?.cost?.max?.toFixed(0) || '100'}</span>
          </div>
          <div className="text-xs text-green-700 mt-1 text-center">
            Shows fuels from ₹0 to ₹{userSelections.cost_limit.toFixed(2)} per unit
          </div>
        </div>

        {/* Emission Control */}
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <FireIcon className="h-5 w-5 text-orange-600 mr-2" />
            <span className="font-medium text-orange-900">Maximum Emission</span>
            <span className="ml-auto text-sm text-orange-700">≤ {userSelections.emission_limit.toFixed(3)} kgCO₂e/unit</span>
          </div>
          <input
            type="range"
            min={dynamicRanges?.emission?.min || 0}
            max={dynamicRanges?.emission?.max || 10}
            value={userSelections.emission_limit}
            onChange={(e) => handleSliderChange('emission', e.target.value)}
            step="0.001"
            className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer slider-orange"
          />
          <div className="flex justify-between text-xs text-orange-600 mt-1">
            <span>{dynamicRanges?.emission?.min?.toFixed(3) || '0.000'}</span>
            <span>{dynamicRanges?.emission?.max?.toFixed(3) || '10.000'}</span>
          </div>
          <div className="text-xs text-orange-700 mt-1 text-center">
            Shows fuels from 0 to {userSelections.emission_limit.toFixed(3)} kgCO₂e per unit
          </div>
        </div>

        {/* Energy Control - Show if we have energy data OR in development */}
        {(dynamicRanges?.energy?.max > 0 || process.env.NODE_ENV === 'development') && (
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <LightBulbIcon className="h-5 w-5 text-purple-600 mr-2" />
              <span className="font-medium text-purple-900">Minimum Energy</span>
              {dynamicRanges?.energy?.max <= 0 && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded ml-2">No Data</span>
              )}
              <span className="ml-auto text-sm text-purple-700">≥ {(userSelections.energy_minimum * 1000).toFixed(1)} MJ/unit</span>
            </div>
            <input
              type="range"
              min={dynamicRanges?.energy?.min || 0}
              max={dynamicRanges?.energy?.max || 0.05}
              value={userSelections.energy_minimum}
              onChange={(e) => handleEnergyChange(e.target.value)}
              step="0.001"
              className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer slider-purple"
            />
            <div className="flex justify-between text-xs text-purple-600 mt-1">
              <span>{(dynamicRanges?.energy?.min * 1000)?.toFixed(1) || '0.0'}</span>
              <span>{(dynamicRanges?.energy?.max * 1000)?.toFixed(1) || '50.0'}</span>
            </div>
            <div className="text-xs text-purple-700 mt-1 text-center">
              Shows fuels from {(userSelections.energy_minimum * 1000).toFixed(1)} to {((dynamicRanges?.energy?.max || 0.05) * 1000).toFixed(1)} MJ per unit
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={optimizeFactors}
          disabled={analyzing}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {analyzing ? (
            <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <SparklesIcon className="h-4 w-4 mr-2" />
          )}
          {analyzing ? 'Analyzing...' : 'Analyze Now'}
        </button>
        
        <button
          onClick={resetToDefaults}
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Reset
        </button>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Filtered Factors Display */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <ChartBarIcon className="h-5 w-5 text-gray-600 mr-2" />
            Matching Factors ({filteredFactors.length})
          </h4>
          
          {filteredFactors.length > 0 ? (
            <div className="space-y-3">
              {filteredFactors.map((factor, index) => {
                const isRecommended = isResourceRecommended(factor.resource_name, recommendedResources);
                return (
                <div 
                  key={factor.id} 
                  className={`rounded p-3 border transition-all duration-500 transform ${
                    isRecommended 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 ring-2 ring-green-200 shadow-lg scale-[1.02] hover:scale-[1.03]' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h5 className={`font-medium text-sm ${
                        isRecommended ? 'text-green-900' : 'text-gray-900'
                      }`}>
                        {factor.resource_name}
                      </h5>
                      {isRecommended && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                          ✨ AI Recommended
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {factor.is_renewable && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">🌱 Renewable</span>}
                      {factor.is_biofuel && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">🌾 Biofuel</span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>Cost: ₹{factor.cost_INR?.toFixed(2) || 'N/A'}/{factor.emission_factor_unit}</div>
                    <div>Emission: {factor.emission_factor.toFixed(3)} kgCO₂e/{factor.emission_factor_unit}</div>
                    <div>Energy: {factor.heat_content > 0 ? (factor.heat_content * 1000).toFixed(1) + ' MJ/kg' : 'N/A'}</div>
                    <div>Intensity: {(factor.carbon_intensity / 1000).toFixed(2)} kgCO₂e/MJ</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{factor.reference_source}</div>
                </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <ChartBarIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p>No factors match your current criteria</p>
              <p className="text-xs mt-1">Try adjusting the tolerance or target values</p>
            </div>
          )}
        </div>

        {/* AI Analysis */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3 flex items-center">
            <SparklesIcon className="h-5 w-5 text-blue-600 mr-2" />
            AI Analysis & Recommendations
            {analyzing && <ClockIcon className="h-4 w-4 text-blue-500 ml-2 animate-pulse" />}
          </h4>
          
          <div className="prose prose-sm max-w-none">
            {analyzing ? (
              <div className="flex items-center text-blue-700">
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                AI is analyzing your selections and generating recommendations...
              </div>
            ) : aiAnalysis ? (
              <div 
                className="text-gray-700 space-y-2"
                dangerouslySetInnerHTML={{
                  __html: aiAnalysis
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br />')
                }}
              />
            ) : (
              <div className="text-center text-gray-500 py-8">
                <SparklesIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p>Adjust the parameters above to get AI recommendations</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAlternativeFuelsOptimizer;
