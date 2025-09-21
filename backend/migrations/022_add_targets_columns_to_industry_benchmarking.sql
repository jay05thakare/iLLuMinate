-- Migration: Add Targets and Is target? columns to industry_benchmarking table
-- Created: 2025-09-21
-- Description: Add targets and is_target columns to industry_benchmarking table

-- Add targets column (JSONB to store various target values)
ALTER TABLE industry_benchmarking 
ADD COLUMN targets JSONB;

-- Add is_target column (boolean to indicate if this record represents a target)
ALTER TABLE industry_benchmarking 
ADD COLUMN is_target BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN industry_benchmarking.targets IS 'JSON object containing various target values for the organization';
COMMENT ON COLUMN industry_benchmarking.is_target IS 'Boolean flag indicating if this record represents a target rather than actual data';

-- Add index on is_target for better query performance
CREATE INDEX idx_industry_benchmarking_is_target ON industry_benchmarking(is_target);

-- Migration completion log
-- Note: Uncomment the following if migration_history table exists
/*
INSERT INTO migration_history (migration_name, applied_at, description) 
VALUES (
  '022_add_targets_columns_to_industry_benchmarking',
  CURRENT_TIMESTAMP,
  'Added targets (JSONB) and is_target (BOOLEAN) columns to industry_benchmarking table'
) ON CONFLICT (migration_name) DO NOTHING;
*/

