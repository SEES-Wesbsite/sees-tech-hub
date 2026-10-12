import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, relative, isAbsolute, sep } from 'node:path';
import { spawnSync } from 'node:child_process';

// Run after next build. Test only traced deployment files, not the full checkout.
const root = process.cwd();
const route = '.next/server/app/api/og/volunteer/route.js';
const routePath = join(root, route);
const manifest = JSON.parse(readFileSync(routePath + '.nft.json', 'utf8'));
const temporaryRoot = resolve(tmpdir());
const bundle = mkdtempSync(join(temporaryRoot, 'sees-og-bundle-'));
try {
  const files = [routePath, ...manifest.files.map(file => resolve(dirname(routePath), file))];
  for (const file of files) {
    const local = relative(root, file);
    assert.ok(!isAbsolute(local) && local !== '..' && !local.startsWith('..' + sep), 'Trace file escapes repository');
    const destination = join(bundle, local);
    mkdirSync(dirname(destination), { recursive: true });
    copyFileSync(file, destination);
  }
  const result = spawnSync(process.execPath, ['--input-type=commonjs', '-e', `
    const assert = require('node:assert/strict');
    (async () => {
      const route = require('./.next/server/app/api/og/volunteer/route.js');
      const response = await route.routeModule.userland.GET();
      assert.equal(response.status, 200);
      assert.ok(response.headers.get('content-type').includes('image/png'));
      const png = Buffer.from(await response.arrayBuffer());
      assert.equal(png.subarray(1, 4).toString(), 'PNG');
      assert.equal(png.readUInt32BE(16), 1200);
      assert.equal(png.readUInt32BE(20), 630);
      console.log('Isolated volunteer OG bundle: 1200×630 PNG rendered successfully');
    })().catch(error => { console.error(error); process.exitCode = 1; });
  `], { cwd: bundle, encoding: 'utf8', env: { ...process.env, NODE_ENV: 'production', NODE_PATH: '' } });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error) throw result.error;
  assert.equal(result.status, 0, 'Isolated deployment bundle failed to render the volunteer image');
} finally {
  // Only remove the temporary directory created by this check.
  assert.equal(dirname(resolve(bundle)), temporaryRoot);
  assert.ok(relative(temporaryRoot, bundle).startsWith('sees-og-bundle-'));
  rmSync(bundle, { recursive: true, force: true });
}
