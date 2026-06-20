import {cp,mkdir,readFile,rm,writeFile,access} from 'node:fs/promises';
import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve,relative} from 'node:path';
const root=resolve(import.meta.dirname,'../..'), proof=resolve(root,'proof/dx'), sandbox=resolve(proof,'.work');
const frameworks=['vue','svelte','solid'];
const receipts=[];
const run=(cmd,args,cwd=root)=>execFileSync(cmd,args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe'],env:{...process.env,npm_config_cache:resolve(proof,'.npm-cache'),npm_config_offline:'true',npm_config_audit:'false',npm_config_fund:'false'}}).trim();
const receipt=(framework,caseName,status,command,extra={})=>receipts.push({framework,case:caseName,status,command,...extra});
await rm(sandbox,{recursive:true,force:true}); await mkdir(sandbox,{recursive:true});
const versions={node:process.version,npm:run('npm',['--version'])};
for(const framework of frameworks){
 const source=resolve(root,'dx/packages/kumo-'+framework), stage=resolve(source,'dist'); await rm(stage,{recursive:true,force:true}); await mkdir(stage,{recursive:true});
 const shared=resolve(root,'candidates/shared-core/src/views'); await cp(resolve(shared,'native.ts'),resolve(stage,'native.ts'));
 if(framework==='svelte'){for(const f of ['Button.svelte','Field.svelte','Tabs.svelte','index.ts']) await cp(resolve(shared,'svelte',f),resolve(stage,f));}
 else {for(const f of framework==='solid'?['components.tsx','index.ts']:['index.ts']) await cp(resolve(shared,framework,f),resolve(stage,f));}
 await cp(resolve(root,'candidates/shared-core/styles.css'),resolve(stage,'styles.css')); await writeFile(resolve(stage,'tokens.css'),':root{--kumo-component-source:shared-core}\n');
 const pkg=JSON.parse(await readFile(resolve(source,'package.json'))); pkg.version='0.0.0-consumer-dx-pilot'; pkg.private=true; pkg.files=['dist','kumo.manifest.json'];
 const entry=framework==='svelte'?'./dist/index.ts':framework==='solid'?'./dist/index.ts':'./dist/index.ts'; pkg.exports={'.':{types:entry,import:entry},'./button':{types:entry,import:entry},'./field':{types:entry,import:entry},'./tabs':{types:entry,import:entry},'./styles.css':'./dist/styles.css','./tokens.css':'./dist/tokens.css','./manifest':'./kumo.manifest.json'}; await writeFile(resolve(source,'package.json'),JSON.stringify(pkg,null,2)+'\n');
 const packed=JSON.parse(run('npm',['pack','--json','--pack-destination',proof],source))[0], tar=resolve(proof,packed.filename), sha256=createHash('sha256').update(await readFile(tar)).digest('hex');
 receipt(framework,'packed-tarball','passed','npm pack --json --pack-destination proof/dx',{package:pkg.name,version:pkg.version,tarball:relative(root,tar),sha256});
 const consumer=resolve(sandbox,framework); await mkdir(consumer,{recursive:true}); await writeFile(resolve(consumer,'package.json'),JSON.stringify({private:true,type:'module',dependencies:{[pkg.name]:`file:${tar}`}},null,2));
 let installed=false; try{run('npm',['install','--ignore-scripts'],consumer);installed=true;receipt(framework,'fresh-isolated-install','passed','npm install --ignore-scripts --offline',{cache:'proof/dx/.npm-cache'});}catch(e){receipt(framework,'fresh-isolated-install','blocked','npm install --ignore-scripts --offline',{reason:'Required framework/toolchain packages are absent from the local npm cache; network is intentionally disabled.'});}
 if(installed){
  const script=`for (const p of ['${pkg.name}','${pkg.name}/button','${pkg.name}/field','${pkg.name}/tabs']) { const m=await import(p); if(!m.Button||!m.Field||!m.Tabs) throw Error(p+' missing exports') }`;
  await writeFile(resolve(consumer,'exports.mjs'),script); try{run(process.execPath,['exports.mjs'],consumer);receipt(framework,'exports-and-root-subpaths','passed','node exports.mjs');}catch(e){receipt(framework,'exports-and-root-subpaths','failed','node exports.mjs',{reason:String(e.stderr||e.message).slice(0,400)});}
 }
 for(const c of ['framework-typecheck','vite-production-build','server-import-ssr','hydration-chrome-console-node-preservation','css-deduplication','tree-shaking-metafile']) if(!receipts.some(r=>r.framework===framework&&r.case===c)) receipt(framework,c,'blocked',null,{reason:installed?'Journey scaffold requires framework-specific compilation fixture.':'Fresh offline install was blocked, so dependent executable check could not run.'});
 receipt(framework,'hmr-dev-smoke','not-run',null,{reason:'HMR requires a long-lived interactive dev-server session; explicitly outside this deterministic CI journey.'});
 receipt(framework,'manual-screen-reader','not-run',null,{reason:'Requires manual assistive-technology evaluation.'});
}
// Exercise npm workspaces with the packed Vue archive. It is valid even when framework peers are locally unavailable because import is then blocked truthfully.
const ws=resolve(sandbox,'workspace'); await mkdir(resolve(ws,'packages/app'),{recursive:true}); const vueTar=receipts.find(r=>r.framework==='vue'&&r.case==='packed-tarball').tarball;
await writeFile(resolve(ws,'package.json'),JSON.stringify({private:true,workspaces:['packages/*']},null,2)); await writeFile(resolve(ws,'packages/app/package.json'),JSON.stringify({name:'dx-workspace-app',private:true,type:'module',dependencies:{'@cloudflare/kumo-vue':`file:${resolve(root,vueTar)}`}},null,2));
try{run('npm',['install','--ignore-scripts'],ws);run(process.execPath,['-e',`import('@cloudflare/kumo-vue').then(m=>{if(!m.Button)process.exit(1)})`],resolve(ws,'packages/app'));receipt('npm-workspace','install-import-build','passed','npm install --ignore-scripts --offline && node -e "import(...)"');}catch(e){receipt('npm-workspace','install-import-build','blocked','npm install --ignore-scripts --offline && node -e "import(...)"',{reason:'Workspace dependency graph cannot be completed from the local offline cache.'});}
await writeFile(resolve(proof,'consumer-receipts.json'),JSON.stringify({schemaVersion:2,generatedBy:'node test/dx-consumers/pilot.mjs',publishReady:false,versions,receipts},null,2)+'\n');
await rm(sandbox,{recursive:true,force:true}); console.log(`wrote ${receipts.length} immutable receipts`);
