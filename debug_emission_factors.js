const { query } = require('./backend/src/config/database');

async function debugEmissionFactors() {
  console.log('🔍 Debugging Emission Factors Issue...\n');
  
  try {
    // Test database connection
    console.log('1. Testing database connection...');
    const connectionTest = await query('SELECT NOW() as current_time');
    console.log('✅ Database connected:', connectionTest.rows[0].current_time);
    
    // Check emission_resources table
    console.log('\n2. Checking emission_resources table...');
    const resourcesCount = await query('SELECT COUNT(*) as count FROM emission_resources');
    console.log('Total emission resources:', resourcesCount.rows[0].count);
    
    // Check categories
    console.log('\n3. Checking categories...');
    const categories = await query(`
      SELECT DISTINCT category, COUNT(*) as count 
      FROM emission_resources 
      GROUP BY category 
      ORDER BY count DESC
    `);
    console.log('Categories in emission_resources:');
    categories.rows.forEach(row => console.log(`  - ${row.category}: ${row.count} resources`));
    
    // Check emission_factors table
    console.log('\n4. Checking emission_factors table...');
    const factorsCount = await query('SELECT COUNT(*) as count FROM emission_factors');
    console.log('Total emission factors:', factorsCount.rows[0].count);
    
    // Check factors with required data
    console.log('\n5. Checking factors with cost_INR and emission_factor...');
    const validFactors = await query(`
      SELECT COUNT(*) as count 
      FROM emission_factors 
      WHERE cost_INR IS NOT NULL AND emission_factor IS NOT NULL
    `);
    console.log('Factors with cost_INR and emission_factor:', validFactors.rows[0].count);
    
    // Check specific category: stationary_combustion
    console.log('\n6. Checking stationary_combustion category...');
    const stationaryQuery = `
      SELECT COUNT(*) as count 
      FROM emission_factors ef
      JOIN emission_resources er ON ef.resource_id = er.id
      WHERE ef.cost_INR IS NOT NULL 
        AND ef.emission_factor IS NOT NULL 
        AND LOWER(er.category) = LOWER('stationary_combustion')
    `;
    const stationaryFactors = await query(stationaryQuery);
    console.log('Stationary combustion factors:', stationaryFactors.rows[0].count);
    
    // Check alternative category names
    console.log('\n7. Checking for alternative category names...');
    const alternativeCategories = await query(`
      SELECT DISTINCT er.category, COUNT(ef.id) as factor_count
      FROM emission_resources er
      JOIN emission_factors ef ON er.id = ef.resource_id
      WHERE ef.cost_INR IS NOT NULL AND ef.emission_factor IS NOT NULL
      GROUP BY er.category
      ORDER BY factor_count DESC
    `);
    console.log('Categories with valid factors:');
    alternativeCategories.rows.forEach(row => 
      console.log(`  - ${row.category}: ${row.factor_count} factors`)
    );
    
    // Check sample data
    console.log('\n8. Sample data from valid factors...');
    const sampleData = await query(`
      SELECT 
        er.category,
        er.resource_name,
        ef.cost_INR,
        ef.emission_factor,
        ef.heat_content
      FROM emission_factors ef
      JOIN emission_resources er ON ef.resource_id = er.id
      WHERE ef.cost_INR IS NOT NULL AND ef.emission_factor IS NOT NULL
      LIMIT 5
    `);
    console.log('Sample factors:');
    sampleData.rows.forEach(row => 
      console.log(`  - ${row.category}: ${row.resource_name} (Cost: ₹${row.cost_inr}, Emission: ${row.emission_factor})`)
    );
    
    console.log('\n🎯 Summary:');
    console.log(`- Total resources: ${resourcesCount.rows[0].count}`);
    console.log(`- Total factors: ${factorsCount.rows[0].count}`);
    console.log(`- Valid factors (with cost_INR & emission_factor): ${validFactors.rows[0].count}`);
    console.log(`- Stationary combustion factors: ${stationaryFactors.rows[0].count}`);
    
    if (validFactors.rows[0].count === '0') {
      console.log('\n❌ ISSUE FOUND: No emission factors have both cost_INR and emission_factor values!');
      console.log('This explains why the optimizer shows 0/0 factors.');
    } else {
      console.log('\n✅ Data looks good. The issue might be in the API query or frontend logic.');
    }
    
  } catch (error) {
    console.error('❌ Error during debugging:', error);
  }
  
  process.exit(0);
}

debugEmissionFactors();
