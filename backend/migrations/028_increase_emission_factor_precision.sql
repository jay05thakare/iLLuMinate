-- Migration: Increase precision for emission factors to handle high-value refrigerants
-- Some refrigerants like SF6 have emission factors > 10,000, so we need larger precision

DO $$ 
BEGIN
    RAISE NOTICE 'Increasing emission factor precision to handle high-value refrigerants...';
    
    -- Increase emission_factor column precision from DECIMAL(10,6) to DECIMAL(15,6)
    ALTER TABLE emission_factors 
    ALTER COLUMN emission_factor TYPE DECIMAL(15,6);
    
    -- Also increase biogenic_emission_factor precision if needed
    ALTER TABLE emission_factors 
    ALTER COLUMN biogenic_emission_factor TYPE DECIMAL(15,6);
    
    RAISE NOTICE 'Updated emission_factors table to support values up to 999,999,999.999999';
    RAISE NOTICE 'This allows for high-value refrigerants like SF6 (24,300 kgCO2e/kg)';
    
END $$;
