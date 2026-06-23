import{readFile,writeFile,mkdir,access}from'node:fs/promises';
import{createHash}from'node:crypto';
import{resolve}from'node:path';
import{spawn}from'node:child_process';
const projectRoot=resolve(import.meta.dirname,'..');
const frameworks=['vue','svelte','solid'];
const canonical=x=>Array.isArray(x)?`[${x.map(canonical).join(',')}]`:x&&typeof x==='object'?`{${Object.keys(x).filter(k=>x[k]!==undefined).sort().map(k=>`${JSON.stringify(k)}:${canonical(x[k])}`).join(',')}}`:JSON.stringify(x);
const digest=x=>createHash('sha256').update(canonical(x)).digest('hex');
const fail=message=>{throw new Error(`docs coverage fail-closed: ${message}`)};
const exists=async path=>access(path).then(()=>true,()=>false);
const run=(command,args,cwd)=>new Promise((ok,no)=>{const child=spawn(command,args,{cwd,stdio:'inherit'});child.on('error',no);child.on('exit',code=>code===0?ok():no(new Error(`${command} exited ${code}`)))});
export async function buildDocsCoverage({root=projectRoot,write=true,build=true}={}){
 const json=async path=>JSON.parse(await readFile(resolve(root,path),'utf8'));
 const [readiness,library,...manifests]=await Promise.all([json('proof/readiness/latest.json'),json('src/kumo/library/manifest.json'),...frameworks.map(x=>json(`generated/libraries/${x}/manifest.json`))]);
 if(readiness.count!==41||readiness.implementationReadyCount!==41||readiness.components?.length!==41)fail('readiness receipt must prove 41/41');
 if(library.count!==41||library.components?.length!==41)fail('library manifest must contain 41 components');
 const ids=library.components.map(x=>x.component).sort();
 if(new Set(ids).size!==41)fail('component identities must be unique');
 for(const [i,framework] of frameworks.entries()){
  const covered=new Set(manifests[i].components?.map(x=>x.component.replace(/([a-z0-9])([A-Z])/g,'$1-$2').toLowerCase()));
  if(manifests[i].count!==41||ids.some(id=>!covered.has(id)))fail(`${framework} manifest is incomplete`);
 }
 if(build)await run('npm',['run','build'],resolve(root,'astro'));
 const components=[];
 for(const id of ids){
  const relative=`components/${id}/index.html`,path=resolve(root,'astro/dist',relative);
  if(!await exists(path))fail(`missing /components/${id}/`);
  const html=await readFile(path,'utf8'),ready=readiness.components.find(x=>x.component===id);
  if(!ready?.implementationReady)fail(`${id} is absent from readiness receipt`);
  if(!new RegExp(`<h1[^>]*>\\s*${id.replaceAll('-','[ -]?')}\\s*</h1>`,'i').test(html)&&!html.includes(`<title>${id}`)&&!html.toLowerCase().includes(`>${id.replaceAll('-',' ')}<`))fail(`${id} identity missing from route`);
  const hasFrameworks=['React','Vue','Svelte','Solid'].every(x=>new RegExp(`>${x}<|aria-label="${x}"`,'i').test(html));
  const hasPackageLink=/href="\/docs\/reference\/packages\/?"/.test(html);
  const hasProofLink=/href="\/docs\/progress\/?"/.test(html);
  if(!hasFrameworks||!hasPackageLink||!hasProofLink)fail(`${id} lacks framework, package, or proof navigation`);
  components.push({id,path:`/components/${id}/`,modelDigest:ready.modelDigest,frameworks:['react',...frameworks],sections:{identity:true,frameworks:true,package:true,proof:true}});
 }
 const categories={tutorial:{routes:['/docs/tutorials/first-library/']},howTo:{routes:['/docs/how-to/install/','/docs/how-to/forms/']},reference:{routes:['/docs/reference/packages/','/docs/reference/styles/']},explanation:{routes:['/docs/explanation/compiler/','/docs/explanation/evidence/']}};
 for(const [category,value] of Object.entries(categories))for(const route of value.routes){const path=resolve(root,'astro/dist',route.slice(1),'index.html');if(!await exists(path))fail(`missing ${category} route ${route}`);const html=await readFile(path,'utf8');if(!/<main[ >]/i.test(html)||!/<h1[ >]/i.test(html))fail(`${route} lacks core document content`)}
 const compiler=await readFile(resolve(root,'astro/dist/docs/explanation/compiler/index.html'),'utf8');
 if(!/compiler/i.test(compiler))fail('compiler explanation is absent');
 const receipt={schemaVersion:'kumo.docs-coverage/v1',status:'passed',sources:{readinessDigest:readiness.digest,libraryManifestDigest:digest(library),frameworkManifestDigests:Object.fromEntries(frameworks.map((x,i)=>[x,digest(manifests[i])]))},componentReferenceCoverage:{covered:components.length,total:41,components},diataxis:{covered:4,total:4,categories}};
 receipt.digest=digest(receipt);
 if(write){await mkdir(resolve(root,'proof/docs'),{recursive:true});await writeFile(resolve(root,'proof/docs/latest.json'),JSON.stringify(receipt,null,2)+'\n')}
 return receipt;
}
if(process.argv[1]&&resolve(process.argv[1])===resolve(import.meta.filename)){const receipt=await buildDocsCoverage();console.log(`Docs coverage: ${receipt.componentReferenceCoverage.covered}/${receipt.componentReferenceCoverage.total}; Diataxis ${receipt.diataxis.covered}/${receipt.diataxis.total}`)}
