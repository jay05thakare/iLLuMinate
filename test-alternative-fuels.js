#!/usr/bin/env node
/**
 * Comprehensive End-to-End Test Script for Alternative Fuels Optimizer
 * This script tests the complete flow from API endpoints to UI functionality
 */

const axios = require('axios');
const chalk = require('chalk');
const { performance } = require('perf_hooks');

// Configuration
const CONFIG = {
  backendUrl: 'http://localhost:3000',
  aiServiceUrl: 'http://localhost:8000',
  testCredentials: {
    email: 'admin@jkcement.com',
    password: 'password123'
  }
};

class AlternativeFuelsTestSuite {
  constructor() {
    this.authToken = null;
    this.testResults = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    switch (type) {
      case 'success':
        console.log(chalk.green(`✅ [${timestamp}] ${message}`));
        break;
      case 'error':
        console.log(chalk.red(`❌ [${timestamp}] ${message}`));
        break;
      case 'warning':
        console.log(chalk.yellow(`⚠️  [${timestamp}] ${message}`));
        break;
      case 'info':
      default:
        console.log(chalk.blue(`ℹ️  [${timestamp}] ${message}`));
        break;
    }
  }

  async runTest(testName, testFunction) {
    this.log(`Running test: ${testName}`);
    const startTime = performance.now();
    
    try {
      await testFunction();
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      this.testResults.passed++;
      this.testResults.tests.push({
        name: testName,
        status: 'PASSED',
        duration: `${duration}ms`
      });
      this.log(`Test passed: ${testName} (${duration}ms)`, 'success');
    } catch (error) {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      this.testResults.failed++;
      this.testResults.tests.push({
        name: testName,
        status: 'FAILED',
        duration: `${duration}ms`,
        error: error.message
      });
      this.log(`Test failed: ${testName} - ${error.message}`, 'error');
    }
  }

