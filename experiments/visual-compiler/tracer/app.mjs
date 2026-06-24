import React from 'react';
import {hydrateRoot} from 'react-dom/client';
import {Button} from '@cloudflare/kumo/components/button';
import {Checkbox} from '@cloudflare/kumo/components/checkbox';
import {Field} from '@cloudflare/kumo/components/field';
import {Popover} from '@cloudflare/kumo/components/popover';
import {Badge} from '@cloudflare/kumo/components/badge';
import {Label} from '@cloudflare/kumo/components/label';
import {Text} from '@cloudflare/kumo/components/text';
import {Link} from '@cloudflare/kumo/components/link';
import {Surface} from '@cloudflare/kumo/components/surface';
import {Banner} from '@cloudflare/kumo/components/banner';
import {Empty} from '@cloudflare/kumo/components/empty';
import {Loader} from '@cloudflare/kumo/components/loader';
import {Meter} from '@cloudflare/kumo/components/meter';
import {Code} from '@cloudflare/kumo/components/code';
import {CloudflareLogo} from '@cloudflare/kumo/components/cloudflare-logo';
import {ClipboardText} from '@cloudflare/kumo/components/clipboard-text';
import {Input, InputArea} from '@cloudflare/kumo/components/input';
import {Switch} from '@cloudflare/kumo/components/switch';
import {Grid, GridItem} from '@cloudflare/kumo/components/grid';
import {LayerCard} from '@cloudflare/kumo/components/layer-card';
import {Radio} from '@cloudflare/kumo/components/radio';
import {Breadcrumbs} from '@cloudflare/kumo/components/breadcrumbs';
import {Pagination} from '@cloudflare/kumo/components/pagination';
import {Tabs} from '@cloudflare/kumo/components/tabs';
import {Table} from '@cloudflare/kumo/components/table';
import {TableOfContents} from '@cloudflare/kumo/components/table-of-contents';
import {InputGroup} from '@cloudflare/kumo/components/input-group';
import {SensitiveInput} from '@cloudflare/kumo/components/sensitive-input';
import {Select} from '@cloudflare/kumo/components/select';
import {Dialog} from '@cloudflare/kumo/components/dialog';
import {DropdownMenu} from '@cloudflare/kumo/components/dropdown';

