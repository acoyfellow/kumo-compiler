import {defineConfig} from 'vite';
export default defineConfig({root:import.meta.dirname,base:'/toasty/react/',build:{outDir:'public-runtime',emptyOutDir:true}});
