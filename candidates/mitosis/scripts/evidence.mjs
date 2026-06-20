import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'node:http';
import {build} from 'vite';
import vue from '@vitejs/plugin-vue';
import {svelte} from '@sveltejs/vite-plugin-svelte';
import solid from 'vite-plugin-solid';
import {chromium} from 'playwright';
const root=path.resolve(import.meta.dirname,'..');
const chrome=process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const plugins={react:[],vue:[vue()],svelte:[svelte()],solid:[solid()]};
const imports={react:(c)=>`import React from 'react';import{createRoot}from'react-dom/client';import C from '../../generated/react/${c}.tsx';`,vue:(c)=>`import{createApp,h}from'vue';import C from '../../generated/vue/${c}.vue';`,svelte:(c)=>`import{mount}from'svelte';import C from '../../generated/svelte/${c}.svelte';`,solid:(c)=>`import{render}from'solid-js/web';import C from '../../generated/solid/${c}.tsx';`};
const mount={react:(c,p)=>`createRoot(document.querySelector('#app')).render(React.createElement(C,${p}));`,vue:(c,p)=>`createApp({render:()=>h(C,${p})}).mount('#app');`,svelte:(c,p)=>`mount(C,{target:document.querySelector('#app'),props:${p}});`,solid:(c,p)=>`render(()=><C {...${p}}/>,document.querySelector('#app'));`};
const receipt={};
for(const component of ['Field','Tabs'])for(const framework of Object.keys(plugins)){
 const key=`${component}.${framework}`, app=path.join(root,'.evidence',key);fs.mkdirSync(app,{recursive:true});
 const props=component==='Field'?`{label:'Name',value:'Ada',onInput:v=>{document.body.dataset.value=v}}`:`{labels:['One','Two']}`;
 fs.writeFileSync(path.join(app,'index.html'),'<div id="app"></div><script type="module" src="/main.jsx"></script>');
 fs.writeFileSync(path.join(app,'main.jsx'),imports[framework](component)+mount[framework](component,props));
 const r={component,framework,generatedSource:`generated/${framework}/${component}.${framework==='vue'?'vue':framework==='svelte'?'svelte':'tsx'}`,systemChrome:chrome,network:[],console:[],assets:[]};
 let server,browser;
 try{const result=await build({root:app,configFile:false,plugins:plugins[framework],build:{outDir:path.join(app,'dist'),emptyOutDir:true},logLevel:'silent'});r.build='passed';r.assets=(result.output??[]).flatMap(x=>x.output??[]).map(x=>x.fileName);
  const dist=path.join(app,'dist');server=createServer((q,s)=>{if(q.url==='/favicon.ico'){s.statusCode=204;s.end();return}const rel=q.url==='/'?'index.html':q.url.slice(1).split('?')[0],f=path.join(dist,rel);if(!fs.existsSync(f)){if(rel==='favicon.ico'){s.statusCode=204;s.end();return}s.statusCode=404;s.end();return}s.setHeader('content-type',f.endsWith('.js')?'text/javascript; charset=utf-8':f.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8');s.end(fs.readFileSync(f))});await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
  browser=await chromium.launch({headless:true,executablePath:chrome});const page=await browser.newPage();page.on('console',m=>r.console.push({type:m.type(),text:m.text()}));page.on('pageerror',e=>r.console.push({type:'pageerror',text:e.message}));page.on('response',x=>r.network.push({url:x.url(),status:x.status()}));await page.goto(`http://127.0.0.1:${server.address().port}`,{waitUntil:'networkidle'});
  if(component==='Field'){const input=page.locator('input');r.dom={label:await page.locator('label').innerText(),value:await input.inputValue(),description:null,error:null,ariaDescribedby:await input.getAttribute('aria-describedby')};await input.fill('Grace');r.behavior={controlledCallback:(await page.locator('body').getAttribute('data-value'))==='Grace'};r.domAria=r.dom.label.includes('Name')&&r.dom.value==='Ada'?'passed':'failed';r.behaviorStatus=r.behavior.controlledCallback?'passed':'failed';r.limitations=['Generated model emits implicit label only; no description/error nodes or aria-describedby references.'];}
  else{const tabs=page.locator('[role=tab]');await tabs.nth(1).click();const selected=await tabs.nth(1).getAttribute('aria-selected'),panel=await page.locator('[role=tabpanel]').innerText();await tabs.nth(0).focus();await tabs.nth(0).press('ArrowRight');r.dom={tabCount:await tabs.count(),selected,panel};r.behavior={click:selected==='true'&&panel==='Two',arrowNavigation:(await page.evaluate(()=>document.activeElement?.textContent))==='Two'};r.domAria=r.dom.tabCount===2&&selected==='true'?'passed':'failed';r.behaviorStatus=r.behavior.click?'passed':'failed';r.limitations=['Generated output is monolithic labels-array state, not compound/context API.','Generated output has no Arrow-key handler, tab ids, aria-controls, or labelledby links.'];}
  r.runtime='passed';r.consoleStatus=r.console.some(x=>x.type==='error'||x.type==='pageerror')?'failed':'passed';r.networkStatus=r.network.every(x=>x.status<400)?'passed':'failed';r.assetsStatus=r.network.some(x=>x.status<400&&x.url.includes('/assets/'))?'passed':'failed';r.domHtml=await page.locator('#app').innerHTML();await page.screenshot({path:path.join(app,'screenshot.png')});r.screenshot=path.relative(root,path.join(app,'screenshot.png'));
 }catch(e){r.build??='failed';r.runtime='failed';r.error=e.stack??String(e);}finally{if(browser)await browser.close();if(server)await new Promise(ok=>server.close(ok));}
 receipt[key]=r;
}
fs.mkdirSync(path.join(root,'receipts'),{recursive:true});fs.writeFileSync(path.join(root,'receipts','field-tabs-evidence.json'),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt,null,2));
