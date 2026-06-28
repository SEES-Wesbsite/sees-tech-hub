-- Migration: 010_drop_verification_status.sql
-- Description: Drop verification_status column from users as verification state is no longer used

ALTER TABLE users DROP COLUMN IF EXISTS verification_status;
