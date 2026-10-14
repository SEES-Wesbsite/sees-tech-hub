import test from 'node:test';
import assert from 'node:assert/strict';
import { lagosToUtc, utcToLagos, linkState, safeDestination, shortLinkSchema, parseLinkForm } from '../lib/short-links.ts';

const settings = { slug: 'welcome-2026', destination_url: 'https://example.com/form', description: '', starts_at: null, expires_at: null, intro_enabled: false, intro_title: '', intro_message: '', intro_button: 'Continue' };
test('Lagos scheduling is independent of the machine timezone and handles year boundaries', () => {
  assert.equal(lagosToUtc('2026-10-18T23:59'), '2026-10-18T22:59:00.000Z');
  assert.equal(lagosToUtc('2027-01-01T00:30'), '2026-12-31T23:30:00.000Z');
  assert.equal(utcToLagos('2026-12-31T23:30:00.000Z'), '2027-01-01T00:30');
  assert.equal(lagosToUtc(''), null);
  for (const bad of ['2026-02-30T12:00', '2026-10-18T25:00', '2026-10-18', 'now']) assert.throws(() => lagosToUtc(bad));
});
test('link states use inclusive activation and expiry and override in a predictable order', () => {
  const now = Date.parse('2026-10-18T22:59:00Z');
  const link = { is_active: true, archived_at: null, starts_at: null, expires_at: null };
  assert.equal(linkState(link, now), 'active');
  assert.equal(linkState({ ...link, starts_at: new Date(now + 1).toISOString() }, now), 'scheduled');
  assert.equal(linkState({ ...link, starts_at: new Date(now).toISOString() }, now), 'active');
  assert.equal(linkState({ ...link, expires_at: new Date(now).toISOString() }, now), 'expired');
  assert.equal(linkState({ ...link, is_active: false, expires_at: new Date(now).toISOString() }, now), 'paused');
  assert.equal(linkState({ ...link, is_active: false, archived_at: new Date(now).toISOString() }, now), 'archived');
});
test('destinations reject executable schemes, credentials, whitespace and backslash URL ambiguity', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,foo', '//example.com', 'https://a:b@example.com', 'https://example.com/a b', 'https://example.com\\@evil.test', 'https://', 'ftp://example.com']) assert.equal(safeDestination(url), null, url);
  assert.equal(safeDestination('https://example.com/a?x=1#section'), 'https://example.com/a?x=1#section');
});
test('slugs are validated rather than silently rewritten and introduction fields are required together', () => {
  assert.equal(shortLinkSchema.safeParse(settings).success, true);
  for (const slug of ['Foo', 'a b', '-abc', 'abc-', 'a--b', 'a/b', 'a'.repeat(51)]) assert.equal(shortLinkSchema.safeParse({ ...settings, slug }).success, false);
  assert.equal(shortLinkSchema.safeParse({ ...settings, slug: '' }).success, true);
  assert.equal(shortLinkSchema.safeParse({ ...settings, intro_enabled: true }).success, false);
  assert.equal(shortLinkSchema.safeParse({ ...settings, intro_enabled: true, intro_title: 'Welcome', intro_message: 'Read this first' }).success, true);
  assert.equal(shortLinkSchema.safeParse({ ...settings, starts_at: '2026-10-18T22:59:00Z', expires_at: '2026-10-18T22:59:00Z' }).success, false);
});
test('form parsing does not accept privileged fields and converts schedule to UTC', () => {
  const form = new FormData();
  for (const [key, value] of Object.entries(settings)) if (typeof value === 'string') form.set(key, value);
  form.set('starts_at', '2026-10-18T23:59');
  form.set('created_by', 'someone-else'); form.set('clicks', '9000');
  const parsed = parseLinkForm(form);
  assert.equal(parsed.starts_at, '2026-10-18T22:59:00.000Z');
  assert.equal('created_by' in parsed, false); assert.equal('clicks' in parsed, false);
});
