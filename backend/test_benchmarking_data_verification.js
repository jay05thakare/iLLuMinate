#!/usr/bin/env node

/**
 * Test Script: Cross-verify Cement Benchmarking Data Ingestion
 * 
 * This script verifies that all data from the Excel file has been correctly
 * ingested into the industry_benchmarking table.
 */

const { connectDatabase, closePool, query } = require('./src/config/database');

// Expected data from Excel analysis
const expectedData = {
  companies: [
    'Ambuja Cements Limited',
    'HeidelbergCement India Limited', 
    'JK Cement Limited',
    'Mangalam Cement Limited',
    'SAGAR CEMENTS LIMITED',
    'Shree Cement Limited',
    'Shree Digvijay Cement Co.Ltd',
    'Star Cement Limited',
    'THE INDIA CEMENTS LIMITED',
    'The Ramco Cements Limited',
    'UltraTech Cement Limited'
  ],
  
  // JK Cement specific data (target company)
  jkCementData: {
    organization_name: 'JK Cement Limited',
    is_target: true,
    scope_1: 10334366,
    scope_2: 368584,
    scope_3: 2529576.00,
    scope_1_intensity: 94.65439,
    scope_2_intensity: 3.375930,
    scope_3_intensity: 23.168859,
    water_consumption: 2897666.0,
    water_withdrawal: 2897666.0,
    water_consumption_intensity: 26.54026,
    water_withdrawal_intensity: 26.54026,
    waste_generated: 0.091967,
    revenue: 109180000000,
    male_employee_percentage: 97.18,
    female_employee_percentage: 2.82,
    posh_complaints: 209.0
  },

  // Sample data for other companies
  sampleCompanyData: {
    'Ambuja Cements Limited': {
      scope_1: 15286295,
      scope_2: 589017.0,
      scope_1_intensity: 85.30775,
      scope_2_intensity: 3.287109,
      water_consumption: 5644386.0,
      water_withdrawal: 5644384.0,
      revenue: 179190000000,
      male_employee_percentage: 97.33,
      female_employee_percentage: 2.67,
      posh_complaints: 0.0
    },
    'UltraTech Cement Limited': {
      scope_1: 71237860,
      scope_2: 1884386.6,
      scope_1_intensity: 102.0460,
      scope_2_intensity: 2.699326,
      scope_3: 8250585.00,
      scope_3_intensity: 11.818709,
      water_consumption: 27103472.0,
      water_withdrawal: 27778796.0,
      revenue: 698095300000,
      male_employee_percentage: 97.40,
      female_employee_percentage: 2.60
    }
  }
};

async function runVerificationTests() {
  console.log('🧪 Starting Cement Benchmarking Data Verification Tests\n');
  console.log('=' .repeat(60));
  
  try {
    await connectDatabase();
    console.log('✅ Database connected successfully\n');

    // Test 1: Verify total number of companies
    await testTotalCompanies();
    
    // Test 2: Verify all expected companies are present
    await testAllCompaniesPresent();
    
    // Test 3: Verify JK Cement is marked as target company
    await testJKTargetCompany();
    
    // Test 4: Verify JK Cement data accuracy
    await testJKDataAccuracy();
    
    // Test 5: Verify sample company data
    await testSampleCompanyData();
    
    // Test 6: Verify new columns exist
    await testNewColumnsExist();
    
    // Test 7: Verify JK Cement targets data
    await testJKTargetsData();
    
    // Test 8: Verify data completeness
    await testDataCompleteness();
    
    // Test 9: Verify data types and constraints
    await testDataTypesAndConstraints();
    
    // Test 10: Verify indexes exist
    await testIndexesExist();

    console.log('\n' + '=' .repeat(60));
    console.log('🎉 All verification tests completed successfully!');
    console.log('✅ Cement benchmarking data has been correctly ingested.');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await closePool();
  }
}

async function testTotalCompanies() {
  console.log('📊 Test 1: Verifying total number of companies...');
  
  const result = await query('SELECT COUNT(*) as total FROM industry_benchmarking');
  const total = parseInt(result.rows[0].total);
  
  if (total === expectedData.companies.length) {
    console.log(`✅ PASS: Found ${total} companies (expected: ${expectedData.companies.length})`);
  } else {
    console.log(`❌ FAIL: Found ${total} companies (expected: ${expectedData.companies.length})`);
  }
  console.log();
}

async function testAllCompaniesPresent() {
  console.log('📊 Test 2: Verifying all expected companies are present...');
  
  const result = await query('SELECT organization_name FROM industry_benchmarking ORDER BY organization_name');
  const actualCompanies = result.rows.map(row => row.organization_name);
  
  let allPresent = true;
  for (const expectedCompany of expectedData.companies) {
    if (!actualCompanies.includes(expectedCompany)) {
      console.log(`❌ FAIL: Missing company: ${expectedCompany}`);
      allPresent = false;
    }
  }
  
  if (allPresent) {
    console.log('✅ PASS: All expected companies are present');
  } else {
    console.log('❌ FAIL: Some expected companies are missing');
  }
  console.log();
}

