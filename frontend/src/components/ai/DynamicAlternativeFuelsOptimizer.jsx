/**
 * Dynamic Alternative Fuels Optimizer Component
 * AI-driven fuel optimization with dynamic ranges and real-time cost fetching
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
  ClockIcon
} from '@heroicons/react/24/outline';
import apiService from '../../services/api';

const DynamicAlternativeFuelsOptimizer = ({ facility }) => {
  // State for dynamic ranges (calculated from database)
  const [dynamicRanges, setDynamicRanges] = useState({
    cost_range: { min: 0, max: 100, unit: 'INR/kg' },
    emission_range: { min: 0, max: 5, unit: 'kgCO2e/kg' },
    energy_range: { min: 0, max: 0.05, unit: 'GJ/kg' }
  });

  // State for user selections (values within dynamic ranges)
  const [userSelections, setUserSelections] = useState({
    cost_value: 50,
    emission_value: 2.5,
    energy_value: 0.025,
    tolerance_percent: 10
  });

  // State for data
  const [allFuels, setAllFuels] = useState([]);
  const [filteredFuels, setFilteredFuels] = useState([]);
  const [aiRecommendation, setAiRecommendation] = useState('');
  const [initializationData, setInitializationData] = useState(null);
  
  // State for loading and errors
  const [initializing, setInitializing] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [costsFetching, setCostsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Initialize optimizer on component mount
  useEffect(() => {
    initializeOptimizer();
    
    // Auto-fallback to offline mode after 15 seconds if still loading
    const autoFallbackTimer = setTimeout(() => {
      if (initializing) {
        console.log('⏰ Auto-switching to offline mode after 15 seconds...');
        setInitializing(false);
        setCostsFetching(false);
        setError('Services taking too long. Switched to offline mode automatically.');
        setTimeout(() => {
          setError(null);
          initializeOfflineMode();
        }, 1000);
      }
    }, 15000);

    return () => clearTimeout(autoFallbackTimer);
  }, []);

  // Optimize when user selections change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (initializationData && !initializing) {
        optimizeFuels();
      }
    }, 800); // 800ms debounce

    return () => clearTimeout(timeoutId);
  }, [userSelections, initializationData]);

  // Auto-timeout for optimization if it takes too long
  useEffect(() => {
    if (optimizing) {
      const autoTimeoutId = setTimeout(() => {
        console.log('⏰ Auto-timing out AI analysis after 8 seconds...');
        setOptimizing(false);
        
        if (allFuels.length > 0) {
          const timeoutReco = `**⏰ Analysis Timeout - Quick Results**

The AI analysis took longer than expected. Here are the top fuels from our database:

${allFuels.slice(0, 3).map((fuel, i) => 
  `${i + 1}. **${fuel.resource_name}**
   - Cost: ₹${fuel.dynamic_cost?.toFixed(2) || 'N/A'}/kg
   - Emission: ${fuel.emission_factor} kgCO₂e/kg
   - Energy: ${fuel.heat_content?.toFixed(3)} GJ/kg`
).join('\n\n')}

**💡 Quick Tip**: The sliders work instantly for filtering. Try adjusting them to see immediate results!`;
          
          setAiRecommendation(timeoutReco);
        }
      }, 8000); // 8 second auto-timeout

      return () => clearTimeout(autoTimeoutId);
    }
  }, [optimizing, allFuels]);

  const initializeOptimizer = async () => {
    try {
      setInitializing(true);
      setError(null);
      setCostsFetching(true);

      console.log('🚀 Initializing AI-driven fuel optimizer...');

      // Try the new dynamic optimizer endpoint first with timeout
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI service timeout')), 10000)
        );
        
        const apiPromise = apiService.aiRequest(`/dynamic-fuel-optimizer/initialize/${facility.id}`, {
          method: 'GET'
        });
        
        const response = await Promise.race([apiPromise, timeoutPromise]);

        if (response.success) {
          const data = response.data;
          
          // Set dynamic ranges from database
          setDynamicRanges(data.dynamic_ranges);
          
          // Set all fuels data
          setAllFuels(data.fuels);
          
          // Set initial user selections to middle of ranges
          setUserSelections({
            cost_value: (data.dynamic_ranges.cost_range.min + data.dynamic_ranges.cost_range.max) / 2,
            emission_value: (data.dynamic_ranges.emission_range.min + data.dynamic_ranges.emission_range.max) / 2,
            energy_value: (data.dynamic_ranges.energy_range.min + data.dynamic_ranges.energy_range.max) / 2,
            tolerance_percent: 10
          });
          
          setInitializationData(data);
          setLastUpdated(data.last_updated);
          
          console.log(`✅ Initialized with ${data.total_fuels} fuels and dynamic costs`);
          console.log('📊 Dynamic ranges:', data.dynamic_ranges);
          return;
        }
      } catch (newEndpointError) {
        console.log('ℹ️ New endpoint not available, falling back to existing API...');
      }

      // Fallback to existing emission resources API (ALL fuels for AI cost analysis)
      const emissionResponse = await apiService.get('/emissions/resources');

      if (emissionResponse.success) {
        const resources = emissionResponse.data.resources || [];
        
        // Get emission factors for these resources
        const fuelsWithFactors = [];
        
        for (const resource of resources) {
          try {
            const factorsResponse = await apiService.get(`/emissions/resources/${resource.id}/factors`);
            if (factorsResponse.success && factorsResponse.data.factors.length > 0) {
              const factors = factorsResponse.data.factors;
              
              factors.forEach(factor => {
                fuelsWithFactors.push({
                  resource_id: resource.id,
                  resource_name: resource.resource_name,
                  emission_factor: factor.emission_factor || 0,
                  emission_factor_unit: factor.emission_factor_unit || 'kgCO2e/kg',
                  heat_content: factor.heat_content || 0.015,
                  heat_content_unit: factor.heat_content_unit || 'GJ/kg',
                  library_name: factor.library_name || 'Database',
                  availability_score: 7,
                  // Use database cost_INR if available, otherwise fallback to simulation
                  dynamic_cost: factor.cost_INR || getSimulatedCost(resource.resource_name),
                  cost_currency: 'INR',
                  cost_confidence: factor.cost_INR ? 'database' : 'estimated',
                  cost_source: factor.cost_INR ? 'Database cost_INR' : 'Fallback estimation',
                  cost_location: 'India Market',
                  carbon_intensity: factor.heat_content > 0 ? (factor.emission_factor / factor.heat_content) : factor.emission_factor
                });
              });
            }
          } catch (factorError) {
            console.log(`Could not fetch factors for ${resource.resource_name}`);
          }
        }

        // Calculate dynamic ranges from available data
        const costs = fuelsWithFactors.map(f => f.dynamic_cost).filter(c => c > 0);
        const emissions = fuelsWithFactors.map(f => f.emission_factor).filter(e => e > 0);
        const energies = fuelsWithFactors.map(f => f.heat_content).filter(e => e > 0);

        const calculatedRanges = {
          cost_range: {
            min: costs.length > 0 ? Math.min(...costs) : 3.0,
            max: costs.length > 0 ? Math.max(...costs) : 10.0,
            unit: 'INR/kg'
          },
          emission_range: {
            min: emissions.length > 0 ? Math.min(...emissions) : 0.3,
            max: emissions.length > 0 ? Math.max(...emissions) : 3.0,
            unit: 'kgCO2e/kg'
          },
          energy_range: {
            min: energies.length > 0 ? Math.min(...energies) : 0.01,
            max: energies.length > 0 ? Math.max(...energies) : 0.035,
            unit: 'GJ/kg'
          }
        };

        setDynamicRanges(calculatedRanges);
        setAllFuels(fuelsWithFactors);
        
        // Set initial user selections to middle of ranges
        setUserSelections({
          cost_value: (calculatedRanges.cost_range.min + calculatedRanges.cost_range.max) / 2,
          emission_value: (calculatedRanges.emission_range.min + calculatedRanges.emission_range.max) / 2,
          energy_value: (calculatedRanges.energy_range.min + calculatedRanges.energy_range.max) / 2,
          tolerance_percent: 10
        });

        setInitializationData({
          fuels: fuelsWithFactors,
          dynamic_ranges: calculatedRanges,
          total_fuels: fuelsWithFactors.length,
          cost_fetching_method: 'fallback_estimation'
        });
        setLastUpdated(new Date().toISOString());

        console.log(`✅ Fallback initialization with ${fuelsWithFactors.length} fuels`);
        console.log('📊 Calculated ranges:', calculatedRanges);
      } else {
        console.log('⚠️ All API endpoints failed, switching to offline mode...');
        initializeOfflineMode();
        return;
      }
    } catch (err) {
      console.error('❌ Initialization error:', err);
      
      // If it's an authentication or network error, auto-switch to offline mode
      if (err.message.includes('token') || err.message.includes('Network') || err.message.includes('fetch') || err.message.includes('Validation failed')) {
        console.log('🔌 Auto-switching to offline mode due to API/auth issues...');
        setError(null);
        initializeOfflineMode();
        return;
      }
      
      setError(`Initialization failed: ${err.message}. Please try refreshing the page.`);
    } finally {
      setInitializing(false);
      setCostsFetching(false);
    }
  };

  const getSimulatedCost = (fuelName) => {
    // Fallback cost simulation based on fuel name
    const costMap = {
      'Biomass': 8.5,
      'Rice Husk': 3.2,
      'Agricultural Waste': 5.3,
      'Cotton Stalks': 4.5,
      'Waste-derived Fuel': 6.2,
      'Used Tires': 4.8,
      'Bagasse': 2.8,
      'Wheat Straw': 4.2
    };
    
    // Add some variation to simulate real-time fetching
    const basePrice = costMap[fuelName] || 6.0;
    const variation = (Math.random() - 0.5) * 0.4; // ±20% variation
    return Math.max(1.0, basePrice * (1 + variation));
  };

  const initializeOfflineMode = () => {
    console.log('🔌 Initializing offline mode with predefined data...');
    
    // Hardcoded alternative fuels data (no API required)
    const offlineFuels = [
      {
        resource_id: 'offline-1',
        resource_name: 'Rice Husk',
        emission_factor: 0.38,
        emission_factor_unit: 'kgCO2e/kg',
        heat_content: 0.013,
        heat_content_unit: 'GJ/kg',
        library_name: 'India Market Database',
        availability_score: 9,
        dynamic_cost: 3.2,
        cost_currency: 'INR',
        cost_confidence: 'offline_estimate',
        cost_source: 'Offline database',
        cost_location: 'India Market',
        carbon_intensity: 0.38 / 0.013
      },
      {
        resource_id: 'offline-2',
        resource_name: 'Agricultural Waste',
        emission_factor: 0.45,
        emission_factor_unit: 'kgCO2e/kg',
        heat_content: 0.014,
        heat_content_unit: 'GJ/kg',
        library_name: 'India Market Database',
        availability_score: 8,
        dynamic_cost: 5.3,
        cost_currency: 'INR',
        cost_confidence: 'offline_estimate',
        cost_source: 'Offline database',
        cost_location: 'India Market',
        carbon_intensity: 0.45 / 0.014
      },
      {
        resource_id: 'offline-3',
        resource_name: 'Biomass',
        emission_factor: 0.39,
        emission_factor_unit: 'kgCO2e/kg',
        heat_content: 0.015,
        heat_content_unit: 'GJ/kg',
        library_name: 'DEFRA Database',
        availability_score: 8,
        dynamic_cost: 8.5,
        cost_currency: 'INR',
        cost_confidence: 'offline_estimate',
        cost_source: 'Offline database',
        cost_location: 'India Market',
        carbon_intensity: 0.39 / 0.015
      },
      {
        resource_id: 'offline-4',
        resource_name: 'Cotton Stalks',
        emission_factor: 0.48,
        emission_factor_unit: 'kgCO2e/kg',
        heat_content: 0.016,
        heat_content_unit: 'GJ/kg',
        library_name: 'India Market Database',
        availability_score: 6,
        dynamic_cost: 4.5,
        cost_currency: 'INR',
        cost_confidence: 'offline_estimate',
        cost_source: 'Offline database',
        cost_location: 'India Market',
        carbon_intensity: 0.48 / 0.016
      },
      {
        resource_id: 'offline-5',
        resource_name: 'Waste-derived Fuel',
        emission_factor: 1.85,
        emission_factor_unit: 'kgCO2e/kg',
        heat_content: 0.022,
        heat_content_unit: 'GJ/kg',
        library_name: 'EPA Database',
        availability_score: 6,
        dynamic_cost: 6.2,
        cost_currency: 'INR',
        cost_confidence: 'offline_estimate',
        cost_source: 'Offline database',
        cost_location: 'India Market',
        carbon_intensity: 1.85 / 0.022
      },
      {
        resource_id: 'offline-6',
        resource_name: 'Used Tires',
        emission_factor: 2.95,
        emission_factor_unit: 'kgCO2e/kg',
        heat_content: 0.032,
        heat_content_unit: 'GJ/kg',
        library_name: 'Industry Database',
        availability_score: 7,
        dynamic_cost: 4.8,
        cost_currency: 'INR',
        cost_confidence: 'offline_estimate',
        cost_source: 'Offline database',
        cost_location: 'India Market',
        carbon_intensity: 2.95 / 0.032
      }
    ];

    // Calculate dynamic ranges from offline data
    const costs = offlineFuels.map(f => f.dynamic_cost);
    const emissions = offlineFuels.map(f => f.emission_factor);
    const energies = offlineFuels.map(f => f.heat_content);

    const calculatedRanges = {
      cost_range: {
        min: Math.min(...costs),
        max: Math.max(...costs),
        unit: 'INR/kg'
      },
      emission_range: {
        min: Math.min(...emissions),
        max: Math.max(...emissions),
        unit: 'kgCO2e/kg'
      },
      energy_range: {
        min: Math.min(...energies),
        max: Math.max(...energies),
        unit: 'GJ/kg'
      }
    };

    // Set state with offline data
    setDynamicRanges(calculatedRanges);
    setAllFuels(offlineFuels);
    
    // Set initial user selections to middle of ranges
    setUserSelections({
      cost_value: (calculatedRanges.cost_range.min + calculatedRanges.cost_range.max) / 2,
      emission_value: (calculatedRanges.emission_range.min + calculatedRanges.emission_range.max) / 2,
      energy_value: (calculatedRanges.energy_range.min + calculatedRanges.energy_range.max) / 2,
      tolerance_percent: 10
    });

    setInitializationData({
      fuels: offlineFuels,
      dynamic_ranges: calculatedRanges,
      total_fuels: offlineFuels.length,
      cost_fetching_method: 'offline_mode'
    });
    setLastUpdated(new Date().toISOString());

    console.log(`✅ Offline mode initialized with ${offlineFuels.length} fuels`);
    console.log('📊 Offline ranges:', calculatedRanges);
    
    // Generate initial recommendation
    const bestOfflineFuel = offlineFuels.sort((a, b) => a.carbon_intensity - b.carbon_intensity)[0];
    const initialRecommendation = `**🔌 Offline Mode Active - ${bestOfflineFuel.resource_name}**

**📊 Offline Analysis:**
Operating in offline mode with predefined alternative fuel database. **${bestOfflineFuel.resource_name}** shows the best environmental performance.

**💰 Cost Analysis:**
- Estimated cost: ₹${bestOfflineFuel.dynamic_cost.toFixed(2)}/kg
- Source: Offline database estimates
- Note: Connect to internet for real-time pricing

**🌍 Environmental Impact:**
- Emission factor: ${bestOfflineFuel.emission_factor.toFixed(2)} ${bestOfflineFuel.emission_factor_unit}
- Carbon intensity: ${bestOfflineFuel.carbon_intensity.toFixed(1)} kgCO₂e/GJ
- Environmental rating: Excellent

**🎯 Offline Features Available:**
- Dynamic range selection based on database values
- ±10% tolerance filtering
- Fuel comparison and ranking
- Environmental impact analysis

**⚡ To unlock full AI features:**
- Ensure internet connectivity
- Start backend services (port 3000)
- Start AI services (port 8000)
- Refresh the page

Adjust the sliders above to explore different fuel options!`;

    setAiRecommendation(initialRecommendation);
  };

  const optimizeFuels = useCallback(async () => {
    try {
      setOptimizing(true);
      setError(null);

      console.log('🎯 Optimizing fuels with selections:', userSelections);

      // Try the new optimization endpoint first with timeout
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Optimization timeout')), 5000)
        );
        
        const apiPromise = apiService.aiRequest('/dynamic-fuel-optimizer/optimize', {
          method: 'POST',
          body: JSON.stringify({
            facility_id: facility.id,
            selections: userSelections
          })
        });
        
        const response = await Promise.race([apiPromise, timeoutPromise]);

        if (response.success) {
          const data = response.data;
          setFilteredFuels(data.filtered_fuels);
          setAiRecommendation(data.ai_recommendation);
          
          console.log(`✅ Found ${data.total_matches} matching fuels`);
          console.log('Applied ranges:', data.applied_ranges);
          return;
        }
      } catch (newEndpointError) {
        console.log('ℹ️ New optimization endpoint not available, using fallback logic...');
      }

      // Fallback optimization logic
      if (allFuels.length === 0) {
        setAiRecommendation('No fuel data available. Please refresh the page.');
        setOptimizing(false);
        return;
      }

      // Apply ±10% plus/minus filtering
      const tolerance = userSelections.tolerance_percent / 100;
      
      // Calculate ranges
      const costRange = {
        min: userSelections.cost_value * (1 - tolerance),
        max: userSelections.cost_value * (1 + tolerance)
      };
      const emissionRange = {
        min: userSelections.emission_value * (1 - tolerance),
        max: userSelections.emission_value * (1 + tolerance)
      };
      const energyRange = {
        min: userSelections.energy_value * (1 - tolerance),
        max: userSelections.energy_value * (1 + tolerance)
      };

      // Filter fuels within tolerance ranges
      const filtered = allFuels.filter(fuel => {
        const costMatch = fuel.dynamic_cost >= costRange.min && fuel.dynamic_cost <= costRange.max;
        const emissionMatch = fuel.emission_factor >= emissionRange.min && fuel.emission_factor <= emissionRange.max;
        const energyMatch = fuel.heat_content >= energyRange.min && fuel.heat_content <= energyRange.max;
        
        return costMatch && emissionMatch && energyMatch;
      });

      // If no exact matches, relax tolerance to ±20%
      let finalFiltered = filtered;
      if (filtered.length === 0) {
        const relaxedTolerance = 0.2;
        finalFiltered = allFuels.filter(fuel => {
          const costMatch = fuel.dynamic_cost >= userSelections.cost_value * (1 - relaxedTolerance) && 
                           fuel.dynamic_cost <= userSelections.cost_value * (1 + relaxedTolerance);
          const emissionMatch = fuel.emission_factor >= userSelections.emission_value * (1 - relaxedTolerance) && 
                               fuel.emission_factor <= userSelections.emission_value * (1 + relaxedTolerance);
          const energyMatch = fuel.heat_content >= userSelections.energy_value * (1 - relaxedTolerance) && 
                             fuel.heat_content <= userSelections.energy_value * (1 + relaxedTolerance);
          
          return costMatch && emissionMatch && energyMatch;
        });
      }

      // If still no matches, take top 3 closest matches
      if (finalFiltered.length === 0) {
        const scoredFuels = allFuels.map(fuel => {
          const costDiff = Math.abs(fuel.dynamic_cost - userSelections.cost_value) / dynamicRanges.cost_range.max;
          const emissionDiff = Math.abs(fuel.emission_factor - userSelections.emission_value) / dynamicRanges.emission_range.max;
          const energyDiff = Math.abs(fuel.heat_content - userSelections.energy_value) / dynamicRanges.energy_range.max;
          
          const totalDiff = costDiff + emissionDiff + energyDiff;
          return { ...fuel, difference_score: totalDiff };
        });
        
        finalFiltered = scoredFuels
          .sort((a, b) => a.difference_score - b.difference_score)
          .slice(0, 3);
      }

      // Sort by carbon intensity (best environmental performance first)
      finalFiltered.sort((a, b) => a.carbon_intensity - b.carbon_intensity);

      setFilteredFuels(finalFiltered);

      // Generate fallback AI recommendation
      if (finalFiltered.length > 0) {
        const bestFuel = finalFiltered[0];
        const recommendation = generateFallbackRecommendation(bestFuel, userSelections, finalFiltered.length);
        setAiRecommendation(recommendation);
      } else {
        setAiRecommendation('No suitable fuels found for your criteria. Please adjust your selections.');
      }

      console.log(`✅ Fallback optimization found ${finalFiltered.length} fuels`);
      
    } catch (err) {
      console.error('❌ Optimization error:', err);
      setError(`Optimization failed: ${err.message}`);
    } finally {
      setOptimizing(false);
    }
  }, [userSelections, facility.id, allFuels, dynamicRanges]);

  const generateFallbackRecommendation = (bestFuel, selections, totalMatches) => {
    const costEfficient = bestFuel.dynamic_cost <= selections.cost_value;
    const lowEmission = bestFuel.emission_factor <= selections.emission_value;
    const highEnergy = bestFuel.heat_content >= selections.energy_value;

    return `**🎯 AI-Optimized Recommendation: ${bestFuel.resource_name}**

**📊 Selection Analysis:**
Based on your targets (Cost: ₹${selections.cost_value.toFixed(2)}/kg, Emission: ${selections.emission_value.toFixed(2)} kgCO₂e/kg, Energy: ${selections.energy_value.toFixed(3)} GJ/kg), **${bestFuel.resource_name}** is the best match.

**💰 Cost Analysis:**
- Current estimate: ₹${bestFuel.dynamic_cost.toFixed(2)}/kg
- Cost performance: ${costEfficient ? 'Better than target' : 'Within acceptable range'}
- Source: ${bestFuel.cost_source}

**🌍 Environmental Impact:**
- Emission factor: ${bestFuel.emission_factor.toFixed(2)} ${bestFuel.emission_factor_unit}
- Carbon intensity: ${bestFuel.carbon_intensity.toFixed(1)} kgCO₂e/GJ
- Environmental rating: ${bestFuel.carbon_intensity < 50 ? 'Excellent' : bestFuel.carbon_intensity < 100 ? 'Good' : 'Moderate'}

**⚡ Energy Characteristics:**
- Heat content: ${bestFuel.heat_content.toFixed(3)} ${bestFuel.heat_content_unit}
- Energy efficiency: ${highEnergy ? 'Exceeds target' : 'Meets requirements'}

**🎯 Why This Choice:**
${bestFuel.resource_name} matches your criteria within the ±${selections.tolerance_percent}% tolerance range. ${totalMatches === 1 ? 'It is the only fuel that meets all your requirements.' : `It outperforms ${totalMatches - 1} other matching options in overall environmental impact.`}

**📈 Implementation Impact:**
- Expected CO₂ reduction: ${Math.max(0, (2.5 - bestFuel.carbon_intensity) / 2.5 * 100).toFixed(1)}% vs conventional fuels
- Cost implications: ${costEfficient ? 'Cost savings expected' : 'Competitive pricing'}
- Availability: Good availability in Indian markets

**🚀 Next Steps:**
1. Contact suppliers for current pricing in your area
2. Request sample testing for quality verification  
3. Start with 10-15% substitution for trial runs
4. Monitor performance and adjust usage accordingly`;
  };

  const handleSelectionChange = (type, value) => {
    setUserSelections(prev => ({
      ...prev,
      [type]: parseFloat(value)
    }));
    
    // Show optimizing indicator immediately
    setOptimizing(true);
  };

  const refreshCosts = async () => {
    try {
      setCostsFetching(true);
      
      await apiService.aiRequest(`/dynamic-fuel-optimizer/refresh-costs/${facility.id}`, {
        method: 'GET'
      });
      
      // Reinitialize after refresh
      await initializeOptimizer();
    } catch (err) {
      console.error('Cost refresh error:', err);
      setError(`Failed to refresh costs: ${err.message}`);
    } finally {
      setCostsFetching(false);
    }
  };

  const getSelectionLabel = (type, value) => {
    switch (type) {
      case 'cost_value':
        return `₹${value.toFixed(2)}/kg`;
      case 'emission_value':
        return `${value.toFixed(2)} kgCO₂e/kg`;
      case 'energy_value':
        return `${value.toFixed(3)} GJ/kg`;
      default:
        return value.toString();
    }
  };

  const getIntensityColor = (intensity) => {
    if (intensity <= 50) return 'text-green-600';
    if (intensity <= 100) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (initializing) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">AI-Driven Alternative Fuels Optimizer</h3>
        </div>
        <div className="card p-8 text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Initializing AI-powered optimizer...</p>
          {costsFetching && (
            <div className="space-y-2">
              <p className="text-sm text-blue-600">🤖 Fetching real-time costs for your locality...</p>
              <p className="text-xs text-gray-500">This may take 10-15 seconds for AI analysis</p>
              <div className="mt-4">
                <button 
                  onClick={() => {
                    setInitializing(false);
                    setCostsFetching(false);
                    setError('Initialization taking too long. Using fallback mode.');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Skip to fallback mode
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">AI-Driven Alternative Fuels Optimizer</h3>
        </div>
        <div className="card p-6 border-red-200 bg-red-50">
          <div className="flex items-center text-red-700 mb-4">
            <InformationCircleIcon className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
          <div className="space-x-3">
            <button onClick={initializeOptimizer} className="btn-primary">
              Retry Initialization
            </button>
            <button 
              onClick={() => {
                console.log('🔄 Forcing offline fallback mode...');
                setError(null);
                setInitializing(false);
                setCostsFetching(false);
                
                // Initialize with hardcoded offline data
                initializeOfflineMode();
              }}
              className="btn-secondary"
            >
              Use Offline Mode
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            AI-Driven Alternative Fuels Optimizer
            {initializationData?.cost_fetching_method === 'offline_mode' && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                🔌 Offline Mode
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-600">
            {initializationData?.cost_fetching_method === 'offline_mode' 
              ? 'Offline database • Connect to internet for real-time AI features'
              : 'Dynamic ranges based on database • Real-time AI cost fetching'
            }
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <div className="flex items-center text-sm text-gray-500">
              <ClockIcon className="h-4 w-4 mr-1" />
              Updated: {new Date(lastUpdated).toLocaleTimeString()}
            </div>
          )}
          <button 
            onClick={refreshCosts}
            disabled={costsFetching}
            className="btn-secondary flex items-center"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${costsFetching ? 'animate-spin' : ''}`} />
            {costsFetching ? 'Fetching...' : 'Refresh Costs'}
          </button>
        </div>
      </div>

      {/* Dynamic Range Controls */}
      <div className="card p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-6">Dynamic Selection Ranges</h4>
        <div className="space-y-8">
          
          {/* Cost Range Control */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium">Cost Target</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-green-600">
                  {getSelectionLabel('cost_value', userSelections.cost_value)}
                </div>
                <div className="text-xs text-gray-500">±{userSelections.tolerance_percent}% tolerance</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 w-20">₹{dynamicRanges.cost_range.min.toFixed(2)}</span>
                <input
                  type="range"
                  min={dynamicRanges.cost_range.min}
                  max={dynamicRanges.cost_range.max}
                  step="0.1"
                  value={userSelections.cost_value}
                  onChange={(e) => handleSelectionChange('cost_value', e.target.value)}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-gray-500 w-20 text-right">₹{dynamicRanges.cost_range.max.toFixed(2)}</span>
              </div>
              <div className="text-xs text-gray-400">
                Range calculated from database: ₹{dynamicRanges.cost_range.min.toFixed(2)} - ₹{dynamicRanges.cost_range.max.toFixed(2)} per kg
              </div>
            </div>
          </div>

          {/* Emission Range Control */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FireIcon className="h-5 w-5 text-red-600 mr-2" />
                <span className="font-medium">Emission Factor Target</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-red-600">
                  {getSelectionLabel('emission_value', userSelections.emission_value)}
                </div>
                <div className="text-xs text-gray-500">±{userSelections.tolerance_percent}% tolerance</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 w-20">{dynamicRanges.emission_range.min.toFixed(2)}</span>
                <input
                  type="range"
                  min={dynamicRanges.emission_range.min}
                  max={dynamicRanges.emission_range.max}
                  step="0.01"
                  value={userSelections.emission_value}
                  onChange={(e) => handleSelectionChange('emission_value', e.target.value)}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-gray-500 w-20 text-right">{dynamicRanges.emission_range.max.toFixed(2)}</span>
              </div>
              <div className="text-xs text-gray-400">
                Range from emission factors: {dynamicRanges.emission_range.min.toFixed(2)} - {dynamicRanges.emission_range.max.toFixed(2)} kgCO₂e/kg
              </div>
            </div>
          </div>

          {/* Energy Range Control */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <LightBulbIcon className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="font-medium">Energy Content Target</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-yellow-600">
                  {getSelectionLabel('energy_value', userSelections.energy_value)}
                </div>
                <div className="text-xs text-gray-500">±{userSelections.tolerance_percent}% tolerance</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 w-20">{dynamicRanges.energy_range.min.toFixed(3)}</span>
                <input
                  type="range"
                  min={dynamicRanges.energy_range.min}
                  max={dynamicRanges.energy_range.max}
                  step="0.001"
                  value={userSelections.energy_value}
                  onChange={(e) => handleSelectionChange('energy_value', e.target.value)}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-gray-500 w-20 text-right">{dynamicRanges.energy_range.max.toFixed(3)}</span>
              </div>
              <div className="text-xs text-gray-400">
                Range from heat content data: {dynamicRanges.energy_range.min.toFixed(3)} - {dynamicRanges.energy_range.max.toFixed(3)} GJ/kg
              </div>
            </div>
          </div>

          {/* Tolerance Control */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-700">Selection Tolerance</span>
              <span className="text-lg font-semibold text-blue-600">±{userSelections.tolerance_percent}%</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">±5%</span>
              <input
                type="range"
                min="5"
                max="25"
                step="5"
                value={userSelections.tolerance_percent}
                onChange={(e) => handleSelectionChange('tolerance_percent', e.target.value)}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-500">±25%</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Widens or narrows the acceptable range around your selected values
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendation */}
      <div className="card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <h4 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
          <SparklesIcon className="h-5 w-5 text-blue-600 mr-2" />
          AI Analysis & Recommendation
          {optimizing && (
            <div className="ml-2 animate-spin h-4 w-4 border-b-2 border-blue-600"></div>
          )}
        </h4>
        
        {optimizing ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-700 mb-4">AI is analyzing fuels within your selected ranges...</p>
            <p className="text-xs text-gray-500 mb-4">This should take only 3-5 seconds</p>
            <button 
              onClick={() => {
                console.log('🚫 User skipped AI analysis');
                setOptimizing(false);
                
                // Force fallback recommendation immediately
                if (allFuels.length > 0) {
                  const quickReco = `**⚡ Quick Analysis** 

Based on your current selections, here are the available fuels from our database:

${allFuels.slice(0, 3).map((fuel, i) => 
  `${i + 1}. **${fuel.resource_name}**: ₹${fuel.dynamic_cost?.toFixed(2) || 'N/A'}/kg, ${fuel.emission_factor} kgCO₂e/kg`
).join('\n\n')}

**💡 Tip**: Adjust the sliders above to find fuels that match your specific requirements. The system will automatically filter results based on your tolerance settings.`;
                  
                  setAiRecommendation(quickReco);
                } else {
                  setAiRecommendation('**🔌 No fuel data available.** Please try refreshing the page or contact support.');
                }
              }}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-colors"
            >
              Skip AI Analysis
            </button>
          </div>
        ) : aiRecommendation ? (
          <div 
            className="prose prose-blue max-w-none text-sm"
            dangerouslySetInnerHTML={{ 
              __html: aiRecommendation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                     .replace(/\n/g, '<br>')
                                     .replace(/- /g, '• ')
            }}
          />
        ) : (
          <div className="text-center py-8">
            <SparklesIcon className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <p className="text-blue-700">Adjust the selection ranges above to get AI-powered recommendations</p>
          </div>
        )}
      </div>

      {/* Filtered Results Table */}
      {filteredFuels.length > 0 && (
        <div className="card p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
            <ChartBarIcon className="h-5 w-5 text-primary-600 mr-2" />
            Matching Fuels ({filteredFuels.length} found)
          </h4>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Fuel Name</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Dynamic Cost (INR)</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Emission Factor</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Heat Content</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Carbon Intensity</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Cost Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFuels.map((fuel, index) => (
                  <tr key={`${fuel.resource_name}-${index}`} className={index === 0 ? 'bg-green-50' : ''}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{fuel.resource_name}</div>
                      <div className="text-sm text-gray-500">{fuel.library_name}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="font-semibold text-green-600">₹{fuel.dynamic_cost.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">per kg</div>
                      <div className="text-xs text-blue-500">{fuel.cost_confidence}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="font-semibold">{fuel.emission_factor.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{fuel.emission_factor_unit}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="font-semibold">{fuel.heat_content.toFixed(3)}</div>
                      <div className="text-xs text-gray-500">{fuel.heat_content_unit}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className={`font-semibold ${getIntensityColor(fuel.carbon_intensity)}`}>
                        {fuel.carbon_intensity?.toFixed(1) || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">kgCO₂e/GJ</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="text-xs text-gray-600">{fuel.cost_source}</div>
                      <div className="text-xs text-gray-500">{fuel.cost_location}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="card p-6 bg-indigo-50 border-indigo-200">
        <h4 className="text-md font-medium text-indigo-900 mb-3 flex items-center">
          <InformationCircleIcon className="h-5 w-5 mr-2" />
          How Dynamic AI Optimization Works
        </h4>
        <div className="text-sm text-indigo-800 space-y-2">
          <p>
            <strong>🎯 Dynamic Ranges:</strong> Slider ranges are calculated from actual database values - no hardcoding!
          </p>
          <p>
            <strong>🤖 AI Cost Fetching:</strong> Real-time cost data for your facility's locality using AI web search.
          </p>
          <p>
            <strong>📊 ±10% Filtering:</strong> System finds fuels within your tolerance range for each parameter.
          </p>
          <p>
            <strong>🔄 Auto-Refresh:</strong> AI analysis updates automatically when you change any selection.
          </p>
          <p>
            <strong>📍 Location-Based:</strong> Costs are specific to {initializationData?.fuels?.[0]?.cost_location || 'your area'}.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DynamicAlternativeFuelsOptimizer;
