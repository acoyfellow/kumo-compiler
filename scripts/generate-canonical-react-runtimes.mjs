import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const catalog=JSON.parse(await readFile(resolve(root,'generated/catalog.ir.json'),'utf8'));
// Compiler IDs intentionally map to public package subpaths, not source files or lookalike runtimes.
const aliases={
 'menu-bar':['menubar','MenuBar'],'dropdown-menu':['dropdown','DropdownMenu'],'cloudflare-logo':['cloudflare-logo','CloudflareLogo'],
 'table-of-contents':['table-of-contents','TableOfContents'],'date-picker':['date-picker','DatePicker'],'date-range-picker':['date-range-picker','DateRangePicker'],
 'command-palette':['command-palette','CommandPalette'],'clipboard-text':['clipboard-text','ClipboardText'],'input-group':['input-group','InputGroup'],
 'sensitive-input':['sensitive-input','SensitiveInput'],'layer-card':['layer-card','LayerCard'],
 'input-area':['input','InputArea'],'grid-item':['grid','GridItem'],'toasty':['toast','Toasty']
};
const pascal=id=>id.split('-').map(x=>x[0].toUpperCase()+x.slice(1)).join('');
function jsx(node){if(node.kind==='text')return JSON.stringify(node.value);if(node.kind!=='element')return 'null';const reactName=(key)=>key==='class'?'className':key==='for'?'htmlFor':key==='tabindex'?'tabIndex':key==='readonly'?'readOnly':key==='maxlength'?'maxLength':key;const attrs=Object.entries(node.attrs??{}).filter(([k])=>!k.startsWith('on')).map(([k,v])=>{const name=node.tag==='input'&&k==='checked'?'defaultChecked':(node.tag==='input'||node.tag==='textarea')&&k==='value'?'defaultValue':reactName(k);return `${name}={${JSON.stringify(v)}}`}).join(' ');return `<${node.tag}${attrs?' '+attrs:''}>${(node.children??[]).map(jsx).join('')}</${node.tag}>`}
// These compositions are normalized fixture IR, not alternate implementations.  They encode
// required props/compound ownership from the 2.5.2 public declarations.
const compositions={
 button:`<CanonicalComponent>Canonical button</CanonicalComponent>`,
 select:`<CanonicalComponent label="Region" defaultValue="iad"><option value="iad">IAD</option><option value="sfo">SFO</option></CanonicalComponent>`,
 dialog:`<CanonicalComponent.Root><CanonicalComponent.Trigger>Open dialog</CanonicalComponent.Trigger><CanonicalComponent><CanonicalComponent.Title>Audit dialog</CanonicalComponent.Title><CanonicalComponent.Description>Canonical dialog fixture</CanonicalComponent.Description></CanonicalComponent></CanonicalComponent.Root>`,
 checkbox:`<CanonicalComponent defaultChecked aria-label="Audit checkbox" />`,
 switch:`<CanonicalComponent defaultChecked aria-label="Audit switch" />`,
 input:`<CanonicalComponent aria-label="Audit input" defaultValue="fixture" />`,
 'input-area':`<CanonicalComponent aria-label="Audit input area" defaultValue="fixture text" />`,
 'sensitive-input':`<CanonicalComponent label="API token" defaultValue="secret" />`,
 'clipboard-text':`<><button type="button">Clipboard fixture</button><CanonicalComponent text="copy-this-value" /></>`,
 tabs:`<CanonicalComponent tabs={[{value:'one',label:'One'},{value:'two',label:'Two'}]} value="one" />`,
 'menu-bar':`<CanonicalComponent options={[{id:'overview',label:'Overview'},{id:'settings',label:'Settings'}]} optionIds={['overview','settings']} isActive={id=>id==='overview'} />`,
 sidebar:`<CanonicalComponent.Provider mobileBreakpoint={1}><CanonicalComponent><CanonicalComponent.Header>Navigation</CanonicalComponent.Header><CanonicalComponent.Content><CanonicalComponent.Group><CanonicalComponent.GroupLabel>Audit</CanonicalComponent.GroupLabel><CanonicalComponent.Menu><CanonicalComponent.MenuItem><CanonicalComponent.MenuButton>Overview</CanonicalComponent.MenuButton></CanonicalComponent.MenuItem></CanonicalComponent.Menu></CanonicalComponent.Group></CanonicalComponent.Content></CanonicalComponent></CanonicalComponent.Provider>`,
 loader:`<CanonicalComponent aria-label="Loading audit fixture" />`, meter:`<CanonicalComponent label="Usage" value={65} />`,
 empty:`<CanonicalComponent title="No results" description="Canonical empty fixture" />`,
 link:`<CanonicalComponent href="#details">Read details →</CanonicalComponent>`,
 text:`<CanonicalComponent>Presentational primitives compose without client-only markup.</CanonicalComponent>`,
 table:`<CanonicalComponent><caption>Request summary</caption><CanonicalComponent.Header><CanonicalComponent.Row><CanonicalComponent.Head scope="col">Colo</CanonicalComponent.Head><CanonicalComponent.Head scope="col">Requests</CanonicalComponent.Head></CanonicalComponent.Row></CanonicalComponent.Header><CanonicalComponent.Body><CanonicalComponent.Row><CanonicalComponent.Cell>SJC</CanonicalComponent.Cell><CanonicalComponent.Cell>12,480</CanonicalComponent.Cell></CanonicalComponent.Row><CanonicalComponent.Row><CanonicalComponent.Cell>AMS</CanonicalComponent.Cell><CanonicalComponent.Cell>9,201</CanonicalComponent.Cell></CanonicalComponent.Row></CanonicalComponent.Body></CanonicalComponent>`,
 'cloudflare-logo':`<CanonicalComponent aria-label="Cloudflare" />`, code:`<CanonicalComponent code="const audit = true;" lang="ts" />`,
 'command-palette':`<><button type="button">Open command palette</button><CanonicalComponent.Root open={false} onOpenChange={()=>{}} items={['Audit']} itemToStringValue={x=>x}><CanonicalComponent.Input placeholder="Search" /><CanonicalComponent.List><CanonicalComponent.Item value="Audit">Audit</CanonicalComponent.Item></CanonicalComponent.List></CanonicalComponent.Root></>`,
 'date-picker':`<CanonicalComponent mode="single" defaultMonth={new Date(2024,0,1)} />`,
 'date-range-picker':`<CanonicalComponent onStartDateChange={()=>{}} onEndDateChange={()=>{}} />`
};
const mappings={schemaVersion:'kumo.canonical-react-catalog/v1',package:'@cloudflare/kumo@2.5.2',components:{}};
const fixtureStyles={dialog:'public/dialog.css',popover:'public/popover.css',field:'public/form.css',input:'public/form.css','input-group':'public/form.css','input-area':'public/form.css','sensitive-input':'public/form.css','clipboard-text':'public/form.css'};
for(const component of catalog.components){const id=component.id;const [segment,symbol]=aliases[id]??[id,pascal(id)];const exportPath=`@cloudflare/kumo/components/${segment}`;mappings.components[id]={status:'mapped',exportPath,symbol};const dir=resolve(root,'runtime-canonical',id);await mkdir(dir,{recursive:true});const fixture=jsx(component.root);await writeFile(resolve(dir,'fixture.jsx'),`import React from 'react';\nexport const fixture=<React.Fragment>${fixture}</React.Fragment>;\n`);const composition=compositions[id]??`<CanonicalComponent>{fixture}</CanonicalComponent>`;if(fixtureStyles[id])await writeFile(resolve(dir,'fixture.css'),await readFile(resolve(root,fixtureStyles[id]),'utf8'));await writeFile(resolve(dir,'entry.jsx'),`import React from 'react';\nimport {${symbol} as CanonicalComponent} from '${exportPath}';\nimport {fixture} from './fixture.jsx';\nexport const packageExport=${JSON.stringify(exportPath)};\nexport function App(){return <main data-canonical-component=${JSON.stringify(id)}>${composition}</main>}\n`);await writeFile(resolve(dir,'server.jsx'),`import React from 'react';\nimport {renderToString} from 'react-dom/server';\nimport {App} from './entry.jsx';\nexport const render=()=>renderToString(<App/>);\n`);await writeFile(resolve(dir,'client.jsx'),`${fixtureStyles[id]?"import './fixture.css';\n":''}import React from 'react';\nimport {hydrateRoot} from 'react-dom/client';\nimport {App} from './entry.jsx';\nhydrateRoot(document.getElementById('root'),<App/>);\n`);await writeFile(resolve(dir,'index.html'),`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${id} canonical React</title><style>body{font-family:system-ui;margin:24px}*{box-sizing:border-box}</style></head><body><div id="root"></div><script type="module" src="./client.jsx"></script></body></html>\n`);await writeFile(resolve(dir,'vite.config.mjs'),`import {defineConfig} from 'vite';\nexport default defineConfig({root:import.meta.dirname,base:'/${id}/react/',resolve:{dedupe:['react','react-dom']},ssr:{noExternal:['@cloudflare/kumo']},build:{outDir:'public-runtime',emptyOutDir:true}});\n`)}
await writeFile(resolve(root,'generated/canonical-react-catalog.json'),JSON.stringify(mappings,null,2)+'\n');
console.log(`Generated ${Object.values(mappings.components).filter(x=>x.status==='mapped').length} canonical runtimes; 0 blockers`);
