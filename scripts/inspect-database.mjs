// Read-only inventory. Never returns row values, credentials, or stored files.
import { existsSync } from 'node:fs';

if (existsSync('.env.local')) process.loadEnvFile('.env.local');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Supabase URL and service-role key are required.');
const headers = { apikey: key, Authorization: `Bearer ${key}` };

async function request(path, options = {}) {
  return fetch(new URL(path, url), {
    ...options,
    headers: { ...headers, ...options.headers },
    signal: AbortSignal.timeout(30000),
  });
}

const schemaResponse = await request('/rest/v1/', {
  headers: { Accept: 'application/openapi+json' },
});
if (!schemaResponse.ok) throw new Error(`Schema inventory failed (${schemaResponse.status}).`);
const schema = await schemaResponse.json();
const inventory = [];
for (const [name, definition] of Object.entries(schema.definitions ?? {})) {
  const response = await request(`/rest/v1/${encodeURIComponent(name)}?select=*&limit=0`, {
    method: 'HEAD', headers: { Prefer: 'count=exact' },
  });
  inventory.push({
    relation: name,
    status: response.status,
    rows: response.headers.get('content-range')?.split('/')[1] ?? null,
    columns: Object.entries(definition.properties ?? {}).map(([column, value]) => ({
      name: column, type: value.format ?? value.type,
    })),
  });
}
const bucketsResponse = await request('/storage/v1/bucket');
const buckets = bucketsResponse.ok ? await bucketsResponse.json() : [];
console.log(JSON.stringify({
  checkedAt: new Date().toISOString(),
  scope: 'REST-visible relations only; does not verify migration history, SQL dependencies, grants, external clients, or scheduled jobs.',
  relations: inventory,
  buckets: buckets.map(({ id, public: isPublic }) => ({ id, public: isPublic })),
}, null, 2));
