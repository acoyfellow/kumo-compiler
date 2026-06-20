import {defineConfig} from 'vite';
export default defineConfig({root:import.meta.dirname,base:'/meter/react/',build:{outDir:'public-runtime',emptyOutDir:true}});
