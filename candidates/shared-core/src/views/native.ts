import {aria,tabs as reduceTabs,type TabsState} from '../index.js';

export interface ButtonProps { id?:string; disabled?:boolean; label:string; onPress?:()=>void }
export interface FieldProps { id:string; label:string; value?:string; invalid?:boolean; error?:string; onInput?:(value:string)=>void }
export interface TabItem { id:string; label:string; disabled?:boolean; panel:string }
export interface TabsProps { id:string; items:readonly TabItem[]; initial?:number; activation?:'automatic'|'manual'; onChange?:(index:number)=>void }
export type NativeNode={tag:string;attrs:Record<string,unknown>;children:(NativeNode|string)[];events?:Record<string,(event:any)=>void>};
const node=(tag:string,attrs:Record<string,unknown>,children:(NativeNode|string)[],events?:NativeNode['events']):NativeNode=>({tag,attrs,children,events});
export const buttonView=(p:ButtonProps)=>node('button',{id:p.id,...aria.button(p.disabled),class:'kumo-button'},[p.label],{click:()=>{if(!p.disabled)p.onPress?.()}});
export const fieldView=(p:FieldProps)=>node('div',{class:'kumo-field'},[
 node('label',{for:p.id},[p.label]),node('input',{...aria.field(p.id,p.invalid),value:p.value??'',class:'kumo-input'},[],{input:e=>p.onInput?.(e.target.value)}),
 ...(p.invalid?[node('div',{id:`${p.id}-error`,role:'alert'},[p.error??'Invalid value'])]:[])
]);
export function tabsView(p:TabsProps,state:TabsState,set:(s:TabsState)=>void){const select=(index:number)=>{const next=reduceTabs(state,{type:'select',index},p.items);set(next);if(next.active!==state.active)p.onChange?.(next.active)};const key=(e:any)=>{const next=reduceTabs(state,{type:'key',key:e.key},p.items);set(next);if(next.active!==state.active)p.onChange?.(next.active)};return node('div',{class:'kumo-tabs'},[node('div',{role:'tablist'},p.items.map((x,i)=>node('button',{...aria.tab(`${p.id}-${x.id}`,i===state.active),disabled:x.disabled},[x.label],{click:()=>select(i),keydown:key}))),...p.items.map((x,i)=>node('div',{...aria.tabpanel(`${p.id}-${x.id}`),hidden:i!==state.active},[x.panel]))])}
export const initialTabs=(p:TabsProps):TabsState=>({active:p.initial??0,focus:p.initial??0,activation:p.activation??'automatic'});
