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
 return h('main',{'data-component':component,'data-state':state,'data-part':'root',className:'p-8'},child);
}
if(typeof document!=='undefined'){
 globalThis.__events=[];
 const root=document.getElementById('root'),props=JSON.parse(root.dataset.props);
 hydrateRoot(root,h(App,props));
 globalThis.__hydrated=true;
}
