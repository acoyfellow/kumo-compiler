import {defineConfig} from 'vite';
export default defineConfig({root:import.meta.dirname,base:'/badge/react/',build:{outDir:'public-runtime',emptyOutDir:true}});
