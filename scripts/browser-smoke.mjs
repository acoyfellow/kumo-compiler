import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {spawn} from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const port = Number(process.env.KUMO_SMOKE_PORT || 4321);
const origin = process.env.KUMO_SMOKE_ORIGIN || `http://127.0.0.1:${port}`;
const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const receiptPath = resolve(root, 'proof/browser-smoke/latest.json');
const strictConsole = process.env.KUMO_SMOKE_STRICT_CONSOLE === '1';

async function fetchOk(url) {
  try { const r = await fetch(url); return r.ok; } catch { return false; }
}

async function ensureServer() {
  if (await fetchOk(`${origin}/`)) return {owned: null};
  const child = spawn(process.execPath, ['review/server.mjs', `--port=${port}`], {cwd: root, stdio: ['ignore', 'pipe', 'pipe']});
  let log = '';
  child.stdout.on('data', d => { log += d.toString(); });
  child.stderr.on('data', d => { log += d.toString(); });
  for (let i = 0; i < 80; i++) {
    if (await fetchOk(`${origin}/`)) return {owned: child};
    await sleep(100);
  }
  child.kill();
  throw new Error(`local review server did not start on ${origin}\n${log}`);
}

async function connectChrome() {
  if (!existsSync(chrome)) throw new Error(`Chrome not found at ${chrome}; set CHROME_PATH`);
  const profile = `/tmp/kumo-browser-smoke-${process.pid}-${Date.now()}`;
  const child = spawn(chrome, [
    '--headless=new', '--no-first-run', '--disable-extensions', '--disable-background-networking',
    `--user-data-dir=${profile}`, '--remote-debugging-port=0', 'about:blank'
  ], {stdio: 'ignore'});
  let cdpPort;
  for (let i = 0; i < 100; i++) {
    try { cdpPort = (await readFile(`${profile}/DevToolsActivePort`, 'utf8')).split(/\s/)[0]; break; } catch { await sleep(50); }
  }
  if (!cdpPort) { child.kill(); throw new Error('Chrome DevTools port not available'); }
  const pages = await fetch(`http://127.0.0.1:${cdpPort}/json`).then(r => r.json());
  const ws = new WebSocket(pages.find(x => x.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolveOpen, rejectOpen) => { ws.onopen = resolveOpen; ws.onerror = rejectOpen; });
  let id = 0;
  const pending = new Map();
  const diagnostics = [];
  let currentRoute = 'startup';
  ws.onmessage = event => {
    const msg = JSON.parse(event.data);
    if (msg.id) {
      pending.get(msg.id)?.(msg);
      pending.delete(msg.id);
      return;
    }
    if (msg.method === 'Network.responseReceived' && msg.params.response.status >= 400) {
      diagnostics.push({route: currentRoute, kind: 'http', status: msg.params.response.status, url: msg.params.response.url, type: msg.params.type});
    }
    if (msg.method === 'Network.loadingFailed') {
      diagnostics.push({route: currentRoute, kind: 'network', errorText: msg.params.errorText, url: msg.params.requestId, type: msg.params.type});
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      diagnostics.push({route: currentRoute, kind: 'exception', text: msg.params.exceptionDetails?.text, url: msg.params.exceptionDetails?.url});
    }
    if (msg.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(msg.params.type)) {
      diagnostics.push({route: currentRoute, kind: 'console', level: msg.params.type, args: msg.params.args.map(a => a.value ?? a.description ?? a.type).join(' ')});
    }
  };
  const send = (method, params = {}) => new Promise((resolveSend, rejectSend) => {
    const n = ++id;
    pending.set(n, msg => msg.error ? rejectSend(new Error(`${method}: ${msg.error.message}`)) : resolveSend(msg.result));
    ws.send(JSON.stringify({id: n, method, params}));
  });
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {width: 1280, height: 900, deviceScaleFactor: 1, mobile: false});
  return {child, ws, send, diagnostics, setRoute(route) { currentRoute = route; }};
}

async function pageLoad(send, url) {
  await send('Page.navigate', {url});
  await sleep(450);
  const result = await send('Runtime.evaluate', {returnByValue: true, expression: `document.readyState`});
  if (!['interactive', 'complete'].includes(result.result.value)) await sleep(300);
}

async function clickRuntimeTabs(send) {
  const tabs = await send('Runtime.evaluate', {returnByValue: true, expression: `[...document.querySelectorAll('[data-runtime-tab]')].map(x=>x.dataset.runtimeTab)`});
  for (const tab of tabs.result.value ?? []) {
    await send('Runtime.evaluate', {expression: `[...document.querySelectorAll('[data-runtime-tab]')].find(x=>x.dataset.runtimeTab===${JSON.stringify(tab)})?.click()`});
    await sleep(250);
  }
}

async function smoke() {
  const catalog = JSON.parse(await readFile(resolve(root, 'generated/catalog.ir.json'), 'utf8'));
  const componentIds = catalog.components.map(c => c.id).sort();
  const routes = [
    '/', '/examples/', '/docs/', '/docs/progress/', '/docs/reference/packages/',
    ...componentIds.map(id => `/components/${id}/`),
    ...['vue', 'svelte', 'solid'].flatMap(framework => componentIds.map(id => `/${id}/${framework}`)),
    ...componentIds.map(id => `/${id}/react`)
  ];
  const server = await ensureServer();
  const browser = await connectChrome();
  const visited = [];
  try {
    for (const route of routes) {
      browser.setRoute(route);
      const before = browser.diagnostics.length;
      await pageLoad(browser.send, `${origin}${route}`);
      if (route.startsWith('/components/')) await clickRuntimeTabs(browser.send);
      visited.push({route, diagnostics: browser.diagnostics.length - before});
    }
  } finally {
    browser.ws.close();
    browser.child.kill();
    if (server.owned) server.owned.kill();
  }
  const failures = browser.diagnostics.filter(d => d.kind !== 'console' || strictConsole);
  const receipt = {schemaVersion: 'kumo.browser-smoke/v1', origin, strictConsole, componentCount: componentIds.length, routeCount: routes.length, visited, diagnostics: browser.diagnostics, failures, status: failures.length ? 'failed' : 'passed', observedAt: new Date().toISOString()};
  await mkdir(resolve(root, 'proof/browser-smoke'), {recursive: true});
  await writeFile(receiptPath, JSON.stringify(receipt, null, 2) + '\n');
  if (receipt.failures.length) {
    const sample = receipt.failures.slice(0, 20).map(d => JSON.stringify(d)).join('\n');
    throw new Error(`browser smoke found ${receipt.failures.length} failing diagnostics\n${sample}\nreceipt: ${receiptPath}`);
  }
  return receipt;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  smoke().then(r => console.log(`Browser smoke passed: ${r.routeCount} routes, ${r.componentCount} components`)).catch(err => { console.error(err.stack || err.message); process.exit(1); });
}

export {smoke};
