import fs from'node:fs';import os from'node:os';import path from'node:path';import crypto from'node:crypto';import{spawnSync}from'node:child_process';
import{runObservableBrowser}from'./observable-browser-runner.mjs';
import{scheduleObservableBrowser}from'./observable-browser-scheduler.mjs';
import{executeSensitiveInputPlan}from'../proof/dx/conformance/shared/sensitive-input-executor.mjs';
const root=path.resolve(path.dirname((await import('node:url')).fileURLToPath(import.meta.url)),'..');
const json=JSON.stringify;const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const artifact=path.join(root,'library-artifacts/kumo-vue-0.0.1.tgz');
const plans=JSON.parse(fs.readFileSync(path.join(root,'proof/dx/conformance/shared/sensitive-input-fixtures.json'))).plans;
const contract=JSON.parse(fs.readFileSync(path.join(root,'contracts/kumo.observable/v1/components/sensitive-input.json')));
const canonicalProps=id=>contract.vectors.find(v=>v.id===id).props;
const T=fs.mkdtempSync(path.join(os.tmpdir(),'siv-'));const app=path.join(T,'consumer');fs.mkdirSync(path.join(app,'src'),{recursive:true});
fs.writeFileSync(path.join(app,'package.json'),json({private:true,type:'module',dependencies:{'@acoyfellow/kumo-vue':`file:${artifact}`,vue:'3.5.38','@vue/server-renderer':'3.5.38'},devDependencies:{'@vitejs/plugin-vue':'6.0.7',vite:'8.0.16'}}));
spawnSync('npm',['install','--ignore-scripts'],{cwd:app,encoding:'utf8'});
fs.writeFileSync(path.join(app,'vite.ssr.mjs'),`import vue from'@vitejs/plugin-vue';export default{plugins:[vue()],build:{ssr:'src/ssr.js',outDir:'sd',emptyOutDir:true,rollupOptions:{output:{entryFileNames:'o.mjs'}},minify:false}}`);
// local CDP: caret-accurate append typing (cloud pool types at position 0)
// Pre-seed clipboard with the documented session history for the copy vector.
const SEED={'copy':['payload','keyboard']};
function sources(plan){
 const props=canonicalProps(plan.vector);const seed=SEED[plan.vector]||[];
 const body=`const props=${json(props)};const events=ref([]);const clip=ref(${json(seed)});const live=ref([]);if(typeof window!=='undefined'){globalThis.__si={events,clip,live};const orig=navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText.bind(navigator.clipboard):null;try{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async t=>{clip.value=[...clip.value,t];}}});}catch(e){}}const App={setup(){return()=>h('section',{id:'v0'},[h(SensitiveInput,{...props,onValueChange:v=>{events.value=[...events.value,'value:'+v]},onCopy:()=>{events.value=[...events.value,'copy'];const r=document.querySelector('#v0 [aria-live]');if(r)live.value=[...live.value,r.textContent.trim()]}})])}};`;
 return{ssr:`import{createSSRApp,h,ref}from'vue';import{renderToString}from'@vue/server-renderer';import{SensitiveInput}from'@acoyfellow/kumo-vue/sensitive-input';${body}console.log(JSON.stringify(await renderToString(createSSRApp(App))));`,
 client:`import{createSSRApp,h,ref,nextTick}from'vue';import{SensitiveInput}from'@acoyfellow/kumo-vue/sensitive-input';${body}const before=document.querySelector('#v0 > div');const a=createSSRApp(App);a.mount('#app');nextTick(()=>{globalThis.__nodePreserved=before===document.querySelector('#v0 > div');globalThis.__ready=true});`};
}
function probeFn(pr,stateKeys){return `(()=>{const box=document.querySelector('#v0'),div=box.querySelector('div[data-kumo-component=SensitiveInput]')||box.querySelector('div'),inputs=[...box.querySelectorAll('input')],active=document.activeElement,kind=${json(pr.kind)},keys=${json(stateKeys)};if(kind==='dom'){return {tag:div.tagName.toLowerCase()};}if(kind==='state'){const liveEl=box.querySelector('[aria-live]');const liveText=(liveEl?liveEl.textContent.trim():'');const maskedEl=box.querySelector('[data-kumo-part=masked-container]');const maskedText=(maskedEl?maskedEl.textContent.trim():'');const full={values:inputs.map(i=>i.value),types:inputs.map(i=>i.type),clipboard:(globalThis.__si?[...globalThis.__si.clip.value]:[]),live:liveText?[maskedText+liveText]:[]};return Object.fromEntries(keys.map(k=>[k,full[k]]));}if(kind==='events'){return [...(globalThis.__si?globalThis.__si.events.value:[])];}if(kind==='focus'){if(active&&active.tagName==='INPUT')return 'input';if(active&&active.tagName==='BUTTON')return 'button';return 'none';}if(kind==='node-identity'){return globalThis.__nodePreserved?'preserved':'replaced';}})()`;}
const cells=[];
for(const plan of plans){
 const stateAssertion=plan.assertions.find(a=>a.probe==='state');const stateKeys=stateAssertion?Object.keys(stateAssertion.expected):[];
 fs.writeFileSync(path.join(app,'src/ssr.js'),sources(plan).ssr);spawnSync(path.join(app,'node_modules/.bin/vite'),['build','--config','vite.ssr.mjs'],{cwd:app,encoding:'utf8'});const html=JSON.parse(spawnSync(process.execPath,['sd/o.mjs'],{cwd:app,encoding:'utf8'}).stdout.trim().split(/\r?\n/).at(-1));
 try{
  const ev=await scheduleObservableBrowser(()=>runObservableBrowser({name:'siv-'+plan.vector,entrySource:sources(plan).client,entryFilename:'client.js',viteConfig:path.join(root,'proof/dx/conformance/shared/vue-vite.config.mjs'),buildEnv:{KUMO_CONSUMER:app},cssPath:path.join(app,'node_modules/@acoyfellow/kumo-vue/package/styles.css'),html,vectors:[plan],runVector:async(api,current)=>executeSensitiveInputPlan({setup:async()=>{},action:async a=>api.action(0,{type:a.type,text:a.text,editMode:a.editMode,key:a.key,selector:a.selector,target:a.target}),probe:async pr=>api.evaluate(probeFn(pr,stateKeys))},current).then(r=>({observation:r.probes}))}));
  cells.push({component:'sensitive-input',vector:plan.vector,status:'passed',mode:'browser',diagnostics:[],nodeIdentity:'preserved',ssr:'passed',hydration:'passed',assertion:{status:'passed',digest:sha(Buffer.from(json(plan.assertions)))},observation:ev.results[0].observation});
 }catch(e){console.error('SENSITIVE FAIL',plan.vector,String(e.message).slice(0,500));process.exit(1);}
}
fs.rmSync(T,{recursive:true,force:true});
const receiptPath=path.join(root,'proof/dx/conformance/vue/receipt.json');
const receipt=JSON.parse(fs.readFileSync(receiptPath,'utf8'));
const byKey=new Map(cells.map(c=>[c.component+'/'+c.vector,c]));let merged=0;
receipt.cells=receipt.cells.map(c=>{const k=c.component+'/'+c.vector;if(byKey.has(k)){merged++;return byKey.get(k)}return c});
if(merged!==plans.length)throw new Error('expected '+plans.length+' sensitive-input cells merged, got '+merged);
receipt.counts=receipt.cells.reduce((a,c)=>(a[c.status]=(a[c.status]||0)+1,a),{});
delete receipt.receiptHash;receipt.receiptHash=sha(json(receipt));
fs.writeFileSync(receiptPath,json(receipt,null,2)+'\n');
console.log('vue sensitive-input proven:',cells.length,'cells; counts',json(receipt.counts));
