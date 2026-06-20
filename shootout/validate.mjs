import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

export const LANGUAGES = ["typescript", "go", "rust", "zig"];
export const ARCHITECTURES = ["internal-compiler", "mitosis", "shared-core-native"];
export const STATUSES = ["passed", "failed", "not-run", "blocked"];
export const FIXTURE_GATES = {
  button: ["simple-emission", "api", "dom", "click", "ssr", "hydration", "package"],
  select: ["full-contract", "api", "aria", "keyboard", "typeahead", "controlled", "hydration", "package"]
};
const SHA = /^[a-f0-9]{64}$/;
const machinePath = /(^|[\s"'])(?:\/[A-Za-z]|[A-Za-z]:\\|file:\/\/|~\/)/;
const reqString = (o, k, errors) => { if (typeof o?.[k] !== "string" || !o[k]) errors.push(`missing ${k}`); };

export function validateShootout(value, { baseline } = {}) {
  const e = [];
  if (!value || value.schemaVersion !== "shootout/v1") e.push("schemaVersion must be shootout/v1");
  if (!["language", "architecture"].includes(value?.axis)) e.push("axis must be language or architecture");
  if (value?.axis === "language" && (!LANGUAGES.includes(value.language) || "architecture" in value)) e.push("language claims must contain only the language axis");
  if (value?.axis === "architecture" && (!ARCHITECTURES.includes(value.architecture) || "language" in value)) e.push("architecture claims must contain only the architecture axis");
  if ("score" in (value || {}) || "combinedScore" in (value || {}) || "winner" in (value || {}) && value.winner !== null) e.push("cross-axis scores and premature winner claims are prohibited");
  for (const k of ["candidateId", "framework", "component", "candidateRevision", "frameworkRevision", "componentRevision", "runId", "evidenceDigest", "environmentManifestDigest"]) reqString(value, k, e);
  for (const k of ["evidenceDigest", "environmentManifestDigest"]) if (value?.[k] && !SHA.test(value[k])) e.push(`${k} must be sha256 hex`);
  if (machinePath.test(JSON.stringify(value))) e.push("machine-local paths are prohibited");
  const expected = FIXTURE_GATES[value?.component];
  if (!expected) e.push("component must be button or select");
  const gates = value?.gates;
  if (!gates || Array.isArray(gates) || typeof gates !== "object") e.push("gates must be a status map");
  else {
    for (const g of expected || []) if (!STATUSES.includes(gates[g])) e.push(`gate ${g} requires passed|failed|not-run|blocked`);
    for (const [g, status] of Object.entries(gates)) if (typeof status === "boolean") e.push(`optimistic boolean forbidden at ${g}`);
  }
  if (!value?.baseline || !SHA.test(value.baseline.digest || "")) e.push("missing baseline provenance digest");
  if (baseline && value?.baseline?.digest !== digest(baseline)) e.push("stale baseline hash");
  return { valid: e.length === 0, errors: e };
}
export function fanIn(records) {
  const invalid = records.map(r => validateShootout(r)).filter(x => !x.valid);
  const mandatoryComplete = invalid.length === 0 && records.length > 0 && records.every(r => Object.values(r.gates).every(s => s === "passed" || s === "failed"));
  const allPassed = mandatoryComplete && records.every(r => Object.values(r.gates).every(s => s === "passed"));
  return { status: invalid.length || !mandatoryComplete ? "blocked" : allPassed ? "passed" : "failed", winnerAllowed: mandatoryComplete && allPassed };
}
export const digest = value => createHash("sha256").update(typeof value === "string" ? value : JSON.stringify(value)).digest("hex");
export const loadAndValidate = (path, options) => validateShootout(JSON.parse(readFileSync(path, "utf8")), options);
