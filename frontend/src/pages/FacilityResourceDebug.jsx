/**
 * Facility Resource Debug Component
 * Comprehensive debugging for facility resources data flow
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFacility } from '../contexts/FacilityContext';
import { useEmission } from '../contexts/EmissionContext';
import { useFacilityData } from '../hooks/useData';
import apiService from '../services/api';

const FacilityResourceDebug = () => {
  const { facilityId } = useParams() || { facilityId: 'fa783389-c418-421a-a570-3b575630fd76' };
  const { user, isAuthenticated } = useAuth();
  const { facilities } = useFacility();
  const { emissionResources } = useEmission();
  const { facility, resources, emissionData, metrics, loading } = useFacilityData(facilityId);
  
  const [debugInfo, setDebugInfo] = useState({});
  const [apiTest, setApiTest] = useState(null);

  // Test direct API call
  const testDirectAPI = async () => {
    try {
      console.log('🧪 Testing direct API call...');
      
      const token = apiService.getToken();
      console.log('🔑 Token available:', !!token, token?.substring(0, 20) + '...');
      
      const response = await apiService.getFacilityResources(facilityId);
      console.log('📡 Direct API response:', response);
      
      setApiTest({
        success: true,
        resourceCount: response.resources?.length || 0,
        resources: response.resources || []
      });
    } catch (error) {
      console.error('❌ Direct API error:', error);
      setApiTest({
        success: false,
        error: error.message
      });
    }
  };

  useEffect(() => {
    const debugData = {
      timestamp: new Date().toISOString(),
      auth: {
        isAuthenticated,
        userId: user?.id,
        organizationId: user?.organizationId,
        tokenExists: !!apiService.getToken()
      },
      facilityContext: {
        facilitiesCount: facilities?.length || 0,
        facilitiesLoaded: !!facilities
      },
      emissionContext: {
        resourcesCount: emissionResources?.length || 0,
        resourcesLoaded: !!emissionResources
      },
      facilityData: {
        loading,
        facilityLoaded: !!facility,
        facilityName: facility?.name,
        resourcesCount: resources?.length || 0,
        emissionDataCount: emissionData?.length || 0,
        metricsAvailable: !!metrics
      },
      urlParams: {
        facilityId,
        isValidUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(facilityId)
      }
    };
    
    console.log('🔍 Debug Info Updated:', debugData);
    setDebugInfo(debugData);
    
    // Auto-test API after 2 seconds
    if (isAuthenticated && facilityId) {
      setTimeout(() => {
        testDirectAPI();
      }, 2000);
    }
  }, [isAuthenticated, user, facilities, emissionResources, facility, resources, emissionData, metrics, loading, facilityId]);

  if (!facilityId) {
    return (
      <div className="p-6 bg-red-100 border border-red-400 rounded-lg">
        <h2 className="text-lg font-bold text-red-800">❌ No Facility ID</h2>
        <p>No facility ID provided in URL params</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h1 className="text-xl font-bold text-blue-900 mb-4">🔧 Facility Resource Debug Dashboard</h1>
        <p className="text-blue-700">Facility ID: <code className="bg-blue-100 px-2 py-1 rounded">{facilityId}</code></p>
      </div>

      {/* Authentication Status */}
      <div className={`border rounded-lg p-4 ${debugInfo.auth?.isAuthenticated ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <h2 className="text-lg font-semibold mb-2">🔐 Authentication Status</h2>
        <ul className="space-y-1 text-sm">
          <li>Authenticated: <span className="font-mono">{debugInfo.auth?.isAuthenticated ? '✅ Yes' : '❌ No'}</span></li>
          <li>User ID: <span className="font-mono">{debugInfo.auth?.userId || 'None'}</span></li>
          <li>Organization ID: <span className="font-mono">{debugInfo.auth?.organizationId || 'None'}</span></li>
          <li>API Token: <span className="font-mono">{debugInfo.auth?.tokenExists ? '✅ Present' : '❌ Missing'}</span></li>
        </ul>
      </div>

      {/* Context Status */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">📊 Context Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-medium">Facility Context</h3>
            <ul className="space-y-1">
              <li>Facilities loaded: <span className="font-mono">{debugInfo.facilityContext?.facilitiesLoaded ? '✅' : '❌'}</span></li>
              <li>Facilities count: <span className="font-mono">{debugInfo.facilityContext?.facilitiesCount}</span></li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium">Emission Context</h3>
            <ul className="space-y-1">
              <li>Resources loaded: <span className="font-mono">{debugInfo.emissionContext?.resourcesLoaded ? '✅' : '❌'}</span></li>
              <li>Resources count: <span className="font-mono">{debugInfo.emissionContext?.resourcesCount}</span></li>
            </ul>
          </div>
        </div>
      </div>

      {/* useFacilityData Hook Status */}
      <div className={`border rounded-lg p-4 ${debugInfo.facilityData?.resourcesCount > 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <h2 className="text-lg font-semibold mb-2">🪝 useFacilityData Hook Status</h2>
        <ul className="space-y-1 text-sm">
          <li>Loading: <span className="font-mono">{debugInfo.facilityData?.loading ? '🔄 Yes' : '✅ Complete'}</span></li>
          <li>Facility loaded: <span className="font-mono">{debugInfo.facilityData?.facilityLoaded ? '✅' : '❌'}</span></li>
          <li>Facility name: <span className="font-mono">{debugInfo.facilityData?.facilityName || 'None'}</span></li>
          <li>Resources count: <span className="font-mono">{debugInfo.facilityData?.resourcesCount}</span></li>
          <li>Emission data count: <span className="font-mono">{debugInfo.facilityData?.emissionDataCount}</span></li>
          <li>Metrics available: <span className="font-mono">{debugInfo.facilityData?.metricsAvailable ? '✅' : '❌'}</span></li>
        </ul>
      </div>

      {/* Direct API Test */}
      <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
        <h2 className="text-lg font-semibold mb-2">🧪 Direct API Test</h2>
        <button 
          onClick={testDirectAPI}
          className="mb-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Test API Call
        </button>
        
        {apiTest && (
          <div className={`p-3 rounded ${apiTest.success ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
            {apiTest.success ? (
              <div>
                <p className="font-medium text-green-800">✅ API Call Successful</p>
                <p className="text-sm">Resources returned: {apiTest.resourceCount}</p>
                {apiTest.resources?.length > 0 && (
                  <ul className="mt-2 text-sm">
                    {apiTest.resources.map((resource, index) => (
                      <li key={index} className="text-green-700">
                        • {resource.resource?.name} ({resource.resource?.scope}/{resource.resource?.category})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div>
                <p className="font-medium text-red-800">❌ API Call Failed</p>
                <p className="text-sm text-red-700">{apiTest.error}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Resource Data Display */}
      {resources && resources.length > 0 && (
        <div className="border border-green-200 rounded-lg p-4 bg-green-50">
          <h2 className="text-lg font-semibold mb-2">📋 Resource Data from useFacilityData</h2>
          <div className="space-y-2">
            {resources.map((resource, index) => (
              <div key={index} className="p-2 bg-white rounded border">
                <p className="font-medium">{resource.name || resource.resource_name || 'Unknown Resource'}</p>
                <p className="text-sm text-gray-600">
                  {resource.scope || 'Unknown Scope'} / {resource.category || 'Unknown Category'}
                </p>
                {resource.emissionFactor && (
                  <p className="text-xs text-gray-500">
                    Emission Factor: {resource.emissionFactor.value || resource.emissionFactor.emission_factor} {resource.emissionFactor.unit || resource.emissionFactor.emission_factor_unit}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debug Raw Data */}
      <details className="border border-gray-300 rounded-lg p-4 bg-gray-50">
        <summary className="cursor-pointer font-semibold">🔍 Raw Debug Data</summary>
        <pre className="mt-2 text-xs bg-white p-3 rounded border overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </details>

      <details className="border border-blue-300 rounded-lg p-4 bg-blue-50">
        <summary className="cursor-pointer font-semibold">📊 Raw Hook Data</summary>
        <div className="mt-2 space-y-2">
          <div>
            <h4 className="font-medium">Facility:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto">{JSON.stringify(facility, null, 2)}</pre>
          </div>
          <div>
            <h4 className="font-medium">Resources:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto">{JSON.stringify(resources, null, 2)}</pre>
          </div>
          <div>
            <h4 className="font-medium">Emission Data:</h4>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto">{JSON.stringify(emissionData?.slice(0, 3), null, 2)}</pre>
          </div>
        </div>
      </details>
    </div>
  );
};

export default FacilityResourceDebug;
