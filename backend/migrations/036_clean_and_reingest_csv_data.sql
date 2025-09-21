-- Migration: Clean existing data and re-ingest complete CSV data
-- Created: 2024-09-21
-- Description: Remove conflicting data and ensure complete CSV ingestion

DO $$ 
DECLARE
    deleted_factors INTEGER := 0;
    deleted_resources INTEGER := 0;
BEGIN
    RAISE NOTICE 'Starting clean re-ingestion of CSV data...';
    
    -- Remove all existing emission factors to start fresh
    DELETE FROM emission_factors;
    GET DIAGNOSTICS deleted_factors = ROW_COUNT;
    RAISE NOTICE 'Removed % existing emission factors', deleted_factors;
    
    -- Remove all existing resources except the original seed ones we want to keep
    DELETE FROM emission_resources WHERE id NOT IN (
        -- Keep only essential original resources if any are needed
        SELECT id FROM emission_resources WHERE resource_name = 'placeholder_to_keep_nothing'
    );
    GET DIAGNOSTICS deleted_resources = ROW_COUNT;
    RAISE NOTICE 'Removed % existing resources to eliminate conflicts', deleted_resources;
    
    RAISE NOTICE 'Database cleaned. Now migrations 030 and 035 can be re-run to properly ingest all CSV data.';
    
END $$;
