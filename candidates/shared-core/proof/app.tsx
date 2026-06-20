import './app.css';
import {fixture} from './fixtures.mjs';
const framework=(globalThis as any).__FRAMEWORK__;
const component=(globalThis as any).__COMPONENT__;
export const props:any=component==='button'?{id:'save',label:'Save',onPress:()=>{document.body.dataset.pressed=String(+(document.body.dataset.pressed||0)+1)}}:component==='field'?{...fixture.field,onInput:(v:string)=>document.body.dataset.value=v}:{...fixture.tabs,onChange:(i:number)=>document.body.dataset.tab=String(i)};
export async function load(){
 if(framework==='react'){const R=await import('react');const {hydrateRoot}=await import('react-dom/client');const C=(await import('../src/views/react/index.ts'))[component[0].toUpperCase()+component.slice(1)];return {ssr:async()=>{const {renderToString}=await import('react-dom/server');return renderToString(R.createElement(C,props))},hydrate:()=>hydrateRoot(document.querySelector('#app')!,R.createElement(C,props))}}
 if(framework==='vue'){const {createSSRApp,h}=await import('vue');const {renderToString}=await import('@vue/server-renderer');const C=(await import('../src/views/vue/index.ts'))[component[0].toUpperCase()+component.slice(1)];return {ssr:()=>renderToString(createSSRApp({render:()=>h(C,props)})),hydrate:()=>createSSRApp({render:()=>h(C,props)}).mount('#app')}}
 if(framework==='solid'){const {createComponent}=await import('solid-js');const C=(await import('../src/views/solid/components.tsx'))[component[0].toUpperCase()+component.slice(1)];return {ssr:async()=>{const {renderToString}=await import('solid-js/web');return renderToString(()=>createComponent(C,props))},hydrate:async()=>{const {hydrate}=await import('solid-js/web');hydrate(()=>createComponent(C,props),document.querySelector('#app')!)}}}
 const mod=await import(`../src/views/svelte/${component[0].toUpperCase()+component.slice(1)}.svelte`);const C=mod.default;return {ssr:async()=>{const {render}=await import('svelte/server');return render(C,{props}).body},hydrate:async()=>{const {hydrate}=await import('svelte');hydrate(C,{target:document.querySelector('#app')!,props})}};
}
if(typeof document!=='undefined') load().then(x=>x.hydrate()).catch(e=>console.error(e));
