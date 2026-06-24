# Canonical Kumo React CDP tracer

This harness imports Button, Checkbox, Field, and Popover directly from `@cloudflare/kumo@2.5.2`, renders each state with React SSR, hydrates it in a locally served page, and records the live package DOM at 390, 768, and 1440 CSS pixels.

```sh
node experiments/visual-compiler/tracer/tracer.mjs
node experiments/visual-compiler/tracer/self-check.mjs
```

Each of the 36 trace cells records an immutable initial checkpoint before interaction, then uses trusted CDP mouse/keyboard input and records a separate after checkpoint plus before/after focus and callback behavior. Initial projections include DOM, stable explicit-or-path part IDs, complete parent/order/namespace topology, classes, computed styles, geometry, accessibility, and a real screenshot. Portal content associated through explicit parts and ownership links is included. The page does not synthesize DOM events. `results.json` records hashes for the installed package manifest, canonical component sources, Kumo CSS, browser bundle, browser version, traces, and both screenshots. Artifacts are confined to this directory.

`self-check.mjs` additionally verifies immutable initial projections, complete topology, stable IDs across viewports, initial checked/open state preservation, portal content, loading-node isolation, and all matrix/artifact hashes.
