import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..'),sha=value=>createHash('sha256').update(value).digest('hex');
const components={};
for(const component of ['badge','button','label','link','text']){
 const file=resolve(root,'runtime-canonical',component,'public-runtime','index.html'),html=await readFile(file,'utf8');
 const selector=`main[data-canonical-component="${component}"] > :first-child`;
 const element=html.match(new RegExp(`<main[^>]*data-canonical-component="${component}"[^>]*>(<[^>]+>)`))?.[1];
 if(!element)throw new Error(`${component}: canonical visual root missing`);
 const className=element.match(/class="([^"]*)"/)?.[1];
 const tag=element.match(/^<([\w-]+)/)?.[1];
 if(!className||!tag)throw new Error(`${component}: canonical root class/tag missing`);
 components[component]={root:{tag,className},provenance:{file:`runtime-canonical/${component}/public-runtime/index.html`,sha256:sha(html),selector}};
}
const value={schemaVersion:'kumo.visual-contract/v1',canonical:'@cloudflare/kumo@2.5.2',components};
value.digest=sha(JSON.stringify(value));
await mkdir(resolve(root,'generated'),{recursive:true});await writeFile(resolve(root,'generated/visual-contract.json'),JSON.stringify(value,null,2)+'\n');
console.log(`Visual contract: ${Object.keys(components).length} component(s), ${value.digest}`);
