-- Migration: Create benchmarking tables for organization comparison
-- Created: 2025-09-20
-- Description: Tables to store peer organization data for benchmarking

-- Create peer organizations table for benchmarking
CREATE TABLE IF NOT EXISTS peer_organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100) NOT NULL DEFAULT 'cement',
  country VARCHAR(100) NOT NULL,
  region VARCHAR(100) NOT NULL,
  sector VARCHAR(100) NOT NULL,
  basic_industry VARCHAR(100),
  is_public BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create peer organization metrics table
CREATE TABLE IF NOT EXISTS peer_organization_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  peer_organization_id UUID NOT NULL REFERENCES peer_organizations(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  -- Financial metrics
  revenue DECIMAL(15,2), -- in currency units
  revenue_currency VARCHAR(10) DEFAULT 'USD',
  -- Environmental metrics (Scope 1 & 2)
  scope1_emissions DECIMAL(15,2), -- tonnes CO2e
  scope2_emissions DECIMAL(15,2), -- tonnes CO2e
  total_emissions DECIMAL(15,2), -- tonnes CO2e
  -- Energy metrics
  total_energy_consumption DECIMAL(15,2), -- GJ
  renewable_energy_percentage DECIMAL(5,2), -- %
  -- Production metrics
  cement_production DECIMAL(15,2), -- tonnes
  -- Intensity metrics (calculated or provided)
  carbon_intensity DECIMAL(10,4), -- kgCO2e per tonne
  energy_intensity DECIMAL(10,4), -- GJ per tonne
  revenue_intensity DECIMAL(10,4), -- revenue per tonne
  -- Water and waste metrics
  water_consumption DECIMAL(15,2), -- cubic meters
  water_intensity DECIMAL(10,4), -- m3 per tonne
  waste_generated DECIMAL(15,2), -- tonnes
  waste_intensity DECIMAL(10,4), -- kg per tonne
  waste_recycled_percentage DECIMAL(5,2), -- %
  -- Alternative fuels
  alternative_fuel_rate DECIMAL(5,2), -- %
  -- Social metrics
  employee_count INTEGER,
  safety_incidents INTEGER,
  safety_rate DECIMAL(10,4), -- incidents per million hours
  -- ESG scores
  esg_score DECIMAL(5,2), -- overall ESG score (0-100)
  environmental_score DECIMAL(5,2), -- environmental pillar score
  social_score DECIMAL(5,2), -- social pillar score
  governance_score DECIMAL(5,2), -- governance pillar score
  -- Gender diversity
  gender_diversity_percentage DECIMAL(5,2), -- % women in workforce
  gender_diversity_leadership DECIMAL(5,2), -- % women in leadership
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create peer organization targets table
CREATE TABLE IF NOT EXISTS peer_organization_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  peer_organization_id UUID NOT NULL REFERENCES peer_organizations(id) ON DELETE CASCADE,
  target_name VARCHAR(255) NOT NULL,
  target_type VARCHAR(100) NOT NULL, -- 'absolute', 'intensity', 'percentage'
  metric_type VARCHAR(100) NOT NULL, -- 'scope1', 'scope2', 'total_emissions', 'energy', etc.
  baseline_value DECIMAL(15,4),
  baseline_year INTEGER,
  target_value DECIMAL(15,4),
  target_year INTEGER,
  unit VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'achieved', 'revised', 'cancelled'
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_peer_organizations_industry ON peer_organizations(industry);
CREATE INDEX IF NOT EXISTS idx_peer_organizations_country ON peer_organizations(country);
CREATE INDEX IF NOT EXISTS idx_peer_organizations_region ON peer_organizations(region);
CREATE INDEX IF NOT EXISTS idx_peer_organizations_active ON peer_organizations(is_active);

CREATE INDEX IF NOT EXISTS idx_peer_metrics_org_year ON peer_organization_metrics(peer_organization_id, year);
CREATE INDEX IF NOT EXISTS idx_peer_metrics_year ON peer_organization_metrics(year);

CREATE INDEX IF NOT EXISTS idx_peer_targets_org ON peer_organization_targets(peer_organization_id);
CREATE INDEX IF NOT EXISTS idx_peer_targets_type ON peer_organization_targets(target_type);
CREATE INDEX IF NOT EXISTS idx_peer_targets_metric ON peer_organization_targets(metric_type);

-- Create updated_at triggers
CREATE TRIGGER update_peer_organizations_updated_at 
  BEFORE UPDATE ON peer_organizations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_peer_organization_metrics_updated_at 
  BEFORE UPDATE ON peer_organization_metrics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_peer_organization_targets_updated_at 
  BEFORE UPDATE ON peer_organization_targets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add unique constraint for organization metrics per year
CREATE UNIQUE INDEX IF NOT EXISTS idx_peer_metrics_unique 
  ON peer_organization_metrics(peer_organization_id, year);

-- Add comments for documentation
COMMENT ON TABLE peer_organizations IS 'Peer organizations for benchmarking comparison';
COMMENT ON TABLE peer_organization_metrics IS 'Annual metrics data for peer organizations';
COMMENT ON TABLE peer_organization_targets IS 'Sustainability targets set by peer organizations';

COMMENT ON COLUMN peer_organization_metrics.scope1_emissions IS 'Direct emissions from owned/controlled sources (tonnes CO2e)';
COMMENT ON COLUMN peer_organization_metrics.scope2_emissions IS 'Indirect emissions from purchased energy (tonnes CO2e)';
COMMENT ON COLUMN peer_organization_metrics.carbon_intensity IS 'Total emissions per tonne of cement (kgCO2e/tonne)';
COMMENT ON COLUMN peer_organization_metrics.energy_intensity IS 'Energy consumption per tonne of cement (GJ/tonne)';
COMMENT ON COLUMN peer_organization_metrics.revenue_intensity IS 'Revenue per tonne of cement';
