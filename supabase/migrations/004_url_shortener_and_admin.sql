-- Migration: 004_url_shortener_and_admin.sql
-- Description: Adds the URL shortener table and AI verification status to submissions.

-- 1. URL Shortener Table
CREATE TABLE short_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(50) UNIQUE NOT NULL,
    destination_url TEXT NOT NULL,
    clicks INTEGER DEFAULT 0 NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE short_links IS 'Internal URL shortener for STH events, DSA sprints, and forms.';

ALTER TABLE short_links ENABLE ROW LEVEL SECURITY;

-- Anyone can read active short links to be redirected
CREATE POLICY "Anyone can read active short links" 
    ON short_links FOR SELECT 
    USING (is_active = true);

-- Only admins can manage short links
CREATE POLICY "Admins can manage short links" 
    ON short_links FOR ALL 
    USING (public.is_admin());

-- 2. Add AI Verification fields to Submissions
-- We want the AI to pre-screen task proofs (e.g. LeetCode screenshots).
ALTER TABLE submissions 
    ADD COLUMN ai_confidence_score INTEGER CHECK (ai_confidence_score BETWEEN 0 AND 100),
    ADD COLUMN ai_feedback TEXT;

COMMENT ON COLUMN submissions.ai_confidence_score IS 'Gemini AI confidence score (0-100) that the proof is valid.';
COMMENT ON COLUMN submissions.ai_feedback IS 'Reasoning from the AI regarding the proof validity.';

-- 3. Add App Settings Table for Admin Superpowers
CREATE TABLE app_settings (
    key VARCHAR(50) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_by UUID REFERENCES public.users(id)
);

COMMENT ON TABLE app_settings IS 'Global platform settings managed by admins (e.g., maintenance mode).';

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read app settings" 
    ON app_settings FOR SELECT 
    USING (true);

CREATE POLICY "Admins can manage app settings" 
    ON app_settings FOR ALL 
    USING (public.is_admin());

-- Insert default settings
INSERT INTO app_settings (key, value) VALUES ('maintenance_mode', 'false'::jsonb);
