-- Migration: 024_community_submissions_rls.sql
-- Description: Allow authenticated users to insert opportunities for community submission

-- Policy: Users can submit opportunities pending review
CREATE POLICY "Users can submit opportunities"
    ON opportunities FOR INSERT
    WITH CHECK (
        auth.uid() = created_by 
        AND status = 'pending_review'
    );
    
-- Policy: Users can view their own submissions regardless of status
CREATE POLICY "Users can view their own submissions"
    ON opportunities FOR SELECT
    USING (auth.uid() = created_by);
