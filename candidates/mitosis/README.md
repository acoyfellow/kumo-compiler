# Mitosis bake-off candidate

Seven isolated source models are generated to React, Vue, Svelte, and Solid with Mitosis 0.13.2. Run:

```sh
npm ci
npm run verify
```

## API diagnosis and adaptation

The original driver passed a bare `MitosisComponent` to each generated transpiler. In 0.13.2 the published `Transpiler` type and implementation require `TranspilerArgs`: `{ component, path? }`. The React stack failed at `fastClone(component)` because destructuring a bare model made `component` undefined, producing `JSON.parse(JSON.stringify(undefined))` and the misleading `SyntaxError: "undefined" is not valid JSON`. This was candidate misuse, not a Mitosis generator defect and not a product verdict. The repair is `generate({ component: model, path })`; no package upgrade or generator patch was needed.

Mitosis' JSX parser accepts one default component per parse. The candidate therefore retains one isolated official-style model per named component rather than attempting to parse `src/components.lite.tsx` as a multi-export unit. No generated target is manually edited or post-processed.

## Evidence scope

All seven models currently generate for all four targets. `verify-builds.mjs` performs real Vite library compilation of generated Button source for each framework. `browser-button.mjs` performs real framework client bundles, loads them in Chromium, asserts one native button, clicks it, confirms the callback, and records console errors. Receipts are in `receipts/`.

Button has generated/build/browser evidence on all targets. Field and Tabs have generated source on all targets but no browser receipt yet. Dialog portals/focus management, compound/context APIs, SSR/hydration, package output, and full Kumo parity remain unverified and must not be counted as passing.
