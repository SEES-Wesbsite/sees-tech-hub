-- Migration: 042_short_link_analytics.sql
-- Description: Resolve public links with atomic daily visit and onward-request counters, without visitor identifiers.

CREATE TABLE short_link_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    link_id UUID NOT NULL REFERENCES short_links(id) ON DELETE RESTRICT,
    day DATE NOT NULL,
    visits BIGINT NOT NULL DEFAULT 0 CHECK (visits >= 0),
    clicks BIGINT NOT NULL DEFAULT 0 CHECK (clicks >= 0),
    UNIQUE (link_id, day)
);
COMMENT ON TABLE short_link_daily IS 'Request counts grouped by Africa/Lagos calendar day. Includes automated traffic; no IPs, cookies, or unique-person tracking.';
ALTER TABLE short_link_daily ENABLE ROW LEVEL SECURITY;
-- Policy: Only approved executives can view aggregate analytics.
CREATE POLICY "Executives read daily analytics" ON short_link_daily FOR SELECT TO authenticated USING (public.is_admin());
REVOKE ALL ON short_link_daily FROM anon, authenticated;
GRANT SELECT ON short_link_daily TO authenticated;

CREATE FUNCTION public.resolve_short_link(link_slug TEXT, request_kind TEXT DEFAULT 'visit')
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE link public.short_links%ROWTYPE; visit_delta INTEGER := 0; click_delta INTEGER := 0;
BEGIN
    IF request_kind NOT IN ('visit', 'continue', 'inspect') OR request_kind IS NULL THEN
        RAISE EXCEPTION 'Invalid request kind';
    END IF;
    SELECT * INTO link FROM public.short_links WHERE slug = link_slug FOR UPDATE;
    IF NOT FOUND THEN RETURN JSONB_BUILD_OBJECT('state', 'missing'); END IF;
    IF link.archived_at IS NOT NULL THEN RETURN JSONB_BUILD_OBJECT('state', 'archived'); END IF;
    IF NOT link.is_active THEN RETURN JSONB_BUILD_OBJECT('state', 'paused'); END IF;
    IF link.expires_at IS NOT NULL AND NOW() >= link.expires_at THEN RETURN JSONB_BUILD_OBJECT('state', 'expired'); END IF;
    IF link.starts_at IS NOT NULL AND NOW() < link.starts_at THEN
        RETURN JSONB_BUILD_OBJECT('state', 'scheduled', 'starts_at', link.starts_at);
    END IF;
    -- Protect visitors from unsafe legacy destinations as well as new inputs.
    IF link.destination_url !~* '^https?://[^/@[:space:]]+([/?#][^[:space:]]*)?$' OR POSITION(CHR(92) IN link.destination_url) > 0 THEN
        RETURN JSONB_BUILD_OBJECT('state', 'unavailable');
    END IF;
    IF request_kind = 'visit' THEN visit_delta := 1; END IF;
    IF request_kind = 'continue' OR (request_kind = 'visit' AND NOT link.intro_enabled) THEN click_delta := 1; END IF;
    IF visit_delta + click_delta > 0 THEN
        INSERT INTO public.short_link_daily (link_id, day, visits, clicks)
        VALUES (link.id, (NOW() AT TIME ZONE 'Africa/Lagos')::DATE, visit_delta, click_delta)
        ON CONFLICT (link_id, day) DO UPDATE
        SET visits = public.short_link_daily.visits + EXCLUDED.visits,
            clicks = public.short_link_daily.clicks + EXCLUDED.clicks;
        IF click_delta > 0 THEN UPDATE public.short_links SET clicks = clicks + click_delta WHERE id = link.id; END IF;
    END IF;
    RETURN JSONB_BUILD_OBJECT(
        'state', CASE WHEN link.intro_enabled AND request_kind <> 'continue' THEN 'intro' ELSE 'redirect' END,
        'destination_url', link.destination_url, 'title', link.intro_title,
        'message', link.intro_message, 'button', link.intro_button);
END;
$$;
REVOKE ALL ON FUNCTION public.resolve_short_link(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_short_link(TEXT, TEXT) TO anon, authenticated;

