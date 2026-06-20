import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';
import { build } from 'vite';
import vue from '@vitejs/plugin-vue';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import solid from 'vite-plugin-solid';
import { chromium } from 'playwright';

const root = path.resolve(import.meta.dirname, '..');
const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const configs = {
  react: { plugin: [], main: `import React from 'react'; import {createRoot} from 'react-dom/client'; import Button from '../../generated/react/Button.tsx'; createRoot(document.querySelector('#app')).render(React.createElement(Button,{onClick:()=>document.body.dataset.clicked='yes'},'Button'));` },
  vue: { plugin: [vue()], main: `import {createApp,h} from 'vue'; import Button from '../../generated/vue/Button.vue'; createApp({render:()=>h(Button,{onClick:()=>document.body.dataset.clicked='yes'},{default:()=> 'Button'})}).mount('#app');` },
  svelte: { plugin: [svelte()], main: `import {mount} from 'svelte'; import Button from '../../generated/svelte/Button.svelte'; mount(Button,{target:document.querySelector('#app'),props:{children:()=>{},onClick:()=>document.body.dataset.clicked='yes'}});` },
  solid: { plugin: [solid()], main: `import {render} from 'solid-js/web'; import Button from '../../generated/solid/Button.tsx'; render(()=> <Button onClick={()=>document.body.dataset.clicked='yes'}>Button</Button>,document.querySelector('#app'));` },
};
const receipt = {};
for (const [framework, config] of Object.entries(configs)) {
  const app = path.join(root, '.browser', framework); fs.mkdirSync(app,{recursive:true});
  fs.writeFileSync(path.join(app,'index.html'), '<div id="app"></div><script type="module" src="/main.jsx"></script>');
  fs.writeFileSync(path.join(app,'main.jsx'), config.main);
  const dist = path.join(app,'dist');
  try {
    await build({root:app,configFile:false,plugins:config.plugin,build:{outDir:dist,emptyOutDir:true},logLevel:'silent'});
    const server=createServer((request,response)=>{if(request.url==='/favicon.ico'){response.statusCode=204;response.end();return}const requested=request.url==='/'?'index.html':request.url.slice(1).split('?')[0];const file=path.join(dist,requested);if(!fs.existsSync(file)){if(requested==='favicon.ico'){response.statusCode=204;response.end();return}response.statusCode=404;response.end('not found');return}response.setHeader('content-type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');response.end(fs.readFileSync(file));});
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve)); const port=server.address().port;
    const browser=await chromium.launch({headless:true,executablePath:chrome}); const page=await browser.newPage(); const errors=[]; page.on('console',message=>{if(message.type()==='error')errors.push(message.text())}); page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`http://127.0.0.1:${port}`,{waitUntil:'networkidle'}); const button=page.locator('button'); const count=await button.count(); if(count)await button.click(); const clicked=await page.locator('body').getAttribute('data-clicked');
    await browser.close(); await new Promise(resolve=>server.close(resolve));
    receipt[framework]={bundle:'passed',browser:count===1&&clicked==='yes'&&errors.length===0?'passed':'failed',buttonCount:count,clickObserved:clicked==='yes',consoleErrors:errors};
    if(receipt[framework].browser!=='passed')process.exitCode=1;
  } catch(error) { receipt[framework]={bundle:'failed',browser:'not-run',error:error.stack??String(error)}; process.exitCode=1; }
}
fs.mkdirSync(path.join(root,'receipts'),{recursive:true}); fs.writeFileSync(path.join(root,'receipts','button-browser.json'),JSON.stringify(receipt,null,2)+'\n'); console.log(JSON.stringify(receipt,null,2));
