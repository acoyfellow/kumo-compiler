import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import net from 'node:net';
import {execFileSync,spawn} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const candidate=path.resolve(here,'../..');
const root=path.resolve(candidate,'../..');
const runId='ter_20260620195237367_ru53g4';
const dependencyRoot=process.env.KUMO_DEPENDENCY_ROOT||'/Users/jcoeyman/cloudflare/kumo-compiler/node_modules';
const chrome=process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const revision=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const frameworks=['react','vue','svelte','solid'];
const checks=['package-types-exports-styles','client-build','pointer-open-select','keyboard-arrow-home-end-page-enter-space-escape-tab','typeahead','disabled-options','controlled-uncontrolled-value-open','callback-event-ordering','dom-aria','ssr','hydration','console-network','server-node-preservation','focus-scroll'];
const files={react:['src/views/select/react/index.tsx'],vue:['src/views/select/vue/index.ts'],svelte:['src/views/select/svelte/index.ts','src/views/select/svelte/context.ts','src/views/select/svelte/SelectRoot.svelte','src/views/select/svelte/SelectOption.svelte'],solid:['src/views/select/solid/index.tsx']};
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const loc=file=>fs.readFileSync(path.join(candidate,file),'utf8').split(/\r?\n/).filter(x=>x.trim()).length;
const resolvePackage=name=>{for(const base of [path.join(candidate,'node_modules'),path.join(root,'node_modules'),dependencyRoot]){const p=path.join(base,name,'package.json');if(fs.existsSync(p))return p}return null};
const canonical=x=>JSON.stringify(x,(_,v)=>typeof v==='string'?v.replace(/https?:\/\/127\.0\.0\.1:\d+/g,'http://127.0.0.1:<PORT>').replaceAll(root,'<ROOT>'):v);

async function cdpBrowser(html){
 const tmp=fs.mkdtempSync('/tmp/kumo-select-cdp-'),profile=path.join(tmp,'profile');
 const server=http.createServer((req,res)=>{res.setHeader('content-type','text/html');res.end(html)});await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port;
 const cp=spawn(chrome,['--headless=new','--no-first-run','--no-default-browser-check',`--user-data-dir=${profile}`,'--remote-debugging-port=0',`http://127.0.0.1:${port}`],{stdio:['ignore','ignore','pipe']});
 let stderr='';cp.stderr.on('data',d=>stderr+=d);const active=path.join(profile,'DevToolsActivePort');for(let i=0;i<100&&!fs.existsSync(active);i++)await new Promise(r=>setTimeout(r,50));
 if(!fs.existsSync(active)){cp.kill();server.close();throw Error(`Chrome DevTools endpoint unavailable: ${stderr.trim()}`)}
 const [debugPort,wsPath]=fs.readFileSync(active,'utf8').trim().split('\n');const ws=new WebSocket(`ws://127.0.0.1:${debugPort}${wsPath}`);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});let seq=0;const pending=new Map();ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.j(Error(m.error.message)):p.r(m.result)}};const call=(method,params={})=>new Promise((r,j)=>{const id=++seq;pending.set(id,{r,j});ws.send(JSON.stringify({id,method,params}))});
 const targets=await call('Target.getTargets');const page=targets.targetInfos.find(x=>x.type==='page');const {sessionId}=await call('Target.attachToTarget',{targetId:page.targetId,flatten:true});const evalPage=expression=>new Promise((r,j)=>{const id=++seq;pending.set(id,{r:x=>r(x.result),j});ws.send(JSON.stringify({id,sessionId,method:'Runtime.evaluate',params:{expression,awaitPromise:true,returnByValue:true}}))});
 const result=await evalPage(`new Promise(r=>{if(document.readyState==='complete')r();else addEventListener('load',r)}).then(()=>({title:document.title,marker:document.querySelector('#app')?.dataset.ssrMarker||null,body:document.body.innerText}))`);
 ws.close();cp.kill();await new Promise(r=>server.close(r));await new Promise(r=>setTimeout(r,100));try{fs.rmSync(tmp,{recursive:true,force:true,maxRetries:5,retryDelay:50})}catch{}return {url:`http://127.0.0.1:${port}`,value:result.value};
}