  async authenticate() {
    try {
      const response = await axios.post(`${CONFIG.backendUrl}/api/auth/login`, CONFIG.testCredentials);
      
      if (response.data.success) {
        this.authToken = response.data.data.token;
        this.log('Authentication successful', 'success');
        return true;
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      this.log(`Authentication failed: ${error.message}`, 'error');
      return false;
    }
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.authToken}`,
      'Content-Type': 'application/json'
    };
  }

  // Test 1: Backend API Health Check
  async testBackendHealth() {
    const response = await axios.get(`${CONFIG.backendUrl}/health`);
    if (!response.data.status || response.data.status !== 'healthy') {
      throw new Error('Backend health check failed');
    }
  }

  // Test 2: Test emission resources endpoint without filter
  async testEmissionResourcesBasic() {
    const response = await axios.get(
      `${CONFIG.backendUrl}/api/emissions/resources`,
      { headers: this.getAuthHeaders() }
    );

    if (!response.data.success) {
      throw new Error('Failed to fetch emission resources');
    }

    const resources = response.data.data.resources;
    if (!Array.isArray(resources) || resources.length === 0) {
      throw new Error('No emission resources found');
    }

    // Validate response structure
    const firstResource = resources[0];
    const requiredFields = ['id', 'name', 'category', 'type', 'scope', 'isAlternativeFuel'];
    for (const field of requiredFields) {
      if (!(field in firstResource)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }

  // Test 3: Test alternative fuels filter
  async testAlternativeFuelsFilter() {
    const response = await axios.get(
      `${CONFIG.backendUrl}/api/emissions/resources?is_alternative_fuel=true&scope=scope1`,
      { headers: this.getAuthHeaders() }
    );

    if (!response.data.success) {
      throw new Error('Failed to fetch alternative fuels');
    }

    const alternativeFuels = response.data.data.resources;
    if (!Array.isArray(alternativeFuels) || alternativeFuels.length === 0) {
      throw new Error('No alternative fuels found');
    }

    // Verify all returned resources are alternative fuels
    for (const fuel of alternativeFuels) {
      if (!fuel.isAlternativeFuel) {
        throw new Error(`Non-alternative fuel returned: ${fuel.name}`);
      }
      if (fuel.scope !== 'scope1') {
        throw new Error(`Wrong scope returned: ${fuel.scope}`);
      }
    }

    // Check for expected alternative fuels
    const fuelNames = alternativeFuels.map(f => f.name);
    const expectedFuels = ['Biomass', 'Waste-derived Fuel', 'Used Tires', 'Agricultural Waste'];
    
    for (const expectedFuel of expectedFuels) {
      if (!fuelNames.includes(expectedFuel)) {
        this.log(`Expected alternative fuel not found: ${expectedFuel}`, 'warning');
      }
    }

    this.log(`Found ${alternativeFuels.length} alternative fuels: ${fuelNames.join(', ')}`);
  }

  // Test 4: Test emission factors for alternative fuels
  async testEmissionFactorsForAlternativeFuels() {
    // First get alternative fuels
    const fuelsResponse = await axios.get(
      `${CONFIG.backendUrl}/api/emissions/resources?is_alternative_fuel=true`,
      { headers: this.getAuthHeaders() }
    );

    const alternativeFuels = fuelsResponse.data.data.resources;
    if (alternativeFuels.length === 0) {
      throw new Error('No alternative fuels to test');
    }

    let totalFactorsFound = 0;

    // Test emission factors for each alternative fuel
    for (const fuel of alternativeFuels.slice(0, 3)) { // Test first 3 fuels
      const factorsResponse = await axios.get(
        `${CONFIG.backendUrl}/api/emissions/factors?resourceId=${fuel.id}`,
        { headers: this.getAuthHeaders() }
      );

      if (!factorsResponse.data.success) {
        throw new Error(`Failed to fetch emission factors for ${fuel.name}`);
      }

      const factors = factorsResponse.data.data.factors;
      if (factors.length > 0) {
        totalFactorsFound += factors.length;

        // Validate factor data structure
        const factor = factors[0];
        const requiredFields = [
          'id', 'emissionFactor', 'emissionFactorUnit', 'heatContent', 
          'heatContentUnit', 'approximateCost', 'costUnit', 'availabilityScore',
          'resource', 'library'
        ];

        for (const field of requiredFields) {
          if (!(field in factor)) {
            throw new Error(`Missing required field in emission factor: ${field}`);
          }
        }

        // Validate data types and ranges
        if (typeof factor.emissionFactor !== 'number' || factor.emissionFactor <= 0) {
          throw new Error(`Invalid emission factor: ${factor.emissionFactor}`);
        }

        if (typeof factor.heatContent !== 'number' || factor.heatContent <= 0) {
          throw new Error(`Invalid heat content: ${factor.heatContent}`);
        }

        if (typeof factor.availabilityScore !== 'number' || 
            factor.availabilityScore < 1 || factor.availabilityScore > 10) {
          throw new Error(`Invalid availability score: ${factor.availabilityScore}`);
        }

        // Test carbon intensity calculation
        const carbonIntensity = factor.emissionFactor / factor.heatContent;
        if (carbonIntensity <= 0 || carbonIntensity > 500) {
          throw new Error(`Unreasonable carbon intensity: ${carbonIntensity}`);
        }

        this.log(`${fuel.name}: ${factors.length} factors, carbon intensity: ${carbonIntensity.toFixed(1)} kgCO2e/GJ`);
      } else {
        this.log(`No emission factors found for ${fuel.name}`, 'warning');
      }
    }

    if (totalFactorsFound === 0) {
      throw new Error('No emission factors found for any alternative fuels');
    }

    this.log(`Total emission factors tested: ${totalFactorsFound}`);
  }

  // Test 5: Test scoring algorithm logic
  async testScoringAlgorithmLogic() {
    // Get sample emission factors
    const fuelsResponse = await axios.get(
      `${CONFIG.backendUrl}/api/emissions/resources?is_alternative_fuel=true`,
      { headers: this.getAuthHeaders() }
    );

    const firstFuel = fuelsResponse.data.data.resources[0];
    const factorsResponse = await axios.get(
      `${CONFIG.backendUrl}/api/emissions/factors?resourceId=${firstFuel.id}`,
      { headers: this.getAuthHeaders() }
    );

    const factors = factorsResponse.data.data.factors;
    if (factors.length === 0) {
      throw new Error('No factors available for scoring algorithm test');
    }

    const factor = factors[0];

    // Test carbon intensity calculation
    const carbonIntensity = factor.emissionFactor / factor.heatContent;
    if (isNaN(carbonIntensity) || carbonIntensity <= 0) {
      throw new Error('Carbon intensity calculation failed');
    }

    // Test scoring scenarios
    const testScenarios = [
      { cost: 1, emission: 1, energy: 1, description: 'Minimize all' },
      { cost: 10, emission: 10, energy: 10, description: 'Ignore all' },
      { cost: 1, emission: 5, energy: 9, description: 'Cost priority' },
      { cost: 9, emission: 1, energy: 5, description: 'Emission priority' },
      { cost: 5, emission: 9, energy: 1, description: 'Energy priority' }
    ];

    for (const scenario of testScenarios) {
      // Simulate scoring logic (simplified version)
      const emissionScore = this.calculateEmissionScore(factor.emissionFactor, scenario.emission);
      const costScore = this.calculateCostScore(factor.approximateCost, scenario.cost);
      const energyScore = this.calculateEnergyScore(factor.heatContent, scenario.energy);
      const overallScore = (emissionScore + costScore + energyScore) / 3;

      if (isNaN(overallScore) || overallScore < 0 || overallScore > 15) {
        throw new Error(`Invalid score for scenario ${scenario.description}: ${overallScore}`);
      }

      this.log(`Scenario "${scenario.description}": Overall score ${overallScore.toFixed(1)}`);
    }
  }

  // Simplified scoring functions for testing
  calculateEmissionScore(emissionFactor, preference) {
    const normalizedFactor = Math.min(emissionFactor / 5, 1);
    const baseScore = (1 - normalizedFactor) * 10;
    
    if (preference <= 3) {
      return baseScore * 1.5;
    } else if (preference >= 7) {
      return 5 + (baseScore * 0.3);
    }
    return baseScore;
  }

  calculateCostScore(cost, preference) {
    if (!cost) return 5;
    
    const normalizedCost = Math.min(cost / 2, 1);
    const baseScore = (1 - normalizedCost) * 10;
    
    if (preference <= 3) {
      return baseScore * 1.5;
    } else if (preference >= 7) {
      return 5 + (baseScore * 0.3);
    }
    return baseScore;
  }

  calculateEnergyScore(heatContent, preference) {
    if (!heatContent) return 5;
    
    const normalizedHeat = Math.min(heatContent / 0.04, 1);
    const baseScore = normalizedHeat * 10;
    
    if (preference <= 3) {
      return baseScore * 1.5;
    } else if (preference >= 7) {
      return 5 + (baseScore * 0.3);
    }
    return baseScore;
  }

  // Test 6: Test API performance
  async testAPIPerformance() {
    const startTime = performance.now();

    // Make concurrent requests to test performance
    const requests = [
      axios.get(`${CONFIG.backendUrl}/api/emissions/resources?is_alternative_fuel=true`, 
               { headers: this.getAuthHeaders() }),
      axios.get(`${CONFIG.backendUrl}/api/emissions/resources?is_alternative_fuel=false`, 
               { headers: this.getAuthHeaders() }),
      axios.get(`${CONFIG.backendUrl}/api/emissions/libraries`, 
               { headers: this.getAuthHeaders() })
    ];

    await Promise.all(requests);
    
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (duration > 5000) { // 5 seconds
      throw new Error(`API performance test failed: ${duration}ms (expected < 5000ms)`);
    }

    this.log(`API performance test passed: ${Math.round(duration)}ms for 3 concurrent requests`);
  }

  // Test 7: Test validation and error handling
  async testValidationAndErrorHandling() {
    // Test invalid is_alternative_fuel parameter
    try {
      await axios.get(
        `${CONFIG.backendUrl}/api/emissions/resources?is_alternative_fuel=invalid`,
        { headers: this.getAuthHeaders() }
      );
      throw new Error('Should have failed validation');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        this.log('Validation correctly rejected invalid is_alternative_fuel parameter');
      } else {
        throw error;
      }
    }

    // Test unauthorized access
    try {
      await axios.get(`${CONFIG.backendUrl}/api/emissions/resources?is_alternative_fuel=true`);
      throw new Error('Should have failed authentication');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        this.log('Authentication correctly rejected unauthorized request');
      } else {
        throw error;
      }
    }
  }

  // Test 8: Test data consistency
  async testDataConsistency() {
    // Get all emission resources
    const allResourcesResponse = await axios.get(
      `${CONFIG.backendUrl}/api/emissions/resources`,
      { headers: this.getAuthHeaders() }
    );

    // Get alternative fuels
    const altFuelsResponse = await axios.get(
      `${CONFIG.backendUrl}/api/emissions/resources?is_alternative_fuel=true`,
      { headers: this.getAuthHeaders() }
    );

    // Get conventional fuels
    const convFuelsResponse = await axios.get(
      `${CONFIG.backendUrl}/api/emissions/resources?is_alternative_fuel=false`,
      { headers: this.getAuthHeaders() }
    );

    const allResources = allResourcesResponse.data.data.resources;
    const altFuels = altFuelsResponse.data.data.resources;
    const convFuels = convFuelsResponse.data.data.resources;

    // Check that alternative + conventional = all resources
    const totalFiltered = altFuels.length + convFuels.length;
    if (totalFiltered !== allResources.length) {
      throw new Error(`Data consistency error: ${totalFiltered} filtered != ${allResources.length} total`);
    }

    // Check for overlaps (shouldn't be any)
    const altFuelIds = new Set(altFuels.map(f => f.id));
    const convFuelIds = new Set(convFuels.map(f => f.id));
    
    for (const id of altFuelIds) {
      if (convFuelIds.has(id)) {
        throw new Error(`Resource ${id} appears in both alternative and conventional fuels`);
      }
    }

    this.log(`Data consistency verified: ${altFuels.length} alternative + ${convFuels.length} conventional = ${allResources.length} total`);
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log(chalk.bold('ALTERNATIVE FUELS OPTIMIZER TEST SUMMARY'));
    console.log('='.repeat(60));
    
    console.log(`Total tests: ${this.testResults.passed + this.testResults.failed}`);
    console.log(chalk.green(`Passed: ${this.testResults.passed}`));
    console.log(chalk.red(`Failed: ${this.testResults.failed}`));
    
    const successRate = (this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100;
    console.log(`Success rate: ${successRate.toFixed(1)}%`);

    console.log('\n' + chalk.bold('Test Details:'));
    this.testResults.tests.forEach(test => {
      const status = test.status === 'PASSED' ? chalk.green('PASS') : chalk.red('FAIL');
      console.log(`  ${status} ${test.name} (${test.duration})`);
      if (test.error) {
        console.log(`       Error: ${chalk.red(test.error)}`);
      }
    });

    if (this.testResults.failed === 0) {
      console.log('\n' + chalk.green.bold('🎉 ALL TESTS PASSED! Alternative Fuels Optimizer is working perfectly!'));
    } else {
      console.log('\n' + chalk.red.bold('❌ Some tests failed. Please review the errors above.'));
    }
  }

  async runAllTests() {
    console.log(chalk.bold.blue('🚀 Starting Alternative Fuels Optimizer Test Suite'));
    console.log('='.repeat(60));

    // Authentication
    this.log('Authenticating...');
    const authSuccess = await this.authenticate();
    if (!authSuccess) {
      this.log('Cannot proceed without authentication', 'error');
      return;
    }

    // Run all tests
    await this.runTest('Backend Health Check', () => this.testBackendHealth());
    await this.runTest('Emission Resources Basic', () => this.testEmissionResourcesBasic());
    await this.runTest('Alternative Fuels Filter', () => this.testAlternativeFuelsFilter());
    await this.runTest('Emission Factors for Alternative Fuels', () => this.testEmissionFactorsForAlternativeFuels());
    await this.runTest('Scoring Algorithm Logic', () => this.testScoringAlgorithmLogic());
    await this.runTest('API Performance', () => this.testAPIPerformance());
    await this.runTest('Validation and Error Handling', () => this.testValidationAndErrorHandling());
    await this.runTest('Data Consistency', () => this.testDataConsistency());

    this.printSummary();
  }
}

// Run the test suite
async function main() {
  const testSuite = new AlternativeFuelsTestSuite();
  
  try {
    await testSuite.runAllTests();
  } catch (error) {
    console.error(chalk.red('Fatal error running test suite:'), error.message);
    process.exit(1);
  }
}

// Check if required dependencies are available
function checkDependencies() {
  try {
    require('axios');
    require('chalk');
    return true;
  } catch (error) {
    console.log('Missing dependencies. Run: npm install axios chalk');
    return false;
  }
}

if (require.main === module) {
  if (checkDependencies()) {
    main();
  } else {
    process.exit(1);
  }
}

module.exports = AlternativeFuelsTestSuite;
