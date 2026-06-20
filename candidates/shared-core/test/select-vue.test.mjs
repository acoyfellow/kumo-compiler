import test from 'node:test';
import assert from 'node:assert/strict';
import {createSSRApp,h} from 'vue';
import {renderToString} from '@vue/server-renderer';
import {KumoSelect,KumoSelectLabel,KumoSelectTrigger,KumoSelectValue,KumoSelectListbox,KumoSelectOption,boundary} from '../dist/views/select/vue/index.js';

test('Vue Select SSR renders native contract elements and stable aria',async()=>{
  const app=createSSRApp({render:()=>h(KumoSelect,{id:'fixture',defaultValue:'a',defaultOpen:true},()=>[
    h(KumoSelectLabel,()=> 'Letters'),h(KumoSelectTrigger,()=>h(KumoSelectValue)),
    h(KumoSelectListbox,()=>h(KumoSelectOption,{id:'a',value:'a',label:'Alpha'})),
  ])});
  const html=await renderToString(app);
  assert.match(html,/<label id="kumo-select-fixture-label">Letters<\/label>/);
  assert.match(html,/<button[^>]+role="combobox"[^>]+aria-expanded="true"/);
  assert.match(html,/<ul[^>]+role="listbox"/);
  assert.match(html,/<li[^>]+role="option"[^>]+aria-selected="true"[^>]*>Alpha<\/li>/);
  assert.deepEqual(boundary.escapeHatches,[]);
});
