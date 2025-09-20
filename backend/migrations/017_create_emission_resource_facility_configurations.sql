-- Migration: Create emission resource facility configurations table
-- Created: 2025-09-20
-- Description: Assignment of organization's emission factor inventory resources to specific facilities

CREATE TABLE IF NOT EXISTS emission_resource_facility_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(organization_id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  emission_resource_config_id UUID NOT NULL REFERENCES emission_resource_configurations(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  assigned_by UUID REFERENCES users(id),
  assignment_notes TEXT,
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_to DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_emission_resource_facility_configs_organization_id ON emission_resource_facility_configurations(organization_id);
CREATE INDEX IF NOT EXISTS idx_emission_resource_facility_configs_facility_id ON emission_resource_facility_configurations(facility_id);
CREATE INDEX IF NOT EXISTS idx_emission_resource_facility_configs_emission_resource_config_id ON emission_resource_facility_configurations(emission_resource_config_id);
CREATE INDEX IF NOT EXISTS idx_emission_resource_facility_configs_active ON emission_resource_facility_configurations(is_active);
CREATE INDEX IF NOT EXISTS idx_emission_resource_facility_configs_effective_dates ON emission_resource_facility_configurations(effective_from, effective_to);

-- Create unique constraint for facility and emission resource configuration combination
-- (Each facility can only have one active assignment per resource configuration)
CREATE UNIQUE INDEX IF NOT EXISTS idx_emission_resource_facility_configs_unique 
  ON emission_resource_facility_configurations(facility_id, emission_resource_config_id) 
  WHERE is_active = true;

-- Create updated_at trigger
CREATE TRIGGER update_emission_resource_facility_configurations_updated_at 
  BEFORE UPDATE ON emission_resource_facility_configurations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add check constraint for effective dates
ALTER TABLE emission_resource_facility_configurations 
ADD CONSTRAINT chk_effective_dates 
CHECK (effective_to IS NULL OR effective_to >= effective_from);

-- Add comments for documentation
COMMENT ON TABLE emission_resource_facility_configurations IS 'Assignment of organization emission factor inventory to specific facilities';
COMMENT ON COLUMN emission_resource_facility_configurations.organization_id IS 'Organization that owns both the facility and resource configuration';
COMMENT ON COLUMN emission_resource_facility_configurations.facility_id IS 'Facility where this resource will be used';
COMMENT ON COLUMN emission_resource_facility_configurations.emission_resource_config_id IS 'Reference to the organization emission factor inventory configuration';
COMMENT ON COLUMN emission_resource_facility_configurations.is_active IS 'Whether this assignment is currently active';
COMMENT ON COLUMN emission_resource_facility_configurations.assigned_by IS 'User who made this assignment';
COMMENT ON COLUMN emission_resource_facility_configurations.assignment_notes IS 'Optional notes about why this resource was assigned to this facility';
COMMENT ON COLUMN emission_resource_facility_configurations.effective_from IS 'Date from which this assignment is effective';
COMMENT ON COLUMN emission_resource_facility_configurations.effective_to IS 'Date until which this assignment is effective (NULL = ongoing)';
