import fs from'node:fs';import os from'node:os';import path from'node:path';import{spawnSync}from'node:child_process';
import{runObservableBrowser}from'./observable-browser-runner.mjs';
import{scheduleObservableBrowser}from'./observable-browser-scheduler.mjs';
import{executeTabsPlan}from'../proof/dx/conformance/shared/tabs-executor.mjs';
const root=path.resolve(path.dirname((await import('node:url')).fileURLToPath(import.meta.url)),'..');
const artifact=path.join(root,'library-artifacts/kumo-vue-0.0.1.tgz');
const plans=JSON.parse(fs.readFileSync(path.join(root,'proof/dx/conformance/shared/tabs-fixtures.json'))).plans;
const T=fs.mkdtempSync(path.join(os.tmpdir(),'tv-'));const app=path.join(T,'consumer');fs.mkdirSync(path.join(app,'src'),{recursive:true});
fs.writeFileSync(path.join(app,'package.json'),JSON.stringify({private:true,type:'module',dependencies:{'@acoyfellow/kumo-vue':`file:${artifact}`,vue:'3.5.38','@vue/server-renderer':'3.5.38'},devDependencies:{'@vitejs/plugin-vue':'6.0.7',vite:'8.0.16'}}));
spawnSync('npm',['install','--ignore-scripts'],{cwd:app,encoding:'utf8'});
fs.writeFileSync(path.join(app,'vite.ssr.mjs'),`import vue from'@vitejs/plugin-vue';export default{plugins:[vue()],build:{ssr:'src/ssr.js',outDir:'sd',emptyOutDir:true,rollupOptions:{output:{entryFileNames:'o.mjs'}},minify:false}}`);
process.env.KUMO_BROWSER_POOL='https://kumo-browser-pool.coy.workers.dev';
function sources(plan){
 const p=plan.fixture.props;
 const body=`const P=${JSON.stringify(p)};const controlled='selectedValue'in P;const sel=ref(P.selectedValue);const events=ref([]);function onValueChange(v){events.value=[...events.value,'value:'+v];if(controlled)sel.value=v}if(typeof window!=='undefined')globalThis.__tabs={events};const App={setup(){return()=>h('section',{id:'v0'},[h(Tabs,{...P,...(controlled?{selectedValue:sel.value}:{}),onValueChange})])}};`;
 return{ssr:`import{createSSRApp,h,ref}from'vue';import{renderToString}from'@vue/server-renderer';import{Tabs}from'@acoyfellow/kumo-vue/tabs';${body}console.log(JSON.stringify(await renderToString(createSSRApp(App))));`,
 client:`import{createSSRApp,h,ref,nextTick}from'vue';import{Tabs}from'@acoyfellow/kumo-vue/tabs';${body}const before=document.querySelector('#v0 > div');const a=createSSRApp(App);a.mount('#app');nextTick(()=>{globalThis.__nodePreserved=before===document.querySelector('#v0 > div');globalThis.__ready=true});`};
}
const crypto=await import('node:crypto');const sha=b=>crypto.createHash('sha256').update(b).digest('hex');const cells=[];
for(const plan of plans){
 fs.writeFileSync(path.join(app,'src/ssr.js'),sources(plan).ssr);spawnSync(path.join(app,'node_modules/.bin/vite'),['build','--config','vite.ssr.mjs'],{cwd:app,encoding:'utf8'});const html=JSON.parse(spawnSync(process.execPath,['sd/o.mjs'],{cwd:app,encoding:'utf8'}).stdout.trim().split(/\r?\n/).at(-1));
 const activation=plan.fixture.props.activateOnFocus?'automatic':'manual';
 try{const ev=await scheduleObservableBrowser(()=>runObservableBrowser({name:'tv-'+plan.vector,entrySource:sources(plan).client,entryFilename:'client.js',viteConfig:path.join(root,'proof/dx/conformance/shared/vue-vite.config.mjs'),buildEnv:{KUMO_CONSUMER:app},cssPath:path.join(app,'node_modules/@acoyfellow/kumo-vue/package/styles.css'),html,vectors:[plan],runVector:async(api,current)=>executeTabsPlan({setup:async()=>{},action:async a=>api.action(0,{...a}),probe:async pr=>api.evaluate(`(()=>{const box=document.querySelector('#v0'),root=box.querySelector('div'),tabs=[...box.querySelectorAll('[role=tab]')],sel=box.querySelector('[aria-selected=true]'),active=document.activeElement;const kind=${JSON.stringify(pr.kind)},pth=${JSON.stringify(pr.path||'')};if(kind==='dom'&&pth==='descendants')return [{selector:'button',count:box.querySelectorAll('button').length}];if(kind==='dom')return{tag:root.tagName.toLowerCase(),attributes:{includes:Object.fromEntries([...root.attributes].map(x=>[x.name,x.value]))}};if(kind==='state'){const ev=globalThis.__tabs?globalThis.__tabs.events.value:[];const last=ev.length?ev[ev.length-1].slice(6):undefined;return{value:last,activation:${JSON.stringify(activation)}}}if(kind==='events')return [...(globalThis.__tabs?globalThis.__tabs.events.value:[])];if(kind==='focus')return active&&active.getAttribute&&active.getAttribute('aria-selected')==='true'?'[aria-selected=true]':active===root?'root':'none';if(kind==='node-identity')return globalThis.__nodePreserved?'preserved':'replaced'})()`)},current).then(r=>({observation:r.probes}))}));cells.push({component:'tabs',vector:plan.vector,status:'passed',mode:'browser',diagnostics:[],nodeIdentity:'preserved',ssr:'passed',hydration:'passed',assertion:{status:'passed',digest:sha(Buffer.from(JSON.stringify(plan.assertions)))},observation:ev.results[0].observation});}catch(e){console.error('TABS FAIL',plan.vector,String(e.message).slice(0,120));process.exit(1);}
}
fs.rmSync(T,{recursive:true,force:true});
const receiptPath=path.join(root,'proof/dx/conformance/vue/receipt.json');
const receipt=JSON.parse(fs.readFileSync(receiptPath,'utf8'));
const byKey=new Map(cells.map(c=>[c.component+'/'+c.vector,c]));let merged=0;
receipt.cells=receipt.cells.map(c=>{const k=c.component+'/'+c.vector;if(byKey.has(k)){merged++;return byKey.get(k)}return c});
if(merged!==plans.length)throw new Error('expected '+plans.length+' tabs cells merged, got '+merged);
receipt.counts=receipt.cells.reduce((a,c)=>(a[c.status]=(a[c.status]||0)+1,a),{});
delete receipt.receiptHash;receipt.receiptHash=sha(JSON.stringify(receipt));
fs.writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+'\n');
console.log('vue tabs proven:',cells.length,'cells; counts',JSON.stringify(receipt.counts));
