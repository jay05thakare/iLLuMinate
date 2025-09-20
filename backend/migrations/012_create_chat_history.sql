-- Migration: Create chat history table
-- Created: 2024-01-15
-- Description: Chat history for Cement GPT conversations

CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(organization_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
  session_id UUID NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('user', 'assistant')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_history_organization_id ON chat_history(organization_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_facility_id ON chat_history(facility_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_session_id ON chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_message_type ON chat_history(message_type);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at);

-- Create composite index for session-based queries
CREATE INDEX IF NOT EXISTS idx_chat_history_session_created ON chat_history(session_id, created_at);
