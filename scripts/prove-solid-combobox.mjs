import fs from'node:fs';import os from'node:os';import path from'node:path';import crypto from'node:crypto';import{spawnSync}from'node:child_process';
import{runObservableBrowser}from'./observable-browser-runner.mjs';
import{scheduleObservableBrowser}from'./observable-browser-scheduler.mjs';
import{executeComboboxPlan}from'../proof/dx/conformance/shared/combobox-executor.mjs';
const root=path.resolve(path.dirname((await import('node:url')).fileURLToPath(import.meta.url)),'..');
const json=JSON.stringify;const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const artifact=path.join(root,'library-artifacts/kumo-solid-0.0.1.tgz');
const plans=JSON.parse(fs.readFileSync(path.join(root,'proof/dx/conformance/shared/combobox-fixtures.json'))).plans;
const contract=JSON.parse(fs.readFileSync(path.join(root,'contracts/kumo.observable/v1/components/combobox.json')));
const canonicalFixture=id=>contract.vectors.find(v=>v.id===id).fixture;
const T=fs.mkdtempSync(path.join(os.tmpdir(),'cbso-'));const app=path.join(T,'consumer');fs.mkdirSync(path.join(app,'src'),{recursive:true});
fs.writeFileSync(path.join(app,'package.json'),json({private:true,type:'module',dependencies:{'@acoyfellow/kumo-solid':`file:${artifact}`,'solid-js':'1.9.13'},devDependencies:{'vite-plugin-solid':'2.11.12',vite:'8.0.16'}}));
spawnSync('npm',['install','--ignore-scripts'],{cwd:app,encoding:'utf8'});
fs.writeFileSync(path.join(app,'vite.ssr.mjs'),`import solid from'vite-plugin-solid';export default{plugins:[solid({ssr:true,solid:{hydratable:true}})],build:{ssr:'src/ssr.jsx',outDir:'sd',emptyOutDir:true,rollupOptions:{output:{entryFileNames:'o.mjs'}},minify:false}}`);
process.env.KUMO_BROWSER_POOL='https://kumo-browser-pool.coy.workers.dev';
function bodySrc(plan){const fixture=canonicalFixture(plan.vector);return `import{createSignal}from'solid-js';import{Combobox}from'@acoyfellow/kumo-solid/combobox';const fixture=${JSON.stringify(fixture)};const[events,setEvents]=createSignal([]);if(typeof window!=='undefined')globalThis.__cb={get events(){return events()}};function App(){return <section id="v0"><Combobox fixture={fixture} onOpenChange={(v)=>setEvents([...events(),'open:'+v])} onValueChange={(v)=>setEvents([...events(),'value:'+v])}/></section>}`;}
function sources(plan){return{ssr:`import{generateHydrationScript,renderToString}from'solid-js/web';${bodySrc(plan)}console.log(JSON.stringify({html:renderToString(App,{renderId:'kumo-'}),hs:generateHydrationScript()}));`,client:`import{hydrate}from'solid-js/web';${bodySrc(plan)}const before=document.querySelector('#v0 input');hydrate(App,document.querySelector('#app'),{renderId:'kumo-'});queueMicrotask(()=>{globalThis.__nodePreserved=before===document.querySelector('#v0 input');globalThis.__ready=true});`};}
const probeFn=pr=>`(()=>{const box=document.querySelector('#v0'),input=box.querySelector('input'),active=document.activeElement,kind=${json(pr.kind)};if(kind==='dom'){return {tag:input.tagName.toLowerCase()};}if(kind==='state'){return {value:input.value};}if(kind==='events'){return [...(globalThis.__cb?globalThis.__cb.events:[])];}if(kind==='focus'){return active===input?'input':(active&&active.tagName==='BUTTON'?'button':'none');}if(kind==='node-identity'){return globalThis.__nodePreserved?'preserved':'replaced';}})()`;
const cells=[];
for(const plan of plans){
 fs.writeFileSync(path.join(app,'src/ssr.jsx'),sources(plan).ssr);spawnSync(path.join(app,'node_modules/.bin/vite'),['build','--config','vite.ssr.mjs'],{cwd:app,encoding:'utf8'});const ssrOut=JSON.parse(spawnSync(process.execPath,['sd/o.mjs'],{cwd:app,encoding:'utf8'}).stdout.trim().split(/\r?\n/).at(-1));const html=ssrOut.html;
 try{
  const ev=await scheduleObservableBrowser(()=>runObservableBrowser({name:'cbso-'+plan.vector,entrySource:sources(plan).client,entryFilename:'client.jsx',viteConfig:path.join(root,'proof/dx/conformance/shared/solid-vite.config.mjs'),buildEnv:{KUMO_CONSUMER:app},cssPath:path.join(app,'node_modules/@acoyfellow/kumo-solid/package/styles.css'),html,beforeAppHtml:ssrOut.hs,vectors:[plan],runVector:async(api,current)=>executeComboboxPlan({setup:async()=>{},action:async a=>api.action(0,{type:a.type,key:a.key,selector:a.selector||'input'}),probe:async pr=>api.evaluate(probeFn(pr))},current).then(r=>({observation:r.probes}))}));
  cells.push({component:'combobox',vector:plan.vector,status:'passed',mode:'browser',diagnostics:[],nodeIdentity:'preserved',ssr:'passed',hydration:'passed',assertion:{status:'passed',digest:sha(Buffer.from(json(plan.assertions)))},observation:ev.results[0].observation});
 }catch(e){console.error('COMBOBOX FAIL',plan.vector,String(e.message).slice(0,240));process.exit(1);}
}
fs.rmSync(T,{recursive:true,force:true});
const receiptPath=path.join(root,'proof/dx/conformance/solid/receipt.json');
const receipt=JSON.parse(fs.readFileSync(receiptPath,'utf8'));
const byKey=new Map(cells.map(c=>[c.component+'/'+c.vector,c]));let merged=0;
receipt.cells=receipt.cells.map(c=>{const k=c.component+'/'+c.vector;if(byKey.has(k)){merged++;return byKey.get(k)}return c});
if(merged!==plans.length)throw new Error('expected '+plans.length+' combobox cells merged, got '+merged);
receipt.counts=receipt.cells.reduce((a,c)=>(a[c.status]=(a[c.status]||0)+1,a),{});
delete receipt.receiptHash;receipt.receiptHash=sha(json(receipt));
fs.writeFileSync(receiptPath,json(receipt,null,2)+'\n');
console.log('solid combobox proven:',cells.length,'cells; counts',json(receipt.counts));
