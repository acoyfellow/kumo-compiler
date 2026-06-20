export const frameworks=['react','vue','svelte','solid'];

// These are the components whose Vue panel is currently backed by a Vue component
// implementation rather than the legacy generated HTML/lookalike family harness.
export const nativeVueIds=['select','button','dialog','popover','checkbox','switch'];

export function catalogEvidence(catalog){
  const components=catalog.components;
  const nativeVue=components.filter(({id})=>nativeVueIds.includes(id));
  const legacyVue=components.filter(({id})=>!nativeVueIds.includes(id));
  const measured=components.filter(({metrics})=>metrics?.measured===true);
  const totals=Object.fromEntries(frameworks.map(framework=>[framework,{
    bundleBytes:components.reduce((sum,c)=>sum+c.metrics.bundleBytes[framework],0),
    meanBuildMs:components.reduce((sum,c)=>sum+c.metrics.buildMs[framework],0)/components.length
  }]));
  if(components.length!==41||nativeVue.length!==6||legacyVue.length!==35)
    throw new Error(`Catalog disclosure changed: ${components.length} total, ${nativeVue.length} native Vue, ${legacyVue.length} legacy Vue`);
  if(measured.length!==components.length)throw new Error(`Catalog has ${components.length-measured.length} unmeasured components`);
  for(const component of components)for(const framework of frameworks)
    if(!Number.isFinite(component.metrics.buildMs[framework])||!Number.isFinite(component.metrics.bundleBytes[framework]))
      throw new Error(`${component.id}/${framework} lacks measured build or bundle evidence`);
  return {components,nativeVue,legacyVue,measured,totals};
}
