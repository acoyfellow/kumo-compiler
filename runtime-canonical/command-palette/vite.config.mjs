import {defineConfig} from 'vite';
export default defineConfig({root:import.meta.dirname,base:'/command-palette/react/',build:{outDir:'public-runtime',emptyOutDir:true}});
