# Executive hub rollout

The application changes require migrations 040–043. They have not been applied to Supabase by the agent. Existing profile data, onboarding status, skills, published slugs, destinations and recorded click totals are preserved.

## Deployment order

1. Run `supabase/migrations/040_executive_access.sql`, then `041_short_link_lifecycle.sql`, then `042_short_link_analytics.sql` manually against the intended database. Each file is forward-only and must run once. Use the migration runner if available; if using the Supabase SQL editor, execute the entire file together. Do not run selected fragments or add a migration to the applied history unless it succeeded.
2. Deploy the new application. Check an existing `/go/<slug>` address and sign in as the owner to `/admin`.
3. Run `supabase/migrations/043_short_link_public_access_cutover.sql`. This is deliberately a separate post-deployment step: it removes the direct public reads that the old redirect handler needs. Do not run it while the old application is still deployed.
4. Verify a public redirect again, then an introduction link, a scheduled link, an expired link, and a paused link. Confirm the owner can grant and revoke admin access, and an ordinary member cannot open the executive hub.

The temporary legacy SELECT policy remains between steps 1 and 3. Finish the cutover promptly and do not start entering new internal notes or rolling out executive access until step 3 is complete. Public redirect resolution then exposes only the destination, public introduction and availability state, never internal descriptions or creator information.

After migration 043, rolling the app back to the old redirect handler would break public links. Keep the new resolver when rolling back unrelated UI changes. Do not reverse the migrations.

## Access model

- `executive_access` is the source of truth; `users.role` is retained as historical data and is no longer used for executive authorization.
- Migration 040 preserves existing admins and resolves `eyitayobembe@gmail.com` to its existing authenticated account ID. It fails if that account cannot be found as an existing admin. The email is used once at bootstrap, never for ongoing authorization.
- One protected `super_admin` can search existing account emails, select up to 50 accounts, and grant or revoke admin access atomically. There is no self-service registration as an admin and no owner transfer UI.
- All admins share link management. Revoking access does not delete profiles, links or audit history.
- Profile writes stay limited to the member's own editable fields. Executives no longer have the old blanket policy to edit other members' profiles.
- Everybody still goes to `/dashboard` after login and completes the same short onboarding form if pending. Admins see an Executive Hub navigation button.

## Short links

- Existing `/go/<slug>` addresses and destinations are preserved. New custom slugs use lowercase letters, numbers and single hyphens, up to 50 characters; blank slugs are generated securely with collision retries.
- Published slugs cannot be edited or reused. Archive instead of delete; restored links stay paused until explicitly resumed.
- Availability precedence: archived, paused, expired, scheduled, active. An expiry is effective at the exact timestamp; activation starts at the exact timestamp.
- The editor interprets dates as Africa/Lagos (UTC+1), regardless of the visitor's browser timezone, and stores absolute timestamps.
- Optional introductions contain a title, plain-text message and button label. Visitors manually continue. The destination hostname is shown; no remote metadata fetching or uploaded preview images are introduced.
- The introduction and unavailable states are branded, public, uncached and excluded from search indexing. Continue rechecks availability, so an expired or paused link cannot be bypassed with a previously opened page.
- Settings use optimistic version checks to prevent a stale form overwriting another executive's changes.

## Analytics and history

- Visits count requests to the short address. Onward requests count direct redirects and Continue submissions. HEAD, prefetch and preview-inspection requests do not increment totals.
- Counters are committed atomically before returning the redirect. If the database fails, the app shows an unavailable page instead of claiming a counted redirect succeeded.
- These are request counts, not unique people. Bots, repeated requests, reloads and repeated Continue submissions can be counted. A deliberate external caller can generate traffic; these figures are not fraud-proof attendance or payment records.
- Existing click totals remain as a legacy baseline and may be incomplete. Daily charts start from this rollout; earlier dates have no newly recorded traffic.
- Daily aggregates use Lagos calendar days. No raw visitor IPs, user agents or visitor identifiers are stored. Aggregates and executive audit history are retained.
- Charts show the last 30 days and an accessible data table. The lifetime onward total includes historical clicks. Edit history is paginated and records the actor and before/after settings. Permission changes are visible only to the owner.

## Verification

- `npm test` includes profile, recruitment, short-link validation/timezone and isolated PostgreSQL migration/permission tests.
- The migration tests use PGlite and an isolated fixture of the relevant existing schema. They do not connect to the linked Supabase project. This validates PostgreSQL behavior, but it cannot establish that the remote database has no manual schema drift or replace a production smoke test.
- Run `npx tsc --noEmit`, the lint checks, and `npm run build` before deployment.
