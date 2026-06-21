import { mkdtemp, mkdir, readFile, rm, writeFile, cp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const root = resolve(import.meta.dirname, '../..');
const artifacts = resolve(root, 'library-artifacts');
const output = resolve(root, 'library-gallery');
const manifest = JSON.parse(await readFile(resolve(artifacts, 'manifest.json'), 'utf8'));
const command = (program, args, cwd, timeout = 120000) => new Promise((ok, no) => {
  const child = spawn(program, args, {cwd, stdio: 'inherit'});
  const timer = setTimeout(() => child.kill('SIGKILL'), timeout);
  child.once('error', error => { clearTimeout(timer); no(error); });
  child.once('exit', (code, signal) => { clearTimeout(timer); code === 0 ? ok() : no(new Error(`${program} ${args.join(' ')} failed (${signal || code})`)); });
});
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

const fixtures = {
  vue: `import { createApp, h, ref } from 'vue'; import { Button } from '@cloudflare/kumo-vue/button'; import { Field } from '@cloudflare/kumo-vue/field'; import '@cloudflare/kumo-vue/styles.css';
const App={setup(){const clicks=ref(0),value=ref('Package field');return()=>h('main',{},[h('section',{},[h('h2',{},'Button'),h(Button,{onClick:()=>clicks.value++},()=>\`Clicked \${clicks.value}\`),h(Button,{disabled:true},()=>\`Disabled\`)]),h('section',{},[h('h2',{},'Field'),h(Field,{id:'gallery-field',label:'Project name',description:'Rendered by the installed package.',error:'Example validation message.',required:true,modelValue:value.value,'onUpdate:modelValue':v=>value.value=v}),h('output',{'aria-live':'polite'},\`Model: \${value.value}\`)])])}}; createApp(App).mount('#app');`,
  svelte: `import { mount } from 'svelte'; import App from './App.svelte'; import '@cloudflare/kumo-svelte/styles.css'; mount(App,{target:document.getElementById('app')});`,
  solid: `import { render } from 'solid-js/web'; import { createSignal } from 'solid-js'; import { Button } from '@cloudflare/kumo-solid/button'; import { Field } from '@cloudflare/kumo-solid/field'; import '@cloudflare/kumo-solid/styles.css';
function App(){const [clicks,setClicks]=createSignal(0),[value,setValue]=createSignal('Package field');return <main><section><h2>Button</h2><Button onClick={()=>setClicks(x=>x+1)}>Clicked {clicks()}</Button><Button disabled>Disabled</Button></section><section><h2>Field</h2><Field id="gallery-field" label="Project name" description="Rendered by the installed package." error="Example validation message." required value={value()} onInput={e=>setValue(e.currentTarget.value)}/><output aria-live="polite">Model: {value()}</output></section></main>} render(()=><App/>,document.getElementById('app'));`
};
const svelteApp = `<script>import { Button } from '@cloudflare/kumo-svelte/button'; import { Field } from '@cloudflare/kumo-svelte/field'; let clicks=0; let value='Package field';</script><main><section><h2>Button</h2><Button onclick={()=>clicks++}>Clicked {clicks}</Button><Button disabled>Disabled</Button></section><section><h2>Field</h2><Field id="gallery-field" label="Project name" description="Rendered by the installed package." error="Example validation message." required bind:value/><output aria-live="polite">Model: {value}</output></section></main>`;
const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kumo package gallery</title><style>*{box-sizing:border-box}body{margin:0;padding:24px;background:#fff;color:#111827;font:16px system-ui}main{display:grid;gap:24px}section{padding:20px;border:1px solid #d8dde5;border-radius:10px}h2{margin:0 0 16px;font-size:18px}output{display:block;margin-top:12px;color:#4b5563}</style></head><body><div id="app"></div><script type="module" src="/src/main"></script></body></html>`;
for (const entry of manifest.packages) {
  const dir = await mkdtemp(resolve(tmpdir(), `kumo-gallery-${entry.framework}-`));
  try {
    await writeFile(resolve(dir, 'package.json'), JSON.stringify({type:'module',dependencies:{vite:'8.0.16',[entry.package]:`file:${resolve(artifacts, entry.friendlyName)}`,...entry.framework==='vue'?{vue:'3.5.38','@vitejs/plugin-vue':'6.0.7'}:entry.framework==='svelte'?{svelte:'5.56.3','@sveltejs/vite-plugin-svelte':'7.1.2'}:{'solid-js':'1.9.13','vite-plugin-solid':'2.11.12'}}}));
    const plugin = entry.framework === 'vue' ? `import vue from '@vitejs/plugin-vue'; export default {base:'/library-gallery/${entry.framework}/',plugins:[vue()]}` : entry.framework === 'svelte' ? `import {svelte} from '@sveltejs/vite-plugin-svelte'; export default {base:'/library-gallery/${entry.framework}/',plugins:[svelte()]}` : `import solid from 'vite-plugin-solid'; export default {base:'/library-gallery/${entry.framework}/',plugins:[solid()]}`;
    await writeFile(resolve(dir,'vite.config.js'), plugin); await writeFile(resolve(dir,'index.html'),html); await mkdir(resolve(dir,'src')); await writeFile(resolve(dir,'src/main.'+(entry.framework==='solid'?'jsx':'js')),fixtures[entry.framework]);
    if(entry.framework==='svelte') await writeFile(resolve(dir,'src/App.svelte'),svelteApp);
    await command('npm',['install','--ignore-scripts','--no-audit','--no-fund'],dir);
    await command('npx',['vite','build','--outDir',resolve(output,entry.framework),'--emptyOutDir'],dir);
  } finally { await rm(dir,{recursive:true,force:true}); }
}
await cp(resolve(artifacts,'manifest.json'),resolve(output,'manifest.json'));
console.log('Built package-installed Vue, Svelte, and Solid galleries');
