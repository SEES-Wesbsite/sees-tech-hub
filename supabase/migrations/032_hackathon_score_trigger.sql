-- Migration: 032_hackathon_score_trigger.sql
-- Description: Adds a database trigger to atomically calculate and update the total_score on hackathon_submissions whenever a review is inserted or updated. This prevents race conditions from Node.js in-memory aggregations.

CREATE OR REPLACE FUNCTION public.update_submission_total_score()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.hackathon_submissions
    SET total_score = (
        SELECT COALESCE(SUM(
            COALESCE((scores->>'feasibility')::numeric, 0) + 
            COALESCE((scores->>'impact')::numeric, 0) + 
            COALESCE((scores->>'innovation')::numeric, 0)
        ), 0)
        FROM public.hackathon_reviews
        WHERE submission_id = COALESCE(NEW.submission_id, OLD.submission_id)
    )
    WHERE id = COALESCE(NEW.submission_id, OLD.submission_id);

    RETURN NULL; -- AFTER trigger can return NULL
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_hackathon_reviews_score ON public.hackathon_reviews;

CREATE TRIGGER tr_hackathon_reviews_score
AFTER INSERT OR UPDATE OR DELETE ON public.hackathon_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_submission_total_score();
