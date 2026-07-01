<script setup lang="ts">
import {ref} from 'vue';
const options=[];const value=ref(1);const query=ref('');const open=ref(false);const message=ref('Ready');const page=ref(1);const range=['',''];const start=ref(range[0]);const end=ref(range[1]);
const matches=(label:string)=>label.toLowerCase().includes(query.value.toLowerCase());function choose(label:string){value.value=label;query.value=label;open.value=false}function key(event:KeyboardEvent){if(event.key==='Escape')open.value=false;else if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();open.value=true}}
</script>
<template>
<main class="family"><h1>Pagination</h1><nav class="pagination" aria-label="Pagination"><button aria-label="Previous page">‹</button><button class="page" aria-current="page" :aria-current="page === 1 ? 'page' : undefined" @click="page=1">1</button><button class="page" :aria-current="page === 2 ? 'page' : undefined" @click="page=2">2</button><button class="page" :aria-current="page === 3 ? 'page' : undefined" @click="page=3">3</button><button aria-label="Next page">›</button></nav></main>
</template>
