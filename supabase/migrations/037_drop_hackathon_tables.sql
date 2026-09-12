-- Migration: 037_drop_hackathon_tables.sql
-- Description: Permanently removes hackathon reviews and applications; preserves users and storage files.

-- Drop both tables in one statement. Their owned policies, indexes, and triggers
-- are removed with them. No CASCADE: unexpected external dependencies must stop us.
DO $retire$
BEGIN
    DROP TABLE public.hackathon_reviews, public.hackathon_submissions;
    DROP FUNCTION public.update_submission_total_score();
END;
$retire$;
