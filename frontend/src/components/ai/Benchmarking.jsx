import { useState } from 'react';
import { useFacility } from '../../contexts/FacilityContext';
import {
  ChartBarIcon,
  TrophyIcon,
  BuildingOfficeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

const Benchmarking = ({ facilityId }) => {
  const { facilities } = useFacility();
  const [selectedMetric, setSelectedMetric] = useState('carbon_intensity');
  const [selectedRegion, setSelectedRegion] = useState('global');

  const facility = facilities.find(f => f.id === facilityId);
  // Mock benchmark data for now
  const benchmarkData = [];

  // Mock current facility performance
  const facilityPerformance = {
    carbon_intensity: 850, // kgCO2e/tonne
    energy_intensity: 3.2, // GJ/tonne
    alternative_fuel_rate: 15, // %
    renewable_energy_rate: 5, // %
    water_intensity: 0.8, // m3/tonne
    waste_to_landfill: 2.5, // kg/tonne
  };

  const metrics = [
    {
      id: 'carbon_intensity',
      name: 'Carbon Intensity',
      unit: 'kgCO2e/tonne',
      description: 'Total CO2 emissions per tonne of cement produced',
      icon: '🏭',
      industryAvg: 820,
      industryBest: 650,
      currentValue: facilityPerformance.carbon_intensity,
    },
    {
      id: 'energy_intensity',
      name: 'Energy Intensity',
      unit: 'GJ/tonne',
      description: 'Total energy consumption per tonne of cement',
      icon: '⚡',
      industryAvg: 3.0,
      industryBest: 2.6,
      currentValue: facilityPerformance.energy_intensity,
    },
    {
      id: 'alternative_fuel_rate',
      name: 'Alternative Fuel Rate',
      unit: '%',
      description: 'Percentage of energy from alternative fuels',
      icon: '🔥',
      industryAvg: 20,
      industryBest: 45,
      currentValue: facilityPerformance.alternative_fuel_rate,
    },
    {
      id: 'renewable_energy_rate',
      name: 'Renewable Energy Rate',
      unit: '%',
      description: 'Percentage of electricity from renewable sources',
      icon: '🌱',
      industryAvg: 25,
      industryBest: 80,
      currentValue: facilityPerformance.renewable_energy_rate,
    },
    {
      id: 'water_intensity',
      name: 'Water Intensity',
      unit: 'm³/tonne',
      description: 'Water consumption per tonne of cement',
      icon: '💧',
      industryAvg: 0.9,
      industryBest: 0.4,
      currentValue: facilityPerformance.water_intensity,
    },
    {
      id: 'waste_to_landfill',
      name: 'Waste to Landfill',
      unit: 'kg/tonne',
      description: 'Waste sent to landfill per tonne of cement',
      icon: '🗑️',
      industryAvg: 3.2,
      industryBest: 0.5,
      currentValue: facilityPerformance.waste_to_landfill,
    },
  ];

  const currentMetric = metrics.find(m => m.id === selectedMetric);

  const calculatePercentile = (value, metric) => {
    // Mock percentile calculation
    const ratio = (metric.industryAvg - value) / (metric.industryAvg - metric.industryBest);
    
    // For metrics where lower is better
    if (['carbon_intensity', 'energy_intensity', 'water_intensity', 'waste_to_landfill'].includes(metric.id)) {
      return Math.max(0, Math.min(100, 50 + (ratio * 30)));
    }
    // For metrics where higher is better
    else {
      return Math.max(0, Math.min(100, 50 - (ratio * 30)));
    }
  };

  const getPerformanceLevel = (percentile) => {
    if (percentile >= 80) return { level: 'Excellent', color: 'success', icon: TrophyIcon };
    if (percentile >= 60) return { level: 'Good', color: 'primary', icon: ArrowTrendingUpIcon };
    if (percentile >= 40) return { level: 'Average', color: 'warning', icon: ChartBarIcon };
    return { level: 'Below Average', color: 'danger', icon: ArrowTrendingDownIcon };
  };

  const percentile = calculatePercentile(currentMetric.currentValue, currentMetric);
  const performance = getPerformanceLevel(percentile);

  // Mock peer data for comparison
  const peerData = [
    { name: 'Industry Leader', value: currentMetric.industryBest, isTarget: true },
    { name: 'Industry Average', value: currentMetric.industryAvg, isAverage: true },
    { name: facility?.name || 'Your Facility', value: currentMetric.currentValue, isCurrent: true },
    { name: 'Regional Peer A', value: currentMetric.industryAvg * 0.95 },
    { name: 'Regional Peer B', value: currentMetric.industryAvg * 1.1 },
    { name: 'Regional Peer C', value: currentMetric.industryAvg * 0.85 },
  ].sort((a, b) => {
    // Sort based on whether lower or higher is better
    if (['carbon_intensity', 'energy_intensity', 'water_intensity', 'waste_to_landfill'].includes(selectedMetric)) {
      return a.value - b.value; // Lower is better
    } else {
      return b.value - a.value; // Higher is better
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Industry Benchmarking</h3>
          <p className="text-gray-600">Compare your performance with industry peers</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="form-input"
          >
            <option value="global">Global</option>
            <option value="asia">Asia Pacific</option>
            <option value="europe">Europe</option>
            <option value="americas">Americas</option>
          </select>
        </div>
      </div>

      {/* Metric Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((metric) => (
          <button
            key={metric.id}
            onClick={() => setSelectedMetric(metric.id)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedMetric === metric.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="text-2xl mb-2">{metric.icon}</div>
            <div className="text-sm font-medium text-gray-900">{metric.name}</div>
            <div className="text-xs text-gray-500">{metric.unit}</div>
            <div className={`text-lg font-bold mt-1 ${
              selectedMetric === metric.id ? 'text-primary-600' : 'text-gray-900'
            }`}>
              {metric.currentValue}
            </div>
          </button>
        ))}
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Performance */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <div className={`p-3 rounded-lg bg-${performance.color}-100 mr-4`}>
              <performance.icon className={`h-6 w-6 text-${performance.color}-600`} />
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900">Your Performance</h4>
              <p className={`text-sm text-${performance.color}-600 font-medium`}>{performance.level}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Current Value</span>
              <span className="text-lg font-bold text-gray-900">
                {currentMetric.currentValue} {currentMetric.unit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Percentile Rank</span>
              <span className={`text-lg font-bold text-${performance.color}-600`}>
                {Math.round(percentile)}th
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`bg-${performance.color}-500 h-3 rounded-full transition-all duration-500`}
                style={{ width: `${percentile}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Industry Comparison */}
        <div className="card p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Industry Comparison</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Industry Best</span>
              <span className="text-sm font-medium text-success-600">
                {currentMetric.industryBest} {currentMetric.unit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Industry Average</span>
              <span className="text-sm font-medium text-gray-900">
                {currentMetric.industryAvg} {currentMetric.unit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Gap to Best</span>
              <span className={`text-sm font-medium ${
                currentMetric.currentValue > currentMetric.industryBest ? 'text-danger-600' : 'text-success-600'
              }`}>
                {Math.abs(currentMetric.currentValue - currentMetric.industryBest).toFixed(1)} {currentMetric.unit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Gap to Average</span>
              <span className={`text-sm font-medium ${
                currentMetric.currentValue > currentMetric.industryAvg ? 'text-danger-600' : 'text-success-600'
              }`}>
                {Math.abs(currentMetric.currentValue - currentMetric.industryAvg).toFixed(1)} {currentMetric.unit}
              </span>
            </div>
          </div>
        </div>

        {/* Improvement Potential */}
        <div className="card p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Improvement Potential</h4>
          <div className="space-y-4">
            <div className="bg-primary-50 border border-primary-200 rounded-md p-3">
              <div className="flex items-center mb-2">
                <InformationCircleIcon className="h-4 w-4 text-primary-600 mr-1" />
                <span className="text-sm font-medium text-primary-900">Quick Win</span>
              </div>
              <p className="text-sm text-primary-800">
                {selectedMetric === 'carbon_intensity' && 
                  'Optimize kiln operation & increase alternative fuel usage to 25%'
                }
                {selectedMetric === 'energy_intensity' && 
                  'Install waste heat recovery system for 15% energy savings'
                }
                {selectedMetric === 'alternative_fuel_rate' && 
                  'Introduce biomass and RDF to reach 30% substitution'
                }
                {selectedMetric === 'renewable_energy_rate' && 
                  'Switch to renewable electricity contract'
                }
                {selectedMetric === 'water_intensity' && 
                  'Implement water recycling systems'
                }
                {selectedMetric === 'waste_to_landfill' && 
                  'Improve waste segregation and recycling'
                }
              </p>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Potential Impact:</span>
              {selectedMetric === 'carbon_intensity' && ' 10-15% reduction in 12 months'}
              {selectedMetric === 'energy_intensity' && ' 12-18% improvement in 18 months'}
              {selectedMetric === 'alternative_fuel_rate' && ' Reach 30% in 24 months'}
              {selectedMetric === 'renewable_energy_rate' && ' Immediate 20% increase'}
              {selectedMetric === 'water_intensity' && ' 20-30% reduction in 12 months'}
              {selectedMetric === 'waste_to_landfill' && ' 50% reduction in 6 months'}
            </div>
          </div>
        </div>
      </div>

      {/* Peer Comparison Chart */}
      <div className="card p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Peer Comparison</h4>
        <div className="space-y-3">
          {peerData.map((peer, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg ${
                peer.isCurrent ? 'bg-primary-50 border border-primary-200' :
                peer.isTarget ? 'bg-success-50 border border-success-200' :
                peer.isAverage ? 'bg-warning-50 border border-warning-200' :
                'bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  peer.isCurrent ? 'bg-primary-600' :
                  peer.isTarget ? 'bg-success-600' :
                  peer.isAverage ? 'bg-warning-600' :
                  'bg-gray-400'
                }`}></div>
                <span className={`text-sm font-medium ${
                  peer.isCurrent ? 'text-primary-900' : 'text-gray-900'
                }`}>
                  {peer.name}
                </span>
                {peer.isCurrent && (
                  <BuildingOfficeIcon className="h-4 w-4 ml-2 text-primary-600" />
                )}
                {peer.isTarget && (
                  <TrophyIcon className="h-4 w-4 ml-2 text-success-600" />
                )}
              </div>
              <div className="flex items-center">
                <span className={`text-lg font-bold mr-3 ${
                  peer.isCurrent ? 'text-primary-600' : 'text-gray-900'
                }`}>
                  {peer.value} {currentMetric.unit}
                </span>
                <div className={`w-20 h-2 bg-gray-200 rounded-full overflow-hidden`}>
                  <div
                    className={`h-full transition-all duration-500 ${
                      peer.isCurrent ? 'bg-primary-600' :
                      peer.isTarget ? 'bg-success-600' :
                      peer.isAverage ? 'bg-warning-600' :
                      'bg-gray-400'
                    }`}
                    style={{
                      width: `${Math.max(10, Math.min(100, 
                        (peer.value / Math.max(...peerData.map(p => p.value))) * 100
                      ))}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metric Description */}
      <div className="card p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-2">{currentMetric.name}</h4>
        <p className="text-gray-600 mb-4">{currentMetric.description}</p>
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-2">Industry Context</h5>
          <p className="text-sm text-gray-600">
            {selectedMetric === 'carbon_intensity' && 
              'The cement industry accounts for 8% of global CO2 emissions. Leading companies are targeting 25-30% reductions by 2030 through alternative fuels, energy efficiency, and process optimization.'
            }
            {selectedMetric === 'energy_intensity' && 
              'Energy represents 30-40% of cement production costs. Best-in-class facilities achieve 2.6-2.8 GJ/tonne through waste heat recovery, efficient motors, and optimized kiln operations.'
            }
            {selectedMetric === 'alternative_fuel_rate' && 
              'Alternative fuels reduce both emissions and costs. European leaders achieve 40-60% substitution rates while maintaining clinker quality. Common fuels include biomass, RDF, and industrial waste.'
            }
            {selectedMetric === 'renewable_energy_rate' && 
              'Renewable electricity adoption is accelerating with falling costs. Many facilities are installing on-site solar or signing renewable PPAs to reduce Scope 2 emissions.'
            }
            {selectedMetric === 'water_intensity' && 
              'Water scarcity drives efficiency improvements. Leading facilities recycle 90%+ of process water and implement closed-loop cooling systems.'
            }
            {selectedMetric === 'waste_to_landfill' && 
              'Circular economy principles minimize landfill waste. Best facilities achieve near-zero waste through on-site recycling and alternative use programs.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Benchmarking;
