-- Migration: Add cost_INR column to emission_factors table
-- Created: 2024-09-21
-- Description: Add missing cost_INR column that the backend controller expects

DO $$ 
BEGIN
    -- Add cost_INR column to emission_factors table if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'emission_factors' AND column_name = 'cost_inr'
    ) THEN
        RAISE NOTICE 'Adding cost_INR column to emission_factors table...';
        
        ALTER TABLE emission_factors ADD COLUMN cost_INR DECIMAL(10,2) DEFAULT NULL;
        
        COMMENT ON COLUMN emission_factors.cost_INR IS 'Cost in Indian Rupees (INR) per unit';
        
        -- Create index for cost_INR for better query performance
        CREATE INDEX IF NOT EXISTS idx_emission_factors_cost_inr ON emission_factors(cost_INR);
        
        -- Update existing records: convert approximate_cost (USD) back to INR
        -- Using conversion rate: 1 USD = 83 INR
        UPDATE emission_factors 
        SET cost_INR = approximate_cost * 83 
        WHERE approximate_cost IS NOT NULL;
        
        RAISE NOTICE 'cost_INR column added and populated successfully';
    ELSE
        RAISE NOTICE 'cost_INR column already exists';
    END IF;
    
END $$;
