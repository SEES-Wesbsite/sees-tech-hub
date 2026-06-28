-- Migration: 019_atomic_quest_insertion.sql
-- Description: Expand quiz types, add pass_threshold, and create atomic insert function for AI quests.

-- 1. Evolve quizzes table
ALTER TABLE quizzes DROP CONSTRAINT IF EXISTS quizzes_quiz_type_check;

ALTER TABLE quizzes ADD CONSTRAINT quizzes_quiz_type_check 
    CHECK (quiz_type IN ('placement', 'dsa_sprint', 'quest'));

ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS pass_threshold INTEGER DEFAULT 70;

COMMENT ON COLUMN quizzes.pass_threshold IS 'Score out of 100 required to pass this quiz';

-- 2. Create atomic insertion RPC
CREATE OR REPLACE FUNCTION public.insert_quiz_quest(
    p_quest_title TEXT,
    p_quest_description TEXT,
    p_quest_type VARCHAR,
    p_difficulty VARCHAR,
    p_point_value INTEGER,
    p_tags TEXT[],
    p_external_url TEXT,
    p_created_by UUID,
    p_pass_threshold INTEGER,
    p_questions JSONB
) RETURNS UUID AS $$
DECLARE
    v_quiz_id UUID;
    v_quest_id UUID;
    v_question JSONB;
BEGIN
    -- 1. Insert Quiz
    INSERT INTO quizzes (title, quiz_type, base_time_limit, pass_threshold)
    VALUES (p_quest_title, 'quest', 0, p_pass_threshold)
    RETURNING id INTO v_quiz_id;
    
    -- 2. Insert Questions
    FOR v_question IN SELECT * FROM jsonb_array_elements(p_questions)
    LOOP
        INSERT INTO quiz_questions (quiz_id, question_text, options, correct_option_index, time_limit_seconds)
        VALUES (
            v_quiz_id, 
            v_question->>'text', 
            v_question->'options', 
            (v_question->>'correct_option_index')::INTEGER, 
            30
        );
    END LOOP;
    
    -- 3. Insert Quest (defaults to draft as it's from AI)
    INSERT INTO quest_bank (title, description, quest_type, difficulty, point_value, tags, external_url, quiz_id, created_by, status)
    VALUES (p_quest_title, p_quest_description, p_quest_type, p_difficulty, p_point_value, p_tags, p_external_url, v_quiz_id, p_created_by, 'draft')
    RETURNING id INTO v_quest_id;
    
    RETURN v_quest_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
