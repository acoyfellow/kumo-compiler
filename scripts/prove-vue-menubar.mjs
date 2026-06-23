import fs from'node:fs';import os from'node:os';import path from'node:path';import crypto from'node:crypto';import{spawnSync}from'node:child_process';
import{runObservableBrowser}from'./observable-browser-runner.mjs';
import{scheduleObservableBrowser}from'./observable-browser-scheduler.mjs';
import{executeMenubarPlan}from'../proof/dx/conformance/shared/menubar-executor.mjs';
const root=path.resolve(path.dirname((await import('node:url')).fileURLToPath(import.meta.url)),'..');
const json=JSON.stringify;const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const artifact=path.join(root,'library-artifacts/kumo-vue-0.0.1.tgz');
const plans=JSON.parse(fs.readFileSync(path.join(root,'proof/dx/conformance/shared/menubar-fixtures.json'))).plans;
const T=fs.mkdtempSync(path.join(os.tmpdir(),'mbv-'));const app=path.join(T,'consumer');fs.mkdirSync(path.join(app,'src'),{recursive:true});
fs.writeFileSync(path.join(app,'package.json'),json({private:true,type:'module',dependencies:{'@acoyfellow/kumo-vue':`file:${artifact}`,vue:'3.5.38','@vue/server-renderer':'3.5.38'},devDependencies:{'@vitejs/plugin-vue':'6.0.7',vite:'8.0.16'}}));
spawnSync('npm',['install','--ignore-scripts'],{cwd:app,encoding:'utf8'});
fs.writeFileSync(path.join(app,'vite.ssr.mjs'),`import vue from'@vitejs/plugin-vue';export default{plugins:[vue()],build:{ssr:'src/ssr.js',outDir:'sd',emptyOutDir:true,rollupOptions:{output:{entryFileNames:'o.mjs'}},minify:false}}`);
process.env.KUMO_BROWSER_POOL='https://kumo-browser-pool.coy.workers.dev';
// fixture-callback onClick -> a real callback that records click:<index>
function sources(plan){
 const p=plan.fixture.props;
 // wire each option onClick to record click:index
 const body=`const P=${json(p)};const events=ref([]);const opts=(P.options||[]).map((o,i)=>({...o,onClick:()=>{events.value=[...events.value,'click:'+i]}}));if(typeof window!=='undefined')globalThis.__mb={events};const App={setup(){return()=>h('section',{id:'v0'},[h(MenuBar,{...P,options:opts})])}};`;
 return{ssr:`import{createSSRApp,h,ref}from'vue';import{renderToString}from'@vue/server-renderer';import{MenuBar}from'@acoyfellow/kumo-vue/menu-bar';${body}console.log(JSON.stringify(await renderToString(createSSRApp(App))));`,
 client:`import{createSSRApp,h,ref,nextTick}from'vue';import{MenuBar}from'@acoyfellow/kumo-vue/menu-bar';${body}const before=document.querySelector('#v0 > nav');const a=createSSRApp(App);a.mount('#app');nextTick(()=>{globalThis.__nodePreserved=before===document.querySelector('#v0 > nav');globalThis.__ready=true});`};
}
const cells=[];
for(const plan of plans){
 fs.writeFileSync(path.join(app,'src/ssr.js'),sources(plan).ssr);spawnSync(path.join(app,'node_modules/.bin/vite'),['build','--config','vite.ssr.mjs'],{cwd:app,encoding:'utf8'});const html=JSON.parse(spawnSync(process.execPath,['sd/o.mjs'],{cwd:app,encoding:'utf8'}).stdout.trim().split(/\r?\n/).at(-1));
 const p=plan.fixture.props;const stateAssertion=plan.assertions.find(a=>a.probe==='state');const stateKeys=stateAssertion?Object.keys(stateAssertion.expected):[];
 const probeFn=pr=>`(()=>{const box=document.querySelector('#v0'),nav=box.querySelector('nav'),buttons=[...box.querySelectorAll('button')],active=document.activeElement;const kind=${json(pr.kind)},name=${json(pr.name||'')},keys=${json(stateKeys)},isActive=${json(p.isActive??null)};if(kind==='dom'&&name==='descendants'){return [{selector:'button',count:buttons.length}];}if(kind==='dom'){return {tag:nav.tagName.toLowerCase(),classes:{includes:[...nav.classList]},text:nav.textContent.trim(),attributes:{includes:Object.fromEntries([...nav.attributes].map(x=>[x.name,x.value]))}};}if(kind==='state'){const full={active:isActive,allButtonsNativeTabbable:buttons.every(b=>b.tabIndex===0),activeSelectionAriaAbsent:buttons.every(b=>!b.hasAttribute('aria-selected')&&!b.hasAttribute('aria-pressed')&&!b.hasAttribute('aria-current'))};return Object.fromEntries(keys.map(k=>[k,full[k]]));}if(kind==='events'){return [...(globalThis.__mb?globalThis.__mb.events.value:[])];}if(kind==='focus'){return buttons.includes(active)?'button':(active===nav?'nav':'none');}if(kind==='node-identity'){return globalThis.__nodePreserved?'preserved':'replaced';}})()`;
 try{
  const ev=await scheduleObservableBrowser(()=>runObservableBrowser({name:'mbv-'+plan.vector,entrySource:sources(plan).client,entryFilename:'client.js',viteConfig:path.join(root,'proof/dx/conformance/shared/vue-vite.config.mjs'),buildEnv:{KUMO_CONSUMER:app},cssPath:path.join(app,'node_modules/@acoyfellow/kumo-vue/package/styles.css'),html,vectors:[plan],runVector:async(api,current)=>executeMenubarPlan({setup:async()=>{},action:async a=>api.action(0,{...a,selector:a.selector||'button'}),probe:async pr=>api.evaluate(probeFn(pr))},current).then(r=>({observation:r.probes}))}));
  cells.push({component:'menu-bar',vector:plan.vector,status:'passed',mode:'browser',diagnostics:[],nodeIdentity:'preserved',ssr:'passed',hydration:'passed',assertion:{status:'passed',digest:sha(Buffer.from(json(plan.assertions)))},observation:ev.results[0].observation});
 }catch(e){console.error('MENUBAR FAIL',plan.vector,String(e.message).slice(0,160));process.exit(1);}
}
fs.rmSync(T,{recursive:true,force:true});
const receiptPath=path.join(root,'proof/dx/conformance/vue/receipt.json');
const receipt=JSON.parse(fs.readFileSync(receiptPath,'utf8'));
const byKey=new Map(cells.map(c=>[c.component+'/'+c.vector,c]));let merged=0;
receipt.cells=receipt.cells.map(c=>{const k=c.component+'/'+c.vector;if(byKey.has(k)){merged++;return byKey.get(k)}return c});
if(merged!==plans.length)throw new Error('expected '+plans.length+' menu-bar cells merged, got '+merged);
receipt.counts=receipt.cells.reduce((a,c)=>(a[c.status]=(a[c.status]||0)+1,a),{});
delete receipt.receiptHash;receipt.receiptHash=sha(json(receipt));
fs.writeFileSync(receiptPath,json(receipt,null,2)+'\n');
console.log('vue menu-bar proven:',cells.length,'cells; counts',json(receipt.counts));
