import React,{useState} from 'react';
import {buttonView,fieldView,initialTabs,tabsView,type ButtonProps,type FieldProps,type TabsProps,type NativeNode} from '../native.js';
const render=(v:NativeNode):any=>React.createElement(v.tag,{...v.attrs,...Object.fromEntries(Object.entries(v.events??{}).map(([k,f])=>[`on${k[0]!.toUpperCase()}${k.slice(1)}`,f]))},...v.children.map((x,i)=>typeof x==='string'?x:React.cloneElement(render(x),{key:i})));
export const Button=(p:ButtonProps)=>render(buttonView(p));
export const Field=(p:FieldProps)=>render(fieldView(p));
export const Tabs=(p:TabsProps)=>{const [state,setState]=useState(initialTabs(p));return render(tabsView(p,state,setState))};
export const boundary={nativeLines:6,escapeHatches:[]};
export type {ButtonProps,FieldProps,TabsProps};
