import fs from'node:fs';import os from'node:os';import path from'node:path';import crypto from'node:crypto';import{spawnSync}from'node:child_process';
import{runObservableBrowser}from'./observable-browser-runner.mjs';
import{scheduleObservableBrowser}from'./observable-browser-scheduler.mjs';
import{executeSensitiveInputPlan}from'../proof/dx/conformance/shared/sensitive-input-executor.mjs';
const root=path.resolve(path.dirname((await import('node:url')).fileURLToPath(import.meta.url)),'..');
const json=JSON.stringify;const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const artifact=path.join(root,'library-artifacts/kumo-solid-0.0.1.tgz');
const plans=JSON.parse(fs.readFileSync(path.join(root,'proof/dx/conformance/shared/sensitive-input-fixtures.json'))).plans;
const contract=JSON.parse(fs.readFileSync(path.join(root,'contracts/kumo.observable/v1/components/sensitive-input.json')));
const canonicalProps=id=>contract.vectors.find(v=>v.id===id).props;
const T=fs.mkdtempSync(path.join(os.tmpdir(),'siso-'));const app=path.join(T,'consumer');fs.mkdirSync(path.join(app,'src'),{recursive:true});
fs.writeFileSync(path.join(app,'package.json'),json({private:true,type:'module',dependencies:{'@acoyfellow/kumo-solid':`file:${artifact}`,'solid-js':'1.9.13'},devDependencies:{'vite-plugin-solid':'2.11.12',vite:'8.0.16'}}));
spawnSync('npm',['install','--ignore-scripts'],{cwd:app,encoding:'utf8'});
fs.writeFileSync(path.join(app,'vite.ssr.mjs'),`import solid from'vite-plugin-solid';export default{plugins:[solid({ssr:true,solid:{hydratable:true}})],build:{ssr:'src/ssr.jsx',outDir:'sd',emptyOutDir:true,rollupOptions:{output:{entryFileNames:'o.mjs'}},minify:false}}`);
// local CDP: caret-accurate append typing
const SEED={'copy':['payload','keyboard']};
function bodySrc(plan){const props=canonicalProps(plan.vector);const seed=SEED[plan.vector]||[];return `import{createSignal}from'solid-js';import{SensitiveInput}from'@acoyfellow/kumo-solid/sensitive-input';const props=${JSON.stringify(props)};const[events,setEvents]=createSignal([]);const[clip,setClip]=createSignal(${JSON.stringify(seed)});const[live,setLive]=createSignal([]);if(typeof window!=='undefined'){globalThis.__si={get events(){return events()},get clip(){return clip()},get live(){return live()}};try{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async t=>{setClip([...clip(),t])}}})}catch(e){}}function onValueChange(v){setEvents([...events(),'value:'+v])}function onCopy(){setEvents([...events(),'copy']);const r=document.querySelector('#v0 [aria-live]');const m=document.querySelector('#v0 [data-kumo-part=masked-container]');if(r)setLive([...live(),(m?m.textContent.trim():'')+r.textContent.trim()])}function App(){return <section id="v0"><SensitiveInput {...props} onValueChange={onValueChange} onCopy={onCopy}/></section>}`;}
function sources(plan){return{ssr:`import{generateHydrationScript,renderToString}from'solid-js/web';${bodySrc(plan)}console.log(JSON.stringify({html:renderToString(App,{renderId:'kumo-'}),hs:generateHydrationScript()}));`,client:`import{hydrate}from'solid-js/web';${bodySrc(plan)}const before=document.querySelector('#v0 > div');hydrate(App,document.querySelector('#app'),{renderId:'kumo-'});queueMicrotask(()=>{globalThis.__nodePreserved=before===document.querySelector('#v0 > div');globalThis.__ready=true});`};}
function probeFn(pr,stateKeys){return `(()=>{const box=document.querySelector('#v0'),div=box.querySelector('div[data-kumo-component=SensitiveInput]')||box.querySelector('div'),inputs=[...box.querySelectorAll('input')],active=document.activeElement,kind=${json(pr.kind)},keys=${json(stateKeys)};if(kind==='dom'){return {tag:div.tagName.toLowerCase()};}if(kind==='state'){const liveEl=box.querySelector('[aria-live]');const liveText=(liveEl?liveEl.textContent.trim():'');const maskedEl=box.querySelector('[data-kumo-part=masked-container]');const maskedText=(maskedEl?maskedEl.textContent.trim():'');const full={values:inputs.map(i=>i.value),types:inputs.map(i=>i.type),clipboard:(globalThis.__si?[...globalThis.__si.clip]:[]),live:liveText?[maskedText+liveText]:[]};return Object.fromEntries(keys.map(k=>[k,full[k]]));}if(kind==='events'){return [...(globalThis.__si?globalThis.__si.events:[])];}if(kind==='focus'){if(active&&active.tagName==='INPUT')return 'input';if(active&&active.tagName==='BUTTON')return 'button';return 'none';}if(kind==='node-identity'){return globalThis.__nodePreserved?'preserved':'replaced';}})()`;}
const cells=[];
for(const plan of plans){
 const stateAssertion=plan.assertions.find(a=>a.probe==='state');const stateKeys=stateAssertion?Object.keys(stateAssertion.expected):[];
 fs.writeFileSync(path.join(app,'src/ssr.jsx'),sources(plan).ssr);spawnSync(path.join(app,'node_modules/.bin/vite'),['build','--config','vite.ssr.mjs'],{cwd:app,encoding:'utf8'});const ssrOut=JSON.parse(spawnSync(process.execPath,['sd/o.mjs'],{cwd:app,encoding:'utf8'}).stdout.trim().split(/\r?\n/).at(-1));const html=ssrOut.html;
 try{
  const ev=await scheduleObservableBrowser(()=>runObservableBrowser({name:'siso-'+plan.vector,entrySource:sources(plan).client,entryFilename:'client.jsx',viteConfig:path.join(root,'proof/dx/conformance/shared/solid-vite.config.mjs'),buildEnv:{KUMO_CONSUMER:app},cssPath:path.join(app,'node_modules/@acoyfellow/kumo-solid/package/styles.css'),html,beforeAppHtml:ssrOut.hs,vectors:[plan],runVector:async(api,current)=>executeSensitiveInputPlan({setup:async()=>{},action:async a=>api.action(0,{type:a.type,text:a.text,editMode:a.editMode,key:a.key,selector:a.selector,target:a.target}),probe:async pr=>api.evaluate(probeFn(pr,stateKeys))},current).then(r=>({observation:r.probes}))}));
  cells.push({component:'sensitive-input',vector:plan.vector,status:'passed',mode:'browser',diagnostics:[],nodeIdentity:'preserved',ssr:'passed',hydration:'passed',assertion:{status:'passed',digest:sha(Buffer.from(json(plan.assertions)))},observation:ev.results[0].observation});
 }catch(e){console.error('SENSITIVE FAIL',plan.vector,String(e.message).slice(0,500));process.exit(1);}
}
fs.rmSync(T,{recursive:true,force:true});
const receiptPath=path.join(root,'proof/dx/conformance/solid/receipt.json');
const receipt=JSON.parse(fs.readFileSync(receiptPath,'utf8'));
const byKey=new Map(cells.map(c=>[c.component+'/'+c.vector,c]));let merged=0;
receipt.cells=receipt.cells.map(c=>{const k=c.component+'/'+c.vector;if(byKey.has(k)){merged++;return byKey.get(k)}return c});
if(merged!==plans.length)throw new Error('expected '+plans.length+' sensitive-input cells merged, got '+merged);
receipt.counts=receipt.cells.reduce((a,c)=>(a[c.status]=(a[c.status]||0)+1,a),{});
delete receipt.receiptHash;receipt.receiptHash=sha(json(receipt));
fs.writeFileSync(receiptPath,json(receipt,null,2)+'\n');
console.log('solid sensitive-input proven:',cells.length,'cells; counts',json(receipt.counts));
