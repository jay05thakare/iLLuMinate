/**
 * Alternative Fuels Optimizer Component
 * Interactive UI for optimizing alternative fuel selection based on cost, emission, and energy preferences
 */

import React, { useState, useEffect } from 'react';
import {
  FireIcon,
  CurrencyDollarIcon,
  LightBulbIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import apiService from '../../services/api';

const AlternativeFuelsOptimizer = ({ facility }) => {
  // State for user preferences
  const [preferences, setPreferences] = useState({
    cost: 5, // Scale of 1-10 (1 = minimize cost, 10 = cost not important)
    emission: 5, // Scale of 1-10 (1 = minimize emissions, 10 = emissions not important)
    energy: 5 // Scale of 1-10 (1 = maximize energy content, 10 = energy not important)
  });

  // State for data
  const [alternativeFuels, setAlternativeFuels] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [topComparison, setTopComparison] = useState([]);
  const [aiRecommendation, setAiRecommendation] = useState('');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load alternative fuels data on component mount
  useEffect(() => {
    loadAlternativeFuels();
  }, []);

  // Generate recommendations when preferences change
  useEffect(() => {
    if (alternativeFuels.length > 0) {
      generateRecommendations();
    }
  }, [preferences, alternativeFuels]);

  // Debounced AI recommendation generation
  useEffect(() => {
    if (alternativeFuels.length > 0) {
      // Debounce AI recommendation calls to avoid too many requests
      const timeoutId = setTimeout(() => {
        generateAIRecommendation();
      }, 500); // 500ms delay

      return () => clearTimeout(timeoutId);
    }
  }, [preferences, topComparison]);

  const loadAlternativeFuels = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch emission resources that are alternative fuels
      const resourcesResponse = await apiService.getEmissionResources({
        is_alternative_fuel: true,
        scope: 'scope1'
      });

      if (resourcesResponse.success) {
        const alternativeFuelIds = resourcesResponse.data.resources.map(r => r.id);
        
        // Fetch emission factors for these resources
        const factorsPromises = alternativeFuelIds.map(resourceId =>
          apiService.getEmissionFactors({ resourceId })
        );

        const factorsResponses = await Promise.all(factorsPromises);
        
        const fuelsWithFactors = resourcesResponse.data.resources.map((resource, index) => {
          const factorsResponse = factorsResponses[index];
          const factors = factorsResponse.success ? factorsResponse.data.factors : [];
          
          return {
            ...resource,
            emissionFactors: factors
          };
        });

        setAlternativeFuels(fuelsWithFactors);
      }
    } catch (err) {
      console.error('Error loading alternative fuels:', err);
      setError('Failed to load alternative fuels data');
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = () => {
    const scoredFuels = [];

    alternativeFuels.forEach(fuel => {
      fuel.emissionFactors.forEach(factor => {
        // Calculate scores based on user preferences
        const emissionScore = calculateEmissionScore(factor.emissionFactor, preferences.emission);
        const costScore = calculateCostScore(factor.approximateCost, preferences.cost);
        const energyScore = calculateEnergyScore(factor.heatContent, preferences.energy);
        
        // Calculate overall score (weighted average)
        const overallScore = (emissionScore + costScore + energyScore) / 3;
        
        // Calculate carbon intensity (emissions per unit energy)
        const carbonIntensity = factor.heatContent > 0 
          ? factor.emissionFactor / factor.heatContent 
          : factor.emissionFactor;

        scoredFuels.push({
          id: `${fuel.id}-${factor.id}`,
          fuelName: fuel.resource_name,
          fuelCategory: fuel.category,
          fuelDescription: fuel.description,
          emissionFactor: factor.emissionFactor,
          emissionFactorUnit: factor.emissionFactorUnit,
          heatContent: factor.heatContent,
          heatContentUnit: factor.heatContentUnit,
          approximateCost: factor.approximateCost,
          costUnit: factor.costUnit,
          availabilityScore: factor.availabilityScore,
          library: factor.library,
          carbonIntensity,
          emissionScore,
          costScore,
          energyScore,
          overallScore
        });
      });
    });

    // Sort by overall score (higher is better)
    const sortedRecommendations = scoredFuels
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 6); // Top 6 recommendations

    setRecommendations(sortedRecommendations);
    
    // Set top 3 for comparison table
    setTopComparison(sortedRecommendations.slice(0, 3));
  };

  const generateAIRecommendation = async () => {
    try {
      setAiAnalyzing(true);
      setAiRecommendation(''); // Clear previous recommendation
      
      const response = await apiService.aiRequest('/fuel-cost-analysis/analyze', {
        method: 'POST',
        body: JSON.stringify({
          facility_id: facility.id,
          preferences: {
            cost: preferences.cost,
            emission: preferences.emission,
            energy: preferences.energy
          }
        })
      });

      if (response.success && response.data) {
        setAiRecommendation(response.data.recommendation || '');
      } else {
        // Fallback to local AI analysis if service unavailable
        generateLocalAIRecommendation();
      }
    } catch (err) {
      console.error('Error generating AI recommendation:', err);
      // Fallback to local analysis
      generateLocalAIRecommendation();
    } finally {
      setAiAnalyzing(false);
    }
  };

  const generateLocalAIRecommendation = () => {
    if (topComparison.length === 0) return;

    const topFuel = topComparison[0];
    const secondFuel = topComparison[1];
    const thirdFuel = topComparison[2];

    const costPriorityText = preferences.cost <= 3 ? "high cost optimization" : 
                           preferences.cost >= 7 ? "flexible cost approach" : "balanced cost consideration";
    const emissionPriorityText = preferences.emission <= 3 ? "strict emission reduction" : 
                                preferences.emission >= 7 ? "flexible emission approach" : "balanced emission consideration";
    const energyPriorityText = preferences.energy <= 3 ? "high energy efficiency" : 
                              preferences.energy >= 7 ? "flexible energy approach" : "balanced energy consideration";

    const inrCost = getIndianMarketCost(topFuel.fuelName);
    
    let recommendation = `**🏆 AI Analysis - Updated Based on Your Preferences**

Based on your current settings (${costPriorityText}, ${emissionPriorityText}, ${energyPriorityText}), **${topFuel.fuelName}** emerges as the optimal choice.

**💰 Economic Analysis:**
- Cost: ₹${inrCost.toFixed(2)} per kg
- Energy efficiency: ${topFuel.heatContent?.toFixed(3) || 'N/A'} GJ/kg
- Carbon intensity: ${topFuel.carbonIntensity?.toFixed(1) || 'N/A'} kgCO₂e/GJ

**🔄 Dynamic Recommendation:**
Your preference for `;

    if (preferences.cost <= 3) {
      recommendation += `low-cost solutions makes ${topFuel.fuelName} ideal due to its competitive pricing of ₹${inrCost.toFixed(2)} per kg.`;
    } else if (preferences.emission <= 3) {
      recommendation += `environmental impact prioritizes ${topFuel.fuelName} with its carbon intensity of ${topFuel.carbonIntensity?.toFixed(1)} kgCO₂e/GJ.`;
    } else if (preferences.energy <= 3) {
      recommendation += `energy efficiency favors ${topFuel.fuelName} with ${topFuel.heatContent?.toFixed(3)} GJ/kg heat content.`;
    } else {
      recommendation += `balanced approach makes ${topFuel.fuelName} the best overall choice considering all factors.`;
    }

    if (secondFuel) {
      recommendation += `

**⚖️ Alternative Consideration:**
${secondFuel.fuelName} ranks second with a score of ${secondFuel.overallScore?.toFixed(1)}, offering different trade-offs based on your priorities.`;
    }

    recommendation += `

**📊 Impact Analysis:**
- Switching to ${topFuel.fuelName} could reduce CO₂ emissions by approximately ${((2.5 - (topFuel.carbonIntensity || 0)) / 2.5 * 100).toFixed(1)}% compared to conventional fuels
- Cost implications: ${inrCost < 6 ? 'Significant cost savings expected' : inrCost < 8 ? 'Moderate cost impact' : 'Premium option with environmental benefits'}
- Implementation: Start with 15-20% substitution to evaluate performance`;

    setAiRecommendation(recommendation);
  };

  const calculateEmissionScore = (emissionFactor, preference) => {
    // Lower emission factor is better when preference is low (minimize emissions)
    // Scale: 1-10 where 10 is best
    const normalizedFactor = Math.min(emissionFactor / 5, 1); // Normalize to 0-1
    const baseScore = (1 - normalizedFactor) * 10;
    
    // Adjust based on user preference
    if (preference <= 3) {
      // High priority on low emissions
      return baseScore * 1.5;
    } else if (preference >= 7) {
      // Low priority on emissions
      return 5 + (baseScore * 0.3);
    }
    return baseScore;
  };

  const calculateCostScore = (cost, preference) => {
    if (!cost) return 5; // Neutral score if cost not available
    
    // Lower cost is better when preference is low (minimize cost)
    const normalizedCost = Math.min(cost / 2, 1); // Normalize to 0-1
    const baseScore = (1 - normalizedCost) * 10;
    
    // Adjust based on user preference
    if (preference <= 3) {
      // High priority on low cost
      return baseScore * 1.5;
    } else if (preference >= 7) {
      // Low priority on cost
      return 5 + (baseScore * 0.3);
    }
    return baseScore;
  };

  const calculateEnergyScore = (heatContent, preference) => {
    if (!heatContent) return 5; // Neutral score if heat content not available
    
    // Higher heat content is better when preference is low (maximize energy)
    const normalizedHeat = Math.min(heatContent / 0.04, 1); // Normalize to 0-1
    const baseScore = normalizedHeat * 10;
    
    // Adjust based on user preference
    if (preference <= 3) {
      // High priority on high energy content
      return baseScore * 1.5;
    } else if (preference >= 7) {
      // Low priority on energy content
      return 5 + (baseScore * 0.3);
    }
    return baseScore;
  };

  // Convert USD to INR
  const convertToINR = (usdAmount) => {
    const USD_TO_INR_RATE = 83.50; // Current exchange rate
    return usdAmount ? usdAmount * USD_TO_INR_RATE : null;
  };

  // Get Indian market cost for fuel
  const getIndianMarketCost = (fuelName) => {
    const indianCosts = {
      'Biomass': 8.50,
      'Waste-derived Fuel': 6.20,
      'Used Tires': 4.80,
      'Agricultural Waste': 5.30,
      'Rice Husk': 3.20,
      'Cotton Stalks': 4.50
    };
    return indianCosts[fuelName] || 7.00; // Default if not found
  };

  const handlePreferenceChange = (type, value) => {
    setPreferences(prev => ({
      ...prev,
      [type]: value
    }));
    
    // Show that AI is analyzing when sliders change
    setAiAnalyzing(true);
  };

  const getPreferenceLabel = (type, value) => {
    const labels = {
      cost: {
        1: 'Minimize Cost',
        2: 'Very Low Cost Priority',
        3: 'Low Cost Priority',
        4: 'Somewhat Low Cost Priority',
        5: 'Balanced',
        6: 'Somewhat High Cost Tolerance',
        7: 'High Cost Tolerance',
        8: 'Very High Cost Tolerance',
        9: 'Cost Not Important',
        10: 'Cost Irrelevant'
      },
      emission: {
        1: 'Minimize Emissions',
        2: 'Very Low Emission Priority',
        3: 'Low Emission Priority',
        4: 'Somewhat Low Emission Priority',
        5: 'Balanced',
        6: 'Somewhat High Emission Tolerance',
        7: 'High Emission Tolerance',
        8: 'Very High Emission Tolerance',
        9: 'Emissions Not Important',
        10: 'Emissions Irrelevant'
      },
      energy: {
        1: 'Maximize Energy Content',
        2: 'Very High Energy Priority',
        3: 'High Energy Priority',
        4: 'Somewhat High Energy Priority',
        5: 'Balanced',
        6: 'Somewhat Low Energy Priority',
        7: 'Low Energy Priority',
        8: 'Very Low Energy Priority',
        9: 'Energy Not Important',
        10: 'Energy Irrelevant'
      }
    };
    return labels[type][value] || 'Unknown';
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getIntensityColor = (intensity) => {
    if (intensity <= 50) return 'text-green-600';
    if (intensity <= 100) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Alternative Fuels Optimizer</h3>
        </div>
        <div className="card p-8 text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading alternative fuels data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Alternative Fuels Optimizer</h3>
        </div>
        <div className="card p-6 border-red-200 bg-red-50">
          <div className="flex items-center text-red-700">
            <InformationCircleIcon className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Alternative Fuels Optimizer</h3>
        <button 
          onClick={loadAlternativeFuels}
          className="btn-secondary"
          disabled={loading}
        >
          <SparklesIcon className="h-4 w-4 mr-2" />
          Refresh Data
        </button>
      </div>

      {/* Preference Controls */}
      <div className="card p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-6">Optimization Preferences</h4>
        <div className="space-y-6">
          {/* Cost Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium">Cost Priority</span>
              </div>
              <span className="text-sm text-gray-600">
                {getPreferenceLabel('cost', preferences.cost)}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-500 w-16">Minimize</span>
              <input
                type="range"
                min="1"
                max="10"
                value={preferences.cost}
                onChange={(e) => handlePreferenceChange('cost', parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-gray-500 w-16 text-right">Ignore</span>
            </div>
            <div className="text-xs text-gray-400">
              Current setting: {preferences.cost}/10
            </div>
          </div>

          {/* Emission Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FireIcon className="h-5 w-5 text-red-600 mr-2" />
                <span className="font-medium">Emission Priority</span>
              </div>
              <span className="text-sm text-gray-600">
                {getPreferenceLabel('emission', preferences.emission)}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-500 w-16">Minimize</span>
              <input
                type="range"
                min="1"
                max="10"
                value={preferences.emission}
                onChange={(e) => handlePreferenceChange('emission', parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-gray-500 w-16 text-right">Ignore</span>
            </div>
            <div className="text-xs text-gray-400">
              Current setting: {preferences.emission}/10
            </div>
          </div>

          {/* Energy Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <LightBulbIcon className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="font-medium">Energy Priority</span>
              </div>
              <span className="text-sm text-gray-600">
                {getPreferenceLabel('energy', preferences.energy)}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-500 w-16">Maximize</span>
              <input
                type="range"
                min="1"
                max="10"
                value={preferences.energy}
                onChange={(e) => handlePreferenceChange('energy', parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-gray-500 w-16 text-right">Ignore</span>
            </div>
            <div className="text-xs text-gray-400">
              Current setting: {preferences.energy}/10
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Fuel Comparison Table */}
      {topComparison.length > 0 && (
        <div className="card p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
            <ChartBarIcon className="h-5 w-5 text-primary-600 mr-2" />
            Top 3 Alternative Fuels Comparison
          </h4>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">Rank</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">Fuel Name</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 border-b">Emission Factor</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 border-b">Heat Content</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 border-b">Cost (INR)</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 border-b">Carbon Intensity</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 border-b">Overall Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topComparison.map((fuel, index) => {
                  const inrCost = getIndianMarketCost(fuel.fuelName);
                  const rankColor = index === 0 ? 'text-green-600 bg-green-100' : 
                                   index === 1 ? 'text-yellow-600 bg-yellow-100' : 
                                   'text-orange-600 bg-orange-100';
                  const rankIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
                  
                  return (
                    <tr key={fuel.id} className={index === 0 ? 'bg-green-50' : ''}>
                      <td className="px-4 py-3 border-b">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${rankColor}`}>
                            {rankIcon} #{index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b">
                        <div className="font-medium text-gray-900">{fuel.fuelName}</div>
                        <div className="text-sm text-gray-500">{fuel.library?.name || 'Database'}</div>
                      </td>
                      <td className="px-4 py-3 border-b text-center">
                        <div className="font-semibold text-gray-900">
                          {fuel.emissionFactor?.toFixed(2) || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">{fuel.emissionFactorUnit}</div>
                      </td>
                      <td className="px-4 py-3 border-b text-center">
                        <div className="font-semibold text-gray-900">
                          {fuel.heatContent?.toFixed(3) || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">{fuel.heatContentUnit}</div>
                      </td>
                      <td className="px-4 py-3 border-b text-center">
                        <div className="font-semibold text-gray-900">
                          ₹{inrCost.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">per kg</div>
                      </td>
                      <td className="px-4 py-3 border-b text-center">
                        <div className={`font-semibold ${getIntensityColor(fuel.carbonIntensity)}`}>
                          {fuel.carbonIntensity?.toFixed(1) || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">kgCO₂e/GJ</div>
                      </td>
                      <td className="px-4 py-3 border-b text-center">
                        <div className={`font-semibold px-2 py-1 rounded text-sm ${getScoreColor(fuel.overallScore)}`}>
                          {fuel.overallScore?.toFixed(1) || 'N/A'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Note:</strong> Rankings update automatically based on your preference settings. Emission factors are sourced from verified databases.</p>
          </div>
        </div>
      )}

      {/* AI-Powered Analysis & Recommendation */}
      <div className="card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <h4 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
          <SparklesIcon className="h-5 w-5 text-blue-600 mr-2" />
          AI-Powered Cost & Environmental Analysis
          {aiAnalyzing && (
            <div className="ml-2 animate-spin h-4 w-4 border-b-2 border-blue-600"></div>
          )}
        </h4>
        
        {aiAnalyzing ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-700">AI is analyzing your preferences and generating recommendations...</p>
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
            <p className="text-blue-700">Adjust the preference sliders above to get AI-powered recommendations</p>
          </div>
        )}
      </div>

      {/* AI Recommendations */}
      <div className="card p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
          <SparklesIcon className="h-5 w-5 text-primary-600 mr-2" />
          Detailed Fuel Rankings
        </h4>

        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No recommendations available. Please check your preferences.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((fuel, index) => (
              <div
                key={fuel.id}
                className={`border rounded-lg p-4 ${
                  index === 0 
                    ? 'border-green-200 bg-green-50' 
                    : index < 3 
                      ? 'border-yellow-200 bg-yellow-50' 
                      : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      {index === 0 && <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />}
                      <h5 className="font-semibold text-gray-900">{fuel.fuelName}</h5>
                      <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        Rank #{index + 1}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{fuel.fuelDescription}</p>
                    
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {fuel.emissionFactor?.toFixed(2) || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">{fuel.emissionFactorUnit}</div>
                        <div className="text-xs text-gray-400">Emission Factor</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {fuel.heatContent?.toFixed(3) || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">{fuel.heatContentUnit}</div>
                        <div className="text-xs text-gray-400">Heat Content</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {(() => {
                            const inrCost = getIndianMarketCost(fuel.fuelName);
                            return `₹${inrCost.toFixed(2)}`;
                          })()}
                        </div>
                        <div className="text-xs text-gray-500">per kg</div>
                        <div className="text-xs text-gray-400">Indian Market Cost</div>
                      </div>
                      
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${getIntensityColor(fuel.carbonIntensity)}`}>
                          {fuel.carbonIntensity?.toFixed(1) || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">kgCO2e/GJ</div>
                        <div className="text-xs text-gray-400">Carbon Intensity</div>
                      </div>
                    </div>

                    {/* Scores */}
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-1">Cost Score:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(fuel.costScore)}`}>
                          {fuel.costScore.toFixed(1)}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-1">Emission Score:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(fuel.emissionScore)}`}>
                          {fuel.emissionScore.toFixed(1)}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-1">Energy Score:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(fuel.energyScore)}`}>
                          {fuel.energyScore.toFixed(1)}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-1">Overall:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(fuel.overallScore)}`}>
                          {fuel.overallScore.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Library Info */}
                    <div className="mt-2 text-xs text-gray-500">
                      Data source: {fuel.library.name} {fuel.library.version} ({fuel.library.year}) - {fuel.library.region}
                      {fuel.availabilityScore && (
                        <span className="ml-2">
                          • Availability: {fuel.availabilityScore}/10
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    {index === 0 && (
                      <div className="text-right">
                        <div className="text-xs text-green-600 font-medium mb-1">BEST MATCH</div>
                        <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
                      </div>
                    )}
                    {index > 3 && (
                      <ArrowTrendingDownIcon className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="card p-6 bg-blue-50 border-blue-200">
        <h4 className="text-md font-medium text-blue-900 mb-3 flex items-center">
          <InformationCircleIcon className="h-5 w-5 mr-2" />
          How It Works
        </h4>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>Cost Priority:</strong> Lower values prioritize fuels with lower costs per unit (Indian market prices in INR).
          </p>
          <p>
            <strong>Emission Priority:</strong> Lower values prioritize fuels with lower emission factors (from verified emission factor libraries).
          </p>
          <p>
            <strong>Energy Priority:</strong> Lower values prioritize fuels with higher heat content.
          </p>
          <p>
            <strong>Carbon Intensity:</strong> Calculated as emission factor divided by heat content (kgCO2e/GJ). Lower is better for the environment.
          </p>
          <p>
            <strong>AI Analysis:</strong> Our AI analyzes Indian market costs, emission factors from the database, and provides natural language recommendations.
          </p>
          <p>
            <strong>Scores:</strong> Each fuel gets scored 1-10 for cost, emissions, and energy based on your preferences. Higher scores are better matches.
          </p>
          <p>
            <strong>Currency:</strong> All costs are displayed in Indian Rupees (₹) based on current market rates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AlternativeFuelsOptimizer;
