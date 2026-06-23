# Kumo terminal end state

Machine authority: [`workflow/terminal-end-state.json`](../../workflow/terminal-end-state.json).

## Definition of done

Kumo is complete only when one immutable final receipt proves all of the following:

1. Canonical `@cloudflare/kumo@2.5.2` remains immutable at 164/164 browser cells.
2. All 41 executable components and all 124 vectors pass for React, Vue, Svelte, and Solid.
3. Vue, Svelte, and Solid execute exact packed `@acoyfellow/*@0.0.1` tarballs through the shared trusted browser runner.
4. All 41 models are implementation-ready from complete immutable package and browser evidence.
5. All 41 components have complete, independently compiling exact-artifact examples and Diátaxis documentation.
6. The homepage contains a cohesive package-backed Vue/Svelte/Solid kitchen-sink application, generated from receipt eligibility and proven at 390, 768, and 1440 pixels in light and dark themes.
7. Clean release and payload determinism pass twice.
8. Production proof passes twice, including `/health`, `/version`, diagnostics, security, package hashes, PWA, SEO, sitemap, and `llms.txt`.
9. Only explicit human distribution actions or explicitly approved manual scope remain.

Progress must not read 100% before that receipt exists.

## Why all 31 gaps cannot mutate in parallel

All 31 gaps can be **analyzed** in parallel. They cannot safely be implemented simultaneously because they form a dependency graph and share authority paths:

- Behavioral fixtures depend on stable capability IR.
- Framework lowering depends on capability semantics.
- Packed receipts depend on generated packages and fixtures.
- Readiness promotion depends on complete conformance receipts.
- Complete examples and kitchen-sink eligibility depend on promoted, hosted package evidence.
- Release depends on all generated assets.
- Production proof depends on the deployed release.

Shared paths—library IR, emitters, browser runner, package manifests, conformance receipts, progress, release, and deployment—must each have one writer. Parallel mutations are reserved for disjoint capability families, disjoint framework lowerers after an accepted shared contract, and independent documentation/example outputs.

## Maximum-safe execution waves

### Wave 0 — parallel discovery

Audit all 31 gaps in parallel. Produce path ownership, dependencies, acceptance tests, and risks. No mutations.

### Wave 1 — shared compiler foundations

Single-writer work:

- behavioral capability schema;
- controlled/uncontrolled state algebra;
- event, focus, collection, layer, and browser-service contracts;
- generic fixture bundle schema;
- exact diagnostics and runtime-resolution policy.

### Wave 2 — behavior-family implementation

Parallelize disjoint families where paths do not overlap:

- native inputs, toggles, and field wiring;
- clipboard/live region;
- navigation and roving focus;
- collection/listbox;
- layers/modal/positioning;
- date/range;
- responsive disclosure/sidebar;
- pagination;
- toast.

Each family first lands shared IR and tests, then framework lowerers may fan out across Vue/Svelte/Solid.

### Wave 3 — generic packed proof

Single writer consolidates generated fixtures and the manifest-driven runner. Framework executions may run in parallel only when browser resources and receipt paths are disjoint. Integrate only 124/124 downstream receipts.

### Wave 4 — readiness and product generation

After complete conformance:

- generate and promote 41 readiness receipts;
- generate 41 independent examples and reference pages in disjoint scopes;
- generate kitchen-sink eligibility and three native compositions.

### Wave 5 — release and production

Serial authority:

- deterministic release twice;
- deterministic payload twice;
- deploy;
- production proof twice;
- final terminal receipt.

## Self-steering rules

Every loop iteration must:

1. Read `workflow/terminal-end-state.json`, planner output, observable status, progress, receipts, git status, worktrees, Terrarium runs, and production health/version.
2. Validate that current work advances the earliest unmet dependency, not merely an easy downstream artifact.
3. Fan out read-only audits or disjoint implementation tasks when useful.
4. Keep one writer per authority path and cancel agents that drift, duplicate work, weaken gates, or touch protected files.
5. Classify failures as source, emitter, fixture, harness, package, receipt, environment, or external.
6. Repair the lowest shared layer, rerun focused tests twice, and preserve unfiltered diagnostics.
7. Integrate only green batches, remove completed worktrees, regenerate receipts/progress, and rerun the planner.
8. Never spend an iteration only restating status when an automatable critical-path task exists.
9. Stop only for human authorization/authentication or an irreducible external block.
10. Delete the loop only after the final terminal receipt passes.

## Protected local work

Never discard or overwrite unrelated changes in:

- `proof/observable-contracts/status.json`
- `runtime/checkbox/react/public-runtime/assets/react-checkbox.js`
- `runtime/switch/react/public-runtime/assets/react-switch.js`

