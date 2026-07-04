# AGENTS.md — Core Engineering Standards

> [!IMPORTANT]
> These instructions are mandatory for all AI agents working on this codebase. Violation of these principles is considered a critical implementation failure.

## 🏗️ Architecture: SSR-First
1. **Data Fetching**: Always prioritize Server-Side Rendering (SSR). 
   - Perform all data fetching, authentication checks, and database aggregations in the `page.tsx` (Server Component).
   - Pass the resulting data as serializable props to the `Client Component`.
2. **API Routes**: Do NOT create ad-hoc client-side API routes (e.g., `/api/agent/stats`) for core dashboard rendering.

## 🎨 Styling: Token-Based System
1. **No Hardcoded Colors**: NEVER use raw Tailwind color classes (e.g., `bg-blue-600`, `text-slate-500`) or hex codes (e.g., `#F8FAFC`).
2. **CSS Variables**: ALWAYS use the project's CSS variable tokens defined in `app/globals.css`.
   - **Backgrounds**: `var(--background)`, `var(--secondary)`
   - **Surfaces**: `var(--card)`, `var(--popover)`
   - **Brand**: `var(--brand)`, `var(--brand-light)`, `var(--brand-dark)`
   - **Status**: `var(--success)`, `var(--warning)`, `var(--destructive)`, `var(--info)`
   - **Text**: `var(--foreground)`, `var(--muted-foreground)`, `var(--secondary-foreground)`
   - **Borders**: `var(--border)`, `var(--input)`
3. **Usage**: Apply these variables via standard Tailwind utility classes (e.g., `bg-brand`, `bg-brand-light`, `text-muted-foreground`, `border-border`). Avoid using the `[var(--...)]` bracket syntax if a standard utility exists in `@theme`.

## 📍 Registry & Navigation
1. **Path Consistency**: Ensure all navigation links match the established routing structure (e.g., `/agent/locations` instead of `/agent/submissions`).
2. **State Scoping**: Always ensure data is strictly scoped to the authenticated user (`auth.uid()`) and specific regional/state visibility rules.

## ✅ Quality Assurance
1. **Type Checking**: YOU MUST ALWAYS run `npx tsc --noEmit` after making any change to a `.ts` or `.tsx` file to verify that you haven't introduced any TypeScript compilation errors. Do this proactively before declaring a task complete.

## Change Logging Policy
- **Timeline log**: Whenever you make changes, YOU MUST ALWAYS append a brief, timestamped summary of your changes to `timeline-changes.md`.
- **Format**: Keep them short, sequential, and permanent. Do NOT overwrite other lines in the file.

## 🚢 Commit & Push Strategy

When the user says **"commit"**:

1. **Build first**: Always run the project build (`npm run build` or equivalent) before committing. If it fails, surface the error and stop — do not commit broken code.
2. **Audit uncommitted files**: Run `git status` and review everything untracked/modified.
3. **Respect gitignore**: Never force-add files that are gitignored. In particular, do NOT commit:
   - `*.m.md` files (e.g. `chat.m.md`)
   - Anything under `dev-utils/` unless the user explicitly asks for it
   - Any file matching an existing `.gitignore` rule
4. **Group commits atomically and sensibly**: Don't dump everything into one commit. Split by logical concern — one commit per feature/flow/fix. Examples:
   - DB migrations → their own commit
   - Admin-side feature → separate commit from agent-side
   - Refactor/cleanup → separate from feature work
   - Style-only token cleanup → separate from behavior changes
5. **Commit message style**: Follow the existing repo convention (scope prefixes like `feat(admin):`, `fix:`, `chore:`, `style(ui):`, `refactor:`). Short first line, no trailing period. Body only when the "why" is non-obvious.
6. **Push to main last**: After all atomic commits land locally, push to `main` in a single `git push`.
7. **Never** `--no-verify`, `--force`, `--amend` published commits, or skip hooks. If a pre-commit hook fails, fix the underlying issue and make a new commit — never bypass.

## 📋 Todo Tracking Policy

When the user mentions deferred work — phrases like "we can adjust later", "don't forget this later", "take note", "not now but eventually", "park this for now" — **you MUST immediately append the item to `todo.m.md`**.

### Format
```markdown
### YYYY-MM-DD — [Source]
- [ ] **Concise title** — One-line explanation of what needs to be done and why it was deferred.
```

### Rules
1. **Source**: Where the item came from — e.g. `Contractor`, `Self`, `Bug`, `Code Review`.
2. **One item per bullet**. No nested sub-tasks. Keep it scannable.
3. **Never delete completed items** — mark them `[x]` with a completion date comment.
4. **Append only** — never rewrite the file. New items go at the bottom.
5. The file is gitignored (`*.m.md`). It is a local working document, not committed.

## 🗄️ Database Migrations

