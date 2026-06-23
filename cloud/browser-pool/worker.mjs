// kumo-browser-pool: Cloudflare Browser Rendering trusted-CDP conformance executor.
// POST a prebuilt fixture + serialized vector plan; the Worker runs the SAME trusted
// observation protocol (one-tree hydration check, trusted CDP actions, probe evaluation,
// unfiltered diagnostics) as the local runner, in a cloud headless Chrome. Assertion
// checking stays on the caller (Node) side so receipts remain local authority.
//
// Body: {
//   html, clientJs, css, headHtml, beforeAppHtml, ready,
//   vectors: [{ id, actions:[...trusted actions], probes:[{kind, expr}] }]
// }
// Returns: { ok, vectors:[{ id, probes:{kind:value} }], diagnostics }
import puppeteer from '@cloudflare/puppeteer';

// Note: the synthetic/hydration escape-hatch ban is enforced by the caller against the
// hand-written fixture entry source. The compiled bundle legitimately contains framework
// runtime Event usage, so it is not re-scanned here.
const PAGE = ({ html = '', css = '', headHtml = '', beforeAppHtml = '', clientJs = '' }) =>
  `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:8px}#app>section{display:block;min-height:16px;margin-bottom:32px}</style>${headHtml}<style>${css}</style></head><body>${beforeAppHtml}<div id="app">${html}</div><script type="module">${clientJs}</script></body></html>`;
const sleep = n => new Promise(r => setTimeout(r, n));

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return new Response('kumo-browser-pool: POST a fixture', { status: 405 });
    let body;
    try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: 'invalid json' }), { status: 400 }); }
    const diagnostics = [], vectors = body.vectors || [];
    let browser;
    try {
      browser = await launchWithRetry(env.BROWSER);
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 900 });
      page.on('pageerror', e => diagnostics.push({ method: 'Runtime.exceptionThrown', params: { message: String(e) } }));
      page.on('console', m => { if (['error', 'warning'].includes(m.type())) diagnostics.push({ method: 'Runtime.consoleAPICalled', params: { type: m.type(), text: m.text() } }); });
      page.on('requestfailed', r => diagnostics.push({ method: 'Network.loadingFailed', params: { url: r.url() } }));
      page.on('response', r => { if (r.status() >= 400) diagnostics.push({ method: 'Network.responseReceived', params: { status: r.status(), url: r.url() } }); });
      const cdp = await page.createCDPSession();
      await page.setContent(PAGE(body), { waitUntil: 'load' });
      const ready = body.ready || '!!globalThis.__ready';
      for (let i = 0; i < 200; i++) { if (await page.evaluate(`(() => (${ready}))()`).catch(() => false)) break; await sleep(25); }
      await sleep(100);
      // One-tree hydration invariant (identical to local driver).
      const hydration = await page.evaluate(`(()=>{let app=document.querySelector('#app'),roots=[...app.children],vs=[...document.querySelectorAll('#app > [id^=v]')];return{appCount:document.querySelectorAll('#app').length,vectorCount:vs.length,uniqueIds:new Set(vs.map(x=>x.id)).size,connected:vs.every(x=>x.isConnected&&x.parentElement===app),extras:roots.filter(x=>!x.id?.startsWith('v')).map(x=>x.tagName)}})()`);
      if (hydration.appCount !== 1 || hydration.vectorCount !== vectors.length || hydration.uniqueIds !== vectors.length || !hydration.connected || hydration.extras.some(t => !['STYLE', 'LINK'].includes(t))) {
        return new Response(JSON.stringify({ ok: false, error: `one-tree hydration failed: ${JSON.stringify(hydration)}`, diagnostics }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      await page.evaluate(`[...document.querySelectorAll('#app > [id^=v]')].forEach((x,i)=>x.dataset.observableIdentity=String(i))`);
      const out = [];
      for (let i = 0; i < vectors.length; i++) {
        const v = vectors[i];
        const identity = await page.evaluate(`document.querySelector('#v${i}')?.dataset.observableIdentity`);
        if (identity !== String(i)) return new Response(JSON.stringify({ ok: false, error: `vector ${v.id}: hydrated root identity replaced`, diagnostics }), { status: 200, headers: { 'content-type': 'application/json' } });
        for (const a of v.actions || []) await applyAction(page, cdp, i, a);
        const probes = {};
        for (const p of v.probes || []) probes[p.kind] = await page.evaluate(`(() => (${p.expr}))()`);
        out.push({ id: v.id, probes });
      }
      await sleep(100);
      return new Response(JSON.stringify({ ok: true, vectors: out, diagnostics }), { headers: { 'content-type': 'application/json' } });
    } catch (error) {
      return new Response(JSON.stringify({ ok: false, error: String(error?.stack || error), diagnostics }), { status: 500, headers: { 'content-type': 'application/json' } });
    } finally {
      if (browser) await browser.close().catch(() => {});
    }
  }
};

// Browser Rendering sessions can be transiently busy; retry launch with backoff.
async function launchWithRetry(binding, attempts = 5) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try { return await puppeteer.launch(binding); }
    catch (error) { lastError = error; await sleep(400 * (i + 1)); }
  }
  throw lastError;
}

// Trusted action application using puppeteer's high-level API (real input, not synthetic events).
async function applyAction(page, cdp, i, a) {
  if (a.type === 'wait') { await sleep(a.ms); return; }
  if (a.type === 'viewport') { await page.setViewport({ width: a.width, height: a.height }); return; }
  const scope = a.scope === 'document' ? '' : `#v${i} `;
  const selector = `${scope}${a.selector || 'input,textarea,button,[role]'}`;
  const handles = await page.$$(selector);
  const handle = handles[a.target || 0];
  if (!handle && a.scope !== 'active') throw new Error(`target ${selector}[${a.target || 0}] not found`);
  if (a.type === 'click' || a.type === 'outside-pointer') { await handle.scrollIntoView().catch(() => {}); await handle.click(); }
  else if (a.type === 'focus') await handle.focus();
  else if (a.type === 'blur') { await handle.focus(); await page.keyboard.press('Tab'); }
  else if (a.type === 'key') { await handle.focus(); await page.keyboard.press(a.key === 'Space' ? ' ' : a.key); }
  else if (a.type === 'type') { await handle.focus(); if (a.editMode === 'replace') { await handle.evaluate(el => el.select()); } await page.keyboard.type(a.text); }
  else if (a.type === 'type-replace') { await handle.focus(); await handle.evaluate(el => el.select()); await page.keyboard.type(a.text); }
  else if (a.type === 'select') { await handle.focus(); await page.keyboard.press(a.value === 'Space' ? ' ' : a.value); }
  else throw new Error(`unsupported trusted action ${a.type}`);
  await sleep(a.wait ?? 30);
}
