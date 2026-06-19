import { createApp, h } from 'vue';
import Select from './Select.vue';
import '../../../public/styles.css';
const cases=[
 {label:'Extra small',size:'xs',placeholder:'Choose fruit'}, {label:'Small',size:'sm',value:'Apple'},
 {label:'Base',size:'base',placeholder:'Choose fruit',description:'Choose the closest region.'}, {label:'Large',size:'lg',value:'Cherry'},
 {label:'Loading',loading:true,placeholder:'Loading…'}, {label:'Hidden label',hideLabel:true,placeholder:'Hidden label'},
 {label:'Disabled',disabled:true,placeholder:'Unavailable'}, {label:'Error',placeholder:'Select an option',error:'Selection required'}
];
createApp({render:()=>h('main',{class:'shell'},[h('h1',{class:'title'},'Select'),h('section',{class:'matrix'},cases.map((p,i)=>h(Select,{...p,id:`select-${i}`})))])}).mount('#app');
