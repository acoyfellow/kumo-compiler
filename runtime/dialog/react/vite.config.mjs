import {defineConfig} from 'vite';
export default defineConfig({
 base:'/dialog/react/',
 build:{
  outDir:'public-runtime',emptyOutDir:true,
  rollupOptions:{input:'index.html',output:{entryFileNames:'assets/react-dialog.js',assetFileNames:'assets/[name][extname]'}}
 }
});
