import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {catalog} from './catalog.js';
import type {ComponentIR,Node,Provenance} from './schema.js';

const hash=(value:string)=>createHash('sha256').update(value).digest('hex');
const text=(value:string)=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const jsxAttr=(key:string,value:string|number|boolean)=>value===true?key:value===false?`${key}={false}`:`${key}=${JSON.stringify(value)}`;
const jsx=(node:Node):string=>node.kind==='text'?text(node.value):`<${node.tag}${Object.entries(node.attrs??{}).map(([k,v])=>` ${jsxAttr(k==='class'?'class':k,v)}`).join('')}>${(node.children??[]).map(jsx).join('')}</${node.tag}>`;
const htmlAttr=(key:string,value:string|number|boolean)=>value===true?` ${key}`:value===false?'':` ${key}="${text(String(value)).replaceAll('"','&quot;')}"`;
const html=(node:Node):string=>node.kind==='text'?text(node.value):`<${node.tag}${Object.entries(node.attrs??{}).map(([k,v])=>htmlAttr(k,v)).join('')}>${(node.children??[]).map(html).join('')}</${node.tag}>`;

function app(ir:ComponentIR):string {
 if(ir.id==='badge')return `export default function Badge(){return (${jsx(ir.root!)});}\n`;
 return `import {For,Show,createSignal} from 'solid-js';
const options=['Apple','Banana','Cherry'];
export default function Select(){const [open,setOpen]=createSignal(false),[active,setActive]=createSignal(0),[value,setValue]=createSignal('');const choose=(i:number)=>{setActive(i);setValue(options[i]!);setOpen(false)};const key=(event:KeyboardEvent)=>{let i=active();if(event.key==='Escape'){setOpen(false);return}if(event.key==='Home')i=0;else if(event.key==='End')i=options.length-1;else if(event.key==='ArrowDown')i=Math.min(options.length-1,i+1);else if(event.key==='ArrowUp')i=Math.max(0,i-1);else if((event.key==='Enter'||event.key===' ')&&open()){event.preventDefault();choose(i);return}else return;event.preventDefault();setActive(i);setOpen(true)};return <main class="form-shell"><h1>Select</h1><section class="matrix"><button role="combobox" aria-haspopup="listbox" aria-controls="select-options" aria-expanded={open()} aria-activedescendant={open()?\`select-option-\${active()}\`:undefined} onClick={()=>setOpen(x=>!x)} onKeyDown={key}>{value()||'Choose fruit'}</button><Show when={open()}><ul id="select-options" role="listbox"><For each={options}>{(option,i)=><li id={\`select-option-\${i()}\`} role="option" aria-selected={value()===option} classList={{active:active()===i()}} onPointerDown={event=>{event.preventDefault();choose(i())}}>{option}</li>}</For></ul></Show></section></main>}
`;
}
const emitter=await readFile('src/kumo/solid-compiler.ts','utf8'),source=await readFile('src/kumo/catalog.ts','utf8');
for(const ir of catalog.filter(x=>x.id==='select'||x.id==='badge')){const dir=`runtime/${ir.id}/solid`;await mkdir(`${dir}/src`,{recursive:true});const css=await readFile(ir.id==='badge'?'public/styles.css':'public/styles.css','utf8');const initial=html(ir.root!);const outputs:Record<string,string>={
 'src/App.tsx':app(ir),
 'src/client.tsx':`import './style.css';\nimport {hydrate} from 'solid-js/web';\nimport App from './App';\nhydrate(()=> <App/>,document.getElementById('app')!);\n`,
 'src/server.tsx':`import {generateHydrationScript,renderToString} from 'solid-js/web';\nimport App from './App';\nexport const render=()=>({html:renderToString(()=> <App/>),hydration:generateHydrationScript()});\n`,
 'src/runtime-entry.ts':`export {default} from './App';\n`,
 'src/style.css':css,
 'vite.config.mjs':`import solid from 'vite-plugin-solid';\nimport {defineConfig} from 'vite';\nexport default defineConfig({base:'./',plugins:[solid({ssr:true})],build:{outDir:'public-runtime',emptyOutDir:true,rollupOptions:{output:{entryFileNames:'assets/solid-${ir.id}.js'}}}});\n`,
 'index.html':`<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><title>${ir.name} · solid</title><!--HYDRATION--></head><body><!--APP--><div id="app">${initial}</div><!--/APP--><script type="module" src="/src/client.tsx"></script></body></html>\n`
 };for(const [file,body] of Object.entries(outputs))await writeFile(`${dir}/${file}`,body);const provenance:Provenance={schemaVersion:ir.schemaVersion,component:ir.id,framework:'solid',sourceHash:hash(source),irHash:hash(JSON.stringify(ir)),emitterHash:hash(emitter),outputs:Object.fromEntries(Object.entries(outputs).map(([k,v])=>[k,hash(v)]))};await writeFile(`${dir}/provenance.json`,JSON.stringify(provenance,null,2)+'\n');}
console.log('emitted 2 native Solid components from kumo.ir/v1');
