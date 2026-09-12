# Follow-up scope — 2026-09-11

The URL shortener is in active use and has been restored, including /go/[slug] and /admin/links. The user subsequently approved actual hackathon/project/quest/quiz/submission deletions while preserving the community feed. See DATABASE-RETIREMENT.md. The dated audit below records the earlier cleanup; its shortener-removal and blanket database-preservation decisions are superseded by this clarification.

# Application cleanup — 2026-09-10

## Preserved

The landing page, its components, shared styles/fonts/logo, and referenced assets are retained. Authentication and all existing profile fields remain. Every historical database migration remains unchanged.

No feature records, tables, views, columns, routines, buckets, or stored files were deleted. The user clarified that database retirement means stopping application fetching, with reconstruction or deletion deferred to a later decision.

## Removed from the application

Quiz/placement flows; quests and assignment/submission flows; points/ranking/leaderboard calculations; events/claims; opportunities and scraping; hackathon applications/reviews; admin dashboards; URL-shortener handlers; countdown and disabled feature placeholders. Associated actions, generated data helpers, unused UI components, graphics experiments, seeds/reset utilities, starter assets, and dependencies were removed.

The application no longer fetches historical feature tables, issues feature RPCs, reads/uploads storage, writes audit logs, awards signup points, or initializes React Query. The sitemap contains only the public landing page.

## Profile and authentication repair

Profile editing uses a single validation schema, explicit editable fields, authenticated row scoping, and a checked update result. Public profile links are limited to HTTP(S), excluding embedded credentials. Error screens do not expose raw exception messages. The OAuth callback checks exchange failures and uses the configured/request origin instead of trusting forwarded-host headers.

The separate 035 permission migration closes direct browser writes to role, points, identity, and other non-editable columns. It preserves existing data and RLS. It has not been applied. Until the user applies it, application validation does not protect against someone calling the database API directly.

## Live inventory

A read-only REST/schema inventory on 2026-09-10 found 146 user profiles, 235 audit records, 25 points transactions, 30 quests, 39 quiz questions, 13 quizzes, 4 assignments, 1 quiz session, 8 opportunities, 1 event, 17 attendance records, and 5 short links. These are snapshots, not a backup.

The retained storage buckets are verification_docs (private), event_covers (public), and hackathon_documents (private). No files were downloaded or deleted. REST inventory cannot establish migration application history, SQL dependency graphs, grants, external clients, or scheduled jobs.

## Deployment and future work

- Deploying the application removes access through its former feature pages/actions. It does not disable direct Supabase API access or external jobs.
- Review and disable any externally configured scrape/cron jobs separately. Their old application endpoint is removed.
- Preserve historical credentials securely until external usage is understood. Obsolete AI/scraping/mail/queue keys are no longer referenced by the application.
- Review the linked migration history before manually applying 035. Earlier migration 034 deletes placement records; do not replay or newly apply it without reconciling the preservation decision.
- Revisit archived feature access policies and reconstruction only through a separate approved change.
- Agree on and document the future UI direction before the visual overhaul.

## Verification

The production build and its TypeScript check passed. All five profile/redirect tests passed. Full lint reports only four existing text-escaping errors and three warnings in protected landing/shared-logo files; those files were deliberately left unchanged. Hash checks confirmed all 19 protected landing/style/asset files were unchanged. Verification used direct installed CLI invocations where the local npm command wrapper exited without diagnostics. Authenticated OAuth completion and profile writes were not exercised against real accounts.

Local port-3005 checks passed: landing and sitemap return 200; onboarding redirects to login; dashboard streams a login redirect without profile data; retired quests/quiz paths redirect to the dashboard; the removed test API returns 404. The landing page content was also verified through the browser.
