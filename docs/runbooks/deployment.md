# Deployment runbook

## Preconditions

- Node 22 and npm 11; approved source revision; root `npm ci` and `npm run release:check` pass. The check deterministically installs Astro from `astro/package-lock.json`.
- Complete v2 browser authority: 24 matrix shards and exactly 164 targets.
- Immutable artifact, manifest identity, receipts, and predecessor Worker version have retention locations.
- Authorized production operator and Cloudflare Access service token are available.

## Prepare and execute

```sh
npm run deploy:dry-run
npm run deploy
CF_ACCESS_CLIENT_ID=… CF_ACCESS_CLIENT_SECRET=… npm run proof:production
```

Production is `https://kumo-compiler.coey.dev`. `deploy:prepare` builds Astro, copies `astro/dist` to `deploy/`, and validates deploy-manifest routes without proof side effects. Record command/tool version, target, times, revision, manifest hash, and artifact identity; never log secrets.

## Verify and roll back

Verify Access denial without credentials, authorized health, representative Astro/component routes, revision/manifest identity, Cloudflare Ray IDs, and errors/latency. On mismatch or regression, stop and follow [rollback](../how-to/rollback.md).

The only external readiness blockers are an authorized Access service token and completion of a live rollback rehearsal.
