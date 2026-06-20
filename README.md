# Kumo compiler

Kumo compiler treats the pinned React package as the canonical input, normalizes supported components into a versioned intermediate representation (IR), emits Vue, Svelte, and Solid runtimes, records proof receipts, and presents receipt-derived status through Astro.

```text
@cloudflare/kumo React → kumo.ir/v1 → framework emitters → proof receipts → Astro catalog
```

## Seven-minute start

Requires Node 22 (the CI image) and npm.

```sh
npm ci
npm test
npm run release:check
```

`npm test` runs the Node test suite. `release:check` reruns it, rebuilds migration status, builds Astro, and validates Astro routes. It is the repository's release gate, not a production deployment. For focused compiler work, run `npm run compile:kumo`; it writes generated files, so review the diff.

The current scoped inventory is **45 components: 41 represented by `kumo.ir/v1`, 2 pending, and 2 excluded**. The checked-in evidence identifies and proves the 41 represented components; it does not yet authoritatively identify the four non-catalog entries. Do not infer their names or readiness until the inventory authority lands. The 41 have React audit receipts plus Vue, Svelte, and Solid receipts; status is computed from receipts, not prose.

Start at [`generated/catalog.ir.json`](generated/catalog.ir.json) for normalized data, [`src/kumo/schema.ts`](src/kumo/schema.ts) for its type contract, [`generated/receipts/`](generated/receipts/) for component/framework claims, and [`astro/src/pages/index.astro`](astro/src/pages/index.astro) for the directory. Generated artifacts are outputs: change their sources and regenerate them.

## Evidence and operations

A checked-in receipt supports only the claim and revision it names. The canonical React package is bound by [`audit/kumo-react-2.5.2.provenance.json`](audit/kumo-react-2.5.2.provenance.json); [`generated/migration-status.json`](generated/migration-status.json) is explicitly derived from receipts. Screenshots, successful builds, and dashboard labels alone do not establish canonical parity. See [evidence authority](docs/explanation/evidence-authority.md) and [how to reproduce evidence](docs/how-to/reproduce-evidence.md).

`npm run deploy:prepare` prepares local assets but does not deploy. `wrangler.jsonc` describes a Worker and `deploy/` assets, yet no reviewed production target, command, owner, approval path, or retention policy exists at this revision. Deployment and rollback remain operator-controlled and pending those facts; see the [deployment runbook](docs/runbooks/deployment.md).

## Documentation map

- **Tutorial:** [produce a first proof](docs/tutorials/first-proof.md)
- **How-to:** [add a component](docs/how-to/add-component.md), [reproduce evidence](docs/how-to/reproduce-evidence.md), [deploy](docs/how-to/deploy.md), [roll back](docs/how-to/rollback.md)
- **Reference:** [IR](docs/reference/ir.md), [manifests and receipts](docs/reference/manifests.md)
- **Explanation:** [evidence authority](docs/explanation/evidence-authority.md)
- **Runbooks:** [deployment](docs/runbooks/deployment.md), [incident response](docs/runbooks/incident-response.md)
- **Policy:** [security](SECURITY.md), [deletion](DELETION.md)
