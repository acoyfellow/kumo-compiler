# Shared-core native execution pilot

Button, Field/Input, and Tabs provide 12 target-native React, Vue, Svelte, and Solid fixtures backed by the shared reducers/ARIA contracts. `proof/run.mjs` attempts real framework SSR/client bundles, hydration in system Chrome through CDP, identity sentinels, console/network collection, DOM/ARIA, behavior, and styles/assets/types gates. It never reconstructs DOM as a fallback.

The checked-in run is **blocked for all 12 targets at bundling**: esbuild discovers the Svelte dynamic-import candidates while building each framework entry and no Svelte compiler loader is wired into this first runner revision. The immutable `execution.json` records preserve that diagnostic; all downstream gates are consequently `blocked`, not falsely passed or not-run.

Build output is real but ephemeral under ignored `candidates/shared-core/proof/.build/`. The LOC ledger records shared/native boundaries and escape hatches.

```sh
npm --prefix candidates/shared-core ci
npm --prefix candidates/shared-core run proof
```

All test and proof paths are module-relative and work independently of the invoking working directory.
