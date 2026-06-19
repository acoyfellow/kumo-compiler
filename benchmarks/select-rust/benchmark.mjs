#!/usr/bin/env node
import { mkdtemp, mkdir, cp, readFile, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const iterations = Math.max(5, Number(process.env.BENCH_ITERATIONS || 20));
const round = n => Math.round(n * 1000) / 1000;
function run(bin, args, cwd = root) {
  return new Promise((resolveRun, reject) => {
    const start = performance.now();
    const child = spawn(bin, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    child.stdout.on('data', b => stdout += b); child.stderr.on('data', b => stderr += b);
    child.on('error', reject); child.on('close', code => code ? reject(new Error(stderr)) : resolveRun({ ms: round(performance.now() - start), stdout }));
  });
}
const summarize = values => { const s = [...values].sort((a,b)=>a-b), pick = p => s[Math.min(s.length-1, Math.ceil(p*s.length)-1)]; return { median: round(pick(.5)), p95: round(pick(.95)), min: round(s[0]), max: round(s.at(-1)) }; };
const temp = await mkdtemp(join(tmpdir(), 'select-rust-bench-'));
try {
  await run('cargo', ['build', '--release', '--manifest-path', join(here, 'Cargo.toml')]);
  // Isolate the production Node compiler because it writes runtime/* relative to cwd.
  await mkdir(join(temp, 'src'), { recursive: true }); await mkdir(join(temp, 'specs'), { recursive: true });
  await cp(join(root, 'src/compiler.mjs'), join(temp, 'src/compiler.mjs'));
  await cp(join(root, 'specs/select.json'), join(temp, 'specs/select.json'));
  const rustBin = join(here, 'target/release/select-rust-compiler');
  const runs = [];
  for (let i=0; i<iterations; i++) {
    const rustOut = join(temp, 'rust'); await rm(rustOut, { recursive: true, force: true });
    const rust = await run(rustBin, [join(root, 'specs/select.json'), rustOut]);
    await rm(join(temp, 'runtime'), { recursive: true, force: true });
    const node = await run(process.execPath, ['src/compiler.mjs'], temp);
    const rustFiles = ['vue/Select.vue','svelte/Select.svelte','solid/Select.tsx'];
    const nodeFiles = ['vue/src/Select.vue','svelte/src/Select.svelte','solid/src/Select.tsx'];
    let rustBytes=0,nodeBytes=0,equivalent=true;
    for(let j=0;j<3;j++){const a=await readFile(join(rustOut,rustFiles[j]));const b=await readFile(join(temp,'runtime',nodeFiles[j]));rustBytes+=a.length;nodeBytes+=b.length;equivalent &&= a.equals(b);}
    runs.push({ iteration:i+1, rustWallMs:rust.ms, nodeWallMs:node.ms, rustBytes, nodeBytes, byteEquivalent:equivalent });
  }
  const result = { schemaVersion:1, benchmark:'select-rust-vs-node', generatedAt:new Date().toISOString(), environment:{node:process.version,platform:process.platform,arch:process.arch,iterations}, scope:'source generation only; no framework builds', summary:{rustWallMs:summarize(runs.map(r=>r.rustWallMs)),nodeWallMs:summarize(runs.map(r=>r.nodeWallMs)),outputBytes:runs[0].rustBytes,byteEquivalent:runs.every(r=>r.byteEquivalent)}, runs };
  await writeFile(join(here,'results.json'),JSON.stringify(result,null,2)+'\n');
  console.log(`wrote ${join(here,'results.json')}`);
} finally { await rm(temp,{recursive:true,force:true}); }
