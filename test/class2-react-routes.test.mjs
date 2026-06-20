import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { class2Components } from '../runtime-routes.mjs';

const root = new URL('../', import.meta.url);

test('all Class 2 React pages and their relative assets are routable', { timeout: 30_000 }, async () => {
  assert.equal(class2Components.length, 29, 'audit must cover all 29 Class 2 components');
  const port = 47_000 + process.pid % 1_000;
  const server = spawn(process.execPath, ['review/server.mjs'], {
    cwd: root,
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  try {
    await Promise.race([
      once(server.stdout, 'data'),
      once(server, 'exit').then(([code]) => { throw new Error(`review server exited ${code}`); }),
    ]);
    for (const component of class2Components) {
      const page = await fetch(`http://127.0.0.1:${port}/${component}/react`);
      assert.equal(page.status, 200, `${component} HTML`);
      assert.equal(new URL(page.url).pathname, `/${component}/react/`, `${component} canonical route`);
      const html = await page.text();
      const assets = [...html.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css))(?:\?[^"']*)?["']/g)]
        .map(match => new URL(match[1], page.url));
      assert.ok(assets.length > 0, `${component} has audited assets`);
      for (const asset of assets) {
        const response = await fetch(asset);
        assert.equal(response.status, 200, `${component} asset ${asset.pathname}`);
      }
    }
  } finally {
    server.kill('SIGTERM');
    await once(server, 'exit').catch(() => {});
  }
});
