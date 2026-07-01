<script setup lang="ts">
import {ref} from 'vue';
const current=ref('Overview');
</script>
<template>
<main class="nav-shell"><h1>Sidebar</h1><nav class="sidebar" aria-label="Workspace"><a href="#overview" aria-current="page" :aria-current="current === 'Overview' ? 'page' : undefined" @click="current = 'Overview'">Overview</a><a href="#members" :aria-current="current === 'Members' ? 'page' : undefined" @click="current = 'Members'">Members</a><a href="#settings" :aria-current="current === 'Settings' ? 'page' : undefined" @click="current = 'Settings'">Settings</a></nav></main>
</template>
