-- Migration: Create facility resources table
-- Created: 2024-01-15
-- Description: Configuration of emission resources for each facility

CREATE TABLE IF NOT EXISTS facility_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(organization_id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES emission_resources(id) ON DELETE CASCADE,
  emission_factor_id UUID NOT NULL REFERENCES emission_factors(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_facility_resources_organization_id ON facility_resources(organization_id);
CREATE INDEX IF NOT EXISTS idx_facility_resources_facility_id ON facility_resources(facility_id);
CREATE INDEX IF NOT EXISTS idx_facility_resources_resource_id ON facility_resources(resource_id);
CREATE INDEX IF NOT EXISTS idx_facility_resources_emission_factor_id ON facility_resources(emission_factor_id);
CREATE INDEX IF NOT EXISTS idx_facility_resources_active ON facility_resources(is_active);

-- Create unique constraint for facility and resource combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_facility_resources_facility_resource 
  ON facility_resources(facility_id, resource_id);

-- Create updated_at trigger for facility_resources
CREATE TRIGGER update_facility_resources_updated_at 
  BEFORE UPDATE ON facility_resources 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
