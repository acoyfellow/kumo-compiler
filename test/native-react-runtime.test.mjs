import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';

const root = new URL('../', import.meta.url);
const kinds = ['checkbox', 'switch'];
import { normalizeInlineStyleResources } from '../scripts/build-canonical-react-runtimes.mjs';

async function command(executable, args, options = {}) {
  const child = spawn(executable, args, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], ...options });
  let stderr = '';
  child.stderr.on('data', chunk => stderr += chunk);
  const [code] = await once(child, 'exit');
  assert.equal(code, 0, stderr);
}

test('canonical React SSR hoists inline style resources without URL-like hrefs', () => {
  const markup='<style data-precedence="base-ui:low" data-href="base-ui-disable-scrollbar">.base-ui-disable-scrollbar{scrollbar-width:none}</style><main><p>hydrated</p></main>';
  const normalized=normalizeInlineStyleResources(markup);
  assert.equal(normalized.body,'<main><p>hydrated</p></main>');
  assert.deepEqual(normalized.styles,['<style>.base-ui-disable-scrollbar{scrollbar-width:none}</style>']);
  assert.deepEqual(normalized.resources,[{name:'base-ui-disable-scrollbar',css:'.base-ui-disable-scrollbar{scrollbar-width:none}'}]);
  assert.doesNotMatch(normalized.styles[0], /href=/);
});

test('canonical Sidebar fixture disables viewport-dependent first render', async () => {
  const generator = await readFile(new URL('../scripts/generate-canonical-react-runtimes.mjs', import.meta.url), 'utf8');
  assert.match(generator, /sidebar:`<CanonicalComponent\.Provider mobileBreakpoint=\{1\}>/);
});

test('standalone React builds emit their runtime HTML and all referenced assets are served', { timeout: 30_000 }, async () => {
  const canonicalRoot = await mkdtemp(join(tmpdir(), 'native-react-'));
  try {
   for (const kind of kinds) {
    const outDir = join(canonicalRoot, kind, 'public-runtime');
    await command(process.execPath, ['node_modules/vite/bin/vite.js', 'build', `runtime/${kind}/react`, '--outDir', outDir]);
    const html = await readFile(join(outDir, 'index.html'), 'utf8');
    assert.match(html, new RegExp(`/${kind}/react/assets/react-${kind}\\.js`));
    assert.match(html, new RegExp(`/${kind}/react/assets/[^"']+\\.css`));
  }

  const port = 46_000 + process.pid % 1_000;
  const server = spawn(process.execPath, ['review/server.mjs'], {
    cwd: root,
    env: { ...process.env, PORT: String(port), KUMO_CANONICAL_RUNTIME_ROOT: canonicalRoot },
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
  } finally {
    await rm(canonicalRoot, { recursive: true, force: true });
  }
});
