# Kumo compiler

This repository observes canonical React Kumo behavior, records it as framework-neutral contracts and component algebra, emits native framework packages, and proves each output through SSR, hydration, and trusted browser receipts.

Start with the **[seven-minute repository guide](docs/architecture/seven-minute-guide.md)**.

## Scope

```text
canonical React @cloudflare/kumo@2.5.2 observations
→ kumo.observable/v1 contracts
→ framework-neutral library algebra
→ native Vue, Svelte, and Solid package emitters
→ packed-package SSR, hydration, and browser receipts
→ public Astro catalog and comparison pages
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

A successful build proves only that output was generated or packaged; it does not prove behavioral parity. Parity claims require target-specific SSR, hydration, and trusted browser evidence recorded as:

```text
passed | failed | blocked | not-run
```

- `passed` means the asserted behavior ran and matched its contract.
- `failed` means it ran and did not match.
- `blocked` means a named dependency or missing authority prevents execution.
- `not-run` means no execution evidence exists.

Missing evidence never passes. Browser behavior must run through `scripts/observable-browser-runner.mjs` using trusted CDP input, one-tree SSR/hydration, canonical CSS, node identity, and unfiltered diagnostics.

## Adding another target

Future language or framework targets follow the same sequence:

1. Define a target adapter and native emitter against the existing contracts and algebra.
2. Add target comparison pages to the Astro catalog.
3. Earn the complete executable component-by-target matrix with the same packed-package receipts before claiming support.

An emitter, build, or comparison page alone does not make a target supported.

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
