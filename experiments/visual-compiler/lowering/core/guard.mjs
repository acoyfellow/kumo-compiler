import fs from 'node:fs';
import path from 'node:path';

const BRANCH = /\b(if|switch|case|while)\b|\?|&&|\|\|/;
// A literal is a DECISION only when it sits in a comparison/case position:
//   === 'x'   == 'x'   'x' ===   'x' ==   case 'x'   .includes('x')   ['x'].includes
// A literal used as a value (assignment, interpolation default, push arg, map value)
// is data, not a decision, and must NOT trip the guard. This distinguishes
// `if (component === 'text')` (forbidden) from `inputType ?? 'text'` (allowed).
const COMPARISON = name => {
  const e = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // quoted literal of the id in any of the three quote styles
  const q = `['"\`]${e}['"\`]`;
  const ops = `(?:===|==|!==|!=)`;
  return new RegExp(
    `${ops}\\s*${q}`            // === 'x'
    + `|${q}\\s*${ops}`         // 'x' ===
    + `|\\bcase\\s+${q}`       // case 'x'
    + `|\\.includes\\(\\s*${q}` // .includes('x')
    + `|\\[[^\\]]*${q}[^\\]]*\\]\\s*\\.includes` // ['x', ...].includes
  );
};

/**
 * Conservative static guard: branch-bearing source may not COMPARE against a literal
 * matching an input component or part identifier. It accepts identifiers used as data
 * (map keys, interpolation defaults, output names, push args), but rejects decisions.
 */
export function guardSource(source, { componentIds = [], partIds = [] } = {}) {
  const forbidden = [...new Set([...componentIds, ...partIds].filter(Boolean))];
  const diagnostics = [];
  source.split(/\r?\n/).forEach((line, index) => {
    if (!BRANCH.test(line)) return;
    for (const name of forbidden) {
      const m = COMPARISON(name).exec(line);
      if (m) diagnostics.push({ line: index + 1, column: m.index + 1, literal: name, message: 'component/part-specific branch comparison' });
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
