-- Migration: Drop benchmarking tables
-- Created: 2025-09-21
-- Description: Remove peer organization tables used for benchmarking

-- Drop tables in reverse dependency order to avoid foreign key constraint issues

-- Step 1: Drop peer_organization_targets first (has foreign key to peer_organizations)
DROP TABLE IF EXISTS peer_organization_targets CASCADE;

-- Step 2: Drop peer_organization_metrics (has foreign key to peer_organizations)
DROP TABLE IF EXISTS peer_organization_metrics CASCADE;

-- Step 3: Drop peer_organizations (parent table)
DROP TABLE IF EXISTS peer_organizations CASCADE;

-- Add comment for documentation
COMMENT ON SCHEMA public IS 'Benchmarking tables (peer_organizations, peer_organization_metrics, peer_organization_targets) have been removed';

-- Migration completion log
-- Note: Uncomment the following if migration_history table exists
/*
INSERT INTO migration_history (migration_name, applied_at, description) 
VALUES (
  '021_drop_benchmarking_tables',
  CURRENT_TIMESTAMP,
  'Removed benchmarking tables: peer_organizations, peer_organization_metrics, peer_organization_targets'
) ON CONFLICT (migration_name) DO NOTHING;
*/

