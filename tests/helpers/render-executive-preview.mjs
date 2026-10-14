import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const require = createRequire(import.meta.url);
export const sampleLink = {
  id: '20000000-0000-4000-8000-000000000001', slug: 'volunteer-2026', destination_url: 'https://example.com/volunteer', description: 'October volunteer recruitment',
  clicks: 1284, created_by: '10000000-0000-4000-8000-000000000001', is_active: true, created_at: '2026-10-10T12:00:00Z',
  starts_at: null, expires_at: '2026-10-18T22:59:00Z', archived_at: null, intro_enabled: true, intro_title: 'Make room for what we can build together.', intro_message: 'Our volunteer applications are open. Read the team descriptions before submitting your application.', intro_button: 'Apply to volunteer', updated_at: '2026-10-13T12:00:00Z',
};
export function previewModules(role = 'super_admin') {
  const cache = new Map();
  const today = new Date().toISOString().slice(0, 10);
  const supabase = {
    from(table) {
      let single = false;
      const builder = { select() { return builder; }, eq() { return builder; }, is() { return builder; }, order() { return builder; }, limit() { return builder; }, range() { return builder; }, gte() { return builder; }, lte() { return builder; }, maybeSingle() { single = true; return builder; },
        then(resolveResult) {
          const rows = table === 'short_links' ? [sampleLink] : table === 'users' ? [{ full_name: 'Hub Owner' }] : table === 'short_link_daily' ? [{ day: today, visits: 63, clicks: 41 }] : [];
          return Promise.resolve({ data: single ? rows[0] : rows, count: rows.length, error: null }).then(resolveResult);
        },
      };
      return builder;
    },
  };
  function load(specifier, parent = resolve('package.json')) {
    if (specifier === 'server-only') return {};
    if (specifier.endsWith('.module.css')) return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
    if (specifier === '@/lib/executive-access') return { requireExecutive: async () => ({ role, supabase }), getExecutiveAccess: async () => ({ role, supabase }) };
    if (specifier === '@/lib/public-short-links') return { resolvePublicLink: async () => ({ state: 'intro', destination_url: sampleLink.destination_url, title: sampleLink.intro_title, message: sampleLink.intro_message, button: sampleLink.intro_button }) };
    if (specifier.startsWith('@/app/actions/')) return { saveShortLink: async () => ({}), changeLinkStatus: async () => ({}), updateExecutiveAccess: async () => ({}), signOut: async () => {} };
    if (specifier === 'next/link') return { default: ({ href, children, prefetch: _prefetch, ...props }) => createElement('a', { href, ...props }, children), __esModule: true };
    if (specifier === 'next/navigation') return { notFound() { throw new Error('Not found'); }, redirect() { throw new Error('Redirect'); } };
    if (!specifier.startsWith('.') && !specifier.startsWith('@/')) return require(specifier);
    const base = specifier.startsWith('@/') ? resolve(specifier.slice(2)) : resolve(dirname(parent), specifier);
    const file = [base, `${base}.tsx`, `${base}.ts`].find((candidate) => existsSync(candidate));
    if (!file) throw new Error(`Cannot load fixture module ${specifier}`);
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} }; cache.set(file, module);
    const compiled = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
    new Function('require', 'module', 'exports', compiled)((name) => load(name, file), module, module.exports);
    return module.exports;
  }
  return load;
}
export async function renderExecutivePreview(page, role = 'super_admin') {
  const load = previewModules(role);
  const pages = { hub: '@/app/admin/page', links: '@/app/admin/links/page', detail: '@/app/admin/links/[id]/page', new: '@/app/admin/links/new/page', intro: '@/app/go/[slug]/preview/page' };
  const Page = load(pages[page]).default;
  const body = await Page({ params: Promise.resolve({ id: sampleLink.id, slug: sampleLink.slug }), searchParams: Promise.resolve({}) });
  if (page === 'intro') return renderToStaticMarkup(body);
  const Layout = load('@/app/admin/layout').default;
  return renderToStaticMarkup(await Layout({ children: body }));
}
