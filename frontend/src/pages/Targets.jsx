import { useState } from 'react';
import { useData } from '../context/DataContext';
import {
  PlusIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  FireIcon,
  BoltIcon,
  GlobeAltIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  LightBulbIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import CreateTargetModal from '../components/modals/CreateTargetModal';
import TargetDetailModal from '../components/modals/TargetDetailModal';

const Targets = () => {
  const { targets, facilities, loading } = useData();
  const [activeTab, setActiveTab] = useState('overview');
  
  const [selectedFacility, setSelectedFacility] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTargetDetail, setSelectedTargetDetail] = useState(null);
  const [isTargetDetailModalOpen, setIsTargetDetailModalOpen] = useState(false);


  const handleViewTargetDetail = (target) => {
    setSelectedTargetDetail(target);
    setIsTargetDetailModalOpen(true);
  };

  const handleCloseTargetDetail = () => {
    setSelectedTargetDetail(null);
    setIsTargetDetailModalOpen(false);
  };
  
  // console.log('Modal state:', isModalOpen);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'ai-suggestions', name: 'AI Suggestions', icon: LightBulbIcon },
  ];

  // Filter targets based on selected filters
  const filteredTargets = targets.filter(target => {
    if (selectedFacility !== 'all' && target.facility_id !== selectedFacility) return false;
    if (selectedStatus !== 'all' && target.status !== selectedStatus) return false;
    return true;
  });

  // Calculate statistics
  const stats = {
    total: targets.length,
    active: targets.filter(t => t.status === 'active').length,
    achieved: targets.filter(t => t.status === 'achieved').length,
    onTrack: targets.filter(t => t.status === 'active' && calculateProgress(t) >= 50).length,
  };

  function calculateProgress(target) {
    // Safety checks for required fields
    if (!target || typeof target.baseline_value !== 'number' || typeof target.target_value !== 'number' || 
        typeof target.baseline_year !== 'number' || typeof target.target_year !== 'number') {
      console.warn('Target missing required numeric fields:', target);
      return 0;
    }

    const currentYear = new Date().getFullYear();
    const totalYears = target.target_year - target.baseline_year;
    const elapsedYears = currentYear - target.baseline_year;
    
    // Avoid division by zero
    if (totalYears <= 0) {
      return target.baseline_year <= currentYear ? 100 : 0;
    }
    
    const timeProgress = Math.min(Math.max((elapsedYears / totalYears) * 100, 0), 100);
    
    // Mock progress calculation - in real app this would use actual data
    const valueChange = target.baseline_value - target.target_value;
    
    // Avoid division by zero
    if (Math.abs(valueChange) < 0.001) {
      return timeProgress; // If target equals baseline, use time-based progress
    }
    
    const mockCurrentValue = target.baseline_value - (valueChange * (timeProgress / 100) * 0.7);
    const actualChange = target.baseline_value - mockCurrentValue;
    const valueProgress = Math.abs(actualChange / valueChange) * 100;
    
    return Math.min(Math.max(valueProgress, 0), 100);
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab 
            stats={stats} 
            targets={filteredTargets} 
            facilities={facilities} 
            onCreateTarget={() => setIsModalOpen(true)}
            onViewTargetDetail={handleViewTargetDetail}
          />
        );
      case 'ai-suggestions':
        return (
          <AISuggestionsTab 
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            facilities={facilities}
          />
        );
      default:
        return (
          <OverviewTab 
            stats={stats} 
            targets={filteredTargets} 
            facilities={facilities} 
            onCreateTarget={() => setIsModalOpen(true)}
            onViewTargetDetail={handleViewTargetDetail}
          />
        );
    }
  };

  return (
    <div className="space-y-6" onClick={() => console.log('Targets container clicked')}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sustainability Targets</h1>
          <p className="text-gray-600">Track and manage your sustainability goals with AI-driven insights</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Target
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-primary-50">
              <ClipboardDocumentListIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Targets</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Targets</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">On Track</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.onTrack}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-success-50">
              <ClipboardDocumentListIcon className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Achieved</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.achieved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select 
            className="input w-auto"
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
          >
            <option value="all">All Facilities</option>
            {facilities.map(facility => (
              <option key={facility.id} value={facility.id}>{facility.name}</option>
            ))}
          </select>

          <select 
            className="input w-auto"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="achieved">Achieved</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {(selectedFacility !== 'all' || selectedStatus !== 'all') && (
            <button 
              onClick={() => {
                setSelectedFacility('all');
                setSelectedStatus('all');
              }}
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon
                className={`-ml-0.5 mr-2 h-5 w-5 ${
                  activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {renderTabContent()}
      </div>


      {/* Create Target Modal */}
      <CreateTargetModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(targetData) => {
          console.log('Target created:', targetData);
          setIsModalOpen(false);
        }}
        facilities={facilities}
      />

      {/* Target Detail Modal */}


      {isTargetDetailModalOpen && selectedTargetDetail && (
        <TargetDetailModal
          isOpen={isTargetDetailModalOpen}
          onClose={handleCloseTargetDetail}
          target={selectedTargetDetail}
          facilities={facilities}
        />
      )}


    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ stats, targets, facilities, onCreateTarget, onViewTargetDetail }) => {
  function calculateProgress(target) {
    // Safety checks for required fields
    if (!target || typeof target.baseline_value !== 'number' || typeof target.target_value !== 'number' || 
        typeof target.baseline_year !== 'number' || typeof target.target_year !== 'number') {
      return 0;
    }

    const currentYear = new Date().getFullYear();
    const totalYears = target.target_year - target.baseline_year;
    const elapsedYears = currentYear - target.baseline_year;
    
    // Avoid division by zero
    if (totalYears <= 0) {
      return target.baseline_year <= currentYear ? 100 : 0;
    }
    
    const timeProgress = Math.min(Math.max((elapsedYears / totalYears) * 100, 0), 100);
    
    // Mock progress calculation
    const valueChange = target.baseline_value - target.target_value;
    
    // Avoid division by zero
    if (Math.abs(valueChange) < 0.001) {
      return timeProgress;
    }
    
    const mockCurrentValue = target.baseline_value - (valueChange * (timeProgress / 100) * 0.7);
    const actualChange = target.baseline_value - mockCurrentValue;
    const valueProgress = Math.abs(actualChange / valueChange) * 100;
    
    return Math.min(Math.max(valueProgress, 0), 100);
  }

  function getTargetIcon(targetType) {
    switch (targetType) {
      case 'emissions_reduction':
        return <GlobeAltIcon className="h-5 w-5 text-green-600" />;
      case 'alternative_fuel':
        return <FireIcon className="h-5 w-5 text-orange-600" />;
      case 'energy_efficiency':
        return <BoltIcon className="h-5 w-5 text-yellow-600" />;
      case 'carbon_neutral':
        return <GlobeAltIcon className="h-5 w-5 text-green-600" />;
      default:
        return <ClipboardDocumentListIcon className="h-5 w-5 text-gray-600" />;
    }
  }

  const recentTargets = targets.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Target Progress Overview</h3>
          <button
            onClick={onCreateTarget}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Create Target</span>
          </button>
        </div>
        <div className="space-y-4">
          {recentTargets.map((target) => {
            const progress = calculateProgress(target);
            const facility = facilities.find(f => f.id === target.facility_id);
            
            return (
              <div key={target.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getTargetIcon(target.target_type)}
                    <div>
                      <h4 className="font-medium text-gray-900">{target.name}</h4>
                      <p className="text-sm text-gray-500">{facility?.name} • {target.target_year}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`badge-${target.status === 'active' ? 'info' : 'success'}`}>
                      {target.status}
                    </span>
                      <button
                        onClick={() => onViewTargetDetail(target)}
                        className="relative group px-3 py-1.5 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600 text-white text-xs font-medium rounded-full hover:from-purple-600 hover:via-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                        title="Get AI-powered insights and recommendations"
                      >
                        <div className="flex items-center space-x-1.5">
                          <svg className="w-3.5 h-3.5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>AI Insights</span>
                          <svg className="w-3 h-3 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      </button>
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        progress >= 70 ? 'bg-green-500' : 
                        progress >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Baseline</span>
                    <div className="font-medium">
                      {typeof target.baseline_value === 'number' ? target.baseline_value.toLocaleString() : 'N/A'} {target.unit || ''}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Current (Est.)</span>
                    <div className="font-medium">
                      {typeof target.baseline_value === 'number' && typeof target.target_value === 'number' 
                        ? (target.baseline_value - ((target.baseline_value - target.target_value) * (progress / 100))).toFixed(1)
                        : 'N/A'
                      } {target.unit || ''}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Target</span>
                    <div className="font-medium">
                      {typeof target.target_value === 'number' ? target.target_value.toLocaleString() : 'N/A'} {target.unit || ''}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Types Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Target Types</h3>
          <div className="space-y-3">
            {[
              { type: 'emissions_reduction', label: 'Emissions Reduction', count: targets.filter(t => t.target_type === 'emissions_reduction').length, color: 'bg-green-500' },
              { type: 'alternative_fuel', label: 'Alternative Fuel', count: targets.filter(t => t.target_type === 'alternative_fuel').length, color: 'bg-orange-500' },
              { type: 'energy_efficiency', label: 'Energy Efficiency', count: targets.filter(t => t.target_type === 'energy_efficiency').length, color: 'bg-yellow-500' },
              { type: 'carbon_neutral', label: 'Carbon Neutral', count: targets.filter(t => t.target_type === 'carbon_neutral').length, color: 'bg-blue-500' },
            ].map((item) => (
              <div key={item.type} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Deadlines</h3>
          <div className="space-y-3">
            {targets
              .filter(t => t.status === 'active')
              .sort((a, b) => a.target_year - b.target_year)
              .slice(0, 4)
              .map((target) => {
                const facility = facilities.find(f => f.id === target.facility_id);
                const yearsLeft = target.target_year - new Date().getFullYear();
                
                return (
                  <div key={target.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{target.name}</div>
                      <div className="text-xs text-gray-500">{facility?.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{target.target_year}</div>
                      <div className="text-xs text-gray-500">
                        {yearsLeft > 0 ? `${yearsLeft} years left` : 'Overdue'}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};



// AI Suggestions Tab Component
const AISuggestionsTab = ({ isModalOpen, setIsModalOpen, facilities }) => {
  const aiSuggestions = [
    {
      id: 1,
      type: 'emissions_reduction',
      title: 'Reduce Scope 1 Emissions by 25%',
      description: 'Based on your current fuel mix and regional alternative fuel availability, switching to 30% biomass could reduce emissions by 25% by 2030.',
      confidence: 85,
      impact: 'High',
      feasibility: 'Medium',
      timeline: '2030',
      reasoning: 'High biomass availability in your region, existing infrastructure can be adapted',
    },
    {
      id: 2,
      type: 'energy_efficiency',
      title: 'Improve Energy Efficiency by 15%',
      description: 'Implementing waste heat recovery systems and optimizing kiln operations could reduce energy consumption by 15%.',
      confidence: 78,
      impact: 'Medium',
      feasibility: 'High',
      timeline: '2027',
      reasoning: 'Proven technology with rapid ROI, minimal operational disruption',
    },
    {
      id: 3,
      type: 'alternative_fuel',
      title: 'Increase Alternative Fuel Rate to 50%',
      description: 'Gradual transition to 50% alternative fuels using local agricultural waste and RDF could be achieved by 2032.',
      confidence: 72,
      impact: 'High',
      feasibility: 'Medium',
      timeline: '2032',
      reasoning: 'Strong regional waste supply chain, requires infrastructure investment',
    },
  ];

  function getSuggestionIcon(type) {
    switch (type) {
      case 'emissions_reduction':
        return <GlobeAltIcon className="h-6 w-6 text-green-600" />;
      case 'energy_efficiency':
        return <BoltIcon className="h-6 w-6 text-yellow-600" />;
      case 'alternative_fuel':
        return <FireIcon className="h-6 w-6 text-orange-600" />;
      default:
        return <LightBulbIcon className="h-6 w-6 text-blue-600" />;
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6 bg-blue-50 border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <LightBulbIcon className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">AI-Powered Target Suggestions</h3>
        </div>
        <p className="text-gray-700">
          Based on your facility data, industry benchmarks, and regional opportunities, our AI has identified 
          these potential sustainability targets. These suggestions consider feasibility, impact, and your current performance.
        </p>
      </div>

      <div className="space-y-6">
        {aiSuggestions.map((suggestion) => (
          <div key={suggestion.id} className="card p-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-lg bg-gray-50">
                {getSuggestionIcon(suggestion.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-medium text-gray-900">{suggestion.title}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Confidence: {suggestion.confidence}%</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${suggestion.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{suggestion.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500">Impact</div>
                    <div className={`font-medium ${
                      suggestion.impact === 'High' ? 'text-green-600' : 
                      suggestion.impact === 'Medium' ? 'text-yellow-600' : 'text-gray-600'
                    }`}>
                      {suggestion.impact}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500">Feasibility</div>
                    <div className={`font-medium ${
                      suggestion.feasibility === 'High' ? 'text-green-600' : 
                      suggestion.feasibility === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {suggestion.feasibility}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500">Timeline</div>
                    <div className="font-medium text-gray-900">{suggestion.timeline}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500">Confidence</div>
                    <div className="font-medium text-blue-600">{suggestion.confidence}%</div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="text-sm text-blue-800">
                    <strong>AI Reasoning:</strong> {suggestion.reasoning}
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button className="btn-secondary">
                    Learn More
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Create Target
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Targets;
