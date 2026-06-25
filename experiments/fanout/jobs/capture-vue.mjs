#!/usr/bin/env node
// Fan-out Vue capture: builds a fanout Vue component package (Ark + Kumo classes),
// SSRs + hydrates, serves over HTTP, captures states x viewports via an ISOLATED
// headless Chrome, writes v3 traces the neutral scorer consumes.
// Usage: node capture-vue.mjs <component>
import {createHash} from 'node:crypto';
import {existsSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {createServer} from 'node:http';
import {mkdtemp, mkdir, readFile, readdir, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
import {build} from 'vite';
import vue from '@vitejs/plugin-vue';

const HERE = import.meta.dirname, ROOT = resolve(HERE, '..'), REPO = resolve(ROOT, '..', '..');
const component = process.argv[2];
if (!component) { console.error('usage: capture-vue <component>'); process.exit(2); }
const PKG = resolve(ROOT, 'packages', 'vue', component);
const OUT = resolve(ROOT, 'outputs', 'vue', component);
const DIST = resolve(PKG, '.build');
const sha = x => createHash('sha256').update(x).digest('hex');
const sleep = n => new Promise(r => setTimeout(r, n));
const chrome = process.env.CHROME_PATH || ['/Applications/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(existsSync) || 'google-chrome';

const STATES = { 'dropdown-menu': ['closed', 'open', 'dismissed'], 'select': ['default', 'selected', 'disabled'], 'dialog': ['closed', 'open', 'dismissed'], 'popover': ['closed', 'open', 'dismissed'] };
const VIEWPORTS = [390, 768, 1440];

const evaluateFor = vocabJson => `(()=>{const VOCAB=new Set(${vocabJson});const round=n=>Math.round(n*1000)/1000,attrs=e=>Object.fromEntries([...e.attributes].map(a=>[a.name,a.value]).sort((a,b)=>a[0].localeCompare(b[0]))),esc=s=>s.replace(/[^a-zA-Z0-9_-]/g,c=>'_'+c.codePointAt(0).toString(16)),path=e=>{const a=[];for(let n=e;n&&n.nodeType===1;n=n.parentElement){let i=0;for(let p=n.previousElementSibling;p;p=p.previousElementSibling)i++;a.unshift(esc(n.localName)+':'+i);if(n===document.documentElement)break}return a.join('/')},main=document.querySelector('main'),owned=new Set(main?[main,...main.querySelectorAll('*')]:[]);for(const e of document.querySelectorAll('[data-part]'))owned.add(e);for(const e of [...owned])for(const key of (e.getAttribute('aria-controls')||'').split(/\\s+/).filter(Boolean)){const n=document.getElementById(key);if(n){owned.add(n);for(const d of n.querySelectorAll('*'))owned.add(d)}}for(const e of [...owned])if(main&&!main.contains(e))for(let n=e.parentElement;n&&n!==document.body;n=n.parentElement){owned.add(n);for(const d of n.querySelectorAll('*'))owned.add(d)};const all=[...owned].sort((a,b)=>a===b?0:a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING?-1:1),partOf=e=>{const dp=e.dataset.part?.replace(/^(?:part|slot):/,'');if(!dp||!VOCAB.has(dp))return null;for(let n=e.parentElement;n;n=n.parentElement){const pdp=n.dataset?.part?.replace(/^(?:part|slot):/,'');if(pdp===dp)return null;}return dp},id=e=>{const part=partOf(e);return part?'part:'+esc(part):'path:'+path(e)},nodes=all.map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e),p=e.parentElement;return {id:id(e),part:partOf(e),parentId:p&&owned.has(p)?id(p):null,order:p?[...p.children].indexOf(e):0,namespace:e.namespaceURI,tag:e.localName,role:e.getAttribute('role')||e.role||null,attrs:attrs(e),classes:[...e.classList].sort(),text:e.childElementCount?null:e.textContent.trim(),geometry:{x:round(r.x),y:round(r.y),width:round(r.width),height:round(r.height)},style:Object.fromEntries(['display','position','color','background-color','font-family','font-size','font-weight','border-radius','opacity','visibility'].map(k=>[k,s.getPropertyValue(k)]))}});return {url:location.href,hydrated:globalThis.__hydrated===true,dom:main.outerHTML,parts:nodes,focus:{active:document.activeElement&&owned.has(document.activeElement)?id(document.activeElement):document.activeElement?.localName},events:[...(globalThis.__events||[])]}})()`;

async function connect(url){const ws=new WebSocket(url),pending=new Map(),events=[];let id=0;await new Promise((ok,no)=>{ws.onopen=ok;ws.onerror=no});ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.no(Error(m.error.message)):p.ok(m.result)}else events.push(m)};return {events,send:(method,params={})=>new Promise((ok,no)=>{const n=++id;pending.set(n,{ok,no});ws.send(JSON.stringify({id:n,method,params}))}),close:()=>ws.close()}}
async function launch(){const profile=await mkdtemp(resolve(tmpdir(),'kfo-vue-'));const proc=spawn(chrome,['--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run',`--user-data-dir=${profile}`,'--remote-debugging-port=0','about:blank'],{stdio:'ignore'});let port;for(let i=0;i<200;i++){try{port=Number((await readFile(resolve(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break}catch{await sleep(25)}}if(!port)throw Error('Chrome unavailable');const ver=await fetch(`http://127.0.0.1:${port}/json/version`).then(r=>r.json()),target=await fetch(`http://127.0.0.1:${port}/json/new?about%3Ablank`,{method:'PUT'}).then(r=>r.json());return {proc,profile,ver,cdp:await connect(target.webSocketDebuggerUrl)}}
async function snapshot(cdp,evaluate){const value=(await cdp.send('Runtime.evaluate',{expression:evaluate,returnByValue:true})).result.value,a11y=(await cdp.send('Accessibility.getFullAXTree')).nodes.filter(n=>!n.ignored).map(n=>({role:n.role?.value,name:n.name?.value})),png=Buffer.from((await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true})).data,'base64');return {...value,a11y,screenshot:{sha256:sha(png),bytes:png.length},png}}

async function run(){
  const states = STATES[component]; if (!states) throw Error(`no states for ${component}`);
  const contract = JSON.parse(await readFile(resolve(ROOT,'substrate','contracts',component+'.json'),'utf8'));
  const canonicalParts = JSON.stringify([...new Set(contract.parts.map(p=>p.part).filter(Boolean))]);
  const evaluate = evaluateFor(canonicalParts);
  // Build SSR + client bundles from a generated entry that mounts the component with props.
  await rm(DIST,{recursive:true,force:true}); await mkdir(DIST,{recursive:true});
  const compFile = (await readdir(PKG)).find(f=>/\.vue$/.test(f));
  if(!compFile) throw Error('no .vue source');
  const appVue = `<script setup>\nimport C from '${resolve(PKG,compFile)}'\nconst props=defineProps({state:String,viewport:Number})\n</script>\n<template><C :state="props.state" :viewport="props.viewport"/></template>\n`;
  await writeFile(resolve(DIST,'App.vue'),appVue);
  await writeFile(resolve(DIST,'entry-server.mjs'),`import {createSSRApp,h} from 'vue';import {renderToString} from 'vue/server-renderer';import App from './App.vue';export async function render(props){return await renderToString(createSSRApp({render(){return h(App,props)}}))}`);
  await writeFile(resolve(DIST,'client.mjs'),`import {createSSRApp,h} from 'vue';import App from './App.vue';const p=JSON.parse(document.querySelector('#app').dataset.props);createSSRApp({render(){return h(App,p)}}).mount('#app');globalThis.__hydrated=true;`);
  const cfg={root:DIST,plugins:[vue()],logLevel:'silent',build:{emptyOutDir:true}};
  await build({...cfg,build:{...cfg.build,outDir:resolve(DIST,'client'),rollupOptions:{input:resolve(DIST,'client.mjs')}}});
  await build({...cfg,build:{...cfg.build,outDir:resolve(DIST,'server'),ssr:resolve(DIST,'entry-server.mjs')}});
  const clientName=(await readdir(resolve(DIST,'client'),{recursive:true})).find(x=>x.endsWith('.js')),client=await readFile(resolve(DIST,'client',clientName));
  const serverName=(await readdir(resolve(DIST,'server'))).find(x=>/\.(mjs|js)$/.test(x)),renderer=await import(resolve(DIST,'server',serverName)+`?t=${Date.now()}`);
  const css=await readFile(resolve(REPO,'node_modules/@cloudflare/kumo/dist/styles/kumo-standalone.css'));
  const reactRuntime=/react-dom|react\/jsx-runtime/.test(client.toString());
  const server=createServer(async(req,res)=>{const u=new URL(req.url,'http://localhost');if(u.pathname==='/app.js'){res.setHeader('content-type','text/javascript');return res.end(client)}if(u.pathname==='/style.css'){res.setHeader('content-type','text/css');return res.end(css)}const props={state:u.searchParams.get('state'),viewport:Number(u.searchParams.get('viewport'))||1440},ssr=await renderer.render(props),enc=JSON.stringify(props).replace(/'/g,'&#39;');res.setHeader('content-type','text/html');res.end(`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/style.css"></head><body><div id="app" data-props='${enc}'>${ssr}</div><script type="module" src="/app.js"></script></body></html>`)});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
  const b=await launch(),records=[];const buildDigest=sha(Buffer.concat([client,css]));
  try{const {cdp}=b;await Promise.all(['Page.enable','Runtime.enable','Accessibility.enable'].map(x=>cdp.send(x)));
    for(const state of states)for(const viewport of VIEWPORTS){await cdp.send('Emulation.setDeviceMetricsOverride',{width:viewport,height:720,deviceScaleFactor:1,mobile:false});await cdp.send('Page.navigate',{url:`${origin}/?state=${state}&viewport=${viewport}`});await sleep(state==='open'?400:180);const initial=await snapshot(cdp,evaluate);const after=await snapshot(cdp,evaluate),png=initial.png;
      const trace={schemaVersion:'kumo.visual-trace/v3',engine:'ark',component,state,viewport,dom:initial.dom,parts:initial.parts,a11y:initial.a11y,screenshot:initial.screenshot,checkpoint:{initial:{...initial,png:undefined},after:{...after,png:undefined}},behavior:{action:null,before:{focus:initial.focus,events:initial.events},after:{focus:after.focus,events:after.events}}};
      const traceBytes=Buffer.from(JSON.stringify(trace,null,2)+'\n'),dir=resolve(OUT,state,String(viewport));await mkdir(dir,{recursive:true});await writeFile(resolve(dir,'trace.json'),traceBytes);await writeFile(resolve(dir,'screenshot.png'),png);await writeFile(resolve(dir,'after.png'),after.png);
      const provenance={schemaVersion:'kumo.native-harness-provenance/v1',target:'vue',generatedSourceDigest:sha(appVue+compFile),lowererDigest:sha('fanout-ark'),nativeCompilerDigest:sha('vue+ark'),nativeBuildDigest:buildDigest,servedHarnessDigest:buildDigest,captureDigest:sha(Buffer.concat([traceBytes,png])),traceDigest:sha(traceBytes),screenshotDigest:sha(png),afterScreenshotDigest:sha(after.png),canonicalSourceDigest:sha('ark-native-not-canonical'),generatedBuild:{digest:buildDigest,framework:'vue',compiler:'@ark-ui/vue + @vue/compiler-sfc + Vite'},servedHarness:{url:origin,buildDigest,ssr:true,hydrated:initial.hydrated},capture:{id:sha(traceBytes).slice(0,24),capturedAt:new Date().toISOString(),independent:true,canonicalArtifactUsed:false,driver:'CDP',buildDigest,harnessDigest:buildDigest}};
      await writeFile(resolve(dir,'provenance.json'),JSON.stringify(provenance,null,2)+'\n');records.push({state,viewport,hydrated:initial.hydrated,parts:initial.parts.length})}
    cdp.close()}finally{b.proc.kill();server.close();await rm(b.profile,{recursive:true,force:true,maxRetries:5,retryDelay:100}).catch(()=>{});await rm(DIST,{recursive:true,force:true}).catch(()=>{})}
  await writeFile(resolve(PKG,'selfcheck.json'),JSON.stringify({built:true,reactRuntime,cells:records.length,hydrated:records.every(r=>r.hydrated)},null,2)+'\n');
  console.log(`captured vue/${component}: ${records.length} cells, reactRuntime=${reactRuntime}, hydrated=${records.every(r=>r.hydrated)}`);
}
run().catch(async e=>{await writeFile(resolve(PKG,'selfcheck.json'),JSON.stringify({built:false,reactRuntime:false,error:String(e.message)},null,2)+'\n').catch(()=>{});console.error(e.stack);process.exit(1)});
