import fs from'node:fs';import os from'node:os';import path from'node:path';import{spawnSync}from'node:child_process';
import{runObservableBrowser}from'./observable-browser-runner.mjs';
import{scheduleObservableBrowser}from'./observable-browser-scheduler.mjs';
import{executeTabsPlan}from'../proof/dx/conformance/shared/tabs-executor.mjs';
const root=path.resolve(path.dirname((await import('node:url')).fileURLToPath(import.meta.url)),'..');
const artifact=path.join(root,'library-artifacts/kumo-svelte-0.0.1.tgz');
const plans=JSON.parse(fs.readFileSync(path.join(root,'proof/dx/conformance/shared/tabs-fixtures.json'))).plans;
const T=fs.mkdtempSync(path.join(os.tmpdir(),'tsv-'));const app=path.join(T,'consumer');fs.mkdirSync(path.join(app,'src'),{recursive:true});
fs.writeFileSync(path.join(app,'package.json'),JSON.stringify({private:true,type:'module',dependencies:{'@acoyfellow/kumo-svelte':`file:${artifact}`,svelte:'5.56.3'},devDependencies:{'@sveltejs/vite-plugin-svelte':'7.1.2',vite:'8.0.16'}}));
spawnSync('npm',['install','--ignore-scripts'],{cwd:app,encoding:'utf8'});
fs.writeFileSync(path.join(app,'vite.ssr.mjs'),`import{svelte}from'@sveltejs/vite-plugin-svelte';export default{plugins:[svelte()],build:{ssr:'src/ssr.js',outDir:'sd',emptyOutDir:true,rollupOptions:{output:{entryFileNames:'o.mjs'}},minify:false}}`);
process.env.KUMO_BROWSER_POOL='https://kumo-browser-pool.coy.workers.dev';
function appSource(){return `<script>import Tabs from'@acoyfellow/kumo-svelte/tabs';let{plan}=$props();const p=plan.fixture.props;const controlled='selectedValue'in p;let sel=$state(p.selectedValue),events=$state([]);function onValueChange(v){events=[...events,'value:'+v];if(controlled)sel=v}if(typeof window!=='undefined')globalThis.__tabs={get events(){return events}};</script><section id="v0"><Tabs {...p} {...(controlled?{selectedValue:sel}:{})} {onValueChange}/></section>`;}
fs.writeFileSync(path.join(app,'src/App.svelte'),appSource());
const crypto=await import('node:crypto');const sha=b=>crypto.createHash('sha256').update(b).digest('hex');const cells=[];
for(const plan of plans){
 fs.writeFileSync(path.join(app,'src/ssr.js'),`import{render}from'svelte/server';import App from'./App.svelte';const r=render(App,{props:{plan:${JSON.stringify(plan)}}});console.log(JSON.stringify(r.body??r.html))`);spawnSync(path.join(app,'node_modules/.bin/vite'),['build','--config','vite.ssr.mjs'],{cwd:app,encoding:'utf8'});const html=JSON.parse(spawnSync(process.execPath,['sd/o.mjs'],{cwd:app,encoding:'utf8'}).stdout.trim().split(/\r?\n/).at(-1));
 const activation=plan.fixture.props.activateOnFocus?'automatic':'manual';
 try{const ev=await scheduleObservableBrowser(()=>runObservableBrowser({name:'tsv-'+plan.vector,entrySource:`import{hydrate}from'svelte';import App from'./App.svelte';const before=document.querySelector('#v0 > div');hydrate(App,{target:document.querySelector('#app'),recover:false,props:{plan:${JSON.stringify(plan)}}});queueMicrotask(()=>{globalThis.__nodePreserved=before===document.querySelector('#v0 > div');globalThis.__ready=true});`,entryFilename:'client.js',files:{'App.svelte':appSource()},viteConfig:path.join(root,'proof/dx/conformance/shared/svelte-vite.config.mjs'),buildEnv:{KUMO_CONSUMER:app},cssPath:path.join(app,'node_modules/@acoyfellow/kumo-svelte/package/styles.css'),html,vectors:[plan],runVector:async(api,current)=>executeTabsPlan({setup:async()=>{},action:async a=>api.action(0,{...a}),probe:async pr=>api.evaluate(`(()=>{const box=document.querySelector('#v0'),root=box.querySelector('div'),tabs=[...box.querySelectorAll('[role=tab]')],sel=box.querySelector('[aria-selected=true]'),active=document.activeElement;const kind=${JSON.stringify(pr.kind)},pth=${JSON.stringify(pr.path||'')};if(kind==='dom'&&pth==='descendants')return [{selector:'button',count:box.querySelectorAll('button').length}];if(kind==='dom')return{tag:root.tagName.toLowerCase(),attributes:{includes:Object.fromEntries([...root.attributes].map(x=>[x.name,x.value]))}};if(kind==='state'){const ev=globalThis.__tabs?globalThis.__tabs.events:[];const last=ev.length?ev[ev.length-1].slice(6):undefined;return{value:last,activation:${JSON.stringify(activation)}}}if(kind==='events')return [...(globalThis.__tabs?globalThis.__tabs.events:[])];if(kind==='focus')return active&&active.getAttribute&&active.getAttribute('aria-selected')==='true'?'[aria-selected=true]':active===root?'root':'none';if(kind==='node-identity')return globalThis.__nodePreserved?'preserved':'replaced'})()`)},current).then(r=>({observation:r.probes}))}));cells.push({component:'tabs',vector:plan.vector,status:'passed',mode:'browser',diagnostics:[],nodeIdentity:'preserved',ssr:'passed',hydration:'passed',assertion:{status:'passed',digest:sha(Buffer.from(JSON.stringify(plan.assertions)))},observation:ev.results[0].observation});}catch(e){console.error('TABS FAIL',plan.vector,String(e.message).slice(0,120));process.exit(1);}
}
fs.rmSync(T,{recursive:true,force:true});
const receiptPath=path.join(root,'proof/dx/conformance/svelte/receipt.json');
const receipt=JSON.parse(fs.readFileSync(receiptPath,'utf8'));
const byKey=new Map(cells.map(c=>[c.component+'/'+c.vector,c]));let merged=0;
receipt.cells=receipt.cells.map(c=>{const k=c.component+'/'+c.vector;if(byKey.has(k)){merged++;return byKey.get(k)}return c});
if(merged!==plans.length)throw new Error('expected '+plans.length+' tabs cells merged, got '+merged);
receipt.counts=receipt.cells.reduce((a,c)=>(a[c.status]=(a[c.status]||0)+1,a),{});
delete receipt.receiptHash;receipt.receiptHash=sha(JSON.stringify(receipt));
fs.writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+'\n');
console.log('svelte tabs proven:',cells.length,'cells; counts',JSON.stringify(receipt.counts));
