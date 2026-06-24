#!/usr/bin/env node
// FAN-OUT SPAWNER — runs build-component jobs in parallel with a worker cap.
// Each (component, framework) pair is a disjoint writer (packages/<fw>/<component>/),
// so parallelism is safe. No job depends on another's output.
//
// Usage: node spawn.mjs [--components a,b,c] [--workers 4]
import {spawn} from 'node:child_process';
import {readFile, readdir} from 'node:fs/promises';
import {resolve} from 'node:path';

const HERE = import.meta.dirname;
const FRAMEWORKS = ['vue', 'svelte', 'solid'];
const args = process.argv.slice(2);
function flag(name) {
  const eq = args.find(a => a.startsWith(`--${name}=`));
  if (eq) return eq.split('=').slice(1).join('=');
  const i = args.indexOf(`--${name}`);
  if (i >= 0 && args[i + 1] && !args[i + 1].startsWith('--')) return args[i + 1];
  return undefined;
}
const compArg = flag('components');
const workerArg = Number(flag('workers')) || 4;

async function allComponents() {
  const idx = JSON.parse(await readFile(resolve(HERE, 'substrate', 'contracts', 'index.json'), 'utf8'));
  return idx.components.map(c => c.component);
}

function runJob(component, framework) {
  return new Promise(res => {
    const t0 = Date.now();
    const child = spawn('node', [resolve(HERE, 'jobs', 'build-component.mjs'), component, framework], { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = '';
    child.stdout.on('data', d => out += d);
    child.stderr.on('data', d => err += d);
    child.on('close', code => res({ component, framework, ok: code === 0, ms: Date.now() - t0, out: out.trim(), err: err.trim() }));
  });
}

async function pool(jobs, limit) {
  const results = [], queue = [...jobs];
  const workers = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length) { const j = queue.shift(); results.push(await runJob(j.component, j.framework)); }
  });
  await Promise.all(workers);
  return results;
}

async function main() {
  const components = compArg ? compArg.split(',') : await allComponents();
  const jobs = components.flatMap(c => FRAMEWORKS.map(fw => ({ component: c, framework: fw })));
  const t0 = Date.now();
  const results = await pool(jobs, workerArg);
  const failed = results.filter(r => !r.ok);
  console.log(`fan-out: ${results.length} jobs, ${workerArg} workers, ${Date.now() - t0}ms; failed ${failed.length}`);
  for (const f of failed) console.log(`  FAIL ${f.framework}/${f.component}: ${f.err.slice(-200)}`);
  process.exit(failed.length ? 1 : 0);
}
main().catch(e => { console.error(e.stack); process.exit(1); });
