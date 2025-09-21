import { useState, useEffect } from 'react';
import { useOrganization } from '../contexts/OrganizationContext';
import apiService from '../services/api';
import {
  ChartBarIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

// Color palette matching the screenshot
const chartColors = {
  primary: '#8B93E8',      // Blue from screenshot
  secondary: '#F2B942',    // Yellow/Orange from screenshot
  
  // Light variants for backgrounds
  primaryLight: '#C7CBEF',  // Lighter blue
  secondaryLight: '#F7D77A', // Lighter yellow/orange
  
  // Darker for hover states and borders
  primaryHover: '#6B73D1',
  secondaryHover: '#E6A532'
};

const BenchmarkingPage = () => {
  const { organization } = useOrganization();
  const [activeTab, setActiveTab] = useState('overview');
  const [industryData, setIndustryData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [targetCompany, setTargetCompany] = useState(null);
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
        
        // Fetch industry benchmarking data
        const industryResponse = await apiService.getIndustryBenchmarkingData({
          year: 2024,
          include_targets: true
        });
        
        if (industryResponse.success) {
          console.log('🏭 Industry data fetched:', industryResponse.data.companies);
          setIndustryData(industryResponse.data.companies);
          setTargetCompany(industryResponse.data.target_company);
        } else {
          throw new Error(industryResponse.message || 'Failed to fetch industry data');
        }

        // Fetch revenue comparison data
        const revenueResponse = await apiService.getRevenueComparison({
          year: 2024
        });
        
        if (revenueResponse.success) {
          console.log('💰 Revenue data fetched:', revenueResponse.data.companies);
          setRevenueData(revenueResponse.data.companies);
        } else {
          console.warn('Revenue data fetch failed:', revenueResponse.message);
        }

        // Note: Using industry benchmarking data instead of legacy peer organizations

        // Note: Using industry benchmarking data for ESG and targets instead of legacy APIs
        
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
        return <OverviewTab 
          industryData={industryData}
          revenueData={revenueData}
          targetCompany={targetCompany}
          organization={organization}
          loading={loading} 
        />;
      case 'environmental':
        return <EnvironmentalTab 
          industryData={industryData}
          loading={loading} 
        />;
      case 'targets':
        return <TargetsTab 
          industryData={industryData}
          loading={loading} 
        />;
      case 'sources':
        return <SourcesTab 
          industryData={industryData}
          loading={loading} 
        />;
      default:
        return <OverviewTab 
          industryData={industryData}
          revenueData={revenueData}
          targetCompany={targetCompany}
          organization={organization}
          loading={loading} 
        />;
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
const OverviewTab = ({ industryData, revenueData, targetCompany, organization, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  // Use industry data if available, otherwise fall back to peer data
  const companies = revenueData.length > 0 ? revenueData : industryData;
  const maxRevenue = companies.length > 0 ? Math.max(...companies.map(c => c.revenue || 0)) : 0;

  // Format revenue for display
  const formatRevenue = (revenue) => {
    if (!revenue) return 'N/A';
    if (revenue >= 1000000000000) {
      return `${(revenue / 1000000000000).toFixed(1)}L Cr`;
    } else if (revenue >= 10000000) {
      return `${(revenue / 10000000).toFixed(1)} Cr`;
    } else {
      return `${(revenue / 1000000).toFixed(1)}M`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Revenue Comparison Chart */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-8">Revenue Comparison</h3>
        {companies.length > 0 ? (
          <div className="space-y-6">
            {/* Chart Container */}
            <div className="relative" style={{ minHeight: '500px' }}>
              {/* Chart Area */}
              <div className="ml-24 mr-4 pt-4">
              {/* Y-axis labels */}
                <div className="absolute left-0 top-4 w-20 h-80 flex flex-col justify-between text-xs text-gray-500">
                  <div className="text-right pr-2">{formatRevenue(maxRevenue)}</div>
                  <div className="text-right pr-2">{formatRevenue(maxRevenue * 0.75)}</div>
                  <div className="text-right pr-2">{formatRevenue(maxRevenue * 0.5)}</div>
                  <div className="text-right pr-2">{formatRevenue(maxRevenue * 0.25)}</div>
                  <div className="text-right pr-2">0</div>
              </div>
              
                {/* Grid Lines */}
                <div className="absolute left-24 right-4 top-4 h-80">
                  <div className="relative h-full flex flex-col justify-between">
                    {[1, 0.75, 0.5, 0.25, 0].map((ratio, index) => (
                      <div key={index} className={`border-t w-full ${index === 4 ? 'border-gray-400' : 'border-gray-200'}`}></div>
                    ))}
                  </div>
                </div>
                
                {/* Bars - positioned to align with grid */}
                <div className="absolute left-24 right-4 top-4 h-80">
                  <div 
                    className="relative h-full grid gap-2 px-2"
                    style={{
                      gridTemplateColumns: `repeat(${companies.length}, 1fr)`,
                      alignItems: 'end'
                    }}
                  >
                  {companies.map((company, index) => {
                    const isTarget = company.is_target || company.name === targetCompany;
                    const revenue = company.revenue || 0;
                      // Calculate height in pixels from y=0 (bottom grid line)
                      const heightPx = maxRevenue > 0 ? Math.min((revenue / maxRevenue) * 300, 300) : 0; // Full 300px height
                    
                    return (
                        <div key={index} className="flex justify-center items-end h-full group">
                          <div
                            className={`w-12 rounded-t-lg transition-all duration-500 group-hover:opacity-90 group-hover:shadow-lg relative ${
                              isTarget 
                                ? 'bg-gradient-to-t from-yellow-400 to-yellow-500 shadow-yellow-200' 
                                : 'bg-gradient-to-t from-blue-400 to-blue-500 shadow-blue-200'
                            }`}
                            style={{
                              height: `${heightPx}px`,
                              minHeight: heightPx > 0 ? '2px' : '0px'
                            }}
                          >
                            {/* Revenue value on hover */}
                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                              <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                {formatRevenue(revenue)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                          </div>
                        </div>
                        
                {/* Company Names below the chart */}
                <div 
                  className="absolute left-24 right-4 grid gap-2 px-2"
                  style={{
                    top: '340px', // Below the 320px chart area
                    gridTemplateColumns: `repeat(${companies.length}, 1fr)`
                  }}
                >
                  {companies.map((company, index) => {
                    const isTarget = company.is_target || company.name === targetCompany;
                    
                    return (
                      <div key={index} className="text-center">
                        <div className="text-xs font-medium text-gray-900 leading-tight break-words">
                            {company.name.split(' ').slice(0, 2).join(' ')}
                          </div>
                          {company.name.split(' ').length > 2 && (
                          <div className="text-xs font-medium text-gray-900 leading-tight break-words">
                              {company.name.split(' ').slice(2).join(' ')}
                            </div>
                          )}
                          {isTarget && (
                            <div className="mt-1">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Target
                              </span>
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded"></div>
                <span className="text-sm text-gray-600">Target Company (JK Cement)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">Peer Companies</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No revenue data available</p>
          </div>
        )}
      </div>

      {/* ESG Targets Radar Chart */}
      <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Your Sustainability Portfolio Against Industry Average</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radar Chart */}
          <div className="lg:col-span-2 h-80">
            {industryData.length > 0 ? (
              <ESGRadarChart industryData={industryData} targetCompany={targetCompany} />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
            <div className="text-center">
              <CpuChipIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">ESG Radar Chart</p>
                  <p className="text-xs text-gray-400">Chart will appear when ESG data is available</p>
            </div>
              </div>
            )}
          </div>
          
          {/* Values Table and Legend */}
          <div className="space-y-4">
            {/* Values Comparison Table */}
            {industryData.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Actual Values</h4>
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-3 gap-2 font-medium text-gray-600">
                    <div>Metric</div>
                    <div className="text-blue-600">Industry</div>
                    <div className="text-green-600">JK Cement</div>
                </div>
                  <ESGValuesTable industryData={industryData} targetCompany={targetCompany} />
              </div>
              </div>
            )}
            
            {/* Legend */}
            {industryData.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Industry Average</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">JK Cement Limited</span>
                </div>
              </div>
            )}

            {/* AI Insights */}
            {industryData.length > 0 ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <CpuChipIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-900">AI Insights</span>
          </div>
                <p className="text-sm text-blue-800">
                  JK Cement shows competitive performance in environmental metrics with scope 1 emissions 
                  below industry average. Focus areas include improving gender diversity and renewable energy adoption.
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <CpuChipIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No ESG data available for insights</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Company's Information Table */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Company's Information</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Turnover (Rupees)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sector
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Production (MT)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Use industryData for complete information including production data */}
              {industryData.map((company, index) => {
                const isTarget = company.is_target || company.organization_name === targetCompany;
                return (
                  <tr key={index} className={isTarget ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span>{company.organization_name || company.name}</span>
                        {isTarget && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Target
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {company.revenue ? formatRevenue(company.revenue) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {company.sector || 'Cement Manufacturing'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {company.country || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {company.annual_cement_production ? 
                        `${(parseFloat(company.annual_cement_production) / 1000000).toFixed(1)}M` : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Environmental Tab Component
const EnvironmentalTab = ({ industryData, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Environmental Metrics Table */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Environmental Metrics Overview</h3>
        {industryData.length > 0 ? (
          <EnvironmentalMetricsTable industryData={industryData} />
        ) : (
          <div className="text-center py-12">
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No environmental data available</p>
          </div>
        )}
      </div>

      {/* Scope Emissions Stacked Chart */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Scope 1, 2, and 3 Emissions Comparison</h3>
        {industryData.length > 0 ? (
          <div className="h-[550px]"> {/* Increased height to accommodate slanted labels */}
            <ScopeEmissionsChart industryData={industryData} />
          </div>
        ) : (
          <div className="text-center py-12">
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No emissions data available</p>
          </div>
        )}
      </div>

      {/* Water Data Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Water Consumption Chart */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Water Consumption Comparison</h3>
            <div className="text-sm text-gray-600">
              Units: million m³
            </div>
          </div>
          {industryData.length > 0 ? (
            <div className="h-80">
              <WaterConsumptionChart industryData={industryData} />
            </div>
          ) : (
            <div className="text-center py-12">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No water consumption data available</p>
            </div>
          )}
        </div>

        {/* Water Withdrawal Chart */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Water Withdrawal Comparison</h3>
            <div className="text-sm text-gray-600">
              Units: million m³
            </div>
          </div>
          {industryData.length > 0 ? (
            <div className="h-80">
              <WaterWithdrawalChart industryData={industryData} />
            </div>
          ) : (
            <div className="text-center py-12">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No water withdrawal data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Waste Generated Comparison Chart */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Waste Generated Comparison</h3>
          <div className="text-sm text-gray-600">
            Units: million tons (outliers filtered)
          </div>
        </div>
        {industryData.length > 0 ? (
          <div className="h-96">
            <WasteGeneratedChart industryData={industryData} />
          </div>
        ) : (
          <div className="text-center py-12">
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No waste data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Environmental Metrics Table Component
const EnvironmentalMetricsTable = ({ industryData }) => {
  // Prepare data for the table - Only intensity values
  const tableData = industryData.map(company => ({
    name: company.organization_name || company.name || 'Unknown',
    isTarget: company.is_target || false,
    
    // Scope Emissions Intensity (only)
    scope1Intensity: company.scope_1_intensity ? company.scope_1_intensity.toFixed(2) : 'N/A',
    scope2Intensity: company.scope_2_intensity ? company.scope_2_intensity.toFixed(2) : 'N/A',
    scope3Intensity: company.scope_3_intensity ? company.scope_3_intensity.toFixed(2) : 'N/A',
    
    // Water Intensity (only)
    waterConsumptionIntensity: company.water_consumption_intensity ? company.water_consumption_intensity.toFixed(2) : 'N/A',
    waterWithdrawalIntensity: company.water_withdrawal_intensity ? company.water_withdrawal_intensity.toFixed(2) : 'N/A',
    
    // Waste Intensity (only)
    wasteGeneratedIntensity: company.waste_generated_intensity ? company.waste_generated_intensity.toFixed(3) : 'N/A',
  }));

  // Sort by company name, but put target company first
  const sortedData = tableData.sort((a, b) => {
    if (a.isTarget) return -1;
    if (b.isTarget) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                  Organization
                </th>
            {/* Scope Emissions - Intensity Only */}
            <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">
              <div>Scope 1 Intensity</div>
              <div className="font-normal text-gray-400">(MTCO2e per M Rs.)</div>
                </th>
            <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div>Scope 2 Intensity</div>
              <div className="font-normal text-gray-400">(MTCO2e per M Rs.)</div>
                </th>
            <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div>Scope 3 Intensity</div>
              <div className="font-normal text-gray-400">(MTCO2e per M Rs.)</div>
                </th>
            {/* Water Data - Intensity Only */}
            <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">
              <div>Water Cons. Intensity</div>
              <div className="font-normal text-gray-400">(m³ per M Rs.)</div>
                </th>
            <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div>Water With. Intensity</div>
              <div className="font-normal text-gray-400">(m³ per M Rs.)</div>
                </th>
            {/* Waste Data - Intensity Only */}
            <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">
              <div>Waste Intensity</div>
              <div className="font-normal text-gray-400">(tons per M Rs.)</div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((company, index) => (
            <tr key={index} className={`${company.isTarget ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'hover:bg-gray-50'}`}>
              <td className="px-2 py-2 text-sm font-medium text-gray-900 sticky left-0 bg-inherit z-10">
                <div className="flex items-center space-x-1">
                  <span className={company.isTarget ? 'font-semibold' : ''}>{company.name}</span>
                  {company.isTarget && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Target
                    </span>
                  )}
                </div>
                  </td>
              {/* Scope Emissions - Intensity Only */}
              <td className="px-2 py-2 text-sm text-center text-gray-900 border-l border-gray-100">{company.scope1Intensity}</td>
              <td className="px-2 py-2 text-sm text-center text-gray-900">{company.scope2Intensity}</td>
              <td className="px-2 py-2 text-sm text-center text-gray-900">{company.scope3Intensity}</td>
              {/* Water Data - Intensity Only */}
              <td className="px-2 py-2 text-sm text-center text-gray-900 border-l border-gray-100">{company.waterConsumptionIntensity}</td>
              <td className="px-2 py-2 text-sm text-center text-gray-900">{company.waterWithdrawalIntensity}</td>
              {/* Waste Data - Intensity Only */}
              <td className="px-2 py-2 text-sm text-center text-gray-900 border-l border-gray-100">{company.wasteGeneratedIntensity}</td>
                </tr>
              ))}
            </tbody>
          </table>
    </div>
  );
};

// Water Consumption Chart Component
const WaterConsumptionChart = ({ industryData }) => {
  // Extract companies and their water consumption data
  const companies = industryData
    .filter(company => company.water_consumption && company.water_consumption > 0)
    .map(company => ({
      name: company.organization_name || company.name || 'Unknown',
      fullName: company.organization_name || company.name || 'Unknown',
      value: company.water_consumption / 1000000, // Convert to million m³
      rawValue: company.water_consumption, // Keep raw value for debugging
      isTarget: company.is_target || false
    }))
    .sort((a, b) => b.value - a.value);

  const data = {
    labels: companies.map(company => {
      const words = company.name.split(' ');
      if (words.length <= 2) return company.name;
      const lastWord = words[words.length - 1];
      if (lastWord === 'Limited' || lastWord === 'Ltd') {
        return `${words[0]} ${lastWord}`;
      }
      return `${words[0]} ${words[1]}`;
    }),
    datasets: [
      {
        label: 'Water Consumption',
        data: companies.map(company => company.value),
        backgroundColor: companies.map(company => 
          company.isTarget ? '#8B93E8' : '#C7CBEF'
        ),
        borderColor: companies.map(company => 
          company.isTarget ? '#6B73D1' : '#8B93E8'
        ),
        borderWidth: companies.map(company => company.isTarget ? 2 : 1),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function(tooltipItems) {
            if (tooltipItems.length > 0) {
              const companyIndex = tooltipItems[0].dataIndex;
              const company = companies[companyIndex];
              return company.fullName + (company.isTarget ? ' (Target Company)' : '');
            }
            return '';
          },
          label: function(context) {
            const value = context.parsed.y;
            return `Water Consumption: ${value.toFixed(2)} million m³`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10,
            weight: '500',
          },
          color: '#374151',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Water Consumption (million m³)',
          font: {
            size: 12,
            weight: 'bold',
          },
          color: '#111827',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.08)',
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#6B7280',
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

// Water Withdrawal Chart Component
const WaterWithdrawalChart = ({ industryData }) => {
  // Extract companies and their water withdrawal data
  const companies = industryData
    .filter(company => company.water_withdrawal && company.water_withdrawal > 0)
    .map(company => ({
      name: company.organization_name || company.name || 'Unknown',
      fullName: company.organization_name || company.name || 'Unknown',
      value: company.water_withdrawal / 1000000, // Convert to million m³
      rawValue: company.water_withdrawal, // Keep raw value for debugging
      isTarget: company.is_target || false
    }))
    .sort((a, b) => b.value - a.value);

  const data = {
    labels: companies.map(company => {
      const words = company.name.split(' ');
      if (words.length <= 2) return company.name;
      const lastWord = words[words.length - 1];
      if (lastWord === 'Limited' || lastWord === 'Ltd') {
        return `${words[0]} ${lastWord}`;
      }
      return `${words[0]} ${words[1]}`;
    }),
    datasets: [
      {
        label: 'Water Withdrawal',
        data: companies.map(company => company.value),
        backgroundColor: companies.map(company => 
          company.isTarget ? '#F2B942' : '#F7D77A'
        ),
        borderColor: companies.map(company => 
          company.isTarget ? '#E6A532' : '#F2B942'
        ),
        borderWidth: companies.map(company => company.isTarget ? 2 : 1),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function(tooltipItems) {
            if (tooltipItems.length > 0) {
              const companyIndex = tooltipItems[0].dataIndex;
              const company = companies[companyIndex];
              return company.fullName + (company.isTarget ? ' (Target Company)' : '');
            }
            return '';
          },
          label: function(context) {
            const value = context.parsed.y;
            return `Water Withdrawal: ${value.toFixed(2)} million m³`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10,
            weight: '500',
          },
          color: '#374151',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Water Withdrawal (million m³)',
          font: {
            size: 12,
            weight: 'bold',
          },
          color: '#111827',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.08)',
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#6B7280',
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

// Waste Generated Chart Component
const WasteGeneratedChart = ({ industryData }) => {
  // Extract companies and their waste data
  // Handle the SAGAR CEMENTS outlier (266k vs others <4) by filtering extreme outliers
  const allWasteData = industryData
    .filter(company => company.waste_generated && company.waste_generated > 0)
    .map(company => company.waste_generated);
  
  // Calculate median to identify outliers
  const sortedWaste = [...allWasteData].sort((a, b) => a - b);
  const median = sortedWaste[Math.floor(sortedWaste.length / 2)];
  const maxReasonableValue = median * 100; // Allow up to 100x median
  
  const companies = industryData
    .filter(company => 
      company.waste_generated && 
      company.waste_generated > 0 && 
      company.waste_generated <= maxReasonableValue
    )
    .map(company => ({
      name: company.organization_name || company.name || 'Unknown',
      fullName: company.organization_name || company.name || 'Unknown',
      value: company.waste_generated, // Convert to thousands of tons for readability
      isTarget: company.is_target || false
    }))
    .sort((a, b) => b.value - a.value);

  const data = {
    labels: companies.map(company => {
      const words = company.name.split(' ');
      if (words.length <= 2) return company.name;
      const lastWord = words[words.length - 1];
      if (lastWord === 'Limited' || lastWord === 'Ltd') {
        return `${words[0]} ${lastWord}`;
      }
      return `${words[0]} ${words[1]}`;
    }),
    datasets: [
      {
        label: 'Waste Generated',
        data: companies.map(company => company.value),
        backgroundColor: companies.map(company => 
          company.isTarget ? '#8B93E8' : '#C7CBEF'
        ),
        borderColor: companies.map(company => 
          company.isTarget ? '#6B73D1' : '#8B93E8'
        ),
        borderWidth: companies.map(company => company.isTarget ? 2 : 1),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        bottom: 40,
        left: 10,
        right: 10,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function(tooltipItems) {
            if (tooltipItems.length > 0) {
              const companyIndex = tooltipItems[0].dataIndex;
              const company = companies[companyIndex];
              return company.fullName + (company.isTarget ? ' (Target Company)' : '');
            }
            return '';
          },
          label: function(context) {
            const value = context.parsed.y;
            return `Waste Generated: ${value.toFixed(3)} million tons`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 11,
            weight: '500',
          },
          color: '#374151',
          padding: 15,
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Waste Generated (million tons)',
          font: {
            size: 12,
            weight: 'bold',
          },
          color: '#111827',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.08)',
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#6B7280',
          callback: function(value) {
            return value.toFixed(2);
          }
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

// Scope Emissions Stacked Chart Component
const ScopeEmissionsChart = ({ industryData }) => {
  // Extract companies and their emissions data
  const companies = industryData.map(company => ({
    name: company.organization_name || company.name || 'Unknown',
    fullName: company.organization_name || company.name || 'Unknown',
    scope1: company.scope_1 ? company.scope_1 / 1000 : 0, // Convert to kt CO2e
    scope2: company.scope_2 ? company.scope_2 / 1000 : 0, // Convert to kt CO2e
    scope3: company.scope_3 ? company.scope_3 / 1000 : 0, // Convert to kt CO2e
    isTarget: company.is_target || false
  }));

  // Sort companies by total emissions (descending)
  companies.sort((a, b) => {
    const totalA = a.scope1 + a.scope2 + a.scope3;
    const totalB = b.scope1 + b.scope2 + b.scope3;
    return totalB - totalA;
  });

  // Using solid colors from screenshot
  const getScope1Colors = (isTarget) => ({
    backgroundColor: isTarget ? '#F2B942' : '#F7D77A', // Solid yellow/orange
    borderColor: isTarget ? '#E6A532' : '#F2B942',
    borderWidth: isTarget ? 2 : 1
  });

  const getScope2Colors = (isTarget) => ({
    backgroundColor: isTarget ? '#8B93E8' : '#C7CBEF', // Solid blue
    borderColor: isTarget ? '#6B73D1' : '#8B93E8',
    borderWidth: isTarget ? 2 : 1
  });

  const getScope3Colors = (isTarget) => ({
    backgroundColor: isTarget ? '#B8BFF2' : '#D1D5F4', // Solid lighter blue
    borderColor: isTarget ? '#6B73D1' : '#8B93E8',
    borderWidth: isTarget ? 2 : 1
  });

  const data = {
    labels: companies.map(company => {
      // Show full company names since they're slanted and have more space
      return company.name;
    }),
    datasets: [
      {
        label: 'Scope 1 Emissions',
        data: companies.map(company => company.scope1),
        backgroundColor: companies.map(company => getScope1Colors(company.isTarget).backgroundColor),
        borderColor: companies.map(company => getScope1Colors(company.isTarget).borderColor),
        borderWidth: companies.map(company => getScope1Colors(company.isTarget).borderWidth),
      },
      {
        label: 'Scope 2 Emissions',
        data: companies.map(company => company.scope2),
        backgroundColor: companies.map(company => getScope2Colors(company.isTarget).backgroundColor),
        borderColor: companies.map(company => getScope2Colors(company.isTarget).borderColor),
        borderWidth: companies.map(company => getScope2Colors(company.isTarget).borderWidth),
      },
      {
        label: 'Scope 3 Emissions',
        data: companies.map(company => company.scope3),
        backgroundColor: companies.map(company => getScope3Colors(company.isTarget).backgroundColor),
        borderColor: companies.map(company => getScope3Colors(company.isTarget).borderColor),
        borderWidth: companies.map(company => getScope3Colors(company.isTarget).borderWidth),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        bottom: 40, // Extra padding for slanted labels
        left: 10,
        right: 10,
      },
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'center',
        labels: {
          usePointStyle: true,
          padding: 25,
          font: {
            size: 13,
            weight: '500',
          },
          color: '#374151',
          boxWidth: 12,
          boxHeight: 12,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: function(tooltipItems) {
            if (tooltipItems.length > 0) {
              const companyIndex = tooltipItems[0].dataIndex;
              const company = companies[companyIndex];
              return company.fullName + (company.isTarget ? ' (Target Company)' : '');
            }
            return '';
          },
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(1)} kt CO2e`;
          },
          footer: function(tooltipItems) {
            const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0);
            return `Total: ${total.toFixed(1)} kt CO2e`;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45, // Slanted position for company names
          minRotation: 45,
          font: {
            size: 11,
            weight: '500',
          },
          color: '#374151', // Darker gray for better contrast
          padding: 15,
        },
        border: {
          color: '#D1D5DB',
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Emissions (kilotons CO2e)',
          font: {
            size: 14,
            weight: 'bold',
          },
          color: '#111827',
          padding: { bottom: 10 },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.08)',
          lineWidth: 1,
        },
        ticks: {
          font: {
            size: 12,
            weight: '500',
          },
          color: '#6B7280',
          padding: 8,
          callback: function(value) {
            // Format large numbers with comma separators
            return value.toLocaleString() + ' kt';
          }
        },
        border: {
          color: '#D1D5DB',
        },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    elements: {
      bar: {
        borderWidth: 1,
      },
    },
  };

    return (
    <div className="w-full h-full">
      <Bar data={data} options={options} />
      {/* Enhanced Legend with dashboard colors */}
      <div className="mt-6 flex flex-wrap justify-center gap-6">
        <div className="flex items-center space-x-6 text-sm text-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: chartColors.secondary }}></div>
            <span className="font-medium">Scope 1 Emissions</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: chartColors.primary }}></div>
            <span className="font-medium">Scope 2 Emissions</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: '#B8BFF2' }}></div>
            <span className="font-medium">Scope 3 Emissions</span>
          </div>
        </div>
        {companies.some(c => c.isTarget) && (
          <div className="flex items-center space-x-2 ml-4 pl-4 border-l-2 border-gray-300">
            <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-500 border-2 border-yellow-600 rounded shadow-md"></div>
            <span className="font-semibold text-yellow-700">
              Target: {companies.find(c => c.isTarget)?.fullName}
            </span>
          </div>
        )}
      </div>
      </div>
    );
};

// Targets by Category Component
const TargetsByCategory = ({ organizations }) => {
  const getTargetTypeColor = (category) => {
    switch (category) {
      case 'Environmental': return 'bg-green-500';
      case 'Social': return 'bg-blue-500';
      case 'Governance': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Environmental': return '🌱';
      case 'Social': return '👥';
      case 'Governance': return '⚖️';
      default: return '📋';
    }
  };

  return (
    <div className="space-y-6">
      {organizations.map(org => (
        <div key={org.organizationName} className={`border rounded-lg p-6 ${
          org.isTargetCompany ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <h4 className="text-lg font-semibold text-gray-900">{org.organizationName}</h4>
              {org.isTargetCompany && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Target Company
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500">{org.totalTargets} targets</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Environmental', 'Social', 'Governance'].map(category => {
              const categoryTargets = org.targets.filter(t => t.category === category);
              return (
                <div key={category} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-lg">{getCategoryIcon(category)}</span>
                    <h5 className="font-medium text-gray-900">{category}</h5>
                    <span className="text-xs text-gray-500">({categoryTargets.length})</span>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {categoryTargets.map(target => (
                      <div key={target.id} className="text-sm">
                        <div className="flex items-start space-x-2">
                          <div className={`w-2 h-2 rounded-full mt-1.5 ${getTargetTypeColor(category)}`}></div>
                          <p className="text-gray-700 leading-relaxed">{target.name}</p>
                        </div>
                      </div>
                    ))}
                    {categoryTargets.length === 0 && (
                      <p className="text-gray-500 text-xs italic">No {category.toLowerCase()} targets</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// Targets Comparison Table Component
const TargetsComparisonTable = ({ organizations }) => {
  return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Target Description
                </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Scope
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
          {organizations.map(org => 
            org.targets.map(target => {
              return (
                <tr key={target.id} className={`hover:bg-gray-50 ${org.isTargetCompany ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''}`}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    <div className="flex items-center space-x-2">
                      <span>{org.organizationName}</span>
                      {org.isTargetCompany && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Target
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <p className="leading-relaxed">{target.description}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      target.category === 'Environmental' ? 'bg-green-100 text-green-800' :
                      target.category === 'Social' ? 'bg-blue-100 text-blue-800' :
                      target.category === 'Governance' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {target.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <span className="capitalize">{target.targetType}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {target.organizationWide ? 'Organization-wide' : 'Facility-specific'}
                  </td>
                </tr>
              );
            })
          )}
            </tbody>
          </table>
        </div>
  );
};

// Target Categories Chart Component
const TargetCategoriesChart = ({ organizations }) => {
  // Count target categories
  const categoryCounts = organizations.reduce((acc, org) => {
    org.targets.forEach(target => {
      const category = target.category;
      if (!acc[category]) acc[category] = { count: 0, companies: new Set() };
      acc[category].count++;
      acc[category].companies.add(org.organizationName);
    });
    return acc;
  }, {});

  const chartData = Object.entries(categoryCounts).map(([category, data]) => ({
    category,
    count: data.count,
    companies: data.companies.size,
    color: 
      category === 'Environmental' ? '#10B981' :
      category === 'Social' ? chartColors.primary :
      category === 'Governance' ? '#8B5CF6' :
      '#6B7280'
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Bar Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Targets by Category</h4>
        <div className="space-y-3">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="w-24 text-sm text-gray-600 mr-3">{item.category}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div 
                  className="h-6 rounded-full flex items-center justify-end pr-2"
                  style={{ 
                    backgroundColor: item.color, 
                    width: `${(item.count / Math.max(...chartData.map(d => d.count))) * 100}%`,
                    minWidth: '20px'
                  }}
                >
                  <span className="text-white text-xs font-medium">{item.count}</span>
          </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Category Distribution</h4>
        <div className="space-y-3">
          {chartData.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm font-medium text-gray-900">{item.category}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{item.count} targets</p>
                <p className="text-xs text-gray-500">{item.companies} companies</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Targets Tab Component
const TargetsTab = ({ loading }) => {
  const [targetsData, setTargetsData] = useState([]);
  const [targetsLoading, setTargetsLoading] = useState(true);
  const [targetsError, setTargetsError] = useState(null);

  // Fetch targets data separately
  useEffect(() => {
    const fetchTargetsData = async () => {
      setTargetsLoading(true);
      setTargetsError(null);
      
      try {
        console.log('🎯 Fetching targets comparison data...');
        
        const response = await apiService.getTargetsComparison();
        
        if (response.success) {
          console.log('🎯 Targets data fetched:', response.data);
          setTargetsData(response.data.organizations);
        } else {
          throw new Error(response.message || 'Failed to fetch targets data');
        }
      } catch (error) {
        console.error('❌ Error fetching targets data:', error);
        setTargetsError(error.message || 'Failed to fetch targets data');
      } finally {
        setTargetsLoading(false);
      }
    };

    fetchTargetsData();
  }, []);

  if (loading || targetsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  if (targetsError) {
  return (
      <div className="card p-6">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading targets data</p>
          <p className="text-gray-500 text-sm">{targetsError}</p>
        </div>
      </div>
    );
  }

  return (
          <div className="space-y-6">
      {/* Targets Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Organizations</p>
              <p className="text-2xl font-bold text-gray-900">{targetsData.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-100">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Targets</p>
              <p className="text-2xl font-bold text-gray-900">
                {targetsData.reduce((sum, org) => sum + org.targets.length, 0)}
                  </p>
                </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-yellow-100">
              <ChartBarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Target Companies</p>
              <p className="text-2xl font-bold text-gray-900">
                {targetsData.filter(org => org.isTargetCompany).length}
              </p>
            </div>
                </div>
              </div>
            </div>

      {/* Targets by Category Visualization */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sustainability Targets by Organization</h3>
        {targetsData.length > 0 ? (
          <TargetsByCategory organizations={targetsData} />
        ) : (
          <div className="text-center py-12">
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No targets data available</p>
          </div>
        )}
      </div>

      {/* Detailed Targets Comparison */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Targets Comparison</h3>
        {targetsData.length > 0 ? (
          <TargetsComparisonTable organizations={targetsData} />
        ) : (
          <div className="text-center py-12">
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No targets data available</p>
          </div>
        )}
      </div>

      {/* Target Categories Distribution */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Target Categories Distribution</h3>
        {targetsData.length > 0 ? (
          <TargetCategoriesChart organizations={targetsData} />
        ) : (
          <div className="text-center py-12">
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No target categories data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Sources by Organization Component
const SourcesByOrganization = ({ organizations }) => {
  return (
    <div className="space-y-6">
      {organizations.map(org => (
        <div key={org.organizationName} className={`border rounded-lg p-6 ${
          org.isTargetCompany ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <h4 className="text-lg font-semibold text-gray-900">{org.organizationName}</h4>
              {org.isTargetCompany && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Target Company
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500">{org.totalSources} sources</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {org.sources.map(source => (
              <div key={source.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        source.type === 'BRSR Report' ? 'bg-blue-100 text-blue-800' :
                        source.type === 'Annual Report' ? 'bg-green-100 text-green-800' :
                        source.type === 'Sustainability Report' ? 'bg-emerald-100 text-emerald-800' :
                        source.type === 'Governance Report' ? 'bg-purple-100 text-purple-800' :
                        source.type === 'Policy Document' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {source.type}
                      </span>
                      {source.year && (
                        <span className="text-xs text-gray-500">{source.year}</span>
                      )}
                    </div>
                    <h5 className="font-medium text-gray-900 mb-2">{source.title}</h5>
                    <a 
                      href={source.referenceLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                    >
                      {source.referenceLink}
                    </a>
                  </div>
                  <div className="ml-4">
                    <a 
                      href={source.referenceLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md"
                    >
                      View
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Sources Reference Table Component
const SourcesReferenceTable = ({ organizations }) => {
  const allSources = organizations.flatMap(org => 
    org.sources.map(source => ({
      ...source,
      organizationName: org.organizationName,
      isTargetCompany: org.isTargetCompany
    }))
  );

  return (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Organization
                      </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Source Title
                      </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                      </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Year
                </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reference
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
          {allSources.map(source => (
            <tr key={source.id} className={`hover:bg-gray-50 ${source.isTargetCompany ? 'bg-yellow-50' : ''}`}>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                <div className="flex items-center space-x-2">
                  <span>{source.organizationName}</span>
                  {source.isTargetCompany && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Target
                              </span>
                            )}
                          </div>
                  </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                <p className="max-w-md truncate" title={source.title}>{source.title}</p>
                  </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  source.type === 'BRSR Report' ? 'bg-blue-100 text-blue-800' :
                  source.type === 'Annual Report' ? 'bg-green-100 text-green-800' :
                  source.type === 'Sustainability Report' ? 'bg-emerald-100 text-emerald-800' :
                  source.type === 'Governance Report' ? 'bg-purple-100 text-purple-800' :
                  source.type === 'Policy Document' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {source.type}
                    </span>
                  </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {source.year || 'N/A'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                <a 
                  href={source.referenceLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md"
                >
                  View Source
                </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
  );
};

// Sources Tab Component
const SourcesTab = ({ loading }) => {
  const [sourcesData, setSourcesData] = useState([]);
  const [sourcesLoading, setSourcesLoading] = useState(true);
  const [sourcesError, setSourcesError] = useState(null);
  const [sourcesByType, setSourcesByType] = useState({});

  // Fetch sources data separately
  useEffect(() => {
    const fetchSourcesData = async () => {
      setSourcesLoading(true);
      setSourcesError(null);
      
      try {
        console.log('📚 Fetching sources data...');
        
        const response = await apiService.getSourcesData();
        
        if (response.success) {
          console.log('📚 Sources data fetched:', response.data);
          setSourcesData(response.data.organizations);
          setSourcesByType(response.data.sourcesByType);
        } else {
          throw new Error(response.message || 'Failed to fetch sources data');
        }
      } catch (error) {
        console.error('❌ Error fetching sources data:', error);
        setSourcesError(error.message || 'Failed to fetch sources data');
      } finally {
        setSourcesLoading(false);
      }
    };

    fetchSourcesData();
  }, []);

  if (loading || sourcesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
            </div>
    );
  }

  if (sourcesError) {
    return (
      <div className="card p-6">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading sources data</p>
          <p className="text-gray-500 text-sm">{sourcesError}</p>
              </div>
            </div>
    );
  }

  const totalSources = sourcesData.reduce((sum, org) => sum + org.sources.length, 0);

  return (
    <div className="space-y-6">
      {/* Sources Overview */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data Sources & Methodology</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-100">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
          </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-900">Organizations</p>
                <p className="text-2xl font-bold text-blue-700">{sourcesData.length}</p>
          </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-100">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-900">Total Sources</p>
                <p className="text-2xl font-bold text-green-700">{totalSources}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-purple-100">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-900">Source Types</p>
                <p className="text-2xl font-bold text-purple-700">{Object.keys(sourcesByType).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-yellow-100">
                <ChartBarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-yellow-900">Avg per Org</p>
                <p className="text-2xl font-bold text-yellow-700">{Math.round(totalSources / sourcesData.length)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Source Types Distribution */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Source Types Distribution</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(sourcesByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${
                    type === 'BRSR Report' ? 'bg-blue-500' :
                    type === 'Annual Report' ? 'bg-green-500' :
                    type === 'Sustainability Report' ? 'bg-emerald-500' :
                    type === 'Governance Report' ? 'bg-purple-500' :
                    type === 'Policy Document' ? 'bg-orange-500' :
                    'bg-gray-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900">{type}</span>
                </div>
                <span className="text-sm font-bold text-gray-700">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Sources by Organization */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sources by Organization</h3>
        <SourcesByOrganization organizations={sourcesData} />
      </div>

      {/* Sources Summary Table */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">All Sources Reference List</h3>
        <SourcesReferenceTable organizations={sourcesData} />
      </div>
    </div>
  );
};

// ESG Radar Chart Component
const ESGRadarChart = ({ industryData, targetCompany }) => {
  // Calculate industry averages and get target company data
  const calculateIndustryAverages = () => {
    if (!industryData.length) return null;

    const metrics = {
      scope1: [],
      scope2: [],
      scope3: [],
      waterConsumption: [],
      waterWithdrawal: [],
      wasteGenerated: [],
      genderDiversity: [],
      msmeSourcing: []
    };

    industryData.forEach(company => {
      if (company.scope_1_intensity !== null && company.scope_1_intensity !== undefined) metrics.scope1.push(company.scope_1_intensity);
      if (company.scope_2_intensity !== null && company.scope_2_intensity !== undefined) metrics.scope2.push(company.scope_2_intensity);
      if (company.scope_3_intensity !== null && company.scope_3_intensity !== undefined) metrics.scope3.push(company.scope_3_intensity);
      if (company.water_consumption_intensity !== null && company.water_consumption_intensity !== undefined) metrics.waterConsumption.push(company.water_consumption_intensity);
      if (company.water_withdrawal_intensity !== null && company.water_withdrawal_intensity !== undefined) metrics.waterWithdrawal.push(company.water_withdrawal_intensity);
      if (company.waste_generated_intensity !== null && company.waste_generated_intensity !== undefined) metrics.wasteGenerated.push(company.waste_generated_intensity);
      if (company.female_employee_percentage !== null && company.female_employee_percentage !== undefined) metrics.genderDiversity.push(company.female_employee_percentage);
      if (company.msme_sourcing_percentage !== null && company.msme_sourcing_percentage !== undefined) metrics.msmeSourcing.push(company.msme_sourcing_percentage);
    });

    return {
      scope1: metrics.scope1.length ? metrics.scope1.reduce((a, b) => a + b, 0) / metrics.scope1.length : 0,
      scope2: metrics.scope2.length ? metrics.scope2.reduce((a, b) => a + b, 0) / metrics.scope2.length : 0,
      scope3: metrics.scope3.length ? metrics.scope3.reduce((a, b) => a + b, 0) / metrics.scope3.length : 0,
      waterConsumption: metrics.waterConsumption.length ? metrics.waterConsumption.reduce((a, b) => a + b, 0) / metrics.waterConsumption.length : 0,
      waterWithdrawal: metrics.waterWithdrawal.length ? metrics.waterWithdrawal.reduce((a, b) => a + b, 0) / metrics.waterWithdrawal.length : 0,
      wasteGenerated: metrics.wasteGenerated.length ? metrics.wasteGenerated.reduce((a, b) => a + b, 0) / metrics.wasteGenerated.length : 0,
      genderDiversity: metrics.genderDiversity.length ? metrics.genderDiversity.reduce((a, b) => a + b, 0) / metrics.genderDiversity.length : 0,
      msmeSourcing: metrics.msmeSourcing.length ? metrics.msmeSourcing.reduce((a, b) => a + b, 0) / metrics.msmeSourcing.length : 0,
    };
  };

  const getTargetCompanyData = () => {
    const target = industryData.find(company => 
      company.is_target || company.organization_name === targetCompany
    );
    
    if (!target) return null;

    return {
      scope1: target.scope_1_intensity || 0,
      scope2: target.scope_2_intensity || 0,
      scope3: target.scope_3_intensity || 0,
      waterConsumption: target.water_consumption_intensity || 0,
      waterWithdrawal: target.water_withdrawal_intensity || 0,
      wasteGenerated: target.waste_generated_intensity || 0,
      genderDiversity: target.female_employee_percentage || 0,
      msmeSourcing: target.msme_sourcing_percentage || 0,
    };
  };

  const industryAverages = calculateIndustryAverages();
  const targetData = getTargetCompanyData();

  if (!industryAverages || !targetData) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
        <div className="text-center">
          <CpuChipIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No ESG data available</p>
        </div>
      </div>
    );
  }

  // Since radar charts have issues with mixed scales, let's normalize all values to a 0-1000 scale
  // but keep the original values for tooltips
  const scaleToThousand = (value, maxInCategory) => {
    if (maxInCategory === 0) return 0;
    return (value / maxInCategory) * 1000;
  };

  // Find max values per category for proper scaling
  const maxScope1 = Math.max(industryAverages.scope1, targetData.scope1);
  const maxScope2 = Math.max(industryAverages.scope2, targetData.scope2);
  const maxScope3 = Math.max(industryAverages.scope3, targetData.scope3);
  const maxWaterConsumption = Math.max(industryAverages.waterConsumption, targetData.waterConsumption);
  const maxWaterWithdrawal = Math.max(industryAverages.waterWithdrawal, targetData.waterWithdrawal);
  const maxWasteGenerated = Math.max(industryAverages.wasteGenerated, targetData.wasteGenerated);
  const maxGenderDiversity = Math.max(industryAverages.genderDiversity, targetData.genderDiversity);
  const maxMsmeSourcing = Math.max(industryAverages.msmeSourcing, targetData.msmeSourcing);

  // Store original values for tooltips
  const originalIndustryData = [
    industryAverages.scope1,
    industryAverages.scope2,
    industryAverages.scope3,
    industryAverages.waterConsumption,
    industryAverages.waterWithdrawal,
    industryAverages.wasteGenerated,
    industryAverages.genderDiversity,
    industryAverages.msmeSourcing,
  ];

  const originalTargetData = [
    targetData.scope1,
    targetData.scope2,
    targetData.scope3,
    targetData.waterConsumption,
    targetData.waterWithdrawal,
    targetData.wasteGenerated,
    targetData.genderDiversity,
    targetData.msmeSourcing,
  ];

  const data = {
    labels: [
      'Scope 1 (MTCO2e / million Rs.)',
      'Scope 2 (MTCO2e / million Rs.)',
      'Scope 3 (MTCO2e / million Rs.)',
      'Water Consumption (m3 per million Rs.)',
      'Water Withdrawal (m3 per million Rs.)',
      'Waste Generated (m3 per million Rs.)',
      'Gender Diversity (%)',
      'MSME Sourcing (%)'
    ],
    datasets: [
      {
        label: 'Industry Average',
        data: [
          scaleToThousand(industryAverages.scope1, maxScope1),
          scaleToThousand(industryAverages.scope2, maxScope2),
          scaleToThousand(industryAverages.scope3, maxScope3),
          scaleToThousand(industryAverages.waterConsumption, maxWaterConsumption),
          scaleToThousand(industryAverages.waterWithdrawal, maxWaterWithdrawal),
          scaleToThousand(industryAverages.wasteGenerated, maxWasteGenerated),
          scaleToThousand(industryAverages.genderDiversity, maxGenderDiversity),
          scaleToThousand(industryAverages.msmeSourcing, maxMsmeSourcing),
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(59, 130, 246)',
      },
      {
        label: 'JK Cement Limited',
        data: [
          scaleToThousand(targetData.scope1, maxScope1),
          scaleToThousand(targetData.scope2, maxScope2),
          scaleToThousand(targetData.scope3, maxScope3),
          scaleToThousand(targetData.waterConsumption, maxWaterConsumption),
          scaleToThousand(targetData.waterWithdrawal, maxWaterWithdrawal),
          scaleToThousand(targetData.wasteGenerated, maxWasteGenerated),
          scaleToThousand(targetData.genderDiversity, maxGenderDiversity),
          scaleToThousand(targetData.msmeSourcing, maxMsmeSourcing),
        ],
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(34, 197, 94)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We have custom legend
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const dataIndex = context.dataIndex;
            const isIndustryAverage = context.datasetIndex === 0;
            
            // Get original values for tooltip
            const originalValue = isIndustryAverage 
              ? originalIndustryData[dataIndex] 
              : originalTargetData[dataIndex];
            
            // Format based on metric type
            if (dataIndex === 6 || dataIndex === 7) { // Gender Diversity or MSME Sourcing
              return `${label}: ${originalValue.toFixed(1)}%`;
            } else if (dataIndex <= 5) { // Emissions, water, waste
              return `${label}: ${originalValue.toFixed(2)} per million Rs.`;
            }
            return `${label}: ${originalValue.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 1000,
        ticks: {
          display: false, // Hide the scale numbers since they're normalized
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        angleLines: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        pointLabels: {
          font: {
            size: 10,
          },
          color: 'rgb(107, 114, 128)',
          padding: 20,
        },
      },
    },
  };

  return <Radar data={data} options={options} />;
};

// ESG Values Table Component
const ESGValuesTable = ({ industryData, targetCompany }) => {
  // Calculate industry averages and get target company data
  const calculateIndustryAverages = () => {
    if (!industryData.length) return null;

    const metrics = {
      scope1: [],
      scope2: [],
      scope3: [],
      waterConsumption: [],
      waterWithdrawal: [],
      wasteGenerated: [],
      genderDiversity: [],
      msmeSourcing: []
    };

    industryData.forEach(company => {
      if (company.scope_1_intensity !== null && company.scope_1_intensity !== undefined) metrics.scope1.push(company.scope_1_intensity);
      if (company.scope_2_intensity !== null && company.scope_2_intensity !== undefined) metrics.scope2.push(company.scope_2_intensity);
      if (company.scope_3_intensity !== null && company.scope_3_intensity !== undefined) metrics.scope3.push(company.scope_3_intensity);
      if (company.water_consumption_intensity !== null && company.water_consumption_intensity !== undefined) metrics.waterConsumption.push(company.water_consumption_intensity);
      if (company.water_withdrawal_intensity !== null && company.water_withdrawal_intensity !== undefined) metrics.waterWithdrawal.push(company.water_withdrawal_intensity);
      if (company.waste_generated_intensity !== null && company.waste_generated_intensity !== undefined) metrics.wasteGenerated.push(company.waste_generated_intensity);
      if (company.female_employee_percentage !== null && company.female_employee_percentage !== undefined) metrics.genderDiversity.push(company.female_employee_percentage);
      if (company.msme_sourcing_percentage !== null && company.msme_sourcing_percentage !== undefined) metrics.msmeSourcing.push(company.msme_sourcing_percentage);
    });

    return {
      scope1: metrics.scope1.length ? metrics.scope1.reduce((a, b) => a + b, 0) / metrics.scope1.length : 0,
      scope2: metrics.scope2.length ? metrics.scope2.reduce((a, b) => a + b, 0) / metrics.scope2.length : 0,
      scope3: metrics.scope3.length ? metrics.scope3.reduce((a, b) => a + b, 0) / metrics.scope3.length : 0,
      waterConsumption: metrics.waterConsumption.length ? metrics.waterConsumption.reduce((a, b) => a + b, 0) / metrics.waterConsumption.length : 0,
      waterWithdrawal: metrics.waterWithdrawal.length ? metrics.waterWithdrawal.reduce((a, b) => a + b, 0) / metrics.waterWithdrawal.length : 0,
      wasteGenerated: metrics.wasteGenerated.length ? metrics.wasteGenerated.reduce((a, b) => a + b, 0) / metrics.wasteGenerated.length : 0,
      genderDiversity: metrics.genderDiversity.length ? metrics.genderDiversity.reduce((a, b) => a + b, 0) / metrics.genderDiversity.length : 0,
      msmeSourcing: metrics.msmeSourcing.length ? metrics.msmeSourcing.reduce((a, b) => a + b, 0) / metrics.msmeSourcing.length : 0,
    };
  };

  const getTargetCompanyData = () => {
    const target = industryData.find(company => 
      company.is_target || company.organization_name === targetCompany
    );
    
    if (!target) return null;

    return {
      scope1: target.scope_1_intensity || 0,
      scope2: target.scope_2_intensity || 0,
      scope3: target.scope_3_intensity || 0,
      waterConsumption: target.water_consumption_intensity || 0,
      waterWithdrawal: target.water_withdrawal_intensity || 0,
      wasteGenerated: target.waste_generated_intensity || 0,
      genderDiversity: target.female_employee_percentage || 0,
      msmeSourcing: target.msme_sourcing_percentage || 0,
    };
  };

  const industryAverages = calculateIndustryAverages();
  const targetData = getTargetCompanyData();

  if (!industryAverages || !targetData) return null;

  const metrics = [
    { name: 'Scope 1', industry: industryAverages.scope1, target: targetData.scope1, unit: '' },
    { name: 'Scope 2', industry: industryAverages.scope2, target: targetData.scope2, unit: '' },
    { name: 'Scope 3', industry: industryAverages.scope3, target: targetData.scope3, unit: '' },
    { name: 'Water Cons.', industry: industryAverages.waterConsumption, target: targetData.waterConsumption, unit: '' },
    { name: 'Water With.', industry: industryAverages.waterWithdrawal, target: targetData.waterWithdrawal, unit: '' },
    { name: 'Waste Gen.', industry: industryAverages.wasteGenerated, target: targetData.wasteGenerated, unit: '' },
    { name: 'Gender Div.', industry: industryAverages.genderDiversity, target: targetData.genderDiversity, unit: '%' },
    { name: 'MSME Sourc.', industry: industryAverages.msmeSourcing, target: targetData.msmeSourcing, unit: '%' },
  ];

  return (
    <>
      {metrics.map((metric, index) => (
        <div key={index} className="grid grid-cols-3 gap-2 py-1">
          <div className="text-gray-700 truncate" title={metric.name}>{metric.name}</div>
          <div className="text-blue-600 font-mono">{metric.industry.toFixed(1)}{metric.unit}</div>
          <div className="text-green-600 font-mono">{metric.target.toFixed(1)}{metric.unit}</div>
        </div>
      ))}
    </>
  );
};

export default BenchmarkingPage;
