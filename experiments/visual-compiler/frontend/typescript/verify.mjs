#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
const here = dirname(fileURLToPath(import.meta.url));
const extractor = resolve(here, "extract.mjs");
const factsFile = resolve(here, "facts.json");
const hash = (s) => createHash("sha256").update(s).digest("hex");
const run = () => { const t = performance.now(); execFileSync(process.execPath, [extractor], { stdio: "pipe" }); return +(performance.now() - t).toFixed(3); };
const coldMs = run(); const first = await readFile(factsFile, "utf8");
const warmMs = run(); const second = await readFile(factsFile, "utf8");
const facts = JSON.parse(second);
const failures = [];
if (first !== second) failures.push("repeated extraction bytes differ");
for (const name of ["button", "checkbox", "field", "popover"]) {
  const c = facts.components.find((x) => x.component === name);
  if (!c) { failures.push(`${name}: missing`); continue; }
  for (const key of ["structure", "symbols", "classExpressions", "defaults", "stateBranches"]) if (!c[key] || (Array.isArray(c[key]) && !c[key].length)) failures.push(`${name}: missing ${key}`);
  if (c.diagnostics.length) failures.push(`${name}: parse diagnostics`);
}
for (const name of ["checkbox", "popover"]) if (!facts.components.find((x) => x.component === name)?.compoundParts.length) failures.push(`${name}: missing compound parts`);
if (!facts.components.find((x) => x.component === "checkbox")?.importedIcons.length) failures.push("checkbox: missing imported icons");
const result = {
  schemaVersion: "kumo.visual-compiler.typescript-result/v1",
  spike: "frontend-typescript", status: failures.length ? "failed" : "passed",
  deterministic: { repeatedBytesEqual: first === second, factsSha256: hash(second) },
  coverage: Object.fromEntries(facts.components.map((c) => [c.component, { jsxNodes: c.structure.length, symbols: c.symbols.length, classExpressions: c.classExpressions.length, defaults: c.defaults.length, branches: c.branches.length, importedIcons: c.importedIcons, compoundParts: c.compoundParts, diagnosticCount: c.diagnostics.length }])),
  benchmark: { process: process.version, platform: `${process.platform}-${process.arch}`, coldMs, warmMs, note: "Cold and immediate warm full four-component extraction in separate Node processes; warm benefits from OS filesystem cache." },
  commands: { extract: "node experiments/visual-compiler/frontend/typescript/extract.mjs", focused: "node experiments/visual-compiler/frontend/typescript/extract.mjs --component=button", verify: "node experiments/visual-compiler/frontend/typescript/verify.mjs" },
  failures
};
await writeFile(resolve(here, "results.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ status: result.status, coldMs, warmMs, failures }));
if (failures.length) process.exitCode = 1;
