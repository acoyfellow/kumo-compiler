# Evidence index

All links are repository-relative and were current at preparation time (2026-06-20).

| Claim | Source | Establishing commit |
|---|---|---|
| Product boundary, 41 components, 164/164 control, candidates, seven components, rubric | [`docs/roadmap/compiler-bake-off.md`](../../docs/roadmap/compiler-bake-off.md) | current baseline |
| Language numbers and TypeScript decision | [`docs/decisions/001-compiler-language.md`](../../docs/decisions/001-compiler-language.md) | `d09dbb9` |
| Baseline identity and commands | [`README.md`](../../README.md), [`generated/browser-evidence/authority.json`](../../generated/browser-evidence/authority.json) | current baseline |
| Mitosis scope and limitations | [`candidates/mitosis/README.md`](../../candidates/mitosis/README.md), [`benchmarks/bakeoff/mitosis/matrix.json`](../../benchmarks/bakeoff/mitosis/matrix.json) | `5ce8545`, corrected by `7d7d33a` |
| Button client builds/browser | [`candidates/mitosis/receipts/button-builds.json`](../../candidates/mitosis/receipts/button-builds.json), [`button-browser.json`](../../candidates/mitosis/receipts/button-browser.json) | `3f58dfc` |
| Field/Tabs browser details and Arrow limitation | [`candidates/mitosis/receipts/field-tabs-evidence.json`](../../candidates/mitosis/receipts/field-tabs-evidence.json) | `5ce8545` |
| Mitosis SSR blocked | [`candidates/mitosis/receipts/ssr-hydration.json`](../../candidates/mitosis/receipts/ssr-hydration.json) | `5ce8545` |
| Shared-core 9 passed / 3 failed pilot and partial matrix | [`proof/bakeoff/shared-core/summary.json`](../../proof/bakeoff/shared-core/summary.json), [`proof/bakeoff/shared-core/README.md`](../../proof/bakeoff/shared-core/README.md) | `66cae77`, harness repair `aaa7579` |
| Shared-core contract boundary | [`candidates/shared-core/README.md`](../../candidates/shared-core/README.md), [`candidates/shared-core/src/contracts.ts`](../../candidates/shared-core/src/contracts.ts) | `191e935`, `66cae77` |
| Five upstream scenarios | [`rehearsals/upstream/receipts/`](../../rehearsals/upstream/receipts/) | `4e47aa4`, deterministic receipts `b9d43c6` |
| DX contracts and prototypes | [`dx/docs/contracts.md`](../../dx/docs/contracts.md), [`dx/docs/consumer-test-plan.md`](../../dx/docs/consumer-test-plan.md), [`dx/schemas/`](../../dx/schemas/), [`dx/packages/`](../../dx/packages/) | `f7ebefd`, `b0fa657` |

## Reproduction shortcuts

```sh
npm test
npm run matrix:kumo
npm --prefix candidates/mitosis ci && npm --prefix candidates/mitosis run verify
npm --prefix candidates/shared-core ci && npm --prefix candidates/shared-core run proof
npm run upstream:rehearse && npm run upstream:rehearse:validate
npm --prefix astro run validate:routes
```

Receipts support only their named claim and revision. Generated files, screenshots and aggregate gate counts are not parity verdicts.
