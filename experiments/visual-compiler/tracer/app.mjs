import React from 'react';
import {hydrateRoot} from 'react-dom/client';
import {Button} from '@cloudflare/kumo/components/button';
import {Checkbox} from '@cloudflare/kumo/components/checkbox';
import {Field} from '@cloudflare/kumo/components/field';
import {Popover} from '@cloudflare/kumo/components/popover';

const h=React.createElement;
export function App({component,state}){
 const log=(type,detail={})=>globalThis.__events?.push({type,...detail});
 let child;
 if(component==='button') child=h(Button,{'data-part':'control',disabled:state==='disabled',loading:state==='loading',onClick:()=>log('click')},state==='loading'?'Loading':'Continue');
 if(component==='checkbox') child=h(Checkbox,{'data-part':'control',label:'Accept terms',checked:state==='checked',indeterminate:state==='indeterminate',onCheckedChange:v=>log('checkedChange',{value:v})});
 if(component==='field') child=h(Field,{label:'Project name',description:'Visible to your team.',error:state==='error'?{message:'Required',match:true}:undefined},h('input',{'data-part':'control',className:'h-9 rounded-lg px-3 ring ring-kumo-line',defaultValue:'Kumo',disabled:state==='disabled',onInput:e=>log('input',{value:e.currentTarget.value})}));
 if(component==='popover') child=h(Popover,{defaultOpen:state==='open'},h(Popover.Trigger,{'data-part':'trigger',onClick:()=>log('click')},'Toggle'),h(Popover.Content,{'data-part':'content'},h(Popover.Title,null,'Options'),h(Popover.Description,null,'Popover content'),h(Popover.Close,{'data-part':'close'},'Close')));
 return h('main',{'data-component':component,'data-state':state,'data-part':'root',className:'p-8'},child);
}
if(typeof document!=='undefined'){
 globalThis.__events=[];
 const root=document.getElementById('root'),props=JSON.parse(root.dataset.props);
 hydrateRoot(root,h(App,props));
 globalThis.__hydrated=true;
}
