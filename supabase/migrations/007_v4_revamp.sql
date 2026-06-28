-- Migration: 007_v4_revamp.sql
-- Description: Updates the schema for the V4 architecture (Onboarding & S-E Ranks)

-- 1. Add onboarding columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS known_skills TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS learning_skills TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS portfolio_link VARCHAR(1024);
ALTER TABLE users ADD COLUMN IF NOT EXISTS social_link VARCHAR(1024);

-- 2. Add ranks to use the new S, A, B, C, D, E system.
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS difficulty VARCHAR(2) DEFAULT 'E' CHECK (difficulty IN ('S', 'A', 'B', 'C', 'D', 'E'));

ALTER TABLE users ADD COLUMN IF NOT EXISTS tier VARCHAR(2) DEFAULT 'E' CHECK (tier IN ('S', 'A', 'B', 'C', 'D', 'E'));

-- 3. Cleanup unused tables
-- We don't drop projects or jobs yet to prevent data loss, 
-- but we could if we are absolutely sure. 
-- For now, we leave them dormant as requested in Phase 1 (teardown of routes, not DB).
