# Approved database retirement — 2026-09-11

Run these files manually in the Supabase SQL Editor, as the database owner. Select and run each **whole file**, in order. Do not run historical migrations 001–034 again. Nothing below has been executed against the live database by the agent.

1. `supabase/migrations/036_drop_activity_heatmap.sql`
2. `supabase/migrations/037_drop_hackathon_tables.sql`
3. `supabase/migrations/038_drop_project_tables.sql`
4. `supabase/migrations/039_drop_quests_and_submissions.sql`

These permanently delete 11 tables and their rows: `hackathon_reviews`, `hackathon_submissions`, `project_upvotes`, `project_members`, `projects`, `quest_assignments`, `quest_bank`, `quiz_questions`, `quiz_sessions`, `quizzes`, and `submissions`. The `activity_heatmap` view and the three feature-only functions are also removed. Owned table indexes, policies, and triggers go with their tables.

The scripts do not use `CASCADE`. Unexpected dependencies stop the affected script instead of silently deleting other objects. Files 037–039 each use one atomic procedural statement, so a failure rolls back that entire file. Earlier successfully executed files remain applied. These are run-once changes; do not rerun a completed file.

## Preserved

- `users`, every profile column/value, and the entire `auth` schema: login, registration's existing profile-creation trigger, and profile viewing/editing remain supported.
- `short_links`: the active redirect handler and admin creation/listing UI have been restored in the application.
- `community_feed`: its name, column types/order, and grants remain. It continues showing event RSVPs. Its submission/quest branch is removed because those tables are being deleted.
- `point_transactions`: all rows/values and its user-points trigger remain. Only its FK to `submissions` is removed.
- `audit_logs`, `app_settings`, `events`, `event_attendances`, `opportunities`, and `opportunity_interactions` remain, although the current app does not fetch them.
- Every storage bucket and stored file remains, including hackathon documents. Dropping a public table does not delete Storage files.

039 checks that `submissions` is still empty and stops if new records have appeared. Preserve `events` and `event_attendances` while keeping the current community feed.

## Separate profile-security change

035 is independent of these deletions. It revokes broad browser INSERT/UPDATE permissions on `users`, then grants UPDATE on the eight editable profile fields. Existing row-level policies still determine whose row may be edited. It prevents browser changes to role, points, ID, and creation date. SELECT permissions, Supabase authentication, and the existing privileged signup trigger are unchanged. Supabase SQL Editor/owner operations are not blocked.

## Manual application record

Record which files succeeded and when. SQL Editor execution does not automatically maintain the Supabase CLI migration ledger. Before anyone returns to CLI migrations, reconcile that ledger with the manually applied changes; do not blindly push or replay the historical set.

## Verification

Tested 035–039 against an isolated in-memory PostgreSQL-compatible PGlite fixture with the relevant historical view/function definitions and foreign keys. Verified 11 table deletions and heatmap removal; unchanged user, short-link, points, event-feed and storage fixture rows; preserved feed grants; permitted profile editing; blocked role escalation; and successful auth-trigger profile creation. Nonempty submissions and unexpected dependencies both caused rollback. This validates the SQL against the repository-derived fixture, not unknown live-schema changes. No live migration was executed.

The restored code passes TypeScript and focused lint. A real active short link returned the expected redirect through the local server; signed-out admin access redirects to login.
