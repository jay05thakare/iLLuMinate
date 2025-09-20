-- Migration: Create migration history table
-- Created: 2024-01-15
-- Description: Creates migration tracking table for database version control

CREATE TABLE IF NOT EXISTS migration_history (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL UNIQUE,
  checksum VARCHAR(64) NOT NULL,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  execution_time_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_migration_history_filename ON migration_history(filename);
CREATE INDEX IF NOT EXISTS idx_migration_history_applied_at ON migration_history(applied_at);
