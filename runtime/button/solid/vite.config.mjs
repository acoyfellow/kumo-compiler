import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  base: '/button/solid/',
  plugins: [solid()],
  build: { outDir: 'public-runtime', emptyOutDir: true },
});
