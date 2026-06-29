#!/usr/bin/env node
// build.mjs — Assemble the Kumo compiler referencer gallery.
//
// Reads the 108 frozen native component cells (vue/svelte/solid) from
// experiments/o3/cells/<component>__<framework>/dist, copies each built dist
// into experiments/o3/gallery/cells/<component>__<framework>/ (rewriting the
// absolute /kumo.css and /assets/ references to relative paths so they resolve
// when served as a static site), and emits a polished homepage that embeds each
// cell via <iframe> so the REAL native components render & interact.
//
// Output is fully self-contained under experiments/o3/gallery/.

import { mkdir, readFile, writeFile, cp, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));        // .../experiments/o3/gallery
const O3 = path.resolve(HERE, '..');                             // .../experiments/o3
const CELLS_SRC = path.join(O3, 'cells');
const CATALOG = path.join(O3, 'manifest', 'catalog.json');
const OUT_CELLS = path.join(HERE, 'cells');

const FRAMEWORKS = ['vue', 'svelte', 'solid'];

// --- Cell page framing -------------------------------------------------------
// Injected into every iframed cell page. Keeps the component canonical: only the
// page background, the demo wrapper's outsized padding, and centering change so
// the component sits centered with modest padding and the tile hugs it.
const CELL_FRAME_STYLE_ID = 'kumo-gallery-frame-fix';
const CELL_FRAME_STYLE = `<style id="${CELL_FRAME_STYLE_ID}">
  html{background:transparent}
  body{margin:0;background:transparent;display:flex;align-items:center;justify-content:center;min-height:auto}
  /* Tame the demo wrapper's large p-8 padding and center its content. */
  main[data-part="root"]{padding:1.25rem!important;margin:0!important;width:auto!important;
    display:flex;align-items:center;justify-content:center}
  /* JS-mounted apps (overlays) mount here. */
  #app{width:100%;display:flex;align-items:center;justify-content:center}
</style>`;

// --- Component taxonomy ------------------------------------------------------
// Membership of the overlay set mirrors drive-cell.mjs's OVERLAY_ROLE plus tabs
// (the components whose overlays/menus must not be clipped → taller frames).
const OVERLAY = new Set([
  'dropdown-menu', 'menu-bar', 'dialog', 'popover',
  'select', 'combobox', 'autocomplete', 'tabs',
]);

// RESERVE = components that render a FLOATING open surface (absolutely positioned
// menu/listbox/dialog) which must not be clipped. These keep a fixed, modest
// min-height and are NOT content-resized. (tabs is in OVERLAY for grouping but
// its content is in-flow, so it resizes like a normal tile.)
const RESERVE = new Set([
  'dropdown-menu', 'menu-bar', 'dialog', 'popover',
  'select', 'combobox', 'autocomplete',
]);

const FORMS = new Set([
  'button', 'checkbox', 'radio', 'switch', 'input', 'input-area',
  'input-group', 'sensitive-input', 'field', 'label', 'clipboard-text',
  'sensitive-input', 'pagination',
]);

// Everything else is presentational.
const GROUPS = [
  {
    id: 'presentational',
    title: 'Presentational',
    blurb: 'Static, content-driven primitives — rendered server-clean with zero JavaScript where possible.',
    test: (c) => !OVERLAY.has(c) && !FORMS.has(c),
  },
  {
    id: 'forms',
    title: 'Forms & inputs',
    blurb: 'Interactive controls — buttons, fields, toggles and selection inputs.',
    test: (c) => FORMS.has(c) && !OVERLAY.has(c),
  },
  {
    id: 'overlays',
    title: 'Interactive & overlays',
    blurb: 'Stateful components with floating surfaces — open the menus, dialogs, listboxes and popovers; they really work.',
    test: (c) => OVERLAY.has(c),
  },
];

// Frame sizing.
// Non-overlay tiles get a small INITIAL height; an inline resizer in index.html
// then shrinks each iframe to its content's scrollHeight so the tile hugs the
// component (no acres of empty white). Overlays keep a fixed, modest min-height
// (NOT resized) so their absolutely-positioned open menus/listboxes/dialogs are
// never clipped — taller than presentational, but not a giant empty box.
function frameSize(component) {
  if (RESERVE.has(component)) return { w: '100%', h: 320 };
  if (FORMS.has(component)) return { w: '100%', h: 132 };
  return { w: '100%', h: 120 };
}

