import { execFileSync } from "node:child_process";
import { performance } from "node:perf_hooks";
const file = new URL("extract.mjs", import.meta.url).pathname;
const run = () => {
  const start = performance.now();
  const child = JSON.parse(execFileSync(process.execPath, [file, "--benchmark"], { encoding: "utf8" }));
  return { processMs: performance.now() - start, parseMs: child.parseMs, contentSha256: child.contentSha256 };
};
const cold = run();
const warm = Array.from({ length: 10 }, run);
const values = warm.map(item => item.processMs).sort((a, b) => a - b);
const round = value => Number(value.toFixed(3));
console.log(JSON.stringify({ cold: { processMs: round(cold.processMs), parseMs: round(cold.parseMs) }, warm: { iterations: warm.length, minProcessMs: round(values[0]), medianProcessMs: round(values[Math.floor(values.length / 2)]), maxProcessMs: round(values.at(-1)), samplesProcessMs: warm.map(item => round(item.processMs)) }, deterministicDigest: new Set([cold, ...warm].map(item => item.contentSha256)).size === 1 }, null, 2));
