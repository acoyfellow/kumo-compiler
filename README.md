# Kumo compiler

Private package-backed compiler and proof service for Cloudflare Kumo. `@cloudflare/kumo@2.5.2` React is canonical; TypeScript compilers normalize 41 supported components to `kumo.ir/v1` and emit React, Vue, Svelte, and Solid runtimes.

```text
pinned Kumo package → versioned IR → framework emitters → v2 browser authority → Astro catalog
```

## Framework libraries

Package-backed component galleries: [Vue](/libraries/vue/), [Svelte](/libraries/svelte/), and [Solid](/libraries/solid/). Each ships Button and Field; Select is not included.

## Seven-minute start

Requires Node 22 and npm. The package is private and versioned `0.0.1`.

```sh
npm ci
npm run release:install  # deterministic Astro install from astro/package-lock.json
npm test
npm run matrix:kumo       # 24 shards; exact 164 component/framework targets
npm run release:check
npm run deploy:dry-run
```

The matrix atomically promotes only a complete 164-target run into [`generated/browser-evidence/authority.json`](generated/browser-evidence/authority.json). Browser run records use `kumo.browser-proof-run/v2`; receipts and [`generated/migration-status.json`](generated/migration-status.json) derive from that authority. Use `npm run compile:kumo` for focused compiler work and review generated diffs.

## Production and operations

The production Worker is **https://kumo-compiler.coey.dev**. The catalog and its evidence receipts are intentionally public: they contain no proprietary material and do not require Cloudflare Access or other authentication. `release:check` first runs `release:install`, a fail-fast `npm ci` scoped to Astro's separate lockfile; normal unit tests do not install dependencies. `npm run deploy:prepare` only builds Astro, replaces `deploy/` with `astro/dist`, and validates manifest route inventories; it has no proof side effects. Authorized operators use `npm run deploy`, then `npm run proof:production`. Use `npm run rollback:dry-run` or `npm run rollback` with `CLOUDFLARE_WORKER_VERSION_ID`, followed by production probes.

Retain immutable deploy artifacts, manifest identity, receipts, production proof, source revision, and the predecessor Worker version for rollback. Public production probes require no Access service token. A live rollback rehearsal remains an operational exercise and must use the retained predecessor Worker version.

A receipt supports only its named claim and revision. Screenshots or successful builds alone do not establish parity. See [evidence authority](docs/explanation/evidence-authority.md), [deployment](docs/runbooks/deployment.md), and [evidence reproduction](docs/how-to/reproduce-evidence.md).

## Check a Kumo upstream update

Requires Node 22, npm 11, system Chrome, npm-registry network access, and a clean worktree. The isolated operator path is:

```sh
npm ci
OUT=".upstream-check-$$"
node scripts/upstream-check.mjs --from 2.5.1 --to 2.5.2 --scenario real --out "$OUT/real"
node scripts/upstream-check.mjs --from 2.5.1 --to 2.5.2 --scenario synthetic-export-break --out "$OUT/synthetic" || test $? -eq 2
node scripts/upstream-rollback.mjs --out "$OUT/rollback"
rm -rf "$OUT"
```

The current real package diff passed with 0 changes. Button generation passed all 4 framework cells; in the browser Vue passed, Solid failed, and React/Svelte were blocked. The synthetic export break correctly blocked all 4 authority cells. Isolated rollback passed, including real `npm ci`, byte-identical restoration, and a deterministic rerun.

A passed receipt does **not** edit the package pin or promote browser authority, and none of these commands deploy or publish. Apply a reviewed pin/lockfile change separately on main. Read the [seven-minute update procedure](docs/how-to/update-kumo.md) and [receipt/status reference](docs/reference/upstream.md) before interpreting blocked cells or stale authority.

Deterministic, non-browser fixture rehearsals additionally cover additive components and props, behavior changes, CSS token changes, and export renames. Run `npm run upstream:rehearse`, then `npm run upstream:rehearse:validate`.

## Roadmap

The current implementation is the immutable comparison baseline. The active architectural bake-off—internal compilers, Builder.io Mitosis, and a shared behavior core—is specified in [Compiler bake-off](docs/roadmap/compiler-bake-off.md).

## Documentation

- [Add a component](docs/how-to/add-component.md) · [first proof](docs/tutorials/first-proof.md)
- [Deploy](docs/how-to/deploy.md) · [rollback](docs/how-to/rollback.md) · [incident response](docs/runbooks/incident-response.md)
- [IR](docs/reference/ir.md) · [manifests and receipts](docs/reference/manifests.md) · [upstream receipts](docs/reference/upstream.md)
- [Security](SECURITY.md) · [deletion](DELETION.md)
