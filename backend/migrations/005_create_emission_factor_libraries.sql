-- Migration: Create emission factor libraries table
-- Created: 2024-01-15
-- Description: Emission factor libraries (DEFRA, EPA, IPCC, etc.)

CREATE TABLE IF NOT EXISTS emission_factor_libraries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  library_name VARCHAR(255) NOT NULL,
  version VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  region VARCHAR(100) DEFAULT 'Global',
  description TEXT,
  source_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_emission_factor_libraries_active ON emission_factor_libraries(is_active);
CREATE INDEX IF NOT EXISTS idx_emission_factor_libraries_year ON emission_factor_libraries(year);
CREATE INDEX IF NOT EXISTS idx_emission_factor_libraries_region ON emission_factor_libraries(region);

-- Create unique constraint for library name, version, and year combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_emission_factor_libraries_unique 
  ON emission_factor_libraries(library_name, version, year);

-- Create updated_at trigger for emission_factor_libraries
CREATE TRIGGER update_emission_factor_libraries_updated_at 
  BEFORE UPDATE ON emission_factor_libraries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
