# Understand this repository in seven minutes

## 0:00–1:00 — what it is

This repository turns canonical `@cloudflare/kumo@2.5.2` behavior into native Vue, Svelte, and Solid packages and proves them in browsers.

```text
41 canonical contracts → shared algebra → 3 emitters → packed packages → receipts → Astro catalog
```

React is the immutable canonical control, not another downstream package. The exact scope is 45 classified, 41 executable, two upstream blocked, and two supplemental.

## 1:00–2:00 — five files to open

1. `contracts/kumo.observable/v1/schema.json` — contract shape and allowed evidence.
2. `src/kumo/library/index.mjs` — model loading and fail-closed validation.
3. `src/kumo/library/generate.mjs` — deterministic model generation.
4. `src/kumo/emitters/shared/content-adapter.mjs` — shared content semantics.
5. `scripts/observable-browser-runner.mjs` — the only browser lifecycle and trusted-input runner.

Then use [`repository-map.json`](../../repository-map.json) to locate the surrounding zones.

## 2:00–3:00 — Badge end to end

1. Read `contracts/kumo.observable/v1/components/badge.json`.
2. Read `src/kumo/library/models/badge.json`.
3. Run `npm run generate`.
4. Inspect `generated/libraries/{vue,svelte,solid}`.
5. Run `npm run conformance` and inspect the named receipt rather than assuming a build passed parity.
6. Run `npm run package` to prove exact tarballs.

Never patch generated Badge output or package staging. Fix its contract, model generator, shared capability, or emitter.

## 3:00–4:00 — editable and generated boundaries

Edit:

```text
contracts/
src/kumo/library/
src/kumo/emitters/
test/
docs/
dx/packages/kumo-*/build.mjs
```

Do not edit:

```text
generated/libraries/
dx/packages/kumo-*/package/
runtime/**/public-runtime/
runtime-canonical/**/public-runtime/
deploy generated assets
```

`proof/` and `benchmarks/` contain accepted records. Generators may read them only when a declared provenance edge requires it; they do not rewrite historical authority.

## 4:00–5:00 — six commands

```sh
npm run contract
npm run generate
npm run conformance
npm run package
npm run release
npm run deploy
```

- `contract` validates contracts and status.
- `generate` rebuilds models and native framework trees.
- `conformance` runs fail-closed tests and receipts.
- `package` creates and installs deterministic tarballs.
- `release` runs the complete non-publishing release gate.
- `deploy` is the explicit production mutation.

Focused compatibility aliases exist for CI; they are not the primary operator interface.

## 5:00–6:00 — evidence and identities

Statuses are:

```text
passed | failed | blocked | not-run
```

Only `passed` supports a claim. Missing evidence remains missing. Browser execution must use the shared runner, trusted CDP input, canonical CSS, UTF-8, one-tree hydration, node identity, and unfiltered console/network/HTTP diagnostics.

Package identities are permanently:

```text
@acoyfellow/kumo-vue@0.0.1
@acoyfellow/kumo-svelte@0.0.1
@acoyfellow/kumo-solid@0.0.1
```

## 6:00–7:00 — current roadmap

Canonical contracts and browser vectors are complete. Package export surfaces are complete. Remaining work is trusted packed browser conformance, promotion of truly implementation-ready models, examples/reference coverage for all 41 components, and exhaustive production proof.

Read `docs/progress.md` for the human view and `proof/progress/latest.json` for machine facts. Historical engine and architecture campaigns are inventoried in [`docs/archive/README.md`](../archive/README.md); they are context, not active authority.
