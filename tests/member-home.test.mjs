import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { previewModules } from './helpers/render-executive-preview.mjs';

const profile = {
  full_name: 'Ada Example', preferred_name: 'Ada', avatar_url: null,
  primary_stacks: ['Design', 'TypeScript', 'Writing', 'Python', 'Research', 'UX', 'Community'],
  github_url: 'https://github.com/example', portfolio_link: 'javascript:alert(1)', social_link: null,
  created_at: '2026-09-14T10:00:00Z',
};

test('member home shows real profile details and shared initiative/community links', () => {
  const load = previewModules();
  const { MemberHome } = load('@/components/member-home/member-home');
  const html = renderToStaticMarkup(createElement(MemberHome, { profile, initialNow: Date.parse('2026-10-14T12:00:00Z') }));
  assert.match(html, /Welcome back,/);
  assert.match(html, /September 2026/);
  assert.match(html, /TypeScript/);
  assert.match(html, /1 more interests/);
  assert.match(html, /Community/);
  assert.match(html, /href="\/datacamp"/);
  assert.match(html, /href="\/volunteer"/);
  assert.match(html, /chat.whatsapp.com/);
  assert.doesNotMatch(html, /href="javascript:/);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.match(html, /Edit your profile/);
});

test('the member-home volunteer feature shares the exact recruitment deadline', () => {
  const load = previewModules();
  const { VolunteerFeature } = load('@/components/member-home/volunteer-feature');
  const deadline = Date.parse('2026-10-18T22:59:00Z');
  const open = renderToStaticMarkup(createElement(VolunteerFeature, { initialNow: deadline - 1 }));
  assert.match(open, /Applications open/); assert.match(open, /Explore the teams/);
  const closed = renderToStaticMarkup(createElement(VolunteerFeature, { initialNow: deadline }));
  assert.match(closed, /Applications closed/); assert.match(closed, /Meet the teams/);
  assert.doesNotMatch(closed, /Applications open|Apply before/);
});

test('profile display handles missing fields and never shows private editing controls by default', () => {
  const load = previewModules();
  const { ProfileCard } = load('@/components/profile-card');
  const html = renderToStaticMarkup(createElement(ProfileCard, { profile: { ...profile, preferred_name: null, primary_stacks: [], github_url: null }, memberSince: 'invalid' }));
  assert.match(html, /Ada Example/); assert.match(html, /No interests or skills shared yet/);
  assert.doesNotMatch(html, /Edit your profile|Member since|Invalid Date|href="javascript:/);
});
