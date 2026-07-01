-- Migration: 028_hackathon_module.sql
-- Description: Create hackathon_submissions table and storage bucket for concept notes

-- 1. Create hackathon_submissions table
CREATE TABLE IF NOT EXISTS public.hackathon_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) NOT NULL,
    project_name VARCHAR(100) NOT NULL,
    tagline VARCHAR(200) NOT NULL,
    track VARCHAR(50) NOT NULL CHECK (track IN ('software', 'ai', 'cybersecurity', 'embedded', 'other')),
    tech_stack TEXT NOT NULL,
    team_members JSONB NOT NULL,
    concept_note_url TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'finalist')),
    reviewer_notes TEXT,
    final_github_url TEXT,
    final_demo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add comments
COMMENT ON TABLE public.hackathon_submissions IS 'Stores hackathon project submissions (both concept notes and final projects).';
COMMENT ON COLUMN public.hackathon_submissions.team_members IS 'Array of objects: { name, role, email }';

-- 3. Row Level Security for hackathon_submissions
ALTER TABLE public.hackathon_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own submissions"
    ON public.hackathon_submissions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own submissions"
    ON public.hackathon_submissions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions"
    ON public.hackathon_submissions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all submissions"
    ON public.hackathon_submissions FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can update all submissions"
    ON public.hackathon_submissions FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins can delete submissions"
    ON public.hackathon_submissions FOR DELETE
    USING (public.is_admin());

-- 4. Storage Bucket for Hackathon Documents (Private)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('hackathon_documents', 'hackathon_documents', false)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage RLS Policies for hackathon_documents
-- Note: Submissions are private, so only owners and admins can access them.
CREATE POLICY "Users can upload their own hackathon documents" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'hackathon_documents' AND auth.uid() = owner);

CREATE POLICY "Users can read their own hackathon documents" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'hackathon_documents' AND auth.uid() = owner);

CREATE POLICY "Admins can read all hackathon documents" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'hackathon_documents' AND public.is_admin());

CREATE POLICY "Users can update their own hackathon documents"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'hackathon_documents' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own hackathon documents"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'hackathon_documents' AND auth.uid() = owner);
