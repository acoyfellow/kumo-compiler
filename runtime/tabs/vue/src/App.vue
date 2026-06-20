<script setup lang="ts">
import {nextTick,ref} from 'vue';
const labels=["Overview","Activity","Settings"];const active=ref(labels[0]);
function activate(label:string){active.value=label}
async function navigate(event:KeyboardEvent,label:string){let index=labels.indexOf(label);if(event.key==='ArrowRight')index=(index+1)%labels.length;else if(event.key==='ArrowLeft')index=(index-1+labels.length)%labels.length;else if(event.key==='Home')index=0;else if(event.key==='End')index=labels.length-1;else if(true&&(event.key==='Enter'||event.key===' ')){activate(label);return}else return;event.preventDefault();active.value=labels[index];await nextTick();(event.currentTarget?.parentElement?.querySelectorAll('[role=tab]')[index] as HTMLElement)?.focus()}
</script>
<template>
<main class="nav-shell"><h1>Tabs</h1><section><div class="tabs" role="tablist" aria-label="Account"><button role="tab" aria-selected tabindex="0" :tabindex="active === 'Overview' ? 0 : -1" :aria-selected="active === 'Overview'" @click="activate('Overview')" @keydown="navigate($event, 'Overview')">Overview</button><button role="tab" tabindex="-1" :tabindex="active === 'Activity' ? 0 : -1" :aria-selected="active === 'Activity'" @click="activate('Activity')" @keydown="navigate($event, 'Activity')">Activity</button><button role="tab" tabindex="-1" :tabindex="active === 'Settings' ? 0 : -1" :aria-selected="active === 'Settings'" @click="activate('Settings')" @keydown="navigate($event, 'Settings')">Settings</button></div><div class="panel" role="tabpanel">{{active}} content</div></section></main>
</template>
