<script setup>
import { ref } from 'vue';
import { Button, Field } from '@cloudflare/kumo-vue';
const clicks = ref(0);
const project = ref('Workers');
</script>

<template>
  <main>
    <h1>Kumo Vue example</h1>
    <section><Button @click="clicks++">Clicked {{ clicks }}</Button> <Button disabled>Disabled</Button></section>
    <section><Field id="project" label="Project" description="Rendered by Kumo" required v-model="project" /><p>Model: {{ project }}</p></section>
  </main>
</template>

<style>body{margin:0;font:16px system-ui;background:#f5f6f8;color:#111827}main{display:grid;gap:20px;max-width:720px;margin:auto;padding:40px 20px}section{padding:20px;border:1px solid #d8dde5;border-radius:10px;background:#fff}</style>
