# Shared-core pilot evidence

Button, Field/Input, and Tabs cover 12 framework/component targets (React, Vue, Svelte, Solid), but **none currently has a target-native SSR/client build or real Chrome/CDP execution**. Their browser, DOM/ARIA, behavior, SSR, hydration, node-preservation, network, and console evidence is therefore `not-run`; no pilot target is passed.

Select, Dialog, Popover, and Date Picker also remain partial. Unit/type/static-source results may remain passed only where separately exercised; they are not browser evidence.

Reproduce independently from any working directory:

```sh
cd /path/to/repository/candidates/shared-core
npm ci
npm run build
npm run proof
```

Or from the repository root:

```sh
npm --prefix candidates/shared-core ci
npm --prefix candidates/shared-core run build
npm --prefix candidates/shared-core run proof
```

`proof/run.mjs` emits explicit module-relative `not-run.json` records. `proof/receipts.mjs` derives revision from `git rev-parse HEAD` and creates an ISO-timestamped run identity. `loc-boundary-ledger.json` records shared/native LOC and boundaries.
