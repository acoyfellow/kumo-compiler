# TypeScript compiler API frontend

Bounded static extractor for the immutable installed `@cloudflare/kumo@2.5.2` Button, Checkbox, Field, and Popover canonical distribution chunks. It parses JavaScript with the TypeScript Compiler API and emits deterministic, source-provenanced facts for imports/icons, symbols, JSX-runtime structure, class expressions/tokens, parameter defaults, state branches, and compound component parts.

## Exact commands

```sh
node experiments/visual-compiler/frontend/typescript/extract.mjs
node experiments/visual-compiler/frontend/typescript/extract.mjs --component=button
node experiments/visual-compiler/frontend/typescript/verify.mjs
```

`extract.mjs` writes `facts.json`. `verify.mjs` runs cold/warm extractions, compares exact output bytes, validates required fact categories and diagnostics, and writes `results.json`. It has no React runtime dependency and does not modify canonical sources.

## Scope and diagnostics

This spike intentionally recognizes the package's compiled JSX-runtime call shape rather than evaluating code. Unknown component names fail immediately. TypeScript parse diagnostics are retained per component; the self-check fails on any diagnostic or absent required category. Timings are machine-local wall-clock measurements and are not browser-proof timings.
