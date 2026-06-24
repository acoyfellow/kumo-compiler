import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const here = new URL("./", import.meta.url);
const load = name => readFile(new URL(name, here), "utf8").then(JSON.parse);
const stable = value => JSON.stringify(value, null, 2) + "\n";
const hash = value => createHash("sha256").update(value).digest("hex");
const [ts, oxc, tsResult, oxcResult] = await Promise.all([
  load("../typescript/facts.json"), load("../oxc/facts.json"),
  load("../typescript/results.json"), load("../oxc/results.json")
]);
const expected = ["button", "checkbox", "field", "popover"];
if (ts.schemaVersion !== "kumo.visual-compiler.typescript-facts/v1" || oxc.schemaVersion !== "kumo.visual-compiler-oxc-facts/v1") throw new Error("Unsupported input schema");
if (JSON.stringify(ts.components.map(x => x.component)) !== JSON.stringify(expected) || JSON.stringify(oxc.components.map(x => x.name)) !== JSON.stringify(expected)) throw new Error("Unsupported component boundary");
if (oxc.authority.version !== "2.5.2" || ts.components.some(x => x.source.version !== oxc.authority.version)) throw new Error("Authority mismatch");
const pairs = [["jsx", "structure", "jsxElements"], ["classExpressions", "classExpressions", "classExpressions"], ["defaults", "defaults", "defaults"], ["branches", "branches", "conditions"]];
const components = expected.map((name, i) => {
  const a = ts.components[i], b = oxc.components[i].facts;
  const facts = Object.fromEntries(pairs.map(([label, tk, ok]) => [label, { typescript: a[tk].length, oxc: b[ok].length, common: Math.min(a[tk].length, b[ok].length), missing: Math.max(0, a[tk].length - b[ok].length), extra: Math.max(0, b[ok].length - a[tk].length) }]));
  const common = Object.values(facts).reduce((n, x) => n + x.common, 0), missing = Object.values(facts).reduce((n, x) => n + x.missing, 0), extra = Object.values(facts).reduce((n, x) => n + x.extra, 0);
  return { name, immutableSourceMap: b.provenance, sourceMapSha256: b.sourceSha256, benchmarkBoundary: { identical: a.structure.length === b.jsxElements.length, jsxNodes: a.structure.length }, facts, totals: { common, missing, extra }, symbolResolution: { typescriptSymbols: a.symbols.length, oxcResolvedSymbols: 0, missing: a.symbols.length } };
});
const tsMs = tsResult.benchmark.warmMs, oxcMs = oxcResult.benchmarks.warm.medianProcessMs;
const output = { schemaVersion: "kumo.visual-compiler.frontend-equivalence/v1", status: "not-equivalent", authority: oxc.authority, components, totals: { common: components.reduce((n,x)=>n+x.totals.common,0), missing: components.reduce((n,x)=>n+x.totals.missing,0), extra: components.reduce((n,x)=>n+x.totals.extra,0), missingSymbolResolution: components.reduce((n,x)=>n+x.symbolResolution.missing,0) }, benchmark: { identicalBoundary: components.every(x=>x.benchmarkBoundary.identical), typescriptWarmMs: tsMs, oxcWarmMedianMs: oxcMs, speedRatio: Number((tsMs / oxcMs).toFixed(3)), caveat: "Recorded process-level runs; environment metadata must match for a controlled performance claim." }, cacheDecision: { safeOxcOutputs: ["imports", "exports", "jsxElements", "conditions", "defaults", "classExpressions", "compoundParts"], usage: "syntax-only fast preparse hints; validate sourceMapSha256 and recompute authoritative semantic facts with TypeScript", unsafeAsAuthoritative: ["symbol resolution", "type facts", "cross-module identity", "defaults", "conditions", "compoundParts"], failClosed: true }, inputDigests: { typescriptFacts: hash(stable(ts)), oxcFacts: hash(stable(oxc)) } };
const text = stable(output);
if (process.argv.includes("--check")) { const existing = await readFile(new URL("results.json", here), "utf8"); if (existing !== text) throw new Error("results.json is stale"); console.log("evaluation self-check passed"); }
else await writeFile(new URL("results.json", here), text);
