-- Migration: 039_drop_quests_and_submissions.sql
-- Description: Removes retired quests, quizzes, and empty submissions while preserving the community feed and points ledger.

-- One statement makes this atomic when pasted into the Supabase SQL Editor.
-- This BEGIN belongs to a PL/pgSQL block, not a transaction-control command.
DO $retire$
BEGIN
    -- The deletion was approved on the basis that submissions is empty.
    LOCK TABLE public.submissions IN ACCESS EXCLUSIVE MODE;
    IF EXISTS (SELECT 1 FROM public.submissions) THEN
        RAISE EXCEPTION 'submissions is no longer empty; review its new records before retiring it';
    END IF;

    -- Preserve the same view name, column order/types, and existing grants.
    -- Event activity remains; the retired submission/quest branch is removed.
    CREATE OR REPLACE VIEW public.community_feed AS
    SELECT
        ea.id AS id,
        'rsvp'::TEXT AS activity_type,
        ea.user_id,
        u.full_name,
        u.avatar_url,
        'RSVPed for an event'::TEXT AS action_text,
        e.title AS target_name,
        ea.created_at AS created_at
    FROM public.event_attendances ea
    JOIN public.users u ON ea.user_id = u.id
    JOIN public.events e ON ea.event_id = e.id
    WHERE ea.rsvp_status = 'going';

    COMMENT ON VIEW public.community_feed IS 'Community event activity; retired quest submissions are no longer included.';

    -- Keep all ledger rows and column values. Only the obsolete FK is removed.
    ALTER TABLE public.point_transactions DROP CONSTRAINT point_transactions_submission_id_fkey;

    DROP TABLE
        public.submissions,
        public.quest_assignments,
        public.quest_bank,
        public.quiz_questions,
        public.quiz_sessions,
        public.quizzes;

    DROP FUNCTION public.insert_quiz_quest(
        TEXT, TEXT, VARCHAR, VARCHAR, INTEGER, TEXT[], TEXT, UUID, INTEGER, JSONB
    );
END;
$retire$;
