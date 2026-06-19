import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  base: '/dialog/svelte/',
  plugins: [svelte()],
  build: { outDir: 'public-runtime', emptyOutDir: true },
});
