import { defineConfig } from 'astro/config';

export default defineConfig({
  vite: {
    server: {
      proxy: {
        '^/(?!components/|receipts/|_astro/|kumo\\.css$)([^/]+)/(react|vue|svelte|solid)(/.*)?$': {
          target: 'http://127.0.0.1:4301',
          changeOrigin: true,
        },
      },
    },
  },
});
