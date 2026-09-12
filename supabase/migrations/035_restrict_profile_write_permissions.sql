-- Migration: 035_restrict_profile_write_permissions.sql
-- Description: Restricts browser profile writes to editable fields without changing any stored data.

-- RLS scopes rows, but does not prevent a member from updating their own role.
-- Registration already creates profiles through the auth.users trigger (030).
REVOKE INSERT, UPDATE ON TABLE users FROM PUBLIC, anon, authenticated;
REVOKE UPDATE (id, role, total_points, created_at)
    ON TABLE users FROM PUBLIC, anon, authenticated;
REVOKE INSERT (
    id, full_name, preferred_name, avatar_url, github_url, portfolio_link,
    social_link, primary_stacks, onboarding_status, role, total_points, created_at
) ON TABLE users FROM PUBLIC, anon, authenticated;
GRANT UPDATE (
    full_name,
    preferred_name,
    avatar_url,
    github_url,
    portfolio_link,
    social_link,
    primary_stacks,
    onboarding_status
) ON TABLE users TO authenticated;

-- Existing SELECT grants, RLS policies, service-role access, and all historical
-- tables, views, functions, triggers, buckets, and profile values are retained.
