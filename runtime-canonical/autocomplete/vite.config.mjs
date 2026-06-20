import {defineConfig} from 'vite';
export default defineConfig({root:import.meta.dirname,base:'/autocomplete/react/',build:{outDir:'public-runtime',emptyOutDir:true}});
