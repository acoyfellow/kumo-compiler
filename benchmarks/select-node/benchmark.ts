#!/usr/bin/env node
/** Dependency-free Select baseline benchmark. Requires Node >=22 and Chrome. */
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const iterations = Math.max(5, Number(process.env.BENCH_ITERATIONS || 5));
const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const frameworks = ['react', 'vue', 'svelte', 'solid'];
const artifactDir = join(here, '.artifacts');
const round = (n: number) => Math.round(n * 100) / 100;
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

type CommandResult = { ms: number; peakRssKb: number | null; stdout: string };
async function command(bin: string, args: string[], options: { env?: NodeJS.ProcessEnv; capture?: boolean } = {}): Promise<CommandResult> {
  const started = performance.now();
  const child = spawn(bin, args, { cwd: root, env: options.env || process.env, stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '', stderr = '', peak = 0;
  child.stdout.on('data', d => stdout += d);
  child.stderr.on('data', d => stderr += d);
  const sampler = setInterval(() => {
    const ps = spawn('ps', ['-o', 'rss=', '-p', String(child.pid)], { stdio: ['ignore', 'pipe', 'ignore'] });
    let text = ''; ps.stdout.on('data', d => text += d); ps.on('close', () => { peak = Math.max(peak, Number(text.trim()) || 0); });
  }, 20);
  const code: number | null = await new Promise((ok, fail) => { child.on('error', fail); child.on('exit', ok); });
  clearInterval(sampler);
  if (code !== 0) throw new Error(`${bin} ${args.join(' ')} failed (${code})\n${stderr}`);
  return { ms: round(performance.now() - started), peakRssKb: peak || null, stdout };
}
async function walk(dir: string): Promise<string[]> {
  const result: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await walk(path)); else result.push(path);
  }
  return result;
}
function summarize(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const percentile = (p: number) => sorted[Math.min(sorted.length - 1, Math.ceil(p * sorted.length) - 1)];
  return { median: round(percentile(.5)), p95: round(percentile(.95)), min: round(sorted[0]), max: round(sorted.at(-1)!) };
}

await mkdir(artifactDir, { recursive: true });
const runs: any[] = [];
for (let iteration = 1; iteration <= iterations; iteration++) {
  const compile = await command(process.execPath, ['src/compiler.mjs']);
  const build = await command('npm', ['run', 'build:runtimes', '--silent']);
  const port = 44000 + (process.pid + iteration) % 1000;
  const server = spawn(process.execPath, ['review/server.mjs'], { cwd: root, env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    let ready = false;
    for (let n = 0; n < 100 && !ready; n++) { try { ready = (await fetch(`http://127.0.0.1:${port}/select/react`)).ok; } catch {} if (!ready) await sleep(25); }
    if (!ready) throw new Error('review server did not become ready');
    const ssr: Record<string, number> = {}, hydration: Record<string, number> = {}, screenshot: Record<string, number> = {}, hashes: Record<string, string> = {};
    for (const framework of frameworks) {
      let start = performance.now();
      const response = await fetch(`http://127.0.0.1:${port}/select/${framework}`, { headers: { connection: 'close' } });
      await response.arrayBuffer(); ssr[framework] = round(performance.now() - start);
      hydration[framework] = (await command(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu', '--dump-dom', `http://127.0.0.1:${port}/select/${framework}`])).ms;
      const png = join(artifactDir, `${iteration}-${framework}.png`);
      screenshot[framework] = (await command(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=900,600', `--screenshot=${png}`, `http://127.0.0.1:${port}/select/${framework}`])).ms;
      hashes[framework] = createHash('sha256').update(await readFile(png)).digest('hex');
    }
    // Exact PNG equality implies a zero pixel diff. Non-identical images are explicitly
    // reported rather than pretending compressed-byte differences are pixel differences.
    const reference = hashes.react;
    const pixelDiff = Object.fromEntries(frameworks.map(f => [f, hashes[f] === reference ? 0 : null]));
    runs.push({ iteration, compileMs: compile.ms, buildMs: build.ms, peakCompileRssKb: compile.peakRssKb, peakBuildRssKb: build.peakRssKb, ssrMs: ssr, hydrationMs: hydration, screenshotMs: screenshot, screenshotSha256: hashes, pixelDiffPercent: pixelDiff });
    console.log(`run ${iteration}/${iterations}: compile ${compile.ms}ms, build ${build.ms}ms`);
  } finally { server.kill('SIGTERM'); await sleep(50); }
}

const bundleFiles = (await Promise.all(frameworks.map(async framework => {
  const dir = join(root, 'runtime', framework, 'public-runtime');
  return Promise.all((await walk(dir)).map(async path => { const bytes = await readFile(path); return { framework, file: relative(root, path), bytes: bytes.length, gzipBytes: gzipSync(bytes, { level: 9, mtime: 0 } as any).length }; }));
}))).flat().sort((a, b) => a.file.localeCompare(b.file));
const packed = JSON.parse((await command('npm', ['pack', '--dry-run', '--ignore-scripts', '--json'])).stdout)[0];
const metric = (field: string) => summarize(runs.map(r => r[field]));
const frameworkMetric = (field: string) => Object.fromEntries(frameworks.map(f => [f, summarize(runs.map(r => r[field][f]))]));
const result = {
  schemaVersion: 1,
  benchmark: 'select-node',
  generatedAt: new Date().toISOString(),
  environment: { node: process.version, platform: process.platform, arch: process.arch, iterations, chrome },
  summary: { compileMs: metric('compileMs'), buildMs: metric('buildMs'), ssrMs: frameworkMetric('ssrMs'), hydrationMs: frameworkMetric('hydrationMs'), screenshotMs: frameworkMetric('screenshotMs'), peakCompileRssKb: summarize(runs.map(r => r.peakCompileRssKb).filter(Number.isFinite)), peakBuildRssKb: summarize(runs.map(r => r.peakBuildRssKb).filter(Number.isFinite)) },
  package: { packedBytes: packed.size, unpackedBytes: packed.unpackedSize, fileCount: packed.entryCount },
  bundles: bundleFiles,
  runs
};
await writeFile(join(here, 'results.json'), JSON.stringify(result, null, 2) + '\n');
if (process.env.KEEP_BENCH_ARTIFACTS !== '1') await rm(artifactDir, { recursive: true, force: true });
console.log(`wrote ${relative(root, join(here, 'results.json'))}`);
