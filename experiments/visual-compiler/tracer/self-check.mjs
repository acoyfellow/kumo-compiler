import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=import.meta.dirname,sha=x=>createHash('sha256').update(x).digest('hex');
const fail=m=>{throw Error(`tracer self-check: ${m}`)};
const r=JSON.parse(await readFile(resolve(root,'results.json'),'utf8'));
if(r.schemaVersion!=='kumo.visual-compiler-tracer/v1'||r.status!=='passed')fail('result failed or schema invalid');
if(r.authority?.package!=='@cloudflare/kumo'||r.authority?.version!=='2.5.2'||r.authority?.synthetic!==false)fail('authority invalid');
if(r.records?.length!==36||r.coverage?.expectedCells!==36||new Set(r.records.map(x=>`${x.component}/${x.state}/${x.viewport}`)).size!==36)fail('matrix incomplete');
if(r.diagnostics?.length||r.failures?.length)fail('diagnostics present');
for(const x of r.records){const p=resolve(root,x.trace),bytes=await readFile(p),t=JSON.parse(bytes);if(sha(bytes)!==x.traceSha256)fail(`${x.trace}: trace digest mismatch`);if(sha(await readFile(resolve(p,'../screenshot.png')))!==x.screenshotSha256)fail(`${x.trace}: screenshot digest mismatch`);if(!t.dom||!t.parts?.length||!t.focus||!Array.isArray(t.events)||!Array.isArray(t.a11y))fail(`${x.trace}: facts missing`);if(t.parts.some(p=>!p.part||!p.geometry||!p.style||!p.attrs||!p.classes))fail(`${x.trace}: unstable part`)}
console.log('tracer self-check passed: 36/36 cells');
