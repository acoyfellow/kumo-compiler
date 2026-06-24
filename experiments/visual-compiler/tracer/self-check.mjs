import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=import.meta.dirname,sha=x=>createHash('sha256').update(x).digest('hex'),fail=m=>{throw Error(`tracer self-check: ${m}`)};
const source=await readFile(resolve(root,'tracer.mjs'),'utf8'),app=await readFile(resolve(root,'app.mjs'),'utf8'),r=JSON.parse(await readFile(resolve(root,'results.json'),'utf8'));
if(/data:text\/html|\bfixture\s*\(/.test(source+app))fail('synthetic fixture mechanism present');
if(/dispatchEvent\s*\(/.test(source+app))fail('untrusted DOM event dispatch present');
if(r.schemaVersion!=='kumo.visual-compiler-tracer/v3'||r.status!=='passed')fail('result failed or schema invalid');
if(r.authority?.package!=='@cloudflare/kumo'||r.authority?.version!=='2.5.2'||r.authority?.synthetic!==false)fail('authority mismatch');
const required=['button','checkbox','field','popover'].map(x=>`@cloudflare/kumo/components/${x}`);
if(required.some(x=>!app.includes(`from '${x}'`)||!r.authority.imports?.includes(x)))fail('canonical package import evidence absent');
for(const k of ['packageJsonSha256','sourceSha256','cssSha256','bundleSha256'])if(!/^[a-f0-9]{64}$/.test(r.authority[k]||''))fail(`${k} absent`);
if(!/^[a-f0-9]{64}$/.test(r.browser?.versionSha256||''))fail('browser hash absent');
if(r.records?.length!==36||r.coverage?.expectedCells!==36||new Set(r.records.map(x=>`${x.component}/${x.state}/${x.viewport}`)).size!==36)fail('matrix incomplete');
if(r.diagnostics?.length||r.failures?.length)fail('diagnostics present');
const traces=[];
for(const x of r.records){const p=resolve(root,x.trace),bytes=await readFile(p),t=JSON.parse(bytes);traces.push(t);if(sha(bytes)!==x.traceSha256)fail(`${x.trace}: trace digest mismatch`);if(sha(await readFile(resolve(p,'../screenshot.png')))!==x.screenshotSha256)fail(`${x.trace}: screenshot mismatch`);if(sha(await readFile(resolve(p,'../after.png')))!==x.afterScreenshotSha256)fail(`${x.trace}: after screenshot mismatch`);if(t.checkpoint?.initial?.url?.startsWith('data:')||!t.checkpoint?.initial?.url?.startsWith('http://127.0.0.1:'))fail(`${x.trace}: not local HTTP`);if(!t.checkpoint?.initial?.hydrated||!t.dom||!t.parts?.length||!t.behavior?.before||!t.behavior?.after||!Array.isArray(t.a11y))fail(`${x.trace}: facts missing`);if(t.dom!==t.checkpoint.initial.dom||t.parts!==t.checkpoint.initial.parts&&JSON.stringify(t.parts)!==JSON.stringify(t.checkpoint.initial.parts))fail(`${x.trace}: projection is not initial checkpoint`);const ids=new Set(t.parts.map(n=>n.id));if(ids.size!==t.parts.length)fail(`${x.trace}: duplicate stable IDs`);for(const n of t.parts){if(!n.id||n.namespace==null||!n.tag||!Number.isInteger(n.order))fail(`${x.trace}: topology fields absent`);if(n.parentId!==null&&!ids.has(n.parentId))fail(`${x.trace}: incomplete parent topology`)}}
const pick=(c,s,v=390)=>traces.find(t=>t.component===c&&t.state===s&&t.viewport===v);
const checked=pick('checkbox','checked');if(!checked.checkpoint.initial.parts.some(n=>n.attrs?.['aria-checked']==='true'||n.attrs?.checked!==undefined))fail('checked checkbox not checked initially');
const open=pick('popover','open');if(!open.checkpoint.initial.parts.some(n=>n.part==='content'||n.text==='Popover content'))fail('open popover portal content missing initially');
const loadingIds=new Set(pick('button','loading').parts.map(n=>n.id));for(const t of traces.filter(t=>t.component==='button'&&t.state!=='loading'))if(t.parts.some(n=>loadingIds.has(n.id)&&n.text==='Loading'))fail('loading-only node appears elsewhere');
for(const component of Object.keys(r.coverage.states))for(const state of r.coverage.states[component]){const cells=traces.filter(t=>t.component===component&&t.state===state),explicit=cells.map(t=>t.parts.filter(n=>n.part).map(n=>n.id).sort().join('|'));if(new Set(explicit).size!==1)fail(`${component}/${state}: explicit IDs unstable across viewports`)}
console.log('tracer self-check passed: immutable checkpoints, complete topology, and 36/36 cells');
