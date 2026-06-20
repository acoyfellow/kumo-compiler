import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const catalog=JSON.parse(await readFile(resolve(root,'generated/catalog.ir.json'),'utf8'));
// Compiler IDs intentionally map to public package subpaths, not source files or lookalike runtimes.
const aliases={
 'menu-bar':['menubar','MenuBar'],'dropdown-menu':['dropdown','DropdownMenu'],'cloudflare-logo':['cloudflare-logo','CloudflareLogo'],
 'table-of-contents':['table-of-contents','TableOfContents'],'date-picker':['date-picker','DatePicker'],'date-range-picker':['date-range-picker','DateRangePicker'],
 'command-palette':['command-palette','CommandPalette'],'clipboard-text':['clipboard-text','ClipboardText'],'input-group':['input-group','InputGroup'],
 'sensitive-input':['sensitive-input','SensitiveInput'],'layer-card':['layer-card','LayerCard']
};
const pascal=id=>id.split('-').map(x=>x[0].toUpperCase()+x.slice(1)).join('');
const unsupported={
 'input-area':'No independent ./components/input-area export exists (InputArea is only a named export of ./components/input). Mapping policy is required.',
 'grid-item':'No independent ./components/grid-item export exists (GridItem is only a named export of ./components/grid). Mapping policy is required.',
 'toasty':'No independent ./components/toasty export exists (Toasty is only a named export of ./components/toast). Mapping policy is required.'
};
function jsx(node){if(node.kind==='text')return JSON.stringify(node.value);if(node.kind!=='element')return 'null';const attrs=Object.entries(node.attrs??{}).filter(([k])=>!k.startsWith('on')).map(([k,v])=>`${k==='class'?'className':k}=${JSON.stringify(v)}`).join(' ');return `<${node.tag}${attrs?' '+attrs:''}>${(node.children??[]).map(jsx).join('')}</${node.tag}>`}
const mappings={schemaVersion:'kumo.canonical-react-catalog/v1',package:'@cloudflare/kumo@2.5.2',components:{}};
for(const component of catalog.components){const id=component.id;if(unsupported[id]){mappings.components[id]={status:'unsupported',reason:unsupported[id]};continue}const [segment,symbol]=aliases[id]??[id,pascal(id)];const exportPath=`@cloudflare/kumo/components/${segment}`;mappings.components[id]={status:'mapped',exportPath,symbol};const dir=resolve(root,'runtime-canonical',id);await mkdir(dir,{recursive:true});const fixture=jsx(component.root);await writeFile(resolve(dir,'fixture.jsx'),`import React from 'react';\nexport const fixture=<React.Fragment>${fixture}</React.Fragment>;\n`);await writeFile(resolve(dir,'entry.jsx'),`import React from 'react';\nimport {${symbol} as CanonicalComponent} from '${exportPath}';\nimport {fixture} from './fixture.jsx';\nexport const packageExport=${JSON.stringify(exportPath)};\nexport function App(){return <CanonicalComponent>{fixture}</CanonicalComponent>}\n`);await writeFile(resolve(dir,'server.jsx'),`import React from 'react';\nimport {renderToString} from 'react-dom/server';\nimport {App} from './entry.jsx';\nexport const render=()=>renderToString(<App/>);\n`);await writeFile(resolve(dir,'client.jsx'),`import React from 'react';\nimport {hydrateRoot} from 'react-dom/client';\nimport {App} from './entry.jsx';\nhydrateRoot(document.getElementById('root'),<App/>);\n`)}
await writeFile(resolve(root,'generated/canonical-react-catalog.json'),JSON.stringify(mappings,null,2)+'\n');
console.log(`Generated ${Object.values(mappings.components).filter(x=>x.status==='mapped').length} canonical runtimes; 3 explicit blockers`);
