import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {assertCatalogMatches,defaultRoot,entriesFor,loadManifests} from './lib/manifest.mjs';
const args=process.argv.slice(2); const rootIndex=args.indexOf('--root');const root=path.resolve(rootIndex>=0?args[rootIndex+1]:defaultRoot);const name=args.find((x,index)=>index!==rootIndex&&index!==rootIndex+1&&!x.startsWith('--'))??'runtimes';
const {components,build}=await loadManifests(root);await assertCatalogMatches(root,components);const target=build.targets[name];if(!target)throw new Error(`unknown build target ${name}`);
for(const {component,framework} of entriesFor(components,target)){const cwd=path.join(root,'runtime',component,framework);const result=spawnSync(process.execPath,[path.join(root,'node_modules/vite/bin/vite.js'),'build'],{cwd,stdio:'inherit'});if(result.status!==0)process.exit(result.status??1)}
