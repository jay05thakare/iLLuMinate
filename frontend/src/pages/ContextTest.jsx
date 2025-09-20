/**
 * Context Test Page
 * Test all context providers and their functionality
 */

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOrganization } from '../contexts/OrganizationContext';
import { useFacility } from '../contexts/FacilityContext';
import { useEmission } from '../contexts/EmissionContext';
import { useUser } from '../contexts/UserContext';

const ContextTest = () => {
  // Test all context hooks
  const auth = useAuth();
  const organization = useOrganization();
  const facility = useFacility();
  const emission = useEmission();
  const user = useUser();

  const testAuth = async () => {
    console.log('Testing Auth Context...');
    console.log('Auth State:', {
      isAuthenticated: auth.isAuthenticated,
      user: auth.user,
      loading: auth.loading,
      error: auth.error,
    });
  };

  const testOrganization = async () => {
    console.log('Testing Organization Context...');
    console.log('Organization State:', {
      organization: organization.organization,
      stats: organization.stats,
      loading: organization.loading,
      error: organization.error,
    });
    
    if (auth.user?.organizationId) {
      const result = await organization.fetchOrganization(auth.user.organizationId);
      console.log('Fetch Organization Result:', result);
    }
  };

  const testFacility = async () => {
    console.log('Testing Facility Context...');
    console.log('Facility State:', {
      facilities: facility.facilities,
      selectedFacility: facility.selectedFacility,
      loading: facility.loading,
      error: facility.error,
    });
    
    const result = await facility.fetchFacilities();
    console.log('Fetch Facilities Result:', result);
  };

  const testEmission = async () => {
    console.log('Testing Emission Context...');
    console.log('Emission State:', {
      resources: emission.resources,
      libraries: emission.libraries,
      factors: emission.factors,
      loading: emission.loading,
      error: emission.error,
    });
    
    const resourcesResult = await emission.fetchEmissionResources();
    console.log('Fetch Emission Resources Result:', resourcesResult);
    
    const librariesResult = await emission.fetchEmissionLibraries();
    console.log('Fetch Emission Libraries Result:', librariesResult);
  };

  const testUser = async () => {
    console.log('Testing User Context...');
    console.log('User State:', {
      users: user.users,
      selectedUser: user.selectedUser,
      loading: user.loading,
      error: user.error,
    });
    
    if (auth.isAdmin()) {
      const result = await user.fetchUsers();
      console.log('Fetch Users Result:', result);
    } else {
      console.log('User is not admin, skipping user fetch test');
    }
  };

  const runAllTests = async () => {
    console.log('🚀 Starting Context Provider Tests...');
    console.log('=====================================');
    
    await testAuth();
    console.log('-------------------------------------');
    
    await testOrganization();
    console.log('-------------------------------------');
    
    await testFacility();
    console.log('-------------------------------------');
    
    await testEmission();
    console.log('-------------------------------------');
    
    await testUser();
    console.log('=====================================');
    console.log('✅ All Context Tests Complete!');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Context Provider Test Page
        </h1>
        
        <div className="space-y-6">
          {/* Auth Status */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">🔐 Authentication Status</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Authenticated:</strong> {auth.isAuthenticated ? '✅ Yes' : '❌ No'}
              </div>
              <div>
                <strong>Loading:</strong> {auth.loading ? '⏳ Yes' : '✅ No'}
              </div>
              <div>
                <strong>User:</strong> {auth.user ? `${auth.user.firstName} ${auth.user.lastName}` : 'None'}
              </div>
              <div>
                <strong>Role:</strong> {auth.user?.role || 'None'}
              </div>
              <div>
                <strong>Organization:</strong> {auth.user?.organizationName || 'None'}
              </div>
              <div>
                <strong>Error:</strong> {auth.error || 'None'}
              </div>
            </div>
          </div>

          {/* Organization Status */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">🏢 Organization Status</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Organization:</strong> {organization.organization?.name || 'None'}
              </div>
              <div>
                <strong>Loading:</strong> {organization.loading ? '⏳ Yes' : '✅ No'}
              </div>
              <div>
                <strong>User Count:</strong> {organization.stats?.users?.total || 0}
              </div>
              <div>
                <strong>Facility Count:</strong> {organization.stats?.facilities?.total || 0}
              </div>
              <div>
                <strong>Active Targets:</strong> {organization.stats?.targets?.active || 0}
              </div>
              <div>
                <strong>Error:</strong> {organization.error || 'None'}
              </div>
            </div>
          </div>

          {/* Facility Status */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">🏭 Facility Status</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Facilities:</strong> {facility.facilities?.length || 0}
              </div>
              <div>
                <strong>Loading:</strong> {facility.loading ? '⏳ Yes' : '✅ No'}
              </div>
              <div>
                <strong>Selected:</strong> {facility.selectedFacility?.name || 'None'}
              </div>
              <div>
                <strong>Total Capacity:</strong> {facility.getTotalCapacity()} MTPA
              </div>
              <div>
                <strong>Active Facilities:</strong> {facility.getActiveFacilities()?.length || 0}
              </div>
              <div>
                <strong>Error:</strong> {facility.error || 'None'}
              </div>
            </div>
          </div>

          {/* Emission Status */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">🌿 Emission Status</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Resources:</strong> {emission.resources?.length || 0}
              </div>
              <div>
                <strong>Loading:</strong> {emission.loading ? '⏳ Yes' : '✅ No'}
              </div>
              <div>
                <strong>Libraries:</strong> {emission.libraries?.length || 0}
              </div>
              <div>
                <strong>Factors:</strong> {emission.factors?.length || 0}
              </div>
              <div>
                <strong>Scope 1 Resources:</strong> {emission.getScope1Resources()?.length || 0}
              </div>
              <div>
                <strong>Scope 2 Resources:</strong> {emission.getScope2Resources()?.length || 0}
              </div>
              <div>
                <strong>Error:</strong> {emission.error || 'None'}
              </div>
            </div>
          </div>

          {/* User Status */}
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">👥 User Management Status</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Users:</strong> {user.users?.length || 0}
              </div>
              <div>
                <strong>Loading:</strong> {user.loading ? '⏳ Yes' : '✅ No'}
              </div>
              <div>
                <strong>Admin Users:</strong> {user.getAdminUsers()?.length || 0}
              </div>
              <div>
                <strong>Regular Users:</strong> {user.getRegularUsers()?.length || 0}
              </div>
              <div>
                <strong>Active Users:</strong> {user.getActiveUsers()?.length || 0}
              </div>
              <div>
                <strong>Error:</strong> {user.error || 'None'}
              </div>
            </div>
          </div>

          {/* Test Button */}
          <div className="flex justify-center">
            <button
              onClick={runAllTests}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors"
            >
              🧪 Run All Context Tests
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Instructions</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Click "Run All Context Tests" to test all context providers</li>
              <li>• Check the browser console for detailed test results</li>
              <li>• All contexts should load data automatically when authenticated</li>
              <li>• Green checkmarks (✅) indicate successful operations</li>
              <li>• Red X marks (❌) or "None" values indicate issues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextTest;
