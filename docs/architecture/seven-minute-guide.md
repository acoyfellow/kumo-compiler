# Seven-minute repository guide

## 0:00–1:00 — scope
Kumo turns canonical component contracts into four framework libraries and browser proofs. `kindle-alpha-api` is the canonical model; accepted receipts and the 164/164 authority are immutable evidence, not generated scratch data.

## 1:00–2:00 — five core entry files
1. `contracts/` defines observable behavior.
2. `src/kumo/library/models/` defines component semantics.
3. `scripts/libraries/build.mjs` generates libraries.
4. `generated/libraries/` is the only authoritative generated framework tree.
5. `repository-map.json` describes zones, identities, and commands for tooling.

## 2:00–3:00 — Badge end to end
Start with Badge's contract/model, run `npm run generate`, inspect each Badge implementation under `generated/libraries/{react,vue,svelte,solid}`, run `npm run conformance`, then run `npm run package`. Never patch a generated Badge or package staging copy; fix its contract, model, or emitter.

## 3:00–4:00 — boundaries
Edit contracts, models, emitters, tests, and documentation. Do not edit generated libraries, `deploy/`, `public-runtime/`, or `dx/packages/kumo-*/package/`. Builders recreate those zones. Receipt JSON and evidence screenshots are records and must not be rewritten during generation.

## 4:00–5:00 — six commands
- `npm run contract` validates authority and identities.
- `npm run generate` regenerates framework trees.
- `npm run conformance` runs behavior/boundary tests.
- `npm run package` creates disposable package staging and verifies it.
- `npm run release` performs the complete release check without publishing.
- `npm run deploy` is the explicit production deployment command; do not run for validation.

Compatibility aliases exist for automation but are not product UX.

## 5:00–6:00 — evidence and identities
`accepted` means a receipt passed its declared gate; `not-run` is explicit, never success; `failed` blocks promotion. Public package identities remain `@acoyfellow/kumo-vue`, `@acoyfellow/kumo-svelte`, and `@acoyfellow/kumo-solid`; React remains canonical runtime output under its established identity and release manifest.

## 6:00–7:00 — roadmap
Continue compiler bake-off follow-ups, native-control coverage, upstream rehearsal, and publish/deploy readiness only after all six flows pass. Historical campaign explanation is inventoried in `docs/archive/README.md`; evidence remains at canonical paths.