const human = (s) =>
  s.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

// --- Path rewrite ------------------------------------------------------------
// Built index.html references "/kumo.css" and "/assets/…" absolutely. When the
// cell lives at /cells/<id>/ those must become relative so a static host serves
// them from the cell's own folder (each dist ships its own kumo.css + assets).
function rewriteHtml(html) {
  let out = html
    .replace(/href="\/kumo\.css"/g, 'href="./kumo.css"')
    .replace(/src="\/assets\//g, 'src="./assets/')
    .replace(/href="\/assets\//g, 'href="./assets/');

  // Inject a small framing stylesheet into each cell page (the component itself
  // stays canonical — we only touch the page background + the demo wrapper's
  // outer padding + centering so the tile hugs the component on the dark cards).
  if (!out.includes(CELL_FRAME_STYLE_ID)) {
    out = out.replace(/<\/head>/i, `${CELL_FRAME_STYLE}\n</head>`);
  }
  return out;
}

async function main() {
  const catalog = JSON.parse(await readFile(CATALOG, 'utf8'));
  const frozen = catalog.frozen;

  // Build component → {framework: cellId} map, only for cells with a real dist.
  const components = new Map();
  for (const cell of frozen) {
    const { component, framework } = cell;
    const id = `${component}__${framework}`;
    const distDir = path.join(CELLS_SRC, id, 'dist');
    if (!existsSync(path.join(distDir, 'index.html'))) {
      console.warn(`SKIP (no dist): ${id}`);
      continue;
    }
    if (!components.has(component)) components.set(component, {});
    components.get(component)[framework] = id;
  }

  // Copy + rewrite every cell dist into gallery/cells/<id>/.
  await mkdir(OUT_CELLS, { recursive: true });
  let copied = 0;
  for (const comp of components.values()) {
    for (const id of Object.values(comp)) {
      const srcDist = path.join(CELLS_SRC, id, 'dist');
      const dstDir = path.join(OUT_CELLS, id);
      await cp(srcDist, dstDir, { recursive: true });
      const idxPath = path.join(dstDir, 'index.html');
      const html = await readFile(idxPath, 'utf8');
      await writeFile(idxPath, rewriteHtml(html), 'utf8');
      copied++;
    }
  }

  // Order components within each group alphabetically.
  const ordered = GROUPS.map((g) => ({
    ...g,
    components: [...components.keys()].filter((c) => g.test(c)).sort(),
  }));

  const totalSections = [...components.keys()].length;

  // --- Render homepage -------------------------------------------------------
  const navHtml = ordered
    .map(
      (g) => `      <div class="nav-group">
        <div class="nav-group-title">${g.title}</div>
        ${g.components
          .map(
            (c) =>
              `<a class="nav-link" href="#${c}">${human(c)}</a>`
          )
          .join('\n        ')}
      </div>`
    )
    .join('\n');

  const sectionsHtml = ordered
    .map((g) => {
      const groupSections = g.components
        .map((c) => {
          const comp = components.get(c);
          const { w, h } = frameSize(c);
          const variants = FRAMEWORKS.filter((fw) => comp[fw])
            .map((fw) => {
              const id = comp[fw];
              return `          <figure class="variant">
            <figcaption class="variant-label"><span class="fw fw-${fw}">${fw}</span></figcaption>
            <div class="frame-wrap"${RESERVE.has(c) ? ' data-overlay="1"' : ''}>
              <iframe class="cell-frame" loading="lazy" title="${c} / ${fw}" src="./cells/${id}/index.html" style="width:${w};height:${h}px"></iframe>
            </div>
          </figure>`;
            })
            .join('\n');
          return `      <section class="component" id="${c}">
        <header class="component-head">
          <h3 class="component-name">${human(c)}</h3>
          <code class="component-tag">&lt;kumo-${c}&gt;</code>
          <span class="variant-count">${Object.keys(comp).length} native variants</span>
        </header>
        <div class="variants${RESERVE.has(c) ? ' variants-tall' : ''}">
${variants}
        </div>
      </section>`;
        })
        .join('\n');
      return `    <div class="group" id="group-${g.id}">
      <div class="group-head">
        <h2 class="group-title">${g.title}</h2>
        <p class="group-blurb">${g.blurb}</p>
      </div>
${groupSections}
    </div>`;
    })
    .join('\n');

  // --- Get started ----------------------------------------------------------
  // Boss-readable "how do I actually use this today" section. Snippets are the
  // real, verified install + import + render flow for each native package
  // (names/usage confirmed against the published manifests and real consumer
  // apps in this repo — see hammers/handover/*/consumer).
  const getStartedHtml = `      <section class="getstarted" id="get-started">
        <div class="gs-head">
          <h2 class="gs-title">Get started</h2>
          <p class="gs-lede">
            Each target ships as its own native npm package. Install the one for
            your framework, import a component, render it — no wrappers, no
            runtime transpile. Every component (e.g. <code class="gs-inline">DropdownMenu</code>)
            is a named export.
          </p>
        </div>
        <div class="gs-grid">
          <article class="gs-card">
            <header class="gs-card-head">
              <span class="fw fw-vue">Vue</span>
              <code class="gs-pkg">@acoyfellow/kumo-vue</code>
            </header>
            <div class="gs-step">1 · Install</div>
            <pre class="gs-code"><code>npm i @acoyfellow/kumo-vue</code></pre>
            <div class="gs-step">2 · Import &amp; use</div>
            <pre class="gs-code"><code>&lt;script setup&gt;
import { DropdownMenu } from '@acoyfellow/kumo-vue'
&lt;/script&gt;

&lt;template&gt;
  &lt;DropdownMenu /&gt;
&lt;/template&gt;</code></pre>
          </article>
          <article class="gs-card">
            <header class="gs-card-head">
              <span class="fw fw-svelte">Svelte</span>
              <code class="gs-pkg">@acoyfellow/kumo-svelte</code>
            </header>
            <div class="gs-step">1 · Install</div>
            <pre class="gs-code"><code>npm i @acoyfellow/kumo-svelte</code></pre>
            <div class="gs-step">2 · Import &amp; use</div>
            <pre class="gs-code"><code>&lt;script&gt;
  import { DropdownMenu } from '@acoyfellow/kumo-svelte'
&lt;/script&gt;

&lt;DropdownMenu /&gt;</code></pre>
          </article>
          <article class="gs-card">
            <header class="gs-card-head">
              <span class="fw fw-solid">Solid</span>
              <code class="gs-pkg">@acoyfellow/kumo-solid</code>
            </header>
            <div class="gs-step">1 · Install</div>
            <pre class="gs-code"><code>npm i @acoyfellow/kumo-solid</code></pre>
            <div class="gs-step">2 · Import &amp; use</div>
            <pre class="gs-code"><code>import { render } from 'solid-js/web'
import { DropdownMenu } from '@acoyfellow/kumo-solid'

render(() =&gt; &lt;DropdownMenu /&gt;,
  document.getElementById('app')!)</code></pre>
          </article>
        </div>
        <p class="gs-note">
          <strong>Canonical React source</strong> means every component is authored
          once as a single React-shaped definition; the Vue, Svelte and Solid
          packages above are <em>compiled from</em> that source, so all three stay
          in lockstep with one canonical API.
        </p>
      </section>`;

  const page = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <link rel="icon" href="data:," />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Kumo Components · Compiled to native Vue · Svelte · Solid</title>
  <link rel="stylesheet" href="./styles.css" />
</head>
<body>
  <div class="layout">
    <aside class="sidebar">
      <a class="brand" href="#top">
        <span class="brand-mark">◆</span>
        <span class="brand-text">Kumo<br/><small>compiler gallery</small></span>
      </a>
      <nav class="nav">
      <div class="nav-group">
        <a class="nav-link nav-link-cta" href="#get-started">Get started</a>
      </div>
${navHtml}
      </nav>
    </aside>

    <main class="main" id="top">
      <header class="hero">
        <div class="hero-eyebrow">Component compiler · referencer</div>
        <h1 class="hero-title">One source. <span class="grad">Native everywhere.</span></h1>
        <p class="hero-lede">
          Each Kumo component is authored once as a canonical definition and
          <strong>compiled to native Vue, Svelte, and Solid</strong> — not wrapped,
          not transpiled at runtime, but emitted as real framework-native components.
          Every tile below is the <em>actual compiled output</em>, rendered live in an
          isolated frame. Open the menus and dialogs: they work.
        </p>
        <div class="hero-stats">
          <div class="stat"><span class="stat-num">${totalSections}</span><span class="stat-lbl">components</span></div>
          <div class="stat"><span class="stat-num">3</span><span class="stat-lbl">native targets</span></div>
          <div class="stat"><span class="stat-num">${copied}</span><span class="stat-lbl">compiled cells</span></div>
        </div>
        <div class="hero-targets">
          <span class="fw fw-vue">Vue</span>
          <span class="fw fw-svelte">Svelte</span>
          <span class="fw fw-solid">Solid</span>
          <span class="fw fw-react">React<small> · canonical source</small></span>
        </div>
        <div class="about" id="about">
          <h2 class="about-title">About this compiler</h2>
          <p class="about-text">
            Kumo is a component compiler. Each component is authored once as a
            canonical definition — <strong>canonical React is the source of
            truth</strong> — and compiled to real native Vue, Svelte, and Solid
            components. The output is genuine framework-native code, not
            runtime-wrapped React, so every target ships and behaves like a
            component a human would have written by hand.
          </p>
          <a class="about-source" href="https://github.com/acoyfellow/kumo-compiler" target="_blank" rel="noopener noreferrer">
            <span class="about-source-mark">★</span> View source on GitHub
          </a>
        </div>
      </header>

${getStartedHtml}

${sectionsHtml}

      <footer class="footer">
        Kumo compiler gallery · ${totalSections} components × native Vue/Svelte/Solid ·
        every frame is real compiled output.
      </footer>
    </main>
  </div>
  <script>
  // Content-fit each non-overlay iframe to its component's height so tiles hug
  // the component instead of being fixed huge boxes. Overlays keep their
  // reserved min-height so open menus/dialogs/listboxes are never clipped.
  (function () {
    var MAX = 480; // safety cap so nothing runs away
    function fit(frame) {
      try {
        var wrap = frame.closest('.frame-wrap');
        if (wrap && wrap.getAttribute('data-overlay') === '1') return; // leave overlays
        var doc = frame.contentDocument;
        if (!doc || !doc.body) return;
        // Measure the REAL content via body.scrollHeight. (documentElement.scrollHeight
        // stretches to the iframe's own height, which would create a false floor.)
        var h = doc.body.scrollHeight;
        if (!h) return;
        h = Math.max(56, Math.min(h, MAX));
        frame.style.height = h + 'px';
      } catch (e) { /* same-origin only; ignore */ }
    }
    function bind(frame) {
      var run = function () { fit(frame); setTimeout(function () { fit(frame); }, 200); setTimeout(function () { fit(frame); }, 600); };
      frame.addEventListener('load', run);
      try {
        if (frame.contentDocument && frame.contentDocument.readyState === 'complete') run();
      } catch (e) {}
    }
    var frames = document.querySelectorAll('iframe.cell-frame');
    for (var i = 0; i < frames.length; i++) bind(frames[i]);
    window.addEventListener('resize', function () {
      for (var j = 0; j < frames.length; j++) fit(frames[j]);
    });
  })();
  </script>
</body>
</html>
`;

  await writeFile(path.join(HERE, 'index.html'), page, 'utf8');
  await writeFile(path.join(HERE, 'styles.css'), STYLES, 'utf8');

  // --- wrangler.jsonc (static assets worker) ---------------------------------
  const wrangler = `{
  // Kumo compiler gallery — deploy as a Cloudflare static-assets site.
  // Deploy:  npx wrangler deploy   (run from experiments/o3/gallery/)
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "kumo-compiler-gallery",
  "compatibility_date": "2025-06-01",
  "account_id": "31b91e7f9954ad8aa334d46f012bd8ed",
  "assets": {
    // Serve this directory (the gallery root) as a fully static site.
    "directory": "./",
    "not_found_handling": "404-page",
    "html_handling": "auto-trailing-slash"
  }
}
`;
  await writeFile(path.join(HERE, 'wrangler.jsonc'), wrangler, 'utf8');

  // .assetsignore — keep the build script & node tooling out of the deployed bundle.
  await writeFile(
    path.join(HERE, '.assetsignore'),
    'build.mjs\nwrangler.jsonc\n.assetsignore\n',
    'utf8'
  );

  console.log(`OK: ${copied} cells copied, ${totalSections} sections across ${ordered.length} groups.`);
  for (const g of ordered) {
    console.log(`  ${g.title}: ${g.components.length} (${g.components.join(', ')})`);
  }
}

const STYLES = `:root{
  --bg:#0b0d12; --panel:#11141b; --panel-2:#161a23; --ink:#e7eaf0; --muted:#9aa3b2;
  --line:#222838; --accent:#f6821f; --accent-2:#7aa2ff; --frame:#fafafa;
  --radius:14px; --maxw:1180px;
  --font: ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Inter,Helvetica,Arial,sans-serif;
  --mono: ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,monospace;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth;scroll-padding-top:1rem}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--font);
  -webkit-font-smoothing:antialiased;line-height:1.5;font-size:15px}
.layout{display:grid;grid-template-columns:248px minmax(0,1fr);max-width:var(--maxw);margin:0 auto;min-height:100vh}

/* Sidebar */
.sidebar{position:sticky;top:0;align-self:start;height:100vh;overflow-y:auto;
  padding:24px 18px;border-right:1px solid var(--line);background:var(--bg)}
.brand{display:flex;gap:10px;align-items:center;text-decoration:none;color:var(--ink);margin-bottom:22px}
.brand-mark{color:var(--accent);font-size:22px}
.brand-text{font-weight:700;line-height:1.05}
.brand-text small{font-weight:500;color:var(--muted);font-size:11px;letter-spacing:.04em;text-transform:uppercase}
.nav-group{margin-bottom:18px}
.nav-group-title{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:0 0 8px 6px;font-weight:600}
.nav-link{display:block;padding:5px 10px;border-radius:8px;color:var(--muted);text-decoration:none;font-size:13.5px}
.nav-link:hover{background:var(--panel-2);color:var(--ink)}
.nav-link-cta{color:var(--accent);font-weight:700}
.nav-link-cta:hover{color:var(--accent)}

/* Main */
.main{padding:40px 40px 80px;min-width:0}
.hero{padding:18px 0 36px;border-bottom:1px solid var(--line);margin-bottom:34px}
.hero-eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);font-weight:700}
.hero-title{font-size:clamp(34px,5vw,52px);line-height:1.04;margin:14px 0 0;font-weight:800;letter-spacing:-.02em}
.grad{background:linear-gradient(90deg,var(--accent),var(--accent-2));-webkit-background-clip:text;background-clip:text;color:transparent}
.hero-lede{max-width:680px;color:var(--muted);font-size:16.5px;margin:18px 0 26px}
.hero-lede strong{color:var(--ink)}
.hero-stats{display:flex;gap:32px;margin-bottom:24px}
.stat{display:flex;flex-direction:column}
.stat-num{font-size:30px;font-weight:800;color:var(--ink);line-height:1}
.stat-lbl{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-top:4px}
.hero-targets{display:flex;gap:10px;flex-wrap:wrap}

