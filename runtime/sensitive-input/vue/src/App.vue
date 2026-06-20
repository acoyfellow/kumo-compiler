<script setup lang="ts">
import {ref} from 'vue';
const revealed=ref(false);
</script>
<template>
<main class="form-shell"><h1>SensitiveInput</h1><section class="form-grid"><article class="form-card" data-member="sensitive-input"><label class="field" for="secret"><span>API token</span><span class="row"><input class="control" id="secret" type="password" value="secret-123" :type="revealed ? 'text' : 'password'"></input><button class="action reveal" type="button" aria-pressed="false" :aria-pressed="revealed" @click="revealed = !revealed">{{revealed ? 'Hide' : 'Show'}}</button></span></label></article></section></main>
</template>
