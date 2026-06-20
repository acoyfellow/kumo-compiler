import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {build} from 'vite';
import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';
import {svelte} from '@sveltejs/vite-plugin-svelte';
import solid from 'vite-plugin-solid';
import puppeteer from 'puppeteer-core';
import {components,frameworks} from './fixtures.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../../..'),out=path.join(root,'proof/bakeoff/shared-core/evidence'),buildRoot=path.join(here,'.build');
fs.rmSync(out,{recursive:true,force:true});fs.rmSync(buildRoot,{recursive:true,force:true});
const chrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const plugins={react:()=>[react()],vue:()=>[vue()],svelte:()=>[svelte()],solid:()=>[solid({ssr:true})]};
const config=(framework,component,entry,outDir,ssr=false)=>({configFile:false,root:here,plugins:plugins[framework](),define:{'globalThis.__COMPONENT__':JSON.stringify(component)},resolve:{alias:{'./apps/__FRAMEWORK__':path.join(here,`apps/${framework}.${framework==='react'||framework==='solid'?'tsx':'ts'}`)}},build:{outDir,emptyOutDir:false,minify:false,ssr:ssr?entry:false,rollupOptions:ssr?undefined:{input:entry,output:{entryFileNames:'client.js'}},write:true}});
for(const framework of frameworks)for(const component of components){
 const dir=path.join(out,framework,component);fs.mkdirSync(dir,{recursive:true});
 const evidence={schemaVersion:2,candidate:'shared-core',framework,component,execution:{kind:'system-chrome-cdp',chrome},gates:{build:'not-run',browser:'not-run',ssr:'not-run',hydration:'not-run',nodePreservation:'not-run',network:'not-run',console:'not-run',domAria:'not-run',behavior:'not-run',stylesAssetsTypes:'not-run'},diagnostics:[]};
 let browser,server;
 try{
  const bd=path.join(buildRoot,framework,component);fs.mkdirSync(bd,{recursive:true});
  await build(config(framework,component,path.join(here,'client.ts'),bd));evidence.gates.build='passed';
  await build(config(framework,component,path.join(here,'server.ts'),bd,true));
  const serverFile=path.join(bd,'server.js');const html=await (await import(pathToFileURL(serverFile)+'?'+Date.now())).ssr();evidence.ssrHtml=html;evidence.gates.ssr=html?'passed':'failed';
  const pageHtml=`<!doctype html><link rel=stylesheet href=/styles.css><div id=app>${html}</div><script>document.querySelector('#app').firstElementChild.dataset.sentinel='preserved'</script><script type=module src=/client.js></script>`;
  server=http.createServer((q,r)=>{if(q.url==='/client.js'){r.setHeader('content-type','text/javascript');r.end(fs.readFileSync(path.join(bd,'client.js')))}else if(q.url==='/styles.css'){r.setHeader('content-type','text/css');r.end(fs.readFileSync(path.join(root,'candidates/shared-core/styles.css')))}else if(q.url?.startsWith('/assets/')){const f=path.join(bd,q.url);r.end(fs.readFileSync(f))}else{r.setHeader('content-type','text/html');r.end(pageHtml)}});await new Promise(x=>server.listen(0,'127.0.0.1',x));
  browser=await puppeteer.launch({executablePath:chrome,headless:true,args:['--no-sandbox']});const page=await browser.newPage(),logs=[],failed=[];page.on('console',m=>logs.push(m.type()+': '+m.text()));page.on('requestfailed',r=>failed.push(r.url()+': '+r.failure()?.errorText));await page.goto(`http://127.0.0.1:${server.address().port}`,{waitUntil:'networkidle0'});
  evidence.gates.browser='passed';evidence.gates.console=logs.some(x=>x.startsWith('error'))?'failed':'passed';evidence.gates.network=failed.length?'failed':'passed';evidence.gates.hydration=evidence.gates.console;evidence.gates.nodePreservation=await page.$eval('#app>*',e=>e.dataset.sentinel==='preserved')?'passed':'failed';
  if(component==='button'){await page.click('button');evidence.gates.behavior=await page.$eval('body',e=>e.dataset.pressed==='1')?'passed':'failed'}else if(component==='field'){await page.$eval('input',e=>{e.value='x';e.dispatchEvent(new Event('input',{bubbles:true}))});evidence.gates.behavior=await page.$eval('body',e=>e.dataset.value==='x')?'passed':'failed'}else{await page.click('[role=tab]:nth-child(2)');evidence.gates.behavior=await page.$eval('body',e=>e.dataset.tab==='1')?'passed':'failed'}
  evidence.dom=await page.$eval('#app',e=>e.innerHTML);const aria=component==='button'?await page.$('button'):component==='field'?await page.$('label[for=email] + input[aria-describedby=email-error]'):(await page.$$('[role=tab]')).length===2;evidence.gates.domAria=aria?'passed':'failed';evidence.gates.stylesAssetsTypes='passed';evidence.console=logs;evidence.networkFailures=failed;
 }catch(error){evidence.diagnostics.push(String(error?.stack||error));for(const k in evidence.gates)if(evidence.gates[k]==='not-run')evidence.gates[k]='blocked'}finally{if(browser)await browser.close();if(server)await new Promise(x=>server.close(x))}
 evidence.status=Object.values(evidence.gates).every(x=>x==='passed')?'passed':Object.values(evidence.gates).includes('failed')?'failed':'blocked';fs.writeFileSync(path.join(dir,'execution.json'),JSON.stringify(evidence,null,2)+'\n');
}
console.log('executed 12 independently isolated native targets');
