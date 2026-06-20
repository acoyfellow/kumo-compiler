# Shared-core candidate

Executable immutable TypeScript behavior for Button/Field (ARIA contracts), Tabs, Select, Dialog and Popover (disclosure), and Date Picker (calendar). Framework adapters intentionally leave rendering, portals, focus trapping/restoration, native event normalization and reactive subscriptions to idiomatic target code. This prevents a framework-neutral layer from pretending it can preserve DOM nodes or hydrate portals.

## Run
`npm exec tsc -- -p candidates/shared-core/tsconfig.json && node --test candidates/shared-core/test/*.test.mjs`

The bakeoff is conservative: only core/type gates run. Browser, real target SSR/hydration, packaging and ergonomic gates are `not-run`, never inferred from unit tests.