Any additional protected paths reported by machine state receive the same treatment.

## Resolved framework findings

### Solid native-input hydration node identity (RESOLVED)

Native `input`/`input-area` control lowering is browser-proven for all three
frameworks. Each conformance receipt is `80 passed / 44 blocked / 124 vectors`,
with the four `native-input-fixtures.json` vectors (`input/bare-disabled`,
`input/type`, `input-area/bare`, `input-area/type`) passing with
`node-identity: preserved`.

Root cause of the earlier Solid `replaced` result was a harness defect, not a
Solid limitation or emitter/package/receipt defect: the Solid native-input
client bundle hydrated with `hydrate(() => <App/>, ...)` (an arrow wrapper that
introduces an extra reactive boundary), while the SSR entry rendered the
component tree directly. That structural mismatch caused Solid to discard and
recreate the form-control node. Switching the client to `hydrate(App, ...)`
(matching the SSR structure) makes Solid adopt the server node and preserve
identity. Verified through `scripts/observable-browser-runner.mjs`: with the
packed component, `hydrate(App, ...)` yields `preserved: true` while
`hydrate(() => <App/>, ...)` yields `preserved: false`.

The four-framework `packed-conformance` intersection still excludes `input` and
`input-area` because each retains a blocked field-composition vector
(`input/field-label`, `input-area/field-error`) pending the `field-wiring`
capability. Those components join the intersection only after field wiring is
implemented and browser-proven across all three frameworks. The gate is not
weakened: no skip, allowlist, filtered diagnostic, or fabricated result is used.

### Vue radio hydration reactivity (in progress)

radio-group capability, lowering (Vue/Svelte/Solid), and neutral fixtures are committed.
The Vue Radio component is proven correct under client-only render via an isolated
Cloudflare Browser Rendering session (click item 1 → `checked:["false","true"]`,
`events:["value:pro"]`). Under SSR + hydration in the conformance harness, `selectRadio`
runs (focus moves to the group root) and the change callback fires, but the per-item
`aria-checked` bindings inside the hydrated `v-for` do not re-render on the `selectedValue`
computed change, so observed state stays `[true,false]`. This is a hydration-time
shared-consumer-app/build-cache contamination, NOT an emitter or hydration bug. Proven:
the Vue Radio component passes through the EXACT live code path (runObservableBrowser +
radio adapter runVector + KUMO_BROWSER_POOL) when radio runs ALONE (returns
`checked:[false,true]`, `events:[value:pro]`, focus root). It fails (`[true,false]`) only
in the full sequential conformance run after the button/toggle/native-input/field/clipboard/
pagination slices have built into the shared consumer app. SSR sent is correct in both cases.
Further isolated (run 67-68): NOT accumulation/ordering (fails even as the 2nd browser slice),
NOT vite cache (per-build cacheDir isolation added, no effect), NOT pool session reuse
(fresh BrowserContext per request, no effect). Radio passes through the EXACT live path
(runObservableBrowser + radio adapter runVector + pool) when invoked from a standalone
script, but fails (`[true,false]`) when the identical call runs inside
proof/dx/conformance/vue/run.mjs. The differentiator is something in run.mjs's invocation
scope not yet identified by inspection. Recommended next approach: a standalone
per-component cloud prover (proven to work) that produces cells independently of the
monolithic run.mjs, OR byte-diff the radio client bundle produced inside run.mjs vs the
standalone path. Radio remains blocked, no gate weakened, component proven correct.


### Radio investigation — hard stop after run 69

Confirmed identical and correct across the failing and passing paths: the radio client
bundle (byte-identical, deterministic, contains selectRadio/internalValue/setValue), the
SSR HTML (byte-identical across SSR configs), the recorded trusted action
(`{type:click,target:1,selector:[role=radio]}`), and the five probe expressions. The Vue
Radio component is proven correct via a standalone `runObservableBrowser` + pool single-vector
call. It nonetheless returns `[true,false]` (selection unchanged) when driven via
`runVueRadioBrowser` inside the conformance flow. The divergence is NOT bundle, SSR, action,
probe, accumulation/ordering, vite cache, or pool session reuse. It is an unidentified
interaction in the slice-helper invocation that resists static inspection.

DECISION: stop iterating on radio in the loop. The correct fix is a small standalone
per-component cloud prover that runs one component's vectors in a dedicated process/session
(the path already proven to pass) and writes that component's cells, decoupled from the
monolithic per-framework run.mjs. Build that prover as its own focused task, then radio and
the remaining interactive components prove through it in parallel. Until then radio stays
blocked with no gate weakened.
