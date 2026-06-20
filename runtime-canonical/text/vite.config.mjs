import {defineConfig} from 'vite';
export default defineConfig({root:import.meta.dirname,base:'/text/react/',build:{outDir:'public-runtime',emptyOutDir:true}});
