import test from 'node:test';
import assert from 'node:assert/strict';
import { renderExecutivePreview, previewModules } from './helpers/render-executive-preview.mjs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

test('executive pages render accessible forms, the shared workspace and branded introductions', async () => {
  const hub = await renderExecutivePreview('hub');
  assert.match(hub, /Admin access/); assert.match(hub, /Open link manager/);
  const adminHub = await renderExecutivePreview('hub', 'admin');
  assert.doesNotMatch(adminHub, /Admin access/); assert.doesNotMatch(adminHub, /Manage access/);
  const list = await renderExecutivePreview('links');
  assert.match(list, /Search links/); assert.match(list, /volunteer-2026/);
  const detail = await renderExecutivePreview('detail');
  assert.match(detail, /View daily figures/); assert.match(detail, /West Africa Time/); assert.match(detail, /Pause link/);
  assert.match(detail, /Published address/); assert.doesNotMatch(detail, /name="slug"/);
  const intro = await renderExecutivePreview('intro');
  assert.match(intro, /method="post"/); assert.match(intro, /example.com/); assert.match(intro, /Apply to volunteer/);
  const form = await renderExecutivePreview('new');
  assert.match(form, /name="slug"/); assert.match(form, /type="datetime-local"/);
});
test('account selection has one bulk action area and protects the owner checkbox', () => {
  const load = previewModules();
  const { AccountSelection } = load('@/components/admin/account-selection');
  const html = renderToStaticMarkup(createElement(AccountSelection, { accounts: [
    { user_id: 'owner', email: 'owner@example.test', full_name: 'Owner', access_role: 'super_admin' },
    { user_id: 'member', email: 'member@example.test', full_name: 'Member', access_role: null },
  ] }));
  assert.equal((html.match(/>Make admin</g) ?? []).length, 1);
  assert.match(html, /disabled=""[^>]*value="owner"|value="owner"[^>]*disabled=""/);
});
