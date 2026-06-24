#!/usr/bin/env node
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const HERE=import.meta.dirname, ROOT=resolve(HERE,'..'), sha=b=>createHash('sha256').update(b).digest('hex');
const load=async p=>JSON.parse(await readFile(resolve(ROOT,p),'utf8'));
const ir=await load('ir/fixtures/components.json'), result=await load('ir/results.json'), failures=[];
const forbidden=/\b(React|Vue|Svelte|Solid|JSX|v-if|v-model|useState|createSignal)\b/i;
if(ir.schemaVersion!=='kumo.core-ir/v2')failures.push('schema version');
if(forbidden.test(JSON.stringify(ir)))failures.push('target framework concept');
for(const [key,binding] of Object.entries(ir.authority.inputs)){const actual=sha(await readFile(resolve(ROOT,binding.path)));if(actual!==binding.sha256)failures.push(`input digest ${key}`)}
for(const c of ir.components){if(!c.parts.length||!c.states.values.length||!c.viewports.length)failures.push(`${c.name}: incomplete topology`);for(const p of c.parts){if(p.parent&&!c.parts.some(x=>x.id===p.parent))failures.push(`${c.name}: dangling ${p.id}`);if(!p.samples.every(s=>s.attrs&&s.classes&&s.style&&s.geometry&&typeof s.text==='string'))failures.push(`${c.name}: incomplete sample ${p.id}`);const cells=new Set(p.samples.map(s=>`${s.state}/${s.viewport}`));if(cells.size<c.states.values.length*c.viewports.length&&!p.presence)failures.push(`${c.name}: subset-state/viewport part ${p.id} lacks presence`);if(!p.samples.every(s=>s.tag===p.tag&&s.parent===p.parent&&s.order===p.order))failures.push(`${c.name}: unstable topology ${p.id}`);if(!p.provenance?.every(x=>/^[a-f0-9]{64}$/.test(x.sha256)))failures.push(`${c.name}: part provenance ${p.id}`)}if(!c.provenance.traces.every(t=>/^[a-f0-9]{64}$/.test(t.sha256)))failures.push(`${c.name}: trace provenance`)}
if(!result.candidates.every(c=>Object.keys(c.scores).every(k=>c.scores[k]===c.measurements[k])))failures.push('unmeasured score');
if(failures.length){console.error(failures.join('\n'));process.exit(1)}console.log('IR authority checks passed');
