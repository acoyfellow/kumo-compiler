import {createSignal} from 'solid-js';
import {Dynamic} from 'solid-js/web';
import {buttonView,fieldView,initialTabs,tabsView,type NativeNode} from '../native.js';
const Render=(p:{view:NativeNode}):any=><Dynamic component={p.view.tag} {...p.view.attrs} {...p.view.events}>{p.view.children.map(x=>typeof x==='string'?x:<Render view={x}/>)}</Dynamic>;
export const Button=(p:any)=><Render view={buttonView(p)}/>;
export const Field=(p:any)=><Render view={fieldView(p)}/>;
export const Tabs=(p:any)=>{const [s,set]=createSignal(initialTabs(p));return <Render view={tabsView(p,s(),set)}/>};
export const boundary={nativeLines:8,escapeHatches:[]};
