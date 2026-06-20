import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  base: '/popover/solid/',
  plugins: [solid()],
  build: { outDir: 'public-runtime', emptyOutDir: true },
});
