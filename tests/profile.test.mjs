import test from 'node:test';
import assert from 'node:assert/strict';
import { profileSchema, safeProfileUrl } from '../lib/profile-validation.ts';
import { callbackOrigin } from '../lib/auth-redirect.ts';

const valid = {
  full_name: ' Ada Lovelace ', preferred_name: ' Ada ',
  primary_stacks: ['TypeScript', 'TypeScript', ' Design '],
  github_url: 'https://github.com/ada', portfolio_link: '', social_link: '',
};

test('profile validation trims input and retains distinct interests', () => {
  const data = profileSchema.parse(valid);
  assert.equal(data.full_name, 'Ada Lovelace');
  assert.equal(data.preferred_name, 'Ada');
  assert.deepEqual(data.primary_stacks, ['TypeScript', 'Design']);
});

test('profile validation rejects privileged fields and invalid names', () => {
  for (const extra of [{ role: 'admin' }, { id: 'another-user' }, { total_points: 9999 }]) {
    assert.equal(profileSchema.safeParse({ ...valid, ...extra }).success, false);
  }
  assert.equal(profileSchema.safeParse({ ...valid, preferred_name: '   ' }).success, false);
  assert.equal(profileSchema.safeParse({ ...valid, preferred_name: 'x'.repeat(256) }).success, false);
});

test('profile links reject executable schemes and credentials', () => {
  for (const link of ['javascript:alert(1)', 'data:text/html,test', '//example.com', 'https://user:pass@example.com', 'not a URL']) {
    assert.equal(safeProfileUrl(link), null);
    assert.equal(profileSchema.safeParse({ ...valid, social_link: link }).success, false);
  }
  assert.equal(safeProfileUrl('https://example.com/path?q=1'), 'https://example.com/path?q=1');
  assert.equal(safeProfileUrl(null), null);
});

test('profile validation rejects malformed or oversized stacks', () => {
  for (const stacks of ['TypeScript', [12], [''], Array(31).fill('test')]) {
    assert.equal(profileSchema.safeParse({ ...valid, primary_stacks: stacks }).success, false);
  }
});

test('OAuth callbacks use the configured origin and retain local development port', () => {
  assert.equal(callbackOrigin('http://localhost:3005/auth/callback?code=private'), 'http://localhost:3005');
  assert.equal(callbackOrigin('http://internal/auth/callback', 'https://tech.seesunilag.com/'), 'https://tech.seesunilag.com');
  assert.throws(() => callbackOrigin('http://localhost', 'javascript:alert(1)'));
  assert.throws(() => callbackOrigin('http://localhost', 'https://user:pass@example.com'));
});
