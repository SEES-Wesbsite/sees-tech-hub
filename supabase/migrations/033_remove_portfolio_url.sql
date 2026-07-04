-- Migration: 033_remove_portfolio_url.sql
-- Description: Drops the global portfolio_url column from hackathon_submissions as it has been moved to the individual team_members JSONB objects.

ALTER TABLE public.hackathon_submissions DROP COLUMN portfolio_url;
