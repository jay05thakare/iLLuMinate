#!/usr/bin/env node

/**
 * Test script to verify emission data flow with new schema
 * This script tests the exact query provided by the user and checks data availability
 */

const { Client } = require('pg');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'illuminate_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
};

console.log('🔍 Testing Emission Data Flow with New Schema');
console.log('============================================\n');

async function testEmissionDataQuery() {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('✅ Database connected successfully\n');

    // Test the exact query provided by the user
    const userQuery = `
      SELECT 
        f.name as facility_name,
        f.id as facility_id,
        er.resource_name,
        er.id as resource_id,
        er.category,
        er.scope,
        ed.month,
        ed.year,
        ed.consumption,
        ed.consumption_unit,
        ed.total_emissions,
        ed.total_energy,
        ef.emission_factor,
        ef.heat_content,
        ef.emission_factor_unit,
        ef.heat_content_unit,
        erfc.id as facility_config_id,
        erc.id as resource_config_id
      FROM emission_resource_facility_configurations erfc 
      JOIN emission_resource_configurations erc ON erc.id = erfc.emission_resource_config_id
      JOIN emission_resources er ON er.id = erc.resource_id
      JOIN facilities f ON f.id = erfc.facility_id
      JOIN emission_factors ef ON ef.resource_id = er.id
      JOIN emission_data ed ON ed.emission_resource_facility_config_id = erfc.id
      ORDER BY f.name, ed.year DESC, ed.month DESC, er.resource_name
    `;

    console.log('🔍 Running user-provided query...\n');
    const result = await client.query(userQuery);
    
    console.log(`📊 Query Results: ${result.rows.length} records found\n`);
    
    if (result.rows.length === 0) {
      console.log('⚠️  No emission data found with new schema!');
      console.log('This might indicate:');
      console.log('1. No data has been migrated to the new schema');
      console.log('2. No emission data exists in the database');
      console.log('3. The schema migration is incomplete\n');
      
      // Check if there's data in the old schema
      console.log('🔍 Checking old schema for comparison...\n');
      const oldSchemaQuery = `
        SELECT 
          f.name as facility_name,
          er.resource_name,
          ed.month,
          ed.year,
          ed.consumption,
          ed.facility_resource_id
        FROM emission_data ed
        JOIN facility_resources fr ON ed.facility_resource_id = fr.id
        JOIN emission_resources er ON fr.resource_id = er.id
        JOIN facilities f ON ed.facility_id = f.id
        ORDER BY f.name, ed.year DESC, ed.month DESC
      `;
      
      try {
        const oldResult = await client.query(oldSchemaQuery);
        console.log(`📊 Old Schema Results: ${oldResult.rows.length} records found\n`);
        
        if (oldResult.rows.length > 0) {
          console.log('⚠️  Data exists in OLD schema but not in NEW schema!');
          console.log('This confirms that data migration is needed.\n');
          console.log('Sample old schema data:');
          oldResult.rows.slice(0, 3).forEach((row, index) => {
            console.log(`${index + 1}. ${row.facility_name} - ${row.resource_name} (${row.month}/${row.year}): ${row.consumption}`);
          });
        }
      } catch (oldError) {
        console.log('❌ Error checking old schema:', oldError.message);
      }
      
    } else {
      console.log('✅ Found emission data with new schema!\n');
      
      // Group by facility
      const facilitiesMap = {};
      result.rows.forEach(row => {
        if (!facilitiesMap[row.facility_name]) {
          facilitiesMap[row.facility_name] = [];
        }
        facilitiesMap[row.facility_name].push(row);
      });
      
      console.log('📋 Data Summary by Facility:');
      console.log('===========================\n');
      
      Object.entries(facilitiesMap).forEach(([facilityName, records]) => {
        console.log(`🏭 ${facilityName} (${records.length} records)`);
        console.log(`   Facility ID: ${records[0].facility_id}`);
        
        // Group by month/year
        const periods = {};
        records.forEach(record => {
          const period = `${record.month}/${record.year}`;
          if (!periods[period]) periods[period] = [];
          periods[period].push(record);
        });
        
        Object.entries(periods).forEach(([period, periodRecords]) => {
          console.log(`   📅 ${period}: ${periodRecords.length} resources`);
          periodRecords.forEach(record => {
            console.log(`      • ${record.resource_name} (${record.scope}/${record.category}): ${record.consumption} ${record.consumption_unit}`);
          });
        });
        console.log('');
      });
      
      // Test API compatibility
      console.log('🔍 Testing API Compatibility...\n');
      
      // Get first facility for testing
      const testFacilityId = result.rows[0].facility_id;
      const testMonth = result.rows[0].month;
      const testYear = result.rows[0].year;
      
      console.log(`📡 Testing API endpoints for facility: ${testFacilityId}`);
      console.log(`   Period: ${testMonth}/${testYear}\n`);
      
      // Test facility assignments query (current backend API)
      const assignmentsQuery = `
        SELECT 
          erfc.id as assignment_id,
          erfc.is_active,
          erfc.effective_from,
          erfc.effective_to,
          erfc.created_at as assigned_at,
          erc.id as configuration_id,
          er.id as resource_id,
          er.resource_name,
          er.category,
          er.resource_type as type,
          er.scope,
          er.description,
          ef.id as emission_factor_id,
          ef.emission_factor,
          ef.emission_factor_unit,
          ef.heat_content,
          ef.heat_content_unit
        FROM emission_resource_facility_configurations erfc
        JOIN emission_resource_configurations erc ON erfc.emission_resource_config_id = erc.id
        JOIN emission_resources er ON erc.resource_id = er.id
        JOIN emission_factors ef ON erc.emission_factor_id = ef.id
        WHERE erfc.facility_id = $1 AND erfc.is_active = true
        ORDER BY er.scope, er.category, er.resource_name
      `;
      
      const assignmentsResult = await client.query(assignmentsQuery, [testFacilityId]);
      console.log(`📋 Facility Assignments: ${assignmentsResult.rows.length} active assignments`);
      
      if (assignmentsResult.rows.length > 0) {
        console.log('   Sample assignments:');
        assignmentsResult.rows.slice(0, 3).forEach((row, index) => {
          console.log(`   ${index + 1}. ${row.resource_name} (ID: ${row.assignment_id}) - ${row.scope}/${row.category}`);
        });
      }
      console.log('');
      
      // Test emission data query for specific period
      const emissionDataQuery = `
        SELECT 
          ed.id,
          ed.month,
          ed.year,
          ed.scope,
          ed.consumption,
          ed.consumption_unit,
          ed.emission_factor,
          ed.heat_content,
          ed.total_emissions,
          ed.total_energy,
          ed.created_at,
          ed.updated_at,
          er.resource_name,
          er.category as resource_category,
          er.resource_type
        FROM emission_data ed
        JOIN emission_resource_facility_configurations erfc ON ed.emission_resource_facility_config_id = erfc.id
        JOIN emission_resource_configurations erc ON erfc.emission_resource_config_id = erc.id
        JOIN emission_resources er ON erc.resource_id = er.id
        WHERE erfc.facility_id = $1 AND ed.month = $2 AND ed.year = $3
        ORDER BY ed.scope, er.resource_name
      `;
      
      const emissionResult = await client.query(emissionDataQuery, [testFacilityId, testMonth, testYear]);
      console.log(`📊 Emission Data for ${testMonth}/${testYear}: ${emissionResult.rows.length} records`);
      
      if (emissionResult.rows.length > 0) {
        console.log('   Sample emission data:');
        emissionResult.rows.slice(0, 3).forEach((row, index) => {
          console.log(`   ${index + 1}. ${row.resource_name}: ${row.consumption} ${row.consumption_unit} = ${row.total_emissions} kgCO2e`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
    console.log('\n🔚 Database connection closed');
  }
}

async function checkSchemaStatus() {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    
    console.log('\n🔍 Checking Schema Status...\n');
    
    // Check if new schema tables exist
    const newSchemaCheck = `
      SELECT 
        table_name, 
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_name IN (
        'emission_resource_configurations',
        'emission_resource_facility_configurations'
      )
      ORDER BY table_name
    `;
    
    const schemaResult = await client.query(newSchemaCheck);
    console.log('📋 New Schema Tables:');
    schemaResult.rows.forEach(row => {
      console.log(`   ✅ ${row.table_name} (${row.column_count} columns)`);
    });
    
    // Check data counts
    const dataCounts = await Promise.all([
      client.query('SELECT COUNT(*) as count FROM emission_resource_configurations'),
      client.query('SELECT COUNT(*) as count FROM emission_resource_facility_configurations'),
      client.query('SELECT COUNT(*) as count FROM emission_data WHERE emission_resource_facility_config_id IS NOT NULL'),
      client.query('SELECT COUNT(*) as count FROM emission_data WHERE facility_resource_id IS NOT NULL')
    ]);
    
    console.log('\n📊 Data Counts:');
    console.log(`   Resource Configurations: ${dataCounts[0].rows[0].count}`);
    console.log(`   Facility Configurations: ${dataCounts[1].rows[0].count}`);
    console.log(`   Emission Data (new schema): ${dataCounts[2].rows[0].count}`);
    console.log(`   Emission Data (old schema): ${dataCounts[3].rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Schema check error:', error.message);
  } finally {
    await client.end();
  }
}

// Run the tests
async function runTests() {
  try {
    await checkSchemaStatus();
    await testEmissionDataQuery();
    
    console.log('\n✅ Test Complete!');
    console.log('\nNext Steps:');
    console.log('1. If data exists in new schema: Update backend API to use new schema');
    console.log('2. If data exists in old schema: Run data migration');
    console.log('3. If no data exists: Check data seeding process');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();
