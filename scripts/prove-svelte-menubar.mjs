import fs from'node:fs';import os from'node:os';import path from'node:path';import crypto from'node:crypto';import{spawnSync}from'node:child_process';
import{runObservableBrowser}from'./observable-browser-runner.mjs';
import{scheduleObservableBrowser}from'./observable-browser-scheduler.mjs';
import{executeMenubarPlan}from'../proof/dx/conformance/shared/menubar-executor.mjs';
const root=path.resolve(path.dirname((await import('node:url')).fileURLToPath(import.meta.url)),'..');
const json=JSON.stringify;const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const artifact=path.join(root,'library-artifacts/kumo-svelte-0.0.1.tgz');
const plans=JSON.parse(fs.readFileSync(path.join(root,'proof/dx/conformance/shared/menubar-fixtures.json'))).plans;
const T=fs.mkdtempSync(path.join(os.tmpdir(),'mbsv-'));const app=path.join(T,'consumer');fs.mkdirSync(path.join(app,'src'),{recursive:true});
fs.writeFileSync(path.join(app,'package.json'),json({private:true,type:'module',dependencies:{'@acoyfellow/kumo-svelte':`file:${artifact}`,svelte:'5.56.3'},devDependencies:{'@sveltejs/vite-plugin-svelte':'7.1.2',vite:'8.0.16'}}));
spawnSync('npm',['install','--ignore-scripts'],{cwd:app,encoding:'utf8'});
fs.writeFileSync(path.join(app,'vite.ssr.mjs'),`import{svelte}from'@sveltejs/vite-plugin-svelte';export default{plugins:[svelte()],build:{ssr:'src/ssr.js',outDir:'sd',emptyOutDir:true,rollupOptions:{output:{entryFileNames:'o.mjs'}},minify:false}}`);
process.env.KUMO_BROWSER_POOL='https://kumo-browser-pool.coy.workers.dev';
function appSource(plan){return `<script>import MenuBar from'@acoyfellow/kumo-svelte/menu-bar';let{plan}=$props();const P=plan.fixture.props;let events=$state([]);const opts=(P.options||[]).map((o,i)=>({...o,onClick:()=>{events=[...events,'click:'+i]}}));if(typeof window!=='undefined')globalThis.__mb={get events(){return events}};</script><section id="v0"><MenuBar {...P} options={opts}/></section>`;}
function sources(plan){return{client:`import{hydrate}from'svelte';import App from'./App.svelte';const before=document.querySelector('#v0 > nav');hydrate(App,{target:document.querySelector('#app'),recover:false,props:{plan:${JSON.stringify(plan)}}});queueMicrotask(()=>{globalThis.__nodePreserved=before===document.querySelector('#v0 > nav');globalThis.__ready=true});`};}
// fixture-callback onClick -> a real callback that records click:<index>
const cells=[];
for(const plan of plans){
 fs.writeFileSync(path.join(app,'src/App.svelte'),appSource(plan));fs.writeFileSync(path.join(app,'src/ssr.js'),`import{render}from'svelte/server';import App from'./App.svelte';const r=render(App,{props:{plan:${JSON.stringify(plan)}}});console.log(JSON.stringify(r.body??r.html))`);spawnSync(path.join(app,'node_modules/.bin/vite'),['build','--config','vite.ssr.mjs'],{cwd:app,encoding:'utf8'});const html=JSON.parse(spawnSync(process.execPath,['sd/o.mjs'],{cwd:app,encoding:'utf8'}).stdout.trim().split(/\r?\n/).at(-1));
 const p=plan.fixture.props;const stateAssertion=plan.assertions.find(a=>a.probe==='state');const stateKeys=stateAssertion?Object.keys(stateAssertion.expected):[];
 const probeFn=pr=>`(()=>{const box=document.querySelector('#v0'),nav=box.querySelector('nav'),buttons=[...box.querySelectorAll('button')],active=document.activeElement;const kind=${json(pr.kind)},name=${json(pr.name||'')},keys=${json(stateKeys)},isActive=${json(p.isActive??null)};if(kind==='dom'&&name==='descendants'){return [{selector:'button',count:buttons.length}];}if(kind==='dom'){return {tag:nav.tagName.toLowerCase(),classes:{includes:[...nav.classList]},text:nav.textContent.trim(),attributes:{includes:Object.fromEntries([...nav.attributes].map(x=>[x.name,x.value]))}};}if(kind==='state'){const full={active:isActive,allButtonsNativeTabbable:buttons.every(b=>b.tabIndex===0),activeSelectionAriaAbsent:buttons.every(b=>!b.hasAttribute('aria-selected')&&!b.hasAttribute('aria-pressed')&&!b.hasAttribute('aria-current'))};return Object.fromEntries(keys.map(k=>[k,full[k]]));}if(kind==='events'){return [...(globalThis.__mb?globalThis.__mb.events:[])];}if(kind==='focus'){return buttons.includes(active)?'button':(active===nav?'nav':'none');}if(kind==='node-identity'){return globalThis.__nodePreserved?'preserved':'replaced';}})()`;
 try{
  const ev=await scheduleObservableBrowser(()=>runObservableBrowser({name:'mbsv-'+plan.vector,entrySource:sources(plan).client,entryFilename:'client.js',files:{'App.svelte':appSource(plan)},viteConfig:path.join(root,'proof/dx/conformance/shared/svelte-vite.config.mjs'),buildEnv:{KUMO_CONSUMER:app},cssPath:path.join(app,'node_modules/@acoyfellow/kumo-svelte/package/styles.css'),html,vectors:[plan],runVector:async(api,current)=>executeMenubarPlan({setup:async()=>{},action:async a=>api.action(0,{...a,selector:a.selector||'button'}),probe:async pr=>api.evaluate(probeFn(pr))},current).then(r=>({observation:r.probes}))}));
  cells.push({component:'menu-bar',vector:plan.vector,status:'passed',mode:'browser',diagnostics:[],nodeIdentity:'preserved',ssr:'passed',hydration:'passed',assertion:{status:'passed',digest:sha(Buffer.from(json(plan.assertions)))},observation:ev.results[0].observation});
 }catch(e){console.error('MENUBAR FAIL',plan.vector,String(e.message).slice(0,160));process.exit(1);}
}
fs.rmSync(T,{recursive:true,force:true});
const receiptPath=path.join(root,'proof/dx/conformance/svelte/receipt.json');
const receipt=JSON.parse(fs.readFileSync(receiptPath,'utf8'));
const byKey=new Map(cells.map(c=>[c.component+'/'+c.vector,c]));let merged=0;
receipt.cells=receipt.cells.map(c=>{const k=c.component+'/'+c.vector;if(byKey.has(k)){merged++;return byKey.get(k)}return c});
if(merged!==plans.length)throw new Error('expected '+plans.length+' menu-bar cells merged, got '+merged);
receipt.counts=receipt.cells.reduce((a,c)=>(a[c.status]=(a[c.status]||0)+1,a),{});
delete receipt.receiptHash;receipt.receiptHash=sha(json(receipt));
fs.writeFileSync(receiptPath,json(receipt,null,2)+'\n');
console.log('svelte menu-bar proven:',cells.length,'cells; counts',json(receipt.counts));
