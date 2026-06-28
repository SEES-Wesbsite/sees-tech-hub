-- Migration: 016_quiz_session_randomization.sql
-- Description: Adds category to questions and an array of locked question_ids to sessions for true randomization.

-- 1. Add category to questions so we can do Stack-Targeted random fetches
ALTER TABLE quiz_questions 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'dsa' NOT NULL;

-- 2. Add question_ids array to sessions to lock in the 10 random questions per run
ALTER TABLE quiz_sessions 
ADD COLUMN IF NOT EXISTS question_ids UUID[] DEFAULT '{}'::UUID[] NOT NULL;

-- 3. Update existing questions to have the correct category (default to 'dsa')
-- We can leave the defaults as is since we're about to run the premium seed script anyway.
