import test from 'node:test';
import assert from 'node:assert/strict';
import {entriesFor,loadManifests} from '../scripts/lib/manifest.mjs';

test('catalog manifest defines one exact 41 by 4 matrix',async()=>{
 const {components,build}=await loadManifests();
 const matrix=entriesFor(components,build.targets.runtimes);
 assert.equal(components.components.length,41);
 assert.equal(matrix.length,164);
 assert.equal(new Set(matrix.map(x=>`${x.component}/${x.framework}`)).size,164);
});

test('build targets select from the canonical inventory',async()=>{
 const {components,build}=await loadManifests();
 assert.deepEqual(entriesFor(components,build.targets.form).map(x=>x.component).filter((x,i,a)=>a.indexOf(x)===i),['field','input','input-group','input-area','sensitive-input','clipboard-text']);
 assert.equal(entriesFor(components,build.targets['kumo-svelte']).length,41);
});
