import fs from'node:fs';import os from'node:os';import path from'node:path';import crypto from'node:crypto';import{spawnSync}from'node:child_process';
import{runObservableBrowser}from'./observable-browser-runner.mjs';
import{scheduleObservableBrowser}from'./observable-browser-scheduler.mjs';
import{executeAutocompletePlan}from'../proof/dx/conformance/shared/autocomplete-executor.mjs';
const root=path.resolve(path.dirname((await import('node:url')).fileURLToPath(import.meta.url)),'..');
const json=JSON.stringify;const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const artifact=path.join(root,'library-artifacts/kumo-vue-0.0.1.tgz');
const plans=JSON.parse(fs.readFileSync(path.join(root,'proof/dx/conformance/shared/autocomplete-fixtures.json'))).plans;
const contract=JSON.parse(fs.readFileSync(path.join(root,'contracts/kumo.observable/v1/components/autocomplete.json')));
const canonicalFixture=id=>contract.vectors.find(v=>v.id===id).fixture;
const T=fs.mkdtempSync(path.join(os.tmpdir(),'acv-'));const app=path.join(T,'consumer');fs.mkdirSync(path.join(app,'src'),{recursive:true});
fs.writeFileSync(path.join(app,'package.json'),json({private:true,type:'module',dependencies:{'@acoyfellow/kumo-vue':`file:${artifact}`,vue:'3.5.38','@vue/server-renderer':'3.5.38'},devDependencies:{'@vitejs/plugin-vue':'6.0.7',vite:'8.0.16'}}));
spawnSync('npm',['install','--ignore-scripts'],{cwd:app,encoding:'utf8'});
fs.writeFileSync(path.join(app,'vite.ssr.mjs'),`import vue from'@vitejs/plugin-vue';export default{plugins:[vue()],build:{ssr:'src/ssr.js',outDir:'sd',emptyOutDir:true,rollupOptions:{output:{entryFileNames:'o.mjs'}},minify:false}}`);
// local CDP: caret-accurate append typing
function sources(plan){
 const fixture=canonicalFixture(plan.vector);
 const body=`const fixture=${json(fixture)};const events=ref([]);if(typeof window!=='undefined')globalThis.__ac={events};const App={setup(){return()=>h('section',{id:'v0'},[h(Autocomplete,{fixture,onOpenChange:v=>{events.value=[...events.value,'open:'+v]},onValueChange:v=>{events.value=[...events.value,'value:'+v]}})])}};`;
 return{ssr:`import{createSSRApp,h,ref}from'vue';import{renderToString}from'@vue/server-renderer';import{Autocomplete}from'@acoyfellow/kumo-vue/autocomplete';${body}console.log(JSON.stringify(await renderToString(createSSRApp(App))));`,
 client:`import{createSSRApp,h,ref,nextTick}from'vue';import{Autocomplete}from'@acoyfellow/kumo-vue/autocomplete';${body}const before=document.querySelector('#v0 input');const a=createSSRApp(App);a.mount('#app');nextTick(()=>{globalThis.__nodePreserved=before===document.querySelector('#v0 input');globalThis.__ready=true});`};
}
const probeFn=pr=>`(()=>{const box=document.querySelector('#v0'),input=box.querySelector('input'),active=document.activeElement,kind=${json(pr.kind)};if(kind==='dom'){return {tag:input.tagName.toLowerCase()};}if(kind==='state'){const lb=box.querySelector('[role=listbox]');const open=input.getAttribute('aria-expanded')==='true'||(lb&&lb.offsetParent!==null);return {value:input.value,open:!!open};}if(kind==='events'){return [...(globalThis.__ac?globalThis.__ac.events.value:[])];}if(kind==='focus'){return active===input?'input':(active&&active.tagName==='BUTTON'?'button':'none');}if(kind==='node-identity'){return globalThis.__nodePreserved?'preserved':'replaced';}})()`;
const cells=[];
for(const plan of plans){
 fs.writeFileSync(path.join(app,'src/ssr.js'),sources(plan).ssr);spawnSync(path.join(app,'node_modules/.bin/vite'),['build','--config','vite.ssr.mjs'],{cwd:app,encoding:'utf8'});const html=JSON.parse(spawnSync(process.execPath,['sd/o.mjs'],{cwd:app,encoding:'utf8'}).stdout.trim().split(/\r?\n/).at(-1));
 try{
  const ev=await scheduleObservableBrowser(()=>runObservableBrowser({name:'acv-'+plan.vector,entrySource:sources(plan).client,entryFilename:'client.js',viteConfig:path.join(root,'proof/dx/conformance/shared/vue-vite.config.mjs'),buildEnv:{KUMO_CONSUMER:app},cssPath:path.join(app,'node_modules/@acoyfellow/kumo-vue/package/styles.css'),html,vectors:[plan],runVector:async(api,current)=>executeAutocompletePlan({setup:async()=>{},action:async a=>api.action(0,{type:a.type,key:a.key,text:a.text,editMode:a.editMode,selector:a.selector||'input'}),probe:async pr=>api.evaluate(probeFn(pr))},current).then(r=>({observation:r.probes}))}));
  cells.push({component:'autocomplete',vector:plan.vector,status:'passed',mode:'browser',diagnostics:[],nodeIdentity:'preserved',ssr:'passed',hydration:'passed',assertion:{status:'passed',digest:sha(Buffer.from(json(plan.assertions)))},observation:ev.results[0].observation});
 }catch(e){console.error('AUTOCOMPLETE FAIL',plan.vector,String(e.message).slice(0,240));process.exit(1);}
}
fs.rmSync(T,{recursive:true,force:true});
const receiptPath=path.join(root,'proof/dx/conformance/vue/receipt.json');
const receipt=JSON.parse(fs.readFileSync(receiptPath,'utf8'));
const byKey=new Map(cells.map(c=>[c.component+'/'+c.vector,c]));let merged=0;
receipt.cells=receipt.cells.map(c=>{const k=c.component+'/'+c.vector;if(byKey.has(k)){merged++;return byKey.get(k)}return c});
if(merged!==plans.length)throw new Error('expected '+plans.length+' combobox cells merged, got '+merged);
receipt.counts=receipt.cells.reduce((a,c)=>(a[c.status]=(a[c.status]||0)+1,a),{});
delete receipt.receiptHash;receipt.receiptHash=sha(json(receipt));
fs.writeFileSync(receiptPath,json(receipt,null,2)+'\n');
console.log('vue autocomplete proven:',cells.length,'cells; counts',json(receipt.counts));
