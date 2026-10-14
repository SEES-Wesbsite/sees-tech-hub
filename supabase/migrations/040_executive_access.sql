-- Migration: 040_executive_access.sql
-- Description: Protect executive access, bootstrap the owner, and audit bulk membership changes.

CREATE TABLE executive_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'super_admin')),
    granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX executive_single_owner ON executive_access (role) WHERE role = 'super_admin';
COMMENT ON TABLE executive_access IS 'Protected executive membership; public profile roles are no longer authoritative.';
ALTER TABLE executive_access ENABLE ROW LEVEL SECURITY;

INSERT INTO executive_access (user_id, role)
SELECT id, 'admin' FROM users WHERE role = 'admin';

DO $$
DECLARE owner_id UUID;
BEGIN
    SELECT u.id INTO STRICT owner_id FROM auth.users a
    JOIN public.users u ON u.id = a.id
    WHERE LOWER(a.email) = 'eyitayobembe@gmail.com' AND u.role = 'admin';
    UPDATE public.executive_access SET role = 'super_admin' WHERE user_id = owner_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = '' AS $$
    SELECT EXISTS (SELECT 1 FROM public.executive_access WHERE user_id = auth.uid());
$$;
CREATE FUNCTION public.is_super_admin()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = '' AS $$
    SELECT EXISTS (SELECT 1 FROM public.executive_access WHERE user_id = auth.uid() AND role = 'super_admin');
$$;
REVOKE ALL ON FUNCTION public.is_super_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- Policy: Members can read their own permission; the owner can review all memberships.
CREATE POLICY "Read executive access" ON executive_access FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_super_admin());
REVOKE ALL ON executive_access FROM anon, authenticated;
GRANT SELECT ON executive_access TO authenticated;

-- Executives manage tools, not other members' profile information.
DROP POLICY "Admins can update all users" ON users;

CREATE TABLE executive_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('access', 'link')),
    target_id UUID NOT NULL,
    action VARCHAR(30) NOT NULL CHECK (action IN ('granted', 'revoked', 'created', 'updated')),
    details JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX executive_audit_target_date ON executive_audit (target_id, created_at DESC);
COMMENT ON TABLE executive_audit IS 'Append-only executive actions, including before/after link settings. No visitor data.';
ALTER TABLE executive_audit ENABLE ROW LEVEL SECURITY;
-- Policy: Executives see link history; only the owner sees access history.
CREATE POLICY "Read executive history" ON executive_audit FOR SELECT TO authenticated
USING (public.is_admin() AND (category = 'link' OR public.is_super_admin()));
REVOKE ALL ON executive_audit FROM anon, authenticated;
GRANT SELECT ON executive_audit TO authenticated;

CREATE FUNCTION public.search_executive_accounts(search_email TEXT DEFAULT '')
RETURNS TABLE (user_id UUID, email TEXT, full_name TEXT, access_role TEXT)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
    IF NOT public.is_super_admin() THEN RAISE EXCEPTION 'Forbidden'; END IF;
    RETURN QUERY
    SELECT u.id, a.email::TEXT, u.full_name::TEXT, e.role::TEXT
    FROM public.users u JOIN auth.users a ON a.id = u.id
    LEFT JOIN public.executive_access e ON e.user_id = u.id
    WHERE (BTRIM(search_email) = '' AND e.id IS NOT NULL)
       OR (LENGTH(BTRIM(search_email)) >= 3 AND STRPOS(LOWER(a.email), LOWER(BTRIM(search_email))) > 0)
    ORDER BY a.email LIMIT 50;
END;
$$;
REVOKE ALL ON FUNCTION public.search_executive_accounts(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_executive_accounts(TEXT) TO authenticated;

CREATE FUNCTION public.set_executive_access(account_ids UUID[], grant_access BOOLEAN)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE target UUID; actor TEXT;
BEGIN
    IF NOT public.is_super_admin() THEN RAISE EXCEPTION 'Forbidden'; END IF;
    IF grant_access IS NULL OR COALESCE(CARDINALITY(account_ids), 0) NOT BETWEEN 1 AND 50
       OR ARRAY_POSITION(account_ids, NULL) IS NOT NULL THEN RAISE EXCEPTION 'Select 1 to 50 accounts'; END IF;
    IF EXISTS (SELECT 1 FROM public.executive_access WHERE user_id = ANY(account_ids) AND role = 'super_admin')
       THEN RAISE EXCEPTION 'The owner account cannot be changed here'; END IF;
    IF EXISTS (SELECT 1 FROM UNNEST(account_ids) t(id) WHERE NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = t.id))
       THEN RAISE EXCEPTION 'An account no longer exists'; END IF;
    SELECT full_name INTO actor FROM public.users WHERE id = auth.uid();
    FOR target IN SELECT DISTINCT UNNEST(account_ids) ORDER BY 1 LOOP
        IF grant_access THEN
            INSERT INTO public.executive_access (user_id, role, granted_by)
            VALUES (target, 'admin', auth.uid()) ON CONFLICT (user_id) DO NOTHING;
        ELSE
            DELETE FROM public.executive_access WHERE user_id = target AND role = 'admin';
        END IF;
        IF FOUND THEN
            INSERT INTO public.executive_audit (actor_id, actor_name, category, target_id, action, details)
            VALUES (auth.uid(), actor, 'access', target, CASE WHEN grant_access THEN 'granted' ELSE 'revoked' END, JSONB_BUILD_OBJECT('account_email', (SELECT email FROM auth.users WHERE id = target)));
        END IF;
    END LOOP;
END;
$$;
REVOKE ALL ON FUNCTION public.set_executive_access(UUID[], BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_executive_access(UUID[], BOOLEAN) TO authenticated;

