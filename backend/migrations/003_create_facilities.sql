-- Migration: Create facilities table
-- Created: 2024-01-15
-- Description: Facility management table for cement production facilities

CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(organization_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_facilities_organization_id ON facilities(organization_id);
CREATE INDEX IF NOT EXISTS idx_facilities_status ON facilities(status);
CREATE INDEX IF NOT EXISTS idx_facilities_created_at ON facilities(created_at);

-- Create GIN index for JSONB location data
CREATE INDEX IF NOT EXISTS idx_facilities_location ON facilities USING GIN (location);

-- Create updated_at trigger for facilities
CREATE TRIGGER update_facilities_updated_at 
  BEFORE UPDATE ON facilities 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
