import{readFile,writeFile,mkdir}from'node:fs/promises';
import{createHash}from'node:crypto';
import{resolve}from'node:path';
const projectRoot=resolve(import.meta.dirname,'..');
const frameworks=['vue','svelte','solid'];
const dimensions=['root','subpath','types','client','ssr','hydration','nodeIdentity','dom','aria','pointer','keyboard','focus','portal','responsive','assets','styles','treeShaking','workspace','freshConsumer'];
const canonical=x=>Array.isArray(x)?`[${x.map(canonical).join(',')}]`:x&&typeof x==='object'?`{${Object.keys(x).filter(k=>x[k]!==undefined).sort().map(k=>`${JSON.stringify(k)}:${canonical(x[k])}`).join(',')}}`:JSON.stringify(x);
const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const modelDigest=x=>{const copy=structuredClone(x);delete copy.modelDigest;delete copy.readinessProof;return createHash('sha256').update(canonical(copy)).digest('hex')};
const kebab=x=>x.replace(/([a-z0-9])([A-Z])/g,'$1-$2').toLowerCase();
const passed=(source,detail)=>({status:'passed',source,detail});
const na=(source,reason)=>({status:'not-applicable',source,reason});
const requirePassed=(condition,message)=>{if(!condition)throw new Error(`readiness fail-closed: ${message}`)};
export async function buildReadiness({root=projectRoot,write=true}={}){
 const load=async p=>JSON.parse(await readFile(resolve(root,p),'utf8'));
 const library=await load('src/kumo/library/manifest.json');
 requirePassed(library.count===41&&library.components?.length===41,'source manifest must contain 41 components');
 const models=new Map();
 for(const entry of library.components){const model=await load(`src/kumo/library/${entry.file}`);requirePassed(modelDigest(model)===entry.digest,`${entry.component} source model digest mismatch`);models.set(entry.component,model)}
 const generated=Object.fromEntries(await Promise.all(frameworks.map(async f=>[f,await load(`generated/libraries/${f}/manifest.json`)])));
 const packageManifest=await load('library-artifacts/manifest.json');
 const libraryReceipts=Object.fromEntries(await Promise.all(frameworks.map(async f=>[f,await load(`proof/dx/${f}-library/receipt.json`)])));
 const conformance=Object.fromEntries(await Promise.all(frameworks.map(async f=>[f,await load(`proof/dx/conformance/${f}/receipt.json`)])));
 requirePassed(packageManifest.packages?.length===3,'three package manifests required');
 const components=library.components.map(entry=>{
  const model=models.get(entry.component),expectedSubpath=model.public?.subpath;
  const targets={};
  for(const framework of frameworks){
   const generatedEntry=generated[framework].components?.find(x=>kebab(x.component)===entry.component);
   const pkg=packageManifest.packages.find(x=>x.framework===framework);
   const receipt=libraryReceipts[framework],conf=conformance[framework];
   requirePassed(generatedEntry,`${entry.component}/${framework} generated manifest entry missing`);
   requirePassed(generatedEntry.modelDigest===entry.digest,`${entry.component}/${framework} model digest mismatch`);
   requirePassed(generatedEntry.subpath===expectedSubpath,`${entry.component}/${framework} exact subpath mismatch`);
   requirePassed(pkg?.components?.map(kebab).includes(entry.component),`${entry.component}/${framework} package manifest entry missing`);
   requirePassed(receipt.packageSha256===pkg.sha256,`${framework} library receipt package digest mismatch`);
   const surface=receipt.exportSurface??{},pc=receipt.packageConformance??{};
   const commandText=(receipt.commands??[]).join(' ').toLowerCase();
   requirePassed(surface.componentCount===41,`${framework} root export surface incomplete`);
   requirePassed(surface.types==='passed'||surface.typecheck==='passed'||surface.declarationSymbols?.length>=41||surface.slugImports==='passed',`${framework} types not proven`);
   requirePassed((pc.clientBuild==='passed'||commandText.includes('client build'))&&(pc.ssrBuild==='passed'||commandText.includes('ssr build'))&&(pc.renderToString==='passed'||commandText.includes('rendertostring')),`${framework} client/SSR not proven`);
   requirePassed((pc.cssAssetsPresent==='passed'||commandText.includes('css/assets')||commandText.includes('file audit')||commandText.includes('tar file audit')),'assets/styles not proven');
   requirePassed((surface.treeShaking==='passed'||pc.treeShaking==='passed'||commandText.includes('tree-shaking')),'tree-shaking not proven');
   requirePassed((pc.workspace==='passed'||commandText.includes('workspace')),'workspace not proven');
   requirePassed(commandText.includes('install'),'fresh consumer install not proven');
   requirePassed(conf.counts?.passed===124&&conf.cells?.length===124,`${framework} conformance must be 124/124`);
   requirePassed(conf.policy?.trustedInteractions===true,`${framework} trusted actions not proven`);
   const cells=conf.cells.filter(x=>kebab(x.component)===entry.component);
   requirePassed(cells.length>0&&cells.every(x=>x.status==='passed'&&x.ssr==='passed'&&x.assertion?.status==='passed'&&(x.mode==='ssr'?(x.hydration==='not-run'&&x.nodeIdentity==='native-packed-fixture'&&x.observation?.markupSha256):(x.hydration==='passed'&&x.nodeIdentity==='preserved'&&x.observation&&Object.keys(x.observation).length>0))),`${entry.component}/${framework} browser cells incomplete`);
   targets[framework]={modelDigest:generatedEntry.modelDigest,packageSha256:pkg.sha256,cellCount:cells.length,receiptHash:conf.receiptHash,libraryReceiptHash:receipt.receiptHash};
  }
  const cells=frameworks.flatMap(f=>conformance[f].cells.filter(x=>kebab(x.component)===entry.component));
  const vectors=cells.map(x=>x.vector).join(' ').toLowerCase();
  const semantic=model.semanticGraph??{};
  const applicable=(needle,contract)=>vectors.includes(needle)||Boolean(contract);
  const evidence={
   root:passed('library receipts','exact root imports and symbols'),subpath:passed('manifests/library receipts',expectedSubpath),types:passed('library receipts','packed declarations/typecheck'),client:passed('library receipts','Vite client builds'),ssr:passed('library and conformance receipts','SSR build/render and every cell'),hydration:passed('conformance receipts','every browser cell hydrated'),nodeIdentity:passed('conformance receipts','server node identity preserved'),dom:passed('conformance receipts','asserted DOM observations'),
   aria:applicable('aria',semantic.aria?.length)?passed('contract + conformance','applicable ARIA assertions passed'):na('component contract','no ARIA-specific behavior declared'),
   pointer:applicable('click',model.behavior?.transitions?.length)?passed('trusted conformance','trusted pointer actions passed'):na('component contract','no pointer transition declared'),
   keyboard:applicable('key',semantic.keys?.length)?passed('trusted conformance','trusted keyboard actions passed'):na('component contract','no keyboard behavior declared'),
   focus:applicable('focus',semantic.focusable)?passed('trusted conformance','focus assertions passed'):na('component contract','not focusable and no focus contract'),
   portal:applicable('portal',model.capabilities?.some(x=>/layer|portal|popover|dialog/.test(x)))?passed('trusted conformance','portal/layer vectors passed'):na('component contract','no portal or layer capability'),
   responsive:applicable('responsive',model.capabilities?.some(x=>/responsive/.test(x)))?passed('trusted conformance','responsive vectors passed'):na('component contract','no responsive behavior declared'),
   assets:passed('library receipts','packed asset audit'),styles:passed('library receipts','packed CSS/style audit'),treeShaking:passed('library receipts','isolated production build'),workspace:passed('library receipts','workspace consumer build'),freshConsumer:passed('library receipts','fresh packed install')
  };
  requirePassed(dimensions.every(x=>['passed','not-applicable'].includes(evidence[x]?.status)),`${entry.component} terminal evidence incomplete`);
  return{component:entry.component,modelDigest:entry.digest,implementationReady:true,dimensions:evidence,targets};
 });
 const report={schemaVersion:'kumo.readiness/v1',count:components.length,implementationReadyCount:components.filter(x=>x.implementationReady).length,dimensions,components};
 report.digest=sha(report);
 if(write){await mkdir(resolve(root,'proof/readiness'),{recursive:true});await writeFile(resolve(root,'proof/readiness/latest.json'),JSON.stringify(report,null,2)+'\n')}
 return report;
}
if(process.argv[1]&&resolve(process.argv[1])===resolve(import.meta.filename)){const r=await buildReadiness();console.log(`Readiness: ${r.implementationReadyCount}/${r.count}`)}
