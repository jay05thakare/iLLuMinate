-- Migration: Skip data migration - will use fresh seeding with new schema
-- Created: 2025-09-20
-- Description: Skip the complex data migration and use fresh seeding approach

-- Create the unique constraint for emission_data with new schema
CREATE UNIQUE INDEX IF NOT EXISTS idx_emission_data_unique_new 
ON emission_data(emission_resource_facility_config_id, month, year)
WHERE emission_resource_facility_config_id IS NOT NULL;

-- Add index for better query performance on new tables
CREATE INDEX IF NOT EXISTS idx_emission_resource_configs_org_resource_factor 
ON emission_resource_configurations(organization_id, resource_id, emission_factor_id);

-- Add comments to clarify the new schema approach
COMMENT ON TABLE emission_resource_configurations IS 'Organization-level emission factor inventory - defines which resources and emission factors an organization uses';
COMMENT ON TABLE emission_resource_facility_configurations IS 'Assignment of organization emission factor inventory to specific facilities';

-- Note: The seeding script will be updated to populate data using the new schema
-- The old facility_resources table will be deprecated but kept for backward compatibility
