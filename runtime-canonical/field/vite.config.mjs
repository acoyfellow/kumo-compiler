import {defineConfig} from 'vite';
export default defineConfig({root:import.meta.dirname,base:'/field/react/',build:{outDir:'public-runtime',emptyOutDir:true}});
