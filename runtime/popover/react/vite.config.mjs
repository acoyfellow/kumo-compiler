import {defineConfig} from 'vite';
export default defineConfig({
 base:'/popover/react/',
 build:{
  outDir:'public-runtime',emptyOutDir:true,
  rollupOptions:{input:'src/main.jsx',output:{entryFileNames:'assets/react-popover.js',assetFileNames:'assets/[name][extname]'}}
 }
});
