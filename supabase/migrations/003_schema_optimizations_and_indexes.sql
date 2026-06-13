-- Migration: 003_schema_optimizations_and_indexes.sql
-- Description: Indexes for foreign keys, Admin RLS policies, junction tables, and ON DELETE CASCADE fixes.

-- 1. Foreign Key Performance Indexes (Critical for scaling to 500+ users)
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_task_id ON submissions(task_id);
CREATE INDEX idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX idx_point_transactions_submission_id ON point_transactions(submission_id);

-- 2. ON DELETE CASCADE Fixes
-- Prevents foreign key errors if a user is deleted from Supabase Auth
ALTER TABLE users DROP CONSTRAINT users_id_fkey;
ALTER TABLE users ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE submissions DROP CONSTRAINT submissions_user_id_fkey;
ALTER TABLE submissions ADD CONSTRAINT submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE point_transactions DROP CONSTRAINT point_transactions_user_id_fkey;
ALTER TABLE point_transactions ADD CONSTRAINT point_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 3. Missing Junction Tables (For Events and Projects)
CREATE TABLE event_attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rsvp_status VARCHAR(20) DEFAULT 'going' CHECK (rsvp_status IN ('going', 'maybe', 'declined')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(event_id, user_id)
);

COMMENT ON TABLE event_attendances IS 'Tracks user RSVPs and attendances for STH events.';

CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'contributor',
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(project_id, user_id)
);

COMMENT ON TABLE project_members IS 'Tracks which users are contributing to which STH projects.';

-- Enable RLS for new tables
ALTER TABLE event_attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own RSVPs" ON event_attendances FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view project members" ON project_members FOR SELECT USING (true);
CREATE POLICY "Users can join open projects" ON project_members FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Missing Admin RLS Policies (Critical Blocker for the UI)
-- Currently, admins cannot insert tasks, events, jobs, or projects via the API/UI.

-- Tasks
CREATE POLICY "Admins can manage tasks" ON tasks FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can view all tasks" ON tasks FOR SELECT USING (public.is_admin());

-- Submissions
CREATE POLICY "Admins can manage submissions" ON submissions FOR ALL USING (public.is_admin());

-- Point Transactions
CREATE POLICY "Admins can insert point transactions" ON point_transactions FOR INSERT WITH CHECK (public.is_admin());

-- Events, Projects, Jobs
CREATE POLICY "Admins can manage events" ON events FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage projects" ON projects FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage jobs" ON jobs FOR ALL USING (public.is_admin());

-- Users
CREATE POLICY "Admins can update all users" ON users FOR UPDATE USING (public.is_admin());

-- 5. Trigger Optimization
-- Calculating SUM() over thousands of transactions is an O(N) scan.
-- We replace the trigger with a scalable incremental approach.
CREATE OR REPLACE FUNCTION public.update_user_total_points()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.users SET total_points = total_points + NEW.amount WHERE id = NEW.user_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.users SET total_points = total_points - OLD.amount WHERE id = OLD.user_id;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE public.users SET total_points = total_points - OLD.amount + NEW.amount WHERE id = NEW.user_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
