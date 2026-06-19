import { readFile, mkdir, writeFile } from 'node:fs/promises';

const spec = JSON.parse(await readFile(new URL('../specs/select.json', import.meta.url), 'utf8'));
const options = spec.items.map((item) => `<option>${item}</option>`).join('');
const css = `body{font:16px system-ui;background:#0b1118;color:#f7f9fb;padding:24px}.kumo-label{display:grid;gap:8px;font-weight:700;margin-bottom:24px}.kumo-control{height:42px;padding:0 12px;border:1px solid #66707b;border-radius:8px;background:#fff;color:#111;font-size:16px}.kumo-error{color:#ff4d4f}.kumo-description{color:#aab4c0}`;

const vue = `<script setup>\nconst p = defineProps({ label:String, disabled:Boolean, value:String, placeholder:String, error:String, description:String })\n</script>\n<template><label class="kumo-label">{{ p.label }}<select class="kumo-control" :disabled="p.disabled" :value="p.value"><option v-if="p.placeholder" disabled>{{ p.placeholder }}</option>${options}</select><span v-if="p.error" class="kumo-error">{{ p.error }}</span><span v-else-if="p.description" class="kumo-description">{{ p.description }}</span></label></template>\n`;
const svelte = `<script>\nexport let label=''; export let disabled=false; export let value=''; export let placeholder=''; export let error=''; export let description='';\n</script>\n<label class="kumo-label">{label}<select class="kumo-control" {disabled} bind:value>{#if placeholder}<option disabled>{placeholder}</option>{/if}${options}</select>{#if error}<span class="kumo-error">{error}</span>{:else if description}<span class="kumo-description">{description}</span>{/if}</label>\n`;
const solid = `import { Show } from 'solid-js';\n\nexport default function Select(p) {\n  return <label class="kumo-label">{p.label}<select class="kumo-control" disabled={p.disabled} value={p.value}><Show when={p.placeholder}><option disabled>{p.placeholder}</option></Show>${options}</select><Show when={p.error}><span class="kumo-error">{p.error}</span></Show><Show when={!p.error && p.description}><span class="kumo-description">{p.description}</span></Show></label>;\n}\n`;

for (const framework of ['vue', 'svelte', 'solid']) await mkdir(`runtime/${framework}/src`, { recursive: true });
await writeFile('runtime/vue/src/Select.vue', vue);
await writeFile('runtime/svelte/src/Select.svelte', svelte);
await writeFile('runtime/solid/src/Select.tsx', solid);
await writeFile('public/styles.css', css);
console.log('generated Select runtime sources for vue/svelte/solid');
