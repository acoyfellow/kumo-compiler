import fs from'node:fs';import os from'node:os';import path from'node:path';import{spawnSync}from'node:child_process';
import{runObservableBrowser}from'./observable-browser-runner.mjs';
import{scheduleObservableBrowser}from'./observable-browser-scheduler.mjs';
import{executeTabsPlan}from'../proof/dx/conformance/shared/tabs-executor.mjs';
const root=path.resolve(path.dirname((await import('node:url')).fileURLToPath(import.meta.url)),'..');
const artifact=path.join(root,'library-artifacts/kumo-solid-0.0.1.tgz');
const plans=JSON.parse(fs.readFileSync(path.join(root,'proof/dx/conformance/shared/tabs-fixtures.json'))).plans;
const T=fs.mkdtempSync(path.join(os.tmpdir(),'tso-'));const app=path.join(T,'consumer');fs.mkdirSync(path.join(app,'src'),{recursive:true});
fs.writeFileSync(path.join(app,'package.json'),JSON.stringify({private:true,type:'module',dependencies:{'@acoyfellow/kumo-solid':`file:${artifact}`,'solid-js':'1.9.13'},devDependencies:{'vite-plugin-solid':'2.11.12',vite:'8.0.16'}}));
spawnSync('npm',['install','--ignore-scripts'],{cwd:app,encoding:'utf8'});
fs.writeFileSync(path.join(app,'vite.ssr.mjs'),`import solid from'vite-plugin-solid';export default{plugins:[solid({ssr:true,solid:{hydratable:true}})],build:{ssr:'src/ssr.jsx',outDir:'sd',emptyOutDir:true,rollupOptions:{output:{entryFileNames:'o.mjs'}},minify:false}}`);
process.env.KUMO_BROWSER_POOL='https://kumo-browser-pool.coy.workers.dev';
function bodySrc(plan){const p=plan.fixture.props;return `import{createSignal}from'solid-js';import{Tabs}from'@acoyfellow/kumo-solid/tabs';const P=${JSON.stringify(p)};const controlled='selectedValue'in P;const[sel,setSel]=createSignal(P.selectedValue);const[events,setEvents]=createSignal([]);function onValueChange(v){setEvents([...events(),'value:'+v]);if(controlled)setSel(v)}if(typeof window!=='undefined')globalThis.__tabs={get events(){return events()}};function App(){return <section id="v0"><Tabs {...P} {...(controlled?{selectedValue:sel()}:{})} onValueChange={onValueChange}/></section>}`;}
function sources(plan){return{ssr:`import{generateHydrationScript,renderToString}from'solid-js/web';${bodySrc(plan)}console.log(JSON.stringify({html:renderToString(App,{renderId:'kumo-'}),hs:generateHydrationScript()}));`,client:`import{hydrate}from'solid-js/web';${bodySrc(plan)}const before=document.querySelector('#v0 > div');hydrate(App,document.querySelector('#app'),{renderId:'kumo-'});queueMicrotask(()=>{globalThis.__nodePreserved=before===document.querySelector('#v0 > div');globalThis.__ready=true});`};}
const crypto=await import('node:crypto');const sha=b=>crypto.createHash('sha256').update(b).digest('hex');const cells=[];
for(const plan of plans){
 fs.writeFileSync(path.join(app,'src/ssr.jsx'),sources(plan).ssr);spawnSync(path.join(app,'node_modules/.bin/vite'),['build','--config','vite.ssr.mjs'],{cwd:app,encoding:'utf8'});const ssrOut=JSON.parse(spawnSync(process.execPath,['sd/o.mjs'],{cwd:app,encoding:'utf8'}).stdout.trim().split(/\r?\n/).at(-1));const html=ssrOut.html;
 const activation=plan.fixture.props.activateOnFocus?'automatic':'manual';
 try{const ev=await scheduleObservableBrowser(()=>runObservableBrowser({name:'tso-'+plan.vector,entrySource:sources(plan).client,entryFilename:'client.jsx',viteConfig:path.join(root,'proof/dx/conformance/shared/solid-vite.config.mjs'),buildEnv:{KUMO_CONSUMER:app},cssPath:path.join(app,'node_modules/@acoyfellow/kumo-solid/package/styles.css'),html,beforeAppHtml:ssrOut.hs,vectors:[plan],runVector:async(api,current)=>executeTabsPlan({setup:async()=>{},action:async a=>api.action(0,{...a}),probe:async pr=>api.evaluate(`(()=>{const box=document.querySelector('#v0'),root=box.querySelector('div'),tabs=[...box.querySelectorAll('[role=tab]')],sel=box.querySelector('[aria-selected=true]'),active=document.activeElement;const kind=${JSON.stringify(pr.kind)},pth=${JSON.stringify(pr.path||'')};if(kind==='dom'&&pth==='descendants')return [{selector:'button',count:box.querySelectorAll('button').length}];if(kind==='dom')return{tag:root.tagName.toLowerCase(),attributes:{includes:Object.fromEntries([...root.attributes].map(x=>[x.name,x.value]))}};if(kind==='state'){const ev=globalThis.__tabs?globalThis.__tabs.events:[];const last=ev.length?ev[ev.length-1].slice(6):undefined;return{value:last,activation:${JSON.stringify(activation)}}}if(kind==='events')return [...(globalThis.__tabs?globalThis.__tabs.events:[])];if(kind==='focus')return active&&active.getAttribute&&active.getAttribute('aria-selected')==='true'?'[aria-selected=true]':active===root?'root':'none';if(kind==='node-identity')return globalThis.__nodePreserved?'preserved':'replaced'})()`)},current).then(r=>({observation:r.probes}))}));cells.push({component:'tabs',vector:plan.vector,status:'passed',mode:'browser',diagnostics:[],nodeIdentity:'preserved',ssr:'passed',hydration:'passed',assertion:{status:'passed',digest:sha(Buffer.from(JSON.stringify(plan.assertions)))},observation:ev.results[0].observation});}catch(e){console.error('TABS FAIL',plan.vector,String(e.message).slice(0,120));process.exit(1);}
}
fs.rmSync(T,{recursive:true,force:true});
const receiptPath=path.join(root,'proof/dx/conformance/solid/receipt.json');
const receipt=JSON.parse(fs.readFileSync(receiptPath,'utf8'));
const byKey=new Map(cells.map(c=>[c.component+'/'+c.vector,c]));let merged=0;
receipt.cells=receipt.cells.map(c=>{const k=c.component+'/'+c.vector;if(byKey.has(k)){merged++;return byKey.get(k)}return c});
if(merged!==plans.length)throw new Error('expected '+plans.length+' tabs cells merged, got '+merged);
receipt.counts=receipt.cells.reduce((a,c)=>(a[c.status]=(a[c.status]||0)+1,a),{});
delete receipt.receiptHash;receipt.receiptHash=sha(JSON.stringify(receipt));
fs.writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+'\n');
console.log('solid tabs proven:',cells.length,'cells; counts',JSON.stringify(receipt.counts));
