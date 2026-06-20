import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {catalog} from './catalog.js';
import type {ComponentIR,Node,Provenance} from './schema.js';

const hash=(value:string)=>createHash('sha256').update(value).digest('hex');
const text=(value:string)=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const jsxAttr=(key:string,value:string|number|boolean)=>value===true?key:value===false?`${key}={false}`:typeof value==='number'?`${key}={${value}}`:`${key}=${JSON.stringify(value)}`;
const jsx=(node:Node):string=>node.kind==='text'?text(node.value):`<${node.tag}${Object.entries(node.attrs??{}).map(([k,v])=>` ${jsxAttr(k==='class'?'class':k,v)}`).join('')}>${(node.children??[]).map(jsx).join('')}</${node.tag}>`;
const htmlAttr=(key:string,value:string|number|boolean)=>value===true?` ${key}`:value===false?'':` ${key}="${text(String(value)).replaceAll('"','&quot;')}"`;
const html=(node:Node):string=>node.kind==='text'?text(node.value):`<${node.tag}${Object.entries(node.attrs??{}).map(([k,v])=>htmlAttr(k,v)).join('')}>${(node.children??[]).map(html).join('')}</${node.tag}>`;

function app(ir:ComponentIR):string {
 if(ir.family==='navigation'){
  if(ir.behavior?.kind==='roving')return `import {For,createSignal} from 'solid-js';
const labels=${JSON.stringify(ir.behavior.labels)} as const;
export default function ${ir.name}(){const [active,setActive]=createSignal(0);let items:HTMLButtonElement[]=[];const move=(event:KeyboardEvent,index:number)=>{let next=index;if(event.key==='ArrowRight')next=(index+1)%labels.length;else if(event.key==='ArrowLeft')next=(index-1+labels.length)%labels.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=labels.length-1;else return;event.preventDefault();setActive(next);items[next]?.focus()};return <main class="nav-shell"><h1>${ir.name}</h1><div class="${ir.id==='tabs'?'tabs':'menubar'}" role="${ir.behavior.groupRole}" aria-label="${ir.id==='tabs'?'Account':'Application'}"><For each={labels}>{(label,index)=><button ref={el=>items[index()]=el} role="${ir.behavior.itemRole}" tabindex={active()===index()?0:-1}${ir.id==='tabs'?' aria-selected={active()===index()} aria-controls={`panel-${index()}`} id={`tab-${index()}`}':''} onClick={()=>{setActive(index());items[index()]?.focus()}} onKeyDown={event=>move(event,index())}>{label}</button>}</For></div>${ir.id==='tabs'?'<div id={`panel-${active()}`} class="panel" role="tabpanel" aria-labelledby={`tab-${active()}`} tabindex="0">{labels[active()]} content</div>':''}</main>}
`;
  const navLabel=ir.id==='sidebar'?'Workspace':ir.id==='breadcrumbs'?'Breadcrumb':'On this page';
  if(ir.behavior?.kind==='current-link')return `import {For,createSignal} from 'solid-js';
const links=${JSON.stringify(ir.behavior.labels)} as const;
export default function ${ir.name}(){const [current,setCurrent]=createSignal(0);return <main class="nav-shell"><h1>${ir.name}</h1><nav class="${ir.id==='sidebar'?'sidebar':'toc'}" aria-label="${navLabel}"><For each={links}>{(label,index)=><a href={'#'+label.toLowerCase().replaceAll(' ','-')} aria-current={current()===index()?'${ir.behavior.current}':undefined} onClick={()=>setCurrent(index())}>{label}</a>}</For></nav></main>}
`;
  return `export default function Breadcrumbs(){return <main class="nav-shell"><h1>Breadcrumbs</h1><nav aria-label="Breadcrumb"><ol class="crumbs"><li><a href="#home">Home</a></li><li><a href="#docs">Docs</a></li><li aria-current="page">Navigation</li></ol></nav></main>}
`;
 }
 if(ir.family==='form'){
  const name=ir.name;
  if(ir.id==='sensitive-input')return `import {createSignal} from 'solid-js';
export default function ${name}(){const [value,setValue]=createSignal('secret-123'),[revealed,setRevealed]=createSignal(false);return <main class="form-shell"><h1>${name}</h1><section class="form-grid"><article class="form-card" data-member="${ir.id}"><div class="field"><label for="secret">API token</label><span class="row"><input class="control" id="secret" type={revealed()?'text':'password'} value={value()} aria-describedby="secret-description" onInput={e=>setValue(e.currentTarget.value)}/><button class="action reveal" type="button" aria-pressed={revealed()} onClick={()=>setRevealed(x=>!x)}>{revealed()?'Hide':'Show'}</button></span><small id="secret-description">Keep this token private.</small></div></article></section></main>}
`;
  if(ir.id==='clipboard-text')return `import {createSignal} from 'solid-js';
export default function ${name}(){const [status,setStatus]=createSignal('');async function copy(){const value='npm i kumo';try{await navigator.clipboard.writeText(value)}catch{const input=document.querySelector<HTMLInputElement>('#copy-value')!;input.select();document.execCommand('copy')}setStatus('Copied npm i kumo')}return <main class="form-shell"><h1>${name}</h1><section class="form-grid"><article class="form-card" data-member="${ir.id}"><div class="field"><label for="copy-value">Install command</label><span class="row"><input class="control" id="copy-value" readOnly value="npm i kumo"/><button class="action copy" type="button" onClick={copy} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();copy()}}}>Copy</button></span><p class="status" role="status" aria-live="polite">{status()}</p></div></article></section></main>}
`;
  return `import {createSignal} from 'solid-js';
export default function ${name}(){const [value,setValue]=createSignal(${JSON.stringify(ir.id==='input'?'':ir.id==='input-area'?'Compiler proof':ir.id==='input-group'?'example.com':'Kumo')}),[touched,setTouched]=createSignal(false);const invalid=()=>touched()&&!value().trim();return <main class="form-shell"><h1>${name}</h1><section class="form-grid"><article class="form-card" data-member="${ir.id}">${ir.id==='field'?'<div class="field"><label for="field-value">Project name</label><input class="control" id="field-value" required value={value()} aria-describedby="field-description field-error" aria-invalid={invalid()} onInput={e=>setValue(e.currentTarget.value)} onBlur={()=>setTouched(true)}/><small id="field-description">Visible to your team.</small><small id="field-error" role="alert">{invalid()?\'Project name is required.\':\'\'}</small></div>':ir.id==='input'?'<label class="field" for="email"><span>Email address</span><input class="control" id="email" type="email" required placeholder="you@example.com" value={value()} aria-describedby="email-error" aria-invalid={invalid()} onInput={e=>setValue(e.currentTarget.value)} onBlur={()=>setTouched(true)}/><small id="email-error" role="alert">{invalid()?\'Email is required.\':\'\'}</small></label>':ir.id==='input-group'?'<label class="field" for="domain"><span>Domain</span><span class="group"><span aria-hidden="true">https://</span><input id="domain" required value={value()} aria-label="Domain name" onInput={e=>setValue(e.currentTarget.value)}/></span></label>':'<label class="field" for="notes"><span>Notes</span><textarea class="control" id="notes" required value={value()} onInput={e=>setValue(e.currentTarget.value)}/></label>'}</article></section></main>}
`;
 }
 if(ir.family==='data-presentational')return `/** Generated from the shared ${ir.schemaVersion} presentation model. */\nexport default function ${ir.name}(){return (${jsx(ir.root!)});}\n`;
 if(ir.behavior?.kind==='native-check'){
  const inputs:Record<string,string|number|boolean>[]=[];
  const labels:string[]=[];
  const walk=(node:Node):void=>{if(node.kind==='element'){if(node.tag==='input')inputs.push(node.attrs??{});if(node.tag==='label'){const last=node.children?.at(-1);if(last?.kind==='element'&&last.children?.[0]?.kind==='text')labels.push(last.children[0].value)}node.children?.forEach(walk)}};walk(ir.root!);
  const controls=inputs.map((attrs,i)=>({id:String(attrs.id),label:labels[i],checked:Boolean(attrs.checked),disabled:Boolean(attrs.disabled),required:Boolean(attrs.required),compact:String(attrs.id)==='compact'}));
  const role=ir.id==='switch';
  return `import {For,createSignal} from 'solid-js';\nconst controls=${JSON.stringify(controls)} as const;\nfunction ${ir.name}Control(p:{control:typeof controls[number]}){const [checked,setChecked]=createSignal(p.control.checked);return <label class={\`native-control ${ir.id}\${p.control.compact?' compact':''}\`}><input id={p.control.id} name={p.control.id} value="on" type="checkbox"${role?' role="switch" aria-checked={checked()}':''} checked={checked()} disabled={p.control.disabled} required={p.control.required} onChange={event=>setChecked(event.currentTarget.checked)}/><span class="indicator" aria-hidden="true"/><span>{p.control.label}</span></label>}\nexport default function ${ir.name}(){return <main class="native-shell"><h1>${ir.name}</h1><form class="native-matrix"><For each={controls}>{control=><${ir.name}Control control={control}/>}</For></form></main>}\n`;
 }
 return `import {For,Show,createSignal} from 'solid-js';
const options=['Apple','Banana','Cherry'];
export default function Select(){const [open,setOpen]=createSignal(false),[active,setActive]=createSignal(0),[value,setValue]=createSignal('');const choose=(i:number)=>{setActive(i);setValue(options[i]!);setOpen(false)};const key=(event:KeyboardEvent)=>{let i=active();if(event.key==='Escape'){setOpen(false);return}if(event.key==='Home')i=0;else if(event.key==='End')i=options.length-1;else if(event.key==='ArrowDown')i=Math.min(options.length-1,i+1);else if(event.key==='ArrowUp')i=Math.max(0,i-1);else if((event.key==='Enter'||event.key===' ')&&open()){event.preventDefault();choose(i);return}else return;event.preventDefault();setActive(i);setOpen(true)};return <main class="form-shell"><h1>Select</h1><section class="matrix"><button role="combobox" aria-haspopup="listbox" aria-controls="select-options" aria-expanded={open()} aria-activedescendant={open()?\`select-option-\${active()}\`:undefined} onClick={()=>setOpen(x=>!x)} onKeyDown={key}>{value()||'Choose fruit'}</button><Show when={open()}><ul id="select-options" role="listbox"><For each={options}>{(option,i)=><li id={\`select-option-\${i()}\`} role="option" aria-selected={value()===option} classList={{active:active()===i()}} onPointerDown={event=>{event.preventDefault();choose(i())}}>{option}</li>}</For></ul></Show></section></main>}
`;
}
const emitter=await readFile('src/kumo/solid-compiler.ts','utf8'),source=await readFile('src/kumo/catalog.ts','utf8');
const solidIds=['select','badge','checkbox','switch','field','input','input-group','input-area','sensitive-input','clipboard-text','tabs','menu-bar','sidebar','breadcrumbs','table-of-contents','banner','surface','layer-card','grid','grid-item','loader','meter','empty','label','link','text','cloudflare-logo','code','table'];
for(const ir of catalog.filter(x=>solidIds.includes(x.id))){const dir=`runtime/${ir.id}/solid`;await mkdir(`${dir}/src`,{recursive:true});const css=await readFile(ir.family==='native-control'?'public/native-control.css':ir.family==='form'?'public/form.css':ir.family==='navigation'?'public/navigation.css':'public/styles.css','utf8');const initial=html(ir.root!);const outputs:Record<string,string>={
 'src/App.tsx':app(ir),
 'src/client.tsx':`import './style.css';\nimport {hydrate} from 'solid-js/web';\nimport App from './App';\nhydrate(()=> <App/>,document.getElementById('app')!);\n`,
 'src/server.tsx':`import {generateHydrationScript,renderToString} from 'solid-js/web';\nimport App from './App';\nexport const render=()=>({html:renderToString(()=> <App/>),hydration:generateHydrationScript()});\n`,
 'src/runtime-entry.ts':`export {default} from './App';\n`,
 'src/style.css':css,
 'vite.config.mjs':`import solid from 'vite-plugin-solid';\nimport {defineConfig} from 'vite';\nexport default defineConfig({base:'./',plugins:[solid({ssr:true})],build:{outDir:'public-runtime',emptyOutDir:true,rollupOptions:{output:{entryFileNames:'assets/solid-${ir.id}.js'}}}});\n`,
 'index.html':`<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><title>${ir.name} · solid</title><!--HYDRATION--></head><body><!--APP--><div id="app">${initial}</div><!--/APP--><script type="module" src="/src/client.tsx"></script></body></html>\n`
 };for(const [file,body] of Object.entries(outputs))await writeFile(`${dir}/${file}`,body);const provenance:Provenance={schemaVersion:ir.schemaVersion,component:ir.id,framework:'solid',sourceHash:hash(source),irHash:hash(JSON.stringify(ir)),emitterHash:hash(emitter),outputs:Object.fromEntries(Object.entries(outputs).map(([k,v])=>[k,hash(v)]))};await writeFile(`${dir}/provenance.json`,JSON.stringify(provenance,null,2)+'\n');}
console.log(`emitted ${solidIds.length} Solid components from kumo.ir/v1`);
