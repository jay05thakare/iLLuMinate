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
  const [benchmarkData, setBenchmarkData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get facility performance from actual data or show empty state
  const facilityPerformance = facility?.performance || {
    carbon_intensity: null,
    energy_intensity: null,
    alternative_fuel_rate: null,
    renewable_energy_rate: null,
    water_intensity: null,
    waste_to_landfill: null,
  };

  const metrics = [
    {
      id: 'carbon_intensity',
      name: 'Carbon Intensity',
      unit: 'kgCO2e/tonne',
      description: 'Total CO2 emissions per tonne of cement produced',
      icon: '🏭',
      industryAvg: benchmarkData.find(b => b.metric === 'carbon_intensity')?.industry_avg || null,
      industryBest: benchmarkData.find(b => b.metric === 'carbon_intensity')?.industry_best || null,
      currentValue: facilityPerformance.carbon_intensity,
    },
    {
      id: 'energy_intensity',
      name: 'Energy Intensity',
      unit: 'GJ/tonne',
      description: 'Total energy consumption per tonne of cement',
      icon: '⚡',
      industryAvg: benchmarkData.find(b => b.metric === 'energy_intensity')?.industry_avg || null,
      industryBest: benchmarkData.find(b => b.metric === 'energy_intensity')?.industry_best || null,
      currentValue: facilityPerformance.energy_intensity,
    },
    {
      id: 'alternative_fuel_rate',
      name: 'Alternative Fuel Rate',
      unit: '%',
      description: 'Percentage of energy from alternative fuels',
      icon: '🔥',
      industryAvg: benchmarkData.find(b => b.metric === 'alternative_fuel_rate')?.industry_avg || null,
      industryBest: benchmarkData.find(b => b.metric === 'alternative_fuel_rate')?.industry_best || null,
      currentValue: facilityPerformance.alternative_fuel_rate,
    },
    {
      id: 'renewable_energy_rate',
      name: 'Renewable Energy Rate',
      unit: '%',
      description: 'Percentage of electricity from renewable sources',
      icon: '🌱',
      industryAvg: benchmarkData.find(b => b.metric === 'renewable_energy_rate')?.industry_avg || null,
      industryBest: benchmarkData.find(b => b.metric === 'renewable_energy_rate')?.industry_best || null,
      currentValue: facilityPerformance.renewable_energy_rate,
    },
    {
      id: 'water_intensity',
      name: 'Water Intensity',
      unit: 'm³/tonne',
      description: 'Water consumption per tonne of cement',
      icon: '💧',
      industryAvg: benchmarkData.find(b => b.metric === 'water_intensity')?.industry_avg || null,
      industryBest: benchmarkData.find(b => b.metric === 'water_intensity')?.industry_best || null,
      currentValue: facilityPerformance.water_intensity,
    },
    {
      id: 'waste_to_landfill',
      name: 'Waste to Landfill',
      unit: 'kg/tonne',
      description: 'Waste sent to landfill per tonne of cement',
      icon: '🗑️',
      industryAvg: benchmarkData.find(b => b.metric === 'waste_to_landfill')?.industry_avg || null,
      industryBest: benchmarkData.find(b => b.metric === 'waste_to_landfill')?.industry_best || null,
      currentValue: facilityPerformance.waste_to_landfill,
    },
  ];

  const currentMetric = metrics.find(m => m.id === selectedMetric);

  const calculatePercentile = (value, metric) => {
    // Return null if no data available
    if (!value || !metric.industryAvg || !metric.industryBest) {
      return null;
    }
    
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
    if (percentile === null) return { level: 'No Data', color: 'gray', icon: InformationCircleIcon };
    if (percentile >= 80) return { level: 'Excellent', color: 'success', icon: TrophyIcon };
    if (percentile >= 60) return { level: 'Good', color: 'primary', icon: ArrowTrendingUpIcon };
    if (percentile >= 40) return { level: 'Average', color: 'warning', icon: ChartBarIcon };
    return { level: 'Below Average', color: 'danger', icon: ArrowTrendingDownIcon };
  };

  const percentile = calculatePercentile(currentMetric.currentValue, currentMetric);
  const performance = getPerformanceLevel(percentile);

  // Dynamic peer data based on available benchmark data
  const peerData = [];
  
  if (currentMetric.industryBest !== null) {
    peerData.push({ name: 'Industry Leader', value: currentMetric.industryBest, isTarget: true });
  }
  if (currentMetric.industryAvg !== null) {
    peerData.push({ name: 'Industry Average', value: currentMetric.industryAvg, isAverage: true });
  }
  if (currentMetric.currentValue !== null) {
    peerData.push({ name: facility?.name || 'Your Facility', value: currentMetric.currentValue, isCurrent: true });
  }
  
  // Add additional peer data from benchmark data if available
  const additionalPeers = benchmarkData.filter(b => b.metric === selectedMetric && b.peer_data);
  additionalPeers.forEach(peer => {
    peerData.push({
      name: peer.peer_name || 'Peer',
      value: peer.peer_value,
      isPeer: true
    });
  });

  // Sort peer data
  peerData.sort((a, b) => {
    if (!a.value || !b.value) return 0;
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
                {currentMetric.currentValue !== null ? `${currentMetric.currentValue} ${currentMetric.unit}` : 'No Data'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Percentile Rank</span>
              <span className={`text-lg font-bold text-${performance.color}-600`}>
                {percentile !== null ? `${Math.round(percentile)}th` : 'N/A'}
              </span>
            </div>
            {percentile !== null ? (
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`bg-${performance.color}-500 h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${percentile}%` }}
                ></div>
              </div>
            ) : (
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gray-300 h-3 rounded-full"></div>
              </div>
            )}
          </div>
        </div>

        {/* Industry Comparison */}
        <div className="card p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Industry Comparison</h4>
          {currentMetric.industryBest !== null || currentMetric.industryAvg !== null ? (
            <div className="space-y-3">
              {currentMetric.industryBest !== null && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Industry Best</span>
                  <span className="text-sm font-medium text-success-600">
                    {currentMetric.industryBest} {currentMetric.unit}
                  </span>
                </div>
              )}
              {currentMetric.industryAvg !== null && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Industry Average</span>
                  <span className="text-sm font-medium text-gray-900">
                    {currentMetric.industryAvg} {currentMetric.unit}
                  </span>
                </div>
              )}
              {currentMetric.currentValue !== null && currentMetric.industryBest !== null && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Gap to Best</span>
                  <span className={`text-sm font-medium ${
                    currentMetric.currentValue > currentMetric.industryBest ? 'text-danger-600' : 'text-success-600'
                  }`}>
                    {Math.abs(currentMetric.currentValue - currentMetric.industryBest).toFixed(1)} {currentMetric.unit}
                  </span>
                </div>
              )}
              {currentMetric.currentValue !== null && currentMetric.industryAvg !== null && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Gap to Average</span>
                  <span className={`text-sm font-medium ${
                    currentMetric.currentValue > currentMetric.industryAvg ? 'text-danger-600' : 'text-success-600'
                  }`}>
                    {Math.abs(currentMetric.currentValue - currentMetric.industryAvg).toFixed(1)} {currentMetric.unit}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <InformationCircleIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No industry benchmark data available</p>
            </div>
          )}
        </div>

        {/* Improvement Potential */}
        <div className="card p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Improvement Potential</h4>
          {currentMetric.currentValue !== null ? (
            <div className="space-y-4">
              <div className="bg-primary-50 border border-primary-200 rounded-md p-3">
                <div className="flex items-center mb-2">
                  <InformationCircleIcon className="h-4 w-4 text-primary-600 mr-1" />
                  <span className="text-sm font-medium text-primary-900">Analysis</span>
                </div>
                <p className="text-sm text-primary-800">
                  {percentile !== null 
                    ? `Your facility ranks in the ${Math.round(percentile)}th percentile for ${currentMetric.name.toLowerCase()}.`
                    : `Current value: ${currentMetric.currentValue} ${currentMetric.unit}`
                  }
                </p>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Recommendation:</span>
                {percentile !== null && percentile < 50 
                  ? ' Focus on operational improvements and technology upgrades to move above industry average.'
                  : ' Continue current practices and consider advanced technologies for further improvement.'
                }
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <InformationCircleIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No performance data available for analysis</p>
            </div>
          )}
        </div>
      </div>

      {/* Peer Comparison Chart */}
      <div className="card p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Peer Comparison</h4>
        {peerData.length > 0 ? (
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
        ) : (
          <div className="text-center py-12">
            <InformationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No peer comparison data available</p>
            <p className="text-sm text-gray-400">
              Peer data will appear when benchmark information is loaded.
            </p>
          </div>
        )}
      </div>

      {/* Metric Description */}
      <div className="card p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-2">{currentMetric.name}</h4>
        <p className="text-gray-600 mb-4">{currentMetric.description}</p>
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-2">Current Status</h5>
          <p className="text-sm text-gray-600">
            {currentMetric.currentValue !== null 
              ? `Your facility's current ${currentMetric.name.toLowerCase()} is ${currentMetric.currentValue} ${currentMetric.unit}.`
              : `No current data available for ${currentMetric.name.toLowerCase()}.`
            }
            {currentMetric.industryAvg !== null 
              ? ` Industry average is ${currentMetric.industryAvg} ${currentMetric.unit}.`
              : ' Industry benchmark data not available.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Benchmarking;
