-- Migration: 025_opportunities_deduplication.sql
-- Description: Adds a unique constraint to application_url to handle pipeline deduplication

-- 1. Ensure any existing duplicates are removed or handled (in this case, since it's a new system, we just add the constraint. If there are duplicates, we'll delete them first based on min id)
DELETE FROM opportunities a USING (
    SELECT MIN(id::text)::uuid as min_id, application_url
    FROM opportunities 
    WHERE application_url IS NOT NULL 
    GROUP BY application_url 
    HAVING COUNT(*) > 1
) b
WHERE a.application_url = b.application_url 
AND a.id <> b.min_id;

-- 2. Add the unique constraint so `ON CONFLICT` works smoothly
ALTER TABLE opportunities
ADD CONSTRAINT opportunities_application_url_key UNIQUE (application_url);
