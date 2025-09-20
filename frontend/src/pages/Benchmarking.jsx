import { useState, useEffect } from 'react';
import { useOrganization } from '../contexts/OrganizationContext';
import apiService from '../services/api';
import {
  ChartBarIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';

const BenchmarkingPage = () => {
  const { organization } = useOrganization();
  const [activeTab, setActiveTab] = useState('overview');
  const [peerData, setPeerData] = useState([]);
  const [esgData, setEsgData] = useState([]);
  const [targetsData, setTargetsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'environmental', name: 'Environmental', icon: ChartBarIcon },
    { id: 'targets', name: 'Targets & Goals', icon: ChartBarIcon },
    { id: 'sources', name: 'Sources', icon: ChartBarIcon },
  ];

  // Fetch benchmarking data from real API
  useEffect(() => {
    const fetchBenchmarkingData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🏢 Fetching benchmarking data...');
        
        // Fetch peer organizations
        const peerResponse = await apiService.getPeerOrganizations({
          year: new Date().getFullYear()
        });
        
        if (peerResponse.success) {
          console.log('🏢 Peer organizations fetched:', peerResponse.data.organizations);
          setPeerData(peerResponse.data.organizations);
        } else {
          throw new Error(peerResponse.message || 'Failed to fetch peer organizations');
        }

        // Fetch ESG comparison data
        const esgResponse = await apiService.getESGComparison({
          year: new Date().getFullYear()
        });
        
        if (esgResponse.success) {
          console.log('📊 ESG data fetched:', esgResponse.data.organizations);
          setEsgData(esgResponse.data.organizations);
        } else {
          console.warn('ESG data fetch failed:', esgResponse.message);
        }

        // Fetch peer targets
        const targetsResponse = await apiService.getPeerTargets();
        
        if (targetsResponse.success) {
          console.log('🎯 Targets data fetched:', targetsResponse.data.targets);
          setTargetsData(targetsResponse.data.targets);
        } else {
          console.warn('Targets data fetch failed:', targetsResponse.message);
        }
        
      } catch (error) {
        console.error('❌ Error fetching benchmarking data:', error);
        setError(error.message || 'Failed to fetch benchmarking data');
      } finally {
        setLoading(false);
      }
    };

    fetchBenchmarkingData();
  }, []);

  const renderTabContent = () => {
    if (error) {
      return (
        <div className="card p-6">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading benchmarking data</p>
            <p className="text-gray-500 text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return <OverviewTab peerData={peerData} esgData={esgData} loading={loading} />;
      case 'environmental':
        return <EnvironmentalTab peerData={peerData} esgData={esgData} loading={loading} />;
      case 'targets':
        return <TargetsTab targetsData={targetsData} loading={loading} />;
      case 'sources':
        return <SourcesTab peerData={peerData} loading={loading} />;
      default:
        return <OverviewTab peerData={peerData} esgData={esgData} loading={loading} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600">
            <ChartBarIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Organization Benchmarking</h1>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center space-x-1">
                <CpuChipIcon className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-purple-600 font-medium">AI POWERED</span>
              </div>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">Compare your organization with industry peers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ peerData, esgData, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  // Get cement companies for turnover comparison
  const cementCompanies = peerData.filter(company => company.industry === 'cement');
  const allCompanies = peerData;

  return (
    <div className="space-y-6">
      {/* Turnover Comparison Chart */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Turnover Comparison (Rs.)</h3>
        <div className="space-y-4">
          {cementCompanies.map((company, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-900">{company.name}</span>
                  <span className="text-sm text-gray-600">
                    {company.revenue ? (company.revenue / 10000000).toFixed(0) : 'N/A'} Cr
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8">
                  <div
                    className={`h-8 rounded-full ${
                      index === 0 ? 'bg-orange-400' : 'bg-red-400'
                    }`}
                    style={{
                      width: `${company.revenue ? (company.revenue / Math.max(...cementCompanies.map(c => c.revenue || 0))) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ESG Targets Radar Chart */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">ESG Targets Of Peer Companies</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart Placeholder */}
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
            <div className="text-center">
              <CpuChipIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">ESG Radar Chart</p>
              <p className="text-xs text-gray-400">Industry Average vs The Indian Hotels Company Limited</p>
            </div>
          </div>
          
          {/* Legend and AI Insights */}
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CpuChipIcon className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-900">AI Insights</span>
              </div>
              <p className="text-sm text-blue-800">No AI insights available at this moment.</p>
            </div>
            
            {/* Legend */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Industry Average</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">The Indian Hotels Company Limited</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Peer Companies Information Table */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Peer Companies Information</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Turnover (Rs.)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sector
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Basic Industry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Region
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allCompanies.map((company, index) => (
                <tr key={index} className={index === 0 ? 'bg-green-50' : index === 1 ? 'bg-red-50' : 'bg-red-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {company.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {company.revenue ? company.revenue.toLocaleString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {company.sector || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {company.basic_industry || company.industry || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {company.country || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {company.region || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Environmental Tab Component
const EnvironmentalTab = ({ peerData, esgData, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ESG Scores Comparison */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">ESG Scores Comparison</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ESG Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Environmental
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Social
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Governance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scope 1 (MT CO2e)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scope 2 (MT CO2e)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(esgData.length > 0 ? esgData : peerData).map((company, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {company.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {company.esg_score ? company.esg_score.toFixed(1) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {company.environmental_score ? company.environmental_score.toFixed(1) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {company.social_score ? company.social_score.toFixed(1) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {company.governance_score ? company.governance_score.toFixed(1) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {company.scope1_mtco2e ? company.scope1_mtco2e.toFixed(2) : 
                     company.scope1_emissions ? (company.scope1_emissions / 1000000).toFixed(2) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {company.scope2_mtco2e ? company.scope2_mtco2e.toFixed(2) : 
                     company.scope2_emissions ? (company.scope2_emissions / 1000000).toFixed(2) : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Targets Tab Component
const TargetsTab = ({ targetsData, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Peer Organization Targets & Goals</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Baseline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {targetsData.map((target, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {target.organization_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {target.target_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {target.target_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {target.baseline_value ? `${target.baseline_value} ${target.unit}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {target.target_value ? `${target.target_value} ${target.unit}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {target.target_year || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      target.status === 'active' ? 'bg-green-100 text-green-800' :
                      target.status === 'achieved' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {target.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {targetsData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No targets data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Sources Tab Component
const SourcesTab = ({ peerData, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data Sources & Methodology</h3>
        <div className="prose max-w-none">
          <h4 className="text-base font-medium text-gray-900 mb-3">Data Sources</h4>
          <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600">
            <li>Public company annual reports and sustainability reports</li>
            <li>ESG rating agencies (MSCI, Sustainalytics, CDP)</li>
            <li>Stock exchange filings and regulatory disclosures</li>
            <li>Industry association databases</li>
            <li>Third-party ESG data providers</li>
          </ul>
          
          <h4 className="text-base font-medium text-gray-900 mb-3 mt-6">Data Quality & Verification</h4>
          <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600">
            <li>Data undergoes multi-point verification from primary sources</li>
            <li>Metrics are normalized for fair comparison across organizations</li>
            <li>Currency conversions use average exchange rates for reporting periods</li>
            <li>Industry-specific metrics calculated using standard methodologies</li>
          </ul>
          
          <h4 className="text-base font-medium text-gray-900 mb-3 mt-6">Update Frequency</h4>
          <p className="text-sm text-gray-600">
            Benchmarking data is updated quarterly, with annual comprehensive reviews. 
            Real-time data integration available for select metrics.
          </p>
          
          <h4 className="text-base font-medium text-gray-900 mb-3 mt-6">Peer Selection Criteria</h4>
          <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600">
            <li>Industry classification (primary and secondary)</li>
            <li>Geographic region and market presence</li>
            <li>Revenue size and operational scale</li>
            <li>Public company status with available ESG disclosures</li>
            <li>Data quality and completeness scores above threshold</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BenchmarkingPage;
