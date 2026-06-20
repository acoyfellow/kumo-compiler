import {defineComponent,h,ref} from 'vue';
import {buttonView,fieldView,initialTabs,tabsView,type NativeNode} from '../native.js';
const render=(v:NativeNode):any=>h(v.tag,{...v.attrs,...Object.fromEntries(Object.entries(v.events??{}).map(([k,f])=>[`on${k[0]!.toUpperCase()}${k.slice(1)}`,f]))},()=>v.children.map(x=>typeof x==='string'?x:render(x)));
export const Button=defineComponent({name:'KumoButton',props:['id','label','disabled','onPress'],setup:p=>()=>render(buttonView(p as any))});
export const Field=defineComponent({name:'KumoField',props:['id','label','value','invalid','error','onInput'],setup:p=>()=>render(fieldView(p as any))});
export const Tabs=defineComponent({name:'KumoTabs',props:['id','items','initial','activation','onChange'],setup(p){const s=ref(initialTabs(p as any));return()=>render(tabsView(p as any,s.value,x=>s.value=x))}});
export const boundary={nativeLines:7,escapeHatches:[]};
