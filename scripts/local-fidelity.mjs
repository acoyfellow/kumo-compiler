// Fast LOCAL native-vs-React class-fidelity loop for the Kumo compiler.
//
// Why this exists: the existing conformance/native-demo harnesses verify that a
// native component RENDERS and BEHAVES (clicks toggle, dialogs open, etc). They do
// NOT verify that the native element carries the SAME real Kumo utility classes the
// canonical React component emits. That gap let the Field/Input regression ship: the
// native (published) Field emits invented BEM classes `kumo-field__input` /
// `kumo-field__label` instead of React's real `border-0 bg-kumo-control ring
// ring-kumo-line rounded-lg px-3 h-9 ...`. Render/behavior checks were green; the
// component just looked wrong.
//
// This script renders, for each component, the CANONICAL React (@cloudflare/kumo)
// and each generated native framework (svelte/vue/solid) side by side in a headless
// page, extracts the actual rendered class string of the key element(s), and diffs
// class fidelity:
//   - lookalike       native emits an invented `kumo-*`/`kumo-*__*` BEM class React never emits
//   - missing-classes native is missing real Kumo (`*kumo-*`) utility classes React has
//   - missing-chrome  native carries none of React's real Kumo identity classes
//   - match           native carries the same real Kumo classes React does
// It exits non-zero on any lookalike / missing-class(es) / missing-chrome mismatch so
// it can gate `npm publish`. It also writes a side-by-side screenshot per component to
// /tmp/fidelity/<component>.png so a human can look.
//
// NO PUBLISH. NO DEPLOY. It renders the built native packages under dx/packages
// (exactly what `npm publish` would ship — the `@acoyfellow/kumo-*` the vite configs
// alias to) and the installed canonical React (@cloudflare/kumo). For `field` those
// shipped packages pull in the legacy override that generated/libraries alone does not
// reveal — which is precisely why the pre-publish render/behavior checks missed it.

