/**
 * Production Tracking Services Test Page
 * Demonstrates advanced production analytics, reporting, and forecasting
 */

import React, { useState, useEffect } from 'react';
import { useFacility } from '../contexts/FacilityContext';
import { useNotification } from '../contexts/NotificationContext';
import apiService from '../services/api';

// UI Components
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorAlert from '../components/ui/ErrorAlert';

const ProductionTrackingTest = () => {
  const { facilities, loading: facilitiesLoading } = useFacility();
  const { showSuccess, showError, showInfo } = useNotification();

  // State for selected facility and year
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // State for analytics data
  const [analyticsData, setAnalyticsData] = useState(null);
  const [orgSummaryData, setOrgSummaryData] = useState(null);
  const [trendsData, setTrendsData] = useState(null);
  
  // Loading states
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [loadingOrgSummary, setLoadingOrgSummary] = useState(false);
  const [loadingTrends, setLoadingTrends] = useState(false);

  // Initialize with first facility
  useEffect(() => {
    if (facilities && facilities.length > 0 && !selectedFacility) {
      setSelectedFacility(facilities[0]);
    }
  }, [facilities, selectedFacility]);

  // Load data when facility or year changes
  useEffect(() => {
    if (selectedFacility) {
      loadAllProductionData();
    }
  }, [selectedFacility, selectedYear]);

  const loadAllProductionData = async () => {
    if (!selectedFacility) return;

    showInfo('Loading production analytics...', { title: 'Data Loading' });
    
    // Load analytics data
    await loadAnalytics();
    
    // Load organization summary
    await loadOrganizationSummary();
    
    // Load trends data
    await loadTrends();

    showSuccess('All production data loaded successfully!', { title: 'Data Loaded' });
  };

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const response = await apiService.getProductionAnalytics(selectedFacility.id, {
        startYear: selectedYear - 1,
        endYear: selectedYear,
        comparison: 'year-over-year'
      });
      
      if (response.success) {
        setAnalyticsData(response.data);
      } else {
        throw new Error(response.message || 'Failed to load analytics');
      }
    } catch (error) {
      showError(`Failed to load analytics: ${error.message}`, { title: 'Analytics Error' });
      setAnalyticsData(null);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const loadOrganizationSummary = async () => {
    setLoadingOrgSummary(true);
    try {
      const response = await apiService.getOrganizationProductionSummary({
        year: selectedYear,
        groupBy: 'facility'
      });
      
      if (response.success) {
        setOrgSummaryData(response.data);
      } else {
        throw new Error(response.message || 'Failed to load organization summary');
      }
    } catch (error) {
      showError(`Failed to load organization summary: ${error.message}`, { title: 'Summary Error' });
      setOrgSummaryData(null);
    } finally {
      setLoadingOrgSummary(false);
    }
  };

  const loadTrends = async () => {
    setLoadingTrends(true);
    try {
      const response = await apiService.getProductionTrends(selectedFacility.id, {
        months: 12,
        includeForecasting: true
      });
      
      if (response.success) {
        setTrendsData(response.data);
      } else {
        throw new Error(response.message || 'Failed to load trends');
      }
    } catch (error) {
      showError(`Failed to load trends: ${error.message}`, { title: 'Trends Error' });
      setTrendsData(null);
    } finally {
      setLoadingTrends(false);
    }
  };

  const formatNumber = (num) => {
    if (num === undefined || num === null) return 'N/A';
    return new Intl.NumberFormat().format(Math.round(num));
  };

  const formatPercentage = (num) => {
    if (num === undefined || num === null) return 'N/A';
    return `${Math.round(num * 100) / 100}%`;
  };

  if (facilitiesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading facilities..." />
      </div>
    );
  }

  if (!facilities || facilities.length === 0) {
    return (
      <ErrorAlert
        type="warning"
        title="No Facilities Found"
        message="No facilities available for production tracking analysis."
      />
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          📊 Production Tracking Services
        </h1>
        
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Facility
            </label>
            <select
              value={selectedFacility?.id || ''}
              onChange={(e) => {
                const facility = facilities.find(f => f.id === e.target.value);
                setSelectedFacility(facility);
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {facilities.map(facility => (
                <option key={facility.id} value={facility.id}>
                  {facility.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Analysis Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadAllProductionData}
              disabled={!selectedFacility}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Facility Analytics */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                📈 Facility Analytics
              </h2>
              {loadingAnalytics && <LoadingSpinner size="sm" />}
            </div>

            {analyticsData ? (
              <div className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-sm text-gray-600">Total Production</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatNumber(analyticsData.summary?.totalProduction)} tonnes
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-sm text-gray-600">Monthly Average</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatNumber(analyticsData.summary?.averageMonthlyProduction)} tonnes
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-sm text-gray-600">Peak Production</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {formatNumber(analyticsData.summary?.peakProduction)} tonnes
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-sm text-gray-600">Data Completeness</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {formatPercentage(analyticsData.summary?.dataCompleteness)}
                    </div>
                  </div>
                </div>

                {/* Year-over-Year Comparison */}
                {analyticsData.comparisons?.yearOverYear && (
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="font-medium text-gray-900 mb-3">Year-over-Year Comparison</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">
                          {analyticsData.comparisons.yearOverYear.currentYear.year}
                        </div>
                        <div className="text-lg font-semibold">
                          {formatNumber(analyticsData.comparisons.yearOverYear.currentYear.production)} tonnes
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">
                          {analyticsData.comparisons.yearOverYear.previousYear.year}
                        </div>
                        <div className="text-lg font-semibold">
                          {formatNumber(analyticsData.comparisons.yearOverYear.previousYear.production)} tonnes
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <span className={`text-lg font-bold ${
                        analyticsData.comparisons.yearOverYear.change.percentage >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {analyticsData.comparisons.yearOverYear.change.percentage >= 0 ? '+' : ''}
                        {formatPercentage(analyticsData.comparisons.yearOverYear.change.percentage)} change
                      </span>
                    </div>
                  </div>
                )}

                {/* Quarterly Growth */}
                {analyticsData.trends?.quarterlyGrowth && (
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="font-medium text-gray-900 mb-3">Quarterly Growth</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {analyticsData.trends.quarterlyGrowth.map((quarter, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">{quarter.period}</span>
                          <span className="font-medium">
                            {formatNumber(quarter.production)} tonnes
                          </span>
                          <span className={`font-bold ${
                            quarter.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {quarter.growthRate >= 0 ? '+' : ''}{formatPercentage(quarter.growthRate)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Select a facility to view analytics
              </div>
            )}
          </div>

          {/* Trends & Forecasting */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                📉 Trends & Forecasting
              </h2>
              {loadingTrends && <LoadingSpinner size="sm" />}
            </div>

            {trendsData ? (
              <div className="space-y-4">
                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-sm text-gray-600">Average Production</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatNumber(trendsData.historical?.statistics?.average)} tonnes
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-sm text-gray-600">Volatility</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {formatPercentage(trendsData.historical?.statistics?.volatility)}
                    </div>
                  </div>
                </div>

                {/* Trend Direction */}
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm text-gray-600">Trend Direction</div>
                  <div className={`text-lg font-bold ${
                    trendsData.historical?.statistics?.trend === 'increasing' ? 'text-green-600' :
                    trendsData.historical?.statistics?.trend === 'decreasing' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {trendsData.historical?.statistics?.trend?.toUpperCase() || 'STABLE'}
                  </div>
                </div>

                {/* Forecasting */}
                {trendsData.forecast && (
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="font-medium text-gray-900 mb-3">
                      🔮 Production Forecast ({trendsData.forecast.method})
                    </h3>
                    <div className="space-y-2">
                      {trendsData.forecast.nextMonths.map((forecast, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            +{forecast.monthOffset} month{forecast.monthOffset > 1 ? 's' : ''}
                          </span>
                          <span className="font-medium">
                            {formatNumber(forecast.predictedProduction)} tonnes
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatNumber(forecast.confidenceInterval.lower)} - {formatNumber(forecast.confidenceInterval.upper)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Confidence: {trendsData.forecast.confidence}
                    </div>
                  </div>
                )}

                {/* Data Points Info */}
                <div className="text-center text-sm text-gray-500">
                  Based on {trendsData.period?.dataPoints || 0} data points over {trendsData.period?.months || 0} months
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Select a facility to view trends
              </div>
            )}
          </div>
        </div>

        {/* Organization Summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              🏢 Organization Production Summary ({selectedYear})
            </h2>
            {loadingOrgSummary && <LoadingSpinner size="sm" />}
          </div>

          {orgSummaryData ? (
            <div className="space-y-4">
              {/* Organization Totals */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm text-gray-600">Total Facilities</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {orgSummaryData.organization?.totalFacilities || 0}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm text-gray-600">Facilities with Data</div>
                  <div className="text-2xl font-bold text-green-600">
                    {orgSummaryData.totals?.facilitiesWithData || 0}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm text-gray-600">Total Production</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatNumber(orgSummaryData.totals?.production)} tonnes
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm text-gray-600">Data Completeness</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatPercentage(orgSummaryData.totals?.dataCompleteness)}
                  </div>
                </div>
              </div>

              {/* Facility Breakdown */}
              <div className="bg-white rounded-lg border">
                <div className="p-4 border-b">
                  <h3 className="font-medium text-gray-900">Facility Performance Breakdown</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {orgSummaryData.breakdown?.map((facility, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{facility.facilityName}</div>
                          <div className="text-sm text-gray-600">
                            {facility.monthsWithData}/12 months • {formatPercentage(facility.dataCompleteness)} complete
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{formatNumber(facility.totalProduction)} tonnes</div>
                          <div className="text-sm text-gray-600">
                            Avg: {formatNumber(facility.averageMonthlyProduction)} tonnes/month
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Loading organization summary...
            </div>
          )}
        </div>

        {/* API Endpoints Documentation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-4">📚 Production Tracking API Endpoints</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-800">Analytics</div>
              <div className="text-blue-700 font-mono">GET /api/production/analytics/:facilityId</div>
              <div className="text-blue-600 text-xs mt-1">
                Comprehensive production analytics with YoY comparisons, seasonal patterns, and quarterly growth
              </div>
            </div>
            <div>
              <div className="font-medium text-blue-800">Organization Summary</div>
              <div className="text-blue-700 font-mono">GET /api/production/summary/organization</div>
              <div className="text-blue-600 text-xs mt-1">
                Organization-wide production aggregation with facility breakdowns and data completeness
              </div>
            </div>
            <div>
              <div className="font-medium text-blue-800">Trends & Forecasting</div>
              <div className="text-blue-700 font-mono">GET /api/production/trends/:facilityId</div>
              <div className="text-blue-600 text-xs mt-1">
                Statistical analysis, trend detection, and simple forecasting with confidence intervals
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionTrackingTest;
