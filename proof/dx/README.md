# Consumer DX packed-tarball journeys

Run from the repository root:

```sh
node test/dx-consumers/pilot.mjs
```

The runner deterministically stages the existing shared-core Button, Field, and Tabs sources into the three package directories, creates npm tarballs, hashes them, and attempts fresh consumer installs with an isolated local cache and `--offline`. It records every requested check as `passed`, `failed`, `blocked`, or `not-run` in `consumer-receipts.json`; dependent checks are never reported as passing when installation cannot be completed.

The proof is intentionally not publish readiness. HMR and manual screen-reader testing are explicitly `not-run`. Package source ownership remains `candidates/shared-core`; this journey changes no baseline, deployment, shared-core, or React runtime authority.

Generated `.tgz` files and the receipt JSON are immutable evidence for a run. Temporary consumers and npm cache live under `proof/dx/.work` and `proof/dx/.npm-cache` and are removed/ignored from the committed proof.
