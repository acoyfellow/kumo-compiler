#!/usr/bin/env node
import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const HERE=import.meta.dirname, ROOT=resolve(HERE,'..');
const sha=b=>createHash('sha256').update(b).digest('hex');
const load=async p=>JSON.parse(await readFile(resolve(ROOT,p),'utf8'));
const bytes=async p=>readFile(resolve(ROOT,p));
const canonical=x=>JSON.stringify(sort(x));
function sort(x){if(Array.isArray(x))return x.map(sort);if(x&&typeof x==='object')return Object.fromEntries(Object.keys(x).sort().map(k=>[k,sort(x[k])]));return x}
const paths={tracer:'tracer/results.json',typescriptResult:'frontend/typescript/results.json',oxcResult:'frontend/oxc/results.json',typescriptFacts:'frontend/typescript/facts.json',oxcFacts:'frontend/oxc/facts.json'};
const [tracer,ts,oxc,tsFacts,oxcFacts]=await Promise.all(Object.values(paths).map(load));
const inputs=Object.fromEntries(await Promise.all(Object.entries(paths).map(async([k,p])=>[k,{path:p,sha256:sha(await bytes(p))}])));
if(tracer.schemaVersion!=='kumo.visual-compiler-tracer/v2'||tracer.status!=='passed'||ts.status!=='passed'||!String(oxc.status).startsWith('passed'))throw Error('authority inputs are not accepted');
const traceCache=new Map();
for(const r of tracer.records){const t=await load(`tracer/${r.trace}`);const b=await bytes(`tracer/${r.trace}`);if(sha(b)!==r.traceSha256)throw Error(`trace digest mismatch: ${r.trace}`);traceCache.set(`${r.component}/${r.state}/${r.viewport}`,t)}
const tsBy=new Map(tsFacts.components.map(x=>[x.component,x])), oxBy=new Map(oxcFacts.components.map(x=>[x.name,x]));
function valueType(v){if(v===''||v==='true'||v==='false')return'boolean';if(v!=null&&!Number.isNaN(Number(v)))return'number';return'string'}
function deriveComponent(name){
 const records=tracer.records.filter(r=>r.component===name); const states=tracer.coverage.states[name]; const viewports=tracer.coverage.viewports;
 const observed=records.map(r=>{const t=traceCache.get(`${name}/${r.state}/${r.viewport}`);return{state:r.state,viewport:r.viewport,trace:r.trace,traceSha256:r.traceSha256,screenshotSha256:r.screenshotSha256,focus:t.focus,events:t.events,a11y:t.a11y,parts:t.parts.map((p,i)=>({id:p.part,parent:i===0?null:'root',order:i,tag:p.tag,attrs:Object.fromEntries(Object.entries(p.attrs).map(([k,v])=>[k,{value:v,type:valueType(v)}])),classes:p.classes,text:p.text,geometry:p.geometry,style:p.style}))}});
 const partIds=[...new Set(observed.flatMap(o=>o.parts.map(p=>p.id)))];
 const parts=partIds.map(id=>{const samples=observed.flatMap(o=>o.parts.filter(p=>p.id===id).map(p=>({state:o.state,viewport:o.viewport,...p})));return{id,parent:id==='root'?null:'root',samples}});
 const behaviors=observed.flatMap(o=>o.events.map(e=>({state:o.state,viewport:o.viewport,event:e,focusAfter:o.focus.active})));
 return{name,states:{initial:states[0],values:states,observations:states.map(state=>({state,viewports:viewports.filter(v=>traceCache.has(`${name}/${state}/${v}`))}))},viewports,parts,behavior:behaviors,accessibility:observed.map(o=>({state:o.state,viewport:o.viewport,nodes:o.a11y})),provenance:{source:{typescript:tsBy.get(name).source,oxc:{path:oxBy.get(name).provenance,sha256:oxBy.get(name).sourceSha256}},frontendFacts:{typescript:{structure:tsBy.get(name).structure,classExpressions:tsBy.get(name).classExpressions,branches:tsBy.get(name).branches,defaults:tsBy.get(name).defaults},oxc:{jsxElements:oxBy.get(name).facts.jsxElements,classExpressions:oxBy.get(name).facts.classExpressions,conditions:oxBy.get(name).facts.conditions,defaults:oxBy.get(name).facts.defaults}},traces:records.map(r=>({state:r.state,viewport:r.viewport,path:`tracer/${r.trace}`,sha256:r.traceSha256,screenshotSha256:r.screenshotSha256}))}};
}
const fixture={schemaVersion:'kumo.core-ir/v2',authority:{package:tracer.authority.package,version:tracer.authority.version,inputs},components:tracer.coverage.components.map(deriveComponent)};
await writeFile(resolve(HERE,'fixtures/components.json'),JSON.stringify(fixture,null,2)+'\n');
const checks={authorityInputsAccepted:Number(tracer.status==='passed'&&ts.status==='passed'&&String(oxc.status).startsWith('passed')),componentCoverage:fixture.components.length/tracer.coverage.components.length,stateCoverage:fixture.components.reduce((n,c)=>n+c.states.observations.length,0)/Object.values(tracer.coverage.states).flat().length,viewportCoverage:fixture.components.reduce((n,c)=>n+c.states.observations.reduce((m,s)=>m+s.viewports.length,0),0)/tracer.coverage.expectedCells,traceDigestCoverage:fixture.components.reduce((n,c)=>n+c.provenance.traces.length,0)/tracer.coverage.expectedCells,frontendAgreement:fixture.components.filter(c=>c.provenance.frontendFacts.typescript.structure.length===c.provenance.frontendFacts.oxc.jsxElements.length).length/fixture.components.length};
const measurements=Object.fromEntries(Object.entries(checks).map(([k,v])=>[k,+(v*100).toFixed(2)]));
const candidate={id:'part-first',status:Object.values(checks).every(Boolean)?'passed':'failed',measurements,scores:{...measurements},weightedScore:+(Object.values(measurements).reduce((a,b)=>a+b,0)/Object.keys(measurements).length).toFixed(2)};
const result={schemaVersion:'kumo.ir-shootout-results/v2',status:candidate.status,deterministic:true,authority:{inputs:{tracerResultsSha256:inputs.tracer.sha256,frontend:{[inputs.typescriptResult.path]:inputs.typescriptResult.sha256,[inputs.oxcResult.path]:inputs.oxcResult.sha256},facts:{[inputs.typescriptFacts.path]:inputs.typescriptFacts.sha256,[inputs.oxcFacts.path]:inputs.oxcFacts.sha256}}},candidates:[candidate],winner:{id:'part-first',coreIR:'fixtures/components.json',coreIRSha256:sha(Buffer.from(JSON.stringify(fixture,null,2)+'\n'))},measuredChecks:Object.keys(checks),limitations:['Frontend agreement is measured as syntax element-count parity; Oxc reports syntax-only symbol resolution.','Recorded browser artifacts are observations, not inferred behavior outside covered state/viewport cells.']};
await writeFile(resolve(HERE,'results.json'),JSON.stringify(result,null,2)+'\n');
console.log(`derived ${fixture.components.length} components from ${tracer.records.length} verified traces`);
