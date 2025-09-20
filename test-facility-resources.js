#!/usr/bin/env node

/**
 * Comprehensive Facility Resources Testing Script
 * 
 * This script tests:
 * 1. Database facility resources configuration
 * 2. Backend API responses for facility resources
 * 3. Frontend context functions
 * 4. Data flow from DB → API → Context → UI
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const FRONTEND_URL = 'http://localhost:5173';

// Test credentials from seeding
const TEST_CREDENTIALS = {
  email: 'sustainability@jkcement.com',
  password: 'jkcement2024'
};

class FacilityResourceTester {
  constructor() {
    this.authToken = null;
    this.organizationId = null;
    this.facilities = [];
  }

  async log(section, message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`\n[${timestamp}] 📊 ${section}: ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  async authenticateUser() {
    try {
      this.log('AUTHENTICATION', 'Attempting to login...');
      
      const response = await axios.post(`${BASE_URL}/auth/login`, TEST_CREDENTIALS);
      
      if (response.data.success && response.data.data.token) {
        this.authToken = response.data.data.token;
        this.organizationId = response.data.data.user.organizationId;
        
        this.log('AUTHENTICATION', 'Login successful', {
          userId: response.data.data.user.id,
          organizationId: this.organizationId,
          tokenLength: this.authToken.length
        });
        
        return true;
      } else {
        this.log('AUTHENTICATION', 'Login failed', response.data);
        return false;
      }
    } catch (error) {
      this.log('AUTHENTICATION', 'Login error', {
        message: error.message,
        response: error.response?.data
      });
      return false;
    }
  }

  async testDatabaseDirectQuery() {
    this.log('DATABASE', 'Testing direct database queries...');
    
    const { execSync } = require('child_process');
    
    try {
      // Test facility resources
      const facilityResourcesQuery = `
        SELECT 
          fr.id as facility_resource_id,
          fr.facility_id,
          f.name as facility_name,
          er.resource_name,
          er.scope,
          er.category,
          ef.emission_factor,
          ef.heat_content
        FROM facility_resources fr
        JOIN facilities f ON fr.facility_id = f.id
        JOIN emission_resources er ON fr.resource_id = er.id
        LEFT JOIN emission_factors ef ON er.id = ef.resource_id
        ORDER BY f.name, er.resource_name;
      `;
      
      const command = `docker-compose exec -T postgres psql -U illuminate -d illuminate_db -c "${facilityResourcesQuery}"`;
      const result = execSync(command, { encoding: 'utf8', cwd: '/Users/jaythakare/Documents/codebase/iLLuMinate' });
      
      this.log('DATABASE', 'Facility resources query result', result);
      
      // Test emission data
      const emissionDataQuery = `
        SELECT 
          ed.facility_id,
          f.name as facility_name,
          ed.month,
          ed.year,
          ed.consumption,
          ed.total_emissions,
          ed.total_energy,
          COUNT(*) as record_count
        FROM emission_data ed
        JOIN facilities f ON ed.facility_id = f.id
        WHERE ed.year = 2025
        GROUP BY ed.facility_id, f.name, ed.month, ed.year, ed.consumption, ed.total_emissions, ed.total_energy
        ORDER BY f.name, ed.month
        LIMIT 10;
      `;
      
      const emissionCommand = `docker-compose exec -T postgres psql -U illuminate -d illuminate_db -c "${emissionDataQuery}"`;
      const emissionResult = execSync(emissionCommand, { encoding: 'utf8', cwd: '/Users/jaythakare/Documents/codebase/iLLuMinate' });
      
      this.log('DATABASE', 'Emission data query result', emissionResult);
      
    } catch (error) {
      this.log('DATABASE', 'Database query error', error.message);
    }
  }

  async testFacilitiesAPI() {
    try {
      this.log('API', 'Testing facilities API...');
      
      const response = await axios.get(`${BASE_URL}/facilities`, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });
      
      if (response.data.success) {
        this.facilities = response.data.facilities || [];
        this.log('API', 'Facilities API response', {
          count: this.facilities.length,
          facilities: this.facilities.map(f => ({ id: f.id, name: f.name }))
        });
        
        return this.facilities;
      } else {
        this.log('API', 'Facilities API failed', response.data);
        return [];
      }
    } catch (error) {
      this.log('API', 'Facilities API error', {
        message: error.message,
        response: error.response?.data
      });
      return [];
    }
  }

  async testFacilityResourcesAPI() {
    for (const facility of this.facilities) {
      try {
        this.log('API', `Testing facility resources API for ${facility.name}...`);
        
        const response = await axios.get(`${BASE_URL}/facilities/${facility.id}/resources`, {
          headers: { Authorization: `Bearer ${this.authToken}` }
        });
        
        this.log('API', `Facility ${facility.name} resources`, {
          success: response.data.success,
          resourceCount: response.data.resources?.length || 0,
          resources: response.data.resources?.map(r => ({
            id: r.id,
            name: r.name || r.resource_name,
            scope: r.scope,
            category: r.category,
            emissionFactor: r.emission_factor || r.emissionFactor
          })) || []
        });
        
      } catch (error) {
        this.log('API', `Facility ${facility.name} resources API error`, {
          message: error.message,
          response: error.response?.data
        });
      }
    }
  }

  async testFacilityEmissionDataAPI() {
    for (const facility of this.facilities) {
      try {
        this.log('API', `Testing emission data API for ${facility.name}...`);
        
        const response = await axios.get(`${BASE_URL}/facilities/${facility.id}/emissions`, {
          headers: { Authorization: `Bearer ${this.authToken}` }
        });
        
        this.log('API', `Facility ${facility.name} emission data`, {
          success: response.data.success,
          dataCount: response.data.emissionData?.length || 0,
          sampleData: response.data.emissionData?.slice(0, 3).map(e => ({
            month: e.month,
            year: e.year,
            consumption: e.consumption,
            totalEmissions: e.total_emissions,
            totalEnergy: e.total_energy
          })) || []
        });
        
      } catch (error) {
        this.log('API', `Facility ${facility.name} emission data API error`, {
          message: error.message,
          response: error.response?.data
        });
      }
    }
  }

  async testAggregationAPIs() {
    try {
      this.log('API', 'Testing organization dashboard API...');
      
      const dashboardResponse = await axios.get(`${BASE_URL}/organizations/${this.organizationId}/dashboard?year=2025`, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });
      
      this.log('API', 'Organization dashboard', {
        success: dashboardResponse.data.success,
        totalFacilities: dashboardResponse.data.totalFacilities,
        totalEmissions: dashboardResponse.data.totalEmissions,
        totalProduction: dashboardResponse.data.totalProduction,
        carbonIntensity: dashboardResponse.data.carbonIntensity
      });
      
      this.log('API', 'Testing emission analytics API...');
      
      const analyticsResponse = await axios.get(`${BASE_URL}/organizations/${this.organizationId}/emissions/analytics?year=2025&period=monthly`, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });
      
      this.log('API', 'Emission analytics', {
        success: analyticsResponse.data.success,
        totalEmissions: analyticsResponse.data.totalEmissions,
        dataCompleteness: analyticsResponse.data.dataCompleteness,
        monthlyDataCount: analyticsResponse.data.monthlyBreakdown?.length || 0
      });
      
    } catch (error) {
      this.log('API', 'Aggregation APIs error', {
        message: error.message,
        response: error.response?.data
      });
    }
  }

  async testFrontendContextAccess() {
    this.log('FRONTEND', 'Testing frontend accessibility...');
    
    try {
      // Test if frontend is accessible
      const response = await axios.get(FRONTEND_URL, { timeout: 5000 });
      
      if (response.status === 200) {
        this.log('FRONTEND', 'Frontend server is accessible', { status: response.status });
      } else {
        this.log('FRONTEND', 'Frontend server returned unexpected status', { status: response.status });
      }
    } catch (error) {
      this.log('FRONTEND', 'Frontend server error', {
        message: error.message,
        code: error.code
      });
    }
  }

  async generateReport() {
    this.log('REPORT', 'Generating comprehensive test report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      testResults: {
        authentication: !!this.authToken,
        organizationId: this.organizationId,
        facilitiesCount: this.facilities.length,
        facilitiesFound: this.facilities.map(f => f.name)
      },
      recommendations: []
    };

    if (!this.authToken) {
      report.recommendations.push('❌ Authentication failed - check backend server and credentials');
    }

    if (this.facilities.length === 0) {
      report.recommendations.push('❌ No facilities found - check database seeding');
    }

    if (this.facilities.length > 0) {
      report.recommendations.push('✅ Facilities found - proceed to test individual facility resources');
    }

    report.recommendations.push('🔍 Check browser console for DataTab logs when navigating to facility Sustainability tab');
    report.recommendations.push('🔍 Verify useFacilityData hook is being called with correct facilityId');
    report.recommendations.push('🔍 Check if facility resources API returns data with proper structure');

    this.log('REPORT', 'Final test report', report);

    return report;
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive Facility Resources Testing...\n');
    
    // Test 1: Database direct queries
    await this.testDatabaseDirectQuery();
    
    // Test 2: Authentication
    const authSuccess = await this.authenticateUser();
    if (!authSuccess) {
      console.log('\n❌ Authentication failed. Stopping tests.');
      return;
    }
    
    // Test 3: API endpoints
    await this.testFacilitiesAPI();
    await this.testFacilityResourcesAPI();
    await this.testFacilityEmissionDataAPI();
    await this.testAggregationAPIs();
    
    // Test 4: Frontend accessibility
    await this.testFrontendContextAccess();
    
    // Test 5: Generate report
    await this.generateReport();
    
    console.log('\n✅ Testing complete! Check logs above for detailed results.');
    
    // Next steps message
    console.log('\n📋 NEXT STEPS TO DEBUG UI:');
    console.log('1. Navigate to frontend: http://localhost:5173');
    console.log('2. Login with: sustainability@jkcement.com / jkcement2024');
    console.log('3. Go to Facilities → [Select JK Cement Facility] → Sustainability → Data');
    console.log('4. Open browser console and look for logs starting with "🔧 DataTab:"');
    console.log('5. Check if facility resources are being passed correctly');
    console.log('6. Verify the structure of resources array in browser console');
  }
}

// Main execution
const tester = new FacilityResourceTester();
tester.runAllTests().catch(console.error);
