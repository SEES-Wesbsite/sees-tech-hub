# SEES Tech Hub

Next.js App Router application for the SEES community. The active application now consists of the original landing page, Google sign-in, onboarding, member profiles, and the active URL shortener.

## Local development

Use Node.js 22.19 or newer and npm. Set these values in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` — deployment origin; omit locally to use the request origin.
- `NEXT_PUBLIC_SENTRY_DSN` — optional error reporting.

Run `npm install`, then `npm run dev -- --port 3005`.
Configure Google OAuth in Supabase and allow `http://localhost:3005/auth/callback` for local development and the equivalent production callback.

## Checks

- `npx tsc --noEmit`
- `npm test`
- `npm run lint`
- `npm run build`

## Application boundaries

- `app/page.tsx` and `components/landing/` retain the existing landing page.
- `app/(app)/` contains authenticated profile pages.
- `app/actions/profile.ts` owns profile saving and sign-out.
- `lib/profile.ts` loads profiles on the server; `lib/profile-validation.ts` validates editable fields and safe external links.
- `proxy.ts` refreshes sessions only on authentication/profile routes.
- `lib/types.ts` describes the active database surface, not the full historical schema.

Quiz, quests, rankings, events, opportunities, hackathons, other admin tools, and scraping have been removed from the application. Previous feature page URLs temporarily redirect to the dashboard to keep existing landing links usable. Removed feature API endpoints return 404. Short links remain available at /go/[slug], with admin management at /admin/links.

## Database preservation

All existing feature tables, records, views, routines, storage buckets, and files are retained. Application traffic reads/writes `public.users` and `public.short_links`, plus Supabase authentication. Existing profile values, including role, avatar, and historical points, are retained.

The optional read-only inventory is `npm run db:inspect`. It requires `SUPABASE_SERVICE_ROLE_KEY` locally; the application itself does not use that key. It prints relation names, schema types, row counts, and bucket visibility, never record values or credentials. REST visibility does not prove the absence of external clients, database jobs, or other dependencies.

Migration `035_restrict_profile_write_permissions.sql` is a separate security change: it prevents direct browser writes to privileged profile columns. It changes permissions only and must be applied manually by the user. Review the linked project's migration history first: older migrations (including 034) contain destructive operations and must not be replayed blindly. No migration was applied as part of the cleanup.

See [CLEANUP.md](CLEANUP.md) for preservation and deployment notes. A future UI direction remains a separate decision.

The approved follow-up table deletions are documented in [DATABASE-RETIREMENT.md](DATABASE-RETIREMENT.md). Files 036–039 are for manual SQL Editor execution; none has been applied by the agent.