/* About */
.about{margin-top:28px;padding:20px 22px;background:linear-gradient(180deg,var(--panel-2),var(--panel));
  border:1px solid var(--line);border-radius:var(--radius);max-width:760px}
.about-title{font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--accent-2);margin:0;font-weight:700}
.about-text{color:var(--muted);margin:10px 0 0;font-size:14.5px}
.about-text strong{color:var(--ink)}
.about-source{display:inline-flex;align-items:center;gap:7px;margin-top:16px;
  padding:9px 16px;border-radius:9px;text-decoration:none;font-size:13.5px;font-weight:700;
  color:#06080c;background:linear-gradient(90deg,var(--accent),var(--accent-2));
  border:1px solid transparent;transition:filter .15s ease,transform .15s ease}
.about-source:hover{filter:brightness(1.08);transform:translateY(-1px)}
.about-source-mark{font-size:14px;line-height:1}

/* Framework chips */
.fw{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:700;
  padding:3px 10px;border-radius:999px;text-transform:capitalize;border:1px solid transparent}
.fw small{font-weight:500;opacity:.75;text-transform:none}
.fw-vue{background:rgba(65,184,131,.14);color:#5fd6a4;border-color:rgba(65,184,131,.3)}
.fw-svelte{background:rgba(255,62,0,.14);color:#ff7a4d;border-color:rgba(255,62,0,.3)}
.fw-solid{background:rgba(76,130,255,.14);color:#8fb0ff;border-color:rgba(76,130,255,.3)}
.fw-react{background:rgba(97,218,251,.12);color:#79d9f0;border-color:rgba(97,218,251,.28)}

/* Get started */
.getstarted{margin:0 0 48px;padding:26px 26px 24px;background:linear-gradient(180deg,var(--panel-2),var(--panel));
  border:1px solid var(--line);border-radius:var(--radius)}
.gs-head{margin-bottom:20px}
.gs-title{font-size:22px;font-weight:800;margin:0;letter-spacing:-.01em}
.gs-lede{color:var(--muted);margin:8px 0 0;font-size:14.5px;max-width:720px}
.gs-inline{font-family:var(--mono);font-size:12.5px;color:var(--accent-2);background:#0a0c10;
  border:1px solid var(--line);padding:1px 6px;border-radius:5px}
.gs-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
@media(max-width:900px){.gs-grid{grid-template-columns:1fr}}
.gs-card{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:16px 16px 18px;
  display:flex;flex-direction:column}
.gs-card-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px}
.gs-pkg{font-family:var(--mono);font-size:12px;color:var(--accent);background:#0a0c10;
  border:1px solid var(--line);padding:2px 8px;border-radius:6px;word-break:break-all}
.gs-step{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);
  font-weight:700;margin:6px 0 6px}
.gs-code{margin:0 0 4px;background:#06080c;border:1px solid var(--line);border-radius:9px;
  padding:11px 13px;overflow-x:auto;box-shadow:0 1px 0 rgba(255,255,255,.03) inset}
.gs-code code{font-family:var(--mono);font-size:12.5px;line-height:1.6;color:#cdd6e6;
  white-space:pre;display:block}
.gs-note{margin:20px 0 0;padding-top:16px;border-top:1px solid var(--line);
  color:var(--muted);font-size:13.5px;max-width:760px}
.gs-note strong{color:var(--accent-2)}
.gs-note em{color:var(--ink);font-style:normal;font-weight:600}

/* Groups */
.group{margin-bottom:46px}
.group-head{margin-bottom:18px}
.group-title{font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--accent-2);margin:0;font-weight:700}
.group-blurb{color:var(--muted);margin:6px 0 0;font-size:14px;max-width:620px}

/* Component section */
.component{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);
  padding:18px 18px 20px;margin-bottom:20px;scroll-margin-top:14px}
.component-head{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;margin-bottom:14px}
.component-name{margin:0;font-size:18px;font-weight:700}
.component-tag{font-family:var(--mono);font-size:12.5px;color:var(--accent);background:var(--panel-2);
  border:1px solid var(--line);padding:2px 8px;border-radius:6px}
.variant-count{margin-left:auto;font-size:12px;color:var(--muted)}

.variants{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
@media(max-width:1024px){.variants{grid-template-columns:1fr}}
.variant{margin:0;display:flex;flex-direction:column}
.variant-label{margin-bottom:8px}
.frame-wrap{background:var(--frame);border:1px solid var(--line);border-radius:12px;overflow:hidden;position:relative;
  box-shadow:0 1px 0 rgba(255,255,255,.05) inset,0 8px 22px -16px rgba(0,0,0,.7)}
.frame-wrap[data-overlay="1"]{overflow:visible}
.cell-frame{display:block;border:0;background:var(--frame);width:100%;transition:height .18s ease}

.footer{margin-top:40px;padding-top:22px;border-top:1px solid var(--line);color:var(--muted);font-size:13px}
`;

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
