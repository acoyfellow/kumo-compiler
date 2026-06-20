import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
execFileSync('npx',['tsc','-p','tsconfig.kumo.json'],{stdio:'inherit'});
const {catalog}=await import('../dist/kumo/catalog.js');
const {behaviorVector}=await import('../dist/kumo/validate.js');

test('framework-neutral vectors cover every behavioral catalog member',()=>{
 const behavioral=catalog.filter(x=>x.behavior);
 const vectors=behavioral.map(behaviorVector);
 assert.equal(vectors.length,21);
 assert.ok(vectors.every(Boolean));
 for(const [i,v] of vectors.entries()){
  assert.equal(v.component,behavioral[i].id);
  assert.equal(v.behavior,behavioral[i].behavior.kind);
  assert.equal(v.expected.hydration,behavioral[i].policy?.hydration??'ssr-identical');
  assert.ok(Array.isArray(v.actions));
 }
});

test('components without runtime behavior have no vector',()=>{
 assert.equal(behaviorVector(catalog.find(x=>x.id==='badge')),null);
});
