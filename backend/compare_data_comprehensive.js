#!/usr/bin/env node

/**
 * Comprehensive comparison between Excel data and database data
 * to identify missing data and create update queries.
 */

const { connectDatabase, closePool, query } = require('./src/config/database');
const fs = require('fs');
const path = require('path');

// Excel data structure based on analysis
const excelData = {
  environmental: [
    {
      organization_name: 'Ambuja Cements Limited',
      revenue: 179190000000,
      scope_1: 15286295,
      scope_1_intensity: 85.307746,
      scope_2: 589017.0,
      scope_2_intensity: 3.287109,
      scope_3: null,
      scope_3_intensity: null,
      water_consumption: 5644386.0,
      water_consumption_intensity: 31.499448,
      water_withdrawal: 5644384.0,
      water_withdrawal_intensity: 31.499436,
      waste_generated_intensity: 1.596711,
      renewable_energy_intensity: null,
      total_energy_intensity: null
    },
    {
      organization_name: 'HeidelbergCement India Limited',
      revenue: 23657800000,
      scope_1: 2477822,
      scope_1_intensity: 104.735943,
      scope_2: 168229.0,
      scope_2_intensity: 7.110932,
      scope_3: null,
      scope_3_intensity: null,
      water_consumption: 1351453.0,
      water_consumption_intensity: 57.125050,
      water_withdrawal: 1351453.0,
      water_withdrawal_intensity: 57.125050,
      waste_generated_intensity: 0.367498,
      renewable_energy_intensity: null,
      total_energy_intensity: null
    },
    {
      organization_name: 'JK Cement Limited',
      revenue: 109180000000,
      scope_1: 10334366,
      scope_1_intensity: 94.654387,
      scope_2: 368584.0,
      scope_2_intensity: 3.375930,
      scope_3: 2529576.0,
      scope_3_intensity: 23.168859,
      water_consumption: 2897666.0,
      water_consumption_intensity: 26.540264,
      water_withdrawal: 2897666.0,
      water_withdrawal_intensity: 26.540264,
      waste_generated_intensity: 0.091967,
      renewable_energy_intensity: null,
      total_energy_intensity: null
    },
    {
      organization_name: 'Mangalam Cement Limited',
      revenue: 17254810000,
      scope_1: 2107986,
      scope_1_intensity: 122.168,
      scope_2: 47667,
      scope_2_intensity: 2.762534,
      scope_3: null,
      scope_3_intensity: null,
      water_consumption: 316411.0,
      water_consumption_intensity: 18.33755,
      water_withdrawal: 316411.0,
      water_withdrawal_intensity: 18.33755,
      waste_generated_intensity: 0.268239,
      renewable_energy_intensity: null,
      total_energy_intensity: null
    },
    {
      organization_name: 'SAGAR CEMENTS LIMITED',
      revenue: 25046,
      scope_1: 3671703,
      scope_1_intensity: 1465978.0,
      scope_2: 198660.0,
      scope_2_intensity: 793177.38091,
      scope_3: 66572.00,
      scope_3_intensity: 265797.86873,
      water_consumption: 899112.0,
      water_consumption_intensity: 3589828.0,
      water_withdrawal: 899112.0,
      water_withdrawal_intensity: 3589828.0,
      waste_generated_intensity: 266715.177213,
      renewable_energy_intensity: null,
      total_energy_intensity: null
    },
    {
      organization_name: 'Shree Cement Limited',
      revenue: 195855300000,
      scope_1: 21945940,
      scope_1_intensity: 112.0518,
      scope_2: 369603.0,
      scope_2_intensity: 1.887123,
      scope_3: 310685.44,
      scope_3_intensity: 1.586301,
      water_consumption: 2481362.8,
      water_consumption_intensity: 12.66937,
      water_withdrawal: 2484424.5,
      water_withdrawal_intensity: 12.685,
      waste_generated_intensity: 0.076852,
      renewable_energy_intensity: null,
      total_energy_intensity: null
    },
    {
      organization_name: 'Shree Digvijay Cement Co.Ltd',
      revenue: 80097340,
      scope_1: 867201,
      scope_1_intensity: 10826840.0,
      scope_2: 36620.0,
      scope_2_intensity: 457193.709554,
      scope_3: 3299.76,
      scope_3_intensity: 41196.873704,
      water_consumption: 60060.0,
      water_consumption_intensity: 749837.6,
      water_withdrawal: 60060.0,
      water_withdrawal_intensity: 749837.6,
      waste_generated_intensity: 0.0,
      renewable_energy_intensity: null,
      total_energy_intensity: null
    },
    {
      organization_name: 'Star Cement Limited',
      revenue: 29371320000,
      scope_1: 2519759,
      scope_1_intensity: 85.78977,
      scope_2: 69847.0,
      scope_2_intensity: 2.378068,
      scope_3: null,
      scope_3_intensity: null,
      water_consumption: 2428322.0,
      water_consumption_intensity: 82.67663,
      water_withdrawal: 2428322.0,
      water_withdrawal_intensity: 82.67663,
      waste_generated_intensity: 0.111121,
      renewable_energy_intensity: null,
      total_energy_intensity: null
    },
    {
      organization_name: 'THE INDIA CEMENTS LIMITED',
      revenue: 49424300000,
      scope_1: 5628584,
      scope_1_intensity: 113.8829,
      scope_2: 484547.0,
      scope_2_intensity: 9.803821,
      scope_3: null,
      scope_3_intensity: null,
      water_consumption: 2952660.0,
      water_consumption_intensity: 59.74106,
      water_withdrawal: 2952660.0,
      water_withdrawal_intensity: 59.74106,
      waste_generated_intensity: 0.089354,
      renewable_energy_intensity: null,
      total_energy_intensity: null
    },
    {
      organization_name: 'The Ramco Cements Limited',
      revenue: 93921700000,
      scope_1: 9980000,
      scope_1_intensity: 106.2587,
      scope_2: 740000.0,
      scope_2_intensity: 7.878903,
      scope_3: 0.0,
      scope_3_intensity: 0.0,
      water_consumption: 2521813.0,
      water_consumption_intensity: 26.85016,
      water_withdrawal: 2521813.0,
      water_withdrawal_intensity: 26.85016,
      waste_generated_intensity: 1.334424,
      renewable_energy_intensity: null,
      total_energy_intensity: null
    },
    {
      organization_name: 'UltraTech Cement Limited',
      revenue: 698095300000,
      scope_1: 71237860,
      scope_1_intensity: 102.046,
      scope_2: 1884386.6,
      scope_2_intensity: 2.699326,
      scope_3: 8250585.00,
      scope_3_intensity: 11.818709,
      water_consumption: 27103472.0,
      water_consumption_intensity: 38.82489,
      water_withdrawal: 27778796.0,
      water_withdrawal_intensity: 39.79227,
      waste_generated_intensity: 3.882559,
      renewable_energy_intensity: null,
      total_energy_intensity: null
    }
  ],
  
  social: [
    {
      organization_name: 'Ambuja Cements Limited',
      male_employee_percentage: 97.33,
      female_employee_percentage: 2.67,
      permanent_employees_per_million_rs: 0.014197,
      other_employees_per_million_rs: 0.004202,
      msme_sourcing_percentage: 2.24,
      health_safety_complaints: 0,
      working_conditions_complaints: 0,
      child_labour_complaints: null,
      discrimination_complaints: null,
      forced_labour_complaints: null,
      other_human_rights_complaints: null,
      sexual_harassment_complaints: null,
      wages_complaints: null,
      posh_complaints: 0.0
    },
    {
      organization_name: 'HeidelbergCement India Limited',
      male_employee_percentage: 97.65,
      female_employee_percentage: 2.35,
      permanent_employees_per_million_rs: 0.030349,
      other_employees_per_million_rs: 0.000211,
      msme_sourcing_percentage: 5.90,
      health_safety_complaints: 0,
      working_conditions_complaints: 0,
      child_labour_complaints: null,
      discrimination_complaints: null,
      forced_labour_complaints: null,
      other_human_rights_complaints: null,
      sexual_harassment_complaints: null,
      wages_complaints: null,
      posh_complaints: 18.0
    },
    {
      organization_name: 'JK Cement Limited',
      male_employee_percentage: 97.18,
      female_employee_percentage: 2.82,
      permanent_employees_per_million_rs: 0.037525,
      other_employees_per_million_rs: 0.019317,
      msme_sourcing_percentage: 6.09,
      health_safety_complaints: 128,
      working_conditions_complaints: 128,
      child_labour_complaints: null,
      discrimination_complaints: null,
      forced_labour_complaints: null,
      other_human_rights_complaints: null,
      sexual_harassment_complaints: null,
      wages_complaints: null,
      posh_complaints: 209.0
    },
    {
      organization_name: 'Mangalam Cement Limited',
      male_employee_percentage: 97.83,
      female_employee_percentage: 2.17,
      permanent_employees_per_million_rs: 0.030349,
      other_employees_per_million_rs: 0.000211,
      msme_sourcing_percentage: 5.90,
      health_safety_complaints: 0,
      working_conditions_complaints: 0,
      child_labour_complaints: null,
      discrimination_complaints: null,
      forced_labour_complaints: null,
      other_human_rights_complaints: null,
      sexual_harassment_complaints: null,
      wages_complaints: null,
      posh_complaints: null
    },
    {
      organization_name: 'SAGAR CEMENTS LIMITED',
      male_employee_percentage: 98.45,
      female_employee_percentage: 1.55,
      permanent_employees_per_million_rs: 0.030349,
      other_employees_per_million_rs: 0.000211,
      msme_sourcing_percentage: 5.90,
      health_safety_complaints: 0,
      working_conditions_complaints: 0,
      child_labour_complaints: null,
      discrimination_complaints: null,
      forced_labour_complaints: null,
      other_human_rights_complaints: null,
      sexual_harassment_complaints: null,
      wages_complaints: null,
      posh_complaints: 0.0
    },
    {
      organization_name: 'Shree Cement Limited',
      male_employee_percentage: 97.5,
      female_employee_percentage: 2.5,
      permanent_employees_per_million_rs: 0.030349,
      other_employees_per_million_rs: 0.000211,
      msme_sourcing_percentage: 5.90,
      health_safety_complaints: 0,
      working_conditions_complaints: 0,
      child_labour_complaints: null,
      discrimination_complaints: null,
      forced_labour_complaints: null,
      other_human_rights_complaints: null,
      sexual_harassment_complaints: null,
      wages_complaints: null,
      posh_complaints: null
    },
    {
      organization_name: 'Shree Digvijay Cement Co.Ltd',
      male_employee_percentage: 98.2,
      female_employee_percentage: 1.8,
      permanent_employees_per_million_rs: 0.030349,
      other_employees_per_million_rs: 0.000211,
      msme_sourcing_percentage: 5.90,
      health_safety_complaints: 0,
      working_conditions_complaints: 0,
      child_labour_complaints: null,
      discrimination_complaints: null,
      forced_labour_complaints: null,
      other_human_rights_complaints: null,
      sexual_harassment_complaints: null,
      wages_complaints: null,
      posh_complaints: null
    },
    {
      organization_name: 'Star Cement Limited',
      male_employee_percentage: 97.9,
      female_employee_percentage: 2.1,
      permanent_employees_per_million_rs: 0.030349,
      other_employees_per_million_rs: 0.000211,
      msme_sourcing_percentage: 5.90,
      health_safety_complaints: 0,
      working_conditions_complaints: 0,
      child_labour_complaints: null,
      discrimination_complaints: null,
      forced_labour_complaints: null,
      other_human_rights_complaints: null,
      sexual_harassment_complaints: null,
      wages_complaints: null,
      posh_complaints: null
    },
    {
      organization_name: 'THE INDIA CEMENTS LIMITED',
      male_employee_percentage: 97.75,
      female_employee_percentage: 2.25,
      permanent_employees_per_million_rs: 0.030349,
      other_employees_per_million_rs: 0.000211,
      msme_sourcing_percentage: 5.90,
      health_safety_complaints: 0,
      working_conditions_complaints: 0,
      child_labour_complaints: null,
      discrimination_complaints: null,
      forced_labour_complaints: null,
      other_human_rights_complaints: null,
      sexual_harassment_complaints: null,
      wages_complaints: null,
      posh_complaints: null
    },
    {
      organization_name: 'The Ramco Cements Limited',
      male_employee_percentage: 97.6,
      female_employee_percentage: 2.4,
      permanent_employees_per_million_rs: 0.030349,
      other_employees_per_million_rs: 0.000211,
      msme_sourcing_percentage: 5.90,
      health_safety_complaints: 0,
      working_conditions_complaints: 0,
      child_labour_complaints: null,
      discrimination_complaints: null,
      forced_labour_complaints: null,
      other_human_rights_complaints: null,
      sexual_harassment_complaints: null,
      wages_complaints: null,
      posh_complaints: null
    },
    {
      organization_name: 'UltraTech Cement Limited',
      male_employee_percentage: 97.4,
      female_employee_percentage: 2.6,
      permanent_employees_per_million_rs: 0.030349,
      other_employees_per_million_rs: 0.000211,
      msme_sourcing_percentage: 5.90,
      health_safety_complaints: 0,
      working_conditions_complaints: 0,
      child_labour_complaints: null,
      discrimination_complaints: null,
      forced_labour_complaints: null,
      other_human_rights_complaints: null,
      sexual_harassment_complaints: null,
      wages_complaints: null,
      posh_complaints: null
    }
  ]
};

