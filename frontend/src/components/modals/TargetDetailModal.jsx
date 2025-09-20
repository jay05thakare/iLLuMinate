import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const TargetDetailModal = ({ isOpen, onClose, target, facilities }) => {
  const [aiInsights, setAiInsights] = useState(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  useEffect(() => {
    if (isOpen && target) {
      generateAIInsights();
    }
  }, [isOpen, target]);

  const generateAIInsights = async () => {
    setIsGeneratingInsights(true);
    
    // Mock AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const progress = calculateProgress(target);
    const currentYear = new Date().getFullYear();
    const isOnTrack = progress >= (((currentYear - target.baseline_year) / (target.target_year - target.baseline_year)) * 100) * 0.8;
    
    let insights;
    
    if (target.name.toLowerCase().includes('net zero')) {
      insights = {
        onTrack: progress >= 20,
        riskLevel: progress >= 20 ? 'low' : 'medium',
        statusMessage: progress >= 20 
          ? 'Excellent progress towards net zero commitment' 
          : 'Acceleration needed to meet 2035 timeline',
        keyFindings: [
          `Currently at ${progress.toFixed(0)}% progress with ${target.target_year - currentYear} years remaining`,
          progress >= 20 
            ? 'Alternative fuel adoption rate exceeds industry average'
            : 'Alternative fuel adoption needs to accelerate to 40%+ by 2028',
          'Carbon capture readiness assessment recommended for 2026',
          'Renewable energy procurement on track for 100MW target'
        ],
        nextSteps: [
          'Increase alternative fuel co-processing from current 25% to 45% by end of 2025',
          'Secure renewable energy PPAs for additional 60MW capacity',
          'Initiate CCUS feasibility study for largest emission sources',
          'Implement energy efficiency measures targeting 15% reduction',
          'Establish green hydrogen pilot program for high-temperature processes'
        ],
        recommendations: [
          'Consider advancing net zero target to 2030 given current momentum',
          'Explore carbon credits for remaining 5-10% hard-to-abate emissions',
          'Invest in breakthrough technologies: cement chemistry alternatives'
        ]
      };
    } else if (target.name.toLowerCase().includes('carbon intensity')) {
      insights = {
        onTrack: progress >= 15,
        riskLevel: progress >= 15 ? 'low' : 'high',
        statusMessage: progress >= 15 
          ? 'Carbon intensity reduction progressing well' 
          : 'Significant acceleration required',
        keyFindings: [
          `${progress.toFixed(0)}% reduction achieved vs. ${target.targetValue}% target`,
          'Clinker substitution potential: 25% increase possible',
          'Current energy intensity: 3.8 GJ/tonne (industry average: 3.5)',
          'Alternative fuel rate: 28% (target: 40%+ for optimal impact)'
        ],
        nextSteps: [
          'Optimize clinker-to-cement ratio: increase SCM usage to 35%',
          'Deploy waste heat recovery systems in remaining kilns',
          'Implement advanced process control for fuel optimization',
          'Scale alternative fuel preprocessing capabilities',
          'Establish local waste fuel supply partnerships'
        ],
        recommendations: [
          'Focus on operational excellence before capital investments',
          'Benchmark against best-in-class facilities (target: 2.8-3.2 GJ/tonne)',
          'Consider intensity-based carbon pricing internal mechanism'
        ]
      };
    } else if (target.name.toLowerCase().includes('energy')) {
      insights = {
        onTrack: progress >= 12,
        riskLevel: progress >= 12 ? 'medium' : 'high',
        statusMessage: progress >= 12 
          ? 'Energy efficiency improvements underway' 
          : 'Energy targets require immediate attention',
        keyFindings: [
          `${progress.toFixed(0)}% progress towards ${target.targetValue}% energy reduction`,
          'Waste heat recovery potential: 15-20% energy savings identified',
          'Motor efficiency upgrades completed in 60% of equipment',
          'Grinding optimization shows 8% efficiency improvement potential'
        ],
        nextSteps: [
          'Complete waste heat recovery installation in remaining 3 kilns',
          'Upgrade to high-efficiency motors and VFDs in grinding operations',
          'Implement predictive maintenance to optimize equipment efficiency',
          'Deploy real-time energy monitoring across all production lines',
          'Optimize grinding operations with high-pressure grinding rolls'
        ],
        recommendations: [
          'Prioritize quick wins: motor upgrades (6-month ROI)',
          'Establish energy management system ISO 50001 certification',
          'Consider energy service company (ESCO) partnerships'
        ]
      };
    } else {
      insights = {
        onTrack: progress >= 25,
        riskLevel: 'medium',
        statusMessage: 'Target progress within expected range',
        keyFindings: [
          `${progress.toFixed(0)}% completion with ${target.target_year - currentYear} years remaining`,
          'Current trajectory suggests target achievable with focused effort',
          'Industry benchmarking shows competitive positioning',
          'Key milestones alignment: quarterly reviews recommended'
        ],
        nextSteps: [
          'Establish monthly progress tracking and reporting',
          'Identify potential acceleration opportunities',
          'Benchmark against industry best practices',
          'Develop contingency plans for timeline risks',
          'Engage stakeholders for additional support'
        ],
        recommendations: [
          'Consider setting intermediate milestones for better tracking',
          'Evaluate resource allocation optimization',
          'Explore collaboration opportunities with industry partners'
        ]
      };
    }
    
    setAiInsights(insights);
    setIsGeneratingInsights(false);
  };

  const calculateProgress = (target) => {
    if (!target || typeof target.baseline_value !== 'number' || typeof target.target_value !== 'number' || 
        typeof target.baseline_year !== 'number' || typeof target.target_year !== 'number') {
      return 0;
    }

    const currentYear = new Date().getFullYear();
    const totalYears = target.target_year - target.baseline_year;
    const elapsedYears = currentYear - target.baseline_year;
    
    if (totalYears <= 0) return target.baseline_year <= currentYear ? 100 : 0;
    
    const timeProgress = Math.min(Math.max((elapsedYears / totalYears) * 100, 0), 100);
    const valueChange = target.baseline_value - target.target_value;
    
    if (Math.abs(valueChange) < 0.001) return timeProgress;
    
    const mockCurrentValue = target.baseline_value - (valueChange * (timeProgress / 100) * 0.7);
    const actualChange = target.baseline_value - mockCurrentValue;
    const valueProgress = Math.abs(actualChange / valueChange) * 100;
    
    return Math.min(Math.max(valueProgress, 0), 100);
  };

  const getStatusIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'low':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'medium':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'high':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'text-green-700 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  if (!isOpen) return null;

  const progress = calculateProgress(target);
  const facility = facilities.find(f => f.id === target.facility_id) || 
                   { name: 'Multiple Facilities' }; // For organization-level targets

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">{target.name}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{facility.name}</span>
                <span>•</span>
                <span>{target.baseline_year} - {target.target_year}</span>
                <span>•</span>
                <span className="capitalize">{target.status}</span>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">Current Progress</h3>
                <div className="text-2xl font-bold text-blue-700">{progress.toFixed(0)}%</div>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div 
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">Baseline ({target.baseline_year})</h3>
                <div className="text-2xl font-bold text-gray-700">
                  {typeof target.baseline_value === 'number' ? target.baseline_value.toLocaleString() : 'N/A'}
                </div>
                <div className="text-sm text-gray-500">{target.unit}</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-medium text-green-900 mb-2">Target ({target.target_year})</h3>
                <div className="text-2xl font-bold text-green-700">
                  {typeof target.target_value === 'number' ? target.target_value.toLocaleString() : 'N/A'}
                </div>
                <div className="text-sm text-green-600">{target.unit}</div>
              </div>
            </div>

            {/* AI Insights Section */}
            <div className="border border-purple-200 rounded-lg p-6 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center mb-4">
                <SparklesIcon className="h-6 w-6 text-purple-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">AI Insights & Recommendations</h3>
                {isGeneratingInsights && (
                  <div className="ml-auto flex items-center text-sm text-purple-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                    Analyzing...
                  </div>
                )}
              </div>

              {isGeneratingInsights ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3"></div>
                  <span className="text-gray-600">Analyzing target performance and generating insights...</span>
                </div>
              ) : aiInsights ? (
                <div className="space-y-6">
                  {/* Status Overview */}
                  <div className={`p-4 rounded-lg border ${getRiskLevelColor(aiInsights.riskLevel)}`}>
                    <div className="flex items-center mb-2">
                      {getStatusIcon(aiInsights.riskLevel)}
                      <span className="ml-2 font-medium">
                        {aiInsights.onTrack ? 'On Track' : 'Needs Attention'}
                      </span>
                    </div>
                    <p className="text-sm">{aiInsights.statusMessage}</p>
                  </div>

                  {/* Key Findings */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Key Findings</h4>
                    <ul className="space-y-2">
                      {aiInsights.keyFindings.map((finding, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-600">
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                          {finding}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Next Steps */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Recommended Next Steps</h4>
                    <ul className="space-y-2">
                      {aiInsights.nextSteps.map((step, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-600">
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Strategic Recommendations */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Strategic Recommendations</h4>
                    <ul className="space-y-2">
                      {aiInsights.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-600">
                          <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Failed to generate insights. Please try again.
                </div>
              )}
            </div>

            {/* Target Description */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Target Description</h4>
              <p className="text-sm text-gray-600">{target.description}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TargetDetailModal;
