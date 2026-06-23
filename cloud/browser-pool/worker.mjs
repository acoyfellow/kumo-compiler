// kumo-browser-pool: Cloudflare Browser Rendering proof-of-life.
// POST { html, clientJs, css, headHtml, beforeAppHtml, ready, probe }
// Launches a Browser Rendering session, sets the exact conformance page content,
// runs a trusted CDP session, returns the evaluated probe result + unfiltered diagnostics.
import puppeteer from '@cloudflare/puppeteer';

const PAGE = ({ html = '', css = '', headHtml = '', beforeAppHtml = '', clientJs = '' }) =>
  `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:8px}#app>section{display:block;min-height:16px;margin-bottom:32px}</style>${headHtml}<style>${css}</style></head><body>${beforeAppHtml}<div id="app">${html}</div><script type="module">${clientJs}</script></body></html>`;

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return new Response('kumo-browser-pool: POST a fixture', { status: 405 });
    let body;
    try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: 'invalid json' }), { status: 400 }); }
    const diagnostics = [];
    let browser;
    try {
      browser = await puppeteer.launch(env.BROWSER);
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 900 });
      page.on('pageerror', e => diagnostics.push({ method: 'Runtime.exceptionThrown', params: { message: String(e) } }));
      page.on('console', m => { if (['error', 'warning'].includes(m.type())) diagnostics.push({ method: 'Runtime.consoleAPICalled', params: { type: m.type(), text: m.text() } }); });
      page.on('requestfailed', r => diagnostics.push({ method: 'Network.loadingFailed', params: { url: r.url() } }));
      await page.setContent(PAGE(body), { waitUntil: 'networkidle0' });
      const ready = body.ready || '!!globalThis.__ready';
      for (let i = 0; i < 200; i++) { if (await page.evaluate(`(${'() => ' + ready})()`).catch(() => false)) break; await new Promise(r => setTimeout(r, 25)); }
      const probe = body.probe || '({ ok: typeof document !== "undefined", title: document.title, app: !!document.querySelector("#app") })';
      const result = await page.evaluate(`(() => (${probe}))()`);
      return new Response(JSON.stringify({ ok: true, result, diagnostics }), { headers: { 'content-type': 'application/json' } });
    } catch (error) {
      return new Response(JSON.stringify({ ok: false, error: String(error?.stack || error), diagnostics }), { status: 500, headers: { 'content-type': 'application/json' } });
    } finally {
      if (browser) await browser.close().catch(() => {});
    }
  }
};
