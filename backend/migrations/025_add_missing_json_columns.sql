-- Migration: Add missing JSON columns for initiatives and sources
-- Created: 2025-09-21
-- Description: Adds 'initiatives' and 'sources' JSONB columns to the industry_benchmarking table.

-- Add initiatives column
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'industry_benchmarking' 
        AND column_name = 'initiatives'
    ) THEN
        ALTER TABLE industry_benchmarking ADD COLUMN initiatives JSONB;
        COMMENT ON COLUMN industry_benchmarking.initiatives IS 'JSON object containing various initiatives by category for the organization';
    END IF;
END $$;

-- Add sources column
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'industry_benchmarking' 
        AND column_name = 'sources'
    ) THEN
        ALTER TABLE industry_benchmarking ADD COLUMN sources JSONB;
        COMMENT ON COLUMN industry_benchmarking.sources IS 'JSON array containing data sources and reference links for the organization';
    END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_industry_benchmarking_initiatives ON industry_benchmarking USING GIN (initiatives);
CREATE INDEX IF NOT EXISTS idx_industry_benchmarking_sources ON industry_benchmarking USING GIN (sources);

