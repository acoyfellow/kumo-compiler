import {defineConfig} from 'vite';
export default defineConfig({root:import.meta.dirname,base:'/input-group/react/',resolve:{dedupe:['react','react-dom']},ssr:{noExternal:['@cloudflare/kumo']},build:{outDir:'public-runtime',emptyOutDir:true}});
