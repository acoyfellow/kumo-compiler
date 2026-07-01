<script setup lang="ts">
import {ref} from 'vue';
const status=ref('');
async function copyText(){const value='npm i kumo';try{await navigator.clipboard.writeText(value)}catch{const input=document.createElement('textarea');input.value=value;input.hidden=true;document.body.append(input);input.select();document.execCommand('copy');input.remove()}status.value='Copied npm i kumo'}
</script>
<template>
<main class="form-shell"><h1>ClipboardText</h1><section class="form-grid"><article class="form-card" data-member="clipboard-text"><div class="field"><label for="copy-value">Install command</label><span class="row"><input class="control" id="copy-value" readonly value="npm i kumo"></input><button class="action copy" type="button" @click="copyText" @keydown.enter.prevent="copyText">Copy</button></span><p class="status" role="status">{{status}}</p></div></article></section></main>
</template>
