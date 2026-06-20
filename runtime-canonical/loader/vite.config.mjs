import {defineConfig} from 'vite';
export default defineConfig({root:import.meta.dirname,base:'/loader/react/',build:{outDir:'public-runtime',emptyOutDir:true}});
