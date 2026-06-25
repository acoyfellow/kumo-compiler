import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import solid from 'vite-plugin-solid'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'node:path'

// One page that mounts real native Vue + Svelte + Solid packages side by side.
// Each framework plugin compiles its own files; the entry orchestrates mounting.
// Root is site/; packages/ is symlinked in (site/packages -> ../packages) so import.meta.glob
// reaches them inside the root. Keeps dist flat (index.html at dist root).
export default defineConfig({
  root: resolve(import.meta.dirname),
  plugins: [
    vue({ include: [/packages\/vue\/.*\.vue$/, /\.vue$/] }),
    svelte({ include: [/packages\/svelte\/.*\.svelte$/, /\.svelte$/] }),
    solid({ include: [/packages\/solid\/.*\.tsx$/, /\.tsx$/] }),
  ],
  resolve: { dedupe: ["solid-js", "solid-js/web", "solid-js/store"] },
  build: { outDir: resolve(import.meta.dirname, 'dist'), emptyOutDir: true },
})
