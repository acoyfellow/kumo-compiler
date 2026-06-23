import {createHash} from 'node:crypto';
import {mkdtemp,readFile,writeFile,mkdir,rm,stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const here=fileURLToPath(new URL('..',import.meta.url));
const sha=x=>createHash('sha256').update(x).digest('hex');
const canonical=x=>JSON.stringify(x);
const run=(cmd,args,options={})=>new Promise((ok,no)=>{const p=spawn(cmd,args,{...options,stdio:['ignore','pipe','pipe']});let out='',err='';p.stdout.on('data',x=>out+=x);p.stderr.on('data',x=>err+=x);p.on('error',no);p.on('close',code=>code?no(new Error(`${cmd} ${args.join(' ')} failed (${code})\n${out}${err}`)):ok({out,err}))});
const symbol=id=>id.split('-').map(x=>x[0].toUpperCase()+x.slice(1)).join('');

export async function buildComponentExamples({root=here,write=true,mutate}={}){
 const artifacts=JSON.parse(await readFile(resolve(root,'library-artifacts/manifest.json'),'utf8'));
 const readinessBytes=await readFile(resolve(root,'proof/readiness/latest.json'));
 const readiness=JSON.parse(readinessBytes);
 if(readiness.count!==41||readiness.implementationReadyCount!==41)throw Error('examples fail-closed: readiness receipt is not 41/41');
 const expected=readiness.components.map(x=>x.component).sort();
 const work=await mkdtemp(join(tmpdir(),'kumo-component-examples-'));
 try{
  const targets=[];
  for(const framework of ['vue','svelte','solid']){
   const artifact=artifacts.packages.find(x=>x.framework===framework);
   if(!artifact||artifact.components.length!==41)throw Error(`examples fail-closed: ${framework} artifact manifest incomplete`);
   const tgz=resolve(root,`library-artifacts/kumo-${framework}-0.0.1.tgz`);
   const bytes=await readFile(tgz); if(sha(bytes)!==artifact.sha256)throw Error(`examples fail-closed: ${framework} package hash mismatch`);
   const dir=join(work,framework);await mkdir(join(dir,'src'),{recursive:true});
   const pkg=artifact.package;
   const deps={vite:'8.0.16',[pkg]:`file:${tgz}`};
   if(framework==='vue')Object.assign(deps,{vue:'3.5.38','@vitejs/plugin-vue':'6.0.7'});
   if(framework==='svelte')Object.assign(deps,{svelte:'5.56.3','@sveltejs/vite-plugin-svelte':'7.1.2'});
   if(framework==='solid')Object.assign(deps,{'solid-js':'1.9.13','vite-plugin-solid':'2.11.12'});
   await writeFile(join(dir,'package.json'),JSON.stringify({private:true,type:'module',dependencies:deps}));
   await run('npm',['install','--offline','--ignore-scripts','--no-audit','--no-fund'],{cwd:dir});
   const inputs={};
   for(const id of expected){
    const name=symbol(id),path=join(dir,'src',`${id}.${framework==='solid'?'tsx':'js'}`);inputs[id]=path;
    let source;
    if(framework==='vue')source=`import {createApp,h} from 'vue';\nimport Comp from '${pkg}/${id}';\nimport '${pkg}/styles.css';\ncreateApp({render:()=>h(Comp)}).mount(document.body);\n`;
    if(framework==='svelte')source=`import {mount} from 'svelte';\nimport Comp from '${pkg}/${id}';\nimport '${pkg}/styles.css';\nmount(Comp,{target:document.body});\n`;
    if(framework==='solid')source=`import {createComponent} from 'solid-js';\nimport {render} from 'solid-js/web';\nimport {${name} as Comp} from '${pkg}/${id}';\nimport '${pkg}/styles.css';\nrender(()=>createComponent(Comp,{}),document.body);\n`;
    if(mutate?.framework===framework&&mutate?.component===id)source=mutate.source;
    await writeFile(path,source);
   }
   const plugin=framework==='vue'?`import vue from '@vitejs/plugin-vue';\nexport default {plugins:[vue()],build:{rollupOptions:{input:${JSON.stringify(inputs)},output:{entryFileNames:'[name].js'}}}};`:
    framework==='svelte'?`import {svelte} from '@sveltejs/vite-plugin-svelte';\nexport default {plugins:[svelte()],build:{rollupOptions:{input:${JSON.stringify(inputs)},output:{entryFileNames:'[name].js'}}}};`:
    `import solid from 'vite-plugin-solid';\nexport default {plugins:[solid()],build:{rollupOptions:{input:${JSON.stringify(inputs)},output:{entryFileNames:'[name].js'}}}};`;
   await writeFile(join(dir,'vite.config.js'),plugin);
   const result=await run(join(dir,'node_modules/.bin/vite'),['build','--emptyOutDir'],{cwd:dir});
   if(/warning|error/i.test(result.err))throw Error(`examples fail-closed: ${framework} diagnostics: ${result.err}`);
   const outputs=[];for(const id of expected){const file=join(dir,'dist',`${id}.js`);let size;try{size=(await stat(file)).size}catch{throw Error(`examples fail-closed: missing ${framework}/${id} output`)}if(!size)throw Error(`examples fail-closed: empty ${framework}/${id} output`);outputs.push({component:id,status:'passed',output:`${id}.js`})}
   targets.push({framework,package:pkg,packageSha256:artifact.sha256,artifact:`library-artifacts/kumo-${framework}-0.0.1.tgz`,receiptDigest:artifact.receiptDigest,componentCount:outputs.length,status:'passed',entries:outputs});
  }
  const report={schemaVersion:'kumo.component-examples/v1',componentCount:41,targetCount:3,passedCount:123,status:'passed',readinessDigest:sha(readinessBytes),sourceAliases:false,targets};
  report.contentDigest=sha(canonical(report));
  if(write){await mkdir(resolve(root,'proof/examples'),{recursive:true});await writeFile(resolve(root,'proof/examples/latest.json'),JSON.stringify(report,null,2)+'\n')}
  return report;
 }finally{await rm(work,{recursive:true,force:true})}
}

if(process.argv[1]===fileURLToPath(import.meta.url))buildComponentExamples().then(r=>console.log(`${r.passedCount}/123 component examples passed`)).catch(e=>{console.error(e);process.exitCode=1});
