import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  base: '/popover/vue/',
  plugins: [vue()],
  build: { outDir: 'public-runtime', emptyOutDir: true },
});
