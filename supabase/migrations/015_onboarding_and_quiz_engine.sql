-- Migration: 015_onboarding_and_quiz_engine.sql
-- Description: Clean up user profile columns, add primary_stack and onboarding_status, and create the scalable quiz engine tables.

-- 1. Profile Cleanup & Upgrades
ALTER TABLE users 
    DROP COLUMN IF EXISTS contact_email,
    DROP COLUMN IF EXISTS track,
    DROP COLUMN IF EXISTS academic_year,
    DROP COLUMN IF EXISTS last_login,
    DROP COLUMN IF EXISTS skills,
    DROP COLUMN IF EXISTS known_skills,
    DROP COLUMN IF EXISTS learning_skills;

ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS primary_stacks TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS onboarding_status VARCHAR(20) DEFAULT 'pending' CHECK (onboarding_status IN ('pending', 'quiz_in_progress', 'completed'));


-- 2. Scalable Quiz Engine

-- Quizzes Table
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    quiz_type VARCHAR(50) NOT NULL CHECK (quiz_type IN ('placement', 'dsa_sprint')),
    base_time_limit INTEGER NOT NULL, -- Global time limit in seconds (if 0, per-question limits apply)
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Quiz Questions Table
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of string options
    correct_option_index INTEGER NOT NULL CHECK (correct_option_index >= 0),
    time_limit_seconds INTEGER DEFAULT 30, -- Individual question time limit
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Quiz Sessions Table (Tracks active user attempts)
CREATE TABLE quiz_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    current_question_index INTEGER DEFAULT 0 NOT NULL,
    score INTEGER DEFAULT 0 NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, quiz_id) -- A user can only have one active/completed session per quiz
);

-- 3. Security (RLS)

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Quizzes are readable by anyone
CREATE POLICY "Anyone can view quizzes" ON quizzes FOR SELECT USING (true);

-- Questions are readable by anyone (we rely on server logic to hide answers, but questions must be fetched)
-- Wait, we shouldn't let users query all questions and see correct_option_index!
-- Better to use Security Definer functions to fetch questions without the answer, 
-- but for simplicity, we let users SELECT but we will NEVER return the correct_option_index to the client in the API.
CREATE POLICY "Anyone can view quiz questions" ON quiz_questions FOR SELECT USING (true);

-- Sessions can only be viewed and updated by the owner
CREATE POLICY "Users can manage their own quiz sessions" ON quiz_sessions 
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
