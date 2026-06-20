# Kumo compiler

Private package-backed compiler and proof service for Cloudflare Kumo. `@cloudflare/kumo@2.5.2` React is canonical; TypeScript compilers normalize 41 supported components to `kumo.ir/v1` and emit React, Vue, Svelte, and Solid runtimes.

```text
pinned Kumo package → versioned IR → framework emitters → v2 browser authority → Astro catalog
```

## Seven-minute start

Requires Node 22 and npm. The package is private and versioned `0.0.1`.

```sh
npm ci
npm test
npm run matrix:kumo       # 24 shards; exact 164 component/framework targets
npm run release:check
npm run deploy:dry-run
```

The matrix atomically promotes only a complete 164-target run into [`generated/browser-evidence/authority.json`](generated/browser-evidence/authority.json). Browser run records use `kumo.browser-proof-run/v2`; receipts and [`generated/migration-status.json`](generated/migration-status.json) derive from that authority. Use `npm run compile:kumo` for focused compiler work and review generated diffs.

## Production and operations

The production Worker is **https://kumo-compiler.coey.dev** and is Cloudflare Access protected for external requests. `npm run deploy:prepare` only builds Astro, replaces `deploy/` with `astro/dist`, and validates manifest route inventories; it has no proof side effects. Authorized operators use `npm run deploy`, then `npm run proof:production`. Use `npm run rollback:dry-run` or `npm run rollback` with `CLOUDFLARE_WORKER_VERSION_ID`, followed by production probes.

Retain immutable deploy artifacts, manifest identity, receipts, production proof, source revision, and the predecessor Worker version for rollback. The remaining external blocker is an authorized Access service token (`CF_ACCESS_CLIENT_ID`/`CF_ACCESS_CLIENT_SECRET`) and a live rollback rehearsal; neither belongs in this repository.

A receipt supports only its named claim and revision. Screenshots or successful builds alone do not establish parity. See [evidence authority](docs/explanation/evidence-authority.md), [deployment](docs/runbooks/deployment.md), and [evidence reproduction](docs/how-to/reproduce-evidence.md).

## Upstream change rehearsals

Deterministic, non-browser rehearsals cover additive components and props, behavior changes, CSS token changes, and export renames. Run `npm run upstream:rehearse` from any working directory, then `npm run upstream:rehearse:validate`. Receipts in `rehearsals/upstream/receipts/` are immutable and exclude machine-specific temporary paths; browser evidence intentionally remains `not-run`.

## Roadmap

The current implementation is the immutable comparison baseline. The active architectural bake-off—internal compilers, Builder.io Mitosis, and a shared behavior core—is specified in [Compiler bake-off](docs/roadmap/compiler-bake-off.md).

## Documentation

- [Add a component](docs/how-to/add-component.md) · [first proof](docs/tutorials/first-proof.md)
- [Deploy](docs/how-to/deploy.md) · [rollback](docs/how-to/rollback.md) · [incident response](docs/runbooks/incident-response.md)
- [IR](docs/reference/ir.md) · [manifests and receipts](docs/reference/manifests.md)
- [Security](SECURITY.md) · [deletion](DELETION.md)
