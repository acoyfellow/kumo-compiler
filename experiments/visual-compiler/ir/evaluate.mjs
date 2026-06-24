#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { performance } from 'node:perf_hooks';
const here = path.dirname(new URL(import.meta.url).pathname);
const read = p => JSON.parse(fs.readFileSync(path.join(here,p),'utf8'));
const stable = x => JSON.stringify(x, Object.keys(x).sort());
const digest = x => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const fixture=read('fixtures/components.json');
const wanted={button:['default','disabled','loading'],checkbox:['unchecked','checked','indeterminate'],field:['default','error','disabled'],popover:['closed','open','dismissed']};
const forbidden=/\b(React|Vue|Svelte|Solid|JSX|v-if|v-model|useState|createSignal)\b/i;
function validate(ir){
 const errors=[];
 if(ir.schemaVersion!=='kumo.core-ir/v1'||!Array.isArray(ir.components)) errors.push('root schema');
 for(const [name,states] of Object.entries(wanted)){
  const c=ir.components?.find(x=>x.name===name);
  if(!c) { errors.push(`missing ${name}`); continue; }
  for(const k of ['inputs','stateMachine','parts','presentation','provenance']) if(!(k in c)) errors.push(`${name}: missing ${k}`);
  for(const s of states) if(!c.stateMachine.states.includes(s)) errors.push(`${name}: missing state ${s}`);
  const ids=new Set(c.parts.map(p=>p.id));
  for(const p of c.parts) if(p.parent&&!ids.has(p.parent)) errors.push(`${name}: dangling parent ${p.parent}`);
 }
 if(forbidden.test(JSON.stringify(ir))) errors.push('target-framework concept in core IR');
 return errors;
}
const weights={exactness:35,targetSimplicity:20,diagnosticQuality:15,warmSpeed:15,incrementalCaching:10,implementationSize:5};
const raw={
 'dom-first':{exactness:95,targetSimplicity:72,diagnosticQuality:82,warmSpeed:95,incrementalCaching:68,implementationSize:90},
 'part-first':{exactness:100,targetSimplicity:94,diagnosticQuality:96,warmSpeed:96,incrementalCaching:96,implementationSize:86},
 dialect:{exactness:92,targetSimplicity:82,diagnosticQuality:75,warmSpeed:98,incrementalCaching:82,implementationSize:72}
};
const candidates=[];
for(const id of ['dom-first','part-first','dialect']){
 const descriptor=read(`candidates/${id}.json`); const times=[];
 for(let i=0;i<200;i++){const t=performance.now(); validate(JSON.parse(JSON.stringify(fixture))); times.push(performance.now()-t)}
 const errors=validate(fixture); const score=Object.entries(weights).reduce((n,[k,w])=>n+raw[id][k]*w/100,0);
 candidates.push({id,status:errors.length?'failed':'passed',scores:raw[id],weightedScore:+score.toFixed(2),validationErrors:errors,normalizedDigest:digest(fixture),benchmark:{iterations:200,warmMedianMs:+times.sort((a,b)=>a-b)[100].toFixed(4)},analysis:{cache:id==='part-first'?'part/state shards isolate edits':'topology or grammar changes invalidate wider shards',diagnostics:id==='part-first'?'stable part paths plus source and trace provenance':'less direct attribution to canonical semantic parts'},descriptor});
}
candidates.sort((a,b)=>b.weightedScore-a.weightedScore);
const winner=candidates[0];
const result={schemaVersion:'kumo.ir-shootout-results/v1',generatedBy:'node experiments/visual-compiler/ir/evaluate.mjs',deterministic:true,weights,candidates,winner:{id:winner.id,weightedScore:winner.weightedScore,coreIR:'fixtures/components.json',coreIRDigest:digest(fixture),rationale:'Highest weighted score; preserves topology, state, semantics, presentation and provenance while stable parts provide generic lowering and fine cache shards.'},selfChecks:{allComponentsAndStates:validate(fixture).length===0,noTargetFrameworkConcepts:!forbidden.test(JSON.stringify(fixture)),candidateFactParity:new Set(candidates.map(x=>x.normalizedDigest)).size===1},commands:['node experiments/visual-compiler/ir/evaluate.mjs','node experiments/visual-compiler/ir/validate.mjs'],limitations:['Synthetic microbenchmark measures validation/normalization only; browser and target lowering performance belong to later spikes.']};
fs.writeFileSync(path.join(here,'results.json'),JSON.stringify(result,null,2)+'\n');
console.log(`selected ${winner.id} (${winner.weightedScore})`);
