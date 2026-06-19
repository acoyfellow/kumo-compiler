import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import React from '/Users/jcoeyman/cloudflare/kumo-port-lab-SLOP/node_modules/react/index.js';
import { renderToStaticMarkup } from '/Users/jcoeyman/cloudflare/kumo-port-lab-SLOP/node_modules/react-dom/server.node.js';
import { Select as ReactSelect } from '/Users/jcoeyman/cloudflare/kumo-port-lab-SLOP/node_modules/@cloudflare/kumo/dist/components/select.js';

const app = new Hono();
const root = resolve(import.meta.dirname, '..');
const frameworks = new Set(['vue', 'svelte', 'solid']);
const canonicalCss = readFileSync('/Users/jcoeyman/cloudflare/kumo-port-lab-SLOP/node_modules/@cloudflare/kumo/dist/styles/kumo-standalone.css', 'utf8');
const items = { apple: 'Apple', banana: 'Banana', cherry: 'Cherry' };
const canonical = renderToStaticMarkup(React.createElement(ReactSelect, { label: 'Fruit', placeholder: 'Choose fruit', items, description: 'Choose the closest region.' })) + renderToStaticMarkup(React.createElement(ReactSelect, { label: 'Error', placeholder: 'Select an option', items, error: 'Selection required' }));
const reactPage = `<!doctype html><html><head><meta charset="utf-8"><title>Select React</title><style>${canonicalCss}</style><style>body{padding:32px;background:#fff}.shell{max-width:420px}.title{font-size:32px;margin:0 0 24px}</style></head><body><div class="shell"><h1 class="title">Select</h1>${canonical}</div></body></html>`;

app.get('/select/react', (c) => c.html(reactPage));
for (const framework of frameworks) {
  app.get(`/select/${framework}`, (c) => c.html(readFileSync(resolve(root, `runtime/${framework}/public-runtime/index.html`), 'utf8')));
}
app.get('/select/:framework/assets/:file', (c) => {
  const { framework, file } = c.req.param();
  if (!frameworks.has(framework) || !/^[\w.-]+$/.test(file)) return c.notFound();
  const body = readFileSync(resolve(root, `runtime/${framework}/public-runtime/assets/${file}`));
  const type = file.endsWith('.css') ? 'text/css; charset=utf-8' : 'text/javascript; charset=utf-8';
  return c.body(body, 200, { 'Content-Type': type });
});
app.get('/select/compare', (c) => c.html(`<!doctype html><html><head><meta charset="utf-8"><title>Select runtime comparison</title><style>body{margin:0;background:#111;color:#fff;font:14px system-ui}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:16px}.cell{min-width:0;border:1px solid #444}.label{padding:8px;background:#222;font-weight:700}iframe{display:block;width:100%;height:420px;border:0}</style></head><body><div class="grid">${[['React','react'],['Vue','vue'],['Svelte','svelte'],['Solid','solid']].map(([label,route]) => `<div class="cell"><div class="label">${label} runtime</div><iframe title="${label}" src="/select/${route}"></iframe></div>`).join('')}</div></body></html>`));

const port = Number(process.env.PORT || 4260);
serve({ fetch: app.fetch, port }, ({ port }) => console.log(`review server http://localhost:${port}/select/compare`));
