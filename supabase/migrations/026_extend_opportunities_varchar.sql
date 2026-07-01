-- Migration: 026_extend_opportunities_varchar.sql
-- Description: Increase character limits for scraped opportunity fields to prevent truncation errors

ALTER TABLE opportunities ALTER COLUMN title TYPE VARCHAR(1000);
ALTER TABLE opportunities ALTER COLUMN organization TYPE VARCHAR(1000);
ALTER TABLE opportunities ALTER COLUMN location TYPE VARCHAR(1000);
ALTER TABLE opportunities ALTER COLUMN compensation TYPE VARCHAR(1000);
ALTER TABLE opportunities ALTER COLUMN summary TYPE TEXT;
