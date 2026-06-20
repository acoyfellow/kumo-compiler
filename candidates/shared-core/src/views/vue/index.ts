import {defineComponent,h,ref} from 'vue';
import {buttonView,fieldView,initialTabs,tabsView,type NativeNode} from '../native.js';
const render=(v:NativeNode):any=>h(v.tag,{...v.attrs,...Object.fromEntries(Object.entries(v.events??{}).map(([k,f])=>[`on${k[0]!.toUpperCase()}${k.slice(1)}`,f]))},v.children.map(x=>typeof x==='string'?x:render(x)));
export const Button=defineComponent({name:'KumoButton',props:['id','label','disabled','onPress'],emits:['press'],setup(p,{emit}){return()=>render(buttonView({...p,onPress:()=>emit('press')} as any))}});
export const Field=defineComponent({name:'KumoField',props:['id','label','value','invalid','error','onInput'],emits:['input'],setup(p,{emit}){return()=>render(fieldView({...p,onInput:(value:string)=>emit('input',value)} as any))}});
export const Tabs=defineComponent({name:'KumoTabs',props:['id','items','initial','activation','onChange'],emits:['change'],setup(p,{emit}){const s=ref(initialTabs(p as any));return()=>render(tabsView(p as any,s.value,x=>{s.value=x;emit('change',x.active)}))}});
export const boundary={nativeLines:7,escapeHatches:[]};
