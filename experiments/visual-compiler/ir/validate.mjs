#!/usr/bin/env node
import fs from 'node:fs'; import path from 'node:path';
const here=path.dirname(new URL(import.meta.url).pathname); const load=p=>JSON.parse(fs.readFileSync(path.join(here,p),'utf8'));
const ir=load('fixtures/components.json'), result=load('results.json');
const expected={button:['default','disabled','loading'],checkbox:['unchecked','checked','indeterminate'],field:['default','error','disabled'],popover:['closed','open','dismissed']};
const failures=[];
if(ir.schemaVersion!=='kumo.core-ir/v1') failures.push('schemaVersion');
for(const [name,states] of Object.entries(expected)){const c=ir.components.find(x=>x.name===name); if(!c) failures.push(`missing ${name}`); else for(const s of states) if(!c.stateMachine.states.includes(s)) failures.push(`${name}/${s}`);}
if(/\b(React|Vue|Svelte|Solid|JSX|v-if|v-model|useState|createSignal)\b/i.test(JSON.stringify(ir))) failures.push('framework concept');
if(result.winner.id!=='part-first'||!Object.values(result.selfChecks).every(Boolean)) failures.push('result checks');
if(failures.length){console.error(failures.join('\n'));process.exit(1)} console.log('IR self-checks passed');
