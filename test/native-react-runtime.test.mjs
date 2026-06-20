import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { once } from 'node:events';

const root = new URL('../', import.meta.url);
const kinds = ['checkbox', 'switch'];

async function command(executable, args, options = {}) {
  const child = spawn(executable, args, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], ...options });
  let stderr = '';
  child.stderr.on('data', chunk => stderr += chunk);
  const [code] = await once(child, 'exit');
  assert.equal(code, 0, stderr);
}

test('standalone React builds emit their runtime HTML and all referenced assets are served', { timeout: 30_000 }, async () => {
  for (const kind of kinds) {
    await command(process.execPath, ['node_modules/vite/bin/vite.js', 'build', `runtime/${kind}/react`]);
    const html = await readFile(new URL(`../runtime/${kind}/react/public-runtime/index.html`, import.meta.url), 'utf8');
    assert.match(html, new RegExp(`/${kind}/react/assets/react-${kind}\\.js`));
    assert.match(html, new RegExp(`/${kind}/react/assets/[^"']+\\.css`));
  }

  const port = 46_000 + process.pid % 1_000;
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
    for (const kind of kinds) {
      const page = await fetch(`http://127.0.0.1:${port}/${kind}/react`);
      assert.equal(page.status, 200);
      const html = await page.text();
      const assets = [...html.matchAll(/(?:src|href)="([^"?]+)"/g)].map(match => match[1]);
      assert.ok(assets.length >= 2);
      for (const asset of assets) {
        const response = await fetch(`http://127.0.0.1:${port}${asset}`);
        assert.equal(response.status, 200, asset);
      }
    }
  } finally {
    server.kill('SIGTERM');
    await once(server, 'exit').catch(() => {});
  }
});
