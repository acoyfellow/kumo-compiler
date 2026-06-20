import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const read=p=>fs.readFileSync(path.join(root,p));
const load=p=>JSON.parse(read(p));
const hash=bytes=>'sha256:'+crypto.createHash('sha256').update(bytes).digest('hex');
const stable=value=>JSON.stringify(value,Object.keys(value).sort());
const digest=value=>hash(Buffer.from(stable(value)));
const candidates=['internal-ts','mitosis','shared-core-native','minimal-hybrid'];
const components=['Button','Select'];
const frameworks=['react','solid','svelte','vue'];
const gateSpec=load('proof/shootout/architectures/gates.json');
const mandatory=gateSpec.mandatory;
const sourceRevision=process.env.SHOOTOUT_REVISION||execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const sourceTree=hash(Buffer.from(execFileSync('git',['ls-files','-s'],{cwd:root,encoding:'utf8'})));
const environmentSource='proof/shootout/baseline/environment.json';
const environment={...load(environmentSource),browser:'Google Chrome (recorded by source evidence)'};
const provenance={sourceRevision,sourceTree,workloadHash:hash(read('proof/shootout/architectures/gates.json')),baselineHash:hash(read('proof/shootout/baseline/baseline.json')),environmentHash:hash(read(environmentSource)),browserHash:digest({browser:environment.browser})};
const runId='axis-b-'+hash(Buffer.from(JSON.stringify(provenance))).slice(7,23);
const sourceFor=(candidate,component,framework)=>{
 if(candidate==='mitosis') return `proof/bakeoff/mitosis/receipts/${component.toLowerCase()}.${framework}.json`;
 if(candidate==='shared-core-native') return component==='Button' ? `proof/bakeoff/shared-core/receipts/button.${framework}.json` : 'proof/select/receipts.json';
 if(candidate==='minimal-hybrid') return component==='Button' ? 'candidates/hybrid/src/generated/button.ts' : 'candidates/hybrid/src/native/select.ts';
 return component==='Button' ? `generated/receipts/button.${framework}.json` : `deploy/receipts/select.${framework}.json`;
};
const mapStatus=(candidate,component,framework,data)=>{
 const gates=Object.fromEntries(mandatory.map(g=>[g,'blocked']));
 let reason='source evidence cannot be rebound to the frozen shootout gates';
 let evidenceMode='mapped';
 if(candidate==='mitosis'&&data){
  const e=data.evidence||{}; Object.assign(gates,{api:e.runtime||'not-run','dom-aria':e.domAria||'not-run',behavior:e.behavior||'not-run',client:e.runtime||'not-run',ssr:e.ssr||'not-run',hydration:e.hydrationWarnings||'not-run','node-preservation':e.nodePreservation||'not-run',package:e.package||'not-run',types:e.types||'not-run',exports:e.package||'not-run',styles:e.styles||'not-run',consumer:'not-run'});
  reason=component==='Select'?'generated source exists but hard execution gates were not run':'real browser evidence exists, but critical SSR/package/consumer gates are blocked or not-run';
 } else if(candidate==='shared-core-native'&&component==='Button'&&data){
  const g=data.gates; Object.assign(gates,{api:g.publicApi,'dom-aria':g.domAria,behavior:g.behavior,client:g.behavior,ssr:g.ssr,hydration:g.hydrationWarnings,'node-preservation':g.nodePreservation,package:g.packageTreeShaking,types:g.types,exports:g.packageTreeShaking,styles:'not-run',consumer:'not-run'}); reason='normalized Button evidence passes most gates; frozen styles and consumer gates are not-run'; evidenceMode='executed';
 } else if(candidate==='shared-core-native'&&component==='Select'&&data){
  const sg=data.targets[framework].gates; Object.assign(gates,{api:sg['package-types-exports-styles'],'dom-aria':sg['dom-aria'],behavior:[sg['pointer-open-select'],sg['keyboard-arrow-home-end-page-enter-space-escape-tab'],sg.typeahead].includes('failed')?'failed':'blocked',client:sg['client-build'],ssr:sg.ssr,hydration:sg.hydration,'node-preservation':sg['server-node-preservation'],package:sg['package-types-exports-styles'],types:sg['package-types-exports-styles'],exports:sg['package-types-exports-styles'],styles:sg['package-types-exports-styles'],consumer:'not-run'}); reason='current native Select execution is failed/blocked and has no consumer proof'; evidenceMode='executed';
 } else if(candidate==='minimal-hybrid'){ reason=component==='Button'?'generated Button is referenced but has no shootout execution receipt':'native Select is referenced without duplication, but no hybrid execution was run'; evidenceMode='prepared'; }
 const values=Object.values(gates);
 for(const value of values) if(!['passed','failed','blocked','not-run'].includes(value)) throw new Error(`invalid source status ${value}`);
 const status=values.every(x=>x==='passed')?'passed':values.includes('failed')?'failed':'blocked';
 return {gates,status,reason,evidenceMode};
};
const receipts=[];
for(const candidate of candidates) for(const component of components) for(const framework of frameworks){
 const sourcePath=sourceFor(candidate,component,framework); const exists=fs.existsSync(path.join(root,sourcePath));
 const data=exists&&sourcePath.endsWith('.json')?load(sourcePath):null;
 const mapped=mapStatus(candidate,component,framework,data);
 const sourceDigest=exists?hash(read(sourcePath)):null;
 const ledger={adaptations:data?.adaptations||[],plugins:[],wrappers:[],patches:[],native:component==='Select'&&['shared-core-native','minimal-hybrid'].includes(candidate),manual:[],harness:['frozen shootout/v1 normalized mapping']};
 receipts.push({schemaVersion:'kumo.architecture-cell/v1',axis:'B-output-architecture',candidate,component,framework,contract:'shootout/v1',candidateRevision:sourceRevision,controlRevision:sourceRevision,...provenance,environment,runId,source:{path:sourcePath,exists,digest:sourceDigest},evidenceDigest:digest({candidate,component,framework,sourceDigest,mapped,ledger}),...mapped,ledger,measurements:null,eligible:mapped.status==='passed'});
}
const expected=new Set(candidates.flatMap(c=>components.flatMap(k=>frameworks.map(f=>`${c}/${k}/${f}`))));
const actual=receipts.map(r=>`${r.candidate}/${r.component}/${r.framework}`);
if(actual.length!==expected.size||new Set(actual).size!==actual.length||actual.some(id=>!expected.has(id))||[...expected].some(id=>!actual.includes(id))) throw new Error('matrix candidates/components/frameworks differ from exact expected cells');
const gateCounts={passed:0,failed:0,blocked:0,'not-run':0};
for(const receipt of receipts) for(const value of Object.values(receipt.gates)) gateCounts[value]++;
const candidateCellCounts=Object.fromEntries(candidates.map(c=>[c,receipts.filter(r=>r.candidate===c).length]));
const criticalIncomplete=receipts.some(r=>r.status!=='passed');
const output={schemaVersion:'kumo.architecture-matrix/v1',axis:'B-output-architecture',revision:sourceRevision,...provenance,contract:'shootout/v1',environment,dimensions:{candidates,components,frameworks},cellCount:receipts.length,candidateCellCounts,gateCounts,receipts,disqualifications:gateSpec.hardDisqualifiers,weightsApplied:!criticalIncomplete,winner:null,verdict:criticalIncomplete?'no-winner-critical-cells-incomplete':'eligible-for-weighting',failClosed:true};
if(criticalIncomplete&&(output.weightsApplied||output.winner!==null)) throw new Error('critical incomplete matrix must fail closed');
fs.mkdirSync(path.join(root,'proof/shootout/architectures'),{recursive:true});
fs.writeFileSync(path.join(root,'proof/shootout/architectures/matrix.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({cellCount:receipts.length,candidateCellCounts,gateCounts,winner:null,verdict:output.verdict}));
