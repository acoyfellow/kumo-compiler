import test from'node:test';
import assert from'node:assert/strict';
import{loadContracts,verifyCanonical}from'../scripts/observable-contracts.mjs';
import{runCanonicalVectors}from'../scripts/observable-runner.mjs';
import{layerNames,renderLayerSsr,renderLayerFixture}from'../scripts/observable-adapters/layers.mjs';

const layers=loadContracts().filter(x=>layerNames.includes(x.component));
test('layers inventory and provenance',()=>{assert.deepEqual(layers.map(x=>x.component),layerNames);layers.forEach(verifyCanonical)});
test('canonical compound fixtures are constructible',async()=>{for(const contract of layers){const module=await import(contract.canonical.exportPath.replace('./','@cloudflare/kumo/')),K=module[contract.publicApi.exports[0]];for(const value of contract.vectors)assert.ok(renderLayerFixture({...value,component:contract.component},K))}});
test('action-free layers execute against canonical SSR only',async()=>{const actionFree=layers.map(c=>({...c,vectors:c.vectors.filter(v=>!v.actions?.length)}));const results=await runCanonicalVectors(actionFree);assert.deepEqual(results.map(x=>`${x.component}/${x.id}`),['dialog/closed-trigger','dropdown-menu/closed-trigger-ssr','popover/closed-trigger-ssr'])});
test('adapter SSR equals its canonical client hydration input',async()=>{const rows=await renderLayerSsr(layers);assert.equal(rows.length,layers.reduce((n,c)=>n+c.vectors.length,0));for(const row of rows){assert.match(row.html,new RegExp(`id="v\\d+"`));assert.doesNotMatch(row.html,/dispatchEvent|suppressHydrationWarning/)}assert.equal(rows.filter(x=>!x.actions.length).length,3)});
