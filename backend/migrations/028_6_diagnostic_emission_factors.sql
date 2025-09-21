-- Migration: Diagnostic for emission factors insertion issues
-- Created: 2024-09-21
-- Description: Check what's preventing emission factors from being inserted

DO $$ 
DECLARE
    factor_count INTEGER;
    library_count INTEGER;
    resource_count INTEGER;
    missing_resources TEXT[];
    missing_libraries TEXT[];
BEGIN
    -- Check current counts
    SELECT COUNT(*) INTO factor_count FROM emission_factors;
    SELECT COUNT(*) INTO library_count FROM emission_factor_libraries;
    SELECT COUNT(*) INTO resource_count FROM emission_resources;
    
    RAISE NOTICE 'Current counts: % factors, % libraries, % resources', 
        factor_count, library_count, resource_count;
    
    -- Check for missing key resources that should exist
    missing_resources := ARRAY[]::TEXT[];
    
    IF NOT EXISTS (SELECT 1 FROM emission_resources WHERE resource_name = 'Natural Gas' AND scope = 'scope1') THEN
        missing_resources := array_append(missing_resources, 'Natural Gas (scope1)');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM emission_resources WHERE resource_name = 'Diesel' AND scope = 'scope1') THEN
        missing_resources := array_append(missing_resources, 'Diesel (scope1)');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM emission_resources WHERE resource_name = 'R-404A' AND scope = 'scope1') THEN
        missing_resources := array_append(missing_resources, 'R-404A (scope1)');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM emission_resources WHERE resource_name = 'Electricity supplied from grid' AND scope = 'scope2') THEN
        missing_resources := array_append(missing_resources, 'Electricity supplied from grid (scope2)');
    END IF;
    
    -- Check for missing key libraries
    missing_libraries := ARRAY[]::TEXT[];
    
    IF NOT EXISTS (SELECT 1 FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022) THEN
        missing_libraries := array_append(missing_libraries, 'GHG Protocol ar5 2022');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM emission_factor_libraries WHERE library_name = 'CEA' AND version = 'ar5' AND year = 2024) THEN
        missing_libraries := array_append(missing_libraries, 'CEA ar5 2024');
    END IF;
    
    -- Report missing items
    IF array_length(missing_resources, 1) > 0 THEN
        RAISE NOTICE 'MISSING RESOURCES: %', array_to_string(missing_resources, ', ');
    ELSE
        RAISE NOTICE 'All key resources exist';
    END IF;
    
    IF array_length(missing_libraries, 1) > 0 THEN
        RAISE NOTICE 'MISSING LIBRARIES: %', array_to_string(missing_libraries, ', ');
    ELSE
        RAISE NOTICE 'All key libraries exist';
    END IF;
    
    -- Test a simple insertion
    DECLARE
        test_resource_id UUID;
        test_library_id UUID;
        insert_result INTEGER;
    BEGIN
        -- Get IDs for test
        SELECT id INTO test_resource_id FROM emission_resources WHERE resource_name = 'Natural Gas' AND scope = 'scope1' LIMIT 1;
        SELECT id INTO test_library_id FROM emission_factor_libraries WHERE library_name = 'GHG Protocol' AND version = 'ar5' AND year = 2022 LIMIT 1;
        
        IF test_resource_id IS NOT NULL AND test_library_id IS NOT NULL THEN
            -- Try to insert a test factor
            INSERT INTO emission_factors (resource_id, library_id, emission_factor, emission_factor_unit, availability_score)
            VALUES (test_resource_id, test_library_id, 1.92448::DECIMAL(15,6), 'kgCO2e/m3', 8)
            ON CONFLICT (resource_id, library_id) DO NOTHING;
            
            GET DIAGNOSTICS insert_result = ROW_COUNT;
            RAISE NOTICE 'Test insertion result: % row(s) affected', insert_result;
            
            -- Check final count
            SELECT COUNT(*) INTO factor_count FROM emission_factors;
            RAISE NOTICE 'Final emission factors count: %', factor_count;
        ELSE
            RAISE NOTICE 'Cannot test insertion: resource_id=%, library_id=%', test_resource_id, test_library_id;
        END IF;
    END;
    
END $$;
