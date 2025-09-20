-- Migration: Create emission resource configurations table
-- Created: 2025-09-20
-- Description: Organization-level emission factor inventory configuration

CREATE TABLE IF NOT EXISTS emission_resource_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(organization_id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES emission_resources(id) ON DELETE CASCADE,
  emission_factor_id UUID NOT NULL REFERENCES emission_factors(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  configured_by UUID REFERENCES users(id),
  configuration_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_emission_resource_configs_organization_id ON emission_resource_configurations(organization_id);
CREATE INDEX IF NOT EXISTS idx_emission_resource_configs_resource_id ON emission_resource_configurations(resource_id);
CREATE INDEX IF NOT EXISTS idx_emission_resource_configs_emission_factor_id ON emission_resource_configurations(emission_factor_id);
CREATE INDEX IF NOT EXISTS idx_emission_resource_configs_active ON emission_resource_configurations(is_active);

-- Create unique constraint for organization and resource combination
-- (Each organization can only have one configuration per resource)
CREATE UNIQUE INDEX IF NOT EXISTS idx_emission_resource_configs_org_resource 
  ON emission_resource_configurations(organization_id, resource_id);

-- Create updated_at trigger
CREATE TRIGGER update_emission_resource_configurations_updated_at 
  BEFORE UPDATE ON emission_resource_configurations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE emission_resource_configurations IS 'Organization-level emission factor inventory - defines which resources and emission factors an organization uses';
COMMENT ON COLUMN emission_resource_configurations.organization_id IS 'Organization that configured this resource';
COMMENT ON COLUMN emission_resource_configurations.resource_id IS 'Reference to the emission resource (Coal, Natural Gas, etc.)';
COMMENT ON COLUMN emission_resource_configurations.emission_factor_id IS 'Specific emission factor chosen for this resource';
COMMENT ON COLUMN emission_resource_configurations.is_active IS 'Whether this resource configuration is currently active';
COMMENT ON COLUMN emission_resource_configurations.configured_by IS 'User who configured this resource';
COMMENT ON COLUMN emission_resource_configurations.configuration_notes IS 'Optional notes about why this resource/factor was chosen';
