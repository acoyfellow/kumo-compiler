# Upstream check receipts

`upstream:check` writes `kumo.upstream.receipt/v3`; `upstream:rollback` writes `kumo.upstream.rollback/v1`. Both bind source/package identities and are designed to leave the main checkout unchanged.

## Status and cells

- Top-level `passed` means the package/API gate found no blocking change. `blocked` (exit 2) is a safe review stop, not a script crash.
- `diff.changes` is the package inventory difference. `affectedComponentIds` maps known API changes; `unknownApiChanges` forces global review.
- `generation.cells` records isolated compiler generation for Button across React, Solid, Svelte, and Vue.
- `generation.browser.cells` records the browser attempt. `passed`, `failed`, and `blocked` are distinct: blocked means prerequisite/diagnostic failure prevented a valid assertion.
- `targets` is the authority-impact matrix. It can be empty when there is no package diff even though calibration generation/browser cells ran.
- `authority.staleDecision` explains whether existing authority is unaffected or must be treated as stale. `selectedAuthorityMutated` must remain `false`; this workflow never promotes authority.
- `behavior` and `dom` summarize generated browser cells, not selected repository authority.

## Current drill truth

For the checked-in 2.5.1 → 2.5.2 drills:

- real package check: `passed`, with 0 inventory changes;
- Button generation: all 4 framework cells passed;
- browser: Vue passed, Solid failed, React and Svelte blocked;
- synthetic export break: all 4 affected authority target cells blocked;
- isolated rollback: passed, including real npm CI, byte-identical restore, deterministic manifest rerun, and no main-checkout writes.

These statements are deliberately narrower than framework parity. In particular, the real top-level pass and zero package changes do not turn failed/blocked browser cells into passes.

## Integrity

`receiptSha256` is SHA-256 of stable, recursively key-sorted JSON after removing that field. Package records also bind registry integrity and tarball SHA-256. A receipt applies only to its recorded source tree, package versions, scenario, and outputs.

The update workflow does not mutate package pins or browser authority and does not deploy or publish. See [check and apply an upstream update](../how-to/update-kumo.md).
