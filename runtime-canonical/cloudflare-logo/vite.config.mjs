import {defineConfig} from 'vite';
export default defineConfig({root:import.meta.dirname,base:'/cloudflare-logo/react/',resolve:{dedupe:['react','react-dom']},ssr:{noExternal:['@cloudflare/kumo']},build:{outDir:'public-runtime',emptyOutDir:true}});
