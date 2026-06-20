# Consumer DX packed-tarball journeys

Run from the repository root:

```sh
node test/dx-consumers/pilot.mjs
```

The runner deterministically packs the pilot Button, Field, and Tabs ESM surface, hashes each archive, and installs it into fresh fixtures. Select is explicitly blocked because the current pilot package architecture has no Select source. Before measurement, the runner copies the local npm content-addressed cache into an isolated store; every measured install uses that store with `--offline`, and the receipt binds it to the repository lockfile hash. No machine-absolute path is retained.

The proof is intentionally not publish readiness and makes no architecture claim. Unsupported framework compilation, Vite, SSR, browser hydration, console/network, CSS, and tree-shaking checks remain explicitly blocked rather than becoming synthetic passes. HMR and manual screen-reader testing are explicitly `not-run`. No baseline, deployment, shared-core, Astro, or runtime-bundle authority is changed.

Generated `.tgz` files and `consumer-receipts.json` are evidence for the recorded revision. Temporary consumers and the isolated store live under `proof/dx/.work` and are removed after the run.
