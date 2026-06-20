<script setup lang="ts">
import {ref} from 'vue';
const options=[];const value=ref("Ready to save");const query=ref('');const open=ref(false);const message=ref("Ready to save");const page=ref(1);const range=['',''];const start=ref(range[0]);const end=ref(range[1]);
const matches=(label:string)=>label.toLowerCase().includes(query.value.toLowerCase());function choose(label:string){value.value=label;query.value=label;open.value=false}function key(event:KeyboardEvent){if(event.key==='Escape')open.value=false;else if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();open.value=true}}
</script>
<template>
<main class="family"><h1>Toasty</h1><section><button class="toast-button" @click="message='Changes saved'">Save changes</button><output class="toast" role="status" aria-live="polite">{{message}}</output></section></main>
</template>
