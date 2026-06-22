# Kumo compiler

A contract-first portability and conformance kit for Cloudflare Kumo.

Start with the **[seven-minute repository guide](docs/architecture/seven-minute-guide.md)**.

## Scope

```text
canonical @cloudflare/kumo@2.5.2
→ kumo.observable/v1 contracts
→ framework-neutral library algebra
→ native Vue, Svelte, and Solid packages
→ packed browser receipts
→ public Astro catalog
```

- **45 classified** components
- **41 executable** components
- **2 upstream blocked:** PageHeader, ResourceListPage
- **2 supplemental:** Chart, Flow
- Canonical browser authority remains the immutable React **164/164** control.

Downstream package identities are fixed:

```text
@acoyfellow/kumo-vue@0.0.1
@acoyfellow/kumo-svelte@0.0.1
@acoyfellow/kumo-solid@0.0.1
```

## Repository map

| Zone | Purpose | Edit? |
|---|---|---|
| `contracts/` | observable canonical behavior | yes, with provenance |
| `src/kumo/library/` | framework-neutral component algebra | yes |
| `src/kumo/emitters/` | native framework emitters | yes |
| `generated/libraries/` | sole generated framework authority | no |
| `dx/packages/kumo-*` | package builders and migration inputs | builders only |
| `proof/`, `benchmarks/` | accepted evidence and receipts | never by generators |
| `docs/archive/` | historical campaign context | context only |

The machine-readable version is [`repository-map.json`](repository-map.json).

## Six commands

```sh
npm ci
npm run contract       # validate contracts and observable status
npm run generate       # regenerate library models and framework output
npm run conformance    # run fail-closed tests and receipts
npm run package        # build and verify deterministic package tarballs
npm run release        # complete release check; never publishes
npm run deploy         # explicit production deployment
```

Compatibility aliases remain for CI and focused debugging, but these six are the supported operator flow.

## Evidence rules

A successful build is not parity. Claims require a receipt with one of:

```text
passed | failed | blocked | not-run
```

Missing evidence never passes. Browser behavior must run through `scripts/observable-browser-runner.mjs` using trusted CDP input, one-tree SSR/hydration, canonical CSS, node identity, and unfiltered diagnostics.

## Current product status

See the generated [completion progress](docs/progress.md) and its machine receipt at `proof/progress/latest.json`.

Production: **https://kumo-compiler.coey.dev**

## Operations and reference

- [Architecture in seven minutes](docs/architecture/seven-minute-guide.md)
- [Evidence authority](docs/explanation/evidence-authority.md)
- [Add a component](docs/how-to/add-component.md)
- [Reproduce evidence](docs/how-to/reproduce-evidence.md)
- [Deploy](docs/how-to/deploy.md)
- [Rollback](docs/how-to/rollback.md)
- [GitHub release](docs/how-to/github-release.md)
- [Optional npm handoff](docs/how-to/publish-npm.md)
- [Historical campaigns](docs/archive/README.md)
- [Security](SECURITY.md)
