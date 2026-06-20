import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

const root = new URL('../', import.meta.url);
const components = ['dialog', 'popover', 'field', 'input', 'input-group', 'input-area', 'sensitive-input', 'clipboard-text'];

// These declarations all differ from the browser defaults and are shared by
// visible elements in every Class 3 fixture.
const nonDefaultDeclarations = [/(?:background|background-color):/, /border(?:-radius)?:/, /padding:/];

test('Class 3 React builds serve real, non-empty Vite stylesheets', { timeout: 30_000 }, async () => {
  const port = 48_000 + process.pid % 1_000;
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
    for (const component of components) {
      const page = await fetch(`http://127.0.0.1:${port}/${component}/react/`);
      assert.equal(page.status, 200, `${component} page`);
      const html = await page.text();
      const cssLinks = [...html.matchAll(/href=["']([^"']+\.css(?:\?[^"']*)?)["']/g)];
      assert.equal(cssLinks.length, 1, `${component} has one framework-emitted stylesheet link`);
      const cssResponse = await fetch(new URL(cssLinks[0][1], page.url));
      assert.equal(cssResponse.status, 200, `${component} stylesheet`);
      assert.match(cssResponse.headers.get('content-type') ?? '', /^text\/css/, `${component} CSS content type`);
      const css = await cssResponse.text();
      assert.ok(css.length > 100, `${component} stylesheet is non-empty`);
      for (const declaration of nonDefaultDeclarations) {
        assert.match(css, declaration, `${component} CSS includes visible non-default styling`);
      }
    }
  } finally {
    server.kill('SIGTERM');
    await once(server, 'exit').catch(() => {});
  }
});
