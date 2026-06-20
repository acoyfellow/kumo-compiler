import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

export const defaultRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const json=async(root,file)=>JSON.parse(await readFile(path.join(root,file),'utf8'));
export async function loadManifests(root=defaultRoot){
 const [components,build]=await Promise.all([json(root,'manifests/components.json'),json(root,'manifests/build.json')]);
 validateManifests(components,build); return {components,build};
}
export function validateManifests(components,build){
 if(components.schemaVersion!==1||build.schemaVersion!==1)throw new Error('unsupported manifest schema');
 if(!Array.isArray(components.frameworks)||components.frameworks.length!==4||new Set(components.frameworks).size!==4)throw new Error('components manifest must define exactly four frameworks');
 if(!Array.isArray(components.components)||components.components.length!==41)throw new Error('components manifest must define exactly 41 components');
 const ids=new Set(); for(const c of components.components){if(!c.id||ids.has(c.id))throw new Error(`duplicate or missing component: ${c.id}`);ids.add(c.id);if(JSON.stringify(c.frameworks)!==JSON.stringify(components.frameworks))throw new Error(`${c.id} must support the canonical framework matrix`)}
 for(const [name,t] of Object.entries(build.targets??{})){for(const id of t.components??[])if(!ids.has(id))throw new Error(`${name} references unknown component ${id}`);for(const f of t.frameworks??[])if(!components.frameworks.includes(f))throw new Error(`${name} references unknown framework ${f}`)}
}
export function entriesFor(components,target){return components.components.filter(c=>(target.all||!target.components&&!target.families||target.components?.includes(c.id)||target.families?.includes(c.family))).flatMap(c=>c.frameworks.filter(f=>!target.frameworks||target.frameworks.includes(f)).map(framework=>({component:c.id,framework})));}
export async function assertCatalogMatches(root,components){const catalog=await json(root,'generated/catalog.ir.json');const actual=catalog.components.map(c=>({id:c.id,family:c.family}));const expected=components.components.map(c=>({id:c.id,family:c.family}));if(JSON.stringify(actual)!==JSON.stringify(expected))throw new Error('generated catalog does not exactly match manifests/components.json');}
