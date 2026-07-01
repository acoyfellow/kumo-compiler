import {spawnSync} from 'node:child_process';
import {readFile,writeFile,rm,rename,mkdir,readdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
const defaultRoot=resolve(import.meta.dirname,'..');

export function normalizeInlineStyleResources(markup){
 const styles=[],resources=[];
 const body=markup.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/g,(_match,attrs,css)=>{const name=attrs.match(/\s(?:data-)?href="([^"]+)"/)?.[1];if(name&&/^[a-z0-9][a-z0-9._-]*$/i.test(name))resources.push({name,css});styles.push(`<style${attrs.replace(/\s(?:data-)?href="[^"]*"/g,'').replace(/\sdata-precedence="[^"]*"/g,'')}>${css}</style>`);return ''});
 return {body,styles,resources};
}

export async function validateCanonicalPublicRuntime(output,{component,root=defaultRoot}={}){
 const htmlPath=resolve(output,'index.html');let html;
 try{html=await readFile(htmlPath,'utf8')}catch{throw Error(`${component}: preflight missing index.html`)}
 if(!html.includes('<main'))throw Error(`${component}: preflight SSR <main> missing`);
 const links=[...html.matchAll(/<script\b[^>]*\bsrc="([^"#?]+)"/g),...html.matchAll(/<link\b[^>]*\bhref="([^"#?]+)"/g)].map(x=>x[1]).filter(x=>!/^https?:|^data:/.test(x));
 // React 19 resource hints use `href` on inline <style>. Browsers treat that as
 // a stylesheet identity, not a URL; removing it avoids same-origin scanners
 // incorrectly requesting e.g. /sidebar/react/base-ui-disable-scrollbar.
 if(/<style\b[^>]*\bhref=/.test(html))throw Error(`${component}: preflight inline style contains URL-like href`);
 if(!links.length)throw Error(`${component}: preflight linked assets missing`);
 for(const link of links){const p=link.startsWith('/')?resolve(output,'assets',link.split('/').pop()):resolve(output,link);if(!existsSync(p))throw Error(`${component}: preflight linked asset missing: ${link}`)}
 const provenance=JSON.parse(await readFile(resolve(root,'audit/kumo-react-2.6.0.provenance.json'),'utf8'));
 if(provenance.package?.name!=='@cloudflare/kumo')throw Error(`${component}: preflight canonical package provenance invalid`);
 return true;
}
export async function buildCanonicalReactRuntimes({root=defaultRoot,hook=async()=>{}}={}){
 const catalog=JSON.parse(await readFile(resolve(root,'generated/catalog.ir.json'),'utf8')),results=[];
 for(const {id} of catalog.components){const dir=resolve(root,'runtime-canonical',id),live=resolve(dir,'public-runtime'),temp=resolve(dir,`.public-runtime.tmp-${process.pid}`),backup=resolve(dir,`.public-runtime.backup-${process.pid}`);
  try{await rm(temp,{recursive:true,force:true});await mkdir(temp,{recursive:true});
   const vite=resolve(root,'node_modules/.bin/vite');for(const args of [['build',dir,'--outDir',temp,'--emptyOutDir'],['build',dir,'--ssr','server.jsx','--outDir',resolve(temp,'server-runtime'),'--emptyOutDir']]){const r=spawnSync(vite,args,{cwd:root,stdio:'inherit'});if(r.status)throw Error(`${id}: vite ${args.join(' ')} failed`)}
   await hook({phase:'after-vite-before-ssr',component:id,live,temp});
   const serverFile=resolve(temp,'server-runtime/server.js'),{render}=await import(`${pathToFileURL(serverFile)}?v=${Date.now()}`);let markup=render();
   // Base UI emits React 19 inline style resources with href/precedence props.
   // The client hoists these into <head>, so leaving them in the hydration root
   // both mismatches the DOM and exposes `href` to asset crawlers. Hoist the
   // identical style outside the root and strip only its resource-only props.
   const normalized=normalizeInlineStyleResources(markup);markup=normalized.body;
   let html=await readFile(resolve(temp,'index.html'),'utf8');if(normalized.styles.length)html=html.replace('</head>',`${normalized.styles.join('')}</head>`);for(const resource of normalized.resources)await writeFile(resolve(temp,resource.name),resource.css);if(!html.includes('<div id="root"></div>'))throw Error(`${id}: client shell root missing`);html=html.replace('<div id="root"></div>',`<div id="root">${markup}</div>`);await writeFile(resolve(temp,'index.html'),html);await rm(resolve(temp,'server-runtime'),{recursive:true,force:true});await validateCanonicalPublicRuntime(temp,{component:id,root});
   await rm(backup,{recursive:true,force:true});if(existsSync(live))await rename(live,backup);try{await rename(temp,live)}catch(e){if(existsSync(backup))await rename(backup,live);throw e}await rm(backup,{recursive:true,force:true});results.push({component:id,status:'passed'});
  }catch(error){await rm(temp,{recursive:true,force:true});if(!existsSync(live)&&existsSync(backup))await rename(backup,live);await rm(backup,{recursive:true,force:true});results.push({component:id,status:'failed',error:String(error?.stack||error)});console.error(`${id}: ${error.message}`)}
 }
 await writeFile(resolve(root,'generated/canonical-react-build-summary.json'),JSON.stringify({schemaVersion:'kumo.canonical-build/v1',results},null,2)+'\n');return results;
}
if(import.meta.url===pathToFileURL(process.argv[1]).href){const results=await buildCanonicalReactRuntimes();console.log(`Canonical React builds: ${results.filter(x=>x.status==='passed').length} passed, ${results.filter(x=>x.status==='failed').length} failed`);if(results.some(x=>x.status==='failed'))process.exitCode=1}
