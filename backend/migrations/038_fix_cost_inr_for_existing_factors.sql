-- Migration: Fix cost_INR for existing emission factors
-- Created: 2024-09-21
-- Description: Populate cost_INR column for existing factors and update migration process

DO $$ 
DECLARE
    updated_count INTEGER;
BEGIN
    RAISE NOTICE 'Updating cost_INR for existing emission factors...';
    
    -- Update existing factors: convert approximate_cost (USD) to cost_INR
    -- Using conversion rate: 1 USD = 83 INR
    UPDATE emission_factors 
    SET cost_INR = approximate_cost * 83 
    WHERE approximate_cost IS NOT NULL AND cost_INR IS NULL;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated cost_INR for % emission factors', updated_count;
    
    -- Also update the existing factors with proper cost data based on the CSV values
    -- We'll regenerate the complete migration with cost_INR included
    
END $$;
