#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';

export const ENGINE_DIR = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(ENGINE_DIR, '..');
export const CACHE_DIR = join(ENGINE_DIR, '.cache');
export const MANIFEST = join(CACHE_DIR, 'manifest.json');
export const sha = value => createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value) ? value : stable(value)).digest('hex');
export function stable(value) { if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`; if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${stable(value[k])}`).join(',')}}`; return JSON.stringify(value); }
async function json(path) { return JSON.parse(await readFile(path, 'utf8')); }
async function atomic(path, bytes) { await mkdir(dirname(path), { recursive: true }); const tmp = `${path}.${process.pid}.tmp`; await writeFile(tmp, bytes); await rename(tmp, path); }
export async function acceptedInputs() {
  const paths = { frontend: join(ROOT, 'frontend/typescript/results.json'), facts: join(ROOT, 'frontend/typescript/facts.json'), tracer: join(ROOT, 'tracer/results.json') };
  const [frontendBytes, factsBytes, tracerBytes] = await Promise.all(Object.values(paths).map(p => readFile(p)));
  const frontend = JSON.parse(frontendBytes), facts = JSON.parse(factsBytes), tracer = JSON.parse(tracerBytes);
  if (frontend.status !== 'passed' || tracer.status !== 'passed' || tracer.authority?.synthetic !== false || tracer.interactions?.trusted !== true) throw new Error('fail-closed: frontend and real trusted tracer must be accepted');
  if (sha(factsBytes) !== frontend.deterministic.factsSha256) throw new Error('frontend facts hash does not match accepted receipt');
  return { paths, frontend, facts, tracer, hashes: { frontend: sha(frontendBytes), facts: sha(factsBytes), tracer: sha(tracerBytes), tracerAuthority: sha(tracer.authority) } };
}
export function buildGraph(input) {
  const nodes = {}, reverse = {};
  const add = (id, kind, payload, deps=[]) => { nodes[id] = { id, kind, hash: sha(payload), deps: [...deps].sort() }; for (const d of deps) (reverse[d] ??= []).push(id); };
  for (const fact of input.facts.components) {
    const c = `component:${fact.component}`; add(c, 'component', fact, ['input:frontend']);
    const records = input.tracer.records.filter(r => r.component === fact.component);
    for (const r of records) { const s = `state:${r.component}:${r.state}`; if (!nodes[s]) add(s, 'state', { component:r.component, state:r.state, traces:records.filter(x=>x.state===r.state).map(x=>x.traceSha256) }, [c, 'input:tracer']); for (const target of ['vue','svelte','solid']) add(`target:${target}:${r.component}:${r.state}`, 'target', { target, source:nodes[s].hash }, [s, `workspace:${target}`]); }
  }
  for (const target of ['vue','svelte','solid']) add(`workspace:${target}`, 'workspace', { target, lockPolicy:'persistent-content-addressed' }, []);
  Object.values(reverse).forEach(x=>x.sort()); return { nodes, reverse };
}
export function impacted(graph, changed) { const out = new Set(changed), q=[...changed]; while(q.length) for(const n of graph.reverse[q.shift()] ?? []) if(!out.has(n)){out.add(n);q.push(n)} return [...out].sort(); }
export async function plan({ changed=[] }={}) {
  const input = await acceptedInputs(); const graph = buildGraph(input); const manifestHash = sha({ inputs:input.hashes, nodes:graph.nodes }); let old={}; try { old=await json(MANIFEST); } catch {}
  const inferred = changed.length ? changed : Object.entries(input.hashes).filter(([k,v])=>old.inputs?.[k]!==v).map(([k])=>k==='tracer'||k==='tracerAuthority'?'input:tracer':'input:frontend');
  const dirty = old.manifestHash === manifestHash && !changed.length ? [] : impacted(graph, [...new Set(inferred)]);
  const cacheHits = Object.keys(graph.nodes).filter(id=>old.nodes?.[id]?.hash===graph.nodes[id].hash && !dirty.includes(id));
  return { input, graph, manifestHash, old, changed:[...new Set(inferred)].sort(), dirty, cacheHits };
}
export async function commit(p) { const shards={}; for(const n of Object.values(p.graph.nodes)){ const path=join(CACHE_DIR,'shards',n.kind,`${n.hash}.json`); try { await readFile(path); } catch { await atomic(path, `${stable(n)}\n`); } shards[n.id]={hash:n.hash,path:path.slice(ENGINE_DIR.length+1)}; } const manifest={schemaVersion:'kumo.incremental-engine-manifest/v1',manifestHash:p.manifestHash,inputs:p.input.hashes,nodes:shards,workspaces:{vue:'.cache/workspaces/vue',svelte:'.cache/workspaces/svelte',solid:'.cache/workspaces/solid'},browser:{protocol:'json-lines/v1',endpoint:'.cache/chrome/session.json',lifecycle:'reuse-until-authority-or-browser-hash-changes'}}; await atomic(MANIFEST, `${stable(manifest)}\n`); return manifest; }
export async function run(opts={}) { const t=performance.now(); const p=await plan(opts); const planned=performance.now(); const manifest=await commit(p); return { planningMs:+(planned-t).toFixed(3), totalMs:+(performance.now()-t).toFixed(3), changed:p.changed, dirty:p.dirty, cacheHits:p.cacheHits.length, nodeCount:Object.keys(p.graph.nodes).length, manifest }; }
if (process.argv[1] === fileURLToPath(import.meta.url)) console.log(JSON.stringify(await run({changed:process.argv.filter(x=>x.startsWith('--changed=')).flatMap(x=>x.slice(10).split(',')).filter(Boolean)}),null,2));
