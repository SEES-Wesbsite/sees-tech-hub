-- Migration: 041_short_link_lifecycle.sql
-- Description: Preserve existing links while adding scheduling, introductions, archiving, and audited editing.

ALTER TABLE short_links
    ALTER COLUMN clicks TYPE BIGINT,
    ADD COLUMN starts_at TIMESTAMPTZ,
    ADD COLUMN expires_at TIMESTAMPTZ,
    ADD COLUMN archived_at TIMESTAMPTZ,
    ADD COLUMN intro_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN intro_title VARCHAR(160),
    ADD COLUMN intro_message TEXT,
    ADD COLUMN intro_button VARCHAR(60) NOT NULL DEFAULT 'Continue',
    ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD CONSTRAINT short_links_schedule CHECK (starts_at IS NULL OR expires_at IS NULL OR expires_at > starts_at),
    ADD CONSTRAINT short_links_intro CHECK (NOT intro_enabled OR (NULLIF(BTRIM(intro_title), '') IS NOT NULL AND NULLIF(BTRIM(intro_message), '') IS NOT NULL)),
    ADD CONSTRAINT short_links_message_length CHECK (LENGTH(intro_message) <= 2000),
    ADD CONSTRAINT short_links_button CHECK (LENGTH(BTRIM(intro_button)) > 0),
    ADD CONSTRAINT short_links_destination CHECK (destination_url ~* '^https?://[^/@[:space:]]+([/?#][^[:space:]]*)?$' AND LENGTH(destination_url) <= 4096 AND POSITION(CHR(92) IN destination_url) = 0) NOT VALID;

COMMENT ON COLUMN short_links.archived_at IS 'Archive instead of deleting; published slugs remain permanently reserved.';
COMMENT ON COLUMN short_links.starts_at IS 'Absolute activation instant; the editor accepts Africa/Lagos time.';
COMMENT ON COLUMN short_links.clicks IS 'Legacy total plus successful onward requests since the executive hub migration; not unique visitors.';
CREATE INDEX short_links_created_id ON short_links (created_at DESC, id);

-- Keep the legacy public read policy until the post-deployment cutover (043).
DROP POLICY "Admins can manage short links" ON short_links;
-- Policy: Executives share hub-owned links; public resolution uses a narrow function.
CREATE POLICY "Executives read short links" ON short_links FOR SELECT TO authenticated USING (public.is_admin());
-- Policy: Attribute new links to the authenticated executive.
CREATE POLICY "Executives create short links" ON short_links FOR INSERT TO authenticated WITH CHECK (public.is_admin() AND created_by = auth.uid());
-- Policy: All approved executives may edit shared hub links.
CREATE POLICY "Executives update short links" ON short_links FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
REVOKE ALL ON short_links FROM anon, authenticated;
GRANT SELECT ON short_links TO authenticated;
-- Temporary compatibility for the currently deployed redirect handler.
GRANT SELECT (id, slug, destination_url, clicks, is_active) ON short_links TO anon;
GRANT INSERT (slug, destination_url, description, created_by, starts_at, expires_at, intro_enabled, intro_title, intro_message, intro_button) ON short_links TO authenticated;
GRANT UPDATE (destination_url, description, starts_at, expires_at, intro_enabled, intro_title, intro_message, intro_button, is_active, archived_at) ON short_links TO authenticated;

CREATE FUNCTION public.audit_short_link_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE before_settings JSONB; after_settings JSONB; actor TEXT;
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF NEW.slug IS DISTINCT FROM OLD.slug OR NEW.created_by IS DISTINCT FROM OLD.created_by THEN
            -- Allow the existing creator FK to clear attribution when an account is deleted.
            IF NEW.slug IS DISTINCT FROM OLD.slug OR NEW.created_by IS NOT NULL THEN
                RAISE EXCEPTION 'Published slug and creator cannot change';
            END IF;
        END IF;
        before_settings := TO_JSONB(OLD) - ARRAY['clicks', 'updated_at'];
        after_settings := TO_JSONB(NEW) - ARRAY['clicks', 'updated_at'];
        IF before_settings = after_settings THEN RETURN NEW; END IF;
    ELSE
        IF NEW.slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' THEN RAISE EXCEPTION 'Invalid slug'; END IF;
        after_settings := TO_JSONB(NEW) - ARRAY['clicks', 'updated_at'];
    END IF;
    NEW.updated_at := clock_timestamp();
    SELECT full_name INTO actor FROM public.users WHERE id = auth.uid();
    INSERT INTO public.executive_audit (actor_id, actor_name, category, target_id, action, details)
    VALUES (auth.uid(), COALESCE(actor, 'System'), 'link', NEW.id,
        CASE WHEN TG_OP = 'INSERT' THEN 'created' ELSE 'updated' END,
        JSONB_BUILD_OBJECT('before', before_settings, 'after', after_settings));
    RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.audit_short_link_change() FROM PUBLIC;
CREATE TRIGGER audit_short_link_change BEFORE INSERT OR UPDATE ON short_links
FOR EACH ROW EXECUTE FUNCTION public.audit_short_link_change();


