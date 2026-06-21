import { readdir, readFile, access } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { catalogEvidence } from './catalog-evidence.mjs';

const root=resolve(import.meta.dirname,'..');
const dist=resolve(root,'astro/dist');
const catalog=JSON.parse(await readFile(resolve(root,'benchmarks/catalog.json'),'utf8'));
catalogEvidence(catalog);

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
for(const disclosure of ['Kumo outside React','One component language.','Three native frameworks.','Svelte','Vue','Solid','Start building','Open examples','kumo-vue-0.0.1.tgz','kumo-svelte-0.0.1.tgz','kumo-solid-0.0.1.tgz'])
 if(!rootHtml.includes(disclosure))failures.push(`root product hero missing: ${disclosure}`);
const resultsHtml=await readFile(resolve(dist,'docs/evidence/compiler-results/index.html'),'utf8');
for(const disclosure of ['Compiler results at a glance','Axis A · Engine language','Compiler engines','Axis B · Output architecture','Output architectures','Framework libraries'])
 if(!resultsHtml.includes(disclosure))failures.push(`compiler results missing: ${disclosure}`);
for(const result of languageResults())if(!resultsHtml.includes(`Full ${result} results`))failures.push(`engine result card missing: ${result}`);
for(const result of ['Internal compiler','Mitosis','Shared core + native','Minimal hybrid'])if(!resultsHtml.includes(`Full ${result} results`))failures.push(`architecture result card missing: ${result}`);
function languageResults(){return ['TypeScript','Go','Rust','Zig']}
const typeScriptHtml=await readFile(resolve(dist,'typescript/index.html'),'utf8');
for(const disclosure of ['>41</strong>','>164</strong>','browser-verified surfaces','@cloudflare/kumo@2.5.2'])
 if(!typeScriptHtml.includes(disclosure))failures.push(`TypeScript compiler disclosure missing: ${disclosure}`);
const mitosisHtml=await readFile(resolve(dist,'mitosis/index.html'),'utf8');
for(const disclosure of ['28/28','4/4','76','372','no SSR, hydration, node-preservation, type, package/tree-shaking, portal, focus-management'])
 if(!mitosisHtml.includes(disclosure))failures.push(`Mitosis disclosure missing: ${disclosure}`);
const sharedHtml=await readFile(resolve(dist,'shared-core/index.html'),'utf8');
for(const disclosure of ['28','116','220','Zero browser targets passed','Synthetic evidence was removed','33 shared','29 native'])
 if(!sharedHtml.includes(disclosure))failures.push(`shared-core disclosure missing: ${disclosure}`);
const bakeoffHtml=await readFile(resolve(dist,'bakeoff/index.html'),'utf8');
for(const disclosure of ['No winner is declared','Internal TypeScript control','Mitosis','Shared core','passed','partial','not-run','blocked'])
 if(!bakeoffHtml.includes(disclosure))failures.push(`bakeoff disclosure missing: ${disclosure}`);
const selectPilotHtml=await readFile(resolve(dist,'select-pilot/index.html'),'utf8');
for(const disclosure of ['No winner is declared','8/8','Observed Solid failures','React, Vue, and Svelte browser gates are blocked','3 / 22 / 6','bounded contract experiment'])
 if(!selectPilotHtml.includes(disclosure))failures.push(`Select pilot disclosure missing: ${disclosure}`);
const engineHtml=await readFile(resolve(dist,'engine-language/index.html'),'utf8');
for(const disclosure of ['8 exact records','Winner supported?','all blocked','CPU / RSS'])if(!engineHtml.includes(disclosure))failures.push(`Axis A disclosure missing: ${disclosure}`);
const architectureHtml=await readFile(resolve(dist,'output-architecture/index.html'),'utf8');
for(const disclosure of ['87 passed','5 failed','212 blocked','80 not-run','Weights applied?','10 passed / 0 failed / 21 blocked / 6 not-run'])if(!architectureHtml.includes(disclosure))failures.push(`Axis B disclosure missing: ${disclosure}`);
const comparisonHtml=await readFile(resolve(dist,'comparison/index.html'),'utf8');
for(const disclosure of ['No winner is declared','Protocol planner artifacts only','Full product baseline','Unavailable / unavailable'])
 if(!comparisonHtml.includes(disclosure))failures.push(`compiler comparison disclosure missing: ${disclosure}`);
for(const candidate of ['go','rust','zig']){
 const html=await readFile(resolve(dist,candidate,'index.html'),'utf8');
 for(const disclosure of ['Protocol planner complete','41 components','164 target plans','164 deterministic artifacts','Scope limitation:','Raw measured samples'])
  if(!html.includes(disclosure))failures.push(`${candidate} benchmark disclosure missing: ${disclosure}`);
}
let links=0;
for(const file of htmlFiles){
 const html=await readFile(file,'utf8');
 for(const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)){
  const value=match[1];
  if(!value.startsWith('/')||value.startsWith('//'))continue;
  const pathname=new URL(value,'https://local.invalid').pathname;
  // Runtime and benchmark links are served by the parent proof server, not Astro's static output.
  if(pathname.startsWith('/benchmarks/')||pathname.startsWith('/packages/')||pathname.startsWith('/library-gallery/')||pathname.startsWith('/docs/decisions/')||pathname.startsWith('/examples/downloads/')||/^\/[^/]+\/(react|vue|svelte|solid)\/?$/.test(pathname))continue;
  links++;
  if(!await resolvesToOutput(pathname))failures.push(`${file.slice(dist.length)} -> ${pathname}`);
 }
}
const required=['/','/docs/','/docs/progress/','/docs/tutorials/first-library/','/docs/how-to/install/','/docs/how-to/github/','/docs/how-to/svelte-playground/','/docs/how-to/forms/','/docs/reference/packages/','/docs/reference/button/','/docs/reference/field/','/docs/reference/styles/','/docs/explanation/distribution/','/docs/explanation/evidence/','/docs/evidence/compiler-results/','/examples/','/examples/vue/','/examples/svelte/','/examples/solid/','/libraries/vue/','/libraries/svelte/','/libraries/solid/','/typescript/','/go/','/rust/','/zig/','/comparison/','/mitosis/','/shared-core/','/bakeoff/','/select-pilot/','/engine-language/','/output-architecture/','/receipts/shootout-language.json','/receipts/shootout-architecture.json','/receipts/shootout-consumers.json','/receipts/shootout-selected.json','/sitemap.xml','/llms.txt',...catalog.components.map(({id})=>`/components/${id}/`)];
for(const route of required)if(!await resolvesToOutput(route))failures.push(`required route missing: ${route}`);
if(failures.length)throw new Error(`Broken local Astro routes:\n${failures.join('\n')}`);
console.log(`Validated ${required.length + 1} routes/links (${required.length} required routes plus link graph) and ${links} local link references across ${htmlFiles.length} Astro pages`);
