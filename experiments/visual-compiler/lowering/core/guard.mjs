import fs from 'node:fs';
import path from 'node:path';

const BRANCH = /\b(if|switch|case|while)\b|\?|&&|\|\|/;
const literal = /(['"`])([^'"`]+)\1/g;

/**
 * Conservative static guard: branch-bearing source may not contain a literal
 * matching an input component or part identifier. It intentionally accepts
 * identifiers as data (map keys, diagnostics, output names), but not decisions.
 */
export function guardSource(source, { componentIds = [], partIds = [] } = {}) {
  const forbidden = new Set([...componentIds, ...partIds].filter(Boolean));
  const diagnostics = [];
  source.split(/\r?\n/).forEach((line, index) => {
    if (!BRANCH.test(line)) return;
    for (const match of line.matchAll(literal)) {
      if (forbidden.has(match[2])) diagnostics.push({ line: index + 1, column: match.index + 1, literal: match[2], message: 'component/part-specific branch literal' });
    }
  });
  return { valid: diagnostics.length === 0, diagnostics };
}

export function guardFiles(files, ids) {
  return files.map(file => ({ file, ...guardSource(fs.readFileSync(file, 'utf8'), ids) }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const files = process.argv.slice(2);
  const receipt = guardFiles(files, {});
  console.log(JSON.stringify(receipt, null, 2));
  if (receipt.some(item => !item.valid)) process.exitCode = 1;
}
