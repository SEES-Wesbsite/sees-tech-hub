-- Migration: 021_add_meeting_url.sql
-- Description: Add meeting_url to events table to support online events.

ALTER TABLE events
    ADD COLUMN IF NOT EXISTS meeting_url VARCHAR(1000);

COMMENT ON COLUMN events.meeting_url IS 'Optional URL for online events (e.g. Zoom, Google Meet).';
