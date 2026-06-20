import {defineConfig} from 'vite';
export default defineConfig({root:import.meta.dirname,base:'/table-of-contents/react/',build:{outDir:'public-runtime',emptyOutDir:true}});
