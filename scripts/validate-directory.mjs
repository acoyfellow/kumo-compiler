import { readFile, access } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const root=resolve(import.meta.dirname,'..');
const catalog=JSON.parse(await readFile(resolve(root,'benchmarks/catalog.json'),'utf8'));
const server=spawn(process.execPath,['review/server.mjs'],{cwd:root,env:{...process.env,PORT:'4269'},stdio:['ignore','pipe','inherit']});
try {
 await new Promise((ok,fail)=>{const timer=setTimeout(()=>fail(new Error('review server startup timeout')),5000);server.once('exit',code=>fail(new Error(`review server exited ${code}`)));server.stdout.on('data',()=>{clearTimeout(timer);ok();});});
 const checked=[];
 const get=async path=>{const response=await fetch(`http://127.0.0.1:4269${path}`);if(response.status!==200)throw new Error(`${path}: HTTP ${response.status}`);checked.push(path);return response.text();};
 await access(resolve(root,'astro/dist/index.html'));
 const index=await readFile(resolve(root,'astro/dist/index.html'),'utf8');
 for(const component of catalog.components){
  const page=`/components/${component.id}/`;
  await access(resolve(root,`astro/dist/components/${component.id}/index.html`));
  if(!index.includes(`href="${page}"`))throw new Error(`index missing ${page}`);
  const compare=component.routes.dashboard.startsWith('/benchmarks/')?`/${component.id}/compare/`:component.routes.dashboard;
  const benchmark=component.routes.dashboard.startsWith('/benchmarks/')?component.routes.dashboard:'/benchmarks/';
  if(!index.includes(`href="${compare}"`)||!index.includes(`href="${benchmark}"`))throw new Error(`index links missing for ${component.id}`);
  const html=await get(`/runtime/${component.id}/compare`);
  for(const match of html.matchAll(/<iframe[^>]+src="([^"]+)"/g))await get(match[1]);
  for(const route of Object.values(component.routes))await get(route);
 }
 console.log(`Validated ${catalog.components.length} directory entries and ${checked.length} live review routes (all HTTP 200)`);
} finally { server.kill('SIGTERM'); }
