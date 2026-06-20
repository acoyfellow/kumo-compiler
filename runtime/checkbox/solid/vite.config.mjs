import solid from 'vite-plugin-solid';
import {defineConfig} from 'vite';
export default defineConfig({base:'./',plugins:[solid({ssr:true})],build:{outDir:'public-runtime',emptyOutDir:true,rollupOptions:{output:{entryFileNames:'assets/solid-checkbox.js'}}}});
