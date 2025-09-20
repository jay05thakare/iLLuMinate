-- Migration: Create sustainability targets table
-- Created: 2024-01-15
-- Description: Sustainability targets and goals management

CREATE TABLE IF NOT EXISTS sustainability_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(organization_id) ON DELETE CASCADE,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  target_type VARCHAR(100) NOT NULL,
  baseline_value DECIMAL(15,2) NOT NULL,
  target_value DECIMAL(15,2) NOT NULL,
  baseline_year INTEGER NOT NULL CHECK (baseline_year >= 2000 AND baseline_year <= 2100),
  target_year INTEGER NOT NULL CHECK (target_year >= 2000 AND target_year <= 2100),
  unit VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_target_year_after_baseline CHECK (target_year > baseline_year)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sustainability_targets_organization_id ON sustainability_targets(organization_id);
CREATE INDEX IF NOT EXISTS idx_sustainability_targets_facility_id ON sustainability_targets(facility_id);
CREATE INDEX IF NOT EXISTS idx_sustainability_targets_status ON sustainability_targets(status);
CREATE INDEX IF NOT EXISTS idx_sustainability_targets_target_type ON sustainability_targets(target_type);
CREATE INDEX IF NOT EXISTS idx_sustainability_targets_target_year ON sustainability_targets(target_year);
CREATE INDEX IF NOT EXISTS idx_sustainability_targets_baseline_year ON sustainability_targets(baseline_year);

-- Create updated_at trigger for sustainability_targets
CREATE TRIGGER update_sustainability_targets_updated_at 
  BEFORE UPDATE ON sustainability_targets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
