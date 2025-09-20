import { useState } from 'react';
import { useData } from '../context/DataContext';
import Benchmarking from '../components/ai/Benchmarking';
import {
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const BenchmarkingPage = () => {
  const { facilities } = useData();
  const [selectedFacility, setSelectedFacility] = useState(facilities[0]?.id || '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600">
            <ChartBarIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Benchmarking</h1>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                <span className="text-xs text-purple-600 font-medium">AI POWERED</span>
              </div>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">Compare your performance with industry peers</span>
            </div>
          </div>
        </div>
        
        {/* Facility Selector */}
        <select
          value={selectedFacility}
          onChange={(e) => setSelectedFacility(e.target.value)}
          className="form-input"
        >
          <option value="">Select Facility</option>
          {facilities.map(facility => (
            <option key={facility.id} value={facility.id}>
              {facility.name}
            </option>
          ))}
        </select>
      </div>

      {/* AI Benchmarking Description */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500">
            <ChartBarIcon className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">AI-Driven Industry Benchmarking</h3>
        </div>
        <p className="text-gray-700 mb-4">
          Leverage artificial intelligence to compare your facility's performance against 
          industry benchmarks, identify improvement opportunities, and understand your 
          competitive position in sustainability metrics.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Carbon Intensity</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Energy Efficiency</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-gray-600">Alternative Fuels</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-gray-600">Peer Comparison</span>
          </div>
        </div>
      </div>

      {/* Benchmarking Component */}
      <div>
        <Benchmarking facilityId={selectedFacility} />
      </div>
    </div>
  );
};

export default BenchmarkingPage;
