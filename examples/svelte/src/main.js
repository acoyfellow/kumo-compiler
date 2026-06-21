import { mount } from 'svelte';
import App from './App.svelte';
import '@cloudflare/kumo-svelte/styles.css';
mount(App, { target: document.getElementById('app') });