async function testJKTargetCompany() {
  console.log('📊 Test 3: Verifying JK Cement is marked as target company...');
  
  const result = await query('SELECT is_target FROM industry_benchmarking WHERE organization_name = $1', ['JK Cement Limited']);
  
  if (result.rows.length > 0 && result.rows[0].is_target === true) {
    console.log('✅ PASS: JK Cement is correctly marked as target company');
  } else {
    console.log('❌ FAIL: JK Cement is not marked as target company');
  }
  console.log();
}

async function testJKDataAccuracy() {
  console.log('📊 Test 4: Verifying JK Cement data accuracy...');
  
  const result = await query(`
    SELECT organization_name, is_target, scope_1, scope_2, scope_3, 
           scope_1_intensity, scope_2_intensity, scope_3_intensity,
           water_consumption, water_withdrawal, water_consumption_intensity, 
           water_withdrawal_intensity, waste_generated, revenue,
           male_employee_percentage, female_employee_percentage, posh_complaints
    FROM industry_benchmarking 
    WHERE organization_name = $1
  `, ['JK Cement Limited']);
  
  if (result.rows.length === 0) {
    console.log('❌ FAIL: JK Cement data not found');
    return;
  }
  
  const data = result.rows[0];
  const expected = expectedData.jkCementData;
  
  let allCorrect = true;
  const tolerance = 0.001; // For floating point comparisons
  
  for (const [key, expectedValue] of Object.entries(expected)) {
    if (key === 'organization_name') continue; // Skip string comparison
    
    const actualValue = data[key];
    if (typeof expectedValue === 'number') {
      if (Math.abs(actualValue - expectedValue) > tolerance) {
        console.log(`❌ FAIL: ${key} - Expected: ${expectedValue}, Actual: ${actualValue}`);
        allCorrect = false;
      }
    } else if (actualValue !== expectedValue) {
      console.log(`❌ FAIL: ${key} - Expected: ${expectedValue}, Actual: ${actualValue}`);
      allCorrect = false;
    }
  }
  
  if (allCorrect) {
    console.log('✅ PASS: JK Cement data is accurate');
  } else {
    console.log('❌ FAIL: JK Cement data has inaccuracies');
  }
  console.log();
}

async function testSampleCompanyData() {
  console.log('📊 Test 5: Verifying sample company data...');
  
  for (const [companyName, expectedCompanyData] of Object.entries(expectedData.sampleCompanyData)) {
    const result = await query(`
      SELECT scope_1, scope_2, scope_3, scope_1_intensity, scope_2_intensity, scope_3_intensity,
             water_consumption, water_withdrawal, revenue, male_employee_percentage, 
             female_employee_percentage, posh_complaints
      FROM industry_benchmarking 
      WHERE organization_name = $1
    `, [companyName]);
    
    if (result.rows.length === 0) {
      console.log(`❌ FAIL: ${companyName} data not found`);
      continue;
    }
    
    const data = result.rows[0];
    let allCorrect = true;
    const tolerance = 0.001;
    
    for (const [key, expectedValue] of Object.entries(expectedCompanyData)) {
      const actualValue = data[key];
      if (typeof expectedValue === 'number') {
        if (Math.abs(actualValue - expectedValue) > tolerance) {
          console.log(`❌ FAIL: ${companyName} - ${key} - Expected: ${expectedValue}, Actual: ${actualValue}`);
          allCorrect = false;
        }
      } else if (actualValue !== expectedValue) {
        console.log(`❌ FAIL: ${companyName} - ${key} - Expected: ${expectedValue}, Actual: ${actualValue}`);
        allCorrect = false;
      }
    }
    
    if (allCorrect) {
      console.log(`✅ PASS: ${companyName} data is accurate`);
    }
  }
  console.log();
}

