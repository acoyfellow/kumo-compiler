import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {catalog} from './catalog.js';
import type {ComponentIR,Node,Provenance} from './schema.js';
const hash=(x:string)=>createHash('sha256').update(x).digest('hex');
const escapeText=(x:string)=>x.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const escapeAttr=(x:string)=>escapeText(x).replaceAll('"','&quot;');
const attrs=(values:Record<string,string|number|boolean>={})=>Object.entries(values).filter(([,v])=>v!==false).map(([k,v])=>v===true?` ${k}`:` ${k}="${escapeAttr(String(v))}"`).join('');
function emit(n:Node):string {if(n.kind==='text')return escapeText(n.value);return `<${n.tag}${attrs(n.attrs)}>${(n.children??[]).map(emit).join('')}</${n.tag}>`;}
function vueTemplate(n:Node,ir:ComponentIR):string {if(n.kind==='text')return escapeText(n.value);let extra='';if(ir.behavior?.kind==='sensitive-toggle'){if(n.attrs?.id===ir.behavior.inputId)extra=' :type="revealed ? \'text\' : \'password\'"';if(String(n.attrs?.class??'').split(' ').includes(ir.behavior.buttonClass)){extra=' :aria-pressed="revealed" @click="revealed = !revealed"';return `<${n.tag}${attrs(n.attrs)}${extra}>{{revealed ? 'Hide' : 'Show'}}</${n.tag}>`;}}if(ir.behavior?.kind==='clipboard-copy'&&String(n.attrs?.class??'').split(' ').includes(ir.behavior.buttonClass))extra=' @click="copyText" @keydown.enter.prevent="copyText"';
if(ir.behavior?.kind==='native-check'&&n.tag==='input'){const id=String(n.attrs?.id);extra=` :checked="checked['${id}']" @change="setChecked('${id}', $event)"`;}
if(ir.behavior?.kind==='roving'&&n.attrs?.role===ir.behavior.itemRole){const label=(n.children?.[0]?.kind==='text'?n.children[0].value:'');extra=` :tabindex="active === '${label}' ? 0 : -1"${ir.behavior.itemRole==='tab'?` :aria-selected="active === '${label}'"`:''} @click="activate('${label}')" @keydown="navigate($event, '${label}')"`;}
if(ir.behavior?.kind==='current-link'&&n.tag==='a'){const label=(n.children?.[0]?.kind==='text'?n.children[0].value:'');extra=` :aria-current="current === '${label}' ? '${ir.behavior.current}' : undefined" @click="current = '${label}'"`;}
if(ir.behavior?.kind==='roving'&&n.attrs?.role==='tabpanel')return `<${n.tag}${attrs(n.attrs)}>{{active}} content</${n.tag}>`;
if(ir.behavior?.kind==='selection'){
 const mode=ir.behavior.mode,label=n.children?.[0]?.kind==='text'?n.children[0].value:'';
 if(mode==='radio'&&n.tag==='input')extra=' v-model="value"';
 if(mode==='autocomplete'){if(n.attrs?.id==='search')extra=' v-model="query" :aria-expanded="open" @focus="open=true" @keydown="key($event)"';if(n.attrs?.role==='listbox')extra=' v-show="open"';if(n.attrs?.role==='option')extra=` v-show="matches('${label}')" @click="choose('${label}')"`;}
 if(mode==='combobox'||mode==='menu'){if(String(n.attrs?.class??'').includes(mode==='menu'?'menu-button':'combo'))extra=' :aria-expanded="open" @click="open=!open" @keydown="key($event)"';if(n.attrs?.role==='listbox'||n.attrs?.role==='menu')extra=' v-show="open"';if(n.attrs?.role==='option'||n.attrs?.role==='menuitem')extra=` @click="choose('${label}')"`;}
 if(mode==='command'){if(String(n.attrs?.class??'')==='command')extra=' @click="open=true"';if(n.attrs?.role==='dialog')extra=' v-show="open" @keydown.esc="open=false"';if(n.tag==='input')extra=' v-model="query"';if(n.attrs?.role==='option')extra=` v-show="matches('${label}')"`;}
 if(mode==='date'&&n.tag==='input')extra=' v-model="value"';if(mode==='date-range'&&n.tag==='input')extra=String(n.attrs?.class)==='start'?' v-model="start"':' v-model="end"';
 if(mode==='toast'&&String(n.attrs?.class)==='toast-button')extra=' @click="message=\'Changes saved\'"';if(mode==='toast'&&n.tag==='output')return `<output${attrs(n.attrs)}>{{message}}</output>`;
 if(mode==='pagination'&&String(n.attrs?.class)==='page'){extra=` :aria-current="page === ${label} ? 'page' : undefined" @click="page=${label}"`;}
}
return `<${n.tag}${attrs(n.attrs)}${extra}>${(n.children??[]).map(x=>vueTemplate(x,ir)).join('')}</${n.tag}>`;}
function script(ir:ComponentIR):string {if(ir.behavior?.kind==='sensitive-toggle')return `<script setup lang="ts">\nimport {ref} from 'vue';\nconst revealed=ref(false);\n</script>\n`;if(ir.behavior?.kind==='clipboard-copy')return `<script setup lang="ts">\nimport {ref} from 'vue';\nconst status=ref('');\nasync function copyText(){const value='npm i kumo';try{await navigator.clipboard.writeText(value)}catch{const input=document.createElement('textarea');input.value=value;input.hidden=true;document.body.append(input);input.select();document.execCommand('copy');input.remove()}status.value='${ir.behavior.message}'}\n</script>\n`;
if(ir.behavior?.kind==='native-check'){const initial=Object.fromEntries(ir.behavior.inputIds.map(id=>[id,id==='updates'||id==='notifications']));return `<script setup lang="ts">\nimport {reactive} from 'vue';\nconst checked=reactive<Record<string,boolean>>(${JSON.stringify(initial)});\nfunction setChecked(id:string,event:Event){checked[id]=(event.currentTarget as HTMLInputElement).checked}\n</script>\n`;}
if(ir.behavior?.kind==='roving'){const labels=JSON.stringify(ir.behavior.labels),select=ir.behavior.selection==='activation';return `<script setup lang="ts">\nimport {nextTick,ref} from 'vue';\nconst labels=${labels};const active=ref(labels[0]);\nfunction activate(label:string){active.value=label}\nasync function navigate(event:KeyboardEvent,label:string){let index=labels.indexOf(label);if(event.key==='ArrowRight')index=(index+1)%labels.length;else if(event.key==='ArrowLeft')index=(index-1+labels.length)%labels.length;else if(event.key==='Home')index=0;else if(event.key==='End')index=labels.length-1;else if(${select}&&(event.key==='Enter'||event.key===' ')){activate(label);return}else return;event.preventDefault();active.value=labels[index];await nextTick();(event.currentTarget?.parentElement?.querySelectorAll('[role=${ir.behavior.itemRole}]')[index] as HTMLElement)?.focus()}\n</script>\n`;}
if(ir.behavior?.kind==='current-link')return `<script setup lang="ts">\nimport {ref} from 'vue';\nconst current=ref('${ir.behavior.labels[0]}');\n</script>\n`;
if(ir.behavior?.kind==='selection'){const b=ir.behavior,options=JSON.stringify(b.options??[]),initial=JSON.stringify(b.initial??'');return `<script setup lang="ts">\nimport {ref} from 'vue';\nconst options=${options};const value=ref(${initial});const query=ref('');const open=ref(false);const message=ref(${b.mode==='toast'?initial:"'Ready'"});const page=ref(${b.mode==='pagination'?initial:'1'});const range=${b.mode==='date-range'?JSON.stringify(b.initial):"['','']"};const start=ref(range[0]);const end=ref(range[1]);\nconst matches=(label:string)=>label.toLowerCase().includes(query.value.toLowerCase());function choose(label:string){value.value=label;query.value=label;open.value=false}function key(event:KeyboardEvent){if(event.key==='Escape')open.value=false;else if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();open.value=true}}\n</script>\n`;}return ''}
const emitterSource=await readFile('src/kumo/compiler.ts','utf8');
const catalogSource=await readFile('src/kumo/catalog.ts','utf8');
for(const ir of catalog.filter(x=>x.root)){
 const dir=`runtime/${ir.id}/vue`,ssr=emit(ir.root!),template=vueTemplate(ir.root!,ir).replace('<p class="status" role="status"></p>','<p class="status" role="status">{{status}}</p>'); await mkdir(`${dir}/src`,{recursive:true});
 const css=await readFile(ir.family==='form'?'public/form.css':ir.family==='native-control'?'public/native-control.css':ir.family==='navigation'?'public/navigation.css':ir.family==='selection-command-date'?'public/selection-command-date.css':'public/styles.css','utf8');
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
