import {defineConfig} from 'vite';
export default defineConfig({root:import.meta.dirname,base:'/label/react/',build:{outDir:'public-runtime',emptyOutDir:true}});
