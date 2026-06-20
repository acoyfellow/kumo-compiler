import {defineConfig} from 'vite';
export default defineConfig({
 base:'/select/react/',
 build:{
  outDir:'public-runtime',emptyOutDir:true,
  rollupOptions:{input:'src/main.js',output:{entryFileNames:'assets/react-select.js',assetFileNames:'assets/[name][extname]'}}
 }
});
