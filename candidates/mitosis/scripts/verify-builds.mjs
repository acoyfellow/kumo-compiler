import fs from 'node:fs';
import path from 'node:path';
import { build } from 'vite';
import vue from '@vitejs/plugin-vue';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import solid from 'vite-plugin-solid';

const candidateRoot = path.resolve(import.meta.dirname, '..');
const entries = {
  react: ['generated/react/Button.tsx'],
  vue: ['generated/vue/Button.vue'],
  svelte: ['generated/svelte/Button.svelte'],
  solid: ['generated/solid/Button.tsx'],
};
const plugins = { react: [], vue: [vue()], svelte: [svelte()], solid: [solid()] };
const report = {};
for (const [framework, files] of Object.entries(entries)) {
  const input = Object.fromEntries(files.map(file => [path.basename(file, path.extname(file)), path.join(candidateRoot, file)]));
  const outDir = path.join(candidateRoot, 'build', framework);
  try {
    await build({ configFile: false, plugins: plugins[framework], build: { outDir, emptyOutDir: true, lib: { entry: input, formats: ['es'] }, rollupOptions: { external: ['react', 'react/jsx-runtime', 'vue', 'svelte', 'svelte/internal', 'solid-js', 'solid-js/web'] } }, logLevel: 'silent' });
    report[framework] = { generated: 'passed', build: 'passed', output: path.relative(candidateRoot, outDir) };
  } catch (error) {
    report[framework] = { generated: 'passed', build: 'failed', error: error.stack ?? String(error) };
    process.exitCode = 1;
  }
}
fs.mkdirSync(path.join(candidateRoot, 'receipts'), { recursive: true });
fs.writeFileSync(path.join(candidateRoot, 'receipts', 'button-builds.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
