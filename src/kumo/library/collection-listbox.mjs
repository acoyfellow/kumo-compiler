import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest} from './index.mjs';

export const COLLECTION_LISTBOX_VERSION = 'kumo.collection-listbox/v1';
export const COLLECTION_COMPONENTS = Object.freeze(['autocomplete','combobox','select','dropdown-menu','radio','command-palette']);
const here = path.dirname(fileURLToPath(import.meta.url));
const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

function provenance(contract) {
  if (contract.schemaVersion !== 'kumo.observable/v1' || !Array.isArray(contract.vectors)) throw new Error(`${contract.component}: canonical observable contract required`);
  return {component:contract.component,contractPath:`contracts/kumo.observable/v1/components/${contract.component}.json`,contractDigest:digest(contract),vectorIds:contract.vectors.map(vector=>vector.id)};
}

export function deriveCollectionListbox(contracts) {
  const byName = new Map(contracts.map(contract=>[contract.component,contract]));
  const sources = COLLECTION_COMPONENTS.map(name=>{const contract=byName.get(name);if(!contract) throw new Error(`${name} contract required`);return provenance(contract)});
  const value = {
    schemaVersion:COLLECTION_LISTBOX_VERSION,
    sources,
    observableImplementation:{select:{support:'supported',root:'div',trigger:{tag:'button',role:'combobox',haspopup:'listbox'},pointer:{disabledSelectable:false,closesSingle:true},keyboard:{keys:['ArrowDown','Home','End','Escape'],disabledSkipped:true,highlightScrolled:true,typeahead:'prefix'},controlled:{valueAndOpenAuthoritative:true,dismissRequestsStillEmit:true},multiple:{orderedUniqueObjects:true,staysOpen:true},vectorIds:byName.get('select').vectors.map(v=>v.id)}},
    collection:{key:'consumer-supplied stable value; duplicate keys invalid',order:'declaration or items-array order; filtering preserves relative order',disabled:'root disabled suppresses all interaction; item disabled is excluded from active navigation and selection',groups:'structural labels and separators are not selectable and do not alter item order',filter:{query:'input value',result:'enabled and disabled matching items remain rendered; disabled remain non-interactive',ownership:'autocomplete/combobox/command-palette or consumer filter',normalization:'unknown'},typeahead:{scope:'currently visible enabled items',matching:'prefix',timeout:'unknown'},unknowns:['generated item identity and DOM ids','virtualization and scroll-into-view details','locale/diacritic normalization','vendor matching timeout and wrap behavior']},
    state:{active:{initial:null,commandPaletteInitial:'first visible enabled item',ownership:'internal',mustReference:'visible enabled item or null'},selected:{single:'key or null',multiple:'ordered unique keys',mustReference:'known enabled item'},controlled:{ownership:'property-presence',controlled:'value prop remains authoritative; transition emits proposal without commit',uncontrolled:'defaultValue initializes state; transition commits and emits'}},
    transitions:{move:'Arrow navigation/Home/End moves active among visible enabled items only',filter:'recompute visible order; retain active when still visible and enabled, otherwise command palette chooses first enabled and others use null',typeahead:'move active to next matching visible enabled item',activate:'active enabled item proposes selected state; disabled/missing/null is a no-op',pointer:'pointer on enabled item makes it active; activation proposes selection'},
    unsupported:['identity synthesis','scroll positioning','virtualization','vendor callback ordering','vendor dismissal policy']
  };
  return {...value,capabilityDigest:digest(value)};
}

export function createCollectionState(spec, props={}) {
  validateCollectionListbox(spec);
  const controlled=own(props,'value');
  let selected=controlled?props.value:(own(props,'defaultValue')?props.defaultValue:null);
  let active=null;
  const normalize=items=>items.map((item,index)=>({...item,key:item.key,index}));
  return Object.freeze({
    ownership:controlled?'controlled':'uncontrolled',
    snapshot(items,query='') { const normalized=normalize(items); const keys=new Set(); for(const item of normalized){if(item.key===undefined||keys.has(item.key))throw new Error('collection item keys must be present and unique');keys.add(item.key)} const visible=normalized.filter(item=>!query||String(item.text??item.label??item.key).toLowerCase().includes(String(query).toLowerCase())); if(active!==null&&!visible.some(item=>item.key===active&&!item.disabled))active=null; return {items:normalized,visible,active,selected:controlled?props.value:selected}; },
    move(items,direction=1) { const enabled=items.filter(item=>!item.disabled); if(!enabled.length){active=null;return active} const index=enabled.findIndex(item=>item.key===active); active=enabled[(index+direction+enabled.length)%enabled.length].key; return active; },
    activate(items,nextProps=props) { const item=items.find(candidate=>candidate.key===active); if(!item||item.disabled)return {committed:false,emitted:false,selected:controlled?nextProps.value:selected}; const previous=controlled?nextProps.value:selected; if(!controlled)selected=item.key; return {previous,next:item.key,committed:!controlled,emitted:true,selected:controlled?nextProps.value:selected}; }
  });
}

export function validateCollectionListbox(value) {
  if(value?.schemaVersion!==COLLECTION_LISTBOX_VERSION||value.observableImplementation?.select?.support!=='supported'||value.observableImplementation.select.pointer?.disabledSelectable!==false||!Array.isArray(value.sources)||value.sources.map(x=>x.component).join(',')!==COLLECTION_COMPONENTS.join(','))throw new Error('invalid collection/listbox capability');
  for(const source of value.sources)if(!source.contractPath||!source.contractDigest||!Array.isArray(source.vectorIds))throw new Error('collection/listbox provenance required');
  if(value.collection?.unknowns?.length!==4||value.unsupported?.length!==5)throw new Error('collection/listbox unknown preservation required');
  const {capabilityDigest,...unsigned}=value;if(capabilityDigest!==digest(unsigned))throw new Error('collection/listbox capability digest mismatch');
  return value;
}
export function loadCollectionListbox(file=path.join(here,'capabilities/collection-listbox.json')) {return validateCollectionListbox(JSON.parse(fs.readFileSync(file,'utf8')))}
