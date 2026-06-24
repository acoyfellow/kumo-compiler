import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
const command = [process.execPath, new URL("extract.mjs", import.meta.url).pathname];
const first = execFileSync(command[0], command.slice(1));
const second = execFileSync(command[0], command.slice(1));
if (!first.equals(second)) throw new Error("non-deterministic extractor bytes");
const result = JSON.parse(first);
if (result.authority.version !== "2.5.2") throw new Error("wrong canonical authority version");
const expected = ["button", "checkbox", "field", "popover"];
if (result.components.map(item => item.name).join(",") !== expected.join(",")) throw new Error("component set mismatch");
for (const component of result.components) {
  if (!component.sourceSha256 || component.factCounts.jsxElements < 1 || component.factCounts.imports < 1) throw new Error(`insufficient facts for ${component.name}`);
}
const digest = createHash("sha256").update(first).digest("hex");
console.log(JSON.stringify({ passed: true, repeatedBytes: true, outputSha256: digest, components: expected }));
