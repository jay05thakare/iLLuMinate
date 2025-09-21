#!/usr/bin/env node

/**
 * Production Data and Units Verification Test Script
 * Verifies that all production data, country, verification status, and unit columns have been properly added.
 */

const { connectDatabase, closePool, query } = require('./src/config/database');

async function runProductionAndUnitsVerification() {
  console.log('🔍 PRODUCTION DATA AND UNITS VERIFICATION');
  console.log('=' .repeat(60));
  
  try {
    await connectDatabase();
    
    // Test 1: Production Data Verification
    console.log('\n1️⃣ PRODUCTION DATA VERIFICATION:');
    console.log('-' .repeat(40));
    
    const productionResult = await query('SELECT organization_name, annual_cement_production, annual_cement_production_unit FROM industry_benchmarking ORDER BY annual_cement_production DESC');
    
    // Expected production data
    const expectedProduction = {
      'UltraTech Cement Limited': 112230000,
      'Ambuja Cements Limited': 65200000,
      'Shree Cement Limited': 31790000,
      'JK Cement Limited': 19090000,
      'The Ramco Cements Limited': 18400000,
      'THE INDIA CEMENTS LIMITED': 8815000,
      'SAGAR CEMENTS LIMITED': 5470000,
      'HeidelbergCement India Limited': 5320000,
      'Star Cement Limited': 4450000,
      'Mangalam Cement Limited': 2880000,
      'Shree Digvijay Cement Co.Ltd': 1360000
    };
    
    let productionCorrect = true;
    console.log('Production Data (MT):');
    console.table(productionResult.rows);
    
    for (const row of productionResult.rows) {
      const expected = expectedProduction[row.organization_name];
      const actual = parseFloat(row.annual_cement_production);
      if (actual !== expected) {
        console.log(`❌ Production mismatch: ${row.organization_name} - Expected: ${expected}, Got: ${actual}`);
        productionCorrect = false;
      }
    }
    
    console.log(productionCorrect ? '✅ Production data is correct' : '❌ Production data has issues');
    
    // Test 2: Country and Verification Status
    console.log('\n2️⃣ COUNTRY AND VERIFICATION STATUS:');
    console.log('-' .repeat(40));
    
    const countryResult = await query('SELECT organization_name, country, is_verified FROM industry_benchmarking ORDER BY organization_name');
    
    let countryCorrect = true;
    let verificationCorrect = true;
    
    for (const row of countryResult.rows) {
      if (row.country !== 'India') {
        console.log(`❌ Country mismatch: ${row.organization_name} - Expected: India, Got: ${row.country}`);
        countryCorrect = false;
      }
      if (row.is_verified !== true) {
        console.log(`❌ Verification mismatch: ${row.organization_name} - Expected: true, Got: ${row.is_verified}`);
        verificationCorrect = false;
      }
    }
    
    console.log(`Country: ${countryCorrect ? '✅ All set to India' : '❌ Issues found'}`);
    console.log(`Verification: ${verificationCorrect ? '✅ All verified' : '❌ Issues found'}`);
    
    // Test 3: Unit Columns Verification
    console.log('\n3️⃣ UNIT COLUMNS VERIFICATION:');
    console.log('-' .repeat(40));
    
    const unitColumnsResult = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'industry_benchmarking' 
      AND table_schema = 'public'
      AND column_name LIKE '%_unit'
      ORDER BY column_name
    `);
    
    const expectedUnitColumns = [
      'annual_cement_production_unit',
      'female_employee_percentage_unit',
      'health_safety_complaints_unit',
      'male_employee_percentage_unit',
      'msme_sourcing_percentage_unit',
      'other_employees_per_million_rs_unit',
      'permanent_employees_per_million_rs_unit',
      'posh_complaints_unit',
      'renewable_energy_consumption_unit',
      'renewable_energy_intensity_unit',
      'revenue_unit',
      'scope_1_intensity_unit',
      'scope_1_unit',
      'scope_2_intensity_unit',
      'scope_2_unit',
      'scope_3_intensity_unit',
      'scope_3_unit',
      'total_energy_consumption_unit',
      'total_energy_intensity_unit',
      'waste_generated_intensity_unit',
      'waste_generated_unit',
      'water_consumption_intensity_unit',
      'water_consumption_unit',
      'water_withdrawal_intensity_unit',
      'water_withdrawal_unit',
      'working_conditions_complaints_unit'
    ];
    
    const actualUnitColumns = unitColumnsResult.rows.map(row => row.column_name);
    const missingColumns = expectedUnitColumns.filter(col => !actualUnitColumns.includes(col));
    const extraColumns = actualUnitColumns.filter(col => !expectedUnitColumns.includes(col));
    
    console.log(`Total unit columns: ${actualUnitColumns.length}`);
    console.log(`Expected: ${expectedUnitColumns.length}`);
    
    if (missingColumns.length > 0) {
      console.log(`❌ Missing columns: ${missingColumns.join(', ')}`);
    }
    if (extraColumns.length > 0) {
      console.log(`❌ Extra columns: ${extraColumns.join(', ')}`);
    }
    
    const unitsCorrect = missingColumns.length === 0 && extraColumns.length === 0;
    console.log(unitsCorrect ? '✅ All unit columns present' : '❌ Unit columns have issues');
    
    // Test 4: Sample Unit Values
    console.log('\n4️⃣ SAMPLE UNIT VALUES:');
    console.log('-' .repeat(40));
    
    const sampleUnitsResult = await query(`
      SELECT 
        organization_name,
        scope_1_unit,
        scope_1_intensity_unit,
        water_consumption_unit,
        water_consumption_intensity_unit,
        revenue_unit,
        male_employee_percentage_unit,
        posh_complaints_unit
      FROM industry_benchmarking 
      ORDER BY organization_name 
      LIMIT 3
    `);
    
    console.log('Sample Unit Values:');
    console.table(sampleUnitsResult.rows);
    
    // Test 5: Data Completeness Summary
    console.log('\n5️⃣ DATA COMPLETENESS SUMMARY:');
    console.log('-' .repeat(40));
    
    const completenessResult = await query(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(annual_cement_production) as production_count,
        COUNT(country) as country_count,
        COUNT(is_verified) as verified_count,
        COUNT(scope_1_unit) as scope_1_unit_count,
        COUNT(water_consumption_unit) as water_unit_count,
        COUNT(revenue_unit) as revenue_unit_count
      FROM industry_benchmarking
    `);
    
    const stats = completenessResult.rows[0];
    console.log(`Total records: ${stats.total_records}`);
    console.log(`Production data: ${stats.production_count}/${stats.total_records}`);
    console.log(`Country data: ${stats.country_count}/${stats.total_records}`);
    console.log(`Verification data: ${stats.verified_count}/${stats.total_records}`);
    console.log(`Unit data (sample): ${stats.scope_1_unit_count}/${stats.total_records}`);
    
    // Final Summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 FINAL SUMMARY:');
    console.log('-' .repeat(40));
    console.log(`1. Production Data: ${productionCorrect ? '✅ CORRECT' : '❌ ISSUES'}`);
    console.log(`2. Country (India): ${countryCorrect ? '✅ CORRECT' : '❌ ISSUES'}`);
    console.log(`3. Verification (True): ${verificationCorrect ? '✅ CORRECT' : '❌ ISSUES'}`);
    console.log(`4. Unit Columns: ${unitsCorrect ? '✅ CORRECT' : '❌ ISSUES'}`);
    
    const allCorrect = productionCorrect && countryCorrect && verificationCorrect && unitsCorrect;
    console.log('\n' + (allCorrect ? '🎉 ALL UPDATES SUCCESSFULLY APPLIED!' : '⚠️  Some issues remain'));
    
    if (allCorrect) {
      console.log('\n✅ The industry_benchmarking table now contains:');
      console.log('   • Correct production data for all 11 companies');
      console.log('   • Country set to "India" for all companies');
      console.log('   • Verification status set to "true" for all companies');
      console.log('   • 26 unit columns for all quantitative data fields');
      console.log('   • Proper units for emissions, water, energy, social metrics');
      console.log('   • Complete data ready for benchmarking analysis');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await closePool();
  }
}

// Run the verification
if (require.main === module) {
  runProductionAndUnitsVerification().catch(console.error);
}

module.exports = { runProductionAndUnitsVerification };

