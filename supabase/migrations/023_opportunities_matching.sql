-- Migration: 023_opportunities_matching.sql
-- Description: Creates the Postgres RPC function for personalized opportunity recommendations

CREATE OR REPLACE FUNCTION get_recommended_opportunities(p_user_id UUID, p_limit INT DEFAULT 10)
RETURNS SETOF opportunities AS $$
DECLARE
    user_stacks TEXT[];
BEGIN
    -- Fetch the user's stacks into the variable
    SELECT primary_stacks INTO user_stacks 
    FROM users 
    WHERE id = p_user_id;

    -- If user has no stacks, just return the most recent featured/approved opportunities
    IF user_stacks IS NULL OR array_length(user_stacks, 1) IS NULL THEN
        RETURN QUERY 
        SELECT * FROM opportunities
        WHERE status = 'approved'
        ORDER BY featured DESC, published_at DESC
        LIMIT p_limit;
        RETURN;
    END IF;

    -- Otherwise, calculate match score based on overlapping tags and featured status
    RETURN QUERY 
    SELECT o.* 
    FROM opportunities o
    WHERE o.status = 'approved'
    ORDER BY 
        (
            -- Number of overlapping tags between opportunity.tags and user.primary_stacks
            (SELECT COUNT(*) 
             FROM unnest(o.tags) AS t1 
             JOIN unnest(user_stacks) AS t2 ON lower(t1) = lower(t2)
            ) * 2 
            + 
            -- Featured bonus
            CASE WHEN o.featured THEN 5 ELSE 0 END
        ) DESC,
        o.published_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_recommended_opportunities IS 'Returns personalized opportunities based on user primary_stacks overlapping with opportunity tags.';
