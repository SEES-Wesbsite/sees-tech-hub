-- Migration: 038_drop_project_tables.sql
-- Description: Permanently removes retired projects, project memberships, and project votes.

DO $retire$
BEGIN
    DROP TABLE public.project_upvotes, public.project_members, public.projects;
    DROP FUNCTION public.upvote_project(UUID);
END;
$retire$;
