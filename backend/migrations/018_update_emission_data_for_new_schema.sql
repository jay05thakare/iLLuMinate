-- Migration: Update emission data table for new schema
-- Created: 2025-09-20
-- Description: Update emission_data table to reference emission_resource_facility_configurations instead of facility_resources

-- First, add the new column
ALTER TABLE emission_data 
ADD COLUMN emission_resource_facility_config_id UUID;

-- Add foreign key constraint to the new column
ALTER TABLE emission_data 
ADD CONSTRAINT fk_emission_data_emission_resource_facility_config 
FOREIGN KEY (emission_resource_facility_config_id) 
REFERENCES emission_resource_facility_configurations(id) ON DELETE CASCADE;

-- Create index on the new column
CREATE INDEX IF NOT EXISTS idx_emission_data_emission_resource_facility_config_id 
ON emission_data(emission_resource_facility_config_id);

-- Update the unique constraint to use the new column
-- First drop the old constraint
DROP INDEX IF EXISTS idx_emission_data_unique;

-- Note: New unique constraint will be created after data migration in 019_migrate_data_to_new_schema.sql

-- Make the old facility_resource_id column nullable since we're using the new column
ALTER TABLE emission_data ALTER COLUMN facility_resource_id DROP NOT NULL;

-- Add comment for the new column
COMMENT ON COLUMN emission_data.emission_resource_facility_config_id IS 'Reference to emission resource facility configuration (NEW SCHEMA)';
COMMENT ON COLUMN emission_data.facility_resource_id IS 'DEPRECATED: Use emission_resource_facility_config_id instead. Now nullable for backward compatibility.';

-- NOTE: The old facility_resource_id column is kept for backward compatibility during migration
-- It should be removed in a future migration after data is migrated
