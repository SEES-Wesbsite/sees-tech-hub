-- Migration: 011_enable_realtime.sql
-- Description: Enable Supabase Realtime for submissions to support the Live Pulse feed
-- Try to create the publication if it doesn't exist (Supabase creates it by default, but just in case)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
    END IF;
END $$;

-- Add tables to the publication
ALTER PUBLICATION supabase_realtime ADD TABLE submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE point_transactions;