import {readFile, writeFile, mkdir, rm, symlink} from 'node:fs/promises';
import {existsSync, readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {spawn, spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {resolve, dirname, basename, extname} from 'node:path';
import {tmpdir} from 'node:os';

const root = resolve(import.meta.dirname, '..');
const chrome = process.env.CHROME_PATH ||
  '/Users/jcoeyman/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const viteBin = resolve(root, 'node_modules/.bin/vite');
const kumoCss = resolve(root, 'node_modules/@cloudflare/kumo/dist/styles/kumo-standalone.css');
const outDir = '/tmp/fidelity';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const FRAMEWORKS = ['svelte', 'vue', 'solid'];
const SOURCES = ['react', ...FRAMEWORKS];

// ---------------------------------------------------------------------------
// Component recipes. `sub` is the export subpath, `symbol` the named export.
// `react` is the JSX rendered via canonical @cloudflare/kumo. `props`/`children`
// drive the native mount (mirrors scripts/libraries/build-gallery.mjs mounting,
// but WITHOUT the `fixture` escape-hatch prop so natives render the realistic,
// consumer-visible path — which is where the legacy BEM leaks).
// ---------------------------------------------------------------------------
const RECIPES = {
  button: {sub: 'button', symbol: 'Button', react: `<Button>Save changes</Button>`, props: {}, children: 'Save changes'},
  badge: {sub: 'badge', symbol: 'Badge', react: `<Badge>PRO</Badge>`, props: {}, children: 'PRO'},
  input: {sub: 'input', symbol: 'Input', react: `<Input aria-label="Input" defaultValue="example" />`, props: {'aria-label': 'Input', placeholder: 'Input', value: 'example', defaultValue: 'example'}, children: ''},
  field: {sub: 'field', symbol: 'Field', react: `<Field id="field-control" label="Name" description="Help" defaultValue="example" />`, props: {id: 'field-control', label: 'Name', description: 'Help', value: 'example'}, children: ''},
  meter: {sub: 'meter', symbol: 'Meter', react: `<Meter label="Storage" value={65} />`, props: {label: 'Storage', value: 65}, children: ''},
  checkbox: {sub: 'checkbox', symbol: 'Checkbox', react: `<Checkbox defaultChecked aria-label="Audit checkbox" />`, props: {'aria-label': 'Audit checkbox', defaultChecked: true}, children: ''},
  switch: {sub: 'switch', symbol: 'Switch', react: `<Switch defaultChecked aria-label="Audit switch" />`, props: {'aria-label': 'Audit switch', defaultChecked: true}, children: ''},
  tabs: {sub: 'tabs', symbol: 'Tabs', react: `<Tabs tabs={[{value:'overview',label:'Overview'},{value:'settings',label:'Settings'}]} value="overview" />`, props: {tabs: [{value: 'overview', label: 'Overview'}, {value: 'settings', label: 'Settings'}], selectedValue: 'overview', value: 'overview'}, children: ''},
};
const DEFAULT_COMPONENTS = Object.keys(RECIPES);

// ---------------------------------------------------------------------------
// Consumer shim: the shared per-framework vite configs alias `@acoyfellow/kumo-*`
// to `<KUMO_CONSUMER>/node_modules/@acoyfellow/kumo-*/package/...` and the native
// runtimes to `<KUMO_CONSUMER>/node_modules/{svelte,vue,solid-js}`. We build that
// consumer with symlinks (no npm install — fast) pointing at the built dx packages
// and the repo's runtimes, so we render exactly the shipped package artifacts.
// ---------------------------------------------------------------------------
async function ensureConsumer() {
  const consumer = resolve(outDir, '.consumer');
  const nm = resolve(consumer, 'node_modules');
  await rm(consumer, {recursive: true, force: true});
  await mkdir(resolve(nm, '@acoyfellow'), {recursive: true});
  for (const fw of FRAMEWORKS) {
    const pkgDir = resolve(root, 'dx/packages', `kumo-${fw}`);
    if (!existsSync(resolve(pkgDir, 'package'))) throw new Error(`missing built package dx/packages/kumo-${fw}/package — run \`npm run generate\` then the library build first`);
    await symlink(pkgDir, resolve(nm, '@acoyfellow', `kumo-${fw}`));
  }
  for (const dep of ['svelte', 'vue', 'solid-js']) await symlink(resolve(root, 'node_modules', dep), resolve(nm, dep));
  return consumer;
}

function entrySource(source, recipe) {
  const {sub, symbol, props, children} = recipe;
  const p = JSON.stringify(props);
  const child = JSON.stringify(children || '');
  if (source === 'react') {
    return `import React from 'react';\nimport {createRoot} from 'react-dom/client';\nimport { ${symbol} } from '@cloudflare/kumo/components/${sub}';\nfunction Demo(){return (${recipe.react});}\ncreateRoot(document.getElementById('mount-react')).render(React.createElement(Demo));\nrequestAnimationFrame(()=>requestAnimationFrame(()=>{setTimeout(()=>{window.__done_react=true},80)}));`;
  }
  if (source === 'svelte') {
    return `import {mount, createRawSnippet} from 'svelte';\nimport { ${symbol} } from '@acoyfellow/kumo-svelte/${sub}';\nconst props={...${p}};\nconst child=${child};\nif(child)props.children=createRawSnippet(()=>({render:()=>child}));\nmount(${symbol},{target:document.getElementById('mount-svelte'),props});\nwindow.__done_svelte=true;`;
  }
  if (source === 'vue') {
    return `import {createApp,h} from 'vue';\nimport { ${symbol} } from '@acoyfellow/kumo-vue/${sub}';\nconst props=${p};\nconst child=${child};\ncreateApp({render:()=>h(${symbol},props,child?{default:()=>child}:undefined)}).mount(document.getElementById('mount-vue'));\nwindow.__done_vue=true;`;
  }
  // solid
  return `import {render} from 'solid-js/web';\nimport {createComponent} from 'solid-js';\nimport { ${symbol} } from '@acoyfellow/kumo-solid/${sub}';\nconst props=${p};\nconst child=${child};\nrender(()=>createComponent(${symbol},{...props,...(child?{children:child}:{})}),document.getElementById('mount-solid'));\nwindow.__done_solid=true;`;
}

const viteConfigFor = source =>
  source === 'react'
    ? resolve(root, 'scripts/observable-vite.config.mjs')
    : resolve(root, `proof/dx/conformance/shared/${source}-vite.config.mjs`);

const entryExt = source => (source === 'vue' || source === 'svelte' ? 'js' : 'jsx');

function buildBundle(source, recipe, buildDir, consumer) {
  const ext = entryExt(source);
  const entry = resolve(buildDir, `entry-${source}.${ext}`);
  const out = resolve(buildDir, `${source}.js`);
  writeFileSyncSafe(entry, entrySource(source, recipe));
  const env = {
    ...process.env,
    KUMO_ROOT: root,
    KUMO_ENTRY: entry,
    KUMO_OUT: out,
    KUMO_NODE_ENV: 'production',
    KUMO_CACHE: resolve(buildDir, `.vite-${source}`),
    ...(source === 'react' ? {} : {KUMO_CONSUMER: consumer}),
  };
  const r = spawnSync(viteBin, ['build', '--config', viteConfigFor(source)], {cwd: buildDir, env, encoding: 'utf8'});
  if (r.status !== 0) return {ok: false, error: (r.stderr || r.stdout || 'vite build failed').slice(0, 800)};
  return {ok: true, out};
}

function writeFileSyncSafe(p, content) {
  mkdirSync(dirname(p), {recursive: true});
  writeFileSync(p, content);
}

// ---------------------------------------------------------------------------
// Headless Chromium over CDP (playwright chromium; never the app-automation Chrome).
// ---------------------------------------------------------------------------
async function browser() {
  const profile = `${tmpdir()}/kumo-fidelity-${process.pid}-${Date.now()}`;
  const child = spawn(chrome, ['--headless=new', '--no-first-run', '--disable-extensions', `--user-data-dir=${profile}`, '--remote-debugging-port=0', 'about:blank'], {stdio: 'ignore'});
  let port;
  for (let i = 0; i < 100; i++) { try { port = (await readFile(`${profile}/DevToolsActivePort`, 'utf8')).split(/\s/)[0]; break; } catch { await sleep(50); } }
  if (!port) throw new Error('Chrome CDP unavailable');
  const pages = await fetch(`http://127.0.0.1:${port}/json`).then(r => r.json());
  const ws = new WebSocket(pages.find(x => x.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => (ws.onopen = r));
  let id = 0; const pending = new Map();
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id) { pending.get(m.id)?.(m); pending.delete(m.id); } };
  const send = (method, params = {}) => new Promise((ok, no) => { const n = ++id; pending.set(n, m => (m.error ? no(new Error(m.error.message)) : ok(m.result))); ws.send(JSON.stringify({id: n, method, params})); });
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {width: 1440, height: 460, deviceScaleFactor: 2, mobile: false});
  return {child, ws, send};
}
const evalValue = (send, expression) => send('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true}).then(x => x.result.value);

// ---------------------------------------------------------------------------
// Class fidelity comparison.
// ---------------------------------------------------------------------------
const tokenize = cls => (cls || '').split(/\s+/).filter(Boolean);
// A real Kumo identity utility carries the design-token namespace, e.g.
// bg-kumo-control, ring-kumo-line, text-kumo-default, focus:ring-kumo-focus/50,
// kumo-input-placeholder. React emits these; faithful natives must too.
const isRealKumo = t => /kumo-/.test(t);
// An invented BEM lookalike: a bare `kumo-<block>` or `kumo-<block>__<el>` class
// (no utility prefix). React NEVER emits these; the legacy Field does.
const isLookalikeShape = t => /^kumo-[a-z0-9]+(?:__[a-z0-9-]+)?(?:--[a-z0-9-]+)?$/.test(t);

function collect(html) {
  const classes = new Set();
  const styles = [];
  for (const m of (html || '').matchAll(/class="([^"]*)"/g)) for (const t of tokenize(m[1])) classes.add(t);
  for (const m of (html || '').matchAll(/style="([^"]*)"/g)) styles.push(m[1]);
  return {classes, styles};
}

function classify(reactHtml, nativeHtml) {
  const react = collect(reactHtml);
  const native = collect(nativeHtml);
  const reactKumo = [...react.classes].filter(isRealKumo);
  const nativeKumo = [...native.classes].filter(isRealKumo);
  const lookalikes = [...native.classes].filter(t => isLookalikeShape(t) && !react.classes.has(t));
  const missing = reactKumo.filter(t => !native.classes.has(t));
  let fidelity;
  if (lookalikes.length) fidelity = 'lookalike';
  else if (reactKumo.length && nativeKumo.length === 0) fidelity = 'missing-chrome';
  else if (missing.length) fidelity = 'missing-classes';
  else fidelity = 'match';
  return {
    fidelity,
    lookalikes: lookalikes.sort(),
    missing: missing.sort(),
    reactKumoCount: reactKumo.length,
    nativeKumoCount: nativeKumo.length,
    nativeClassSample: [...native.classes].slice(0, 24),
  };
}

// ---------------------------------------------------------------------------
async function renderComponent(name, b, consumer) {
  const recipe = RECIPES[name];
  if (!recipe) throw new Error(`unknown component ${name}`);
  const buildDir = resolve(outDir, '.build', name);
  await rm(buildDir, {recursive: true, force: true});
  await mkdir(buildDir, {recursive: true});

  const bundles = {}; const buildErrors = {};
  for (const source of SOURCES) {
    const res = buildBundle(source, recipe, buildDir, consumer);
    if (res.ok) bundles[source] = res.out; else buildErrors[source] = res.error;
  }

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<link rel="stylesheet" href="/kumo.css">
${FRAMEWORKS.map(fw => `<link rel="stylesheet" href="/styles-${fw}.css">`).join('\n')}
<style>*{box-sizing:border-box}body{margin:0;font-family:system-ui;background:#fff;color:#111}
.cols{display:flex;align-items:stretch}
.col{flex:1;padding:18px;border-right:1px solid #e5e7eb;min-height:150px}
.col:last-child{border-right:0}
.col h4{margin:0 0 14px;font:700 11px system-ui;letter-spacing:.08em;color:#64748b;text-transform:uppercase}
.mount{min-height:60px}</style></head>
<body><div class="cols">
${SOURCES.map(s => `<div class="col"><h4>${s}</h4><div class="mount" id="mount-${s}"></div></div>`).join('\n')}
</div>
${SOURCES.filter(s => bundles[s]).map(s => `<script type="module" src="/${s}.js"></script>`).join('\n')}
</body></html>`;

  const server = createServer((req, res) => {
    const url = req.url.split('?')[0];
    const done = (type, body) => { res.setHeader('content-type', type); res.end(body); };
    if (url === '/' || url === '/index.html') return done('text/html; charset=utf-8', html);
    if (url === '/kumo.css') return done('text/css', readFileSync(kumoCss));
    const fwStyle = url.match(/^\/styles-(svelte|vue|solid)\.css$/);
    if (fwStyle) {
      const p = resolve(root, 'dx/packages', `kumo-${fwStyle[1]}`, 'package/styles.css');
      return done('text/css', existsSync(p) ? readFileSync(p) : '');
    }
    const bundle = url.match(/^\/(react|svelte|vue|solid)\.js$/);
    if (bundle && bundles[bundle[1]]) return done('text/javascript; charset=utf-8', readFileSync(bundles[bundle[1]]));
    res.statusCode = 404; res.end('not found');
  });
  const port = await new Promise(ok => server.listen(0, '127.0.0.1', () => ok(server.address().port)));

  try {
    await b.send('Page.navigate', {url: `http://127.0.0.1:${port}/`});
    // Wait for every successfully-built source to signal mount completion.
    const needed = SOURCES.filter(s => bundles[s]);
    const readyExpr = `(()=>{return ${JSON.stringify(needed)}.every(s=>window['__done_'+s]===true)})()`;
    for (let i = 0; i < 120; i++) { if (await evalValue(b.send, readyExpr).catch(() => false)) break; await sleep(100); }
    await sleep(400); // let framework effects settle (tabs, base-ui)

    const htmlBySource = await evalValue(b.send, `(()=>{const o={};for(const s of ${JSON.stringify(SOURCES)}){const el=document.getElementById('mount-'+s);o[s]=el?el.innerHTML:''}return o})()`);

    await mkdir(outDir, {recursive: true});
    const shot = await b.send('Page.captureScreenshot', {format: 'png', captureBeyondViewport: true, clip: await clipOfCols(b.send)});
    const screenshotPath = resolve(outDir, `${name}.png`);
    await writeFile(screenshotPath, Buffer.from(shot.data, 'base64'));

    const frameworks = {};
    for (const fw of FRAMEWORKS) {
      if (buildErrors[fw]) { frameworks[fw] = {fidelity: 'build-error', error: buildErrors[fw]}; continue; }
      frameworks[fw] = classify(htmlBySource.react || '', htmlBySource[fw] || '');
    }
    return {component: name, reactRendered: !!(htmlBySource.react && htmlBySource.react.trim()), reactBuildError: buildErrors.react || null, frameworks, screenshot: screenshotPath};
  } finally {
    server.close();
  }
}

async function clipOfCols(send) {
  const box = await evalValue(send, `(()=>{const el=document.querySelector('.cols');const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:Math.ceil(r.width),height:Math.ceil(r.height)}})()`).catch(() => null);
  return box && box.width ? {...box, scale: 1} : {x: 0, y: 0, width: 1440, height: 460, scale: 1};
}

// ---------------------------------------------------------------------------
function printTable(report) {
  const rows = [['component', 'framework', 'fidelity', 'offending classes']];
  for (const c of report.components)
    for (const fw of FRAMEWORKS) {
      const r = c.frameworks[fw];
      const offending = r.fidelity === 'lookalike' ? r.lookalikes.join(' ')
        : r.fidelity === 'missing-classes' ? `missing: ${r.missing.slice(0, 6).join(' ')}${r.missing.length > 6 ? ' …' : ''}`
        : r.fidelity === 'missing-chrome' ? `missing all real kumo classes (react has ${r.reactKumoCount})`
        : r.fidelity === 'build-error' ? (r.error || '').split('\n')[0].slice(0, 60)
        : '';
      rows.push([c.component, fw, r.fidelity, offending]);
    }
  const w = rows[0].map((_, i) => Math.min(72, Math.max(...rows.map(r => String(r[i]).length))));
  const line = r => r.map((cell, i) => String(cell).slice(0, 72).padEnd(w[i])).join('  ');
  console.log('\n' + line(rows[0]));
  console.log(w.map(x => '-'.repeat(x)).join('  '));
  for (const r of rows.slice(1)) console.log(line(r));
}

async function main() {
  const arg = process.argv.find(a => a.startsWith('--component='));
  const requested = arg ? arg.split('=')[1].split(',').map(s => s.trim()).filter(Boolean) : DEFAULT_COMPONENTS;
  for (const c of requested) if (!RECIPES[c]) throw new Error(`unknown --component=${c}; known: ${DEFAULT_COMPONENTS.join(', ')}`);

  await mkdir(outDir, {recursive: true});
  const consumer = await ensureConsumer();
  const b = await browser();
  const components = [];
  try {
    for (const name of requested) {
      process.stderr.write(`fidelity: rendering ${name} …\n`);
      components.push(await renderComponent(name, b, consumer));
    }
  } finally {
    b.ws.close(); b.child.kill();
  }

  const mismatches = [];
  for (const c of components)
    for (const fw of FRAMEWORKS) {
      const f = c.frameworks[fw].fidelity;
      if (f !== 'match') mismatches.push({component: c.component, framework: fw, fidelity: f, ...c.frameworks[fw]});
    }

  const report = {
    schemaVersion: 'kumo.local-fidelity/v1',
    observedAt: new Date().toISOString(),
    canonical: '@cloudflare/kumo (installed) rendered vs built native packages dx/packages/kumo-{svelte,vue,solid}',
    note: 'Renders the shipped native package artifacts (the @acoyfellow/kumo-* the vite configs alias to). No publish, no deploy.',
    components,
    mismatchCount: mismatches.length,
    mismatches,
    status: mismatches.length ? 'failed' : 'passed',
    screenshots: Object.fromEntries(components.map(c => [c.component, c.screenshot])),
  };
  const reportPath = resolve(outDir, 'report.json');
  await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
  await mkdir(resolve(root, 'proof/local-fidelity'), {recursive: true});
  await writeFile(resolve(root, 'proof/local-fidelity/latest.json'), JSON.stringify(report, null, 2) + '\n');

  printTable(report);
  console.log(`\nReport: ${reportPath}  (also proof/local-fidelity/latest.json)`);
  console.log(`Screenshots: ${outDir}/<component>.png`);
  console.log(`Status: ${report.status}; mismatches=${mismatches.length}`);
  if (mismatches.length) process.exit(1);
}

main().catch(e => { console.error(e.stack || String(e)); process.exit(1); });
