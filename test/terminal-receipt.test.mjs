import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { validateTerminalInputs, buildTerminalBody } from '../scripts/build-terminal-receipt.mjs';

const sha='a'.repeat(64), commit='b'.repeat(40);
function fixture(){
 const authority={authority:{canonicalPackage:'@cloudflare/kumo@2.5.2',canonicalBrowserCells:164,canonicalImmutable:true,scope:{classified:45,executable:41,upstreamBlocked:['PageHeader','ResourceListPage'],supplemental:['Chart','Flow']},downstreamPackages:['@acoyfellow/kumo-vue@0.0.1','@acoyfellow/kumo-svelte@0.0.1','@acoyfellow/kumo-solid@0.0.1']}};
 const conformance={status:'passed',vectorsPassed:124,vectorsTotal:124,components:41};
 const dimensions={root:{status:'passed'}};
 return {authority,canonical:{...conformance,contracted:41,browserCells:164,immutable:true},frameworks:{vue:{...conformance},svelte:{...conformance},solid:{...conformance}},readiness:{count:41,implementationReadyCount:41,components:Array.from({length:41},(_,i)=>({component:`c${i}`,implementationReady:true,dimensions}))},examples:{status:'passed',componentCount:41,targetCount:3,passedCount:123},docs:{status:'passed',componentReferenceCoverage:{covered:41,total:41},diataxis:{covered:4,total:4}},kitchenSink:{readiness:'41/41',renderedComponents:Array.from({length:41},(_,i)=>`c${i}`),packages:{vue:{sha256:sha},svelte:{sha256:sha},solid:{sha256:sha}},imports:Array.from({length:123},(_,i)=>`package/subpath-${i}`),omissions:[]},release:{status:'passed',runMode:'terminal-detached-clean-copies',independentRuns:2,environment:{node:'22.22.2',npm:'11.13.0'}},production:{status:'passed',identity:{commit},runs:[{sha256:sha},{sha256:'c'.repeat(64)}],comparison:{equal:true,sha256:'d'.repeat(64)}},progress:{phases:[{id:'production',done:1,total:1,status:'passed'}]},currentCommit:commit};
}

test('pure validator accepts complete synthetic terminal evidence',()=>{
 const input=fixture(); assert.deepEqual(validateTerminalInputs(input),{valid:true,errors:[]});
 const prerequisites=[{identity:'proof/example.json',sha256:sha}];
 assert.equal(buildTerminalBody(input,prerequisites).metrics.examples,'41x3');
});

test('pure validator rejects mutations and every nonterminal gate status',()=>{
 for(const status of ['failed','blocked','pending','not-run']){const input=fixture();input.readiness.components[0].dimensions.root.status=status;const result=validateTerminalInputs(input);assert.equal(result.valid,false,status);assert.match(result.errors.join('\n'),new RegExp(status))}
 const authority=fixture();authority.authority.authority.scope.executable=40;assert.equal(validateTerminalInputs(authority).valid,false);
 const optimistic=fixture();optimistic.frameworks.vue.vectorsPassed=123;assert.equal(validateTerminalInputs(optimistic).valid,false);
 const stale=fixture();stale.production.identity.commit='not-a-sha';assert.equal(validateTerminalInputs(stale).valid,false);
 const progress=fixture();progress.progress.phases[0]={done:0,total:1,status:'not-run'};assert.equal(validateTerminalInputs(progress).valid,false);
});

test('repository invocation follows the real progress receipt fail-closed',async()=>{
 const progress=JSON.parse(await (await import('node:fs/promises')).readFile('proof/progress/latest.json','utf8'));
 const result=spawnSync(process.execPath,['scripts/build-terminal-receipt.mjs'],{encoding:'utf8'});
 if(progress.phases.every(phase=>phase.status==='passed')){
  assert.equal(result.status,0,result.stderr);
  assert.match(result.stdout,/kumo-terminal/);
 }else{
  assert.notEqual(result.status,0,'nonterminal progress must reject terminal receipt generation');
  assert.match(result.stderr,/terminal prerequisites rejected|not-run|every phase passes/);
 }
});
