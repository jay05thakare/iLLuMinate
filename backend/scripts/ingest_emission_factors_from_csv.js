const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

// Database configuration
const pool = new Pool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'illuminate_db',
    user: process.env.DB_USER || 'illuminate',
    password: process.env.DB_PASSWORD || 'e843050527f45a81c81e81be60ae9830',
});

// Maps to store IDs to avoid duplicate lookups
const libraryMap = new Map();
const resourceMap = new Map();

class EmissionFactorIngester {
    constructor() {
        this.stats = {
            libraries: { created: 0, existing: 0 },
            resources: { created: 0, existing: 0 },
            factors: { created: 0, existing: 0, errors: 0 }
        };
    }

    async createLibrary(library) {
        const { source, version, published_year } = library;
        const libraryKey = `${source}-${version}-${published_year}`;
        
        if (libraryMap.has(libraryKey)) {
            this.stats.libraries.existing++;
            return libraryMap.get(libraryKey);
        }

        try {
            // Check if library exists
            const existingLibrary = await pool.query(
                'SELECT id FROM emission_factor_libraries WHERE library_name = $1 AND version = $2 AND year = $3',
                [source, version, published_year]
            );

            if (existingLibrary.rows.length > 0) {
                const id = existingLibrary.rows[0].id;
                libraryMap.set(libraryKey, id);
                this.stats.libraries.existing++;
                return id;
            }

            // Create new library
            const result = await pool.query(
                `INSERT INTO emission_factor_libraries 
                (id, library_name, version, year, region, description, is_active) 
                VALUES ($1, $2, $3, $4, $5, $6, $7) 
                RETURNING id`,
                [
                    uuidv4(),
                    source,
                    version,
                    parseInt(published_year),
                    'Global',
                    `${source} emission factors database version ${version}`,
                    true
                ]
            );

            const id = result.rows[0].id;
            libraryMap.set(libraryKey, id);
            this.stats.libraries.created++;
            return id;
        } catch (error) {
            console.error(`Error creating library ${libraryKey}:`, error.message);
            throw error;
        }
    }

    async createResource(resource) {
        const { name, scope, activity_type, is_renewable, is_biofuel, is_refrigerant } = resource;
        const resourceKey = `${name}-${scope}`;
        
        if (resourceMap.has(resourceKey)) {
            this.stats.resources.existing++;
            return resourceMap.get(resourceKey);
        }

        try {
            // Check if resource exists
            const existingResource = await pool.query(
                'SELECT id FROM emission_resources WHERE resource_name = $1 AND scope = $2',
                [name, scope]
            );

            if (existingResource.rows.length > 0) {
                const id = existingResource.rows[0].id;
                resourceMap.set(resourceKey, id);
                this.stats.resources.existing++;
                return id;
            }

            // Determine resource type and category from activity_type
            let resource_type = 'fuel';
            let category = 'stationary_combustion';
            
            if (activity_type.includes('Mobile')) {
                category = 'mobile_combustion';
            } else if (activity_type.includes('Fugitive')) {
                resource_type = 'refrigerant';
                category = 'fugitive_emissions';
            } else if (activity_type.includes('Electricity')) {
                resource_type = 'electricity';
                category = 'purchased_electricity';
            }

            // Determine if alternative fuel (renewable OR biofuel)
            const isAlternativeFuel = is_renewable === 'True' || is_biofuel === 'True';

            // Create new resource
            const result = await pool.query(
                `INSERT INTO emission_resources 
                (id, resource_name, resource_type, category, scope, is_alternative_fuel, 
                 is_calculator, is_renewable, is_biofuel, is_refrigerant, description) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
                RETURNING id`,
                [
                    uuidv4(),
                    name,
                    resource_type,
                    category,
                    scope.toLowerCase(),
                    isAlternativeFuel,
                    false,
                    is_renewable === 'True',
                    is_biofuel === 'True',
                    is_refrigerant === 'True',
                    `${name} - ${activity_type}`
                ]
            );

            const id = result.rows[0].id;
            resourceMap.set(resourceKey, id);
            this.stats.resources.created++;
            return id;
        } catch (error) {
            console.error(`Error creating resource ${resourceKey}:`, error.message);
            throw error;
        }
    }

