import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {catalog} from './catalog.js';
import type {ComponentIR,Node,Provenance} from './schema.js';
const hash=(x:string)=>createHash('sha256').update(x).digest('hex');
const escapeText=(x:string)=>x.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const escapeAttr=(x:string)=>escapeText(x).replaceAll('"','&quot;');
const attrs=(values:Record<string,string|number|boolean>={})=>Object.entries(values).map(([k,v])=>v===true?` ${k}`:` ${k}="${escapeAttr(String(v))}"`).join('');
function emit(n:Node):string {if(n.kind==='text')return escapeText(n.value);return `<${n.tag}${attrs(n.attrs)}>${(n.children??[]).map(emit).join('')}</${n.tag}>`;}
function vueTemplate(n:Node,ir:ComponentIR):string {if(n.kind==='text')return escapeText(n.value);let extra='';if(ir.behavior?.kind==='sensitive-toggle'){if(n.attrs?.id===ir.behavior.inputId)extra=' :type="revealed ? \'text\' : \'password\'"';if(String(n.attrs?.class??'').split(' ').includes(ir.behavior.buttonClass)){extra=' :aria-pressed="revealed" @click="revealed = !revealed"';return `<${n.tag}${attrs(n.attrs)}${extra}>{{revealed ? 'Hide' : 'Show'}}</${n.tag}>`;}}if(ir.behavior?.kind==='clipboard-copy'&&String(n.attrs?.class??'').split(' ').includes(ir.behavior.buttonClass))extra=' @click="copyText" @keydown.enter.prevent="copyText"';return `<${n.tag}${attrs(n.attrs)}${extra}>${(n.children??[]).map(x=>vueTemplate(x,ir)).join('')}</${n.tag}>`;}
function script(ir:ComponentIR):string {if(ir.behavior?.kind==='sensitive-toggle')return `<script setup lang="ts">\nimport {ref} from 'vue';\nconst revealed=ref(false);\n</script>\n`;if(ir.behavior?.kind==='clipboard-copy')return `<script setup lang="ts">\nimport {ref} from 'vue';\nconst status=ref('');\nasync function copyText(){const value='npm i kumo';try{await navigator.clipboard.writeText(value)}catch{const input=document.createElement('textarea');input.value=value;input.hidden=true;document.body.append(input);input.select();document.execCommand('copy');input.remove()}status.value='${ir.behavior.message}'}\n</script>\n`;return ''}
const emitterSource=await readFile('src/kumo/compiler.ts','utf8');
const catalogSource=await readFile('src/kumo/catalog.ts','utf8');
for(const ir of catalog.filter(x=>x.root)){
 const dir=`runtime/${ir.id}/vue`,ssr=emit(ir.root!),template=vueTemplate(ir.root!,ir).replace('<p class="status" role="status"></p>','<p class="status" role="status">{{status}}</p>'); await mkdir(`${dir}/src`,{recursive:true});
 const css=await readFile(ir.family==='form'?'public/form.css':'public/styles.css','utf8');
 const outputs:Record<string,string>={
  'src/App.vue':`${script(ir)}<template>\n${template}\n</template>\n`,
  'src/runtime-entry.ts':`import App from './App.vue';\nexport default App;\n`,
  'src/ssr-entry.ts':`import {createSSRApp} from 'vue';\nimport {renderToString} from 'vue/server-renderer';\nimport App from './App.vue';\nexport const render=()=>renderToString(createSSRApp(App));\n`,
  'src/main.ts':`import './style.css';\nimport {createSSRApp} from 'vue';\nimport App from './App.vue';\ncreateSSRApp(App).mount('#app');\n`,
  'src/style.css':css,
  'vite.config.mjs':`import vue from '@vitejs/plugin-vue';\nimport {defineConfig} from 'vite';\nexport default defineConfig({base:'./',plugins:[vue()],build:{outDir:'public-runtime',emptyOutDir:true,rollupOptions:{output:{entryFileNames:'assets/vue-${ir.id}.js'}}}});\n`,
  'index.html':`<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><title>${ir.name} · vue</title></head><body><div id="app">${ssr}</div><script type="module" src="/src/main.ts"></script></body></html>\n`
 };
 for(const [file,body] of Object.entries(outputs))await writeFile(`${dir}/${file}`,body);
 const provenance:Provenance={schemaVersion:ir.schemaVersion,component:ir.id,framework:'vue',sourceHash:hash(catalogSource),irHash:hash(JSON.stringify(ir)),emitterHash:hash(emitterSource),outputs:Object.fromEntries(Object.entries(outputs).map(([k,v])=>[k,hash(v)]))};
 await writeFile(`${dir}/provenance.json`,JSON.stringify(provenance,null,2)+'\n');
}
await mkdir('generated',{recursive:true});
await writeFile('generated/catalog.ir.json',JSON.stringify({schemaVersion:'kumo.ir/v1',components:catalog},null,2)+'\n');
console.log(`emitted ${catalog.filter(x=>x.root).length} Vue candidates from ${catalog.length} catalog records`);
