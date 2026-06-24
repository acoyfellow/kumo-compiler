import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {main} from './audit.mjs';

const first=await main({write:true});
const a=await readFile(resolve(import.meta.dirname,'results.json'),'utf8');
const second=await main({write:true});
const b=await readFile(resolve(import.meta.dirname,'results.json'),'utf8');
assert.equal(a,b,'audit output must be byte deterministic');
assert.equal(first.contentDigest,second.contentDigest);
assert.equal(first.status,'rejected');
assert.equal(first.findings.verifier.copyAttackPasses,true);
assert.equal(first.findings.verifier.currentOutputsConsumed,false);
assert.equal(first.findings.targets.vue.copiesTraceDom,true);
assert.ok(Object.values(first.findings.targets).every(x=>x.compiled),'all current generated source must compile during this audit');
assert.deepEqual(Object.keys(first.findings.targets),['vue','svelte','solid']);
console.log(`audit self-check passed (${first.contentDigest})`);
