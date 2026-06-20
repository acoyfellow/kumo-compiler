import {spawnSync} from 'node:child_process';
import {readFile,writeFile,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const catalog=JSON.parse(await readFile(resolve(root,'generated/catalog.ir.json'),'utf8'));
const results=[];
for(const {id} of catalog.components){
 try{const dir=resolve(root,'runtime-canonical',id);
 for(const args of [['build',dir],['build',dir,'--ssr','server.jsx','--outDir','server-runtime']]){const r=spawnSync(resolve(root,'node_modules/.bin/vite'),args,{cwd:root,stdio:'inherit'});if(r.status)throw Error(`${id}: vite ${args.join(' ')} failed`)}
 const serverFile=resolve(dir,'server-runtime/server.js');
 const {render}=await import(`${new URL(`file://${serverFile}`)}?v=${Date.now()}`);
 const markup=render();const htmlPath=resolve(dir,'public-runtime/index.html');let html=await readFile(htmlPath,'utf8');
 if(!html.includes('<div id="root"></div>'))throw Error(`${id}: client shell root missing`);
 html=html.replace('<div id="root"></div>',`<div id="root">${markup}</div>`);await writeFile(htmlPath,html);await rm(resolve(dir,'server-runtime'),{recursive:true,force:true});results.push({component:id,status:'passed'});
 }catch(error){results.push({component:id,status:'failed',error:String(error?.stack||error)});console.error(`${id}: ${error.message}`)}
}
await writeFile(resolve(root,'generated/canonical-react-build-summary.json'),JSON.stringify({schemaVersion:'kumo.canonical-build/v1',results},null,2)+'\n');
console.log(`Canonical React builds: ${results.filter(x=>x.status==='passed').length} passed, ${results.filter(x=>x.status==='failed').length} failed`);
