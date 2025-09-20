-- Migration: Create AI recommendations table
-- Created: 2024-01-15
-- Description: AI-generated recommendations and insights storage

CREATE TABLE IF NOT EXISTS ai_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(organization_id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  recommendation_type VARCHAR(100) NOT NULL,
  input_parameters JSONB,
  recommendations JSONB NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_organization_id ON ai_recommendations(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_facility_id ON ai_recommendations(facility_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_type ON ai_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_created_at ON ai_recommendations(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_expires_at ON ai_recommendations(expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_confidence_score ON ai_recommendations(confidence_score);

-- Create GIN indexes for JSONB data
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_input_parameters ON ai_recommendations USING GIN (input_parameters);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_recommendations ON ai_recommendations USING GIN (recommendations);
