-- Migration: 014_audit_logs.sql
-- Description: Create audit logs table to track all admin and high-stakes user actions.

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Who performed the action
    action_type VARCHAR(50) NOT NULL,                      -- e.g., 'approve_points', 'create_event', 'verify_sprint'
    target_id UUID,                                        -- ID of the affected record
    target_type VARCHAR(50) NOT NULL,                      -- e.g., 'point_transactions', 'users', 'events'
    old_data JSONB,                                        -- Snapshot of data before change
    new_data JSONB,                                        -- Snapshot of data after change
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Protect the audit logs completely
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only Admins can view audit logs
CREATE POLICY "Admins can view audit logs"
    ON audit_logs
    FOR SELECT
    USING (public.is_admin());

-- Policy: Insertions are restricted to a security definer function to prevent tampering
-- No direct INSERT policies provided for normal roles.
