-- Migration: 006_v2_architecture_upgrades.sql
-- Description: Adds Views for Heatmap/Feed, and updates Projects table for V2 MVP.

-- 1. Activity Heatmap View
CREATE OR REPLACE VIEW activity_heatmap AS
SELECT 
    user_id,
    DATE(created_at) as activity_date,
    COUNT(*) as activity_count
FROM (
    SELECT user_id, submitted_at as created_at FROM submissions
    UNION ALL
    SELECT user_id, created_at FROM point_transactions
) activities
GROUP BY user_id, DATE(created_at);

COMMENT ON VIEW activity_heatmap IS 'Aggregates user activity (submissions and points) by date for GitHub-style heatmap.';

-- 2. Community Feed View
CREATE OR REPLACE VIEW community_feed AS
SELECT 
    s.id as id,
    'submission' as activity_type,
    s.user_id,
    u.full_name,
    u.avatar_url,
    'submitted a bounty' as action_text,
    t.title as target_name,
    s.submitted_at as created_at
FROM submissions s
JOIN users u ON s.user_id = u.id
JOIN tasks t ON s.task_id = t.id

UNION ALL

SELECT 
    ea.id as id,
    'rsvp' as activity_type,
    ea.user_id,
    u.full_name,
    u.avatar_url,
    'RSVPed for an event' as action_text,
    e.title as target_name,
    ea.created_at as created_at
FROM event_attendances ea
JOIN users u ON ea.user_id = u.id
JOIN events e ON ea.event_id = e.id
WHERE ea.rsvp_status = 'going';

COMMENT ON VIEW community_feed IS 'Live ticker of recent community actions.';

-- 3. Projects Table Modifications
ALTER TABLE projects ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS open_roles TEXT[] DEFAULT '{}'::TEXT[];

CREATE TABLE IF NOT EXISTS project_upvotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(project_id, user_id)
);

COMMENT ON TABLE project_upvotes IS 'Tracks which users upvoted which projects to prevent double-voting.';

ALTER TABLE project_upvotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own upvotes" ON project_upvotes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view upvotes" ON project_upvotes FOR SELECT USING (true);

-- 4. RPC for Upvoting
CREATE OR REPLACE FUNCTION public.upvote_project(p_id UUID)
RETURNS void AS $$
BEGIN
    -- This will fail if the user already upvoted due to the UNIQUE constraint
    INSERT INTO project_upvotes (project_id, user_id) VALUES (p_id, auth.uid());
    UPDATE projects SET upvotes = upvotes + 1 WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
