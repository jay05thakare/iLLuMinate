#!/usr/bin/env node

/**
 * Comprehensive API and Database Test Script
 * Tests all APIs and database connections
 * Usage: node test_all_apis.js
 */

const axios = require('axios');
const { query, connectDatabase, closePool } = require('./src/config/database');
const { logger } = require('./src/utils/logger');

const BASE_URL = 'http://localhost:3000';
let authToken = '';
let testUserId = '';
let testFacilityId = '';
let organizationId = '';

// Test data
const TEST_USER_EMAIL = 'ceo@jkcement.com';
const TEST_USER_PASSWORD = 'jkcement2024';

/**
 * Test helper functions
 */
const log = (message, data = null) => {
  console.log(`\n🔍 ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

const logSuccess = (message) => {
  console.log(`✅ ${message}`);
};

const logError = (message, error = null) => {
  console.log(`❌ ${message}`);
  if (error) {
    console.log(`Error: ${error.message || error}`);
  }
};

const makeRequest = async (method, endpoint, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status 
    };
  }
};

/**
 * Database Connection Tests
 */
const testDatabaseConnection = async () => {
  log('Testing Database Connection...');
  
  try {
    await connectDatabase();
    logSuccess('Database connection established');

    // Test basic query
    const result = await query('SELECT NOW() as current_time');
    logSuccess(`Database query successful: ${result.rows[0].current_time}`);

    // Test tables exist
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    logSuccess(`Found ${tables.rows.length} tables in database:`);
    tables.rows.forEach(table => console.log(`  - ${table.table_name}`));

    return true;
  } catch (error) {
    logError('Database connection failed', error);
    return false;
  }
};

/**
 * Authentication API Tests
 */
const testAuthentication = async () => {
  log('Testing Authentication APIs...');

  // Test login
  const loginResult = await makeRequest('POST', '/api/auth/login', {
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD
  });

  if (!loginResult.success) {
    logError('Login failed', loginResult.error);
    return false;
  }

  authToken = loginResult.data.data.token;
  testUserId = loginResult.data.data.user.id;
  organizationId = loginResult.data.data.user.organizationId;
  
  logSuccess('Login successful');
  log('User data:', loginResult.data.data.user);

  // Test profile endpoint
  const profileResult = await makeRequest('GET', '/api/auth/profile', null, {
    'Authorization': `Bearer ${authToken}`
  });

  if (!profileResult.success) {
    logError('Profile fetch failed', profileResult.error);
    return false;
  }

  logSuccess('Profile fetch successful');
  log('Profile data:', profileResult.data.data.user);

  return true;
};

/**
 * Organization API Tests
 */
const testOrganizationAPIs = async () => {
  log('Testing Organization APIs...');

  // Test get organization
  const orgResult = await makeRequest('GET', `/api/organizations/${organizationId}`, null, {
    'Authorization': `Bearer ${authToken}`
  });

  if (!orgResult.success) {
    logError('Organization fetch failed', orgResult.error);
    return false;
  }

  logSuccess('Organization fetch successful');
  log('Organization data:', orgResult.data.data.organization);

  // Test organization stats
  const statsResult = await makeRequest('GET', `/api/organizations/${organizationId}/stats`, null, {
    'Authorization': `Bearer ${authToken}`
  });

  if (!statsResult.success) {
    logError('Organization stats fetch failed', statsResult.error);
    return false;
  }

  logSuccess('Organization stats fetch successful');
  log('Organization stats:', statsResult.data.data);

  return true;
};

/**
 * User API Tests
 */
const testUserAPIs = async () => {
  log('Testing User APIs...');

  // Test get users
  const usersResult = await makeRequest('GET', '/api/users', null, {
    'Authorization': `Bearer ${authToken}`
  });

  if (!usersResult.success) {
    logError('Users fetch failed', usersResult.error);
    return false;
  }

  logSuccess('Users fetch successful');
  log('Users data:', {
    count: usersResult.data.data.users.length,
    pagination: usersResult.data.meta.pagination
  });

  // Test get specific user
  const userResult = await makeRequest('GET', `/api/users/${testUserId}`, null, {
    'Authorization': `Bearer ${authToken}`
  });

  if (!userResult.success) {
    logError('User fetch failed', userResult.error);
    return false;
  }

  logSuccess('User fetch successful');
  log('User data:', userResult.data.data.user);

  return true;
};

/**
 * Facility API Tests
 */
const testFacilityAPIs = async () => {
  log('Testing Facility APIs...');

  // Test get facilities
  const facilitiesResult = await makeRequest('GET', '/api/facilities', null, {
    'Authorization': `Bearer ${authToken}`
  });

  if (!facilitiesResult.success) {
    logError('Facilities fetch failed', facilitiesResult.error);
    return false;
  }

  logSuccess('Facilities fetch successful');
  log('Facilities data:', {
    count: facilitiesResult.data.data.facilities.length,
    pagination: facilitiesResult.data.meta.pagination
  });

  if (facilitiesResult.data.data.facilities.length > 0) {
    testFacilityId = facilitiesResult.data.data.facilities[0].id;
    
    // Test get specific facility
    const facilityResult = await makeRequest('GET', `/api/facilities/${testFacilityId}`, null, {
      'Authorization': `Bearer ${authToken}`
    });

    if (!facilityResult.success) {
      logError('Facility fetch failed', facilityResult.error);
      return false;
    }

    logSuccess('Facility fetch successful');
    log('Facility data:', facilityResult.data.data.facility);

    // Test facility resources
    const resourcesResult = await makeRequest('GET', `/api/facilities/${testFacilityId}/resources`, null, {
      'Authorization': `Bearer ${authToken}`
    });

    if (!resourcesResult.success) {
      logError('Facility resources fetch failed', resourcesResult.error);
      return false;
    }

    logSuccess('Facility resources fetch successful');
    log('Facility resources:', {
      facilityId: resourcesResult.data.data.facilityId,
      resourcesCount: resourcesResult.data.data.resources.length
    });
  }

  return true;
};

/**
 * Emission API Tests
 */
const testEmissionAPIs = async () => {
  log('Testing Emission APIs...');

  // Test emission resources
  const resourcesResult = await makeRequest('GET', '/api/emissions/resources', null, {
    'Authorization': `Bearer ${authToken}`
  });

  if (!resourcesResult.success) {
    logError('Emission resources fetch failed', resourcesResult.error);
    return false;
  }

  logSuccess('Emission resources fetch successful');
  log('Emission resources:', {
    count: resourcesResult.data.data.resources.length,
    scope1Count: resourcesResult.data.data.resources.filter(r => r.scope === 'scope1').length,
    scope2Count: resourcesResult.data.data.resources.filter(r => r.scope === 'scope2').length
  });

  // Test emission libraries
  const librariesResult = await makeRequest('GET', '/api/emissions/libraries', null, {
    'Authorization': `Bearer ${authToken}`
  });

  if (!librariesResult.success) {
    logError('Emission libraries fetch failed', librariesResult.error);
    return false;
  }

  logSuccess('Emission libraries fetch successful');
  log('Emission libraries:', {
    count: librariesResult.data.data.libraries.length,
    libraries: librariesResult.data.data.libraries.map(lib => ({
      name: lib.name,
      version: lib.version,
      year: lib.year,
      factorsCount: lib.factorsCount
    }))
  });

  // Test emission factors
  const factorsResult = await makeRequest('GET', '/api/emissions/factors?scope=scope1', null, {
    'Authorization': `Bearer ${authToken}`
  });

  if (!factorsResult.success) {
    logError('Emission factors fetch failed', factorsResult.error);
    return false;
  }

  logSuccess('Emission factors fetch successful');
  log('Emission factors:', {
    count: factorsResult.data.data.factors.length,
    sampleFactor: factorsResult.data.data.factors[0]
  });

  // Test emission data for facility (if we have a facility)
  if (testFacilityId) {
    const emissionDataResult = await makeRequest('GET', `/api/emissions/data/${testFacilityId}`, null, {
      'Authorization': `Bearer ${authToken}`
    });

    if (!emissionDataResult.success) {
      logError('Emission data fetch failed', emissionDataResult.error);
      return false;
    }

    logSuccess('Emission data fetch successful');
    log('Emission data:', {
      facilityId: emissionDataResult.data.data.facilityId,
      dataCount: emissionDataResult.data.data.emissionData.length
    });
  }

  return true;
};

/**
 * Database Data Verification
 */
const testDatabaseData = async () => {
  log('Testing Database Data...');

  try {
    // Test organizations
    const orgResult = await query('SELECT COUNT(*) as count FROM organizations');
    logSuccess(`Organizations in database: ${orgResult.rows[0].count}`);

    // Test users
    const userResult = await query('SELECT COUNT(*) as count, role FROM users GROUP BY role');
    logSuccess('Users by role:');
    userResult.rows.forEach(row => console.log(`  - ${row.role}: ${row.count}`));

    // Test facilities
    const facilityResult = await query('SELECT COUNT(*) as count, status FROM facilities GROUP BY status');
    logSuccess('Facilities by status:');
    facilityResult.rows.forEach(row => console.log(`  - ${row.status}: ${row.count}`));

    // Test emission resources
    const resourceResult = await query('SELECT COUNT(*) as count, scope FROM emission_resources GROUP BY scope');
    logSuccess('Emission resources by scope:');
    resourceResult.rows.forEach(row => console.log(`  - ${row.scope}: ${row.count}`));

    // Test emission factor libraries
    const libraryResult = await query('SELECT COUNT(*) as count FROM emission_factor_libraries');
    logSuccess(`Emission factor libraries: ${libraryResult.rows[0].count}`);

    // Test emission factors
    const factorResult = await query('SELECT COUNT(*) as count FROM emission_factors');
    logSuccess(`Emission factors: ${factorResult.rows[0].count}`);

    // Test production data
    const productionResult = await query('SELECT COUNT(*) as count FROM production_data');
    logSuccess(`Production data records: ${productionResult.rows[0].count}`);

    // Test targets
    const targetResult = await query('SELECT COUNT(*) as count FROM sustainability_targets');
    logSuccess(`Sustainability targets: ${targetResult.rows[0].count}`);

    return true;
  } catch (error) {
    logError('Database data verification failed', error);
    return false;
  }
};

/**
 * Health Check Test
 */
const testHealthCheck = async () => {
  log('Testing Health Check...');

  const healthResult = await makeRequest('GET', '/health');

  if (!healthResult.success) {
    logError('Health check failed', healthResult.error);
    return false;
  }

  logSuccess('Health check successful');
  log('Health status:', healthResult.data.data);

  return true;
};

/**
 * Main test runner
 */
const runAllTests = async () => {
  console.log('🚀 Starting Comprehensive API and Database Tests...\n');
  console.log('=' * 60);

  const testResults = {
    database: false,
    health: false,
    auth: false,
    organization: false,
    users: false,
    facilities: false,
    emissions: false,
    databaseData: false
  };

  try {
    // Test database connection
    testResults.database = await testDatabaseConnection();

    // Test health check
    testResults.health = await testHealthCheck();

    // Test authentication
    testResults.auth = await testAuthentication();

    if (testResults.auth) {
      // Test other APIs only if authentication works
      testResults.organization = await testOrganizationAPIs();
      testResults.users = await testUserAPIs();
      testResults.facilities = await testFacilityAPIs();
      testResults.emissions = await testEmissionAPIs();
    }

    // Test database data
    if (testResults.database) {
      testResults.databaseData = await testDatabaseData();
    }

  } catch (error) {
    logError('Test execution failed', error);
  } finally {
    // Close database connection
    try {
      await closePool();
      logSuccess('Database connection closed');
    } catch (error) {
      logError('Failed to close database connection', error);
    }
  }

  // Print summary
  console.log('\n' + '=' * 60);
  console.log('📊 TEST RESULTS SUMMARY:');
  console.log('=' * 60);

  let passedCount = 0;
  let totalCount = 0;

  Object.entries(testResults).forEach(([testName, passed]) => {
    totalCount++;
    if (passed) {
      passedCount++;
      console.log(`✅ ${testName.toUpperCase()}: PASSED`);
    } else {
      console.log(`❌ ${testName.toUpperCase()}: FAILED`);
    }
  });

  console.log('\n' + '=' * 60);
  console.log(`🎯 OVERALL RESULT: ${passedCount}/${totalCount} tests passed`);
  
  if (passedCount === totalCount) {
    console.log('🎉 ALL TESTS PASSED! The system is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the logs above.');
  }

  console.log('=' * 60);

  process.exit(passedCount === totalCount ? 0 : 1);
};

// Add axios to package.json if not present
const checkDependencies = async () => {
  try {
    require('axios');
  } catch (error) {
    console.log('Installing axios for testing...');
    const { execSync } = require('child_process');
    execSync('npm install axios', { stdio: 'inherit' });
  }
};

// Run tests
(async () => {
  try {
    await checkDependencies();
    await runAllTests();
  } catch (error) {
    logError('Failed to run tests', error);
    process.exit(1);
  }
})();
