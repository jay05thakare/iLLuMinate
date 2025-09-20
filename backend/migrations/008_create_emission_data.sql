-- Migration: Create emission data table
-- Created: 2024-01-15
-- Description: Monthly emission data tracking for facility resources

CREATE TABLE IF NOT EXISTS emission_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(organization_id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  facility_resource_id UUID NOT NULL REFERENCES facility_resources(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
  scope VARCHAR(10) NOT NULL CHECK (scope IN ('scope1', 'scope2')),
  consumption DECIMAL(15,2) NOT NULL,
  consumption_unit VARCHAR(50) NOT NULL,
  emission_factor DECIMAL(10,6) NOT NULL,
  heat_content DECIMAL(10,2) DEFAULT 0,
  total_emissions DECIMAL(15,2) NOT NULL,
  total_energy DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_emission_data_organization_id ON emission_data(organization_id);
CREATE INDEX IF NOT EXISTS idx_emission_data_facility_id ON emission_data(facility_id);
CREATE INDEX IF NOT EXISTS idx_emission_data_facility_resource_id ON emission_data(facility_resource_id);
CREATE INDEX IF NOT EXISTS idx_emission_data_month_year ON emission_data(month, year);
CREATE INDEX IF NOT EXISTS idx_emission_data_scope ON emission_data(scope);
CREATE INDEX IF NOT EXISTS idx_emission_data_year ON emission_data(year);

-- Create unique constraint for facility resource, month, and year combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_emission_data_unique 
  ON emission_data(facility_resource_id, month, year);

-- Create updated_at trigger for emission_data
CREATE TRIGGER update_emission_data_updated_at 
  BEFORE UPDATE ON emission_data 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
