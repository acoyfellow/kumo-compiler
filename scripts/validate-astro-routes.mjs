import { readdir, readFile, access } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { catalogEvidence } from './catalog-evidence.mjs';

const root=resolve(import.meta.dirname,'..');
const dist=resolve(root,'astro/dist');
const catalog=JSON.parse(await readFile(resolve(root,'benchmarks/catalog.json'),'utf8'));
const evidence=catalogEvidence(catalog);

async function files(dir) {
 const entries=await readdir(dir,{withFileTypes:true});
 return (await Promise.all(entries.map(entry=>entry.isDirectory()?files(join(dir,entry.name)):[join(dir,entry.name)]))).flat();
}
async function exists(path){try{await access(path);return true}catch{return false}}
async function resolvesToOutput(pathname){
 const clean=decodeURIComponent(pathname).replace(/^\/+|\/+$/g,'');
 const candidates=extname(clean)?[resolve(dist,clean)]:[resolve(dist,clean,'index.html'),resolve(dist,`${clean}.html`)];
 if(!clean)candidates.push(resolve(dist,'index.html'));
 return (await Promise.all(candidates.map(exists))).some(Boolean);
}

const htmlFiles=(await files(dist)).filter(file=>file.endsWith('.html'));
const failures=[];
const rootHtml=await readFile(resolve(dist,'index.html'),'utf8');
for(const disclosure of [`${evidence.nativeVue.length}/${evidence.components.length} Vue outputs are framework-native`,`${evidence.legacyVue.length}/${evidence.components.length}`,'legacy generated HTML/lookalike family outputs pending migration'])
 if(!rootHtml.includes(disclosure))failures.push(`root evidence disclosure missing: ${disclosure}`);
let links=0;
for(const file of htmlFiles){
 const html=await readFile(file,'utf8');
 for(const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)){
  const value=match[1];
  if(!value.startsWith('/')||value.startsWith('//'))continue;
  const pathname=new URL(value,'https://local.invalid').pathname;
  links++;
  if(!await resolvesToOutput(pathname))failures.push(`${file.slice(dist.length)} -> ${pathname}`);
 }
}
const required=['/',...catalog.components.map(({id})=>`/${id}/`)];
for(const route of required)if(!await resolvesToOutput(route))failures.push(`required route missing: ${route}`);
if(failures.length)throw new Error(`Broken local Astro routes:\n${failures.join('\n')}`);
console.log(`Validated ${required.length} required routes and ${links} local links across ${htmlFiles.length} Astro pages`);