    async createEmissionFactor(factor, libraryId, resourceId) {
        try {
            const { 
                kgco2e, 
                unit_name, 
                heat_content, 
                biogenic_kgco2e, 
                cost_inr 
            } = factor;

            // Check if emission factor already exists
            const existingFactor = await pool.query(
                'SELECT id FROM emission_factors WHERE resource_id = $1 AND library_id = $2',
                [resourceId, libraryId]
            );

            if (existingFactor.rows.length > 0) {
                this.stats.factors.existing++;
                return;
            }

            // Parse numeric values
            const emissionFactor = parseFloat(kgco2e) || 0;
            const heatContent = heat_content ? parseFloat(heat_content) : null;
            const biogenicFactor = biogenic_kgco2e ? parseFloat(biogenic_kgco2e) : null;
            const costInr = cost_inr ? parseFloat(cost_inr) : null;

            // Determine availability score based on cost and data completeness
            let availabilityScore = 5; // Default
            if (costInr && costInr > 0) {
                if (costInr <= 10) availabilityScore = 9;
                else if (costInr <= 50) availabilityScore = 8;
                else if (costInr <= 100) availabilityScore = 7;
                else availabilityScore = 6;
            }

            // Create emission factor
            await pool.query(
                `INSERT INTO emission_factors 
                (id, resource_id, library_id, emission_factor, emission_factor_unit, 
                 heat_content, heat_content_unit, approximate_cost, cost_unit, cost_inr,
                 availability_score, biogenic_emission_factor, reference_source, notes) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
                [
                    uuidv4(),
                    resourceId,
                    libraryId,
                    emissionFactor,
                    unit_name || 'kgCO2e',
                    heatContent,
                    heatContent ? 'GJ' : null,
                    costInr ? (costInr / 83).toFixed(2) : null, // Convert INR to USD
                    costInr ? 'USD' : null,
                    costInr,
                    availabilityScore,
                    biogenicFactor,
                    factor.source,
                    `Imported from CSV - ${factor.activity_type}`
                ]
            );

            this.stats.factors.created++;
        } catch (error) {
            console.error(`Error creating emission factor:`, error.message);
            this.stats.factors.errors++;
        }
    }

    async processCSV() {
        const csvPath = path.join(__dirname, '../migrations/files/ef_libraries_with_cost.csv');
        
        if (!fs.existsSync(csvPath)) {
            throw new Error(`CSV file not found: ${csvPath}`);
        }

        return new Promise((resolve, reject) => {
            const records = [];
            
            fs.createReadStream(csvPath)
                .pipe(csv())
                .on('data', (row) => {
                    records.push(row);
                })
                .on('end', async () => {
                    try {
                        console.log(`📄 Loaded ${records.length} records from CSV`);
                        console.log('🔄 Starting ingestion process...\n');

                        // Process in batches to avoid overwhelming the database
                        const batchSize = 50;
                        for (let i = 0; i < records.length; i += batchSize) {
                            const batch = records.slice(i, i + batchSize);
                            await this.processBatch(batch);
                            
                            if (i % (batchSize * 4) === 0) {
                                console.log(`✅ Processed ${Math.min(i + batchSize, records.length)}/${records.length} records`);
                            }
                        }

                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                })
                .on('error', reject);
        });
    }

    async processBatch(batch) {
        for (const row of batch) {
            try {
                // Create library
                const libraryId = await this.createLibrary({
                    source: row.source,
                    version: row.version,
                    published_year: row.published_year
                });

                // Create resource
                const resourceId = await this.createResource({
                    name: row.name,
                    scope: `scope${row.scope.split(' ')[1]}`, // "Scope 1" -> "scope1"
                    activity_type: row.activity_type,
                    is_renewable: row.is_renewable,
                    is_biofuel: row.is_biofuel,
                    is_refrigerant: row.is_refrigerant
                });

                // Create emission factor
                await this.createEmissionFactor({
                    ...row,
                    source: row.source
                }, libraryId, resourceId);

            } catch (error) {
                console.error(`Error processing row:`, error.message);
                this.stats.factors.errors++;
            }
        }
    }

    printStats() {
        console.log('\n📊 INGESTION COMPLETED - STATISTICS:');
        console.log('=====================================');
        console.log(`📚 Libraries:`);
        console.log(`   ✅ Created: ${this.stats.libraries.created}`);
        console.log(`   📋 Existing: ${this.stats.libraries.existing}`);
        console.log(`🛢️  Resources:`);
        console.log(`   ✅ Created: ${this.stats.resources.created}`);
        console.log(`   📋 Existing: ${this.stats.resources.existing}`);
        console.log(`⚡ Emission Factors:`);
        console.log(`   ✅ Created: ${this.stats.factors.created}`);
        console.log(`   📋 Existing: ${this.stats.factors.existing}`);
        console.log(`   ❌ Errors: ${this.stats.factors.errors}`);
        console.log(`\n🎯 Total New Records: ${this.stats.libraries.created + this.stats.resources.created + this.stats.factors.created}`);
    }
}

async function main() {
    const ingester = new EmissionFactorIngester();
    
    try {
        console.log('🚀 Starting Emission Factors CSV Ingestion');
        console.log('==========================================\n');
        
        // Test database connection
        await pool.query('SELECT 1');
        console.log('✅ Database connection successful\n');
        
        // Process CSV
        await ingester.processCSV();
        
        // Print statistics
        ingester.printStats();
        
        console.log('\n🎉 Ingestion process completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during ingestion:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { EmissionFactorIngester };
