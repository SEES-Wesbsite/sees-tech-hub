-- Migration: 013_update_events_schema.sql
-- Description: Add event types and claim expiry for live point claims.

-- Allowed types: 'hackathon', 'alumni_talk', 'dsa_sprint', 'general', 'other'
ALTER TABLE events 
    ADD COLUMN IF NOT EXISTS event_type VARCHAR(50) DEFAULT 'general' CHECK (event_type IN ('hackathon', 'alumni_talk', 'dsa_sprint', 'general', 'other')),
    ADD COLUMN IF NOT EXISTS claim_expires_at TIMESTAMPTZ;

-- Comment for developer reference
COMMENT ON COLUMN events.claim_expires_at IS 'If set, users can claim points for attending this event until this timestamp.';
