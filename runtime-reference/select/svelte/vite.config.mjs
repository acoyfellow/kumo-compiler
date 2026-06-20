import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  base: '/select/svelte/',
  plugins: [svelte()],
  build: { outDir: 'public-runtime', emptyOutDir: true },
});
