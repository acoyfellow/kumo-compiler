import {defineConfig} from 'vite';
export default defineConfig({root:import.meta.dirname,base:'/surface/react/',build:{outDir:'public-runtime',emptyOutDir:true}});
