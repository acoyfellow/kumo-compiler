import {IR_SCHEMA_VERSION, type Behavior, type ComponentIR, type Node} from './schema.js';

export interface IRDiagnostic { path:string; code:string; message:string }
export interface ValidationResult { valid:boolean; diagnostics:IRDiagnostic[] }
export interface BehaviorVector { component:string; behavior:Behavior['kind']; initial:Record<string,unknown>; actions:ReadonlyArray<{event:string;key?:string}>; expected:Record<string,unknown> }

const tags=new Set('a article button caption code dialog div fieldset h1 h2 input label legend li main meter nav ol output p section small span strong table tbody td textarea th thead tr ul'.split(' '));
const voidTags=new Set(['input']);
const globalAttrs=new Set('id class role title tabindex hidden open disabled readonly required checked value name type placeholder min max scope for href'.split(' '));
const aria=new Set('aria-label aria-hidden aria-pressed aria-current aria-autocomplete aria-controls aria-expanded aria-selected aria-haspopup aria-modal aria-live aria-labelledby aria-describedby aria-busy aria-disabled aria-checked'.split(' '));
const data=/^data-[a-z][a-z0-9-]*$/;
const roles=new Set('status img switch tablist tab tabpanel menubar menuitem navigation combobox listbox option dialog menu button'.split(' '));
const refAttrs=new Set(['for','aria-controls','aria-labelledby','aria-describedby']);
const safeUrl=(v:string)=>v.startsWith('#')||v.startsWith('/')||/^https?:\/\//i.test(v)||/^mailto:/i.test(v);
const policyVocabulary={
 state:new Set('checked active tab focused item current page current location value query open active option date start end message page object loading disabled activation count modal side align offset'.split(/ (?=(?:tab|item|page|location|option|value|count)$)/).concat(['checked','value','query','open','date','start','end','message','page','loading','disabled','modal','side','align','offset','object value','active tab','focused item','current page','current location','active option','active item','activation count'])),
 events:new Set(['change','click','focus','input','submit','cancel','close','focusout']),
 keyboard:new Set(['Space','ArrowLeft','ArrowRight','ArrowDown','ArrowUp','Home','End','Enter','Escape','Tab','Arrow keys','native link','native date keyboard','Control/Meta+K']),
};
function add(ds:IRDiagnostic[],path:string,code:string,message:string){ds.push({path,code,message});}
export function validateComponentIR(value:unknown):ValidationResult {
 const ds:IRDiagnostic[]=[]; const ids=new Map<string,string>(); const refs:{path:string;id:string}[]=[];
 if(!value||typeof value!=='object') return {valid:false,diagnostics:[{path:'$',code:'type',message:'expected component object'}]};
 const c=value as ComponentIR;
 if(c.schemaVersion!==IR_SCHEMA_VERSION)add(ds,'$.schemaVersion','version',`expected ${IR_SCHEMA_VERSION}`);
 for(const [k,v] of [['id',c.id],['name',c.name],['family',c.family]] as const)if(typeof v!=='string'||!v.trim())add(ds,`$.${k}`,'required','must be a nonempty string');
 function walk(n:Node,path:string){
  if(!n||typeof n!=='object'){add(ds,path,'node','expected node');return}
  if(n.kind==='text'){if(typeof n.value!=='string')add(ds,`${path}.value`,'type','expected string');return}
  if(n.kind!=='element'){add(ds,`${path}.kind`,'node-kind','unknown node kind');return}
  if(!tags.has(n.tag))add(ds,`${path}.tag`,'tag','unsafe or unknown HTML tag');
  if(voidTags.has(n.tag)&&(n.children?.length??0)>0)add(ds,`${path}.children`,'void-children',`${n.tag} cannot have children`);
  for(const [key,val] of Object.entries(n.attrs??{})){
   const ap=`${path}.attrs.${key}`;
   if(!globalAttrs.has(key)&&!aria.has(key)&&!data.test(key))add(ds,ap,'attribute','unsafe or unknown HTML attribute');
   if(!['string','number','boolean'].includes(typeof val))add(ds,ap,'attribute-type','attribute must be primitive');
   if(key==='id'&&typeof val==='string'){if(ids.has(val))add(ds,ap,'duplicate-id',`duplicate id ${val}`);else ids.set(val,ap)}
   if(refAttrs.has(key)&&typeof val==='string')for(const id of val.trim().split(/\s+/))refs.push({path:ap,id});
   if(key==='href'&&typeof val==='string'&&!safeUrl(val))add(ds,ap,'url','unsafe URL');
   if(key==='role'&&typeof val==='string'&&!roles.has(val))add(ds,ap,'role','unknown ARIA role');
   if(key==='aria-current'&&!['page','location','step','date','time',true,false,'true','false'].includes(val as never))add(ds,ap,'aria-value','invalid aria-current');
   if(key==='aria-expanded'&&typeof val!=='boolean'&&val!=='true'&&val!=='false')add(ds,ap,'aria-value','aria-expanded must be boolean');
  }
  (n.children??[]).forEach((x,i)=>walk(x,`${path}.children[${i}]`));
 }
 if(c.root!==null&&c.root!==undefined)walk(c.root,'$.root'); else if(c.root!==null)add(ds,'$.root','required','root must be an element or null');
 for(const r of refs)if(!ids.has(r.id))add(ds,r.path,'missing-reference',`references missing id ${r.id}`);
 const b=c.behavior;
 if(b){
  const nonempty=(xs:unknown,path:string)=>{if(!Array.isArray(xs)||xs.length===0)add(ds,path,'nonempty','collection must not be empty')};
  if(b.kind==='sensitive-toggle'||b.kind==='clipboard-copy'){if(!ids.has(b.inputId))add(ds,'$.behavior.inputId','missing-reference',`references missing id ${b.inputId}`)}
  if(b.kind==='native-check'){nonempty(b.inputIds,'$.behavior.inputIds');b.inputIds.forEach((id,i)=>{if(!ids.has(id))add(ds,`$.behavior.inputIds[${i}]`,'missing-reference',`references missing id ${id}`)})}
  if(b.kind==='roving'){nonempty(b.labels,'$.behavior.labels');if((b.groupRole==='tablist')!==(b.itemRole==='tab'))add(ds,'$.behavior','behavior-compatibility','tablist requires tab; menubar requires menuitem');if(b.selection==='activation'&&b.itemRole!=='tab')add(ds,'$.behavior.selection','behavior-compatibility','activation selection requires tabs')}
  if(b.kind==='current-link')nonempty(b.labels,'$.behavior.labels');
  if(b.kind==='selection'&&['radio','autocomplete','combobox','command','menu'].includes(b.mode))nonempty(b.options,'$.behavior.options');
  if(b.kind==='select'){nonempty(b.options,'$.behavior.options');nonempty(b.sizes,'$.behavior.sizes');nonempty(b.variants,'$.behavior.variants')}
  if(b.kind==='button'){nonempty(b.sizes,'$.behavior.sizes');nonempty(b.variants,'$.behavior.variants')}
  if(b.kind==='dialog')nonempty(b.sizes,'$.behavior.sizes');
  if(b.kind==='popover'){nonempty(b.sides,'$.behavior.sides');nonempty(b.aligns,'$.behavior.aligns')}
 }
 if(c.policy){
  if(c.policy.hydration!=='ssr-identical')add(ds,'$.policy.hydration','policy','unsupported hydration policy');
  for(const field of ['state','events','keyboard'] as const){const xs=c.policy[field];if(!Array.isArray(xs))add(ds,`$.policy.${field}`,'type','expected array');else {const seen=new Set<string>();xs.forEach((x,i)=>{if(!policyVocabulary[field].has(x))add(ds,`$.policy.${field}[${i}]`,'policy-vocabulary',`unknown ${field} term ${x}`);if(seen.has(x))add(ds,`$.policy.${field}[${i}]`,'contradictory-policy',`duplicate ${field} term ${x}`);seen.add(x)})}}
  if(!Array.isArray(c.policy.aria))add(ds,'$.policy.aria','type','expected array');
 }
 ds.sort((a,b)=>a.path.localeCompare(b.path)||a.code.localeCompare(b.code)||a.message.localeCompare(b.message));
 return {valid:ds.length===0,diagnostics:ds};
}
export function assertValidComponentIR(value:unknown):asserts value is ComponentIR {const r=validateComponentIR(value);if(!r.valid)throw new Error(r.diagnostics.map(d=>`${d.path} [${d.code}] ${d.message}`).join('\n'))}
export function behaviorVector(c:ComponentIR):BehaviorVector|null {if(!c.behavior)return null;const events=c.policy?.events??[];const keys=(c.policy?.keyboard??[]).filter(x=>!x.startsWith('native')&&!x.startsWith('Arrow keys'));return {component:c.id,behavior:c.behavior.kind,initial:{behavior:c.behavior},actions:[...events.map(event=>({event})),...keys.map(key=>({event:'keydown',key}))],expected:{hydration:c.policy?.hydration??'ssr-identical'}}}
