import test from 'node:test';
import assert from 'node:assert/strict';
import { createExecutiveTestDatabase, asUser, migrate, owner, member, other, legacyLink } from './helpers/executive-db.mjs';

test('executive migrations preserve live links and enforce access, lifecycle, counters and audit rules', async (t) => {
  const db = await createExecutiveTestDatabase();
  t.after(() => db.close());
  await t.test('legacy redirect reads survive the staged migration; the owner is bound to their ID', async () => {
    const { rows } = await asUser(db, null, (tx) => tx.query('SELECT id, destination_url, clicks FROM short_links WHERE slug = $1', ['existing-link']));
    assert.equal(rows[0].destination_url, 'https://example.test/original'); assert.equal(rows[0].clicks, 17);
    const { rows: access } = await asUser(db, owner, (tx) => tx.query('SELECT user_id, role FROM executive_access'));
    assert.deepEqual(access, [{ user_id: owner, role: 'super_admin' }]);
    await migrate(db, '043_short_link_public_access_cutover.sql');
  });
  await t.test('anonymous and ordinary members cannot enumerate links, emails, audit records or grant roles', async () => {
    await assert.rejects(asUser(db, null, (tx) => tx.query('SELECT * FROM short_links')), /permission denied/);
    assert.equal((await asUser(db, member, (tx) => tx.query('SELECT * FROM short_links'))).rows.length, 0);
    assert.equal((await asUser(db, member, (tx) => tx.query('SELECT * FROM executive_audit'))).rows.length, 0);
    await assert.rejects(asUser(db, member, (tx) => tx.query("SELECT * FROM search_executive_accounts('example')")), /Forbidden/);
    await assert.rejects(asUser(db, member, (tx) => tx.query('SELECT set_executive_access($1::UUID[], TRUE)', [[member]])), /Forbidden/);
    await assert.rejects(asUser(db, member, (tx) => tx.query("INSERT INTO executive_access(user_id, role) VALUES ($1, 'admin')", [member])), /permission denied/);
    await assert.rejects(asUser(db, member, (tx) => tx.query("UPDATE users SET role = 'admin' WHERE id = $1", [member])), /permission denied/);
  });
  await t.test('bulk access is all-or-nothing, owner-protected, searchable and auditable', async () => {
    const accounts = await asUser(db, owner, (tx) => tx.query("SELECT * FROM search_executive_accounts('example.test')"));
    assert.equal(accounts.rows.length, 2);
    await assert.rejects(asUser(db, owner, (tx) => tx.query('SELECT set_executive_access($1::UUID[], FALSE)', [[owner, member]])), /owner account/);
    await assert.rejects(asUser(db, owner, (tx) => tx.query('SELECT set_executive_access($1::UUID[], TRUE)', [[member, '10000000-0000-4000-8000-000000000099']])), /no longer exists/);
    assert.equal((await db.query('SELECT * FROM executive_access')).rows.length, 1);
    await asUser(db, owner, (tx) => tx.query('SELECT set_executive_access($1::UUID[], TRUE)', [[member, other, member]]));
    assert.equal((await db.query('SELECT * FROM executive_access')).rows.length, 3);
    assert.equal((await db.query("SELECT * FROM executive_audit WHERE category = 'access'")).rows.length, 2);
    await assert.rejects(asUser(db, member, (tx) => tx.query('SELECT set_executive_access($1::UUID[], FALSE)', [[other]])), /Forbidden/);
    const profiles = await asUser(db, member, (tx) => tx.query("UPDATE users SET full_name = 'Changed' WHERE id = $1 RETURNING id", [other]));
    assert.equal(profiles.rows.length, 0);
  });
  await t.test('anonymous redirects update totals atomically without exposing internal notes', async () => {
    const result = await asUser(db, null, (tx) => tx.query("SELECT resolve_short_link('existing-link', 'visit') AS result"));
    assert.equal(result.rows[0].result.state, 'redirect');
    assert.equal('description' in result.rows[0].result, false);
    for (let i = 0; i < 20; i++) await asUser(db, null, (tx) => tx.query("SELECT resolve_short_link('existing-link', 'visit')"));
    const totals = (await db.query('SELECT clicks FROM short_links WHERE id = $1', [legacyLink])).rows[0];
    assert.equal(totals.clicks, 38);
    const daily = (await db.query('SELECT visits, clicks FROM short_link_daily WHERE link_id = $1', [legacyLink])).rows[0];
    assert.deepEqual(daily, { visits: 21, clicks: 21 });
    assert.equal((await db.query("SELECT * FROM executive_audit WHERE category = 'link'")).rows.length, 0);
  });
  await t.test('published slugs, counters and audit history cannot be overwritten or deleted by executives', async () => {
    for (const sql of ["UPDATE short_links SET slug = 'stolen'", 'UPDATE short_links SET clicks = 9999', 'DELETE FROM short_links', 'DELETE FROM executive_audit', 'UPDATE short_link_daily SET visits = 99']) await assert.rejects(asUser(db, member, (tx) => tx.query(sql)), /permission denied/);
    await assert.rejects(asUser(db, member, (tx) => tx.query("INSERT INTO short_links (slug, destination_url, created_by) VALUES ('impersonation', 'https://example.test', $1)", [other])), /row-level security/);
  });
  await t.test('introductions count the visit separately from Continue and inspect never counts', async () => {
    await asUser(db, member, (tx) => tx.query("UPDATE short_links SET intro_enabled = TRUE, intro_title = 'Read first', intro_message = 'Welcome' WHERE id = $1", [legacyLink]));
    const intro = (await asUser(db, null, (tx) => tx.query("SELECT resolve_short_link('existing-link', 'visit') AS r"))).rows[0].r;
    assert.equal(intro.state, 'intro'); assert.equal(intro.title, 'Read first');
    await asUser(db, null, (tx) => tx.query("SELECT resolve_short_link('existing-link', 'inspect')"));
    assert.equal((await db.query('SELECT clicks FROM short_links WHERE id = $1', [legacyLink])).rows[0].clicks, 38);
    const onward = (await asUser(db, null, (tx) => tx.query("SELECT resolve_short_link('existing-link', 'continue') AS r"))).rows[0].r;
    assert.equal(onward.state, 'redirect');
    assert.deepEqual((await db.query('SELECT visits, clicks FROM short_link_daily WHERE link_id = $1', [legacyLink])).rows[0], { visits: 22, clicks: 22 });
    const audit = (await asUser(db, member, (tx) => tx.query("SELECT * FROM executive_audit WHERE category = 'link'"))).rows[0];
    assert.equal(audit.actor_id, member); assert.equal(audit.details.before.intro_enabled, false); assert.equal(audit.details.after.intro_enabled, true);
  });
  await t.test('paused, archived, expired and scheduled links block both visits and Continue', async () => {
    for (const [change, state] of [["is_active = FALSE", 'paused'], ["is_active = TRUE, archived_at = NOW()", 'archived'], ["archived_at = NULL, expires_at = NOW()", 'expired'], ["expires_at = NULL, starts_at = NOW() + INTERVAL '1 hour'", 'scheduled']]) {
      await asUser(db, member, (tx) => tx.query(`UPDATE short_links SET ${change} WHERE id = $1`, [legacyLink]));
      for (const kind of ['visit', 'continue']) assert.equal((await asUser(db, null, (tx) => tx.query("SELECT resolve_short_link('existing-link', $1) AS r", [kind]))).rows[0].r.state, state);
    }
    assert.equal((await db.query('SELECT clicks FROM short_links WHERE id = $1', [legacyLink])).rows[0].clicks, 39);
    await assert.rejects(asUser(db, member, (tx) => tx.query("UPDATE short_links SET starts_at = NOW(), expires_at = NOW() WHERE id = $1", [legacyLink])), /short_links_schedule/);
    assert.equal((await asUser(db, null, (tx) => tx.query("SELECT resolve_short_link('missing', 'visit') AS r"))).rows[0].r.state, 'missing');
  });
  await t.test('version changes prevent lost edits and revoked admins lose access immediately', async () => {
    const version = (await asUser(db, member, (tx) => tx.query('SELECT updated_at FROM short_links WHERE id = $1', [legacyLink]))).rows[0].updated_at;
    await asUser(db, other, (tx) => tx.query("UPDATE short_links SET description = 'Another executive changed this' WHERE id = $1", [legacyLink]));
    const stale = await asUser(db, member, (tx) => tx.query("UPDATE short_links SET description = 'Stale edit' WHERE id = $1 AND updated_at = $2 RETURNING id", [legacyLink, version]));
    assert.equal(stale.rows.length, 0);
    await asUser(db, owner, (tx) => tx.query('SELECT set_executive_access($1::UUID[], FALSE)', [[member, other]]));
    assert.equal((await asUser(db, member, (tx) => tx.query('SELECT * FROM short_links'))).rows.length, 0);
    assert.equal((await db.query('SELECT * FROM users')).rows.length, 3);
    assert.equal((await db.query("SELECT COUNT(*)::INTEGER AS n FROM users WHERE onboarding_status = 'pending'")).rows[0].n, 3);
  });
});
