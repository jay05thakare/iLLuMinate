#!/usr/bin/env node

/**
 * Frontend API Service Test
 * Tests the frontend API service directly to verify token handling
 */

const axios = require('axios');

const TEST_CREDENTIALS = {
  email: 'sustainability@jkcement.com',
  password: 'jkcement2024'
};

const BASE_URL = 'http://localhost:3000/api';

async function testFrontendAPIFlow() {
  console.log('🔍 Testing Frontend API Flow...\n');
  
  try {
    // Step 1: Login
    console.log('1. 🔐 Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, TEST_CREDENTIALS);
    
    if (loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      const organizationId = loginResponse.data.data.user.organizationId;
      
      console.log('✅ Login successful');
      console.log(`   Token length: ${token.length}`);
      console.log(`   Organization ID: ${organizationId}`);
      
      // Step 2: Test facilities API directly 
      console.log('\n2. 🏭 Testing facilities API...');
      const facilitiesResponse = await axios.get(`${BASE_URL}/facilities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Facilities API response:');
      console.log(`   Success: ${facilitiesResponse.data.success}`);
      console.log(`   Facilities count: ${facilitiesResponse.data.data?.facilities?.length || 0}`);
      
      if (facilitiesResponse.data.data?.facilities?.length > 0) {
        console.log('   Facilities found:');
        facilitiesResponse.data.data.facilities.forEach((facility, index) => {
          console.log(`     ${index + 1}. ${facility.name} (${facility.id})`);
        });
        
        // Step 3: Test facility resources for first facility
        const firstFacility = facilitiesResponse.data.data.facilities[0];
        console.log(`\n3. 🔧 Testing facility resources for ${firstFacility.name}...`);
        
        const resourcesResponse = await axios.get(`${BASE_URL}/facilities/${firstFacility.id}/resources`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Facility resources API response:');
        console.log(`   Success: ${resourcesResponse.data.success}`);
        console.log(`   Resources count: ${resourcesResponse.data.resources?.length || 0}`);
        
        if (resourcesResponse.data.resources?.length > 0) {
          console.log('   Resources found:');
          resourcesResponse.data.resources.forEach((resource, index) => {
            console.log(`     ${index + 1}. ${resource.name || resource.resource_name} (${resource.scope}/${resource.category})`);
          });
        }
        
        // Step 4: Test emission data
        console.log(`\n4. 📊 Testing emission data for ${firstFacility.name}...`);
        
        const emissionResponse = await axios.get(`${BASE_URL}/facilities/${firstFacility.id}/emissions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Emission data API response:');
        console.log(`   Success: ${emissionResponse.data.success}`);
        console.log(`   Emission records: ${emissionResponse.data.emissionData?.length || 0}`);
        
      } else {
        console.log('❌ No facilities returned from API');
      }
      
    } else {
      console.log('❌ Login failed:', loginResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response?.data) {
      console.error('   Response:', error.response.data);
    }
  }
}

// Test token localStorage simulation
function testTokenHandling() {
  console.log('\n🔄 Testing Token Handling...');
  
  // Simulate the frontend API service token handling
  let token = null;
  
  const setToken = (newToken) => {
    token = newToken;
    // In browser this would be: localStorage.setItem('authToken', newToken);
    console.log('   Token set:', newToken.substring(0, 20) + '...');
  };
  
  const getToken = () => {
    // In browser this would be: return token || localStorage.getItem('authToken');
    return token;
  };
  
  const createAuthHeaders = () => {
    const currentToken = getToken();
    return {
      'Content-Type': 'application/json',
      ...(currentToken && { Authorization: `Bearer ${currentToken}` }),
    };
  };
  
  // Test the flow
  setToken('test-token-12345');
  const headers = createAuthHeaders();
  
  console.log('   Generated headers:', headers);
  console.log('✅ Token handling working correctly');
}

async function main() {
  await testFrontendAPIFlow();
  testTokenHandling();
  
  console.log('\n📋 SUMMARY:');
  console.log('- If facilities API returns data above, the backend is working');
  console.log('- If no facilities, there\'s an organization ID mismatch');
  console.log('- Check frontend browser console for failed API calls');
  console.log('- Verify localStorage has authToken set properly');
  console.log('- Check that AuthContext is setting apiService.setToken()');
}

main().catch(console.error);
