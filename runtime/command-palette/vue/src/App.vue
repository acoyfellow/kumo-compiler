<script setup lang="ts">
import {ref} from 'vue';
const options=["Create project","Open settings"];const value=ref("");const query=ref('');const open=ref(false);const message=ref('Ready');const page=ref(1);const range=['',''];const start=ref(range[0]);const end=ref(range[1]);
const matches=(label:string)=>label.toLowerCase().includes(query.value.toLowerCase());function choose(label:string){value.value=label;query.value=label;open.value=false}function key(event:KeyboardEvent){if(event.key==='Escape')open.value=false;else if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();open.value=true}}
</script>
<template>
<main class="family"><h1>CommandPalette</h1><section><button class="command" aria-haspopup="dialog" @click="open=true">Open commands ⌘K</button><div class="palette" role="dialog" aria-modal aria-label="Command palette" v-show="open" @keydown.esc="open=false"><input aria-label="Filter commands" v-model="query"></input><ul role="listbox"><li role="option" tabindex="-1" v-show="matches('Create project')">Create project</li><li role="option" tabindex="-1" v-show="matches('Open settings')">Open settings</li></ul></div></section></main>
</template>
