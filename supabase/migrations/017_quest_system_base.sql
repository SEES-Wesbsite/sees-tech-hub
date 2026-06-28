-- Migration: 017_quest_system_base.sql
-- Description: Rename tasks to quest_bank, evolve columns, and create quest_assignments.

-- =============================================================
-- 1. Rename tasks → quest_bank
-- =============================================================

ALTER TABLE tasks RENAME TO quest_bank;

-- =============================================================
-- 2. Evolve columns on quest_bank
-- =============================================================

-- Rename task_type → quest_type
ALTER TABLE quest_bank RENAME COLUMN task_type TO quest_type;

-- Drop the old CHECK constraint on quest_type
ALTER TABLE quest_bank DROP CONSTRAINT IF EXISTS tasks_task_type_check;

-- Migrate existing data to new quest_type values first
UPDATE quest_bank SET quest_type = 'dsa_problem' WHERE quest_type = 'dsa_sprint';
UPDATE quest_bank SET quest_type = 'project_build' WHERE quest_type = 'hackathon';
UPDATE quest_bank SET quest_type = 'project_build' WHERE quest_type = 'event_attendance';

-- Now add new CHECK with expanded quest types
ALTER TABLE quest_bank ADD CONSTRAINT quest_bank_quest_type_check
    CHECK (quest_type IN ('dsa_problem', 'quiz', 'article_read', 'project_build'));

-- Drop is_active, replace with status (CASCADE drops dependent policies)
ALTER TABLE quest_bank DROP COLUMN IF EXISTS is_active CASCADE;
ALTER TABLE quest_bank DROP COLUMN IF EXISTS deadline;

ALTER TABLE quest_bank
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' NOT NULL
        CHECK (status IN ('draft', 'active', 'archived')),
    ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS external_url TEXT,
    ADD COLUMN IF NOT EXISTS quiz_id UUID REFERENCES quizzes(id),
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);

COMMENT ON TABLE quest_bank IS 'Permanent, reusable library of quest content. DSA problems, quizzes, articles, projects.';
COMMENT ON COLUMN quest_bank.quest_type IS 'dsa_problem, quiz, article_read, project_build';
COMMENT ON COLUMN quest_bank.tags IS 'Skill tags for personalization matching against users.primary_stacks';
COMMENT ON COLUMN quest_bank.external_url IS 'LeetCode link, article URL — depends on quest_type';
COMMENT ON COLUMN quest_bank.quiz_id IS 'Only set when quest_type = quiz. Links to the in-app quiz.';
COMMENT ON COLUMN quest_bank.status IS 'draft = not visible, active = assignable, archived = soft-deleted';

-- =============================================================
-- 3. Create quest_assignments
-- =============================================================

CREATE TABLE IF NOT EXISTS quest_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quest_id UUID NOT NULL REFERENCES quest_bank(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'assigned' NOT NULL
        CHECK (status IN ('assigned', 'in_progress', 'completed', 'expired')),
    assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, quest_id, week_start)
);

COMMENT ON TABLE quest_assignments IS 'Per-user, per-week quest assignments. Powers the Weekly 3 personalization.';
COMMENT ON COLUMN quest_assignments.week_start IS 'Monday of the assignment week.';
COMMENT ON COLUMN quest_assignments.status IS 'assigned, in_progress, completed, expired';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quest_assignments_user_id ON quest_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_quest_assignments_quest_id ON quest_assignments(quest_id);
CREATE INDEX IF NOT EXISTS idx_quest_assignments_week ON quest_assignments(user_id, week_start);

-- RLS
ALTER TABLE quest_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own assignments
DROP POLICY IF EXISTS "Users can view own quest assignments" ON quest_assignments;
CREATE POLICY "Users can view own quest assignments"
    ON quest_assignments FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Admins can manage all assignments
DROP POLICY IF EXISTS "Admins can manage quest assignments" ON quest_assignments;
CREATE POLICY "Admins can manage quest assignments"
    ON quest_assignments FOR ALL
    USING (public.is_admin());
