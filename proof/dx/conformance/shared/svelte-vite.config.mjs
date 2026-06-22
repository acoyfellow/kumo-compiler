import{defineConfig}from'vite';
import{svelte}from'@sveltejs/vite-plugin-svelte';
import path from'node:path';
const consumer=process.env.KUMO_CONSUMER;
export default defineConfig({root:process.cwd(),plugins:[svelte()],resolve:{dedupe:['svelte'],alias:[{find:/^@acoyfellow\/kumo-svelte\/(.+)$/,replacement:path.join(consumer,'node_modules/@acoyfellow/kumo-svelte/package/$1.js')},{find:/^svelte$/,replacement:path.join(consumer,'node_modules/svelte/src/index-client.js')},{find:'svelte/internal/client',replacement:path.join(consumer,'node_modules/svelte/src/internal/client/index.js')},{find:'svelte/internal/disclose-version',replacement:path.join(consumer,'node_modules/svelte/src/internal/disclose-version.js')}]},build:{emptyOutDir:false,lib:{entry:process.env.KUMO_ENTRY,formats:['es'],fileName:()=>path.basename(process.env.KUMO_OUT)},outDir:path.dirname(process.env.KUMO_OUT),rollupOptions:{output:{inlineDynamicImports:true}}}});
