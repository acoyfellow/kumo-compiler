import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
export const frameworks=['react','vue','svelte','solid'];

// Migration disclosure is evidence, never a manually maintained allow-list.
const migrationPath=resolve(process.cwd(),process.cwd().endsWith('/astro')?'../generated/migration-status.json':'generated/migration-status.json');
const migration=JSON.parse(await readFile(migrationPath,'utf8'));
if(migration.derivedOnlyFromReceipts!==true)throw new Error('Migration status is not receipt-derived');
export const frameworkStatus=Object.fromEntries(frameworks.map(framework=>[framework,Object.fromEntries(Object.entries(migration.components).map(([id,value])=>[id,{status:value[framework]??'unclassified',receipt:value[framework==='vue'?'receipt':`${framework}Receipt`]??null}]))]));
export const statusCounts=Object.fromEntries(frameworks.map(framework=>[framework,Object.values(frameworkStatus[framework]).reduce((counts,{status})=>({...counts,[status]:(counts[status]??0)+1}),{})]));
export const nativeVueIds=Object.entries(frameworkStatus.vue).filter(([,value])=>value.status==='verified'&&value.receipt).map(([id])=>id);

export function catalogEvidence(catalog){
  const components=catalog.components;
  const nativeVue=components.filter(({id})=>nativeVueIds.includes(id));
  const legacyVue=components.filter(({id})=>!nativeVueIds.includes(id));
  const measured=components.filter(({metrics})=>metrics?.measured===true);
  const totals=Object.fromEntries(frameworks.map(framework=>[framework,{
    bundleBytes:components.reduce((sum,c)=>sum+c.metrics.bundleBytes[framework],0),
    meanBuildMs:components.reduce((sum,c)=>sum+c.metrics.buildMs[framework],0)/components.length
  }]));
  if(components.length!==41||nativeVue.length!==components.length||legacyVue.length!==0)
    throw new Error(`Catalog receipt disclosure changed: ${components.length} total, ${nativeVue.length} verified Vue, ${legacyVue.length} legacy Vue`);
  if(measured.length!==components.length)throw new Error(`Catalog has ${components.length-measured.length} unmeasured components`);
  for(const component of components)for(const framework of frameworks)
    if(!Number.isFinite(component.metrics.buildMs[framework])||!Number.isFinite(component.metrics.bundleBytes[framework]))
      throw new Error(`${component.id}/${framework} lacks measured build or bundle evidence`);
  for(const framework of frameworks)if(Object.keys(frameworkStatus[framework]).length!==components.length)throw new Error(`${framework} receipt status count does not match catalog`);
  return {components,nativeVue,legacyVue,measured,totals,frameworkStatus,statusCounts};
}
