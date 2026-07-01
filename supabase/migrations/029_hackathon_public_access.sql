-- Migration: 029_hackathon_public_access.sql
-- Description: Make user_id optional in hackathon_submissions to allow public unauthenticated submissions

-- Drop the NOT NULL constraint on user_id
ALTER TABLE public.hackathon_submissions ALTER COLUMN user_id DROP NOT NULL;

-- Note: Since the admin client (Service Role key) will be used for inserts and storage uploads, 
-- we do not need to alter RLS policies to allow anonymous inserts.
-- The Service Role bypasses RLS for the hackathon_submissions table and hackathon_documents storage bucket.
