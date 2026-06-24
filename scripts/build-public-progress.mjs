import{readFile,writeFile,mkdir}from'node:fs/promises';
import{createHash}from'node:crypto';
import{resolve}from'node:path';
const root=resolve(import.meta.dirname,'..');
const json=async p=>JSON.parse(await readFile(resolve(root,p),'utf8'));
const [status,canonical,readiness,packages,libraryPages,examples,docs,vueReceipt,svelteReceipt,solidReceipt,nativeDemo,componentPages,visualParity,production]=await Promise.all([
 json('proof/observable-contracts/status.json'),
 json('proof/observable-contracts/canonical.json'),
 json('proof/readiness/latest.json'),
 json('library-artifacts/manifest.json'),
 json('proof/library-pages/receipt.json'),
 json('proof/examples/latest.json'),
 json('proof/docs/latest.json'),
 json('proof/dx/conformance/vue/receipt.json'),
 json('proof/dx/conformance/svelte/receipt.json'),
 json('proof/dx/conformance/solid/receipt.json'),
 json('proof/native-demo-fidelity/latest.json').catch(()=>({status:'not-run'})),
 json('proof/component-pages/latest.json').catch(()=>({status:'not-run'})),
 json('proof/visual-parity/latest.json').catch(()=>({status:'not-run',counts:{passed:0},scope:{cells:123}})),
 json('proof/production-terminal/latest.json').catch(()=>({status:'not-run'})),
]);
const componentId=x=>x.replace(/([a-z0-9])([A-Z])/g,'$1-$2').toLowerCase();
const packaged=[...new Set(packages.packages.flatMap(x=>x.components).map(componentId))].sort();
const allFrameworks=packages.packages.length===3;
const examplesComplete=examples.status==='passed'&&examples.componentCount===41&&examples.targetCount===3&&examples.passedCount===123;
const docsComplete=docs.status==='passed'&&docs.componentReferenceCoverage?.covered===41&&docs.componentReferenceCoverage?.total===41&&docs.diataxis?.covered===4&&docs.diataxis?.total===4;
const documented=examplesComplete&&docsComplete?41:0;
const completeComponents=receipt=>{
 const groups=new Map();
 for(const cell of receipt.cells??[]){const id=componentId(cell.component);const group=groups.get(id)??[];group.push(cell);groups.set(id,group)}
 return new Set([...groups].filter(([,cells])=>cells.length>0&&cells.every(cell=>cell.status==='passed')).map(([id])=>id));
};
const canonicalComplete=completeComponents(canonical);
const downstreamComplete=[vueReceipt,svelteReceipt,solidReceipt].map(completeComponents);
const conformedComponents=packaged.filter(id=>canonicalComplete.has(id)&&downstreamComplete.every(set=>set.has(id)));
const knownProductGaps=[
 {component:'date-range-picker',issue:'Native homepage demo is not yet a real range-picker interaction comparable to canonical React.'},
 {component:'date-picker',issue:'Calendar demo requires product-fidelity interaction/visual audit, not only mount proof.'},
 {component:'select/autocomplete/combobox',issue:'Closed-state demos need native open/select interaction proof.'},
 {component:'dialog/popover/dropdown-menu/toasty',issue:'Layer demos need native open/close lifecycle proof in the homepage gallery.'},
 {component:'checkbox/switch',issue:'Visual state currently depends on gallery affordance CSS; native state interaction needs proof.'},
 {component:'field/breadcrumbs',issue:'Generated semantic paths have shown bad output and need source-level repair, not just gallery fixtures.'}
];
const nativeDemoDone=nativeDemo.status==='passed'&&nativeDemo.componentCount===41&&nativeDemo.frameworks?.length===3&&nativeDemo.failures?.length===0&&componentPages.status==='passed'&&componentPages.componentCount===41&&componentPages.pages?.length===41&&componentPages.failures?.length===0?41:0;
const phases=[
 {id:'contracts',label:'Canonical contracts',done:status.counts.contracted,total:41,status:status.counts.contracted===41?'passed':'in-progress'},
 {id:'canonical',label:'Canonical browser vectors',done:canonical.counts.passed??0,total:canonical.cells.length,status:canonical.status},
 {id:'library-ir',label:'Implementation-ready library models',done:readiness.count===41&&readiness.components.every(x=>x.implementationReady===true)?41:0,total:41,status:readiness.count===41&&readiness.components.every(x=>x.implementationReady===true)?'passed':'in-progress'},
 {id:'packages',label:'Components in all three packages',done:allFrameworks?packaged.length:0,total:41,status:allFrameworks&&packaged.length===41?'passed':'in-progress'},
 {id:'packed-conformance',label:'Four-framework package conformance',done:conformedComponents.length,total:41,status:conformedComponents.length===41?'passed':conformedComponents.length?'in-progress':'not-run'},
 {id:'examples-docs',label:'Complete component examples and docs',done:documented,total:41,status:documented===41?'passed':'in-progress'},
 {id:'native-demo-fidelity',label:'Native homepage demo fidelity',done:nativeDemoDone,total:41,status:nativeDemoDone===41?'passed':'failed'},
 {id:'visual-parity',label:'Exact canonical pixel parity (default state at 1440px)',done:visualParity.counts?.passed??0,total:visualParity.scope?.cells??123,status:visualParity.status==='passed'?'passed':visualParity.status==='not-run'?'not-run':'failed'},
 {id:'production',label:'Production proof for current frontend',done:0,total:1,status:'not-run'},
];
const current=phases.find(x=>x.status!=='passed')?.id??'complete';
const report={schemaVersion:2,scope:{classified:45,executable:41,upstreamBlocked:['PageHeader','ResourceListPage'],supplemental:['Chart','Flow']},currentPhase:current,phases,conformedComponents,packageNames:packages.packages.map(x=>x.package),knownProductGaps:nativeDemoDone===41?[]:knownProductGaps,humanOnly:['Git remote and GitHub release upload','Optional npm authentication and publish']};
report.digest=createHash('sha256').update(JSON.stringify(report)).digest('hex');
await mkdir(resolve(root,'proof/progress'),{recursive:true});
await writeFile(resolve(root,'proof/progress/latest.json'),JSON.stringify(report,null,2)+'\n');
const bar=x=>`${'█'.repeat(Math.round(20*x.done/x.total))}${'░'.repeat(20-Math.round(20*x.done/x.total))}`;
const md=`# Kumo completion progress\n\nCurrent phase: **${current}**\nMachine receipt: \`proof/progress/latest.json\`\n\n${phases.map(x=>`- ${x.status==='passed'?'✓':x.status==='in-progress'?'→':'○'} **${x.label}** — ${x.done}/${x.total}\n  \`${bar(x)}\``).join('\n')}\n\n## Scope\n\n- 41 executable components must complete every gate.\n- PageHeader and ResourceListPage remain upstream-export blocked.\n- Chart and Flow are supplemental, not executable.\n\n## Complete four-framework packed conformance\n\n${conformedComponents.length?conformedComponents.map(x=>`- ${x}`).join('\n'):'- None yet.'}\n\n## Current package surface\n\n${packaged.map(x=>`- ${x}`).join('\n')}\n\nThis file is generated from receipts. Do not edit it manually.\n`;
await writeFile(resolve(root,'docs/progress.md'),md);
console.log(`Progress: phase=${current}; contracts=${status.counts.contracted}/41; canonical=${canonical.counts.passed??0}/${canonical.cells.length}; packed=${conformedComponents.length}/41; packaged=${packaged.length}/41`);
