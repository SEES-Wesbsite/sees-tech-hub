-- Migration: 009_drop_matric_number.sql
-- Description: Drop matric_number column as we now use Google Auth

ALTER TABLE users DROP COLUMN IF EXISTS matric_number;
