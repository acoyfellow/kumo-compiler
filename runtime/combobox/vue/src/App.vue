<script setup lang="ts">
import {ref} from 'vue';
const options=["North America","Europe"];const value=ref("");const query=ref('');const open=ref(false);const message=ref('Ready');const page=ref(1);const range=['',''];const start=ref(range[0]);const end=ref(range[1]);
const matches=(label:string)=>label.toLowerCase().includes(query.value.toLowerCase());function choose(label:string){value.value=label;query.value=label;open.value=false}function key(event:KeyboardEvent){if(event.key==='Escape')open.value=false;else if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();open.value=true}}
</script>
<template>
<main class="family"><h1>Combobox</h1><section><button class="combo" role="combobox" aria-controls="region-list" :aria-expanded="open" @click="open=!open" @keydown="key($event)">Choose region</button><ul id="region-list" role="listbox" v-show="open"><li role="option" tabindex="-1" @click="choose('North America')">North America</li><li role="option" tabindex="-1" @click="choose('Europe')">Europe</li></ul></section></main>
</template>
