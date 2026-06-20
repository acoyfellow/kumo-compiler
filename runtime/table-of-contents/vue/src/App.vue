<script setup lang="ts">
import {ref} from 'vue';
const current=ref('Overview');
</script>
<template>
<main class="nav-shell"><h1>TableOfContents</h1><nav class="toc" aria-label="On this page"><a href="#overview" aria-current="location" :aria-current="current === 'Overview' ? 'location' : undefined" @click="current = 'Overview'">Overview</a><a href="#keyboard" :aria-current="current === 'Keyboard' ? 'location' : undefined" @click="current = 'Keyboard'">Keyboard</a><a href="#accessibility" :aria-current="current === 'Accessibility' ? 'location' : undefined" @click="current = 'Accessibility'">Accessibility</a></nav></main>
</template>