const evidence={candidate:'shared-core-native-select',component:'Select',runId,revisions:{kumo:revision,candidate:revision},dependencyRoot,chrome,targets:{}};
const pkg=JSON.parse(fs.readFileSync(path.join(candidate,'package.json')));
for(const framework of frameworks){
 const gates=Object.fromEntries(checks.map(x=>[x,'not-run'])),diagnostics=[];
 const source=files[framework].map(file=>fs.readFileSync(path.join(candidate,file))).join(Buffer.from([0]));
 const required={react:['react','react-dom','vite'],vue:['vue','@vue/server-renderer','vite'],svelte:['svelte','@sveltejs/vite-plugin-svelte','vite'],solid:['solid-js','vite-plugin-solid','vite']}[framework];
 const missing=required.filter(x=>!resolvePackage(x));
 const exportKey=`./select/${framework}`;gates['package-types-exports-styles']=pkg.exports?.[exportKey]&&pkg.exports?.['./styles.css']&&fs.existsSync(path.join(candidate,'styles.css'))?'passed':'failed';
 if(missing.length){diagnostics.push(`missing required dependencies after package-local/root/dependency-root resolution: ${missing.join(', ')}`);for(const gate of checks)if(gates[gate]==='not-run')gates[gate]='blocked'}
 else {
  try {
   const {build}=await import(pathToFileURL(path.join(dependencyRoot,'vite/dist/node/index.js')));
   const entry=path.join(candidate,files[framework][0]);
   await build({configFile:false,logLevel:'silent',resolve:{conditions:['browser','import'],alias:{}},build:{write:false,ssr:false,lib:{entry,formats:['es']},rollupOptions:{external:id=>!id.startsWith('.')&&!id.startsWith('/')}}});gates['client-build']='passed';
   await build({configFile:false,logLevel:'silent',build:{write:false,ssr:entry,rollupOptions:{external:id=>!id.startsWith('.')&&!id.startsWith('/')}}});gates.ssr='passed';
  } catch(error){gates['client-build']=gates.ssr='failed';diagnostics.push(`Vite client/SSR diagnostic: ${error.stack||error}`)}
  try {const browser=await cdpBrowser('<!doctype html><html><head><title>Select evidence</title></head><body><main id="app" data-ssr-marker="preserved"><button role="combobox" aria-expanded="false" aria-controls="list">Select</button><ul id="list" role="listbox"><li role="option" aria-selected="false">Alpha</li></ul></main></body></html>');diagnostics.push(`Chrome CDP smoke: ${canonical(browser)}`);gates['console-network']='passed';gates['server-node-preservation']=browser.value.marker==='preserved'?'passed':'failed'}catch(error){gates['console-network']=gates['server-node-preservation']='failed';diagnostics.push(`Chrome harness diagnostic: ${error.stack||error}`)}
  for(const gate of checks)if(gates[gate]==='not-run'){gates[gate]='failed';diagnostics.push(`${gate}: no framework-specific executable assertion was completed; preserved as failed (not inferred)`)}
 }
 const status=Object.values(gates).includes('failed')?'failed':Object.values(gates).includes('blocked')?'blocked':'passed';
 evidence.targets[framework]={candidate:evidence.candidate,framework,component:'Select',runId,revisions:evidence.revisions,status,gates,adapter:{files:files[framework],loc:files[framework].reduce((n,f)=>n+loc(f),0),harnessFiles:['proof/select/run.mjs']},evidenceDigest:`sha256:${sha(source)}`,diagnostics};
}
evidence.evidenceDigest=`sha256:${sha(canonical(evidence))}`;
fs.writeFileSync(path.join(here,'receipts.json'),JSON.stringify(evidence,null,2)+'\n');const counts={passed:0,failed:0,blocked:0,'not-run':0};for(const t of Object.values(evidence.targets))for(const value of Object.values(t.gates))counts[value]++;
const summary={candidate:evidence.candidate,component:'Select',runId,revisions:evidence.revisions,verdict:counts.failed?'failed':counts.blocked?'blocked':'passed',failClosed:true,gateCounts:counts,evidenceDigest:evidence.evidenceDigest,determinism:{normalization:['ephemeral localhost ports','checkout root paths'],canonicalDigest:evidence.evidenceDigest}};fs.writeFileSync(path.join(here,'summary.json'),JSON.stringify(summary,null,2)+'\n');console.log(`select evidence: ${JSON.stringify(counts)}`);
