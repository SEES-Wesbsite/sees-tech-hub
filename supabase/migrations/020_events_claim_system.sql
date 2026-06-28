-- Migration: 020_events_claim_system.sql
-- Description: Add claim logic to events and event_attendances

ALTER TABLE events
    ADD COLUMN IF NOT EXISTS claim_code VARCHAR(20),
    ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'upcoming' NOT NULL
        CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled'));

ALTER TABLE event_attendances
    ADD COLUMN IF NOT EXISTS points_claimed BOOLEAN DEFAULT FALSE NOT NULL,
    ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

COMMENT ON COLUMN events.claim_code IS 'Short alphanumeric code displayed at live events. Users enter this to prove attendance and claim points.';
COMMENT ON COLUMN events.status IS 'upcoming = future event, live = happening now (claims open), completed = past, cancelled = voided';
COMMENT ON COLUMN event_attendances.points_claimed IS 'Whether the user has claimed their attendance points for this event.';
