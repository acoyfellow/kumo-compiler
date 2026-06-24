#!/usr/bin/env node
// WAVE 0 — substrate extraction (single-threaded, run ONCE, then frozen + read-only).
// Produces, per component, the framework-NEUTRAL styling contract:
//   { component, states, viewports, parts: [{ part, tag, role, classesByState, attrsByState, text }] }
// Source of truth = the canonical React traces already captured by the visual-compiler
// tracer (real @cloudflare/kumo @ Base UI, served + hydrated + CDP). No reconstruction:
// we read the EXISTING canonical artifacts and distill the part->class/token map.
//
// This is the "crank tokens" input: pure data, content-addressed, deterministic.
import {createHash} from 'node:crypto';
import {existsSync} from 'node:fs';
import {readFile, readdir, writeFile, mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';

const HERE = import.meta.dirname;
const VC = resolve(HERE, '..', '..', 'visual-compiler');
const ART = resolve(VC, 'tracer', 'artifacts');
const OUT = resolve(HERE, 'contracts');
const sha = x => createHash('sha256').update(x).digest('hex');
const json = async p => JSON.parse(await readFile(p, 'utf8'));

const partOf = p => (p.attrs && p.attrs['data-part']) || p.part || null;

async function extractComponent(component) {
  const cdir = resolve(ART, component);
  if (!existsSync(cdir)) return null;
  const states = (await readdir(cdir)).sort();
  const viewports = [390, 768, 1440];
  // Collect every node across states/viewports, keyed by a stable structural id.
  // We key by data-part when present, else by DOM-path id from the trace.
  const nodeMap = new Map(); // id -> { part, tag, role, namespace, classesByCell, attrsByCell, textByCell, order, parentId }
  for (const state of states) {
    for (const vp of viewports) {
      const tracePath = resolve(cdir, state, String(vp), 'trace.json');
      if (!existsSync(tracePath)) continue;
      const trace = await json(tracePath);
      for (const node of trace.parts || []) {
        const id = node.id || node.part || partOf(node);
        if (!id) continue;
        if (!nodeMap.has(id)) nodeMap.set(id, {
          id, part: partOf(node), tag: node.tag, role: node.role ?? null,
          namespace: node.namespace ?? null, parentId: node.parentId ?? null, order: node.order ?? 0,
          classesByCell: {}, attrsByCell: {}, textByCell: {}, childTextByCell: {}
        });
        const rec = nodeMap.get(id);
        const cell = `${state}:${vp}`;
        rec.classesByCell[cell] = [...(node.classes || [])];
        const attrs = { ...(node.attrs || {}) }; delete attrs.class;
        rec.attrsByCell[cell] = attrs;
        rec.textByCell[cell] = node.text ?? '';
        if (node.childText?.length) rec.childTextByCell[cell] = node.childText;
      }
    }
  }
  const parts = [...nodeMap.values()].sort((a, b) => (a.order - b.order) || String(a.id).localeCompare(String(b.id)));
  return { component, states, viewports, parts, partsCount: parts.length };
}

async function main() {
  const components = (await readdir(ART)).filter(c => existsSync(resolve(ART, c))).sort();
  await mkdir(OUT, { recursive: true });
  const index = [];
  for (const component of components) {
    const contract = await extractComponent(component);
    if (!contract) continue;
    const bytes = Buffer.from(JSON.stringify(contract, null, 2) + '\n');
    const digest = sha(bytes);
    await writeFile(resolve(OUT, `${component}.json`), bytes);
    index.push({ component, parts: contract.partsCount, states: contract.states, digest });
  }
  const manifest = {
    schemaVersion: 'kumo.fanout-substrate/v1',
    source: 'canonical React traces (visual-compiler/tracer/artifacts)',
    generatedAt: new Date().toISOString(),
    components: index,
    contractDigest: sha(JSON.stringify(index))
  };
  await writeFile(resolve(OUT, 'index.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`substrate: ${index.length} component contracts; digest ${manifest.contractDigest.slice(0, 16)}`);
}
main().catch(e => { console.error(e.stack); process.exit(1); });
