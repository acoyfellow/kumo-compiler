# Shared-core native execution pilot

Button, Field/Input, and Tabs are exercised independently across React, Vue, Svelte, and Solid. Each target has an isolated app module and Vite client/SSR build using its native plugin/runtime: React JSX and `react-dom`, `@vitejs/plugin-vue` and Vue server renderer, `@sveltejs/vite-plugin-svelte` and Svelte server render/hydrate, or `vite-plugin-solid` and Solid render/hydrate. No framework build imports another framework's view.

The system-Chrome/CDP run records SSR output, hydration, root-node identity sentinel preservation, console and failed requests, DOM/ARIA, and interaction behavior. The current exact pilot matrix is:

| Framework | Button | Field | Tabs |
|---|---|---|---|
| React | passed | passed | passed |
| Vue | passed | passed | passed |
| Svelte | passed | passed | passed |
| Solid | failed (behavior) | failed (behavior) | failed (behavior) |

Solid's targets build, SSR, hydrate without console/network errors, preserve the SSR node, and pass DOM/ARIA; their callbacks do not update the test sentinels, so behavior remains a real target failure rather than being hidden or attributed to another framework.

Build output is ephemeral under ignored `candidates/shared-core/proof/.build/`. Evidence, receipts, summary, and the LOC boundary ledger are checked in.

```sh
npm --prefix candidates/shared-core ci
npm --prefix candidates/shared-core run proof
```
