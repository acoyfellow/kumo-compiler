# Canonical Kumo React CDP tracer

This harness imports Button, Checkbox, Field, and Popover directly from `@cloudflare/kumo@2.5.2`, renders each state with React SSR, hydrates it in a locally served page, and records the live package DOM at 390, 768, and 1440 CSS pixels.

```sh
node experiments/visual-compiler/tracer/tracer.mjs
node experiments/visual-compiler/tracer/self-check.mjs
```

The 36 trace cells include DOM, classes, computed styles, geometry, browser accessibility nodes, focus, package callbacks, and real CDP screenshots. Trusted CDP mouse/keyboard input is used; the page does not synthesize DOM events. `results.json` records hashes for the installed package manifest, canonical component sources, Kumo CSS, browser bundle, and browser version. Artifacts are confined to this directory.

`self-check.mjs` rejects data URLs, fixture HTML builders, `dispatchEvent`, synthetic authority, missing canonical imports/hashes, non-local navigation, incomplete hydration, and any matrix/hash discrepancy.
