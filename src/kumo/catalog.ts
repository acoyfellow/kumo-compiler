import {IR_SCHEMA_VERSION, type ComponentIR, type ElementNode, type Node} from './schema.js';
const t=(value:string):Node=>({kind:'text',value});
const e=(tag:string,attrs:Record<string,string|number|boolean>={},children:Node[]=[]):ElementNode=>({kind:'element',tag,attrs,children});
const migrated:Record<string,{name:string;body:ElementNode}>={
 badge:{name:'Badge',body:e('span',{class:'badge'},[t('PRO')])},
 banner:{name:'Banner',body:e('div',{class:'banner',role:'status'},[e('span',{class:'badge'},[t('NEW')]),e('strong',{},[t('Edge data is current.')])])},
 surface:{name:'Surface',body:e('section',{class:'surface'},[e('h2',{},[t('Account surface')]),e('p',{},[t('Content on a bounded surface.')])])},
 'layer-card':{name:'LayerCard',body:e('article',{class:'layer-card'},[e('h2',{},[t('Production zone')]),e('p',{},[t('Layered account details.')])])},
 grid:{name:'Grid',body:e('div',{class:'grid'},['Analytics','Workers','DNS'].map(x=>e('div',{class:'grid-item'},[t(x)])))},
 'grid-item':{name:'GridItem',body:e('div',{class:'grid-item'},[e('strong',{},[t('Requests')]),e('p',{},[t('12,480 today')])])},
 loader:{name:'Loader',body:e('span',{class:'loader',role:'status','aria-label':'Loading'})},
 meter:{name:'Meter',body:e('div',{},[e('label',{for:'usage'},[t('Usage')]),e('meter',{id:'usage',min:0,max:100,value:68},[t('68%')])])},
 empty:{name:'Empty',body:e('section',{class:'empty'},[e('strong',{},[t('No events yet')]),e('p',{},[t('Events appear here when available.')])])},
 label:{name:'Label',body:e('p',{class:'label'},[t('ACCOUNT')])}, link:{name:'Link',body:e('a',{href:'#details'},[t('Read details →')])},
 text:{name:'Text',body:e('p',{class:'text'},[t('Presentational primitives compose without client-only markup.')])},
 'cloudflare-logo':{name:'CloudflareLogo',body:e('div',{class:'logo',role:'img','aria-label':'Cloudflare'},[t('☁ Cloudflare')])},
 code:{name:'Code',body:e('code',{},[t("cache.status === 'HIT'")])},
 table:{name:'Table',body:e('table',{},[e('caption',{},[t('Request summary')]),e('thead',{},[e('tr',{},[e('th',{scope:'col'},[t('Colo')]),e('th',{scope:'col'},[t('Requests')])])]),e('tbody',{},[['SJC','12,480'],['AMS','9,201']].map(r=>e('tr',{},r.map(x=>e('td',{},[t(x)])))))])}
};
const ids=['select','button','dialog','popover','checkbox','switch','field','input','input-group','input-area','sensitive-input','clipboard-text','tabs','menu-bar','sidebar','breadcrumbs','table-of-contents','badge','banner','surface','layer-card','grid','grid-item','loader','meter','empty','label','link','text','cloudflare-logo','code','table','radio','autocomplete','combobox','command-palette','date-picker','date-range-picker','dropdown-menu','toasty','pagination'];
const title=(id:string)=>id.split('-').map(x=>x.charAt(0).toUpperCase()+x.slice(1)).join('');
export const catalog:ComponentIR[]=ids.map(id=>{const x=migrated[id];return {schemaVersion:IR_SCHEMA_VERSION,id,name:x?.name??title(id),family:x?'data-presentational':'legacy',root:x?e('main',{class:'data-shell'},[e('h1',{},[t(x.name)]),e('div',{class:'demo',id:'details'},[x.body])]):null,source:{kind:'normalized-ir',revision:'1'},migration:{vue:x?'candidate':'pending'}}});
