<script setup lang="ts">
import {ref} from 'vue';
const options=["Edit","Duplicate","Delete"];const value=ref("");const query=ref('');const open=ref(false);const message=ref('Ready');const page=ref(1);const range=['',''];const start=ref(range[0]);const end=ref(range[1]);
const matches=(label:string)=>label.toLowerCase().includes(query.value.toLowerCase());function choose(label:string){value.value=label;query.value=label;open.value=false}function key(event:KeyboardEvent){if(event.key==='Escape')open.value=false;else if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();open.value=true}}
</script>
<template>
<main class="family"><h1>DropdownMenu</h1><section><button class="menu-button" aria-haspopup="menu" :aria-expanded="open" @click="open=!open" @keydown="key($event)">Actions</button><div class="menu" role="menu" v-show="open"><button role="menuitem" tabindex="-1" @click="choose('Edit')">Edit</button><button role="menuitem" tabindex="-1" @click="choose('Duplicate')">Duplicate</button><button role="menuitem" tabindex="-1" @click="choose('Delete')">Delete</button></div></section></main>
</template>
