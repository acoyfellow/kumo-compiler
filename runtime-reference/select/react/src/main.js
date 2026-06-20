import React, {useState} from 'react';
import {hydrateRoot} from 'react-dom/client';
import '../../../public/styles.css';

export const cases=[
 {label:'Extra small',size:'xs',placeholder:'Choose fruit'}, {label:'Small',size:'sm',value:'Apple'},
 {label:'Base',size:'base',placeholder:'Choose fruit',description:'Choose the closest region.'}, {label:'Large',size:'lg',value:'Cherry'},
 {label:'Loading',loading:true,placeholder:'Loading…'}, {label:'Hidden label',hideLabel:true,placeholder:'Hidden label'},
 {label:'Disabled',disabled:true,placeholder:'Unavailable'}, {label:'Error',placeholder:'Select an option',error:'Selection required'}
];
const options=['Apple','Banana','Cherry'];
export function ReactSelect(p){
 const [open,setOpen]=useState(false),[selected,setSelected]=useState(p.value||'');
 const id=(p.label||'select').toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-listbox';
 const key=e=>{if(['ArrowDown','Enter',' '].includes(e.key)){e.preventDefault();setOpen(true)}else if(e.key==='Escape')setOpen(false)};
 const choose=o=>{setSelected(o);setOpen(false)};
 return React.createElement('div',{className:'kumo-field'},
  React.createElement('label',{htmlFor:id+'-trigger',className:p.hideLabel?'sr-only':undefined},p.label),
  React.createElement('button',{type:'button',role:'combobox',id:id+'-trigger','aria-controls':id,'aria-expanded':open,'aria-haspopup':'listbox','aria-busy':p.loading||undefined,'aria-invalid':p.error?true:undefined,disabled:p.disabled||p.loading,onClick:()=>setOpen(!open),onKeyDown:key,className:`kumo-trigger ${p.size||'base'}`},React.createElement('span',null,selected||p.placeholder),React.createElement('svg',{'aria-hidden':'true',width:16,height:16,viewBox:'0 0 16 16'},React.createElement('path',{fill:'currentColor',d:'m4 6 4 4 4-4z'}))),
  open&&React.createElement('ul',{id,role:'listbox'},options.map(o=>React.createElement('li',{key:o,role:'option','aria-selected':selected===o,tabIndex:-1,onClick:()=>choose(o),onKeyDown:e=>['Enter',' '].includes(e.key)&&choose(o)},o))),
  p.error?React.createElement('p',{className:'error'},p.error):p.description?React.createElement('p',{className:'description'},p.description):null);
}
export function App(){return React.createElement('main',{className:'shell'},React.createElement('h1',{className:'title'},'Select'),React.createElement('section',{className:'matrix'},cases.map((p,i)=>React.createElement(ReactSelect,{...p,key:i}))));}
hydrateRoot(document.getElementById('app'),React.createElement(App));
