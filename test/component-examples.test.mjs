import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {buildComponentExamples} from '../scripts/build-component-examples.mjs';

test('exact packed artifacts build 41 independent entries for three native targets deterministically',{timeout:240000},async()=>{
 const a=await buildComponentExamples({write:false}),b=await buildComponentExamples({write:false});
 assert.deepEqual(a,b);assert.equal(a.passedCount,123);assert.equal(a.sourceAliases,false);
 assert.deepEqual(a.targets.map(x=>x.framework),['vue','svelte','solid']);
 assert.ok(a.targets.every(x=>x.entries.length===41&&x.entries.every(e=>e.status==='passed'&&e.output===`${e.component}.js`)));
 const copy=structuredClone(a);delete copy.contentDigest;
 assert.equal(a.contentDigest,createHash('sha256').update(JSON.stringify(copy)).digest('hex'));
});

test('example matrix fails closed when an entry is mutated',{timeout:120000},async()=>{
 await assert.rejects(buildComponentExamples({write:false,mutate:{framework:'vue',component:'autocomplete',source:"import Nope from '@acoyfellow/kumo-vue/not-a-component';"}}),/failed|fail-closed/);
});
