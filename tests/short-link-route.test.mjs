import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const source = readFileSync(new URL('../app/go/[slug]/route.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
function handler(result) {
  const calls = [];
  const module = { exports: {} };
  const localRequire = (name) => name === '@/lib/public-short-links' ? {
    resolvePublicLink: async (slug, kind) => { calls.push({ slug, kind }); if (result instanceof Error) throw result; return result; },
  } : require(name);
  new Function('require', 'module', 'exports', compiled)(localRequire, module, module.exports);
  return { ...module.exports, calls };
}
const params = { params: Promise.resolve({ slug: 'welcome' }) };
const url = 'https://tech.seesunilag.com/go/welcome';
test('redirect route awaits resolution, prevents caching, and excludes HEAD and prefetch from visits', async () => {
  const route = handler({ state: 'redirect', destination_url: 'https://example.com/form' });
  const response = await route.GET(new Request(url), params);
  assert.equal(response.status, 307); assert.equal(response.headers.get('location'), 'https://example.com/form');
  assert.match(response.headers.get('cache-control'), /no-store/);
  await route.HEAD(new Request(url, { method: 'HEAD' }), params);
  await route.GET(new Request(url, { headers: { purpose: 'prefetch' } }), params);
  assert.deepEqual(route.calls.map((call) => call.kind), ['visit', 'inspect', 'inspect']);
});
test('Continue requires a same-origin form submission and returns a GET redirect', async () => {
  const route = handler({ state: 'redirect', destination_url: 'https://example.com/form' });
  const blocked = await route.POST(new Request(url, { method: 'POST', headers: { origin: 'https://other.example' } }), params);
  assert.equal(blocked.status, 403); assert.equal(route.calls.length, 0);
  const allowed = await route.POST(new Request(url, { method: 'POST', headers: { origin: 'https://tech.seesunilag.com' } }), params);
  assert.equal(allowed.status, 303); assert.equal(route.calls[0].kind, 'continue');
});
test('intro, expired, unavailable and database errors send visitors to the branded page', async () => {
  for (const result of [{ state: 'intro' }, { state: 'expired' }, { state: 'missing' }, new Error('Database unavailable')]) {
    const route = handler(result);
    const response = await route.GET(new Request(url), params);
    assert.equal(response.headers.get('location'), `${url}/preview`);
    assert.equal(response.status, 303);
  }
});
