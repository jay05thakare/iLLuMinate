-- Migration: Clean up deprecated columns from emission_data table
-- Created: 2025-09-21
-- Description: Remove unnecessary columns after migration to new schema

-- Step 1: Drop indexes on columns that will be removed
-- These indexes are no longer needed since we're using emission_resource_facility_config_id

DROP INDEX IF EXISTS idx_emission_data_organization_id;
DROP INDEX IF EXISTS idx_emission_data_facility_id;
DROP INDEX IF EXISTS idx_emission_data_facility_resource_id;

-- Step 2: Drop foreign key constraints related to columns being removed

-- Drop the facility_id foreign key constraint
ALTER TABLE emission_data DROP CONSTRAINT IF EXISTS emission_data_facility_id_fkey;

-- Drop the organization_id foreign key constraint  
ALTER TABLE emission_data DROP CONSTRAINT IF EXISTS emission_data_organization_id_fkey;

-- Drop the facility_resource_id foreign key constraint
ALTER TABLE emission_data DROP CONSTRAINT IF EXISTS emission_data_facility_resource_id_fkey;

-- Step 3: Create new unique constraint using the new schema
-- This replaces the old constraint that used facility_resource_id

CREATE UNIQUE INDEX IF NOT EXISTS idx_emission_data_unique_new_schema 
  ON emission_data(emission_resource_facility_config_id, month, year);

-- Step 4: Remove deprecated columns
-- These columns are no longer needed with the new schema

-- Remove facility_resource_id (old schema reference)
ALTER TABLE emission_data DROP COLUMN IF EXISTS facility_resource_id;

-- Remove facility_id (redundant - available via emission_resource_facility_config_id -> facility_id)
ALTER TABLE emission_data DROP COLUMN IF EXISTS facility_id;

-- Remove organization_id (redundant - available via emission_resource_facility_config_id -> organization_id)
ALTER TABLE emission_data DROP COLUMN IF EXISTS organization_id;

-- Step 5: Add comments for documentation
COMMENT ON TABLE emission_data IS 'Monthly emission data tracking using new schema with emission_resource_facility_configurations';
COMMENT ON COLUMN emission_data.emission_resource_facility_config_id IS 'Reference to emission resource facility configuration (primary relationship)';

-- Step 6: Update any remaining constraints to ensure data integrity
-- Make sure the emission_resource_facility_config_id is NOT NULL since it's now the primary reference
ALTER TABLE emission_data ALTER COLUMN emission_resource_facility_config_id SET NOT NULL;

-- Add check constraint to ensure positive values for consumption and emissions
ALTER TABLE emission_data ADD CONSTRAINT chk_emission_data_positive_consumption 
  CHECK (consumption >= 0);

ALTER TABLE emission_data ADD CONSTRAINT chk_emission_data_positive_emissions 
  CHECK (total_emissions >= 0);

ALTER TABLE emission_data ADD CONSTRAINT chk_emission_data_positive_energy 
  CHECK (total_energy >= 0);

-- Step 7: Create optimized indexes for the cleaned up table
-- These indexes will improve query performance with the new schema

-- Index for filtering by facility (via config relationship)
CREATE INDEX IF NOT EXISTS idx_emission_data_config_facility 
  ON emission_data(emission_resource_facility_config_id);

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_emission_data_date 
  ON emission_data(year, month);

-- Index for scope-based filtering
CREATE INDEX IF NOT EXISTS idx_emission_data_scope 
  ON emission_data(scope);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_emission_data_config_date_scope 
  ON emission_data(emission_resource_facility_config_id, year, month, scope);

-- Migration completion log
-- Note: Uncomment the following if migration_history table exists
/*
INSERT INTO migration_history (migration_name, applied_at, description) 
VALUES (
  '019_cleanup_emission_data_deprecated_columns',
  CURRENT_TIMESTAMP,
  'Removed deprecated columns (facility_resource_id, facility_id, organization_id) from emission_data table after new schema migration'
) ON CONFLICT (migration_name) DO NOTHING;
*/

-- Final verification query (commented out, can be run manually for verification)
/*
SELECT 
  COUNT(*) as total_records,
  COUNT(DISTINCT emission_resource_facility_config_id) as unique_configs,
  MIN(year) as earliest_year,
  MAX(year) as latest_year
FROM emission_data;
*/
