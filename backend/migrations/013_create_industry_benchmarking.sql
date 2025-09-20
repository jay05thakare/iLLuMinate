-- Migration: Create industry benchmarking table
-- Created: 2024-01-15
-- Description: Industry benchmarking data warehouse for peer comparisons

CREATE TABLE IF NOT EXISTS industry_benchmarking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_name VARCHAR(255) NOT NULL,
  reporting_year INTEGER NOT NULL CHECK (reporting_year >= 2000 AND reporting_year <= 2100),
  
  -- Annual Production Data
  annual_cement_production DECIMAL(15,2) NOT NULL,
  
  -- Emission Metrics (absolute values)
  scope_1 FLOAT8,
  scope_2 FLOAT8,
  scope_3 FLOAT8,
  
  -- Water Metrics (absolute values)
  water_withdrawal FLOAT8,
  water_consumption FLOAT8,
  
  -- Waste Metrics (absolute values)
  waste_generated FLOAT8,
  
  -- Energy Metrics (absolute values)
  renewable_energy_consumption FLOAT8,
  total_energy_consumption FLOAT8,
  
  -- Financial Data
  revenue FLOAT8,
  
  -- Company Classification
  company_size VARCHAR(20) CHECK (company_size IN ('small', 'medium', 'large', 'multinational')),
  region VARCHAR(100),
  country VARCHAR(100),
  
  -- Data Source & Quality
  data_source JSONB,
  data_quality_score INTEGER CHECK (data_quality_score >= 1 AND data_quality_score <= 10),
  is_verified BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_industry_benchmarking_organization ON industry_benchmarking(organization_name);
CREATE INDEX IF NOT EXISTS idx_industry_benchmarking_year ON industry_benchmarking(reporting_year);
CREATE INDEX IF NOT EXISTS idx_industry_benchmarking_company_size ON industry_benchmarking(company_size);
CREATE INDEX IF NOT EXISTS idx_industry_benchmarking_region ON industry_benchmarking(region);
CREATE INDEX IF NOT EXISTS idx_industry_benchmarking_country ON industry_benchmarking(country);
CREATE INDEX IF NOT EXISTS idx_industry_benchmarking_verified ON industry_benchmarking(is_verified);
CREATE INDEX IF NOT EXISTS idx_industry_benchmarking_quality_score ON industry_benchmarking(data_quality_score);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_industry_benchmarking_year_region ON industry_benchmarking(reporting_year, region);
CREATE INDEX IF NOT EXISTS idx_industry_benchmarking_year_size ON industry_benchmarking(reporting_year, company_size);

-- Create unique constraint for organization and year combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_industry_benchmarking_unique 
  ON industry_benchmarking(organization_name, reporting_year);

-- Create GIN index for JSONB data source
CREATE INDEX IF NOT EXISTS idx_industry_benchmarking_data_source ON industry_benchmarking USING GIN (data_source);

-- Create updated_at trigger for industry_benchmarking
CREATE TRIGGER update_industry_benchmarking_updated_at 
  BEFORE UPDATE ON industry_benchmarking 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
