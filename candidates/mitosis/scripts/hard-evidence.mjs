import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {build} from 'vite';
import vue from '@vitejs/plugin-vue';
import {svelte} from '@sveltejs/vite-plugin-svelte';
import solid from 'vite-plugin-solid';
import {chromium} from 'playwright';

const root=path.resolve(import.meta.dirname,'..');
const repo=path.resolve(root,'../..');
const chrome=process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const runId=process.env.TERRARIUM_RUN_ID||'ter_20260620192638995_ptsm10';
const revisions={kumo:execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),candidate:execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim()};
const frameworks=['react','vue','svelte','solid'], components=['Select','Dialog'];
const plugins={react:[],vue:[vue()],svelte:[svelte()],solid:[solid({ssr:true})]};
const ext=f=>f==='vue'?'vue':f==='svelte'?'svelte':'tsx';
const source=(f,c)=>path.join(root,'generated',f,`${c}.${ext(f)}`);
const lineCount=file=>fs.readFileSync(file,'utf8').split('\n').filter(x=>x.trim()&&!x.trim().startsWith('//')).length;
const adapters={
 react:{client:`import React from'react';import{hydrateRoot}from'react-dom/client';import C from'__SOURCE__';const p=__PROPS__;hydrateRoot(document.querySelector('#app'),React.createElement(C,p));`,server:`import React from'react';import{renderToString}from'react-dom/server';import C from'__SOURCE__';export const render=p=>renderToString(React.createElement(C,p));`},
 vue:{client:`import{createSSRApp,h}from'vue';import C from'__SOURCE__';const p=__PROPS__;createSSRApp({render:()=>h(C,p,{default:()=>__CHILD__})}).mount('#app');`,server:`import{createSSRApp,h}from'vue';import{renderToString}from'@vue/server-renderer';import C from'__SOURCE__';export const render=p=>renderToString(createSSRApp({render:()=>h(C,p,{default:()=>__CHILD__})}));`},
 svelte:{client:`import{hydrate}from'svelte';import C from'__SOURCE__';const p=__PROPS__;hydrate(C,{target:document.querySelector('#app'),props:p});`,server:`import{render as renderComponent}from'svelte/server';import C from'__SOURCE__';export const render=p=>renderComponent(C,{props:p}).body;`},
 solid:{client:`import{hydrate}from'solid-js/web';import C from'__SOURCE__';const p=__PROPS__;hydrate(()=><C {...p}/>,document.querySelector('#app'));`,server:`import{renderToString}from'solid-js/web';import C from'__SOURCE__';export const render=p=>renderToString(()=><C {...p}/>);`}
};
const props=(f,c,server=false)=>{if(c==='Select')return `{label:'Plan',value:'Beta',options:['Alpha','Beta','Gamma'],onChange:${server?'()=>{}':`v=>{document.body.dataset.changed=v}`}}`;const child=f==='react'||f==='solid'?`,children:'Dialog body'`:'';return `{title:'Settings',open:true,onClose:${server?'()=>{}':`()=>{document.body.dataset.closed='yes'}`}${child}}`;};
const receipts={schemaVersion:2,candidate:'mitosis',runId,revisions,generatedFilesEdited:false,statusVocabulary:['passed','failed','not-run','blocked'],targets:{}};
for(const framework of frameworks)for(const component of components){
 const key=`${component}.${framework}`, dir=path.join(root,'.hard',key);fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
 const generated=source(framework,component), rel=path.relative(dir,generated).replaceAll(path.sep,'/');
 let client=adapters[framework].client.replace('__SOURCE__',rel).replace('__PROPS__',props(framework,component)).replace('__CHILD__',`'Dialog body'`);
 let serverCode=adapters[framework].server.replace('__SOURCE__',rel).replace('__CHILD__',`'Dialog body'`);
 fs.writeFileSync(path.join(dir,'client.'+(framework==='vue'||framework==='svelte'?'js':'jsx')),client);fs.writeFileSync(path.join(dir,'server.'+(framework==='vue'||framework==='svelte'?'js':'jsx')),serverCode);
 const r={component,framework,runId,revisions,generatedSource:path.relative(repo,generated),execution:{kind:'system-chrome-cdp',chrome},gates:Object.fromEntries(['build','client','ssr','hydration','nodePreservation','console','network','domAria','behavior','focus','styles','package','types'].map(x=>[x,'not-run'])),diagnostics:[],adaptation:{files:[path.relative(repo,path.join(dir,'client.'+(framework==='vue'||framework==='svelte'?'js':'jsx'))),path.relative(repo,path.join(dir,'server.'+(framework==='vue'||framework==='svelte'?'js':'jsx')))],loc:lineCount(path.join(dir,'client.'+(framework==='vue'||framework==='svelte'?'js':'jsx')))+lineCount(path.join(dir,'server.'+(framework==='vue'||framework==='svelte'?'js':'jsx'))),nativeWrapperLoc:0,generatedLoc:lineCount(generated)}};
 let browser,server;
 try{
  const out=path.join(dir,'dist');await build({root:dir,configFile:false,plugins:plugins[framework],build:{outDir:out,emptyOutDir:true,rollupOptions:{input:path.join(dir,'client.'+(framework==='vue'||framework==='svelte'?'js':'jsx')),output:{entryFileNames:'client.js'}}},logLevel:'silent'});r.gates.build='passed';
  const ssrOut=path.join(dir,'ssr');await build({root:dir,configFile:false,plugins:plugins[framework],build:{ssr:path.join(dir,'server.'+(framework==='vue'||framework==='svelte'?'js':'jsx')),outDir:ssrOut,emptyOutDir:true},logLevel:'silent'});
  const serverBundle=['server.mjs','server.js'].map(x=>path.join(ssrOut,x)).find(fs.existsSync);const mod=await import(pathToFileURL(serverBundle)+'?'+Date.now());const html=await mod.render(eval(`(${props(framework,component,true)})`));r.ssrHtml=html;r.gates.ssr=html?'passed':'failed';
  const pageHtml=`<!doctype html><div id=app>${html}</div><script>document.querySelector('#app').firstElementChild?.setAttribute('data-preserved','yes')</script><script type=module src=/client.js></script>`;
  server=http.createServer((q,s)=>{if(q.url==='/client.js'){s.setHeader('content-type','text/javascript');s.end(fs.readFileSync(path.join(out,'client.js')))}else if(q.url?.startsWith('/assets/')){const f=path.join(out,q.url);fs.existsSync(f)?s.end(fs.readFileSync(f)):(s.statusCode=404,s.end())}else{s.setHeader('content-type','text/html');s.end(pageHtml)}});await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
  browser=await chromium.launch({headless:true,executablePath:chrome});const page=await browser.newPage(),logs=[],failures=[];page.on('console',m=>logs.push({type:m.type(),text:m.text()}));page.on('pageerror',e=>logs.push({type:'pageerror',text:e.message}));page.on('requestfailed',q=>failures.push(q.url()));await page.goto(`http://127.0.0.1:${server.address().port}`,{waitUntil:'networkidle'});
  r.gates.client='passed';r.gates.console=logs.some(x=>x.type==='error'||x.type==='pageerror')?'failed':'passed';r.gates.network=failures.length?'failed':'passed';r.gates.hydration=r.gates.console;r.gates.nodePreservation=await page.locator('#app>*').getAttribute('data-preserved')==='yes'?'passed':'failed';
  if(component==='Select'){const select=page.locator('select');r.dom={role:await select.getAttribute('role'),ariaExpanded:await select.getAttribute('aria-expanded'),value:await select.inputValue(),optionCount:await page.locator('option').count()};r.gates.domAria=r.dom.role==='listbox'?'passed':'failed';await select.selectOption('Gamma');const callback=await page.locator('body').getAttribute('data-changed');await select.focus();await select.press('ArrowUp');await select.press('Enter');await select.press('Escape');r.behavior={controlledInitial:r.dom.value==='Beta',changeCallback:callback==='Gamma',keyboardValue:await select.inputValue()};r.gates.behavior=r.behavior.controlledInitial&&r.behavior.changeCallback?'passed':'failed';r.gates.focus=await select.evaluate(e=>e===document.activeElement)?'passed':'failed';r.diagnostics.push('Generated Select is a native select, not the required listbox/ARIA composite; no explicit uncontrolled default contract is exposed.');}
  else{const dialog=page.locator('[role=dialog]');r.dom={count:await dialog.count(),ariaModal:await dialog.getAttribute('aria-modal'),ariaLabel:await dialog.getAttribute('aria-label'),parent:await dialog.evaluate(e=>e.parentElement?.id||e.parentElement?.tagName)};r.gates.domAria=r.dom.count===1&&r.dom.ariaModal==='true'&&r.dom.ariaLabel==='Settings'?'passed':'failed';const before=await dialog.isVisible();await page.keyboard.press('Escape');const escapeClosed=await page.locator('body').getAttribute('data-closed');await page.mouse.click(1,1);const outsideClosed=await page.locator('body').getAttribute('data-closed');await page.locator('button').click();const buttonClosed=await page.locator('body').getAttribute('data-closed');r.behavior={initialOpen:before,escapeClose:escapeClosed==='yes',outsideClose:outsideClosed==='yes',buttonClose:buttonClosed==='yes',portalPlacement:r.dom.parent==='BODY'};r.gates.behavior=before&&r.behavior.escapeClose&&r.behavior.outsideClose&&r.behavior.buttonClose?'passed':'failed';r.gates.focus=(await page.evaluate(()=>document.activeElement?.tagName))==='BUTTON'?'passed':'failed';r.diagnostics.push('Generated Dialog is inline, not portalled/native; it lacks Escape/outside handling, initial-focus and focus-restoration management.');}
  r.gates.styles='blocked';r.gates.package='blocked';r.gates.types='failed';r.console=logs;r.networkFailures=failures;
 }catch(error){r.diagnostics.push(String(error?.stack||error));for(const k in r.gates)if(r.gates[k]==='not-run')r.gates[k]='blocked';}
 finally{if(browser)await browser.close();if(server)await new Promise(ok=>server.close(ok));}
 r.status=Object.values(r.gates).every(x=>x==='passed')?'passed':Object.values(r.gates).includes('failed')?'failed':'blocked';receipts.targets[key]=r;
}
fs.mkdirSync(path.join(root,'receipts'),{recursive:true});fs.writeFileSync(path.join(root,'receipts','hard-components.json'),JSON.stringify(receipts,null,2)+'\n');console.log(JSON.stringify(Object.fromEntries(Object.entries(receipts.targets).map(([k,v])=>[k,{status:v.status,gates:v.gates}])),null,2));
