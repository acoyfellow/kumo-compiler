<script setup lang="ts">
import {nextTick,ref} from 'vue';
const labels=["File","Edit","View"];const active=ref(labels[0]);
function activate(label:string){active.value=label}
async function navigate(event:KeyboardEvent,label:string){let index=labels.indexOf(label);if(event.key==='ArrowRight')index=(index+1)%labels.length;else if(event.key==='ArrowLeft')index=(index-1+labels.length)%labels.length;else if(event.key==='Home')index=0;else if(event.key==='End')index=labels.length-1;else if(false&&(event.key==='Enter'||event.key===' ')){activate(label);return}else return;event.preventDefault();active.value=labels[index];await nextTick();(event.currentTarget?.parentElement?.querySelectorAll('[role=menuitem]')[index] as HTMLElement)?.focus()}
</script>
<template>
<main class="nav-shell"><h1>MenuBar</h1><div class="menubar" role="menubar" aria-label="Application"><button role="menuitem" tabindex="0" :tabindex="active === 'File' ? 0 : -1" @click="activate('File')" @keydown="navigate($event, 'File')">File</button><button role="menuitem" tabindex="-1" :tabindex="active === 'Edit' ? 0 : -1" @click="activate('Edit')" @keydown="navigate($event, 'Edit')">Edit</button><button role="menuitem" tabindex="-1" :tabindex="active === 'View' ? 0 : -1" @click="activate('View')" @keydown="navigate($event, 'View')">View</button></div></main>
</template>
