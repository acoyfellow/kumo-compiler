import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=process.cwd();
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const digest=value=>'sha256:'+crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const candidates=['internal-ts','mitosis','shared-core-native','minimal-hybrid'];
const components=['Button','Select'];
const frameworks=['react','solid','svelte','vue'];
const mandatory=load('proof/shootout/architectures/gates.json').mandatory;
const revision=process.env.SHOOTOUT_REVISION||String((await import('node:child_process')).execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'})).trim();
const environment={...load('proof/shootout/baseline/environment.json'),browser:'Google Chrome (recorded by source evidence)'};
const sourceFor=(candidate,component,framework)=>{
 if(candidate==='mitosis') return `proof/bakeoff/mitosis/receipts/${component.toLowerCase()}.${framework}.json`;
 if(candidate==='shared-core-native') return component==='Button' ? `proof/bakeoff/shared-core/receipts/button.${framework}.json` : 'proof/select/receipts.json';
 if(candidate==='minimal-hybrid') return component==='Button' ? 'candidates/hybrid/src/generated/button.ts' : 'candidates/hybrid/src/native/select.ts';
 return component==='Button' ? `generated/receipts/button.${framework}.json` : `deploy/receipts/select.${framework}.json`;
};
const mapStatus=(candidate,component,framework,source,data)=>{
 const gates=Object.fromEntries(mandatory.map(g=>[g,'blocked']));
 let reason='source evidence cannot be rebound to the frozen shootout gates';
 if(candidate==='mitosis'&&data){
  const e=data.evidence||{}; Object.assign(gates,{api:e.runtime||'not-run','dom-aria':e.domAria||'not-run',behavior:e.behavior||'not-run',client:e.runtime||'not-run',ssr:e.ssr||'not-run',hydration:e.hydrationWarnings||'not-run','node-preservation':e.nodePreservation||'not-run',package:e.package||'not-run',types:e.types||'not-run',exports:e.package||'not-run',styles:e.styles||'not-run',consumer:'not-run'});
  reason=component==='Select'?'generated source exists but hard execution gates were not run':'real browser evidence exists, but critical SSR/package/consumer gates are blocked or not-run';
 } else if(candidate==='shared-core-native'&&component==='Button'&&data){
  const g=data.gates; Object.assign(gates,{api:g.publicApi,'dom-aria':g.domAria,behavior:g.behavior,client:g.behavior,ssr:g.ssr,hydration:g.hydrationWarnings,'node-preservation':g.nodePreservation,package:g.packageTreeShaking,types:g.types,exports:g.packageTreeShaking,styles:'not-run',consumer:'not-run'}); reason='normalized Button evidence passes most gates; frozen styles and consumer gates are not-run';
 } else if(candidate==='shared-core-native'&&component==='Select'&&data){
  const t=data.targets[framework], sg=t.gates; Object.assign(gates,{api:sg['package-types-exports-styles'],'dom-aria':sg['dom-aria'],behavior:[sg['pointer-open-select'],sg['keyboard-arrow-home-end-page-enter-space-escape-tab'],sg.typeahead].includes('failed')?'failed':'blocked',client:sg['client-build'],ssr:sg.ssr,hydration:sg.hydration,'node-preservation':sg['server-node-preservation'],package:sg['package-types-exports-styles'],types:sg['package-types-exports-styles'],exports:sg['package-types-exports-styles'],styles:sg['package-types-exports-styles'],consumer:'not-run'}); reason='current native Select execution is failed/blocked and has no consumer proof';
 } else if(candidate==='minimal-hybrid') reason=component==='Button'?'generated Button is referenced but has no shootout execution receipt':'native Select is referenced without duplication, but no hybrid execution was run';
 else reason='immutable control receipt does not expose the frozen gate contract and cannot be optimistically rebound';
 const status=Object.values(gates).every(x=>x==='passed')?'passed':Object.values(gates).includes('failed')?'failed':'blocked';
 return {gates,status,reason};
};
const receipts=[];
for(const candidate of candidates) for(const component of components) for(const framework of frameworks){
 const source=sourceFor(candidate,component,framework); let data=null;
 if(fs.existsSync(path.join(root,source))&&source.endsWith('.json')) data=load(source);
 const mapped=mapStatus(candidate,component,framework,source,data);
 const sourceDigest=fs.existsSync(path.join(root,source))?'sha256:'+crypto.createHash('sha256').update(fs.readFileSync(path.join(root,source))).digest('hex'):null;
 receipts.push({schemaVersion:'kumo.architecture-cell/v1',axis:'B-output-architecture',candidate,component,framework,contract:'shootout/v1',candidateRevision:revision,controlRevision:revision,environment,runId:'axis-b-'+revision.slice(0,12),source:{path:source,exists:fs.existsSync(path.join(root,source)),digest:sourceDigest},evidenceDigest:digest({candidate,component,framework,sourceDigest,mapped}),...mapped,ledger:{adaptations:data?.adaptations||[],plugins:[],wrappers:[],patches:[],native:component==='Select'&&['shared-core-native','minimal-hybrid'].includes(candidate),manual:[],harness:['frozen shootout/v1 normalized mapping']},measurements:null,eligible:mapped.status==='passed'});
}
const ids=new Set(receipts.map(r=>`${r.candidate}/${r.component}/${r.framework}`));
if(receipts.length!==32||ids.size!==32) throw new Error('matrix must contain exactly 32 unique cells');
const criticalIncomplete=receipts.some(r=>r.status!=='passed');
const output={schemaVersion:'kumo.architecture-matrix/v1',axis:'B-output-architecture',revision,contract:'shootout/v1',environment,dimensions:{candidates,components,frameworks},cellCount:receipts.length,receipts,disqualifications:load('proof/shootout/architectures/gates.json').hardDisqualifiers,weightsApplied:!criticalIncomplete,winner:null,verdict:criticalIncomplete?'no-winner-critical-cells-incomplete':'eligible-for-weighting',failClosed:true};
fs.mkdirSync(path.join(root,'proof/shootout/architectures'),{recursive:true});
fs.writeFileSync(path.join(root,'proof/shootout/architectures/matrix.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({cellCount:32,winner:null,verdict:output.verdict}));
