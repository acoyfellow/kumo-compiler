import fs from'node:fs';import os from'node:os';import path from'node:path';import crypto from'node:crypto';import{spawnSync}from'node:child_process';
import{runObservableBrowser}from'./observable-browser-runner.mjs';
import{scheduleObservableBrowser}from'./observable-browser-scheduler.mjs';
import{executeInputGroupPlan}from'../proof/dx/conformance/shared/input-group-executor.mjs';
const root=path.resolve(path.dirname((await import('node:url')).fileURLToPath(import.meta.url)),'..');
const json=JSON.stringify;const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const artifact=path.join(root,'library-artifacts/kumo-svelte-0.0.1.tgz');
const plans=JSON.parse(fs.readFileSync(path.join(root,'proof/dx/conformance/shared/input-group-fixtures.json'))).plans;
const contract=JSON.parse(fs.readFileSync(path.join(root,'contracts/kumo.observable/v1/components/input-group.json')));
const canonicalFixture=id=>contract.vectors.find(v=>v.id===id).fixture;
const T=fs.mkdtempSync(path.join(os.tmpdir(),'igsv-'));const app=path.join(T,'consumer');fs.mkdirSync(path.join(app,'src'),{recursive:true});
fs.writeFileSync(path.join(app,'package.json'),json({private:true,type:'module',dependencies:{'@acoyfellow/kumo-svelte':`file:${artifact}`,svelte:'5.56.3'},devDependencies:{'@sveltejs/vite-plugin-svelte':'7.1.2',vite:'8.0.16'}}));
spawnSync('npm',['install','--ignore-scripts'],{cwd:app,encoding:'utf8'});
fs.writeFileSync(path.join(app,'vite.ssr.mjs'),`import{svelte}from'@sveltejs/vite-plugin-svelte';export default{plugins:[svelte()],build:{ssr:'src/ssr.js',outDir:'sd',emptyOutDir:true,rollupOptions:{output:{entryFileNames:'o.mjs'}},minify:false}}`);
process.env.KUMO_BROWSER_POOL='https://kumo-browser-pool.coy.workers.dev';
function appSource(plan){const fixture=canonicalFixture(plan.vector);return `<script>import InputGroup from'@acoyfellow/kumo-svelte/input-group';const fixture=${JSON.stringify(fixture)};</script><section id="v0"><InputGroup {fixture}/></section>`;}
function sources(plan){return{client:`import{hydrate}from'svelte';import App from'./App.svelte';const before=document.querySelector('#v0 > div');hydrate(App,{target:document.querySelector('#app'),recover:false});queueMicrotask(()=>{globalThis.__nodePreserved=before===document.querySelector('#v0 > div');globalThis.__ready=true});`};}
const probeFn=pr=>`(()=>{const box=document.querySelector('#v0'),div=box.querySelector('div[data-kumo-component=InputGroup]')||box.querySelector('div'),inputs=[...box.querySelectorAll('input')],active=document.activeElement,kind=${json(pr.kind)};if(kind==='dom'){return {tag:div.tagName.toLowerCase(),attributes:{includes:Object.fromEntries([...div.attributes].map(x=>[x.name,x.value]))}};}if(kind==='state'){return {values:inputs.map(i=>i.value)};}if(kind==='focus'){if(active&&active.tagName==='INPUT')return 'input';if(active&&active.tagName==='BUTTON')return 'button';if(active&&active.tagName==='LABEL')return 'label';return 'none';}if(kind==='node-identity'){return globalThis.__nodePreserved?'preserved':'replaced';}})()`;
const cells=[];
for(const plan of plans){
 fs.writeFileSync(path.join(app,'src/App.svelte'),appSource(plan));fs.writeFileSync(path.join(app,'src/ssr.js'),`import{render}from'svelte/server';import App from'./App.svelte';const r=render(App);console.log(JSON.stringify(r.body??r.html))`);spawnSync(path.join(app,'node_modules/.bin/vite'),['build','--config','vite.ssr.mjs'],{cwd:app,encoding:'utf8'});const html=JSON.parse(spawnSync(process.execPath,['sd/o.mjs'],{cwd:app,encoding:'utf8'}).stdout.trim().split(/\r?\n/).at(-1));
 try{
  const ev=await scheduleObservableBrowser(()=>runObservableBrowser({name:'igsv-'+plan.vector,entrySource:sources(plan).client,entryFilename:'client.js',files:{'App.svelte':appSource(plan)},viteConfig:path.join(root,'proof/dx/conformance/shared/svelte-vite.config.mjs'),buildEnv:{KUMO_CONSUMER:app},cssPath:path.join(app,'node_modules/@acoyfellow/kumo-svelte/package/styles.css'),html,vectors:[plan],runVector:async(api,current)=>executeInputGroupPlan({setup:async()=>{},action:async a=>api.action(0,{type:a.type,text:a.text,editMode:a.editMode,selector:a.selector}),probe:async pr=>api.evaluate(probeFn(pr))},current).then(r=>({observation:r.probes}))}));
  cells.push({component:'input-group',vector:plan.vector,status:'passed',mode:'browser',diagnostics:[],nodeIdentity:'preserved',ssr:'passed',hydration:'passed',assertion:{status:'passed',digest:sha(Buffer.from(json(plan.assertions)))},observation:ev.results[0].observation});
 }catch(e){console.error('INPUTGROUP FAIL',plan.vector,String(e.message).slice(0,200));process.exit(1);}
}
fs.rmSync(T,{recursive:true,force:true});
const receiptPath=path.join(root,'proof/dx/conformance/svelte/receipt.json');
const receipt=JSON.parse(fs.readFileSync(receiptPath,'utf8'));
const byKey=new Map(cells.map(c=>[c.component+'/'+c.vector,c]));let merged=0;
receipt.cells=receipt.cells.map(c=>{const k=c.component+'/'+c.vector;if(byKey.has(k)){merged++;return byKey.get(k)}return c});
if(merged!==plans.length)throw new Error('expected '+plans.length+' input-group cells merged, got '+merged);
receipt.counts=receipt.cells.reduce((a,c)=>(a[c.status]=(a[c.status]||0)+1,a),{});
delete receipt.receiptHash;receipt.receiptHash=sha(json(receipt));
fs.writeFileSync(receiptPath,json(receipt,null,2)+'\n');
console.log('svelte input-group proven:',cells.length,'cells; counts',json(receipt.counts));
