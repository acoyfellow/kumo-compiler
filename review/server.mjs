import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { existsSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { class2RuntimeRoute } from '../runtime-routes.mjs';
const arg=n=>process.argv.find(x=>x.startsWith(`--${n}=`))?.slice(n.length+3);
const app=new Hono(),root=resolve(arg('root')||process.env.KUMO_ROOT||resolve(import.meta.dirname,'..')),frameworks=new Set(['react','vue','svelte','solid']);
app.use('*',async(c,next)=>{
 const url=new URL(c.req.url),route=class2RuntimeRoute(url.pathname);
 if(route?.needsSlash)return c.redirect(`${url.pathname}/${url.search}`,308);
 return next();
});
const nav=`<nav style="display:flex;gap:16px;padding:14px 28px;border-bottom:1px solid #d1d5db;background:#fff;font:700 14px system-ui"><a href="/progress">Progress</a><a href="/benchmarks/">Benchmarks</a><a href="/select/compare">Select</a><a href="/button/compare">Button</a><a href="/dialog/compare">Dialog</a><a href="/popover/compare">Popover</a><a href="/checkbox/compare">Checkbox</a><a href="/switch/compare">Switch</a></nav>`;
const css=readFileSync(resolve(root,'public/styles.css'),'utf8');
app.get('/',c=>c.redirect('/progress'));
app.get('/favicon.ico',c=>c.body(null,204));
const cases=[{label:'Extra small',size:'xs',placeholder:'Choose fruit'},{label:'Small',size:'sm',value:'Apple'},{label:'Base',size:'base',placeholder:'Choose fruit',description:'Choose the closest region.'},{label:'Large',size:'lg',value:'Cherry'},{label:'Loading',loading:true,placeholder:'Loading…'},{label:'Hidden label',hideLabel:true,placeholder:'Hidden label'},{label:'Disabled',disabled:true,placeholder:'Unavailable'},{label:'Error',placeholder:'Select an option',error:'Selection required'}];
function Select(p){const id=p.label.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-listbox';return React.createElement('div',{className:'kumo-field'},React.createElement('label',{htmlFor:id+'-trigger',className:p.hideLabel?'sr-only':undefined},p.label),React.createElement('button',{type:'button',role:'combobox',id:id+'-trigger','aria-controls':id,'aria-expanded':'false','aria-haspopup':'listbox','aria-busy':p.loading||undefined,'aria-invalid':p.error?true:undefined,disabled:p.disabled||p.loading,className:`kumo-trigger ${p.size||'base'}`},React.createElement('span',null,p.value||p.placeholder),React.createElement('svg',{'aria-hidden':'true',width:16,height:16,viewBox:'0 0 16 16'},React.createElement('path',{fill:'currentColor',d:'m4 6 4 4 4-4z'}))),p.error?React.createElement('p',{className:'error'},p.error):p.description?React.createElement('p',{className:'description'},p.description):null)}
const canonical=renderToStaticMarkup(React.createElement('main',{className:'shell'},React.createElement('h1',{className:'title'},'Select'),React.createElement('section',{className:'matrix'},cases.map((p,i)=>React.createElement(Select,{...p,key:i})) )));
const reactPage=`<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Select React</title><style>${css}</style></head><body><div id="app">${canonical}</div><script type="module" src="/select/react/assets/react-select.js"></script></body></html>`;
app.get('/select/react',c=>c.html(readFileSync(resolve(root,'runtime-canonical/select/public-runtime/index.html'),'utf8')));
for(const f of frameworks)app.get(`/select/${f}`,c=>c.html(readFileSync(resolve(root,`runtime/select/${f}/public-runtime/index.html`),'utf8')));
app.get('/select/:framework/assets/:file',c=>{const{framework,file}=c.req.param();if(!frameworks.has(framework)||!/^[\w.-]+$/.test(file))return c.notFound();const canonical=framework==='react'&&existsSync(resolve(root,`runtime-canonical/select/public-runtime/assets/${file}`));const body=readFileSync(resolve(root,canonical?`runtime-canonical/select/public-runtime/assets/${file}`:`runtime/select/${framework}/public-runtime/assets/${file}`));return c.body(body,200,{'Content-Type':file.endsWith('.css')?'text/css':'text/javascript'});});
app.get('/benchmarks/',c=>c.html(readFileSync(resolve(root,'deploy/benchmarks/index.html'),'utf8')));
app.get('/benchmarks/data/catalog.json',c=>c.json(JSON.parse(readFileSync(resolve(root,'deploy/benchmarks/data/catalog.json'),'utf8'))));
app.get('/benchmarks/components/select/',c=>c.html(readFileSync(resolve(root,'deploy/benchmarks/components/select/index.html'),'utf8')));
app.get('/benchmarks/embed/select/:framework/kitchen-sink/',c=>{const {framework}=c.req.param();return frameworks.has(framework)?c.redirect(`/select/${framework}`):c.notFound();});
app.get('/progress',c=>c.html(readFileSync(resolve(root,'review/progress.html'),'utf8')));
app.get('/runtime/select/compare',c=>c.redirect('/select/compare'));
app.get('/select/compare',c=>c.html(`<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Select runtime comparison</title><style>body{margin:0;padding:28px;background:#f3f4f6;color:#111827;font-family:Arial,sans-serif}header{max-width:1080px;margin:0 auto 20px}h1{margin:0 0 6px;font-size:28px}header p{margin:0;color:#6b7280}.tabs{max-width:1080px;margin:auto}.tablist{display:flex;gap:8px;margin-bottom:12px}.tab{border:1px solid #d1d5db;background:white;border-radius:999px;padding:8px 14px;cursor:pointer;font-weight:700}.tab[aria-selected="true"]{background:#111827;color:white}.panel{border:1px solid #d1d5db;border-radius:12px;background:white;box-shadow:0 2px 8px #00000012;overflow:hidden}.panel iframe{display:block;width:100%;height:1100px;border:0;background:white}</style></head><body>${nav}<header><h1>Select runtime comparison</h1><p>Kumo 2.5.2 · React, Vue, Svelte, and Solid generated runtimes</p></header><main class="tabs"><div class="tablist" role="tablist">${['react','vue','svelte','solid'].map((f,i)=>`<button class="tab" role="tab" aria-selected="${i===0}" data-frame="${f}">${f}</button>`).join('')}</div><section class="panel"><iframe id="runtime-frame" title="Select runtime" src="/select/react"></iframe></section></main><script>for(const b of document.querySelectorAll('.tab'))b.onclick=()=>{for(const x of document.querySelectorAll('.tab'))x.setAttribute('aria-selected','false');b.setAttribute('aria-selected','true');document.querySelector('#runtime-frame').src='/select/'+b.dataset.frame}</script></body></html>`));

for(const kind of ['button','dialog','popover']){
 for(const f of frameworks)app.get(`/${kind}/${f}`,c=>c.html(readFileSync(resolve(root,`deploy/${kind}/${f}/index.html`),'utf8').replace('<head>','<head><base href="/'+kind+'/'+f+'/">')));
 app.get(`/${kind}/:framework/assets/:file`,c=>{const{framework,file}=c.req.param();if(!frameworks.has(framework)||!/^[-\w.]+$/.test(file))return c.notFound();const body=readFileSync(resolve(root,`deploy/${kind}/${framework}/assets/${file}`));return c.body(body,200,{'Content-Type':file.endsWith('.css')?'text/css':'text/javascript'});});
 app.get(`/${kind}/compare`,c=>c.html(readFileSync(resolve(root,`deploy/${kind}/compare/index.html`),'utf8')));
 app.get(`/${kind}/compare/`,c=>c.redirect(`/${kind}/compare`));
 for(const f of frameworks)app.get(`/${kind}/${f}/`,c=>c.redirect(`/${kind}/${f}`));
 app.get(`/runtime/${kind}/compare`,c=>c.redirect(`/${kind}/compare`));
}

for(const f of frameworks)app.get(`/form/${f}`,c=>c.html(readFileSync(resolve(root,`runtime/form/${f}/public-runtime/index.html`),'utf8')));
app.get('/form/:framework/assets/:file',c=>{const{framework,file}=c.req.param();if(!frameworks.has(framework)||!/^[-\w.]+$/.test(file))return c.notFound();const body=readFileSync(resolve(root,`runtime/form/${framework}/public-runtime/assets/${file}`));return c.body(body,200,{'Content-Type':file.endsWith('.css')?'text/css':'text/javascript'});});
app.get('/form/compare',c=>c.html(`<!doctype html><title>Form family comparison</title><style>body{font-family:system-ui;background:#eef2f7;margin:20px}main{max-width:820px;margin:auto}button{padding:8px 14px;margin-right:6px}iframe{width:100%;height:760px;border:1px solid #ccd3dc;background:white;margin-top:12px}</style><main><h1>Form family runtime comparison</h1><div>${[...frameworks].map((f,i)=>`<button data-f="${f}">${f}</button>`).join('')}</div><iframe title="Form runtime" src="/form/react"></iframe></main><script>for(const b of document.querySelectorAll('[data-f]'))b.onclick=()=>document.querySelector('iframe').src='/form/'+b.dataset.f</script>`));

for(const kind of ['checkbox','switch']){
 // These legacy Vite builds use relative asset URLs. Bind their base to the
 // framework route so a slashless proof URL cannot resolve assets at
 // `/${kind}/assets/*` and silently render only SSR markup.
 for(const f of frameworks)app.get(`/${kind}/${f}`,c=>c.html(readFileSync(resolve(root,`runtime/${kind}/${f}/public-runtime/index.html`),'utf8').replace('<head>','<head><base href="/'+kind+'/'+f+'/">')));
 app.get(`/${kind}/:framework/assets/:file`,c=>{const{framework,file}=c.req.param();if(!frameworks.has(framework)||!/^[-\w.]+$/.test(file))return c.notFound();const body=readFileSync(resolve(root,`runtime/${kind}/${framework}/public-runtime/assets/${file}`));return c.body(body,200,{'Content-Type':file.endsWith('.css')?'text/css':'text/javascript'});});
 app.get(`/runtime/${kind}/compare`,c=>c.redirect(`/${kind}/compare`));
 app.get(`/${kind}/compare/`,c=>c.redirect(`/${kind}/compare`));
 for(const f of frameworks)app.get(`/${kind}/${f}/`,c=>c.redirect(`/${kind}/${f}`));
 app.get(`/${kind}/compare`,c=>c.html(`<!doctype html><html><head><meta charset="utf-8"><title>${kind} comparison</title><style>body{margin:0;background:#f3f4f6;font-family:system-ui}header,main{max-width:900px;margin:20px auto}.tabs{display:flex;gap:8px}.tabs button{padding:8px 14px}.tabs button[aria-selected=true]{background:#111827;color:white}.panel{margin-top:12px;background:white;border:1px solid #d1d5db;border-radius:12px;overflow:hidden}iframe{width:100%;height:520px;border:0}</style></head><body>${nav}<header><h1>${kind[0].toUpperCase()+kind.slice(1)} runtime comparison</h1><p>One native-control family policy · four generated runtimes</p></header><main><div class="tabs" role="tablist">${[...frameworks].map((f,i)=>`<button role="tab" aria-selected="${!i}" data-f="${f}">${f}</button>`).join('')}</div><div class="panel"><iframe title="${kind} runtime" src="/${kind}/react"></iframe></div></main><script>for(const b of document.querySelectorAll('[data-f]'))b.onclick=()=>{document.querySelectorAll('[data-f]').forEach(x=>x.setAttribute('aria-selected',x===b));document.querySelector('iframe').src='/${kind}/'+b.dataset.f}</script></body></html>`));
}
// Catalog-wide directory fallback for families without a bespoke comparison shell.
// The Astro component page owns the four working runtime tabs.
app.get('/runtime/:component/compare',c=>c.redirect(`/components/${c.req.param('component')}/`,302));
app.get('/runtime/:component/compare/',c=>c.redirect(`/components/${c.req.param('component')}/`,302));
app.get('/:component/compare',c=>c.redirect(`/components/${c.req.param('component')}/`,302));
app.get('/:component/compare/',c=>c.redirect(`/components/${c.req.param('component')}/`,302));
app.get('/components/:component/',c=>{const file=resolve(root,'astro/dist/components',c.req.param('component'),'index.html');return existsSync(file)?c.html(readFileSync(file,'utf8')):c.notFound()});
// Catalog-wide proof route: always serves the actual Vite build, never a fixture.
const builtRuntime=c=>{
 const {component,framework}=c.req.param();if(!frameworks.has(framework)||!/^[-\w]+$/.test(component))return c.notFound();
 const suffix=new URL(c.req.url).pathname.split(`/${component}/${framework}/`)[1]||'index.html';if(suffix.includes('..'))return c.notFound();
 const runtimeRoot=framework==='react'?resolve(root,'runtime-canonical'):resolve(root,'runtime');
 const file=framework==='react'?resolve(runtimeRoot,component,'public-runtime',suffix):resolve(runtimeRoot,component,framework,'public-runtime',suffix);
 if(!file.startsWith(runtimeRoot+'/')||!existsSync(file)||!statSync(file).isFile())return c.notFound();
 const ext=file.split('.').pop(),contentType={html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8',svg:'image/svg+xml'}[ext]||'application/octet-stream';return c.body(readFileSync(file),200,{'Content-Type':contentType});
};
app.get('/:component/:framework/',builtRuntime);
app.get('/:component/:framework/*',builtRuntime);
// Serve generated deploy and Astro directory artifacts that do not need bespoke
// review behavior. Keeping this fallback data-driven prevents catalog additions
// from silently producing dead links.
app.get('*',c=>{
 const requestPath=decodeURIComponent(new URL(c.req.url).pathname);
 if(requestPath.includes('..'))return c.notFound();
 const routePath=requestPath.startsWith('/runtime/')?requestPath.slice('/runtime'.length):requestPath;
 const relative=routePath.replace(/^\/+|\/+$/g,'');
 const candidates=[];
 for(const base of [resolve(root,'deploy'),resolve(root,'astro/dist')]){
  const target=resolve(base,relative);
  if(target===base||target.startsWith(base+'/')){
   candidates.push(target);
   candidates.push(resolve(target,'index.html'));
  }
 }
 for(const file of candidates){
  if(!existsSync(file)||!statSync(file).isFile())continue;
  const ext=file.split('.').pop();
  const contentType={html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8',json:'application/json; charset=utf-8',svg:'image/svg+xml'}[ext]||'application/octet-stream';
  return c.body(readFileSync(file),200,{'Content-Type':contentType});
 }
 return c.notFound();
});

serve({fetch:app.fetch,port:Number(arg('port')??process.env.PORT??4260)},({port})=>{const portFile=arg('port-file')||process.env.PORT_FILE;if(portFile){const tmp=`${portFile}.${process.pid}.tmp`;writeFileSync(tmp,String(port)+'\n');renameSync(tmp,portFile)}console.log(`review server http://localhost:${port}/select/compare`)});
