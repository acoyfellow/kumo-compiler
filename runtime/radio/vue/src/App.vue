<script setup lang="ts">
import {ref} from 'vue';
const options=["Free","Pro"];const value=ref("Free");const query=ref('');const open=ref(false);const message=ref('Ready');const page=ref(1);const range=['',''];const start=ref(range[0]);const end=ref(range[1]);
const matches=(label:string)=>label.toLowerCase().includes(query.value.toLowerCase());function choose(label:string){value.value=label;query.value=label;open.value=false}function key(event:KeyboardEvent){if(event.key==='Escape')open.value=false;else if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();open.value=true}}
</script>
<template>
<main class="family"><h1>Radio</h1><fieldset><legend>Plan</legend><label><input type="radio" name="plan" value="Free" checked v-model="value"></input> Free</label><label><input type="radio" name="plan" value="Pro" v-model="value"></input> Pro</label></fieldset></main>
</template>
