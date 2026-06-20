import {defineConfig} from 'vite';
export default defineConfig({root:import.meta.dirname,base:'/empty/react/',build:{outDir:'public-runtime',emptyOutDir:true}});