> [!IMPORTANT]
> The data layer is the foundation of the app. A mistake here is catastrophic and expensive to unwind. Migrations are reviewed with strict rigour.

### Location & naming
1. **Single home**: Every migration lives in `supabase/migrations/` and is **committed to git** — this is the version-controlled schema history. No migration SQL goes anywhere else (the old `dev-utils/migrations/` location is retired).
2. **Sequential numeric prefix + description**: `NNN_short_description.sql`, zero-padded to 3 digits, incrementing by 1. `supabase db push` applies files in sorted filename order, so this convention works alongside the CLI (we author files directly rather than via `supabase migration new`, which would timestamp them).
   - `001_enable_extensions.sql`
   - `002_helper_functions.sql`
   - `003_create_profiles.sql`
   - …never reuse or renumber an existing prefix once it has been applied to any database.
3. **One concern per file**: Split migrations so each file does *one* logical thing (one table or one tightly-related group, one set of policies, one index batch). Small files are debuggable; a 500-line mega-migration is not. Never bundle unrelated changes.
4. **Applied via the Supabase CLI**: author the `.sql` file, then `supabase db push` against the linked project. The build/staging database **is** the linked project; **promoting to production = point the CLI at the prod project (swap env / `supabase link`) and `supabase db push` the same migration set.** Never hand-edit a remote schema outside a migration.

### Authoring rules
1. **Never run `supabase db push`**: The AI agent must NEVER attempt to run `supabase db push` or apply migrations automatically. Always create the `.sql` file and ask the USER to run it manually.
2. **Forward-only, run-once**: Never edit a migration that has already been applied. Fix-forward with a new, higher-numbered migration. Files are not written to be idempotent — no `IF NOT EXISTS` on `CREATE TABLE` (a re-run should fail loudly, not silently skip). `CREATE OR REPLACE` is fine for functions; `CREATE EXTENSION IF NOT EXISTS` is fine since extensions may be pre-installed.
3. **No explicit `BEGIN`/`COMMIT`**: The Supabase migration runner wraps each file in a single transaction, so a file already applies atomically (all-or-nothing). Keep files free of transaction-control statements.
3. **Review data types relentlessly**: Confirm every column type before writing it, then confirm again. Wrong types at the data stage compound into corruption downstream.
4. **Constraints are not optional**: Every table gets the right `NOT NULL`, `CHECK`, `UNIQUE`, and foreign-key constraints. Enforce invariants in the schema, not just in app code.
5. **RLS + policies inline**: Enable RLS and define its `CREATE POLICY` statements in the **same** migration that creates the table. Default-deny; membership/role checks go through `SECURITY DEFINER` helper functions.

### SQL style (house style — match exactly)
1. **Header**: two lines, no ASCII box —
   ```sql
   -- Migration: NNN_name.sql
   -- Description: <what this migration does>
   ```
2. **UPPERCASE** all SQL keywords **and** types: `CREATE TABLE`, `UUID`, `BIGINT`, `VARCHAR(n)`, `TEXT`, `BOOLEAN`, `TIMESTAMPTZ`, `JSONB`, `NOT NULL`, `REFERENCES`, `CHECK`, `UNIQUE`, `DEFAULT NOW()`, `ENABLE ROW LEVEL SECURITY`, `CREATE POLICY`, `USING`, `WITH CHECK`.
3. **UUID PKs**: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`. Use the core `gen_random_uuid()` (in `pg_catalog`), **not** `uuid_generate_v4()` — the latter lives in the `extensions` schema and is not on the migration role's `search_path`, so it fails under `supabase db push`.
4. **Types**: `VARCHAR(n)` for naturally bounded text; `TEXT` for free-form; `TIMESTAMPTZ` for time; `extensions.citext` for case-insensitive email.
4a. **Categoricals use `VARCHAR(n)` + `CHECK (col IN (...))`**, not native `ENUM` types. The allowed set evolves by altering the constraint (drop + re-add) rather than `ALTER TYPE`, which is more flexible as states are added.
4b. **Categorical values are lowercase `snake_case` codes** (`not_registered`, `religious_group`, `life_member`), never human display strings — the UI maps codes → labels. Exception: standardised external codes stay in their canonical form (e.g. currency `NGN`, ISO 4217).
5. **Comments**: group columns under human-readable `-- Heading` comments, add inline trailing comments listing allowed values (e.g. `-- 'event','project','support'`), and document tables/key columns with `COMMENT ON TABLE` / `COMMENT ON COLUMN`.
6. **RLS block**: after the table + comments, `ALTER TABLE x ENABLE ROW LEVEL SECURITY;` then each `CREATE POLICY "Readable name" ...` preceded by a `-- Policy: <intent>` comment.
7. **Layout**: bare table names (public via search_path), 4-space column indent, blank lines between column groups.

