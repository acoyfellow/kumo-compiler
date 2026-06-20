import catalog from '../generated/catalog.ir.json' with {type:'json'};

export const frameworks=['react','vue','svelte','solid'];
export const manifest={
 schemaVersion:'kumo.browser-proof/v1',
 catalogSchema:catalog.schemaVersion,
 components:catalog.components.map(({id,behavior})=>({
  id,
  route:`/${id}/{framework}/`,
  behavior:behavior?{kind:behavior.kind,policy:behavior}:null
 }))
};
if(manifest.catalogSchema!=='kumo.ir/v1'||manifest.components.length!==41)throw Error('browser proof manifest must describe the complete kumo.ir/v1 catalog');
