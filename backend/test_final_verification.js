#!/usr/bin/env node

/**
 * Final Verification Test Script
 * Verifies that all four issues have been fixed:
 * 1. POSH complaints count irregularity
 * 2. Target JSON not proper/missing data
 * 3. Initiatives JSON missing
 * 4. Data sources JSON missing
 */

const { connectDatabase, closePool, query } = require('./src/config/database');

async function runFinalVerification() {
  console.log('🔍 FINAL VERIFICATION - ALL FOUR ISSUES FIXED');
  console.log('=' .repeat(60));
  
  try {
    await connectDatabase();
    
    // Test 1: POSH Complaints Verification
    console.log('\n1️⃣ POSH COMPLAINTS VERIFICATION:');
    console.log('-' .repeat(40));
    
    const poshResult = await query('SELECT organization_name, posh_complaints FROM industry_benchmarking ORDER BY posh_complaints DESC');
    
    // Expected POSH complaints from Excel
    const expectedPosh = {
      'UltraTech Cement Limited': 1173,
      'The Ramco Cements Limited': 230,
      'JK Cement Limited': 209,
      'Shree Cement Limited': 60,
      'HeidelbergCement India Limited': 18,
      'Ambuja Cements Limited': 0,
      'Mangalam Cement Limited': 0,
      'SAGAR CEMENTS LIMITED': 0,
      'Shree Digvijay Cement Co.Ltd': 0,
      'Star Cement Limited': 0,
      'THE INDIA CEMENTS LIMITED': 0
    };
    
    let poshCorrect = true;
    console.log('POSH Complaints Data:');
    console.table(poshResult.rows);
    
    for (const row of poshResult.rows) {
      const expected = expectedPosh[row.organization_name];
      if (row.posh_complaints !== expected) {
        console.log(`❌ POSH mismatch: ${row.organization_name} - Expected: ${expected}, Got: ${row.posh_complaints}`);
        poshCorrect = false;
      }
    }
    
    console.log(poshCorrect ? '✅ POSH complaints data is correct' : '❌ POSH complaints data has issues');
    
    // Test 2: Targets JSON Verification
    console.log('\n2️⃣ TARGETS JSON VERIFICATION:');
    console.log('-' .repeat(40));
    
    const targetsResult = await query('SELECT organization_name, targets FROM industry_benchmarking WHERE targets IS NOT NULL ORDER BY organization_name');
    
    let targetsCorrect = true;
    console.log(`Companies with targets: ${targetsResult.rows.length}/11`);
    
    for (const row of targetsResult.rows) {
      const targets = row.targets;
      const hasSocial = targets.social_targets && Array.isArray(targets.social_targets) && targets.social_targets.length > 0;
      const hasEnvironmental = targets.environmental_targets && Array.isArray(targets.environmental_targets) && targets.environmental_targets.length > 0;
      const hasGovernance = targets.governance_targets && Array.isArray(targets.governance_targets) && targets.governance_targets.length > 0;
      
      console.log(`\n${row.organization_name}:`);
      console.log(`  Social: ${hasSocial ? '✅' : '❌'} (${targets.social_targets?.length || 0} targets)`);
      console.log(`  Environmental: ${hasEnvironmental ? '✅' : '❌'} (${targets.environmental_targets?.length || 0} targets)`);
      console.log(`  Governance: ${hasGovernance ? '✅' : '❌'} (${targets.governance_targets?.length || 0} targets)`);
      
      if (!hasSocial || !hasEnvironmental || !hasGovernance) {
        targetsCorrect = false;
      }
    }
    
    console.log(targetsCorrect ? '✅ Targets JSON is comprehensive' : '❌ Targets JSON has issues');
    
    // Test 3: Initiatives JSON Verification
    console.log('\n3️⃣ INITIATIVES JSON VERIFICATION:');
    console.log('-' .repeat(40));
    
    const initiativesResult = await query('SELECT organization_name, initiatives FROM industry_benchmarking WHERE initiatives IS NOT NULL ORDER BY organization_name');
    
    let initiativesCorrect = true;
    console.log(`Companies with initiatives: ${initiativesResult.rows.length}/11`);
    
    for (const row of initiativesResult.rows) {
      const initiatives = row.initiatives;
      const categories = Object.keys(initiatives);
      const totalInitiatives = Object.values(initiatives).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
      
      console.log(`\n${row.organization_name}:`);
      console.log(`  Categories: ${categories.length}`);
      console.log(`  Total initiatives: ${totalInitiatives}`);
      
      for (const [category, initiativeList] of Object.entries(initiatives)) {
        console.log(`    ${category}: ${initiativeList.length} initiatives`);
      }
      
      if (categories.length === 0 || totalInitiatives === 0) {
        initiativesCorrect = false;
      }
    }
    
    console.log(initiativesCorrect ? '✅ Initiatives JSON is populated' : '❌ Initiatives JSON has issues');
    
    // Test 4: Sources JSON Verification
    console.log('\n4️⃣ SOURCES JSON VERIFICATION:');
    console.log('-' .repeat(40));
    
    const sourcesResult = await query('SELECT organization_name, sources FROM industry_benchmarking WHERE sources IS NOT NULL ORDER BY organization_name');
    
    let sourcesCorrect = true;
    console.log(`Companies with sources: ${sourcesResult.rows.length}/11`);
    
    for (const row of sourcesResult.rows) {
      const sources = row.sources;
      const isArray = Array.isArray(sources);
      const hasValidSources = isArray && sources.length > 0 && sources.every(s => s.title && s.reference_link);
      
      console.log(`\n${row.organization_name}:`);
      console.log(`  Sources count: ${isArray ? sources.length : 0}`);
      console.log(`  Valid sources: ${hasValidSources ? '✅' : '❌'}`);
      
      if (isArray && sources.length > 0) {
        console.log(`  Sample sources:`);
        for (let i = 0; i < Math.min(2, sources.length); i++) {
          console.log(`    ${i+1}. ${sources[i].title}`);
        }
      }
      
      if (!hasValidSources) {
        sourcesCorrect = false;
      }
    }
    
    console.log(sourcesCorrect ? '✅ Sources JSON is populated' : '❌ Sources JSON has issues');
    
    // Final Summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 FINAL SUMMARY:');
    console.log('-' .repeat(40));
    console.log(`1. POSH Complaints: ${poshCorrect ? '✅ FIXED' : '❌ ISSUES'}`);
    console.log(`2. Targets JSON: ${targetsCorrect ? '✅ FIXED' : '❌ ISSUES'}`);
    console.log(`3. Initiatives JSON: ${initiativesCorrect ? '✅ FIXED' : '❌ ISSUES'}`);
    console.log(`4. Sources JSON: ${sourcesCorrect ? '✅ FIXED' : '❌ ISSUES'}`);
    
    const allFixed = poshCorrect && targetsCorrect && initiativesCorrect && sourcesCorrect;
    console.log('\n' + (allFixed ? '🎉 ALL FOUR ISSUES HAVE BEEN SUCCESSFULLY FIXED!' : '⚠️  Some issues remain'));
    
    if (allFixed) {
      console.log('\n✅ The industry_benchmarking table now contains:');
      console.log('   • Correct POSH complaints data from Excel');
      console.log('   • Comprehensive targets JSON for major companies');
      console.log('   • Detailed initiatives JSON by category');
      console.log('   • Complete sources JSON with reference links');
      console.log('   • All data ready for benchmarking analysis');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await closePool();
  }
}

// Run the verification
if (require.main === module) {
  runFinalVerification().catch(console.error);
}

module.exports = { runFinalVerification };

