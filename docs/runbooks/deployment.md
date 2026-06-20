# Deployment runbook

## Preconditions

- Node 22 and npm 11; clean committed source revision; root `npm ci` and `npm run release:check` pass. The check deterministically installs Astro from `astro/package-lock.json`.
- Complete v2 browser authority: 24 matrix shards and exactly 164 targets.
- Immutable artifact, manifest identity, receipts, and predecessor Worker version have retention locations.
- An authorized production operator is available. The public catalog requires no Cloudflare Access service token.

## Prepare and execute

```sh
npm run deploy:dry-run
npm run deploy
npm run proof:production
```

Production is custom domain `https://kumo-compiler.coey.dev`, Worker `kumo-compiler-proof`, personal account `Coeyman@gmail.com's Account` (`bfcb6ac5b3ceaf42a09607f6f7925823`), zone `coey.dev` (`1563da24f904f018b89fdcb2147c558b`). The manifest and Wrangler config pin these values. The manifest binds the complete generated asset payload with a deterministic SHA-256 tree digest, while deploy records the current clean `HEAD` as `GIT_COMMIT`; this avoids a self-referential commit pin and remains valid after cherry-picking. Deployment fails closed on target/config drift, modified tracked files, stale or tampered assets, or protected bundle contents. `deploy:prepare` builds Astro, copies `astro/dist` to `deploy/`, validates routes, and verifies the payload digest without proof side effects. Record command/tool version, target, times, revision, manifest hash, and payload digest; never log secrets.

## Verify and roll back

Verify unauthenticated public health, representative Astro/component routes, revision/manifest identity, Cloudflare Ray IDs, and errors/latency. On mismatch or regression, stop and follow [rollback](../how-to/rollback.md).

No Access policy or service token is required. Completion of a live rollback rehearsal remains an operational exercise.
