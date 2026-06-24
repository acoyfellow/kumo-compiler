#!/usr/bin/env node
import ts from "typescript";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../../../..");
const outFile = resolve(here, "facts.json");
const components = ["button", "checkbox", "field", "popover"];
const requested = process.argv.find((x) => x.startsWith("--component="))?.split("=")[1];
const selected = requested ? components.filter((x) => x === requested.toLowerCase()) : components;
if (!selected.length) throw new Error(`unknown component: ${requested}`);

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const pos = (sf, node) => { const p = sf.getLineAndCharacterOfPosition(node.getStart(sf)); return { line: p.line + 1, column: p.character + 1 }; };
const stable = (value) => JSON.stringify(value, Object.keys(value).sort(), 2); // only used for scalar benchmark metadata

function canonicalPath(name) {
  return resolve(root, `node_modules/@cloudflare/kumo/dist/chunks/${({
    button: "button-ov39dxshqbqrthhd.js",
    checkbox: "checkbox-bt4nfv1i2142kykg.js",
    field: "field-m57qcw5b1zt1ohfz.js",
    popover: "popover-ozf1j7oi7pxiudyz.js"
  })[name]}`);
}

function extractOne(name, file, source) {
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const imports = [], symbols = [], defaults = [], classes = [], branches = [], jsx = [], compoundParts = [], diagnostics = [];
  const iconNames = new Set();
  const importBindings = new Map();
  const literal = (n) => ts.isStringLiteralLike(n) || ts.isNumericLiteral(n) ? n.text : n.kind === ts.SyntaxKind.TrueKeyword ? true : n.kind === ts.SyntaxKind.FalseKeyword ? false : undefined;
  const walkExpression = (n) => {
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && ["jsx", "jsxs", "n", "x", "e", "o", "p", "t", "m"].includes(n.expression.text) && n.arguments.length) {
      const target = n.arguments[0].getText(sf);
      const props = n.arguments[1] && ts.isObjectLiteralExpression(n.arguments[1]) ? n.arguments[1] : undefined;
      const attrs = [];
      let children = 0;
      if (props) for (const prop of props.properties) {
        if (ts.isPropertyAssignment(prop)) {
          const key = prop.name.getText(sf).replace(/^['"]|['"]$/g, "");
          if (key === "children") children = ts.isArrayLiteralExpression(prop.initializer) ? prop.initializer.elements.length : 1;
          else attrs.push(key);
        } else if (ts.isShorthandPropertyAssignment(prop)) attrs.push(prop.name.text);
        else if (ts.isSpreadAssignment(prop)) attrs.push(`...${prop.expression.getText(sf)}`);
      }
      jsx.push({ target, attributes: attrs.sort(), childSlots: children, provenance: pos(sf, n) });
    }
    ts.forEachChild(n, walkExpression);
  };
  const visit = (node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const names = [];
      const clause = node.importClause;
      if (clause?.name) names.push(clause.name.text);
      if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) for (const e of clause.namedBindings.elements) {
        names.push(e.name.text); importBindings.set(e.name.text, node.moduleSpecifier.text);
        const imported = e.propertyName?.text ?? e.name.text;
        if (node.moduleSpecifier.text.includes("phosphor-icons") || /icon$/i.test(imported) || /^(ArrowsClockwise|CheckIcon|MinusIcon)$/.test(imported)) iconNames.add(imported);
      }
      imports.push({ module: node.moduleSpecifier.text, symbols: names.sort(), provenance: pos(sf, node) });
    }
    if ((ts.isFunctionDeclaration(node) || ts.isVariableDeclaration(node)) && node.name && ts.isIdentifier(node.name)) {
      symbols.push({ name: node.name.text, kind: ts.SyntaxKind[node.kind], provenance: pos(sf, node) });
    }
    if (ts.isParameter(node) && node.name && ts.isObjectBindingPattern(node.name)) for (const e of node.name.elements) {
      if (e.initializer) defaults.push({ parameter: e.name.getText(sf), value: literal(e.initializer) ?? e.initializer.getText(sf), provenance: pos(sf, e) });
    }
    if (ts.isPropertyAssignment(node) && node.name.getText(sf) === "className") classes.push({ expression: node.initializer.getText(sf), staticTokens: [...node.initializer.getText(sf).matchAll(/["'`]([^"'`]+)["'`]/g)].flatMap((m) => m[1].split(/\s+/)).filter(Boolean), provenance: pos(sf, node) });
    if (ts.isConditionalExpression(node) || ts.isIfStatement(node) || ts.isBinaryExpression(node) && [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.QuestionQuestionToken].includes(node.operatorToken.kind)) {
      const condition = ts.isIfStatement(node) ? node.expression : ts.isConditionalExpression(node) ? node.condition : node.left;
      branches.push({ condition: condition.getText(sf), kind: ts.SyntaxKind[node.kind], provenance: pos(sf, node) });
    }
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === "assign" && node.arguments[1] && ts.isObjectLiteralExpression(node.arguments[1])) {
      for (const p of node.arguments[1].properties) if (p.name) compoundParts.push(p.name.getText(sf).replace(/^['"]|['"]$/g, ""));
    }
    ts.forEachChild(node, visit);
  };
  visit(sf); walkExpression(sf);
  for (const d of sf.parseDiagnostics) diagnostics.push({ category: ts.DiagnosticCategory[d.category], code: d.code, message: ts.flattenDiagnosticMessageText(d.messageText, "\n"), position: d.start == null ? null : pos(sf, { getStart: () => d.start }) });
  const stateTerms = ({ button: ["disabled", "loading"], checkbox: ["checked", "indeterminate", "disabled"], field: ["error", "disabled"], popover: ["open", "dismiss", "starting-style", "ending-style"] })[name];
  const states = Object.fromEntries(stateTerms.map((term) => [term, branches.filter((b) => b.condition.toLowerCase().includes(term)).map((b) => b.condition)]));
  return {
    component: name,
    source: { package: "@cloudflare/kumo", version: "2.5.2", path: relative(root, file), sha256: sha256(source) },
    imports, importedIcons: [...iconNames].sort(), symbols, structure: jsx, classExpressions: classes,
    defaults, stateBranches: states, branches, compoundParts: [...new Set(compoundParts)].sort(), diagnostics
  };
}

async function run() {
  const started = performance.now();
  const facts = [];
  for (const name of selected) { const file = canonicalPath(name); facts.push(extractOne(name, file, await readFile(file, "utf8"))); }
  facts.sort((a, b) => a.component.localeCompare(b.component));
  const document = { schemaVersion: "kumo.visual-compiler.typescript-facts/v1", frontend: `typescript-${ts.version}`, components: facts };
  const bytes = `${JSON.stringify(document, null, 2)}\n`;
  await mkdir(here, { recursive: true }); await writeFile(outFile, bytes);
  console.log(JSON.stringify({ output: relative(root, outFile), sha256: sha256(bytes), elapsedMs: +(performance.now() - started).toFixed(3), components: selected }));
}
await run();
