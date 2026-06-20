import {createSSRApp, h} from 'vue';
import {renderToString} from '@vue/server-renderer';
import {KumoSelect,KumoSelectLabel,KumoSelectTrigger,KumoSelectValue,KumoSelectListbox,KumoSelectOption} from '../../../src/views/select/vue/index.js';

const app=createSSRApp({render:()=>h(KumoSelect,{id:'fixture',defaultValue:'a'},()=>[
  h(KumoSelectLabel,()=> 'Letters'),
  h(KumoSelectTrigger,()=>h(KumoSelectValue)),
  h(KumoSelectListbox,()=>h(KumoSelectOption,{id:'a',value:'a',label:'Alpha'})),
])});
void renderToString(app);
