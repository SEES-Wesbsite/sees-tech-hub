-- Migration: 034_remove_placement_quiz.sql
-- Description: Removes placement quizzes, associated points, and obsolete check constraint values for the simplified onboarding flow.

-- 1. Delete all existing placement quizzes (cascades to questions and sessions)
DELETE FROM quizzes WHERE quiz_type = 'placement';

-- 2. Wipe any legacy point transactions for the placement bonus
DELETE FROM point_transactions WHERE reason = 'Onboarding Placement Bonus';

-- 3. Update any users stuck in 'quiz_in_progress' to 'pending' before altering the constraint
UPDATE users SET onboarding_status = 'pending' WHERE onboarding_status = 'quiz_in_progress';

-- 4. Alter the onboarding_status constraint on users table
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_onboarding_status_check;
ALTER TABLE users ADD CONSTRAINT users_onboarding_status_check 
    CHECK (onboarding_status IN ('pending', 'completed'));

-- 5. Alter the quiz_type constraint on quizzes table
ALTER TABLE quizzes DROP CONSTRAINT IF EXISTS quizzes_quiz_type_check;
ALTER TABLE quizzes ADD CONSTRAINT quizzes_quiz_type_check 
    CHECK (quiz_type IN ('dsa_sprint', 'quest'));
