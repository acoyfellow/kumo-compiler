import test from 'node:test';
import assert from 'node:assert/strict';
import {manifest,frameworks} from '../proof/catalog-browser-manifest.mjs';
import {validateEvidence} from '../proof/catalog-browser-proof.mjs';

const complete={schemaVersion:'kumo.browser-evidence/v1',synthetic:false,checks:Object.fromEntries(['runtime','console','network','dom','aria','behavior','ssr','hydration','screenshot','pixels','assets','styles','package','provenance'].map(x=>[x,true])),snapshots:{preHydration:'a',postHydration:'b'},screenshot:{sha256:'a',pixelSha256:'b'},failures:[]};
test('manifest covers every target exactly once',()=>{assert.equal(manifest.components.length,41);assert.equal(new Set(manifest.components.map(x=>x.id)).size,41);assert.deepEqual(frameworks,['react','vue','svelte','solid'])});
test('complete real evidence passes',()=>assert.equal(validateEvidence(complete),true));
test('missing checks are rejected',()=>assert.throws(()=>validateEvidence({...complete,checks:{...complete.checks,network:false}}),/network/));
test('synthetic evidence is rejected',()=>assert.throws(()=>validateEvidence({...complete,synthetic:true}),/synthetic/));
test('browser failures are rejected',()=>assert.throws(()=>validateEvidence({...complete,failures:['404 asset']}),/404 asset/));
test('snapshot and decoded pixel evidence is mandatory',()=>assert.throws(()=>validateEvidence({...complete,screenshot:{sha256:'x'}}),/artifacts/));
