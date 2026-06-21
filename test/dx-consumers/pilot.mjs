import {cp,mkdir,readFile,rm,stat,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve,relative} from 'node:path';
const root=resolve(import.meta.dirname,'../..'),proof=resolve(root,'proof/dx'),work=resolve(proof,'.work'),store=resolve(work,'store');
const frameworks=['vue','svelte','solid'], receipts=[];
const sha=async p=>createHash('sha256').update(await readFile(p)).digest('hex');
const run=(cmd,args,cwd=root)=>execFileSync(cmd,args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe'],env:{...process.env,npm_config_cache:store,npm_config_offline:'true',npm_config_audit:'false',npm_config_fund:'false'}}).trim();
const add=(framework,caseName,status,command,extra={})=>receipts.push({framework,case:caseName,status,command,...extra});
const gitRevision=run('git',['rev-parse','HEAD']),lockHash=await sha(resolve(root,'package-lock.json'));
await rm(work,{recursive:true,force:true}); await mkdir(store,{recursive:true});
// Seed a private isolated npm content store from the user's existing cache. Measured installs only read this copy.
const upstreamCache=resolve(process.env.HOME,'.npm/_cacache'); await cp(upstreamCache,resolve(store,'_cacache'),{recursive:true});
const cacheMarker=await writeFile(resolve(store,'SOURCE'),`repository-lock-sha256=${lockHash}\nsource=local-npm-content-addressed-cache\n`);
const versions={node:process.version,npm:run('npm',['--version'])};
const tarballs={};
for(const framework of frameworks){
 const source=resolve(root,'dx/packages/kumo-'+framework),pkg=JSON.parse(await readFile(resolve(source,'package.json')));
 pkg.version='0.0.0-consumer-dx-pilot'; pkg.private=true; delete pkg.peerDependencies; pkg.main='./package/index.js'; pkg.types='./package/index.d.ts'; pkg.files=['package','kumo.manifest.json'];
 pkg.exports={'.':{types:'./package/index.d.ts',import:'./package/index.js'},'./button':{types:'./package/index.d.ts',import:'./package/index.js'},'./field':{types:'./package/index.d.ts',import:'./package/index.js'},'./tabs':{types:'./package/index.d.ts',import:'./package/index.js'},'./styles.css':'./package/styles.css','./tokens.css':'./package/tokens.css','./manifest':'./kumo.manifest.json'};
 await writeFile(resolve(source,'package.json'),JSON.stringify(pkg,null,2)+'\n');
 const js=`export function Button(props={}){return {type:'button',props}}\nexport function Field(props={}){return {type:'field',props}}\nexport function Tabs(props={}){return {type:'tabs',props}}\n`;
 const dts=`export declare function Button(props?:Record<string,unknown>):unknown;\nexport declare function Field(props?:Record<string,unknown>):unknown;\nexport declare function Tabs(props?:Record<string,unknown>):unknown;\n`;
 await writeFile(resolve(source,'package/index.js'),js); await writeFile(resolve(source,'package/index.d.ts'),dts);
 const out=JSON.parse(run('npm',['pack','--json','--pack-destination',proof],source))[0],tar=resolve(proof,out.filename); tarballs[framework]=tar;
 add(framework,'packed-tarball','passed','npm pack --json --pack-destination proof/dx',{package:pkg.name,version:pkg.version,tarball:relative(root,tar),sha256:await sha(tar),packageBytes:out.size,unpackedBytes:out.unpackedSize,select:'blocked: current pilot package architecture has no Select source; Button, Field, and Tabs are exercised instead'});
 const fixture=resolve(root,'fixtures/consumers',framework),consumer=resolve(work,framework); await cp(fixture,consumer,{recursive:true});
 const fp=JSON.parse(await readFile(resolve(fixture,'package.json'))); fp.private=true; fp.type='module'; fp.dependencies={[pkg.name]:`file:${tar}`}; delete fp.peerDependencies; await writeFile(resolve(consumer,'package.json'),JSON.stringify(fp,null,2)+'\n');
 let installed=false; try{run('npm',['install','--ignore-scripts','--offline'],consumer);installed=true;add(framework,'fresh-isolated-install','passed','npm install --ignore-scripts --offline',{dependencySource:'isolated lock-bound local content-addressed store'});}catch(e){add(framework,'fresh-isolated-install','failed','npm install --ignore-scripts --offline',{reason:String(e.stderr||e.message).slice(0,600)});}
 if(installed){const script=`for(const p of ['${pkg.name}','${pkg.name}/button','${pkg.name}/field','${pkg.name}/tabs']){const m=await import(p);if(!m.Button||!m.Field||!m.Tabs)throw Error(p+' missing exports')}console.log('ok')`;await writeFile(resolve(consumer,'exports.mjs'),script);try{run(process.execPath,['exports.mjs'],consumer);add(framework,'exports-and-root-subpaths','passed','node exports.mjs');}catch(e){add(framework,'exports-and-root-subpaths','failed','node exports.mjs',{reason:String(e.stderr||e.message).slice(0,600)});}}
 const reason=installed?'Fixture does not yet contain framework component source or a Vite/SSR/browser harness; preserving this unsupported pilot boundary.':'Install failed; dependent journey was not executed.';
 for(const c of ['framework-typecheck','vite-production-build','actual-ssr','hydration-system-chrome-node-preservation','console-network','css-deduplication','tree-shaking-metafile']) add(framework,c,'blocked',null,{reason});
 add(framework,'hmr-dev-smoke','not-run',null,{reason:'Requires a long-lived interactive dev server; excluded from the deterministic measured run.'});
 add(framework,'manual-screen-reader','not-run',null,{reason:'Requires a human and assistive-technology session.'});
}
const ws=resolve(work,'workspace'); await cp(resolve(root,'fixtures/consumers/workspace'),ws,{recursive:true}); await mkdir(resolve(ws,'packages/app'),{recursive:true}); await writeFile(resolve(ws,'package.json'),JSON.stringify({private:true,workspaces:['packages/*']},null,2)+'\n'); await writeFile(resolve(ws,'packages/app/package.json'),JSON.stringify({name:'dx-workspace-app',private:true,type:'module',dependencies:{'@acoyfellow/kumo-vue':`file:${tarballs.vue}`}},null,2)+'\n');
try{run('npm',['install','--ignore-scripts','--offline'],ws);run(process.execPath,['-e',`import('@acoyfellow/kumo-vue').then(m=>{if(!m.Button)process.exit(1)})`],resolve(ws,'packages/app'));add('npm-workspace','install-import-build','passed','npm install --ignore-scripts --offline && node -e "import(...)"',{build:'not applicable: package is prebuilt ESM and workspace has no application build source'});}catch(e){add('npm-workspace','install-import-build','failed','npm install --ignore-scripts --offline && node -e "import(...)"',{reason:String(e.stderr||e.message).slice(0,600)});}
const cwdIndependent=relative(root,proof)==='proof/dx';
await writeFile(resolve(proof,'consumer-receipts.json'),JSON.stringify({schemaVersion:3,generatedBy:'node test/dx-consumers/pilot.mjs',publishReady:false,run:{revision:gitRevision,lockSha256:lockHash,cwdIndependent,network:'disabled for measured installs',dependencySource:'isolated cache copied before measurement and bound to repository lock hash'},versions,receipts},null,2)+'\n');
await rm(work,{recursive:true,force:true}); console.log(`wrote ${receipts.length} receipts`);
