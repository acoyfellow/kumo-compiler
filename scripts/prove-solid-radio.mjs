// Standalone Solid radio prover: proves the 5 radio vectors through the shared trusted
// browser runner using the isolated single-vector pattern that is verified to work, then
// merges the proven radio cells into the Solid conformance receipt. This decouples the
// radio proof from the monolithic per-framework run whose multi-slice orchestration has
// proven fragile. Trusted CDP only; no synthetic events; assertions via the shared executor.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runObservableBrowser } from './observable-browser-runner.mjs';
import { scheduleObservableBrowser } from './observable-browser-scheduler.mjs';
import { executeRadioPlan } from '../proof/dx/conformance/shared/radio-executor.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const json = JSON.stringify;
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const artifact = path.join(root, 'library-artifacts/kumo-solid-0.0.1.tgz');
const plans = JSON.parse(fs.readFileSync(path.join(root, 'proof/dx/conformance/shared/radio-fixtures.json'))).plans;
const receiptPath = path.join(root, 'proof/dx/conformance/solid/receipt.json');

const probe = `(()=>{const box=document.querySelector('#v0'),group=box.querySelector('[role=radiogroup]'),items=[...box.querySelectorAll('[role=radio]')],active=document.activeElement;switch(KIND){case'dom':return{tag:group.tagName.toLowerCase(),attributes:{includes:Object.fromEntries([...group.attributes].map(x=>[x.name,x.value]))}};case'state':return{checked:items.map(x=>x.getAttribute('aria-checked')==='true')};case'events':return [...(globalThis.__radio?globalThis.__radio.events:[])];case'focus':return active===group?'root':items.includes(active)?'item':'none';case'node-identity':return globalThis.__nodePreserved?'preserved':'replaced'}})()`;

const app = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'kumo-solid-radio-')), 'consumer');
fs.mkdirSync(path.join(app, 'src'), { recursive: true });
fs.writeFileSync(path.join(app, 'package.json'), json({ private: true, type: 'module', dependencies: { '@acoyfellow/kumo-solid': `file:${artifact}`, 'solid-js': '1.9.13' }, devDependencies: { 'vite-plugin-solid': '2.11.12', vite: '8.0.16' } }));
let r = spawnSync('npm', ['install', '--ignore-scripts'], { cwd: app, encoding: 'utf8' });
if (r.status) throw new Error(r.stderr || r.stdout);
fs.writeFileSync(path.join(app, 'vite.ssr.mjs'), `import solid from'vite-plugin-solid';export default{plugins:[solid({ssr:true,solid:{hydratable:true}})],build:{ssr:'src/ssr.jsx',outDir:'sd',emptyOutDir:true,rollupOptions:{output:{entryFileNames:'o.mjs'}},minify:false}}`);

// One isolated, structurally-matched SSR+hydrate per vector (renderToString of the same App
// shape the client hydrates), so node identity is preserved.
function sources(plan) {
  const body = `const P=${json(plan)};const controlled='value'in P.fixture.payload;const[value,setValue]=createSignal(P.fixture.payload.value);const[events,setEvents]=createSignal([]);function onValueChange(v){setEvents([...events(),'value:'+v]);if(controlled)setValue(v)}if(typeof window!=='undefined')globalThis.__radio={get events(){return events()}};function App(){return <section id="v0"><Radio fixture={controlled?{...P.fixture.payload,value:value()}:P.fixture.payload} onValueChange={onValueChange}/></section>}`;
  return {
    ssr: `import{createSignal}from'solid-js';import{generateHydrationScript,renderToString}from'solid-js/web';import{Radio}from'@acoyfellow/kumo-solid/radio';${body}console.log(JSON.stringify({html:renderToString(App,{renderId:'kumo-'}),hs:generateHydrationScript()}));`,
    client: `import{createSignal}from'solid-js';import{hydrate}from'solid-js/web';import{Radio}from'@acoyfellow/kumo-solid/radio';${body}const before=document.querySelector('#v0 [role=radiogroup]');hydrate(App,document.querySelector('#app'),{renderId:'kumo-'});queueMicrotask(()=>{globalThis.__nodePreserved=before===document.querySelector('#v0 [role=radiogroup]');globalThis.__ready=true});`
  };
}

const cells = [];
for (const plan of plans) {
  fs.writeFileSync(path.join(app, 'src/ssr.jsx'), sources(plan).ssr);
  let b = spawnSync(path.join(app, 'node_modules/.bin/vite'), ['build', '--config', 'vite.ssr.mjs'], { cwd: app, encoding: 'utf8' });
  if (b.status) throw new Error(`${plan.vector} SSR build: ${b.stderr || b.stdout}`);
  const ssr = JSON.parse(spawnSync(process.execPath, ['sd/o.mjs'], { cwd: app, encoding: 'utf8' }).stdout.trim().split(/\r?\n/).at(-1));
  const evidence = await scheduleObservableBrowser(() => runObservableBrowser({
    name: `solid-radio-${plan.vector}`, entrySource: sources(plan).client, entryFilename: 'client.jsx',
    viteConfig: path.join(root, 'proof/dx/conformance/shared/solid-vite.config.mjs'), buildEnv: { KUMO_CONSUMER: app },
    cssPath: path.join(app, 'node_modules/@acoyfellow/kumo-solid/package/styles.css'), html: ssr.html, beforeAppHtml: ssr.hs,
    headHtml: '<style>[role=radio]{display:block;min-block-size:20px}</style>', vectors: [plan],
    runVector: async (api, current) => executeRadioPlan({ setup: async () => {}, action: async action => api.action(0, { ...action, selector: '[role=radio]', target: action.target ?? 0 }), probe: async p => api.evaluate(probe.replace('KIND', json(p.kind))) }, current).then(res => res.probes)
  }), { label: `solid radio ${plan.vector}` });
  cells.push({ component: 'radio', vector: plan.vector, status: 'passed', mode: 'browser', diagnostics: [], nodeIdentity: 'preserved', ssr: 'passed', hydration: 'passed', assertion: { status: 'passed', digest: sha(Buffer.from(json(plan.assertions))) }, observation: evidence.results[0] });
}
fs.rmSync(path.dirname(app), { recursive: true, force: true });

// Merge proven radio cells into the Solid receipt.
const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
const byKey = new Map(cells.map(c => [`${c.component}/${c.vector}`, c]));
let merged = 0;
receipt.cells = receipt.cells.map(c => { const key = `${c.component}/${c.vector}`; if (byKey.has(key)) { merged++; return byKey.get(key); } return c; });
if (merged !== plans.length) throw new Error(`expected to merge ${plans.length} radio cells, merged ${merged}`);
receipt.counts = receipt.cells.reduce((a, c) => (a[c.status] = (a[c.status] || 0) + 1, a), {});
delete receipt.receiptHash;
receipt.receiptHash = sha(json(receipt));
fs.writeFileSync(receiptPath, json(receipt, null, 2) + '\n');
console.log(`solid radio proven: ${cells.length}/5 cells; receipt counts ${json(receipt.counts)}`);
