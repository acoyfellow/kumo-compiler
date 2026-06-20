import {defineConfig} from 'vite';
export default defineConfig({root:import.meta.dirname,base:'/cloudflare-logo/react/',build:{outDir:'public-runtime',emptyOutDir:true}});
