import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDashboardData } from '../hooks/useData';
import { useOrganization } from '../contexts/OrganizationContext';
import { useFacility } from '../contexts/FacilityContext';
import { useEmission } from '../contexts/EmissionContext';
import { formatNumber, transformOrganizationData } from '../utils/dataTransformers';
import { calculateTrend } from '../utils/calculations';
import {
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  FireIcon,
  BoltIcon,
  ScaleIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  GlobeAltIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

// Soft pastel color palette for charts - only 2 main colors
const chartColors = {
  primary: '#A5B4FC',      // Soft Lavender Blue (main color)
  secondary: '#FBBF24',    // Soft Warm Yellow (secondary color)
  
  // Very light variants for backgrounds
  primaryLight: '#E0E7FF',
  secondaryLight: '#FEF3C7',
  
  // Slightly darker for hover states
  primaryHover: '#8B5CF6',
  secondaryHover: '#F59E0B'
};

const Dashboard = () => {
  console.log('🏠 Dashboard component rendering...');
  
  const { user } = useAuth();
  console.log('👤 User from auth:', user);
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chartTimePeriod, setChartTimePeriod] = useState('monthly');
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('12months');
  
  console.log('📅 Selected year:', selectedYear);
  
  const { metrics, loading: dashboardLoading, refreshDashboard, dashboardData, analyticsData } = useDashboardData(selectedYear);
  console.log('📊 Dashboard data hook results:', {
    metrics,
    loading: dashboardLoading,
    dashboardData,
    analyticsData
  });
  
  const { organization, stats } = useOrganization();
  console.log('🏢 Organization context:', { organization, stats });
  
  const { facilities } = useFacility();
  console.log('🏭 Facilities context:', facilities);
  
  const { resources } = useEmission();
  console.log('⚡ Resources context:', resources);

  const loading = dashboardLoading;
  console.log('⏳ Final loading state:', loading);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  // Get real chart data from API
  const totalEmissionsData = metrics.monthlyEmissions || [];
  const scope1Data = metrics.scopeBreakdown?.scope1 || [];
  const scope2Data = metrics.scopeBreakdown?.scope2 || [];
  const productionData = metrics.monthlyProduction || [];
  const intensityData = metrics.monthlyIntensity || [];

  // Get trends from API
  const emissionsTrend = {
    value: metrics.trends?.emissions?.value || 0,
    isPositive: metrics.trends?.emissions?.direction === 'increasing',
    isImprovement: metrics.trends?.emissions?.direction === 'decreasing' // For emissions, decrease is improvement
  };
  
  const productionTrend = {
    value: metrics.trends?.production?.value || 0,
    isPositive: metrics.trends?.production?.direction === 'increasing',
    isImprovement: metrics.trends?.production?.direction === 'increasing' // For production, increase is improvement
  };
  
  const intensityTrend = {
    value: metrics.trends?.carbonIntensity?.value || 0,
    isPositive: metrics.trends?.carbonIntensity?.direction === 'increasing',
    isImprovement: metrics.trends?.carbonIntensity?.direction === 'decreasing' // For intensity, decrease is improvement
  };

  // Add detailed debugging for dashboard stats
  console.log('📈 Dashboard metrics for stats:', {
    totalFacilities: metrics.totalFacilities,
    activeTargets: metrics.activeTargets,
    totalEmissions: metrics.totalEmissions,
    totalProduction: metrics.totalProduction,
    fullMetrics: metrics
  });

  const dashboardStats = [
    {
      name: 'Total Facilities',
      value: metrics.totalFacilities || 0,
      icon: BuildingOfficeIcon,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      name: 'Active Targets',
      value: metrics.activeTargets || 0,
      icon: ClipboardDocumentListIcon,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
    },
    {
      name: 'Annual Emissions',
      value: formatNumber(metrics.totalEmissions || 0, { compact: true }),
      unit: 'kgCO2e',
      icon: FireIcon,
      color: 'text-danger-600',
      bgColor: 'bg-danger-50',
    },
    {
      name: 'Annual Production',
      value: formatNumber(metrics.totalProduction || 0, { compact: true }),
      unit: 'tonnes',
      icon: ScaleIcon,
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
    },
  ];

  console.log('📊 Final dashboard stats values:', dashboardStats.map(s => ({ name: s.name, value: s.value })));

  return (
    <div className="space-y-6">
      {/* Welcome Header with Filters */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive dashboard with analytics & insights for your sustainability data
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-3">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="form-input text-sm"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="form-input text-sm"
              >
                <option value="">All Facilities</option>
                {facilities.map(facility => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}
                  </option>
                ))}
              </select>
              <select
                value={chartTimePeriod}
                onChange={(e) => setChartTimePeriod(e.target.value)}
                className="form-input text-sm"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Organization</p>
              <p className="text-lg font-semibold text-gray-900">
                {user?.organization?.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  {stat.unit && (
                    <p className="ml-1 text-sm text-gray-500">{stat.unit}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trend Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Emissions Trend</p>
              <p className="text-2xl font-semibold text-gray-900">
                {emissionsTrend.isPositive ? '+' : '-'}{parseFloat(emissionsTrend.value).toFixed(2)}%
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              emissionsTrend.isImprovement ? 'bg-success-50' : 'bg-danger-50'
            }`}>
              {emissionsTrend.isPositive ? (
                <ArrowTrendingUpIcon className={`h-6 w-6 ${
                  emissionsTrend.isImprovement ? 'text-success-600' : 'text-danger-600'
                }`} />
              ) : (
                <ArrowTrendingDownIcon className={`h-6 w-6 ${
                  emissionsTrend.isImprovement ? 'text-success-600' : 'text-danger-600'
                }`} />
              )}
            </div>
          </div>
          <p className={`text-xs mt-2 ${
            emissionsTrend.isImprovement ? 'text-success-600' : 'text-danger-600'
          }`}>
            {emissionsTrend.isImprovement ? 'Improving' : 'Needs attention'} vs previous quarter
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Production Trend</p>
              <p className="text-2xl font-semibold text-gray-900">
                {productionTrend.isPositive ? '+' : '-'}{parseFloat(productionTrend.value).toFixed(2)}%
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              productionTrend.isPositive ? 'bg-success-50' : 'bg-warning-50'
            }`}>
              {productionTrend.isPositive ? (
                <ArrowTrendingUpIcon className={`h-6 w-6 ${
                  productionTrend.isPositive ? 'text-success-600' : 'text-warning-600'
                }`} />
              ) : (
                <ArrowTrendingDownIcon className={`h-6 w-6 ${
                  productionTrend.isPositive ? 'text-success-600' : 'text-warning-600'
                }`} />
              )}
            </div>
          </div>
          <p className={`text-xs mt-2 ${
            productionTrend.isPositive ? 'text-success-600' : 'text-warning-600'
          }`}>
            {productionTrend.isPositive ? 'Increasing' : 'Decreasing'} vs previous quarter
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Carbon Intensity Trend</p>
              <p className="text-2xl font-semibold text-gray-900">
                {intensityTrend.isPositive ? '+' : '-'}{parseFloat(intensityTrend.value).toFixed(2)}%
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              intensityTrend.isImprovement ? 'bg-success-50' : 'bg-danger-50'
            }`}>
              {intensityTrend.isPositive ? (
                <ArrowTrendingUpIcon className={`h-6 w-6 ${
                  intensityTrend.isImprovement ? 'text-success-600' : 'text-danger-600'
                }`} />
              ) : (
                <ArrowTrendingDownIcon className={`h-6 w-6 ${
                  intensityTrend.isImprovement ? 'text-success-600' : 'text-danger-600'
                }`} />
              )}
            </div>
          </div>
          <p className={`text-xs mt-2 ${
            intensityTrend.isImprovement ? 'text-success-600' : 'text-danger-600'
          }`}>
            {intensityTrend.isImprovement ? 'Improving efficiency' : 'Needs optimization'}
          </p>
        </div>
      </div>

      {/* Enhanced Performance Summary */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Performance Summary
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Carbon Intensity</p>
              <p className="text-sm text-gray-500">Average: 845 kgCO2e/tonne</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary-600">-3.2%</p>
              <p className="text-xs text-success-600">vs last year</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Energy Efficiency</p>
              <p className="text-sm text-gray-500">Average: 3.1 GJ/tonne</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-success-600">-5.8%</p>
              <p className="text-xs text-success-600">vs last year</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Alternative Fuels</p>
              <p className="text-sm text-gray-500">Current: 18.5%</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-success-600">+12%</p>
              <p className="text-xs text-success-600">vs last year</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Renewable Energy</p>
              <p className="text-sm text-gray-500">Mix: {((metrics.carbonIntensity || 0) * 100).toFixed(0)}%</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-success-600">+8.4%</p>
              <p className="text-xs text-success-600">vs last year</p>
            </div>
          </div>
        </div>
      </div>

      {/* Aggregated Facility Data Charts */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Facility Performance Analytics</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">View:</span>
            <div className="bg-gray-100 p-1 rounded-lg flex">
              <button
                onClick={() => setChartTimePeriod('monthly')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  chartTimePeriod === 'monthly'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setChartTimePeriod('yearly')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  chartTimePeriod === 'yearly'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
              </button>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Emissions Trend Chart */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-red-50">
                  <FireIcon className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Emissions Trend</h3>
                  <p className="text-sm text-gray-500">
                    {chartTimePeriod === 'monthly' ? 'Last 12 months' : 'Last 5 years'}
                  </p>
                </div>
              </div>
            </div>
            <EmissionsChart timePeriod={chartTimePeriod} emissions={metrics.monthlyEmissions || []} />
          </div>

          {/* Production Trend Chart */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  <ScaleIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Production Trend</h3>
                  <p className="text-sm text-gray-500">
                    {chartTimePeriod === 'monthly' ? 'Last 12 months' : 'Last 5 years'}
                  </p>
                </div>
              </div>
            </div>
            <ProductionChart timePeriod={chartTimePeriod} production={metrics.monthlyProduction || []} />
          </div>

          {/* Carbon Intensity Chart */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-50">
                  <GlobeAltIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Carbon Intensity</h3>
                  <p className="text-sm text-gray-500">kgCO2e per tonne cement</p>
                </div>
              </div>
            </div>
            <CarbonIntensityChart timePeriod={chartTimePeriod} emissions={metrics.monthlyEmissions || []} production={metrics.monthlyProduction || []} />
          </div>

          {/* Energy Consumption Chart */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-yellow-50">
                  <BoltIcon className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Energy Consumption</h3>
                  <p className="text-sm text-gray-500">
                    {chartTimePeriod === 'monthly' ? 'Last 12 months' : 'Last 5 years'}
                  </p>
                </div>
              </div>
            </div>
            <EnergyChart timePeriod={chartTimePeriod} />
          </div>

          {/* Energy Intensity Chart */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-indigo-50">
                  <BoltIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Energy Intensity</h3>
                  <p className="text-sm text-gray-500">GJ per tonne cement</p>
                </div>
              </div>
            </div>
            <EnergyIntensityChart timePeriod={chartTimePeriod} production={metrics.monthlyProduction || []} />
          </div>

          {/* Facility Carbon Intensity Comparison */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: chartColors.primaryLight }}>
                  <GlobeAltIcon className="h-5 w-5" style={{ color: chartColors.primary }} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Carbon Intensity by Facility</h3>
                  <p className="text-sm text-gray-500">kgCO2e per tonne cement</p>
                </div>
              </div>
            </div>
            <FacilityCarbonIntensityChart 
              timePeriod={chartTimePeriod} 
              facilities={facilities || []} 
            />
          </div>

          {/* Facility Energy Intensity Comparison */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: chartColors.secondaryLight }}>
                  <BoltIcon className="h-5 w-5" style={{ color: chartColors.secondary }} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Energy Intensity by Facility</h3>
                  <p className="text-sm text-gray-500">GJ per tonne cement</p>
                </div>
              </div>
            </div>
            <FacilityEnergyIntensityChart 
              timePeriod={chartTimePeriod} 
              facilities={facilities || []} 
            />
          </div>
        </div>
      </div>

      {/* Key Insights & Recommendations */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Key Insights & Recommendations</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-success-500 pl-4">
            <p className="font-medium text-success-900">✓ Strong Q3 Performance</p>
            <p className="text-sm text-gray-600">15% improvement in carbon intensity compared to Q2</p>
          </div>
          
          <div className="border-l-4 border-warning-500 pl-4">
            <p className="font-medium text-warning-900">⚠ Energy Optimization Opportunity</p>
            <p className="text-sm text-gray-600">Peak energy usage detected during off-peak production hours</p>
          </div>
          
          <div className="border-l-4 border-primary-500 pl-4">
            <p className="font-medium text-primary-900">→ Alternative Fuel Expansion</p>
            <p className="text-sm text-gray-600">Ready to increase biomass usage to 25% based on current performance</p>
          </div>
          
          <div className="border-l-4 border-danger-500 pl-4">
            <p className="font-medium text-danger-900">! Seasonal Variation</p>
            <p className="text-sm text-gray-600">Winter months show 8% higher emissions - consider seasonal planning</p>
          </div>

          <div className="border-l-4 border-info-500 pl-4">
            <p className="font-medium text-info-900">📊 Data Quality</p>
            <p className="text-sm text-gray-600">All facilities reporting consistently - 98% data completeness achieved</p>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <p className="font-medium text-purple-900">🎯 Target Progress</p>
            <p className="text-sm text-gray-600">On track to meet 2025 carbon intensity targets with current improvement rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Chart Components with Mock Data Visualization

// Emissions Chart Component
const EmissionsChart = ({ timePeriod, emissions }) => {
  const generateChartData = () => {
    if (timePeriod === 'monthly') {
      // Last 12 months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const scope1Data = months.map(() => Math.random() * 50000 + 30000);
      const scope2Data = months.map(() => Math.random() * 25000 + 15000);
      
      return { labels: months, scope1Data, scope2Data };
    } else {
      // Last 5 years
      const years = ['2020', '2021', '2022', '2023', '2024'];
      const scope1Data = years.map(() => Math.random() * 600000 + 400000);
      const scope2Data = years.map(() => Math.random() * 300000 + 200000);
      
      return { labels: years, scope1Data, scope2Data };
    }
  };

  const { labels, scope1Data, scope2Data } = generateChartData();
  const maxValue = Math.max(...scope1Data, ...scope2Data);

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartColors.primary }}></div>
            <span className="text-gray-600">Scope 1</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartColors.secondary }}></div>
            <span className="text-gray-600">Scope 2</span>
          </div>
        </div>
      </div>
      
      <div className="h-80 flex items-end justify-between space-x-2 relative">
        {labels.map((label, index) => (
          <div key={label} className="flex-1 flex flex-col items-center space-y-1 group">
            <div className="w-full flex flex-col items-center space-y-1 relative">
              {/* Scope 1 Bar */}
              <div 
                className="w-full rounded-t-md transition-colors cursor-pointer relative"
                style={{ 
                  height: `${(scope1Data[index] / maxValue) * 280}px`,
                  backgroundColor: chartColors.primary
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = chartColors.primaryHover}
                onMouseLeave={(e) => e.target.style.backgroundColor = chartColors.primary}
              >
                {/* Hover Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  <div className="text-center">
                    <div className="font-semibold" style={{ color: chartColors.primaryLight }}>Scope 1</div>
                    <div>{(scope1Data[index] / 1000).toFixed(1)}k kgCO2e</div>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
              {/* Scope 2 Bar */}
              <div 
                className="w-full rounded-b-md transition-colors cursor-pointer relative"
                style={{ 
                  height: `${(scope2Data[index] / maxValue) * 140}px`,
                  backgroundColor: chartColors.secondary
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = chartColors.secondaryHover}
                onMouseLeave={(e) => e.target.style.backgroundColor = chartColors.secondary}
              >
                {/* Hover Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  <div className="text-center">
                    <div className="font-semibold" style={{ color: chartColors.secondaryLight }}>Scope 2</div>
                    <div>{(scope2Data[index] / 1000).toFixed(1)}k kgCO2e</div>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-500 mt-2">{label}</span>
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Total {timePeriod === 'monthly' ? 'Monthly' : 'Annual'} Emissions: {' '}
          <span className="font-medium">
            {((scope1Data[scope1Data.length - 1] + scope2Data[scope2Data.length - 1]) / 1000).toFixed(0)}k kgCO2e
          </span>
        </p>
      </div>
    </div>
  );
};

// Production Chart Component
const ProductionChart = ({ timePeriod, production }) => {
  const generateChartData = () => {
    if (timePeriod === 'monthly') {
      // Last 12 months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const productionData = months.map(() => Math.random() * 20000 + 15000);
      
      return { labels: months, productionData };
    } else {
      // Last 5 years
      const years = ['2020', '2021', '2022', '2023', '2024'];
      const productionData = years.map(() => Math.random() * 250000 + 200000);
      
      return { labels: years, productionData };
    }
  };

  const { labels, productionData } = generateChartData();
  const maxValue = Math.max(...productionData);

  return (
    <div className="space-y-4">
      <div className="h-80 flex items-end justify-between space-x-2 relative">
        {labels.map((label, index) => (
          <div key={label} className="flex-1 flex flex-col items-center space-y-1 group">
            <div 
              className="w-full rounded-t-md transition-colors cursor-pointer relative"
              style={{ 
                height: `${(productionData[index] / maxValue) * 280}px`,
                backgroundColor: chartColors.primary
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = chartColors.primaryHover}
              onMouseLeave={(e) => e.target.style.backgroundColor = chartColors.primary}
            >
              {/* Hover Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                <div className="text-center">
                  <div className="font-semibold" style={{ color: chartColors.primaryLight }}>Production</div>
                  <div>{(productionData[index] / 1000).toFixed(1)}k tonnes</div>
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
            <span className="text-xs text-gray-500 mt-2">{label}</span>
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Current {timePeriod === 'monthly' ? 'Monthly' : 'Annual'} Production: {' '}
          <span className="font-medium">
            {(productionData[productionData.length - 1] / 1000).toFixed(0)}k tonnes
          </span>
        </p>
      </div>
    </div>
  );
};

// Carbon Intensity Chart Component
const CarbonIntensityChart = ({ timePeriod, emissions, production }) => {
  const generateChartData = () => {
    if (timePeriod === 'monthly') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Generate realistic emissions and production data for calculation
      const monthlyEmissions = months.map(() => Math.random() * 50000 + 75000); // 75-125k kgCO2e
      const monthlyProduction = months.map(() => Math.random() * 20000 + 80000); // 80-100k tonnes
      
      // Calculate actual carbon intensity: emissions/production
      const intensityData = monthlyEmissions.map((emission, index) => 
        emission / monthlyProduction[index] // kgCO2e per tonne
      );
      
      return { labels: months, intensityData, monthlyEmissions, monthlyProduction };
    } else {
      const years = ['2020', '2021', '2022', '2023', '2024'];
      
      // Generate realistic annual data showing improvement trend
      const annualEmissions = [850000, 820000, 790000, 760000, 730000]; // Decreasing emissions
      const annualProduction = [1000000, 1020000, 1040000, 1060000, 1080000]; // Increasing production
      
      // Calculate actual carbon intensity: emissions/production
      const intensityData = annualEmissions.map((emission, index) => 
        emission / annualProduction[index] // kgCO2e per tonne
      );
      
      return { labels: years, intensityData, annualEmissions, annualProduction };
    }
  };

  const { labels, intensityData } = generateChartData();
  const maxValue = Math.max(...intensityData);
  const minValue = Math.min(...intensityData);

  return (
    <div className="space-y-4">
      <div className="h-80 relative">
        {/* Chart Line */}
        <svg className="w-full h-full">
          <polyline
            fill="none"
            stroke={chartColors.primary}
            strokeWidth="3"
            points={labels.map((_, index) => {
              const x = (index / (labels.length - 1)) * 100;
              const y = 100 - ((intensityData[index] - minValue) / (maxValue - minValue)) * 80;
              return `${x}% ${y}%`;
            }).join(' ')}
          />
          {/* Data points */}
          {labels.map((_, index) => {
            const x = (index / (labels.length - 1)) * 100;
            const y = 100 - ((intensityData[index] - minValue) / (maxValue - minValue)) * 80;
            return (
              <circle
                key={index}
                cx={`${x}%`}
                cy={`${y}%`}
                r="4"
                fill={chartColors.primary}
                stroke="white"
                strokeWidth="2"
                className="hover:r-6 transition-all cursor-pointer"
                title={`${labels[index]}: ${intensityData[index].toFixed(1)} kgCO2e/tonne`}
              />
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
          {labels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-center">
          <div className="text-lg font-semibold" style={{ color: chartColors.primary }}>
            {intensityData[intensityData.length - 1].toFixed(1)}
          </div>
          <div className="text-gray-500">Current Intensity (kgCO2e/t)</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {(() => {
              if (intensityData.length < 2) return 'N/A';
              const current = intensityData[intensityData.length - 1];
              const previous = intensityData[intensityData.length - 2];
              const change = ((current - previous) / previous) * 100;
              return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
            })()}
          </div>
          <div className="text-gray-500">vs Previous</div>
        </div>
      </div>
    </div>
  );
};

// Facility Carbon Intensity Comparison Chart
const FacilityCarbonIntensityChart = ({ timePeriod, facilities }) => {
  const generateFacilityData = () => {
    return facilities.slice(0, 6).map((facility, index) => {
      // Generate realistic emissions and production for each facility
      const facilityEmissions = Math.random() * 100000 + 50000;
      const facilityProduction = Math.random() * 30000 + 20000;
      // Calculate actual carbon intensity: emissions/production
      const facilityIntensity = facilityEmissions / facilityProduction;
      
      return {
        name: facility.name,
        emissions: facilityEmissions,
        production: facilityProduction,
        intensity: facilityIntensity, // Calculated carbon intensity
        color: index % 2 === 0 ? chartColors.primary : chartColors.secondary
      };
    });
  };

  const facilityData = generateFacilityData();
  const maxIntensity = Math.max(...facilityData.map(f => f.intensity));

  return (
    <div className="space-y-4">
      <div className="h-80 flex items-end justify-between space-x-3">
        {facilityData.map((facility, index) => (
          <div key={facility.name} className="flex-1 flex flex-col items-center space-y-2 group">
            <div 
              className="w-full rounded-t-md transition-colors cursor-pointer relative"
              style={{ 
                height: `${(facility.intensity / maxIntensity) * 280}px`,
                backgroundColor: facility.color
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = index % 2 === 0 ? chartColors.primaryHover : chartColors.secondaryHover;
              }}
              onMouseLeave={(e) => e.target.style.backgroundColor = facility.color}
            >
              {/* Hover Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                <div className="text-center">
                  <div className="font-semibold text-white">{facility.name}</div>
                  <div>{facility.intensity.toFixed(1)} kgCO2e/tonne</div>
                  <div className="text-xs text-gray-300">
                    Production: {(facility.production / 1000).toFixed(0)}k tonnes
                  </div>
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
            <span className="text-xs text-gray-500 text-center leading-tight">{facility.name}</span>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-lg font-semibold" style={{ color: chartColors.secondary }}>
            {facilityData.length > 0 ? Math.min(...facilityData.map(f => f.intensity)).toFixed(1) : '0.0'}
          </div>
          <div className="text-gray-500">Best Performer</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {facilityData.length > 0 ? (facilityData.reduce((sum, f) => sum + f.intensity, 0) / facilityData.length).toFixed(1) : '0.0'}
          </div>
          <div className="text-gray-500">Average</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold" style={{ color: chartColors.primary }}>
            {facilityData.length > 0 ? Math.max(...facilityData.map(f => f.intensity)).toFixed(1) : '0.0'}
          </div>
          <div className="text-gray-500">Needs Improvement</div>
        </div>
      </div>
    </div>
  );
};

// Facility Energy Intensity Comparison Chart
const FacilityEnergyIntensityChart = ({ timePeriod, facilities }) => {
  const generateFacilityData = () => {
    return facilities.slice(0, 6).map((facility, index) => {
      // Generate realistic energy and production for each facility
      const facilityTotalEnergy = Math.random() * 300000 + 200000; // 200-500k GJ
      const facilityProduction = Math.random() * 30000 + 20000; // 20-50k tonnes
      // Calculate actual energy intensity: total energy/production
      const facilityIntensity = facilityTotalEnergy / facilityProduction;
      
      return {
        name: facility.name,
        totalEnergy: facilityTotalEnergy,
        production: facilityProduction,
        intensity: facilityIntensity, // Calculated energy intensity
        isGoodPerformance: facilityIntensity < 3.5 // Below target
      };
    });
  };

  const facilityData = generateFacilityData();
  const maxIntensity = Math.max(...facilityData.map(f => f.intensity));

  return (
    <div className="space-y-4">
      <div className="h-80 flex items-end justify-between space-x-3 relative">
        {/* Target line */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-dashed border-red-400 opacity-60" style={{ top: `${100 - (3.5 / maxIntensity) * 100}%` }}></div>
          <span className="absolute right-2 text-xs text-red-500 bg-white px-1" style={{ top: `${100 - (3.5 / maxIntensity) * 100 - 10}%` }}>
            Target: 3.5 GJ/t
          </span>
        </div>
        
        {facilityData.map((facility, index) => (
          <div key={facility.name} className="flex-1 flex flex-col items-center space-y-2 group">
            <div 
              className="w-full rounded-t-md transition-colors cursor-pointer relative"
              style={{ 
                height: `${(facility.intensity / maxIntensity) * 280}px`,
                backgroundColor: facility.isGoodPerformance ? chartColors.secondary : chartColors.quaternary
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = facility.isGoodPerformance ? chartColors.secondaryHover : chartColors.quaternaryHover;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = facility.isGoodPerformance ? chartColors.secondary : chartColors.quaternary;
              }}
            >
              {/* Hover Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                <div className="text-center">
                  <div className="font-semibold text-white">{facility.name}</div>
                  <div>{facility.intensity.toFixed(2)} GJ/tonne</div>
                  <div className="text-xs text-gray-300">
                    {facility.isGoodPerformance ? '✓ Below target' : '△ Above target'}
                  </div>
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
            <span className="text-xs text-gray-500 text-center leading-tight">{facility.name}</span>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-lg font-semibold" style={{ color: chartColors.secondary }}>
            {facilityData.filter(f => f.isGoodPerformance).length}
          </div>
          <div className="text-gray-500">Meeting Target</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {facilityData.length > 0 ? (facilityData.reduce((sum, f) => sum + f.intensity, 0) / facilityData.length).toFixed(1) : '0.0'}
          </div>
          <div className="text-gray-500">Average GJ/t</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold" style={{ color: chartColors.primary }}>
            {facilityData.filter(f => !f.isGoodPerformance).length}
          </div>
          <div className="text-gray-500">Above Target</div>
        </div>
      </div>
    </div>
  );
};

// Energy Chart Component
const EnergyChart = ({ timePeriod }) => {
  const generateChartData = () => {
    if (timePeriod === 'monthly') {
      // Last 12 months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const renewableData = months.map(() => Math.random() * 15000 + 5000);  // 5-20 GJ
      const nonRenewableData = months.map(() => Math.random() * 40000 + 20000); // 20-60 GJ
      
      return { labels: months, renewableData, nonRenewableData };
    } else {
      // Last 5 years
      const years = ['2020', '2021', '2022', '2023', '2024'];
      const renewableData = years.map((_, index) => (Math.random() * 50000 + 30000) * (1 + index * 0.15)); // Growing renewable
      const nonRenewableData = years.map((_, index) => (Math.random() * 400000 + 300000) * (1 - index * 0.05)); // Decreasing non-renewable
      
      return { labels: years, renewableData, nonRenewableData };
    }
  };

  const { labels, renewableData, nonRenewableData } = generateChartData();
  const maxValue = Math.max(...renewableData.map((r, i) => r + nonRenewableData[i]));

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartColors.secondary }}></div>
            <span className="text-gray-600">Renewable</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartColors.primary }}></div>
            <span className="text-gray-600">Non-renewable</span>
          </div>
        </div>
      </div>
      
      <div className="h-80 flex items-end justify-between space-x-2 relative">
        {labels.map((label, index) => {
          const totalEnergy = renewableData[index] + nonRenewableData[index];
          const renewableHeight = (renewableData[index] / maxValue) * 280;
          const nonRenewableHeight = (nonRenewableData[index] / maxValue) * 280;
          
          return (
            <div key={label} className="flex-1 flex flex-col items-center space-y-1 group">
              <div className="w-full flex flex-col items-center">
                {/* Non-renewable Energy Bar */}
                <div 
                  className="w-full rounded-t-md transition-colors cursor-pointer relative"
                  style={{ 
                    height: `${nonRenewableHeight}px`,
                    backgroundColor: chartColors.primary
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = chartColors.primaryHover}
                  onMouseLeave={(e) => e.target.style.backgroundColor = chartColors.primary}
                >
                  {/* Hover Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    <div className="text-center">
                      <div className="font-semibold" style={{ color: chartColors.primaryLight }}>Non-renewable</div>
                      <div>{(nonRenewableData[index] / 1000).toFixed(1)}k GJ</div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
                {/* Renewable Energy Bar */}
                <div 
                  className="w-full rounded-b-md transition-colors cursor-pointer relative"
                  style={{ 
                    height: `${renewableHeight}px`,
                    backgroundColor: chartColors.secondary
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = chartColors.secondaryHover}
                  onMouseLeave={(e) => e.target.style.backgroundColor = chartColors.secondary}
                >
                  {/* Hover Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    <div className="text-center">
                      <div className="font-semibold" style={{ color: chartColors.secondaryLight }}>Renewable</div>
                      <div>{(renewableData[index] / 1000).toFixed(1)}k GJ</div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-500 mt-2">{label}</span>
            </div>
          );
        })}
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-lg font-semibold" style={{ color: chartColors.secondary }}>
            {((renewableData[renewableData.length - 1]) / 1000).toFixed(0)}k
          </div>
          <div className="text-gray-500">Renewable GJ</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold" style={{ color: chartColors.primary }}>
            {((nonRenewableData[nonRenewableData.length - 1]) / 1000).toFixed(0)}k
          </div>
          <div className="text-gray-500">Non-renewable GJ</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {((renewableData[renewableData.length - 1] / (renewableData[renewableData.length - 1] + nonRenewableData[nonRenewableData.length - 1])) * 100).toFixed(0)}%
          </div>
          <div className="text-gray-500">Renewable %</div>
        </div>
      </div>
    </div>
  );
};

// Energy Intensity Chart Component
const EnergyIntensityChart = ({ timePeriod, production }) => {
  const generateChartData = () => {
    if (timePeriod === 'monthly') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Generate realistic energy and production data for calculation
      const monthlyRenewableEnergy = months.map(() => Math.random() * 15000 + 10000); // 10-25k GJ
      const monthlyNonRenewableEnergy = months.map(() => Math.random() * 40000 + 250000); // 250-290k GJ
      const monthlyProduction = months.map(() => Math.random() * 20000 + 80000); // 80-100k tonnes
      
      // Calculate total energy consumption and energy intensity
      const totalEnergyData = monthlyRenewableEnergy.map((renewable, index) => 
        renewable + monthlyNonRenewableEnergy[index]
      );
      
      // Calculate actual energy intensity: total energy/production (GJ per tonne)
      const intensityData = totalEnergyData.map((energy, index) => 
        energy / monthlyProduction[index] // GJ per tonne
      );
      
      return { labels: months, intensityData, totalEnergyData, monthlyProduction };
    } else {
      const years = ['2020', '2021', '2022', '2023', '2024'];
      
      // Generate realistic annual data showing improvement trend
      const annualRenewableEnergy = [120000, 150000, 180000, 220000, 270000]; // Increasing renewable
      const annualNonRenewableEnergy = [3200000, 3100000, 3000000, 2900000, 2800000]; // Decreasing non-renewable
      const annualProduction = [1000000, 1020000, 1040000, 1060000, 1080000]; // Increasing production
      
      // Calculate total energy and energy intensity
      const totalEnergyData = annualRenewableEnergy.map((renewable, index) => 
        renewable + annualNonRenewableEnergy[index]
      );
      
      // Calculate actual energy intensity: total energy/production (GJ per tonne)
      const intensityData = totalEnergyData.map((energy, index) => 
        energy / annualProduction[index] // GJ per tonne
      );
      
      return { labels: years, intensityData, totalEnergyData, annualProduction };
    }
  };

  const { labels, intensityData } = generateChartData();
  const maxValue = Math.max(...intensityData);
  const minValue = Math.min(...intensityData);

  return (
    <div className="space-y-4">
      <div className="h-80 relative">
        {/* Chart Area */}
        <div className="h-full flex items-end justify-between space-x-2">
          {labels.map((label, index) => {
            const height = ((intensityData[index] - minValue) / (maxValue - minValue)) * 280;
            const isGoodPerformance = intensityData[index] < 3.5;
            
            return (
              <div key={label} className="flex-1 flex flex-col items-center space-y-1 group">
                <div 
                  className="w-full rounded-t-md cursor-pointer transition-colors relative"
                  style={{ 
                    height: `${height || 20}px`,
                    backgroundColor: isGoodPerformance ? chartColors.secondary : chartColors.primary
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = isGoodPerformance ? chartColors.secondaryHover : chartColors.primaryHover}
                  onMouseLeave={(e) => e.target.style.backgroundColor = isGoodPerformance ? chartColors.secondary : chartColors.primary}
                >
                  {/* Hover Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    <div className="text-center">
                      <div className="font-semibold" style={{ color: isGoodPerformance ? chartColors.secondaryLight : chartColors.primaryLight }}>
                        Energy Intensity
                      </div>
                      <div>{intensityData[index].toFixed(2)} GJ/tonne</div>
                      <div className="text-xs text-gray-300">
                        {isGoodPerformance ? '✓ Below target' : '△ Above target'}
                      </div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
                <span className="text-xs text-gray-500 mt-2">{label}</span>
              </div>
            );
          })}
        </div>
        
        {/* Target line */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-dashed border-red-400 opacity-60"></div>
          <span className="absolute right-2 text-xs text-red-500 bg-white px-1">
            Target: 3.5 GJ/t
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-lg font-semibold" style={{ color: chartColors.primary }}>
            {intensityData[intensityData.length - 1].toFixed(2)}
          </div>
          <div className="text-gray-500">Current GJ/tonne</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {(() => {
              if (intensityData.length < 2) return 'N/A';
              const current = intensityData[intensityData.length - 1];
              const previous = intensityData[intensityData.length - 2];
              const change = ((current - previous) / previous) * 100;
              return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
            })()}
          </div>
          <div className="text-gray-500">vs Previous</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold" style={{ color: intensityData[intensityData.length - 1] < 3.5 ? chartColors.secondary : chartColors.primary }}>
            {intensityData[intensityData.length - 1] < 3.5 ? '✓ Target' : '△ Above'}
          </div>
          <div className="text-gray-500">Performance</div>
        </div>
      </div>
      
      <div className="rounded-lg p-3" style={{ backgroundColor: chartColors.primaryLight, borderColor: chartColors.primary, borderWidth: '1px' }}>
        <div className="text-sm" style={{ color: chartColors.primaryHover }}>
          <strong>Industry Benchmark:</strong> 3.5 GJ/tonne cement • 
          <strong> Best Practice:</strong> 3.0 GJ/tonne
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
