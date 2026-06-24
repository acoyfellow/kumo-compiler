#!/usr/bin/env node
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { acceptedInputs, buildGraph, impacted, plan, run, sha } from './engine.mjs';
const input=await acceptedInputs(); assert.equal(input.tracer.authority.synthetic,false); assert.equal(input.frontend.status,'passed');
const graph=buildGraph(input); assert.equal(Object.keys(graph.nodes).filter(x=>x.startsWith('component:')).length,4); assert.ok(Object.keys(graph.nodes).every(x=>!x.startsWith('ir:')));
const hit=impacted(graph,['state:button:default']); assert.ok(hit.includes('target:vue:button:default')); assert.ok(!hit.includes('target:vue:field:default'));
const cold=await run(); const warm=[]; for(let i=0;i<20;i++){const t=performance.now();const p=await plan();warm.push(performance.now()-t);assert.equal(p.dirty.length,0);}
const sorted=[...warm].sort((a,b)=>a-b), p95=sorted[Math.ceil(sorted.length*.95)-1]; assert.ok(p95<100,`warm planning/cache lookup p95 ${p95}ms exceeds 100ms`);
const focused=await plan({changed:['state:button:default']}); assert.ok(focused.dirty.every(x=>x.includes('button:default'))); assert.equal(sha(input.facts),sha(input.facts));
console.log(JSON.stringify({status:'passed',coldMs:cold.totalMs,warm:{samples:warm.length,minMs:+sorted[0].toFixed(3),medianMs:+sorted[10].toFixed(3),p95Ms:+p95.toFixed(3),budgetMs:100},nodes:Object.keys(graph.nodes).length,focusedDirty:focused.dirty},null,2));
