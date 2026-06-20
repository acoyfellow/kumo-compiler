import {IR_SCHEMA_VERSION, type ComponentIR, type ElementNode, type FormBehavior, type Node} from './schema.js';
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
const forms:Record<string,{name:string;body:ElementNode;behavior?:FormBehavior}>={
 field:{name:'Field',body:e('div',{class:'field'},[e('label',{for:'field-value'},[t('Project name')]),e('input',{class:'control',id:'field-value',value:'Kumo'}),e('small',{},[t('Visible to your team.')])])},
 input:{name:'Input',body:e('label',{class:'field',for:'email'},[e('span',{},[t('Email address')]),e('input',{class:'control',id:'email',type:'email',placeholder:'you@example.com'})])},
 'input-group':{name:'InputGroup',body:e('label',{class:'field',for:'domain'},[e('span',{},[t('Domain')]),e('span',{class:'group'},[e('span',{},[t('https://')]),e('input',{id:'domain',value:'example.com'})])])},
 'input-area':{name:'InputArea',body:e('label',{class:'field',for:'notes'},[e('span',{},[t('Notes')]),e('textarea',{class:'control',id:'notes'},[t('Compiler proof')])])},
 'sensitive-input':{name:'SensitiveInput',body:e('label',{class:'field',for:'secret'},[e('span',{},[t('API token')]),e('span',{class:'row'},[e('input',{class:'control',id:'secret',type:'password',value:'secret-123'}),e('button',{class:'action reveal',type:'button','aria-pressed':'false'},[t('Show')])])]),behavior:{kind:'sensitive-toggle',inputId:'secret',buttonClass:'reveal'}},
 'clipboard-text':{name:'ClipboardText',body:e('div',{class:'field'},[e('label',{for:'copy-value'},[t('Install command')]),e('span',{class:'row'},[e('input',{class:'control',id:'copy-value',readonly:true,value:'npm i kumo'}),e('button',{class:'action copy',type:'button'},[t('Copy')])]),e('p',{class:'status',role:'status'})]),behavior:{kind:'clipboard-copy',inputId:'copy-value',buttonClass:'copy',statusClass:'status',message:'Copied npm i kumo'}}
};
const ids=['select','button','dialog','popover','checkbox','switch','field','input','input-group','input-area','sensitive-input','clipboard-text','tabs','menu-bar','sidebar','breadcrumbs','table-of-contents','badge','banner','surface','layer-card','grid','grid-item','loader','meter','empty','label','link','text','cloudflare-logo','code','table','radio','autocomplete','combobox','command-palette','date-picker','date-range-picker','dropdown-menu','toasty','pagination'];
const title=(id:string)=>id.split('-').map(x=>x.charAt(0).toUpperCase()+x.slice(1)).join('');
export const catalog:ComponentIR[]=ids.map(id=>{const x=migrated[id],form=forms[id],item=x??form;const family=x?'data-presentational':form?'form':'legacy';return {schemaVersion:IR_SCHEMA_VERSION,id,name:item?.name??title(id),family,root:item?e('main',{class:x?'data-shell':'form-shell'},[e('h1',{},[t(item.name)]),e(x?'div':'section',{class:x?'demo':'form-grid',...(x?{id:'details'}:{})},[x?item.body:e('article',{class:'form-card','data-member':id},[item.body])])]):null,...(form?.behavior?{behavior:form.behavior}:{}),source:{kind:'normalized-ir',revision:'2'},migration:{vue:item?'candidate':'pending'}}});
