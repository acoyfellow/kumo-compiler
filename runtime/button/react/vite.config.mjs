import {defineConfig} from 'vite';
export default defineConfig({
 base:'/button/react/',
 build:{
  outDir:'public-runtime',emptyOutDir:true,
  rollupOptions:{input:'src/main.js',output:{entryFileNames:'assets/react-button.js',assetFileNames:'assets/[name][extname]'}}
 }
});
