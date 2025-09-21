-- Migration: Enhance tables for CSV import
-- This migration adds missing columns and adjusts constraints for CSV data import

DO $$ 
DECLARE
    constraint_exists BOOLEAN;
BEGIN
    -- Add missing columns to emission_resources table
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'emission_resources' AND column_name = 'is_renewable'
    ) THEN
        ALTER TABLE emission_resources ADD COLUMN is_renewable BOOLEAN DEFAULT false;
        COMMENT ON COLUMN emission_resources.is_renewable IS 'Whether the resource is renewable';
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'emission_resources' AND column_name = 'is_biofuel'
    ) THEN
        ALTER TABLE emission_resources ADD COLUMN is_biofuel BOOLEAN DEFAULT false;
        COMMENT ON COLUMN emission_resources.is_biofuel IS 'Whether the resource is a biofuel';
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'emission_resources' AND column_name = 'is_refrigerant'
    ) THEN
        ALTER TABLE emission_resources ADD COLUMN is_refrigerant BOOLEAN DEFAULT false;
        COMMENT ON COLUMN emission_resources.is_refrigerant IS 'Whether the resource is a refrigerant';
    END IF;
    
    -- Add missing columns to emission_factors table
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'emission_factors' AND column_name = 'biogenic_emission_factor'
    ) THEN
        ALTER TABLE emission_factors ADD COLUMN biogenic_emission_factor DECIMAL(10,6) DEFAULT NULL;
        COMMENT ON COLUMN emission_factors.biogenic_emission_factor IS 'Biogenic emission factor (kgCO2e per unit)';
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'emission_factors' AND column_name = 'reference_source'
    ) THEN
        ALTER TABLE emission_factors ADD COLUMN reference_source TEXT DEFAULT NULL;
        COMMENT ON COLUMN emission_factors.reference_source IS 'Reference source or documentation';
    END IF;
    
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'emission_factors' AND column_name = 'notes'
    ) THEN
        ALTER TABLE emission_factors ADD COLUMN notes TEXT DEFAULT NULL;
        COMMENT ON COLUMN emission_factors.notes IS 'Additional notes or comments';
    END IF;
    
    -- Check if the problematic unique constraint exists and drop it
    SELECT EXISTS (
        SELECT FROM pg_constraint 
        WHERE conname = 'idx_emission_factors_resource_library'
    ) INTO constraint_exists;
    
    IF constraint_exists THEN
        RAISE NOTICE 'Dropping unique constraint idx_emission_factors_resource_library...';
        DROP INDEX IF EXISTS idx_emission_factors_resource_library;
        
        -- Create a new non-unique index for performance
        CREATE INDEX IF NOT EXISTS idx_emission_factors_resource_library_lookup 
        ON emission_factors(resource_id, library_id);
        
        RAISE NOTICE 'Replaced unique constraint with non-unique index for better flexibility';
    END IF;
    
    -- Create indexes for new columns
    CREATE INDEX IF NOT EXISTS idx_emission_resources_renewable ON emission_resources(is_renewable);
    CREATE INDEX IF NOT EXISTS idx_emission_resources_biofuel ON emission_resources(is_biofuel);
    CREATE INDEX IF NOT EXISTS idx_emission_resources_refrigerant ON emission_resources(is_refrigerant);
    
    -- Add resource_type as an indexed field for better categorization
    CREATE INDEX IF NOT EXISTS idx_emission_resources_type_category ON emission_resources(resource_type, category);
    
    RAISE NOTICE 'Enhanced tables for CSV import completed successfully';
    
END $$;
