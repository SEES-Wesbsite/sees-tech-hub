-- Migration: 022_opportunities_module.sql
-- Description: Drops unused jobs table and creates opportunities and interactions schemas for the new module

-- 1. Drop unused jobs table
DROP TABLE IF EXISTS jobs CASCADE;

-- 2. Create opportunities table
CREATE TABLE opportunities (
    -- Primary Identity
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Details
    title VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    summary VARCHAR(500) NOT NULL,
    application_url TEXT NOT NULL,
    
    -- Categorization
    opportunity_type VARCHAR(50) NOT NULL CHECK (opportunity_type IN ('job', 'internship', 'hackathon', 'scholarship', 'fellowship', 'grant', 'competition', 'bootcamp', 'event', 'other')),
    location_type VARCHAR(50) NOT NULL DEFAULT 'unspecified' CHECK (location_type IN ('remote', 'onsite', 'hybrid', 'unspecified')),
    location VARCHAR(255),
    compensation VARCHAR(255),
    
    -- Scheduling & Status
    deadline TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'pending_review' CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected', 'archived')),
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE opportunities IS 'Central hub for career and academic opportunities, populated via scraping and admin curation.';
COMMENT ON COLUMN opportunities.status IS 'pending_review indicates it was scraped and needs admin approval. draft is for manual creation.';
COMMENT ON COLUMN opportunities.summary IS 'Short, AI-generated summary of the opportunity for cards and feeds.';

-- 3. Create opportunity interactions table
CREATE TABLE opportunity_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('view', 'save', 'click_apply')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE opportunity_interactions IS 'Tracks user engagement (saves, clicks, views) to calculate CTR and personalize recommendations.';

-- Partial unique index to ensure a user can only "save" an opportunity once
CREATE UNIQUE INDEX idx_unique_opportunity_save ON opportunity_interactions (opportunity_id, user_id) WHERE interaction_type = 'save';

-- 4. Enable RLS
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_interactions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view approved opportunities
CREATE POLICY "Anyone can view approved opportunities"
    ON opportunities FOR SELECT
    USING (status = 'approved');

-- Policy: Admins have full access to opportunities
CREATE POLICY "Admins have full access to opportunities"
    ON opportunities FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Policy: Users can view their own interactions
CREATE POLICY "Users can view their own interactions"
    ON opportunity_interactions FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own interactions
CREATE POLICY "Users can insert their own interactions"
    ON opportunity_interactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own saves
CREATE POLICY "Users can delete their own interactions"
    ON opportunity_interactions FOR DELETE
    USING (auth.uid() = user_id);

-- Policy: Admins can view all interactions for analytics
CREATE POLICY "Admins can view all interactions"
    ON opportunity_interactions FOR SELECT
    USING (public.is_admin());
