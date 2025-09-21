const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { connectDatabase, closePool, query } = require('../config/database');
const { logger } = require('./logger');

/**
 * Import all 549 CSV entries into the database
 */
async function importCompleteCSVDataset() {
  try {
    await connectDatabase();
    logger.info('Starting import of complete CSV dataset (549 entries)...');
    
    const csvFilePath = path.join(__dirname, '../../migrations/files/ef_libraries_with_cost.csv');
    
    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`CSV file not found: ${csvFilePath}`);
    }
    
    // Read and parse CSV data
    const csvData = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          csvData.push(row);
        })
        .on('end', () => {
          logger.info(`Parsed ${csvData.length} rows from CSV file`);
          resolve();
        })
        .on('error', reject);
    });
    
    // Process the data
    await processCSVData(csvData);
    
    logger.info('✅ Complete CSV import successful!');
    
  } catch (error) {
    logger.error('Failed to import CSV dataset:', error);
    throw error;
  } finally {
    await closePool();
  }
}

async function processCSVData(csvData) {
  // Helper functions
  const normalizeScope = (scope) => {
    switch (scope?.toLowerCase().trim()) {
      case 'scope 1': return 'scope1';
      case 'scope 2': return 'scope2';
      default: return 'scope1';
    }
  };
  
  const getResourceType = (activityType, name) => {
    const activity = activityType?.toLowerCase().trim();
    const resourceName = name?.toLowerCase();
    
    switch (activity) {
      case 'stationary combustion':
        if (resourceName?.includes('gas') || resourceName?.includes('lng') || resourceName?.includes('cng')) return 'Gas';
        if (resourceName?.includes('coal') || resourceName?.includes('coke')) return 'Solid';
        if (resourceName?.includes('oil') || resourceName?.includes('diesel') || resourceName?.includes('petrol') || resourceName?.includes('gasoline') || resourceName?.includes('fuel')) return 'Liquid';
        if (resourceName?.includes('electric')) return 'Electricity';
        if (resourceName?.includes('wood') || resourceName?.includes('biomass') || resourceName?.includes('agricultural')) return 'Biomass';
        return 'Fuel';
      case 'mobile combustion': return 'Transport Fuel';
      case 'fugitive emissions': return 'Refrigerant';
      case 'purchased electricity': return 'Electricity';
      default: return 'Other';
    }
  };
  
  const convertBoolean = (value) => {
    return value?.toString().toLowerCase().trim() === 'true';
  };
  
  // Step 1: Create all libraries
  logger.info('Creating emission factor libraries...');
  const libraries = new Map();
  
  for (const row of csvData) {
    const key = `${row.source}-${row.version}-${row.published_year}`;
    if (!libraries.has(key)) {
      libraries.set(key, {
        library_name: row.source,
        version: row.version,
        year: parseInt(row.published_year),
        region: row.source.includes('DEFRA') || row.source.includes('BEIS') ? 'UK' : 
                row.source.includes('CEA') ? 'India' : 'Global',
        description: `${row.source} Emission Factors Database - ${row.version} ${row.published_year}`,
        is_active: true
      });
    }
  }
  
  for (const library of libraries.values()) {
    await query(`
      INSERT INTO emission_factor_libraries (library_name, version, year, region, description, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (library_name, version, year) DO NOTHING
    `, [library.library_name, library.version, library.year, library.region, library.description, library.is_active]);
  }
  
  logger.info(`Created/verified ${libraries.size} emission factor libraries`);
  
  // Step 2: Create all resources
  logger.info('Creating emission resources...');
  const resources = new Map();
  
  for (const row of csvData) {
    const scope = normalizeScope(row.scope);
    const key = `${row.name}-${scope}`;
    
    if (!resources.has(key)) {
      const isAlternativeFuel = row.name?.toLowerCase().includes('biomass') || 
                              row.name?.toLowerCase().includes('agricultural') || 
                              row.name?.toLowerCase().includes('waste') || 
                              row.name?.toLowerCase().includes('tire') || 
                              row.name?.toLowerCase().includes('wood') || 
                              convertBoolean(row.is_biofuel);
      
      resources.set(key, {
        resource_name: row.name,
        resource_type: getResourceType(row.activity_type, row.name),
        category: row.activity_type,
        scope: scope,
        is_alternative_fuel: isAlternativeFuel,
        is_renewable: convertBoolean(row.is_renewable),
        is_biofuel: convertBoolean(row.is_biofuel),
        is_refrigerant: convertBoolean(row.is_refrigerant),
        description: `Imported from ${row.source} ${row.version} (${row.published_year})`
      });
    }
  }
  
  for (const resource of resources.values()) {
    await query(`
      INSERT INTO emission_resources (
        resource_name, resource_type, category, scope, is_alternative_fuel,
        is_renewable, is_biofuel, is_refrigerant, description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (resource_name, scope) DO UPDATE SET
        is_renewable = EXCLUDED.is_renewable,
        is_biofuel = EXCLUDED.is_biofuel,
        is_refrigerant = EXCLUDED.is_refrigerant,
        description = EXCLUDED.description
    `, [
      resource.resource_name, resource.resource_type, resource.category, resource.scope,
      resource.is_alternative_fuel, resource.is_renewable, resource.is_biofuel, 
      resource.is_refrigerant, resource.description
    ]);
  }
  
  logger.info(`Created/updated ${resources.size} emission resources`);
  
  // Step 3: Create all emission factors
  logger.info('Creating emission factors...');
  let factorsCreated = 0;
  
  for (const row of csvData) {
    try {
      const scope = normalizeScope(row.scope);
      
      // Get resource ID
      const resourceResult = await query(`
        SELECT id FROM emission_resources 
        WHERE resource_name = $1 AND scope = $2
      `, [row.name, scope]);
      
      if (resourceResult.rows.length === 0) {
        logger.warn(`Resource not found: ${row.name} (${scope})`);
        continue;
      }
      
      // Get library ID
      const libraryResult = await query(`
        SELECT id FROM emission_factor_libraries 
        WHERE library_name = $1 AND version = $2 AND year = $3
      `, [row.source, row.version, parseInt(row.published_year)]);
      
      if (libraryResult.rows.length === 0) {
        logger.warn(`Library not found: ${row.source} ${row.version} ${row.published_year}`);
        continue;
      }
      
      const resourceId = resourceResult.rows[0].id;
      const libraryId = libraryResult.rows[0].id;
      
      // Parse numeric values with better error handling
      let emissionFactor = 0;
      let biogenicFactor = null;
      let costINR = null;
      let heatContent = null;
      
      try {
        emissionFactor = row.kgco2e && row.kgco2e.trim() ? parseFloat(row.kgco2e) : 0;
        biogenicFactor = row.biogenic_kgco2e && row.biogenic_kgco2e.trim() ? parseFloat(row.biogenic_kgco2e) : null;
        costINR = row.cost_inr && row.cost_inr.trim() ? parseFloat(row.cost_inr) : null;
        heatContent = row.heat_content && row.heat_content.trim() ? parseFloat(row.heat_content) : null;
      } catch (parseError) {
        logger.warn(`Parse error for ${row.name}: ${parseError.message}`);
        continue;
      }
      
      // Skip invalid emission factors
      if (isNaN(emissionFactor) || emissionFactor < 0) {
        logger.warn(`Invalid emission factor for ${row.name}: ${row.kgco2e}`);
        continue;
      }
      
      // Log heat content for first few entries
      if (factorsCreated < 5 && heatContent !== null) {
        logger.info(`Heat content for ${row.name}: ${heatContent} GJ/unit`);
      }
      
      await query(`
        INSERT INTO emission_factors (
          resource_id, library_id, emission_factor, emission_factor_unit,
          biogenic_emission_factor, cost_INR, heat_content, heat_content_unit,
          reference_source, availability_score
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT DO NOTHING
      `, [
        resourceId, libraryId, emissionFactor, row.unit_name || 'kg',
        biogenicFactor, costINR, heatContent, 'GJ',
        `${row.source} ${row.version} (${row.published_year})`, 
        9
      ]);
      
      factorsCreated++;
    } catch (error) {
      logger.error(`Error processing row for ${row.name}:`, error.message);
    }
  }
  
  logger.info(`Created ${factorsCreated} emission factors`);
  
  // Count heat content statistics
  let heatContentCount = 0;
  for (const row of csvData) {
    if (row.heat_content && row.heat_content.trim()) {
      heatContentCount++;
    }
  }

  logger.info('=== COMPLETE CSV IMPORT SUMMARY ===');
  logger.info(`Total CSV rows processed: ${csvData.length}`);
  logger.info(`Libraries created/verified: ${libraries.size}`);
  logger.info(`Resources created/updated: ${resources.size}`);
  logger.info(`Emission factors created: ${factorsCreated}`);
  logger.info(`Rows with heat content: ${heatContentCount}/${csvData.length}`);
}

// Run if called directly
if (require.main === module) {
  importCompleteCSVDataset()
    .then(() => {
      console.log('✅ CSV import completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ CSV import failed:', error.message);
      process.exit(1);
    });
}

module.exports = { importCompleteCSVDataset };
