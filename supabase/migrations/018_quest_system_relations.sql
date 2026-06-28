-- Migration: 018_quest_system_relations.sql
-- Description: Modify submissions, quizzes, and update policies/views for quest system.

-- =============================================================
-- 4. Modify submissions
-- =============================================================

-- Add columns safely (ignore if they already exist from a previous migration)
ALTER TABLE submissions
    ADD COLUMN IF NOT EXISTS assignment_id UUID REFERENCES quest_assignments(id),
    ADD COLUMN IF NOT EXISTS quiz_session_id UUID REFERENCES quiz_sessions(id),
    ADD COLUMN IF NOT EXISTS ai_confidence_score REAL,
    ADD COLUMN IF NOT EXISTS ai_feedback TEXT;

-- Rename task_id → quest_id for clarity
-- Note: Doing this cleanly without IF EXISTS in standard PG requires a quick check,
-- but since it's a rename we'll just attempt it. If it fails it means it's already renamed.
DO $$
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='submissions' and column_name='task_id')
  THEN
      ALTER TABLE "public"."submissions" RENAME COLUMN "task_id" TO "quest_id";
  END IF;
END $$;

-- Expand status CHECK to include auto_approved
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_status_check;
ALTER TABLE submissions ADD CONSTRAINT submissions_status_check
    CHECK (status IN ('pending', 'approved', 'rejected', 'auto_approved'));

COMMENT ON COLUMN submissions.assignment_id IS 'Links to the specific weekly assignment, if applicable.';
COMMENT ON COLUMN submissions.quiz_session_id IS 'For quiz-type quests: links to the completed quiz session.';
COMMENT ON COLUMN submissions.ai_confidence_score IS 'Future: AI grader confidence score (0.0-1.0).';
COMMENT ON COLUMN submissions.ai_feedback IS 'Future: AI grader reasoning text.';

-- =============================================================
-- 5. Add pass_threshold to quizzes
-- =============================================================

ALTER TABLE quizzes
    ADD COLUMN IF NOT EXISTS pass_threshold INTEGER DEFAULT 60 NOT NULL
        CHECK (pass_threshold >= 0 AND pass_threshold <= 100);

COMMENT ON COLUMN quizzes.pass_threshold IS 'Minimum percentage score to pass the quiz (0-100). Default 60%.';

-- =============================================================
-- 6. Update RLS policies that referenced old "tasks" table
-- =============================================================

-- The old policies were created on "tasks" which is now "quest_bank".
-- The table rename might have carried them over or the DROP COLUMN cascade removed them.
-- Either way, we ensure clean slate:
DROP POLICY IF EXISTS "Anyone can view active tasks" ON quest_bank;
DROP POLICY IF EXISTS "Admins can manage tasks" ON quest_bank;
DROP POLICY IF EXISTS "Admins can view all tasks" ON quest_bank;
DROP POLICY IF EXISTS "Anyone can view active quests" ON quest_bank;
DROP POLICY IF EXISTS "Admins can manage quests" ON quest_bank;

-- Policy: Anyone can view active quests
CREATE POLICY "Anyone can view active quests"
    ON quest_bank FOR SELECT
    USING (status = 'active');

-- Policy: Admins can manage all quests
CREATE POLICY "Admins can manage quests"
    ON quest_bank FOR ALL
    USING (public.is_admin());

-- =============================================================
-- 7. Recreate community_feed view (references old "tasks" table)
-- =============================================================

CREATE OR REPLACE VIEW community_feed AS
SELECT
    s.id AS id,
    'submission' AS activity_type,
    s.user_id,
    u.full_name,
    u.avatar_url,
    'submitted a bounty' AS action_text,
    q.title AS target_name,
    s.submitted_at AS created_at
FROM submissions s
JOIN users u ON s.user_id = u.id
JOIN quest_bank q ON s.quest_id = q.id

UNION ALL

SELECT
    ea.id AS id,
    'rsvp' AS activity_type,
    ea.user_id,
    u.full_name,
    u.avatar_url,
    'RSVPed for an event' AS action_text,
    e.title AS target_name,
    ea.created_at AS created_at
FROM event_attendances ea
JOIN users u ON ea.user_id = u.id
JOIN events e ON ea.event_id = e.id
WHERE ea.rsvp_status = 'going';

COMMENT ON VIEW community_feed IS 'Live ticker of recent community actions.';
