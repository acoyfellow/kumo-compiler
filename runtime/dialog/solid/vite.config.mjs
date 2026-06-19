import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  base: '/dialog/solid/',
  plugins: [solid()],
  build: { outDir: 'public-runtime', emptyOutDir: true },
});
