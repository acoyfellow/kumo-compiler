import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {catalog} from './catalog.js';
import type {ComponentIR,Node} from './schema.js';
const hash=(value:string)=>createHash('sha256').update(value).digest('hex');
const text=(value:string)=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const attr=(value:unknown)=>text(String(value)).replaceAll('"','&quot;');
const htmlAttrs=(values:Record<string,string|number|boolean>={})=>Object.entries(values).filter(([,v])=>v!==false).map(([k,v])=>v===true?` ${k}`:` ${k}="${attr(v)}"`).join('');
const html=(node:Node):string=>node.kind==='text'?text(node.value):`<${node.tag}${htmlAttrs(node.attrs)}>${(node.children??[]).map(html).join('')}</${node.tag}>`;
const label=(node:Node)=>node.kind==='element'&&node.children?.[0]?.kind==='text'?node.children[0].value:'';
function template(node:Node,ir:ComponentIR):string {
 if(node.kind==='text')return text(node.value);
 const a=node.attrs??{},b=ir.behavior;let extra='',before='',after='',body=(node.children??[]).map(x=>template(x,ir)).join('');
 if(b?.kind==='sensitive-toggle'){if(a.id===b.inputId)extra+=' type={revealed?"text":"password"}';if(String(a.class??'').split(' ').includes(b.buttonClass)){extra+=' aria-pressed={revealed} onclick={()=>revealed=!revealed}';body='{revealed?"Hide":"Show"}';}}
 if(b?.kind==='clipboard-copy'&&String(a.class??'').split(' ').includes(b.buttonClass))extra+=' onclick={copyText}';
 if(b?.kind==='clipboard-copy'&&String(a.class??'').split(' ').includes(b.statusClass))body='{status}';
 if(b?.kind==='native-check'&&node.tag==='input')extra+=` bind:checked={checked[${JSON.stringify(String(a.id))}]}`;
 if(b?.kind==='roving'&&a.role===b.itemRole){const l=label(node);extra+=` tabindex={active===${JSON.stringify(l)}?0:-1} onclick={()=>activate(${JSON.stringify(l)})} onkeydown={(event)=>navigate(event,${JSON.stringify(l)})}`;if(b.itemRole==='tab')extra+=` aria-selected={active===${JSON.stringify(l)}}`;}
 if(b?.kind==='roving'&&a.role==='tabpanel')body='{active} content';
 if(b?.kind==='current-link'&&node.tag==='a'){const l=label(node);extra+=` aria-current={current===${JSON.stringify(l)}?${JSON.stringify(b.current)}:undefined} onclick={()=>current=${JSON.stringify(l)}}`;}
 if(b?.kind==='selection'){
  const l=label(node),cls=String(a.class??'');
  if(b.mode==='radio'&&node.tag==='input')extra+=' bind:group={value}';
  if(b.mode==='autocomplete'){if(a.id==='search')extra+=' bind:value={query} aria-expanded={open} onfocus={()=>open=true} onkeydown={key}';if(a.role==='listbox'){before='{#if open}';after='{/if}'}if(a.role==='option'){before=`{#if matches(${JSON.stringify(l)})}`;after='{/if}';extra+=` onclick={()=>choose(${JSON.stringify(l)})}`;}}
  if(b.mode==='combobox'||b.mode==='menu'){if(cls.includes(b.mode==='menu'?'menu-button':'combo'))extra+=' aria-expanded={open} onclick={()=>open=!open} onkeydown={key}';if(a.role==='listbox'||a.role==='menu'){before='{#if open}';after='{/if}'}if(a.role==='option'||a.role==='menuitem')extra+=` onclick={()=>choose(${JSON.stringify(l)})}`;}
  if(b.mode==='command'){if(cls==='command')extra+=' onclick={()=>open=true}';if(a.role==='dialog'){before='{#if open}';after='{/if}';extra+=' onkeydown={key}'}if(node.tag==='input')extra+=' bind:value={query}';if(a.role==='option'){before=`{#if matches(${JSON.stringify(l)})}`;after='{/if}';}}
  if(b.mode==='date'&&node.tag==='input')extra+=' bind:value';if(b.mode==='date-range'&&node.tag==='input')extra+=cls==='start'?' bind:value={start}':' bind:value={end}';
  if(b.mode==='toast'&&cls==='toast-button')extra+=' onclick={()=>message="Changes saved"}';if(b.mode==='toast'&&node.tag==='output')body='{message}';
  if(b.mode==='pagination'&&cls==='page'){extra+=` aria-current={page===${l}?"page":undefined} onclick={()=>page=${l}}`;}
 }
 if(b?.kind==='select'){if(a.role==='combobox')extra+=' aria-expanded={open} onclick={()=>open=!open} onkeydown={key}';if(a.role==='listbox'){before='{#if open}';after='{/if}'}if(a.role==='option'){const l=label(node);extra+=` aria-selected={value===${JSON.stringify(l)}} onclick={()=>choose(${JSON.stringify(l)})}`;}}
 if(b?.kind==='button'&&node.tag==='button')extra+=' onclick={()=>count++}';
 if(b?.kind==='dialog'&&node.tag==='dialog')extra+=' oncancel={cancel}';
 if(b?.kind==='popover'&&a['aria-haspopup']==='dialog')extra+=' aria-expanded={open} onclick={()=>open=!open}';if(b?.kind==='popover'&&a.role==='dialog'){before='{#if open}';after='{/if}'}
 const rendered={...a};for(const key of ['type','checked','tabindex','aria-selected','aria-current','aria-expanded','aria-pressed'])if(extra.includes(` ${key}=`)||(key==='checked'&&extra.includes('bind:checked'))||(key==='type'&&extra.includes(' type={')))delete rendered[key];if(extra.includes('bind:value'))delete rendered.value;
 const opening=`<${node.tag}${htmlAttrs(rendered)}${extra}>`;if(['input','img','br','hr','meta','link'].includes(node.tag))return `${before}${opening}${after}`;
 return `${before}${opening}${body}</${node.tag}>${after}`;
}
function script(ir:ComponentIR):string {const b=ir.behavior;if(!b)return '';
 let code='';
 if(b.kind==='sensitive-toggle')code='let revealed=false;';
 if(b.kind==='clipboard-copy')code=`let status='';async function copyText(){await navigator.clipboard.writeText('npm i kumo');status=${JSON.stringify(b.message)}}`;
 if(b.kind==='native-check')code=`let checked=$state(${JSON.stringify(Object.fromEntries(b.inputIds.map(id=>[id,id==='updates'||id==='notifications'])))});`;
 if(b.kind==='roving')code=`const labels=${JSON.stringify(b.labels)};let active=$state(labels[0]);function activate(x){active=x}function navigate(e,x){let i=labels.indexOf(x);if(e.key==='ArrowRight')i=(i+1)%labels.length;else if(e.key==='ArrowLeft')i=(i-1+labels.length)%labels.length;else if(e.key==='Home')i=0;else if(e.key==='End')i=labels.length-1;else if(${b.selection==='activation'}&&(e.key==='Enter'||e.key===' ')){activate(x);return}else return;e.preventDefault();const group=e.currentTarget.parentElement;active=labels[i];queueMicrotask(()=>group?.querySelectorAll('[role=${b.itemRole}]')[i]?.focus())}`;
 if(b.kind==='current-link')code=`let current=$state(${JSON.stringify(b.labels[0])});`;
 if(b.kind==='selection'){const init=JSON.stringify(b.initial??'');code=`let value=$state(${init}),query=$state(''),open=$state(false),message=$state(${b.mode==='toast'?init:"'Ready'"}),page=$state(${b.mode==='pagination'?init:'1'});let range=${b.mode==='date-range'?init:"['','']"},start=$state(range[0]),end=$state(range[1]);const matches=x=>x.toLowerCase().includes(query.toLowerCase());function choose(x){value=x;query=x;open=false}function key(e){if(e.key==='Escape')open=false;else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();open=true}}`;}
 if(b.kind==='select')code=`let open=$state(false),value=$state('');function choose(x){value=x;open=false}function key(e){if(e.key==='Escape')open=false;else if(['ArrowDown','ArrowUp','Enter',' '].includes(e.key)){e.preventDefault();open=true}}`;
 if(b.kind==='button')code='let count=$state(0);';if(b.kind==='dialog')code='function cancel(event){event.preventDefault()}';if(b.kind==='popover')code='let open=$state(true);';
 return `<script>\n${code}\n</script>\n`;
}
const emitter=await readFile('src/kumo/svelte-compiler.ts','utf8'),source=await readFile('src/kumo/catalog.ts','utf8');
for(const ir of catalog){if(!ir.root)continue;const dir=`runtime/${ir.id}/svelte`;await mkdir(`${dir}/src`,{recursive:true});const cssPath=ir.family==='form'?'public/form.css':ir.family==='native-control'?'public/native-control.css':ir.family==='navigation'?'public/navigation.css':ir.family==='selection-command-date'?'public/selection-command-date.css':ir.id==='button'?'public/button.css':ir.id==='dialog'?'public/dialog.css':ir.id==='popover'?'public/popover.css':'public/styles.css';const css=await readFile(cssPath,'utf8');const outputs:Record<string,string>={'src/App.svelte':script(ir)+template(ir.root,ir)+'\n','src/main.js':`import './style.css';\nimport {hydrate} from 'svelte';\nimport App from './App.svelte';\nhydrate(App,{target:document.getElementById('app')});\n`,'src/ssr-entry.js':`import {render as renderSvelte} from 'svelte/server';\nimport App from './App.svelte';\nexport const render=()=>renderSvelte(App).body;\n`,'src/runtime-entry.js':`export {default} from './App.svelte';\n`,'src/style.css':css,'vite.config.mjs':`import {svelte} from '@sveltejs/vite-plugin-svelte';\nimport {defineConfig} from 'vite';\nexport default defineConfig({base:'./',plugins:[svelte()],build:{outDir:'public-runtime',emptyOutDir:true,rollupOptions:{output:{entryFileNames:'assets/svelte-${ir.id}.js'}}}});\n`,'index.html':`<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><title>${ir.name} · svelte</title></head><body><div id="app">${html(ir.root)}</div><script type="module" src="/src/main.js"></script></body></html>\n`};for(const [file,body] of Object.entries(outputs))await writeFile(`${dir}/${file}`,body);const provenance={schemaVersion:ir.schemaVersion,component:ir.id,framework:'svelte',sourceHash:hash(source),irHash:hash(JSON.stringify(ir)),emitterHash:hash(emitter),outputs:Object.fromEntries(Object.entries(outputs).map(([k,v])=>[k,hash(v)]))};await writeFile(`${dir}/provenance.json`,JSON.stringify(provenance,null,2)+'\n');}
console.log(`emitted ${catalog.length} Svelte components from kumo.ir/v1`);
