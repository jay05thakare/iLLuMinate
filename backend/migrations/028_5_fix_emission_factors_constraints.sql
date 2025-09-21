-- Migration: Fix emission factors constraints and enable proper conflict resolution
-- Created: 2024-09-21
-- Description: Restore unique constraint needed for ON CONFLICT statements to work

DO $$ 
DECLARE
    constraint_exists BOOLEAN := false;
BEGIN
    RAISE NOTICE 'Fixing emission factors constraints for proper data ingestion...';
    
    -- Check if the unique constraint exists
    SELECT EXISTS (
        SELECT FROM pg_indexes 
        WHERE tablename = 'emission_factors' 
        AND indexname = 'idx_emission_factors_resource_library'
    ) INTO constraint_exists;
    
    IF NOT constraint_exists THEN
        RAISE NOTICE 'Recreating unique constraint idx_emission_factors_resource_library...';
        
        -- First, remove any duplicate combinations that might exist
        DELETE FROM emission_factors ef1 
        WHERE EXISTS (
            SELECT 1 FROM emission_factors ef2 
            WHERE ef2.resource_id = ef1.resource_id 
            AND ef2.library_id = ef1.library_id 
            AND ef2.id > ef1.id
        );
        
        -- Create the unique constraint back
        CREATE UNIQUE INDEX IF NOT EXISTS idx_emission_factors_resource_library 
        ON emission_factors(resource_id, library_id);
        
        RAISE NOTICE 'Unique constraint recreated successfully';
    ELSE
        RAISE NOTICE 'Unique constraint already exists';
    END IF;
    
    -- Ensure emission_factor column has correct precision
    -- Check current data type
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'emission_factors' 
        AND column_name = 'emission_factor' 
        AND data_type = 'numeric' 
        AND numeric_precision = 15 
        AND numeric_scale = 6
    ) THEN
        RAISE NOTICE 'Updating emission_factor column precision...';
        ALTER TABLE emission_factors 
        ALTER COLUMN emission_factor TYPE DECIMAL(15,6);
    END IF;
    
    -- Check how many emission factors we currently have
    DECLARE
        factor_count INTEGER;
        library_count INTEGER;
        resource_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO factor_count FROM emission_factors;
        SELECT COUNT(*) INTO library_count FROM emission_factor_libraries;
        SELECT COUNT(*) INTO resource_count FROM emission_resources;
        
        RAISE NOTICE 'Current state: % emission factors, % libraries, % resources', 
            factor_count, library_count, resource_count;
    END;
    
    RAISE NOTICE 'Emission factors table is now ready for data ingestion';
    
END $$;
