<script setup lang="ts">
import {ref} from 'vue';
const options=[];const value=ref("2026-06-19");const query=ref('');const open=ref(false);const message=ref('Ready');const page=ref(1);const range=['',''];const start=ref(range[0]);const end=ref(range[1]);
const matches=(label:string)=>label.toLowerCase().includes(query.value.toLowerCase());function choose(label:string){value.value=label;query.value=label;open.value=false}function key(event:KeyboardEvent){if(event.key==='Escape')open.value=false;else if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();open.value=true}}
</script>
<template>
<main class="family"><h1>DatePicker</h1><label for="date">Deploy date<input id="date" type="date" value="2026-06-19" v-model="value"></input></label></main>
</template>