async function testNewColumnsExist() {
  console.log('📊 Test 6: Verifying new columns exist...');
  
  const expectedColumns = [
    'male_employee_percentage', 'female_employee_percentage', 'posh_complaints',
    'scope_1_intensity', 'scope_2_intensity', 'scope_3_intensity',
    'water_consumption_intensity', 'water_withdrawal_intensity',
    'targets', 'is_target'
  ];
  
  const result = await query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'industry_benchmarking' 
    AND table_schema = 'public'
    AND column_name = ANY($1)
  `, [expectedColumns]);
  
  const existingColumns = result.rows.map(row => row.column_name);
  let allColumnsExist = true;
  
  for (const expectedColumn of expectedColumns) {
    if (!existingColumns.includes(expectedColumn)) {
      console.log(`❌ FAIL: Missing column: ${expectedColumn}`);
      allColumnsExist = false;
    }
  }
  
  if (allColumnsExist) {
    console.log('✅ PASS: All new columns exist');
  } else {
    console.log('❌ FAIL: Some new columns are missing');
  }
  console.log();
}

async function testJKTargetsData() {
  console.log('📊 Test 7: Verifying JK Cement targets data...');
  
  const result = await query('SELECT targets FROM industry_benchmarking WHERE organization_name = $1', ['JK Cement Limited']);
  
  if (result.rows.length === 0 || !result.rows[0].targets) {
    console.log('❌ FAIL: JK Cement targets data not found');
    return;
  }
  
  const targets = result.rows[0].targets;
  
  // Check if targets object has expected structure
  const hasSocialTargets = targets.social_targets && Array.isArray(targets.social_targets);
  const hasEnvironmentalTargets = targets.environmental_targets && Array.isArray(targets.environmental_targets);
  const hasGovernanceTargets = targets.governance_targets && Array.isArray(targets.governance_targets);
  
  if (hasSocialTargets && hasEnvironmentalTargets && hasGovernanceTargets) {
    console.log('✅ PASS: JK Cement targets data structure is correct');
    console.log(`   - Social targets: ${targets.social_targets.length} items`);
    console.log(`   - Environmental targets: ${targets.environmental_targets.length} items`);
    console.log(`   - Governance targets: ${targets.governance_targets.length} items`);
  } else {
    console.log('❌ FAIL: JK Cement targets data structure is incorrect');
  }
  console.log();
}

async function testDataCompleteness() {
  console.log('📊 Test 8: Verifying data completeness...');
  
  const result = await query(`
    SELECT 
      COUNT(*) as total_records,
      COUNT(scope_1) as scope_1_count,
      COUNT(scope_2) as scope_2_count,
      COUNT(water_consumption) as water_consumption_count,
      COUNT(revenue) as revenue_count,
      COUNT(male_employee_percentage) as male_employee_count,
      COUNT(is_target) as is_target_count
    FROM industry_benchmarking
  `);
  
  const stats = result.rows[0];
  const totalRecords = parseInt(stats.total_records);
  
  console.log(`   - Total records: ${stats.total_records}`);
  console.log(`   - Scope 1 data: ${stats.scope_1_count}/${totalRecords}`);
  console.log(`   - Scope 2 data: ${stats.scope_2_count}/${totalRecords}`);
  console.log(`   - Water consumption data: ${stats.water_consumption_count}/${totalRecords}`);
  console.log(`   - Revenue data: ${stats.revenue_count}/${totalRecords}`);
  console.log(`   - Male employee data: ${stats.male_employee_count}/${totalRecords}`);
  console.log(`   - Target flag data: ${stats.is_target_count}/${totalRecords}`);
  
  if (parseInt(stats.scope_1_count) === totalRecords && parseInt(stats.revenue_count) === totalRecords) {
    console.log('✅ PASS: Core data is complete');
  } else {
    console.log('❌ FAIL: Some core data is missing');
  }
  console.log();
}

async function testDataTypesAndConstraints() {
  console.log('📊 Test 9: Verifying data types and constraints...');
  
  const result = await query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = 'industry_benchmarking' 
    AND table_schema = 'public'
    AND column_name IN ('is_target', 'targets', 'scope_1', 'revenue', 'reporting_year')
    ORDER BY column_name
  `);
  
  const expectedTypes = {
    'is_target': 'boolean',
    'targets': 'jsonb',
    'scope_1': 'double precision',
    'revenue': 'double precision',
    'reporting_year': 'integer'
  };
  
  let allTypesCorrect = true;
  
  for (const row of result.rows) {
    const expectedType = expectedTypes[row.column_name];
    if (expectedType && row.data_type !== expectedType) {
      console.log(`❌ FAIL: ${row.column_name} - Expected type: ${expectedType}, Actual: ${row.data_type}`);
      allTypesCorrect = false;
    }
  }
  
  if (allTypesCorrect) {
    console.log('✅ PASS: Data types are correct');
  } else {
    console.log('❌ FAIL: Some data types are incorrect');
  }
  console.log();
}

async function testIndexesExist() {
  console.log('📊 Test 10: Verifying indexes exist...');
  
  const result = await query(`
    SELECT indexname 
    FROM pg_indexes 
    WHERE tablename = 'industry_benchmarking' 
    AND schemaname = 'public'
    ORDER BY indexname
  `);
  
  const existingIndexes = result.rows.map(row => row.indexname);
  const expectedIndexes = [
    'idx_industry_benchmarking_is_target',
    'idx_industry_benchmarking_organization_name',
    'idx_industry_benchmarking_reporting_year',
    'idx_industry_benchmarking_scope_1',
    'idx_industry_benchmarking_scope_2',
    'idx_industry_benchmarking_revenue'
  ];
  
  let allIndexesExist = true;
  
  for (const expectedIndex of expectedIndexes) {
    if (!existingIndexes.includes(expectedIndex)) {
      console.log(`❌ FAIL: Missing index: ${expectedIndex}`);
      allIndexesExist = false;
    }
  }
  
  if (allIndexesExist) {
    console.log('✅ PASS: All expected indexes exist');
  } else {
    console.log('❌ FAIL: Some expected indexes are missing');
  }
  console.log();
}

// Run the verification tests
if (require.main === module) {
  runVerificationTests().catch(console.error);
}

module.exports = { runVerificationTests };
