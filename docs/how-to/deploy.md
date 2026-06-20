# Deploy

Production is the custom domain `https://kumo-compiler.coey.dev`, pinned to Worker `kumo-compiler-proof` in personal account `Coeyman@gmail.com's Account` (`bfcb6ac5b3ceaf42a09607f6f7925823`) and zone `coey.dev` (`1563da24f904f018b89fdcb2147c558b`). External requests are protected by Cloudflare Access.

```sh
npm ci
npm run release:install        # Astro dependencies from astro/package-lock.json
npm run release:check
npm run deploy:dry-run
npm run deploy                 # authorized operator only
CF_ACCESS_CLIENT_ID=… CF_ACCESS_CLIENT_SECRET=… npm run proof:production
```

The deployment manifest pins the approved full source revision. The deploy script refuses any other revision, any modified tracked worktree on execution, or drift in Worker name, account, or custom domain. Dry-run prints the exact target, source revision, and byte-level manifest SHA-256 before invoking Wrangler.

`release:check` repeats the deterministic Astro `npm ci`, so it is safe from a clean checkout and propagates install or network failures. `deploy:prepare` builds Astro, replaces `deploy/` from `astro/dist`, and validates the deploy manifest inventory. It does not run proofs or deploy. Preserve the source revision, manifest identity, immutable artifact, receipts, production proof, and predecessor Worker version.

The service token is external secret material. The outstanding operational gate is obtaining an authorized token and completing a live rollback rehearsal. Follow the [deployment runbook](../runbooks/deployment.md).
