-- Migration: Add organization_id column to emission_data table
-- Created: 2025-09-21
-- Description: Re-add organization_id column for direct organization filtering and performance optimization

DO $$ 
DECLARE
    column_exists BOOLEAN;
    total_updated INTEGER := 0;
BEGIN
    RAISE NOTICE 'Adding organization_id column to emission_data table...';
    
    -- Check if organization_id column already exists
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'emission_data'
        AND column_name = 'organization_id'
    ) INTO column_exists;
    
    IF column_exists THEN
        RAISE NOTICE 'Column organization_id already exists in emission_data table';
        RETURN;
    END IF;
    
    -- Add organization_id column
    RAISE NOTICE 'Adding organization_id column...';
    ALTER TABLE emission_data 
    ADD COLUMN organization_id UUID;
    
    -- Add comment to explain the column
    COMMENT ON COLUMN emission_data.organization_id IS 'Organization ID for direct filtering and performance optimization';
    
    -- Populate the organization_id column using the emission_resource_facility_config_id relationship
    RAISE NOTICE 'Populating organization_id from existing data...';
    UPDATE emission_data 
    SET organization_id = erfc.organization_id
    FROM emission_resource_facility_configurations erfc
    WHERE emission_data.emission_resource_facility_config_id = erfc.id;
    
    GET DIAGNOSTICS total_updated = ROW_COUNT;
    RAISE NOTICE 'Updated organization_id for % emission data records', total_updated;
    
    -- Now make the column NOT NULL since all records should have organization_id
    RAISE NOTICE 'Setting organization_id as NOT NULL...';
    ALTER TABLE emission_data ALTER COLUMN organization_id SET NOT NULL;
    
    -- Add foreign key constraint
    RAISE NOTICE 'Adding foreign key constraint...';
    ALTER TABLE emission_data 
    ADD CONSTRAINT fk_emission_data_organization 
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE CASCADE;
    
    -- Create index for performance
    RAISE NOTICE 'Creating index on organization_id...';
    CREATE INDEX IF NOT EXISTS idx_emission_data_organization_id 
    ON emission_data(organization_id);
    
    -- Create composite indexes for common query patterns
    CREATE INDEX IF NOT EXISTS idx_emission_data_org_year_month 
    ON emission_data(organization_id, year, month);
    
    CREATE INDEX IF NOT EXISTS idx_emission_data_org_scope 
    ON emission_data(organization_id, scope);
    
    -- Update table comment
    COMMENT ON TABLE emission_data IS 'Monthly emission data tracking with both config reference and direct organization access';
    
    RAISE NOTICE '✅ Successfully added organization_id column to emission_data table';
    RAISE NOTICE 'Column properties:';
    RAISE NOTICE '  - Type: UUID';
    RAISE NOTICE '  - Nullable: NO (NOT NULL)';
    RAISE NOTICE '  - Foreign Key: organizations(organization_id)';
    RAISE NOTICE '  - Indexed: YES (multiple indexes)';
    RAISE NOTICE '  - Records updated: %', total_updated;
    
END $$;
