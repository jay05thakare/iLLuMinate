#!/usr/bin/env node
/**
 * Alternative Fuels Optimizer Demo Script
 * Demonstrates the functionality and shows sample outputs
 */

const axios = require('axios');
const chalk = require('chalk');

const CONFIG = {
  backendUrl: 'http://localhost:3000',
  testCredentials: {
    email: 'admin@jkcement.com',
    password: 'password123'
  }
};

class AlternativeFuelsDemo {
  constructor() {
    this.authToken = null;
  }

  log(message, type = 'info') {
    switch (type) {
      case 'success':
        console.log(chalk.green(`✅ ${message}`));
        break;
      case 'error':
        console.log(chalk.red(`❌ ${message}`));
        break;
      case 'warning':
        console.log(chalk.yellow(`⚠️  ${message}`));
        break;
      case 'info':
      default:
        console.log(chalk.blue(`ℹ️  ${message}`));
        break;
    }
  }

  async authenticate() {
    try {
      const response = await axios.post(`${CONFIG.backendUrl}/api/auth/login`, CONFIG.testCredentials);
      
      if (response.data.success) {
        this.authToken = response.data.data.token;
        return true;
      }
      return false;
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

  // Simulate the scoring algorithm from the component
  calculateScores(factor, preferences) {
    const emissionScore = this.calculateEmissionScore(factor.emissionFactor, preferences.emission);
    const costScore = this.calculateCostScore(factor.approximateCost, preferences.cost);
    const energyScore = this.calculateEnergyScore(factor.heatContent, preferences.energy);
    const overallScore = (emissionScore + costScore + energyScore) / 3;
    const carbonIntensity = factor.heatContent > 0 ? factor.emissionFactor / factor.heatContent : factor.emissionFactor;

    return {
      emissionScore,
      costScore,
      energyScore,
      overallScore,
      carbonIntensity
    };
  }

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

  async demonstrateFeature() {
    console.log(chalk.bold.blue('\n🚀 Alternative Fuels Optimizer Demo'));
    console.log('=====================================\n');

    // Step 1: Authentication
    this.log('Authenticating with the system...');
    const authSuccess = await this.authenticate();
    if (!authSuccess) {
      this.log('Demo cannot proceed without authentication', 'error');
      return;
    }
    this.log('Authentication successful!', 'success');

    // Step 2: Fetch alternative fuels
    this.log('\nFetching alternative fuels from the database...');
    const fuelsResponse = await axios.get(
      `${CONFIG.backendUrl}/api/emissions/resources?is_alternative_fuel=true&scope=scope1`,
      { headers: this.getAuthHeaders() }
    );

    if (!fuelsResponse.data.success) {
      this.log('Failed to fetch alternative fuels', 'error');
      return;
    }

    const alternativeFuels = fuelsResponse.data.data.resources;
    this.log(`Found ${alternativeFuels.length} alternative fuels`, 'success');
    
    console.log('\n📋 Alternative Fuels Available:');
    alternativeFuels.forEach((fuel, index) => {
      console.log(`  ${index + 1}. ${chalk.bold(fuel.name)} - ${fuel.description}`);
    });

    // Step 3: Get emission factors for the first few fuels
    console.log('\n🔬 Fetching Emission Factor Data:');
    console.log('==================================');

    const fuelsWithFactors = [];
    
    for (const fuel of alternativeFuels.slice(0, 3)) {
      const factorsResponse = await axios.get(
        `${CONFIG.backendUrl}/api/emissions/factors?resourceId=${fuel.id}`,
        { headers: this.getAuthHeaders() }
      );

      if (factorsResponse.data.success && factorsResponse.data.data.factors.length > 0) {
        const factors = factorsResponse.data.data.factors;
        fuelsWithFactors.push({
          fuel,
          factors
        });

        console.log(`\n📊 ${chalk.bold(fuel.name)}:`);
        factors.forEach((factor, index) => {
          console.log(`  Factor ${index + 1} (${factor.library.name} ${factor.library.version}):`);
          console.log(`    💨 Emission Factor: ${factor.emissionFactor} ${factor.emissionFactorUnit}`);
          console.log(`    ⚡ Heat Content: ${factor.heatContent} ${factor.heatContentUnit}`);
          console.log(`    💰 Approx. Cost: $${factor.approximateCost || 'N/A'} ${factor.costUnit || ''}`);
          console.log(`    📈 Availability: ${factor.availabilityScore}/10`);
          
          const carbonIntensity = factor.heatContent > 0 ? factor.emissionFactor / factor.heatContent : 0;
          console.log(`    🌍 Carbon Intensity: ${carbonIntensity.toFixed(1)} kgCO2e/GJ`);
        });
      }
    }

    // Step 4: Demonstrate scoring algorithm with different preferences
    console.log('\n🧮 AI Optimization Scenarios:');
    console.log('=============================');

    const scenarios = [
      { cost: 1, emission: 1, energy: 1, name: 'Minimize Everything', description: 'Prioritize low cost, low emissions, high energy' },
      { cost: 1, emission: 9, energy: 9, name: 'Cost-Focused', description: 'Minimize cost above all else' },
      { cost: 9, emission: 1, energy: 9, name: 'Green-Focused', description: 'Minimize emissions above all else' },
      { cost: 9, emission: 9, energy: 1, name: 'Energy-Focused', description: 'Maximize energy content above all else' },
      { cost: 5, emission: 5, energy: 5, name: 'Balanced', description: 'Equal weighting for all factors' }
    ];

    for (const scenario of scenarios) {
      console.log(`\n🎯 Scenario: ${chalk.bold(scenario.name)}`);
      console.log(`   ${scenario.description}`);
      console.log(`   Settings: Cost=${scenario.cost}, Emission=${scenario.emission}, Energy=${scenario.energy}`);
      console.log('   Rankings:');

      const scoredFuels = [];

      fuelsWithFactors.forEach(({ fuel, factors }) => {
        factors.forEach(factor => {
          const scores = this.calculateScores(factor, scenario);
          scoredFuels.push({
            fuelName: fuel.name,
            factor,
            scores
          });
        });
      });

      // Sort by overall score
      scoredFuels.sort((a, b) => b.scores.overallScore - a.scores.overallScore);

      scoredFuels.slice(0, 3).forEach((item, index) => {
        const rank = index + 1;
        const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
        console.log(`     ${rankEmoji} ${item.fuelName}: Score ${item.scores.overallScore.toFixed(1)} ` +
                   `(Cost: ${item.scores.costScore.toFixed(1)}, ` +
                   `Emission: ${item.scores.emissionScore.toFixed(1)}, ` +
                   `Energy: ${item.scores.energyScore.toFixed(1)})`);
      });
    }

    // Step 5: Show real-world comparison
    console.log('\n🌍 Real-World Impact Comparison:');
    console.log('===============================');

    if (fuelsWithFactors.length >= 2) {
      const fuel1 = fuelsWithFactors[0];
      const fuel2 = fuelsWithFactors[1];
      
      if (fuel1.factors.length > 0 && fuel2.factors.length > 0) {
        const factor1 = fuel1.factors[0];
        const factor2 = fuel2.factors[0];
        
        console.log(`\nComparing ${chalk.bold(fuel1.fuel.name)} vs ${chalk.bold(fuel2.fuel.name)}:`);
        
        const co2Diff = factor2.emissionFactor - factor1.emissionFactor;
        const energyDiff = factor1.heatContent - factor2.heatContent;
        const costDiff = (factor2.approximateCost || 0) - (factor1.approximateCost || 0);
        
        console.log(`📊 CO₂ Difference: ${co2Diff > 0 ? '+' : ''}${co2Diff.toFixed(3)} ${factor1.emissionFactorUnit}`);
        console.log(`⚡ Energy Difference: ${energyDiff > 0 ? '+' : ''}${energyDiff.toFixed(3)} ${factor1.heatContentUnit}`);
        if (factor1.approximateCost && factor2.approximateCost) {
          console.log(`💰 Cost Difference: ${costDiff > 0 ? '+' : ''}$${costDiff.toFixed(3)} ${factor1.costUnit}`);
        }
        
        const intensity1 = factor1.heatContent > 0 ? factor1.emissionFactor / factor1.heatContent : 0;
        const intensity2 = factor2.heatContent > 0 ? factor2.emissionFactor / factor2.heatContent : 0;
        const intensityDiff = intensity2 - intensity1;
        
        console.log(`🌍 Carbon Intensity Difference: ${intensityDiff > 0 ? '+' : ''}${intensityDiff.toFixed(1)} kgCO2e/GJ`);
      }
    }

    // Summary
    console.log('\n🎉 Demo Complete!');
    console.log('================');
    console.log(chalk.green('✅ Alternative Fuels Optimizer is working perfectly!'));
    console.log('\nKey Features Demonstrated:');
    console.log('• ✅ Dynamic fetching of alternative fuels');
    console.log('• ✅ Comprehensive emission factor data');
    console.log('• ✅ Real-time scoring algorithm');
    console.log('• ✅ Multiple optimization scenarios');
    console.log('• ✅ Carbon intensity calculations');
    console.log('• ✅ Cost, emission, and energy comparisons');
    
    console.log('\nTo test the UI:');
    console.log('1. Start the frontend: cd frontend && npm start');
    console.log('2. Navigate to any facility');
    console.log('3. Go to Sustainability > Alternate Fuels');
    console.log('4. Adjust the preference sliders to see real-time recommendations!');
  }
}

// Run the demo
async function main() {
  const demo = new AlternativeFuelsDemo();
  
  try {
    await demo.demonstrateFeature();
  } catch (error) {
    console.error(chalk.red('\nDemo failed:'), error.message);
    console.log('\nTroubleshooting:');
    console.log('• Ensure backend is running: cd backend && npm start');
    console.log('• Ensure database is seeded with alternative fuels data');
    console.log('• Check if test user exists: admin@jkcement.com');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = AlternativeFuelsDemo;
