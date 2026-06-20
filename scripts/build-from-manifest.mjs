import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {assertCatalogMatches,defaultRoot,entriesFor,loadManifests} from './lib/manifest.mjs';

const args=process.argv.slice(2);
let root=defaultRoot;
const positional=[];
for(let index=0;index<args.length;index++){
 const value=args[index];
 if(value==='--root'){
  if(!args[index+1])throw new Error('--root requires a value');
  root=path.resolve(args[++index]);
 }else if(value.startsWith('--root='))root=path.resolve(value.slice('--root='.length));
 else if(value.startsWith('--'))throw new Error(`unknown option ${value}`);
 else positional.push(value);
}
const name=positional[0]??'runtimes';
if(positional.length>1)throw new Error(`unexpected arguments: ${positional.slice(1).join(' ')}`);
const {components,build}=await loadManifests(root);
await assertCatalogMatches(root,components);
const target=build.targets[name];
if(!target)throw new Error(`unknown build target ${name}`);
for(const {component,framework} of entriesFor(components,target)){
 const cwd=path.join(root,'runtime',component,framework);
 const args=[path.join(root,'node_modules/vite/bin/vite.js'),'build'];
 const result=spawnSync(process.execPath,args,{cwd,stdio:'inherit'});
 if(result.error)throw new Error(`build ${component}/${framework} failed to start: ${result.error.message}`);
 if(result.status!==0)throw new Error(`build ${component}/${framework} exited ${result.status}${result.signal?` (${result.signal})`:''}`);
}
