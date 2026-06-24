import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=import.meta.dirname,sha=x=>createHash('sha256').update(x).digest('hex'),fail=m=>{throw Error(`tracer self-check: ${m}`)};
const source=await readFile(resolve(root,'tracer.mjs'),'utf8'),app=await readFile(resolve(root,'app.mjs'),'utf8'),r=JSON.parse(await readFile(resolve(root,'results.json'),'utf8'));
if(/data:text\/html|\bfixture\s*\(/.test(source+app))fail('synthetic fixture mechanism present');
if(/dispatchEvent\s*\(/.test(source+app))fail('untrusted DOM event dispatch present');
if(r.schemaVersion!=='kumo.visual-compiler-tracer/v2'||r.status!=='passed')fail('result failed or schema invalid');
if(r.authority?.package!=='@cloudflare/kumo'||r.authority?.version!=='2.5.2'||r.authority?.synthetic!==false)fail('authority mismatch');
const required=['button','checkbox','field','popover'].map(x=>`@cloudflare/kumo/components/${x}`);
if(required.some(x=>!app.includes(`from '${x}'`)||!r.authority.imports?.includes(x)))fail('canonical package import evidence absent');
for(const k of ['packageJsonSha256','sourceSha256','cssSha256','bundleSha256'])if(!/^[a-f0-9]{64}$/.test(r.authority[k]||''))fail(`${k} absent`);
if(!/^[a-f0-9]{64}$/.test(r.browser?.versionSha256||''))fail('browser hash absent');
if(r.records?.length!==36||r.coverage?.expectedCells!==36||new Set(r.records.map(x=>`${x.component}/${x.state}/${x.viewport}`)).size!==36)fail('matrix incomplete');
if(r.diagnostics?.length||r.failures?.length)fail('diagnostics present');
for(const x of r.records){const p=resolve(root,x.trace),bytes=await readFile(p),t=JSON.parse(bytes);if(sha(bytes)!==x.traceSha256)fail(`${x.trace}: trace digest mismatch`);if(sha(await readFile(resolve(p,'../screenshot.png')))!==x.screenshotSha256)fail(`${x.trace}: screenshot mismatch`);if(t.url?.startsWith('data:')||!t.url?.startsWith('http://127.0.0.1:'))fail(`${x.trace}: not local HTTP`);if(!t.hydrated||!t.dom||!t.parts?.length||!t.focus||!Array.isArray(t.events)||!Array.isArray(t.a11y))fail(`${x.trace}: facts missing`)}
console.log('tracer self-check passed: canonical package evidence and 36/36 cells');
