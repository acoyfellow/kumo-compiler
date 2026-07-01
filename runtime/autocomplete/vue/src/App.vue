<script setup lang="ts">
import {ref} from 'vue';
const options=["Apple","Banana","Cherry"];const value=ref("");const query=ref('');const open=ref(false);const message=ref('Ready');const page=ref(1);const range=['',''];const start=ref(range[0]);const end=ref(range[1]);
const matches=(label:string)=>label.toLowerCase().includes(query.value.toLowerCase());function choose(label:string){value.value=label;query.value=label;open.value=false}function key(event:KeyboardEvent){if(event.key==='Escape')open.value=false;else if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();open.value=true}}
</script>
<template>
<main class="family"><h1>Autocomplete</h1><section><label for="search">Fruit</label><input id="search" role="combobox" aria-autocomplete="list" aria-controls="fruit-list" placeholder="Search fruit" v-model="query" :aria-expanded="open" @focus="open=true" @keydown="key($event)"></input><ul id="fruit-list" role="listbox" v-show="open"><li role="option" tabindex="-1" v-show="matches('Apple')" @click="choose('Apple')">Apple</li><li role="option" tabindex="-1" v-show="matches('Banana')" @click="choose('Banana')">Banana</li><li role="option" tabindex="-1" v-show="matches('Cherry')" @click="choose('Cherry')">Cherry</li></ul></section></main>
</template>
