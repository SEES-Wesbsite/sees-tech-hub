-- Migration: 031_hackathon_admin_workflow.sql
-- Description: Updates hackathon_submissions with portfolio and AI fields, and creates hackathon_reviews.

-- 1. Update hackathon_submissions table
ALTER TABLE public.hackathon_submissions
    ADD COLUMN IF NOT EXISTS portfolio_url VARCHAR(255),
    ADD COLUMN IF NOT EXISTS concept_note_markdown TEXT,
    ADD COLUMN IF NOT EXISTS ai_summary JSONB,
    ADD COLUMN IF NOT EXISTS total_score INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS qualification_code VARCHAR(10) UNIQUE;

-- 2. Create hackathon_reviews table
CREATE TABLE IF NOT EXISTS public.hackathon_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES public.hackathon_submissions(id) ON DELETE CASCADE,
    scores JSONB NOT NULL,
    private_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(admin_id, submission_id)
);

COMMENT ON TABLE public.hackathon_reviews IS 'Stores individual admin reviews and scores for hackathon submissions.';

-- 3. Row Level Security for hackathon_reviews
ALTER TABLE public.hackathon_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage hackathon reviews"
    ON public.hackathon_reviews
    USING (public.is_admin());

