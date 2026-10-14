import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
export const owner = '10000000-0000-4000-8000-000000000001';
export const member = '10000000-0000-4000-8000-000000000002';
export const other = '10000000-0000-4000-8000-000000000003';
export const legacyLink = '20000000-0000-4000-8000-000000000001';
export async function migrate(db, name) {
  const sql = await readFile(new URL(`../../supabase/migrations/${name}`, import.meta.url), 'utf8');
  await db.transaction((tx) => tx.exec(sql));
}
export async function createExecutiveTestDatabase() {
  const db = new PGlite();
  await db.exec(`
    CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users (id UUID PRIMARY KEY, email TEXT);
    CREATE FUNCTION auth.uid() RETURNS UUID LANGUAGE SQL STABLE AS $$ SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::UUID $$;
    GRANT USAGE ON SCHEMA public, auth TO anon, authenticated;
    CREATE TABLE public.users (id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, full_name TEXT NOT NULL, role VARCHAR(20) NOT NULL DEFAULT 'member', onboarding_status VARCHAR(20) DEFAULT 'pending');
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Public profiles" ON public.users FOR SELECT USING (TRUE);
    CREATE POLICY "Own profile" ON public.users FOR UPDATE TO authenticated USING (id = auth.uid());
    GRANT SELECT ON public.users TO anon, authenticated;
    GRANT UPDATE (full_name, onboarding_status) ON public.users TO authenticated;
    CREATE FUNCTION public.is_admin() RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER AS $$ SELECT EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') $$;
    CREATE POLICY "Admins can update all users" ON public.users FOR UPDATE USING (public.is_admin());
    CREATE TABLE public.short_links (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), slug VARCHAR(50) UNIQUE NOT NULL, destination_url TEXT NOT NULL, clicks INTEGER NOT NULL DEFAULT 0, created_by UUID REFERENCES public.users(id) ON DELETE SET NULL, is_active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), description TEXT);
    ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Anyone can read active short links" ON public.short_links FOR SELECT USING (is_active = TRUE);
    CREATE POLICY "Admins can manage short links" ON public.short_links FOR ALL USING (public.is_admin());
    GRANT ALL ON public.short_links TO anon, authenticated;
    INSERT INTO auth.users VALUES ('${owner}', 'eyitayobembe@gmail.com'), ('${member}', 'member@example.test'), ('${other}', 'other@example.test');
    INSERT INTO public.users (id, full_name, role) VALUES ('${owner}', 'Hub Owner', 'admin'), ('${member}', 'Hub Member', 'member'), ('${other}', 'Other Member', 'member');
    INSERT INTO public.short_links (id, slug, destination_url, clicks, created_by, description) VALUES ('${legacyLink}', 'existing-link', 'https://example.test/original', 17, '${owner}', 'Internal planning note');
  `);
  for (const name of ['040_executive_access.sql', '041_short_link_lifecycle.sql', '042_short_link_analytics.sql']) await migrate(db, name);
  return db;
}
export function asUser(db, id, fn) {
  return db.transaction(async (tx) => {
    await tx.exec(`SET LOCAL ROLE ${id ? 'authenticated' : 'anon'}`);
    await tx.query("SELECT set_config('request.jwt.claim.sub', $1, true)", [id ?? '']);
    return fn(tx);
  });
}