const h=React.createElement;
export function App({component,state}){
 const log=(type,detail={})=>globalThis.__events?.push({type,...detail});
 let child;
 if(component==='button') child=h(Button,{'data-part':'control',disabled:state==='disabled',loading:state==='loading',onClick:()=>log('click')},state==='loading'?'Loading':'Continue');
 if(component==='checkbox') child=h(Checkbox,{'data-part':'control',label:'Accept terms',checked:state==='checked',indeterminate:state==='indeterminate',onCheckedChange:v=>log('checkedChange',{value:v})});
 if(component==='field') child=h(Field,{label:'Project name',description:'Visible to your team.',error:state==='error'?{message:'Required',match:true}:undefined},h('input',{'data-part':'control',className:'h-9 rounded-lg px-3 ring ring-kumo-line',defaultValue:'Kumo',disabled:state==='disabled',onInput:e=>log('input',{value:e.currentTarget.value})}));
 if(component==='popover') child=h(Popover,{defaultOpen:state==='open'},h(Popover.Trigger,{'data-part':'trigger',onClick:()=>log('click')},'Toggle'),h(Popover.Content,{'data-part':'content'},h(Popover.Title,null,'Options'),h(Popover.Description,null,'Popover content'),h(Popover.Close,{'data-part':'close'},'Close')));
 if(component==='badge') child=h(Badge,{'data-part':'control',variant:state==='success'?'success':state==='red'?'red':'primary'},state==='success'?'Active':state==='red'?'Failed':'New');
 if(component==='label') child=h(Label,{'data-part':'control',htmlFor:'x',disabled:state==='disabled'},state==='error'?'Required field':'Project name');
 if(component==='text') child=h(Text,{'data-part':'control',variant:state==='secondary'?'secondary':state==='error'?'error':'body'},state==='error'?'Something went wrong':'Visible to your team.');
 if(component==='link') child=h(Link,{'data-part':'control',href:'#',variant:state==='current'?'current':'inline'},state==='current'?'Current page':'Documentation');
 if(component==='surface') child=h(Surface,{'data-part':'control',color:state==='secondary'?'secondary':'primary'},h('span',null,state==='secondary'?'Secondary surface':'Primary surface'));
 if(component==='banner') child=h(Banner,{'data-part':'control',variant:state==='error'?'error':state==='alert'?'alert':'default'},state==='error'?'An error occurred':state==='alert'?'Heads up':'Informational message');
 if(component==='empty') child=h(Empty,{'data-part':'control',size:state==='sm'?'sm':state==='lg'?'lg':'base',title:'No results',description:'Try a different search.'});
 if(component==='loader') child=h(Loader,{'data-part':'control',size:state==='sm'?'sm':state==='lg'?'lg':'base','aria-label':'Loading'});
 if(component==='meter') child=h(Meter,{'data-part':'control',label:'Storage used',value:state==='full'?100:state==='low'?15:65});
 if(component==='code') child=h(Code,{'data-part':'control',lang:state==='css'?'css':state==='bash'?'bash':'ts',code:state==='css'?'.a{color:red}':state==='bash'?'npm run build':'const x = 1;'});
 if(component==='cloudflare-logo') child=h(CloudflareLogo,{'data-part':'control',variant:state==='glyph'?'glyph':state==='white'?'white':'full'});
 if(component==='clipboard-text') child=h(ClipboardText,{'data-part':'control',size:state==='sm'?'sm':state==='lg'?'lg':'base',text:'abc123',textToCopy:'abc123'});
 if(component==='input') child=h(Input,{'data-part':'control',placeholder:'Enter value',defaultValue:state==='filled'?'Hello':undefined,disabled:state==='disabled',onInput:e=>log('input',{value:e.currentTarget.value})});
 if(component==='input-area') child=h(InputArea,{'data-part':'control',placeholder:'Write a message',defaultValue:state==='filled'?'Line one\nLine two':undefined,disabled:state==='disabled',onInput:e=>log('input',{value:e.currentTarget.value})});
 if(component==='switch') child=h(Switch,{'data-part':'control',label:'Enable notifications',checked:state==='on',disabled:state==='disabled',onCheckedChange:v=>log('checkedChange',{value:v})});
 if(component==='grid') child=h(Grid,{'data-part':'control',gap:state==='lg'?'lg':state==='none'?'none':'sm'},h('div',null,'A'),h('div',null,'B'));
 if(component==='grid-item') child=h(Grid,{gap:'sm'},h(GridItem,{'data-part':'control',colSpan:state==='full'?3:state==='wide'?2:1},'Cell'),h(GridItem,null,'Other'));
 if(component==='layer-card') child=h(LayerCard,{'data-part':'control'},h(LayerCard.Secondary,null,state==='compact'?'Step':'Next Steps'),h(LayerCard.Primary,null,state==='error'?'Action failed':state==='compact'?'Go':'Get started with Kumo'));
 if(component==='radio') child=h(Radio.Group,{'data-part':'control',legend:'Notification preference',orientation:state==='horizontal'?'horizontal':'vertical',defaultValue:state==='sms'?'sms':'email',onValueChange:v=>log('valueChange',{value:v})},h(Radio.Item,{label:'Email',value:'email'}),h(Radio.Item,{label:'SMS',value:'sms'}));
 if(component==='breadcrumbs'){const items=state==='short'?[h(Breadcrumbs.Link,{href:'/',key:'h'},'Home'),h(Breadcrumbs.Separator,{key:'s'}),h(Breadcrumbs.Current,{key:'c'},'Guide')]:state==='deep'?[h(Breadcrumbs.Link,{href:'/',key:'h'},'Home'),h(Breadcrumbs.Separator,{key:'s1'}),h(Breadcrumbs.Link,{href:'/docs',key:'d'},'Docs'),h(Breadcrumbs.Separator,{key:'s2'}),h(Breadcrumbs.Link,{href:'/docs/api',key:'a'},'API'),h(Breadcrumbs.Separator,{key:'s3'}),h(Breadcrumbs.Current,{key:'c'},'Reference')]:[h(Breadcrumbs.Link,{href:'/',key:'h'},'Home'),h(Breadcrumbs.Separator,{key:'s1'}),h(Breadcrumbs.Link,{href:'/docs',key:'d'},'Docs'),h(Breadcrumbs.Separator,{key:'s2'}),h(Breadcrumbs.Current,{key:'c'},'Guide')];child=h(Breadcrumbs,{'data-part':'control'},...items);}
 if(component==='pagination') child=h(Pagination,{'data-part':'control',page:state==='last'?10:state==='mid'?5:1,setPage:p=>log('setPage',{value:p}),perPage:50,totalCount:500},h(Pagination.Info),h(Pagination.Controls));
 if(component==='tabs') child=h(Tabs,{'data-part':'control',tabs:[{value:'overview',label:'Overview'},{value:'settings',label:'Settings'},{value:'billing',label:'Billing'}],value:state==='settings'?'settings':state==='billing'?'billing':'overview',onValueChange:v=>log('valueChange',{value:v})});
 if(component==='table'){const rows=state==='empty'?[]:state==='error'?[h(Table.Row,{key:'r1'},h(Table.Cell,null,'Worker'),h(Table.Cell,null,'Failed'))]:[h(Table.Row,{key:'r1'},h(Table.Cell,null,'Worker'),h(Table.Cell,null,'Active')),h(Table.Row,{key:'r2'},h(Table.Cell,null,'Bucket'),h(Table.Cell,null,'Ready'))];child=h(Table,{'data-part':'control'},h(Table.Header,null,h(Table.Row,null,h(Table.Head,null,'Name'),h(Table.Head,null,'Status'))),h(Table.Body,null,...rows));}
 if(component==='table-of-contents') child=h(TableOfContents,{'data-part':'control'},h(TableOfContents.Title,null,'On this page'),h(TableOfContents.List,null,h(TableOfContents.Item,{href:'#intro',active:state==='intro'},'Introduction'),h(TableOfContents.Item,{href:'#usage',active:state==='usage'},'Usage')));
 if(component==='input-group') child=h(InputGroup,{'data-part':'control'},h(InputGroup.Addon,null,'https://'),h(InputGroup.Input,{placeholder:'example',defaultValue:state==='filled'?'mysite':undefined,disabled:state==='disabled'}),h(InputGroup.Suffix,null,'.com'));
 if(component==='sensitive-input') child=h(SensitiveInput,{'data-part':'control',label:'API Key',defaultValue:state==='empty'?'':'sk_live_abc123',disabled:state==='disabled'});
 if(component==='select') child=h(Select,{'data-part':'control','aria-label':'Country',defaultValue:state==='selected'?'us':undefined,disabled:state==='disabled'},h(Select.Option,{value:'us'},'United States'),h(Select.Option,{value:'uk'},'United Kingdom'));
 if(component==='dialog') child=h(Dialog.Root,{defaultOpen:state==='open'},h(Dialog.Trigger,{'data-part':'trigger',onClick:()=>log('click')},'Open dialog'),h(Dialog,{'data-part':'content'},h(Dialog.Title,null,'Confirm action'),h(Dialog.Description,null,'Are you sure?'),h(Dialog.Close,{'data-part':'close'},'Cancel')));
 if(component==='dropdown-menu') child=h(DropdownMenu,{defaultOpen:state==='open'},h(DropdownMenu.Trigger,{'data-part':'trigger',onClick:()=>log('click')},'Menu'),h(DropdownMenu.Content,{'data-part':'content'},h(DropdownMenu.Item,null,'Edit'),h(DropdownMenu.Item,null,'Duplicate'),h(DropdownMenu.Separator),h(DropdownMenu.Item,null,'Delete')));
 return h('main',{'data-component':component,'data-state':state,'data-part':'root',className:'p-8'},child);
}
if(typeof document!=='undefined'){
 globalThis.__events=[];
 const root=document.getElementById('root'),props=JSON.parse(root.dataset.props);
 hydrateRoot(root,h(App,props));
 globalThis.__hydrated=true;
}
