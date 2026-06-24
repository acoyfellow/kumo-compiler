#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { performance } from "node:perf_hooks";
import { parseAst } from "rolldown/parseAst";

const names = ["button", "checkbox", "field", "popover"];
const root = new URL("../../../../", import.meta.url);
const packageJson = new URL("node_modules/@cloudflare/kumo/package.json", root);
const packageVersion = JSON.parse(readFileSync(packageJson, "utf8")).version;
const sha256 = value => createHash("sha256").update(value).digest("hex");
const position = (source, offset) => {
  const prefix = source.slice(0, offset);
  return { offset, line: prefix.split("\\n").length, column: offset - prefix.lastIndexOf("\\n") };
};
const nodeName = node => {
  if (!node) return null;
  if (node.type === "JSXIdentifier" || node.type === "Identifier") return node.name;
  if (node.type === "JSXMemberExpression") return `${nodeName(node.object)}.${nodeName(node.property)}`;
  if (node.type === "JSXNamespacedName") return `${nodeName(node.namespace)}:${nodeName(node.name)}`;
  return node.type;
};
const literal = node => {
  if (!node) return true;
  if (node.type === "StringLiteral" || node.type === "Literal") return node.value;
  if (node.type === "JSXExpressionContainer") return node.expression?.type === "StringLiteral" || node.expression?.type === "NumericLiteral" || node.expression?.type === "BooleanLiteral" ? node.expression.value : null;
  return null;
};
function walk(node, visit, parent = null) {
  if (!node || typeof node !== "object") return;
  if (typeof node.type === "string") visit(node, parent);
  for (const [key, value] of Object.entries(node)) {
    if (["parent", "comments", "tokens"].includes(key)) continue;
    if (Array.isArray(value)) for (const child of value) walk(child, visit, node);
    else if (value && typeof value === "object") walk(value, visit, node);
  }
}
function sourceFor(name) {
  const mapUrl = new URL(`node_modules/@cloudflare/kumo/dist/chunks/`, root);
  const { readdirSync } = awaitImportFs;
}
const { readdirSync } = await import("node:fs");
function load(name) {
  const chunkDir = new URL("node_modules/@cloudflare/kumo/dist/chunks/", root);
  const map = readdirSync(chunkDir).find(file => file.startsWith(`${name}-`) && file.endsWith(".js.map"));
  if (!map) throw new Error(`missing canonical source map for ${name}`);
  const parsed = JSON.parse(readFileSync(new URL(map, chunkDir), "utf8"));
  const index = parsed.sources.findIndex(source => source.endsWith(`/components/${name}/${name}.tsx`));
  if (index < 0 || typeof parsed.sourcesContent?.[index] !== "string") throw new Error(`source map lacks embedded TSX for ${name}`);
  return { source: parsed.sourcesContent[index], provenance: `node_modules/@cloudflare/kumo/dist/chunks/${map}#sourcesContent[${index}]` };
}
function extract(name) {
  const { source, provenance } = load(name);
  const started = performance.now();
  const program = parseAst(source, { lang: "tsx", preserveParens: true }, `${name}.tsx`);
  const facts = { imports: [], exports: [], jsxElements: [], conditions: [], defaults: [], classExpressions: [], compoundParts: [] };
  for (const statement of program.body) {
    if (statement.type === "ImportDeclaration") facts.imports.push({ source: statement.source.value, symbols: statement.specifiers.map(specifier => specifier.local?.name).filter(Boolean).sort() });
  }
  walk(program, (node, parent) => {
    const provenanceAt = { start: position(source, node.start ?? 0), end: position(source, node.end ?? node.start ?? 0) };
    if (node.type === "JSXElement") {
      const opening = node.openingElement;
      facts.jsxElements.push({ name: nodeName(opening.name), attributes: opening.attributes.map(attribute => attribute.type === "JSXAttribute" ? { name: nodeName(attribute.name), literal: literal(attribute.value), expressionType: attribute.value?.type === "JSXExpressionContainer" ? attribute.value.expression?.type ?? null : null } : { spread: attribute.argument?.name ?? attribute.argument?.type }), provenance: provenanceAt });
    }
    if (["ConditionalExpression", "IfStatement", "LogicalExpression", "SwitchStatement"].includes(node.type)) facts.conditions.push({ type: node.type, provenance: provenanceAt });
    if (node.type === "AssignmentPattern") facts.defaults.push({ target: nodeName(node.left), valueType: node.right?.type ?? null, provenance: provenanceAt });
    if (node.type === "JSXAttribute" && nodeName(node.name) === "className") facts.classExpressions.push({ expressionType: node.value?.type === "JSXExpressionContainer" ? node.value.expression?.type ?? null : node.value?.type ?? null, provenance: provenanceAt });
    if (node.type === "ExportNamedDeclaration") {
      if (node.declaration?.id?.name) facts.exports.push(node.declaration.id.name);
      if (node.declaration?.declarations) facts.exports.push(...node.declaration.declarations.map(item => item.id?.name).filter(Boolean));
      facts.exports.push(...(node.specifiers ?? []).map(item => item.exported?.name).filter(Boolean));
    }
    if (node.type === "AssignmentExpression" && node.left?.type === "MemberExpression" && node.left.property?.name) facts.compoundParts.push(node.left.property.name);
  });
  for (const key of ["imports", "exports", "jsxElements", "conditions", "defaults", "classExpressions", "compoundParts"]) {
    if (key === "imports" || key === "jsxElements" || key === "conditions" || key === "defaults" || key === "classExpressions") continue;
    facts[key] = [...new Set(facts[key])].sort();
  }
  const elapsedMs = performance.now() - started;
  return { name, provenance, sourceSha256: sha256(source), facts, factCounts: Object.fromEntries(Object.entries(facts).map(([key, values]) => [key, values.length])), elapsedMs };
}
const started = performance.now();
const components = names.map(extract);
const payload = { schemaVersion: "kumo.visual-compiler-oxc-facts/v1", authority: { package: "@cloudflare/kumo", version: packageVersion }, parser: { implementation: "rolldown/parseAst", engine: "Oxc", symbolResolution: "syntax-only; imports are annotated but not resolved across modules" }, components: components.map(({ elapsedMs, ...component }) => component), diagnostics: [] };
payload.contentSha256 = sha256(JSON.stringify(payload));
if (process.argv.includes("--benchmark")) console.log(JSON.stringify({ totalMs: performance.now() - started, parseMs: components.reduce((sum, component) => sum + component.elapsedMs, 0), contentSha256: payload.contentSha256 }));
else process.stdout.write(JSON.stringify(payload, null, 2) + "\n");
