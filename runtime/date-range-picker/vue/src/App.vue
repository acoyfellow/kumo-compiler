<script setup lang="ts">
import {ref} from 'vue';
const options=[];const value=ref(["2026-06-19","2026-06-26"]);const query=ref('');const open=ref(false);const message=ref('Ready');const page=ref(1);const range=["2026-06-19","2026-06-26"];const start=ref(range[0]);const end=ref(range[1]);
const matches=(label:string)=>label.toLowerCase().includes(query.value.toLowerCase());function choose(label:string){value.value=label;query.value=label;open.value=false}function key(event:KeyboardEvent){if(event.key==='Escape')open.value=false;else if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();open.value=true}}
</script>
<template>
<main class="family"><h1>DateRangePicker</h1><section><label>Start <input class="start" type="date" v-model="start"></input></label><label>End <input class="end" type="date" v-model="end"></input></label></section></main>
</template>
