-- Migration: Create emission resources table
-- Created: 2024-01-15
-- Description: Master list of emission resources (fuels, electricity, etc.)

CREATE TABLE IF NOT EXISTS emission_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_name VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  scope VARCHAR(10) NOT NULL CHECK (scope IN ('scope1', 'scope2')),
  is_alternative_fuel BOOLEAN DEFAULT false,
  is_calculator BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_emission_resources_scope ON emission_resources(scope);
CREATE INDEX IF NOT EXISTS idx_emission_resources_category ON emission_resources(category);
CREATE INDEX IF NOT EXISTS idx_emission_resources_type ON emission_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_emission_resources_alternative_fuel ON emission_resources(is_alternative_fuel);
CREATE INDEX IF NOT EXISTS idx_emission_resources_calculator ON emission_resources(is_calculator);

-- Create unique constraint for resource name and scope combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_emission_resources_name_scope 
  ON emission_resources(resource_name, scope);

-- Create updated_at trigger for emission_resources
CREATE TRIGGER update_emission_resources_updated_at 
  BEFORE UPDATE ON emission_resources 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
