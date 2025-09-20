-- Migration: Create emission factors table
-- Created: 2024-01-15
-- Description: Specific emission factors from various libraries for each resource

CREATE TABLE IF NOT EXISTS emission_factors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL REFERENCES emission_resources(id) ON DELETE CASCADE,
  library_id UUID NOT NULL REFERENCES emission_factor_libraries(id) ON DELETE CASCADE,
  emission_factor DECIMAL(10,6) NOT NULL,
  emission_factor_unit VARCHAR(50) NOT NULL,
  heat_content DECIMAL(10,2) DEFAULT 0,
  heat_content_unit VARCHAR(50),
  approximate_cost DECIMAL(10,2),
  cost_unit VARCHAR(50),
  availability_score INTEGER DEFAULT 5 CHECK (availability_score >= 1 AND availability_score <= 10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_emission_factors_resource_id ON emission_factors(resource_id);
CREATE INDEX IF NOT EXISTS idx_emission_factors_library_id ON emission_factors(library_id);
CREATE INDEX IF NOT EXISTS idx_emission_factors_emission_factor ON emission_factors(emission_factor);
CREATE INDEX IF NOT EXISTS idx_emission_factors_availability_score ON emission_factors(availability_score);

-- Create unique constraint for resource and library combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_emission_factors_resource_library 
  ON emission_factors(resource_id, library_id);

-- Create updated_at trigger for emission_factors
CREATE TRIGGER update_emission_factors_updated_at 
  BEFORE UPDATE ON emission_factors 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
