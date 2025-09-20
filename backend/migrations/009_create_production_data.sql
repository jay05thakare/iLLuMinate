-- Migration: Create production data table
-- Created: 2024-01-15
-- Description: Monthly cement production data tracking

CREATE TABLE IF NOT EXISTS production_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(organization_id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
  cement_production DECIMAL(15,2) NOT NULL,
  unit VARCHAR(50) NOT NULL DEFAULT 'tonnes',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_production_data_organization_id ON production_data(organization_id);
CREATE INDEX IF NOT EXISTS idx_production_data_facility_id ON production_data(facility_id);
CREATE INDEX IF NOT EXISTS idx_production_data_month_year ON production_data(month, year);
CREATE INDEX IF NOT EXISTS idx_production_data_year ON production_data(year);

-- Create unique constraint for facility, month, and year combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_production_data_unique 
  ON production_data(facility_id, month, year);

-- Create updated_at trigger for production_data
CREATE TRIGGER update_production_data_updated_at 
  BEFORE UPDATE ON production_data 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
