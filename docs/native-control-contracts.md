# Native-control observable contracts

`contracts/kumo.observable/v1/components/{checkbox,switch,radio}.json` binds Kumo 2.5.2 public types and runtime bytes by SHA-256. Each contract separates SSR/hydration support from real browser actions.

The generic DSL supports controlled setup, compound fixtures, click/key actions, callback logs, state/focus assertions, and optional per-action checkpoints. Validation rejects unknown fields and operators. `scripts/observable-browser-adapter.mjs` compiles canonical React with Vite, server-renders every fixture, hydrates it in system Chrome over CDP, performs actions, and fails on DOM/ARIA/state/event/focus mismatch or console, network, and hydration diagnostics.

Run:

```sh
node scripts/observable-contracts.mjs
node scripts/observable-browser-adapter.mjs
node --test test/observable-native-controls.test.mjs
```

The contracts explicitly leave inherited Base UI event-detail, form/autofill, RTL, wrapping, and platform edge behavior unknown. These are not inferred from SSR or guessed.