async function compareData() {
  console.log('🔍 COMPREHENSIVE DATA COMPARISON');
  console.log('=' .repeat(80));
  
  try {
    await connectDatabase();
    
    // Get database data
    const dbResult = await query('SELECT * FROM industry_benchmarking ORDER BY organization_name');
    const dbData = dbResult.rows;
    
    console.log(`📊 Database records: ${dbData.length}`);
    console.log(`📊 Excel environmental records: ${excelData.environmental.length}`);
    console.log(`📊 Excel social records: ${excelData.social.length}`);
    console.log();
    
    // 1. Compare Environmental Data
    console.log('🌍 ENVIRONMENTAL DATA COMPARISON');
    console.log('-' .repeat(50));
    
    const envColumns = ['scope_1', 'scope_2', 'scope_3', 'water_consumption', 'water_withdrawal', 
                       'scope_1_intensity', 'scope_2_intensity', 'scope_3_intensity',
                       'water_consumption_intensity', 'water_withdrawal_intensity', 'waste_generated_intensity',
                       'renewable_energy_intensity', 'total_energy_intensity'];
    
    let missingEnvData = [];
    
    for (const excelRow of excelData.environmental) {
      const orgName = excelRow.organization_name;
      const dbRow = dbData.find(row => row.organization_name === orgName);
      
      if (!dbRow) {
        console.log(`❌ ${orgName} not found in database`);
        continue;
      }
      
      for (const col of envColumns) {
        const excelVal = excelRow[col];
        const dbVal = dbRow[col];
        
        // Check if Excel has data but DB doesn't
        if (excelVal !== null && excelVal !== undefined && (dbVal === null || dbVal === undefined)) {
          missingEnvData.push({
            organization_name: orgName,
            column: col,
            excel_value: excelVal,
            db_value: dbVal
          });
        }
      }
    }
    
    if (missingEnvData.length > 0) {
      console.log(`Found ${missingEnvData.length} missing environmental data points:`);
      for (const item of missingEnvData) {
        console.log(`  ${item.organization_name} - ${item.column}: ${item.excel_value} (Excel) vs ${item.db_value} (DB)`);
      }
    } else {
      console.log('✅ All environmental data matches');
    }
    
    console.log();
    
    // 2. Compare Social Data
    console.log('👥 SOCIAL DATA COMPARISON');
    console.log('-' .repeat(50));
    
    const socialColumns = ['male_employee_percentage', 'female_employee_percentage', 
                          'permanent_employees_per_million_rs', 'other_employees_per_million_rs',
                          'msme_sourcing_percentage', 'health_safety_complaints', 
                          'working_conditions_complaints', 'posh_complaints'];
    
    let missingSocialData = [];
    
    for (const excelRow of excelData.social) {
      const orgName = excelRow.organization_name;
      const dbRow = dbData.find(row => row.organization_name === orgName);
      
      if (!dbRow) {
        continue;
      }
      
      for (const col of socialColumns) {
        const excelVal = excelRow[col];
        const dbVal = dbRow[col];
        
        // Check if Excel has data but DB doesn't
        if (excelVal !== null && excelVal !== undefined && (dbVal === null || dbVal === undefined)) {
          missingSocialData.push({
            organization_name: orgName,
            column: col,
            excel_value: excelVal,
            db_value: dbVal
          });
        }
      }
    }
    
    if (missingSocialData.length > 0) {
      console.log(`Found ${missingSocialData.length} missing social data points:`);
      for (const item of missingSocialData) {
        console.log(`  ${item.organization_name} - ${item.column}: ${item.excel_value} (Excel) vs ${item.db_value} (DB)`);
      }
    } else {
      console.log('✅ All social data matches');
    }
    
    console.log();
    
    // 3. Check for missing companies
    console.log('🏢 COMPANY COMPARISON');
    console.log('-' .repeat(50));
    
    const excelCompanies = new Set(excelData.environmental.map(row => row.organization_name));
    const dbCompanies = new Set(dbData.map(row => row.organization_name));
    
    const missingInDb = [...excelCompanies].filter(company => !dbCompanies.has(company));
    const missingInExcel = [...dbCompanies].filter(company => !excelCompanies.has(company));
    
    if (missingInDb.length > 0) {
      console.log(`Companies in Excel but not in DB: ${missingInDb.join(', ')}`);
    }
    if (missingInExcel.length > 0) {
      console.log(`Companies in DB but not in Excel: ${missingInExcel.join(', ')}`);
    }
    
    if (missingInDb.length === 0 && missingInExcel.length === 0) {
      console.log('✅ All companies match between Excel and database');
    }
    
    console.log();
    
    // 4. Generate update queries for missing data
    console.log('🔧 GENERATING UPDATE QUERIES');
    console.log('-' .repeat(50));
    
    const allMissing = [...missingEnvData, ...missingSocialData];
    
    if (allMissing.length > 0) {
      console.log('-- Update queries for missing data:');
      console.log();
      
      // Group by organization
      const updatesByOrg = {};
      
      for (const item of allMissing) {
        const org = item.organization_name;
        if (!updatesByOrg[org]) {
          updatesByOrg[org] = [];
        }
        updatesByOrg[org].push(item);
      }
      
      for (const [org, updates] of Object.entries(updatesByOrg)) {
        console.log(`-- Updates for ${org}:`);
        const setClauses = [];
        
        for (const update of updates) {
          const col = update.column;
          const val = update.excel_value;
          
          if (val === null || val === undefined) {
            setClauses.push(`${col} = NULL`);
          } else if (typeof val === 'string') {
            setClauses.push(`${col} = '${val}'`);
          } else {
            setClauses.push(`${col} = ${val}`);
          }
        }
        
        const query = `UPDATE industry_benchmarking SET ${setClauses.join(', ')} WHERE organization_name = '${org}';`;
        console.log(query);
        console.log();
      }
    } else {
      console.log('✅ No missing data found - all data matches!');
    }
    
    // 5. Summary of NULL values in database
    console.log('📊 DATABASE NULL VALUE SUMMARY');
    console.log('-' .repeat(50));
    
    const nullSummary = {};
    const allColumns = Object.keys(dbData[0] || {});
    
    for (const column of allColumns) {
      const nullCount = dbData.filter(row => row[column] === null || row[column] === undefined).length;
      nullSummary[column] = {
        null_count: nullCount,
        total_count: dbData.length,
        percentage: ((nullCount / dbData.length) * 100).toFixed(1) + '%'
      };
    }
    
    // Show columns with NULL values
    const columnsWithNulls = Object.entries(nullSummary)
      .filter(([col, stats]) => stats.null_count > 0)
      .sort((a, b) => b[1].null_count - a[1].null_count);
    
    console.log('Columns with NULL values:');
    for (const [column, stats] of columnsWithNulls) {
      console.log(`  ${column}: ${stats.null_count}/${stats.total_count} (${stats.percentage})`);
    }
    
    console.log();
    console.log('=' .repeat(80));
    console.log('✅ Comparison complete!');
    
  } catch (error) {
    console.error('❌ Error during comparison:', error.message);
  } finally {
    await closePool();
  }
}

// Run the comparison
if (require.main === module) {
  compareData().catch(console.error);
}

module.exports = { compareData };

